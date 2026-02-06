import { useState } from 'react';

// Selbstbehalt 2026 beim Ehegattenunterhalt
const SELBSTBEHALT = {
  erwerbstaetigOhneKinder: 1600,  // Angemessener Selbstbehalt gegenüber Ex-Ehegatte
  nichtErwerbstaetigOhneKinder: 1475,
  mitKindesunterhalt: 1450, // Bei Zahlung von Kindesunterhalt
};

// Pauschale für berufsbedingte Aufwendungen (5% vom Netto, max. 150€)
const BERUFSBEDINGTE_AUFWENDUNGEN_PROZENT = 0.05;
const BERUFSBEDINGTE_AUFWENDUNGEN_MAX = 150;

type UnterhaltsArt = 'trennung' | 'nachehelich';
type Erwerbsstatus = 'vollzeit' | 'teilzeit' | 'arbeitssuchend' | 'nicht_erwerbstaetig' | 'rente';

interface BerechnungsDetails {
  bruttoUnterschied: number;
  angemessenerUnterhalt: number;
  zahlbetrag: number;
  quotenMethode: '3/7' | '45%';
  bereinigtesNettoUnterhaltspflichtiger: number;
  bereinigtesNettoUnterhaltsberechtigter: number;
  differenz: number;
  halfteDifferenz: number;
  selbstbehaltGefaehrdet: boolean;
  verbleibtNachUnterhalt: number;
  erwerbstaetigenBonus: number;
}

function berechneBerufsbedingteAufwendungen(netto: number): number {
  const aufwendungen = netto * BERUFSBEDINGTE_AUFWENDUNGEN_PROZENT;
  return Math.min(aufwendungen, BERUFSBEDINGTE_AUFWENDUNGEN_MAX);
}

