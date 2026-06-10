import { useState } from 'react';

// Ladeverluste: Beim AC-Laden gehen durch Wandlung und Thermomanagement
// typisch 10–15 % verloren, beim DC-Schnellladen ca. 5–10 %.
// Quellen: ADAC, ENBW, Mennekes (Stand 2026).
const AC_WIRKUNGSGRAD = 0.9; // ~10 % Verlust beim AC-Laden
const DC_WIRKUNGSGRAD = 0.93; // ~7 % Verlust beim DC-Laden

// Durchschnittliche DC-Leistung über den Bereich 10→80 % gegenüber der
// DC-Spitzenleistung. Wegen der Ladekurven-Drosselung (BMS schützt die
// Zellen oberhalb ca. 50–60 %) liegt der Schnitt bei rund 75 % des Peaks.
const DC_KURVEN_FAKTOR = 0.75;

const STROMPREIS_DEFAULT_CT = 45; // ct/kWh – grober Mittelwert AC-Wallbox/öffentlich 2026

type AkkuPreset = { label: string; kwh: number };
const AKKU_PRESETS: AkkuPreset[] = [
  { label: '25 kWh', kwh: 25 },
  { label: '40 kWh', kwh: 40 },
  { label: '60 kWh', kwh: 60 },
  { label: '77 kWh', kwh: 77 },
  { label: '100 kWh', kwh: 100 },
];

type LeistungPreset = { label: string; kw: number; typ: 'AC' | 'DC' };
const LEISTUNG_PRESETS: LeistungPreset[] = [
  { label: 'AC 11 kW', kw: 11, typ: 'AC' },
  { label: 'AC 22 kW', kw: 22, typ: 'AC' },
  { label: 'DC 50 kW', kw: 50, typ: 'DC' },
  { label: 'DC 150 kW', kw: 150, typ: 'DC' },
  { label: 'DC 250 kW', kw: 250, typ: 'DC' },
];

