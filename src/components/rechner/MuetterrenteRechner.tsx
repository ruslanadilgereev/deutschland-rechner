import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

/**
 * Mütterrente-Rechner 2025/2026
 * 
 * Rechtsgrundlage: §§ 56, 249, 249a SGB VI
 * 
 * Kindererziehungszeiten:
 * - Kinder vor 01.01.1992 geboren: 2,5 Entgeltpunkte (Mütterrente II)
 * - Kinder ab 01.01.1992 geboren: 3 Entgeltpunkte (volle 3 Jahre)
 * 
 * Ab 01.01.2027 (Mütterrente III):
 * - Kinder vor 01.01.1992: 3 Entgeltpunkte (Angleichung)
 * 
 * Quellen:
 * - Deutsche Rentenversicherung: https://www.deutsche-rentenversicherung.de
 * - § 70 SGB VI (Entgeltpunkte pro Monat: 0,0833)
 */
const MUETTERRENTE_2026 = {
  // Aktueller Rentenwert (ab 01.07.2025 bundeseinheitlich)
  rentenwert: 40.79,
  
  // Entgeltpunkte für Kindererziehungszeiten
  entgeltpunkteVor1992: 2.5,  // Aktuell (Mütterrente II)
  entgeltpunkteAb1992: 3.0,   // Volle 3 Jahre
  
  // Ab 2027 (Mütterrente III)
  entgeltpunkteVor1992Ab2027: 3.0,  // Angleichung auf 3 Jahre
  
  // Monate pro Entgeltpunkt
  monateProJahr: 12,
  entgeltpunkteProMonat: 0.0833,  // 1/12 = 0,0833 EP pro Monat
};

interface KindDaten {
  id: number;
  jahr: number;
}

function berechneZusatzrente(kinderVor1992: number, kinderAb1992: number): {
  entgeltpunkteVor1992: number;
  entgeltpunkteAb1992: number;
  gesamtEntgeltpunkte: number;
  monatlicherZuschlag: number;
  jaehrlicherZuschlag: number;
  // Prognose ab 2027
  entgeltpunkteVor1992Ab2027: number;
  gesamtEntgeltpunkteAb2027: number;
  monatlicherZuschlagAb2027: number;
  mehrAb2027: number;
} {
  // Aktuelle Berechnung (2025/2026)
  const epVor1992 = kinderVor1992 * MUETTERRENTE_2026.entgeltpunkteVor1992;
  const epAb1992 = kinderAb1992 * MUETTERRENTE_2026.entgeltpunkteAb1992;
  const gesamtEP = epVor1992 + epAb1992;
  const monatlicherZuschlag = gesamtEP * MUETTERRENTE_2026.rentenwert;
  
  // Prognose ab 2027 (Mütterrente III)
  const epVor1992Ab2027 = kinderVor1992 * MUETTERRENTE_2026.entgeltpunkteVor1992Ab2027;
  const gesamtEPAb2027 = epVor1992Ab2027 + epAb1992;
  const monatlicherZuschlagAb2027 = gesamtEPAb2027 * MUETTERRENTE_2026.rentenwert;
  
  return {
    entgeltpunkteVor1992: epVor1992,
    entgeltpunkteAb1992: epAb1992,
    gesamtEntgeltpunkte: gesamtEP,
    monatlicherZuschlag,
    jaehrlicherZuschlag: monatlicherZuschlag * 12,
    entgeltpunkteVor1992Ab2027: epVor1992Ab2027,
    gesamtEntgeltpunkteAb2027: gesamtEPAb2027,
    monatlicherZuschlagAb2027,
    mehrAb2027: monatlicherZuschlagAb2027 - monatlicherZuschlag,
  };
}

