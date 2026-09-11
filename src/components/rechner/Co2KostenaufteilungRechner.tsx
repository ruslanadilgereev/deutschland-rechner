import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: September 2026) ===

// Stufenmodell für Wohngebäude: Aufteilung nach spezifischem CO2-Ausstoß in kg CO2 je m² Wohnfläche und Jahr
// Quelle: Anlage zu § 5 Abs. 2 CO2KostAufG – https://www.gesetze-im-internet.de/co2kostaufg/anlage.html
const STUFEN: { ab: number; mieter: number; vermieter: number }[] = [
  { ab: 0, mieter: 100, vermieter: 0 },
  { ab: 12, mieter: 90, vermieter: 10 },
  { ab: 17, mieter: 80, vermieter: 20 },
  { ab: 22, mieter: 70, vermieter: 30 },
  { ab: 27, mieter: 60, vermieter: 40 },
  { ab: 32, mieter: 50, vermieter: 50 },
  { ab: 37, mieter: 40, vermieter: 60 },
  { ab: 42, mieter: 30, vermieter: 70 },
  { ab: 47, mieter: 20, vermieter: 80 },
  { ab: 52, mieter: 5, vermieter: 95 },
];

// Nichtwohngebäude: hälftige Aufteilung – § 8 Abs. 1 CO2KostAufG (Stufenmodell noch nicht erlassen)
const NICHTWOHN_VERMIETER = 50;

// Maßgeblicher Zertifikatepreis 2026: Mittelwert des Preiskorridors 55–65 € = 60 €/t
// Quelle: § 4 Abs. 1 Nr. 2 CO2KostAufG i.V.m. § 10 Abs. 2 Satz 4 BEHG; Bekanntmachung DEHSt
const CO2_PREIS_2026 = 60; // €/t
const CO2_PREIS_2025 = 55; // €/t Festpreis (§ 10 Abs. 2 Satz 2 Nr. 5 BEHG)
const UMSATZSTEUER = 0.19; // auf den CO2-Kostenanteil fällt USt an (§ 3 Abs. 3 CO2KostAufG)

// Standard-Emissionsfaktoren (heizwertbezogen) nach Anlage 2 Teil 4 EBeV 2030
// Erdgas 0,0558 t/GJ = 0,20088 kg/kWh (Hi); Gasrechnungen weisen Brennwert-kWh aus:
// Umrechnungsfaktor 3,2508 GJ/MWh → 0,18139 kg/kWh (Hs)
// Heizöl EL 0,074 t/GJ, 42,8 GJ/t, 0,845 kg/l → 2,676 kg/l; Flüssiggas 0,0655 t/GJ, 46,0 GJ/t → 3,013 kg/kg
const BRENNSTOFFE = {
  erdgas: { label: 'Erdgas', einheit: 'kWh (Brennwert, wie auf der Rechnung)', faktor: 0.18139, standard: 15000 },
  heizoel: { label: 'Heizöl EL', einheit: 'Liter', faktor: 2.676, standard: 2000 },
  fluessiggas: { label: 'Flüssiggas', einheit: 'kg', faktor: 3.013, standard: 1500 },
} as const;
type Brennstoff = keyof typeof BRENNSTOFFE;

const fmtEuro = (n: number) =>
  n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtZahl = (n: number, d = 1) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: d });

