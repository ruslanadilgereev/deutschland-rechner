import { useState, useMemo } from 'react';

// ============================================================================
// Taxikosten-Rechner
// Schätzung des Fahrpreises nach dem kommunalen Taxameter-Tarif:
//   Fahrpreis ≈ Grundpreis + (Strecke_km × km-Tarif) + (Wartezeit_min × Zeit-Tarif)
//
// WICHTIG: Taxitarife werden gemäß § 51 PBefG kommunal von der jeweiligen
// Landesregierung/Behörde per Rechtsverordnung festgesetzt – es gibt KEINE
// bundeseinheitliche amtliche Tariftabelle. Die Presets sind nur Orientierung
// (ohne Gewähr) mit dem angegebenen Stand und können sich jederzeit ändern.
//
// Berlin/Hamburg/Köln haben gestaffelte km-Tarife (teurer auf kurzer Strecke).
// Dieser Rechner nutzt EINEN km-Tarif (vereinfachter Standardkilometer) – als
// Default ist der gestaffelte Höchstwert der ersten km hinterlegt, da die
// meisten Taxifahrten Kurzstrecke sind. Gestaffelte Stadttarife weichen leicht ab.
// ============================================================================

interface TaxiPreset {
  name: string;
  grundpreis: number;       // €
  kmTarif: number;          // €/km (Stadtkilometer / Standardkilometer)
  zeitTarifProMin: number;  // €/min
  grossraumZuschlag: number; // € (optional, nicht in Hauptrechnung)
  stand: string;
}

// Stadt-Presets – Orientierung ohne Gewähr (§ 51 PBefG, kommunal geregelt)
const TAXI_PRESETS: Record<string, TaxiPreset> = {
  berlin: {
    name: 'Berlin',
    grundpreis: 4.30,
    kmTarif: 2.80,
    zeitTarifProMin: 0.50, // = 30 €/h
    grossraumZuschlag: 6,
    stand: 'Senatsbeschluss, gültig ab 20.12.2022. km-Tarif gestaffelt (2,80 / 2,60 / 2,10 €/km ab 7 km) – hier Stadtkilometer 2,80 €/km.',
  },
  hamburg: {
    name: 'Hamburg',
    grundpreis: 4.50,
    kmTarif: 2.70,
    zeitTarifProMin: 0.63, // = 38 €/h
    grossraumZuschlag: 8,
    stand: 'Gültig ab 01.02.2025. km-Tarif gestaffelt (bis 9 km 2,70 €/km, ab 9 km 2,00 €/km) – hier Stadtkilometer 2,70 €/km.',
  },
  muenchen: {
    name: 'München',
    grundpreis: 5.90,
    kmTarif: 2.70,
    zeitTarifProMin: 0.65, // = 39 €/h
    grossraumZuschlag: 10,
    stand: 'Taxitarifverordnung, Stand 2025.',
  },
  koeln: {
    name: 'Köln',
    grundpreis: 4.90,
    kmTarif: 2.90,
    zeitTarifProMin: 0.60, // = 36 €/h
    grossraumZuschlag: 6,
    stand: 'Gültig ab 01.06.2026.',
  },
  frankfurt: {
    name: 'Frankfurt a.M.',
    grundpreis: 4.00,
    kmTarif: 2.40,
    zeitTarifProMin: 0.63, // = 38 €/h
    grossraumZuschlag: 7,
    stand: 'Amtsblatt-Taxentarif, Stand 2025.',
  },
};

type PresetKey = keyof typeof TAXI_PRESETS;

