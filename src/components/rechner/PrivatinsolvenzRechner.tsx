import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// ============================================================================
// Pfändungsfreigrenzen 2025/2026 nach § 850c ZPO
// ============================================================================
// Rechtsgrundlage: Zivilprozessordnung (ZPO)
// - § 850c ZPO: Pfändungsgrenzen für Arbeitseinkommen
// - § 850d ZPO: Pfändungsschutz bei Unterhaltspfändung (Sonderfall)
//
// Pfändungsfreigrenzen ab 01.07.2025 (gültig auch 2026)
// Quelle: Pfändungsfreigrenzenbekanntmachung 2025
// BGBl. 2025 I Nr. 110
// https://www.recht.bund.de/bgbl/1/2025/110/VO.html
//
// Bei einer Privatinsolvenz (Verbraucherinsolvenz) wird ein Teil des
// Einkommens gepfändet. Der pfändungsfreie Betrag sichert das Existenzminimum.
// ============================================================================

// Grundfreibetrag seit 01.07.2025 (unverändert für 2026)
// § 850c Abs. 1 ZPO, aufgerundet nach § 850c Abs. 5 S. 1 Nr. 1 ZPO
const PFAENDUNGSFREIGRENZEN_2026 = {
  // Grundfreibetrag ohne Unterhaltspflichten
  grundfreibetrag: 1559.99,
  
  // Erhöhung für die erste unterhaltsberechtigte Person (§ 850c Abs. 2 S. 1 Nr. 1 ZPO)
  erhoehung_erste_person: 585.23,
  
  // Erhöhung für jede weitere unterhaltsberechtigte Person (§ 850c Abs. 2 S. 2 Nr. 1 ZPO)
  erhoehung_weitere_person: 326.04,
  
  // Höchstbetrag: Alles über diesem Betrag ist voll pfändbar
  hoechstbetrag: 4766.99,
};

// Pfändungsfreigrenzen je nach Anzahl der Unterhaltsberechtigten
// Quelle: Pfändungstabelle ab 01.07.2025
const FREIGRENZEN_NACH_UNTERHALT = [
  1559.99,  // 0 Unterhaltsberechtigte
  2149.99,  // 1 Unterhaltsberechtigter
  2469.99,  // 2 Unterhaltsberechtigte
  2799.99,  // 3 Unterhaltsberechtigte
  3119.99,  // 4 Unterhaltsberechtigte
  3449.99,  // 5+ Unterhaltsberechtigte
];

// Anteil des Mehrverdienstes über Freigrenze, der NICHT gepfändet wird
// § 850c Abs. 3 ZPO
// Ohne Unterhalt: 30% (3/10) unpfändbar
// Mit 1 Unterhaltsberechtigtem: 50% (5/10) unpfändbar (30% + 20%)
// Mit 2: 60%, Mit 3: 70%, Mit 4: 80%, Mit 5+: 90%
const UNPFAENDBAR_PROZENT = [
  0.30,  // 0 Unterhaltsberechtigte: 30%
  0.50,  // 1 Unterhaltsberechtigter: 50%
  0.60,  // 2 Unterhaltsberechtigte: 60%
  0.70,  // 3 Unterhaltsberechtigte: 70%
  0.80,  // 4 Unterhaltsberechtigte: 80%
  0.90,  // 5+ Unterhaltsberechtigte: 90%
];

interface BerechnungsErgebnis {
  nettoeinkommen: number;
  unterhaltspflichten: number;
  pfaendungsfreigrenze: number;
  ueberFreigrenze: number;
  unpfaendbarerMehrverdienst: number;
  pfaendbarerBetrag: number;
  pfaendungsfreierBetrag: number;
  prozentGepfaendet: number;
}

