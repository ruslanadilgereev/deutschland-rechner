import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Baugenehmigungskosten-Rechner – Stand Juni 2026
//
// Modell: Die Behoerdengebuehr fuer die Baugenehmigung bemisst sich nach der
// Rohbausumme bzw. den anrechenbaren Baukosten multipliziert mit einem
// Gebuehrensatz (Promille) je nach Genehmigungsverfahren. Grundlage ist die
// jeweilige Landesbauordnung / Gebuehrensatzung (Beispiel BauO NRW 2018:
// Grundgebuehr 0,6 % der Rohbausumme bei Wohngebaeuden, 6/10/13 Promille je
// Verfahren). Die Bauwerte je m3 umbauter Raum werden jaehrlich von den
// Landesministerien festgelegt (Spanne ca. 250–400 EUR/m3).
//
// Quellen: Architektenkammer NRW (BauO NRW 2018 Verwaltungsgebuehren),
// Schleswig-Holstein Baugebuehrenrecht, Wohneigentum NRW.

// Gebuehrensaetze je Verfahren in Promille der Bemessungsgrundlage.
// vereinfachtes Verfahren ~6 Promille (0,6 %), Vollverfahren ~13 Promille (1,3 %).
const PROMILLE_VEREINFACHT = 6; // 0,6 %
const PROMILLE_VOLL = 13; // 1,3 %

// Mindestgebuehr der Behoerde (Richtwert, je Satzung 100–200 EUR).
const MINDESTGEBUEHR = 150;

// Bundeslaender: Gebuehren-Faktor relativ zur NRW-Basis (~1,0) und
// typischer Bauwert je m3 umbauter Raum (Richtwert fuer Wohngebaeude).
type Bundesland = {
  name: string;
  faktor: number; // Multiplikator auf den Promille-Satz (Richtwert)
  bauwert: number; // EUR je m3 Bruttorauminhalt
};

const BUNDESLAENDER: Bundesland[] = [
  { name: 'Baden-Württemberg', faktor: 1.05, bauwert: 340 },
  { name: 'Bayern', faktor: 1.0, bauwert: 350 },
  { name: 'Berlin', faktor: 1.0, bauwert: 330 },
  { name: 'Brandenburg', faktor: 0.95, bauwert: 300 },
  { name: 'Bremen', faktor: 1.0, bauwert: 320 },
  { name: 'Hamburg', faktor: 1.0, bauwert: 340 },
  { name: 'Hessen', faktor: 1.0, bauwert: 330 },
  { name: 'Mecklenburg-Vorpommern', faktor: 0.9, bauwert: 290 },
  { name: 'Niedersachsen', faktor: 0.95, bauwert: 310 },
  { name: 'Nordrhein-Westfalen', faktor: 1.0, bauwert: 320 },
  { name: 'Rheinland-Pfalz', faktor: 1.0, bauwert: 320 },
  { name: 'Saarland', faktor: 1.0, bauwert: 310 },
  { name: 'Sachsen', faktor: 0.9, bauwert: 290 },
  { name: 'Sachsen-Anhalt', faktor: 0.9, bauwert: 285 },
  { name: 'Schleswig-Holstein', faktor: 1.0, bauwert: 310 },
  { name: 'Thüringen', faktor: 0.9, bauwert: 285 },
];

// NRW als Standard (Index 9).
const DEFAULT_BUNDESLAND = 9;

// Bauvorhaben-Voreinstellungen: typische Bausumme, Bruttorauminhalt (m3)
// und Richtwert fuer die Statik-/Pruefgebuehr.
type BauteilVoreinstellung = {
  name: string;
  icon: string;
  bausumme: number; // EUR
  bri: number; // m3 Bruttorauminhalt
  statik: number; // EUR Richtwert Statik/Pruefung
  vereinfacht: boolean; // typisches Verfahren (kleine Bauteile vereinfacht)
};

const BAUTEILE: BauteilVoreinstellung[] = [
  { name: 'Einfamilienhaus', icon: '🏠', bausumme: 320000, bri: 750, statik: 4000, vereinfacht: true },
  { name: 'Anbau', icon: '🧱', bausumme: 60000, bri: 120, statik: 1800, vereinfacht: true },
  { name: 'Garage', icon: '🚗', bausumme: 18000, bri: 90, statik: 1100, vereinfacht: true },
  { name: 'Carport', icon: '🅿️', bausumme: 8000, bri: 60, statik: 760, vereinfacht: true },
  { name: 'Gewerbehalle', icon: '🏭', bausumme: 250000, bri: 2500, statik: 6000, vereinfacht: false },
  { name: 'Wintergarten', icon: '🪟', bausumme: 30000, bri: 70, statik: 1200, vereinfacht: true },
];

