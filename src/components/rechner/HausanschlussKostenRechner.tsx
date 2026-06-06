import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Hausanschlusskosten – Orientierungswerte Stand Juni 2026.
// Quellen: Verivox (Hausanschlüsse), Schwäbisch Hall & ImmobilienScout24
// (Erschließungskosten), JuraForum. Die Werte schwanken regional sehr stark –
// verbindlich ist allein der Kostenvoranschlag des örtlichen Netzbetreibers.
//
// Modell pro Gewerk:
//   Anschlusskosten = Pauschale (bis Standardlänge) + Längenzuschlag × Mehrlänge
//   Mehrlänge = max(0, Anschlusslänge − Standardlänge)
// Optional zusätzlich:
//   Erdbau/Tiefbau auf dem Grundstück = Erdbau-Satz × Grabenlänge
//   Baukostenzuschuss (BKZ) je Gewerk + flächenbasierter Abwasser-BKZ

type Gewerk = {
  key: string;
  name: string;
  icon: string;
  pauschale: number; // EUR bis Standardlänge
  standardlaenge: number; // m ab Grundstücksgrenze
  zuschlagProMeter: number; // EUR je zusätzlichem Meter
  bkz: number; // EUR pauschaler Baukostenzuschuss
  optional: boolean; // optional vorausgewählt aus?
};

// Default-Pauschalen = Mittelwerte der in der Recherche genannten Spannen.
const GEWERKE: Gewerk[] = [
  { key: 'strom', name: 'Strom', icon: '⚡', pauschale: 2300, standardlaenge: 10, zuschlagProMeter: 60, bkz: 415, optional: false },
  { key: 'wasser', name: 'Trinkwasser', icon: '🚰', pauschale: 3000, standardlaenge: 10, zuschlagProMeter: 45, bkz: 550, optional: false },
  { key: 'abwasser', name: 'Abwasser/Kanal', icon: '🚽', pauschale: 3500, standardlaenge: 10, zuschlagProMeter: 52, bkz: 0, optional: false },
  { key: 'gas', name: 'Gas', icon: '🔥', pauschale: 2000, standardlaenge: 10, zuschlagProMeter: 15, bkz: 400, optional: true },
  { key: 'telekom', name: 'Telekom/Glasfaser', icon: '🌐', pauschale: 700, standardlaenge: 10, zuschlagProMeter: 0, bkz: 0, optional: true },
];

// Erdbau/Tiefbau auf dem eigenen Grundstück (privater Anteil), pro Meter Graben.
const ERDBAU_PRO_METER_DEFAULT = 1000; // EUR/m
// Flächenbasierter Abwasser-Baukostenzuschuss (Orientierung).
const ABWASSER_BKZ_PRO_QM = 4.5; // EUR/m²