function berechnePfaendung(netto: number, unterhaltspflichten: number): BerechnungsErgebnis {
  // Begrenzen auf max. 5 Unterhaltsberechtigte für Tabelle
  const index = Math.min(unterhaltspflichten, 5);
  
  // Pfändungsfreigrenze basierend auf Unterhaltspflichten
  const pfaendungsfreigrenze = FREIGRENZEN_NACH_UNTERHALT[index];
  
  // Betrag über der Freigrenze
  const ueberFreigrenze = Math.max(0, netto - pfaendungsfreigrenze);
  
  // Anteil des Mehrverdienstes, der unpfändbar ist
  const unpfaendbarProzent = UNPFAENDBAR_PROZENT[index];
  
  let pfaendbarerBetrag = 0;
  let unpfaendbarerMehrverdienst = 0;
  
  if (ueberFreigrenze > 0) {
    // Mehrverdienst bis zum Höchstbetrag
    const maxMehrverdienst = PFAENDUNGSFREIGRENZEN_2026.hoechstbetrag - pfaendungsfreigrenze;
    
    if (ueberFreigrenze <= maxMehrverdienst) {
      // Innerhalb des gestaffelten Bereichs
      unpfaendbarerMehrverdienst = ueberFreigrenze * unpfaendbarProzent;
      pfaendbarerBetrag = ueberFreigrenze - unpfaendbarerMehrverdienst;
    } else {
      // Teil im gestaffelten Bereich, Rest voll pfändbar
      unpfaendbarerMehrverdienst = maxMehrverdienst * unpfaendbarProzent;
      const gestafelterPfaendbar = maxMehrverdienst - unpfaendbarerMehrverdienst;
      const vollPfaendbar = ueberFreigrenze - maxMehrverdienst;
      pfaendbarerBetrag = gestafelterPfaendbar + vollPfaendbar;
    }
  }
  
  // Pfändungsfreier Betrag
  const pfaendungsfreierBetrag = netto - pfaendbarerBetrag;
  
  // Prozentsatz gepfändet
  const prozentGepfaendet = netto > 0 ? (pfaendbarerBetrag / netto) * 100 : 0;
  
  return {
    nettoeinkommen: netto,
    unterhaltspflichten,
    pfaendungsfreigrenze,
    ueberFreigrenze,
    unpfaendbarerMehrverdienst,
    pfaendbarerBetrag: Math.round(pfaendbarerBetrag * 100) / 100,
    pfaendungsfreierBetrag: Math.round(pfaendungsfreierBetrag * 100) / 100,
    prozentGepfaendet: Math.round(prozentGepfaendet * 10) / 10,
  };
}

