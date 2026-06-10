import { useState } from 'react';

// Laminatbedarf:
//  Fläche       = Länge × Breite
//  Materialbedarf = Fläche × Verschnittfaktor
//  Pakete       = ceil(Materialbedarf / m² pro Paket) + Reserve
//  Kosten       = Material + Trittschall + Sockelleisten + Verlegung
// Verschnittfaktoren je Muster: gerade 1,05; Standard 1,08; diagonal 1,15;
// Fischgrät 1,18. Quellen: casando.de, parkett-direkt.net, renovierungskosten.net.

type Muster = {
  name: string;
  icon: string;
  faktor: number; // Verschnittfaktor
};

const MUSTER: Muster[] = [
  { name: 'Gerade / Halbverband', icon: '➡️', faktor: 1.05 },
  { name: 'Standard-Verlegung', icon: '🪵', faktor: 1.08 },
  { name: 'Diagonal', icon: '↗️', faktor: 1.15 },
  { name: 'Fischgrät', icon: '🐟', faktor: 1.18 },
];

export function LaminatRechner() {
  const [musterIndex, setMusterIndex] = useState(1);
  const [laenge, setLaenge] = useState(5);
  const [breite, setBreite] = useState(4);
  const [faktor, setFaktor] = useState(MUSTER[1].faktor);
  const [proPaket, setProPaket] = useState(2.4); // m² pro Paket
  const [reservePakete, setReservePakete] = useState(1);
  const [preisProM2, setPreisProM2] = useState(15); // € Material/m²
  const [mitZubehoer, setMitZubehoer] = useState(true);
  const [profi, setProfi] = useState(false);
  const [verlegungProM2, setVerlegungProM2] = useState(25); // € Profi-Verlegung/m²

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleMusterWechsel = (index: number) => {
    setMusterIndex(index);
    setFaktor(MUSTER[index].faktor);
  };

  const flaeche = laenge * breite;
  const umfang = 2 * (laenge + breite);
  const bedarf = flaeche * faktor; // m² inkl. Verschnitt
  const paketeNetto = proPaket > 0 ? Math.ceil(bedarf / proPaket) : 0;
  const paketeGesamt = paketeNetto + reservePakete;

  // Kosten
  const materialKosten = paketeGesamt * proPaket * preisProM2;
  const daemmungKosten = mitZubehoer ? flaeche * 2 : 0; // Trittschall ~2 €/m²
  const leistenKosten = mitZubehoer ? umfang * 10 : 0; // Sockelleisten ~10 €/m
  const verlegungKosten = profi ? flaeche * verlegungProM2 : 0;
  const gesamtKosten = materialKosten + daemmungKosten + leistenKosten + verlegungKosten;

  const formatNum = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const formatEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Verlegemuster */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Verlegemuster</span>
        <div className="grid grid-cols-2 gap-2">
          {MUSTER.map((m, i) => (
            <button
              key={m.name}
              onClick={() => handleMusterWechsel(i)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                musterIndex === i
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{m.icon}</span>
              <span className="text-center leading-tight">{m.name}</span>
              <span className="text-[10px] text-gray-400">+{formatNum((m.faktor - 1) * 100)} %</span>
            </button>
          ))}
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <div className="grid grid-cols-2 gap-3">
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

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-gray-700 font-medium">Verschnittfaktor</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={1}
                step={0.01}
                value={faktor}
                onChange={(e) => setFaktor(Math.max(1, toNumber(e.target.value)))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">×</span>
            </div>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">m² pro Paket</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={proPaket}
                onChange={(e) => setProPaket(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">m²</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">Steht auf der Verpackung (oft 2,2–2,5 m²)</span>
          </label>
        </div>

        <label className="block">
          <span className="text-gray-700 font-medium">Reserve-Pakete</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={reservePakete}
              onChange={(e) => setReservePakete(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Stk</span>
          </div>
        </label>

        {/* Kosten-Optionen */}
        <div className="border-t border-gray-100 pt-4 space-y-4">
          <label className="block">
            <span className="text-gray-700 font-medium">Materialpreis pro m²</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.5}
                value={preisProM2}
                onChange={(e) => setPreisProM2(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">Übliche Spanne 7–18 €/m²</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={mitZubehoer}
              onChange={(e) => setMitZubehoer(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Trittschall (≈ 2 €/m²) und Sockelleisten (≈ 10 €/m)</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={profi}
              onChange={(e) => setProfi(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Verlegung durch Profi (statt selbst)</span>
          </label>

          {profi && (
            <label className="block">
              <span className="text-sm text-gray-600">Verlegekosten pro m²</span>
              <div className="mt-1 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={1}
                  value={verlegungProM2}
                  onChange={(e) => setVerlegungProM2(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">Üblich 20–35 €/m² inkl. Material-Handling</span>
            </label>
          )}
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Benötigte Laminat-Pakete</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatNum(paketeGesamt)}</span>
            <span className="text-xl text-blue-200">{paketeGesamt === 1 ? 'Paket' : 'Pakete'}</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            für {formatNum(flaeche)} m² · Materialbedarf {formatNum(bedarf)} m²
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Pakete ohne Reserve</span>
              <span className="text-xl font-bold">{formatNum(paketeNetto)} Stk</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Geschätzte Gesamtkosten</span>
              <span className="font-bold">{formatEuro(gesamtKosten)} €</span>
            </div>
          </div>
          {profi && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">davon Verlegung</span>
                <span className="font-bold">{formatEuro(verlegungKosten)} €</span>
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
            <strong>Fläche</strong> = {formatNum(laenge)} m × {formatNum(breite)} m ={' '}
            <strong>{formatNum(flaeche)} m²</strong>
          </p>
          <p>
            <strong>Materialbedarf</strong> = {formatNum(flaeche)} × {formatNum(faktor)} (Verschnitt) ={' '}
            {formatNum(bedarf)} m²
          </p>
          <p>
            <strong>Pakete</strong> = {formatNum(bedarf)} ÷ {formatNum(proPaket)} + {formatNum(reservePakete)} ={' '}
            <strong>{formatNum(paketeGesamt)}</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Alle Werte sind Richtwerte. Die exakte Quadratmeterzahl pro Paket
          steht auf der Verpackung. Verschnitt, Material-, Zubehör- und Verlegekosten variieren je nach
          Produkt, Region und Qualität. Die Kostenangaben sind grobe Schätzungen und ersetzen kein
          Angebot. Alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default LaminatRechner;
