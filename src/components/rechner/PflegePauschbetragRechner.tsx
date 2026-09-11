import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: September 2026) ===

// Pflege-Pauschbetrag nach Pflegegrad der gepflegten Person – § 33b Abs. 6 Satz 3 EStG
// PG 2: 600 €, PG 3: 1.100 €, PG 4/5 oder hilflos (Merkzeichen H): 1.800 €
const PAUSCHBETRAG: Record<2 | 3 | 4 | 5, number> = { 2: 600, 3: 1100, 4: 1800, 5: 1800 };

// Einkommensteuertarif 2026 – § 32a Abs. 1 EStG (identisch zum Einkommensteuer-Rechner)
const GRUNDFREIBETRAG = 12348;
const ZONE1 = 17799;
const ZONE2 = 69878;
const ZONE3 = 277825;
function einkommensteuer(zvE: number, splitting: boolean): number {
  const x = Math.floor(Math.max(0, zvE) / (splitting ? 2 : 1));
  let st = 0;
  if (x <= GRUNDFREIBETRAG) st = 0;
  else if (x <= ZONE1) { const y = (x - GRUNDFREIBETRAG) / 10000; st = (914.51 * y + 1400) * y; }
  else if (x <= ZONE2) { const z = (x - ZONE1) / 10000; st = (173.10 * z + 2397) * z + 1034.87; }
  else if (x <= ZONE3) st = 0.42 * x - 11135.63;
  else st = 0.45 * x - 19470.38;
  return Math.floor(st) * (splitting ? 2 : 1);
}

// Solidaritätszuschlag 2026: Freigrenze 20.350 € / 40.700 €, Milderungszone 11,9 % – § 3, § 4 SolzG
function soli(est: number, splitting: boolean): number {
  const freigrenze = splitting ? 40700 : 20350;
  if (est <= freigrenze) return 0;
  return Math.round(Math.min(0.055 * est, 0.119 * (est - freigrenze)) * 100) / 100;
}

// Zumutbare Belastung – § 33 Abs. 3 EStG, stufenweise (BFH VI R 75/14)
const STUFE1 = 15340;
const STUFE2 = 51130;
function zumutbareBelastung(gde: number, kinder: number, splitting: boolean): number {
  const s: [number, number, number] = kinder >= 3 ? [0.01, 0.01, 0.02] : kinder >= 1 ? [0.02, 0.03, 0.04] : splitting ? [0.04, 0.05, 0.06] : [0.05, 0.06, 0.07];
  const g = Math.max(0, gde);
  let zb = Math.min(g, STUFE1) * s[0];
  if (g > STUFE1) zb += (Math.min(g, STUFE2) - STUFE1) * s[1];
  if (g > STUFE2) zb += (g - STUFE2) * s[2];
  return Math.floor(zb);
}

