import { useState } from 'react';

// Trockenbau-Materialbedarf für eine Metallständerwand (Knauf W111 / DIN 18181):
//  Wandfläche A   = Länge × Höhe (m²)
//  Plattenfläche  = Plattenbreite × Plattenhöhe (Standard 1,25 × 2,00 m = 2,5 m²)
//  Gipsplatten    = ceil( A ÷ Plattenfläche × Seiten × Lagen × (1 + Verschnitt) )
//  CW-Ständer     = ceil( L ÷ 0,625 ) + 1   (Achsabstand 62,5 cm = halbe Plattenbreite)
//  UW-Profil lfm  = 2 × L                    (Boden- und Deckenanschluss)
//  Schrauben      = A × Seiten × Lagen × 28  (Schraubraster ~25 cm an den Profilen)
//  Spachtelmasse  = A × Seiten × (Q2 0,4 | Q3/Q4 1,2) kg/m²
//  Fugenband lfm  = CW-Profile × H            (Vertikalstöße) + Reserve
//  Dämmung m²     = A (Mineralwolle, Dicke = CW-Profilbreite)
//  UW-Dübel       = ceil( 2 × L ÷ 0,7 )       (Befestigung alle ~70 cm)
// Quellen: Knauf W11.de / W111.de (DIN 18181), Siniat Unterkonstruktion (Stand 2026).

const ACHSABSTAND_M = 0.625; // 62,5 cm Standard-Achsabstand der CW-Profile
const SCHRAUBEN_PRO_M2 = 28; // Schnellbauschrauben je m² Beplankung (Richtwert)
const SPACHTEL_Q2 = 0.4; // kg/m² Fugenspachtelung (Q2)
const SPACHTEL_Q34 = 1.2; // kg/m² Vollflächenspachtelung (Q3/Q4)
const DUEBEL_ABSTAND_M = 0.7; // Bodenprofil-Befestigung alle ~70 cm

type Plattenformat = {
  name: string;
  icon: string;
  breite: number; // m
  hoehe: number; // m
};

const FORMATE: Plattenformat[] = [
  { name: '1,25 × 2,00 m', icon: '🧱', breite: 1.25, hoehe: 2.0 },
  { name: '1,25 × 2,50 m', icon: '⬛', breite: 1.25, hoehe: 2.5 },
  { name: '1,25 × 3,00 m', icon: '📏', breite: 1.25, hoehe: 3.0 },
  { name: 'Eigenes Maß', icon: '🔧', breite: 1.25, hoehe: 2.6 },
];

