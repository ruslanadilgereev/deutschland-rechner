import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Gasverbrauch m³ -> kWh
// Formel: kWh = m³ × Brennwert × Zustandszahl
// Quelle: Bundesnetzagentur, BDEW, Vattenfall/EnBW-Ratgeber (Stand 2026)
// Brennwert: H-Gas ~10–13,1 kWh/m³, L-Gas ~8,4–11,2 kWh/m³ — steht auf der Abrechnung
// Zustandszahl: typisch ~0,95 — steht auf der Abrechnung

type Modus = 'm3-zu-kwh' | 'kwh-zu-m3';

export default function GasverbrauchRechner() {
  const [modus, setModus] = useState<Modus>('m3-zu-kwh');
  const [m3, setM3] = useState<string>('1500');
  const [kwh, setKwh] = useState<string>('15000');
  const [brennwert, setBrennwert] = useState<string>('10,3');
  const [zustandszahl, setZustandszahl] = useState<string>('0,95');
  const [preis, setPreis] = useState<string>(''); // ct/kWh, optional

  // Deutsche Eingabe (Komma) in Zahl umwandeln
  const num = (s: string): number => {
    const v = parseFloat(s.replace(/\./g, '').replace(',', '.'));
    return isNaN(v) ? 0 : v;
  };

  const bw = num(brennwert);
  const zz = num(zustandszahl);
  const faktor = bw * zz; // kWh pro m³

  let ergebnisM3 = 0;
  let ergebnisKwh = 0;

  if (modus === 'm3-zu-kwh') {
    ergebnisM3 = num(m3);
    ergebnisKwh = ergebnisM3 * faktor;
  } else {
    ergebnisKwh = num(kwh);
    ergebnisM3 = faktor > 0 ? ergebnisKwh / faktor : 0;
  }

  const preisCt = num(preis);
  const kosten = preisCt > 0 ? (ergebnisKwh * preisCt) / 100 : 0;

  const fmt = (n: number, dezimal = 0) =>
    n.toLocaleString('de-DE', {
      minimumFractionDigits: dezimal,
      maximumFractionDigits: dezimal,
    });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback
        rechnerName="Gasverbrauch-Rechner (m³ in kWh)"
        rechnerSlug="gasverbrauch-rechner"
      />

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Modus-Umschalter */}
        <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
          <button
            onClick={() => setModus('m3-zu-kwh')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              modus === 'm3-zu-kwh'
                ? 'bg-white text-orange-600 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            m³ → kWh
          </button>
          <button
            onClick={() => setModus('kwh-zu-m3')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              modus === 'kwh-zu-m3'
                ? 'bg-white text-orange-600 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            kWh → m³
          </button>
        </div>

        {/* Verbrauch */}
        {modus === 'm3-zu-kwh' ? (
          <label className="block mb-5">
            <span className="text-gray-700 font-medium">Verbrauch in Kubikmeter (m³)</span>
            <div className="relative mt-2">
              <input
                type="text"
                inputMode="decimal"
                value={m3}
                onChange={(e) => setM3(e.target.value)}
                className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                placeholder="z. B. 1500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                m³
              </span>
            </div>
            <span className="text-xs text-gray-500 mt-1 block">
              Zählerstand-Differenz vom Gaszähler ablesen
            </span>
          </label>
        ) : (
          <label className="block mb-5">
            <span className="text-gray-700 font-medium">Verbrauch in Kilowattstunden (kWh)</span>
            <div className="relative mt-2">
              <input
                type="text"
                inputMode="decimal"
                value={kwh}
                onChange={(e) => setKwh(e.target.value)}
                className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                placeholder="z. B. 15000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                kWh
              </span>
            </div>
            <span className="text-xs text-gray-500 mt-1 block">
              Energiemenge, die Sie in m³ umrechnen möchten
            </span>
          </label>
        )}

        {/* Brennwert */}
        <label className="block mb-5">
          <span className="text-gray-700 font-medium">Brennwert (kWh/m³)</span>
          <div className="relative mt-2">
            <input
              type="text"
              inputMode="decimal"
              value={brennwert}
              onChange={(e) => setBrennwert(e.target.value)}
              className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              placeholder="z. B. 10,3"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
              kWh/m³
            </span>
          </div>
          <span className="text-xs text-gray-500 mt-1 block">
            Steht auf Ihrer Gasabrechnung · Spanne ca. 8,4–13,1
          </span>
        </label>

        {/* Zustandszahl */}
        <label className="block">
          <span className="text-gray-700 font-medium">Zustandszahl (z-Zahl)</span>
          <div className="relative mt-2">
            <input
              type="text"
              inputMode="decimal"
              value={zustandszahl}
              onChange={(e) => setZustandszahl(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              placeholder="z. B. 0,95"
            />
          </div>
          <span className="text-xs text-gray-500 mt-1 block">
            Steht auf Ihrer Gasabrechnung · meist ca. 0,90–0,95
          </span>
        </label>

        {/* Preis optional */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          <label className="block">
            <span className="text-gray-700 font-medium">
              Gaspreis <span className="text-gray-400 font-normal">(optional)</span>
            </span>
            <div className="relative mt-2">
              <input
                type="text"
                inputMode="decimal"
                value={preis}
                onChange={(e) => setPreis(e.target.value)}
                className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                placeholder="z. B. 12,3"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
                ct/kWh
              </span>
            </div>
            <span className="text-xs text-gray-500 mt-1 block">
              Arbeitspreis pro kWh für eine grobe Kostenschätzung
            </span>
          </label>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-orange-100 mb-1">
          {modus === 'm3-zu-kwh' ? 'Ihr Energieverbrauch' : 'Ihr Gasverbrauch in m³'}
        </h3>

        <div className="mb-6">
          {modus === 'm3-zu-kwh' ? (
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{fmt(ergebnisKwh, 0)}</span>
              <span className="text-xl text-orange-200">kWh</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{fmt(ergebnisM3, 1)}</span>
              <span className="text-xl text-orange-200">m³</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-orange-100 text-sm">Umrechnungsfaktor</span>
              <span className="font-bold">{fmt(faktor, 2)} kWh/m³</span>
            </div>
          </div>

          {kosten > 0 && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <span className="text-orange-100 text-sm">Gaskosten (geschätzt)</span>
                <span className="text-xl font-bold">{fmt(kosten, 2)} €</span>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-orange-100 mt-4">
          Formel: m³ × Brennwert × Zustandszahl = kWh
        </p>
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Umrechnung</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Ihr Gaszähler misst das <strong>Volumen in m³</strong>, abgerechnet wird aber die{' '}
              <strong>Energie in kWh</strong>.
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Der <strong>Brennwert</strong> gibt an, wie viel Energie in einem Kubikmeter steckt –
              er hängt von der Gaszusammensetzung im Netz ab.
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Die <strong>Zustandszahl</strong> korrigiert Druck und Temperatur des Gases am
              Verbrauchsort auf den Normzustand.
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Beide Werte stehen auf Ihrer <strong>Gasabrechnung</strong> – tragen Sie sie für ein
              exaktes Ergebnis ein.
            </span>
          </li>
        </ul>
      </div>

      {/* Hinweise */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Wichtige Hinweise</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium text-yellow-800">Default-Werte sind nur Richtwerte</p>
              <p className="text-yellow-700">
                Der voreingestellte Brennwert (10,3) und die Zustandszahl (0,95) sind Mittelwerte.
                Ihre tatsächlichen Werte können abweichen – nutzen Sie die Angaben Ihrer Abrechnung.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">🔥</span>
            <div>
              <p className="font-medium text-blue-800">H-Gas und L-Gas</p>
              <p className="text-blue-700">
                In Deutschland wird überwiegend H-Gas (Brennwert ca. 10–13,1 kWh/m³) geliefert,
                in manchen Regionen L-Gas (ca. 8,4–11,2 kWh/m³).
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">💡</span>
            <div>
              <p className="font-medium text-green-800">Faustregel zum Überschlagen</p>
              <p className="text-green-700">
                Grob entspricht 1 m³ Erdgas ungefähr 10 kWh. Für die Abrechnung zählen aber immer die
                exakten Werte des Netzbetreibers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.bundesnetzagentur.de/SharedDocs/A_Z_Glossar/B/Brennwert%20(Gas).html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesnetzagentur – Brennwert (Gas)
          </a>
          <a
            href="https://www.vattenfall.de/infowelt-energie/gas-ratgeber/wieso-wird-gas-in-kilowattstunden-berechnet"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Vattenfall – Gasverbrauch von m³ in kWh umrechnen
          </a>
          <a
            href="https://www.enbw.com/blog/wohnen/energie-sparen/wieso-wird-gas-in-m3-abgelesen-und-in-kwh-berechnet/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            EnBW – Gas umrechnen von m³ in kWh
          </a>
        </div>
      </div>
    </div>
  );
}
