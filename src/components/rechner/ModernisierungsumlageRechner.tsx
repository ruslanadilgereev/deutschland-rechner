import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: September 2026) ===

// Modernisierungsumlage: jährliche Miete + 8 % der für die Wohnung aufgewendeten Kosten – § 559 Abs. 1 BGB
const UMLAGE_SATZ = 0.08;
// Heizungsmodernisierung nach § 555b Nr. 1a mit Förderung: 10 % der Kosten abzüglich Drittmittel – § 559e Abs. 1 BGB;
// Erhaltungsanteil pauschal 15 % – § 559e Abs. 2 BGB
const UMLAGE_SATZ_HEIZUNG = 0.10;
const ERHALTUNG_PAUSCHAL_HEIZUNG = 0.15;
// Kappungsgrenze: höchstens 3 €/m² in 6 Jahren; 2 €/m², wenn die Miete vorher unter 7 €/m² lag – § 559 Abs. 3a BGB
const KAPPUNG_JE_M2 = 3;
const KAPPUNG_JE_M2_NIEDRIG = 2;
const KAPPUNG_SCHWELLE_MIETE = 7;
// Heizungsmodernisierung: zusätzlich höchstens 0,50 €/m² in 6 Jahren – § 559 Abs. 3a Satz 3, § 559e Abs. 3 BGB
const KAPPUNG_HEIZUNG_JE_M2 = 0.5;

