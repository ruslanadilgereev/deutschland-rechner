import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

/**
 * Elterngeld 2025/2026 - EXAKTE offizielle Berechnung
 * 
 * Rechtsgrundlage: § 2 Bundeselterngeld- und Elternzeitgesetz (BEEG)
 * Quellen:
 * - ZBFS Bayern: https://www.zbfs.bayern.de/familienleistungen/elterngeld/faq/berechnung_hoehe/
 * - Familienportal: https://familienportal.de/familienportal/familienleistungen/elterngeld
 * - § 2 Abs. 2 BEEG (Geringverdienerkomponente)
 * - § 2 Abs. 2 BEEG (Hochverdienerkomponente)
 * 
 * Ersatzraten-Staffelung (Stand 2025/2026):
 * - Unter 1.000€: 67% + 0,1 Prozentpunkte je 2€ unter 1.000€ (max. 100%)
 *   Formel: (1.000 - Netto) / 2 × 0,1% + 67%
 * - 1.000€ - 1.200€: 67%
 * - 1.200€ - 1.240€: Sinkt von 67% auf 65% (Abschmelzzone)
 *   Formel: 67% - (Netto - 1.200) / 2 × 0,1%
 * - Über 1.240€: 65%
 */
const ELTERNGELD_2026 = {
  minBasis: 300,     // Mindestbetrag Basiselterngeld (§ 2 Abs. 4 BEEG)
  maxBasis: 1800,    // Höchstbetrag Basiselterngeld (§ 2 Abs. 1 BEEG)
  minPlus: 150,      // Mindestbetrag ElterngeldPlus
  maxPlus: 900,      // Höchstbetrag ElterngeldPlus
  // Einkommensgrenzen für Ersatzraten-Staffelung
  geringverdienerGrenze: 1000,  // Unter 1.000€: Ersatzrate steigt
  basisGrenze: 1200,            // 1.000-1.200€: 67% Ersatzrate
  abschmelzungsEnde: 1240,      // Über 1.240€: 65% Ersatzrate
  // Ersatzraten
  ersatzrateMin: 0.65,    // Minimum bei hohem Einkommen
  ersatzrateBasis: 0.67,  // Standard bei 1.000-1.200€
  ersatzrateMax: 1.00,    // Maximum bei sehr geringem Einkommen (100%)
  einkommensgrenze: 175000, // Ab 1. April 2025: 175.000€ für ALLE (§ 1 Abs. 8 BEEG)
};

/**
 * Berechnet die Ersatzrate nach § 2 Abs. 2 BEEG
 * EXAKTE offizielle Formel
 */
function berechneErsatzrate(nettoMonat: number): number {
  if (nettoMonat < ELTERNGELD_2026.geringverdienerGrenze) {
    // GERINGVERDIENERKOMPONENTE (§ 2 Abs. 2 Satz 1 BEEG)
    // Formel: (1.000 - Netto) / 2 × 0,001 + 0,67
    // = 0,1 Prozentpunkte je 2€ unter 1.000€
    // Beispiel: Bei 600€: (1.000-600)/2 × 0,1% + 67% = 200 × 0,1% + 67% = 20% + 67% = 87%
    const differenz = ELTERNGELD_2026.geringverdienerGrenze - nettoMonat;
    const zusatz = (differenz / 2) * 0.001; // 0,1% = 0,001 pro 2€
    return Math.min(ELTERNGELD_2026.ersatzrateMax, ELTERNGELD_2026.ersatzrateBasis + zusatz);
  } else if (nettoMonat <= ELTERNGELD_2026.basisGrenze) {
    // STANDARDRATE: 1.000€ - 1.200€ → 67%
    return ELTERNGELD_2026.ersatzrateBasis;
  } else if (nettoMonat < ELTERNGELD_2026.abschmelzungsEnde) {
    // ABSCHMELZUNGSZONE: 1.200€ - 1.240€ → sinkt von 67% auf 65%
    // Formel: 67% - (Netto - 1.200) / 2 × 0,1%
    const differenz = nettoMonat - ELTERNGELD_2026.basisGrenze;
    const abzug = (differenz / 2) * 0.001;
    return Math.max(ELTERNGELD_2026.ersatzrateMin, ELTERNGELD_2026.ersatzrateBasis - abzug);
  } else {
    // ÜBER 1.240€: Minimum 65%
    return ELTERNGELD_2026.ersatzrateMin;
  }
}