function berechneEhegattenunterhalt(
  nettoUnterhaltspflichtiger: number,
  nettoUnterhaltsberechtigter: number,
  erwerbstaetigPflichtiger: boolean,
  erwerbstaetigBerechtigter: boolean,
  kindesunterhaltMonatlich: number,
  unterhaltsArt: UnterhaltsArt
): BerechnungsDetails {
  // Bereinigtes Nettoeinkommen berechnen
  // 1. Abzug berufsbedingte Aufwendungen (bei Erwerbstätigen)
  const aufwendungenPflichtiger = erwerbstaetigPflichtiger 
    ? berechneBerufsbedingteAufwendungen(nettoUnterhaltspflichtiger) 
    : 0;
  const aufwendungenBerechtigter = erwerbstaetigBerechtigter 
    ? berechneBerufsbedingteAufwendungen(nettoUnterhaltsberechtigter) 
    : 0;

  // 2. Kindesunterhalt abziehen (vorab vom Pflichtigen)
  let bereinigtPflichtiger = nettoUnterhaltspflichtiger - aufwendungenPflichtiger - kindesunterhaltMonatlich;
  let bereinigtBerechtigter = nettoUnterhaltsberechtigter - aufwendungenBerechtigter;

  // Mindestens 0
  bereinigtPflichtiger = Math.max(0, bereinigtPflichtiger);
  bereinigtBerechtigter = Math.max(0, bereinigtBerechtigter);

  // Differenz berechnen
  const differenz = bereinigtPflichtiger - bereinigtBerechtigter;
  
  // Wenn der Berechtigte mehr verdient, kein Unterhalt
  if (differenz <= 0) {
    return {
      bruttoUnterschied: differenz,
      angemessenerUnterhalt: 0,
      zahlbetrag: 0,
      quotenMethode: '3/7',
      bereinigtesNettoUnterhaltspflichtiger: bereinigtPflichtiger,
      bereinigtesNettoUnterhaltsberechtigter: bereinigtBerechtigter,
      differenz: differenz,
      halfteDifferenz: 0,
      selbstbehaltGefaehrdet: false,
      verbleibtNachUnterhalt: bereinigtPflichtiger,
      erwerbstaetigenBonus: 0,
    };
  }

  // Erwerbstätigenbonus (1/7 bzw. 10% der Differenz)
  // Nur wenn beide erwerbstätig sind, erhält der Besserverdienende einen Bonus
  let erwerbstaetigenBonus = 0;
  let quotenMethode: '3/7' | '45%' = '3/7';
  let angemessenerUnterhalt = 0;

  if (erwerbstaetigPflichtiger && erwerbstaetigBerechtigter) {
    // 3/7-Methode (klassisch): Der Erwerbstätige behält 4/7, zahlt 3/7 der Differenz
    // Das entspricht ca. 42,86% der Differenz
    angemessenerUnterhalt = (differenz * 3) / 7;
    erwerbstaetigenBonus = differenz - (angemessenerUnterhalt * 2); // Was über 50% hinausgeht
    quotenMethode = '3/7';
  } else if (erwerbstaetigPflichtiger && !erwerbstaetigBerechtigter) {
    // Pflichtiger erwerbstätig, Berechtigter nicht: 3/7-Methode
    angemessenerUnterhalt = (differenz * 3) / 7;
    erwerbstaetigenBonus = differenz / 7; // 1/7 der Differenz
    quotenMethode = '3/7';
  } else {
    // Beide nicht erwerbstätig oder nur Berechtigter: 50% (Halbteilungsgrundsatz)
    angemessenerUnterhalt = differenz / 2;
    quotenMethode = '45%';
  }

  // Runden
  angemessenerUnterhalt = Math.round(angemessenerUnterhalt);

  // Selbstbehalt prüfen
  let selbstbehalt = SELBSTBEHALT.erwerbstaetigOhneKinder;
  if (!erwerbstaetigPflichtiger) {
    selbstbehalt = SELBSTBEHALT.nichtErwerbstaetigOhneKinder;
  }
  if (kindesunterhaltMonatlich > 0) {
    selbstbehalt = SELBSTBEHALT.mitKindesunterhalt;
  }

  const verbleibtNachUnterhalt = bereinigtPflichtiger - angemessenerUnterhalt;
  const selbstbehaltGefaehrdet = verbleibtNachUnterhalt < selbstbehalt;

  // Zahlbetrag (ggf. reduziert wegen Selbstbehalt)
  let zahlbetrag = angemessenerUnterhalt;
  if (selbstbehaltGefaehrdet) {
    zahlbetrag = Math.max(0, bereinigtPflichtiger - selbstbehalt);
  }

  return {
    bruttoUnterschied: nettoUnterhaltspflichtiger - nettoUnterhaltsberechtigter,
    angemessenerUnterhalt,
    zahlbetrag: Math.round(zahlbetrag),
    quotenMethode,
    bereinigtesNettoUnterhaltspflichtiger: bereinigtPflichtiger,
    bereinigtesNettoUnterhaltsberechtigter: bereinigtBerechtigter,
    differenz: Math.round(differenz),
    halfteDifferenz: Math.round(differenz / 2),
    selbstbehaltGefaehrdet,
    verbleibtNachUnterhalt: Math.round(verbleibtNachUnterhalt),
    erwerbstaetigenBonus: Math.round(erwerbstaetigenBonus),
  };
}

