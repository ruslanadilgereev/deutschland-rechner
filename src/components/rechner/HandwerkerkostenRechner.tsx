import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// ═══════════════════════════════════════════════════════════════════════════════
// Handwerkerkosten-Rechner (§35a EStG) - Offizielle Berechnung
// ═══════════════════════════════════════════════════════════════════════════════
//
// RECHTSGRUNDLAGE: § 35a EStG (Steuerermäßigung bei Aufwendungen für
// haushaltsnahe Beschäftigungsverhältnisse, haushaltsnahe Dienstleistungen
// und Handwerkerleistungen)
//
// OFFIZIELLE REGELUNG (§35a Abs. 3 EStG):
// - 20% der ARBEITSKOSTEN (nicht Materialkosten!)
// - Höchstens 1.200€ Steuerermäßigung (= max. 6.000€ anrechenbare Kosten)
// - Für Renovierungs-, Erhaltungs- und Modernisierungsmaßnahmen
// - Nicht für öffentlich geförderte Maßnahmen (KfW, BAFA etc.)
//
// VORAUSSETZUNGEN:
// - Rechnung erforderlich (getrennte Ausweisung Arbeits-/Materialkosten)
// - Zahlung per Überweisung (KEINE Barzahlung!)
// - Im eigenen Haushalt (EU/EWR)
// - Nicht als Betriebsausgaben/Werbungskosten abziehbar
//
// ZUSÄTZLICH ABSETZBAR (§35a Abs. 1 + 2):
// - Haushaltsnahe Dienstleistungen: 20%, max. 4.000€
// - Minijob-Haushaltshilfe: 20%, max. 510€
//
// QUELLEN:
// - §35a EStG: https://www.gesetze-im-internet.de/estg/__35a.html
// - BMF-Schreiben: 09.11.2016 (BStBl I S. 1213)
// - https://esth.bundesfinanzministerium.de
// ═══════════════════════════════════════════════════════════════════════════════

// Offizielle Höchstbeträge nach §35a EStG
const HANDWERKER_PROZENT = 0.20; // 20% der Arbeitskosten
const HANDWERKER_MAX_ERMAESSIGUNG = 1200; // Max. 1.200€ Steuerermäßigung
const HANDWERKER_MAX_KOSTEN = 6000; // = 1.200€ / 20%

const DIENSTLEISTUNG_PROZENT = 0.20;
const DIENSTLEISTUNG_MAX_ERMAESSIGUNG = 4000; // Max. 4.000€
const DIENSTLEISTUNG_MAX_KOSTEN = 20000;

const MINIJOB_PROZENT = 0.20;
const MINIJOB_MAX_ERMAESSIGUNG = 510; // Max. 510€
const MINIJOB_MAX_KOSTEN = 2550;

// Beispiel-Handwerkerleistungen
const BEISPIEL_ARBEITEN = [
  { name: 'Malerarbeiten', icon: '🎨', beispiel: '2.500€ Arbeit' },
  { name: 'Sanitär/Heizung', icon: '🔧', beispiel: '1.800€ Arbeit' },
  { name: 'Elektroarbeiten', icon: '⚡', beispiel: '1.200€ Arbeit' },
  { name: 'Gartenpflege', icon: '🌳', beispiel: '800€ Arbeit' },
  { name: 'Schornsteinfeger', icon: '🧹', beispiel: '150€ Arbeit' },
  { name: 'Dach/Fassade', icon: '🏠', beispiel: '3.000€ Arbeit' },
];