export default function MuetterrenteRechner() {
  const [kinderVor1992, setKinderVor1992] = useState(2);
  const [kinderAb1992, setKinderAb1992] = useState(0);

  const ergebnis = useMemo(() => {
    return berechneZusatzrente(kinderVor1992, kinderAb1992);
  }, [kinderVor1992, kinderAb1992]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEP = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const gesamtKinder = kinderVor1992 + kinderAb1992;

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Mütterrente-Rechner 2025 & 2026" rechnerSlug="muetterrente-rechner" />

{/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Kinder vor 1992 */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Kinder vor 1992 geboren</span>
            <span className="text-xs text-gray-500 ml-2">(2,5 Entgeltpunkte pro Kind)</span>
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setKinderVor1992(Math.max(0, kinderVor1992 - 1))}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-2xl font-bold text-gray-600 transition-colors"
              disabled={kinderVor1992 === 0}
            >
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-4xl font-bold text-violet-600">{kinderVor1992}</span>
              <span className="text-gray-500 ml-2">Kinder</span>
            </div>
            <button
              onClick={() => setKinderVor1992(kinderVor1992 + 1)}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-violet-500 hover:bg-violet-600 text-2xl font-bold text-white transition-colors"
            >
              +
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={kinderVor1992}
            onChange={(e) => setKinderVor1992(Number(e.target.value))}
            className="w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
        </div>

        {/* Kinder ab 1992 */}
        <div>
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Kinder ab 1992 geboren</span>
            <span className="text-xs text-gray-500 ml-2">(3 Entgeltpunkte pro Kind)</span>
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setKinderAb1992(Math.max(0, kinderAb1992 - 1))}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-2xl font-bold text-gray-600 transition-colors"
              disabled={kinderAb1992 === 0}
            >
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-4xl font-bold text-violet-600">{kinderAb1992}</span>
              <span className="text-gray-500 ml-2">Kinder</span>
            </div>
            <button
              onClick={() => setKinderAb1992(kinderAb1992 + 1)}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-violet-500 hover:bg-violet-600 text-2xl font-bold text-white transition-colors"
            >
              +
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={kinderAb1992}
            onChange={(e) => setKinderAb1992(Number(e.target.value))}
            className="w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
        </div>
      </div>

      {/* Result Section */}
      {gesamtKinder > 0 ? (
        <>
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white mb-6">
            <h3 className="text-sm font-medium text-violet-100 mb-1">
              Zusätzliche Rente durch Kindererziehung
            </h3>
            
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">
                  {formatEuro(ergebnis.monatlicherZuschlag)}
                </span>
                <span className="text-xl text-violet-200">/ Monat</span>
              </div>
              <p className="text-violet-100 mt-2">
                = {formatEP(ergebnis.gesamtEntgeltpunkte)} Entgeltpunkte × {MUETTERRENTE_2026.rentenwert.toFixed(2)} € Rentenwert
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <span className="text-violet-100">Jährliche Zusatzrente</span>
                <span className="text-xl font-bold">{formatEuro(ergebnis.jaehrlicherZuschlag)}</span>
              </div>
            </div>
          </div>
{/* Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">📊 Aufschlüsselung</h3>
            <div className="space-y-3">
              {kinderVor1992 > 0 && (
                <div className="flex justify-between items-center p-4 bg-violet-50 rounded-xl">
                  <div>
                    <p className="font-bold text-gray-800">{kinderVor1992} Kind{kinderVor1992 > 1 ? 'er' : ''} vor 1992</p>
                    <p className="text-sm text-gray-500">{kinderVor1992} × 2,5 EP = {formatEP(ergebnis.entgeltpunkteVor1992)} Entgeltpunkte</p>
                  </div>
                  <span className="text-xl font-bold text-violet-600">
                    {formatEuro(ergebnis.entgeltpunkteVor1992 * MUETTERRENTE_2026.rentenwert)}
                  </span>
                </div>
              )}
              
              {kinderAb1992 > 0 && (
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl">
                  <div>
                    <p className="font-bold text-gray-800">{kinderAb1992} Kind{kinderAb1992 > 1 ? 'er' : ''} ab 1992</p>
                    <p className="text-sm text-gray-500">{kinderAb1992} × 3 EP = {formatEP(ergebnis.entgeltpunkteAb1992)} Entgeltpunkte</p>
                  </div>
                  <span className="text-xl font-bold text-purple-600">
                    {formatEuro(ergebnis.entgeltpunkteAb1992 * MUETTERRENTE_2026.rentenwert)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Mütterrente III Prognose */}
          {kinderVor1992 > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                Mütterrente III ab 2027
              </h3>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-green-800 mb-3">
                  Ab <strong>1. Januar 2027</strong> werden Kindererziehungszeiten für vor 1992 geborene 
                  Kinder auf <strong>3 Entgeltpunkte</strong> angehoben (derzeit 2,5).
                </p>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-700">Ihr Zuschlag ab 2027</span>
                  <span className="text-xl font-bold text-green-600">{formatEuro(ergebnis.monatlicherZuschlagAb2027)}/Monat</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg mt-2">
                  <span className="text-green-700 font-medium">Zusätzlich pro Monat</span>
                  <span className="text-lg font-bold text-green-600">+{formatEuro(ergebnis.mehrAb2027)}</span>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-center">
          <span className="text-6xl mb-4 block">👶</span>
          <p className="text-gray-600">
            Geben Sie die Anzahl Ihrer Kinder ein, um die zusätzliche Rente durch Kindererziehungszeiten zu berechnen.
          </p>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Mütterrente</h3>
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex gap-2">
            <span className="text-violet-500">✓</span>
            <span>
              <strong>Kindererziehungszeiten</strong> werden als Beitragszeit in der Rentenversicherung anerkannt
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">✓</span>
            <span>
              <strong>Vor 1992 geborene Kinder:</strong> 2,5 Entgeltpunkte (30 Monate) – ab 2027: 3 EP
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">✓</span>
            <span>
              <strong>Ab 1992 geborene Kinder:</strong> 3 Entgeltpunkte (36 Monate = 3 Jahre)
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">✓</span>
            <span>
              <strong>Aktueller Rentenwert 2025/26:</strong> {MUETTERRENTE_2026.rentenwert.toFixed(2)} € pro Entgeltpunkt (bundeseinheitlich seit 01.07.2025)
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-violet-500">✓</span>
            <span>
              <strong>Anrechnung:</strong> Die Zeiten werden automatisch berücksichtigt, wenn Sie sie bei der Rentenversicherung angemeldet haben
            </span>
          </li>
        </ul>
      </div>

      {/* Wer bekommt die Mütterrente? */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">👨‍👩‍👧 Wer bekommt die Mütterrente?</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-violet-50 rounded-xl">
            <span className="text-xl">👩</span>
            <div>
              <p className="font-medium text-violet-800">Mütter (und Väter!)</p>
              <p className="text-violet-700">Die Kindererziehungszeiten können grundsätzlich auch Vätern angerechnet werden, wenn sie die Erziehung überwiegend übernommen haben.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-medium text-blue-800">Voraussetzungen</p>
              <p className="text-blue-700">
                • Kind muss in Deutschland geboren sein (oder EU/EWR mit deutschem Rentenanspruch)<br/>
                • Erziehung während der ersten 2,5 bzw. 3 Lebensjahre überwiegend selbst übernommen<br/>
                • Kindererziehungszeiten bei der DRV angemeldet
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-violet-50 rounded-xl p-4">
            <p className="font-semibold text-violet-900">Deutsche Rentenversicherung</p>
            <p className="text-sm text-violet-700 mt-1">Die Kindererziehungszeiten werden automatisch berücksichtigt, wenn Sie diese bei der Kontenklärung angegeben haben.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Service-Telefon</p>
                <a href="tel:08001000480" className="text-blue-600 hover:underline">0800 1000 480</a>
                <p className="text-xs text-gray-500 mt-1">kostenfrei, Mo-Do 7:30-19:30, Fr 7:30-15:30</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Online-Dienste</p>
                <a 
                  href="https://www.deutsche-rentenversicherung.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  deutsche-rentenversicherung.de →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Wichtige Hinweise</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium text-yellow-800">Kontenklärung durchführen!</p>
              <p className="text-yellow-700">Prüfen Sie, ob Ihre Kindererziehungszeiten vollständig in Ihrem Rentenkonto erfasst sind. Eine Kontenklärung ist jederzeit kostenlos möglich.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">💡</span>
            <div>
              <p className="font-medium text-blue-800">Automatische Anrechnung für Rentner</p>
              <p className="text-blue-700">Wenn Sie bereits Rente beziehen, werden die Verbesserungen durch die Mütterrente automatisch berücksichtigt. Sie müssen keinen Antrag stellen.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">👪</span>
            <div>
              <p className="font-medium text-green-800">Auch Adoptiv- und Pflegekinder</p>
              <p className="text-green-700">Kindererziehungszeiten können auch für Adoptiv- und Pflegekinder angerechnet werden, wenn Sie sie in den ersten Lebensjahren überwiegend erzogen haben.</p>
            </div>
          </div>
        </div>
      </div>
{/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Rechtsgrundlagen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Allgemeine-Informationen/Wissenswertes-zur-Rente/FAQs/Rente/Muetterrente_KEZ/KEZ_Muetterrente-III.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsche Rentenversicherung – Mütterrente III FAQs
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/sgb_6/__56.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 56 SGB VI – Kindererziehungszeiten
          </a>
          <p className="text-xs text-gray-500 mt-2">
            Rentenwert ab 01.07.2025: 40,79 € (bundeseinheitlich) | Stand: Januar 2026
          </p>
        </div>
      </div>
    </div>
  );
}
