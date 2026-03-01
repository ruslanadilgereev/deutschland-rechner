import { useState, useMemo } from 'react';

// Durchschnittsverbrauch in kWh/m²/Jahr nach Gebäudetyp
// Quelle: Heizspiegel 2025, co2online, BDEW
const VERBRAUCH_PRO_QM = {
  unsaniert: { kwhProQm: 180, label: 'Unsaniert (vor 1978)', beschreibung: 'Altbau ohne Dämmung' },
  teilsaniert: { kwhProQm: 130, label: 'Teilsaniert (1979-2001)', beschreibung: 'Mittlere Dämmung' },
  saniert: { kwhProQm: 100, label: 'Saniert/Neubau (ab 2002)', beschreibung: 'Gute Dämmung' },
  effizienzhaus: { kwhProQm: 60, label: 'Effizienzhaus/Passivhaus', beschreibung: 'Sehr gute Dämmung' },
};

// Energieträger mit Preisen und CO2-Emissionen
// Quellen: BDEW, BMWi, Heizspiegel 2025, co2online (Stand 2026)
// CO2-Preis 2026: 55 €/t (bereits in Preisen eingerechnet)
const ENERGIETRAEGER = {
  gas: {
    name: 'Erdgas',
    icon: '🔵',
    preis: 12, // ct/kWh inkl. CO2-Steuer
    co2: 201, // g/kWh
    grundpreis: 15, // €/Monat
    wirkungsgrad: 0.9, // 90% Wirkungsgrad
    beschreibung: 'Häufigste Heizungsart in Deutschland',
  },
  oel: {
    name: 'Heizöl',
    icon: '🟤',
    preis: 11, // ct/kWh inkl. CO2-Steuer
    co2: 266, // g/kWh
    grundpreis: 0, // Kein monatlicher Grundpreis (Tank)
    wirkungsgrad: 0.85,
    beschreibung: 'Ölheizung mit eigener Tankanlage',
  },
  fernwaerme: {
    name: 'Fernwärme',
    icon: '🔴',
    preis: 13, // ct/kWh (stark variierend nach Region)
    co2: 150, // g/kWh (Mix aus verschiedenen Quellen)
    grundpreis: 20,
    wirkungsgrad: 0.98,
    beschreibung: 'Wärme aus Kraftwerken/Industrie',
  },
  waermepumpe: {
    name: 'Wärmepumpe',
    icon: '💚',
    preis: 37, // ct/kWh Strom
    co2: 120, // g/kWh (Strommix)
    grundpreis: 12,
    wirkungsgrad: 3.5, // COP/JAZ (Jahresarbeitszahl)
    beschreibung: 'Nutzt Umweltwärme mit Strom',
  },
  pellets: {
    name: 'Holzpellets',
    icon: '🟠',
    preis: 7, // ct/kWh
    co2: 23, // g/kWh (nur Transport/Herstellung)
    grundpreis: 0,
    wirkungsgrad: 0.9,
    beschreibung: 'Erneuerbare Energie aus Holz',
  },
};

type EnergietraegerKey = keyof typeof ENERGIETRAEGER;
type GebaeudetypKey = keyof typeof VERBRAUCH_PRO_QM;
type EingabeModus = 'schaetzen' | 'eingeben';

// Spartipps mit Einsparpotenzial in Prozent
const SPARTIPPS = [
  { tipp: 'Temperatur um 1°C senken', ersparnis: 6, icon: '🌡️' },
  { tipp: 'Heizkörper entlüften', ersparnis: 5, icon: '💨' },
  { tipp: 'Heizkörper nicht zustellen', ersparnis: 8, icon: '🛋️' },
  { tipp: 'Rollläden nachts schließen', ersparnis: 5, icon: '🌙' },
  { tipp: 'Stoßlüften statt Kipplüften', ersparnis: 10, icon: '🪟' },
  { tipp: 'Thermostatventile nutzen', ersparnis: 10, icon: '🎛️' },
  { tipp: 'Hydraulischer Abgleich', ersparnis: 15, icon: '⚙️' },
  { tipp: 'Heizungsrohre dämmen', ersparnis: 8, icon: '🧱' },
];

