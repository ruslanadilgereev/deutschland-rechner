import { useState } from 'react';

// Verlegeart bestimmt den Verschnitt-Zuschlag (branchenübliche Faustregeln).
// Quelle: Parkett Direkt, casando, Domke Parkett.
type Verlegeart = {
  name: string;
  icon: string;
  verschnitt: number; // Prozent
};

const VERLEGEARTEN: Verlegeart[] = [
  { name: 'Gerade / parallel', icon: '➡️', verschnitt: 6 },
  { name: 'Diagonal / verwinkelt', icon: '↗️', verschnitt: 10 },
  { name: 'Fischgrät / Muster', icon: '🪵', verschnitt: 15 },
];

export function ParkettRechner() {
  const [laenge, setLaenge] = useState(5);
  const [breite, setBreite] = useState(4);
  const [verlegeIndex, setVerlegeIndex] = useState(0);
  const [verschnitt, setVerschnitt] = useState(VERLEGEARTEN[0].verschnitt);
  const [paketInhalt, setPaketInhalt] = useState(2.5);
  const [preisProM2, setPreisProM2] = useState(30);
  const [sockelleisten, setSockelleisten] = useState(false);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleVerlegeWechsel = (index: number) => {
    setVerlegeIndex(index);
    setVerschnitt(VERLEGEARTEN[index].verschnitt);
  };

  // Raumfläche und Materialbedarf inklusive Verschnitt.
  const flaeche = laenge * breite;
  const materialbedarf = flaeche * (1 + verschnitt / 100);
  const pakete = paketInhalt > 0 ? Math.ceil(materialbedarf / paketInhalt) : 0;
  // Tatsächlich gekaufte Fläche (volle Pakete).
  const gekaufteFlaeche = pakete * paketInhalt;
  const materialkosten = materialbedarf * preisProM2;

  // Sockelleisten = Raumumfang + 10 % Verschnitt.
  const umfang = 2 * (laenge + breite);
  const sockelMeter = umfang * 1.1;

  const fmt1 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const fmt2 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const fmtEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Verlegeart */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Verlegeart wählen</span>
        <div className="grid grid-cols-3 gap-2">
          {VERLEGEARTEN.map((v, i) => (
            <button
              key={v.name}
              onClick={() => handleVerlegeWechsel(i)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                verlegeIndex === i
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{v.icon}</span>
              <span className="text-center leading-tight">{v.name}</span>
              <span className="text-gray-400">+{v.verschnitt} %</span>
            </button>
          ))}
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-gray-700 font-medium">Raumlänge</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={laenge}
                onChange={(e) => setLaenge(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
            </div>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Raumbreite</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={breite}
                onChange={(e) => setBreite(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
            </div>
          </label>
        </div>
        <p className="text-xs text-gray-400">
          Raumfläche: <strong>{fmt2(flaeche)} m²</strong>. Bei mehreren Räumen die Teilflächen addieren und als Gesamtfläche eingeben.
        </p>

        <label className="block">
          <span className="text-gray-700 font-medium">Verschnitt-Zuschlag</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={40}
              step={1}
              value={verschnitt}
              onChange={(e) => setVerschnitt(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Richtwert: gerade 5–6 %, diagonal/verwinkelt 8–10 %, Fischgrät/Muster ~15 %.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Paketinhalt</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={paketInhalt}
              onChange={(e) => setPaketInhalt(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Steht auf der Verpackung – typisch 2,0–2,5 m² pro Paket.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Preis pro m² (optional)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={1}
              value={preisProM2}
              onChange={(e) => setPreisProM2(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/m²</span>
          </div>
        </label>

        {/* Sockelleisten */}
        <div className="border-t border-gray-100 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={sockelleisten}
              onChange={(e) => setSockelleisten(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Sockelleisten mitberechnen</span>
          </label>
          <span className="text-xs text-gray-400 mt-1 block">
            Raumumfang + 10 % Verschnitt. Türöffnungen ziehen Sie bei Bedarf manuell ab.
          </span>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Benötigtes Parkett</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{pakete}</span>
            <span className="text-xl text-blue-200">Pakete</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            = {fmt2(gekaufteFlaeche)} m² gekauft (Bedarf inkl. Verschnitt {fmt2(materialbedarf)} m²)
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Materialbedarf</span>
              <span className="text-xl font-bold">{fmt2(materialbedarf)} m²</span>
            </div>
          </div>

          {preisProM2 > 0 && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">Materialkosten (Bedarf × Preis)</span>
                <span className="font-bold">{fmtEuro(materialkosten)} €</span>
              </div>
            </div>
          )}

          {sockelleisten && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">Sockelleisten (Umfang + 10 %)</span>
                <span className="font-bold">{fmt1(sockelMeter)} m</span>
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
            <strong>Fläche</strong> = Länge × Breite = {fmt1(laenge)} × {fmt1(breite)} ={' '}
            <strong>{fmt2(flaeche)} m²</strong>
          </p>
          <p>
            <strong>Bedarf</strong> = Fläche × (1 + {fmt1(verschnitt)} %) = {fmt2(flaeche)} × {fmt2(1 + verschnitt / 100)} ={' '}
            <strong>{fmt2(materialbedarf)} m²</strong>
          </p>
          <p>
            <strong>Pakete</strong> = aufrunden({fmt2(materialbedarf)} ÷ {fmt1(paketInhalt)}) ={' '}
            <strong>{pakete} Pakete</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Die Verschnittwerte sind branchenübliche Faustregeln und kein
          verbindlicher Bedarf. Bei aufwendigen Mustern, stark verwinkelten Räumen oder hochwertigem
          Material großzügiger kalkulieren. Bestellen Sie idealerweise alles aus einer Charge bzw.
          Produktionsserie, um Farbabweichungen zu vermeiden. Alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default ParkettRechner;