export default function TaxikostenRechner() {
  const [streckeKm, setStreckeKm] = useState(8);
  const [wartezeitMin, setWartezeitMin] = useState(0);
  const [stadt, setStadt] = useState<PresetKey>('berlin');
  const [verwendeManuell, setVerwendeManuell] = useState(false);

  // Tarif-Felder (mit Preset-Defaults vorbefüllt)
  const [grundpreis, setGrundpreis] = useState(TAXI_PRESETS.berlin.grundpreis);
  const [kmTarif, setKmTarif] = useState(TAXI_PRESETS.berlin.kmTarif);
  const [zeitTarifProMin, setZeitTarifProMin] = useState(TAXI_PRESETS.berlin.zeitTarifProMin);

  // Stadt-Preset auswählen → Tarif-Felder mit Default-Werten befüllen, Flag zurücksetzen
  const handleStadtChange = (key: PresetKey) => {
    setStadt(key);
    setVerwendeManuell(false);
    setGrundpreis(TAXI_PRESETS[key].grundpreis);
    setKmTarif(TAXI_PRESETS[key].kmTarif);
    setZeitTarifProMin(TAXI_PRESETS[key].zeitTarifProMin);
  };

  const ergebnis = useMemo(() => {
    const kostenStrecke = streckeKm * kmTarif;
    const kostenWartezeit = wartezeitMin * zeitTarifProMin;
    const gesamt = grundpreis + kostenStrecke + kostenWartezeit;
    const proKm = streckeKm > 0 ? gesamt / streckeKm : 0;

    return {
      kostenStrecke,
      kostenWartezeit,
      gesamt,
      proKm,
    };
  }, [streckeKm, wartezeitMin, grundpreis, kmTarif, zeitTarifProMin]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatNumber = (n: number, decimals = 1) => n.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  const aktuellesPreset = TAXI_PRESETS[stadt];

  return (
    <div className="max-w-2xl mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">

        {/* Stadt-Preset */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Stadt / Tarif</span>
            <span className="text-xs text-gray-500 block mt-1">
              Wählen Sie eine Stadt – die Tarife werden als Orientierung vorbefüllt
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(Object.entries(TAXI_PRESETS) as [PresetKey, TaxiPreset][]).map(([key, value]) => (
              <button
                key={key}
                onClick={() => handleStadtChange(key)}
                className={`py-3 px-3 rounded-xl font-medium transition-all text-sm ${
                  stadt === key && !verwendeManuell
                    ? 'bg-amber-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-lg">🚕</span>
                <span className="block mt-1">{value.name}</span>
              </button>
            ))}
          </div>
          {verwendeManuell && (
            <p className="text-sm text-amber-600 mt-2 text-center">
              Manuelle Tarife – Sie haben einen Wert geändert
            </p>
          )}
        </div>

        {/* Strecke */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Fahrstrecke</span>
            <span className="text-xs text-gray-500 block mt-1">
              Gefahrene Entfernung in Kilometern
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={streckeKm}
              onChange={(e) => setStreckeKm(Number(e.target.value))}
              className="w-full p-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-lg"
              min="0"
              max="500"
              step="0.5"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">km</span>
          </div>
          <input
            type="range"
            value={streckeKm}
            onChange={(e) => setStreckeKm(Number(e.target.value))}
            className="w-full mt-2 accent-amber-500"
            min="0"
            max="50"
            step="0.5"
          />
        </div>

        {/* Wartezeit */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Wartezeit</span>
            <span className="text-xs text-gray-500 block mt-1">
              Standzeit (Stau, Ampel, Warten) in Minuten – optional
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={wartezeitMin}
              onChange={(e) => setWartezeitMin(Number(e.target.value))}
              className="w-full p-4 pr-16 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-lg"
              min="0"
              max="120"
              step="1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">min</span>
          </div>
          <input
            type="range"
            value={wartezeitMin}
            onChange={(e) => setWartezeitMin(Number(e.target.value))}
            className="w-full mt-2 accent-amber-500"
            min="0"
            max="60"
            step="1"
          />
        </div>

        {/* Tarife (editierbar) */}
        <div className="mb-2">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Tarife ({aktuellesPreset.name})</span>
            <span className="text-xs text-gray-500 block mt-1">
              Vorbefüllt aus dem Stadt-Preset – Sie können die Werte anpassen
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-xs text-gray-500 block mb-1">Grundpreis</span>
              <div className="relative">
                <input
                  type="number"
                  value={grundpreis}
                  onChange={(e) => {
                    setGrundpreis(Number(e.target.value));
                    setVerwendeManuell(true);
                  }}
                  className="w-full p-3 pr-8 border-2 border-gray-200 rounded-xl focus:border-orange-500 text-center"
                  min="0"
                  max="20"
                  step="0.10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">km-Tarif</span>
              <div className="relative">
                <input
                  type="number"
                  value={kmTarif}
                  onChange={(e) => {
                    setKmTarif(Number(e.target.value));
                    setVerwendeManuell(true);
                  }}
                  className="w-full p-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-orange-500 text-center"
                  min="0"
                  max="10"
                  step="0.05"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">€/km</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">Wartetarif</span>
              <div className="relative">
                <input
                  type="number"
                  value={zeitTarifProMin}
                  onChange={(e) => {
                    setZeitTarifProMin(Number(e.target.value));
                    setVerwendeManuell(true);
                  }}
                  className="w-full p-3 pr-14 border-2 border-gray-200 rounded-xl focus:border-orange-500 text-center"
                  min="0"
                  max="5"
                  step="0.01"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">€/min</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            ⚠️ <strong>Orientierung ohne Gewähr.</strong> Taxitarife sind kommunal nach § 51 PBefG geregelt und können sich ändern.
            Der km-Tarif ist ein vereinfachter Standardkilometer; gestaffelte Stadttarife (z.&nbsp;B. Berlin/Hamburg/Köln) weichen leicht ab.
            Stand: {aktuellesPreset.stand}
          </p>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🚕 Geschätzter Fahrpreis</h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.gesamt)}</span>
          </div>
          <p className="text-amber-100 mt-2 text-sm">
            {formatNumber(streckeKm, 1)} km{wartezeitMin > 0 ? ` • ${formatNumber(wartezeitMin, 0)} min Warten` : ''} • {aktuellesPreset.name}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Pro Kilometer</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.proKm)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Grundpreis</span>
            <div className="text-xl font-bold">{formatEuro(grundpreis)}</div>
          </div>
        </div>
      </div>

      {/* Kostenaufschlüsselung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Kostenaufschlüsselung</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Grundpreis</span>
            <span className="font-bold text-gray-900">{formatEuro(grundpreis)}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Strecke ({formatNumber(streckeKm, 1)} km × {formatEuro(kmTarif)}/km)</span>
            <span className="text-gray-900">{formatEuro(ergebnis.kostenStrecke)}</span>
          </div>

          {wartezeitMin > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Wartezeit ({formatNumber(wartezeitMin, 0)} min × {formatEuro(zeitTarifProMin)}/min)</span>
              <span className="text-gray-900">{formatEuro(ergebnis.kostenWartezeit)}</span>
            </div>
          )}

          <div className="flex justify-between py-3 bg-amber-50 -mx-6 px-6 mt-4">
            <span className="font-bold text-amber-800">Fahrpreis gesamt (ca.)</span>
            <span className="font-bold text-2xl text-amber-900">{formatEuro(ergebnis.gesamt)}</span>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-600">
            <strong>Formel:</strong> {formatEuro(grundpreis)} Grundpreis + {formatNumber(streckeKm, 1)} km × {formatEuro(kmTarif)}/km{wartezeitMin > 0 ? ` + ${formatNumber(wartezeitMin, 0)} min × ${formatEuro(zeitTarifProMin)}/min` : ''} = {formatEuro(ergebnis.gesamt)}
          </p>
        </div>
      </div>

      {/* Großraumtaxi-Zuschlag (Info) */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🚐 Großraumtaxi-Zuschlag</h3>
        <p className="text-sm text-gray-600 mb-4">
          Für größere Gruppen fällt in vielen Städten ein Zuschlag für ein Großraumtaxi an
          (nicht in der Berechnung oben enthalten):
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Stadt</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Zuschlag (ca.)</th>
              </tr>
            </thead>
            <tbody>
              {(Object.entries(TAXI_PRESETS) as [PresetKey, TaxiPreset][]).map(([key, value]) => (
                <tr key={key} className={`border-b border-gray-100 ${stadt === key && !verwendeManuell ? 'bg-amber-50' : ''}`}>
                  <td className="py-3 px-4 text-gray-600">{value.name}</td>
                  <td className="py-3 px-4 text-center font-bold">+ {formatEuro(value.grossraumZuschlag)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Hamburg: Zuschlag ab mehr als 4 Personen. Beträge sind Orientierungswerte – maßgeblich ist der örtliche Tarif.
        </p>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So schätzen Sie Ihre Taxikosten</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Formel:</strong> Grundpreis + (Strecke × km-Tarif) + (Wartezeit × Wartetarif)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Beispiel Berlin:</strong> 4,30 € + 8 km × 2,80 € = 26,70 € (ca.)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Wartezeit:</strong> Im Stau oder an der Ampel läuft der Zeittarif weiter – das treibt den Preis in der Stadt</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Kommunal geregelt:</strong> Jede Stadt setzt ihren Tarif nach § 51 PBefG selbst fest – eine bundeseinheitliche Tabelle gibt es nicht</span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <p className="text-sm text-amber-800">
          <strong>Hinweis:</strong> Schätzung – keine Steuer- oder Rechtsberatung. Taxitarife werden gemäß
          § 51 PBefG kommunal von der jeweiligen Landesregierung bzw. Behörde per Rechtsverordnung festgesetzt
          und unterscheiden sich von Stadt zu Stadt; eine bundeseinheitliche amtliche Tariftabelle gibt es nicht.
          Die hinterlegten Stadt-Presets dienen nur als Orientierung (ohne Gewähr) mit dem angegebenen Stand und
          können sich jederzeit ändern – maßgeblich ist der aktuelle Taxameter-Tarif vor Ort. Für vorbestellte
          Fahrten gelten in mehreren Städten zusätzlich Tarifkorridore bzw. Festpreise.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Links</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/pbefg/__51.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 51 PBefG – Beförderungsentgelte und -bedingungen im Taxenverkehr
          </a>
          <a
            href="http://gesetze.berlin.de/jportal/?aiz=true&max=true&psml=bsbeprod.psml&quelle=jlink&query=TaxO+BE"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Taxenordnung Berlin (TaxO BE) – Berlin.de Rechtsvorschriften
          </a>
          <a
            href="https://www.berlin.de/rbmskzl/aktuelles/pressemitteilungen/2022/pressemitteilung.1262657.php"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Senatskanzlei Berlin – Pressemitteilung Taxitarif (gültig ab 20.12.2022)
          </a>
          <a
            href="https://www.hamburg.de/politik-und-verwaltung/behoerden/bvm/die-themen-der-behoerde/fuer-taxi-fahrgaeste/taxi-fahrpreise-410302"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Behörde für Verkehr und Mobilitätswende Hamburg – Taxi-Fahrpreise
          </a>
          <a
            href="https://www.stadt-koeln.de/politik-und-verwaltung/presse/mitteilungen/28285/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Stadt Köln – Mitteilung neuer Taxitarif (gültig ab 01.06.2026)
          </a>
        </div>
      </div>
    </div>
  );
}
