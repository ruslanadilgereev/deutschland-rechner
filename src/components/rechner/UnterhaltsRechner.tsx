import { useState } from 'react';

// Düsseldorfer Tabelle 2026 (gültig ab 01.01.2026)
// Quelle: OLG Düsseldorf, Unterhaltsleitlinien
// Beträge in Euro, Altersstufen: 0-5, 6-11, 12-17, ab 18

interface EinkommensGruppe {
  id: number;
  nettoVon: number;
  nettoBis: number | null;
  betraege: [number, number, number, number]; // [0-5, 6-11, 12-17, ab 18]
  bedarfskontrollbetrag: number;
  prozent: number; // Prozentsatz zum Mindestunterhalt
}

// Düsseldorfer Tabelle 2026 - OLG Düsseldorf, gültig ab 01.01.2026
// Quelle: https://www.olg-duesseldorf.nrw.de/infos/Duesseldorfer_Tabelle/Tabelle-2026/index.php
// Mindestunterhalt 2026: 486€ (0-5), 558€ (6-11), 653€ (12-17), 698€ (ab 18)
// Volljährige 1. Gruppe = 125% des Mindestbedarfs der 2. Altersstufe
const DUESSELDORFER_TABELLE_2026: EinkommensGruppe[] = [
  { id: 1,  nettoVon: 0,     nettoBis: 2100,  betraege: [486, 558, 653, 698],  bedarfskontrollbetrag: 1200, prozent: 100 },
  { id: 2,  nettoVon: 2101,  nettoBis: 2500,  betraege: [511, 586, 686, 733],  bedarfskontrollbetrag: 1750, prozent: 105 },
  { id: 3,  nettoVon: 2501,  nettoBis: 2900,  betraege: [535, 614, 719, 768],  bedarfskontrollbetrag: 1850, prozent: 110 },
  { id: 4,  nettoVon: 2901,  nettoBis: 3300,  betraege: [559, 642, 751, 803],  bedarfskontrollbetrag: 1950, prozent: 115 },
  { id: 5,  nettoVon: 3301,  nettoBis: 3700,  betraege: [584, 670, 784, 838],  bedarfskontrollbetrag: 2050, prozent: 120 },
  { id: 6,  nettoVon: 3701,  nettoBis: 4100,  betraege: [623, 715, 836, 894],  bedarfskontrollbetrag: 2150, prozent: 128 },
  { id: 7,  nettoVon: 4101,  nettoBis: 4500,  betraege: [661, 759, 889, 950],  bedarfskontrollbetrag: 2250, prozent: 136 },
  { id: 8,  nettoVon: 4501,  nettoBis: 4900,  betraege: [700, 804, 941, 1006], bedarfskontrollbetrag: 2350, prozent: 144 },
  { id: 9,  nettoVon: 4901,  nettoBis: 5300,  betraege: [739, 849, 993, 1061], bedarfskontrollbetrag: 2450, prozent: 152 },
  { id: 10, nettoVon: 5301,  nettoBis: 5700,  betraege: [778, 893, 1045, 1117], bedarfskontrollbetrag: 2550, prozent: 160 },
  { id: 11, nettoVon: 5701,  nettoBis: 6400,  betraege: [817, 938, 1098, 1173], bedarfskontrollbetrag: 2850, prozent: 168 },
  { id: 12, nettoVon: 6401,  nettoBis: 7200,  betraege: [856, 983, 1150, 1229], bedarfskontrollbetrag: 3250, prozent: 176 },
  { id: 13, nettoVon: 7201,  nettoBis: 8200,  betraege: [895, 1027, 1202, 1285], bedarfskontrollbetrag: 3750, prozent: 184 },
  { id: 14, nettoVon: 8201,  nettoBis: 9700,  betraege: [934, 1072, 1254, 1341], bedarfskontrollbetrag: 4350, prozent: 192 },
  { id: 15, nettoVon: 9701,  nettoBis: null,  betraege: [972, 1116, 1306, 1396], bedarfskontrollbetrag: 5050, prozent: 200 },
];

// Kindergeld 2026: 259€ pro Kind pro Monat
const KINDERGELD_2026 = 259;

// Selbstbehalt 2026
const SELBSTBEHALT = {
  erwerbstaetig: 1450,
  nichtErwerbstaetig: 1200,
};

const ALTERSSTUFEN = [
  { label: '0–5 Jahre', index: 0 },
  { label: '6–11 Jahre', index: 1 },
  { label: '12–17 Jahre', index: 2 },
  { label: 'ab 18 Jahre', index: 3 },
];

function getEinkommensgruppe(netto: number): EinkommensGruppe {
  for (const gruppe of DUESSELDORFER_TABELLE_2026) {
    if (gruppe.nettoBis === null || netto <= gruppe.nettoBis) {
      if (netto >= gruppe.nettoVon || gruppe.id === 1) {
        return gruppe;
      }
    }
  }
  return DUESSELDORFER_TABELLE_2026[DUESSELDORFER_TABELLE_2026.length - 1];
}