export function TrockenbauRechner() {
  const [formatIndex, setFormatIndex] = useState(0);
  const [laenge, setLaenge] = useState(4);
  const [hoehe, setHoehe] = useState(2.5);
  const [plattenBreite, setPlattenBreite] = useState(FORMATE[0].breite);
  const [plattenHoehe, setPlattenHoehe] = useState(FORMATE[0].hoehe);
  const [lagen, setLagen] = useState(1); // 1- oder 2-lagig
  const [beidseitig, setBeidseitig] = useState(true);
  const [cwBreite, setCwBreite] = useState(75); // 50 / 75 / 100 mm
  const [verschnitt, setVerschnitt] = useState(10);
  const [mitDaemmung, setMitDaemmung] = useState(true);
  const [vollspachtel, setVollspachtel] = useState(false); // false = Q2, true = Q3/Q4

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleFormatWechsel = (index: number) => {
    setFormatIndex(index);
    const f = FORMATE[index];
    setPlattenBreite(f.breite);
    setPlattenHoehe(f.hoehe);
  };

  const seiten = beidseitig ? 2 : 1;
  const flaeche = laenge * hoehe; // m²
  const plattenflaeche = plattenBreite * plattenHoehe; // m²
  const beplankungsflaeche = flaeche * seiten * lagen; // m² zu beplankende Fläche

  const platten =
    plattenflaeche > 0
      ? Math.ceil((flaeche / plattenflaeche) * seiten * lagen * (1 + verschnitt / 100))
      : 0;
  const cwProfile = laenge > 0 ? Math.ceil(laenge / ACHSABSTAND_M) + 1 : 0;
  const uwProfilLfm = 2 * laenge;
  const schrauben = Math.ceil(beplankungsflaeche * SCHRAUBEN_PRO_M2);
  const spachtelFaktor = vollspachtel ? SPACHTEL_Q34 : SPACHTEL_Q2;
  const spachtelKg = flaeche * seiten * spachtelFaktor;
  const fugenbandLfm = cwProfile * hoehe + laenge; // Vertikalstöße + Reserve für Anschlüsse
  const daemmungM2 = mitDaemmung ? flaeche : 0;
  const uwDuebel = laenge > 0 ? Math.ceil((2 * laenge) / DUEBEL_ABSTAND_M) : 0;

  const formatNum = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Plattenformat */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Plattenformat (Gipskarton)</span>
        <div className="grid grid-cols-2 gap-2">
          {FORMATE.map((f, i) => (
            <button
              key={f.name}
              onClick={() => handleFormatWechsel(i)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                formatIndex === i
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{f.icon}</span>
              <span className="text-center leading-tight">{f.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-gray-700 font-medium">Wandlänge</span>
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
            <span className="text-gray-700 font-medium">Wandhöhe</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={hoehe}
                onChange={(e) => setHoehe(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
            </div>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-gray-700 font-medium">Plattenbreite</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.05}
                value={plattenBreite}
                onChange={(e) => setPlattenBreite(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
            </div>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Plattenhöhe</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.05}
                value={plattenHoehe}
                onChange={(e) => setPlattenHoehe(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
            </div>
          </label>
        </div>

        {/* Beplankung: Lagen */}
        <div>
          <span className="text-gray-700 font-medium block mb-2">Beplankung (Lagen je Seite)</span>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2].map((l) => (
              <button
                key={l}
                onClick={() => setLagen(l)}
                className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                  lagen === l
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {l === 1 ? '1-lagig' : '2-lagig (doppelt)'}
              </button>
            ))}
          </div>
        </div>

        {/* Beplankung: Seiten */}
        <div>
          <span className="text-gray-700 font-medium block mb-2">Beplankte Seiten</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setBeidseitig(false)}
              className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                !beidseitig
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              einseitig
            </button>
            <button
              onClick={() => setBeidseitig(true)}
              className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                beidseitig
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              beidseitig
            </button>
          </div>
        </div>

        {/* CW-Profilbreite */}
        <div>
          <span className="text-gray-700 font-medium block mb-2">CW-Profilbreite</span>
          <div className="grid grid-cols-3 gap-2">
            {[50, 75, 100].map((b) => (
              <button
                key={b}
                onClick={() => setCwBreite(b)}
                className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                  cwBreite === b
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                CW {b}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Bestimmt die Dämmstoffdicke und die maximale Wandhöhe (Statik beachten).
          </span>
        </div>

        <label className="block">
          <span className="text-gray-700 font-medium">Verschnitt</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={50}
              value={verschnitt}
              onChange={(e) => setVerschnitt(Math.min(50, toNumber(e.target.value)))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Richtwert: einfache Wand 10 %, viele Öffnungen oder Zuschnitte 15–20 %.
          </span>
        </label>

        {/* Optionen */}
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={mitDaemmung}
              onChange={(e) => setMitDaemmung(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Mineralwolle-Dämmung einrechnen</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={vollspachtel}
              onChange={(e) => setVollspachtel(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">
              Vollflächig spachteln (Q3/Q4 statt nur Fugen Q2)
            </span>
          </label>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Materialbedarf Ständerwand</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatNum(platten)}</span>
            <span className="text-xl text-blue-200">Gipsplatten</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            für {formatNum(flaeche)} m² Wand ({beidseitig ? 'beidseitig' : 'einseitig'},{' '}
            {lagen === 2 ? '2-lagig' : '1-lagig'}) inkl. {formatNum(verschnitt)} % Verschnitt
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">CW-Ständerprofile (CW {cwBreite})</span>
              <span className="font-bold">{formatNum(cwProfile)} Stk</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">UW-Profil (Boden + Decke)</span>
              <span className="font-bold">{formatNum(uwProfilLfm)} lfm</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Schnellbauschrauben</span>
              <span className="font-bold">{formatNum(schrauben)} Stk</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">
                Spachtelmasse ({vollspachtel ? 'Q3/Q4' : 'Q2'})
              </span>
              <span className="font-bold">{formatNum(spachtelKg)} kg</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Fugendeckstreifen</span>
              <span className="font-bold">{formatNum(fugenbandLfm)} lfm</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Dübel / Schrauben für UW</span>
              <span className="font-bold">{formatNum(uwDuebel)} Stk</span>
            </div>
          </div>
          {mitDaemmung && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">Mineralwolle ({cwBreite} mm)</span>
                <span className="font-bold">{formatNum(daemmungM2)} m²</span>
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
            <strong>Wandfläche</strong> = {formatNum(laenge)} m × {formatNum(hoehe)} m ={' '}
            <strong>{formatNum(flaeche)} m²</strong>
          </p>
          <p>
            <strong>Platten</strong> = {formatNum(flaeche)} ÷ {formatNum(plattenflaeche)} m² ×{' '}
            {seiten} Seite{seiten === 2 ? 'n' : ''} × {lagen} Lage{lagen === 2 ? 'n' : ''} ×{' '}
            {formatNum(1 + verschnitt / 100)} (Verschnitt) = <strong>{formatNum(platten)} Stück</strong>
          </p>
          <p>
            <strong>CW-Profile</strong> = aufgerundet({formatNum(laenge)} m ÷ 0,625 m) + 1 ={' '}
            <strong>{formatNum(cwProfile)} Stück</strong> (Achsabstand 62,5 cm)
          </p>
          <p>
            <strong>Schrauben</strong> = {formatNum(beplankungsflaeche)} m² Beplankung × 28 Stk/m² ={' '}
            <strong>{formatNum(schrauben)} Stück</strong>
          </p>
          <p>
            <strong>Spachtelmasse</strong> = {formatNum(flaeche)} m² × {seiten} Seite
            {seiten === 2 ? 'n' : ''} × {formatNum(spachtelFaktor)} kg/m² ={' '}
            <strong>{formatNum(spachtelKg)} kg</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Die Ergebnisse gelten für nichttragende Trennwände in
          Metallständerbauweise (Knauf W111 / DIN 18181). Die maximal zulässige Wandhöhe hängt von
          CW-Profilbreite und Achsabstand ab – bei tragenden Wänden sowie Brand- oder
          Schallschutzanforderungen ist eine Fachplanung erforderlich. Die Mengen sind Schätzwerte
          inklusive Verschnitt und keine verbindliche Materialliste. Alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default TrockenbauRechner;
