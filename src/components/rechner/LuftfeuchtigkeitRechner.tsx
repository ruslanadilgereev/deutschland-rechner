import { useState, useMemo } from 'react';

// Magnus-Konstanten (Sonntag 1990, WMO-empfohlen, über Wasser, gültig −45 °C bis +60 °C).
const K1 = 6.112; // hPa
const K2 = 17.62; // dimensionslos
const K3 = 243.12; // °C

// Sättigungsdampfdruck E(T) in hPa (Magnus-Formel).
const E = (t: number) => K1 * Math.exp((K2 * t) / (K3 + t));

export function LuftfeuchtigkeitRechner() {
  // Lufttemperatur in °C.
  const [temp, setTemp] = useState(21);
  // Relative Luftfeuchte in % (1..100, nie 0).
  const [rf, setRf] = useState(60);
  // Optionale Wand-/Oberflächentemperatur in °C (leeres Feld zulässig → null).
  const [wandStr, setWandStr] = useState('14');

  // Wandelt eine Eingabe robust in eine Zahl um (leeres Feld / ungültig → 0),
  // anschließend auf den Bereich −40..60 begrenzt (Magnus-Gültigkeit).
  const toTemp = (value: string) => {
    const n = Number(value);
    const v = Number.isFinite(n) ? n : 0;
    return Math.min(60, Math.max(-40, v));
  };

  // Relative Feuchte robust in 1..100 % begrenzen (nicht 0, sonst ist der Taupunkt undefiniert).
  const toRf = (value: string) => {
    const n = Number(value);
    const v = Number.isFinite(n) ? n : 0;
    return Math.min(100, Math.max(1, v));
  };

  // Alle abgeleiteten Werte gebündelt in useMemo (vollständiges Dependency-Array).
  const erg = useMemo(() => {
    const T = temp;
    const rfClamped = Math.min(100, Math.max(1, rf));

    const Esat = E(T); // Sättigungsdampfdruck bei T [hPa]
    const e = (rfClamped / 100) * Esat; // aktueller Dampfdruck [hPa]

    // Taupunkt über Umkehr-Magnus: v = ln(e / K1), τ = K3·v / (K2 − v).
    const v = Math.log(e / K1);
    const tau = (K3 * v) / (K2 - v); // °C

    const Tk = T + 273.15; // Kelvin
    const AF = (216.7 * e) / Tk; // absolute Luftfeuchtigkeit [g/m³]
    const AFmax = (216.7 * Esat) / Tk; // max. absolute Feuchte (Sättigung) [g/m³]

    // Optionale Wand-/Oberflächentemperatur auswerten.
    const wandTrim = wandStr.trim();
    const wandNum = wandTrim === '' ? null : Number(wandTrim.replace(',', '.'));
    const wand = wandNum !== null && Number.isFinite(wandNum) ? wandNum : null;

    // Schimmelrisiko-Logik (Vergleich Oberflächentemperatur ↔ Taupunkt).
    let risiko: 'rot' | 'gelb' | 'gruen' | null = null;
    if (wand !== null) {
      if (wand <= tau) {
        risiko = 'rot';
      } else if (wand <= tau + 3) {
        risiko = 'gelb';
      } else {
        risiko = 'gruen';
      }
    }

    return { T, rfClamped, Esat, e, tau, AF, AFmax, wand, risiko };
  }, [temp, rf, wandStr]);

  const fmt1 = (val: number) =>
    val.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const fmt2 = (val: number) =>
    val.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Lufttemperatur</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={-40}
              max={60}
              step={0.5}
              value={temp}
              onChange={(e) => setTemp(toTemp(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-0 focus:border-orange-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">°C</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Relative Luftfeuchte</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={1}
              max={100}
              step={1}
              value={rf}
              onChange={(e) => setRf(toRf(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-0 focus:border-orange-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Wert vom Hygrometer (1–100 %). Bei 0 % wäre der Taupunkt nicht definiert.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Oberflächentemperatur (optional)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={-40}
              max={60}
              step={0.5}
              value={wandStr}
              onChange={(e) => setWandStr(e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-0 focus:border-orange-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">°C</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Temperatur einer kalten Wand, Fensterlaibung oder Wärmebrücke – für die Schimmelrisiko-Einschätzung.
          </span>
        </label>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-sky-100 mb-1">Taupunkt</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{fmt1(erg.tau)}</span>
            <span className="text-xl text-sky-200">°C</span>
          </div>
          <p className="text-sky-200 text-sm mt-1">
            Unter dieser Oberflächentemperatur kondensiert Wasser.
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-sky-100">Absolute Luftfeuchtigkeit</span>
              <span className="text-xl font-bold">{fmt1(erg.AF)} g/m³</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-sky-100">Sättigungswert (max.) bei {fmt1(erg.T)} °C</span>
              <span className="text-xl font-bold">{fmt1(erg.AFmax)} g/m³</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-sky-100">Dampfdruck e · Sättigung E</span>
              <span className="font-bold">
                {fmt2(erg.e)} hPa · {fmt2(erg.Esat)} hPa
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Schimmelrisiko */}
      {erg.risiko !== null && erg.wand !== null && (
        <div
          className={`mt-6 rounded-2xl shadow-lg p-6 border ${
            erg.risiko === 'rot'
              ? 'bg-red-50 border-red-200 text-red-800'
              : erg.risiko === 'gelb'
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
              : 'bg-green-50 border-green-200 text-green-800'
          }`}
        >
          <h3 className="font-bold mb-2">
            {erg.risiko === 'rot'
              ? '🔴 Kondensat / Tauwasser'
              : erg.risiko === 'gelb'
              ? '🟡 Erhöhtes Schimmelrisiko'
              : '🟢 Unkritisch'}
          </h3>
          <p className="text-sm">
            {erg.risiko === 'rot' ? (
              <>
                An einer Oberfläche von {fmt1(erg.wand)} °C kondensiert Wasser, da sie den Taupunkt
                ({fmt1(erg.tau)} °C) erreicht/unterschreitet. Akutes Tauwasser-/Schimmelrisiko.
              </>
            ) : erg.risiko === 'gelb' ? (
              <>
                Die Oberfläche liegt nur knapp über dem Taupunkt — bei kalten Wärmebrücken besteht
                erhöhtes Schimmelrisiko.
              </>
            ) : (
              <>
                Die Oberfläche liegt deutlich über dem Taupunkt — keine Kondensation zu erwarten.
              </>
            )}
          </p>
        </div>
      )}

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-sky-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Sättigungsdampfdruck</strong> E = 6,112 · e^(17,62 · {fmt1(erg.T)} / (243,12 +{' '}
            {fmt1(erg.T)})) = <strong>{fmt2(erg.Esat)} hPa</strong>
          </p>
          <p>
            <strong>Dampfdruck</strong> e = {fmt1(erg.rfClamped)} % ÷ 100 · {fmt2(erg.Esat)} ={' '}
            <strong>{fmt2(erg.e)} hPa</strong>
          </p>
          <p>
            <strong>Taupunkt</strong> τ = 243,12 · v ÷ (17,62 − v) mit v = ln(e ÷ 6,112) ={' '}
            <strong>{fmt1(erg.tau)} °C</strong>
          </p>
          <p>
            <strong>Absolute Feuchte</strong> AF = 216,7 · e ÷ (T + 273,15) = 216,7 · {fmt2(erg.e)} ÷{' '}
            {fmt2(erg.T + 273.15)} = <strong>{fmt1(erg.AF)} g/m³</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Schätzung – keine Steuer-/Rechtsberatung.</strong> Die Umrechnung von Lufttemperatur
          und relativer Feuchte in Taupunkt, Dampfdruck und absolute Luftfeuchtigkeit erfolgt mit der
          physikalisch-meteorologischen Magnus-Formel (Koeffizienten nach Sonntag 1990, von der WMO
          empfohlen, gültig für −45 °C bis +60 °C über ebenen Wasseroberflächen) und ist mathematisch
          exakt. Der Schimmelrisiko-Hinweis (Vergleich Oberflächentemperatur ↔ Taupunkt) ist eine
          bauphysikalische Faustregel-Einschätzung und ersetzt keine Bauphysik-Fachberatung, keinen
          Feuchteschutznachweis nach DIN 4108 und keine Begutachtung vor Ort. Tatsächliche
          Tauwasser-/Schimmelbildung hängt von Wärmebrücken, Lüftungsverhalten, Bauteilaufbau und Dauer
          der Feuchtebelastung ab. Angaben ohne Gewähr.
        </p>
        <p className="mt-2">
          <strong>Quellen:</strong>{' '}
          <a href="https://www.dwd.de/DE/service/lexikon/Functions/glossar.html?lv3=100598&lv2=100578" target="_blank" rel="noopener" className="underline">DWD-Wetterlexikon (Taupunkt)</a>. Berechnung nach der Magnus-Formel (Koeffizienten Sonntag 1990, WMO-empfohlen).
        </p>
      </div>
    </div>
  );
}

export default LuftfeuchtigkeitRechner;
