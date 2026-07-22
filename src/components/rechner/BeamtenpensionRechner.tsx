import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE – Beamtenversorgung Bund (BeamtVG) ===
// Alle Konstanten stammen aus dem amtlichen Gesetzestext (gesetze-im-internet.de).
// Landes-/Kommunalbeamte unterliegen abweichendem Landesrecht (LBeamtVG).

// Ruhegehaltssatz je Jahr ruhegehaltfähiger Dienstzeit
// § 14 Abs. 1 BeamtVG – https://www.gesetze-im-internet.de/beamtvg/__14.html
const RUHEGEHALTSSATZ_JE_JAHR = 1.79375; // Prozent je Dienstjahr

// Höchstruhegehaltssatz
// § 14 Abs. 1 BeamtVG – https://www.gesetze-im-internet.de/beamtvg/__14.html
const HOECHSTSATZ = 71.75; // Prozent (erreicht nach 40 Jahren)

// Versorgungsabschlag je Jahr vorzeitigen Ruhestands (= 0,3 % je Monat)
// § 14 Abs. 3 BeamtVG – https://www.gesetze-im-internet.de/beamtvg/__14.html
const ABSCHLAG_JE_MONAT = 0.3; // Prozent je Monat vor der Altersgrenze

// Höchstabschlag Fälle Nr. 1 und 3 (z. B. Antragsruhestand / Altersgrenze)
// § 14 Abs. 3 BeamtVG – https://www.gesetze-im-internet.de/beamtvg/__14.html
const ABSCHLAG_DECKEL_REGEL = 10.8; // Prozent

// Höchstabschlag Fall Nr. 2 (z. B. Dienstunfähigkeit)
// § 14 Abs. 3 BeamtVG – https://www.gesetze-im-internet.de/beamtvg/__14.html
const ABSCHLAG_DECKEL_DIENSTUNFAEHIG = 14.4; // Prozent

// Amtsunabhängige Mindestversorgung: 35 % der ruhegehaltfähigen Dienstbezüge
// § 14 Abs. 4 BeamtVG – https://www.gesetze-im-internet.de/beamtvg/__14.html
const MINDEST_AMTSUNABHAENGIG = 0.35;

// Amtsabhängige Mindestversorgung: 65 % der Bezüge aus Endstufe A 4
// § 14 Abs. 4 BeamtVG – https://www.gesetze-im-internet.de/beamtvg/__14.html
const MINDEST_AMTSABHAENGIG = 0.65;

// Erhöhungsbetrag der Mindestversorgung (dynamisiert – gegen aktuelle Fassung prüfen)
// § 14 Abs. 4 BeamtVG – https://www.gesetze-im-internet.de/beamtvg/__14.html
const MINDEST_ERHOEHUNG_EUR = 30.68; // EUR

// Vervielfältigungsfaktor auf die ruhegehaltfähigen Dienstbezüge
// § 5 Abs. 1 BeamtVG – https://www.gesetze-im-internet.de/beamtvg/__5.html
const RGF_FAKTOR = 0.9901;

// Wartezeit (Mindestdienstzeit) für den Ruhegehaltsanspruch
// § 4 Abs. 1 BeamtVG – https://www.gesetze-im-internet.de/beamtvg/__4.html
const WARTEZEIT_JAHRE = 5;

type Fallgruppe = 'regel' | 'dienstunfaehig';

