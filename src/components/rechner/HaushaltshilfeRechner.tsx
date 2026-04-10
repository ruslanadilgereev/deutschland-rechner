import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// ═══════════════════════════════════════════════════════════════════════════════
// Haushaltshilfe-Rechner (§35a EStG) - Offizielle Berechnung
// ═══════════════════════════════════════════════════════════════════════════════
//
// RECHTSGRUNDLAGE: § 35a EStG (Steuerermäßigung bei Aufwendungen für
// haushaltsnahe Beschäftigungsverhältnisse und haushaltsnahe Dienstleistungen)
//
// §35a Abs. 1 - MINIJOB-HAUSHALTSHILFE:
// - Geringfügig beschäftigte Haushaltshilfe (direkt angestellt)
// - 20% der Kosten, max. 510€ Steuerermäßigung
// - Anmeldung über Haushaltsscheckverfahren (Minijob-Zentrale)
//
// §35a Abs. 2 - HAUSHALTSNAHE DIENSTLEISTUNGEN:
// - Leistungen von Unternehmen/Selbstständigen (Rechnung)
// - 20% der Kosten, max. 4.000€ Steuerermäßigung
// - Reinigung, Pflege, Gartenpflege, Betreuung etc.
//
// VORAUSSETZUNGEN:
// - Im eigenen Haushalt (EU/EWR)
// - Zahlung per Überweisung (KEINE Barzahlung!)
// - Nicht als Betriebsausgaben/Werbungskosten abziehbar
//
// QUELLEN:
// - §35a EStG: https://www.gesetze-im-internet.de/estg/__35a.html
// - BMF-Schreiben: 09.11.2016 (BStBl I S. 1213)
// - Minijob-Zentrale: https://www.minijob-zentrale.de/DE/01_haushaltsjobs
// ═══════════════════════════════════════════════════════════════════════════════

// Offizielle Höchstbeträge nach §35a EStG
const DIENSTLEISTUNG_PROZENT = 0.20; // 20%
const DIENSTLEISTUNG_MAX_ERMAESSIGUNG = 4000; // Max. 4.000€
const DIENSTLEISTUNG_MAX_KOSTEN = 20000; // = 4.000€ / 20%

const MINIJOB_PROZENT = 0.20; // 20%
const MINIJOB_MAX_ERMAESSIGUNG = 510; // Max. 510€
const MINIJOB_MAX_KOSTEN = 2550; // = 510€ / 20%

// Minijob Arbeitgeber-Abgaben (Haushaltsscheckverfahren)
const MINIJOB_GRENZE_2026 = 603;
const MINIJOB_PAUSCHALE_RV = 0.05; // 5% Rentenversicherung
const MINIJOB_PAUSCHALE_KV = 0.05; // 5% Krankenversicherung
const MINIJOB_PAUSCHALE_UV = 0.016; // 1,6% Unfallversicherung
const MINIJOB_PAUSCHALE_STEUER = 0.02; // 2% Pauschalsteuer
const MINIJOB_UMLAGE_U1 = 0.008; // 0,8% U1 (Krankheit) - Minijob-Zentrale
const MINIJOB_UMLAGE_U2 = 0.0022; // 0,22% U2 (Mutterschaft) - Minijob-Zentrale

// Typische Dienstleistungen
const BEISPIEL_DIENSTLEISTUNGEN = [
  { name: 'Reinigung/Putzhilfe', icon: '🧹', beispiel: '~150€/Monat', monthly: 150 },
  { name: 'Gartenpflege', icon: '🌳', beispiel: '~100€/Monat', monthly: 100 },
  { name: 'Kinderbetreuung', icon: '👶', beispiel: '~200€/Monat', monthly: 200 },
  { name: 'Pflegedienst', icon: '🏥', beispiel: '~500€/Monat', monthly: 500 },
  { name: 'Hausmeisterdienste', icon: '🔧', beispiel: '~80€/Monat', monthly: 80 },
  { name: 'Winterdienst', icon: '❄️', beispiel: '~50€/Monat', monthly: 50 },
];

type Beschaeftigungsart = 'dienstleistung' | 'minijob' | 'beide';

