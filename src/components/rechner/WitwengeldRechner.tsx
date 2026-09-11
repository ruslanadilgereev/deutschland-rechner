import { useState, useMemo } from 'react';
import besoldung from '../../data/besoldung-bund.json';

// === VERIFIZIERTE WERTE (Stand: September 2026, BeamtVG des Bundes) ===

// Witwengeld: 55 % des Ruhegehalts, das der Verstorbene erhalten hat oder bei Ruhestand am Todestag
// erhalten hätte – § 20 Abs. 1 Satz 1 BeamtVG. 60 % bei Ehe vor dem 1.1.2002, wenn ein Ehegatte vor dem
// 2.1.1962 geboren ist – § 69e Abs. 5 BeamtVG (altes Recht)
const WITWENGELD_SATZ = 0.55;
const WITWENGELD_SATZ_ALT = 0.60;

// Kürzung bei mehr als 20 Jahren Altersunterschied ohne gemeinsames Kind: 5 % je angefangenes Jahr über 20,
// höchstens 50 %; nach 5 Ehejahren je angefangenes weiteres Jahr 5 % zurück – § 20 Abs. 2 BeamtVG
const KUERZUNG_JE_JAHR = 0.05;
const KUERZUNG_MAX = 0.50;

// Ruhegehalt: 1,79375 % je Jahr ruhegehaltfähiger Dienstzeit, höchstens 71,75 % – § 14 Abs. 1 BeamtVG
const SATZ_JE_JAHR = 1.79375;
const SATZ_MAX = 71.75;

// Ruhegehaltfähige Dienstbezüge werden mit dem Faktor 0,9901 vervielfältigt – § 5 Abs. 1 Satz 1 BeamtVG
const FAKTOR_0_9901 = 0.9901;

// Zurechnungszeit bei Ruhestand wegen Dienstunfähigkeit vor 60: 2/3 der Zeit bis 60 – § 13 Abs. 1 BeamtVG.
// Beim Tod eines aktiven Beamten wird das Ruhegehalt so berechnet, als wäre er am Todestag wegen
// Dienstunfähigkeit in den Ruhestand versetzt worden (Merkblatt Hinterbliebenenversorgung, Zoll/BVA).
const ZURECHNUNG_BIS_ALTER = 60;
const ZURECHNUNG_ANTEIL = 2 / 3;

// Versorgungsabschlag bei Dienstunfähigkeit vor 65: 3,6 % je Jahr, höchstens 10,8 %; entfällt ab 63
// mit 40 Dienstjahren – § 14 Abs. 3 Nr. 3, Satz 6 BeamtVG
const ABSCHLAG_JE_JAHR = 0.036;
const ABSCHLAG_MAX = 0.108;
const ABSCHLAG_BIS_ALTER = 65;

// Mindestversorgung: 35 % der ruhegehaltfähigen Dienstbezüge oder 65 % aus der Endstufe A 4 + 30,68 € – § 14 Abs. 4
// Mindestwitwengeld: 60 % der amtsunabhängigen Mindestversorgung + 30,68 € – § 20 Abs. 1 Satz 2
const MINDEST_AMTSABHAENGIG = 0.35;
const MINDEST_AMTSUNABHAENGIG = 0.65;
const MINDEST_ERHOEHUNG = 30.68;
const MINDEST_WITWE = 0.60;
const A4_ENDSTUFE = besoldung.grundgehaltA['A 4'][besoldung.grundgehaltA['A 4'].length - 1]; // 3.157,76 € (Tabelle ab 1.3.2024)

// Waisengeld: Halbwaise 12 %, Vollwaise 20 % des Ruhegehalts – § 24 Abs. 1; Witwen- und Waisengeld zusammen
// höchstens das Ruhegehalt, sonst verhältnismäßige Kürzung – § 25 Abs. 1 BeamtVG
const HALBWAISE = 0.12;
const VOLLWAISE = 0.20;

