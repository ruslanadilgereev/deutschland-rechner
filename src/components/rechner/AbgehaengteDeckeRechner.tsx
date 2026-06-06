import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Materialbedarf für eine abgehängte Decke in Metall-Unterkonstruktion
// (Gipskarton-Unterdecke nach Knauf D11 / D112):
//   Deckenfläche A   = Länge × Breite (m²) – alternativ direkt eingegeben
//   Plattenfläche P  = 2,00 × 1,25 m = 2,5 m²/Platte
//   Gipsplatten      = ceil( A × (1 + Verschnitt) ÷ P ) × Lagen
//   Tragprofil-Reihen= ceil( B ÷ Achsabstand a ) + 1   (a Default 0,40 m, D112)
//   Trag-CD lfm      = Reihen × L × (1 + Verschnitt)
//   Grund-Reihen     = ceil( L ÷ g ) + 1   (g Default 1,00 m; nur bei Doppelrost)
//   Grund-CD lfm     = Reihen × B × (1 + Verschnitt)   (Einfachrost = 0)
//   CD-Stangen à 4 m = ceil( (Trag-CD + Grund-CD) ÷ 4,0 )
//   Direktabhänger   = ceil( netto Trag-CD-lfm ÷ 0,90 )   (Abstand ≤ 0,90 m)
//   UD-Randprofil lfm= Raumumfang U × (1 + Verschnitt);  U = 2 × (L + B)
//   UD-Stangen à 4 m = ceil( UD-lfm ÷ 4,0 )
//   Schnellbauschrauben TN 25 = ceil( A × 17 × Lagen )   (Schraubabstand ≤ 17 cm)
//   Dämmung m²       = A (optional)
// Quellen: Knauf Detailblatt D11 / D112 (DIN 18181), OBI Ratgeber „Decke abhängen" (Stand 2026).

const PLATTE_M2 = 2.5; // 2,00 m × 1,25 m Standard-GKB-Platte
const SCHRAUBEN_PRO_M2 = 17; // Schnellbauschrauben TN 25 je m² und Lage (Abstand ≤ 17 cm)
const ABHAENGER_ABSTAND_M = 0.9; // max. Abstand Direktabhänger entlang des Tragprofils
const GRUND_ACHS_M = 1.0; // Achsabstand der Grundprofile (Querrichtung, Doppelrost)
const STANGE_M = 4.0; // Standardlänge CD-/UD-Profilstange

