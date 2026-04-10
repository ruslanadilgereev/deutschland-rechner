import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Durchschnittsverbrauch in kWh/Jahr nach Haushaltsgröße
// Quelle: BDEW, co2online (Stand 2025)
const VERBRAUCH_NACH_PERSONEN = [
  { personen: 1, kwhMitWarmwasser: 2000, kwhOhneWarmwasser: 1500, label: '1 Person' },
  { personen: 2, kwhMitWarmwasser: 3200, kwhOhneWarmwasser: 2400, label: '2 Personen' },
  { personen: 3, kwhMitWarmwasser: 4200, kwhOhneWarmwasser: 3200, label: '3 Personen' },
  { personen: 4, kwhMitWarmwasser: 5000, kwhOhneWarmwasser: 4000, label: '4 Personen' },
  { personen: 5, kwhMitWarmwasser: 5800, kwhOhneWarmwasser: 4600, label: '5+ Personen' },
];

// Durchschnittlicher Strompreis 2026 in ct/kWh
// Quellen: Verivox, Check24, co2online (Stand Anfang 2026)
const DEFAULT_ARBEITSPREIS = 37; // ct/kWh
const DEFAULT_GRUNDPREIS = 12; // €/Monat

// Spartipps mit Einsparpotenzial in kWh/Jahr
const SPARTIPPS = [
  { tipp: 'LED-Lampen statt Glühbirnen', ersparnis: 80, icon: '💡' },
  { tipp: 'Standby vermeiden (Steckerleiste mit Schalter)', ersparnis: 100, icon: '🔌' },
  { tipp: 'Kühlschrank auf 7°C, Gefrierschrank auf -18°C', ersparnis: 50, icon: '❄️' },
  { tipp: 'Wäsche bei 30°C statt 60°C waschen', ersparnis: 70, icon: '👕' },
  { tipp: 'Wäschetrockner weniger nutzen', ersparnis: 200, icon: '☀️' },
  { tipp: 'Energieeffiziente Geräte (A+++)', ersparnis: 150, icon: '⚡' },
  { tipp: 'Wasserkocher statt Herd nutzen', ersparnis: 30, icon: '🫖' },
  { tipp: 'Spülmaschine statt Handwäsche', ersparnis: 50, icon: '🍽️' },
];

type EingabeModus = 'schaetzen' | 'eingeben';

