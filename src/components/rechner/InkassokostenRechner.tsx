import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: September 2026, RVG in der Fassung des KostRÄG 2025) ===

// Inkassokosten sind nur bis zur Höhe der Vergütung erstattungsfähig, die ein Rechtsanwalt nach dem RVG
// verlangen könnte – § 13e Abs. 1 RDG
// Gebührentabelle § 13 Abs. 1 RVG: bis 500 € = 51,50 €; danach je angefangene Stufe:
const GEBUEHR_BASIS = 51.5;
const STUFEN: { bis: number; schritt: number; plus: number }[] = [
  { bis: 2000, schritt: 500, plus: 41.5 },
  { bis: 10000, schritt: 1000, plus: 59.5 },
  { bis: 25000, schritt: 3000, plus: 55 },
  { bis: 50000, schritt: 5000, plus: 86 },
  { bis: 200000, schritt: 15000, plus: 99.5 },
  { bis: 500000, schritt: 30000, plus: 140 },
  { bis: Infinity, schritt: 50000, plus: 175 },
];
// Unbestrittene Forderung bis 50 €: Gebühr 31,50 € – § 13 Abs. 2 RVG; Mindestgebühr 15 € – § 13 Abs. 3 RVG
const GEBUEHR_KLEIN_UNBESTRITTEN = 31.5;
const MINDESTGEBUEHR = 15;

// Geschäftsgebühr Nr. 2300 VV RVG: Rahmen 0,5–2,5; Anmerkung Abs. 2 für Inkasso bei unbestrittener Forderung:
// einfacher Fall (Zahlung binnen 2 Wochen nach erster Zahlungsaufforderung) 0,5, sonst höchstens 0,9,
// mehr nur bei besonders umfangreicher/schwieriger Tätigkeit, höchstens 1,3
const SATZ_EINFACH = 0.5;
const SATZ_REGEL = 0.9;
const SATZ_MAX = 1.3;
// Einigungsgebühr für eine Zahlungsvereinbarung (Ratenzahlung): 0,7 – Nr. 1000 Nr. 2 VV RVG
const SATZ_ZAHLUNGSVEREINBARUNG = 0.7;
// Auslagenpauschale Post/Telekommunikation: 20 % der Gebühren, höchstens 20 € – Nr. 7002 VV RVG
const AUSLAGEN_PROZENT = 0.2;
const AUSLAGEN_MAX = 20;
const UMSATZSTEUER = 0.19;

function gebuehr(wert: number, unbestritten: boolean): number {
  if (unbestritten && wert <= 50) return GEBUEHR_KLEIN_UNBESTRITTEN;
  if (wert <= 500) return GEBUEHR_BASIS;
  let g = GEBUEHR_BASIS;
  let grenze = 500;
  for (const s of STUFEN) {
    if (wert <= grenze) break;
    const obere = Math.min(wert, s.bis);
    g += Math.ceil((obere - grenze) / s.schritt) * s.plus;
    grenze = s.bis;
  }
  return g;
}

