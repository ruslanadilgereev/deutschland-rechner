import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Bodenarten mit Auflockerungsfaktor (lockerer Zustand nach dem Lösen) und
// Dichte des gewachsenen (festen) Bodens. Richtwerte – der genaue Wert hängt
// vom konkreten Baugrund ab und ist nach DIN 18300 (Homogenbereiche) bzw. durch
// ein Baugrundgutachten zu bestimmen.
// Auflockerungsfaktoren: Sand/Kies ~1,15; Mutterboden ~1,20; bindiger Boden
// (Lehm/Ton) ~1,30; Fels/steiniger Boden ~1,50.
// Dichten (fest): Sand ~1,5 t/m3; Mutterboden ~1,4 t/m3; Lehm ~1,9 t/m3;
// Fels ~2,2 t/m3.
type Bodenart = {
  name: string;
  icon: string;
  auflockerung: number; // Faktor V_lose / V_fest
  dichte: number; // t/m3 im festen Zustand
};

const BODENARTEN: Bodenart[] = [
  { name: 'Sand / Kies', icon: '🏖️', auflockerung: 1.15, dichte: 1.5 },
  { name: 'Mutterboden', icon: '🌱', auflockerung: 1.2, dichte: 1.4 },
  { name: 'Lehm / Ton', icon: '🧱', auflockerung: 1.3, dichte: 1.9 },
  { name: 'Fels / steinig', icon: '🪨', auflockerung: 1.5, dichte: 2.2 },
];

// Gängige Mulden-/LKW-Größen für die Fuhren-Berechnung (Nutzvolumen in m3).
const MULDEN: { name: string; m3: number }[] = [
  { name: '3-Achser (≈ 8 m³)', m3: 8 },
  { name: '4-Achser (≈ 14 m³)', m3: 14 },
  { name: 'Sattel (≈ 22 m³)', m3: 22 },
];

