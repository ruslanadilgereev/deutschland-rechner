import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: 13. September 2026) ===
// Tarif 2026: § 32a Abs. 1 EStG in der Fassung des Gesetzes zur steuerlichen Freistellung des Existenzminimums 2026
// (Grundfreibetrag 12.348 €; 45 % ab 277.826 €).
// Tarif 2027 und 2028: Regierungsentwurf Einkommensteuerreformgesetz 2027 (BMF-Referentenentwurf 18.08.2026, Kabinettsbeschluss
// 02.09.2026; Bundestag/Bundesrat stehen aus) – Artikel 1 Nr. 4 (2027) und Artikel 2 Nr. 2 (2028), § 32a Abs. 1 EStG-E.
// Kindergeld: 2026 259 €, 2027 267 €, 2028 272 € (§ 66 EStG-E). Solidaritätszuschlag: Freigrenze 20.350 €/40.700 €,
// Milderungszone 11,9 % (§ 3, § 4 SolZG – im Entwurf unverändert).
type Tarif = { gfb: number; z1: number; z2: number; z3: number; z4: number; a1: number; a2: number; b2: number; c3: number; c4: number; c5?: number; s5?: number };
const TARIFE: Record<2026 | 2027 | 2028, Tarif> = {
  // zone1: (a1·y + 1400)·y ; zone2: (a2·z + 2397)·z + b2 ; zone3: 0,42x − c3 ; zone4: 0,45x − c4 ; zone5: 0,47x − c5
  2026: { gfb: 12348, z1: 17799, z2: 69878, z3: 277825, z4: Infinity, a1: 914.51, a2: 173.10, b2: 1034.87, c3: 11135.63, c4: 19470.38 },
  2027: { gfb: 12564, z1: 17799, z2: 70600, z3: 249999, z4: 279999, a1: 952.24, a2: 170.74, b2: 993.86, c3: 11241.73, c4: 18741.73, c5: 24341.73, s5: 0.47 },
  2028: { gfb: 12900, z1: 17799, z2: 70600, z3: 249999, z4: 279999, a1: 1017.55, a2: 170.74, b2: 930.08, c3: 11305.52, c4: 18805.52, c5: 24405.52, s5: 0.47 },
};
const KINDERGELD: Record<2026 | 2027 | 2028, number> = { 2026: 259, 2027: 267, 2028: 272 };
const SOLI_FREIGRENZE = 20350;
const SOLI_MILDERUNG = 0.119;

function est(zvE: number, t: Tarif): number {
  const x = Math.floor(zvE);
  if (x <= t.gfb) return 0;
  let s: number;
  if (x <= t.z1) { const y = (x - t.gfb) / 10000; s = (t.a1 * y + 1400) * y; }
  else if (x <= t.z2) { const z = (x - t.z1) / 10000; s = (t.a2 * z + 2397) * z + t.b2; }
  else if (x <= t.z3) s = 0.42 * x - t.c3;
  else if (x <= t.z4) s = 0.45 * x - t.c4;
  else s = (t.s5 ?? 0.45) * x - (t.c5 ?? t.c4);
  return Math.floor(s);
}
function steuer(zvE: number, jahr: 2026 | 2027 | 2028, splitting: boolean) {
  const t = TARIFE[jahr];
  const e = splitting ? 2 * est(zvE / 2, t) : est(zvE, t);
  const grenze = splitting ? 2 * SOLI_FREIGRENZE : SOLI_FREIGRENZE;
  const soli = e > grenze ? Math.min(0.055 * e, SOLI_MILDERUNG * (e - grenze)) : 0;
  return { est: e, soli: Math.round(soli * 100) / 100 };
}

