import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: September 2026) ===

// Einkommensgrenzen § 9 Abs. 2 WoFG: Einpersonenhaushalt 12.000 €, Zweipersonenhaushalt 18.000 €,
// je weitere Person 4.100 €, je Kind (§ 32 Abs. 1–5 EStG) zusätzlich 500 €
const GRENZE_1 = 12000;
const GRENZE_2 = 18000;
const JE_WEITERE_PERSON = 4100;
const JE_KIND = 500;

// Berlin: WBS-Stufen als Überschreitung der Bundesgrenze (Verordnung nach § 9 Abs. 3 WoFG, WFB 2023/2025):
// WBS 100 = Bundesgrenze, WBS 140 = +40 %, WBS 160 = +60 %, WBS 180 = +80 %, WBS 220 = +120 %
const STUFEN = [
  { name: 'WBS 100', faktor: 1.0, info: 'klassischer Sozialwohnungsbestand' },
  { name: 'WBS 140', faktor: 1.4, info: 'die meisten geförderten Wohnungen in Berlin' },
  { name: 'WBS 160', faktor: 1.6, info: 'Teil der Neubau-Förderung' },
  { name: 'WBS 180', faktor: 1.8, info: 'zweites Fördersegment im Neubau' },
  { name: 'WBS 220', faktor: 2.2, info: 'Neubau/Umbau mit öffentlichen Baudarlehen (seit 2025)' },
];

// Einkommensermittlung §§ 21–24 WoFG: Summe der positiven Einkünfte (Brutto − Werbungskosten),
// pauschaler Abzug je 10 % für Steuern, KV/PV-Pflichtbeiträge, RV-Pflichtbeiträge (§ 23)
const ARBEITNEHMER_PAUSCHBETRAG = 1230; // § 9a EStG
const PAUSCHALABZUG = 0.10;

// Freibeträge § 24 WoFG
const FREI_SCHWERBEHINDERT_100 = 4500; // GdB 100 oder ≥ 80 mit häuslicher Pflegebedürftigkeit
const FREI_SCHWERBEHINDERT_PFLEGE = 2100; // GdB < 80 mit häuslicher Pflegebedürftigkeit
const FREI_JUNGES_EHEPAAR = 4000; // beide unter 40, bis Ende des 5. Jahres nach Heirat
const FREI_ALLEINERZIEHEND_KIND = 600; // je Kind unter 12 bei Erwerbstätigkeit/Ausbildung
const FREI_KIND_EINKOMMEN = 600; // je Kind 16–24 mit eigenem Einkommen

interface Person { id: number; brutto: number; werbungskosten: number; steuern: boolean; kv: boolean; rv: boolean }

