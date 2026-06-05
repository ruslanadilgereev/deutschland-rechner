import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Strompreis-Default Stand Juni 2026
// Quelle: Finanztip Strompreis (Bestandskunden-Musterhaushalt ~37,2 ct/kWh,
// Neukunden-Tarife ~31,5 ct/kWh). Wir nutzen einen runden, eher konservativen
// Mittelwert als Voreinstellung – der Nutzer kann ihn jederzeit anpassen.
const STROMPREIS_DEFAULT_CT = 35; // ct/kWh

// Gängige Geräte als Voreinstellungen (typische Leistung in Watt + typische Nutzung).
// Quellen: Verivox, hirschzauber.de, ENTEGA, GASAG (Stand 2026). Werte sind
// Richtwerte – tatsächlicher Verbrauch hängt von Modell, Alter und Nutzung ab.
type GeraetVoreinstellung = {
  name: string;
  icon: string;
  watt: number;
  stundenProTag: number;
  tageProJahr: number;
};

const GERAETE: GeraetVoreinstellung[] = [
  { name: 'Kühlschrank', icon: '🧊', watt: 100, stundenProTag: 8, tageProJahr: 365 },
  { name: 'Fernseher (LED)', icon: '📺', watt: 100, stundenProTag: 4, tageProJahr: 365 },
  { name: 'Desktop-PC', icon: '🖥️', watt: 120, stundenProTag: 5, tageProJahr: 250 },
  { name: 'Waschmaschine', icon: '🧺', watt: 500, stundenProTag: 1, tageProJahr: 156 },
  { name: 'Wasserkocher', icon: '☕', watt: 2000, stundenProTag: 0.2, tageProJahr: 365 },
  { name: 'Eigene Eingabe', icon: '🔧', watt: 1000, stundenProTag: 2, tageProJahr: 365 },
];

export function StromverbrauchRechner() {
  const [geraetIndex, setGeraetIndex] = useState(0);
  const [watt, setWatt] = useState(GERAETE[0].watt);
  const [stundenProTag, setStundenProTag] = useState(GERAETE[0].stundenProTag);
  const [tageProJahr, setTageProJahr] = useState(GERAETE[0].tageProJahr);
  const [strompreisCt, setStrompreisCt] = useState(STROMPREIS_DEFAULT_CT);
  const [standby, setStandby] = useState(false);
  const [standbyWatt, setStandbyWatt] = useState(8);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleGeraetWechsel = (index: number) => {
    setGeraetIndex(index);
    const g = GERAETE[index];
    setWatt(g.watt);
    setStundenProTag(g.stundenProTag);
    setTageProJahr(g.tageProJahr);
  };

  // Aktiver Verbrauch
  const kwhAktivProJahr = (watt / 1000) * stundenProTag * tageProJahr;

  // Standby-Verbrauch (Reststunden des Tages, an denen das Gerät am Netz hängt)
  const standbyStundenProTag = standby ? Math.max(0, 24 - stundenProTag) : 0;
  const kwhStandbyProJahr = standby
    ? (standbyWatt / 1000) * standbyStundenProTag * tageProJahr
    : 0;

  const kwhProJahr = kwhAktivProJahr + kwhStandbyProJahr;

  const preisProKwh = strompreisCt / 100;
  const kostenProJahr = kwhProJahr * preisProKwh;
  const kostenProMonat = kostenProJahr / 12;
  const kostenStandbyProJahr = kwhStandbyProJahr * preisProKwh;

  const formatKwh = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const formatEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Stromverbrauch-Rechner (Geräte)" rechnerSlug="stromverbrauch-rechner" />

      {/* Geräte-Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Gerät auswählen</span>
        <div className="grid grid-cols-3 gap-2">
          {GERAETE.map((g, i) => (
            <button
              key={g.name}
              onClick={() => handleGeraetWechsel(i)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                geraetIndex === i
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{g.icon}</span>
              <span className="text-center leading-tight">{g.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Leistung (Watt)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={watt}
              onChange={(e) => setWatt(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">W</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Nutzung pro Tag (Stunden)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={24}
              step={0.5}
              value={stundenProTag}
              onChange={(e) => setStundenProTag(Math.min(24, toNumber(e.target.value)))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">h</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Nutzungstage pro Jahr</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={365}
              value={tageProJahr}
              onChange={(e) => setTageProJahr(Math.min(365, toNumber(e.target.value)))}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Tage</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Strompreis (ct/kWh)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={strompreisCt}
              onChange={(e) => setStrompreisCt(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">ct</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Voreinstellung 35 ct/kWh – Ihren genauen Preis finden Sie auf der Stromrechnung.
          </span>
        </label>

        {/* Standby */}
        <div className="border-t border-gray-100 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={standby}
              onChange={(e) => setStandby(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Standby-Verbrauch berücksichtigen</span>
          </label>
          {standby && (
            <label className="block mt-3">
              <span className="text-sm text-gray-600">
                Standby-Leistung in den übrigen {formatKwh(standbyStundenProTag)} h/Tag
              </span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.1}
                  value={standbyWatt}
                  onChange={(e) => setStandbyWatt(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">W</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                Typisch: moderne Geräte 0,5–2 W, ältere oder vernetzte Geräte (Router, Receiver) bis 8–15 W.
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Stromkosten dieses Geräts</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatEuro(kostenProJahr)}</span>
            <span className="text-xl text-blue-200">€ / Jahr</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            entspricht {formatEuro(kostenProMonat)} € pro Monat
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Verbrauch pro Jahr</span>
              <span className="text-xl font-bold">{formatKwh(kwhProJahr)} kWh</span>
            </div>
          </div>

          {standby && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">davon Standby</span>
                <span className="font-bold">
                  {formatKwh(kwhStandbyProJahr)} kWh · {formatEuro(kostenStandbyProJahr)} €
                </span>
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
            <strong>kWh/Jahr</strong> = Watt ÷ 1.000 × Stunden/Tag × Tage/Jahr
          </p>
          <p>
            = {formatKwh(watt)} ÷ 1.000 × {formatKwh(stundenProTag)} × {tageProJahr} ={' '}
            <strong>{formatKwh(kwhAktivProJahr)} kWh</strong>
            {standby && ' (aktiv)'}
          </p>
          <p>
            <strong>Kosten</strong> = kWh × Strompreis = {formatKwh(kwhProJahr)} kWh ×{' '}
            {formatEuro(strompreisCt / 100)} € = <strong>{formatEuro(kostenProJahr)} €</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Die Voreinstellungen sind Richtwerte. Der tatsächliche Verbrauch
          hängt vom konkreten Modell, Alter und Nutzungsverhalten ab. Den exakten Verbrauch messen Sie
          am besten mit einem Strommessgerät. Alle Angaben ohne Gewähr – keine Energieberatung.
        </p>
      </div>
    </div>
  );
}

export default StromverbrauchRechner;
