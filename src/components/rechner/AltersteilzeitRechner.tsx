import { useState, useMemo } from 'react';

// Altersteilzeit-Rechner 2026 - Quellen: Altersteilzeitgesetz (AltTZG), Deutsche Rentenversicherung
// Stand: 2026

const ATZ_2026 = {
  // Aufstockungsbetrag: Mind. 20% des Regelarbeitsentgelts
  aufstockungProzent: 20,         // % Aufstockung auf Netto (mind. 20%, oft 30-40% vertraglich)
  aufstockungZielNetto: 80,       // % des bisherigen Nettos als Ziel
  
  // Rentenversicherung
  aufstockungRVProzent: 80,       // % des bisherigen Bruttos für RV-Beiträge (mind. 80%)
  rvBeitragssatzGesamt: 18.6,     // % Gesamtbeitragssatz RV 2026
  rvBeitragssatzAN: 9.3,          // % Arbeitnehmeranteil RV
  
  // Beitragsbemessungsgrenze RV West 2026
  bbgRVMonat: 8050,               // €/Monat
  
  // Durchschnittsentgelt für Rentenpunkte 2026 (vorläufig)
  durchschnittsentgelt: 47450,    // €/Jahr
  
  // Aktueller Rentenwert 2026 (vorläufig ab 01.07.2025)
  aktuellerRentenwert: 39.32,     // €/Entgeltpunkt/Monat
};

interface AtzErgebnis {
  // Arbeitsphase (Vollzeit)
  gehaltArbeitsphase: number;
  
  // Altersteilzeit Arbeitsphase
  gehaltBruttoATZ: number;        // 50% des Bruttos
  aufstockungNetto: number;       // Aufstockung auf ca. 80% Netto
  nettoArbeitsphaseBisher: number;
  nettoArbeitsphaseMitATZ: number;
  
  // Freistellungsphase
  gehaltFreistellungsphase: number; // gleich wie Arbeitsphase ATZ
  
  // Netto-Verhältnis
  nettoProzent: number;
  
  // Rentenversicherung
  rvBeitragsgrundlage: number;    // 80% des bisherigen Bruttos
  rvBeitragArbeitgeber: number;   // Zusätzlicher AG-Beitrag
  entgeltpunkteProJahrVorher: number;
  entgeltpunkteProJahrATZ: number;
  rentenverlustProJahrATZ: number;
  rentengewinnDurchAufstockung: number;
  
  // Blockmodell
  arbeitsphaseMonateStart: number;
  arbeitsphaseMonateEnde: number;
  freistellungsphaseMonateStart: number;
  freistellungsphaseMonateEnde: number;
  
  // Gesamtbetrachtung
  gesamtlaufzeitJahre: number;
  gesamtBruttoOhneATZ: number;
  gesamtBruttoMitATZ: number;
  gesamtNettoOhneATZ: number;
  gesamtNettoMitATZ: number;
  mehrRentenpunkte: number;
}

// Einfache Netto-Schätzung (vereinfacht, ohne Kirchensteuer)
function schaetzeNetto(brutto: number, steuerklasse: number): number {
  // Vereinfachte Abzüge
  const svAbzug = Math.min(brutto, ATZ_2026.bbgRVMonat) * 0.205; // ca. 20.5% SV
  
  // Vereinfachte Steuer nach Steuerklasse
  let steuersatz = 0;
  if (steuerklasse === 1 || steuerklasse === 4) {
    // Grobe Progression
    if (brutto > 6000) steuersatz = 0.35;
    else if (brutto > 5000) steuersatz = 0.30;
    else if (brutto > 4000) steuersatz = 0.25;
    else if (brutto > 3000) steuersatz = 0.20;
    else if (brutto > 2000) steuersatz = 0.15;
    else if (brutto > 1500) steuersatz = 0.10;
    else steuersatz = 0.05;
  } else if (steuerklasse === 3) {
    // Steuerklasse 3 (verheiratet, Alleinverdiener)
    if (brutto > 8000) steuersatz = 0.30;
    else if (brutto > 6000) steuersatz = 0.22;
    else if (brutto > 4000) steuersatz = 0.15;
    else if (brutto > 3000) steuersatz = 0.10;
    else steuersatz = 0.05;
  } else if (steuerklasse === 5) {
    // Steuerklasse 5 (höhere Steuerlast)
    if (brutto > 4000) steuersatz = 0.42;
    else if (brutto > 3000) steuersatz = 0.35;
    else if (brutto > 2000) steuersatz = 0.28;
    else steuersatz = 0.20;
  }
  
  const steuer = brutto * steuersatz;
  return Math.max(0, brutto - svAbzug - steuer);
}