const fmtEuro = (n: number) =>
  n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function InkassokostenRechner() {
  const [forderung, setForderung] = useState(350);
  const [bestritten, setBestritten] = useState(false);
  const [fall, setFall] = useState<'einfach' | 'regel' | 'umfangreich'>('regel');
  const [ratenzahlung, setRatenzahlung] = useState(false);
  const [vorsteuer, setVorsteuer] = useState(false);
  const [berechnet, setBerechnet] = useState(0);

  const ergebnis = useMemo(() => {
    const wert = Math.max(0, forderung);
    const unbestritten = !bestritten;
    const g = gebuehr(wert, unbestritten);
    const satz = !unbestritten ? SATZ_MAX : fall === 'einfach' ? SATZ_EINFACH : fall === 'regel' ? SATZ_REGEL : SATZ_MAX;
    const geschaeft = Math.max(MINDESTGEBUEHR, g * satz);
    const einigung = ratenzahlung ? Math.max(MINDESTGEBUEHR, g * SATZ_ZAHLUNGSVEREINBARUNG) : 0;
    const gebuehrenNetto = geschaeft + einigung;
    const auslagen = Math.min(AUSLAGEN_MAX, gebuehrenNetto * AUSLAGEN_PROZENT);
    const netto = gebuehrenNetto + auslagen;
    const ust = vorsteuer ? 0 : netto * UMSATZSTEUER;
    const brutto = netto + ust;
    const zuViel = berechnet > 0 ? Math.max(0, berechnet - brutto) : 0;
    return { wert, g, satz, geschaeft, einigung, auslagen, netto, ust, brutto, zuViel, anteil: wert > 0 ? (brutto / wert) * 100 : 0 };
  }, [forderung, bestritten, fall, ratenzahlung, vorsteuer, berechnet]);

  const btn = (aktiv: boolean) =>
    `py-3 px-3 rounded-xl font-medium transition-all text-sm ${aktiv ? 'bg-stone-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`;
  const inputCls = 'w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-stone-600 focus:ring-0 outline-none';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Hauptforderung (ursprüngliche Rechnung)</span>
            <span className="text-xs text-gray-500 block mt-1">Der Betrag, den Sie dem Gläubiger tatsächlich schulden – ohne Mahn- und Inkassokosten (Gegenstandswert)</span>
          </label>
          <div className="relative">
            <input type="number" value={forderung} onChange={(e) => setForderung(Math.max(0, Number(e.target.value) || 0))} className={inputCls} min="0" step="10" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input type="range" value={forderung} onChange={(e) => setForderung(Number(e.target.value))} className="w-full mt-3 accent-stone-600" min="10" max="5000" step="10" />
        </div>

        <div className="mb-6">
          <span className="text-gray-700 font-medium block mb-2">Ist die Forderung berechtigt und unbestritten?</span>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setBestritten(false)} className={btn(!bestritten)}>Ja, unbestritten</button>
            <button onClick={() => setBestritten(true)} className={btn(bestritten)}>Nein, ich bestreite sie</button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Bei bestrittenen Forderungen gilt die Deckelung auf 0,9 nicht – dann sind bis zu 1,3 Gebühren möglich. Ist die Forderung unberechtigt, schulden Sie gar nichts.</p>
        </div>

        {!bestritten && (
          <div className="mb-6">
            <span className="text-gray-700 font-medium block mb-2">Wie lief das Inkasso?</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button onClick={() => setFall('einfach')} className={btn(fall === 'einfach')}>Einfacher Fall (0,5)<span className="block text-xs font-normal">Zahlung binnen 2 Wochen nach der ersten Zahlungsaufforderung</span></button>
              <button onClick={() => setFall('regel')} className={btn(fall === 'regel')}>Regelfall (0,9)<span className="block text-xs font-normal">Mehrere Schreiben, später gezahlt</span></button>
              <button onClick={() => setFall('umfangreich')} className={btn(fall === 'umfangreich')}>Besonders umfangreich (1,3)<span className="block text-xs font-normal">Nur ausnahmsweise, muss das Inkasso begründen</span></button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={ratenzahlung} onChange={(e) => setRatenzahlung(e.target.checked)} className="w-5 h-5 mt-0.5 accent-stone-600" />
            <span className="text-sm text-gray-700">Es wurde eine <strong>Ratenzahlungs- oder Stundungsvereinbarung</strong> geschlossen (Einigungsgebühr 0,7, Nr. 1000 VV RVG)</span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={vorsteuer} onChange={(e) => setVorsteuer(e.target.checked)} className="w-5 h-5 mt-0.5 accent-stone-600" />
            <span className="text-sm text-gray-700">Der Gläubiger ist ein <strong>vorsteuerabzugsberechtigtes Unternehmen</strong> (dann darf er die Umsatzsteuer auf die Inkassokosten nicht von Ihnen verlangen)</span>
          </label>
        </div>

        <div className="border-t border-gray-100 pt-5 mt-5">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Vom Inkasso berechnete Kosten (optional)</span>
            <span className="text-xs text-gray-500 block mt-1">Summe aus Inkassovergütung, Auslagen, Kontoführung, Adressermittlung usw. laut Schreiben – ohne Hauptforderung und Zinsen</span>
          </label>
          <div className="relative">
            <input type="number" value={berechnet || ''} placeholder="0" onChange={(e) => setBerechnet(Math.max(0, Number(e.target.value) || 0))} className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-stone-600 focus:ring-0 outline-none" min="0" step="0.01" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-stone-700 to-stone-900 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">⚖️ Maximal erstattungsfähige Inkassokosten (§ 13e RDG)</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-5xl font-bold">{fmtEuro(ergebnis.brutto)}</span>
            <span className="text-xl opacity-80">= {ergebnis.anteil.toLocaleString('de-DE', { maximumFractionDigits: 1 })} % der Forderung</span>
          </div>
          <p className="text-stone-200 mt-2 text-sm">
            {ergebnis.satz.toLocaleString('de-DE')}-Geschäftsgebühr aus {fmtEuro(ergebnis.g)} (Gegenstandswert {fmtEuro(ergebnis.wert)})
            {ratenzahlung ? ' + 0,7 Einigungsgebühr' : ''} + Auslagenpauschale{vorsteuer ? ', ohne Umsatzsteuer' : ' + 19 % USt'}
          </p>
        </div>
        {berechnet > 0 && (
          <div className={`rounded-xl p-4 text-sm ${ergebnis.zuViel > 0.005 ? 'bg-amber-400/20 border border-amber-200/40' : 'bg-white/10'}`}>
            {ergebnis.zuViel > 0.005
              ? <>⚠️ Das Inkasso berechnet <strong>{fmtEuro(berechnet)}</strong> – das sind <strong>{fmtEuro(ergebnis.zuViel)} zu viel</strong>. Zahlen Sie die Hauptforderung plus höchstens {fmtEuro(ergebnis.brutto)} Kosten und widersprechen Sie dem Rest schriftlich.</>
              : <>✓ Die berechneten {fmtEuro(berechnet)} liegen im Rahmen des Erstattungsfähigen.</>}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Aufschlüsselung</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4"><span className="text-gray-600">Eine volle Gebühr bei {fmtEuro(ergebnis.wert)} Gegenstandswert (§ 13 RVG)</span><span className="font-medium text-gray-800 text-right">{fmtEuro(ergebnis.g)}</span></div>
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4"><span className="text-gray-600">Geschäftsgebühr Nr. 2300 VV × {ergebnis.satz.toLocaleString('de-DE')}{ergebnis.geschaeft === MINDESTGEBUEHR ? ' (Mindestgebühr 15 €)' : ''}</span><span className="font-medium text-gray-800 text-right">{fmtEuro(ergebnis.geschaeft)}</span></div>
          {ratenzahlung && <div className="flex justify-between py-2 border-b border-gray-100 gap-4"><span className="text-gray-600">Einigungsgebühr Nr. 1000 VV × 0,7 (Zahlungsvereinbarung)</span><span className="font-medium text-gray-800 text-right">{fmtEuro(ergebnis.einigung)}</span></div>}
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4"><span className="text-gray-600">Auslagenpauschale Nr. 7002 VV (20 %, max. 20 €)</span><span className="font-medium text-gray-800 text-right">{fmtEuro(ergebnis.auslagen)}</span></div>
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4"><span className="text-gray-600">Umsatzsteuer 19 % {vorsteuer ? '(entfällt: Gläubiger vorsteuerabzugsberechtigt)' : ''}</span><span className="font-medium text-gray-800 text-right">{fmtEuro(ergebnis.ust)}</span></div>
          <div className="flex justify-between py-2 gap-4"><span className="text-gray-600">= Höchstens erstattungsfähig</span><span className="font-bold text-stone-800 text-right">{fmtEuro(ergebnis.brutto)}</span></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🔍 Was zusätzlich verlangt werden darf – und was nicht</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2"><span>✓</span><span><strong>Verzugszinsen:</strong> 5 Prozentpunkte über dem Basiszinssatz bei Verbrauchern (§ 288 Abs. 1 BGB), ab Verzugseintritt.</span></li>
          <li className="flex gap-2"><span>✓</span><span><strong>Mahnkosten des Gläubigers:</strong> nur die tatsächlichen Kosten der Mahnung nach Verzugseintritt – in der Regel Porto, also 1 bis 3 €. Die erste Mahnung, die den Verzug erst begründet, ist nicht erstattungsfähig.</span></li>
          <li className="flex gap-2"><span>✓</span><span><strong>Adressermittlung:</strong> nur in tatsächlich angefallener, angemessener Höhe (Einwohnermeldeamt), nicht pauschal.</span></li>
          <li className="flex gap-2"><span>✗</span><span><strong>Kontoführungsgebühren, Bearbeitungspauschalen, Aktenanlage, Bonitätsprüfung:</strong> keine erstattungsfähigen Verzugsschäden – streichen.</span></li>
          <li className="flex gap-2"><span>✗</span><span><strong>Doppelte Gebühren:</strong> Beauftragt der Gläubiger nach dem Inkasso noch einen Anwalt, muss er sich die Inkassokosten anrechnen lassen (§ 13e RDG, Vorbem. 2.3 Abs. 6 VV RVG) – nicht beides.</span></li>
        </ul>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-xs text-gray-500">
        <strong>Hinweis:</strong> Der Rechner prüft nur die Höhe der Inkassokosten nach § 13e RDG i. V. m. RVG (Gebührentabelle nach
        dem Kostenrechtsänderungsgesetz 2025, gültig ab 1. Juni 2025). Ob die Hauptforderung überhaupt besteht und ob Verzug
        eingetreten ist, muss gesondert geprüft werden – ohne Verzug sind gar keine Inkassokosten geschuldet. Registrierte
        Inkassodienstleister finden Sie im Rechtsdienstleistungsregister. Keine Rechtsberatung.
      </div>

      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a href="https://www.gesetze-im-internet.de/rdg/__13e.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 13e RDG – Ersatz von Inkassokosten nur bis zur Höhe der Anwaltsvergütung</a>
          <a href="https://www.gesetze-im-internet.de/rvg/__13.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 13 RVG – Wertgebühren (Tabelle), 31,50 € bis 50 € unbestritten, Mindestgebühr 15 €</a>
          <a href="https://www.gesetze-im-internet.de/rvg/anlage_1.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">Vergütungsverzeichnis RVG – Nr. 2300 (Geschäftsgebühr 0,5/0,9/1,3), Nr. 1000 (Einigungsgebühr 0,7), Nr. 7002 (Auslagenpauschale)</a>
          <a href="https://www.gesetze-im-internet.de/bgb/__288.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 288 BGB – Verzugszinsen</a>
          <a href="https://www.rechtsdienstleistungsregister.de/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">Rechtsdienstleistungsregister – Prüfen, ob das Inkassounternehmen registriert ist</a>
        </div>
      </div>
    </div>
  );
}