export function HausanschlussKostenRechner() {
  // Welche Gewerke sind aktiv?
  const [aktiv, setAktiv] = useState<Record<string, boolean>>({
    strom: true,
    wasser: true,
    abwasser: true,
    gas: false,
    telekom: false,
  });

  // Pauschale pro Gewerk (anpassbar – Default = Mittelwert der Spanne).
  const [pauschalen, setPauschalen] = useState<Record<string, number>>(
    Object.fromEntries(GEWERKE.map((g) => [g.key, g.pauschale]))
  );

  // Gemeinsame Anschluss-/Grabenlänge ab Grundstücksgrenze (m).
  const [laengeM, setLaengeM] = useState(15);

  // Aufwendiger Erdbau auf dem Grundstück einrechnen?
  const [erdbauAktiv, setErdbauAktiv] = useState(false);
  const [erdbauProMeter, setErdbauProMeter] = useState(ERDBAU_PRO_METER_DEFAULT);
  const [grabenlaengeM, setGrabenlaengeM] = useState(10);

  // Grundstücksfläche (für flächenbasierten Abwasser-BKZ).
  const [flaecheQm, setFlaecheQm] = useState(500);

  // Baukostenzuschuss (BKZ) berücksichtigen?
  const [bkzAktiv, setBkzAktiv] = useState(false);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungültige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const toggleGewerk = (key: string) =>
    setAktiv((prev) => ({ ...prev, [key]: !prev[key] }));

  const setPauschale = (key: string, value: number) =>
    setPauschalen((prev) => ({ ...prev, [key]: value }));

  // --- Berechnung pro aktivem Gewerk ---
  type Zeile = {
    key: string;
    name: string;
    icon: string;
    pauschale: number;
    mehrlaenge: number;
    laengenzuschlag: number;
    bkz: number;
    summe: number;
  };

  const zeilen: Zeile[] = GEWERKE.filter((g) => aktiv[g.key]).map((g) => {
    const pauschale = pauschalen[g.key];
    const mehrlaenge = Math.max(0, laengeM - g.standardlaenge);
    const laengenzuschlag = mehrlaenge * g.zuschlagProMeter;
    // BKZ: pauschaler Wert je Gewerk; für Abwasser flächenbasiert.
    const bkzWert =
      g.key === 'abwasser' ? flaecheQm * ABWASSER_BKZ_PRO_QM : g.bkz;
    const bkz = bkzAktiv ? bkzWert : 0;
    const summe = pauschale + laengenzuschlag + bkz;
    return { key: g.key, name: g.name, icon: g.icon, pauschale, mehrlaenge, laengenzuschlag, bkz, summe };
  });

  const gewerkeSumme = zeilen.reduce((s, z) => s + z.summe, 0);

  const erdbauSumme = erdbauAktiv ? erdbauProMeter * grabenlaengeM : 0;

  const gesamt = gewerkeSumme + erdbauSumme;

  // Spanne: −25 % / +35 % um die Mittelwert-Summe (regionale Streuung).
  const spanneMin = gesamt * 0.75;
  const spanneMax = gesamt * 1.35;

  const bkzSumme = zeilen.reduce((s, z) => s + z.bkz, 0);

  const formatEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const anzahlAktiv = zeilen.length;

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Hausanschlusskosten-Rechner" rechnerSlug="hausanschluss-kosten-rechner" />

      {/* Gewerke auswählen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Welche Anschlüsse benötigen Sie?</span>
        <div className="grid grid-cols-1 gap-2">
          {GEWERKE.map((g) => (
            <button
              key={g.key}
              onClick={() => toggleGewerk(g.key)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-all active:scale-[0.99] ${
                aktiv[g.key]
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{g.icon}</span>
              <span className="flex-1 text-left">
                {g.name}
                {g.optional && <span className="text-xs text-gray-400 font-normal"> (optional)</span>}
              </span>
              <span
                className={`w-5 h-5 rounded border flex items-center justify-center text-xs ${
                  aktiv[g.key] ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-transparent'
                }`}
              >
                ✓
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Pauschalen je aktivem Gewerk */}
      {anzahlAktiv > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-4">
          <span className="text-gray-700 font-medium block">Pauschale je Anschluss (bis 10 m)</span>
          {GEWERKE.filter((g) => aktiv[g.key]).map((g) => (
            <label key={g.key} className="block">
              <span className="text-sm text-gray-600">
                {g.icon} {g.name}
              </span>
              <div className="mt-1 relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={pauschalen[g.key]}
                  onChange={(e) => setPauschale(g.key, toNumber(e.target.value))}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
            </label>
          ))}
          <span className="text-xs text-gray-400 block">
            Voreingestellt sind Mittelwerte der üblichen Spannen. Passen Sie sie an Ihr Preisblatt des Netzbetreibers an.
          </span>
        </div>
      )}

      {/* Anschlusslänge */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Anschlusslänge ab Grundstücksgrenze</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={laengeM}
              onChange={(e) => setLaengeM(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Strecke von der Grundstücksgrenze bis zur Hauseinführung. Bis 10 m gilt die Pauschale, jeder weitere Meter kostet einen Längenzuschlag.
          </span>
        </label>

        {/* Erdbau */}
        <div className="border-t border-gray-100 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={erdbauAktiv}
              onChange={(e) => setErdbauAktiv(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Erdbau/Tiefbau auf dem Grundstück</span>
          </label>
          {erdbauAktiv && (
            <div className="mt-3 space-y-3">
              <label className="block">
                <span className="text-sm text-gray-600">Grabenlänge auf dem Grundstück</span>
                <div className="mt-1 relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={grabenlaengeM}
                    onChange={(e) => setGrabenlaengeM(toNumber(e.target.value))}
                    className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
                </div>
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">Erdbau-Kosten pro Meter</span>
                <div className="mt-1 relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={erdbauProMeter}
                    onChange={(e) => setErdbauProMeter(toNumber(e.target.value))}
                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                </div>
              </label>
              <span className="text-xs text-gray-400 block">
                Richtwert ca. 1.000 € pro Meter Graben (Aushub, Verfüllung, Wiederherstellung) – stark abhängig von Bodenklasse und Versiegelung.
              </span>
            </div>
          )}
        </div>

        {/* BKZ */}
        <div className="border-t border-gray-100 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={bkzAktiv}
              onChange={(e) => setBkzAktiv(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Baukostenzuschuss (BKZ) einrechnen</span>
          </label>
          {bkzAktiv && (
            <label className="block mt-3">
              <span className="text-sm text-gray-600">Grundstücksfläche (für Abwasser-BKZ)</span>
              <div className="mt-1 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={flaecheQm}
                  onChange={(e) => setFlaecheQm(toNumber(e.target.value))}
                  className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                BKZ Strom ca. 415 €, Gas ca. 400 €, Trinkwasser ca. 550 €, Abwasser ca. 4,50 € je m² Grundstücksfläche (Orientierung, jährlich angepasst).
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Geschätzte Hausanschlusskosten</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatEuro(gesamt)}</span>
            <span className="text-xl text-blue-200">€</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            realistische Spanne {formatEuro(spanneMin)} – {formatEuro(spanneMax)} €
          </p>
        </div>

        <div className="space-y-3">
          {zeilen.map((z) => (
            <div key={z.key} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">{z.icon} {z.name}</span>
                <span className="font-bold">{formatEuro(z.summe)} €</span>
              </div>
            </div>
          ))}
          {erdbauAktiv && (
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">🚜 Erdbau/Tiefbau</span>
                <span className="font-bold">{formatEuro(erdbauSumme)} €</span>
              </div>
            </div>
          )}
          {bkzAktiv && (
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex justify-between items-center text-xs">
                <span className="text-blue-100">davon Baukostenzuschuss (BKZ)</span>
                <span className="font-bold">{formatEuro(bkzSumme)} €</span>
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
            <strong>Pro Anschluss:</strong> Pauschale (bis 10 m) + Längenzuschlag × Meter über 10 m
            {bkzAktiv && ' + Baukostenzuschuss'}
          </p>
          {zeilen.map((z) => (
            <p key={z.key}>
              {z.icon} {z.name}: {formatEuro(z.pauschale)} €
              {z.mehrlaenge > 0 && ` + ${formatEuro(z.laengenzuschlag)} € (${z.mehrlaenge} m extra)`}
              {bkzAktiv && z.bkz > 0 && ` + ${formatEuro(z.bkz)} € BKZ`}
              {' = '}
              <strong>{formatEuro(z.summe)} €</strong>
            </p>
          ))}
          {erdbauAktiv && (
            <p>
              🚜 Erdbau: {formatEuro(erdbauProMeter)} € × {grabenlaengeM} m ={' '}
              <strong>{formatEuro(erdbauSumme)} €</strong>
            </p>
          )}
          <p className="pt-1 border-t border-blue-100">
            <strong>Gesamt</strong> = Summe aller Posten = <strong>{formatEuro(gesamt)} €</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Wichtiger Hinweis:</strong> Das Ergebnis sind <strong>unverbindliche Orientierungswerte</strong>.
          Hausanschlusskosten schwanken stark nach Region, Netzbetreiber, Bodenklasse und Anschlusslänge –
          im Einzelfall bis über 30.000 €. <strong>Verbindlich ist allein der Kostenvoranschlag bzw. das
          Angebot Ihres örtlichen Netzbetreibers und Versorgers.</strong> Baukostenzuschüsse (BKZ) und
          Preisblätter werden jährlich angepasst. Keine Rechts- oder Finanzberatung, Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default HausanschlussKostenRechner;
