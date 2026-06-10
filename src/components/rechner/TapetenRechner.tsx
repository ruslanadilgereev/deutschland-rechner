import { useState } from 'react';

// Tapetenbedarf (bahnbasiert):
//  Raumumfang   U = 2 × (Länge + Breite)
//  Anzahl Bahnen N = ceil(U / Rollenbreite)
//  Bahnlänge      = Raumhöhe + Verschnittzugabe; bei Rapport auf das nächste
//                   Vielfache des Rapports aufrunden
//  Bahnen/Rolle   = floor(Rollenlänge / Bahnlänge)
//  Rollen         = ceil(Bahnen / Bahnen pro Rolle) + Reserve
// Eurorolle: 10,05 m × 0,53 m. Quellen: sanier.de, maler.org (Stand 2026).

export function TapetenRechner() {
  const [laenge, setLaenge] = useState(5);
  const [breite, setBreite] = useState(4);
  const [hoehe, setHoehe] = useState(2.5);
  const [rollenlaenge, setRollenlaenge] = useState(10.05);
  const [rollenbreite, setRollenbreite] = useState(0.53);
  const [rapport, setRapport] = useState(0); // cm
  const [versatz, setVersatz] = useState(false); // versetzter Ansatz
  const [zugabe, setZugabe] = useState(10); // cm Verschnitt pro Bahn
  const [reserve, setReserve] = useState(1); // Reserverollen

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const umfang = 2 * (laenge + breite); // m
  const bahnen = rollenbreite > 0 ? Math.ceil(umfang / rollenbreite) : 0;

  // Bahnlänge in Metern inkl. Verschnittzugabe
  let bahnlaenge = hoehe + zugabe / 100;
  const rapportM = rapport / 100;
  if (rapportM > 0) {
    // bei versetztem Ansatz im Schnitt zusätzlich der halbe Rapport
    const basis = versatz ? bahnlaenge + rapportM / 2 : bahnlaenge;
    bahnlaenge = Math.ceil(basis / rapportM) * rapportM;
  }

  const bahnenProRolle = bahnlaenge > 0 ? Math.floor(rollenlaenge / bahnlaenge) : 0;
  const rollenNetto = bahnenProRolle > 0 ? Math.ceil(bahnen / bahnenProRolle) : 0;
  const rollenGesamt = rollenNetto + reserve;

  // Faustkontrolle (U × H) / 5 m² nutzbare Fläche je Rolle
  const crosscheck = Math.ceil((umfang * hoehe) / 5);

  const formatNum = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Raummaße */}
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

        <label className="block">
          <span className="text-gray-700 font-medium">Raumhöhe</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.05}
              value={hoehe}
              onChange={(e) => setHoehe(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
          </div>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-gray-700 font-medium">Rollenlänge</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.05}
                value={rollenlaenge}
                onChange={(e) => setRollenlaenge(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">Eurorolle: 10,05 m</span>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Rollenbreite</span>
            <select
              value={rollenbreite}
              onChange={(e) => setRollenbreite(Number(e.target.value))}
              className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl text-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0.53}>0,53 m (Standard)</option>
              <option value={0.7}>0,70 m (breit)</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-gray-700 font-medium">Rapport / Musterversatz</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={rapport}
              onChange={(e) => setRapport(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">cm</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            0 cm = ohne Muster (frei ansetzbar). Wert steht auf dem Tapeten-Etikett.
          </span>
        </label>

        {rapport > 0 && (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={versatz}
              onChange={(e) => setVersatz(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Versetzter Ansatz (höherer Verbrauch)</span>
          </label>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-gray-700 font-medium">Verschnitt/Bahn</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={zugabe}
                onChange={(e) => setZugabe(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">cm</span>
            </div>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Reserverollen</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={reserve}
                onChange={(e) => setReserve(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Stk</span>
            </div>
          </label>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Benötigte Tapetenrollen</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatNum(rollenGesamt)}</span>
            <span className="text-xl text-blue-200">{rollenGesamt === 1 ? 'Rolle' : 'Rollen'}</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            inkl. {formatNum(reserve)} Reserve · Raumumfang {formatNum(umfang)} m
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Rollen ohne Reserve</span>
              <span className="text-xl font-bold">{formatNum(rollenNetto)} Stk</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Bahnen gesamt</span>
              <span className="font-bold">{formatNum(bahnen)} × {formatNum(bahnlaenge)} m</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Bahnen pro Rolle</span>
              <span className="font-bold">{formatNum(bahnenProRolle)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Raumumfang</strong> = 2 × ({formatNum(laenge)} + {formatNum(breite)}) ={' '}
            <strong>{formatNum(umfang)} m</strong>
          </p>
          <p>
            <strong>Bahnen</strong> = {formatNum(umfang)} ÷ {formatNum(rollenbreite)} (gerundet) ={' '}
            {formatNum(bahnen)}
          </p>
          <p>
            <strong>Bahnlänge</strong> = {formatNum(hoehe)} m + {formatNum(zugabe)} cm
            {rapport > 0 ? ' (auf Rapport gerundet)' : ''} = {formatNum(bahnlaenge)} m
          </p>
          <p>
            <strong>Bahnen/Rolle</strong> = {formatNum(rollenlaenge)} ÷ {formatNum(bahnlaenge)} (abgerundet) ={' '}
            {formatNum(bahnenProRolle)}
          </p>
          <p>
            <strong>Rollen</strong> = {formatNum(bahnen)} ÷ {formatNum(bahnenProRolle)} + {formatNum(reserve)} ={' '}
            <strong>{formatNum(rollenGesamt)}</strong>
          </p>
          <p className="text-gray-500">Faustkontrolle (U × H) ÷ 5 m² ≈ {formatNum(crosscheck)} Rollen</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Dies ist eine unverbindliche Schätzung. Muster mit großem Rapport
          und versetztem Ansatz erhöhen den Verbrauch deutlich. Bestellen Sie Reserverollen aus
          derselben Charge (gleiche Anfertigungsnummer), da Farbtöne zwischen Chargen abweichen
          können. Türen und Fenster sind hier nicht abgezogen – das ergibt eine bewusst großzügige
          Planung. Alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default TapetenRechner;