export function AbgehaengteDeckeRechner() {
  const [eingabeArt, setEingabeArt] = useState<'masse' | 'flaeche'>('masse');
  const [laenge, setLaenge] = useState(4);
  const [breite, setBreite] = useState(3);
  const [flaecheDirekt, setFlaecheDirekt] = useState(12);
  const [lagen, setLagen] = useState(1); // 1- oder 2-lagig
  const [doppelrost, setDoppelrost] = useState(true); // Doppel- (Grund+Trag) vs. Einfachrost
  const [achsabstand, setAchsabstand] = useState(0.4); // 0,40 m (Default, D112) oder 0,50 m
  const [verschnitt, setVerschnitt] = useState(10);
  const [mitDaemmung, setMitDaemmung] = useState(false);
  const [spots, setSpots] = useState(0);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  // Geometrie. Bei direkter Flächeneingabe nehmen wir ein quadratisches
  // Ersatzmaß an, damit Umfang und Profilreihen sinnvoll geschätzt werden.
  const flaeche =
    eingabeArt === 'masse' ? laenge * breite : flaecheDirekt;
  const L = eingabeArt === 'masse' ? laenge : Math.sqrt(Math.max(0, flaecheDirekt));
  const B = eingabeArt === 'masse' ? breite : Math.sqrt(Math.max(0, flaecheDirekt));
  const umfang = 2 * (L + B);

  const vFaktor = 1 + verschnitt / 100;

  // Gipsplatten
  const platten =
    flaeche > 0 ? Math.ceil((flaeche * vFaktor) / PLATTE_M2) * lagen : 0;

  // Tragprofile (laufen in Längsrichtung, im Achsabstand a über die Breite)
  const tragReihen = B > 0 ? Math.ceil(B / achsabstand) + 1 : 0;
  const tragLfmNetto = tragReihen * L;
  const tragLfm = tragLfmNetto * vFaktor;

  // Grundprofile (nur Doppelrost, laufen quer, Achsabstand 1,00 m)
  const grundReihen = doppelrost && L > 0 ? Math.ceil(L / GRUND_ACHS_M) + 1 : 0;
  const grundLfm = doppelrost ? grundReihen * B * vFaktor : 0;

  const cdLfm = tragLfm + grundLfm;
  const cdStangen = cdLfm > 0 ? Math.ceil(cdLfm / STANGE_M) : 0;

  // Direktabhänger entlang der netto verbauten Tragprofil-Länge
  const abhaenger =
    tragLfmNetto > 0 ? Math.ceil(tragLfmNetto / ABHAENGER_ABSTAND_M) : 0;

  // UD-Randprofil am Wandanschluss
  const udLfm = umfang * vFaktor;
  const udStangen = udLfm > 0 ? Math.ceil(udLfm / STANGE_M) : 0;

  // Schnellbauschrauben
  const schrauben = Math.ceil(flaeche * SCHRAUBEN_PRO_M2 * lagen);

  // Dämmung
  const daemmungM2 = mitDaemmung ? flaeche : 0;

  const formatNum = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Abgehängte-Decke-Rechner" rechnerSlug="abgehaengte-decke-rechner" />

      {/* Eingabeart */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Wie geben Sie den Raum ein?</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setEingabeArt('masse')}
            className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
              eingabeArt === 'masse'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            Länge × Breite
          </button>
          <button
            onClick={() => setEingabeArt('flaeche')}
            className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
              eingabeArt === 'flaeche'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            Fläche direkt
          </button>
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        {eingabeArt === 'masse' ? (
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
        ) : (
          <label className="block">
            <span className="text-gray-700 font-medium">Deckenfläche</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.5}
                value={flaecheDirekt}
                onChange={(e) => setFlaecheDirekt(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">
              Profilreihen und Randprofil werden aus einem quadratischen Ersatzmaß geschätzt.
            </span>
          </label>
        )}

        {/* Beplankung: Lagen */}
        <div>
          <span className="text-gray-700 font-medium block mb-2">Beplankung (Lagen GKB 12,5 mm)</span>
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

        {/* Konstruktion */}
        <div>
          <span className="text-gray-700 font-medium block mb-2">Unterkonstruktion</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDoppelrost(false)}
              className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                !doppelrost
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Einfachrost
            </button>
            <button
              onClick={() => setDoppelrost(true)}
              className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                doppelrost
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Doppelrost
            </button>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Doppelrost = Grund- + Tragprofil (Standard bei größeren Decken). Einfachrost = nur Tragprofile.
          </span>
        </div>

        {/* Achsabstand Tragprofil */}
        <div>
          <span className="text-gray-700 font-medium block mb-2">Achsabstand Tragprofile</span>
          <div className="grid grid-cols-2 gap-2">
            {[0.4, 0.5].map((a) => (
              <button
                key={a}
                onClick={() => setAchsabstand(a)}
                className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                  achsabstand === a
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {a === 0.4 ? '40 cm (Standard)' : '50 cm'}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Nach Knauf D112 maximal 40 cm bei 12,5-mm-Beplankung. 50 cm nur bei größerer Plattendicke zulässig.
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
            Richtwert: rechteckiger Raum 10 %, verwinkelte Decke oder viele Spots 15–20 %.
          </span>
        </label>

        {/* Optionen */}
        <div className="border-t border-gray-100 pt-4 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={mitDaemmung}
              onChange={(e) => setMitDaemmung(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Dämmung (Mineralwolle) einrechnen</span>
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium">Einbauspots (optional)</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={spots}
                onChange={(e) => setSpots(Math.round(toNumber(e.target.value)))}
                className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Stk</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">
              Nur als Merkposten – Spots müssen mit Mindestabstand zu den Profilen platziert werden.
            </span>
          </label>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Materialbedarf abgehängte Decke</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatNum(platten)}</span>
            <span className="text-xl text-blue-200">Gipsplatten</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            für {formatNum(flaeche)} m² Decke ({lagen === 2 ? '2-lagig' : '1-lagig'},{' '}
            {doppelrost ? 'Doppelrost' : 'Einfachrost'}) inkl. {formatNum(verschnitt)} % Verschnitt
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">CD-Profile 60/27 gesamt</span>
              <span className="font-bold">
                {formatNum(cdLfm)} lfm · {formatNum(cdStangen)} Stangen (4 m)
              </span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">UD-Randprofil (Wandanschluss)</span>
              <span className="font-bold">
                {formatNum(udLfm)} lfm · {formatNum(udStangen)} Stangen (4 m)
              </span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Direktabhänger</span>
              <span className="font-bold">{formatNum(abhaenger)} Stk</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Schnellbauschrauben (TN 25)</span>
              <span className="font-bold">{formatNum(schrauben)} Stk</span>
            </div>
          </div>
          {mitDaemmung && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">Dämmung (Mineralwolle)</span>
                <span className="font-bold">{formatNum(daemmungM2)} m²</span>
              </div>
            </div>
          )}
          {spots > 0 && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">Einbauspots (Merkposten)</span>
                <span className="font-bold">{formatNum(spots)} Stk</span>
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
            <strong>Deckenfläche</strong>{' '}
            {eingabeArt === 'masse'
              ? `= ${formatNum(laenge)} m × ${formatNum(breite)} m = `
              : '= '}
            <strong>{formatNum(flaeche)} m²</strong>
          </p>
          <p>
            <strong>Platten</strong> = aufgerundet({formatNum(flaeche)} m² × {formatNum(vFaktor)} ÷ 2,5 m²){' '}
            × {lagen} Lage{lagen === 2 ? 'n' : ''} = <strong>{formatNum(platten)} Stück</strong>
          </p>
          <p>
            <strong>Tragprofile</strong> = (aufgerundet({formatNum(B)} m ÷ {formatNum(achsabstand)} m) + 1) ×{' '}
            {formatNum(L)} m × {formatNum(vFaktor)} = {formatNum(tragReihen)} Reihen ={' '}
            <strong>{formatNum(tragLfm)} lfm</strong>
          </p>
          {doppelrost && (
            <p>
              <strong>Grundprofile</strong> = (aufgerundet({formatNum(L)} m ÷ 1,00 m) + 1) ×{' '}
              {formatNum(B)} m × {formatNum(vFaktor)} = {formatNum(grundReihen)} Reihen ={' '}
              <strong>{formatNum(grundLfm)} lfm</strong>
            </p>
          )}
          <p>
            <strong>CD gesamt</strong> = {formatNum(cdLfm)} lfm ÷ 4 m ={' '}
            <strong>{formatNum(cdStangen)} Stangen</strong>
          </p>
          <p>
            <strong>Direktabhänger</strong> = aufgerundet({formatNum(tragLfmNetto)} lfm ÷ 0,90 m) ={' '}
            <strong>{formatNum(abhaenger)} Stück</strong>
          </p>
          <p>
            <strong>UD-Randprofil</strong> = Umfang {formatNum(umfang)} m × {formatNum(vFaktor)} ={' '}
            <strong>{formatNum(udLfm)} lfm</strong>
          </p>
          <p>
            <strong>Schrauben</strong> = {formatNum(flaeche)} m² × 17 Stk/m² × {lagen} Lage
            {lagen === 2 ? 'n' : ''} = <strong>{formatNum(schrauben)} Stück</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Die Werte sind Richtwerte nach Herstellervorgaben (Knauf D11/D112)
          und eine Mengen-/Materialschätzung – <strong>keine statische Bemessung</strong>. Tatsächliche
          Abhänger-Tragfähigkeit, maximale Achsabstände sowie Anforderungen an Brand- und Schallschutz
          richten sich nach den jeweiligen Systemvorgaben des Herstellers und ggf. nach einer
          Fachplanung. Bei hohen Lasten (z. B. schwere Leuchten) oder Abhängehöhen über ca. 12,5 cm
          sind statt Direktabhängern Nonius- oder Drahtabhänger nötig – beachten Sie das
          Hersteller-Datenblatt. Alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default AbgehaengteDeckeRechner;
