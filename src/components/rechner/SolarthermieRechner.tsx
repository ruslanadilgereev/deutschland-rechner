import { useState } from 'react';

// Auslegungs-Faustwerte Solarthermie (Stand 2026)
// Quellen: solaranlage-ratgeber.de (Dimensionierung), Viessmann (Solarthermie
// berechnen), HeizCenter (Dimensionierung & Planung 2026). Alle Werte sind
// Branchen-Richtwerte – die verbindliche Auslegung erfolgt durch einen
// Fachbetrieb unter Berücksichtigung von Standort, Dachausrichtung/-neigung
// und Verschattung.

// Kollektorfläche für reine Warmwasserbereitung pro Person (m²)
const FLAECHE_WW_PRO_PERSON = {
  flach: 1.5, // Flachkollektor (Range 0,8–1,5)
  roehre: 1.0, // Vakuumröhrenkollektor (Range 0,6–1,0)
};

// Flächenfaktor für Heizungsunterstützung je Gebäudestandard,
// bezogen auf den Flachkollektor (m² Kollektor je m² Wohnfläche)
const HEIZ_FAKTOR = {
  neubau: 0.05, // Neubau / KfW-Standard (Range 0,04–0,06)
  saniert: 0.07, // energetisch saniert (Range 0,06–0,08)
  unsaniert: 0.1, // unsanierter Altbau (Range 0,08–0,12)
};

// Vakuumröhren brauchen pro Quadratmeter Apertur weniger Fläche
// (ca. 0,7–0,75× der Flachkollektor-Fläche).
const ROEHRE_FAKTOR = 0.72;

// Speichervolumen
const SPEICHER_WW_PRO_PERSON = 80; // l/Person (ca. doppelter Tagesbedarf)
const SPEICHER_MIN = 200; // l Mindestgröße
const SPEICHER_KOMBI_PRO_M2 = { flach: 60, roehre: 80 }; // l je m² Kollektor

// Modulgröße (Apertur) eines Standard-Kollektors in m²
const MODUL_FLAECHE = { flach: 2.3, roehre: 2.0 };

// Solarer Deckungsgrad (Orientierung)
const DECKUNG_WW = 60; // % des Jahres-Warmwasserbedarfs
const DECKUNG_HEIZUNG = 20; // % des Jahres-Gesamtwärmebedarfs

type Kollektor = 'flach' | 'roehre';
type Modus = 'ww' | 'heizung';
type Standard = 'neubau' | 'saniert' | 'unsaniert';

