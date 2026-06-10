import { useState } from 'react';

// Abriss-Faustwerte Stand Juni 2026.
// Quellen: Talu.de (Abbruchkosten pro m3 umbauter Raum), immoverkauf24
// (Abrisskosten Haus), Sparkasse Immobilien (Abrissgenehmigung).
// Werte sind Marktrichtwerte – verbindliche Preise nur per Vor-Ort-Angebot
// eines Abbruch-Fachbetriebs.

// Schnellmodus: Abriss pro m2 Wohnflaeche (inkl. Entsorgung, ohne Keller/Asbest).
const PREIS_PRO_M2_DEFAULT = 75; // EUR/m2 Wohnflaeche (Spanne 50-100)

// Detailmodus: Abbruchpreis pro m3 umbauter Raum je Bauart (inkl. Entsorgung).
type Bauart = {
  name: string;
  icon: string;
  preisProM3: number; // EUR je m3 umbauter Raum
};

const BAUARTEN: Bauart[] = [
  { name: 'Leichtbau / Holz', icon: '🪵', preisProM3: 25 },
  { name: 'Massivbau', icon: '🧱', preisProM3: 40 },
  { name: 'Industrie / Stahlbeton', icon: '🏭', preisProM3: 55 },
];

// Zuschlaege (Detailmodus)
const KELLER_ZUSCHLAG_PRO_M2 = 60; // EUR je m2 Grundflaeche fuer Keller-/Bodenplattenrueckbau
const ASBEST_PRO_M2 = 50; // EUR je m2 Asbestflaeche (Sanierung nach TRGS 519)
const ZUGANG_ZUSCHLAG_PROZENT = 15; // % Aufschlag bei beengter/innerstaedtischer Lage
const GENEHMIGUNG_PAUSCHAL = 600; // EUR Abrissgenehmigung (Spanne 200-1.000)

