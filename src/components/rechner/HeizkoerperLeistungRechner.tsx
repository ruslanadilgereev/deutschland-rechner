import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Spezifische Heizlast (Richtwerte in W/m2) nach Bau-/Daemmstandard.
// Grobe Orientierungswerte fuer ueberschlaegige Auslegung – die exakte
// raumweise Heizlast wird nach DIN EN 12831 berechnet.
// Quellen: bosy-online, Recknagel, Heizungsbauer-Faustwerte (Stand 2026).
type Daemmstandard = {
  name: string;
  icon: string;
  wPerM2: number;
  hinweis: string;
};

const DAEMMSTANDARDS: Daemmstandard[] = [
  { name: 'Altbau unsaniert (vor 1977)', icon: '🏚️', wPerM2: 120, hinweis: 'ungedaemmt, alte Fenster' },
  { name: 'Bestand 1977–1995', icon: '🏠', wPerM2: 80, hinweis: 'erste Waermeschutzverordnung' },
  { name: 'Bestand teilsaniert', icon: '🔧', wPerM2: 60, hinweis: 'neue Fenster, Teildaemmung' },
  { name: 'EnEV-Neubau (ab 2002)', icon: '🏢', wPerM2: 50, hinweis: 'gedaemmte Huelle' },
  { name: 'Niedrigenergiehaus', icon: '🌿', wPerM2: 40, hinweis: 'KfW-55-Niveau' },
  { name: 'Passiv-/Effizienzhaus', icon: '✨', wPerM2: 25, hinweis: 'sehr gute Daemmung' },
];

// Heizkoerper-Exponent n nach DIN EN 442 (Bauform-Richtwerte).
type Heizkoerpertyp = {
  name: string;
  n: number;
};

const HK_TYPEN: Heizkoerpertyp[] = [
  { name: 'Plattenheizkörper', n: 1.3 },
  { name: 'Röhren-/Gliederradiator', n: 1.3 },
  { name: 'Konvektor / Gebläsekonvektor', n: 1.4 },
  { name: 'Fußboden-/Flächenheizung', n: 1.1 },
];

// Norm-Uebertemperatur bei 75/65/20 = (75-65) / ln((75-20)/(65-20)) = 49,83 K
const DELTA_NORM = 49.83;

