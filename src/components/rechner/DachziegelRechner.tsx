import { useState } from 'react';

// Ziegelmodelle mit typischem Bedarf in Stueck pro Quadratmeter.
// Quellen: ZVDH-Fachregeln, Verlegeanleitungen Nelskamp (F15) und BMI/Braas
// (Bedachung nach Mass). Der Stk/m2-Wert haengt vom konkreten Deckmass des
// Modells ab; die Werte hier sind belegbare Richtwerte fuer das jeweilige Profil.
type ZiegelModell = {
  name: string;
  icon: string;
  stkProQm: number;
  // First-/Gratziegel pro laufendem Meter (typisches Deckmass First ~40 cm)
  firstProM: number;
  // Ortgangziegel pro laufendem Meter (Reihen-Teilung der Flaechenziegel)
  ortgangProM: number;
};

const MODELLE: ZiegelModell[] = [
  { name: 'Frankfurter Pfanne', icon: '🧱', stkProQm: 11, firstProM: 2.5, ortgangProM: 3 },
  { name: 'Betondachstein', icon: '⬛', stkProQm: 10, firstProM: 2.5, ortgangProM: 2.5 },
  { name: 'Reformziegel', icon: '🟫', stkProQm: 14, firstProM: 2.5, ortgangProM: 3 },
  { name: 'Mönch-Nonne', icon: '🏛️', stkProQm: 15, firstProM: 3, ortgangProM: 3 },
  { name: 'Biberschwanz', icon: '🍂', stkProQm: 36, firstProM: 3, ortgangProM: 5 },
  { name: 'Eigene Eingabe', icon: '🔧', stkProQm: 12, firstProM: 2.5, ortgangProM: 3 },
];