export function HausabrissKostenRechner() {
  const [modus, setModus] = useState<'wohnflaeche' | 'umbau'>('wohnflaeche');

  // Schnellmodus
  const [wohnflaeche, setWohnflaeche] = useState(140);
  const [preisProM2, setPreisProM2] = useState(PREIS_PRO_M2_DEFAULT);

  // Detailmodus
  const [bauartIndex, setBauartIndex] = useState(1);
  const [grundflaeche, setGrundflaeche] = useState(100);
  const [hoehe, setHoehe] = useState(6);

  // Zuschlaege (beide Modi nutzen sie im Detailmodus)
  const [keller, setKeller] = useState(true);
  const [asbest, setAsbest] = useState(false);
  const [asbestFlaeche, setAsbestFlaeche] = useState(120);
  const [zugang, setZugang] = useState(false);
  const [genehmigung, setGenehmigung] = useState(true);

  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  // --- Schnellmodus ---
  const kostenSchnell = wohnflaeche * preisProM2;

  // --- Detailmodus ---
  const umbauterRaum = grundflaeche * hoehe; // m3
  const bauart = BAUARTEN[bauartIndex];
  const kostenAbbruch = umbauterRaum * bauart.preisProM3;
  const kostenKeller = keller ? grundflaeche * KELLER_ZUSCHLAG_PRO_M2 : 0;
  const kostenAsbest = asbest ? asbestFlaeche * ASBEST_PRO_M2 : 0;

  // Basis fuer den Zugangs-Zuschlag (Abbruch + Keller), nicht auf Asbest/Genehmigung
  const detailBasis = kostenAbbruch + kostenKeller;
  const kostenZugang = zugang ? detailBasis * (ZUGANG_ZUSCHLAG_PROZENT / 100) : 0;
  const kostenGenehmigung = genehmigung ? GENEHMIGUNG_PAUSCHAL : 0;

  const kostenDetail =
    kostenAbbruch + kostenKeller + kostenAsbest + kostenZugang + kostenGenehmigung;

  // Aktiver Gesamtwert
  const gesamt = modus === 'wohnflaeche' ? kostenSchnell : kostenDetail;

  const formatEuro = (v: number) =>
    Math.round(v).toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatZahl = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

  // Realistische Spanne (+/- 20 %) fuer das Ergebnis
  const spanneVon = gesamt * 0.8;
  const spanneBis = gesamt * 1.2;

  return (
    <div className="max-w-lg mx-auto">

      {/* Modus-Auswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Berechnungsmodus</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setModus('wohnflaeche')}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
              modus === 'wohnflaeche'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-2xl">⚡</span>
            <span className="text-center leading-tight">Schnell (Wohnfläche)</span>
          </button>
          <button
            onClick={() => setModus('umbau')}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
              modus === 'umbau'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-2xl">📐</span>
            <span className="text-center leading-tight">Detailliert (umbauter Raum)</span>
          </button>
        </div>
      </div>

      {/* Schnellmodus-Eingaben */}
      {modus === 'wohnflaeche' && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
          <label className="block">
            <span className="text-gray-700 font-medium">Wohnfläche des Gebäudes</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                value={wohnflaeche}
                onChange={(e) => setWohnflaeche(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
            </div>
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium">Abrisspreis pro m² Wohnfläche</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                value={preisProM2}
                onChange={(e) => setPreisProM2(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/m²</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">
              Faustwert inkl. Entsorgung: 50–100 €/m². Voreinstellung 75 €/m². Keller, Asbest und beengte Lage treiben den Preis nach oben – dafür den Detailmodus nutzen.
            </span>
          </label>
        </div>
      )}

      {/* Detailmodus-Eingaben */}
      {modus === 'umbau' && (
        <>
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <span className="text-gray-700 font-medium block mb-3">Bauart</span>
            <div className="grid grid-cols-3 gap-2">
              {BAUARTEN.map((b, i) => (
                <button
                  key={b.name}
                  onClick={() => setBauartIndex(i)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                    bauartIndex === i
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-2xl">{b.icon}</span>
                  <span className="text-center leading-tight">{b.name}</span>
                  <span className="text-[10px] text-gray-400">{b.preisProM3} €/m³</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
            <label className="block">
              <span className="text-gray-700 font-medium">Grundfläche (bebaute Fläche)</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={grundflaeche}
                  onChange={(e) => setGrundflaeche(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
              </div>
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">Gebäudehöhe (Außenmaß)</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.5}
                  value={hoehe}
                  onChange={(e) => setHoehe(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                Faustregel: ca. 3 m je Geschoss. Ein Bungalow ≈ 3 m, ein zweigeschossiges Haus ≈ 6 m, mit Spitzdach etwas mehr.
              </span>
            </label>

            <div className="bg-blue-50 rounded-xl p-3 text-sm text-gray-700">
              Umbauter Raum = {formatZahl(grundflaeche)} m² × {formatZahl(hoehe)} m ={' '}
              <strong>{formatZahl(umbauterRaum)} m³</strong>
            </div>

            {/* Zuschlaege */}
            <div className="border-t border-gray-100 pt-4 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keller}
                  onChange={(e) => setKeller(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 font-medium">
                  Keller / Bodenplatte zurückbauen
                  <span className="block text-xs font-normal text-gray-400">
                    + {KELLER_ZUSCHLAG_PRO_M2} €/m² Grundfläche
                  </span>
                </span>
              </label>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={asbest}
                    onChange={(e) => setAsbest(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 font-medium">
                    Asbest / Schadstoffe sanieren
                    <span className="block text-xs font-normal text-gray-400">
                      + {ASBEST_PRO_M2} €/m² Schadstofffläche (TRGS 519)
                    </span>
                  </span>
                </label>
                {asbest && (
                  <label className="block mt-3 ml-8">
                    <span className="text-sm text-gray-600">Belastete Fläche (Dach/Fassade)</span>
                    <div className="mt-2 relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        value={asbestFlaeche}
                        onChange={(e) => setAsbestFlaeche(toNumber(e.target.value))}
                        className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
                    </div>
                  </label>
                )}
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={zugang}
                  onChange={(e) => setZugang(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 font-medium">
                  Beengte / innerstädtische Lage
                  <span className="block text-xs font-normal text-gray-400">
                    + {ZUGANG_ZUSCHLAG_PROZENT}% (Staubschutz, Handarbeit, Logistik)
                  </span>
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={genehmigung}
                  onChange={(e) => setGenehmigung(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 font-medium">
                  Abrissgenehmigung einrechnen
                  <span className="block text-xs font-normal text-gray-400">
                    + {GENEHMIGUNG_PAUSCHAL} € Pauschale (Spanne 200–1.000 €)
                  </span>
                </span>
              </label>
            </div>
          </div>
        </>
      )}

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Geschätzte Abrisskosten</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatEuro(gesamt)}</span>
            <span className="text-xl text-blue-200">€</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            realistische Spanne {formatEuro(spanneVon)} – {formatEuro(spanneBis)} €
          </p>
        </div>

        {modus === 'umbau' && (
          <div className="space-y-3">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">Abbruch ({formatZahl(umbauterRaum)} m³)</span>
                <span className="font-bold">{formatEuro(kostenAbbruch)} €</span>
              </div>
            </div>
            {keller && (
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-100">Keller / Bodenplatte</span>
                  <span className="font-bold">{formatEuro(kostenKeller)} €</span>
                </div>
              </div>
            )}
            {asbest && (
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-100">Asbest-Sanierung</span>
                  <span className="font-bold">{formatEuro(kostenAsbest)} €</span>
                </div>
              </div>
            )}
            {zugang && (
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-100">Lage-Zuschlag ({ZUGANG_ZUSCHLAG_PROZENT}%)</span>
                  <span className="font-bold">{formatEuro(kostenZugang)} €</span>
                </div>
              </div>
            )}
            {genehmigung && (
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-100">Abrissgenehmigung</span>
                  <span className="font-bold">{formatEuro(kostenGenehmigung)} €</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          {modus === 'wohnflaeche' ? (
            <>
              <p>
                <strong>Kosten</strong> = Wohnfläche × Preis pro m²
              </p>
              <p>
                = {formatZahl(wohnflaeche)} m² × {formatEuro(preisProM2)} € ={' '}
                <strong>{formatEuro(kostenSchnell)} €</strong>
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>Umbauter Raum</strong> = {formatZahl(grundflaeche)} m² ×{' '}
                {formatZahl(hoehe)} m = {formatZahl(umbauterRaum)} m³
              </p>
              <p>
                <strong>Abbruch</strong> = {formatZahl(umbauterRaum)} m³ × {bauart.preisProM3} €/m³ ={' '}
                {formatEuro(kostenAbbruch)} €
              </p>
              {keller && (
                <p>
                  + Keller/Bodenplatte = {formatZahl(grundflaeche)} m² × {KELLER_ZUSCHLAG_PRO_M2} € ={' '}
                  {formatEuro(kostenKeller)} €
                </p>
              )}
              {asbest && (
                <p>
                  + Asbest = {formatZahl(asbestFlaeche)} m² × {ASBEST_PRO_M2} € ={' '}
                  {formatEuro(kostenAsbest)} €
                </p>
              )}
              {zugang && (
                <p>
                  + Lage-Zuschlag = {ZUGANG_ZUSCHLAG_PROZENT}% × {formatEuro(detailBasis)} € ={' '}
                  {formatEuro(kostenZugang)} €
                </p>
              )}
              {genehmigung && <p>+ Genehmigung = {formatEuro(kostenGenehmigung)} €</p>}
              <p className="pt-1 border-t border-blue-100">
                <strong>Summe = {formatEuro(kostenDetail)} €</strong>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Das Ergebnis ist eine unverbindliche Schätzung auf Basis von
          Faustwerten und Marktpreisen 2026. Verbindliche Kosten erhalten Sie nur über ein
          Vor-Ort-Angebot eines Abbruch-Fachbetriebs. Asbest- und Schadstoffrückbau darf rechtlich
          nur von Betrieben mit Sachkundenachweis nach <strong>TRGS 519</strong> ausgeführt werden;
          Asbest ist Sondermüll mit Entsorgungsnachweispflicht. Für den Abriss ist je nach Bundesland
          und Bebauungsplan ggf. eine <strong>Abrissgenehmigung</strong> erforderlich. Alle Angaben
          ohne Gewähr – keine Bau-, Statik- oder Rechtsberatung.
        </p>
      </div>
    </div>
  );
}

export default HausabrissKostenRechner;
