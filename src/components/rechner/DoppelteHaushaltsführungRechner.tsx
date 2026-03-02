import { useState, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// Doppelte Haushaltsführung - Steuerliche Absetzbarkeit
// ═══════════════════════════════════════════════════════════════════════════════
//
// RECHTSGRUNDLAGE: § 9 Abs. 1 Satz 3 Nr. 5 EStG
//
// VORAUSSETZUNGEN:
// 1. Zweitwohnung am Beschäftigungsort notwendig
// 2. Eigener Hausstand am Lebensmittelpunkt (Hauptwohnung)
// 3. Finanzielle Beteiligung an den Kosten des Haupthausstands
//
// ABSETZBARE KOSTEN:
// - Unterkunftskosten: max. 1.000 €/Monat (§ 9 Abs. 1 Satz 3 Nr. 5a EStG)
// - Heimfahrten: Pendlerpauschale 0,38 €/km (ab 2026 einheitlich)
// - Verpflegungsmehraufwand: erste 3 Monate (Pauschalen)
// - Umzugskosten (einmalig)
// - Einrichtung/Hausrat (angemessen, Abschreibung)
//
// QUELLEN:
// - BMF-Schreiben vom 25.11.2020
// - EStG § 9 Abs. 1 Satz 3 Nr. 5
// - BFH-Urteile zur doppelten Haushaltsführung
// ═══════════════════════════════════════════════════════════════════════════════

// Konstanten 2026
const UNTERKUNFT_MAX_MONAT = 1000; // Max. 1.000 €/Monat für Unterkunft
const PENDLERPAUSCHALE_KM = 0.38; // 38 Cent/km (einheitlich ab 2026)
const VERPFLEGUNG_TAG_VOLL = 28; // Abwesenheit > 24h (§ 9 Abs. 4a EStG – seit 2020 unverändert)
const VERPFLEGUNG_TAG_TEIL = 14; // Abwesenheit > 8h (§ 9 Abs. 4a EStG – seit 2020 unverändert)
const VERPFLEGUNG_MONATE = 3; // Verpflegungsmehraufwand nur erste 3 Monate
const WERBUNGSKOSTEN_PAUSCHALE = 1230; // Werbungskostenpauschale 2026

// Grenzsteuersätze
const GRENZSTEUERSAETZE = {
  niedrig: { label: '~14%', value: 0.14, desc: 'bis ~17.000 €' },
  mittel: { label: '~30%', value: 0.30, desc: '~17.000-67.000 €' },
  hoch: { label: '~42%', value: 0.42, desc: 'ab ~67.000 €' },
  spitze: { label: '~45%', value: 0.45, desc: 'ab ~278.000 €' },
};

export default function DoppelteHaushaltsführungRechner() {
  // Unterkunftskosten
  const [mietkosten, setMietkosten] = useState(800);
  const [nebenkosten, setNebenkosten] = useState(150);
  const [monate, setMonate] = useState(12);
  
  // Heimfahrten
  const [entfernungHeim, setEntfernungHeim] = useState(150);
  const [heimfahrtenProMonat, setHeimfahrtenProMonat] = useState(4);
  
  // Zusatzkosten
  const [einrichtungskosten, setEinrichtungskosten] = useState(0);
  const [umzugskosten, setUmzugskosten] = useState(0);
  const [verpflegungsmehraufwand, setVerpflegungsmehraufwand] = useState(true);
  
  // Steuer
  const [grenzsteuersatz, setGrenzsteuersatz] = useState<'niedrig' | 'mittel' | 'hoch' | 'spitze'>('mittel');
  const [kirchensteuer, setKirchensteuer] = useState(false);

  const ergebnis = useMemo(() => {
    // 1. Unterkunftskosten (max. 1.000 €/Monat)
    const unterkunftProMonat = Math.min(mietkosten + nebenkosten, UNTERKUNFT_MAX_MONAT);
    const unterkunftGekuerzt = (mietkosten + nebenkosten) > UNTERKUNFT_MAX_MONAT;
    const unterkunftJahr = unterkunftProMonat * monate;
    
    // 2. Heimfahrten (Pendlerpauschale - eine Fahrt pro Woche)
    const heimfahrtenGesamt = heimfahrtenProMonat * monate;
    const heimfahrtenKosten = Math.round(entfernungHeim * PENDLERPAUSCHALE_KM * heimfahrtenGesamt);
    
    // 3. Verpflegungsmehraufwand (nur erste 3 Monate)
    let verpflegungKosten = 0;
    if (verpflegungsmehraufwand) {
      const verpflegungsMonate = Math.min(monate, VERPFLEGUNG_MONATE);
      // Annahme: An- und Abreisetag = 16€, volle Tage = 32€
      // Pro Woche: 1x Anreise (16€) + 3 volle Tage (96€) + 1x Abreise (16€) = 128€
      // Vereinfacht: ca. 4 Wochen × Pauschalen
      const arbeitstageProMonat = 20;
      verpflegungKosten = verpflegungsMonate * arbeitstageProMonat * VERPFLEGUNG_TAG_TEIL;
    }
    
    // 4. Einrichtung (Hausrat - voller Abzug, da nicht zur Unterkunft gehörend)
    const einrichtungAbzug = einrichtungskosten;
    
    // 5. Umzugskosten (einmalig absetzbar)
    const umzugAbzug = umzugskosten;
    
    // Gesamtkosten
    const gesamtAbsetzbar = unterkunftJahr + heimfahrtenKosten + verpflegungKosten + einrichtungAbzug + umzugAbzug;
    
    // Über Werbungskostenpauschale
    const ueberschuss = Math.max(0, gesamtAbsetzbar - WERBUNGSKOSTEN_PAUSCHALE);
    
    // Steuerersparnis berechnen
    let effektiverSteuersatz = GRENZSTEUERSAETZE[grenzsteuersatz].value;
    effektiverSteuersatz *= 1.055; // Soli (5,5%)
    if (kirchensteuer) {
      effektiverSteuersatz *= 1.09; // Kirchensteuer (ca. 9%)
    }
    
    const steuerersparnis = Math.round(gesamtAbsetzbar * effektiverSteuersatz);
    const monatlicheErsparnis = Math.round(steuerersparnis / 12);
    
    return {
      // Unterkunft
      unterkunftProMonat,
      unterkunftJahr,
      unterkunftGekuerzt,
      gekuerzterBetrag: (mietkosten + nebenkosten) - unterkunftProMonat,
      
      // Heimfahrten
      heimfahrtenGesamt,
      heimfahrtenKosten,
      
      // Verpflegung
      verpflegungKosten,
      
      // Einrichtung & Umzug
      einrichtungAbzug,
      umzugAbzug,
      
      // Gesamt
      gesamtAbsetzbar,
      ueberschuss,
      werbungskostenpauschale: WERBUNGSKOSTEN_PAUSCHALE,
      
      // Steuer
      steuerersparnis,
      monatlicheErsparnis,
      effektiverSteuersatz: Math.round(effektiverSteuersatz * 100),
      
      // Info
      maxUnterkunft: UNTERKUNFT_MAX_MONAT,
      pendlerpauschale: PENDLERPAUSCHALE_KM,
    };
  }, [
    mietkosten,
    nebenkosten,
    monate,
    entfernungHeim,
    heimfahrtenProMonat,
    einrichtungskosten,
    umzugskosten,
    verpflegungsmehraufwand,
    grenzsteuersatz,
    kirchensteuer,
  ]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section - Unterkunft */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🏠</span>
          Zweitwohnung (Unterkunftskosten)
        </h3>
        
        {/* Kaltmiete */}
        <div className="mb-5">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Monatliche Kaltmiete</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={mietkosten}
              onChange={(e) => setMietkosten(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none"
              min="0"
              max="2000"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
          </div>
          <input
            type="range"
            value={mietkosten}
            onChange={(e) => setMietkosten(Number(e.target.value))}
            className="w-full mt-3 accent-teal-500"
            min="200"
            max="1500"
            step="50"
          />
        </div>

        {/* Nebenkosten */}
        <div className="mb-5">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Nebenkosten (warm)</span>
            <span className="text-xs text-gray-500 block">Heizung, Strom, Wasser, Internet etc.</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={nebenkosten}
              onChange={(e) => setNebenkosten(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none"
              min="0"
              max="500"
              step="10"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
          </div>
        </div>

        {/* Info zur 1.000€-Grenze */}
        <div className={`p-3 rounded-xl text-sm ${
          (mietkosten + nebenkosten) > UNTERKUNFT_MAX_MONAT 
            ? 'bg-amber-50 text-amber-800' 
            : 'bg-teal-50 text-teal-800'
        }`}>
          <p>
            <strong>Unterkunftskosten gesamt:</strong> {formatEuro(mietkosten + nebenkosten)}/Monat
            {(mietkosten + nebenkosten) > UNTERKUNFT_MAX_MONAT && (
              <span className="block mt-1 text-amber-700">
                ⚠️ Maximale Grenze: {formatEuro(UNTERKUNFT_MAX_MONAT)}/Monat – 
                {formatEuro((mietkosten + nebenkosten) - UNTERKUNFT_MAX_MONAT)} nicht absetzbar
              </span>
            )}
          </p>
        </div>

        {/* Monate */}
        <div className="mt-5">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Anzahl Monate im Jahr</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[3, 6, 9, 12].map((m) => (
              <button
                key={m}
                onClick={() => setMonate(m)}
                className={`py-3 rounded-xl font-bold transition-all ${
                  monate === m
                    ? 'bg-teal-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {m} Mon.
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Heimfahrten */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🚗</span>
          Heimfahrten (Pendlerpauschale)
        </h3>

        {/* Entfernung */}
        <div className="mb-5">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Entfernung zum Hauptwohnsitz</span>
            <span className="text-xs text-gray-500 block">Einfache Strecke in km</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={entfernungHeim}
              onChange={(e) => setEntfernungHeim(Math.max(1, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none"
              min="1"
              max="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">km</span>
          </div>
          <input
            type="range"
            value={entfernungHeim}
            onChange={(e) => setEntfernungHeim(Number(e.target.value))}
            className="w-full mt-3 accent-teal-500"
            min="20"
            max="500"
            step="10"
          />
        </div>

        {/* Heimfahrten pro Monat */}
        <div>
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Heimfahrten pro Monat</span>
            <span className="text-xs text-gray-500 block">Typisch: 1 pro Woche = 4 pro Monat</span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[2, 3, 4, 5, 6].map((hf) => (
              <button
                key={hf}
                onClick={() => setHeimfahrtenProMonat(hf)}
                className={`py-3 rounded-xl font-bold transition-all ${
                  heimfahrtenProMonat === hf
                    ? 'bg-teal-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {hf}×
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            ℹ️ Pendlerpauschale 2026: {(PENDLERPAUSCHALE_KM * 100).toFixed(0)} Cent/km (einfache Strecke)
          </p>
        </div>
      </div>

      {/* Zusatzkosten */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📦</span>
          Zusatzkosten (optional)
        </h3>

        {/* Einrichtung */}
        <div className="mb-5">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Einrichtungskosten (Hausrat)</span>
            <span className="text-xs text-gray-500 block">Möbel, Küchengeräte etc. – zusätzlich zur Miete absetzbar</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={einrichtungskosten}
              onChange={(e) => setEinrichtungskosten(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none"
              min="0"
              max="10000"
              step="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€ (einmalig)</span>
          </div>
        </div>

        {/* Umzugskosten */}
        <div className="mb-5">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Umzugskosten</span>
            <span className="text-xs text-gray-500 block">Transport, Umzugsfirma etc.</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={umzugskosten}
              onChange={(e) => setUmzugskosten(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none"
              min="0"
              max="5000"
              step="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€ (einmalig)</span>
          </div>
        </div>

        {/* Verpflegungsmehraufwand */}
        <div>
          <button
            onClick={() => setVerpflegungsmehraufwand(!verpflegungsmehraufwand)}
            className={`w-full py-4 px-4 rounded-xl font-medium transition-all flex items-center justify-between ${
              verpflegungsmehraufwand
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">🍽️</span>
              <span>Verpflegungsmehraufwand (erste 3 Monate)</span>
            </span>
            <span>{verpflegungsmehraufwand ? '✓ Ja' : '✗ Nein'}</span>
          </button>
          <p className="text-xs text-gray-500 mt-2">
            ℹ️ Pauschalen: 28€/Tag (über 24h) bzw. 14€/Tag (über 8h) – nur in den ersten 3 Monaten
          </p>
        </div>
      </div>

      {/* Steuersatz */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">💰</span>
          Grenzsteuersatz
        </h3>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {Object.entries(GRENZSTEUERSAETZE).map(([key, data]) => (
            <button
              key={key}
              onClick={() => setGrenzsteuersatz(key as keyof typeof GRENZSTEUERSAETZE)}
              className={`py-3 px-4 rounded-xl text-left transition-all ${
                grenzsteuersatz === key
                  ? 'bg-teal-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="font-bold">{data.label}</span>
              <span className="block text-xs opacity-80">{data.desc}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setKirchensteuer(!kirchensteuer)}
          className={`w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-between ${
            kirchensteuer
              ? 'bg-teal-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span>⛪ Kirchensteuer</span>
          <span>{kirchensteuer ? '✓ Ja' : '✗ Nein'}</span>
        </button>
      </div>

      {/* Ergebnis */}
      <div className="rounded-2xl shadow-lg p-6 text-white mb-6 bg-gradient-to-br from-teal-500 to-emerald-600">
        <h3 className="text-sm font-medium opacity-80 mb-1">
          💼 Ihre doppelte Haushaltsführung
        </h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.gesamtAbsetzbar)}</span>
            <span className="text-xl opacity-80">absetzbar</span>
          </div>
          <p className="text-teal-100 mt-2 text-sm">
            Gesamt absetzbare Kosten pro Jahr
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Steuerersparnis/Jahr</span>
            <div className="text-xl font-bold text-green-200">
              ~{formatEuro(ergebnis.steuerersparnis)}
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">= pro Monat</span>
            <div className="text-xl font-bold text-green-200">
              ~{formatEuro(ergebnis.monatlicheErsparnis)}
            </div>
          </div>
        </div>
      </div>

      {/* Aufschlüsselung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Aufschlüsselung der Kosten</h3>

        <div className="space-y-3 text-sm">
          {/* Unterkunft */}
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              🏠 Unterkunftskosten ({monate} Monate × {formatEuro(ergebnis.unterkunftProMonat)})
            </span>
            <span className="font-bold text-gray-900">
              {formatEuro(ergebnis.unterkunftJahr)}
            </span>
          </div>
          {ergebnis.unterkunftGekuerzt && (
            <div className="flex justify-between py-1 text-amber-600 text-xs">
              <span>↳ Gekürzt auf max. {formatEuro(UNTERKUNFT_MAX_MONAT)}/Monat</span>
              <span>−{formatEuro(ergebnis.gekuerzterBetrag * monate)}</span>
            </div>
          )}

          {/* Heimfahrten */}
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              🚗 Heimfahrten ({ergebnis.heimfahrtenGesamt}× {entfernungHeim} km × {(PENDLERPAUSCHALE_KM).toFixed(2)} €)
            </span>
            <span className="font-bold text-gray-900">
              {formatEuro(ergebnis.heimfahrtenKosten)}
            </span>
          </div>

          {/* Verpflegung */}
          {ergebnis.verpflegungKosten > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">
                🍽️ Verpflegungsmehraufwand (3 Monate)
              </span>
              <span className="font-bold text-gray-900">
                {formatEuro(ergebnis.verpflegungKosten)}
              </span>
            </div>
          )}

          {/* Einrichtung */}
          {ergebnis.einrichtungAbzug > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">📦 Einrichtungskosten</span>
              <span className="font-bold text-gray-900">
                {formatEuro(ergebnis.einrichtungAbzug)}
              </span>
            </div>
          )}

          {/* Umzug */}
          {ergebnis.umzugAbzug > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">📦 Umzugskosten</span>
              <span className="font-bold text-gray-900">
                {formatEuro(ergebnis.umzugAbzug)}
              </span>
            </div>
          )}

          {/* Gesamt */}
          <div className="flex justify-between py-3 bg-teal-50 -mx-6 px-6">
            <span className="font-bold text-teal-800">Gesamt absetzbar</span>
            <span className="font-bold text-2xl text-teal-900">
              {formatEuro(ergebnis.gesamtAbsetzbar)}
            </span>
          </div>

          {/* Steuerersparnis */}
          <div className="flex justify-between py-3 bg-green-50 -mx-6 px-6 rounded-b-xl">
            <span className="font-medium text-green-800">
              ≈ Steuerersparnis (bei ~{ergebnis.effektiverSteuersatz}%)
            </span>
            <span className="font-bold text-2xl text-green-700">
              {formatEuro(ergebnis.steuerersparnis)}
            </span>
          </div>
        </div>
      </div>

      {/* Voraussetzungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">✅ Voraussetzungen für die doppelte Haushaltsführung</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span className="text-green-500">✓</span>
            <span>
              <strong>Berufliche Veranlassung:</strong> Die Zweitwohnung muss wegen der Arbeit 
              notwendig sein (Arbeitsort ≠ Wohnort)
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">✓</span>
            <span>
              <strong>Eigener Hausstand:</strong> Am Hauptwohnsitz (Lebensmittelpunkt) muss ein 
              eigener Hausstand geführt werden
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">✓</span>
            <span>
              <strong>Finanzielle Beteiligung:</strong> Sie müssen sich an den Kosten des 
              Haupthausstands beteiligen (mind. 10%)
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500">✓</span>
            <span>
              <strong>Zeitliche Nähe:</strong> Die Zweitwohnung muss näher am Arbeitsort liegen 
              als der Hauptwohnsitz
            </span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>1.000€-Grenze:</strong> Für die Unterkunft (Miete + Nebenkosten) gilt eine 
              Obergrenze von 1.000 €/Monat. Darüber hinausgehende Kosten sind nicht absetzbar.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Hausrat separat:</strong> Einrichtungskosten (Möbel, Haushaltsgeräte) sind 
              zusätzlich absetzbar und zählen NICHT zur 1.000€-Grenze!
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Heimfahrten:</strong> Es wird nur die einfache Entfernung anerkannt, 
              maximal eine Heimfahrt pro Woche.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Nachweise aufbewahren:</strong> Mietvertrag, Nebenkostenabrechnungen, 
              Fahrtenbuch bzw. Heimfahrt-Dokumentation
            </span>
          </li>
        </ul>
      </div>

      {/* Was ist absetzbar? */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">💰 Was ist alles absetzbar?</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-teal-50 rounded-xl">
            <h4 className="font-semibold text-teal-900 mb-2">🏠 Unterkunftskosten (max. 1.000€/Monat)</h4>
            <ul className="text-sm text-teal-800 space-y-1">
              <li>• Miete (kalt)</li>
              <li>• Nebenkosten (Heizung, Wasser, Strom)</li>
              <li>• Rundfunkbeitrag (anteilig)</li>
              <li>• Internet</li>
              <li>• Zweitwohnungssteuer</li>
            </ul>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-xl">
            <h4 className="font-semibold text-blue-900 mb-2">📦 Zusätzlich (ohne Obergrenze)</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Einrichtung & Hausrat (angemessen)</li>
              <li>• Umzugskosten</li>
              <li>• Maklergebühren</li>
              <li>• Renovierungskosten bei Auszug</li>
            </ul>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-xl">
            <h4 className="font-semibold text-purple-900 mb-2">🚗 Heimfahrten</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Pendlerpauschale: 0,38€/km (einfache Strecke)</li>
              <li>• Maximal 1 Heimfahrt pro Woche</li>
              <li>• Bei Nutzung des eigenen Pkw: unbegrenzt absetzbar</li>
            </ul>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-xl">
            <h4 className="font-semibold text-orange-900 mb-2">🍽️ Verpflegungsmehraufwand (3 Monate)</h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• 28€/Tag bei Abwesenheit über 24 Stunden</li>
              <li>• 14€/Tag bei Abwesenheit über 8 Stunden</li>
              <li>• Nur in den ersten 3 Monaten nach Beginn</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Steuererklärung – Wo eintragen?</h3>
        <div className="space-y-4">
          <div className="bg-teal-50 rounded-xl p-4">
            <p className="font-semibold text-teal-900">Anlage N (Einkünfte aus nichtselbstständiger Arbeit)</p>
            <p className="text-sm text-teal-700 mt-1">
              Die doppelte Haushaltsführung wird als Werbungskosten in der Anlage N eingetragen.
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
              <span className="text-xl">📋</span>
              <div>
                <p className="font-medium text-gray-800">Anlage N</p>
                <p className="text-gray-500 text-xs">
                  Zeilen 61-87: Doppelte Haushaltsführung
                </p>
              </div>
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
            href="/pendlerpauschale-rechner"
            className="inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            🚗 Pendlerpauschale-Rechner →
          </a>
          <a
            href="/verpflegungsmehraufwand-rechner"
            className="inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            🍽️ Verpflegungsmehraufwand →
          </a>
          <a
            href="/umzugskosten-rechner"
            className="inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            📦 Umzugskosten-Rechner →
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
            href="https://www.gesetze-im-internet.de/estg/__9.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline font-medium"
          >
            ★ § 9 Abs. 1 Satz 3 Nr. 5 EStG – Doppelte Haushaltsführung (Gesetzestext)
          </a>
          <a
            href="https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Lohnsteuer/2020-11-25-steuerliche-behandlung-der-reisekosten-von-arbeitnehmern.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF-Schreiben vom 25.11.2020 – Reisekosten
          </a>
          <a
            href="https://www.haufe.de/steuern/steuer-office-gold/doppelte-haushaltsfuehrung_idesk_PI11525_HI2330050.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Haufe – Doppelte Haushaltsführung
          </a>
          <a
            href="https://www.vlh.de/arbeiten-pendeln/beruf/doppelte-haushaltsfuehrung-das-koennen-sie-absetzen.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            VLH – Das können Sie absetzen
          </a>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          <strong>Berechnung:</strong> Unterkunftskosten (max. 1.000€/Monat) + Heimfahrten (Pendlerpauschale) 
          + Verpflegungsmehraufwand (3 Monate) + Einrichtung + Umzugskosten = Werbungskosten
        </p>
      </div>
    </div>
  );
}