export function DachziegelRechner() {
  const [modellIndex, setModellIndex] = useState(0);
  const [stkProQm, setStkProQm] = useState(MODELLE[0].stkProQm);
  const [firstProM, setFirstProM] = useState(MODELLE[0].firstProM);
  const [ortgangProM, setOrtgangProM] = useState(MODELLE[0].ortgangProM);

  // Eingabemodus fuer die Flaeche: direkte Dachflaeche ODER Grundflaeche + Neigung
  const [modus, setModus] = useState<'flaeche' | 'grundflaeche'>('flaeche');
  const [dachflaeche, setDachflaeche] = useState(120); // m2 effektive Dachflaeche
  const [grundflaeche, setGrundflaeche] = useState(80); // m2 Grundflaeche (Draufsicht)
  const [neigung, setNeigung] = useState(38); // Grad

  const [verschnitt, setVerschnitt] = useState(7); // %
  const [firstlaenge, setFirstlaenge] = useState(10); // lfm
  const [ortganglaenge, setOrtganglaenge] = useState(20); // lfm (beide Giebelseiten)

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleModellWechsel = (index: number) => {
    setModellIndex(index);
    const m = MODELLE[index];
    setStkProQm(m.stkProQm);
    setFirstProM(m.firstProM);
    setOrtgangProM(m.ortgangProM);
  };

  // Effektive Dachflaeche: bei Eingabe der Grundflaeche wird ueber den
  // Neigungsfaktor 1/cos(Neigung) auf die schraege Dachflaeche hochgerechnet.
  const neigungFaktor = 1 / Math.cos((Math.min(89, neigung) * Math.PI) / 180);
  const effektiveFlaeche =
    modus === 'flaeche' ? dachflaeche : grundflaeche * neigungFaktor;

  // Flaechenziegel brutto (ohne Verschnitt)
  const ziegelBrutto = effektiveFlaeche * stkProQm;
  // mit Verschnitt-/Bruchzuschlag
  const ziegelMitVerschnitt = ziegelBrutto * (1 + verschnitt / 100);

  // Formziegel
  const firstziegel = firstlaenge * firstProM;
  const ortgangziegel = ortganglaenge * ortgangProM;

  // Aufrunden auf ganze Stueck (Material wird nur in ganzen Ziegeln gekauft).
  // Vorher auf 6 Nachkommastellen runden, damit Gleitkomma-Artefakte
  // (z. B. 5940,0000001) nicht faelschlich aufgerundet werden.
  const ceilStk = (v: number) => Math.ceil(Math.round(v * 1e6) / 1e6);
  const flaechenziegelGerundet = ceilStk(ziegelMitVerschnitt);
  const firstziegelGerundet = ceilStk(firstziegel);
  const ortgangziegelGerundet = ceilStk(ortgangziegel);

  const formatStk = (v: number) =>
    Math.round(v).toLocaleString('de-DE', { maximumFractionDigits: 0 });
  const formatQm = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Ziegelmodell-Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Ziegelmodell auswählen</span>
        <div className="grid grid-cols-3 gap-2">
          {MODELLE.map((m, i) => (
            <button
              key={m.name}
              onClick={() => handleModellWechsel(i)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                modellIndex === i
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{m.icon}</span>
              <span className="text-center leading-tight">{m.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Flaechen-Eingabe */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <div>
          <span className="text-gray-700 font-medium block mb-3">Dachfläche angeben über</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setModus('flaeche')}
              className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                modus === 'flaeche'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Dachfläche (m²)
            </button>
            <button
              onClick={() => setModus('grundflaeche')}
              className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                modus === 'grundflaeche'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Grundfläche + Neigung
            </button>
          </div>
        </div>

        {modus === 'flaeche' ? (
          <label className="block">
            <span className="text-gray-700 font-medium">Effektive Dachfläche (schräg)</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                value={dachflaeche}
                onChange={(e) => setDachflaeche(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">
              Beide Dachseiten zusammen – die tatsächliche, geneigte Fläche.
            </span>
          </label>
        ) : (
          <>
            <label className="block">
              <span className="text-gray-700 font-medium">Grundfläche (Draufsicht)</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={grundflaeche}
                  onChange={(e) => setGrundflaeche(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
              </div>
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Dachneigung</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={89}
                  value={neigung}
                  onChange={(e) => setNeigung(Math.min(89, toNumber(e.target.value)))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">°</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                Neigungsfaktor 1 ÷ cos({formatQm(neigung)}°) = {neigungFaktor.toLocaleString('de-DE', { maximumFractionDigits: 3 })} → Dachfläche ≈ {formatQm(effektiveFlaeche)} m²
              </span>
            </label>
          </>
        )}

        <label className="block">
          <span className="text-gray-700 font-medium">Ziegelbedarf pro m²</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={stkProQm}
              onChange={(e) => setStkProQm(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Stk/m²</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Den exakten Wert finden Sie in der Verlegeanleitung Ihres Ziegelmodells.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Verschnitt-/Bruchzuschlag</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={1}
              value={verschnitt}
              onChange={(e) => setVerschnitt(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Empfehlung: 5 % bei einfachem Satteldach, 8–10 % bei Graten, Kehlen oder Gauben.
          </span>
        </label>
      </div>

      {/* Formziegel-Eingabe */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <span className="text-gray-700 font-medium block">Formziegel (optional)</span>
        <label className="block">
          <span className="text-gray-700 font-medium">Firstlänge</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={firstlaenge}
              onChange={(e) => setFirstlaenge(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            First- und Gratziegel: ca. {formatQm(firstProM)} Stück pro laufendem Meter.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Ortganglänge (beide Giebelseiten)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={ortganglaenge}
              onChange={(e) => setOrtganglaenge(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Ortgangziegel: ca. {formatQm(ortgangProM)} Stück pro laufendem Meter (Reihen-Teilung).
          </span>
        </label>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Benötigte Dachziegel</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatStk(flaechenziegelGerundet)}</span>
            <span className="text-xl text-blue-200">Flächenziegel</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            für {formatQm(effektiveFlaeche)} m² inkl. {formatQm(verschnitt)} % Verschnitt
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Firstziegel</span>
              <span className="text-xl font-bold">{formatStk(firstziegelGerundet)} Stk</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Ortgangziegel</span>
              <span className="text-xl font-bold">{formatStk(ortgangziegelGerundet)} Stk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          {modus === 'grundflaeche' && (
            <p>
              <strong>Dachfläche</strong> = Grundfläche ÷ cos(Neigung) = {formatQm(grundflaeche)} ÷ cos({formatQm(neigung)}°) ={' '}
              <strong>{formatQm(effektiveFlaeche)} m²</strong>
            </p>
          )}
          <p>
            <strong>Flächenziegel brutto</strong> = Dachfläche × Stk/m² = {formatQm(effektiveFlaeche)} × {formatQm(stkProQm)} ={' '}
            <strong>{formatStk(ziegelBrutto)} Stk</strong>
          </p>
          <p>
            <strong>+ Verschnitt</strong> = {formatStk(ziegelBrutto)} × (1 + {formatQm(verschnitt)} %) ={' '}
            <strong>{formatStk(flaechenziegelGerundet)} Stk</strong>
          </p>
          <p>
            <strong>Firstziegel</strong> = {formatQm(firstlaenge)} m × {formatQm(firstProM)} Stk/m = {formatStk(firstziegelGerundet)} Stk
          </p>
          <p>
            <strong>Ortgangziegel</strong> = {formatQm(ortganglaenge)} m × {formatQm(ortgangProM)} Stk/m = {formatStk(ortgangziegelGerundet)} Stk
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Die Werte sind eine Näherung. Die exakte Stückzahl hängt vom
          konkreten Modell-Deckmaß (Verlegeanleitung des Herstellers) und der tatsächlichen
          Dachgeometrie (Grate, Kehlen, Gauben) ab. Die statische Tragfähigkeit (Ziegelgewicht je m²
          auf den Sparren) und die finale Bestellmenge gehören in die Prüfung durch Dachdecker oder
          Statiker. Reine Material-Mengenschätzung, keine Statik- oder Fachberatung – Angaben ohne
          Gewähr, keine Haftung für Fehlbestellungen.
        </p>
      </div>
    </div>
  );
}

export default DachziegelRechner;