export default function EhegattenunterhaltRechner() {
  // Inputs
  const [unterhaltsArt, setUnterhaltsArt] = useState<UnterhaltsArt>('trennung');
  const [nettoPflichtiger, setNettoPflichtiger] = useState(4000);
  const [nettoBerechtigter, setNettoBerechtigter] = useState(1500);
  const [erwerbstaetigPflichtiger, setErwerbstaetigPflichtiger] = useState(true);
  const [erwerbstaetigBerechtigter, setErwerbstaetigBerechtigter] = useState(true);
  const [kindesunterhaltMonatlich, setKindesunterhaltMonatlich] = useState(0);

  // Berechnung
  const ergebnis = berechneEhegattenunterhalt(
    nettoPflichtiger,
    nettoBerechtigter,
    erwerbstaetigPflichtiger,
    erwerbstaetigBerechtigter,
    kindesunterhaltMonatlich,
    unterhaltsArt
  );

  return (
    <div className="max-w-lg mx-auto">
      {/* Unterhaltsart Auswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">💔 Art des Unterhalts</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setUnterhaltsArt('trennung')}
            className={`p-4 rounded-xl text-left transition-all ${
              unterhaltsArt === 'trennung'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="font-bold">Trennungsunterhalt</div>
            <div className={`text-xs mt-1 ${unterhaltsArt === 'trennung' ? 'text-purple-200' : 'text-gray-500'}`}>
              Während der Trennungszeit
            </div>
          </button>
          <button
            onClick={() => setUnterhaltsArt('nachehelich')}
            className={`p-4 rounded-xl text-left transition-all ${
              unterhaltsArt === 'nachehelich'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="font-bold">Nachehelicher Unterhalt</div>
            <div className={`text-xs mt-1 ${unterhaltsArt === 'nachehelich' ? 'text-purple-200' : 'text-gray-500'}`}>
              Nach rechtskräftiger Scheidung
            </div>
          </button>
        </div>
        
        {unterhaltsArt === 'nachehelich' && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-xl">
            <p className="text-sm text-yellow-800">
              <strong>Hinweis:</strong> Nachehelicher Unterhalt besteht nur bei Vorliegen eines Unterhaltstatbestands 
              (z.B. Kinderbetreuung, Alter, Krankheit, Erwerbslosigkeit).
            </p>
          </div>
        )}
      </div>

      {/* Einkommen Unterhaltspflichtiger */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">👤 Unterhaltspflichtiger (zahlt)</h3>
        
        <div className="mb-5">
          <label className="block text-gray-700 font-medium mb-2">
            Nettoeinkommen (€/Monat)
          </label>
          <input
            type="number"
            value={nettoPflichtiger}
            onChange={(e) => setNettoPflichtiger(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none text-lg"
            min="0"
            step="100"
          />
          <input
            type="range"
            value={nettoPflichtiger}
            onChange={(e) => setNettoPflichtiger(parseInt(e.target.value))}
            min="0"
            max="15000"
            step="100"
            className="w-full mt-2 accent-purple-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span>15.000 €</span>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Erwerbsstatus
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setErwerbstaetigPflichtiger(true)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                erwerbstaetigPflichtiger
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Erwerbstätig
            </button>
            <button
              onClick={() => setErwerbstaetigPflichtiger(false)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                !erwerbstaetigPflichtiger
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Nicht erwerbstätig
            </button>
          </div>
        </div>
      </div>

      {/* Einkommen Unterhaltsberechtigter */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">👤 Unterhaltsberechtigter (erhält)</h3>
        
        <div className="mb-5">
          <label className="block text-gray-700 font-medium mb-2">
            Nettoeinkommen (€/Monat)
          </label>
          <input
            type="number"
            value={nettoBerechtigter}
            onChange={(e) => setNettoBerechtigter(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none text-lg"
            min="0"
            step="100"
          />
          <input
            type="range"
            value={nettoBerechtigter}
            onChange={(e) => setNettoBerechtigter(parseInt(e.target.value))}
            min="0"
            max="10000"
            step="100"
            className="w-full mt-2 accent-purple-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span>10.000 €</span>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Erwerbsstatus
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setErwerbstaetigBerechtigter(true)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                erwerbstaetigBerechtigter
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Erwerbstätig
            </button>
            <button
              onClick={() => setErwerbstaetigBerechtigter(false)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                !erwerbstaetigBerechtigter
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Nicht erwerbstätig
            </button>
          </div>
        </div>
      </div>

      {/* Kindesunterhalt (falls vorhanden) */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">👶 Kindesunterhalt (vorab abziehen)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Falls der Unterhaltspflichtige bereits Kindesunterhalt zahlt, diesen hier eintragen.
        </p>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Kindesunterhalt gesamt (€/Monat)
          </label>
          <input
            type="number"
            value={kindesunterhaltMonatlich}
            onChange={(e) => setKindesunterhaltMonatlich(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none text-lg"
            min="0"
            step="50"
            placeholder="0"
          />
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-purple-100 mb-1">
          {unterhaltsArt === 'trennung' ? 'Trennungsunterhalt' : 'Nachehelicher Unterhalt'}
        </h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{ergebnis.zahlbetrag.toLocaleString('de-DE')}</span>
            <span className="text-xl text-purple-200">€ / Monat</span>
          </div>
          {ergebnis.selbstbehaltGefaehrdet && ergebnis.zahlbetrag < ergebnis.angemessenerUnterhalt && (
            <p className="text-sm text-yellow-200 mt-1">
              (reduziert wegen Selbstbehalt)
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-purple-100">Bereinigtes Netto (Pflichtiger)</span>
              <span className="text-lg font-bold">{ergebnis.bereinigtesNettoUnterhaltspflichtiger.toLocaleString('de-DE')} €</span>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-purple-100">Bereinigtes Netto (Berechtigter)</span>
              <span className="text-lg font-bold">{ergebnis.bereinigtesNettoUnterhaltsberechtigter.toLocaleString('de-DE')} €</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-purple-100">Einkommensdifferenz</span>
              <span className="text-lg font-bold">{ergebnis.differenz.toLocaleString('de-DE')} €</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-purple-100">Berechnungsmethode</span>
              <span className="text-lg font-bold">{ergebnis.quotenMethode}</span>
            </div>
            <p className="text-xs text-purple-200 mt-1">
              {ergebnis.quotenMethode === '3/7' 
                ? 'Erwerbstätigenbonus: 1/7 bleibt beim Pflichtigen' 
                : 'Halbteilungsgrundsatz: 50% der Differenz'}
            </p>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-purple-100">Jahresbetrag</span>
              <span className="text-lg font-bold">{(ergebnis.zahlbetrag * 12).toLocaleString('de-DE')} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">📊 Berechnungsdetails</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-600">Netto Pflichtiger</span>
            <span className="font-medium">{nettoPflichtiger.toLocaleString('de-DE')} €</span>
          </div>
          {erwerbstaetigPflichtiger && (
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600">./. Berufsbedingte Aufwendungen (5%)</span>
              <span className="font-medium">- {Math.round(berechneBerufsbedingteAufwendungen(nettoPflichtiger)).toLocaleString('de-DE')} €</span>
            </div>
          )}
          {kindesunterhaltMonatlich > 0 && (
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600">./. Kindesunterhalt</span>
              <span className="font-medium">- {kindesunterhaltMonatlich.toLocaleString('de-DE')} €</span>
            </div>
          )}
          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl border-2 border-purple-200">
            <span className="text-purple-700 font-medium">= Bereinigt Pflichtiger</span>
            <span className="font-bold text-purple-700">{ergebnis.bereinigtesNettoUnterhaltspflichtiger.toLocaleString('de-DE')} €</span>
          </div>
          
          <div className="h-px bg-gray-200 my-2"></div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-600">Netto Berechtigter</span>
            <span className="font-medium">{nettoBerechtigter.toLocaleString('de-DE')} €</span>
          </div>
          {erwerbstaetigBerechtigter && nettoBerechtigter > 0 && (
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600">./. Berufsbedingte Aufwendungen (5%)</span>
              <span className="font-medium">- {Math.round(berechneBerufsbedingteAufwendungen(nettoBerechtigter)).toLocaleString('de-DE')} €</span>
            </div>
          )}
          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl border-2 border-purple-200">
            <span className="text-purple-700 font-medium">= Bereinigt Berechtigter</span>
            <span className="font-bold text-purple-700">{ergebnis.bereinigtesNettoUnterhaltsberechtigter.toLocaleString('de-DE')} €</span>
          </div>
          
          <div className="h-px bg-gray-200 my-2"></div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-600">Differenz</span>
            <span className="font-medium">{ergebnis.differenz.toLocaleString('de-DE')} €</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-600">
              {ergebnis.quotenMethode === '3/7' ? '× 3/7 (42,86%)' : '× 50%'}
            </span>
            <span className="font-bold text-purple-600">{ergebnis.angemessenerUnterhalt.toLocaleString('de-DE')} €</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-600">Verbleibt nach Unterhalt</span>
            <span className={`font-medium ${ergebnis.selbstbehaltGefaehrdet ? 'text-red-600' : 'text-green-600'}`}>
              {ergebnis.verbleibtNachUnterhalt.toLocaleString('de-DE')} €
            </span>
          </div>
        </div>
      </div>

      {/* Selbstbehalt Warnung */}
      {ergebnis.selbstbehaltGefaehrdet && (
        <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-2xl p-6">
          <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
            <span>⚠️</span>
            Selbstbehalt gefährdet!
          </h3>
          <p className="text-red-700 text-sm">
            Nach Abzug des Unterhalts verbleiben <strong>{ergebnis.verbleibtNachUnterhalt.toLocaleString('de-DE')} €</strong>.
            Der angemessene Selbstbehalt beim Ehegattenunterhalt beträgt mindestens 
            <strong> {(erwerbstaetigPflichtiger ? SELBSTBEHALT.erwerbstaetigOhneKinder : SELBSTBEHALT.nichtErwerbstaetigOhneKinder).toLocaleString('de-DE')} €</strong>.
          </p>
          <p className="text-red-700 text-sm mt-2">
            Der Unterhalt wurde daher auf <strong>{ergebnis.zahlbetrag.toLocaleString('de-DE')} €</strong> reduziert.
          </p>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert's</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>3/7-Methode:</strong> Bei Erwerbstätigkeit erhält der Pflichtige 1/7 "Erwerbstätigenbonus", zahlt nur 3/7 der Differenz</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Berufsbedingte Aufwendungen:</strong> 5% vom Netto (max. 150 €) werden abgezogen</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Kindesunterhalt:</strong> Wird vorrangig abgezogen, bevor Ehegattenunterhalt berechnet wird</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Selbstbehalt:</strong> {SELBSTBEHALT.erwerbstaetigOhneKinder.toLocaleString('de-DE')} € (erwerbstätig) / {SELBSTBEHALT.nichtErwerbstaetigOhneKinder.toLocaleString('de-DE')} € (nicht erwerbstätig)</span>
          </li>
        </ul>
      </div>

      {/* Unterhaltstatbestände */}
      {unterhaltsArt === 'nachehelich' && (
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-gray-800 mb-3">📋 Unterhaltstatbestände (§§ 1570-1576 BGB)</h3>
          <p className="text-sm text-gray-600 mb-3">
            Nachehelicher Unterhalt besteht nur bei Vorliegen eines Grundes:
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2 p-3 bg-gray-50 rounded-xl">
              <span className="font-bold text-purple-600">§ 1570</span>
              <span className="text-gray-700"><strong>Kinderbetreuung:</strong> Betreuung eines Kindes unter 3 Jahren (danach ggf. verlängert)</span>
            </div>
            <div className="flex gap-2 p-3 bg-gray-50 rounded-xl">
              <span className="font-bold text-purple-600">§ 1571</span>
              <span className="text-gray-700"><strong>Alter:</strong> Keine Erwerbstätigkeit mehr zumutbar wegen Alters</span>
            </div>
            <div className="flex gap-2 p-3 bg-gray-50 rounded-xl">
              <span className="font-bold text-purple-600">§ 1572</span>
              <span className="text-gray-700"><strong>Krankheit:</strong> Erwerbsunfähigkeit wegen Krankheit oder Gebrechen</span>
            </div>
            <div className="flex gap-2 p-3 bg-gray-50 rounded-xl">
              <span className="font-bold text-purple-600">§ 1573</span>
              <span className="text-gray-700"><strong>Erwerbslosigkeit:</strong> Trotz Bemühungen keine angemessene Arbeit gefunden</span>
            </div>
            <div className="flex gap-2 p-3 bg-gray-50 rounded-xl">
              <span className="font-bold text-purple-600">§ 1574</span>
              <span className="text-gray-700"><strong>Aufstockung:</strong> Eigenes Einkommen reicht nicht für ehelichen Lebensstandard</span>
            </div>
            <div className="flex gap-2 p-3 bg-gray-50 rounded-xl">
              <span className="font-bold text-purple-600">§ 1575</span>
              <span className="text-gray-700"><strong>Ausbildung:</strong> Nachholen einer Ausbildung nach der Ehe</span>
            </div>
            <div className="flex gap-2 p-3 bg-gray-50 rounded-xl">
              <span className="font-bold text-purple-600">§ 1576</span>
              <span className="text-gray-700"><strong>Billigkeit:</strong> Schwerwiegende Gründe aus der Ehe heraus</span>
            </div>
          </div>
        </div>
      )}

      {/* Zuständige Behörde */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Stellen</h3>
        <div className="space-y-4">
          <div className="bg-purple-50 rounded-xl p-4">
            <p className="font-semibold text-purple-900">Familiengericht</p>
            <p className="text-sm text-purple-700 mt-1">
              Das örtliche Familiengericht (beim Amtsgericht) ist zuständig für Unterhaltsstreitigkeiten.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">⚖️</span>
              <div>
                <p className="font-medium text-gray-800">Rechtsanwalt Familienrecht</p>
                <a 
                  href="https://anwaltauskunft.de/magazin/familie-vorsorge"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  Anwalt finden →
                </a>
                <p className="text-xs text-gray-500 mt-1">Dringend empfohlen</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📋</span>
              <div>
                <p className="font-medium text-gray-800">Beratungshilfe</p>
                <a 
                  href="https://www.bmj.de/DE/Themen/GessellschaftUndFamilie/Beratungshilfe_Prozesskostenhilfe"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  Beratungshilfe beantragen →
                </a>
                <p className="text-xs text-gray-500 mt-1">Bei geringem Einkommen</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🤝</span>
              <div>
                <p className="font-medium text-gray-800">Mediation</p>
                <a 
                  href="https://www.bmj.de/DE/themen/gesellschaft-familie/mediation"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  Info zu Mediation →
                </a>
                <p className="text-xs text-gray-500 mt-1">Einvernehmliche Lösung</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">ISUV e.V.</p>
                <a 
                  href="https://www.isuv.de"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  isuv.de →
                </a>
                <p className="text-xs text-gray-500 mt-1">Interessenverband Unterhalt</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium text-yellow-800">Unverbindliche Berechnung</p>
              <p className="text-yellow-700">Diese Berechnung dient nur zur Orientierung. Der tatsächliche Unterhalt hängt von vielen Faktoren ab.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">👶</span>
            <div>
              <p className="font-medium text-blue-800">Kindesunterhalt hat Vorrang</p>
              <p className="text-blue-700">Kindesunterhalt geht dem Ehegattenunterhalt vor und wird zuerst vom Einkommen abgezogen.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">📅</span>
            <div>
              <p className="font-medium text-green-800">Befristung möglich</p>
              <p className="text-green-700">Nachehelicher Unterhalt kann zeitlich befristet oder herabgesetzt werden (§ 1578b BGB).</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-purple-50 rounded-xl">
            <span className="text-xl">📝</span>
            <div>
              <p className="font-medium text-purple-800">Auskunftsanspruch</p>
              <p className="text-purple-700">Beide Ehepartner haben gegenseitig Anspruch auf Auskunft über Einkommen und Vermögen.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Unterschied Trennungs- vs Nachehelicher Unterhalt */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🔄 Trennungs- vs. Nachehelicher Unterhalt</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 px-2"></th>
                <th className="text-left py-2 px-2">Trennungsunterhalt</th>
                <th className="text-left py-2 px-2">Nachehelicher Unterhalt</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              <tr className="border-b border-gray-100">
                <td className="py-2 px-2 font-medium">Zeitraum</td>
                <td className="py-2 px-2">Trennung bis Scheidung</td>
                <td className="py-2 px-2">Ab Rechtskraft der Scheidung</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-2 font-medium">Erwerbspflicht</td>
                <td className="py-2 px-2">Eingeschränkt (1. Jahr)</td>
                <td className="py-2 px-2">Grundsätzlich vorhanden</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-2 font-medium">Verzicht möglich</td>
                <td className="py-2 px-2">Nein (unwirksam)</td>
                <td className="py-2 px-2">Ja (mit Einschränkungen)</td>
              </tr>
              <tr>
                <td className="py-2 px-2 font-medium">Befristung</td>
                <td className="py-2 px-2">Nein</td>
                <td className="py-2 px-2">Ja (§ 1578b BGB)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/bgb/__1361.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-purple-600 hover:underline"
          >
            § 1361 BGB – Unterhalt bei Getrenntleben
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/bgb/__1569.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-purple-600 hover:underline"
          >
            §§ 1569-1586 BGB – Nachehelicher Unterhalt
          </a>
          <a 
            href="https://www.olg-duesseldorf.nrw.de/infos/Duesseldorfer_Tabelle/index.php"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-purple-600 hover:underline"
          >
            OLG Düsseldorf – Unterhaltsleitlinien
          </a>
          <a 
            href="https://www.bmj.de/DE/themen/gesellschaft/familie-und-unterhalt/unterhalt/unterhalt-node.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-purple-600 hover:underline"
          >
            Bundesministerium der Justiz – Unterhaltsrecht
          </a>
        </div>
      </div>
    </div>
  );
}