const fmtEuro = (n: number) =>
  n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function WbsRechner() {
  const [personen, setPersonen] = useState(2);
  const [kinder, setKinder] = useState(0);
  const [einkommen, setEinkommen] = useState<Person[]>([
    { id: 1, brutto: 32000, werbungskosten: ARBEITNEHMER_PAUSCHBETRAG, steuern: true, kv: true, rv: true },
    { id: 2, brutto: 0, werbungskosten: ARBEITNEHMER_PAUSCHBETRAG, steuern: true, kv: true, rv: true },
  ]);
  const [schwerbehindert100, setSchwerbehindert100] = useState(0);
  const [schwerbehindertPflege, setSchwerbehindertPflege] = useState(0);
  const [jungesEhepaar, setJungesEhepaar] = useState(false);
  const [alleinerziehendKinderU12, setAlleinerziehendKinderU12] = useState(0);
  const [kinderMitEinkommen, setKinderMitEinkommen] = useState(0);
  const [unterhalt, setUnterhalt] = useState(0);

  const ergebnis = useMemo(() => {
    const p = Math.max(1, personen);
    const k = Math.min(kinder, Math.max(0, p - 1));

    // === 1. Bundesgrenze § 9 Abs. 2 WoFG ===
    const grenze100 = (p === 1 ? GRENZE_1 : GRENZE_2 + Math.max(0, p - 2) * JE_WEITERE_PERSON) + k * JE_KIND;

    // === 2. Jahreseinkommen je Person (§§ 21, 23 WoFG) ===
    const details = einkommen.slice(0, Math.min(2, p)).map((e) => {
      const einkuenfte = Math.max(0, e.brutto - Math.max(0, e.werbungskosten));
      const abzuege = (e.steuern ? 1 : 0) + (e.kv ? 1 : 0) + (e.rv ? 1 : 0);
      const pauschal = einkuenfte * PAUSCHALABZUG * abzuege;
      return { ...e, einkuenfte, abzuege, pauschal, jahreseinkommen: einkuenfte - pauschal };
    });
    const summe = details.reduce((s, d) => s + d.jahreseinkommen, 0);

    // === 3. Freibeträge § 24 WoFG ===
    const freibetraege =
      schwerbehindert100 * FREI_SCHWERBEHINDERT_100 + schwerbehindertPflege * FREI_SCHWERBEHINDERT_PFLEGE
      + (jungesEhepaar ? FREI_JUNGES_EHEPAAR : 0) + alleinerziehendKinderU12 * FREI_ALLEINERZIEHEND_KIND
      + kinderMitEinkommen * FREI_KIND_EINKOMMEN + Math.max(0, unterhalt);
    const gesamteinkommen = Math.max(0, summe - freibetraege);

    // === 4. Einstufung ===
    const stufen = STUFEN.map((s) => { const grenze = Math.round(grenze100 * s.faktor); return { ...s, grenze, erfuellt: gesamteinkommen <= grenze }; });
    const niedrigste = stufen.find((s) => s.erfuellt) ?? null;
    const luft = niedrigste ? niedrigste.grenze - gesamteinkommen : gesamteinkommen - stufen[stufen.length - 1].grenze;

    // Wohnungsgröße (Berliner Praxis): ein Raum je Haushaltsmitglied; Einzelpersonen bis 2 Zimmer / 50 m²
    const raeume = p === 1 ? '1 bis 2 Zimmer (bis 50 m²)' : `${p} Zimmer`;

    return { p, k, grenze100, details, summe, freibetraege, gesamteinkommen, stufen, niedrigste, luft, raeume };
  }, [personen, kinder, einkommen, schwerbehindert100, schwerbehindertPflege, jungesEhepaar, alleinerziehendKinderU12, kinderMitEinkommen, unterhalt]);

  const setP = (id: number, patch: Partial<Person>) => setEinkommen((es) => es.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const btn = (aktiv: boolean) =>
    `py-2 px-2 rounded-xl font-medium transition-all text-sm ${aktiv ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`;
  const inputCls = 'w-full text-lg font-bold text-center py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">1. Ihr Haushalt</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <span className="text-gray-700 font-medium block mb-2">Personen im Haushalt (inkl. Kinder)</span>
            <div className="grid grid-cols-6 gap-1">{[1, 2, 3, 4, 5, 6].map((n) => <button key={n} onClick={() => setPersonen(n)} className={btn(personen === n)}>{n}</button>)}</div>
          </div>
          <div>
            <span className="text-gray-700 font-medium block mb-2">Davon Kinder (mit Kindergeldanspruch)</span>
            <div className="grid grid-cols-6 gap-1">{[0, 1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setKinder(n)} className={btn(kinder === n)}>{n}</button>)}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">2. Einkommen der Erwachsenen</h3>
        <p className="text-xs text-gray-500 mb-4">Erwartetes Bruttoeinkommen der nächsten 12 Monate je Person (§ 22 WoFG) – Gehalt, Rente, Arbeitslosengeld, Elterngeld über 300 €, Unterhalt</p>
        {einkommen.slice(0, Math.min(2, personen)).map((e, i) => (
          <div key={e.id} className={`${i > 0 ? 'border-t border-gray-100 pt-4 mt-4' : ''}`}>
            <div className="grid sm:grid-cols-2 gap-3 mb-2">
              <div><label className="block mb-1 text-sm text-gray-700 font-medium">Person {i + 1}: Bruttoeinkommen/Jahr</label><div className="relative"><input type="number" value={e.brutto} onChange={(ev) => setP(e.id, { brutto: Math.max(0, Number(ev.target.value) || 0) })} className={inputCls} min="0" step="500" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span></div></div>
              <div><label className="block mb-1 text-sm text-gray-700 font-medium">Werbungskosten (Pauschale 1.230 €)</label><div className="relative"><input type="number" value={e.werbungskosten} onChange={(ev) => setP(e.id, { werbungskosten: Math.max(0, Number(ev.target.value) || 0) })} className={inputCls} min="0" step="100" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span></div></div>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
              <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={e.steuern} onChange={(ev) => setP(e.id, { steuern: ev.target.checked })} className="w-4 h-4 accent-blue-600" />zahlt Einkommensteuer (−10 %)</label>
              <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={e.kv} onChange={(ev) => setP(e.id, { kv: ev.target.checked })} className="w-4 h-4 accent-blue-600" />Pflichtbeiträge KV/PV (−10 %)</label>
              <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={e.rv} onChange={(ev) => setP(e.id, { rv: ev.target.checked })} className="w-4 h-4 accent-blue-600" />Pflichtbeiträge RV (−10 %)</label>
            </div>
          </div>
        ))}
        {personen > 2 && <p className="text-xs text-gray-500 mt-3">Einkommen weiterer erwachsener Haushaltsmitglieder bitte bei Person 2 hinzurechnen.</p>}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">3. Freibeträge (§ 24 WoFG)</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Schwerbehinderte GdB 100 oder GdB ≥ 80 mit Pflegebedürftigkeit (4.500 €)</label><div className="grid grid-cols-4 gap-1">{[0, 1, 2, 3].map((n) => <button key={n} onClick={() => setSchwerbehindert100(n)} className={btn(schwerbehindert100 === n)}>{n}</button>)}</div></div>
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Schwerbehinderte GdB unter 80 mit Pflegebedürftigkeit (2.100 €)</label><div className="grid grid-cols-4 gap-1">{[0, 1, 2, 3].map((n) => <button key={n} onClick={() => setSchwerbehindertPflege(n)} className={btn(schwerbehindertPflege === n)}>{n}</button>)}</div></div>
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Alleinerziehend, berufstätig: Kinder unter 12 (600 € je Kind)</label><div className="grid grid-cols-4 gap-1">{[0, 1, 2, 3].map((n) => <button key={n} onClick={() => setAlleinerziehendKinderU12(n)} className={btn(alleinerziehendKinderU12 === n)}>{n}</button>)}</div></div>
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Kinder 16–24 mit eigenem Einkommen (bis 600 € je Kind)</label><div className="grid grid-cols-4 gap-1">{[0, 1, 2, 3].map((n) => <button key={n} onClick={() => setKinderMitEinkommen(n)} className={btn(kinderMitEinkommen === n)}>{n}</button>)}</div></div>
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Gezahlter Unterhalt an Personen außerhalb des Haushalts (Jahr)</label><div className="relative"><input type="number" value={unterhalt} onChange={(e) => setUnterhalt(Math.max(0, Number(e.target.value) || 0))} className={inputCls} min="0" step="100" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span></div></div>
          <label className="flex items-start gap-2 cursor-pointer text-sm text-gray-700 sm:pt-6"><input type="checkbox" checked={jungesEhepaar} onChange={(e) => setJungesEhepaar(e.target.checked)} className="w-5 h-5 mt-0.5 accent-blue-600" />Junges Ehepaar: beide unter 40, Heirat vor höchstens 5 Kalenderjahren (4.000 €)</label>
        </div>
      </div>

      <div className={`bg-gradient-to-br ${ergebnis.niedrigste ? 'from-blue-600 to-indigo-700' : 'from-gray-600 to-gray-800'} rounded-2xl shadow-lg p-6 text-white mb-6`}>
        <h3 className="text-sm font-medium opacity-80 mb-1">🏢 Ihr Wohnberechtigungsschein in Berlin</h3>
        <div className="mb-4">
          <div className="text-4xl sm:text-5xl font-bold">{ergebnis.niedrigste ? ergebnis.niedrigste.name : 'Kein WBS'}</div>
          <p className="mt-2 text-sm opacity-90">
            {ergebnis.niedrigste
              ? `Ihr Gesamteinkommen von ${fmtEuro(ergebnis.gesamteinkommen)} liegt unter der Grenze von ${fmtEuro(ergebnis.niedrigste.grenze)} (${ergebnis.niedrigste.info}) – Luft: ${fmtEuro(ergebnis.luft)}. Damit können Sie sich auf alle Wohnungen dieser und höherer Stufen bewerben.`
              : `Ihr Gesamteinkommen von ${fmtEuro(ergebnis.gesamteinkommen)} liegt ${fmtEuro(ergebnis.luft)} über der höchsten Berliner Grenze (WBS 220: ${fmtEuro(ergebnis.stufen[4].grenze)}).`}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Maßgebliches Gesamteinkommen</span><div className="text-xl font-bold">{fmtEuro(ergebnis.gesamteinkommen)}</div></div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Angemessene Wohnungsgröße</span><div className="text-xl font-bold">{ergebnis.raeume}</div></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">📋 Die Berliner WBS-Stufen für Ihren Haushalt</h3>
        <p className="text-xs text-gray-500 mb-4">{ergebnis.p} {ergebnis.p === 1 ? 'Person' : 'Personen'}{ergebnis.k > 0 ? `, davon ${ergebnis.k} ${ergebnis.k === 1 ? 'Kind' : 'Kinder'}` : ''} – Bundesgrenze nach § 9 Abs. 2 WoFG: {fmtEuro(ergebnis.grenze100)}</p>
        <table className="w-full text-sm">
          <thead><tr className="border-b-2 border-gray-200"><th className="text-left py-2 font-semibold text-gray-700">Stufe</th><th className="text-right py-2 font-semibold text-gray-700">Einkommensgrenze</th><th className="text-right py-2 font-semibold text-gray-700">Erfüllt</th></tr></thead>
          <tbody>
            {ergebnis.stufen.map((s) => (
              <tr key={s.name} className={`border-b border-gray-100 ${s === ergebnis.niedrigste ? 'bg-blue-50 font-bold text-blue-800' : 'text-gray-700'}`}>
                <td className="py-2">{s.name} <span className="text-xs font-normal text-gray-400">{s.info}</span></td><td className="py-2 text-right">{fmtEuro(s.grenze)}</td><td className="py-2 text-right">{s.erfuellt ? '✓' : '✗'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🧮 So kommen wir von Ihren Einkünften zum maßgeblichen Einkommen</h3>
        <div className="space-y-3 text-sm">
          {ergebnis.details.map((d, i) => (
            <div key={d.id} className="flex justify-between py-2 border-b border-gray-100 gap-4"><span className="text-gray-600">Person {i + 1}: {fmtEuro(d.brutto)} − {fmtEuro(d.werbungskosten)} Werbungskosten = {fmtEuro(d.einkuenfte)}, davon −{d.abzuege * 10} % Pauschalabzug ({fmtEuro(d.pauschal)})</span><span className="font-medium text-gray-800 text-right">{fmtEuro(d.jahreseinkommen)}</span></div>
          ))}
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4"><span className="text-gray-600">− Freibeträge nach § 24 WoFG</span><span className="font-medium text-gray-800">− {fmtEuro(ergebnis.freibetraege)}</span></div>
          <div className="flex justify-between py-2 gap-4"><span className="text-gray-600">= Gesamteinkommen des Haushalts (§ 20 WoFG)</span><span className="font-bold text-blue-700">{fmtEuro(ergebnis.gesamteinkommen)}</span></div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-xs text-gray-500">
        <strong>Hinweis:</strong> Der Rechner bildet die Einkommensermittlung nach §§ 20–24 WoFG und die Berliner WBS-Stufen ab.
        Nicht berücksichtigt: einzelne Einkommensarten mit Sonderregeln (§ 21 Abs. 2 WoFG, z. B. hälftige Anrechnung von
        BAföG-Zuschüssen und Pflegegeld, Elterngeld-Freibetrag 300 €), Einkünfte weiterer Erwachsener über Person 2 hinaus,
        Härtefall-WBS, Wohnungsgrößen-Abweichungen und die abweichenden Grenzen anderer Bundesländer. Ein WBS berechtigt
        zur Bewerbung auf gebundene Wohnungen, garantiert aber keine Wohnung. Verbindlich entscheidet das Bezirksamt.
      </div>

      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a href="https://www.gesetze-im-internet.de/wofg/__9.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 9 WoFG – Einkommensgrenzen (12.000 / 18.000 / +4.100 / +500 je Kind), Länderöffnung</a>
          <a href="https://www.gesetze-im-internet.de/wofg/__21.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§§ 20–23 WoFG – Gesamteinkommen, Jahreseinkommen, Pauschalabzüge je 10 %</a>
          <a href="https://www.gesetze-im-internet.de/wofg/__24.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 24 WoFG – Freibeträge (4.500 / 2.100 / 4.000 / 600 €) und Unterhalt</a>
          <a href="https://www.gesetze-im-internet.de/wofg/__27.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 27 WoFG – Wohnberechtigungsschein: Antrag, Geltung, Wohnungsgröße</a>
          <a href="https://www.berlin.de/sen/wohnen/wissen-fuer-mieter/berliner-mietratgeber/wohnberechtigungsschein/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">Senatsverwaltung Berlin – WBS-Stufen 100/140/160/180/220 und Einkommensgrenzen</a>
          <a href="https://service.berlin.de/dienstleistung/120671/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">Service Berlin – WBS beantragen (kostenlos, gültig 1 Jahr)</a>
        </div>
      </div>
    </div>
  );
}