export default function PrivatinsolvenzRechner() {
  const [nettoeinkommen, setNettoeinkommen] = useState(2500);
  const [unterhaltspflichten, setUnterhaltspflichten] = useState(0);

  const ergebnis = useMemo(() => {
    return berechnePfaendung(nettoeinkommen, unterhaltspflichten);
  }, [nettoeinkommen, unterhaltspflichten]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }) + ' €';

  const formatProzent = (n: number) => n.toLocaleString('de-DE', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }) + ' %';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Nettoeinkommen */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Monatliches Nettoeinkommen</span>
            <span className="text-xs text-gray-500 ml-2">(nach Steuern & Sozialabgaben)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={nettoeinkommen}
              onChange={(e) => setNettoeinkommen(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none"
              min="0"
              step="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <div className="flex gap-2 mt-2">
            {[1500, 2000, 2500, 3000, 3500].map(val => (
              <button
                key={val}
                onClick={() => setNettoeinkommen(val)}
                className={`flex-1 py-1 px-2 text-xs rounded-lg transition-all ${
                  nettoeinkommen === val
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {val.toLocaleString('de-DE')} €
              </button>
            ))}
          </div>
        </div>

        {/* Unterhaltspflichten */}
        <div>
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Unterhaltspflichten</span>
            <span className="text-xs text-gray-500 ml-2">(Personen, für die du tatsächlich zahlst)</span>
          </label>
          <div className="grid grid-cols-6 gap-2">
            {[0, 1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setUnterhaltspflichten(n)}
                className={`py-3 rounded-xl text-center transition-all ${
                  unterhaltspflichten === n
                    ? 'bg-amber-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="font-bold text-lg">{n === 5 ? '5+' : n}</div>
                <div className="text-xs opacity-70">{n === 1 ? 'Person' : 'Personen'}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            z.B. Ehepartner, Kinder, geschiedene Ehepartner (nur wenn du tatsächlich Unterhalt zahlst)
          </p>
        </div>
      </div>

      {/* Result Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Pfändungsfreier Betrag */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-80 mb-1">
            Pfändungsfrei (dir verbleibend)
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatEuro(ergebnis.pfaendungsfreierBetrag)}</span>
          </div>
          <div className="text-sm opacity-80 mt-2">
            {100 - ergebnis.prozentGepfaendet > 0 
              ? `${formatProzent(100 - ergebnis.prozentGepfaendet)} deines Einkommens`
              : 'Kein pfändbares Einkommen'}
          </div>
        </div>

        {/* Pfändbarer Betrag */}
        <div className={`rounded-2xl shadow-lg p-6 text-white ${
          ergebnis.pfaendbarerBetrag > 0
            ? 'bg-gradient-to-br from-red-500 to-rose-600'
            : 'bg-gradient-to-br from-gray-400 to-gray-500'
        }`}>
          <h3 className="text-sm font-medium opacity-80 mb-1">
            Pfändbarer Betrag (an Gläubiger)
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatEuro(ergebnis.pfaendbarerBetrag)}</span>
          </div>
          <div className="text-sm opacity-80 mt-2">
            {ergebnis.pfaendbarerBetrag > 0
              ? `${formatProzent(ergebnis.prozentGepfaendet)} deines Einkommens`
              : 'Unterhalb der Pfändungsfreigrenze'}
          </div>
        </div>
      </div>

      {/* Jahresübersicht */}
      {ergebnis.pfaendbarerBetrag > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">📅 Jahresübersicht (bei 3 Jahren Insolvenz)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatEuro(ergebnis.pfaendungsfreierBetrag * 12)}
              </div>
              <div className="text-sm text-green-700">behältst du pro Jahr</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatEuro(ergebnis.pfaendbarerBetrag * 12)}
              </div>
              <div className="text-sm text-red-700">wird pro Jahr gepfändet</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">
                {formatEuro(ergebnis.pfaendbarerBetrag * 36)}
              </div>
              <div className="text-sm text-amber-700">gesamt in 3 Jahren</div>
            </div>
          </div>
        </div>
      )}

      {/* Aufschlüsselung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnung im Detail</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Dein Nettoeinkommen</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.nettoeinkommen)}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              Pfändungsfreigrenze ({ergebnis.unterhaltspflichten === 0 
                ? 'ohne Unterhalt' 
                : `${ergebnis.unterhaltspflichten} ${ergebnis.unterhaltspflichten === 1 ? 'Person' : 'Personen'}`})
            </span>
            <span className="font-bold text-green-600">{formatEuro(ergebnis.pfaendungsfreigrenze)}</span>
          </div>

          {ergebnis.ueberFreigrenze > 0 ? (
            <>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Betrag über Freigrenze</span>
                <span className="font-bold text-gray-900">{formatEuro(ergebnis.ueberFreigrenze)}</span>
              </div>
              
              {ergebnis.unpfaendbarerMehrverdienst > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
                  <span>
                    − Unpfändbarer Anteil ({formatProzent(UNPFAENDBAR_PROZENT[Math.min(ergebnis.unterhaltspflichten, 5)] * 100)})
                  </span>
                  <span className="font-bold">− {formatEuro(ergebnis.unpfaendbarerMehrverdienst)}</span>
                </div>
              )}
              
              <div className="flex justify-between py-2 border-b border-gray-200 bg-red-50 -mx-6 px-6">
                <span className="font-medium text-red-700">= Pfändbarer Betrag</span>
                <span className="font-bold text-red-700">{formatEuro(ergebnis.pfaendbarerBetrag)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between py-2 border-b border-gray-200 bg-green-50 -mx-6 px-6">
              <span className="font-medium text-green-700">Einkommen liegt unter Freigrenze</span>
              <span className="font-bold text-green-700">Keine Pfändung</span>
            </div>
          )}

          <div className="flex justify-between py-3 -mx-6 px-6 rounded-b-2xl bg-green-50">
            <span className="font-bold text-gray-800">Dir verbleibt</span>
            <span className="font-bold text-xl text-green-600">{formatEuro(ergebnis.pfaendungsfreierBetrag)}</span>
          </div>
        </div>
      </div>

      {/* Pfändungsfreigrenzen-Tabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Pfändungsfreigrenzen 2025/2026</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2 px-3 rounded-tl-lg">Unterhaltsberechtigte</th>
                <th className="text-right py-2 px-3 rounded-tr-lg">Pfändungsfreigrenze</th>
              </tr>
            </thead>
            <tbody>
              {FREIGRENZEN_NACH_UNTERHALT.map((grenze, i) => (
                <tr 
                  key={i} 
                  className={`border-b border-gray-100 ${
                    unterhaltspflichten === i ? 'bg-amber-50' : ''
                  }`}
                >
                  <td className="py-2 px-3">
                    {i === 0 ? 'Keine' : i === 5 ? '5 oder mehr' : i}
                    {unterhaltspflichten === i && (
                      <span className="ml-2 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">
                        Deine Situation
                      </span>
                    )}
                  </td>
                  <td className="text-right py-2 px-3 font-mono font-bold">
                    {formatEuro(grenze)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Gültig seit 01.07.2025 • Alles über {formatEuro(PFAENDUNGSFREIGRENZEN_2026.hoechstbetrag + 0.01)} ist voll pfändbar
        </p>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert's</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Pfändungsfreigrenze</strong> sichert dein Existenzminimum – dieser Betrag ist unpfändbar</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Unterhaltspflichten</strong> erhöhen den geschützten Betrag erheblich</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Mehrverdienst</strong> über der Freigrenze wird nur teilweise gepfändet (30-90%)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Privatinsolvenz</strong> dauert in der Regel 3 Jahre (Restschuldbefreiung)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Grenzen werden jährlich</strong> zum 1. Juli an das Existenzminimum angepasst</span>
          </li>
        </ul>
      </div>

      {/* Was zählt zum Nettoeinkommen? */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <h4 className="font-bold text-blue-800 mb-2">💰 Was zählt zum Nettoeinkommen?</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <p className="font-medium mb-1">✓ Pfändbar:</p>
            <ul className="space-y-1 text-blue-600">
              <li>• Lohn und Gehalt (netto)</li>
              <li>• Arbeitslosengeld I</li>
              <li>• Altersrente</li>
              <li>• Bürgergeld (über Grenze)</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">✗ Nicht pfändbar (§ 850a ZPO):</p>
            <ul className="space-y-1 text-blue-600">
              <li>• Kindergeld, Wohngeld</li>
              <li>• Urlaubsgeld (Hälfte, max. 600€)</li>
              <li>• Überstundenvergütungen</li>
              <li>• VWL, Aufwandsentschädigungen</li>
            </ul>
          </div>
        </div>
      </div>

      {/* P-Konto Hinweis */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <h4 className="font-bold text-amber-800 mb-2">🏦 Wichtig: P-Konto (Pfändungsschutzkonto)</h4>
        <div className="text-sm text-amber-700 space-y-2">
          <p>Um dein Guthaben auf dem Girokonto zu schützen, solltest du es in ein <strong>P-Konto</strong> umwandeln.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Basispfändungsschutz: <strong>{formatEuro(1560)}</strong> pro Monat</li>
            <li>Erhöhung für Unterhaltsberechtigte möglich</li>
            <li>Kostenlose Umwandlung bei deiner Bank</li>
            <li>Bescheinigung von Schuldnerberatung für höheren Schutz</li>
          </ul>
        </div>
      </div>

      {/* Sonderfall Unterhaltsschulden */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <h4 className="font-bold text-red-800 mb-2">⚠️ Sonderfall: Unterhaltspfändung (§ 850d ZPO)</h4>
        <div className="text-sm text-red-700 space-y-2">
          <p>Bei Pfändungen wegen <strong>nicht gezahltem Unterhalt</strong> gelten die normalen Pfändungsgrenzen NICHT!</p>
          <p>Dem Schuldner verbleibt nur der Sozialhilfebedarf (aktuell 563 € für Alleinstehende). Diese Berechnung gilt nur für normale Schulden.</p>
        </div>
      </div>

      {/* Schuldnerberatung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🆘 Kostenlose Hilfe: Schuldnerberatung</h3>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Wenn du Schulden hast oder eine Privatinsolvenz erwägst, kannst du kostenlose Beratung erhalten:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🏛️</span>
              <div>
                <p className="font-medium text-gray-800">Kommunale Schuldnerberatung</p>
                <p className="text-gray-600">Bei Stadt oder Landkreis</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">⛪</span>
              <div>
                <p className="font-medium text-gray-800">Caritas / Diakonie</p>
                <p className="text-gray-600">Kirchliche Beratungsstellen</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🤝</span>
              <div>
                <p className="font-medium text-gray-800">Verbraucherzentrale</p>
                <a 
                  href="https://www.verbraucherzentrale.de/schuldnerberatung"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  verbraucherzentrale.de →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">➕</span>
              <div>
                <p className="font-medium text-gray-800">DRK / AWO</p>
                <p className="text-gray-600">Wohlfahrtsverbände</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ablauf Privatinsolvenz */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📝 Ablauf einer Privatinsolvenz</h3>
        <div className="space-y-4 text-sm">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
            <div>
              <p className="font-medium text-gray-800">Außergerichtlicher Einigungsversuch</p>
              <p className="text-gray-600">Mit Hilfe einer Schuldnerberatung versuchst du, dich mit den Gläubigern zu einigen.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
            <div>
              <p className="font-medium text-gray-800">Antrag auf Privatinsolvenz</p>
              <p className="text-gray-600">Scheitert die Einigung, stellst du beim Insolvenzgericht einen Antrag.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
            <div>
              <p className="font-medium text-gray-800">Wohlverhaltensphase (3 Jahre)</p>
              <p className="text-gray-600">Pfändbares Einkommen geht an den Treuhänder zur Schuldenbegleichung.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">4</div>
            <div>
              <p className="font-medium text-gray-800">Restschuldbefreiung</p>
              <p className="text-gray-600">Nach 3 Jahren werden verbleibende Schulden erlassen – du bist schuldenfrei!</p>
            </div>
          </div>
        </div>
      </div>

            <RechnerFeedback rechnerName="Privatinsolvenz-Rechner" rechnerSlug="privatinsolvenz-rechner" />

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/zpo/__850c.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 850c ZPO – Pfändungsgrenzen für Arbeitseinkommen
          </a>
          <a 
            href="https://www.recht.bund.de/bgbl/1/2025/110/VO.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Pfändungsfreigrenzenbekanntmachung 2025 (BGBl. 2025 I Nr. 110)
          </a>
          <a 
            href="https://www.finanztip.de/pfaendungstabelle/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Finanztip – Pfändungstabelle 2025/2026
          </a>
          <a 
            href="https://freibetragsrechner.justiz.nrw.de/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Justiz NRW – Offizieller Pfändungsfreigrenzen-Rechner
          </a>
          <a 
            href="https://www.verbraucherzentrale.de/schuldnerberatung"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Verbraucherzentrale – Schuldnerberatung
          </a>
        </div>
      </div>
    </div>
  );
}