const fmtEuro = (n: number) =>
  n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtEuroRund = (n: number) =>
  n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function ModernisierungsumlageRechner() {
  const [art, setArt] = useState<'normal' | 'heizung'>('normal');
  const [wohnflaeche, setWohnflaeche] = useState(70);
  const [miete, setMiete] = useState(600);
  const [kosten, setKosten] = useState(21000);
  const [erhaltung, setErhaltung] = useState(4000);
  const [drittmittel, setDrittmittel] = useState(0);
  const [fruehereErhoehung, setFruehereErhoehung] = useState(0);

  const ergebnis = useMemo(() => {
    const flaeche = Math.max(1, wohnflaeche);
    const mieteJeM2 = Math.max(0, miete) / flaeche;

    // === 1. Umlagefähige Kosten: Modernisierungskosten − Erhaltungsanteil − Drittmittel/Zuschüsse (§ 559 Abs. 2, § 559a) ===
    const erhaltungsanteil = art === 'heizung' ? Math.max(0, kosten) * ERHALTUNG_PAUSCHAL_HEIZUNG : Math.min(Math.max(0, erhaltung), Math.max(0, kosten));
    const umlagefaehig = Math.max(0, Math.max(0, kosten) - erhaltungsanteil - Math.max(0, drittmittel));

    // === 2. Erhöhung der Jahresmiete: 8 % bzw. 10 % ===
    const satz = art === 'heizung' ? UMLAGE_SATZ_HEIZUNG : UMLAGE_SATZ;
    const erhoehungJahrRoh = umlagefaehig * satz;
    const erhoehungMonatRoh = erhoehungJahrRoh / 12;
    const erhoehungJeM2Roh = erhoehungMonatRoh / flaeche;

    // === 3. Kappungsgrenze (§ 559 Abs. 3a) ===
    const kappungJeM2 = mieteJeM2 < KAPPUNG_SCHWELLE_MIETE ? KAPPUNG_JE_M2_NIEDRIG : KAPPUNG_JE_M2;
    const kappungRestJeM2 = Math.max(0, kappungJeM2 - Math.max(0, fruehereErhoehung));
    const kappungAnwendbar = art === 'heizung' ? Math.min(KAPPUNG_HEIZUNG_JE_M2, kappungRestJeM2) : kappungRestJeM2;
    const erhoehungJeM2 = Math.min(erhoehungJeM2Roh, kappungAnwendbar);
    const gekappt = erhoehungJeM2Roh > kappungAnwendbar + 1e-9;
    const erhoehungMonat = erhoehungJeM2 * flaeche;

    return {
      mieteJeM2, erhaltungsanteil, umlagefaehig, satz, erhoehungMonatRoh, erhoehungJeM2Roh, kappungJeM2, kappungRestJeM2, kappungAnwendbar,
      erhoehungJeM2, gekappt, erhoehungMonat, neueMiete: Math.max(0, miete) + erhoehungMonat,
      erhoehungProzent: miete > 0 ? (erhoehungMonat / miete) * 100 : 0,
      amortisationJahre: erhoehungMonat > 0 ? umlagefaehig / (erhoehungMonat * 12) : 0,
    };
  }, [art, wohnflaeche, miete, kosten, erhaltung, drittmittel, fruehereErhoehung]);

  const btn = (aktiv: boolean) =>
    `py-3 px-3 rounded-xl font-medium transition-all text-sm ${aktiv ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`;
  const inputCls = 'w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none';
  const zahl = (setter: (n: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => setter(Math.max(0, Number(e.target.value) || 0));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="mb-6">
          <span className="text-gray-700 font-medium block mb-2">Art der Modernisierung</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={() => setArt('normal')} className={btn(art === 'normal')}>Dämmung, Fenster, Bad, Aufzug, Balkon …<span className="block text-xs font-normal">8 % der Kosten (§ 559 BGB)</span></button>
            <button onClick={() => setArt('heizung')} className={btn(art === 'heizung')}>Heizungstausch mit staatlicher Förderung<span className="block text-xs font-normal">10 % der Kosten nach Abzug der Förderung, Kappung 0,50 €/m² (§ 559e BGB)</span></button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2"><span className="text-gray-700 font-medium">Wohnfläche</span></label>
            <div className="relative"><input type="number" value={wohnflaeche} onChange={zahl(setWohnflaeche)} className={inputCls} min="1" step="1" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span></div>
          </div>
          <div>
            <label className="block mb-2"><span className="text-gray-700 font-medium">Bisherige Nettokaltmiete</span><span className="text-xs text-gray-500 block mt-1">Ohne Betriebskosten – entscheidet über die Kappungsgrenze (unter 7 €/m² nur 2 €)</span></label>
            <div className="relative"><input type="number" value={miete} onChange={zahl(setMiete)} className={inputCls} min="0" step="10" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span></div>
          </div>
          <div>
            <label className="block mb-2"><span className="text-gray-700 font-medium">Modernisierungskosten für Ihre Wohnung</span><span className="text-xs text-gray-500 block mt-1">Anteil laut Ankündigung (Gesamtkosten nach Wohnfläche oder anderem Schlüssel verteilt, § 559 Abs. 3)</span></label>
            <div className="relative"><input type="number" value={kosten} onChange={zahl(setKosten)} className={inputCls} min="0" step="500" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span></div>
          </div>
          {art === 'normal' ? (
            <div>
              <label className="block mb-2"><span className="text-gray-700 font-medium">Davon ersparte Instandhaltung</span><span className="text-xs text-gray-500 block mt-1">Was eine reine Reparatur der alten Fenster/Heizung gekostet hätte – muss der Vermieter abziehen (§ 559 Abs. 2)</span></label>
              <div className="relative"><input type="number" value={erhaltung} onChange={zahl(setErhaltung)} className={inputCls} min="0" step="500" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span></div>
            </div>
          ) : (
            <div>
              <label className="block mb-2"><span className="text-gray-700 font-medium">Erhaltene Förderung (BEG/KfW) für Ihre Wohnung</span><span className="text-xs text-gray-500 block mt-1">Drittmittel werden abgezogen (§ 559e Abs. 1); Erhaltungsanteil pauschal 15 %</span></label>
              <div className="relative"><input type="number" value={drittmittel} onChange={zahl(setDrittmittel)} className={inputCls} min="0" step="500" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span></div>
            </div>
          )}
          {art === 'normal' && (
            <div>
              <label className="block mb-2"><span className="text-gray-700 font-medium">Öffentliche Zuschüsse / Drittmittel</span><span className="text-xs text-gray-500 block mt-1">Anteilig für Ihre Wohnung (§ 559a)</span></label>
              <div className="relative"><input type="number" value={drittmittel} onChange={zahl(setDrittmittel)} className={inputCls} min="0" step="500" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span></div>
            </div>
          )}
          <div>
            <label className="block mb-2"><span className="text-gray-700 font-medium">Modernisierungserhöhungen der letzten 6 Jahre</span><span className="text-xs text-gray-500 block mt-1">Je m² und Monat – verbrauchen die Kappungsgrenze</span></label>
            <div className="relative"><input type="number" value={fruehereErhoehung} onChange={zahl(setFruehereErhoehung)} className={inputCls} min="0" step="0.1" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/m²</span></div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-600 to-orange-700 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🔧 Zulässige Mieterhöhung durch die Modernisierung</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-5xl font-bold">{fmtEuro(ergebnis.erhoehungMonat)}</span>
            <span className="text-xl opacity-80">pro Monat (+{ergebnis.erhoehungProzent.toLocaleString('de-DE', { maximumFractionDigits: 1 })} %)</span>
          </div>
          <p className="text-amber-100 mt-2 text-sm">
            {ergebnis.gekappt
              ? `Rechnerisch wären ${fmtEuro(ergebnis.erhoehungMonatRoh)} (${ergebnis.erhoehungJeM2Roh.toLocaleString('de-DE', { maximumFractionDigits: 2 })} €/m²) – die Kappungsgrenze von ${ergebnis.kappungAnwendbar.toLocaleString('de-DE', { maximumFractionDigits: 2 })} €/m² in 6 Jahren begrenzt die Erhöhung.`
              : `${ergebnis.erhoehungJeM2.toLocaleString('de-DE', { maximumFractionDigits: 2 })} €/m² – unterhalb der Kappungsgrenze von ${ergebnis.kappungAnwendbar.toLocaleString('de-DE', { maximumFractionDigits: 2 })} €/m².`}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Neue Nettokaltmiete</span><div className="text-xl font-bold">{fmtEuro(ergebnis.neueMiete)}</div><span className="text-xs opacity-70">{(ergebnis.neueMiete / Math.max(1, wohnflaeche)).toLocaleString('de-DE', { maximumFractionDigits: 2 })} €/m²</span></div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Mehrkosten pro Jahr</span><div className="text-xl font-bold">{fmtEuroRund(ergebnis.erhoehungMonat * 12)}</div></div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Umlagefähige Kosten</span><div className="text-xl font-bold">{fmtEuroRund(ergebnis.umlagefaehig)}</div><span className="text-xs opacity-70">nach Abzug von {fmtEuroRund(ergebnis.erhaltungsanteil)} Erhaltung{drittmittel > 0 ? ` und ${fmtEuroRund(drittmittel)} Förderung` : ''}</span></div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Vermieter hat Kosten wieder drin nach</span><div className="text-xl font-bold">{ergebnis.amortisationJahre > 0 ? `${ergebnis.amortisationJahre.toLocaleString('de-DE', { maximumFractionDigits: 1 })} Jahren` : '–'}</div><span className="text-xs opacity-70">die Erhöhung bleibt danach dauerhaft</span></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Rechenweg nach § 559 {art === 'heizung' ? 'und § 559e ' : ''}BGB</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4"><span className="text-gray-600">Modernisierungskosten der Wohnung</span><span className="font-medium text-gray-800">{fmtEuroRund(kosten)}</span></div>
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4"><span className="text-gray-600">− Erhaltungsanteil {art === 'heizung' ? '(pauschal 15 %, § 559e Abs. 2)' : '(§ 559 Abs. 2)'}</span><span className="font-medium text-gray-800">− {fmtEuroRund(ergebnis.erhaltungsanteil)}</span></div>
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4"><span className="text-gray-600">− Zuschüsse / Drittmittel (§ 559a{art === 'heizung' ? ', § 559e Abs. 1' : ''})</span><span className="font-medium text-gray-800">− {fmtEuroRund(drittmittel)}</span></div>
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4"><span className="text-gray-600">= umlagefähig × {Math.round(ergebnis.satz * 100)} % ÷ 12 Monate</span><span className="font-medium text-gray-800">{fmtEuro(ergebnis.erhoehungMonatRoh)}/Monat</span></div>
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4"><span className="text-gray-600">Kappungsgrenze: {ergebnis.kappungJeM2} €/m² (Miete {ergebnis.mieteJeM2.toLocaleString('de-DE', { maximumFractionDigits: 2 })} €/m²){fruehereErhoehung > 0 ? ` − ${fruehereErhoehung.toLocaleString('de-DE')} €/m² bereits verbraucht` : ''}{art === 'heizung' ? ', für Heizung max. 0,50 €/m²' : ''}</span><span className="font-medium text-gray-800">{ergebnis.kappungAnwendbar.toLocaleString('de-DE', { maximumFractionDigits: 2 })} €/m² × {wohnflaeche} m² = {fmtEuro(ergebnis.kappungAnwendbar * Math.max(1, wohnflaeche))}</span></div>
          <div className="flex justify-between py-2 gap-4"><span className="text-gray-600">= zulässige Erhöhung (der kleinere Wert)</span><span className="font-bold text-amber-700">{fmtEuro(ergebnis.erhoehungMonat)}/Monat</span></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Was der Vermieter einhalten muss</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2"><span>•</span><span><strong>Ankündigung 3 Monate vorher</strong> in Textform mit Art, Umfang, Beginn, Dauer und voraussichtlicher Mieterhöhung (§ 555c BGB). Ohne oder mit unvollständiger Ankündigung verschiebt sich die Erhöhung um 6 Monate (§ 559b Abs. 2).</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Erhöhungserklärung nach Abschluss</strong> mit Berechnung und Erläuterung (§ 559b Abs. 1); die Erhöhung gilt ab dem dritten Monat nach Zugang. Übersteigt sie die Ankündigung um mehr als 10 %, gilt das Härtefall-Fenster erneut.</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Härteeinwand:</strong> Bis Ende des Monats nach Zugang der Ankündigung können Sie eine wirtschaftliche Härte geltend machen (§ 555d Abs. 3, § 559 Abs. 4) – Faustregel in der Praxis: Bruttowarmmiete über 40 % des Haushaltsnettoeinkommens.</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Sonderkündigungsrecht:</strong> Nach der Ankündigung außerordentlich zum Ende des übernächsten Monats (§ 555e), nach der Mieterhöhung ebenfalls (§ 561).</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Nur echte Modernisierung:</strong> Energetische Sanierung, Wasserersparnis, Gebrauchswerterhöhung, Wohnverhältnisverbesserung, neuer Wohnraum, Glasfaseranschluss (§ 555b). Reine Instandsetzung ist nie umlagefähig.</span></li>
        </ul>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-xs text-gray-500">
        <strong>Hinweis:</strong> Der Rechner setzt die vom Vermieter für Ihre Wohnung angegebenen Kosten an; die Verteilung der
        Gesamtkosten auf die Wohnungen und die Höhe des Erhaltungsanteils sind häufig Streitpunkte und können durch Schätzung
        ermittelt werden. Nicht berücksichtigt: zinsverbilligte öffentliche Darlehen (§ 559a Abs. 2), vereinfachtes Verfahren
        bis 10.000 € (§ 559c), Mietpreisbremse und Mietspiegel, preisgebundener Wohnraum, Indexmieten (keine Modernisierungs-
        umlage), Gewerberaum. Keine Rechtsberatung.
      </div>

      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a href="https://www.gesetze-im-internet.de/bgb/__559.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 559 BGB – Mieterhöhung nach Modernisierung: 8 %, Erhaltungsabzug, Kappungsgrenze 3 €/2 €/0,50 €, Härte</a>
          <a href="https://www.gesetze-im-internet.de/bgb/__559e.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 559e BGB – Mieterhöhung bei geförderter Heizungsmodernisierung: 10 %, 15 % Pauschale, 0,50 €/m²</a>
          <a href="https://www.gesetze-im-internet.de/bgb/__559a.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 559a BGB – Anrechnung von Drittmitteln und Zuschüssen</a>
          <a href="https://www.gesetze-im-internet.de/bgb/__555b.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 555b BGB – Was als Modernisierungsmaßnahme gilt</a>
          <a href="https://www.gesetze-im-internet.de/bgb/__559b.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 559b BGB – Erhöhungserklärung, Wirksamwerden, Folgen fehlerhafter Ankündigung</a>
        </div>
      </div>
    </div>
  );
}