export default function BeamtenpensionRechner() {
  // Ruhegehaltfähige Dienstzeit
  const [dienstjahre, setDienstjahre] = useState(40);

  // Ruhegehaltfähige Dienstbezüge (EUR/Monat) – amtliche Besoldungsbeträge
  // müssen der aktuellen Bundesbesoldungsordnung (Anlage IV BBesG) entnommen werden.
  const [grundgehalt, setGrundgehalt] = useState(4500);
  const [familienzuschlag, setFamilienzuschlag] = useState(0);
  const [weitereBezuege, setWeitereBezuege] = useState(0);

  // Vorzeitiger Ruhestand
  const [vorzeitig, setVorzeitig] = useState(false);
  const [monateVorzeitig, setMonateVorzeitig] = useState(0);
  const [fallgruppe, setFallgruppe] = useState<Fallgruppe>('regel');

  // Amtsabhängige Mindestversorgung (Endstufe A 4, optional)
  const [endstufeA4, setEndstufeA4] = useState(0);

  const ergebnis = useMemo(() => {
    // === Wartezeit-Prüfung (§ 4 Abs. 1 BeamtVG) ===
    const wartezeitErfuellt = dienstjahre >= WARTEZEIT_JAHRE;

    // === Schritt 1: Ruhegehaltssatz (§ 14 Abs. 1 BeamtVG) ===
    // 1,79375 % je Dienstjahr, gedeckelt bei 71,75 %; kaufmännisch auf 2 Stellen gerundet
    const satzUngekappt = RUHEGEHALTSSATZ_JE_JAHR * dienstjahre;
    const satzGekappt = Math.min(HOECHSTSATZ, satzUngekappt);
    const ruhegehaltssatz = Math.round(satzGekappt * 100) / 100;
    const satzGedeckelt = satzUngekappt > HOECHSTSATZ;

    // === Schritt 2: Ruhegehaltfähige Dienstbezüge (§ 5 Abs. 1 BeamtVG) ===
    const bezuegeBasis = grundgehalt + familienzuschlag + weitereBezuege;
    const rgfDB = bezuegeBasis * RGF_FAKTOR;

    // === Schritt 3: Bruttoruhegehalt ===
    const bruttoRuhegehalt = (ruhegehaltssatz / 100) * rgfDB;

    // === Schritt 4: Versorgungsabschlag (§ 14 Abs. 3 BeamtVG) ===
    const deckel = fallgruppe === 'dienstunfaehig'
      ? ABSCHLAG_DECKEL_DIENSTUNFAEHIG
      : ABSCHLAG_DECKEL_REGEL;
    const abschlagProzentUngekappt = vorzeitig ? ABSCHLAG_JE_MONAT * monateVorzeitig : 0;
    const abschlagProzent = Math.min(deckel, abschlagProzentUngekappt);
    const abschlagGedeckelt = abschlagProzentUngekappt > deckel;
    const abschlagBetrag = bruttoRuhegehalt * (abschlagProzent / 100);
    const ruhegehaltNachAbschlag = bruttoRuhegehalt - abschlagBetrag;

    // === Schritt 5: Mindestversorgung (§ 14 Abs. 4 BeamtVG) ===
    const mindestAmtsunabhaengig = MINDEST_AMTSUNABHAENGIG * rgfDB + MINDEST_ERHOEHUNG_EUR;
    const mindestAmtsabhaengig = endstufeA4 > 0
      ? MINDEST_AMTSABHAENGIG * endstufeA4 + MINDEST_ERHOEHUNG_EUR
      : 0;
    const mindestversorgung = Math.max(mindestAmtsunabhaengig, mindestAmtsabhaengig);

    // === Endgültiges Ruhegehalt ===
    const mindestGreift = mindestversorgung > ruhegehaltNachAbschlag;
    const ruhegehalt = wartezeitErfuellt
      ? Math.max(ruhegehaltNachAbschlag, mindestversorgung)
      : 0;

    return {
      wartezeitErfuellt,
      ruhegehaltssatz,
      satzGedeckelt,
      bezuegeBasis,
      rgfDB,
      bruttoRuhegehalt,
      deckel,
      abschlagProzent,
      abschlagGedeckelt,
      abschlagBetrag,
      ruhegehaltNachAbschlag,
      mindestAmtsunabhaengig,
      mindestAmtsabhaengig,
      mindestversorgung,
      mindestGreift,
      ruhegehalt,
    };
  }, [dienstjahre, grundgehalt, familienzuschlag, weitereBezuege, vorzeitig, monateVorzeitig, fallgruppe, endstufeA4]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatProzent = (n: number) => n.toFixed(2).replace('.', ',') + ' %';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Grundgehalt */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Grundgehalt (Endamt, brutto)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Monatliches Grundgehalt der letzten Besoldungsgruppe/-stufe (Anlage IV BBesG)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={grundgehalt}
              onChange={(e) => setGrundgehalt(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="15000"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€/Monat</span>
          </div>
          <input
            type="range"
            value={grundgehalt}
            onChange={(e) => setGrundgehalt(Number(e.target.value))}
            className="w-full mt-3 accent-slate-600"
            min="2000"
            max="9000"
            step="50"
          />
        </div>

        {/* Familienzuschlag */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Familienzuschlag Stufe 1 (optional)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Ruhegehaltfähig ist nur die Stufe 1 (§ 5 Abs. 1 BeamtVG)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={familienzuschlag}
              onChange={(e) => setFamilienzuschlag(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="500"
              step="10"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
          </div>
        </div>

        {/* Weitere ruhegehaltfähige Bezüge */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Weitere ruhegehaltfähige Bezüge (optional)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Z. B. ruhegehaltfähige Zulagen / Leistungsbezüge (§ 33 BBesG)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={weitereBezuege}
              onChange={(e) => setWeitereBezuege(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="3000"
              step="10"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Dienstjahre */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Ruhegehaltfähige Dienstzeit</span>
            <span className="text-xs text-gray-500 block mt-1">
              Der Höchstsatz von 71,75 % wird nach 40 Jahren erreicht
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={dienstjahre}
              onChange={(e) => setDienstjahre(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="45"
              step="0.5"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Jahre</span>
          </div>
          <input
            type="range"
            value={dienstjahre}
            onChange={(e) => setDienstjahre(Number(e.target.value))}
            className="w-full mt-3 accent-slate-600"
            min="0"
            max="45"
            step="0.5"
          />
          {!ergebnis.wartezeitErfuellt && (
            <p className="text-xs text-red-600 mt-2">
              ⚠️ Wartezeit nicht erfüllt: Ruhegehalt gibt es erst ab {WARTEZEIT_JAHRE} Jahren Dienstzeit
              (§ 4 Abs. 1 BeamtVG) – Ausnahme: Dienstunfähigkeit infolge Dienstbeschädigung.
            </p>
          )}
        </div>

        {/* Vorzeitiger Ruhestand */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={vorzeitig}
              onChange={(e) => setVorzeitig(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-slate-600 focus:ring-slate-500"
            />
            <div>
              <span className="text-gray-700 font-medium">Vorzeitiger Ruhestand (Versorgungsabschlag)</span>
              <span className="text-xs text-gray-500 block">
                Abschlag 0,3 % je Monat vor der gesetzlichen Altersgrenze (§ 14 Abs. 3 BeamtVG)
              </span>
            </div>
          </label>

          {vorzeitig && (
            <div className="mt-4 space-y-4 p-4 bg-slate-50 rounded-xl">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-700">Monate vor der Altersgrenze</span>
                  <span className="text-lg font-bold text-slate-800">{monateVorzeitig}</span>
                </div>
                <input
                  type="range"
                  value={monateVorzeitig}
                  onChange={(e) => setMonateVorzeitig(Number(e.target.value))}
                  className="w-full accent-slate-600"
                  min="0"
                  max="60"
                  step="1"
                />
              </div>
              <div>
                <span className="text-sm text-slate-700 block mb-2">Höchstabschlag (Deckelung)</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFallgruppe('regel')}
                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                      fallgruppe === 'regel'
                        ? 'bg-slate-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-slate-100'
                    }`}
                  >
                    Antragsruhestand
                    <span className="block text-xs opacity-80">max. 10,8 %</span>
                  </button>
                  <button
                    onClick={() => setFallgruppe('dienstunfaehig')}
                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                      fallgruppe === 'dienstunfaehig'
                        ? 'bg-slate-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-slate-100'
                    }`}
                  >
                    Dienstunfähigkeit
                    <span className="block text-xs opacity-80">max. 14,4 %</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Amtsabhängige Mindestversorgung */}
        <div className="mb-2">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Endstufe A 4 (optional)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Für die amtsabhängige Mindestversorgung (65 % aus A 4). Leer lassen, wenn unbekannt.
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={endstufeA4}
              onChange={(e) => setEndstufeA4(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="6000"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-slate-500 to-gray-700 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🏛️ Ihr geschätztes Ruhegehalt</h3>
        {ergebnis.wartezeitErfuellt ? (
          <>
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">{formatEuroRound(ergebnis.ruhegehalt)}</span>
                <span className="text-xl opacity-80">brutto / Monat</span>
              </div>
              <p className="text-slate-200 mt-2 text-sm">
                Ruhegehaltssatz {formatProzent(ergebnis.ruhegehaltssatz)}
                {ergebnis.satzGedeckelt && ' (auf Höchstsatz 71,75 % gedeckelt)'}
                {ergebnis.mindestGreift && ' – es greift die Mindestversorgung'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Ruhegehaltfähige Bezüge</span>
                <div className="text-xl font-bold">{formatEuroRound(ergebnis.rgfDB)}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">
                  {ergebnis.abschlagProzent > 0 ? 'Versorgungsabschlag' : 'Bruttoruhegehalt'}
                </span>
                <div className="text-xl font-bold">
                  {ergebnis.abschlagProzent > 0
                    ? `−${formatProzent(ergebnis.abschlagProzent)}`
                    : formatEuroRound(ergebnis.bruttoRuhegehalt)}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="mb-2">
            <span className="text-3xl font-bold">Kein Ruhegehaltsanspruch</span>
            <p className="text-slate-200 mt-2 text-sm">
              Die Wartezeit von {WARTEZEIT_JAHRE} Jahren (§ 4 Abs. 1 BeamtVG) ist nicht erfüllt.
              Bei Dienstunfähigkeit infolge einer Dienstbeschädigung entfällt diese Wartezeit.
            </p>
          </div>
        )}
      </div>

      {/* Berechnungsdetails */}
      {ergebnis.wartezeitErfuellt && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
          <div className="space-y-3 text-sm">
            <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
              Ruhegehaltfähige Dienstbezüge (§ 5 BeamtVG)
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Grundgehalt + Familienzuschlag + weitere Bezüge</span>
              <span className="font-bold text-gray-900">{formatEuro(ergebnis.bezuegeBasis)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">× Faktor 0,9901</span>
              <span className="text-gray-900">{formatEuro(ergebnis.rgfDB)}</span>
            </div>

            <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
              Ruhegehaltssatz (§ 14 Abs. 1 BeamtVG)
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">{dienstjahre} Jahre × 1,79375 %</span>
              <span className="font-bold text-slate-700">{formatProzent(ergebnis.ruhegehaltssatz)}</span>
            </div>
            <div className="flex justify-between py-2 bg-slate-50 -mx-6 px-6">
              <span className="font-medium text-slate-700">= Bruttoruhegehalt</span>
              <span className="font-bold text-slate-900">{formatEuro(ergebnis.bruttoRuhegehalt)}</span>
            </div>

            {vorzeitig && ergebnis.abschlagProzent > 0 && (
              <>
                <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
                  Versorgungsabschlag (§ 14 Abs. 3 BeamtVG)
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">
                    {monateVorzeitig} Monate × 0,3 %
                    {ergebnis.abschlagGedeckelt && ` (auf ${formatProzent(ergebnis.deckel)} gedeckelt)`}
                  </span>
                  <span className="text-red-600 font-bold">−{formatProzent(ergebnis.abschlagProzent)}</span>
                </div>
                <div className="flex justify-between py-2 bg-red-50 -mx-6 px-6">
                  <span className="font-medium text-red-700">Abschlagsbetrag</span>
                  <span className="font-bold text-red-900">−{formatEuro(ergebnis.abschlagBetrag)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">= Ruhegehalt nach Abschlag</span>
                  <span className="font-bold text-gray-900">{formatEuro(ergebnis.ruhegehaltNachAbschlag)}</span>
                </div>
              </>
            )}

            <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
              Mindestversorgung (§ 14 Abs. 4 BeamtVG)
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Amtsunabhängig (35 % + 30,68 €)</span>
              <span className="text-gray-900">{formatEuro(ergebnis.mindestAmtsunabhaengig)}</span>
            </div>
            {ergebnis.mindestAmtsabhaengig > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Amtsabhängig (65 % aus A 4 + 30,68 €)</span>
                <span className="text-gray-900">{formatEuro(ergebnis.mindestAmtsabhaengig)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Maßgebliche Mindestversorgung</span>
              <span className={ergebnis.mindestGreift ? 'text-green-600 font-bold' : 'text-gray-900'}>
                {formatEuro(ergebnis.mindestversorgung)}
              </span>
            </div>

            <div className="flex justify-between py-3 bg-slate-100 -mx-6 px-6 rounded-b-xl mt-4">
              <span className="font-bold text-slate-800">Endgültiges Ruhegehalt</span>
              <span className="font-bold text-2xl text-slate-900">{formatEuro(ergebnis.ruhegehalt)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Hinweise zur Genauigkeit */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So rechnet der Rechner</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Ruhegehaltssatz:</strong> 1,79375 % je Dienstjahr, höchstens 71,75 % (§ 14 Abs. 1 BeamtVG)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Ruhegehaltfähige Bezüge:</strong> Grundgehalt + Familienzuschlag Stufe 1 + weitere Bezüge, multipliziert mit 0,9901 (§ 5 Abs. 1 BeamtVG)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Versorgungsabschlag:</strong> 0,3 % je Monat vor der Altersgrenze, gedeckelt auf 10,8 % bzw. 14,4 % (§ 14 Abs. 3 BeamtVG)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Mindestversorgung:</strong> mindestens 35 % der Bezüge bzw. 65 % aus Endstufe A 4, je + 30,68 € (§ 14 Abs. 4 BeamtVG)</span>
          </li>
          <li className="flex gap-2">
            <span>⚠️</span>
            <span><strong>Näherung:</strong> Der Erhöhungsbetrag von 30,68 € wird durch Besoldungsanpassungen dynamisiert. Aktuelle Besoldungsbeträge (Grundgehalt, A 4) müssen Sie der jeweils gültigen Anlage IV BBesG entnehmen.</span>
          </li>
        </ul>
      </div>

      {/* Wichtiger Hinweis Landesbeamte */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Nur Bundesrecht:</strong> Alle Werte gelten für Bundesbeamte (BeamtVG). Landes- und Kommunalbeamte unterliegen dem jeweiligen Landesbeamtenversorgungsgesetz (LBeamtVG) mit teils abweichenden Sätzen und Beträgen.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Brutto vor Steuer/KV:</strong> Das Ergebnis ist ein Bruttowert. Beamtenpensionen sind einkommensteuerpflichtig; Beihilfeberechtigte tragen nur einen anteiligen Krankenversicherungsbeitrag.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Wartezeit:</strong> Ruhegehalt setzt in der Regel mindestens 5 Jahre Dienstzeit voraus (§ 4 Abs. 1 BeamtVG).</span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-sm text-gray-600">
        <strong>Hinweis:</strong> Dieser Rechner liefert eine unverbindliche <strong>Schätzung – keine
        Rechts- oder Steuerberatung</strong>. Verbindliche Auskünfte erteilt Ihre zuständige
        Versorgungsdienststelle (Bund: Bundesverwaltungsamt).
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/beamtvg/__14.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 14 BeamtVG – Höhe des Ruhegehalts (Ruhegehaltssatz, Abschlag, Mindestversorgung)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/beamtvg/__5.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 5 BeamtVG – Ruhegehaltfähige Dienstbezüge (Faktor 0,9901)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/beamtvg/__4.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 4 BeamtVG – Entstehen und Berechnung des Ruhegehalts (Wartezeit)
          </a>
        </div>
      </div>
    </div>
  );
}