export default function HaushaltshilfeRechner() {
  // Eingabewerte
  const [beschaeftigungsart, setBeschaeftigungsart] = useState<Beschaeftigungsart>('dienstleistung');
  const [monatlicheKostenDL, setMonatlicheKostenDL] = useState(250);
  const [minijobBruttolohn, setMinijobBruttolohn] = useState(400);
  const [minijobStunden, setMinijobStunden] = useState(10);
  const [zeigeMonatlich, setZeigeMonatlich] = useState(true);

  const ergebnis = useMemo(() => {
    // Haushaltsnahe Dienstleistungen (§35a Abs. 2)
    const jahresKostenDL = monatlicheKostenDL * 12;
    const dlAnrechenbar = Math.min(jahresKostenDL, DIENSTLEISTUNG_MAX_KOSTEN);
    const dlErmaessigung = Math.min(
      dlAnrechenbar * DIENSTLEISTUNG_PROZENT,
      DIENSTLEISTUNG_MAX_ERMAESSIGUNG
    );
    const dlNichtAnrechenbar = Math.max(0, jahresKostenDL - DIENSTLEISTUNG_MAX_KOSTEN);
    const dlMaxAusgeschoepft = jahresKostenDL >= DIENSTLEISTUNG_MAX_KOSTEN;

    // Minijob-Haushaltshilfe (§35a Abs. 1)
    // Arbeitgeber-Gesamtkosten berechnen
    const jahresBruttolohn = minijobBruttolohn * 12;
    const arbeitgeberAbgabenSatz = 
      MINIJOB_PAUSCHALE_RV + 
      MINIJOB_PAUSCHALE_KV + 
      MINIJOB_PAUSCHALE_UV + 
      MINIJOB_PAUSCHALE_STEUER + 
      MINIJOB_UMLAGE_U1 + 
      MINIJOB_UMLAGE_U2;
    const arbeitgeberAbgaben = jahresBruttolohn * arbeitgeberAbgabenSatz;
    const minijobGesamtkosten = jahresBruttolohn + arbeitgeberAbgaben;
    
    const minijobAnrechenbar = Math.min(minijobGesamtkosten, MINIJOB_MAX_KOSTEN);
    const minijobErmaessigung = Math.min(
      minijobAnrechenbar * MINIJOB_PROZENT,
      MINIJOB_MAX_ERMAESSIGUNG
    );
    const minijobMaxAusgeschoepft = minijobGesamtkosten >= MINIJOB_MAX_KOSTEN;

    // Berechnung je nach Beschäftigungsart
    let gesamtkosten = 0;
    let gesamtErmaessigung = 0;
    let effektiveKosten = 0;

    if (beschaeftigungsart === 'dienstleistung') {
      gesamtkosten = jahresKostenDL;
      gesamtErmaessigung = dlErmaessigung;
    } else if (beschaeftigungsart === 'minijob') {
      gesamtkosten = minijobGesamtkosten;
      gesamtErmaessigung = minijobErmaessigung;
    } else {
      gesamtkosten = jahresKostenDL + minijobGesamtkosten;
      gesamtErmaessigung = dlErmaessigung + minijobErmaessigung;
    }

    effektiveKosten = gesamtkosten - gesamtErmaessigung;

    // Stundenlohn-Berechnung für Minijob
    const jahresStunden = minijobStunden * 4.33 * 12; // ca. Stunden pro Jahr
    const effektiverStundenlohn = minijobBruttolohn > 0 && minijobStunden > 0
      ? (minijobGesamtkosten / 12) / (minijobStunden * 4.33)
      : 0;
    const effektiverStundenlohnNachSteuer = effektiverStundenlohn > 0
      ? effektiverStundenlohn * (1 - (minijobErmaessigung / minijobGesamtkosten))
      : 0;

    return {
      // Haushaltsnahe Dienstleistungen
      jahresKostenDL,
      dlAnrechenbar,
      dlErmaessigung,
      dlNichtAnrechenbar,
      dlMaxAusgeschoepft,
      // Minijob
      jahresBruttolohn,
      arbeitgeberAbgaben,
      arbeitgeberAbgabenSatz,
      minijobGesamtkosten,
      minijobAnrechenbar,
      minijobErmaessigung,
      minijobMaxAusgeschoepft,
      effektiverStundenlohn,
      effektiverStundenlohnNachSteuer,
      // Gesamt
      gesamtkosten,
      gesamtErmaessigung,
      effektiveKosten,
    };
  }, [beschaeftigungsart, monatlicheKostenDL, minijobBruttolohn, minijobStunden]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }) + ' €';

  const formatEuro2 = (n: number) =>
    n.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' €';

  const formatProzent = (n: number) =>
    (n * 100).toLocaleString('de-DE', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }) + ' %';

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Haushaltshilfe-Rechner 2025 & 2026" rechnerSlug="haushaltshilfe-rechner" />

