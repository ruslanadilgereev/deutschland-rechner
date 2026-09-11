import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: September 2026) ===

// Fahrerlaubnis (§ 6 Abs. 1 FeV):
// Klasse B: Zugfahrzeug bis 3.500 kg zGM + Anhänger bis 750 kg zGM, oder Anhänger über 750 kg,
//   sofern die zGM der Kombination 3.500 kg nicht überschreitet
// Schlüsselzahl 96 (B96, Anlage 9 FeV): Anhänger über 750 kg, Kombination über 3.500 bis 4.250 kg
// Klasse BE: Anhänger bis 3.500 kg zGM hinter Zugfahrzeug der Klasse B
// Klasse C1E (aus alter Klasse 3): Zugfahrzeug Klasse B + Anhänger über 3.500 kg, Kombination bis 12.000 kg
// zGM der Kombination = Summe der zGM der Einzelfahrzeuge ohne Stützlast (§ 6 Abs. 1 Satz 2 FeV)
const B_MAX_KOMBI = 3500;
const B_ANHAENGER_FREI = 750;
const B96_MAX_KOMBI = 4250;
const BE_MAX_ANHAENGER = 3500;
const KLASSE3_MAX_KOMBI = 12000;

// Technik (§ 42 StVZO): Anhängelast bei Pkw höchstens die zGM des Zugfahrzeugs (Geländewagen: 1,5-fach),
// nie mehr als der Herstellerwert; tatsächliche Anhängermasse bei Pkw nie über 3.500 kg (Abs. 1);
// ungebremste Anhänger höchstens 750 kg und höchstens die Hälfte der um 75 kg erhöhten Leermasse (Abs. 2)
// Stützlast (§ 44 Abs. 3 StVZO): mindestens 4 % der tatsächlichen Anhängermasse, höchstens 25 kg nötig;
// nie mehr als die für Zugfahrzeug (Feld 13) bzw. Kupplung zugelassene Stützlast
const PKW_MAX_ANHAENGER_TATSAECHLICH = 3500;
const UNGEBREMST_MAX = 750;
const STUETZLAST_MIN_PROZENT = 0.04;
const STUETZLAST_MIN_MAX = 25;

type Klasse = 'B' | 'B96' | 'BE' | 'Klasse3';

const kg = (n: number) => n.toLocaleString('de-DE', { maximumFractionDigits: 0 }) + ' kg';

const btn = (aktiv: boolean) =>
  `py-3 px-3 rounded-xl font-medium transition-all text-sm ${aktiv ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`;
const inputCls = 'w-full text-lg font-bold text-center py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-sky-500 focus:ring-0 outline-none';

// Auf Modulebene, damit die Inputs beim Tippen nicht neu gemountet werden
function F({ label, feld, value, set }: { label: string; feld?: string; value: number; set: (n: number) => void }) {
  return (
    <div>
      <label className="block mb-1 text-sm text-gray-700 font-medium">{label}{feld && <span className="text-xs text-gray-400 font-normal"> · Feld {feld}</span>}</label>
      <div className="relative"><input type="number" value={value} onChange={(e) => set(Math.max(0, Number(e.target.value) || 0))} className={inputCls} min="0" step="10" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span></div>
    </div>
  );
}

