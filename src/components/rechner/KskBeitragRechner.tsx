import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: September 2026) ===

// Versicherte zahlen an die KSK jeweils die HÄLFTE der Beiträge – wie Arbeitnehmer:
// Rentenversicherung: Hälfte des Beitrags nach §§ 157 ff. SGB VI – § 15 KSVG
// Krankenversicherung: Hälfte des allgemeinen Beitragssatzes + hälftiger Zusatzbeitrag – § 16 Abs. 1 KSVG
// Pflegeversicherung: Hälfte des Beitrags nach § 55 SGB XI, Kinderlosenzuschlag/Kinderabschläge nach § 55 Abs. 3 – § 16a KSVG
const RV_SATZ = 0.186; // Beitragssatz allgemeine RV 2026 (unverändert)
const KV_ALLGEMEIN = 0.146; // § 241 SGB V
const KV_ERMAESSIGT = 0.140; // § 243 SGB V – ohne Krankengeldanspruch (§ 16 Abs. 1 S. 2 KSVG)
const PV_SATZ = 0.036; // § 55 Abs. 1 SGB XI i.V.m. Anpassungsverordnung (3,6 %)
const PV_KINDERLOS = 0.006; // Zuschlag für Kinderlose ab 23 – § 55 Abs. 3 SGB XI (trägt der Versicherte allein)
const PV_ABSCHLAG_JE_KIND = 0.0025; // Abschlag ab dem 2. bis 5. Kind unter 25 – § 55 Abs. 3 SGB XI

// Beitragsbemessungsgrenzen 2026: RV 8.450 €/Monat (101.400 €/Jahr), KV/PV 5.812,50 €/Monat – SVBezGrV 2026
const BBG_RV_MONAT = 8450;
const BBG_KV_MONAT = 5812.5;

// Versicherungsfrei bei voraussichtlichem Jahresarbeitseinkommen bis 3.900 € – § 3 Abs. 1 KSVG;
// gilt nicht in den ersten 3 Jahren nach Aufnahme der Tätigkeit (Berufsanfänger) – § 3 Abs. 2 KSVG
const MINDESTEINKOMMEN_JAHR = 3900;

// Finanzierung der anderen Hälfte: Bundeszuschuss 20 % und Künstlersozialabgabe der Verwerter (2026: 4,9 %) – § 14, § 26 KSVG
const KSA_2026 = 0.049;

