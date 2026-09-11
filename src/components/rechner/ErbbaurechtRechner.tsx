import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: September 2026) ===

// Grunderwerbsteuer-Sätze nach Bundesland (Stand 2026; Bremen seit 1.7.2025 5,5 %)
const BUNDESLAENDER = [
  { kuerzel: 'BW', name: 'Baden-Württemberg', satz: 5.0 },
  { kuerzel: 'BY', name: 'Bayern', satz: 3.5 },
  { kuerzel: 'BE', name: 'Berlin', satz: 6.0 },
  { kuerzel: 'BB', name: 'Brandenburg', satz: 6.5 },
  { kuerzel: 'HB', name: 'Bremen', satz: 5.5 },
  { kuerzel: 'HH', name: 'Hamburg', satz: 5.5 },
  { kuerzel: 'HE', name: 'Hessen', satz: 6.0 },
  { kuerzel: 'MV', name: 'Mecklenburg-Vorpommern', satz: 6.0 },
  { kuerzel: 'NI', name: 'Niedersachsen', satz: 5.0 },
  { kuerzel: 'NW', name: 'Nordrhein-Westfalen', satz: 6.5 },
  { kuerzel: 'RP', name: 'Rheinland-Pfalz', satz: 5.0 },
  { kuerzel: 'SL', name: 'Saarland', satz: 6.5 },
  { kuerzel: 'SN', name: 'Sachsen', satz: 5.5 },
  { kuerzel: 'ST', name: 'Sachsen-Anhalt', satz: 5.0 },
  { kuerzel: 'SH', name: 'Schleswig-Holstein', satz: 6.5 },
  { kuerzel: 'TH', name: 'Thüringen', satz: 5.0 },
];

// Anlage 9a BewG (zu § 13 Abs. 1): Kapitalwert einer auf n Jahre beschränkten Leistung, 5,5 % Zins, mittelschüssig.
// Bemessungsgrundlage der Grunderwerbsteuer beim Erbbaurecht ist der so kapitalisierte Erbbauzins
// (§ 2 Abs. 2 Nr. 1, § 8 Abs. 1, § 9 GrEStG). Index = Laufzeit − 1; über 101 Jahre: 18,6 (§ 13 Abs. 2 BewG).
const ANLAGE_9A = [0.974, 1.897, 2.772, 3.602, 4.388, 5.133, 5.839, 6.509, 7.143, 7.745, 8.315, 8.856, 9.368, 9.853, 10.314, 10.750, 11.163, 11.555, 11.927, 12.279, 12.613, 12.929, 13.229, 13.513, 13.783, 14.038, 14.280, 14.510, 14.727, 14.933, 15.129, 15.314, 15.490, 15.656, 15.814, 15.963, 16.105, 16.239, 16.367, 16.487, 16.602, 16.710, 16.813, 16.910, 17.003, 17.090, 17.173, 17.252, 17.326, 17.397, 17.464, 17.528, 17.588, 17.645, 17.699, 17.750, 17.799, 17.845, 17.888, 17.930, 17.969, 18.006, 18.041, 18.075, 18.106, 18.136, 18.165, 18.192, 18.217, 18.242, 18.264, 18.286, 18.307, 18.326, 18.345, 18.362, 18.379, 18.395, 18.410, 18.424, 18.437, 18.450, 18.462, 18.474, 18.485, 18.495, 18.505, 18.514, 18.523, 18.531, 18.539, 18.546, 18.553, 18.560, 18.566, 18.572, 18.578, 18.583, 18.589, 18.593, 18.598];
const vervielfaeltiger = (jahre: number) => (jahre > 101 ? 18.6 : ANLAGE_9A[Math.max(1, Math.round(jahre)) - 1]);

// Geschäftswert für Notar/Grundbuch: Kauf = Kaufpreis (§ 47 GNotKG), Erbbaurecht = 80 % des Grundstückswerts (§ 49 Abs. 2 GNotKG)
const ERBBAU_GESCHAEFTSWERT_ANTEIL = 0.8;

// § 9a Abs. 1 Satz 5 ErbbauRG: Erhöhung des Erbbauzinses bei Wohnzwecken frühestens nach 3 Jahren
const ANPASSUNG_MIN_JAHRE = 3;

const fmtEuro = (n: number) =>
  n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtPct = (n: number, d = 1) => n.toFixed(d).replace('.', ',') + ' %';