export function LadezeitEautoRechner() {
  const [akkuKwh, setAkkuKwh] = useState(60);
  const [leistungKw, setLeistungKw] = useState(11);
  const [typ, setTyp] = useState<'AC' | 'DC'>('AC');
  const [startSoc, setStartSoc] = useState(10);
  const [zielSoc, setZielSoc] = useState(80);
  const [mitKosten, setMitKosten] = useState(false);
  const [strompreisCt, setStrompreisCt] = useState(STROMPREIS_DEFAULT_CT);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  // SoC-Werte auf 0–100 begrenzen.
  const clampSoc = (v: number) => Math.min(100, Math.max(0, v));

  // Netto nachzuladende Energie in den Akku.
  const deltaSoc = Math.max(0, zielSoc - startSoc);
  const energieAkku = (akkuKwh * deltaSoc) / 100;

  // Effektive Leistung: AC mit vollem Wert, DC über den Bereich gedrosselt.
  const effektiveLeistung = typ === 'AC' ? leistungKw : leistungKw * DC_KURVEN_FAKTOR;

  // Verluste je nach Ladetyp: Es muss mehr Energie zugeführt werden, als im
  // Akku ankommt.
  const wirkungsgrad = typ === 'AC' ? AC_WIRKUNGSGRAD : DC_WIRKUNGSGRAD;
  const energieGeladen = wirkungsgrad > 0 ? energieAkku / wirkungsgrad : 0;

  // Ladezeit in Stunden = im Akku ankommende Energie / effektive Leistung.
  const ladezeitH = effektiveLeistung > 0 ? energieAkku / effektiveLeistung : 0;
  const stunden = Math.floor(ladezeitH);
  const minuten = Math.round((ladezeitH - stunden) * 60);

  // Optionale Ladekosten (auf Basis der aus dem Netz gezogenen Energie).
  const kosten = energieGeladen * (strompreisCt / 100);

  const formatKwh = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const formatEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const zeitText =
    ladezeitH <= 0
      ? '0 min'
      : stunden > 0
        ? `${stunden} h ${minuten.toString().padStart(2, '0')} min`
        : `${minuten} min`;

  return (
    <div className="max-w-lg mx-auto">

      {/* Akku-Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Akkukapazität</span>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {AKKU_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setAkkuKwh(p.kwh)}
              className={`p-2 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                akkuKwh === p.kwh
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <label className="block">
          <span className="text-xs text-gray-500">eigene Kapazität (kWh)</span>
          <div className="mt-1 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={akkuKwh}
              onChange={(e) => setAkkuKwh(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">kWh</span>
          </div>
        </label>
      </div>

      {/* Ladeleistung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Ladeleistung</span>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {LEISTUNG_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setLeistungKw(p.kw);
                setTyp(p.typ);
              }}
              className={`p-2 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                leistungKw === p.kw && typ === p.typ
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-gray-500">Leistung (kW)</span>
            <div className="mt-1 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                value={leistungKw}
                onChange={(e) => setLeistungKw(toNumber(e.target.value))}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kW</span>
            </div>
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">Ladetyp</span>
            <div className="mt-1 flex rounded-xl border border-gray-300 overflow-hidden">
              <button
                onClick={() => setTyp('AC')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  typ === 'AC' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
                }`}
              >
                AC
              </button>
              <button
                onClick={() => setTyp('DC')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  typ === 'DC' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
                }`}
              >
                DC
              </button>
            </div>
          </label>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {typ === 'AC'
            ? 'AC (Wechselstrom): durch den Onboard-Charger des Autos begrenzt (oft 11 kW).'
            : 'DC (Gleichstrom-Schnellladen): Ladekurve gedrosselt, gerechnet mit ø 75 % der Spitzenleistung.'}
        </p>
      </div>

      {/* SoC */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-gray-700 font-medium text-sm">Start-Ladestand</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                value={startSoc}
                onChange={(e) => setStartSoc(clampSoc(toNumber(e.target.value)))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium text-sm">Ziel-Ladestand</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                value={zielSoc}
                onChange={(e) => setZielSoc(clampSoc(toNumber(e.target.value)))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
          </label>
        </div>
        <p className="text-xs text-gray-400">
          Empfehlung beim Schnellladen: 10 → 80 %. Über 80 % drosselt das BMS stark, das letzte Fünftel
          dauert überproportional lange.
        </p>

        {/* Kosten optional */}
        <div className="border-t border-gray-100 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={mitKosten}
              onChange={(e) => setMitKosten(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Ladekosten berechnen</span>
          </label>
          {mitKosten && (
            <label className="block mt-3">
              <span className="text-sm text-gray-600">Strompreis (ct/kWh)</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.1}
                  value={strompreisCt}
                  onChange={(e) => setStrompreisCt(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">ct</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                Richtwert: Wallbox zu Hause ca. 30–35 ct, öffentliches AC ca. 45–55 ct, DC-Schnellladen
                oft 55–79 ct/kWh.
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">
          Ladezeit {startSoc} → {zielSoc} %
        </h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{zeitText}</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            {typ === 'AC' ? 'AC-Laden' : 'DC-Schnellladen'} mit {formatKwh(effektiveLeistung)} kW
            effektiv
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-blue-100">nachgeladene Energie</span>
              <span className="font-bold">{formatKwh(energieAkku)} kWh</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">inkl. Ladeverlust ab Netz</span>
              <span className="font-bold">{formatKwh(energieGeladen)} kWh</span>
            </div>
          </div>

          {mitKosten && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Ladekosten</span>
                <span className="text-xl font-bold">{formatEuro(kosten)} €</span>
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
            <strong>Energie</strong> = Akku × (Ziel − Start) ÷ 100 = {formatKwh(akkuKwh)} ×{' '}
            {deltaSoc} ÷ 100 = <strong>{formatKwh(energieAkku)} kWh</strong>
          </p>
          {typ === 'DC' && (
            <p>
              <strong>effektive Leistung</strong> = {formatKwh(leistungKw)} kW × 0,75 (Ladekurve) ={' '}
              <strong>{formatKwh(effektiveLeistung)} kW</strong>
            </p>
          )}
          <p>
            <strong>Ladezeit</strong> = Energie ÷ effektive Leistung = {formatKwh(energieAkku)} ÷{' '}
            {formatKwh(effektiveLeistung)} = <strong>{zeitText}</strong>
          </p>
          {mitKosten && (
            <p>
              <strong>Kosten</strong> = {formatKwh(energieGeladen)} kWh ×{' '}
              {formatEuro(strompreisCt / 100)} € = <strong>{formatEuro(kosten)} €</strong>
            </p>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Die berechnete Ladezeit ist ein Richtwert. Real weicht sie um
          etwa ±10–30 % ab, weil Außentemperatur, Batterietemperatur, Batteriealter, die individuelle
          Ladekurve und das BMS die Leistung dynamisch begrenzen. Beim DC-Laden rechnen wir mit einem
          Durchschnitt von 75 % der Spitzenleistung über 10 → 80 %; oberhalb 80 % steigt die Ladezeit
          stark an. Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default LadezeitEautoRechner;