function berechneElterngeld(nettoMonat: number): {
  basis: number;
  basisMonate: number;
  plus: number;
  plusMonate: number;
  ersatzrate: number;
} {
  // Ersatzrate nach exakter offizieller Formel berechnen
  const ersatzrate = berechneErsatzrate(nettoMonat);

  // Basiselterngeld
  let basis = Math.round(nettoMonat * ersatzrate);
  basis = Math.max(ELTERNGELD_2026.minBasis, Math.min(ELTERNGELD_2026.maxBasis, basis));

  // ElterngeldPlus = halber Satz, doppelte Dauer
  let plus = Math.round(basis / 2);
  plus = Math.max(ELTERNGELD_2026.minPlus, Math.min(ELTERNGELD_2026.maxPlus, plus));

  return {
    basis,
    basisMonate: 12, // bis zu 12 Monate (14 mit Partner)
    plus,
    plusMonate: 24,  // bis zu 24 Monate
    ersatzrate: Math.round(ersatzrate * 100),
  };
}

export default function ElterngeldRechner() {
  const [nettoMonat, setNettoMonat] = useState(2500);
  const [partnerMonate, setPartnerMonate] = useState(2);
  const [modus, setModus] = useState<'basis' | 'plus' | 'kombi'>('basis');

  const ergebnis = useMemo(() => {
    const eg = berechneElterngeld(nettoMonat);
    
    const verfuegbareMonate = 12 + partnerMonate; // Basis: 12 + 2 Partnermonate
    const verfuegbareMonatePlus = verfuegbareMonate * 2;
    
    let gesamtAuszahlung = 0;
    let beschreibung = '';
    
    switch (modus) {
      case 'basis':
        gesamtAuszahlung = eg.basis * verfuegbareMonate;
        beschreibung = `${verfuegbareMonate} Monate × ${eg.basis} €`;
        break;
      case 'plus':
        gesamtAuszahlung = eg.plus * verfuegbareMonatePlus;
        beschreibung = `${verfuegbareMonatePlus} Monate × ${eg.plus} €`;
        break;
      case 'kombi':
        // Beispiel: 6 Monate Basis + 12 Monate Plus
        const basisMonate = Math.ceil(verfuegbareMonate / 2);
        const plusMonate = (verfuegbareMonate - basisMonate) * 2;
        gesamtAuszahlung = (eg.basis * basisMonate) + (eg.plus * plusMonate);
        beschreibung = `${basisMonate}× Basis + ${plusMonate}× Plus`;
        break;
    }
    
    return {
      ...eg,
      verfuegbareMonate,
      verfuegbareMonatePlus,
      gesamtAuszahlung,
      beschreibung,
    };
  }, [nettoMonat, partnerMonate, modus]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Netto */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Dein Netto vor der Geburt</span>
            <span className="text-xs text-gray-500 ml-2">(Durchschnitt der letzten 12 Monate)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={nettoMonat}
              onChange={(e) => setNettoMonat(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 outline-none"
              min="0"
              step="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            min="0"
            max="5000"
            step="100"
            value={nettoMonat}
            onChange={(e) => setNettoMonat(Number(e.target.value))}
            className="w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
        </div>

        {/* Partnermonate */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Partnermonate</span>
            <span className="text-xs text-gray-500 ml-2">(0-2 zusätzliche Monate)</span>
          </label>
          <div className="flex gap-3">
            {[0, 1, 2].map((m) => (
              <button
                key={m}
                onClick={() => setPartnerMonate(m)}
                className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${
                  partnerMonate === m
                    ? 'bg-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {m} Monate
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            +2 Monate wenn beide Eltern mindestens 2 Monate Elterngeld beziehen
          </p>
        </div>

        {/* Modus */}
        <div>
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Variante</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setModus('basis')}
              className={`p-4 rounded-xl text-center transition-all ${
                modus === 'basis'
                  ? 'bg-pink-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="font-bold">Basis</div>
              <div className="text-xs mt-1 opacity-80">12-14 Monate</div>
            </button>
            <button
              onClick={() => setModus('plus')}
              className={`p-4 rounded-xl text-center transition-all ${
                modus === 'plus'
                  ? 'bg-pink-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="font-bold">Plus</div>
              <div className="text-xs mt-1 opacity-80">24-28 Monate</div>
            </button>
            <button
              onClick={() => setModus('kombi')}
              className={`p-4 rounded-xl text-center transition-all ${
                modus === 'kombi'
                  ? 'bg-pink-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="font-bold">Kombi</div>
              <div className="text-xs mt-1 opacity-80">Mix beider</div>
            </button>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-pink-100 mb-1">
          Dein Elterngeld ({modus === 'basis' ? 'Basis' : modus === 'plus' ? 'Plus' : 'Kombi'})
        </h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">
              {formatEuro(modus === 'basis' ? ergebnis.basis : modus === 'plus' ? ergebnis.plus : ergebnis.basis)}
            </span>
            <span className="text-xl text-pink-200">/ Monat</span>
          </div>
          <p className="text-pink-100 mt-2">
            = {ergebnis.ersatzrate}% von {formatEuro(nettoMonat)} Netto
          </p>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <span className="text-pink-100">Gesamt ({ergebnis.beschreibung})</span>
            <span className="text-xl font-bold">{formatEuro(ergebnis.gesamtAuszahlung)}</span>
          </div>
        </div>
      </div>

      {/* Vergleich */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Varianten im Vergleich</h3>
        <div className="space-y-3">
          <div className={`flex justify-between items-center p-4 rounded-xl ${modus === 'basis' ? 'bg-pink-50 border-2 border-pink-300' : 'bg-gray-50'}`}>
            <div>
              <p className="font-bold text-gray-800">Basiselterngeld</p>
              <p className="text-sm text-gray-500">{ergebnis.verfuegbareMonate} Monate × {formatEuro(ergebnis.basis)}</p>
            </div>
            <span className="text-xl font-bold text-gray-900">{formatEuro(ergebnis.basis * ergebnis.verfuegbareMonate)}</span>
          </div>
          
          <div className={`flex justify-between items-center p-4 rounded-xl ${modus === 'plus' ? 'bg-pink-50 border-2 border-pink-300' : 'bg-gray-50'}`}>
            <div>
              <p className="font-bold text-gray-800">ElterngeldPlus</p>
              <p className="text-sm text-gray-500">{ergebnis.verfuegbareMonatePlus} Monate × {formatEuro(ergebnis.plus)}</p>
            </div>
            <span className="text-xl font-bold text-gray-900">{formatEuro(ergebnis.plus * ergebnis.verfuegbareMonatePlus)}</span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-green-50 rounded-xl text-sm">
          <p className="text-green-800">
            <strong>💡 Tipp:</strong> ElterngeldPlus lohnt sich besonders bei Teilzeitarbeit während der Elternzeit!
          </p>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert's</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>65-100% des Nettos</strong> je nach Einkommen (§ 2 BEEG):<br/>
              • Unter 1.000€: 67% + 0,1% je 2€ (max. 100%)<br/>
              • 1.000-1.200€: 67%<br/>
              • Über 1.200€: sinkt auf 65%</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Min. 300 € / Max. 1.800 €</strong> pro Monat (Basiselterngeld)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>12 + 2 Partnermonate</strong> oder 24-28 Monate ElterngeldPlus</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Einkommensgrenze: <strong>175.000 €</strong> zu versteuerndes Einkommen (für alle seit April 2025)</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-pink-50 rounded-xl p-4">
            <p className="font-semibold text-pink-900">Elterngeldstelle deines Bundeslandes</p>
            <p className="text-sm text-pink-700 mt-1">Zuständig ist das Bundesland, in dem du mit dem Kind wohnst.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Online beantragen</p>
                <a 
                  href="https://www.elterngeld-digital.de/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  ElterngeldDigital →
                </a>
                <p className="text-xs text-gray-500 mt-1">In 10 Bundesländern verfügbar (BE, BB, HB, HH, MV, NI, RP, ST, SH, TH)</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Elterngeld-Hotline</p>
                <p className="text-gray-600">Je nach Bundesland verschieden</p>
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
              <p className="font-medium text-yellow-800">Antrag innerhalb von 3 Monaten!</p>
              <p className="text-yellow-700">Elterngeld wird max. 3 Monate rückwirkend gezahlt.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">📄</span>
            <div>
              <p className="font-medium text-blue-800">Benötigte Unterlagen</p>
              <p className="text-blue-700">Geburtsurkunde, Einkommensnachweise (letzte 12 Monate), Bescheinigung der Krankenkasse.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-purple-50 rounded-xl">
            <span className="text-xl">👶</span>
            <div>
              <p className="font-medium text-purple-800">Sonderregelungen</p>
              <p className="text-purple-700">
                <strong>Frühchen:</strong> Bis zu 4 Extra-Monate bei Geburt mindestens 6 Wochen vor dem errechneten Termin. 
                <strong> Mehrlinge:</strong> +300€ Zuschlag pro weiterem Kind. 
                <strong> Geschwisterbonus:</strong> +10% (min. 75€/37,50€) bei weiteren kleinen Kindern.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-orange-50 rounded-xl">
            <span className="text-xl">📅</span>
            <div>
              <p className="font-medium text-orange-800">Neuregelung seit April 2025</p>
              <p className="text-orange-700">Einheitliche Einkommensgrenze 175.000€ für alle. Gleichzeitiger Bezug nur noch 1 Monat in den ersten 12 Lebensmonaten möglich.</p>
            </div>
          </div>
        </div>
      </div>

            <RechnerFeedback rechnerName="Elterngeld-Rechner 2026" rechnerSlug="elterngeld-rechner" />

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://familienportal.de/familienportal/familienleistungen/elterngeld"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Familienportal – Elterngeld
          </a>
          <a 
            href="https://www.bmbfsfj.bund.de/bmbfsfj/themen/familie/familienleistungen/elterngeld"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMBFSFJ – Elterngeld & ElterngeldPlus
          </a>
        </div>
      </div>
    </div>
  );
}