const fmtEuro = (n: number) =>
  n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtEuro2 = (n: number) =>
  n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function PflegePauschbetragRechner() {
  const [pflegegrad, setPflegegrad] = useState<2 | 3 | 4 | 5>(3);
  const [hilflos, setHilflos] = useState(false);
  const [pflegepersonen, setPflegepersonen] = useState(1);
  const [zvE, setZvE] = useState(45000);
  const [splitting, setSplitting] = useState(false);
  const [kirchensteuer, setKirchensteuer] = useState<0 | 0.08 | 0.09>(0);
  const [kinder, setKinder] = useState(0);
  const [einnahmen, setEinnahmen] = useState(false);
  const [tatsaechlicheKosten, setTatsaechlicheKosten] = useState(0);

  const ergebnis = useMemo(() => {
    // === 1. Pauschbetrag (§ 33b Abs. 6 S. 3–4, 9) ===
    const voll = hilflos ? 1800 : PAUSCHBETRAG[pflegegrad];
    const anteil = voll / Math.max(1, pflegepersonen);

    // === 2. Steuerersparnis: Differenz der Steuer mit und ohne Abzug ===
    const estOhne = einkommensteuer(zvE, splitting);
    const estMit = einkommensteuer(zvE - anteil, splitting);
    const soliOhne = soli(estOhne, splitting);
    const soliMit = soli(estMit, splitting);
    const kistOhne = estOhne * kirchensteuer;
    const kistMit = estMit * kirchensteuer;
    const ersparnis = einnahmen ? 0 : (estOhne - estMit) + (soliOhne - soliMit) + (kistOhne - kistMit);
    const grenzsatz = anteil > 0 ? ((estOhne - estMit) / anteil) * 100 : 0;

    // === 3. Alternative: tatsächliche Kosten nach § 33 abzüglich zumutbarer Belastung ===
    const zb = zumutbareBelastung(zvE, kinder, splitting);
    const abzug33 = Math.max(0, tatsaechlicheKosten - zb);
    const estMit33 = einkommensteuer(zvE - abzug33, splitting);
    const ersparnis33 = einnahmen ? 0 : (estOhne - estMit33) + (soliOhne - soli(estMit33, splitting)) + (kistOhne - estMit33 * kirchensteuer);

    return { voll, anteil, estOhne, estMit, ersparnis, grenzsatz, zb, abzug33, ersparnis33, besser33: tatsaechlicheKosten > 0 && ersparnis33 > ersparnis };
  }, [pflegegrad, hilflos, pflegepersonen, zvE, splitting, kirchensteuer, kinder, einnahmen, tatsaechlicheKosten]);

  const btn = (aktiv: boolean) =>
    `py-3 px-3 rounded-xl font-medium transition-all text-sm ${aktiv ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`;
  const inputCls = 'w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-0 outline-none';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="mb-6">
          <span className="text-gray-700 font-medium block mb-2">Pflegegrad der gepflegten Person</span>
          <div className="grid grid-cols-4 gap-2">
            {([2, 3, 4, 5] as const).map((pg) => (
              <button key={pg} onClick={() => setPflegegrad(pg)} className={btn(pflegegrad === pg && !hilflos)}>PG {pg}<span className="block text-xs font-normal">{fmtEuro(PAUSCHBETRAG[pg])}</span></button>
            ))}
          </div>
          <label className="flex items-start gap-3 cursor-pointer mt-3">
            <input type="checkbox" checked={hilflos} onChange={(e) => setHilflos(e.target.checked)} className="w-5 h-5 mt-0.5 accent-rose-500" />
            <span className="text-sm text-gray-700">Die Person ist <strong>hilflos</strong> (Merkzeichen H im Schwerbehindertenausweis) – dann 1.800 € unabhängig vom Pflegegrad (§ 33b Abs. 6 Satz 4)</span>
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <span className="text-gray-700 font-medium block mb-2">Wie viele Personen pflegen und machen den Pauschbetrag geltend?</span>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((n) => (
                <button key={n} onClick={() => setPflegepersonen(n)} className={btn(pflegepersonen === n)}>{n}</button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Der Pauschbetrag wird durch die Zahl der Pflegepersonen geteilt (§ 33b Abs. 6 Satz 9)</p>
          </div>
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={einnahmen} onChange={(e) => setEinnahmen(e.target.checked)} className="w-5 h-5 mt-0.5 accent-rose-500" />
              <span className="text-sm text-gray-700">Ich erhalte für die Pflege <strong>Einnahmen</strong> (z. B. weitergeleitetes Pflegegeld, das ich behalte) – dann kein Pauschbetrag</span>
            </label>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Ihr zu versteuerndes Einkommen</span>
              <span className="text-xs text-gray-500 block mt-1">Jahresbetrag laut Steuerbescheid (ohne Pauschbetrag)</span>
            </label>
            <div className="relative">
              <input type="number" value={zvE} onChange={(e) => setZvE(Math.max(0, Number(e.target.value) || 0))} className={inputCls} min="0" step="1000" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
            <input type="range" value={zvE} onChange={(e) => setZvE(Number(e.target.value))} className="w-full mt-2 accent-rose-500" min="10000" max="150000" step="1000" />
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-gray-700 font-medium block mb-2">Veranlagung</span>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setSplitting(false)} className={btn(!splitting)}>Einzeln</button>
                <button onClick={() => setSplitting(true)} className={btn(splitting)}>Zusammen (Splitting)</button>
              </div>
            </div>
            <div>
              <span className="text-gray-700 font-medium block mb-2">Kirchensteuer</span>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setKirchensteuer(0)} className={btn(kirchensteuer === 0)}>keine</button>
                <button onClick={() => setKirchensteuer(0.08)} className={btn(kirchensteuer === 0.08)}>8 %</button>
                <button onClick={() => setKirchensteuer(0.09)} className={btn(kirchensteuer === 0.09)}>9 %</button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <span className="text-gray-700 font-medium block mb-1">Alternative prüfen: tatsächliche Pflegekosten nach § 33 EStG</span>
          <span className="text-xs text-gray-500 block mb-3">Statt des Pauschbetrags können Sie nachgewiesene Kosten (Fahrten, Pflegehilfsmittel, Pflegedienst-Zuzahlungen) absetzen – abzüglich der zumutbaren Belastung</span>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="relative">
              <input type="number" value={tatsaechlicheKosten} onChange={(e) => setTatsaechlicheKosten(Math.max(0, Number(e.target.value) || 0))} className={inputCls} min="0" step="100" placeholder="0" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Jahr</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">Ihre Kinder (für die zumutbare Belastung)</span>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((n) => (
                  <button key={n} onClick={() => setKinder(n)} className={btn(kinder === n)}>{n === 3 ? '3+' : n}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      {einnahmen ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-amber-800 mb-2">Kein Pflege-Pauschbetrag</h3>
          <p className="text-sm text-amber-800">
            Der Pauschbetrag setzt voraus, dass Sie für die Pflege im Kalenderjahr keine Einnahmen erhalten (§ 33b Abs. 6 Satz 1 EStG).
            Pflegegeld, das die gepflegte Person an Sie weiterleitet, ist eine solche Einnahme – außer Sie verwenden es nachweislich
            vollständig für die Pflege (Pflegehilfsmittel, Fahrtkosten) und nicht für sich selbst. Ausnahme: Pflegegeld, das Eltern für
            ihr behindertes Kind erhalten, ist unschädlich (Satz 2).
          </p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white mb-6">
          <h3 className="text-sm font-medium opacity-80 mb-1">💶 Ihre Steuerersparnis durch den Pflege-Pauschbetrag</h3>
          <div className="mb-4">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-5xl font-bold">{fmtEuro2(ergebnis.ersparnis)}</span>
              <span className="text-xl opacity-80">pro Jahr</span>
            </div>
            <p className="text-rose-100 mt-2 text-sm">
              Pauschbetrag {fmtEuro(ergebnis.anteil)}{pflegepersonen > 1 ? ` (${fmtEuro(ergebnis.voll)} ÷ ${pflegepersonen} Pflegepersonen)` : ''} mindert Ihr
              zu versteuerndes Einkommen – bei einem Grenzsteuersatz von rund {ergebnis.grenzsatz.toLocaleString('de-DE', { maximumFractionDigits: 1 })} %
              {kirchensteuer > 0 ? ' inkl. Kirchensteuer' : ''}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">Einkommensteuer ohne Pauschbetrag</span>
              <div className="text-xl font-bold">{fmtEuro(ergebnis.estOhne)}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">Einkommensteuer mit Pauschbetrag</span>
              <div className="text-xl font-bold">{fmtEuro(ergebnis.estMit)}</div>
            </div>
          </div>
          {tatsaechlicheKosten > 0 && (
            <div className={`rounded-xl p-4 mt-3 text-sm ${ergebnis.besser33 ? 'bg-amber-400/20 border border-amber-200/40' : 'bg-white/10'}`}>
              {ergebnis.besser33
                ? <>💡 <strong>Tatsächliche Kosten lohnen sich mehr:</strong> {fmtEuro(tatsaechlicheKosten)} abzüglich zumutbarer Belastung {fmtEuro(ergebnis.zb)} = {fmtEuro(ergebnis.abzug33)} abziehbar → Ersparnis {fmtEuro2(ergebnis.ersparnis33)} statt {fmtEuro2(ergebnis.ersparnis)}. Belege aufheben!</>
                : <>Der Pauschbetrag ist günstiger: Von {fmtEuro(tatsaechlicheKosten)} Kosten blieben nach Abzug der zumutbaren Belastung ({fmtEuro(ergebnis.zb)}) nur {fmtEuro(ergebnis.abzug33)} übrig – Ersparnis {fmtEuro2(ergebnis.ersparnis33)}.</>}
            </div>
          )}
        </div>
      )}

      {/* Tabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">📋 Pflege-Pauschbetrag nach § 33b Abs. 6 EStG</h3>
        <p className="text-xs text-gray-500 mb-4">Jahresbeträge; Ersparnis bei Ihrem zu versteuernden Einkommen von {fmtEuro(zvE)} ({splitting ? 'Splitting' : 'Grundtarif'})</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-2 font-semibold text-gray-700">Pflegegrad</th>
              <th className="text-right py-2 font-semibold text-gray-700">Pauschbetrag</th>
              <th className="text-right py-2 font-semibold text-gray-700">Ersparnis (ESt + Soli)</th>
            </tr>
          </thead>
          <tbody>
            {([['Pflegegrad 2', 600], ['Pflegegrad 3', 1100], ['Pflegegrad 4, 5 oder hilflos', 1800]] as [string, number][]).map(([l, b]) => {
              const e = einkommensteuer(zvE, splitting) - einkommensteuer(zvE - b, splitting);
              const s = soli(einkommensteuer(zvE, splitting), splitting) - soli(einkommensteuer(zvE - b, splitting), splitting);
              const aktiv = b === ergebnis.voll;
              return (
                <tr key={l} className={`border-b border-gray-100 ${aktiv ? 'bg-rose-50 font-bold text-rose-800' : 'text-gray-700'}`}>
                  <td className="py-2">{l}</td><td className="py-2 text-right">{fmtEuro(b)}</td><td className="py-2 text-right">{fmtEuro2(e + s)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="text-xs text-gray-500 mt-3">Bis 2020 gab es nur 924 € bei Hilflosigkeit; seit dem Veranlagungszeitraum 2021 gelten die nach Pflegegrad gestaffelten Beträge (Behinderten-Pauschbetragsgesetz).</p>
      </div>

      {/* Hinweise */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Voraussetzungen im Überblick</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2"><span>•</span><span><strong>Persönliche Pflege</strong> in Ihrer oder der Wohnung der gepflegten Person (EU/EWR) – ein Mindestumfang ist nicht vorgeschrieben, die Pflege darf aber nicht nur gelegentlich sein. Ein Pflegedienst daneben ist unschädlich.</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Keine Einnahmen</strong> für die Pflege. Weitergeleitetes Pflegegeld nur, wenn Sie es treuhänderisch für die Pflege verwenden.</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Steuer-ID der gepflegten Person</strong> muss in der Steuererklärung angegeben werden (Satz 8) – Anlage Außergewöhnliche Belastungen.</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Jahresbetrag, keine Zwölftelung:</strong> Auch wer erst im Dezember mit der Pflege beginnt, bekommt den vollen Betrag. Bei Änderung des Pflegegrads im Jahr zählt der höchste (Satz 5).</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Mehrere Pflegebedürftige:</strong> Wer zwei Personen pflegt, bekommt den Pauschbetrag zweimal – je nach Pflegegrad der jeweiligen Person.</span></li>
        </ul>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-xs text-gray-500">
        <strong>Hinweis:</strong> Die Ersparnis wird als Steuerdifferenz nach dem Tarif 2026 (§ 32a EStG) inklusive Solidaritätszuschlag
        und optional Kirchensteuer berechnet; Progressionsvorbehalt, Ermäßigungen und Sonderfälle bleiben außen vor. Für die
        zumutbare Belastung wird das zu versteuernde Einkommen als Gesamtbetrag der Einkünfte angesetzt. Keine Steuerberatung.
      </div>

      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a href="https://www.gesetze-im-internet.de/estg/__33b.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 33b Abs. 6 EStG – Pflege-Pauschbetrag (600 / 1.100 / 1.800 €), Voraussetzungen, Aufteilung</a>
          <a href="https://www.gesetze-im-internet.de/estg/__33.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 33 EStG – Außergewöhnliche Belastungen, zumutbare Belastung (Abs. 3)</a>
          <a href="https://www.gesetze-im-internet.de/estg/__32a.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 32a EStG – Einkommensteuertarif 2026</a>
          <a href="https://www.gesetze-im-internet.de/solzg_1995/__4.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§§ 3, 4 SolzG – Solidaritätszuschlag, Freigrenze und Milderungszone</a>
        </div>
      </div>
    </div>
  );
}
