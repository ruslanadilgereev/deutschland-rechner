import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: Juli 2026) ===

// Aktueller Rentenwert ab 01.07.2026
// Quelle: § 1 RWBestV 2026 – https://www.gesetze-im-internet.de/rwbestv_2026/__1.html
const RENTENWERT_2026 = 42.52; // Euro pro Entgeltpunkt

// Rentenartfaktoren der Renten wegen Todes
// Quelle: § 67 SGB VI – https://www.gesetze-im-internet.de/sgb_6/__67.html
const FAKTOR_GROSSE_WITWENRENTE = 0.55; // § 67 Nr. 6 SGB VI (nach dem Sterbevierteljahr)
const FAKTOR_KLEINE_WITWENRENTE = 0.25; // § 67 Nr. 5 SGB VI (nach dem Sterbevierteljahr)
const FAKTOR_STERBEVIERTELJAHR = 1.0; // § 67 Nr. 5 u. 6 SGB VI (bis Ende des 3. Kalendermonats nach dem Sterbemonat)
const FAKTOR_ERZIEHUNGSRENTE = 1.0; // § 67 SGB VI
const FAKTOR_HALBWAISENRENTE = 0.1; // § 67 Nr. 7 SGB VI
const FAKTOR_VOLLWAISENRENTE = 0.2; // § 67 Nr. 8 SGB VI

// Befristung der kleinen Witwenrente
// Quelle: § 46 Abs. 1 Satz 2 SGB VI – https://www.gesetze-im-internet.de/sgb_6/__46.html
const KLEINE_WITWENRENTE_BEFRISTUNG_MONATE = 24; // Kalendermonate

// Altersgrenze für die große Witwenrente (Gesetzestext; Übergangsrecht § 242a SGB VI nicht abgebildet)
// Quelle: § 46 Abs. 2 SGB VI – https://www.gesetze-im-internet.de/sgb_6/__46.html
const ALTERSGRENZE_GROSSE_WITWENRENTE = 47; // vollendetes Lebensjahr

// Mindestehedauer (Versorgungsehe-Vermutung)
// Quelle: § 46 Abs. 2a SGB VI – https://www.gesetze-im-internet.de/sgb_6/__46.html
const MINDESTEHEDAUER_JAHRE = 1;

// Allgemeine Wartezeit für Renten wegen Todes
// Quelle: § 50 Abs. 1 SGB VI – https://www.gesetze-im-internet.de/sgb_6/__50.html
const WARTEZEIT_JAHRE = 5;

// Altersgrenzen der Waisenrente
// Quelle: § 48 Abs. 4 SGB VI – https://www.gesetze-im-internet.de/sgb_6/__48.html
const WAISE_ALTERSGRENZE = 18; // vollendetes Lebensjahr
const WAISE_ALTERSGRENZE_AUSBILDUNG = 27; // bei Schul-/Berufsausbildung, Behinderung u. a.

// Erziehungsrente: Scheidung muss nach diesem Stichtag liegen
// Quelle: § 47 Abs. 1 SGB VI – https://www.gesetze-im-internet.de/sgb_6/__47.html
const ERZIEHUNGSRENTE_SCHEIDUNG_NACH = '30.06.1977';

type Verhaeltnis = 'ehepartner' | 'geschieden' | 'kind';