const DEFAULT_BAUTEIL = 0;

// Genehmigungsplanung (Bauantrag durch Architekt/Bauvorlageberechtigten):
// Richtwert ca. 1 % der Bausumme (Teilleistung Genehmigungsplanung).
const PLANUNG_PROZENT = 1;

export function BaugenehmigungKostenRechner() {
  const [bauteilIndex, setBauteilIndex] = useState(DEFAULT_BAUTEIL);
  const [bundeslandIndex, setBundeslandIndex] = useState(DEFAULT_BUNDESLAND);
  const [eingabeModus, setEingabeModus] = useState<'bausumme' | 'bri'>('bausumme');
  const [bausumme, setBausumme] = useState(BAUTEILE[DEFAULT_BAUTEIL].bausumme);
  const [bri, setBri] = useState(BAUTEILE[DEFAULT_BAUTEIL].bri);
  const [vereinfacht, setVereinfacht] = useState(BAUTEILE[DEFAULT_BAUTEIL].vereinfacht);
  const [statikEinbeziehen, setStatikEinbeziehen] = useState(true);
  const [statik, setStatik] = useState(BAUTEILE[DEFAULT_BAUTEIL].statik);
  const [planungEinbeziehen, setPlanungEinbeziehen] = useState(true);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleBauteilWechsel = (index: number) => {
    setBauteilIndex(index);
    const b = BAUTEILE[index];
    setBausumme(b.bausumme);
    setBri(b.bri);
    setStatik(b.statik);
    setVereinfacht(b.vereinfacht);
  };

  const land = BUNDESLAENDER[bundeslandIndex];

  // Bemessungsgrundlage = direkt eingegebene Bausumme ODER aus dem
  // Bruttorauminhalt hochgerechnete Rohbausumme (BRI x Bauwert/m3).
  const bemessung = eingabeModus === 'bausumme' ? bausumme : bri * land.bauwert;

  // Gebuehrensatz: Promille je Verfahren x Bundesland-Faktor.
  const promille = (vereinfacht ? PROMILLE_VEREINFACHT : PROMILLE_VOLL) * land.faktor;

  // Behoerdengebuehr = Bemessungsgrundlage x Promille / 1.000, mindestens Mindestgebuehr.
  const gebuehrRoh = (bemessung * promille) / 1000;
  const behoerdengebuehr = bemessung > 0 ? Math.max(gebuehrRoh, MINDESTGEBUEHR) : 0;

  // Optionale Posten
  const planungskosten = planungEinbeziehen ? (bausumme * PLANUNG_PROZENT) / 100 : 0;
  const statikkosten = statikEinbeziehen ? statik : 0;

  const gesamt = behoerdengebuehr + planungskosten + statikkosten;

  const formatEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatProzent = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Baugenehmigungskosten-Rechner" rechnerSlug="baugenehmigung-kosten-rechner" />

      {/* Bauvorhaben-Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Bauvorhaben auswählen</span>
        <div className="grid grid-cols-3 gap-2">
          {BAUTEILE.map((b, i) => (
            <button
              key={b.name}
              onClick={() => handleBauteilWechsel(i)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                bauteilIndex === i
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{b.icon}</span>
              <span className="text-center leading-tight">{b.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Bundesland</span>
          <select
            value={bundeslandIndex}
            onChange={(e) => setBundeslandIndex(Number(e.target.value))}
            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl text-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {BUNDESLAENDER.map((b, i) => (
              <option key={b.name} value={i}>
                {b.name}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-400 mt-1 block">
            Steuert den Bauwert je m³ und einen regionalen Gebührenfaktor (Richtwert).
          </span>
        </label>

        {/* Eingabemodus */}
        <div>
          <span className="text-gray-700 font-medium block mb-2">Bemessungsgrundlage</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setEingabeModus('bausumme')}
              className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                eingabeModus === 'bausumme'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Baukosten (€)
            </button>
            <button
              onClick={() => setEingabeModus('bri')}
              className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                eingabeModus === 'bri'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Rauminhalt (m³)
            </button>
          </div>
        </div>

        {eingabeModus === 'bausumme' ? (
          <label className="block">
            <span className="text-gray-700 font-medium">Geplante Baukosten / Bausumme</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={1000}
                value={bausumme}
                onChange={(e) => setBausumme(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
          </label>
        ) : (
          <>
            <label className="block">
              <span className="text-gray-700 font-medium">Bruttorauminhalt (umbauter Raum)</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={10}
                  value={bri}
                  onChange={(e) => setBri(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m³</span>
              </div>
            </label>
            <div className="bg-blue-50 rounded-xl p-3 text-sm text-gray-700">
              Rohbausumme = {formatEuro(bri)} m³ × {land.bauwert} €/m³ ={' '}
              <strong>{formatEuro(bri * land.bauwert)} €</strong>
            </div>
            <label className="block">
              <span className="text-sm text-gray-600">Baukosten für Planungs-/Statik-Anteil</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1000}
                  value={bausumme}
                  onChange={(e) => setBausumme(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
            </label>
          </>
        )}

        {/* Verfahren */}
        <div className="border-t border-gray-100 pt-4">
          <span className="text-gray-700 font-medium block mb-2">Genehmigungsverfahren</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setVereinfacht(true)}
              className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                vereinfacht
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Vereinfacht (0,6 %)
            </button>
            <button
              onClick={() => setVereinfacht(false)}
              className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                !vereinfacht
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Vollverfahren (1,3 %)
            </button>
          </div>
        </div>

        {/* Optionale Posten */}
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={statikEinbeziehen}
              onChange={(e) => setStatikEinbeziehen(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Statik-/Prüfgebühr einbeziehen</span>
          </label>
          {statikEinbeziehen && (
            <label className="block">
              <span className="text-sm text-gray-600">Statik / Standsicherheitsnachweis (Richtwert)</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={100}
                  value={statik}
                  onChange={(e) => setStatik(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
            </label>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={planungEinbeziehen}
              onChange={(e) => setPlanungEinbeziehen(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Genehmigungsplanung (ca. 1 %) einbeziehen</span>
          </label>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Geschätzte Kosten der Baugenehmigung</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatEuro(gesamt)}</span>
            <span className="text-xl text-blue-200">€</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            Gesamtaufwand inkl. der angewählten Posten
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Behördengebühr</span>
              <span className="text-xl font-bold">{formatEuro(behoerdengebuehr)} €</span>
            </div>
          </div>

          {statikEinbeziehen && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">Statik / Prüfung</span>
                <span className="font-bold">{formatEuro(statikkosten)} €</span>
              </div>
            </div>
          )}

          {planungEinbeziehen && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">Genehmigungsplanung (1 %)</span>
                <span className="font-bold">{formatEuro(planungskosten)} €</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Behördengebühr</strong> = Bemessungsgrundlage × Gebührensatz
          </p>
          <p>
            = {formatEuro(bemessung)} € × {formatProzent(promille / 10)} % ={' '}
            <strong>{formatEuro(behoerdengebuehr)} €</strong>
            {bemessung > 0 && gebuehrRoh < MINDESTGEBUEHR && ' (Mindestgebühr)'}
          </p>
          {(statikEinbeziehen || planungEinbeziehen) && (
            <p>
              <strong>+ Nebenkosten</strong> ={' '}
              {statikEinbeziehen && `Statik ${formatEuro(statikkosten)} €`}
              {statikEinbeziehen && planungEinbeziehen && ' + '}
              {planungEinbeziehen && `Planung ${formatEuro(planungskosten)} €`}
            </p>
          )}
          <p>
            <strong>Gesamt</strong> = <strong>{formatEuro(gesamt)} €</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Baugenehmigungsgebühren werden je Bundesland und Kommune über die
          Landesbauordnung bzw. Gebührensatzung festgelegt; die Bauwerte je m³ werden jährlich
          angepasst. Dieses Tool liefert nur eine unverbindliche Schätzung. Statik- und
          Architektenkosten sind Marktrichtwerte. Keine Rechts- oder Honorarberatung – verbindliche
          Angaben erhalten Sie nur über die zuständige Bauaufsichtsbehörde bzw. den planenden
          Architekten. Alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default BaugenehmigungKostenRechner;