function berechneAltersteilzeit(
  bruttoGehalt: number,
  steuerklasse: number,
  atzDauerJahre: number,
  aufstockungProzentIndividuell: number,
  startAlter: number
): AtzErgebnis {
  // Bisheriges Netto (Vollzeit)
  const nettoVorher = schaetzeNetto(bruttoGehalt, steuerklasse);
  
  // ATZ-Gehalt = 50% des Bruttos (halbe Arbeitszeit, volle Zeitspanne)
  const gehaltBruttoATZ = bruttoGehalt * 0.5;
  
  // Netto aus dem halben Gehalt
  const nettoAusHalbemGehalt = schaetzeNetto(gehaltBruttoATZ, steuerklasse);
  
  // Aufstockung: Ziel ist ca. 80% des bisherigen Nettos
  // Aufstockungsbetrag = Ziel-Netto - Netto aus halbem Gehalt
  const zielNetto = nettoVorher * (ATZ_2026.aufstockungZielNetto / 100);
  const aufstockungBetrag = Math.max(0, zielNetto - nettoAusHalbemGehalt);
  
  // Endgültiges Netto in ATZ (bei üblicher Aufstockung auf 80%)
  // Die Aufstockung ist steuerfrei!
  const nettoMitATZ = nettoAusHalbemGehalt + aufstockungBetrag;
  
  // Netto-Prozent vom vorherigen Netto
  const nettoProzent = nettoVorher > 0 ? (nettoMitATZ / nettoVorher) * 100 : 0;
  
  // ---- Rentenversicherung ----
  // Arbeitgeber zahlt RV-Beiträge auf mind. 80% des bisherigen Bruttos
  const rvBeitragsgrundlage = bruttoGehalt * (ATZ_2026.aufstockungRVProzent / 100);
  
  // Differenz: RV-Beiträge auf 80% - RV-Beiträge auf 50%
  const rvBeitragsgrundlageDifferenz = rvBeitragsgrundlage - gehaltBruttoATZ;
  const rvBeitragArbeitgeberZusatz = rvBeitragsgrundlageDifferenz * (ATZ_2026.rvBeitragssatzGesamt / 100);
  
  // Entgeltpunkte pro Jahr (vorher)
  const jahresgehaltVorher = bruttoGehalt * 12;
  const entgeltpunkteVorher = Math.min(jahresgehaltVorher, ATZ_2026.bbgRVMonat * 12) / ATZ_2026.durchschnittsentgelt;
  
  // Entgeltpunkte pro Jahr (in ATZ) - auf Basis von 80% des vorherigen Bruttos
  const jahresgehaltATZRV = rvBeitragsgrundlage * 12;
  const entgeltpunkteATZ = Math.min(jahresgehaltATZRV, ATZ_2026.bbgRVMonat * 12) / ATZ_2026.durchschnittsentgelt;
  
  // Rentenverlust bzw. -gewinn durch ATZ pro Jahr
  const entgeltpunkteDifferenzProJahr = entgeltpunkteATZ - entgeltpunkteVorher;
  const rentenwertDifferenz = entgeltpunkteDifferenzProJahr * ATZ_2026.aktuellerRentenwert;
  
  // Zusätzliche Entgeltpunkte durch die Aufstockung gegenüber 50%
  const entgeltpunkteOhneAufstockung = Math.min(gehaltBruttoATZ * 12, ATZ_2026.bbgRVMonat * 12) / ATZ_2026.durchschnittsentgelt;
  const mehrEntgeltpunkteDurchAufstockung = entgeltpunkteATZ - entgeltpunkteOhneAufstockung;
  const rentengewinnDurchAufstockung = mehrEntgeltpunkteDurchAufstockung * ATZ_2026.aktuellerRentenwert;
  
  // ---- Blockmodell ----
  const gesamtMonateATZ = atzDauerJahre * 12;
  const arbeitsphaseMonateDauer = gesamtMonateATZ / 2;
  const freistellungsphaseMonateDauer = gesamtMonateATZ / 2;
  
  // ---- Gesamtbetrachtung ----
  const gesamtBruttoOhneATZ = bruttoGehalt * gesamtMonateATZ;
  const gesamtBruttoMitATZ = gehaltBruttoATZ * gesamtMonateATZ; // + Aufstockung (aber die ist brutto gleich)
  
  const gesamtNettoOhneATZ = nettoVorher * gesamtMonateATZ;
  const gesamtNettoMitATZ = nettoMitATZ * gesamtMonateATZ;
  
  // Mehr Rentenpunkte durch die Gesamtlaufzeit der ATZ
  const mehrRentenpunkte = mehrEntgeltpunkteDurchAufstockung * atzDauerJahre;
  
  return {
    gehaltArbeitsphase: bruttoGehalt,
    gehaltBruttoATZ,
    aufstockungNetto: aufstockungBetrag,
    nettoArbeitsphaseBisher: nettoVorher,
    nettoArbeitsphaseMitATZ: nettoMitATZ,
    gehaltFreistellungsphase: gehaltBruttoATZ,
    nettoProzent,
    rvBeitragsgrundlage,
    rvBeitragArbeitgeber: rvBeitragArbeitgeberZusatz,
    entgeltpunkteProJahrVorher: entgeltpunkteVorher,
    entgeltpunkteProJahrATZ: entgeltpunkteATZ,
    rentenverlustProJahrATZ: Math.abs(rentenwertDifferenz),
    rentengewinnDurchAufstockung,
    arbeitsphaseMonateStart: startAlter * 12,
    arbeitsphaseMonateEnde: startAlter * 12 + arbeitsphaseMonateDauer,
    freistellungsphaseMonateStart: startAlter * 12 + arbeitsphaseMonateDauer,
    freistellungsphaseMonateEnde: (startAlter + atzDauerJahre) * 12,
    gesamtlaufzeitJahre: atzDauerJahre,
    gesamtBruttoOhneATZ,
    gesamtBruttoMitATZ,
    gesamtNettoOhneATZ,
    gesamtNettoMitATZ,
    mehrRentenpunkte,
  };
}