{/* Art der Beschäftigung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🏠</span>
          Art der Haushaltshilfe
        </h3>

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => setBeschaeftigungsart('dienstleistung')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              beschaeftigungsart === 'dienstleistung'
                ? 'border-teal-500 bg-teal-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧹</span>
              <div>
                <p className="font-semibold text-gray-800">Dienstleistungsunternehmen</p>
                <p className="text-xs text-gray-500">
                  Reinigungsfirma, Pflegedienst, Gärtner mit Rechnung (§35a Abs. 2)
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="font-bold text-teal-600">max. 4.000€</p>
                <p className="text-xs text-gray-500">Ermäßigung</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setBeschaeftigungsart('minijob')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              beschaeftigungsart === 'minijob'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">👩‍🏠</span>
              <div>
                <p className="font-semibold text-gray-800">Minijob-Haushaltshilfe</p>
                <p className="text-xs text-gray-500">
                  Selbst angestellt über Haushaltsscheckverfahren (§35a Abs. 1)
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="font-bold text-purple-600">max. 510€</p>
                <p className="text-xs text-gray-500">Ermäßigung</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setBeschaeftigungsart('beide')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              beschaeftigungsart === 'beide'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <p className="font-semibold text-gray-800">Beide Varianten kombiniert</p>
                <p className="text-xs text-gray-500">
                  Maximale Steuerermäßigung durch Kombination beider Kategorien
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="font-bold text-green-600">max. 4.510€</p>
                <p className="text-xs text-gray-500">Ermäßigung</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Haushaltsnahe Dienstleistungen Input */}
      {(beschaeftigungsart === 'dienstleistung' || beschaeftigungsart === 'beide') && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🧹</span>
            Haushaltsnahe Dienstleistungen
          </h3>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-gray-700 font-medium">
                Monatliche Kosten
              </label>
              <button
                onClick={() => setZeigeMonatlich(!zeigeMonatlich)}
                className="text-xs text-teal-600 hover:underline"
              >
                {zeigeMonatlich ? 'Jährlich anzeigen' : 'Monatlich anzeigen'}
              </button>
            </div>
            
            <div className="relative">
              <input
                type="number"
                value={monatlicheKostenDL}
                onChange={(e) => setMonatlicheKostenDL(Math.max(0, Number(e.target.value)))}
                className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none"
                min="0"
                max="3000"
                step="10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
            </div>

            <input
              type="range"
              value={monatlicheKostenDL}
              onChange={(e) => setMonatlicheKostenDL(Number(e.target.value))}
              className="w-full mt-3 accent-teal-500"
              min="0"
              max="2000"
              step="25"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0 €</span>
              <span className="text-teal-600 font-medium">
                = {formatEuro(monatlicheKostenDL * 12)}/Jahr
              </span>
              <span>2.000 €</span>
            </div>
          </div>

          {/* Schnellauswahl typische Dienstleistungen */}
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Typische Kosten:</p>
            <div className="grid grid-cols-3 gap-2">
              {BEISPIEL_DIENSTLEISTUNGEN.slice(0, 6).map((dl) => (
                <button
                  key={dl.name}
                  onClick={() => setMonatlicheKostenDL(dl.monthly)}
                  className="p-2 bg-gray-50 rounded-lg text-center text-xs hover:bg-teal-50 transition-colors"
                >
                  <span className="text-lg">{dl.icon}</span>
                  <p className="font-medium text-gray-700 mt-1">{dl.name}</p>
                  <p className="text-gray-500">{dl.beispiel}</p>
                </button>
              ))}
            </div>
          </div>

          {ergebnis.dlMaxAusgeschoepft && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                ⚠️ <strong>Maximum erreicht:</strong> Ab {formatEuro(DIENSTLEISTUNG_MAX_KOSTEN)}/Jahr 
                ist keine weitere Steuerermäßigung möglich (max. 4.000€).
              </p>
            </div>
          )}
        </div>
      )}

      {/* Minijob-Haushaltshilfe Input */}
      {(beschaeftigungsart === 'minijob' || beschaeftigungsart === 'beide') && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">👩‍🏠</span>
            Minijob-Haushaltshilfe
          </h3>

          <div className="mb-4">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">
                Monatlicher Bruttolohn
              </span>
              <span className="text-xs text-gray-500 block mt-1">
                Max. {formatEuro(MINIJOB_GRENZE_2026)}/Monat (Minijob-Grenze 2026)
              </span>
            </label>
            
            <div className="relative">
              <input
                type="number"
                value={minijobBruttolohn}
                onChange={(e) => setMinijobBruttolohn(Math.max(0, Math.min(MINIJOB_GRENZE_2026, Number(e.target.value))))}
                className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
                min="0"
                max={MINIJOB_GRENZE_2026}
                step="10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
            </div>

            <input
              type="range"
              value={minijobBruttolohn}
              onChange={(e) => setMinijobBruttolohn(Number(e.target.value))}
              className="w-full mt-3 accent-purple-500"
              min="0"
              max={MINIJOB_GRENZE_2026}
              step="10"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0 €</span>
              <span className="text-purple-600 font-medium">Minijob-Grenze</span>
              <span>{formatEuro(MINIJOB_GRENZE_2026)}</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">
                Arbeitsstunden pro Woche
              </span>
              <span className="text-xs text-gray-500 block mt-1">
                Zur Berechnung des effektiven Stundenlohns
              </span>
            </label>
            
            <div className="relative">
              <input
                type="number"
                value={minijobStunden}
                onChange={(e) => setMinijobStunden(Math.max(1, Math.min(20, Number(e.target.value))))}
                className="w-full text-xl font-medium text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
                min="1"
                max="20"
                step="1"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Std/Woche</span>
            </div>
          </div>

          {/* Arbeitgeber-Kosten Übersicht */}
          <div className="mt-4 p-4 bg-purple-50 rounded-xl">
            <h4 className="font-medium text-purple-800 mb-2">
              💰 Ihre Arbeitgeber-Gesamtkosten (pro Monat)
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-purple-700">
                <span>Bruttolohn:</span>
                <span>{formatEuro(minijobBruttolohn)}</span>
              </div>
              <div className="flex justify-between text-purple-600">
                <span>+ Arbeitgeber-Abgaben ({formatProzent(ergebnis.arbeitgeberAbgabenSatz)}):</span>
                <span>{formatEuro(ergebnis.arbeitgeberAbgaben / 12)}</span>
              </div>
              <hr className="border-purple-200 my-2" />
              <div className="flex justify-between font-bold text-purple-900">
                <span>= Gesamtkosten/Monat:</span>
                <span>{formatEuro(ergebnis.minijobGesamtkosten / 12)}</span>
              </div>
            </div>
            <p className="text-xs text-purple-600 mt-2">
              Abgaben: 5% RV + 5% KV + 1,6% UV + 2% Pauschalsteuer + 0,8% U1 + 0,22% U2 = 14,62%
            </p>
          </div>
        </div>
      )}

      {/* Result Section */}
      <div className="rounded-2xl shadow-lg p-6 text-white mb-6 bg-gradient-to-br from-teal-500 to-emerald-600">
        <h3 className="text-sm font-medium opacity-80 mb-1">
          🏠 Ihre Steuerermäßigung nach §35a EStG
        </h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.gesamtErmaessigung)}</span>
            <span className="text-xl opacity-80">/Jahr</span>
          </div>
          <p className="text-teal-100 mt-2 text-sm">
            Direkt abzugsfähig von Ihrer Einkommensteuer!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Gesamtkosten/Jahr</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.gesamtkosten)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Effektive Kosten</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.effektiveKosten)}</div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-white/20 rounded-xl">
          <p className="text-sm">
            💡 <strong>Ersparnis:</strong> Sie sparen {formatProzent(ergebnis.gesamtErmaessigung / ergebnis.gesamtkosten)} 
            Ihrer Ausgaben durch die Steuerermäßigung!
          </p>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>

        <div className="space-y-3 text-sm">
          {/* Haushaltsnahe Dienstleistungen */}
          {(beschaeftigungsart === 'dienstleistung' || beschaeftigungsart === 'beide') && (
            <div className="p-4 bg-teal-50 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-teal-800">🧹 Haushaltsnahe Dienstleistungen</span>
                <span className="font-bold text-teal-900">{formatEuro(ergebnis.dlErmaessigung)}</span>
              </div>
              <div className="space-y-1 text-teal-700 text-xs">
                <div className="flex justify-between">
                  <span>Jahreskosten:</span>
                  <span>{formatEuro(ergebnis.jahresKostenDL)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Davon anrechenbar (max. {formatEuro(DIENSTLEISTUNG_MAX_KOSTEN)}):</span>
                  <span>{formatEuro(ergebnis.dlAnrechenbar)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>× 20% Ermäßigung (max. {formatEuro(DIENSTLEISTUNG_MAX_ERMAESSIGUNG)}):</span>
                  <span>{formatEuro(ergebnis.dlErmaessigung)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Minijob-Haushaltshilfe */}
          {(beschaeftigungsart === 'minijob' || beschaeftigungsart === 'beide') && (
            <div className="p-4 bg-purple-50 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-purple-800">👩‍🏠 Minijob-Haushaltshilfe</span>
                <span className="font-bold text-purple-900">{formatEuro(ergebnis.minijobErmaessigung)}</span>
              </div>
              <div className="space-y-1 text-purple-700 text-xs">
                <div className="flex justify-between">
                  <span>Jahres-Bruttolohn:</span>
                  <span>{formatEuro(ergebnis.jahresBruttolohn)}</span>
                </div>
                <div className="flex justify-between">
                  <span>+ Arbeitgeber-Abgaben:</span>
                  <span>{formatEuro(ergebnis.arbeitgeberAbgaben)}</span>
                </div>
                <div className="flex justify-between">
                  <span>= Gesamtkosten (anrechenbar):</span>
                  <span>{formatEuro(ergebnis.minijobGesamtkosten)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>× 20% Ermäßigung (max. {formatEuro(MINIJOB_MAX_ERMAESSIGUNG)}):</span>
                  <span>{formatEuro(ergebnis.minijobErmaessigung)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Gesamtergebnis */}
          <div className="flex justify-between items-center py-3 bg-green-100 -mx-6 px-6 rounded-b-xl">
            <span className="font-bold text-green-800">= Gesamt-Steuerermäßigung</span>
            <span className="font-bold text-2xl text-green-900">{formatEuro(ergebnis.gesamtErmaessigung)}</span>
          </div>
        </div>
      </div>

      {/* Effektiver Stundenlohn (nur bei Minijob) */}
      {(beschaeftigungsart === 'minijob' || beschaeftigungsart === 'beide') && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">⏱️ Effektiver Stundenlohn (Arbeitgeber)</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-600 mb-1">Vor Steuerermäßigung</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatEuro2(ergebnis.effektiverStundenlohn)}
              </p>
              <p className="text-xs text-gray-500">pro Stunde inkl. Abgaben</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl text-center">
              <p className="text-sm text-green-700 mb-1">Nach Steuerermäßigung</p>
              <p className="text-2xl font-bold text-green-800">
                {formatEuro2(ergebnis.effektiverStundenlohnNachSteuer)}
              </p>
              <p className="text-xs text-green-600">effektive Kosten/Stunde</p>
            </div>
          </div>
        </div>
      )}

      {/* Höchstbeträge Übersicht */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Höchstbeträge nach §35a EStG</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-teal-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧹</span>
              <div>
                <p className="font-medium text-gray-800">Haushaltsnahe Dienstleistungen</p>
                <p className="text-xs text-gray-500">Reinigung, Pflege, Garten (Rechnung)</p>
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

          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔧</span>
              <div>
                <p className="font-medium text-gray-800">+ Handwerkerleistungen</p>
                <p className="text-xs text-gray-500">Renovierung, Reparaturen</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">max. 1.200€</p>
              <p className="text-xs text-gray-500">(= 6.000€ Kosten)</p>
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
        <h3 className="font-bold text-gray-800 mb-4">✅ Was ist als Haushaltshilfe absetzbar?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-xl">
            <h4 className="font-semibold text-green-800 mb-2">✓ Haushaltsnahe Dienstleistungen:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Reinigung/Putzhilfe</li>
              <li>• Fensterreinigung</li>
              <li>• Gartenpflege (Rasen, Hecke)</li>
              <li>• Winterdienst (Schneeräumen)</li>
              <li>• Pflegedienst-Leistungen</li>
              <li>• Kinderbetreuung im Haushalt</li>
              <li>• Hausmeisterdienste</li>
              <li>• Wäscherei (Abhol-/Lieferservice)</li>
              <li>• Tierbetreuung (im Haushalt)</li>
            </ul>
          </div>
          
          <div className="p-4 bg-red-50 rounded-xl">
            <h4 className="font-semibold text-red-800 mb-2">✗ Nicht absetzbar:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Barzahlungen</li>
              <li>• Leistungen außerhalb des Haushalts</li>
              <li>• Umzugsunternehmen</li>
              <li>• Nachhilfeunterricht</li>
              <li>• Musikunterricht</li>
              <li>• Vermögensverwaltung</li>
              <li>• Müllabfuhr-Grundgebühr</li>
              <li>• Schornsteinfeger (→ Handwerker)</li>
              <li>• Bereits geförderte Leistungen</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Minijob vs. Dienstleistung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🆚 Minijob oder Dienstleistungsfirma?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-purple-50 rounded-xl">
            <h4 className="font-semibold text-purple-800 mb-2">👩‍🏠 Minijob-Anstellung:</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>✓ Oft günstiger pro Stunde</li>
              <li>✓ Persönliche Bindung</li>
              <li>✓ Flexiblere Arbeitszeiten</li>
              <li>− Anmeldung bei Minijob-Zentrale</li>
              <li>− Arbeitgeber-Pflichten</li>
              <li>− Max. 510€ Ermäßigung</li>
            </ul>
          </div>
          
          <div className="p-4 bg-teal-50 rounded-xl">
            <h4 className="font-semibold text-teal-800 mb-2">🧹 Dienstleistungsfirma:</h4>
            <ul className="text-sm text-teal-700 space-y-1">
              <li>✓ Kein Verwaltungsaufwand</li>
              <li>✓ Versicherung/Vertretung inkl.</li>
              <li>✓ Max. 4.000€ Ermäßigung</li>
              <li>✓ Einfache Rechnung</li>
              <li>− Oft teurer pro Stunde</li>
              <li>− Weniger persönlich</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-3 bg-green-50 rounded-xl">
          <p className="text-sm text-green-700">
            💡 <strong>Tipp:</strong> Sie können beide Varianten kombinieren! 
            Minijob-Haushaltshilfe (510€) + Dienstleistungen (4.000€) = bis zu 4.510€ Ermäßigung.
          </p>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
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
              <strong>Rechnung erforderlich:</strong> Bei Dienstleistungsfirmen benötigen Sie 
              eine ordnungsgemäße Rechnung mit Umsatzsteuer-ID.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Minijob anmelden:</strong> Über das Haushaltsscheckverfahren bei der 
              Minijob-Zentrale (Formular wird zugeschickt).
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Im eigenen Haushalt:</strong> Die Arbeiten müssen in Ihrer Wohnung oder 
              auf Ihrem Grundstück (EU/EWR) stattfinden.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Jahr der Zahlung:</strong> Es gilt das Jahr der Zahlung – nicht das Jahr 
              der Rechnungsstellung oder Durchführung.
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

      {/* Haushaltsscheckverfahren */}
      {(beschaeftigungsart === 'minijob' || beschaeftigungsart === 'beide') && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-purple-800 mb-3">📋 Haushaltsscheckverfahren (Minijob)</h3>
          <div className="space-y-3 text-sm text-purple-700">
            <div className="flex items-start gap-3">
              <span className="bg-purple-200 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">1</span>
              <p>
                <strong>Anmeldung:</strong> Melden Sie Ihre Haushaltshilfe bei der 
                Minijob-Zentrale an (Formular "Haushaltsscheck").
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-purple-200 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">2</span>
              <p>
                <strong>SEPA-Lastschrift:</strong> Die Abgaben (~14,62% vom Lohn) werden 
                halbjährlich per Lastschrift eingezogen.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-purple-200 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">3</span>
              <p>
                <strong>Bescheinigung:</strong> Sie erhalten jährlich eine Bescheinigung 
                über die Gesamtkosten für Ihre Steuererklärung.
              </p>
            </div>
          </div>
          <a
            href="https://www.minijob-zentrale.de/DE/01_haushaltsjobs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-purple-600 hover:underline font-medium"
          >
            → Minijob-Zentrale: Haushaltsjobs anmelden
          </a>
        </div>
      )}

      {/* Steuer-Tipps */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-blue-800 mb-3">💡 Steuer-Tipps</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Nebenkostenabrechnung prüfen:</strong> Auch Kosten für Hausmeister, 
              Gartenpflege und Reinigung aus der Nebenkostenabrechnung sind absetzbar!
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Pflegekosten:</strong> Ambulante Pflegedienst-Kosten (haushaltsnahe Tätigkeiten) 
              sind bis 4.000€ absetzbar – zusätzlich zu Pflegegeld!
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Alle Kategorien nutzen:</strong> Kombinieren Sie Haushaltshilfe, 
              Dienstleistungen UND Handwerker für bis zu 5.710€ Ermäßigung!
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Jahresende nutzen:</strong> Verschieben Sie ggf. Zahlungen ins neue Jahr, 
              wenn Sie das Maximum bereits ausgeschöpft haben.
            </span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörden</h3>
        <div className="space-y-4">
          <div className="bg-purple-50 rounded-xl p-4">
            <p className="font-semibold text-purple-900">Minijob-Zentrale</p>
            <p className="text-sm text-purple-700 mt-1">
              Anmeldung von Minijob-Haushaltshilfen über das Haushaltsscheckverfahren.
            </p>
            <a
              href="https://www.minijob-zentrale.de"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-purple-600 hover:underline mt-2 inline-block"
            >
              minijob-zentrale.de →
            </a>
          </div>

          <div className="bg-teal-50 rounded-xl p-4">
            <p className="font-semibold text-teal-900">Finanzamt</p>
            <p className="text-sm text-teal-700 mt-1">
              Die Steuerermäßigung nach §35a EStG wird in der Einkommensteuererklärung 
              geltend gemacht (Hauptvordruck, Zeilen 4-7).
            </p>
            <a
              href="https://www.elster.de"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-teal-600 hover:underline mt-2 inline-block"
            >
              elster.de →
            </a>
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
            href="/handwerkerkosten-rechner"
            className="inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            🔧 Handwerkerkosten-Rechner →
          </a>
          <a
            href="/minijob-rechner"
            className="inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            ⏰ Minijob-Rechner →
          </a>
          <a
            href="/einkommensteuer-rechner"
            className="inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            🧾 Einkommensteuer-Rechner →
          </a>
        </div>
      </div>
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
            href="https://www.minijob-zentrale.de/DE/01_haushaltsjobs"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Minijob-Zentrale – Haushaltsjobs im Privathaushalt
          </a>
          <a
            href="https://esth.bundesfinanzministerium.de/esth/2020/A-Einkommensteuergesetz/V-Steuerermaessigungen/4-Steuerermaessigung-bei-Aufwendungen-fuer-haushaltsnahe-Beschaeftigungsverhaeltnisse/Paragraf-35a/inhalt.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF – Amtliches Einkommensteuer-Handbuch §35a
          </a>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          <strong>Offizielle Berechnung nach §35a EStG:</strong><br/>
          • Haushaltsnahe Dienstleistungen: 20% der Kosten, max. 4.000€ (§35a Abs. 2)<br/>
          • Minijob-Haushaltshilfe: 20% der Kosten, max. 510€ (§35a Abs. 1)
        </p>
      </div>
    </div>
  );
}
