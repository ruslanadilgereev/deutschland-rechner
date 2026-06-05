import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Wärmeübergangswiderstände für Innendämmung Außenwand (DIN EN ISO 6946).
const RSI = 0.13;
const RSE = 0.04;
// GEG Anlage 7: Höchstwert Außenwand bei Innendämmung 0,35 W/(m²K) (Sonderfall).
const GEG_INNENWAND = 0.35;

type Bauteil = { id: string; name: string; icon: string };
const BAUTEILE: Bauteil[] = [
  { id: 'wand', name: 'Außenwand innen', icon: '🧱' },
  { id: 'decke', name: 'Oberste Geschossdecke', icon: '⬆️' },
  { id: 'keller', name: 'Kellerdecke', icon: '⬇️' },
];

// Dämmstoffe mit typischer Wärmeleitfähigkeit λ (WLS) in W/(m·K).
const DAEMMSTOFFE: { id: string; name: string; lambda: number }[] = [
  { id: 'kalziumsilikat', name: 'Kalziumsilikat (060)', lambda: 0.060 },
  { id: 'mineralwolle', name: 'Mineralwolle (035)', lambda: 0.035 },
  { id: 'holzfaser', name: 'Holzfaser (040)', lambda: 0.040 },
  { id: 'multipor', name: 'Mineraldämmplatte (045)', lambda: 0.045 },
  { id: 'pur', name: 'PUR/PIR (024)', lambda: 0.024 },
];

export function InnendaemmungRechner() {
  const [bauteilId, setBauteilId] = useState('wand');
  const [flaeche, setFlaeche] = useState(30);
  const [verschnitt, setVerschnitt] = useState(10);
  const [daemmId, setDaemmId] = useState('holzfaser');
  const [lambda, setLambda] = useState(0.040);
  const [dickeMm, setDickeMm] = useState(80);
  const [paketInhalt, setPaketInhalt] = useState(4);
  const [bestandAktiv, setBestandAktiv] = useState(false);
  const [bestandR, setBestandR] = useState(1.0);

  // Robuste Zahleneingabe: leeres/ungültiges Feld ergibt 0 statt NaN.
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const bauteil = BAUTEILE.find((b) => b.id === bauteilId)!;

  const handleDaemm = (id: string) => {
    setDaemmId(id);
    setLambda(DAEMMSTOFFE.find((d) => d.id === id)!.lambda);
  };

  const dM = dickeMm / 1000;
  const aEff = flaeche * (1 + verschnitt / 100);
  const pakete = paketInhalt > 0 ? Math.ceil(aEff / paketInhalt) : 0;
  const volumenM3 = aEff * dM;

  // U-Wert-Näherung: U = 1 / (Rsi + d/λ + R_bestand + Rse)
  const rDaemm = lambda > 0 ? dM / lambda : 0;
  const rBestandWert = bestandAktiv ? bestandR : 0;
  const uNeu = 1 / (RSI + rDaemm + rBestandWert + RSE);
  const gegOk = bauteilId === 'wand' ? uNeu <= GEG_INNENWAND : true;

  const fmt = (v: number, max = 1) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: max });
  const fmt3 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 3 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Innendämmung-Rechner" rechnerSlug="innendaemmung-rechner" />

      {/* Bauteil */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Bauteil</span>
        <div className="grid grid-cols-3 gap-2">
          {BAUTEILE.map((b) => (
            <button
              key={b.id}
              onClick={() => setBauteilId(b.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                bauteilId === b.id
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
          <span className="text-gray-700 font-medium">Zu dämmende Fläche</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.5}
              value={flaeche}
              onChange={(e) => setFlaeche(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
          </div>
        </label>

        {/* Dämmstoff */}
        <div>
          <span className="text-gray-700 font-medium block mb-2">Dämmstoff (WLS)</span>
          <select
            value={daemmId}
            onChange={(e) => handleDaemm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {DAEMMSTOFFE.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-gray-700 font-medium">Dämmdicke</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={10}
                value={dickeMm}
                onChange={(e) => setDickeMm(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">mm</span>
            </div>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">λ (W/m·K)</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.001}
              value={lambda}
              onChange={(e) => setLambda(toNumber(e.target.value))}
              className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-gray-700 font-medium">Verschnitt</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={30}
                step={1}
                value={verschnitt}
                onChange={(e) => setVerschnitt(Math.min(30, toNumber(e.target.value)))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Paketinhalt</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.5}
                value={paketInhalt}
                onChange={(e) => setPaketInhalt(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
            </div>
          </label>
        </div>

        {/* Optionaler Bestand */}
        <div className="border-t border-gray-100 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={bestandAktiv}
              onChange={(e) => setBestandAktiv(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Bestandswand für U-Wert berücksichtigen</span>
          </label>
          {bestandAktiv && (
            <label className="block mt-3">
              <span className="text-sm text-gray-600">Wärmedurchlasswiderstand R der Bestandswand (ohne Übergänge)</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.1}
                  value={bestandR}
                  onChange={(e) => setBestandR(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">m²K/W</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                Richtwert ungedämmtes Vollziegel-Mauerwerk 24 cm ≈ 0,35; 36,5 cm ≈ 0,55 m²K/W.
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Material für die Innendämmung</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{fmt(pakete, 0)}</span>
            <span className="text-xl text-blue-200">Pakete</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            für {fmt(aEff)} m² inkl. {fmt(verschnitt, 0)} % Verschnitt
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Dämmfläche / Volumen</span>
              <span className="font-bold">{fmt(aEff)} m² · {fmt(volumenM3, 2)} m³</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">U-Wert nach Dämmung (Näherung)</span>
              <span className="font-bold">≈ {fmt3(uNeu)} W/(m²K)</span>
            </div>
          </div>
          {bauteilId === 'wand' && (
            <div className={`rounded-xl p-4 ${gegOk ? 'bg-green-400/20' : 'bg-red-400/20'} backdrop-blur-sm`}>
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-50">GEG-Höchstwert Innendämmung (0,35)</span>
                <span className="font-bold">{gegOk ? '✓ erfüllt' : '✗ überschritten'}</span>
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
            <strong>Dämmfläche</strong> = {fmt(flaeche)} m² × {fmt(1 + verschnitt / 100, 2)} ={' '}
            <strong>{fmt(aEff)} m²</strong>; <strong>Pakete</strong> = {fmt(aEff)} ÷ {fmt(paketInhalt)} ={' '}
            <strong>{fmt(pakete, 0)}</strong>
          </p>
          <p>
            <strong>U</strong> = 1 ÷ (Rsi + d/λ {bestandAktiv ? '+ R_Bestand ' : ''}+ Rse) = 1 ÷ ({fmt(RSI, 2)} +{' '}
            {fmt3(rDaemm)} {bestandAktiv ? `+ ${fmt(rBestandWert, 2)} ` : ''}+ {fmt(RSE, 2)}) ={' '}
            <strong>{fmt3(uNeu)} W/(m²K)</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Wichtig:</strong> Innendämmung ist feuchte- und tauwasserkritisch. Ohne
          Tauwasser-/Feuchtenachweis (Glaser bzw. instationär/WUFI) drohen Schimmel und Bauschäden.
          Der Rechner liefert nur eine Mengen- und U-Wert-Näherung (Einschicht), keinen
          bauphysikalischen Feuchteschutz-Nachweis. Vor der Ausführung Fachplaner/Energieberater
          hinzuziehen. Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default InnendaemmungRechner;
