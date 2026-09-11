import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: September 2026) ===
// GDV-Musterbedingungen AKB 2015 (Stand 30.04.2025), Abschnitt I.5: Rückstufung in der Kfz-Haftpflicht vermeiden durch
// freiwillige Erstattung der Entschädigung innerhalb von SECHS MONATEN nach Mitteilung des Versicherers.
// Im Muster ist der Rückkauf auf Entschädigungen bis 500 € beschränkt; die meisten Versicherer setzen höhere oder keine Grenzen
// und bieten ihn auch in der Vollkasko an. Die SF-Tabellen (Beitragssätze, Rückstufung) sind im Muster nur Platzhalter ("xx"),
// jeder Versicherer hat eigene Tabellen – deshalb müssen die Beitragssätze aus dem eigenen Vertrag eingegeben werden.
const RUECKKAUF_FRIST_MONATE = 6;
const MUSTER_GRENZE = 500;

type Verlauf = 'linear' | 'konstant';

const fmtEuro = (n: number) =>
  n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtDatum = (d: Date) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

export default function SchadenrueckkaufRechner() {
  const [erstattung, setErstattung] = useState(900);
  const [jahresbeitrag, setJahresbeitrag] = useState(600);
  const [satzAktuell, setSatzAktuell] = useState(35);
  const [satzOhne, setSatzOhne] = useState(34);
  const [satzMit, setSatzMit] = useState(55);
  const [dauer, setDauer] = useState(10);
  const [verlauf, setVerlauf] = useState<Verlauf>('linear');
  const [dynamik, setDynamik] = useState(3);
  const [mitteilung, setMitteilung] = useState('');

  const ergebnis = useMemo(() => {
    // Grundbeitrag (100 %-Beitrag) aus aktuellem Beitrag und Beitragssatz
    const grundbeitrag = satzAktuell > 0 ? jahresbeitrag / (satzAktuell / 100) : 0;
    const beitragOhne = grundbeitrag * satzOhne / 100;
    const beitragMit = grundbeitrag * satzMit / 100;
    const mehrJahr1 = Math.max(0, beitragMit - beitragOhne);
    const N = Math.max(1, Math.min(30, dauer));

    // Mehrbeitrag je Jahr: bleibt konstant oder sinkt linear, weil die Beitragssätze in höheren SF-Klassen enger beieinanderliegen.
    // Beitragsdynamik: allgemeine Beitragssteigerung wirkt auf beide Pfade und damit auch auf die Differenz.
    const jahre: { jahr: number; mehr: number; kumuliert: number }[] = [];
    let kum = 0;
    for (let t = 0; t < N; t++) {
      const anteil = verlauf === 'linear' ? (N - t) / N : 1;
      const mehr = mehrJahr1 * anteil * Math.pow(1 + dynamik / 100, t);
      kum += mehr;
      jahre.push({ jahr: t + 1, mehr, kumuliert: kum });
    }
    const summeMehr = kum;
    const vorteilRueckkauf = summeMehr - erstattung; // > 0: Rückkauf lohnt sich
    const breakEven = jahre.find((j) => j.kumuliert >= erstattung)?.jahr ?? null;

    // Frist: 6 Monate nach Mitteilung (I.5 AKB)
    let fristEnde: Date | null = null;
    if (mitteilung) {
      const d = new Date(mitteilung + 'T00:00:00');
      if (!isNaN(d.getTime())) { fristEnde = new Date(d); fristEnde.setMonth(fristEnde.getMonth() + RUECKKAUF_FRIST_MONATE); }
    }

    return { grundbeitrag, beitragOhne, beitragMit, mehrJahr1, N, jahre, summeMehr, vorteilRueckkauf, breakEven, fristEnde };
  }, [erstattung, jahresbeitrag, satzAktuell, satzOhne, satzMit, dauer, verlauf, dynamik, mitteilung]);

  const inputCls = 'w-full text-lg font-bold text-center py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none';
  const btn = (aktiv: boolean) => `py-2 px-3 rounded-xl font-medium transition-all text-sm ${aktiv ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`;
  const lohnt = ergebnis.vorteilRueckkauf > 0;
  const meilensteine = ergebnis.jahre.filter((j) => j.jahr <= 3 || j.jahr === 5 || j.jahr === ergebnis.N || j.jahr === ergebnis.breakEven);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">1. Der Schaden</h3>
        <p className="text-xs text-gray-500 mb-4">Steht im Schreiben Ihres Versicherers nach Abschluss der Regulierung</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Erstattungsbetrag (von der Versicherung gezahlte Entschädigung)</label><div className="relative"><input type="number" value={erstattung} onChange={(e) => setErstattung(Math.max(0, Number(e.target.value) || 0))} className={inputCls} min="0" step="50" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span></div></div>
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Datum der Mitteilung (optional, für die Frist)</label><input type="date" value={mitteilung} onChange={(e) => setMitteilung(e.target.value)} className={inputCls} /></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">2. Ihre Beitragssätze (aus der SF-Tabelle Ihres Versicherers)</h3>
        <p className="text-xs text-gray-500 mb-4">Nur die betroffene Sparte eingeben: Kfz-Haftpflicht oder Vollkasko. Beitragssatz = Prozentwert Ihrer SF-Klasse laut Tabelle.</p>
        <div className="grid sm:grid-cols-3 gap-4">
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Jahresbeitrag der Sparte aktuell</label><div className="relative"><input type="number" value={jahresbeitrag} onChange={(e) => setJahresbeitrag(Math.max(0, Number(e.target.value) || 0))} className={inputCls} min="0" step="10" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span></div></div>
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Beitragssatz aktuell</label><div className="relative"><input type="number" value={satzAktuell} onChange={(e) => setSatzAktuell(Math.max(1, Number(e.target.value) || 1))} className={inputCls} min="1" max="300" step="1" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span></div></div>
          <div className="hidden sm:block" />
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Beitragssatz nächstes Jahr <span className="text-green-700">ohne</span> Schaden</label><div className="relative"><input type="number" value={satzOhne} onChange={(e) => setSatzOhne(Math.max(0, Number(e.target.value) || 0))} className={inputCls} min="0" max="300" step="1" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span></div></div>
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Beitragssatz nächstes Jahr <span className="text-red-700">nach</span> Rückstufung</label><div className="relative"><input type="number" value={satzMit} onChange={(e) => setSatzMit(Math.max(0, Number(e.target.value) || 0))} className={inputCls} min="0" max="300" step="1" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span></div></div>
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Dauer der Mehrbelastung (Jahre)</label><input type="number" value={dauer} onChange={(e) => setDauer(Math.max(1, Math.min(30, Number(e.target.value) || 1)))} className={inputCls} min="1" max="30" step="1" /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <div>
            <span className="text-gray-700 font-medium block mb-2 text-sm">Verlauf des Mehrbeitrags</span>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setVerlauf('linear')} className={btn(verlauf === 'linear')}>sinkt bis auf null</button>
              <button onClick={() => setVerlauf('konstant')} className={btn(verlauf === 'konstant')}>bleibt konstant</button>
            </div>
          </div>
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Allgemeine Beitragssteigerung pro Jahr</label><div className="relative"><input type="number" value={dynamik} onChange={(e) => setDynamik(Math.max(0, Number(e.target.value) || 0))} className={inputCls} min="0" max="20" step="0.5" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span></div></div>
        </div>
      </div>

      <div className={`bg-gradient-to-br ${lohnt ? 'from-green-600 to-emerald-700' : 'from-red-500 to-rose-700'} rounded-2xl shadow-lg p-6 text-white mb-6`}>
        <h3 className="text-sm font-medium opacity-80 mb-1">🚗 Schadenrückkauf</h3>
        <div className="mb-4">
          <div className="text-4xl sm:text-5xl font-bold">{lohnt ? 'Zurückkaufen' : 'Nicht zurückkaufen'}</div>
          <p className="mt-2 text-sm opacity-90">
            {lohnt
              ? `Die Rückstufung kostet Sie über ${ergebnis.N} Jahre voraussichtlich ${fmtEuro(ergebnis.summeMehr)} Mehrbeitrag – ${fmtEuro(ergebnis.vorteilRueckkauf)} mehr als die Erstattung von ${fmtEuro(erstattung)}.${ergebnis.breakEven ? ` Ab Jahr ${ergebnis.breakEven} übersteigt der Mehrbeitrag den Rückkaufbetrag.` : ''}`
              : `Der Mehrbeitrag über ${ergebnis.N} Jahre (${fmtEuro(ergebnis.summeMehr)}) bleibt ${fmtEuro(-ergebnis.vorteilRueckkauf)} unter der Erstattung von ${fmtEuro(erstattung)}. Lassen Sie die Versicherung zahlen.`}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Mehrbeitrag im 1. Jahr</span><div className="text-xl font-bold">{fmtEuro(ergebnis.mehrJahr1)}</div><span className="text-xs opacity-70">{fmtEuro(ergebnis.beitragMit)} statt {fmtEuro(ergebnis.beitragOhne)}</span></div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Rückkauf möglich bis</span><div className="text-xl font-bold">{ergebnis.fristEnde ? fmtDatum(ergebnis.fristEnde) : '6 Monate nach Mitteilung'}</div><span className="text-xs opacity-70">I.5 AKB (GDV-Muster)</span></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">📈 Mehrbeitrag Jahr für Jahr</h3>
        <p className="text-xs text-gray-500 mb-4">Grundbeitrag (100 %): {fmtEuro(ergebnis.grundbeitrag)} = {fmtEuro(jahresbeitrag)} ÷ {satzAktuell} %. Mehrbeitrag Jahr 1 = ({satzMit} % − {satzOhne} %) × Grundbeitrag.</p>
        <table className="w-full text-sm">
          <thead><tr className="border-b-2 border-gray-200"><th className="text-left py-2 font-semibold text-gray-700">Jahr</th><th className="text-right py-2 font-semibold text-gray-700">Mehrbeitrag</th><th className="text-right py-2 font-semibold text-gray-700">Kumuliert</th><th className="text-right py-2 font-semibold text-gray-700">vs. Erstattung</th></tr></thead>
          <tbody>
            {meilensteine.map((j) => (
              <tr key={j.jahr} className={`border-b border-gray-100 ${j.jahr === ergebnis.breakEven ? 'bg-orange-50 font-bold text-orange-800' : 'text-gray-700'}`}>
                <td className="py-2">{j.jahr}</td><td className="py-2 text-right">{fmtEuro(j.mehr)}</td><td className="py-2 text-right">{fmtEuro(j.kumuliert)}</td>
                <td className={`py-2 text-right ${j.kumuliert >= erstattung ? 'text-red-700' : 'text-green-700'}`}>{j.kumuliert >= erstattung ? '+' : '−'}{fmtEuro(Math.abs(j.kumuliert - erstattung))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {erstattung > MUSTER_GRENZE && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 text-sm text-amber-800">
          <strong>Hinweis zur Grenze:</strong> Die GDV-Musterbedingungen sehen den Rückkauf nur bis 500 € Entschädigung vor. Viele Versicherer erlauben ihn ohne Obergrenze oder bis zu höheren Beträgen und auch in der Vollkasko – prüfen Sie Abschnitt I.5 Ihrer AKB oder fragen Sie nach.
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-xs text-gray-500">
        <strong>Hinweis:</strong> Schätzung auf Basis Ihrer Eingaben, keine Versicherungsberatung. Die SF-Tabellen und Rückstufungsregeln sind bei
        jedem Versicherer anders; die GDV-Musterbedingungen enthalten dafür nur Platzhalter. Der tatsächliche Mehrbeitrag hängt davon ab, wie
        weit Ihr Vertrag zurückgestuft wird, wann Sie die Höchstklasse erreichen und ob Sie Rabattschutz haben. Nicht berücksichtigt:
        weitere Schäden im Zeitraum, Versichererwechsel, Zinsen auf den Rückkaufbetrag, Fahrzeugwechsel.
      </div>

      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a href="https://www.gdv.de/resource/blob/6178/ec39e06d2f552aca5f35f19277c94603/01-allgemeine-bedingungen-fuer-die-kfz-versicherung-akb-2015--data.pdf" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">GDV – Musterbedingungen AKB 2015 (Stand 30.04.2025), Abschnitt I: SF-System, I.4 schadenfreier Verlauf, I.5 Rückkauf innerhalb von 6 Monaten (Muster: bis 500 €)</a>
          <a href="https://www.gesetze-im-internet.de/vvg_2008/__115.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 115 VVG – Direktanspruch des Geschädigten gegen den Kfz-Haftpflichtversicherer</a>
        </div>
      </div>
    </div>
  );
}