export default function HeizkostenRechner() {
  const [modus, setModus] = useState<EingabeModus>('schaetzen');
  const [wohnflaeche, setWohnflaeche] = useState(80);
  const [gebaeudetyp, setGebaeudetyp] = useState<GebaeudetypKey>('teilsaniert');
  const [energietraeger, setEnergietraeger] = useState<EnergietraegerKey>('gas');
  const [verbrauchManuell, setVerbrauchManuell] = useState(10000);
  const [preis, setPreis] = useState(ENERGIETRAEGER.gas.preis);
  const [grundpreis, setGrundpreis] = useState(ENERGIETRAEGER.gas.grundpreis);

  // Preis automatisch anpassen bei Energieträger-Wechsel
  const handleEnergietraegerChange = (key: EnergietraegerKey) => {
    setEnergietraeger(key);
    setPreis(ENERGIETRAEGER[key].preis);
    setGrundpreis(ENERGIETRAEGER[key].grundpreis);
  };

  const ergebnis = useMemo(() => {
    const traeger = ENERGIETRAEGER[energietraeger];

    // Endenergieverbrauch berechnen (kWh)
    let endenergieverbrauch: number;
    if (modus === 'schaetzen') {
      const kwhProQm = VERBRAUCH_PRO_QM[gebaeudetyp].kwhProQm;
      endenergieverbrauch = wohnflaeche * kwhProQm;
    } else {
      endenergieverbrauch = verbrauchManuell;
    }

    // Bei Wärmepumpe: Stromverbrauch = Wärmebedarf / JAZ
    let tatsaechlicherVerbrauch: number;
    if (energietraeger === 'waermepumpe') {
      tatsaechlicherVerbrauch = endenergieverbrauch / traeger.wirkungsgrad;
    } else {
      // Bei anderen: Brennstoffverbrauch = Wärmebedarf / Wirkungsgrad
      tatsaechlicherVerbrauch = endenergieverbrauch / traeger.wirkungsgrad;
    }

    // Kosten berechnen
    const arbeitskosten = tatsaechlicherVerbrauch * (preis / 100);
    const grundkostenJahr = grundpreis * 12;
    const gesamtJahr = arbeitskosten + grundkostenJahr;
    const gesamtMonat = gesamtJahr / 12;
    const kostenProQm = wohnflaeche > 0 ? gesamtJahr / wohnflaeche : 0;

    // CO2-Emissionen
    const co2Jahr = (tatsaechlicherVerbrauch * traeger.co2) / 1000; // kg CO2

    // Vergleich mit anderen Energieträgern
    const vergleich = Object.entries(ENERGIETRAEGER).map(([key, t]) => {
      let verbrauch: number;
      if (key === 'waermepumpe') {
        verbrauch = endenergieverbrauch / t.wirkungsgrad;
      } else {
        verbrauch = endenergieverbrauch / t.wirkungsgrad;
      }
      const kosten = (verbrauch * (t.preis / 100)) + (t.grundpreis * 12);
      const co2 = (verbrauch * t.co2) / 1000;
      return {
        key,
        name: t.name,
        icon: t.icon,
        kosten: Math.round(kosten),
        co2: Math.round(co2),
      };
    }).sort((a, b) => a.kosten - b.kosten);

    // Einsparpotenzial durch Spartipps
    const maxErsparnisProzent = SPARTIPPS.reduce((sum, t) => sum + t.ersparnis, 0);
    const realErsparnisProzent = Math.min(maxErsparnisProzent, 30); // Maximal 30% realistisch
    const ersparnisPotenzial = gesamtJahr * (realErsparnisProzent / 100);

    return {
      endenergieverbrauch: Math.round(endenergieverbrauch),
      tatsaechlicherVerbrauch: Math.round(tatsaechlicherVerbrauch),
      arbeitskosten: Math.round(arbeitskosten),
      grundkostenJahr: Math.round(grundkostenJahr),
      gesamtJahr: Math.round(gesamtJahr),
      gesamtMonat: Math.round(gesamtMonat),
      kostenProQm: Math.round(kostenProQm * 100) / 100,
      co2Jahr: Math.round(co2Jahr),
      vergleich,
      ersparnisPotenzial: Math.round(ersparnisPotenzial),
    };
  }, [modus, wohnflaeche, gebaeudetyp, energietraeger, verbrauchManuell, preis, grundpreis]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';
  const formatKwh = (n: number) => n.toLocaleString('de-DE') + ' kWh';

  const traeger = ENERGIETRAEGER[energietraeger];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Energieträger-Auswahl */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Ihre Heizungsart</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(ENERGIETRAEGER).map(([key, t]) => (
              <button
                key={key}
                onClick={() => handleEnergietraegerChange(key as EnergietraegerKey)}
                className={`py-3 px-3 rounded-xl font-medium transition-colors text-sm ${
                  energietraeger === key
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-xl mr-1">{t.icon}</span> {t.name}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">{traeger.beschreibung}</p>
        </div>

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
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 Schätzen
            </button>
            <button
              onClick={() => setModus('eingeben')}
              className={`py-3 px-4 rounded-xl font-medium transition-colors ${
                modus === 'eingeben'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✏️ Selbst eingeben
            </button>
          </div>
        </div>

        {modus === 'schaetzen' ? (
          <>
            {/* Wohnfläche */}
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Wohnfläche</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={wohnflaeche}
                  onChange={(e) => setWohnflaeche(Math.max(1, Number(e.target.value)))}
                  className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                  min="1"
                  step="5"
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

            {/* Gebäudetyp */}
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Gebäudetyp / Dämmstandard</span>
              </label>
              <div className="space-y-2">
                {Object.entries(VERBRAUCH_PRO_QM).map(([key, g]) => (
                  <button
                    key={key}
                    onClick={() => setGebaeudetyp(key as GebaeudetypKey)}
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-colors text-left ${
                      gebaeudetyp === key
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{g.label}</span>
                        <p className={`text-sm ${gebaeudetyp === key ? 'text-orange-100' : 'text-gray-500'}`}>
                          {g.beschreibung}
                        </p>
                      </div>
                      <span className={`text-sm ${gebaeudetyp === key ? 'text-orange-100' : 'text-gray-500'}`}>
                        ~{g.kwhProQm} kWh/m²
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Manueller Verbrauch */
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">
                Ihr Jahresverbrauch ({energietraeger === 'waermepumpe' ? 'Strom für Heizung' : 'Heizenergie'})
              </span>
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
              min="1000"
              max="50000"
              step="500"
              value={verbrauchManuell}
              onChange={(e) => setVerbrauchManuell(Number(e.target.value))}
              className="w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1.000 kWh</span>
              <span>50.000 kWh</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              💡 Tipp: Den Verbrauch finden Sie auf Ihrer letzten Heizkostenabrechnung oder Gasrechnung
            </p>

            {/* Wohnfläche für Pro-qm-Berechnung */}
            <div className="mt-4">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Wohnfläche (für €/m² Berechnung)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={wohnflaeche}
                  onChange={(e) => setWohnflaeche(Math.max(1, Number(e.target.value)))}
                  className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                  min="1"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
              </div>
            </div>
          </div>
        )}

        <hr className="my-6 border-gray-200" />

        {/* Energiepreis-Einstellungen */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">⚡ Ihre Energiepreise</h3>

          {/* Arbeitspreis */}
          <div>
            <label className="flex justify-between mb-1">
              <span className="text-gray-600">
                {energietraeger === 'waermepumpe' ? 'Strompreis' : 'Energiepreis'}
              </span>
              <span className="font-bold text-orange-600">{preis} ct/kWh</span>
            </label>
            <input
              type="range"
              min={energietraeger === 'waermepumpe' ? 20 : 4}
              max={energietraeger === 'waermepumpe' ? 50 : 20}
              step="0.5"
              value={preis}
              onChange={(e) => setPreis(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{energietraeger === 'waermepumpe' ? '20' : '4'} ct</span>
              <span>Ø {traeger.preis} ct</span>
              <span>{energietraeger === 'waermepumpe' ? '50' : '20'} ct</span>
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
              min="0"
              max="40"
              step="1"
              value={grundpreis}
              onChange={(e) => setGrundpreis(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0 €</span>
              <span>Ø {traeger.grundpreis} €</span>
              <span>40 €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-orange-100 mb-1">Ihre geschätzten Heizkosten</h3>

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
            <span>Wärmebedarf</span>
            <span className="font-medium">{formatKwh(ergebnis.endenergieverbrauch)}</span>
          </div>
          {energietraeger === 'waermepumpe' && (
            <div className="flex justify-between text-orange-100">
              <span>Stromverbrauch (JAZ {traeger.wirkungsgrad})</span>
              <span className="font-medium">{formatKwh(ergebnis.tatsaechlicherVerbrauch)}</span>
            </div>
          )}
          <div className="flex justify-between text-orange-100">
            <span>Arbeitskosten ({preis} ct × {formatKwh(ergebnis.tatsaechlicherVerbrauch)})</span>
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
          <div className="flex justify-between text-orange-100 text-sm">
            <span>Kosten pro m²</span>
            <span>{ergebnis.kostenProQm.toFixed(2)} €/m²</span>
          </div>
        </div>
      </div>

      {/* CO2 und Umwelt */}
      <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🌍 CO₂-Emissionen</h3>
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold text-gray-800">{ergebnis.co2Jahr} kg</div>
          <div className="text-sm text-gray-600">
            CO₂ pro Jahr<br />
            <span className="text-gray-400">({traeger.co2} g/kWh × {formatKwh(ergebnis.tatsaechlicherVerbrauch)})</span>
          </div>
        </div>
        <div className="mt-3 h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              ergebnis.co2Jahr < 2000 ? 'bg-green-500' :
              ergebnis.co2Jahr < 4000 ? 'bg-yellow-500' :
              ergebnis.co2Jahr < 6000 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, (ergebnis.co2Jahr / 8000) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Niedrig</span>
          <span>Hoch</span>
        </div>
      </div>

      {/* Vergleich der Energieträger */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Vergleich der Heizungsarten</h3>
        <p className="text-sm text-gray-500 mb-4">
          Geschätzte Jahreskosten für Ihren Wärmebedarf von {formatKwh(ergebnis.endenergieverbrauch)}
        </p>

        <div className="space-y-3">
          {ergebnis.vergleich.map((v, idx) => {
            const isAktuell = v.key === energietraeger;
            const guenstigster = ergebnis.vergleich[0].kosten;
            const differenz = v.kosten - guenstigster;

            return (
              <div
                key={v.key}
                className={`p-4 rounded-xl ${
                  isAktuell ? 'bg-orange-50 border-2 border-orange-500' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{v.icon}</span>
                    <div>
                      <span className={`font-medium ${isAktuell ? 'text-orange-700' : 'text-gray-800'}`}>
                        {v.name}
                      </span>
                      {idx === 0 && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Günstigster
                        </span>
                      )}
                      {isAktuell && (
                        <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                          Ihre Heizung
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold text-lg ${isAktuell ? 'text-orange-700' : 'text-gray-800'}`}>
                      {formatEuro(v.kosten)}
                    </span>
                    {differenz > 0 && (
                      <p className="text-xs text-red-500">+{formatEuro(differenz)}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <span>🌍 {v.co2} kg CO₂/Jahr</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spartipps */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">💡 Heizkosten sparen – bis zu {formatEuro(ergebnis.ersparnisPotenzial)}/Jahr</h3>
        </div>

        <div className="space-y-3">
          {SPARTIPPS.map((tipp, idx) => {
            const ersparnis = Math.round(ergebnis.gesamtJahr * (tipp.ersparnis / 100));
            return (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tipp.icon}</span>
                  <span className="text-gray-700">{tipp.tipp}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-green-600">-{formatEuro(ersparnis)}</span>
                  <p className="text-xs text-gray-400">({tipp.ersparnis}%)</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info-Box */}
      <div className="bg-amber-50 rounded-2xl p-5 mb-6">
        <h3 className="font-bold text-amber-900 mb-2">ℹ️ Gut zu wissen</h3>
        <ul className="text-sm text-amber-800 space-y-2">
          <li>
            <strong>CO₂-Preis 2026:</strong> Die CO₂-Abgabe beträgt 55 €/Tonne und ist bereits in den 
            Durchschnittspreisen enthalten. 2027 könnte sie auf 65 €/t steigen.
          </li>
          <li>
            <strong>Wärmepumpe:</strong> Durch die Jahresarbeitszahl (JAZ) von ca. 3,5 erzeugt eine 
            Wärmepumpe aus 1 kWh Strom etwa 3,5 kWh Wärme – daher die niedrigen Heizkosten.
          </li>
          <li>
            <strong>Heizspiegel 2025:</strong> In einem 70m²-Haushalt kostet Gasheizung Ø 1.180 €/Jahr, 
            Fernwärme 1.245 €/Jahr und Heizöl 1.055 €/Jahr.
          </li>
          <li>
            <strong>Förderung:</strong> Beim Heizungstausch gibt es bis zu 70% Förderung durch BEG 
            (Bundesförderung für effiziente Gebäude).
          </li>
        </ul>
      </div>
    </div>
  );
}