export function SolarthermieRechner() {
  const [personen, setPersonen] = useState(4);
  const [kollektor, setKollektor] = useState<Kollektor>('flach');
  const [modus, setModus] = useState<Modus>('ww');
  const [wohnflaeche, setWohnflaeche] = useState(140);
  const [standard, setStandard] = useState<Standard>('saniert');

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  // Warmwasser-Kollektorfläche
  const flaecheWw = personen * FLAECHE_WW_PRO_PERSON[kollektor];

  // Heizungsunterstützungs-Kollektorfläche (Flachkollektor-Basis × Röhren-Korrektur)
  const flaecheHeizungFlach = wohnflaeche * HEIZ_FAKTOR[standard];
  const flaecheHeizung =
    kollektor === 'roehre' ? flaecheHeizungFlach * ROEHRE_FAKTOR : flaecheHeizungFlach;

  // Empfohlene Gesamt-Kollektorfläche
  const flaecheGesamt =
    modus === 'heizung' ? Math.max(flaecheWw, flaecheHeizung) : flaecheWw;

  // Speichervolumen
  const speicherWw = Math.max(SPEICHER_MIN, personen * SPEICHER_WW_PRO_PERSON);
  const speicherKombi = flaecheGesamt * SPEICHER_KOMBI_PRO_M2[kollektor];
  const speicher = modus === 'heizung' ? speicherKombi : speicherWw;

  // Anzahl Standard-Module (aufgerundet)
  const module =
    flaecheGesamt > 0 ? Math.ceil(flaecheGesamt / MODUL_FLAECHE[kollektor]) : 0;

  // Solarer Deckungsgrad
  const deckung = modus === 'heizung' ? DECKUNG_HEIZUNG : DECKUNG_WW;

  const formatM2 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const formatLiter = (v: number) =>
    Math.round(v).toLocaleString('de-DE', { maximumFractionDigits: 0 });

  const kollektorLabel = kollektor === 'flach' ? 'Flachkollektor' : 'Vakuumröhrenkollektor';
  const standardLabel =
    standard === 'neubau' ? 'Neubau' : standard === 'saniert' ? 'saniert' : 'unsanierter Altbau';

  return (
    <div className="max-w-lg mx-auto">

      {/* Nutzungsart */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Nutzungsart</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setModus('ww')}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
              modus === 'ww'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-2xl">🚿</span>
            <span className="text-center leading-tight">Nur Warmwasser</span>
          </button>
          <button
            onClick={() => setModus('heizung')}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
              modus === 'heizung'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-2xl">🔥</span>
            <span className="text-center leading-tight">Warmwasser + Heizung</span>
          </button>
        </div>
      </div>

      {/* Kollektortyp */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Kollektortyp</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setKollektor('flach')}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
              kollektor === 'flach'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-2xl">🟦</span>
            <span className="text-center leading-tight">Flachkollektor</span>
          </button>
          <button
            onClick={() => setKollektor('roehre')}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
              kollektor === 'roehre'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-2xl">🟫</span>
            <span className="text-center leading-tight">Vakuumröhre</span>
          </button>
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Personen im Haushalt</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={20}
              value={personen}
              onChange={(e) => setPersonen(Math.min(20, toNumber(e.target.value)))}
              className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Personen</span>
          </div>
        </label>

        {modus === 'heizung' && (
          <>
            <label className="block">
              <span className="text-gray-700 font-medium">Beheizte Wohnfläche</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={wohnflaeche}
                  onChange={(e) => setWohnflaeche(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
              </div>
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">Gebäudestandard (Dämmung)</span>
              <select
                value={standard}
                onChange={(e) => setStandard(e.target.value as Standard)}
                className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl text-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="neubau">Neubau / gut gedämmt (Faktor 0,05)</option>
                <option value="saniert">Energetisch saniert (Faktor 0,07)</option>
                <option value="unsaniert">Unsanierter Altbau (Faktor 0,10)</option>
              </select>
            </label>
          </>
        )}
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Empfohlene Auslegung</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatM2(flaecheGesamt)}</span>
            <span className="text-xl text-blue-200">m² Kollektorfläche</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            ≈ {module} Standard-{kollektor === 'flach' ? 'Flachkollektoren' : 'Röhrenkollektoren'}
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">{modus === 'heizung' ? 'Kombispeicher' : 'Warmwasserspeicher'}</span>
              <span className="text-xl font-bold">{formatLiter(speicher)} l</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Solarer Deckungsgrad (ca.)</span>
              <span className="font-bold">
                {modus === 'heizung' ? '15–25 %' : '50–65 %'} (≈ {deckung} %)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          {modus === 'ww' ? (
            <>
              <p>
                <strong>Kollektorfläche</strong> = Personen × {formatM2(FLAECHE_WW_PRO_PERSON[kollektor])} m² ({kollektorLabel})
              </p>
              <p>
                = {personen} × {formatM2(FLAECHE_WW_PRO_PERSON[kollektor])} ={' '}
                <strong>{formatM2(flaecheGesamt)} m²</strong>
              </p>
              <p>
                <strong>Speicher</strong> = Personen × {SPEICHER_WW_PRO_PERSON} l (min. {SPEICHER_MIN} l) ={' '}
                <strong>{formatLiter(speicher)} l</strong>
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>Fläche Warmwasser</strong> = {personen} × {formatM2(FLAECHE_WW_PRO_PERSON[kollektor])} m² ={' '}
                {formatM2(flaecheWw)} m²
              </p>
              <p>
                <strong>Fläche Heizung</strong> = {formatM2(wohnflaeche)} m² × {formatM2(HEIZ_FAKTOR[standard])}
                {kollektor === 'roehre' ? ` × ${formatM2(ROEHRE_FAKTOR)}` : ''} ({standardLabel}) ={' '}
                {formatM2(flaecheHeizung)} m²
              </p>
              <p>
                <strong>Empfehlung</strong> = größerer Wert ={' '}
                <strong>{formatM2(flaecheGesamt)} m²</strong>
              </p>
              <p>
                <strong>Kombispeicher</strong> = {formatM2(flaecheGesamt)} m² × {SPEICHER_KOMBI_PRO_M2[kollektor]} l/m² ={' '}
                <strong>{formatLiter(speicher)} l</strong>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Das Ergebnis sind unverbindliche Orientierungswerte auf Basis von
          Branchen-Faustregeln. Die verbindliche Anlagenauslegung – inklusive Dachausrichtung,
          Dachneigung, Verschattung, Speichergröße und hydraulischem Abgleich – muss durch einen
          Fachbetrieb oder Energieberater erfolgen. Keine Förder- oder BAFA-Beratung, keine
          Energieberatung. Alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default SolarthermieRechner;
