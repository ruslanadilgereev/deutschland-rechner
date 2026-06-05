import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Modus: Rollenware mit Bahnbreiten-Logik oder einfache m²-Variante mit Verschnitt.
type Modus = 'bahn' | 'flaeche';
// Bei Rollenware: feste Bahnbreite oder automatischer Vergleich 4 m vs. 5 m.
type Bahnwahl = '4' | '5' | 'auto';

export function TeppichbodenRechner() {
  const [modus, setModus] = useState<Modus>('bahn');
  const [breite, setBreite] = useState(4);
  const [laenge, setLaenge] = useState(5);
  const [zugabeCm, setZugabeCm] = useState(10); // gesamte Schnittzugabe in cm
  const [bahnwahl, setBahnwahl] = useState<Bahnwahl>('auto');
  const [verschnittProz, setVerschnittProz] = useState(7); // für m²-Variante
  const [preisProM2, setPreisProM2] = useState(15);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  // Rundet einen Meterwert auf die nächsten 10 cm auf.
  const aufNaechste10cm = (m: number) => Math.ceil(m * 10) / 10;

  const nutzflaeche = breite * laenge;
  const zugabeM = zugabeCm / 100;
  // Maße inkl. Zugabe, auf 10 cm aufgerundet.
  const breiteZug = aufNaechste10cm(breite + zugabeM);
  const laengeZug = aufNaechste10cm(laenge + zugabeM);

  // Berechnet die Rollenware-Werte für eine gegebene Bahnbreite.
  const bahnRechnung = (bahnbreite: number) => {
    const bahnen = bahnbreite > 0 ? Math.ceil(breiteZug / bahnbreite) : 0;
    const lfm = bahnen * laengeZug;
    const gekauft = bahnen * bahnbreite * laengeZug;
    const verschnitt = nutzflaeche > 0 ? (gekauft - nutzflaeche) / nutzflaeche : 0;
    return { bahnbreite, bahnen, lfm, gekauft, verschnitt };
  };

  const b4 = bahnRechnung(4);
  const b5 = bahnRechnung(5);
  // Auto-Vergleich: die Bahnbreite mit weniger gekaufter Fläche gewinnt.
  const empfohlen = b4.gekauft <= b5.gekauft ? b4 : b5;
  const aktiveBahn = bahnwahl === '4' ? b4 : bahnwahl === '5' ? b5 : empfohlen;

  // m²-Variante mit pauschalem Verschnittzuschlag.
  const flaecheBrutto = nutzflaeche * (1 + verschnittProz / 100);

  // Kosten je nach Modus.
  const gekaufteFlaeche = modus === 'bahn' ? aktiveBahn.gekauft : flaecheBrutto;
  const kosten = gekaufteFlaeche * preisProM2;

  const fmt1 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const fmt2 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const fmtProz = (v: number) =>
    (v * 100).toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const fmtEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Teppichboden-Rechner" rechnerSlug="teppichboden-rechner" />

      {/* Modus */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Berechnungsart</span>
        <div className="grid grid-cols-2 gap-2">
          {([
            { key: 'bahn', label: 'Rollenware (Bahnen)' },
            { key: 'flaeche', label: 'Einfach (m² + Verschnitt)' },
          ] as { key: Modus; label: string }[]).map((m) => (
            <button
              key={m.key}
              onClick={() => setModus(m.key)}
              className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                modus === m.key
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
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
        </div>
        <p className="text-xs text-gray-400">
          Nutzfläche: <strong>{fmt2(nutzflaeche)} m²</strong>. Bei L-/U-Räumen in Rechtecke zerlegen und einzeln rechnen.
        </p>

        {modus === 'bahn' && (
          <>
            <label className="block">
              <span className="text-gray-700 font-medium">Schnittzugabe (gesamt)</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={5}
                  value={zugabeCm}
                  onChange={(e) => setZugabeCm(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">cm</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                Empfehlung 10 cm (5 cm je Seite). Maße werden auf die nächsten 10 cm aufgerundet.
              </span>
            </label>

            <div className="block">
              <span className="text-gray-700 font-medium">Bahnbreite</span>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {([
                  { key: 'auto', label: 'Auto-Vergleich' },
                  { key: '4', label: '4 m' },
                  { key: '5', label: '5 m' },
                ] as { key: Bahnwahl; label: string }[]).map((b) => (
                  <button
                    key={b.key}
                    onClick={() => setBahnwahl(b.key)}
                    className={`p-2 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                      bahnwahl === b.key
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {modus === 'flaeche' && (
          <label className="block">
            <span className="text-gray-700 font-medium">Verschnitt-Zuschlag</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={30}
                step={1}
                value={verschnittProz}
                onChange={(e) => setVerschnittProz(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">
              Faustwert 5–10 % (Default 7 %). Die m²-Variante ignoriert die Bahnbreiten-Logik.
            </span>
          </label>
        )}

        <label className="block">
          <span className="text-gray-700 font-medium">Preis pro m²</span>
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
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Benötigter Teppichboden</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{fmt2(gekaufteFlaeche)}</span>
            <span className="text-xl text-blue-200">m² kaufen</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            Nutzfläche {fmt2(nutzflaeche)} m²
            {modus === 'bahn' && ` · Bahnbreite ${fmt1(aktiveBahn.bahnbreite)} m · Verschnitt ${fmtProz(aktiveBahn.verschnitt)} %`}
          </p>
        </div>

        <div className="space-y-3">
          {modus === 'bahn' ? (
            <>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Laufmeter Rolle</span>
                  <span className="text-xl font-bold">{fmt1(aktiveBahn.lfm)} lfm</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-blue-200">Anzahl Bahnen</span>
                  <span className="font-bold">{aktiveBahn.bahnen} × {fmt1(laengeZug)} m</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center text-xs text-blue-200">
                  <span>Vergleich 4 m</span>
                  <span>{fmt2(b4.gekauft)} m² ({b4.bahnen} Bahnen)</span>
                </div>
                <div className="flex justify-between items-center text-xs text-blue-200 mt-1">
                  <span>Vergleich 5 m</span>
                  <span>{fmt2(b5.gekauft)} m² ({b5.bahnen} Bahnen)</span>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Bedarf inkl. {fmt1(verschnittProz)} % Verschnitt</span>
                <span className="text-xl font-bold">{fmt2(flaecheBrutto)} m²</span>
              </div>
            </div>
          )}

          {preisProM2 > 0 && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">Materialkosten</span>
                <span className="font-bold">{fmtEuro(kosten)} €</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          {modus === 'bahn' ? (
            <>
              <p>
                <strong>Maße + Zugabe</strong>: Breite {fmt2(breite)} → {fmt1(breiteZug)} m, Länge {fmt2(laenge)} → {fmt1(laengeZug)} m (auf 10 cm aufgerundet)
              </p>
              <p>
                <strong>Bahnen</strong> = aufrunden(Breite ÷ Bahnbreite) = aufrunden({fmt1(breiteZug)} ÷ {fmt1(aktiveBahn.bahnbreite)}) ={' '}
                <strong>{aktiveBahn.bahnen}</strong>
              </p>
              <p>
                <strong>Gekaufte Fläche</strong> = {aktiveBahn.bahnen} × {fmt1(aktiveBahn.bahnbreite)} m × {fmt1(laengeZug)} m ={' '}
                <strong>{fmt2(aktiveBahn.gekauft)} m²</strong>
              </p>
            </>
          ) : (
            <p>
              <strong>Bedarf</strong> = Nutzfläche × (1 + {fmt1(verschnittProz)} %) = {fmt2(nutzflaeche)} × {fmt2(1 + verschnittProz / 100)} ={' '}
              <strong>{fmt2(flaecheBrutto)} m²</strong>
            </p>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Das Ergebnis ist ein Richtwert. Ein exaktes Aufmaß durch einen
          Fachbetrieb vor Ort wird empfohlen, da der Verschnitt je nach Raumform und Musterrapport
          variiert. Bei gemusterter Ware kann der Bedarf höher liegen. Alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default TeppichbodenRechner;