export function ErdaushubRechner() {
  const [laenge, setLaenge] = useState(6);
  const [breite, setBreite] = useState(4);
  const [tiefe, setTiefe] = useState(0.8);
  const [arbeitsraum, setArbeitsraum] = useState(0.5);
  const [bodenIndex, setBodenIndex] = useState(0);
  const [muldeIndex, setMuldeIndex] = useState(0);
  const [mitKosten, setMitKosten] = useState(false);
  const [preisAushub, setPreisAushub] = useState(18); // €/m3 Aushub/Transport
  const [preisEntsorgung, setPreisEntsorgung] = useState(25); // €/t Entsorgung

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const boden = BODENARTEN[bodenIndex];
  const mulde = MULDEN[muldeIndex];

  // 1) Grubenmaße inkl. Arbeitsraum je Seite
  const laengeEff = laenge + 2 * arbeitsraum;
  const breiteEff = breite + 2 * arbeitsraum;

  // 2) Festes Aushubvolumen (Profilvolumen, senkrechte Wände)
  const vFest = laengeEff * breiteEff * tiefe;

  // 3) Loses, abzufahrendes Volumen (nach dem Lösen aufgelockert)
  const vLose = vFest * boden.auflockerung;

  // 4) Masse zur Entsorgung (über die feste Dichte)
  const masse = vFest * boden.dichte;

  // 5) Anzahl LKW-/Mulden-Fuhren
  const fuhren = mulde.m3 > 0 ? Math.ceil(vLose / mulde.m3) : 0;

  // 6) Optionale Kostenschätzung
  const kostenAushub = vLose * preisAushub; // pro m3 loses Volumen
  const kostenEntsorgung = masse * preisEntsorgung; // pro Tonne
  const kostenGesamt = kostenAushub + kostenEntsorgung;

  const formatM3 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const formatT = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const formatEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Erdaushub-Rechner" rechnerSlug="erdaushub-rechner" />

      {/* Bodenart-Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Bodenart auswählen</span>
        <div className="grid grid-cols-2 gap-2">
          {BODENARTEN.map((b, i) => (
            <button
              key={b.name}
              onClick={() => setBodenIndex(i)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                bodenIndex === i
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{b.icon}</span>
              <span className="text-center leading-tight">{b.name}</span>
              <span className="text-[11px] text-gray-400">
                Faktor {b.auflockerung.toLocaleString('de-DE')} · {b.dichte.toLocaleString('de-DE')} t/m³
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Länge der Grube</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={laenge}
              onChange={(e) => setLaenge(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Breite der Grube</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={breite}
              onChange={(e) => setBreite(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Aushubtiefe</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={tiefe}
              onChange={(e) => setTiefe(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Arbeitsraum je Seite</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={arbeitsraum}
              onChange={(e) => setArbeitsraum(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Zuschlag rund um das Bauwerk (DIN 4124, typisch 0,5–0,8 m). Für reinen Oberbodenabtrag auf 0 setzen.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">LKW- / Mulden-Größe für Fuhren</span>
          <select
            value={muldeIndex}
            onChange={(e) => setMuldeIndex(Number(e.target.value))}
            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl text-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {MULDEN.map((m, i) => (
              <option key={m.name} value={i}>
                {m.name}
              </option>
            ))}
          </select>
        </label>

        {/* Kostenschätzung */}
        <div className="border-t border-gray-100 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={mitKosten}
              onChange={(e) => setMitKosten(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Kosten grob schätzen</span>
          </label>
          {mitKosten && (
            <div className="mt-3 space-y-3">
              <label className="block">
                <span className="text-sm text-gray-600">Aushub & Transport (€ pro m³ loses Volumen)</span>
                <div className="mt-2 relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={1}
                    value={preisAushub}
                    onChange={(e) => setPreisAushub(toNumber(e.target.value))}
                    className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/m³</span>
                </div>
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">Entsorgung (€ pro Tonne)</span>
                <div className="mt-2 relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={1}
                    value={preisEntsorgung}
                    onChange={(e) => setPreisEntsorgung(toNumber(e.target.value))}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/t</span>
                </div>
              </label>
              <span className="text-xs text-gray-400 block">
                Richtwerte: Aushub 10–25 €/m³, Entsorgung 8–70 €/t je nach Belastungsklasse (LAGA) und Region.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Abzufahrender Erdaushub</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatM3(vLose)}</span>
            <span className="text-xl text-blue-200">m³ lose</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            Profilvolumen (fest): {formatM3(vFest)} m³
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Masse zur Entsorgung</span>
              <span className="text-xl font-bold">{formatT(masse)} t</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">LKW-Fuhren ({mulde.name})</span>
              <span className="text-xl font-bold">{fuhren}</span>
            </div>
          </div>

          {mitKosten && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Kostenschätzung</span>
                <span className="text-xl font-bold">{formatEuro(kostenGesamt)} €</span>
              </div>
              <p className="text-blue-200 text-xs mt-1">
                Aushub {formatEuro(kostenAushub)} € + Entsorgung {formatEuro(kostenEntsorgung)} €
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Maße inkl. Arbeitsraum</strong> = (L + 2 × a) × (B + 2 × a) ={' '}
            {formatM3(laengeEff)} m × {formatM3(breiteEff)} m
          </p>
          <p>
            <strong>Festes Volumen</strong> = Länge × Breite × Tiefe = {formatM3(laengeEff)} ×{' '}
            {formatM3(breiteEff)} × {tiefe.toLocaleString('de-DE')} ={' '}
            <strong>{formatM3(vFest)} m³</strong>
          </p>
          <p>
            <strong>Loses Volumen</strong> = {formatM3(vFest)} m³ × Auflockerung{' '}
            {boden.auflockerung.toLocaleString('de-DE')} = <strong>{formatM3(vLose)} m³</strong>
          </p>
          <p>
            <strong>Masse</strong> = {formatM3(vFest)} m³ × {boden.dichte.toLocaleString('de-DE')} t/m³ ={' '}
            <strong>{formatT(masse)} t</strong>
          </p>
          <p>
            <strong>Fuhren</strong> = aufrunden({formatM3(vLose)} m³ ÷ {mulde.m3} m³) ={' '}
            <strong>{fuhren}</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Alle Werte sind unverbindliche Schätzungen. Arbeitsraum und
          Böschung nach <strong>DIN 4124</strong> sowie Bodenklassen bzw. Homogenbereiche nach{' '}
          <strong>DIN 18300 (VOB/C)</strong> sind projektspezifisch durch ein Baugrundgutachten zu
          bestimmen. Die Entsorgungskosten hängen von der Belastungsklasse (LAGA/Deklarationsanalyse)
          und der Region ab. Keine Rechts-, Statik- oder Bauberatung – Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default ErdaushubRechner;