const fmtEuro = (n: number) =>
  n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function KskBeitragRechner() {
  const [jahreseinkommen, setJahreseinkommen] = useState(24000);
  const [berufsanfaenger, setBerufsanfaenger] = useState(false);
  const [krankengeld, setKrankengeld] = useState(true);
  const [zusatzbeitrag, setZusatzbeitrag] = useState(2.9);
  const [kinder, setKinder] = useState(0);
  const [unter23, setUnter23] = useState(false);

  const ergebnis = useMemo(() => {
    const jahr = Math.max(0, jahreseinkommen);
    const versicherungsfrei = jahr <= MINDESTEINKOMMEN_JAHR && !berufsanfaenger;
    const monat = jahr / 12;

    // === 1. Bemessungsgrundlagen mit BBG ===
    const bemessungRV = Math.min(monat, BBG_RV_MONAT);
    const bemessungKV = Math.min(monat, BBG_KV_MONAT);

    // === 2. Hälftige Beiträge (§§ 15, 16, 16a KSVG) ===
    const rv = bemessungRV * RV_SATZ / 2;
    const kvSatz = (krankengeld ? KV_ALLGEMEIN : KV_ERMAESSIGT) + Math.max(0, zusatzbeitrag) / 100;
    const kv = bemessungKV * kvSatz / 2;
    // PV: hälftiger Grundbeitrag; Kinderlosenzuschlag voll vom Versicherten; Abschläge für 2.–5. Kind
    const kinderlos = kinder === 0 && !unter23;
    const abschlag = Math.min(4, Math.max(0, kinder - 1)) * PV_ABSCHLAG_JE_KIND;
    const pv = bemessungKV * (PV_SATZ / 2 + (kinderlos ? PV_KINDERLOS : 0) - abschlag);

    const gesamt = versicherungsfrei ? 0 : rv + kv + pv;
    const gesamtVoll = (bemessungRV * RV_SATZ) + (bemessungKV * kvSatz) + (bemessungKV * (PV_SATZ + (kinderlos ? PV_KINDERLOS : 0) - abschlag));

    return {
      versicherungsfrei, monat, bemessungRV, bemessungKV, rv, kv, kvSatz, pv, kinderlos, abschlag, gesamt,
      jahresbeitrag: gesamt * 12, anteilProzent: monat > 0 ? (gesamt / monat) * 100 : 0,
      ersparnisGegenueberFreiwillig: versicherungsfrei ? 0 : gesamtVoll - (rv + kv + pv),
      bbgGreift: monat > BBG_KV_MONAT,
    };
  }, [jahreseinkommen, berufsanfaenger, krankengeld, zusatzbeitrag, kinder, unter23]);

  const btn = (aktiv: boolean) =>
    `py-3 px-3 rounded-xl font-medium transition-all text-sm ${aktiv ? 'bg-fuchsia-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`;
  const inputCls = 'w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-fuchsia-500 focus:ring-0 outline-none';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Voraussichtliches Arbeitseinkommen aus künstlerischer/publizistischer Tätigkeit</span>
            <span className="text-xs text-gray-500 block mt-1">Jahresgewinn (Einnahmen minus Betriebsausgaben), wie Sie ihn der KSK melden – § 12 KSVG</span>
          </label>
          <div className="relative">
            <input type="number" value={jahreseinkommen} onChange={(e) => setJahreseinkommen(Math.max(0, Number(e.target.value) || 0))} className={inputCls} min="0" step="500" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€/Jahr</span>
          </div>
          <input type="range" value={jahreseinkommen} onChange={(e) => setJahreseinkommen(Number(e.target.value))} className="w-full mt-3 accent-fuchsia-600" min="0" max="120000" step="500" />
          <p className="text-xs text-gray-500 mt-1 text-center">= {fmtEuro(jahreseinkommen / 12)} im Monat</p>
        </div>

        <div className="space-y-3 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={berufsanfaenger} onChange={(e) => setBerufsanfaenger(e.target.checked)} className="w-5 h-5 mt-0.5 accent-fuchsia-600" />
            <span className="text-sm text-gray-700"><strong>Berufsanfänger</strong> – die Tätigkeit wurde vor weniger als 3 Jahren aufgenommen (dann gilt die Mindesteinkommensgrenze von 3.900 € nicht, § 3 Abs. 2 KSVG)</span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={krankengeld} onChange={(e) => setKrankengeld(e.target.checked)} className="w-5 h-5 mt-0.5 accent-fuchsia-600" />
            <span className="text-sm text-gray-700"><strong>Mit Krankengeldanspruch</strong> (Regelfall: allgemeiner Beitragssatz 14,6 %; ohne Anspruch, z. B. als Rentner, ermäßigt 14,0 %)</span>
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2"><span className="text-gray-700 font-medium">Zusatzbeitrag Ihrer Krankenkasse</span><span className="text-xs text-gray-500 block mt-1">Durchschnitt 2026: 2,9 % – kassenindividuell 1,5 bis 4,4 %</span></label>
            <div className="relative">
              <input type="number" value={zusatzbeitrag} onChange={(e) => setZusatzbeitrag(Math.max(0, Math.min(6, Number(e.target.value) || 0)))} className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-fuchsia-500 focus:ring-0 outline-none" min="0" max="6" step="0.1" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
          </div>
          <div>
            <span className="text-gray-700 font-medium block mb-2">Kinder unter 25 (für die Pflegeversicherung)</span>
            <div className="grid grid-cols-6 gap-2">
              {[0, 1, 2, 3, 4, 5].map((n) => (<button key={n} onClick={() => setKinder(n)} className={btn(kinder === n)}>{n === 5 ? '5+' : n}</button>))}
            </div>
            {kinder === 0 && (
              <label className="flex items-center gap-2 cursor-pointer mt-2 text-xs text-gray-600">
                <input type="checkbox" checked={unter23} onChange={(e) => setUnter23(e.target.checked)} className="w-4 h-4 accent-fuchsia-600" />
                Ich bin unter 23 (kein Kinderlosenzuschlag)
              </label>
            )}
          </div>
        </div>
      </div>

      {ergebnis.versicherungsfrei ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-amber-800 mb-2">Versicherungsfrei – kein KSK-Beitrag, aber auch kein Schutz</h3>
          <p className="text-sm text-amber-800">
            Mit einem voraussichtlichen Arbeitseinkommen bis 3.900 € im Jahr (325 € im Monat) sind Sie nach § 3 Abs. 1 KSVG versicherungsfrei
            und werden nicht über die Künstlersozialkasse versichert. Ausnahmen: In den ersten drei Jahren nach Aufnahme der Tätigkeit
            gilt die Grenze nicht (Berufsanfänger), und wer bereits versichert ist, darf die Grenze zweimal in sechs Jahren
            unterschreiten (§ 3 Abs. 3 KSVG).
          </p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-fuchsia-600 to-purple-700 rounded-2xl shadow-lg p-6 text-white mb-6">
          <h3 className="text-sm font-medium opacity-80 mb-1">🎨 Ihr monatlicher Beitrag an die Künstlersozialkasse</h3>
          <div className="mb-4">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-5xl font-bold">{fmtEuro(ergebnis.gesamt)}</span>
              <span className="text-xl opacity-80">= {ergebnis.anteilProzent.toLocaleString('de-DE', { maximumFractionDigits: 1 })} % des Einkommens</span>
            </div>
            <p className="text-fuchsia-100 mt-2 text-sm">
              Sie zahlen nur die Arbeitnehmer-Hälfte – die andere Hälfte tragen Bundeszuschuss (20 %) und die Künstlersozialabgabe der Verwerter (30 %, Abgabesatz 2026: 4,9 %).
              {ergebnis.bbgGreift && ' Ihr Einkommen liegt über der Beitragsbemessungsgrenze – gerechnet wird mit dem Höchstwert.'}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Rente (9,3 %)</span><div className="text-lg font-bold">{fmtEuro(ergebnis.rv)}</div></div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Kranken ({(ergebnis.kvSatz * 50).toLocaleString('de-DE', { maximumFractionDigits: 2 })} %)</span><div className="text-lg font-bold">{fmtEuro(ergebnis.kv)}</div></div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Pflege ({((PV_SATZ / 2 + (ergebnis.kinderlos ? PV_KINDERLOS : 0) - ergebnis.abschlag) * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })} %)</span><div className="text-lg font-bold">{fmtEuro(ergebnis.pv)}</div></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Beitrag pro Jahr</span><div className="text-xl font-bold">{fmtEuro(ergebnis.jahresbeitrag)}</div></div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Ersparnis gegenüber freiwilliger Versicherung ohne KSK</span><div className="text-xl font-bold">{fmtEuro(ergebnis.ersparnisGegenueberFreiwillig)}/Monat</div><span className="text-xs opacity-70">Selbständige ohne KSK zahlen alle Beiträge allein</span></div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Rechenweg</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4"><span className="text-gray-600">Monatliches Arbeitseinkommen (Jahr ÷ 12)</span><span className="font-medium text-gray-800">{fmtEuro(ergebnis.monat)}</span></div>
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4"><span className="text-gray-600">Rentenversicherung: {fmtEuro(ergebnis.bemessungRV)} × 18,6 % ÷ 2 (BBG 8.450 €)</span><span className="font-medium text-gray-800">{fmtEuro(ergebnis.rv)}</span></div>
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4"><span className="text-gray-600">Krankenversicherung: {fmtEuro(ergebnis.bemessungKV)} × ({krankengeld ? '14,6' : '14,0'} % + {zusatzbeitrag.toLocaleString('de-DE')} %) ÷ 2 (BBG 5.812,50 €)</span><span className="font-medium text-gray-800">{fmtEuro(ergebnis.kv)}</span></div>
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4"><span className="text-gray-600">Pflegeversicherung: {fmtEuro(ergebnis.bemessungKV)} × (3,6 % ÷ 2{ergebnis.kinderlos ? ' + 0,6 % Kinderlosenzuschlag' : ''}{ergebnis.abschlag > 0 ? ` − ${(ergebnis.abschlag * 100).toLocaleString('de-DE')} % Kinderabschlag` : ''})</span><span className="font-medium text-gray-800">{fmtEuro(ergebnis.pv)}</span></div>
          <div className="flex justify-between py-2 gap-4"><span className="text-gray-600">= Monatsbeitrag (fällig am 5. des Folgemonats)</span><span className="font-bold text-fuchsia-700">{fmtEuro(ergebnis.gesamt)}</span></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Aufnahme in die KSK – die Voraussetzungen</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2"><span>•</span><span><strong>Selbständig künstlerisch oder publizistisch tätig</strong> – erwerbsmäßig und nicht nur vorübergehend (§ 1 KSVG): Musik, darstellende und bildende Kunst, Wort (Journalismus, Schriftstellerei, Übersetzung), auch Design, Fotografie, Webdesign mit gestalterischem Schwerpunkt.</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Höchstens ein Arbeitnehmer</strong> (außer Azubis oder Minijobber), sonst gilt man als Unternehmer (§ 1 Nr. 2 KSVG).</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Mehr als 3.900 € Jahresgewinn</strong> aus dieser Tätigkeit – außer in den ersten drei Jahren (§ 3 KSVG).</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Nicht vorrangig anders versichert:</strong> Wer daneben mehr als geringfügig angestellt ist oder überwiegend andere selbständige Einkünfte hat, ist in der Regel nicht KSK-pflichtig (§§ 4, 5 KSVG).</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Beiträge nur auf das gemeldete Einkommen:</strong> Die KSK prüft die Meldungen stichprobenartig gegen die Steuerbescheide (§ 12 KSVG). Wer zu niedrig meldet, riskiert Nachforderungen und Bußgeld – wer zu hoch meldet, zahlt unnötig viel.</span></li>
        </ul>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-xs text-gray-500">
        <strong>Hinweis:</strong> Der Rechner ermittelt die Beitragsanteile nach §§ 15, 16, 16a KSVG mit den Sätzen und Rechengrößen 2026.
        Nicht abgebildet: Beitragszuschuss für privat Krankenversicherte (§ 10 KSVG), Befreiung von der KV-Pflicht für Berufsanfänger
        oder Höherverdienende (§ 6 KSVG), Ruhen bei Zahlungsrückstand (§ 16 Abs. 2), Nebeneinkünfte, Rentenbezieher. Ob Ihre
        Tätigkeit künstlerisch oder publizistisch im Sinne des KSVG ist, entscheidet die Künstlersozialkasse im Aufnahmeverfahren.
        Keine Rechtsberatung.
      </div>

      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a href="https://www.gesetze-im-internet.de/ksvg/__15.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 15 KSVG – Beitragsanteil zur Rentenversicherung (Hälfte)</a>
          <a href="https://www.gesetze-im-internet.de/ksvg/__16.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 16 KSVG – Beitragsanteil zur Krankenversicherung (Hälfte + hälftiger Zusatzbeitrag, ermäßigter Satz ohne Krankengeld)</a>
          <a href="https://www.gesetze-im-internet.de/ksvg/__16a.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 16a KSVG – Beitragsanteil zur Pflegeversicherung</a>
          <a href="https://www.gesetze-im-internet.de/ksvg/__3.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 3 KSVG – Versicherungsfreiheit bis 3.900 €, Berufsanfänger, Unterschreitung</a>
          <a href="https://www.gesetze-im-internet.de/svbezgrv_2026/BJNR1160A0025.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">SV-Rechengrößen-Verordnung 2026 – Beitragsbemessungsgrenzen</a>
          <a href="https://www.kuenstlersozialkasse.de/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">Künstlersozialkasse – Abgabesatz 2026 (4,9 %) und Aufnahmeverfahren</a>
        </div>
      </div>
    </div>
  );
}