// Sterbegeld: das Zweifache der Dienst-/Versorgungsbezüge – § 18 Abs. 1; Witwenabfindung bei Wiederheirat:
// das 24-Fache des Witwengeldes – § 21 Abs. 2 BeamtVG
const STERBEGELD_FAKTOR = 2;
const ABFINDUNG_FAKTOR = 24;

type Fall = 'ruhestand' | 'aktiv';

const fmtEuro = (n: number) =>
  n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtProzent = (n: number, d = 2) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: d }) + ' %';

export default function WitwengeldRechner() {
  const [fall, setFall] = useState<Fall>('ruhestand');
  const [ruhegehalt, setRuhegehalt] = useState(2800);
  const [dienstbezuege, setDienstbezuege] = useState(5200);
  const [dienstjahre, setDienstjahre] = useState(28);
  const [alterTod, setAlterTod] = useState(56);

  const [altesRecht, setAltesRecht] = useState(false);
  const [altersunterschied, setAltersunterschied] = useState(0);
  const [gemeinsamesKind, setGemeinsamesKind] = useState(true);
  const [ehejahre, setEhejahre] = useState(20);
  const [halbwaisen, setHalbwaisen] = useState(0);
  const [eheNachRuhestandMitRegelalter, setEheNachRuhestandMitRegelalter] = useState(false);

  const ergebnis = useMemo(() => {
    // === 1. Maßgebliches Ruhegehalt ===
    let ruhegehaltBrutto = Math.max(0, ruhegehalt);
    let zurechnung = 0;
    let satz = 0;
    let abschlag = 0;
    let bezuegeMitFaktor = 0;
    let ruhegehaltErdient = 0;
    let mindestversorgung = 0;
    let mindestGreift = false;
    if (fall === 'aktiv') {
      bezuegeMitFaktor = Math.max(0, dienstbezuege) * FAKTOR_0_9901;
      zurechnung = alterTod < ZURECHNUNG_BIS_ALTER ? (ZURECHNUNG_BIS_ALTER - alterTod) * ZURECHNUNG_ANTEIL : 0;
      satz = Math.min(SATZ_MAX, Math.round(SATZ_JE_JAHR * (Math.max(0, dienstjahre) + zurechnung) * 100) / 100);
      const abschlagEntfaellt = alterTod >= 63 && dienstjahre >= 40;
      abschlag = alterTod < ABSCHLAG_BIS_ALTER && !abschlagEntfaellt
        ? Math.min(ABSCHLAG_MAX, (ABSCHLAG_BIS_ALTER - alterTod) * ABSCHLAG_JE_JAHR)
        : 0;
      ruhegehaltErdient = bezuegeMitFaktor * (satz / 100) * (1 - abschlag);
      mindestversorgung = Math.max(
        bezuegeMitFaktor * MINDEST_AMTSABHAENGIG,
        A4_ENDSTUFE * FAKTOR_0_9901 * MINDEST_AMTSUNABHAENGIG + MINDEST_ERHOEHUNG,
      );
      mindestGreift = mindestversorgung > ruhegehaltErdient;
      ruhegehaltBrutto = Math.max(ruhegehaltErdient, mindestversorgung);
    }

    // === 2. Witwengeld: 55 % bzw. 60 % (§ 20 Abs. 1, § 69e Abs. 5) ===
    const witwenSatz = altesRecht ? WITWENGELD_SATZ_ALT : WITWENGELD_SATZ;
    const witwengeldVoll = ruhegehaltBrutto * witwenSatz;

    // === 3. Kürzung wegen Altersunterschieds (§ 20 Abs. 2) ===
    const jahreUeber20 = Math.max(0, Math.ceil(altersunterschied - 20));
    let kuerzung = !gemeinsamesKind && jahreUeber20 > 0 ? Math.min(KUERZUNG_MAX, jahreUeber20 * KUERZUNG_JE_JAHR) : 0;
    const rueckJahre = Math.max(0, Math.ceil(ehejahre - 5));
    if (kuerzung > 0 && rueckJahre > 0) kuerzung = Math.max(0, kuerzung - rueckJahre * KUERZUNG_JE_JAHR);
    const witwengeldGekuerzt = witwengeldVoll * (1 - kuerzung);

    // === 4. Mindestwitwengeld (§ 20 Abs. 1 Satz 2 i.V.m. § 14 Abs. 4 Satz 2 u. 3) ===
    const mindestwitwengeld = A4_ENDSTUFE * FAKTOR_0_9901 * MINDEST_AMTSUNABHAENGIG * MINDEST_WITWE + MINDEST_ERHOEHUNG;
    const mindestWitweGreift = mindestwitwengeld > witwengeldGekuerzt;
    let witwengeld = Math.max(witwengeldGekuerzt, mindestwitwengeld);

    // === 5. Waisengeld und Höchstgrenze (§ 24, § 25) ===
    let waisengeldJe = ruhegehaltBrutto * HALBWAISE;
    let waisengeldGesamt = waisengeldJe * Math.max(0, halbwaisen);
    let gekapptNach25 = false;
    if (witwengeld + waisengeldGesamt > ruhegehaltBrutto && ruhegehaltBrutto > 0) {
      const faktor = ruhegehaltBrutto / (witwengeld + waisengeldGesamt);
      witwengeld *= faktor;
      waisengeldJe *= faktor;
      waisengeldGesamt *= faktor;
      gekapptNach25 = true;
    }

    const bezuegeSterbemonat = fall === 'aktiv' ? Math.max(0, dienstbezuege) : ruhegehaltBrutto;

    return {
      ruhegehaltBrutto, zurechnung, satz, abschlag, bezuegeMitFaktor, ruhegehaltErdient, mindestversorgung, mindestGreift,
      witwenSatz, witwengeldVoll, kuerzung, jahreUeber20, rueckJahre, witwengeldGekuerzt, mindestwitwengeld, mindestWitweGreift,
      witwengeld, waisengeldJe, waisengeldGesamt, gekapptNach25,
      sterbegeld: bezuegeSterbemonat * STERBEGELD_FAKTOR,
      abfindung: witwengeld * ABFINDUNG_FAKTOR,
      vollwaiseHinweis: ruhegehaltBrutto * VOLLWAISE,
    };
  }, [fall, ruhegehalt, dienstbezuege, dienstjahre, alterTod, altesRecht, altersunterschied, gemeinsamesKind, ehejahre, halbwaisen]);

  const btn = (aktiv: boolean) =>
    `py-3 px-3 rounded-xl font-medium transition-all text-sm ${aktiv ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`;
  const inputCls = 'w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-slate-600 focus:ring-0 outline-none';
  const zahl = (setter: (n: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => setter(Math.max(0, Number(e.target.value) || 0));

  return (
    <div className="max-w-2xl mx-auto">
      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="mb-6">
          <span className="text-gray-700 font-medium block mb-2">Wer ist verstorben?</span>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setFall('ruhestand')} className={btn(fall === 'ruhestand')}>Ruhestandsbeamter/-beamtin (Ruhegehalt bekannt)</button>
            <button onClick={() => setFall('aktiv')} className={btn(fall === 'aktiv')}>Aktive/r Beamter/Beamtin des Bundes</button>
          </div>
        </div>

        {fall === 'ruhestand' ? (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Ruhegehalt der verstorbenen Person (brutto)</span>
              <span className="text-xs text-gray-500 block mt-1">Laut letztem Versorgungsbescheid oder Bezügemitteilung, vor Steuern</span>
            </label>
            <div className="relative">
              <input type="number" value={ruhegehalt} onChange={zahl(setRuhegehalt)} className={`${inputCls} text-3xl py-4`} min="0" step="50" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€/Monat</span>
            </div>
            <input type="range" value={ruhegehalt} onChange={(e) => setRuhegehalt(Number(e.target.value))} className="w-full mt-3 accent-slate-600" min="1000" max="7000" step="50" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div className="sm:col-span-3">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Ruhegehaltfähige Dienstbezüge (monatlich)</span>
                <span className="text-xs text-gray-500 block mt-1">Grundgehalt + Familienzuschlag Stufe 1 + ruhegehaltfähige Zulagen (§ 5 BeamtVG); der Faktor 0,9901 wird automatisch angewendet</span>
              </label>
              <div className="relative">
                <input type="number" value={dienstbezuege} onChange={zahl(setDienstbezuege)} className={`${inputCls} text-3xl py-4`} min="0" step="50" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€/Monat</span>
              </div>
            </div>
            <div>
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Ruhegehaltfähige Dienstzeit</span>
                <span className="text-xs text-gray-500 block mt-1">Jahre, ggf. mit Nachkommastelle</span>
              </label>
              <div className="relative">
                <input type="number" value={dienstjahre} onChange={(e) => setDienstjahre(Math.max(0, Math.min(50, Number(e.target.value) || 0)))} className={inputCls} min="0" max="50" step="0.5" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Jahre</span>
              </div>
            </div>
            <div>
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Alter beim Tod</span>
                <span className="text-xs text-gray-500 block mt-1">Für Zurechnungszeit (bis 60) und Versorgungsabschlag (bis 65)</span>
              </label>
              <div className="relative">
                <input type="number" value={alterTod} onChange={(e) => setAlterTod(Math.max(18, Math.min(70, Number(e.target.value) || 0)))} className={inputCls} min="18" max="70" step="0.5" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Jahre</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 self-end pb-3">
              Fiktion: Ruhestand wegen Dienstunfähigkeit am Todestag – mit Zurechnungszeit nach § 13 und Abschlag nach § 14 Abs. 3
            </div>
          </div>
        )}

        {/* Ehe */}
        <div className="border-t border-gray-100 pt-5">
          <span className="text-gray-700 font-medium block mb-3">Angaben zur Ehe / Lebenspartnerschaft</span>
          <div className="space-y-3 mb-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={altesRecht} onChange={(e) => setAltesRecht(e.target.checked)} className="w-5 h-5 mt-0.5 accent-slate-600" />
              <span className="text-sm text-gray-700">Ehe <strong>vor dem 1. Januar 2002</strong> geschlossen <strong>und</strong> mindestens ein Ehegatte <strong>vor dem 2. Januar 1962</strong> geboren (dann 60 % statt 55 %, § 69e Abs. 5)</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={eheNachRuhestandMitRegelalter} onChange={(e) => setEheNachRuhestandMitRegelalter(e.target.checked)} className="w-5 h-5 mt-0.5 accent-slate-600" />
              <span className="text-sm text-gray-700">Die Ehe wurde erst <strong>nach dem Ruhestand</strong> geschlossen, als die verstorbene Person die <strong>Regelaltersgrenze bereits erreicht</strong> hatte</span>
            </label>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Witwe/r jünger um</span>
                <span className="text-xs text-gray-500 block mt-1">Altersunterschied in Jahren (0, wenn älter)</span>
              </label>
              <div className="relative">
                <input type="number" value={altersunterschied} onChange={(e) => setAltersunterschied(Math.max(0, Math.min(60, Number(e.target.value) || 0)))} className={inputCls} min="0" max="60" step="1" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Jahre</span>
              </div>
            </div>
            <div>
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Dauer der Ehe</span>
                <span className="text-xs text-gray-500 block mt-1">Unter 1 Jahr: Versorgungsehe-Vermutung</span>
              </label>
              <div className="relative">
                <input type="number" value={ehejahre} onChange={(e) => setEhejahre(Math.max(0, Math.min(80, Number(e.target.value) || 0)))} className={inputCls} min="0" max="80" step="1" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Jahre</span>
              </div>
            </div>
            <div>
              <span className="text-gray-700 font-medium block mb-2">Gemeinsames Kind aus der Ehe?</span>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setGemeinsamesKind(true)} className={btn(gemeinsamesKind)}>Ja</button>
                <button onClick={() => setGemeinsamesKind(false)} className={btn(!gemeinsamesKind)}>Nein</button>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-gray-700 font-medium block mb-2">Waisengeldberechtigte Kinder (Halbwaisen)</span>
            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4].map((n) => (
                <button key={n} onClick={() => setHalbwaisen(n)} className={btn(halbwaisen === n)}>{n}</button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Bis 18 ohne Bedingung, bis 27 in Ausbildung – je 12 % des Ruhegehalts (§ 24)</p>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      {eheNachRuhestandMitRegelalter ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-amber-800 mb-2">Kein Witwengeld – ggf. Unterhaltsbeitrag</h3>
          <p className="text-sm text-amber-800">
            Wurde die Ehe erst nach dem Eintritt in den Ruhestand geschlossen und hatte der Ruhestandsbeamte zu diesem Zeitpunkt
            die Regelaltersgrenze bereits erreicht, besteht kein Anspruch auf Witwengeld (§ 19 Abs. 1 Satz 2 Nr. 2 BeamtVG). Stattdessen
            ist ein <strong>Unterhaltsbeitrag in Höhe des Witwengeldes</strong> zu gewähren, sofern die Umstände keine Versagung
            rechtfertigen – Einkünfte werden dabei in angemessenem Umfang angerechnet (§ 22 Abs. 1). Rechnerisch entspräche das
            Witwengeld {fmtEuro(ergebnis.witwengeld)} im Monat.
          </p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-slate-700 to-gray-900 rounded-2xl shadow-lg p-6 text-white mb-6">
          <h3 className="text-sm font-medium opacity-80 mb-1">🏛️ Witwengeld / Witwergeld (brutto)</h3>
          <div className="mb-4">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-5xl font-bold">{fmtEuro(ergebnis.witwengeld)}</span>
              <span className="text-xl opacity-80">pro Monat</span>
            </div>
            <p className="text-slate-200 mt-2 text-sm">
              {fmtProzent(ergebnis.witwenSatz * 100, 0)} des Ruhegehalts von {fmtEuro(ergebnis.ruhegehaltBrutto)}
              {ergebnis.kuerzung > 0 && `, gekürzt um ${fmtProzent(ergebnis.kuerzung * 100, 0)} wegen Altersunterschieds`}
              {ergebnis.mindestWitweGreift && ' – angehoben auf das Mindestwitwengeld'}
              {ergebnis.gekapptNach25 && ' – zusammen mit dem Waisengeld auf das Ruhegehalt begrenzt (§ 25)'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">Waisengeld je Halbwaise</span>
              <div className="text-xl font-bold">{fmtEuro(ergebnis.waisengeldJe)}</div>
              {halbwaisen > 0 && <span className="text-xs opacity-70">{halbwaisen} × = {fmtEuro(ergebnis.waisengeldGesamt)}</span>}
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">Familie gesamt</span>
              <div className="text-xl font-bold">{fmtEuro(ergebnis.witwengeld + ergebnis.waisengeldGesamt)}</div>
              <span className="text-xs opacity-70">höchstens das Ruhegehalt</span>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">Sterbegeld (einmalig, § 18)</span>
              <div className="text-xl font-bold">{fmtEuro(ergebnis.sterbegeld)}</div>
              <span className="text-xs opacity-70">2 × {fall === 'aktiv' ? 'Dienstbezüge' : 'Ruhegehalt'}</span>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">Abfindung bei Wiederheirat (§ 21)</span>
              <div className="text-xl font-bold">{fmtEuro(ergebnis.abfindung)}</div>
              <span className="text-xs opacity-70">24 × Witwengeld</span>
            </div>
          </div>
          {ehejahre < 1 && (
            <div className="bg-amber-400/20 border border-amber-200/40 rounded-xl p-4 text-sm">
              ⚠️ Bei einer Ehedauer unter einem Jahr vermutet das Gesetz eine Versorgungsehe – Witwengeld gibt es nur, wenn
              die Hinterbliebenen diese Vermutung widerlegen (§ 19 Abs. 1 Satz 2 Nr. 1), etwa bei plötzlichem Unfalltod.
            </div>
          )}
        </div>
      )}

      {/* Rechenweg */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 So wird gerechnet</h3>
        <div className="space-y-3 text-sm">
          {fall === 'aktiv' && (
            <>
              <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
                <span className="text-gray-600">Dienstbezüge {fmtEuro(dienstbezuege)} × 0,9901 (§ 5 Abs. 1)</span>
                <span className="font-medium text-gray-800 text-right">{fmtEuro(ergebnis.bezuegeMitFaktor)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
                <span className="text-gray-600">Dienstzeit {dienstjahre.toLocaleString('de-DE')} J.{ergebnis.zurechnung > 0 ? ` + Zurechnungszeit ${ergebnis.zurechnung.toLocaleString('de-DE', { maximumFractionDigits: 2 })} J. (2/3 bis 60, § 13)` : ''} × 1,79375 %</span>
                <span className="font-medium text-gray-800 text-right">Ruhegehaltssatz {fmtProzent(ergebnis.satz)}</span>
              </div>
              {ergebnis.abschlag > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
                  <span className="text-gray-600">Versorgungsabschlag {((ABSCHLAG_BIS_ALTER - alterTod)).toLocaleString('de-DE', { maximumFractionDigits: 1 })} J. vor 65 × 3,6 %, max. 10,8 % (§ 14 Abs. 3)</span>
                  <span className="font-medium text-gray-800 text-right">− {fmtProzent(ergebnis.abschlag * 100, 1)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
                <span className="text-gray-600">Erdientes Ruhegehalt</span>
                <span className="font-medium text-gray-800 text-right">{fmtEuro(ergebnis.ruhegehaltErdient)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
                <span className="text-gray-600">Mindestversorgung: max(35 % der Bezüge; 65 % A 4 Endstufe + 30,68 €){ergebnis.mindestGreift ? ' – greift' : ''}</span>
                <span className="font-medium text-gray-800 text-right">{fmtEuro(ergebnis.mindestversorgung)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
            <span className="text-gray-600">Maßgebliches Ruhegehalt × {fmtProzent(ergebnis.witwenSatz * 100, 0)}</span>
            <span className="font-medium text-gray-800 text-right">{fmtEuro(ergebnis.witwengeldVoll)}</span>
          </div>
          {ergebnis.kuerzung > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
              <span className="text-gray-600">Kürzung: {ergebnis.jahreUeber20} angefangene Jahre über 20 × 5 %{ergebnis.rueckJahre > 0 ? `, abzgl. ${ergebnis.rueckJahre} × 5 % nach 5 Ehejahren` : ''} (§ 20 Abs. 2)</span>
              <span className="font-medium text-gray-800 text-right">− {fmtProzent(ergebnis.kuerzung * 100, 0)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
            <span className="text-gray-600">Mindestwitwengeld: 60 % × 65 % der A-4-Endstufe ({fmtEuro(A4_ENDSTUFE)} × 0,9901) + 30,68 €{ergebnis.mindestWitweGreift ? ' – greift' : ''}</span>
            <span className="font-medium text-gray-800 text-right">{fmtEuro(ergebnis.mindestwitwengeld)}</span>
          </div>
          <div className="flex justify-between py-2 gap-4">
            <span className="text-gray-600">= Witwengeld{ergebnis.gekapptNach25 ? ' nach Kürzung gem. § 25' : ''}</span>
            <span className="font-bold text-slate-800 text-right">{fmtEuro(ergebnis.witwengeld)}</span>
          </div>
        </div>
      </div>

      {/* Hinweise */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Was noch dazukommt – und was abgezogen wird</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2"><span>•</span><span><strong>Kinderzuschlag (§ 50c):</strong> Wer Kinder erzogen hat, erhält zum 55-%-Witwengeld je Monat Kindererziehungszeit bis zum 3. Geburtstag einen Zuschlag (55 % des Rentenwert-Bruchteils nach § 78a SGB VI) – nicht enthalten.</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Ruhensregelungen (§§ 53–55):</strong> Eigenes Erwerbseinkommen bis zur Regelaltersgrenze, eigene Versorgung und gesetzliche Renten werden auf das Witwengeld angerechnet, soweit Höchstgrenzen überschritten werden. Mindestens 20 % des Witwengeldes bleiben – nicht enthalten.</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Steuern und Beihilfe:</strong> Witwengeld ist steuerpflichtig (Versorgungsfreibetrag nach § 19 Abs. 2 EStG); der Beihilfeanspruch bleibt mit 70 % Bemessungssatz erhalten, eine private Restkostenversicherung ist nötig.</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Erlöschen:</strong> Mit Wiederheirat endet das Witwengeld – dafür gibt es die Abfindung. Endet die neue Ehe, lebt der Anspruch wieder auf (§ 61 Abs. 3).</span></li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-xs text-gray-500">
        <strong>Hinweis:</strong> Der Rechner bildet das Beamtenversorgungsgesetz des <strong>Bundes</strong> ab. Für
        Landesbeamte gelten die Landesversorgungsgesetze mit teils abweichenden Sätzen. Die Mindestversorgung ist mit der
        A-4-Endstufe der ab 1.3.2024 geltenden Bundesbesoldungstabelle berechnet; die Besoldungsanpassung 2025/2026 ist
        noch nicht verkündet (Abschlagszahlungen +3 % ab 4/2025, +2,8 % ab 5/2026), sodass die tatsächlichen Mindestbeträge
        etwas höher liegen. Ruhensregelungen, Kinderzuschlag, Versorgungsausgleich und Steuern sind nicht berücksichtigt.
        Verbindlich ist der Bescheid der Versorgungsstelle (für den Bund: Bundesverwaltungsamt bzw. Generalzolldirektion).
        Keine Rechtsberatung.
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a href="https://www.gesetze-im-internet.de/beamtvg/__20.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 20 BeamtVG – Höhe des Witwengeldes (55 %, Mindestwitwengeld, Kürzung bei Altersunterschied)
          </a>
          <a href="https://www.gesetze-im-internet.de/beamtvg/__19.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 19 BeamtVG – Witwengeld: Voraussetzungen, Versorgungsehe, Ehe nach Regelaltersgrenze
          </a>
          <a href="https://www.gesetze-im-internet.de/beamtvg/__14.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 14 BeamtVG – Ruhegehaltssatz 1,79375 %, Versorgungsabschlag, Mindestversorgung
          </a>
          <a href="https://www.gesetze-im-internet.de/beamtvg/__13.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 13 BeamtVG – Zurechnungszeit bei Dienstunfähigkeit vor 60
          </a>
          <a href="https://www.gesetze-im-internet.de/beamtvg/__5.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 5 BeamtVG – Ruhegehaltfähige Dienstbezüge, Faktor 0,9901
          </a>
          <a href="https://www.gesetze-im-internet.de/beamtvg/__69e.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 69e Abs. 5 BeamtVG – 60 % für Ehen vor 2002 mit Geburt vor dem 2.1.1962
          </a>
          <a href="https://www.gesetze-im-internet.de/beamtvg/__24.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            §§ 18, 21, 24, 25 BeamtVG – Sterbegeld, Witwenabfindung, Waisengeld, Höchstgrenze
          </a>
          <a href="https://www.zoll.de/SharedDocs/Downloads/DE/FormulareMerkblaetter/Versorgung/mb_hinterbliebenenversorgung.pdf" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            Generalzolldirektion – Merkblatt Hinterbliebenenversorgung (Fiktion Ruhestand wegen Dienstunfähigkeit am Todestag)
          </a>
        </div>
      </div>
    </div>
  );
}