export default function ErbbaurechtRechner() {
  const [bodenwert, setBodenwert] = useState(250000);
  const [erbbauzinsSatz, setErbbauzinsSatz] = useState(3);
  const [laufzeit, setLaufzeit] = useState(99);
  const [anpassung, setAnpassung] = useState(2);
  const [anpassungsIntervall, setAnpassungsIntervall] = useState(3);
  const [zeitraum, setZeitraum] = useState(30);
  const [bundesland, setBundesland] = useState('BE');
  const [notarSatz, setNotarSatz] = useState(1.5);
  const [sollzins, setSollzins] = useState(3.5);
  const [wertsteigerung, setWertsteigerung] = useState(1.5);

  const ergebnis = useMemo(() => {
    const T = Math.max(1, Math.min(zeitraum, laufzeit));
    const grest = BUNDESLAENDER.find((b) => b.kuerzel === bundesland)?.satz ?? 6;
    const intervall = Math.max(ANPASSUNG_MIN_JAHRE, anpassungsIntervall);

    // === Erbbaurecht ===
    const zinsJahr1 = bodenwert * erbbauzinsSatz / 100;
    const faktor = vervielfaeltiger(laufzeit);
    const kapitalwert = zinsJahr1 * faktor;
    const grestErbbau = kapitalwert * grest / 100;
    const notarErbbau = bodenwert * ERBBAU_GESCHAEFTSWERT_ANTEIL * notarSatz / 100;
    // Erbbauzins wird alle `intervall` Jahre an die Preisentwicklung angepasst (§ 9a ErbbauRG: frühestens nach 3 Jahren)
    const zinsProJahr: number[] = [];
    let zins = zinsJahr1;
    for (let t = 0; t < T; t++) {
      if (t > 0 && t % intervall === 0) zins = zinsJahr1 * Math.pow(1 + anpassung / 100, t);
      zinsProJahr.push(zins);
    }
    const summeErbbauzins = zinsProJahr.reduce((s, z) => s + z, 0);
    const zinsLetztesJahr = zinsProJahr[T - 1];
    const kostenErbbau = summeErbbauzins + grestErbbau + notarErbbau;

    // === Kauf ===
    const grestKauf = bodenwert * grest / 100;
    const notarKauf = bodenwert * notarSatz / 100;
    const nebenkostenKauf = grestKauf + notarKauf;
    const kapital = bodenwert + nebenkostenKauf;
    const i = sollzins / 100;
    // Kapitalkosten: Das im Grundstück gebundene Kapital kostet jedes Jahr den Sollzins – als Darlehenszins
    // oder als entgangene Rendite auf Eigenkapital/Tilgung. So bleibt der Vergleich unabhängig von der Finanzierungsstruktur.
    const kapitalkostenJahr = kapital * i;
    const summeKapitalkosten = kapitalkostenJahr * T;
    // Annuität, die ein Volldarlehen genau im Betrachtungszeitraum tilgt (nur für die Monatsrate)
    const annuitaet = i > 0 ? kapital * i / (1 - Math.pow(1 + i, -T)) : kapital / T;
    const wertEnde = bodenwert * Math.pow(1 + wertsteigerung / 100, T);
    const wertzuwachs = wertEnde - bodenwert;
    const kostenKauf = nebenkostenKauf + summeKapitalkosten - wertzuwachs;

    // === Kumulierter Verlauf & Break-even ===
    let kumE = grestErbbau + notarErbbau;
    let kumK = nebenkostenKauf;
    let breakEven: number | null = null;
    const verlauf: { jahr: number; erbbau: number; kauf: number }[] = [];
    for (let t = 0; t < T; t++) {
      kumE += zinsProJahr[t];
      kumK += kapitalkostenJahr - bodenwert * (Math.pow(1 + wertsteigerung / 100, t + 1) - Math.pow(1 + wertsteigerung / 100, t));
      verlauf.push({ jahr: t + 1, erbbau: kumE, kauf: kumK });
      if (breakEven === null && kumK <= kumE) breakEven = t + 1;
    }

    const differenz = kostenErbbau - kostenKauf; // > 0: Kauf günstiger
    const monatlichErbbau = zinsJahr1 / 12;
    const monatlichKauf = annuitaet / 12;
    return { T, grest, intervall, zinsJahr1, faktor, kapitalwert, grestErbbau, notarErbbau, summeErbbauzins, zinsLetztesJahr, kostenErbbau, grestKauf, notarKauf, nebenkostenKauf, kapital, kapitalkostenJahr, summeKapitalkosten, annuitaet, wertEnde, wertzuwachs, kostenKauf, differenz, breakEven, verlauf, monatlichErbbau, monatlichKauf };
  }, [bodenwert, erbbauzinsSatz, laufzeit, anpassung, anpassungsIntervall, zeitraum, bundesland, notarSatz, sollzins, wertsteigerung]);

  const inputCls = 'w-full text-lg font-bold text-center py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none';
  const kaufGuenstiger = ergebnis.differenz > 0;
  const meilensteine = ergebnis.verlauf.filter((v) => v.jahr === 5 || v.jahr === 10 || v.jahr === 20 || v.jahr === 30 || v.jahr === ergebnis.T);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">1. Grundstück und Erbbaurecht</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Bodenwert / Kaufpreis des Grundstücks</label><div className="relative"><input type="number" value={bodenwert} onChange={(e) => setBodenwert(Math.max(0, Number(e.target.value) || 0))} className={inputCls} min="0" step="10000" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span></div></div>
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Erbbauzins (% des Bodenwerts pro Jahr)</label><div className="relative"><input type="number" value={erbbauzinsSatz} onChange={(e) => setErbbauzinsSatz(Math.max(0, Number(e.target.value) || 0))} className={inputCls} min="0" max="15" step="0.1" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span></div></div>
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Laufzeit des Erbbaurechts (Jahre)</label><input type="number" value={laufzeit} onChange={(e) => setLaufzeit(Math.max(1, Math.min(200, Number(e.target.value) || 1)))} className={inputCls} min="1" max="200" step="1" /></div>
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Betrachtungszeitraum (Jahre)</label><input type="number" value={zeitraum} onChange={(e) => setZeitraum(Math.max(1, Math.min(100, Number(e.target.value) || 1)))} className={inputCls} min="1" max="100" step="1" /></div>
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Anpassung des Erbbauzinses (% pro Jahr, z. B. Inflation)</label><div className="relative"><input type="number" value={anpassung} onChange={(e) => setAnpassung(Math.max(0, Number(e.target.value) || 0))} className={inputCls} min="0" max="10" step="0.1" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span></div></div>
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Anpassungsintervall (Jahre, mind. 3)</label><input type="number" value={anpassungsIntervall} onChange={(e) => setAnpassungsIntervall(Math.max(3, Math.min(30, Number(e.target.value) || 3)))} className={inputCls} min="3" max="30" step="1" /></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">2. Kauf-Alternative</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Bundesland (Grunderwerbsteuer)</label><select value={bundesland} onChange={(e) => setBundesland(e.target.value)} className={inputCls + ' bg-white'}>{BUNDESLAENDER.map((b) => <option key={b.kuerzel} value={b.kuerzel}>{b.name} ({fmtPct(b.satz)})</option>)}</select></div>
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Notar & Grundbuch (% des Geschäftswerts)</label><div className="relative"><input type="number" value={notarSatz} onChange={(e) => setNotarSatz(Math.max(0, Number(e.target.value) || 0))} className={inputCls} min="0" max="5" step="0.1" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span></div></div>
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Sollzins der Finanzierung / Alternativrendite</label><div className="relative"><input type="number" value={sollzins} onChange={(e) => setSollzins(Math.max(0, Number(e.target.value) || 0))} className={inputCls} min="0" max="15" step="0.1" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span></div></div>
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Wertentwicklung des Bodens (% pro Jahr)</label><div className="relative"><input type="number" value={wertsteigerung} onChange={(e) => setWertsteigerung(Number(e.target.value) || 0)} className={inputCls} min="-5" max="10" step="0.1" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span></div></div>
        </div>
      </div>

      <div className={`bg-gradient-to-br ${kaufGuenstiger ? 'from-emerald-600 to-teal-700' : 'from-amber-500 to-orange-600'} rounded-2xl shadow-lg p-6 text-white mb-6`}>
        <h3 className="text-sm font-medium opacity-80 mb-1">🏗️ Vergleich über {ergebnis.T} Jahre</h3>
        <div className="mb-4">
          <div className="text-4xl sm:text-5xl font-bold">{kaufGuenstiger ? 'Kauf' : 'Erbbaurecht'} günstiger</div>
          <p className="mt-2 text-sm opacity-90">
            Um {fmtEuro(Math.abs(ergebnis.differenz))} über {ergebnis.T} Jahre. Erbbaurecht kostet netto {fmtEuro(ergebnis.kostenErbbau)}, der Kauf {fmtEuro(ergebnis.kostenKauf)} (Nebenkosten + Kapitalkosten − Wertzuwachs des Grundstücks).
            {ergebnis.breakEven ? ` Der Kauf überholt das Erbbaurecht im Jahr ${ergebnis.breakEven}.` : ' Innerhalb des Zeitraums bleibt das Erbbaurecht günstiger.'}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Erbbauzins Jahr 1</span><div className="text-xl font-bold">{fmtEuro(ergebnis.monatlichErbbau)} / Monat</div><span className="text-xs opacity-70">{fmtEuro(ergebnis.zinsJahr1)} im Jahr</span></div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Kauf-Rate (Zins + Tilgung)</span><div className="text-xl font-bold">{fmtEuro(ergebnis.monatlichKauf)} / Monat</div><span className="text-xs opacity-70">{fmtEuro(ergebnis.kapital)} in {ergebnis.T} Jahren voll getilgt</span></div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-gray-800 mb-3">🧾 Erbbaurecht: {ergebnis.T} Jahre</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-2"><span className="text-gray-600">Erbbauzins Jahr 1 ({fmtPct(erbbauzinsSatz)} × {fmtEuro(bodenwert)})</span><span className="font-medium">{fmtEuro(ergebnis.zinsJahr1)}</span></div>
            <div className="flex justify-between gap-2"><span className="text-gray-600">Erbbauzins Jahr {ergebnis.T} (nach Anpassungen alle {ergebnis.intervall} Jahre)</span><span className="font-medium">{fmtEuro(ergebnis.zinsLetztesJahr)}</span></div>
            <div className="flex justify-between gap-2"><span className="text-gray-600">Summe Erbbauzins</span><span className="font-medium">{fmtEuro(ergebnis.summeErbbauzins)}</span></div>
            <div className="flex justify-between gap-2"><span className="text-gray-600">Grunderwerbsteuer {fmtPct(ergebnis.grest)} auf Kapitalwert {fmtEuro(ergebnis.kapitalwert)} (Faktor {ergebnis.faktor.toFixed(3).replace('.', ',')})</span><span className="font-medium">{fmtEuro(ergebnis.grestErbbau)}</span></div>
            <div className="flex justify-between gap-2"><span className="text-gray-600">Notar/Grundbuch (80 % Geschäftswert)</span><span className="font-medium">{fmtEuro(ergebnis.notarErbbau)}</span></div>
            <div className="flex justify-between gap-2 border-t border-gray-200 pt-2"><span className="font-semibold text-gray-800">Gesamtkosten</span><span className="font-bold text-amber-700">{fmtEuro(ergebnis.kostenErbbau)}</span></div>
            <div className="flex justify-between gap-2"><span className="text-gray-600">Grundstück am Ende</span><span className="font-medium text-gray-500">gehört dem Eigentümer</span></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-gray-800 mb-3">🏡 Kauf: {ergebnis.T} Jahre</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-2"><span className="text-gray-600">Grunderwerbsteuer {fmtPct(ergebnis.grest)}</span><span className="font-medium">{fmtEuro(ergebnis.grestKauf)}</span></div>
            <div className="flex justify-between gap-2"><span className="text-gray-600">Notar/Grundbuch {fmtPct(notarSatz)}</span><span className="font-medium">{fmtEuro(ergebnis.notarKauf)}</span></div>
            <div className="flex justify-between gap-2"><span className="text-gray-600">Kapitalkosten {fmtPct(sollzins)} auf {fmtEuro(ergebnis.kapital)} × {ergebnis.T} Jahre</span><span className="font-medium">{fmtEuro(ergebnis.summeKapitalkosten)}</span></div>
            <div className="flex justify-between gap-2"><span className="text-gray-600">− Wertzuwachs Boden ({fmtPct(wertsteigerung)} p. a. → {fmtEuro(ergebnis.wertEnde)})</span><span className="font-medium text-emerald-700">− {fmtEuro(ergebnis.wertzuwachs)}</span></div>
            <div className="flex justify-between gap-2 border-t border-gray-200 pt-2"><span className="font-semibold text-gray-800">Netto-Kosten (negativ = Vermögensgewinn)</span><span className="font-bold text-emerald-700">{fmtEuro(ergebnis.kostenKauf)}</span></div>
            <div className="flex justify-between gap-2"><span className="text-gray-600">Grundstück am Ende</span><span className="font-medium text-gray-500">Ihr Eigentum, schuldenfrei</span></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">📈 Kumulierte Kosten im Zeitverlauf</h3>
        <p className="text-xs text-gray-500 mb-4">Erbbaurecht: Nebenkosten + gezahlte Erbbauzinsen. Kauf: Nebenkosten + Kapitalkosten − Wertzuwachs (Tilgung ist Vermögensaufbau, keine Kosten).</p>
        <table className="w-full text-sm">
          <thead><tr className="border-b-2 border-gray-200"><th className="text-left py-2 font-semibold text-gray-700">Nach Jahr</th><th className="text-right py-2 font-semibold text-gray-700">Erbbaurecht</th><th className="text-right py-2 font-semibold text-gray-700">Kauf</th><th className="text-right py-2 font-semibold text-gray-700">Vorteil</th></tr></thead>
          <tbody>
            {meilensteine.map((v) => (
              <tr key={v.jahr} className="border-b border-gray-100 text-gray-700">
                <td className="py-2">{v.jahr}</td><td className="py-2 text-right">{fmtEuro(v.erbbau)}</td><td className="py-2 text-right">{fmtEuro(v.kauf)}</td>
                <td className={`py-2 text-right font-medium ${v.kauf <= v.erbbau ? 'text-emerald-700' : 'text-amber-700'}`}>{v.kauf <= v.erbbau ? 'Kauf' : 'Erbbau'} +{fmtEuro(Math.abs(v.erbbau - v.kauf))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-xs text-gray-500">
        <strong>Hinweis:</strong> Modellrechnung, keine Finanz- oder Rechtsberatung. Der Erbbauzins wird vereinfachend alle {ergebnis.intervall} Jahre
        an die eingegebene Preisentwicklung angepasst (Wertsicherungsklausel); tatsächliche Verträge koppeln meist an den Verbraucherpreisindex mit
        Schwellenwerten. Nicht berücksichtigt: Entschädigung für das Gebäude bei Ablauf (§ 27 ErbbauRG), Heimfall, Zustimmungsvorbehalte des
        Erbbaugebers bei Verkauf und Belastung, Steuereffekte, Kapitalbindung der Erbbau-Nebenkosten, Bankkonditionen für Erbbaurechte (oft schlechterer Beleihungswert), Grundsteuer
        (trägt beim Erbbaurecht in der Regel der Erbbauberechtigte) und der geringere Wiederverkaufswert eines Erbbaurechts mit kurzer Restlaufzeit.
      </div>

      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a href="https://www.gesetze-im-internet.de/erbbauv/__9a.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 9a ErbbauRG – Anpassung des Erbbauzinses bei Wohnzwecken (Billigkeit, frühestens nach 3 Jahren)</a>
          <a href="https://www.gesetze-im-internet.de/erbbauv/__27.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 27 ErbbauRG – Entschädigung bei Erlöschen durch Zeitablauf (mind. 2/3 bei Wohnbedürfnis)</a>
          <a href="https://www.gesetze-im-internet.de/erbbauv/__9.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 9 ErbbauRG – Erbbauzins als Reallast, Heimfall bei 2 Jahresbeträgen Rückstand</a>
          <a href="https://www.gesetze-im-internet.de/grestg_1983/__2.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 2 Abs. 2 Nr. 1 GrEStG – Erbbaurechte stehen Grundstücken gleich; § 8 Abs. 1 – Gegenleistung</a>
          <a href="https://www.gesetze-im-internet.de/bewg/anlage_9a.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">Anlage 9a BewG (zu § 13) – Kapitalwert zeitlich beschränkter Leistungen (Vervielfältiger)</a>
          <a href="https://www.gesetze-im-internet.de/gnotkg/__49.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 49 Abs. 2 GNotKG – Geschäftswert des Erbbaurechts: 80 % des Grundstückswerts</a>
        </div>
      </div>
    </div>
  );
}