export default function AltersteilzeitRechner() {
  const [bruttoGehalt, setBruttoGehalt] = useState(5000);
  const [steuerklasse, setSteuerklasse] = useState(1);
  const [atzDauerJahre, setAtzDauerJahre] = useState(6);
  const [aufstockung, setAufstockung] = useState(80);
  const [startAlter, setStartAlter] = useState(60);

  const ergebnis = useMemo(() => {
    return berechneAltersteilzeit(
      bruttoGehalt,
      steuerklasse,
      atzDauerJahre,
      aufstockung,
      startAlter
    );
  }, [bruttoGehalt, steuerklasse, atzDauerJahre, aufstockung, startAlter]);

  const formatEuro = (n: number) => 
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  
  const formatProzent = (n: number) => 
    n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Bruttogehalt */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Aktuelles Brutto-Monatsgehalt</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={bruttoGehalt}
              onChange={(e) => setBruttoGehalt(Math.max(1000, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none"
              min="1000"
              step="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            min="2000"
            max="10000"
            step="100"
            value={bruttoGehalt}
            onChange={(e) => setBruttoGehalt(Number(e.target.value))}
            className="w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* Steuerklasse */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Steuerklasse</span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((sk) => (
              <button
                key={sk}
                onClick={() => setSteuerklasse(sk)}
                className={`py-3 rounded-xl font-bold text-lg transition-all ${
                  steuerklasse === sk
                    ? 'bg-amber-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {sk}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Steuerklasse 6 wird bei Altersteilzeit nicht berücksichtigt
          </p>
        </div>

        {/* ATZ-Dauer */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Altersteilzeit-Dauer (Gesamt)</span>
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAtzDauerJahre(Math.max(2, atzDauerJahre - 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold"
            >
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-4xl font-bold text-gray-800">{atzDauerJahre}</span>
              <span className="text-xl text-gray-500 ml-2">Jahre</span>
            </div>
            <button
              onClick={() => setAtzDauerJahre(Math.min(10, atzDauerJahre + 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold"
            >
              +
            </button>
          </div>
          <div className="mt-3 p-3 bg-amber-50 rounded-xl text-sm text-amber-800">
            <p>
              <strong>Blockmodell:</strong> {atzDauerJahre / 2} Jahre Arbeitsphase + {atzDauerJahre / 2} Jahre Freistellungsphase
            </p>
          </div>
        </div>

        {/* Startalter */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Beginn der Altersteilzeit mit</span>
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setStartAlter(Math.max(55, startAlter - 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold"
            >
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-4xl font-bold text-gray-800">{startAlter}</span>
              <span className="text-xl text-gray-500 ml-2">Jahren</span>
            </div>
            <button
              onClick={() => setStartAlter(Math.min(65, startAlter + 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold"
            >
              +
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Voraussetzung: Mindestens 55 Jahre alt, mindestens 3 Jahre sozialversicherungspflichtig beschäftigt
          </p>
        </div>
      </div>

      {/* Hauptergebnis */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg p-6 text-white mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">⏳</span>
          <h3 className="text-sm font-medium text-amber-100">Ihr Netto in Altersteilzeit</h3>
        </div>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.nettoArbeitsphaseMitATZ)}</span>
            <span className="text-xl text-amber-200">/ Monat</span>
          </div>
          <p className="text-amber-200 text-sm mt-2">
            ≈ <strong>{formatProzent(ergebnis.nettoProzent)}</strong> Ihres bisherigen Nettos ({formatEuro(ergebnis.nettoArbeitsphaseBisher)})
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-amber-100 text-sm">ATZ-Brutto (50%)</p>
            <p className="text-2xl font-bold">{formatEuro(ergebnis.gehaltBruttoATZ)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-amber-100 text-sm">Aufstockung (netto)</p>
            <p className="text-2xl font-bold">+{formatEuro(ergebnis.aufstockungNetto)}</p>
          </div>
        </div>
      </div>

      {/* Blockmodell-Visualisierung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📊</span>
          Blockmodell: Ihr Zeitplan
        </h3>
        
        <div className="relative">
          {/* Timeline */}
          <div className="flex rounded-xl overflow-hidden h-16 mb-4">
            <div 
              className="bg-amber-500 flex items-center justify-center text-white font-bold"
              style={{ width: '50%' }}
            >
              <div className="text-center">
                <p className="text-xs">ARBEITSPHASE</p>
                <p className="text-lg">{atzDauerJahre / 2} Jahre</p>
              </div>
            </div>
            <div 
              className="bg-green-500 flex items-center justify-center text-white font-bold"
              style={{ width: '50%' }}
            >
              <div className="text-center">
                <p className="text-xs">FREISTELLUNG</p>
                <p className="text-lg">{atzDauerJahre / 2} Jahre</p>
              </div>
            </div>
          </div>
          
          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50 rounded-xl border-l-4 border-amber-500">
              <p className="font-medium text-amber-800 mb-2">📋 Arbeitsphase</p>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Alter: <strong>{startAlter} - {startAlter + atzDauerJahre / 2}</strong> Jahre</li>
                <li>• Vollzeit arbeiten</li>
                <li>• Halbes Gehalt + Aufstockung</li>
                <li>• RV-Beiträge auf 80% Basis</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
              <p className="font-medium text-green-800 mb-2">🏖️ Freistellungsphase</p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Alter: <strong>{startAlter + atzDauerJahre / 2} - {startAlter + atzDauerJahre}</strong> Jahre</li>
                <li>• Keine Arbeit</li>
                <li>• Gleiche Bezüge wie in Arbeitsphase</li>
                <li>• RV-Beiträge weiterhin auf 80%</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Gehaltsvergleich */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">💰</span>
          Gehaltsvergleich
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-2"></th>
                <th className="text-right py-3 px-2">Ohne ATZ</th>
                <th className="text-right py-3 px-2">Mit ATZ</th>
                <th className="text-right py-3 px-2">Differenz</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-2 text-gray-700">Brutto/Monat</td>
                <td className="text-right py-3 px-2 font-medium">{formatEuro(bruttoGehalt)}</td>
                <td className="text-right py-3 px-2 font-medium">{formatEuro(ergebnis.gehaltBruttoATZ)}</td>
                <td className="text-right py-3 px-2 text-red-600">-{formatEuro(bruttoGehalt - ergebnis.gehaltBruttoATZ)}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-2 text-gray-700">+ Aufstockung (netto)</td>
                <td className="text-right py-3 px-2">—</td>
                <td className="text-right py-3 px-2 text-green-600 font-medium">+{formatEuro(ergebnis.aufstockungNetto)}</td>
                <td className="text-right py-3 px-2"></td>
              </tr>
              <tr className="border-b border-gray-100 bg-amber-50">
                <td className="py-3 px-2 text-gray-800 font-medium">Netto/Monat</td>
                <td className="text-right py-3 px-2 font-bold">{formatEuro(ergebnis.nettoArbeitsphaseBisher)}</td>
                <td className="text-right py-3 px-2 font-bold">{formatEuro(ergebnis.nettoArbeitsphaseMitATZ)}</td>
                <td className="text-right py-3 px-2 text-red-600 font-medium">
                  -{formatEuro(ergebnis.nettoArbeitsphaseBisher - ergebnis.nettoArbeitsphaseMitATZ)}
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-2 text-gray-700">Netto in %</td>
                <td className="text-right py-3 px-2">100%</td>
                <td className="text-right py-3 px-2 font-bold text-amber-600">{formatProzent(ergebnis.nettoProzent)}</td>
                <td className="text-right py-3 px-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 p-3 bg-green-50 rounded-xl text-sm text-green-800">
          <p>
            💡 <strong>Die Aufstockung ist steuerfrei!</strong> Sie unterliegt jedoch dem Progressionsvorbehalt 
            und kann sich auf Ihren Steuersatz auswirken.
          </p>
        </div>
      </div>

      {/* Rentenpunkte-Aufstockung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🏛️</span>
          Rentenpunkte-Aufstockung
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-blue-800 text-sm mb-3">
              Der Arbeitgeber zahlt <strong>Rentenversicherungsbeiträge auf mindestens 80%</strong> Ihres 
              bisherigen Bruttogehalts – nicht nur auf die 50% ATZ-Gehalt!
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-500">RV-Beitragsgrundlage</p>
                <p className="text-xl font-bold text-blue-700">{formatEuro(ergebnis.rvBeitragsgrundlage)}</p>
                <p className="text-xs text-gray-500">= 80% von {formatEuro(bruttoGehalt)}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-500">Zusätzl. AG-Beitrag</p>
                <p className="text-xl font-bold text-green-600">+{formatEuro(ergebnis.rvBeitragArbeitgeber)}</p>
                <p className="text-xs text-gray-500">pro Monat</p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-2"></th>
                  <th className="text-right py-3 px-2">Ohne ATZ</th>
                  <th className="text-right py-3 px-2">Mit ATZ (80%)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-2 text-gray-700">Entgeltpunkte/Jahr</td>
                  <td className="text-right py-3 px-2 font-medium">{ergebnis.entgeltpunkteProJahrVorher.toFixed(4)}</td>
                  <td className="text-right py-3 px-2 font-medium">{ergebnis.entgeltpunkteProJahrATZ.toFixed(4)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-2 text-gray-700">→ Rente/Monat</td>
                  <td className="text-right py-3 px-2">{formatEuro(ergebnis.entgeltpunkteProJahrVorher * ATZ_2026.aktuellerRentenwert)}</td>
                  <td className="text-right py-3 px-2">{formatEuro(ergebnis.entgeltpunkteProJahrATZ * ATZ_2026.aktuellerRentenwert)}</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="py-3 px-2 text-gray-800 font-medium">Gesamte ATZ ({atzDauerJahre} J.)</td>
                  <td className="text-right py-3 px-2 font-bold">{(ergebnis.entgeltpunkteProJahrVorher * atzDauerJahre).toFixed(4)} EP</td>
                  <td className="text-right py-3 px-2 font-bold">{(ergebnis.entgeltpunkteProJahrATZ * atzDauerJahre).toFixed(4)} EP</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {ergebnis.entgeltpunkteProJahrATZ < ergebnis.entgeltpunkteProJahrVorher ? (
            <div className="p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-400">
              <p className="font-medium text-yellow-800 mb-1">⚠️ Rentenminderung pro ATZ-Jahr</p>
              <p className="text-yellow-700 text-sm">
                Trotz der 80%-Aufstockung sammeln Sie <strong>{formatEuro(ergebnis.rentenverlustProJahrATZ)}</strong> weniger 
                Rente pro Jahr ATZ als bei voller Weiterarbeit.
              </p>
              <p className="text-yellow-700 text-sm mt-2">
                Über {atzDauerJahre} Jahre: ca. <strong>{formatEuro(ergebnis.rentenverlustProJahrATZ * atzDauerJahre)}</strong> weniger 
                monatliche Rente.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-green-50 rounded-xl border-l-4 border-green-400">
              <p className="font-medium text-green-800 mb-1">✓ Volle Rentenpunkte</p>
              <p className="text-green-700 text-sm">
                Mit der 80%-Aufstockung erhalten Sie nahezu die gleichen Entgeltpunkte wie bei Vollzeitarbeit.
              </p>
            </div>
          )}
          
          <div className="p-3 bg-blue-50 rounded-xl text-sm">
            <p className="text-blue-800">
              <strong>Aktueller Rentenwert 2026:</strong> {ATZ_2026.aktuellerRentenwert.toFixed(2)} € pro Entgeltpunkt und Monat<br />
              <strong>Durchschnittsentgelt 2026:</strong> {ATZ_2026.durchschnittsentgelt.toLocaleString('de-DE')} €/Jahr
            </p>
          </div>
        </div>
      </div>

      {/* Gesamtbetrachtung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📈</span>
          Gesamtbetrachtung über {atzDauerJahre} Jahre
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Ohne Altersteilzeit</p>
              <p className="text-sm text-gray-500">Gesamt-Netto ({atzDauerJahre} Jahre)</p>
              <p className="text-2xl font-bold text-gray-800">{formatEuro(ergebnis.gesamtNettoOhneATZ)}</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl">
              <p className="text-sm text-amber-600 mb-1">Mit Altersteilzeit</p>
              <p className="text-sm text-gray-500">Gesamt-Netto ({atzDauerJahre} Jahre)</p>
              <p className="text-2xl font-bold text-amber-700">{formatEuro(ergebnis.gesamtNettoMitATZ)}</p>
            </div>
          </div>
          
          <div className="p-4 bg-red-50 rounded-xl border-l-4 border-red-400">
            <p className="font-medium text-red-800 mb-1">Einkommensdifferenz</p>
            <p className="text-3xl font-bold text-red-600">
              -{formatEuro(ergebnis.gesamtNettoOhneATZ - ergebnis.gesamtNettoMitATZ)}
            </p>
            <p className="text-sm text-red-700 mt-1">
              weniger Netto-Einkommen über die gesamte ATZ-Laufzeit
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-xl border-l-4 border-green-400">
            <p className="font-medium text-green-800 mb-1">🏖️ Aber: Freizeit-Gewinn</p>
            <p className="text-2xl font-bold text-green-600">
              {atzDauerJahre / 2} Jahre bezahlte Freistellung
            </p>
            <p className="text-sm text-green-700 mt-1">
              = {(atzDauerJahre / 2 * 12).toFixed(0)} Monate früher "Rente" bei gleichem Netto
            </p>
          </div>
        </div>
      </div>

      {/* Voraussetzungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">✅</span>
          Voraussetzungen für Altersteilzeit
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-green-500 text-xl">✓</span>
            <div>
              <p className="font-medium text-gray-800">Mindestalter: 55 Jahre</p>
              <p className="text-sm text-gray-600">Bei Beginn der Altersteilzeit</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-green-500 text-xl">✓</span>
            <div>
              <p className="font-medium text-gray-800">Mindestbeschäftigung: 3 Jahre</p>
              <p className="text-sm text-gray-600">In den letzten 5 Jahren vor Beginn der ATZ sozialversicherungspflichtig</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-green-500 text-xl">✓</span>
            <div>
              <p className="font-medium text-gray-800">Vereinbarung mit Arbeitgeber</p>
              <p className="text-sm text-gray-600">ATZ ist <strong>keine</strong> Pflicht – Arbeitgeber muss zustimmen</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-green-500 text-xl">✓</span>
            <div>
              <p className="font-medium text-gray-800">Halbierung der Arbeitszeit</p>
              <p className="text-sm text-gray-600">Durchschnittlich 50% der bisherigen Arbeitszeit über die Gesamtlaufzeit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vor- und Nachteile */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">⚖️</span>
          Vor- und Nachteile der Altersteilzeit
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-xl">
            <p className="font-medium text-green-800 mb-2">✓ Vorteile</p>
            <ul className="text-sm text-green-700 space-y-2">
              <li>• Gleitender Übergang in Rente</li>
              <li>• Ca. 80% des Nettos bei 50% Arbeit</li>
              <li>• Aufstockung ist steuerfrei</li>
              <li>• RV-Beiträge auf 80% Basis</li>
              <li>• Freistellungsphase ohne Arbeit</li>
              <li>• Soziale Absicherung bleibt</li>
            </ul>
          </div>
          <div className="p-4 bg-red-50 rounded-xl">
            <p className="font-medium text-red-800 mb-2">✗ Nachteile</p>
            <ul className="text-sm text-red-700 space-y-2">
              <li>• 20% weniger Netto</li>
              <li>• Weniger Rentenpunkte als Vollzeit</li>
              <li>• Progressionsvorbehalt der Aufstockung</li>
              <li>• Arbeitgeber muss zustimmen</li>
              <li>• Insolvenzrisiko des Arbeitgebers</li>
              <li>• Keine gesetzliche Pflicht</li>
            </ul>
          </div>
        </div>
      </div>

      {/* So funktioniert die Aufstockung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🧮</span>
          So funktioniert die Aufstockung
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-xl">
            <p className="font-medium text-amber-800 mb-2">Gesetzliche Mindestaufstockung:</p>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• <strong>Mindestens 20%</strong> des ATZ-Bruttos (= 10% des Vollzeit-Bruttos)</li>
              <li>• Viele Tarifverträge sehen <strong>höhere Aufstockungen</strong> vor</li>
              <li>• Ziel ist oft: ca. <strong>80% des bisherigen Nettos</strong></li>
            </ul>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="font-medium text-blue-800 mb-2">Rentenbeiträge:</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Arbeitgeber zahlt RV-Beiträge auf <strong>mindestens 80%</strong> des bisherigen Bruttos</li>
              <li>• Zusätzliche Beiträge werden vom Arbeitgeber allein getragen</li>
              <li>• Damit werden mehr Entgeltpunkte gesammelt als nur bei 50% Gehalt</li>
            </ul>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-gray-800">50%</p>
              <p className="text-sm text-gray-600">Gehalt (brutto)</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <p className="text-3xl font-bold text-green-600">~80%</p>
              <p className="text-sm text-gray-600">Netto-Einkommen</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-3xl font-bold text-blue-600">80%</p>
              <p className="text-sm text-gray-600">RV-Grundlage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Insolvenzschutz */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🛡️</span>
          Insolvenzschutz bei Altersteilzeit
        </h3>
        
        <div className="p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-400">
          <p className="font-medium text-yellow-800 mb-2">⚠️ Wichtig beim Blockmodell:</p>
          <p className="text-sm text-yellow-700 mb-3">
            In der Arbeitsphase arbeiten Sie vor und "ersparen" sich Gehalt für die Freistellung. 
            Wird der Arbeitgeber insolvent, könnte dieses Guthaben verloren gehen.
          </p>
          <p className="text-sm text-yellow-800">
            <strong>Pflicht des Arbeitgebers:</strong> Absicherung durch Bankbürgschaft, Sicherheit oder 
            Insolvenzsicherung (z.B. Treuhandvertrag, Versicherung).
          </p>
        </div>
        
        <p className="text-sm text-gray-600 mt-3">
          💡 <strong>Tipp:</strong> Lassen Sie sich die Insolvenzabsicherung schriftlich nachweisen!
        </p>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🏛️</span>
          Beratung & Ansprechpartner
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-teal-50 rounded-xl">
            <p className="font-semibold text-teal-900 mb-2">Deutsche Rentenversicherung (DRV)</p>
            <p className="text-sm text-teal-700">
              Informationen zu Auswirkungen der Altersteilzeit auf Ihre Rente und Beratung 
              zur optimalen Gestaltung des Übergangs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Servicetelefon DRV</p>
                <a 
                  href="tel:08001000480"
                  className="text-blue-600 hover:underline font-bold"
                >
                  0800 1000 4800
                </a>
                <p className="text-xs text-gray-500 mt-1">Kostenlos, Mo-Do 7:30-19:30</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Online</p>
                <a 
                  href="https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Kurz-vor-der-Rente/Altersteilzeit/altersteilzeit_node.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  DRV-Infos zur Altersteilzeit →
                </a>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-yellow-50 rounded-xl text-sm">
            <p className="text-yellow-800">
              💡 <strong>Tipp:</strong> Sprechen Sie auch mit Ihrem <strong>Betriebsrat</strong> oder 
              <strong> Personalrat</strong> – oft gibt es tarifliche Regelungen mit höherer Aufstockung!
            </p>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/alttzg_1996/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Altersteilzeitgesetz (AltTZG)
          </a>
          <a 
            href="https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Kurz-vor-der-Rente/Altersteilzeit/altersteilzeit_node.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsche Rentenversicherung – Altersteilzeit
          </a>
          <a 
            href="https://www.bmas.de/DE/Arbeit/Arbeitsrecht/Teilzeit/Altersteilzeit/altersteilzeit.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMAS – Altersteilzeit
          </a>
        </div>
      </div>
    </div>
  );
}