export default function Co2KostenaufteilungRechner() {
  const [gebaeude, setGebaeude] = useState<'wohn' | 'nichtwohn'>('wohn');
  const [versorgung, setVersorgung] = useState<'zentral' | 'selbst'>('zentral');
  const [wohnflaeche, setWohnflaeche] = useState(80);
  const [abrechnungsmonate, setAbrechnungsmonate] = useState(12);

  const [quelle, setQuelle] = useState<'rechnung' | 'verbrauch'>('rechnung');
  const [co2Kg, setCo2Kg] = useState(2721); // 15.000 kWh Erdgas × 0,18139
  const [co2KostenRechnung, setCo2KostenRechnung] = useState(0);
  const [brennstoff, setBrennstoff] = useState<Brennstoff>('erdgas');
  const [verbrauch, setVerbrauch] = useState<number>(BRENNSTOFFE.erdgas.standard);
  const [preisJahr, setPreisJahr] = useState<2026 | 2025>(2026);

  const [einschraenkung, setEinschraenkung] = useState<'keine' | 'halb' | 'voll'>('keine');

  const ergebnis = useMemo(() => {
    const flaeche = Math.max(1, wohnflaeche);
    const monate = Math.min(12, Math.max(1, abrechnungsmonate));

    // === 1. CO2-Menge (aus Rechnung oder aus Verbrauch × Standardfaktor) ===
    const kg = quelle === 'rechnung' ? Math.max(0, co2Kg) : Math.max(0, verbrauch) * BRENNSTOFFE[brennstoff].faktor;

    // === 2. CO2-Kosten: aus Rechnung, sonst kg × Preis (€/t) × (1 + USt) – § 3 Abs. 3 ===
    const preis = preisJahr === 2026 ? CO2_PREIS_2026 : CO2_PREIS_2025;
    const kostenBerechnet = (kg / 1000) * preis * (1 + UMSATZSTEUER);
    const kosten = quelle === 'rechnung' && co2KostenRechnung > 0 ? co2KostenRechnung : kostenBerechnet;

    // === 3. Spezifischer Ausstoß, auf eine Nachkommastelle gerundet (§ 5 Abs. 1 Satz 3) ===
    const spezifisch = Math.round((kg / flaeche) * 10) / 10;

    // === 4. Einstufung; bei kürzerem Abrechnungszeitraum Stufenwerte anteilig kürzen (§ 5 Abs. 1 Satz 4) ===
    const faktorZeitraum = monate / 12;
    let stufe = STUFEN[0];
    let stufenIndex = 0;
    if (gebaeude === 'wohn') {
      for (let i = 0; i < STUFEN.length; i++) {
        if (spezifisch >= STUFEN[i].ab * faktorZeitraum) { stufe = STUFEN[i]; stufenIndex = i; }
      }
    }
    let vermieterProzent = gebaeude === 'wohn' ? stufe.vermieter : NICHTWOHN_VERMIETER;

    // === 5. Einschränkungen nach § 9: Vermieteranteil halbiert oder keine Aufteilung ===
    if (einschraenkung === 'halb') vermieterProzent = vermieterProzent / 2;
    if (einschraenkung === 'voll') vermieterProzent = 0;
    const mieterProzent = 100 - vermieterProzent;

    const vermieterAnteil = kosten * (vermieterProzent / 100);
    const mieterAnteil = kosten - vermieterAnteil;

    const naechsteStufe = gebaeude === 'wohn' && stufenIndex < STUFEN.length - 1 ? STUFEN[stufenIndex + 1] : null;
    const vorherigeStufe = gebaeude === 'wohn' && stufenIndex > 0 ? STUFEN[stufenIndex - 1] : null;

    return {
      kg, kosten, kostenBerechnet, preis, spezifisch, stufe, stufenIndex, faktorZeitraum,
      vermieterProzent, mieterProzent, vermieterAnteil, mieterAnteil, naechsteStufe, vorherigeStufe,
    };
  }, [gebaeude, wohnflaeche, abrechnungsmonate, quelle, co2Kg, co2KostenRechnung, brennstoff, verbrauch, preisJahr, einschraenkung]);

  const btn = (aktiv: boolean) =>
    `py-3 px-3 rounded-xl font-medium transition-all text-sm ${aktiv ? 'bg-lime-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`;
  const inputCls = 'w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-lime-600 focus:ring-0 outline-none';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <span className="text-gray-700 font-medium block mb-2">Gebäudeart</span>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setGebaeude('wohn')} className={btn(gebaeude === 'wohn')}>Wohngebäude</button>
              <button onClick={() => setGebaeude('nichtwohn')} className={btn(gebaeude === 'nichtwohn')}>Nichtwohngebäude</button>
            </div>
          </div>
          <div>
            <span className="text-gray-700 font-medium block mb-2">Wer rechnet die Wärme ab?</span>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setVersorgung('zentral')} className={btn(versorgung === 'zentral')}>Vermieter (Zentralheizung)</button>
              <button onClick={() => setVersorgung('selbst')} className={btn(versorgung === 'selbst')}>Ich selbst (eigener Gas-/Ölvertrag)</button>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">{versorgung === 'zentral' ? 'Wohnfläche des Gebäudes' : 'Wohnfläche Ihrer Wohnung'}</span>
              <span className="text-xs text-gray-500 block mt-1">{versorgung === 'zentral' ? 'Gesamtwohnfläche laut Heizkostenabrechnung' : 'Laut Mietvertrag'}</span>
            </label>
            <div className="relative">
              <input type="number" value={wohnflaeche} onChange={(e) => setWohnflaeche(Math.max(0, Number(e.target.value)))} className={inputCls} min="1" step="1" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
            </div>
          </div>
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Abrechnungszeitraum</span>
              <span className="text-xs text-gray-500 block mt-1">Bei weniger als 12 Monaten werden die Stufenwerte anteilig gekürzt</span>
            </label>
            <div className="relative">
              <input type="number" value={abrechnungsmonate} onChange={(e) => setAbrechnungsmonate(Math.max(1, Math.min(12, Math.round(Number(e.target.value)))))} className={inputCls} min="1" max="12" step="1" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Monate</span>
            </div>
          </div>
        </div>

        {/* Datenquelle */}
        <div className="mb-6">
          <span className="text-gray-700 font-medium block mb-2">Woher kommen die CO₂-Angaben?</span>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button onClick={() => setQuelle('rechnung')} className={btn(quelle === 'rechnung')}>Aus der Brennstoff-/Wärmerechnung</button>
            <button onClick={() => setQuelle('verbrauch')} className={btn(quelle === 'verbrauch')}>Aus dem Verbrauch schätzen</button>
          </div>

          {quelle === 'rechnung' ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">
                  <span className="text-gray-700 font-medium">CO₂-Emissionen laut Rechnung</span>
                  <span className="text-xs text-gray-500 block mt-1">Der Lieferant muss sie in kg ausweisen (§ 3 Abs. 1 Nr. 1)</span>
                </label>
                <div className="relative">
                  <input type="number" value={co2Kg} onChange={(e) => setCo2Kg(Math.max(0, Number(e.target.value)))} className={inputCls} min="0" step="1" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">kg CO₂</span>
                </div>
              </div>
              <div>
                <label className="block mb-2">
                  <span className="text-gray-700 font-medium">CO₂-Kosten laut Rechnung (optional)</span>
                  <span className="text-xs text-gray-500 block mt-1">Leer lassen: wird aus kg × {ergebnis.preis} €/t zzgl. USt berechnet</span>
                </label>
                <div className="relative">
                  <input type="number" value={co2KostenRechnung || ''} placeholder={fmtZahl(ergebnis.kostenBerechnet, 2)} onChange={(e) => setCo2KostenRechnung(Math.max(0, Number(e.target.value)))} className={inputCls} min="0" step="0.01" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-700 font-medium block mb-2">Brennstoff</span>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(BRENNSTOFFE) as Brennstoff[]).map((b) => (
                    <button key={b} onClick={() => { setBrennstoff(b); setVerbrauch(BRENNSTOFFE[b].standard); }} className={btn(brennstoff === b)}>{BRENNSTOFFE[b].label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block mb-2">
                  <span className="text-gray-700 font-medium">Jahresverbrauch</span>
                  <span className="text-xs text-gray-500 block mt-1">{BRENNSTOFFE[brennstoff].einheit}</span>
                </label>
                <input type="number" value={verbrauch} onChange={(e) => setVerbrauch(Math.max(0, Number(e.target.value)))} className={inputCls} min="0" step="100" />
              </div>
            </div>
          )}

          {(quelle === 'verbrauch' || co2KostenRechnung === 0) && (
            <div className="mt-4">
              <span className="text-gray-700 font-medium block mb-2">Lieferjahr (maßgeblicher CO₂-Preis)</span>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setPreisJahr(2026)} className={btn(preisJahr === 2026)}>2026: 60 €/t</button>
                <button onClick={() => setPreisJahr(2025)} className={btn(preisJahr === 2025)}>2025: 55 €/t</button>
              </div>
            </div>
          )}
        </div>

        {/* Einschränkungen § 9 */}
        <div>
          <span className="text-gray-700 font-medium block mb-1">Öffentlich-rechtliche Einschränkungen (§ 9 CO2KostAufG)</span>
          <span className="text-xs text-gray-500 block mb-2">Nur wenn der Vermieter sie nachweist: Denkmalschutz, Erhaltungssatzung, Anschluss- und Benutzungszwang für Fernwärme</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button onClick={() => setEinschraenkung('keine')} className={btn(einschraenkung === 'keine')}>Keine</button>
            <button onClick={() => setEinschraenkung('halb')} className={btn(einschraenkung === 'halb')}>Sanierung <em>oder</em> Heizungstausch gehindert (Anteil halbiert)</button>
            <button onClick={() => setEinschraenkung('voll')} className={btn(einschraenkung === 'voll')}>Beides gehindert (keine Aufteilung)</button>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-lime-600 to-green-700 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">
          🏠 {versorgung === 'selbst' ? 'Ihr Erstattungsanspruch gegen den Vermieter' : 'Anteil des Vermieters an den CO₂-Kosten'}
        </h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-5xl font-bold">{fmtEuro(ergebnis.vermieterAnteil)}</span>
            <span className="text-xl opacity-80">= {fmtZahl(ergebnis.vermieterProzent)} % von {fmtEuro(ergebnis.kosten)}</span>
          </div>
          <p className="text-lime-100 mt-2 text-sm">
            {gebaeude === 'wohn'
              ? `${fmtZahl(ergebnis.spezifisch)} kg CO₂ je m² und ${abrechnungsmonate === 12 ? 'Jahr' : `${abrechnungsmonate} Monate`} → Stufe ${ergebnis.stufenIndex + 1} von 10 (${fmtZahl(ergebnis.stufe.ab * ergebnis.faktorZeitraum)} bis ${ergebnis.naechsteStufe ? '< ' + fmtZahl(ergebnis.naechsteStufe.ab * ergebnis.faktorZeitraum) : '∞'} kg/m²)`
              : 'Nichtwohngebäude: hälftige Aufteilung nach § 8 Abs. 1 CO2KostAufG'}
            {einschraenkung !== 'keine' && ' – Vermieteranteil nach § 9 gekürzt'}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Mieteranteil ({fmtZahl(ergebnis.mieterProzent)} %)</span>
            <div className="text-xl font-bold">{fmtEuro(ergebnis.mieterAnteil)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">CO₂-Kosten gesamt (inkl. USt)</span>
            <div className="text-xl font-bold">{fmtEuro(ergebnis.kosten)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">CO₂-Menge</span>
            <div className="text-xl font-bold">{fmtZahl(ergebnis.kg, 0)} kg</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Spezifischer Ausstoß</span>
            <div className="text-xl font-bold">{fmtZahl(ergebnis.spezifisch)} kg/m²</div>
          </div>
        </div>
        {versorgung === 'selbst' && (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-sm mt-3">
            ⏱️ Fordern Sie den Betrag <strong>in Textform innerhalb von 12 Monaten</strong> nach der Abrechnung Ihres Lieferanten
            beim Vermieter ein (§ 6 Abs. 2 CO2KostAufG). Er darf mit der nächsten Betriebskostenabrechnung verrechnen, spätestens
            12 Monate nach Ihrer Anzeige muss das Geld da sein.
          </div>
        )}
      </div>

      {/* Stufentabelle */}
      {gebaeude === 'wohn' && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-1">📋 Das Stufenmodell (Anlage zu § 5 Abs. 2 CO2KostAufG)</h3>
          <p className="text-xs text-gray-500 mb-4">
            Ihr Gebäude: {fmtZahl(ergebnis.spezifisch)} kg CO₂/m²
            {ergebnis.naechsteStufe && ` – noch ${fmtZahl(ergebnis.naechsteStufe.ab * ergebnis.faktorZeitraum - ergebnis.spezifisch)} kg/m² bis zur nächsten Stufe (${ergebnis.naechsteStufe.vermieter} % Vermieter)`}
            {ergebnis.vorherigeStufe && `, ${fmtZahl(ergebnis.spezifisch - ergebnis.stufe.ab * ergebnis.faktorZeitraum)} kg/m² über der Stufengrenze`}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2 pr-2 font-semibold text-gray-700">kg CO₂ / m² / Jahr</th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-700">Mieter</th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-700">Vermieter</th>
                  <th className="text-right py-2 pl-2 font-semibold text-gray-700">Vermieter in €</th>
                </tr>
              </thead>
              <tbody>
                {STUFEN.map((s, i) => {
                  const next = STUFEN[i + 1];
                  const aktiv = i === ergebnis.stufenIndex;
                  return (
                    <tr key={s.ab} className={`border-b border-gray-100 ${aktiv ? 'bg-lime-50' : ''}`}>
                      <td className={`py-2 pr-2 ${aktiv ? 'font-bold text-lime-800' : 'text-gray-800'}`}>
                        {i === 0 ? `< ${next.ab}` : next ? `${s.ab} bis < ${next.ab}` : `≥ ${s.ab}`}
                        {abrechnungsmonate < 12 && <span className="block text-xs text-gray-400">gekürzt: {i === 0 ? `< ${fmtZahl(next.ab * ergebnis.faktorZeitraum)}` : `ab ${fmtZahl(s.ab * ergebnis.faktorZeitraum)}`}</span>}
                      </td>
                      <td className="py-2 px-2 text-right text-gray-700">{s.mieter} %</td>
                      <td className={`py-2 px-2 text-right ${aktiv ? 'font-bold text-lime-800' : 'text-gray-700'}`}>{s.vermieter} %</td>
                      <td className="py-2 pl-2 text-right text-gray-500">{fmtEuro(ergebnis.kosten * s.vermieter / 100)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rechenweg */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🧮 So wird gerechnet</h3>
        <div className="space-y-3 text-sm">
          {quelle === 'verbrauch' && (
            <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
              <span className="text-gray-600">{fmtZahl(verbrauch, 0)} {BRENNSTOFFE[brennstoff].einheit.split(' ')[0]} {BRENNSTOFFE[brennstoff].label} × {BRENNSTOFFE[brennstoff].faktor.toLocaleString('de-DE', { maximumFractionDigits: 5 })} kg CO₂ (EBeV 2030)</span>
              <span className="font-medium text-gray-800 text-right">{fmtZahl(ergebnis.kg, 0)} kg</span>
            </div>
          )}
          {(quelle === 'verbrauch' || co2KostenRechnung === 0) && (
            <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
              <span className="text-gray-600">{fmtZahl(ergebnis.kg / 1000, 3)} t × {ergebnis.preis} €/t × 1,19 (USt) = CO₂-Kosten</span>
              <span className="font-medium text-gray-800 text-right">{fmtEuro(ergebnis.kosten)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
            <span className="text-gray-600">{fmtZahl(ergebnis.kg, 0)} kg ÷ {fmtZahl(wohnflaeche, 0)} m² (gerundet auf 0,1)</span>
            <span className="font-medium text-gray-800 text-right">{fmtZahl(ergebnis.spezifisch)} kg/m²</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
            <span className="text-gray-600">{gebaeude === 'wohn' ? `Stufe ${ergebnis.stufenIndex + 1}: Vermieter ${ergebnis.stufe.vermieter} %` : 'Nichtwohngebäude: Vermieter 50 %'}{einschraenkung === 'halb' ? ', halbiert (§ 9 Abs. 1)' : einschraenkung === 'voll' ? ', keine Aufteilung (§ 9 Abs. 2)' : ''}</span>
            <span className="font-medium text-gray-800 text-right">{fmtZahl(ergebnis.vermieterProzent)} %</span>
          </div>
          <div className="flex justify-between py-2 gap-4">
            <span className="text-gray-600">{fmtEuro(ergebnis.kosten)} × {fmtZahl(ergebnis.vermieterProzent)} % = Vermieteranteil</span>
            <span className="font-bold text-lime-800 text-right">{fmtEuro(ergebnis.vermieterAnteil)}</span>
          </div>
        </div>
        {versorgung === 'zentral' && (
          <p className="text-xs text-gray-500 mt-4">
            Der Mieteranteil wird anschließend nach dem Verteilerschlüssel der Heizkostenabrechnung (§§ 6–10 HeizkostenV) auf die
            einzelnen Wohnungen verteilt. Weist der Vermieter Einstufung und Berechnungsgrundlagen nicht aus, dürfen Sie Ihren
            Heizkostenanteil um 3 % kürzen (§ 7 Abs. 4).
          </p>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-xs text-gray-500">
        <strong>Hinweis:</strong> Maßgeblich sind die auf der Brennstoff- oder Wärmerechnung ausgewiesenen Emissionen und
        CO₂-Kosten; die Verbrauchsschätzung nutzt die Standard-Emissionsfaktoren der EBeV 2030 und den maßgeblichen
        Zertifikatepreis (2026: 60 €/t, 2025: 55 €/t) zzgl. 19 % USt. Für Fernwärme gilt der vom Wärmelieferanten
        ausgewiesene Netz-Emissionsfaktor. Nicht abgebildet: Zweifamilienhaus mit selbstnutzendem Vermieter (§ 7 Abs. 2),
        Kürzung um 5 % bei gewerblicher Mitnutzung des Brennstoffs (§ 6 Abs. 3), die ab 2028/2029 geltende hälftige
        Aufteilung bei neuen Heizungsanlagen nach § 43 Gebäudemodernisierungsgesetz (§§ 5a, 5b). Keine Rechtsberatung.
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a href="https://www.gesetze-im-internet.de/co2kostaufg/anlage.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            Anlage zu § 5 Abs. 2 CO2KostAufG – Einstufungstabelle (10 Stufen)
          </a>
          <a href="https://www.gesetze-im-internet.de/co2kostaufg/__5.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 5 CO2KostAufG – Ermittlung des spezifischen CO₂-Ausstoßes, Rundung, kürzere Abrechnungszeiträume
          </a>
          <a href="https://www.gesetze-im-internet.de/co2kostaufg/__6.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 6 CO2KostAufG – Erstattungsanspruch bei eigener Versorgung (12-Monats-Frist)
          </a>
          <a href="https://www.gesetze-im-internet.de/co2kostaufg/__4.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 4 CO2KostAufG – Maßgeblicher Preis der Emissionszertifikate (2026: Mittelwert des Korridors)
          </a>
          <a href="https://www.dehst.de/DE/Themen/nEHS/Verkauf-Versteigerung/Kohlendioxidkostenaufteilungsgesetz/kohlendioxidkostenaufteilungsgesetz_node.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            DEHSt (Umweltbundesamt) – Maßgeblicher Zertifikatepreis 2026: 60 €
          </a>
          <a href="https://www.gesetze-im-internet.de/ebev_2030/anlage_2.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            Anlage 2 Teil 4 EBeV 2030 – Standardwerte für Emissionsfaktoren (Erdgas, Heizöl, Flüssiggas)
          </a>
          <a href="https://co2kostenaufteilung.bmwk.de/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            BMWK – Offizielles CO₂-Rechentool zur Kostenaufteilung
          </a>
        </div>
      </div>
    </div>
  );
}