export default function StromkostenRechner() {
  const [modus, setModus] = useState<EingabeModus>('schaetzen');
  const [personen, setPersonen] = useState(2);
  const [warmwasser, setWarmwasser] = useState(false);
  const [verbrauchManuell, setVerbrauchManuell] = useState(2500);
  const [arbeitspreis, setArbeitspreis] = useState(DEFAULT_ARBEITSPREIS);
  const [grundpreis, setGrundpreis] = useState(DEFAULT_GRUNDPREIS);

  const ergebnis = useMemo(() => {
    // Verbrauch ermitteln
    let verbrauch: number;
    if (modus === 'schaetzen') {
      const eintrag = VERBRAUCH_NACH_PERSONEN.find(v => v.personen === personen) || VERBRAUCH_NACH_PERSONEN[4];
      verbrauch = warmwasser ? eintrag.kwhMitWarmwasser : eintrag.kwhOhneWarmwasser;
    } else {
      verbrauch = verbrauchManuell;
    }

    // Kosten berechnen
    const arbeitskosten = verbrauch * (arbeitspreis / 100); // Arbeitspreis in ct → €
    const grundkostenJahr = grundpreis * 12;
    const gesamtJahr = arbeitskosten + grundkostenJahr;
    const gesamtMonat = gesamtJahr / 12;

    // Durchschnittsvergleich (2 Personen ohne Warmwasser als Referenz)
    const durchschnittVerbrauch = VERBRAUCH_NACH_PERSONEN.find(v => v.personen === personen)?.kwhOhneWarmwasser || 2400;
    const durchschnittKosten = (durchschnittVerbrauch * (DEFAULT_ARBEITSPREIS / 100)) + (DEFAULT_GRUNDPREIS * 12);
    const differenzZumDurchschnitt = gesamtJahr - durchschnittKosten;

    // Kostenvergleich Vorjahr (2024/2025 Preise waren ca. 5% höher)
    const preisVorjahr = 41; // ct/kWh
    const kostenVorjahr = (verbrauch * (preisVorjahr / 100)) + grundkostenJahr;
    const ersparnisSeitVorjahr = kostenVorjahr - gesamtJahr;

    // Einsparpotenzial durch Spartipps
    const maxErsparnis = SPARTIPPS.reduce((sum, t) => sum + t.ersparnis, 0);
    const ersparnisPotenzial = maxErsparnis * (arbeitspreis / 100);

    return {
      verbrauch,
      arbeitskosten: Math.round(arbeitskosten),
      grundkostenJahr: Math.round(grundkostenJahr),
      gesamtJahr: Math.round(gesamtJahr),
      gesamtMonat: Math.round(gesamtMonat),
      differenzZumDurchschnitt: Math.round(differenzZumDurchschnitt),
      ersparnisSeitVorjahr: Math.round(ersparnisSeitVorjahr),
      ersparnisPotenzial: Math.round(ersparnisPotenzial),
      durchschnittVerbrauch,
    };
  }, [modus, personen, warmwasser, verbrauchManuell, arbeitspreis, grundpreis]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';
  const formatKwh = (n: number) => n.toLocaleString('de-DE') + ' kWh';

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Stromkosten-Rechner" rechnerSlug="stromkosten-rechner" />

{/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Modus-Auswahl */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Wie möchten Sie Ihren Verbrauch ermitteln?</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setModus('schaetzen')}
              className={`py-3 px-4 rounded-xl font-medium transition-colors ${
                modus === 'schaetzen'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 Schätzen
            </button>
            <button
              onClick={() => setModus('eingeben')}
              className={`py-3 px-4 rounded-xl font-medium transition-colors ${
                modus === 'eingeben'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✏️ Selbst eingeben
            </button>
          </div>
        </div>

        {modus === 'schaetzen' ? (
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
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {v.personen}{v.personen === 5 ? '+' : ''}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Durchschnitt {personen} {personen === 1 ? 'Person' : 'Personen'}: {formatKwh(
                  VERBRAUCH_NACH_PERSONEN.find(v => v.personen === personen)?.kwhOhneWarmwasser || 0
                )}/Jahr
              </p>
            </div>

            {/* Warmwasser elektrisch */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={warmwasser}
                    onChange={(e) => setWarmwasser(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-12 h-6 rounded-full transition-colors ${
                    warmwasser ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      warmwasser ? 'translate-x-6' : ''
                    }`} />
                  </div>
                </div>
                <span className="text-gray-700">
                  🚿 Warmwasser wird elektrisch erzeugt (Durchlauferhitzer/Boiler)
                </span>
              </label>
              {warmwasser && (
                <p className="text-sm text-amber-600 mt-2 ml-15">
                  ⚡ Erhöht den Verbrauch um ca. {
                    ((VERBRAUCH_NACH_PERSONEN.find(v => v.personen === personen)?.kwhMitWarmwasser || 0) -
                    (VERBRAUCH_NACH_PERSONEN.find(v => v.personen === personen)?.kwhOhneWarmwasser || 0))
                  } kWh/Jahr
                </p>
              )}
            </div>
          </>
        ) : (
          /* Manueller Verbrauch */
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Ihr Jahresverbrauch (kWh)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={verbrauchManuell}
                onChange={(e) => setVerbrauchManuell(Math.max(0, Number(e.target.value)))}
                className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
                min="0"
                step="100"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">kWh</span>
            </div>
            <input
              type="range"
              min="500"
              max="10000"
              step="100"
              value={verbrauchManuell}
              onChange={(e) => setVerbrauchManuell(Number(e.target.value))}
              className="w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>500 kWh</span>
              <span>10.000 kWh</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              💡 Tipp: Den Verbrauch finden Sie auf Ihrer letzten Stromrechnung
            </p>
          </div>
        )}

        <hr className="my-6 border-gray-200" />

        {/* Strompreis-Einstellungen */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">⚡ Ihre Strompreise</h3>
          
          {/* Arbeitspreis */}
          <div>
            <label className="flex justify-between mb-1">
              <span className="text-gray-600">Arbeitspreis</span>
              <span className="font-bold text-emerald-600">{arbeitspreis} ct/kWh</span>
            </label>
            <input
              type="range"
              min="20"
              max="60"
              step="0.5"
              value={arbeitspreis}
              onChange={(e) => setArbeitspreis(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>20 ct</span>
              <span>Ø {DEFAULT_ARBEITSPREIS} ct</span>
              <span>60 ct</span>
            </div>
          </div>

          {/* Grundpreis */}
          <div>
            <label className="flex justify-between mb-1">
              <span className="text-gray-600">Grundpreis</span>
              <span className="font-bold text-emerald-600">{grundpreis} €/Monat</span>
            </label>
            <input
              type="range"
              min="5"
              max="25"
              step="0.5"
              value={grundpreis}
              onChange={(e) => setGrundpreis(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
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
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-emerald-100 mb-1">Ihre geschätzten Stromkosten</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.gesamtJahr)}</span>
            <span className="text-emerald-200 text-xl">/Jahr</span>
          </div>
          <p className="text-emerald-100 mt-2">
            ≈ <strong>{formatEuro(ergebnis.gesamtMonat)}</strong> pro Monat
          </p>
        </div>

        {/* Aufschlüsselung */}
        <div className="bg-white/10 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-emerald-100">
            <span>Verbrauch</span>
            <span className="font-medium">{formatKwh(ergebnis.verbrauch)}</span>
          </div>
          <div className="flex justify-between text-emerald-100">
            <span>Arbeitskosten ({arbeitspreis} ct × {formatKwh(ergebnis.verbrauch)})</span>
            <span className="font-medium">{formatEuro(ergebnis.arbeitskosten)}</span>
          </div>
          <div className="flex justify-between text-emerald-100">
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
            Ø-Verbrauch {personen} {personen === 1 ? 'Person' : 'Personen'}: {formatKwh(ergebnis.durchschnittVerbrauch)}/Jahr
          </p>
        </div>

        {/* Vergleich zum Vorjahr */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h3 className="font-bold text-gray-800 mb-3">📅 Entwicklung seit 2024</h3>
          <div className={`text-2xl font-bold mb-1 ${
            ergebnis.ersparnisSeitVorjahr > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {ergebnis.ersparnisSeitVorjahr > 0 ? '-' : '+'}{formatEuro(Math.abs(ergebnis.ersparnisSeitVorjahr))}
          </div>
          <p className="text-sm text-gray-500">
            Strompreise sind seit 2024 gesunken (von ~41 ct auf ~{arbeitspreis} ct/kWh)
          </p>
        </div>
      </div>

      {/* Spartipps */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">💡 Strom sparen – bis zu {formatEuro(ergebnis.ersparnisPotenzial)}/Jahr</h3>
        </div>
        
        <div className="space-y-3">
          {SPARTIPPS.map((tipp, idx) => {
            const ersparnisCt = Math.round(tipp.ersparnis * (arbeitspreis / 100));
            return (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tipp.icon}</span>
                  <span className="text-gray-700">{tipp.tipp}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-green-600">-{ersparnisCt} €</span>
                  <p className="text-xs text-gray-400">({tipp.ersparnis} kWh)</p>
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
            <strong>Strompreis 2026:</strong> Nach dem Auslaufen der Strompreisbremse Ende 2023 haben sich 
            die Preise bei durchschnittlich 35-40 ct/kWh eingependelt.
          </li>
          <li>
            <strong>Arbeitspreis vs. Grundpreis:</strong> Der Arbeitspreis berechnet sich pro verbrauchter kWh, 
            der Grundpreis ist eine monatliche Pauschale für Zähler und Netzanschluss.
          </li>
          <li>
            <strong>Anbieterwechsel:</strong> Vergleichsportale wie Check24 oder Verivox zeigen, 
            dass ein Wechsel oft 100-300 € pro Jahr sparen kann.
          </li>
        </ul>
</div>
    </div>
  );
}