export default function HinterbliebenenrenteRechner() {
  // Wer war der Verstorbene für Sie?
  const [verhaeltnis, setVerhaeltnis] = useState<Verhaeltnis>('ehepartner');

  // Rente des Verstorbenen (tatsächliche oder hochgerechnete Monatsrente)
  const [monatsrente, setMonatsrente] = useState(1600);

  // Gemeinsam: Wartezeit des Verstorbenen
  const [wartezeitErfuellt, setWartezeitErfuellt] = useState(true);

  // Ehepartner / Lebenspartner
  const [alterHinterbliebener, setAlterHinterbliebener] = useState(55);
  const [erziehtKindU18, setErziehtKindU18] = useState(false);
  const [erwerbsgemindert, setErwerbsgemindert] = useState(false);
  const [eheMindestensEinJahr, setEheMindestensEinJahr] = useState(true);
  const [wiederGeheiratet, setWiederGeheiratet] = useState(false);

  // Kind (Waisenrente)
  const [alterKind, setAlterKind] = useState(12);
  const [inAusbildung, setInAusbildung] = useState(false);
  const [beideElternVerstorben, setBeideElternVerstorben] = useState(false);

  // Geschiedener Ehegatte (Erziehungsrente)
  const [scheidungNach1977, setScheidungNach1977] = useState(true);
  const [erziehtKindGeschieden, setErziehtKindGeschieden] = useState(true);
  const [wiederGeheiratetGeschieden, setWiederGeheiratetGeschieden] = useState(false);
  const [eigeneWartezeitErfuellt, setEigeneWartezeitErfuellt] = useState(true);

  const ergebnis = useMemo(() => {
    // Ergebnis-Gerüst
    let art: 'grosse' | 'kleine' | 'erziehung' | 'halbwaise' | 'vollwaise' | 'kein' = 'kein';
    let artLabel = '';
    let faktor = 0;
    let betrag = 0; // Brutto vor Einkommensanrechnung
    let sterbevierteljahrBetrag = 0;
    let anspruch = false;
    let grund = '';
    let befristet = false;
    const ausschlussGruende: string[] = [];
    let detailLink = { href: '/witwenrente-rechner', label: 'Witwenrente-Rechner (mit Einkommensanrechnung)' };

    if (verhaeltnis === 'ehepartner') {
      // Witwen-/Witwerrente § 46 SGB VI (gilt auch für eingetragene Lebenspartner, § 46 Abs. 4 SGB VI)
      if (wiederGeheiratet) {
        ausschlussGruende.push('Bei Wiederheirat besteht kein Anspruch auf Witwen-/Witwerrente (§ 46 Abs. 1 u. 2 SGB VI: „nicht wieder geheiratet haben“).');
      }
      if (!eheMindestensEinJahr) {
        ausschlussGruende.push(`Bei einer Ehedauer unter ${MINDESTEHEDAUER_JAHRE} Jahr wird eine Versorgungsehe vermutet – dann besteht kein Anspruch, außer die Vermutung wird widerlegt (§ 46 Abs. 2a SGB VI).`);
      }
      if (!wartezeitErfuellt) {
        ausschlussGruende.push(`Der Verstorbene muss die allgemeine Wartezeit von ${WARTEZEIT_JAHRE} Jahren erfüllt haben (§ 50 Abs. 1 SGB VI).`);
      }

      if (ausschlussGruende.length === 0) {
        anspruch = true;
        const erfuelltAlter = alterHinterbliebener >= ALTERSGRENZE_GROSSE_WITWENRENTE;
        const gross = erfuelltAlter || erziehtKindU18 || erwerbsgemindert;

        if (gross) {
          art = 'grosse';
          artLabel = 'Große Witwen-/Witwerrente';
          faktor = FAKTOR_GROSSE_WITWENRENTE;
          if (erziehtKindU18) grund = 'Erziehung eines minderjährigen Kindes (§ 46 Abs. 2 SGB VI)';
          else if (erfuelltAlter) grund = `${ALTERSGRENZE_GROSSE_WITWENRENTE}. Lebensjahr vollendet (§ 46 Abs. 2 SGB VI)`;
          else grund = 'Erwerbsminderung (§ 46 Abs. 2 SGB VI)';
        } else {
          art = 'kleine';
          artLabel = 'Kleine Witwen-/Witwerrente';
          faktor = FAKTOR_KLEINE_WITWENRENTE;
          befristet = true;
          grund = 'Keine der Voraussetzungen der großen Witwenrente erfüllt (§ 46 Abs. 1 SGB VI)';
        }
        betrag = monatsrente * faktor;
        sterbevierteljahrBetrag = monatsrente * FAKTOR_STERBEVIERTELJAHR;
      }
    } else if (verhaeltnis === 'geschieden') {
      // Erziehungsrente § 47 SGB VI – aus der EIGENEN Versicherung des Hinterbliebenen
      detailLink = { href: '/erziehungsrente-rechner', label: 'Erziehungsrente-Rechner' };
      if (!scheidungNach1977) {
        ausschlussGruende.push(`Die Ehe muss nach dem ${ERZIEHUNGSRENTE_SCHEIDUNG_NACH} geschieden worden sein (§ 47 Abs. 1 SGB VI). Für frühere Scheidungen gelten andere Regelungen.`);
      }
      if (!erziehtKindGeschieden) {
        ausschlussGruende.push('Voraussetzung ist die Erziehung eines eigenen Kindes oder eines Kindes des geschiedenen Ehegatten (§ 47 Abs. 1 SGB VI).');
      }
      if (wiederGeheiratetGeschieden) {
        ausschlussGruende.push('Nach Wiederheirat besteht kein Anspruch auf Erziehungsrente (§ 47 Abs. 1 SGB VI).');
      }
      if (!eigeneWartezeitErfuellt) {
        ausschlussGruende.push(`Sie selbst müssen bis zum Tod des geschiedenen Ehegatten die allgemeine Wartezeit von ${WARTEZEIT_JAHRE} Jahren erfüllt haben (§ 47 Abs. 1 SGB VI).`);
      }
      if (ausschlussGruende.length === 0) {
        anspruch = true;
        art = 'erziehung';
        artLabel = 'Erziehungsrente';
        faktor = FAKTOR_ERZIEHUNGSRENTE;
        grund = 'Voraussetzungen des § 47 SGB VI erfüllt';
        // Kein Euro-Betrag: Die Erziehungsrente wird aus der EIGENEN Versicherung berechnet,
        // nicht aus der Rente des Verstorbenen (§ 47 i. V. m. § 64 SGB VI).
      }
    } else {
      // Waisenrente § 48 SGB VI
      detailLink = { href: '/waisenrente-rechner', label: 'Waisenrente-Rechner' };
      const altersvoraussetzung =
        alterKind < WAISE_ALTERSGRENZE ||
        (alterKind < WAISE_ALTERSGRENZE_AUSBILDUNG && inAusbildung);
      if (!altersvoraussetzung) {
        ausschlussGruende.push(
          alterKind < WAISE_ALTERSGRENZE_AUSBILDUNG
            ? `Ab dem ${WAISE_ALTERSGRENZE}. Geburtstag gibt es Waisenrente nur bei Schul-/Berufsausbildung, Freiwilligendienst oder Behinderung – längstens bis zur Vollendung des ${WAISE_ALTERSGRENZE_AUSBILDUNG}. Lebensjahres (§ 48 Abs. 4 SGB VI).`
            : `Waisenrente wird längstens bis zur Vollendung des ${WAISE_ALTERSGRENZE_AUSBILDUNG}. Lebensjahres gezahlt (§ 48 Abs. 4 SGB VI).`
        );
      }
      if (!wartezeitErfuellt) {
        ausschlussGruende.push(`Der verstorbene Elternteil muss die allgemeine Wartezeit von ${WARTEZEIT_JAHRE} Jahren erfüllt haben (§ 50 Abs. 1 SGB VI).`);
      }
      if (ausschlussGruende.length === 0) {
        anspruch = true;
        if (beideElternVerstorben) {
          art = 'vollwaise';
          artLabel = 'Vollwaisenrente';
          faktor = FAKTOR_VOLLWAISENRENTE;
          grund = 'Kein unterhaltspflichtiger Elternteil mehr vorhanden (§ 48 Abs. 2 SGB VI)';
        } else {
          art = 'halbwaise';
          artLabel = 'Halbwaisenrente';
          faktor = FAKTOR_HALBWAISENRENTE;
          grund = 'Ein unterhaltspflichtiger Elternteil lebt noch (§ 48 Abs. 1 SGB VI)';
        }
        betrag = monatsrente * faktor;
      }
    }

    return {
      art,
      artLabel,
      faktor,
      prozent: faktor * 100,
      betrag,
      sterbevierteljahrBetrag,
      anspruch,
      grund,
      befristet,
      ausschlussGruende,
      detailLink,
    };
  }, [
    verhaeltnis, monatsrente, wartezeitErfuellt,
    alterHinterbliebener, erziehtKindU18, erwerbsgemindert, eheMindestensEinJahr, wiederGeheiratet,
    alterKind, inAusbildung, beideElternVerstorben,
    scheidungNach1977, erziehtKindGeschieden, wiederGeheiratetGeschieden, eigeneWartezeitErfuellt,
  ]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatProzent = (n: number) => n.toLocaleString('de-DE', { maximumFractionDigits: 0 }) + ' %';

  const zeigtBetrag = verhaeltnis !== 'geschieden';

  return (
    <div className="max-w-2xl mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Verhältnis zum Verstorbenen */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Wer war die verstorbene Person für Sie?</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setVerhaeltnis('ehepartner')}
              className={`py-3 px-4 rounded-xl font-medium transition-all text-sm ${
                verhaeltnis === 'ehepartner'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Ehe-/Lebenspartner
            </button>
            <button
              onClick={() => setVerhaeltnis('geschieden')}
              className={`py-3 px-4 rounded-xl font-medium transition-all text-sm ${
                verhaeltnis === 'geschieden'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Geschiedener Ehegatte
            </button>
            <button
              onClick={() => setVerhaeltnis('kind')}
              className={`py-3 px-4 rounded-xl font-medium transition-all text-sm ${
                verhaeltnis === 'kind'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Elternteil (Waise)
            </button>
          </div>
        </div>

        {/* Rente des Verstorbenen – nicht relevant für Erziehungsrente */}
        {zeigtBetrag && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Rente des Verstorbenen (brutto)</span>
              <span className="text-xs text-gray-500 block mt-1">
                Tatsächliche Altersrente oder der hochgerechnete Rentenanspruch – berechenbar mit dem Renten-Rechner
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={monatsrente}
                onChange={(e) => setMonatsrente(Math.max(0, Number(e.target.value)))}
                className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
                min="0"
                max="5000"
                step="50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€/Monat</span>
            </div>
            <input
              type="range"
              value={monatsrente}
              onChange={(e) => setMonatsrente(Number(e.target.value))}
              className="w-full mt-3 accent-purple-600"
              min="500"
              max="4000"
              step="50"
            />
          </div>
        )}

        {/* === Ehepartner / Lebenspartner === */}
        {verhaeltnis === 'ehepartner' && (
          <>
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Ihr Alter</span>
                <span className="text-xs text-gray-500 block mt-1">
                  Ab dem vollendeten {ALTERSGRENZE_GROSSE_WITWENRENTE}. Lebensjahr besteht Anspruch auf die große Witwenrente (§ 46 Abs. 2 SGB VI)
                </span>
              </label>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setAlterHinterbliebener(Math.max(18, alterHinterbliebener - 1))}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
                >
                  −
                </button>
                <div className="text-center">
                  <span className="text-3xl font-bold text-gray-800">{alterHinterbliebener}</span>
                  <span className="text-gray-500 ml-1">Jahre</span>
                </div>
                <button
                  onClick={() => setAlterHinterbliebener(Math.min(99, alterHinterbliebener + 1))}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
                >
                  +
                </button>
              </div>
              {alterHinterbliebener === 46 && (
                <p className="text-xs text-amber-600 mt-2 text-center">
                  ⚠️ Für Todesfälle vor 2029 gilt übergangsweise eine niedrigere Altersgrenze (2026: 46 Jahre + 6 Monate).
                  Dieser Rechner rechnet konservativ mit {ALTERSGRENZE_GROSSE_WITWENRENTE} Jahren – Details im Witwenrente-Rechner.
                </p>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={erziehtKindU18}
                  onChange={(e) => setErziehtKindU18(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="text-gray-700 font-medium">Ich erziehe ein minderjähriges Kind</span>
                  <span className="text-xs text-gray-500 block">
                    Eigenes Kind oder Kind des Verstorbenen unter 18 (bei behindertem Kind ohne Altersgrenze, § 46 Abs. 2 SGB VI)
                  </span>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={erwerbsgemindert}
                  onChange={(e) => setErwerbsgemindert(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="text-gray-700 font-medium">Erwerbsgemindert</span>
                  <span className="text-xs text-gray-500 block">Voll oder teilweise erwerbsgemindert (§ 46 Abs. 2 SGB VI)</span>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={eheMindestensEinJahr}
                  onChange={(e) => setEheMindestensEinJahr(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="text-gray-700 font-medium">Die Ehe/Lebenspartnerschaft dauerte mindestens {MINDESTEHEDAUER_JAHRE} Jahr</span>
                  <span className="text-xs text-gray-500 block">Sonst wird eine Versorgungsehe vermutet (§ 46 Abs. 2a SGB VI)</span>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wiederGeheiratet}
                  onChange={(e) => setWiederGeheiratet(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="text-gray-700 font-medium">Ich habe wieder geheiratet</span>
                  <span className="text-xs text-gray-500 block">Nach Wiederheirat besteht kein Anspruch (§ 46 SGB VI)</span>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wartezeitErfuellt}
                  onChange={(e) => setWartezeitErfuellt(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="text-gray-700 font-medium">Der Verstorbene war mindestens {WARTEZEIT_JAHRE} Jahre versichert</span>
                  <span className="text-xs text-gray-500 block">Allgemeine Wartezeit (§ 50 Abs. 1 SGB VI)</span>
                </div>
              </label>
            </div>
          </>
        )}

        {/* === Geschiedener Ehegatte (Erziehungsrente) === */}
        {verhaeltnis === 'geschieden' && (
          <div className="space-y-4 mb-6">
            <div className="p-4 bg-purple-50 rounded-xl text-sm text-purple-800">
              Für geschiedene Ehegatten kommt die <strong>Erziehungsrente</strong> (§ 47 SGB VI) in Frage.
              Sie wird – anders als Witwen- und Waisenrente – aus <strong>Ihrer eigenen Versicherung</strong> berechnet,
              mit dem vollen Rentenartfaktor 1,0 (§ 67 SGB VI).
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={scheidungNach1977}
                onChange={(e) => setScheidungNach1977(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <div>
                <span className="text-gray-700 font-medium">Die Scheidung war nach dem {ERZIEHUNGSRENTE_SCHEIDUNG_NACH}</span>
                <span className="text-xs text-gray-500 block">Stichtag des § 47 Abs. 1 SGB VI</span>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={erziehtKindGeschieden}
                onChange={(e) => setErziehtKindGeschieden(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <div>
                <span className="text-gray-700 font-medium">Ich erziehe ein eigenes Kind oder ein Kind des Verstorbenen</span>
                <span className="text-xs text-gray-500 block">Voraussetzung nach § 47 Abs. 1 SGB VI</span>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={wiederGeheiratetGeschieden}
                onChange={(e) => setWiederGeheiratetGeschieden(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <div>
                <span className="text-gray-700 font-medium">Ich habe wieder geheiratet</span>
                <span className="text-xs text-gray-500 block">Nach Wiederheirat besteht kein Anspruch (§ 47 Abs. 1 SGB VI)</span>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={eigeneWartezeitErfuellt}
                onChange={(e) => setEigeneWartezeitErfuellt(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <div>
                <span className="text-gray-700 font-medium">Ich selbst war mindestens {WARTEZEIT_JAHRE} Jahre versichert</span>
                <span className="text-xs text-gray-500 block">Eigene allgemeine Wartezeit bis zum Tod des Geschiedenen (§ 47 Abs. 1 SGB VI)</span>
              </div>
            </label>
          </div>
        )}

        {/* === Kind (Waisenrente) === */}
        {verhaeltnis === 'kind' && (
          <>
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Alter des Kindes</span>
                <span className="text-xs text-gray-500 block mt-1">
                  Waisenrente bis {WAISE_ALTERSGRENZE}, in Ausbildung bis {WAISE_ALTERSGRENZE_AUSBILDUNG} (§ 48 Abs. 4 SGB VI)
                </span>
              </label>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setAlterKind(Math.max(0, alterKind - 1))}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
                >
                  −
                </button>
                <div className="text-center">
                  <span className="text-3xl font-bold text-gray-800">{alterKind}</span>
                  <span className="text-gray-500 ml-1">Jahre</span>
                </div>
                <button
                  onClick={() => setAlterKind(Math.min(30, alterKind + 1))}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <div className="space-y-4 mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inAusbildung}
                  onChange={(e) => setInAusbildung(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="text-gray-700 font-medium">In Schul- oder Berufsausbildung</span>
                  <span className="text-xs text-gray-500 block">
                    Verlängert den Anspruch bis {WAISE_ALTERSGRENZE_AUSBILDUNG} – auch bei Freiwilligendienst oder Behinderung (§ 48 Abs. 4 SGB VI)
                  </span>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={beideElternVerstorben}
                  onChange={(e) => setBeideElternVerstorben(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="text-gray-700 font-medium">Beide Elternteile sind verstorben</span>
                  <span className="text-xs text-gray-500 block">
                    Dann Vollwaisenrente ({formatProzent(FAKTOR_VOLLWAISENRENTE * 100)}) statt Halbwaisenrente ({formatProzent(FAKTOR_HALBWAISENRENTE * 100)}) – § 48 SGB VI
                  </span>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wartezeitErfuellt}
                  onChange={(e) => setWartezeitErfuellt(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="text-gray-700 font-medium">Der verstorbene Elternteil war mindestens {WARTEZEIT_JAHRE} Jahre versichert</span>
                  <span className="text-xs text-gray-500 block">Allgemeine Wartezeit (§ 50 Abs. 1 SGB VI)</span>
                </div>
              </label>
            </div>
          </>
        )}
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-slate-500 to-purple-700 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🕯️ Ihr Ergebnis</h3>

        {ergebnis.anspruch ? (
          <>
            {verhaeltnis === 'geschieden' ? (
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">Erziehungsrente möglich</span>
                </div>
                <p className="text-purple-100 mt-2 text-sm">
                  Rentenartfaktor <strong>1,0</strong> (§ 67 SGB VI) – berechnet aus <strong>Ihrer eigenen Versicherung</strong>,
                  nicht aus der Rente des Verstorbenen. Die Höhe entspricht damit Ihrer eigenen vollen Rente
                  (Entgeltpunkte × 1,0 × {formatEuro(RENTENWERT_2026)} je Entgeltpunkt, § 64 SGB VI).
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{formatEuroRound(ergebnis.betrag)}</span>
                  <span className="text-xl opacity-80">brutto / Monat</span>
                </div>
                <p className="text-purple-100 mt-2 text-sm">
                  <strong>{ergebnis.artLabel}</strong> ({formatProzent(ergebnis.prozent)} der Versichertenrente) – {ergebnis.grund}
                </p>
                <p className="text-purple-200 mt-1 text-xs">
                  Vor Einkommensanrechnung und vor Abzug von Kranken-/Pflegeversicherung.
                </p>
              </div>
            )}

            {verhaeltnis === 'ehepartner' && (
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <span className="text-sm opacity-80">Sterbevierteljahr (Monate 1–3)</span>
                  <div className="text-xl font-bold">{formatEuroRound(ergebnis.sterbevierteljahrBetrag)}</div>
                  <span className="text-xs opacity-70">100 % der Versichertenrente (§ 67 SGB VI)</span>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <span className="text-sm opacity-80">Danach dauerhaft</span>
                  <div className="text-xl font-bold">{formatEuroRound(ergebnis.betrag)}</div>
                  <span className="text-xs opacity-70">
                    {ergebnis.befristet
                      ? `befristet auf ${KLEINE_WITWENRENTE_BEFRISTUNG_MONATE} Kalendermonate (§ 46 Abs. 1 SGB VI)`
                      : 'unbefristet, solange keine Wiederheirat'}
                  </span>
                </div>
              </div>
            )}

            {ergebnis.befristet && (
              <div className="bg-amber-400/20 border border-amber-200/40 rounded-xl p-3 text-sm">
                ⏳ Die kleine Witwenrente wird längstens für <strong>{KLEINE_WITWENRENTE_BEFRISTUNG_MONATE} Kalendermonate</strong> nach
                Ablauf des Sterbemonats gezahlt (§ 46 Abs. 1 Satz 2 SGB VI).
              </div>
            )}
          </>
        ) : (
          <div className="mb-2">
            <div className="text-3xl font-bold mb-3">Kein Anspruch nach Ihren Angaben</div>
            <ul className="space-y-2 text-sm text-purple-100">
              {ergebnis.ausschlussGruende.map((g, i) => (
                <li key={i} className="flex gap-2">
                  <span>•</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <a
          href={ergebnis.detailLink.href}
          className="inline-block mt-4 bg-white/15 hover:bg-white/25 transition-colors rounded-xl px-4 py-2 text-sm font-medium"
        >
          → Zum {ergebnis.detailLink.label}
        </a>
      </div>

      {/* Berechnungsdetails */}
      {ergebnis.anspruch && zeigtBetrag && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Rente des Verstorbenen (brutto)</span>
              <span className="font-bold text-gray-900">{formatEuro(monatsrente)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Rentenart: {ergebnis.artLabel}</span>
              <span className="font-bold text-purple-600">Faktor {ergebnis.faktor.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between py-2 bg-purple-50 -mx-6 px-6">
              <span className="font-medium text-purple-700">= Hinterbliebenenrente (brutto, Näherung)</span>
              <span className="font-bold text-purple-900">{formatEuro(ergebnis.betrag)}</span>
            </div>
            {verhaeltnis === 'ehepartner' && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Sterbevierteljahr (Faktor 1,0 für 3 Kalendermonate)</span>
                <span className="font-bold text-gray-900">{formatEuro(ergebnis.sterbevierteljahrBetrag)}</span>
              </div>
            )}
            <p className="text-xs text-gray-500 pt-2">
              Näherung nach § 64 SGB VI: Da sich alle Renten wegen Todes nur im Rentenartfaktor (§ 67 SGB VI)
              unterscheiden, gilt vereinfacht: Hinterbliebenenrente ≈ Versichertenrente × Rentenartfaktor.
              Nicht enthalten: Einkommensanrechnung (§ 97 SGB VI), Kranken-/Pflegeversicherungsbeiträge,
              Zugangsfaktor-Abschläge und Zuschläge für Kindererziehung.
            </p>
          </div>
        </div>
      )}

      {/* Rentenartfaktoren-Übersicht */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Alle Renten wegen Todes im Überblick</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Rentenart</th>
                <th className="px-3 py-2 text-left">Rentenartfaktor</th>
                <th className="px-3 py-2 text-left">Anteil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-3 py-2">Sterbevierteljahr (Witwenrente, Monate 1–3)</td>
                <td className="px-3 py-2">1,0</td>
                <td className="px-3 py-2 font-bold">100 %</td>
              </tr>
              <tr>
                <td className="px-3 py-2">Große Witwen-/Witwerrente</td>
                <td className="px-3 py-2">0,55</td>
                <td className="px-3 py-2 font-bold">55 %</td>
              </tr>
              <tr>
                <td className="px-3 py-2">Kleine Witwen-/Witwerrente (max. 24 Monate)</td>
                <td className="px-3 py-2">0,25</td>
                <td className="px-3 py-2 font-bold">25 %</td>
              </tr>
              <tr>
                <td className="px-3 py-2">Erziehungsrente (aus eigener Versicherung)</td>
                <td className="px-3 py-2">1,0</td>
                <td className="px-3 py-2 font-bold">100 %</td>
              </tr>
              <tr>
                <td className="px-3 py-2">Halbwaisenrente</td>
                <td className="px-3 py-2">0,1</td>
                <td className="px-3 py-2 font-bold">10 %</td>
              </tr>
              <tr>
                <td className="px-3 py-2">Vollwaisenrente</td>
                <td className="px-3 py-2">0,2</td>
                <td className="px-3 py-2 font-bold">20 %</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Rentenartfaktoren nach § 67 SGB VI. Aktueller Rentenwert: {formatEuro(RENTENWERT_2026)} je Entgeltpunkt
          (ab 01.07.2026, § 1 RWBestV 2026).
        </p>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Brutto-Näherung:</strong> Alle Beträge gelten vor Einkommensanrechnung (§ 97 SGB VI) und vor Abzug von Kranken- und Pflegeversicherung. Die Netto-Berechnung der Witwenrente inkl. Einkommensanrechnung bietet der Witwenrente-Rechner.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Altes Recht:</strong> Für Todesfälle vor 2002 bzw. Ehen vor 2002 mit einem vor dem 02.01.1962 geborenen Partner kann die große Witwenrente 60 % statt 55 % betragen – hier nicht abgebildet.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Altersgrenze im Übergang:</strong> Die Grenze für die große Witwenrente wird stufenweise auf 47 angehoben; für Todesfälle vor 2029 gilt eine niedrigere Grenze (Übergangsrecht). Dieser Rechner rechnet konservativ mit 47 Jahren.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Antragspflicht:</strong> Alle Renten wegen Todes müssen bei der Deutschen Rentenversicherung beantragt werden (Formular R0500).</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Erziehungsrente:</strong> Wird aus der eigenen Versicherung berechnet – die hier eingegebene Rente des Verstorbenen spielt dafür keine Rolle.</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-purple-50 rounded-xl p-4">
            <p className="font-semibold text-purple-900">Deutsche Rentenversicherung</p>
            <p className="text-sm text-purple-700 mt-1">
              Alle Renten wegen Todes (Witwen-, Waisen- und Erziehungsrente) werden bei der Deutschen Rentenversicherung beantragt.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Hotline</p>
                <p className="text-gray-600">0800 1000 4800 (kostenlos)</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Online-Antrag</p>
                <a
                  href="https://www.deutsche-rentenversicherung.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  deutsche-rentenversicherung.de →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-gray-50 rounded-xl mb-4 text-xs text-gray-500">
        <strong>Hinweis:</strong> Dieser Rechner liefert eine vereinfachte Schätzung (Versichertenrente × Rentenartfaktor)
        und ersetzt keine Renten- oder Rechtsberatung. Verbindliche Auskünfte erteilt nur die Deutsche Rentenversicherung.
        Nicht berücksichtigt: Einkommensanrechnung (§ 97 SGB VI), Sozialversicherungsbeiträge, Zugangsfaktor,
        Zuschläge für Kindererziehung (§ 78a SGB VI), altes Hinterbliebenenrecht (60 %) und Übergangsregelungen.
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/sgb_6/__46.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 46 SGB VI – Witwenrente und Witwerrente
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_6/__47.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 47 SGB VI – Erziehungsrente
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_6/__48.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 48 SGB VI – Waisenrente
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_6/__50.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 50 SGB VI – Wartezeiten
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_6/__64.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 64 SGB VI – Rentenformel
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_6/__67.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 67 SGB VI – Rentenartfaktor
          </a>
          <a
            href="https://www.gesetze-im-internet.de/rwbestv_2026/__1.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 1 RWBestV 2026 – Aktueller Rentenwert 42,52 €
          </a>
        </div>
      </div>
    </div>
  );
}