export default function UnterhaltsRechner() {
  const [nettoEinkommen, setNettoEinkommen] = useState(3000);
  const [altersstufe, setAltersstufe] = useState(0);
  const [istErwerbstaetig, setIstErwerbstaetig] = useState(true);
  const [anzahlKinder, setAnzahlKinder] = useState(1);

  // Berechnung
  const einkommensgruppe = getEinkommensgruppe(nettoEinkommen);
  const tabellenBetrag = einkommensgruppe.betraege[altersstufe];
  const istVolljaehrig = altersstufe === 3;
  
  // Kindergeld-Anrechnung: 50% bei Minderjährigen, 100% bei Volljährigen
  const kindergeldAnrechnung = istVolljaehrig ? KINDERGELD_2026 : KINDERGELD_2026 / 2;
  const zahlbetrag = tabellenBetrag - kindergeldAnrechnung;
  
  // Selbstbehalt prüfen
  const selbstbehalt = istErwerbstaetig ? SELBSTBEHALT.erwerbstaetig : SELBSTBEHALT.nichtErwerbstaetig;
  const verbleibtNachUnterhalt = nettoEinkommen - (zahlbetrag * anzahlKinder);
  const selbstbehaltUnterschritten = verbleibtNachUnterhalt < selbstbehalt;
  
  // Bedarfskontrollbetrag
  const bedarfskontrollbetrag = einkommensgruppe.bedarfskontrollbetrag;

  return (
    <div className="max-w-lg mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Angaben zum Unterhalt</h3>
        
        {/* Netto-Einkommen */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Bereinigtes Nettoeinkommen (€/Monat)
          </label>
          <input
            type="number"
            value={nettoEinkommen}
            onChange={(e) => setNettoEinkommen(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-lg"
            min="0"
            step="100"
          />
          <input
            type="range"
            value={nettoEinkommen}
            onChange={(e) => setNettoEinkommen(parseInt(e.target.value))}
            min="0"
            max="12000"
            step="100"
            className="w-full mt-2 accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span>12.000 €</span>
          </div>
        </div>

        {/* Altersstufe */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Altersstufe des Kindes
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ALTERSSTUFEN.map((stufe) => (
              <button
                key={stufe.index}
                onClick={() => setAltersstufe(stufe.index)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  altersstufe === stufe.index
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {stufe.label}
              </button>
            ))}
          </div>
        </div>

        {/* Anzahl Kinder */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Anzahl unterhaltspflichtiger Kinder
          </label>
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setAnzahlKinder(Math.max(1, anzahlKinder - 1))}
              className="w-12 h-12 rounded-full bg-gray-100 text-2xl font-bold text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
              disabled={anzahlKinder <= 1}
            >
              −
            </button>
            <span className="text-4xl font-bold text-blue-600 w-16 text-center">
              {anzahlKinder}
            </span>
            <button
              onClick={() => setAnzahlKinder(Math.min(6, anzahlKinder + 1))}
              className="w-12 h-12 rounded-full bg-blue-500 text-2xl font-bold text-white hover:bg-blue-600 active:scale-95 transition-all"
            >
              +
            </button>
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            Bei mehreren Kindern ggf. Herabstufung beachten
          </p>
        </div>

        {/* Erwerbstätigkeit */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Erwerbsstatus
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIstErwerbstaetig(true)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                istErwerbstaetig
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Erwerbstätig
            </button>
            <button
              onClick={() => setIstErwerbstaetig(false)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                !istErwerbstaetig
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Nicht erwerbstätig
            </button>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Kindesunterhalt (Zahlbetrag)</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{zahlbetrag.toLocaleString('de-DE')}</span>
            <span className="text-xl text-blue-200">€ / Monat</span>
          </div>
          <p className="text-sm text-blue-200 mt-1">pro Kind</p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Tabellenbetrag</span>
              <span className="text-lg font-bold">{tabellenBetrag.toLocaleString('de-DE')} €</span>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">
                Kindergeld-Anrechnung ({istVolljaehrig ? '100%' : '50%'})
              </span>
              <span className="text-lg font-bold">− {kindergeldAnrechnung.toLocaleString('de-DE')} €</span>
            </div>
          </div>

          {anzahlKinder > 1 && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Gesamt für {anzahlKinder} Kinder</span>
                <span className="text-lg font-bold">{(zahlbetrag * anzahlKinder).toLocaleString('de-DE')} € / Monat</span>
              </div>
            </div>
          )}

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Jahresbetrag</span>
              <span className="text-lg font-bold">{(zahlbetrag * anzahlKinder * 12).toLocaleString('de-DE')} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Einkommensgruppe Info */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Einordnung Düsseldorfer Tabelle</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-600">Einkommensgruppe</span>
            <span className="font-bold text-blue-600">{einkommensgruppe.id}. Gruppe</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-600">Einkommensspanne</span>
            <span className="font-medium">
              {einkommensgruppe.nettoVon.toLocaleString('de-DE')} € 
              {einkommensgruppe.nettoBis ? ` – ${einkommensgruppe.nettoBis.toLocaleString('de-DE')} €` : ' +'}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-600">Bedarfskontrollbetrag</span>
            <span className="font-medium">{bedarfskontrollbetrag.toLocaleString('de-DE')} €</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-600">Prozentsatz (Mindestunterhalt)</span>
            <span className="font-medium">{einkommensgruppe.prozent} %</span>
          </div>
        </div>
      </div>

      {/* Selbstbehalt Warnung */}
      {selbstbehaltUnterschritten && (
        <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-2xl p-6">
          <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
            <span>⚠️</span>
            Selbstbehalt unterschritten!
          </h3>
          <p className="text-red-700 text-sm">
            Nach Abzug des Unterhalts verbleiben <strong>{verbleibtNachUnterhalt.toLocaleString('de-DE')} €</strong>.
            Der Selbstbehalt für {istErwerbstaetig ? 'Erwerbstätige' : 'nicht Erwerbstätige'} beträgt 
            jedoch <strong>{selbstbehalt.toLocaleString('de-DE')} €</strong>.
          </p>
          <p className="text-red-700 text-sm mt-2">
            In diesem Fall kann der Unterhalt herabgesetzt werden oder es greift die Mangelfallberechnung.
          </p>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert's</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Bereinigtes Nettoeinkommen:</strong> Netto abzüglich berufsbedingter Aufwendungen (ca. 5%)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Kindergeld-Anrechnung:</strong> 50% bei Minderjährigen, 100% bei Volljährigen</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Selbstbehalt:</strong> {SELBSTBEHALT.erwerbstaetig.toLocaleString('de-DE')} € (erwerbstätig) / {SELBSTBEHALT.nichtErwerbstaetig.toLocaleString('de-DE')} € (nicht erwerbstätig)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Mehrere Kinder:</strong> Ggf. Herabstufung um eine Einkommensgruppe pro Kind</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="font-semibold text-blue-900">Jugendamt / Beistandschaft</p>
            <p className="text-sm text-blue-700 mt-1">Das örtliche Jugendamt bietet kostenlose Beistandschaft zur Durchsetzung von Unterhaltsansprüchen.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Jugendamt finden</p>
                <a 
                  href="https://www.jugendaemter.com"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  jugendaemter.com →
                </a>
                <p className="text-xs text-gray-500 mt-1">Nach Postleitzahl suchen</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">⚖️</span>
              <div>
                <p className="font-medium text-gray-800">Rechtsanwalt</p>
                <a 
                  href="https://anwaltauskunft.de"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Familienrecht-Anwalt finden →
                </a>
                <p className="text-xs text-gray-500 mt-1">Bei komplexen Fällen</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Wichtige Hinweise</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium text-yellow-800">Unverbindliche Berechnung</p>
              <p className="text-yellow-700">Diese Berechnung ist eine Orientierung. Der tatsächliche Unterhalt kann abweichen.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-medium text-green-800">Mindestunterhalt ist vorrangig</p>
              <p className="text-green-700">Kindesunterhalt geht vor anderen Unterhaltspflichten (z.B. Ehegattenunterhalt).</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">📄</span>
            <div>
              <p className="font-medium text-blue-800">Unterhaltstitel wichtig</p>
              <p className="text-blue-700">Lassen Sie den Unterhalt titulieren (Jugendamt-Urkunde oder Gerichtsbeschluss) für die Durchsetzbarkeit.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Düsseldorfer Tabelle Übersicht */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">📊 Düsseldorfer Tabelle 2026 (Auszug)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 px-1">Gruppe</th>
                <th className="text-right py-2 px-1">0–5</th>
                <th className="text-right py-2 px-1">6–11</th>
                <th className="text-right py-2 px-1">12–17</th>
                <th className="text-right py-2 px-1">18+</th>
              </tr>
            </thead>
            <tbody>
              {DUESSELDORFER_TABELLE_2026.slice(0, 6).map((gruppe) => (
                <tr 
                  key={gruppe.id} 
                  className={`border-b border-gray-100 ${gruppe.id === einkommensgruppe.id ? 'bg-blue-50 font-medium' : ''}`}
                >
                  <td className="py-2 px-1 text-gray-600">
                    {gruppe.id}. ({gruppe.nettoVon}–{gruppe.nettoBis || '∞'})
                  </td>
                  <td className="text-right py-2 px-1">{gruppe.betraege[0]} €</td>
                  <td className="text-right py-2 px-1">{gruppe.betraege[1]} €</td>
                  <td className="text-right py-2 px-1">{gruppe.betraege[2]} €</td>
                  <td className="text-right py-2 px-1">{gruppe.betraege[3]} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Vollständige Tabelle: 15 Einkommensgruppen bis 9.700 €+ Netto
        </p>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.olg-duesseldorf.nrw.de/infos/Duesseldorfer_Tabelle/index.php"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            OLG Düsseldorf – Düsseldorfer Tabelle 2026
          </a>
          <a 
            href="https://www.bmj.de/DE/themen/gesellschaft/familie-und-unterhalt/unterhalt/unterhalt-node.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesministerium der Justiz – Unterhaltsrecht
          </a>
          <a 
            href="https://familienportal.de/familienportal/familienleistungen/unterhaltsvorschuss"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Familienportal – Unterhaltsvorschuss
          </a>
        </div>
      </div>
    </div>
  );
}