export default function HandwerkerkostenRechner() {
  // Eingabewerte
  const [handwerkerArbeitskosten, setHandwerkerArbeitskosten] = useState(3000);
  const [handwerkerMaterialkosten, setHandwerkerMaterialkosten] = useState(2000);
  const [dienstleistungskosten, setDienstleistungskosten] = useState(0);
  const [minijobKosten, setMinijobKosten] = useState(0);
  const [zeigeAlleKategorien, setZeigeAlleKategorien] = useState(false);

  const ergebnis = useMemo(() => {
    // Handwerkerleistungen (§35a Abs. 3)
    const handwerkerAnrechenbar = Math.min(handwerkerArbeitskosten, HANDWERKER_MAX_KOSTEN);
    const handwerkerErmaessigung = Math.min(
      handwerkerAnrechenbar * HANDWERKER_PROZENT,
      HANDWERKER_MAX_ERMAESSIGUNG
    );
    const handwerkerNichtAnrechenbar = Math.max(0, handwerkerArbeitskosten - HANDWERKER_MAX_KOSTEN);
    const handwerkerMaxAusgeschoepft = handwerkerArbeitskosten >= HANDWERKER_MAX_KOSTEN;

    // Haushaltsnahe Dienstleistungen (§35a Abs. 2)
    const dienstleistungAnrechenbar = Math.min(dienstleistungskosten, DIENSTLEISTUNG_MAX_KOSTEN);
    const dienstleistungErmaessigung = Math.min(
      dienstleistungAnrechenbar * DIENSTLEISTUNG_PROZENT,
      DIENSTLEISTUNG_MAX_ERMAESSIGUNG
    );

    // Minijob-Haushaltshilfe (§35a Abs. 1)
    const minijobAnrechenbar = Math.min(minijobKosten, MINIJOB_MAX_KOSTEN);
    const minijobErmaessigung = Math.min(
      minijobAnrechenbar * MINIJOB_PROZENT,
      MINIJOB_MAX_ERMAESSIGUNG
    );

    // Gesamtsummen
    const gesamtkosten = handwerkerArbeitskosten + handwerkerMaterialkosten + 
                         dienstleistungskosten + minijobKosten;
    const gesamtErmaessigung = handwerkerErmaessigung + dienstleistungErmaessigung + minijobErmaessigung;
    
    // Theoretisches Maximum (alle drei Kategorien ausgeschöpft)
    const maxMoeglich = HANDWERKER_MAX_ERMAESSIGUNG + DIENSTLEISTUNG_MAX_ERMAESSIGUNG + MINIJOB_MAX_ERMAESSIGUNG;

    // Wie viel Potenzial bleibt?
    const verbleibendesHandwerkerPotenzial = HANDWERKER_MAX_ERMAESSIGUNG - handwerkerErmaessigung;

    return {
      handwerkerArbeitskosten,
      handwerkerMaterialkosten,
      handwerkerAnrechenbar,
      handwerkerErmaessigung,
      handwerkerNichtAnrechenbar,
      handwerkerMaxAusgeschoepft,
      dienstleistungAnrechenbar,
      dienstleistungErmaessigung,
      minijobAnrechenbar,
      minijobErmaessigung,
      gesamtkosten,
      gesamtErmaessigung,
      maxMoeglich,
      verbleibendesHandwerkerPotenzial,
    };
  }, [handwerkerArbeitskosten, handwerkerMaterialkosten, dienstleistungskosten, minijobKosten]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }) + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🔧</span>
          Handwerkerleistungen (§35a Abs. 3 EStG)
        </h3>
        
        {/* Arbeitskosten */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">
              Arbeitskosten (nur Lohn, keine Materialien)
            </span>
            <span className="text-xs text-gray-500 block mt-1">
              Nur Arbeitskosten sind absetzbar – Materialkosten werden abgezogen!
            </span>
          </label>
          
          <div className="relative">
            <input
              type="number"
              value={handwerkerArbeitskosten}
              onChange={(e) => setHandwerkerArbeitskosten(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="50000"
              step="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          
          <input
            type="range"
            value={handwerkerArbeitskosten}
            onChange={(e) => setHandwerkerArbeitskosten(Number(e.target.value))}
            className="w-full mt-3 accent-orange-500"
            min="0"
            max="15000"
            step="100"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span className="text-orange-600 font-medium">Max. 6.000 € anrechenbar</span>
            <span>15.000 €</span>
          </div>
          
          {ergebnis.handwerkerMaxAusgeschoepft && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                ⚠️ <strong>Maximum erreicht:</strong> {formatEuro(ergebnis.handwerkerNichtAnrechenbar)} überschreiten 
                die Grenze von 6.000€ und sind nicht absetzbar.
              </p>
            </div>
          )}
        </div>

        {/* Materialkosten (nur zur Info) */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">
              Materialkosten (nicht absetzbar)
            </span>
            <span className="text-xs text-gray-500 block mt-1">
              Farbe, Fliesen, Rohre etc. – zur Dokumentation Ihrer Gesamtkosten
            </span>
          </label>
          
          <div className="relative">
            <input
              type="number"
              value={handwerkerMaterialkosten}
              onChange={(e) => setHandwerkerMaterialkosten(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-medium text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-gray-400 focus:ring-0 outline-none bg-gray-50"
              min="0"
              max="50000"
              step="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Tipp: Lassen Sie Arbeits- und Materialkosten auf der Rechnung getrennt ausweisen!
          </p>
        </div>

        {/* Beispiele für Handwerkerleistungen */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Typische Handwerkerleistungen:</p>
          <div className="grid grid-cols-3 gap-2">
            {BEISPIEL_ARBEITEN.map((arbeit) => (
              <div
                key={arbeit.name}
                className="p-2 bg-gray-50 rounded-lg text-center text-xs"
              >
                <span className="text-lg">{arbeit.icon}</span>
                <p className="font-medium text-gray-700 mt-1">{arbeit.name}</p>
                <p className="text-gray-500">{arbeit.beispiel}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Toggle für weitere Kategorien */}
        <button
          onClick={() => setZeigeAlleKategorien(!zeigeAlleKategorien)}
          className={`w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-between ${
            zeigeAlleKategorien
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span>Weitere Kategorien (Haushaltshilfe, Dienstleistungen)</span>
          <span>{zeigeAlleKategorien ? '▲' : '▼'}</span>
        </button>

        {/* Weitere Kategorien */}
        {zeigeAlleKategorien && (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl space-y-6">
            {/* Haushaltsnahe Dienstleistungen */}
            <div>
              <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <span>🧹</span>
                Haushaltsnahe Dienstleistungen (§35a Abs. 2)
              </h4>
              <p className="text-xs text-blue-600 mb-2">
                Putzhilfe, Gärtner, Pflegedienst, Betreuungskosten (max. 4.000€ Ermäßigung)
              </p>
              <div className="relative">
                <input
                  type="number"
                  value={dienstleistungskosten}
                  onChange={(e) => setDienstleistungskosten(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xl font-medium text-center py-2 px-4 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none bg-white"
                  min="0"
                  max="30000"
                  step="100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Jahr</span>
              </div>
            </div>

            {/* Minijob-Haushaltshilfe */}
            <div>
              <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <span>👩‍🏠</span>
                Minijob-Haushaltshilfe (§35a Abs. 1)
              </h4>
              <p className="text-xs text-blue-600 mb-2">
                Geringfügig beschäftigte Haushaltshilfe (max. 510€ Ermäßigung)
              </p>
              <div className="relative">
                <input
                  type="number"
                  value={minijobKosten}
                  onChange={(e) => setMinijobKosten(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xl font-medium text-center py-2 px-4 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none bg-white"
                  min="0"
                  max="6000"
                  step="50"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Jahr</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Result Section */}
      <div className="rounded-2xl shadow-lg p-6 text-white mb-6 bg-gradient-to-br from-orange-500 to-red-600">
        <h3 className="text-sm font-medium opacity-80 mb-1">
          🔧 Ihre Steuerermäßigung nach §35a EStG
        </h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.gesamtErmaessigung)}</span>
            <span className="text-xl opacity-80">Steuerermäßigung</span>
          </div>
          <p className="text-orange-100 mt-2 text-sm">
            Direkt abzugsfähig von Ihrer Einkommensteuer!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Anrechenbare Kosten</span>
            <div className="text-xl font-bold">
              {formatEuro(ergebnis.handwerkerAnrechenbar + ergebnis.dienstleistungAnrechenbar + ergebnis.minijobAnrechenbar)}
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Erstattungssatz</span>
            <div className="text-xl font-bold">20%</div>
          </div>
        </div>

        {ergebnis.verbleibendesHandwerkerPotenzial > 0 && handwerkerArbeitskosten > 0 && (
          <div className="mt-4 p-3 bg-white/20 rounded-xl">
            <p className="text-sm">
              💡 <strong>Noch Potenzial:</strong> Sie können noch weitere {formatEuro(ergebnis.verbleibendesHandwerkerPotenzial)} 
              Ermäßigung (= {formatEuro(ergebnis.verbleibendesHandwerkerPotenzial / 0.2)} Arbeitskosten) nutzen!
            </p>
          </div>
        )}
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>

        <div className="space-y-3 text-sm">
          {/* Handwerkerleistungen */}
          <div className="p-4 bg-orange-50 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-orange-800">🔧 Handwerkerleistungen</span>
              <span className="font-bold text-orange-900">{formatEuro(ergebnis.handwerkerErmaessigung)}</span>
            </div>
            <div className="space-y-1 text-orange-700 text-xs">
              <div className="flex justify-between">
                <span>Ihre Arbeitskosten:</span>
                <span>{formatEuro(handwerkerArbeitskosten)}</span>
              </div>
              <div className="flex justify-between">
                <span>Davon anrechenbar (max. 6.000€):</span>
                <span>{formatEuro(ergebnis.handwerkerAnrechenbar)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>× 20% Ermäßigung:</span>
                <span>{formatEuro(ergebnis.handwerkerErmaessigung)}</span>
              </div>
            </div>
          </div>

          {/* Materialkosten-Hinweis */}
          {handwerkerMaterialkosten > 0 && (
            <div className="p-3 bg-gray-100 rounded-xl">
              <div className="flex justify-between text-gray-600">
                <span>📦 Materialkosten (nicht absetzbar):</span>
                <span className="line-through">{formatEuro(handwerkerMaterialkosten)}</span>
              </div>
            </div>
          )}

          {/* Haushaltsnahe Dienstleistungen */}
          {dienstleistungskosten > 0 && (
            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-blue-800">🧹 Haushaltsnahe Dienstleistungen</span>
                <span className="font-bold text-blue-900">{formatEuro(ergebnis.dienstleistungErmaessigung)}</span>
              </div>
              <div className="space-y-1 text-blue-700 text-xs">
                <div className="flex justify-between">
                  <span>Ihre Kosten:</span>
                  <span>{formatEuro(dienstleistungskosten)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>× 20% (max. 4.000€):</span>
                  <span>{formatEuro(ergebnis.dienstleistungErmaessigung)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Minijob */}
          {minijobKosten > 0 && (
            <div className="p-4 bg-purple-50 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-purple-800">👩‍🏠 Minijob-Haushaltshilfe</span>
                <span className="font-bold text-purple-900">{formatEuro(ergebnis.minijobErmaessigung)}</span>
              </div>
              <div className="space-y-1 text-purple-700 text-xs">
                <div className="flex justify-between">
                  <span>Ihre Kosten:</span>
                  <span>{formatEuro(minijobKosten)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>× 20% (max. 510€):</span>
                  <span>{formatEuro(ergebnis.minijobErmaessigung)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Gesamtergebnis */}
          <div className="flex justify-between py-3 bg-green-100 -mx-6 px-6 rounded-b-xl">
            <span className="font-bold text-green-800">
              = Gesamt-Steuerermäßigung
            </span>
            <span className="font-bold text-2xl text-green-900">
              {formatEuro(ergebnis.gesamtErmaessigung)}
            </span>
          </div>
        </div>
      </div>

      {/* Höchstbeträge Übersicht */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Höchstbeträge nach §35a EStG</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔧</span>
              <div>
                <p className="font-medium text-gray-800">Handwerkerleistungen</p>
                <p className="text-xs text-gray-500">Renovierung, Erhaltung, Modernisierung</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">max. 1.200€</p>
              <p className="text-xs text-gray-500">(= 6.000€ Arbeitskosten)</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧹</span>
              <div>
                <p className="font-medium text-gray-800">Haushaltsnahe Dienstleistungen</p>
                <p className="text-xs text-gray-500">Reinigung, Garten, Pflege</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">max. 4.000€</p>
              <p className="text-xs text-gray-500">(= 20.000€ Kosten)</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👩‍🏠</span>
              <div>
                <p className="font-medium text-gray-800">Minijob-Haushaltshilfe</p>
                <p className="text-xs text-gray-500">Geringfügige Beschäftigung</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">max. 510€</p>
              <p className="text-xs text-gray-500">(= 2.550€ Kosten)</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-green-100 rounded-xl border-2 border-green-300">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <p className="font-bold text-green-800">Theoretisches Maximum</p>
                <p className="text-xs text-green-700">Alle drei Kategorien kombiniert</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-xl text-green-900">max. 5.710€</p>
              <p className="text-xs text-green-700">pro Jahr</p>
            </div>
          </div>
        </div>
      </div>

      {/* Was ist absetzbar? */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">✅ Was ist absetzbar?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-xl">
            <h4 className="font-semibold text-green-800 mb-2">✓ Absetzbar:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Malerarbeiten (Arbeitskosten)</li>
              <li>• Fliesenlegen (Arbeitskosten)</li>
              <li>• Sanitärinstallation (Arbeitskosten)</li>
              <li>• Elektroarbeiten (Arbeitskosten)</li>
              <li>• Teppichverlegen (Arbeitskosten)</li>
              <li>• Dachdeckerarbeiten (Arbeitskosten)</li>
              <li>• Schornsteinfeger</li>
              <li>• Gartenarbeiten</li>
              <li>• Fensterreinigung</li>
              <li>• Hausmeisterdienste</li>
            </ul>
          </div>
          
          <div className="p-4 bg-red-50 rounded-xl">
            <h4 className="font-semibold text-red-800 mb-2">✗ Nicht absetzbar:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Materialkosten (Farbe, Fliesen etc.)</li>
              <li>• Neubaumaßnahmen</li>
              <li>• Geförderte Maßnahmen (KfW, BAFA)</li>
              <li>• Barzahlungen</li>
              <li>• Arbeiten außerhalb des Haushalts</li>
              <li>• Gutachterkosten</li>
              <li>• Architektenleistungen (Planung)</li>
              <li>• Anlieferungskosten</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Rechnung erforderlich:</strong> Sie benötigen eine ordnungsgemäße 
              Rechnung mit getrennter Ausweisung von Arbeits- und Materialkosten.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Überweisung Pflicht:</strong> Barzahlungen werden NICHT anerkannt! 
              Bezahlen Sie per Überweisung und heben Sie den Beleg auf.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Eigener Haushalt:</strong> Die Arbeiten müssen in Ihrem eigenen 
              Haushalt (Wohnung, Haus, Grundstück) in der EU/EWR stattfinden.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Keine Doppelförderung:</strong> Bereits durch KfW, BAFA oder andere 
              Förderprogramme bezuschusste Maßnahmen sind NICHT absetzbar.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Jahr der Zahlung:</strong> Es gilt das Jahr der Zahlung – nicht 
              das Jahr der Rechnungsstellung oder Fertigstellung.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Zusammenveranlagung:</strong> Bei Ehepaaren gelten die Höchstbeträge 
              gemeinsam – nicht doppelt!
            </span>
          </li>
        </ul>
      </div>

      {/* Steuer-Tipp */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-blue-800 mb-3">💡 Steuer-Tipps</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Rechnung aufteilen:</strong> Bitten Sie den Handwerker, Arbeitskosten 
              und Materialkosten getrennt auszuweisen – nur so können Sie absetzen!
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Jahresende nutzen:</strong> Haben Sie noch nicht alle 6.000€ 
              Arbeitskosten ausgeschöpft? Verschieben Sie Zahlungen ggf. ins alte Jahr.
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Alle Kategorien nutzen:</strong> Sie können Handwerker (1.200€), 
              Dienstleistungen (4.000€) UND Minijob (510€) parallel nutzen = bis zu 5.710€!
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Nebenkostenabrechnung prüfen:</strong> Auch Hausmeister- und 
              Gärtnerkosten aus der Nebenkostenabrechnung können absetzbar sein!
            </span>
          </li>
        </ul>
      </div>

      {/* Beispielrechnung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📝 Beispielrechnung</h3>
        
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="font-semibold mb-3">
            Familie Müller lässt das Bad renovieren:
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Gesamtkosten Badezimmer-Sanierung:</span>
              <span className="font-medium">12.000 €</span>
            </div>
            <div className="flex justify-between py-1 pl-4">
              <span className="text-gray-500">→ davon Fliesen, Armaturen, Material:</span>
              <span className="text-gray-500 line-through">5.000 €</span>
            </div>
            <div className="flex justify-between py-1 pl-4 text-orange-700">
              <span>→ davon Arbeitskosten (absetzbar):</span>
              <span className="font-medium">7.000 €</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Davon anrechenbar (max. 6.000€):</span>
              <span className="font-medium">6.000 €</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">× 20% Steuerermäßigung:</span>
              <span className="font-medium">= 1.200 €</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between py-2 bg-green-100 -mx-4 px-4 rounded-lg">
              <span className="font-bold text-green-800">Steuerersparnis:</span>
              <span className="font-bold text-xl text-green-800">1.200 €</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * 1.000€ Arbeitskosten verfallen, da sie das Maximum überschreiten.
            </p>
          </div>
        </div>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-orange-50 rounded-xl p-4">
            <p className="font-semibold text-orange-900">Finanzamt</p>
            <p className="text-sm text-orange-700 mt-1">
              Die Steuerermäßigung nach §35a EStG wird in der Einkommensteuererklärung 
              geltend gemacht (Anlage Haushaltsnahe Aufwendungen).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📱</span>
              <div>
                <p className="font-medium text-gray-800">ELSTER Online</p>
                <a
                  href="https://www.elster.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  elster.de →
                </a>
                <p className="text-gray-500 text-xs mt-1">
                  Steuererklärung online einreichen
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🏢</span>
              <div>
                <p className="font-medium text-gray-800">Finanzamt vor Ort</p>
                <a
                  href="https://www.bzst.de/DE/Service/Finanzamtsuche/finanzamtsuche_node.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Finanzamt-Suche →
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-medium text-gray-800">In der Steuererklärung eintragen</p>
              <ul className="text-gray-600 mt-1 space-y-1">
                <li>• Hauptvordruck, Zeilen 4-7 (bis 2018: Mantelbogen)</li>
                <li>• Oder: Anlage "Haushaltsnahe Aufwendungen"</li>
                <li>• Rechnungen und Überweisungsbelege aufbewahren!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Weiterführende Links */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-blue-800 mb-3">
          🔗 Das könnte Sie auch interessieren
        </h3>
        <div className="flex flex-wrap gap-3">
          <a
            href="/einkommensteuer-rechner"
            className="inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            🧾 Einkommensteuer-Rechner →
          </a>
          <a
            href="/grundsteuer-rechner"
            className="inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            🏡 Grundsteuer-Rechner →
          </a>
          <a
            href="/homeoffice-pauschale-rechner"
            className="inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            🏡 Homeoffice-Pauschale-Rechner →
          </a>
        </div>
      </div>

            <RechnerFeedback rechnerName="Handwerkerkosten-Rechner 2025 & 2026" rechnerSlug="handwerkerkosten-rechner" />

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
          Quellen & Rechtsgrundlagen
        </h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/estg/__35a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline font-medium"
          >
            ★ § 35a EStG – Steuerermäßigung bei haushaltsnahen Aufwendungen
          </a>
          <a
            href="https://esth.bundesfinanzministerium.de/esth/2020/A-Einkommensteuergesetz/V-Steuerermaessigungen/4-Steuerermaessigung-bei-Aufwendungen-fuer-haushaltsnahe-Beschaeftigungsverhaeltnisse/Paragraf-35a/inhalt.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF – Amtliches Einkommensteuer-Handbuch §35a
          </a>
          <a
            href="https://www.lohnsteuer-kompakt.de/texte/2025/87/handwerkerleistungen"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Lohnsteuer kompakt – Handwerkerleistungen absetzen
          </a>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          <strong>Offizielle Berechnung nach §35a Abs. 3 EStG:</strong><br/>
          Steuerermäßigung = Arbeitskosten × 20% (max. 1.200€)
        </p>
      </div>
    </div>
  );
}
