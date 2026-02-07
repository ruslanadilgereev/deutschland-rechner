import { useState, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// Homeoffice-Pauschale (Tagespauschale) - Offizielle Berechnung
// ═══════════════════════════════════════════════════════════════════════════════
//
// RECHTSGRUNDLAGE: § 4 Abs. 5 Satz 1 Nr. 6c EStG (seit 2023 dauerhaft)
//
// OFFIZIELLE REGELUNG:
// - 6 Euro pro Tag, an dem die betriebliche/berufliche Tätigkeit
//   überwiegend in der häuslichen Wohnung ausgeübt wird
// - Maximum: 210 Tage pro Kalenderjahr
// - Höchstbetrag: 1.260 Euro pro Jahr (210 × 6€)
//
// QUELLEN:
// - BMF: https://www.bundesfinanzministerium.de (FAQ Homeoffice-Pauschale)
// - Gesetz: https://www.gesetze-im-internet.de/estg/__4.html
//
// WICHTIG:
// - Kein separates Arbeitszimmer erforderlich
// - Für denselben Tag KEINE Pendlerpauschale möglich
// - Zählt zu den Werbungskosten (Anlage N)
// ═══════════════════════════════════════════════════════════════════════════════

// Homeoffice-Pauschale seit 2023 (§ 4 Abs. 5 Satz 1 Nr. 6c EStG)
const HOMEOFFICE_PAUSCHALE_PRO_TAG = 6; // Offiziell: 6 Euro pro Tag
const HOMEOFFICE_MAX_TAGE = 210; // Offiziell: Maximum 210 Tage
const HOMEOFFICE_MAX_BETRAG = HOMEOFFICE_PAUSCHALE_PRO_TAG * HOMEOFFICE_MAX_TAGE; // = 1.260€

// Arbeitstage pro Woche Standard
const ARBEITSTAGE_PRO_WOCHE = [1, 2, 3, 4, 5] as const;

// Grenzsteuersätze zur Steuerersparnis-Schätzung
const GRENZSTEUERSAETZE = {
  niedrig: 0.14, // Grundfreibetrag gerade überschritten
  mittel: 0.30, // Durchschnitt
  hoch: 0.42, // Spitzensteuersatz
  reich: 0.45, // Reichensteuer
};

export default function HomeofficeRechner() {
  // Eingabewerte
  const [homeofficeTagePro_woche, setHomeofficeTagePro_woche] = useState(3);
  const [arbeitsWochenProJahr, setArbeitsWochenProJahr] = useState(46); // 52 - 6 Wochen Urlaub
  const [hatArbeitszimmer, setHatArbeitszimmer] = useState(false);
  const [arbeitszimmerKosten, setArbeitszimmerKosten] = useState(0);
  const [grenzsteuersatz, setGrenzsteuersatz] = useState<'niedrig' | 'mittel' | 'hoch' | 'reich'>('mittel');
  const [kirchensteuer, setKirchensteuer] = useState(false);

  const ergebnis = useMemo(() => {
    // Berechnung der Homeoffice-Tage pro Jahr
    const homeofficeTagePro_Jahr = homeofficeTagePro_woche * arbeitsWochenProJahr;
    
    // Anrechenbare Tage (max. 210)
    const anrechenbareTage = Math.min(homeofficeTagePro_Jahr, HOMEOFFICE_MAX_TAGE);
    
    // Homeoffice-Pauschale
    const homeofficePauschale = anrechenbareTage * HOMEOFFICE_PAUSCHALE_PRO_TAG;
    
    // Arbeitszimmer-Kosten (falls abziehbar)
    const arbeitszimmerAbzug = hatArbeitszimmer ? arbeitszimmerKosten : 0;
    
    // Gesamter Werbungskostenabzug
    const gesamtWerbungskosten = Math.max(homeofficePauschale, arbeitszimmerAbzug);
    
    // Welche Methode ist günstiger?
    const besserePauschale = homeofficePauschale >= arbeitszimmerAbzug;
    
    // Grenzsteuersatz + Soli (+ Kirchensteuer)
    let effektiverSteuersatz = GRENZSTEUERSAETZE[grenzsteuersatz];
    effektiverSteuersatz *= 1.055; // Soli
    if (kirchensteuer) {
      effektiverSteuersatz *= 1.085; // Kirchensteuer (8-9%)
    }
    
    // Steuerersparnis
    const steuerersparnis = Math.round(gesamtWerbungskosten * effektiverSteuersatz);
    
    // Wie viel über dem Maximum?
    const tageUeberMaximum = Math.max(0, homeofficeTagePro_Jahr - HOMEOFFICE_MAX_TAGE);
    const nichtAnrechenbareWerbungskosten = tageUeberMaximum * HOMEOFFICE_PAUSCHALE_PRO_TAG;
    
    return {
      homeofficeTagePro_Jahr,
      anrechenbareTage,
      tageUeberMaximum,
      nichtAnrechenbareWerbungskosten,
      homeofficePauschale,
      arbeitszimmerAbzug,
      gesamtWerbungskosten,
      besserePauschale,
      steuerersparnis,
      effektiverSteuersatz: Math.round(effektiverSteuersatz * 100),
      maxBetrag: HOMEOFFICE_MAX_BETRAG,
      maxTage: HOMEOFFICE_MAX_TAGE,
      pauschaleProTag: HOMEOFFICE_PAUSCHALE_PRO_TAG,
    };
  }, [
    homeofficeTagePro_woche,
    arbeitsWochenProJahr,
    hatArbeitszimmer,
    arbeitszimmerKosten,
    grenzsteuersatz,
    kirchensteuer,
  ]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }) + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Homeoffice-Tage pro Woche */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">
              Homeoffice-Tage pro Woche
            </span>
            <span className="text-xs text-gray-500 block mt-1">
              Wie viele Tage arbeiten Sie von zuhause?
            </span>
          </label>
          
          <div className="grid grid-cols-5 gap-2">
            {ARBEITSTAGE_PRO_WOCHE.map((tage) => (
              <button
                key={tage}
                onClick={() => setHomeofficeTagePro_woche(tage)}
                className={`py-4 px-2 rounded-xl text-center transition-all ${
                  homeofficeTagePro_woche === tage
                    ? 'bg-teal-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-2xl font-bold">{tage}</span>
                <span className="block text-xs mt-1">
                  {tage === 1 ? 'Tag' : 'Tage'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Arbeitswochen pro Jahr */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">
              Arbeitswochen pro Jahr
            </span>
            <span className="text-xs text-gray-500 block mt-1">
              52 Wochen abzüglich Urlaub, Krankheit, Feiertage
            </span>
          </label>
          
          <div className="relative">
            <input
              type="number"
              value={arbeitsWochenProJahr}
              onChange={(e) =>
                setArbeitsWochenProJahr(Math.min(52, Math.max(1, Number(e.target.value))))
              }
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none"
              min="1"
              max="52"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              Wochen
            </span>
          </div>
          
          <input
            type="range"
            value={arbeitsWochenProJahr}
            onChange={(e) => setArbeitsWochenProJahr(Number(e.target.value))}
            className="w-full mt-3 accent-teal-500"
            min="40"
            max="52"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>40 Wochen</span>
            <span>46 (Standard)</span>
            <span>52 Wochen</span>
          </div>
          
          <div className="mt-3 p-3 bg-teal-50 rounded-lg">
            <p className="text-sm text-teal-800">
              <strong>= {ergebnis.homeofficeTagePro_Jahr} Homeoffice-Tage</strong> pro Jahr
              {ergebnis.tageUeberMaximum > 0 && (
                <span className="text-amber-700 block mt-1">
                  ⚠️ Davon nur {ergebnis.anrechenbareTage} Tage anrechenbar (Maximum 210)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Grenzsteuersatz */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Ihr Grenzsteuersatz</span>
            <span className="text-xs text-gray-500 block mt-1">
              Für die Berechnung der Steuerersparnis
            </span>
          </label>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setGrenzsteuersatz('niedrig')}
              className={`py-3 px-4 rounded-xl text-left transition-all ${
                grenzsteuersatz === 'niedrig'
                  ? 'bg-teal-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="font-bold">~14%</span>
              <span className="block text-xs opacity-80">Niedriges Einkommen</span>
            </button>
            <button
              onClick={() => setGrenzsteuersatz('mittel')}
              className={`py-3 px-4 rounded-xl text-left transition-all ${
                grenzsteuersatz === 'mittel'
                  ? 'bg-teal-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="font-bold">~30%</span>
              <span className="block text-xs opacity-80">Mittleres Einkommen</span>
            </button>
            <button
              onClick={() => setGrenzsteuersatz('hoch')}
              className={`py-3 px-4 rounded-xl text-left transition-all ${
                grenzsteuersatz === 'hoch'
                  ? 'bg-teal-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="font-bold">~42%</span>
              <span className="block text-xs opacity-80">Hohes Einkommen</span>
            </button>
            <button
              onClick={() => setGrenzsteuersatz('reich')}
              className={`py-3 px-4 rounded-xl text-left transition-all ${
                grenzsteuersatz === 'reich'
                  ? 'bg-teal-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="font-bold">~45%</span>
              <span className="block text-xs opacity-80">Spitzensteuersatz</span>
            </button>
          </div>
        </div>

        {/* Arbeitszimmer */}
        <div className="mb-6">
          <button
            onClick={() => setHatArbeitszimmer(!hatArbeitszimmer)}
            className={`w-full py-4 px-4 rounded-xl font-medium transition-all flex items-center justify-between ${
              hatArbeitszimmer
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">🏠</span>
              <span>Häusliches Arbeitszimmer vorhanden?</span>
            </span>
            <span>{hatArbeitszimmer ? '✓ Ja' : '✗ Nein'}</span>
          </button>
          
          {hatArbeitszimmer && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">
                  Jährliche Kosten für das Arbeitszimmer
                </span>
                <span className="text-xs text-gray-500 block mt-1">
                  Anteilige Miete, Strom, Heizung, etc.
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={arbeitszimmerKosten}
                  onChange={(e) =>
                    setArbeitszimmerKosten(Math.max(0, Number(e.target.value)))
                  }
                  className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none"
                  min="0"
                  max="10000"
                  step="50"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  €/Jahr
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ℹ️ Das Arbeitszimmer muss der Mittelpunkt Ihrer beruflichen Tätigkeit sein
              </p>
            </div>
          )}
        </div>

        {/* Kirchensteuer */}
        <div>
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
      </div>

      {/* Result Section */}
      <div className="rounded-2xl shadow-lg p-6 text-white mb-6 bg-gradient-to-br from-teal-500 to-emerald-600">
        <h3 className="text-sm font-medium opacity-80 mb-1">
          🏡 Ihre Homeoffice-Pauschale 2025
        </h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.homeofficePauschale)}</span>
            <span className="text-xl opacity-80">/ Jahr</span>
          </div>
          <p className="text-teal-100 mt-2 text-sm">
            Für <strong>{ergebnis.anrechenbareTage} Homeoffice-Tage</strong> à {ergebnis.pauschaleProTag}€
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Werbungskosten</span>
            <div className="text-xl font-bold">
              {formatEuro(ergebnis.gesamtWerbungskosten)}
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Steuerersparnis</span>
            <div className="text-xl font-bold text-green-200">
              ~{formatEuro(ergebnis.steuerersparnis)}
            </div>
          </div>
        </div>

        {ergebnis.tageUeberMaximum > 0 && (
          <div className="mt-4 p-3 bg-amber-500/30 rounded-xl">
            <p className="text-sm">
              ⚠️ <strong>{ergebnis.tageUeberMaximum} Tage</strong> überschreiten das Maximum von 210 Tagen 
              ({formatEuro(ergebnis.nichtAnrechenbareWerbungskosten)} nicht anrechenbar)
            </p>
          </div>
        )}
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Homeoffice-Tage pro Woche</span>
            <span className="font-bold text-gray-900">
              {homeofficeTagePro_woche} Tage
            </span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">× Arbeitswochen pro Jahr</span>
            <span className="text-gray-900">
              {arbeitsWochenProJahr} Wochen
            </span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">= Homeoffice-Tage pro Jahr</span>
            <span className="font-medium text-gray-900">
              {ergebnis.homeofficeTagePro_Jahr} Tage
            </span>
          </div>
          
          {ergebnis.tageUeberMaximum > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-amber-600">
              <span>− Über Maximum (210 Tage)</span>
              <span>{ergebnis.tageUeberMaximum} Tage</span>
            </div>
          )}
          
          <div className="flex justify-between py-2 bg-gray-50 -mx-6 px-6">
            <span className="font-medium text-gray-700">Anrechenbare Tage</span>
            <span className="font-bold text-gray-900">
              {ergebnis.anrechenbareTage} Tage
            </span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">× Pauschale pro Tag</span>
            <span className="text-gray-900">{ergebnis.pauschaleProTag} €</span>
          </div>

          <div className="flex justify-between py-3 bg-teal-100 -mx-6 px-6 rounded-b-xl">
            <span className="font-bold text-teal-800">
              = Homeoffice-Pauschale
            </span>
            <span className="font-bold text-2xl text-teal-900">
              {formatEuro(ergebnis.homeofficePauschale)}
            </span>
          </div>
        </div>
      </div>

      {/* Vergleich: Pauschale vs. Arbeitszimmer */}
      {hatArbeitszimmer && arbeitszimmerKosten > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">📈 Pauschale vs. Arbeitszimmer</h3>
          
          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${ergebnis.besserePauschale ? 'bg-green-50 ring-2 ring-green-500' : 'bg-gray-50'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-800">
                  🏡 Homeoffice-Pauschale
                  {ergebnis.besserePauschale && <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Besser!</span>}
                </span>
                <span className="text-xl font-bold text-gray-900">{formatEuro(ergebnis.homeofficePauschale)}</span>
              </div>
              <p className="text-xs text-gray-600">
                6€/Tag × {ergebnis.anrechenbareTage} Tage – kein Nachweis nötig
              </p>
            </div>
            
            <div className={`p-4 rounded-xl ${!ergebnis.besserePauschale ? 'bg-green-50 ring-2 ring-green-500' : 'bg-gray-50'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-800">
                  🏠 Arbeitszimmer (tatsächliche Kosten)
                  {!ergebnis.besserePauschale && <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Besser!</span>}
                </span>
                <span className="text-xl font-bold text-gray-900">{formatEuro(ergebnis.arbeitszimmerAbzug)}</span>
              </div>
              <p className="text-xs text-gray-600">
                Nachweis erforderlich: Rechnungen, Kontoauszüge, Mietanteil
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-800">
                💡 <strong>Tipp:</strong> Sie können nur <em>eine</em> der beiden Methoden wählen – 
                nicht kombinieren. Nehmen Sie die mit dem höheren Abzug!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Steuerersparnis */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">💰 Ihre geschätzte Steuerersparnis</h3>
        
        <div className="p-4 bg-green-50 rounded-xl mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Werbungskostenabzug</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.gesamtWerbungskosten)}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-700">× Grenzsteuersatz (inkl. Soli/KiSt)</span>
            <span className="text-gray-900">~{ergebnis.effektiverSteuersatz}%</span>
          </div>
          <hr className="my-3 border-green-200" />
          <div className="flex justify-between items-center">
            <span className="font-bold text-green-800">≈ Steuerersparnis</span>
            <span className="text-2xl font-bold text-green-700">{formatEuro(ergebnis.steuerersparnis)}</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-500">
          * Dies ist eine Schätzung. Die tatsächliche Ersparnis hängt von Ihrer individuellen 
          Steuersituation ab und wird im Steuerbescheid festgelegt.
        </p>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Homeoffice-Pauschale</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>6 Euro pro Tag:</strong> Für jeden Tag, den Sie ausschließlich 
              im Homeoffice arbeiten
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Maximum 1.260€:</strong> Pro Jahr können maximal 210 Tage 
              (× 6€ = 1.260€) angesetzt werden
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Kein separates Zimmer nötig:</strong> Die Pauschale gilt auch, 
              wenn Sie am Küchentisch arbeiten
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Werbungskosten:</strong> Die Pauschale zählt zu den Werbungskosten 
              in Ihrer Steuererklärung (Anlage N)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Keine Pendlerpauschale:</strong> Für Homeoffice-Tage entfällt 
              die Entfernungspauschale
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Dauerhaft:</strong> Die Pauschale wurde seit 2023 dauerhaft 
              ins Steuerrecht aufgenommen
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
              <strong>Überwiegend Homeoffice:</strong> Die Pauschale gilt nur für Tage, 
              an denen Sie überwiegend von zuhause arbeiten
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Kein Doppelabzug:</strong> Für denselben Tag können Sie nicht 
              Homeoffice-Pauschale UND Pendlerpauschale ansetzen
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Werbungskostenpauschale:</strong> Die Homeoffice-Pauschale wird 
              mit der Werbungskostenpauschale (1.230€) verrechnet
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Nachweis:</strong> Bei Nachfrage vom Finanzamt: Arbeitgebernachweis 
              oder Aufzeichnungen über Homeoffice-Tage
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Arbeitszimmer-Wahl:</strong> Wenn Sie ein häusliches Arbeitszimmer 
              haben, wählen Sie die günstigere Option
            </span>
          </li>
        </ul>
      </div>

      {/* Regelungen 2025 */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-blue-800 mb-3">🆕 Regelungen 2025</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Pauschale:</strong> 6€ pro Tag (seit 2023 dauerhaft)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Maximum:</strong> 210 Tage = 1.260€ pro Jahr
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Werbungskostenpauschale:</strong> 1.230€ (davon profitieren 
              Sie nur, wenn Ihre Werbungskosten höher sind)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Pendlerpauschale:</strong> 0,30€/km (ab 21. km: 0,38€/km) – 
              nicht für Homeoffice-Tage
            </span>
          </li>
        </ul>
      </div>

      {/* Beispielrechnung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📝 Beispielrechnung: Lohnt sich Homeoffice?</h3>
        
        <div className="space-y-4 text-sm">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="font-semibold mb-2">Annahme: 3 Tage Homeoffice, 2 Tage Büro (30km Entfernung)</p>
            
            <div className="space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Homeoffice: 3 Tage × 46 Wochen × 6€</span>
                <span className="font-medium">828€</span>
              </div>
              <div className="flex justify-between">
                <span>Pendeln: 2 Tage × 46 Wochen × 30km × 0,30€ × 2</span>
                <span className="font-medium">1.656€</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold text-gray-800">
                <span>Gesamte Werbungskosten</span>
                <span>2.484€</span>
              </div>
              <div className="flex justify-between text-green-700">
                <span>- Werbungskostenpauschale</span>
                <span>1.230€</span>
              </div>
              <div className="flex justify-between font-bold text-green-800">
                <span>= Zusätzlicher Steuervorteil</span>
                <span>1.254€</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-teal-50 rounded-xl p-4">
            <p className="font-semibold text-teal-900">Finanzamt</p>
            <p className="text-sm text-teal-700 mt-1">
              Die Homeoffice-Pauschale wird in der Steuererklärung (Anlage N) geltend gemacht.
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
                <li>• Anlage N, Zeile 45: "Aufwendungen für ein häusliches Arbeitszimmer"</li>
                <li>• Anzahl der Homeoffice-Tage dokumentieren</li>
                <li>• Bei Prüfung: Bescheinigung vom Arbeitgeber hilfreich</li>
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
            href="/pendlerpauschale-rechner"
            className="inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            🛣️ Pendlerpauschale-Rechner →
          </a>
          <a
            href="/brutto-netto-rechner"
            className="inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            💵 Brutto-Netto-Rechner →
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
            href="https://www.gesetze-im-internet.de/estg/__4.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline font-medium"
          >
            ★ § 4 Abs. 5 Nr. 6c EStG – Tagespauschale (Gesetzestext)
          </a>
          <a
            href="https://www.bundesfinanzministerium.de/Content/DE/FAQ/Steuern/Home-Office-Pauschale/faq-homeoffice-pauschale.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF – FAQ Homeoffice-Pauschale
          </a>
          <a
            href="https://www.vlh.de/arbeiten-pendeln/beruf/homeoffice-pauschale-so-setzen-sie-die-kosten-ab.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            VLH – Homeoffice-Pauschale absetzen
          </a>
          <a
            href="https://www.haufe.de/steuern/finanzverwaltung/homeoffice-pauschale-wird-dauerhaft-eingefuehrt_164_586644.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Haufe – Homeoffice-Pauschale dauerhaft
          </a>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          <strong>Offizielle Berechnung:</strong><br/>
          Pauschale = Homeoffice-Tage × 6€ (max. 210 Tage = 1.260€/Jahr)
        </p>
      </div>
    </div>
  );
}