export function HeizkoerperLeistungRechner() {
  const [modus, setModus] = useState<'auslegung' | 'ist'>('auslegung');

  // Raum
  const [flaeche, setFlaeche] = useState(20);
  const [daemmIndex, setDaemmIndex] = useState(2); // teilsaniert (60 W/m2)
  const [raumTemp, setRaumTemp] = useState(20);

  // Temperaturen
  const [vorlauf, setVorlauf] = useState(55);
  const [ruecklauf, setRuecklauf] = useState(45);

  // Heizkoerper
  const [hkIndex, setHkIndex] = useState(0); // Plattenheizkörper
  const [normLeistung, setNormLeistung] = useState(1500); // nur im Ist-Modus genutzt

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const n = HK_TYPEN[hkIndex].n;
  const wPerM2 = DAEMMSTANDARDS[daemmIndex].wPerM2;

  // Wärmebedarf des Raums Q_bedarf = A x q x f_raum
  // f_raum hebt den Bedarf bei höherer Wunschtemperatur an (z. B. Bad 24 °C).
  // Grobe Norm-Innentemperatur ist 20 °C; je K Mehrtemperatur ca. +6 %.
  const fRaum = 1 + (raumTemp - 20) * 0.06;
  const qBedarf = flaeche * wPerM2 * Math.max(0, fRaum);

  // Logarithmische mittlere Übertemperatur ΔΘ_ln.
  // Nur gültig, wenn Vorlauf > Rücklauf > Raumtemperatur.
  const tempGueltig =
    vorlauf > ruecklauf && ruecklauf > raumTemp && vorlauf > raumTemp;

  let deltaLn = 0;
  if (tempGueltig) {
    deltaLn =
      (vorlauf - ruecklauf) /
      Math.log((vorlauf - raumTemp) / (ruecklauf - raumTemp));
  }

  // Leistungsfaktor (ΔΘ_ln / 49,83)^n
  const faktor = tempGueltig ? Math.pow(deltaLn / DELTA_NORM, n) : 0;

  // Auslegung: erforderliche Norm-Leistung = Bedarf / Faktor
  const normErforderlich = faktor > 0 ? qBedarf / faktor : 0;

  // Ist-Leistung: reale Leistung eines vorhandenen HK = Norm × Faktor
  const istLeistung = normLeistung * faktor;
  // Deckungsgrad im Ist-Modus (reale Leistung gegen Bedarf)
  const deckung = qBedarf > 0 ? (istLeistung / qBedarf) * 100 : 0;

  const fmt0 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const fmt1 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const fmt3 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 3 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Heizkörper-Leistung-Rechner" rechnerSlug="heizkoerper-leistung-rechner" />

      {/* Modus-Umschalter */}
      <div className="bg-white rounded-2xl shadow-lg p-2 mb-6 grid grid-cols-2 gap-2">
        <button
          onClick={() => setModus('auslegung')}
          className={`py-3 px-3 rounded-xl text-sm font-medium transition-all active:scale-95 ${
            modus === 'auslegung'
              ? 'bg-blue-600 text-white shadow'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          📐 Heizkörper auslegen
        </button>
        <button
          onClick={() => setModus('ist')}
          className={`py-3 px-3 rounded-xl text-sm font-medium transition-all active:scale-95 ${
            modus === 'ist'
              ? 'bg-blue-600 text-white shadow'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          🌡️ Vorhandenen prüfen
        </button>
      </div>

      {/* Dämmstandard-Voreinstellungen (nur Auslegung relevant, im Ist-Modus für Bedarf/Deckung) */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Bau- / Dämmstandard</span>
        <div className="grid grid-cols-3 gap-2">
          {DAEMMSTANDARDS.map((d, i) => (
            <button
              key={d.name}
              onClick={() => setDaemmIndex(i)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                daemmIndex === i
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{d.icon}</span>
              <span className="text-center leading-tight">{d.name}</span>
              <span className="text-[10px] text-gray-400 text-center leading-tight">{d.wPerM2} W/m²</span>
            </button>
          ))}
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Raumfläche</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={flaeche}
              onChange={(e) => setFlaeche(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Wunsch-Raumtemperatur</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={30}
              step={0.5}
              value={raumTemp}
              onChange={(e) => setRaumTemp(Math.min(30, toNumber(e.target.value)))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">°C</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Wohnraum 20 °C, Bad 24 °C, Schlafzimmer 18 °C.
          </span>
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-gray-700 font-medium">Vorlauf Θ<sub>V</sub></span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={90}
                value={vorlauf}
                onChange={(e) => setVorlauf(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">°C</span>
            </div>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Rücklauf Θ<sub>R</sub></span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={90}
                value={ruecklauf}
                onChange={(e) => setRuecklauf(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">°C</span>
            </div>
          </label>
        </div>
        <span className="text-xs text-gray-400 -mt-2 block">
          Typisch: Gas-Bestand 70/55, modernisiert 55/45, Wärmepumpe 45/35 oder 35/28.
        </span>

        <label className="block">
          <span className="text-gray-700 font-medium">Heizkörpertyp (Exponent n)</span>
          <select
            value={hkIndex}
            onChange={(e) => setHkIndex(Number(e.target.value))}
            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl text-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {HK_TYPEN.map((t, i) => (
              <option key={t.name} value={i}>
                {t.name} (n = {t.n.toLocaleString('de-DE')})
              </option>
            ))}
          </select>
        </label>

        {modus === 'ist' && (
          <label className="block border-t border-gray-100 pt-4">
            <span className="text-gray-700 font-medium">Norm-Leistung des Heizkörpers (75/65/20)</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                value={normLeistung}
                onChange={(e) => setNormLeistung(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">W</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">
              Steht im Datenblatt des Herstellers als „Norm-Wärmeleistung 75/65/20“.
            </span>
          </label>
        )}
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        {modus === 'auslegung' ? (
          <>
            <h3 className="text-sm font-medium text-blue-100 mb-1">Erforderliche Norm-Leistung (75/65/20)</h3>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">
                  {tempGueltig ? fmt0(normErforderlich) : '–'}
                </span>
                <span className="text-xl text-blue-200">Watt</span>
              </div>
              <p className="text-blue-200 text-sm mt-1">
                Norm-Wärmeleistung, die der Heizkörper laut Datenblatt haben muss
              </p>
            </div>
            <div className="space-y-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Wärmebedarf des Raums</span>
                  <span className="text-xl font-bold">{fmt0(qBedarf)} W</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-100">Leistungsfaktor (ΔΘ-Umrechnung)</span>
                  <span className="font-bold">
                    {tempGueltig ? `× ${fmt3(faktor)}` : 'ungültig'}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-sm font-medium text-blue-100 mb-1">Reale Leistung bei diesen Temperaturen</h3>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">
                  {tempGueltig ? fmt0(istLeistung) : '–'}
                </span>
                <span className="text-xl text-blue-200">Watt</span>
              </div>
              <p className="text-blue-200 text-sm mt-1">
                statt {fmt0(normLeistung)} W unter Norm-Bedingungen (75/65/20)
              </p>
            </div>
            <div className="space-y-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Wärmebedarf des Raums</span>
                  <span className="text-xl font-bold">{fmt0(qBedarf)} W</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-100">Deckung des Bedarfs</span>
                  <span className="font-bold">
                    {tempGueltig ? `${fmt0(deckung)} %` : '–'}
                    {tempGueltig && (deckung >= 100 ? ' ✅' : ' ⚠️')}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Wärmebedarf</strong> = Fläche × spez. Heizlast × Temperatur-Faktor
          </p>
          <p>
            = {fmt1(flaeche)} m² × {wPerM2} W/m² × {fmt3(Math.max(0, fRaum))} ={' '}
            <strong>{fmt0(qBedarf)} W</strong>
          </p>
          {tempGueltig ? (
            <>
              <p className="pt-1">
                <strong>ΔΘ<sub>ln</sub></strong> = (Θ<sub>V</sub> − Θ<sub>R</sub>) ÷ ln((Θ<sub>V</sub> − Θ<sub>L</sub>) ÷ (Θ<sub>R</sub> − Θ<sub>L</sub>))
              </p>
              <p>
                = ({fmt0(vorlauf)} − {fmt0(ruecklauf)}) ÷ ln(({fmt0(vorlauf)} − {fmt0(raumTemp)}) ÷ ({fmt0(ruecklauf)} − {fmt0(raumTemp)})) ={' '}
                <strong>{fmt1(deltaLn)} K</strong>
              </p>
              <p>
                <strong>Faktor</strong> = (ΔΘ<sub>ln</sub> ÷ 49,83)<sup>n</sup> = ({fmt1(deltaLn)} ÷ 49,83)<sup>{n.toLocaleString('de-DE')}</sup> ={' '}
                <strong>{fmt3(faktor)}</strong>
              </p>
              {modus === 'auslegung' ? (
                <p>
                  <strong>Norm-Leistung</strong> = Bedarf ÷ Faktor = {fmt0(qBedarf)} ÷ {fmt3(faktor)} ={' '}
                  <strong>{fmt0(normErforderlich)} W</strong>
                </p>
              ) : (
                <p>
                  <strong>Reale Leistung</strong> = Norm-Leistung × Faktor = {fmt0(normLeistung)} × {fmt3(faktor)} ={' '}
                  <strong>{fmt0(istLeistung)} W</strong>
                </p>
              )}
            </>
          ) : (
            <p className="text-red-600">
              Bitte gültige Temperaturen eingeben: Vorlauf &gt; Rücklauf &gt; Raumtemperatur.
            </p>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Das Ergebnis ist ein Überschlags- bzw. Orientierungswert auf Basis
          pauschaler W/m²-Richtwerte und der Standard-Exponenten nach DIN EN 442. Es ersetzt
          <strong> keine raumweise Heizlastberechnung nach DIN EN 12831</strong> und keine fachliche
          Auslegung durch Heizungsbauer oder Energieberater. Die tatsächliche Norm-Wärmeleistung
          entnehmen Sie dem Datenblatt des Herstellers (75/65/20); der Exponent n weicht je nach
          konkretem Modell ab. Alle Angaben ohne Gewähr – keine Fachplanung.
        </p>
      </div>
    </div>
  );
}

export default HeizkoerperLeistungRechner;
