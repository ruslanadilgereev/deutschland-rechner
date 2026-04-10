import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Durchschnittsverbrauch in kWh/Jahr nach Haushaltsgröße (Gasheizung + Warmwasser)
// Quelle: BDEW, co2online, Verivox (Stand 2025/2026)
const VERBRAUCH_NACH_PERSONEN = [
  { personen: 1, kwh: 5000, label: '1 Person', wohnflaeche: 45 },
  { personen: 2, kwh: 12000, label: '2 Personen', wohnflaeche: 70 },
  { personen: 3, kwh: 16000, label: '3 Personen', wohnflaeche: 100 },
  { personen: 4, kwh: 20000, label: '4 Personen', wohnflaeche: 130 },
  { personen: 5, kwh: 24000, label: '5+ Personen', wohnflaeche: 160 },
];

// Verbrauch nach Wohnfläche (Durchschnitt ~140 kWh/m²/Jahr)
const KWH_PRO_QM = 140;

// Durchschnittlicher Gaspreis 2026 in ct/kWh
// Quellen: BDEW, Verivox, Finanztip (Stand Anfang 2026)
const DEFAULT_ARBEITSPREIS = 11; // ct/kWh (Durchschnitt Bestandskunden)
const DEFAULT_GRUNDPREIS = 12; // €/Monat

// Spartipps mit Einsparpotenzial in kWh/Jahr (bei 20.000 kWh Referenz)
const SPARTIPPS = [
  { tipp: 'Heizung 1°C niedriger einstellen', ersparnis: 1200, prozent: 6, icon: '🌡️' },
  { tipp: 'Stoßlüften statt Dauerlüften', ersparnis: 1000, prozent: 5, icon: '🪟' },
  { tipp: 'Heizkörper nicht zustellen', ersparnis: 600, prozent: 3, icon: '🛋️' },
  { tipp: 'Heizung nachts absenken (2-3°C)', ersparnis: 1000, prozent: 5, icon: '🌙' },
  { tipp: 'Rollläden nachts schließen', ersparnis: 400, prozent: 2, icon: '🏠' },
  { tipp: 'Hydraulischen Abgleich durchführen', ersparnis: 1400, prozent: 7, icon: '⚙️' },
  { tipp: 'Thermostatventile nutzen', ersparnis: 600, prozent: 3, icon: '🎛️' },
  { tipp: 'Warmwasser auf 55°C begrenzen', ersparnis: 400, prozent: 2, icon: '🚿' },
];

type EingabeModus = 'personen' | 'flaeche' | 'manuell';