export default function AnhaengelastRechner() {
  // Zugfahrzeug (Zulassungsbescheinigung Teil I)
  const [zugZgm, setZugZgm] = useState(2100); // F.1
  const [zugLeer, setZugLeer] = useState(1550); // G
  const [zugGelaende, setZugGelaende] = useState(false);
  const [anhGebremst, setAnhGebremst] = useState(1500); // O.1
  const [anhUngebremst, setAnhUngebremst] = useState(750); // O.2
  const [stuetzlastZug, setStuetzlastZug] = useState(80); // Feld 13
  const [zugBeladen, setZugBeladen] = useState(1850); // tatsächliche Masse mit Insassen/Gepäck, ohne Stützlast
  // Anhänger
  const [anhZgm, setAnhZgm] = useState(1300); // F.1 Anhänger
  const [anhTatsaechlich, setAnhTatsaechlich] = useState(1100);
  const [gebremst, setGebremst] = useState(true);
  const [stuetzlastTatsaechlich, setStuetzlastTatsaechlich] = useState(60);
  const [stuetzlastKupplung, setStuetzlastKupplung] = useState(100);
  // Fahrerlaubnis
  const [klasse, setKlasse] = useState<Klasse>('B');

  const ergebnis = useMemo(() => {
    const probleme: string[] = [];
    const hinweise: string[] = [];

    // === 1. Fahrerlaubnis (§ 6 FeV) ===
    const kombiZgm = zugZgm + anhZgm;
    let fahrerlaubnisOk = false;
    let benoetigt = '';
    if (anhZgm <= B_ANHAENGER_FREI || kombiZgm <= B_MAX_KOMBI) { fahrerlaubnisOk = true; benoetigt = 'B'; }
    else if (kombiZgm <= B96_MAX_KOMBI) { fahrerlaubnisOk = klasse !== 'B'; benoetigt = 'B96 (oder BE)'; }
    else if (anhZgm <= BE_MAX_ANHAENGER) { fahrerlaubnisOk = klasse === 'BE' || klasse === 'Klasse3'; benoetigt = 'BE'; }
    else if (kombiZgm <= KLASSE3_MAX_KOMBI) { fahrerlaubnisOk = klasse === 'Klasse3'; benoetigt = 'C1E (alte Klasse 3) – Anhänger über 3.500 kg'; }
    else { fahrerlaubnisOk = false; benoetigt = 'CE – Kombination über 12 t'; }
    if (zugZgm > 3500) { fahrerlaubnisOk = false; benoetigt = 'C1/C1E – Zugfahrzeug über 3.500 kg'; }
    if (!fahrerlaubnisOk) probleme.push(`Ihre Fahrerlaubnis ${klasse === 'Klasse3' ? 'Klasse 3 (alt)' : klasse} reicht nicht – nötig: ${benoetigt}.`);

    // === 2. Technische Anhängelast (§ 42 StVZO) ===
    const anhaengelast = Math.max(0, anhTatsaechlich - stuetzlastTatsaechlich); // Achslast = Gesamtmasse − Stützlast
    const grenzeGebremst = Math.min(anhGebremst, zugGelaende ? zugZgm * 1.5 : zugZgm);
    const grenzeUngebremst = Math.min(anhUngebremst, UNGEBREMST_MAX, Math.floor((zugLeer + 75) / 2));
    const grenze = gebremst ? grenzeGebremst : grenzeUngebremst;
    if (anhTatsaechlich > anhZgm) probleme.push(`Der Anhänger ist überladen: ${kg(anhTatsaechlich)} tatsächlich, zulässig ${kg(anhZgm)}.`);
    if (anhaengelast > grenze) probleme.push(`Anhängelast ${kg(anhaengelast)} überschreitet die zulässige ${gebremst ? 'gebremste' : 'ungebremste'} Anhängelast von ${kg(grenze)}.`);
    if (anhTatsaechlich > PKW_MAX_ANHAENGER_TATSAECHLICH) probleme.push('Hinter einem Pkw darf die tatsächliche Anhängermasse nie über 3.500 kg liegen (§ 42 Abs. 1 StVZO).');
    if (!gebremst && anhTatsaechlich > UNGEBREMST_MAX) probleme.push('Ungebremste Anhänger dürfen höchstens 750 kg wiegen (§ 42 Abs. 2 StVZO).');

    // === 3. Stützlast (§ 44 Abs. 3 StVZO) ===
    const stuetzlastMin = Math.min(STUETZLAST_MIN_MAX, anhTatsaechlich * STUETZLAST_MIN_PROZENT);
    const stuetzlastMax = Math.min(stuetzlastZug, stuetzlastKupplung);
    if (stuetzlastTatsaechlich < stuetzlastMin) probleme.push(`Stützlast zu gering: mindestens ${kg(Math.ceil(stuetzlastMin))} nötig (4 % der Anhängermasse, max. 25 kg).`);
    if (stuetzlastTatsaechlich > stuetzlastMax) probleme.push(`Stützlast ${kg(stuetzlastTatsaechlich)} überschreitet das zulässige Maximum von ${kg(stuetzlastMax)} (kleinerer Wert von Zugfahrzeug und Kupplung).`);

    // === 4. Zugfahrzeug: Stützlast zählt zur Zuladung ===
    const zugGesamt = zugBeladen + stuetzlastTatsaechlich;
    if (zugGesamt > zugZgm) probleme.push(`Zugfahrzeug überladen: ${kg(zugBeladen)} + ${kg(stuetzlastTatsaechlich)} Stützlast = ${kg(zugGesamt)}, zulässig ${kg(zugZgm)}.`);

    // Hinweise
    const reserveAnhaengelast = grenze - anhaengelast;
    if (fahrerlaubnisOk && klasse === 'B' && anhZgm > B_ANHAENGER_FREI) hinweise.push(`Mit Klasse B geht das nur, weil die Summe der zulässigen Gesamtmassen (${kg(kombiZgm)}) unter 3.500 kg bleibt – ein schwererer Anhänger wäre B96- oder BE-pflichtig.`);
    hinweise.push('Tempo 100 km/h auf Autobahnen nur mit 100-km/h-Plakette (9. AusnahmeVO zur StVO), sonst gelten 80 km/h.');

    return { probleme, hinweise, kombiZgm, benoetigt, fahrerlaubnisOk, anhaengelast, grenze, grenzeGebremst, grenzeUngebremst, stuetzlastMin, stuetzlastMax, zugGesamt, reserveAnhaengelast, alles: probleme.length === 0 };
  }, [zugZgm, zugLeer, zugGelaende, anhGebremst, anhUngebremst, stuetzlastZug, zugBeladen, anhZgm, anhTatsaechlich, gebremst, stuetzlastTatsaechlich, stuetzlastKupplung, klasse]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">🚗 Zugfahrzeug</h3>
        <p className="text-xs text-gray-500 mb-4">Werte aus der Zulassungsbescheinigung Teil I (Fahrzeugschein)</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <F label="Zulässige Gesamtmasse" feld="F.1" value={zugZgm} set={setZugZgm} />
          <F label="Leermasse" feld="G" value={zugLeer} set={setZugLeer} />
          <F label="Anhängelast gebremst" feld="O.1" value={anhGebremst} set={setAnhGebremst} />
          <F label="Anhängelast ungebremst" feld="O.2" value={anhUngebremst} set={setAnhUngebremst} />
          <F label="Zulässige Stützlast" feld="13" value={stuetzlastZug} set={setStuetzlastZug} />
          <F label="Tatsächliche Masse beladen (mit Insassen, ohne Stützlast)" value={zugBeladen} set={setZugBeladen} />
        </div>
        <label className="flex items-center gap-3 cursor-pointer text-sm text-gray-700"><input type="checkbox" checked={zugGelaende} onChange={(e) => setZugGelaende(e.target.checked)} className="w-5 h-5 accent-sky-600" />Geländefahrzeug (M1G) – Anhängelast bis 1,5-fache Gesamtmasse erlaubt</label>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🚚 Anhänger</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <F label="Zulässige Gesamtmasse" feld="F.1" value={anhZgm} set={setAnhZgm} />
          <F label="Tatsächliche Masse beladen" value={anhTatsaechlich} set={setAnhTatsaechlich} />
          <F label="Tatsächliche Stützlast" value={stuetzlastTatsaechlich} set={setStuetzlastTatsaechlich} />
          <F label="Zulässige Stützlast Anhänger / Kupplung" feld="13" value={stuetzlastKupplung} set={setStuetzlastKupplung} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setGebremst(true)} className={btn(gebremst)}>Mit Auflaufbremse</button>
          <button onClick={() => setGebremst(false)} className={btn(!gebremst)}>Ungebremst</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🪪 Ihre Fahrerlaubnis</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button onClick={() => setKlasse('B')} className={btn(klasse === 'B')}>B</button>
          <button onClick={() => setKlasse('B96')} className={btn(klasse === 'B96')}>B96</button>
          <button onClick={() => setKlasse('BE')} className={btn(klasse === 'BE')}>BE</button>
          <button onClick={() => setKlasse('Klasse3')} className={btn(klasse === 'Klasse3')}>Klasse 3 (vor 1999)</button>
        </div>
      </div>

      <div className={`bg-gradient-to-br ${ergebnis.alles ? 'from-emerald-500 to-green-600' : 'from-red-500 to-rose-600'} rounded-2xl shadow-lg p-6 text-white mb-6`}>
        <h3 className="text-sm font-medium opacity-80 mb-1">🔍 Prüfergebnis</h3>
        <div className="text-3xl sm:text-4xl font-bold mb-3">{ergebnis.alles ? 'Diese Kombination dürfen Sie fahren' : `${ergebnis.probleme.length} ${ergebnis.probleme.length === 1 ? 'Problem' : 'Probleme'}`}</div>
        {ergebnis.probleme.length > 0 && (
          <ul className="space-y-2 text-sm mb-4">{ergebnis.probleme.map((p, i) => <li key={i} className="flex gap-2"><span>✗</span><span>{p}</span></li>)}</ul>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Fahrerlaubnis nötig</span><div className="text-lg font-bold">{ergebnis.benoetigt}</div><span className="text-xs opacity-70">zGM der Kombination {kg(ergebnis.kombiZgm)}</span></div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Tatsächliche Anhängelast</span><div className="text-lg font-bold">{kg(ergebnis.anhaengelast)}</div><span className="text-xs opacity-70">zulässig {kg(ergebnis.grenze)} ({gebremst ? 'gebremst' : 'ungebremst'}), Reserve {kg(Math.max(0, ergebnis.reserveAnhaengelast))}</span></div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Stützlast-Korridor</span><div className="text-lg font-bold">{kg(Math.ceil(ergebnis.stuetzlastMin))} – {kg(ergebnis.stuetzlastMax)}</div><span className="text-xs opacity-70">tatsächlich {kg(stuetzlastTatsaechlich)}</span></div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Zugfahrzeug inkl. Stützlast</span><div className="text-lg font-bold">{kg(ergebnis.zugGesamt)}</div><span className="text-xs opacity-70">zulässig {kg(zugZgm)}</span></div>
        </div>
        {ergebnis.hinweise.length > 0 && (
          <ul className="space-y-1 text-xs opacity-90 mt-4">{ergebnis.hinweise.map((h, i) => <li key={i}>ℹ️ {h}</li>)}</ul>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Die vier Regeln, die geprüft werden</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2"><span>1.</span><span><strong>Fahrerlaubnis (§ 6 FeV):</strong> Klasse B erlaubt Anhänger bis 750 kg zGM immer – schwerere nur, wenn die zulässigen Gesamtmassen von Auto und Anhänger zusammen 3.500 kg nicht übersteigen. B96 hebt die Grenze auf 4.250 kg, BE erlaubt Anhänger bis 3.500 kg zGM. Gerechnet wird mit den Papierwerten, nicht mit dem tatsächlichen Gewicht.</span></li>
          <li className="flex gap-2"><span>2.</span><span><strong>Anhängelast (§ 42 StVZO):</strong> Die tatsächliche Anhängelast – Anhängermasse minus Stützlast – darf den Herstellerwert O.1 (gebremst) bzw. O.2 (ungebremst) nicht überschreiten; ungebremst nie mehr als 750 kg und die halbe Leermasse.</span></li>
          <li className="flex gap-2"><span>3.</span><span><strong>Stützlast (§ 44 StVZO):</strong> Mindestens 4 % der Anhängermasse (höchstens 25 kg nötig), höchstens der kleinere Wert von Zugfahrzeug (Feld 13) und Kupplung. Eine zu geringe Stützlast macht das Gespann pendelanfällig.</span></li>
          <li className="flex gap-2"><span>4.</span><span><strong>Zuladung des Zugfahrzeugs:</strong> Die Stützlast drückt auf die Hinterachse und zählt zur Beladung des Autos. Insassen, Gepäck und Stützlast zusammen dürfen die zulässige Gesamtmasse nicht überschreiten.</span></li>
        </ul>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-xs text-gray-500">
        <strong>Hinweis:</strong> Der Rechner prüft Fahrerlaubnis und technische Grenzen nach FeV und StVZO anhand Ihrer Eingaben. Nicht
        geprüft werden Achslasten (Felder 7.1–7.3), die Anhängerkupplung (D-Wert), Auflastungen per Einzelabnahme, die
        Höchstgeschwindigkeit des Anhängers, Fahrerlaubnisse mit Schlüsselzahlen (z. B. 79.06) sowie ausländische Fahrerlaubnisse.
        Verbindlich sind die Eintragungen in den Fahrzeugpapieren und im Führerschein. Keine Rechtsberatung.
      </div>

      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a href="https://www.gesetze-im-internet.de/fev_2010/__6.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 6 FeV – Fahrerlaubnisklassen B, BE, C1E; Berechnung der zGM der Kombination</a>
          <a href="https://www.gesetze-im-internet.de/fev_2010/anlage_9.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">Anlage 9 FeV – Schlüsselzahl 96 (Kombinationen bis 4.250 kg)</a>
          <a href="https://www.gesetze-im-internet.de/stvzo_2012/__42.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 42 StVZO – Anhängelast hinter Kraftfahrzeugen (gebremst/ungebremst, 3.500-kg-Grenze)</a>
          <a href="https://www.gesetze-im-internet.de/stvzo_2012/__44.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 44 StVZO – Stützlast: mindestens 4 %, höchstens Herstellerwert</a>
        </div>
      </div>
    </div>
  );
}