const fmtEuro = (n: number, d = 0) => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: d, maximumFractionDigits: d });
const fmtPct = (n: number) => `${n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;

export default function Steuerreform2027Rechner() {
  const [zvE, setZvE] = useState(45000);
  const [splitting, setSplitting] = useState(false);
  const [kinder, setKinder] = useState(0);

  const e = useMemo(() => {
    const s26 = steuer(zvE, 2026, splitting), s27 = steuer(zvE, 2027, splitting), s28 = steuer(zvE, 2028, splitting);
    const g26 = s26.est + s26.soli, g27 = s27.est + s27.soli, g28 = s28.est + s28.soli;
    const kg27 = kinder * 12 * (KINDERGELD[2027] - KINDERGELD[2026]);
    const kg28 = kinder * 12 * (KINDERGELD[2028] - KINDERGELD[2026]);
    return { s26, s27, s28, g26, g27, g28, ersparnis27: g26 - g27 + kg27, ersparnis28: g26 - g28 + kg28, kg27, kg28, satz26: zvE > 0 ? (s26.est / zvE) * 100 : 0, satz27: zvE > 0 ? (s27.est / zvE) * 100 : 0 };
  }, [zvE, splitting, kinder]);

  const inputCls = 'w-full text-lg font-bold text-center py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none';
  const btn = (aktiv: boolean) => `py-2 px-3 rounded-xl font-medium transition-all text-sm ${aktiv ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`;
  const beispiele = splitting ? [30000, 50000, 80000, 120000, 200000, 400000, 600000] : [15000, 25000, 35000, 45000, 60000, 80000, 120000, 260000, 300000];
  const entlastet = e.ersparnis27 >= 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">Ihr zu versteuerndes Einkommen</h3>
        <p className="text-xs text-gray-500 mb-4">Jahresbetrag nach Werbungskosten, Sonderausgaben und Vorsorgeaufwendungen (Zeile „zu versteuerndes Einkommen" im Steuerbescheid)</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">zu versteuerndes Einkommen (Jahr)</label><div className="relative"><input type="number" value={zvE} onChange={(ev) => setZvE(Math.max(0, Number(ev.target.value) || 0))} className={inputCls} min="0" step="1000" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span></div></div>
          <div>
            <label className="block mb-1 text-sm text-gray-700 font-medium">Veranlagung</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setSplitting(false)} className={btn(!splitting)}>Einzeln (Grundtarif)</button>
              <button type="button" onClick={() => setSplitting(true)} className={btn(splitting)}>Ehepaar (Splitting)</button>
            </div>
          </div>
        </div>
        <label className="block mb-1 mt-4 text-sm text-gray-700 font-medium">Kinder mit Kindergeld</label>
        <div className="grid grid-cols-5 gap-2">
          {[0, 1, 2, 3, 4].map((k) => <button key={k} type="button" onClick={() => setKinder(k)} className={btn(kinder === k)}>{k === 4 ? '4+' : k}</button>)}
        </div>
      </div>

      <div className={`bg-gradient-to-br ${entlastet ? 'from-emerald-600 to-teal-700' : 'from-red-500 to-rose-700'} rounded-2xl shadow-lg p-6 text-white mb-6`}>
        <h3 className="text-sm font-medium opacity-80 mb-1">🏛️ Steuerreform 2027 (Regierungsentwurf)</h3>
        <div className="mb-4">
          <div className="text-4xl sm:text-5xl font-bold">{entlastet ? '+' : '−'}{fmtEuro(Math.abs(e.ersparnis27))}</div>
          <p className="mt-2 text-sm opacity-90">{entlastet ? 'weniger Steuer' : 'mehr Steuer'} im Jahr 2027 gegenüber 2026 ({fmtEuro(Math.abs(e.ersparnis27) / 12)} pro Monat){kinder > 0 && <> – davon {fmtEuro(e.kg27)} mehr Kindergeld für {kinder} {kinder === 1 ? 'Kind' : 'Kinder'}</>}. 2028: {e.ersparnis28 >= 0 ? '+' : '−'}{fmtEuro(Math.abs(e.ersparnis28))}.</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Steuer 2026</span><div className="text-xl font-bold">{fmtEuro(e.g26)}</div><span className="text-xs opacity-70">inkl. Soli {fmtEuro(e.s26.soli)}</span></div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Steuer 2027</span><div className="text-xl font-bold">{fmtEuro(e.g27)}</div><span className="text-xs opacity-70">inkl. Soli {fmtEuro(e.s27.soli)}</span></div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Steuer 2028</span><div className="text-xl font-bold">{fmtEuro(e.g28)}</div><span className="text-xs opacity-70">inkl. Soli {fmtEuro(e.s28.soli)}</span></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">🧮 Rechenweg</h3>
        <div className="text-sm text-gray-700 space-y-1 font-mono">
          <div>Tarif 2026: Grundfreibetrag 12.348 € → ESt {fmtEuro(e.s26.est)} (Ø-Satz {fmtPct(e.satz26)})</div>
          <div>Tarif 2027: Grundfreibetrag 12.564 €, 42 % ab 70.601 €, 45 % ab 250.000 €, 47 % ab 280.000 € → ESt {fmtEuro(e.s27.est)} (Ø-Satz {fmtPct(e.satz27)})</div>
          <div>Soli: 5,5 % der ESt, sofern ESt &gt; {fmtEuro(splitting ? 2 * SOLI_FREIGRENZE : SOLI_FREIGRENZE)} (Milderungszone 11,9 %)</div>
          {kinder > 0 && <div>Kindergeld: {kinder} × 12 × (267 − 259 €) = +{fmtEuro(e.kg27)} in 2027, {kinder} × 12 × (272 − 259 €) = +{fmtEuro(e.kg28)} in 2028</div>}
          {splitting && <div className="text-gray-500">Splitting: Steuer = 2 × Tarif(zvE ÷ 2)</div>}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">📊 Entlastung nach Einkommen ({splitting ? 'Splittingtarif' : 'Grundtarif'}, ohne Kindergeld)</h3>
        <p className="text-xs text-gray-500 mb-3">Einkommensteuer + Soli; negative Werte = Mehrbelastung durch den neuen 45-/47-%-Satz</p>
        <table className="w-full text-sm">
          <thead><tr className="border-b-2 border-gray-200"><th className="text-left py-2 font-semibold text-gray-700">zvE</th><th className="text-right py-2 font-semibold text-gray-700">2026</th><th className="text-right py-2 font-semibold text-gray-700">2027</th><th className="text-right py-2 font-semibold text-gray-700">Δ 2027</th><th className="text-right py-2 font-semibold text-gray-700">Δ 2028</th></tr></thead>
          <tbody>
            {beispiele.map((b) => { const a = steuer(b, 2026, splitting), c = steuer(b, 2027, splitting), d = steuer(b, 2028, splitting); const d27 = a.est + a.soli - c.est - c.soli, d28 = a.est + a.soli - d.est - d.soli; return (
              <tr key={b} className={`border-b border-gray-100 ${b === zvE ? 'bg-orange-50 font-bold text-orange-800' : 'text-gray-700'}`}>
                <td className="py-2">{fmtEuro(b)}</td><td className="py-2 text-right">{fmtEuro(a.est + a.soli)}</td><td className="py-2 text-right">{fmtEuro(c.est + c.soli)}</td>
                <td className={`py-2 text-right ${d27 >= 0 ? 'text-green-700' : 'text-red-700'}`}>{d27 >= 0 ? '+' : '−'}{fmtEuro(Math.abs(d27))}</td>
                <td className={`py-2 text-right ${d28 >= 0 ? 'text-green-700' : 'text-red-700'}`}>{d28 >= 0 ? '+' : '−'}{fmtEuro(Math.abs(d28))}</td>
              </tr>); })}
          </tbody>
        </table>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 text-sm text-amber-800">
        <strong>Entwurf, nicht Gesetz:</strong> Die Tarife 2027/2028 stammen aus dem Regierungsentwurf des Einkommensteuerreformgesetzes 2027 (Kabinett 2. September 2026). Bundestag und Bundesrat können Werte ändern; der Grundfreibetrag muss nach dem 16. Existenzminimumbericht (Herbst 2026) ohnehin mindestens das Existenzminimum abdecken. Weitere Entwurfsmaßnahmen (Arbeitnehmer-Pauschbetrag 1.430 €, Kinderfreibetrag 10.056 €, Handwerkerleistungen 15 %/900 €) wirken auf das zu versteuernde Einkommen bzw. die Steuerermäßigung und sind hier nicht enthalten.
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-xs text-gray-500">
        <strong>Hinweis:</strong> Vergleich der reinen Tarifwirkung (§ 32a EStG) bei gleichem zu versteuernden Einkommen; keine Steuerberatung. Nicht berücksichtigt: Kirchensteuer, Progressionsvorbehalt, Günstigerprüfung Kinderfreibetrag, Abgeltungsteuer auf Kapitalerträge, Änderungen bei Sozialabgaben (Beitragsbemessungsgrenzen, Zusatzbeitrag 2027).
      </div>

      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a href="https://www.bundesfinanzministerium.de/Content/DE/Gesetzestexte/Gesetze_Gesetzesvorhaben/Abteilungen/Abteilung_IV/21_Legislaturperiode/2026-08-18-EStReformG-2027/1-Referentenentwurf.pdf?__blob=publicationFile&v=2" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">BMF – Entwurf eines Einkommensteuerreformgesetzes 2027 (§ 32a EStG-E, § 66 EStG-E)</a>
          <a href="https://www.gesetze-im-internet.de/estg/__32a.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 32a EStG – Einkommensteuertarif (geltende Fassung 2026)</a>
          <a href="https://www.gesetze-im-internet.de/solzg_1995/__4.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 4 SolZG – Zuschlagsatz und Milderungszone</a>
        </div>
      </div>
    </div>
  );
}