export default function GaskostenRechner() {
  const [modus, setModus] = useState<EingabeModus>('personen');
  const [personen, setPersonen] = useState(2);
  const [wohnflaeche, setWohnflaeche] = useState(100);
  const [verbrauchManuell, setVerbrauchManuell] = useState(12000);
  const [arbeitspreis, setArbeitspreis] = useState(DEFAULT_ARBEITSPREIS);
  const [grundpreis, setGrundpreis] = useState(DEFAULT_GRUNDPREIS);
  const [altbau, setAltbau] = useState(false);

  const ergebnis = useMemo(() => {
    // Verbrauch ermitteln
    let verbrauch: number;
    if (modus === 'personen') {
      const eintrag = VERBRAUCH_NACH_PERSONEN.find(v => v.personen === personen) || VERBRAUCH_NACH_PERSONEN[1];
      verbrauch = eintrag.kwh;
      // Altbau-Zuschlag ~30%
      if (altbau) verbrauch = Math.round(verbrauch * 1.3);
    } else if (modus === 'flaeche') {
      // Altbau ~180 kWh/m², Neubau ~100 kWh/m², Durchschnitt ~140 kWh/m²
      const kwhProQm = altbau ? 180 : 140;
      verbrauch = Math.round(wohnflaeche * kwhProQm);
    } else {
      verbrauch = verbrauchManuell;
    }

    // Kosten berechnen
    const arbeitskosten = verbrauch * (arbeitspreis / 100); // Arbeitspreis in ct → €
    const grundkostenJahr = grundpreis * 12;
    const gesamtJahr = arbeitskosten + grundkostenJahr;
    const gesamtMonat = gesamtJahr / 12;

    // Durchschnittsvergleich (20.000 kWh als typischer Durchschnitt für Einfamilienhaus)
    const durchschnittVerbrauch = 20000;
    const durchschnittKosten = (durchschnittVerbrauch * (DEFAULT_ARBEITSPREIS / 100)) + (DEFAULT_GRUNDPREIS * 12);
    const differenzZumDurchschnitt = gesamtJahr - durchschnittKosten;

    // Kostenvergleich zur Gaspreisbremse (12 ct/kWh gedeckelt)
    const preisGaspreisbremse = 12; // ct/kWh (war gedeckelt auf 12 ct für 80% Verbrauch)
    const kostenMitBremse = (verbrauch * 0.8 * (preisGaspreisbremse / 100)) + (verbrauch * 0.2 * (arbeitspreis / 100)) + grundkostenJahr;

    // Einsparpotenzial durch Spartipps (skaliert auf aktuellen Verbrauch)
    const verbrauchsFaktor = verbrauch / 20000;
    const maxErsparnis = SPARTIPPS.reduce((sum, t) => sum + t.ersparnis, 0) * verbrauchsFaktor;
    const ersparnisPotenzial = maxErsparnis * (arbeitspreis / 100);

    // CO2-Bilanz (1 kWh Gas ≈ 0,2 kg CO2)
    const co2Ausstoss = Math.round(verbrauch * 0.2);

    return {
      verbrauch,
      arbeitskosten: Math.round(arbeitskosten),
      grundkostenJahr: Math.round(grundkostenJahr),
      gesamtJahr: Math.round(gesamtJahr),
      gesamtMonat: Math.round(gesamtMonat),
      differenzZumDurchschnitt: Math.round(differenzZumDurchschnitt),
      durchschnittKosten: Math.round(durchschnittKosten),
      durchschnittVerbrauch,
      ersparnisPotenzial: Math.round(ersparnisPotenzial),
      verbrauchsFaktor,
      co2Ausstoss,
      kostenMitBremse: Math.round(kostenMitBremse),
    };
  }, [modus, personen, wohnflaeche, verbrauchManuell, arbeitspreis, grundpreis, altbau]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';
  const formatKwh = (n: number) => n.toLocaleString('de-DE') + ' kWh';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Modus-Auswahl */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Wie möchten Sie Ihren Verbrauch ermitteln?</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setModus('personen')}
              className={`py-3 px-2 rounded-xl font-medium transition-colors text-sm ${
                modus === 'personen'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              👨‍👩‍👧 Personen
            </button>
            <button
              onClick={() => setModus('flaeche')}
              className={`py-3 px-2 rounded-xl font-medium transition-colors text-sm ${
                modus === 'flaeche'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📐 Wohnfläche
            </button>
            <button
              onClick={() => setModus('manuell')}
              className={`py-3 px-2 rounded-xl font-medium transition-colors text-sm ${
                modus === 'manuell'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✏️ kWh eingeben
            </button>
          </div>
        </div>

        {modus === 'personen' && (
          <>
            {/* Personen im Haushalt */}
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Personen im Haushalt</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {VERBRAUCH_NACH_PERSONEN.map((v) => (
                  <button
                    key={v.personen}
                    onClick={() => setPersonen(v.personen)}
                    className={`py-3 px-2 rounded-xl font-bold text-lg transition-colors ${
                      personen === v.personen
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {v.personen}{v.personen === 5 ? '+' : ''}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Ø Verbrauch {personen} {personen === 1 ? 'Person' : 'Personen'}: {formatKwh(
                  VERBRAUCH_NACH_PERSONEN.find(v => v.personen === personen)?.kwh || 0
                )}/Jahr
              </p>
            </div>
          </>
        )}

        {modus === 'flaeche' && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Wohnfläche (m²)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={wohnflaeche}
                onChange={(e) => setWohnflaeche(Math.max(20, Math.min(500, Number(e.target.value))))}
                className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                min="20"
                max="500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">m²</span>
            </div>
            <input
              type="range"
              min="20"
              max="300"
              step="5"
              value={wohnflaeche}
              onChange={(e) => setWohnflaeche(Number(e.target.value))}
              className="w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>20 m²</span>
              <span>300 m²</span>
            </div>
          </div>
        )}

        {modus === 'manuell' && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Ihr Jahresverbrauch (kWh)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={verbrauchManuell}
                onChange={(e) => setVerbrauchManuell(Math.max(0, Number(e.target.value)))}
                className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                min="0"
                step="500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">kWh</span>
            </div>
            <input
              type="range"
              min="2000"
              max="50000"
              step="500"
              value={verbrauchManuell}
              onChange={(e) => setVerbrauchManuell(Number(e.target.value))}
              className="w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>2.000 kWh</span>
              <span>50.000 kWh</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              💡 Tipp: Den Verbrauch finden Sie auf Ihrer letzten Gasrechnung
            </p>
          </div>
        )}

        {/* Altbau Toggle (nur bei Personen/Fläche) */}
        {modus !== 'manuell' && (
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={altbau}
                  onChange={(e) => setAltbau(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-colors ${
                  altbau ? 'bg-orange-500' : 'bg-gray-300'
                }`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    altbau ? 'translate-x-6' : ''
                  }`} />
                </div>
              </div>
              <span className="text-gray-700">
                🏚️ Altbau (Baujahr vor 1990, schlechtere Dämmung)
              </span>
            </label>
            {altbau && (
              <p className="text-sm text-amber-600 mt-2 ml-15">
                ⚠️ Altbauten verbrauchen durchschnittlich 30% mehr Gas durch höhere Wärmeverluste
              </p>
            )}
          </div>
        )}

        <hr className="my-6 border-gray-200" />

        {/* Gaspreis-Einstellungen */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">🔥 Ihre Gaspreise</h3>
          
          {/* Arbeitspreis */}
          <div>
            <label className="flex justify-between mb-1">
              <span className="text-gray-600">Arbeitspreis</span>
              <span className="font-bold text-orange-600">{arbeitspreis} ct/kWh</span>
            </label>
            <input
              type="range"
              min="6"
              max="20"
              step="0.5"
              value={arbeitspreis}
              onChange={(e) => setArbeitspreis(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>6 ct</span>
              <span>Ø {DEFAULT_ARBEITSPREIS} ct</span>
              <span>20 ct</span>
            </div>
          </div>

          {/* Grundpreis */}
          <div>
            <label className="flex justify-between mb-1">
              <span className="text-gray-600">Grundpreis</span>
              <span className="font-bold text-orange-600">{grundpreis} €/Monat</span>
            </label>
            <input
              type="range"
              min="5"
              max="25"
              step="0.5"
              value={grundpreis}
              onChange={(e) => setGrundpreis(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5 €</span>
              <span>Ø {DEFAULT_GRUNDPREIS} €</span>
              <span>25 €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-orange-100 mb-1">Ihre geschätzten Gaskosten</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.gesamtJahr)}</span>
            <span className="text-orange-200 text-xl">/Jahr</span>
          </div>
          <p className="text-orange-100 mt-2">
            ≈ <strong>{formatEuro(ergebnis.gesamtMonat)}</strong> pro Monat
          </p>
        </div>

        {/* Aufschlüsselung */}
        <div className="bg-white/10 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-orange-100">
            <span>Verbrauch</span>
            <span className="font-medium">{formatKwh(ergebnis.verbrauch)}</span>
          </div>
          <div className="flex justify-between text-orange-100">
            <span>Arbeitskosten ({arbeitspreis} ct × {formatKwh(ergebnis.verbrauch)})</span>
            <span className="font-medium">{formatEuro(ergebnis.arbeitskosten)}</span>
          </div>
          <div className="flex justify-between text-orange-100">
            <span>Grundpreis ({grundpreis} € × 12 Monate)</span>
            <span className="font-medium">{formatEuro(ergebnis.grundkostenJahr)}</span>
          </div>
          <hr className="border-white/20" />
          <div className="flex justify-between text-white font-bold">
            <span>Gesamt</span>
            <span>{formatEuro(ergebnis.gesamtJahr)}</span>
          </div>
        </div>
      </div>

      {/* Vergleiche */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Vergleich zum Durchschnitt */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h3 className="font-bold text-gray-800 mb-3">📊 Vergleich zum Durchschnitt</h3>
          <div className={`text-2xl font-bold mb-1 ${
            ergebnis.differenzZumDurchschnitt > 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            {ergebnis.differenzZumDurchschnitt > 0 ? '+' : ''}{formatEuro(ergebnis.differenzZumDurchschnitt)}
          </div>
          <p className="text-sm text-gray-500">
            Ø Einfamilienhaus: {formatKwh(ergebnis.durchschnittVerbrauch)}/Jahr ≈ {formatEuro(ergebnis.durchschnittKosten)}
          </p>
        </div>

        {/* CO2-Bilanz */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h3 className="font-bold text-gray-800 mb-3">🌍 CO₂-Bilanz</h3>
          <div className="text-2xl font-bold mb-1 text-gray-700">
            {(ergebnis.co2Ausstoss / 1000).toFixed(1)} Tonnen
          </div>
          <p className="text-sm text-gray-500">
            CO₂-Ausstoß pro Jahr (1 kWh Gas ≈ 0,2 kg CO₂)
          </p>
        </div>
      </div>

      {/* Spartipps */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">💡 Gas sparen – bis zu {formatEuro(ergebnis.ersparnisPotenzial)}/Jahr</h3>
        </div>
        
        <div className="space-y-3">
          {SPARTIPPS.map((tipp, idx) => {
            const ersparnisCt = Math.round(tipp.ersparnis * ergebnis.verbrauchsFaktor * (arbeitspreis / 100));
            const ersparnisKwh = Math.round(tipp.ersparnis * ergebnis.verbrauchsFaktor);
            return (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tipp.icon}</span>
                  <div>
                    <span className="text-gray-700">{tipp.tipp}</span>
                    <p className="text-xs text-gray-400">~{tipp.prozent}% Ersparnis</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-green-600">-{ersparnisCt} €</span>
                  <p className="text-xs text-gray-400">({ersparnisKwh} kWh)</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info-Box */}
      <div className="bg-blue-50 rounded-2xl p-5 mb-6">
        <h3 className="font-bold text-blue-900 mb-2">ℹ️ Gut zu wissen</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>
            <strong>Gaspreis 2026:</strong> Der durchschnittliche Gaspreis für Haushaltskunden liegt bei etwa 
            10-12 ct/kWh. Neukunden erhalten oft günstigere Tarife ab 8 ct/kWh.
          </li>
          <li>
            <strong>Gaspreisbremse:</strong> Die staatliche Gaspreisbremse (12 ct/kWh für 80% des Verbrauchs) 
            ist Ende 2023 ausgelaufen. Seitdem gelten wieder Marktpreise.
          </li>
          <li>
            <strong>Anbieterwechsel:</strong> Ein Wechsel über Vergleichsportale wie Check24 oder Verivox 
            kann mehrere Hundert Euro pro Jahr sparen.
          </li>
        </ul>
      <RechnerFeedback rechnerName="Gaskosten-Rechner" rechnerSlug="gaskosten-rechner" />
      </div>
    </div>
  );
}
