import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: 13. September 2026) ===
// Aktueller Rentenwert seit 01.07.2026: 42,52 € (Rentenwertbestimmungsverordnung 2026, Anpassung +4,24 %).
// Prognose für die Rentenanpassung zum 01.07.2027: +4,4 % (Rentenversicherungsbericht 2025 der Bundesregierung: Rentenwert
// 44,32 €; Finanzschätzung der DRV Frühjahr 2026: 44,39 €). Verbindlich erst mit der Rentenwertbestimmungsverordnung 2027
// (Beschluss der Bundesregierung im Frühjahr 2027 auf Basis der Lohnentwicklung 2026, § 68 SGB VI).
// Abzüge der Rentner (KVdR, § 249a SGB V; PV § 55 SGB XI): halber allgemeiner Beitragssatz 7,3 % + halber Zusatzbeitrag
// (Ø 2026: 2,9 %, also 1,45 %), Pflegeversicherung 3,6 % voll vom Rentner, + 0,6 % Zuschlag für Kinderlose ab 23.
// Steuer: Die Rentenerhöhung ist zu 100 % steuerpflichtig, weil der Rentenfreibetrag in Euro festgeschrieben ist (§ 22 EStG).
const RENTENWERT_ALT = 42.52;
const PROGNOSE_PROZENT = 4.4;
const KV_ALLGEMEIN_HALB = 7.3;
const ZUSATZBEITRAG_2026 = 2.9;
const PV_SATZ = 3.6;
const PV_KINDERLOS_ZUSCHLAG = 0.6;

const fmt = (n: number, d = 2) => n.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtEuro = (n: number, d = 2) => `${fmt(n, d)} €`;

export default function Rentenerhoehung2027Rechner() {
  const [rente, setRente] = useState(1500);
  const [prozent, setProzent] = useState(PROGNOSE_PROZENT);
  const [zusatz, setZusatz] = useState(ZUSATZBEITRAG_2026);
  const [kinderlos, setKinderlos] = useState(false);
  const [gkv, setGkv] = useState(true);
  const [grenzsteuer, setGrenzsteuer] = useState(0);

  const e = useMemo(() => {
    const erhoehung = rente * prozent / 100;
    const neu = rente + erhoehung;
    const kvSatz = gkv ? KV_ALLGEMEIN_HALB + zusatz / 2 : 0;
    const pvSatz = gkv ? PV_SATZ + (kinderlos ? PV_KINDERLOS_ZUSCHLAG : 0) : 0;
    const abzugSatz = (kvSatz + pvSatz) / 100;
    const nettoErhoehung = erhoehung * (1 - abzugSatz);
    const steuer = nettoErhoehung > 0 ? erhoehung * grenzsteuer / 100 : 0;
    const nachSteuer = nettoErhoehung - steuer;
    const rentenwertNeu = RENTENWERT_ALT * (1 + prozent / 100);
    const punkte = rente / RENTENWERT_ALT;
    return { erhoehung, neu, kvSatz, pvSatz, abzugSatz, nettoErhoehung, steuer, nachSteuer, rentenwertNeu, punkte, jahr2027: erhoehung * 6, jahr: erhoehung * 12 };
  }, [rente, prozent, zusatz, kinderlos, gkv, grenzsteuer]);

  const inputCls = 'w-full text-lg font-bold text-center py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none';
  const btn = (aktiv: boolean) => `py-2 px-3 rounded-xl font-medium transition-all text-sm ${aktiv ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`;
  const szenarien = [3.5, 4.0, PROGNOSE_PROZENT, 5.0];
  const beispiele = [800, 1000, 1200, 1500, 1800, 2000, 2500];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">Ihre Rente heute</h3>
        <p className="text-xs text-gray-500 mb-4">Monatliche Bruttorente laut Rentenbescheid oder Rentenanpassungsmitteilung (Stand seit 1. Juli 2026)</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Bruttorente pro Monat</label><div className="relative"><input type="number" value={rente} onChange={(ev) => setRente(Math.max(0, Number(ev.target.value) || 0))} className={inputCls} min="0" step="10" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span></div></div>
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Rentenanpassung zum 1. Juli 2027</label><div className="relative"><input type="number" value={prozent} onChange={(ev) => setProzent(Math.max(0, Math.min(15, Number(ev.target.value) || 0)))} className={inputCls} min="0" max="15" step="0.1" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span></div></div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {szenarien.map((s) => (
            <button key={s} type="button" onClick={() => setProzent(s)} className={btn(prozent === s)}>{s === PROGNOSE_PROZENT ? `Prognose ${fmt(s, 1)} %` : `${fmt(s, 1)} %`}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">Abzüge auf die Erhöhung</h3>
        <p className="text-xs text-gray-500 mb-4">Von jeder Rentenerhöhung gehen Kranken- und Pflegeversicherungsbeiträge ab – und sie ist zu 100 % steuerpflichtig.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm text-gray-700 font-medium">Krankenversicherung</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setGkv(true)} className={btn(gkv)}>gesetzlich (KVdR)</button>
              <button type="button" onClick={() => setGkv(false)} className={btn(!gkv)}>privat / keine Abzüge</button>
            </div>
          </div>
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Zusatzbeitrag Ihrer Kasse</label><div className="relative"><input type="number" value={zusatz} onChange={(ev) => setZusatz(Math.max(0, Math.min(6, Number(ev.target.value) || 0)))} className={inputCls} min="0" max="6" step="0.1" disabled={!gkv} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span></div></div>
          <div>
            <label className="block mb-1 text-sm text-gray-700 font-medium">Pflegeversicherung</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setKinderlos(false)} className={btn(!kinderlos)}>mit Kindern (3,6 %)</button>
              <button type="button" onClick={() => setKinderlos(true)} className={btn(kinderlos)}>kinderlos (4,2 %)</button>
            </div>
          </div>
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Persönlicher Grenzsteuersatz auf die Erhöhung</label><div className="relative"><input type="number" value={grenzsteuer} onChange={(ev) => setGrenzsteuer(Math.max(0, Math.min(45, Number(ev.target.value) || 0)))} className={inputCls} min="0" max="45" step="1" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span></div><p className="text-xs text-gray-500 mt-1">0 % = Rente bleibt unter dem Grundfreibetrag (2027 lt. Entwurf 12.564 €). Sonst z. B. 15–25 %.</p></div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">📈 Rentenerhöhung 2027 (Prognose)</h3>
        <div className="mb-4">
          <div className="text-4xl sm:text-5xl font-bold">+{fmtEuro(e.erhoehung)}</div>
          <p className="mt-2 text-sm opacity-90">brutto mehr pro Monat ab 1. Juli 2027 bei {fmt(prozent, 1)} % Anpassung – Ihre Bruttorente steigt von {fmtEuro(rente)} auf <strong>{fmtEuro(e.neu)}</strong>.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Netto nach KV/PV</span><div className="text-xl font-bold">+{fmtEuro(e.nettoErhoehung)}</div><span className="text-xs opacity-70">Abzug {fmt(e.abzugSatz * 100, 2)} %</span></div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">nach Steuer ({grenzsteuer} %)</span><div className="text-xl font-bold">+{fmtEuro(e.nachSteuer)}</div><span className="text-xs opacity-70">pro Monat</span></div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Plus im Jahr 2027</span><div className="text-xl font-bold">+{fmtEuro(e.jahr2027, 0)}</div><span className="text-xs opacity-70">brutto, Juli–Dezember</span></div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Rentenwert neu</span><div className="text-xl font-bold">{fmtEuro(e.rentenwertNeu)}</div><span className="text-xs opacity-70">statt {fmtEuro(RENTENWERT_ALT)} · {fmt(e.punkte, 2)} Entgeltpunkte</span></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">🧮 Rechenweg</h3>
        <div className="text-sm text-gray-700 space-y-1 font-mono">
          <div>Erhöhung brutto = {fmtEuro(rente)} × {fmt(prozent, 1)} % = <strong>{fmtEuro(e.erhoehung)}</strong></div>
          {gkv && <div>− KV {fmt(e.kvSatz, 2)} % (7,3 % + {fmt(zusatz / 2, 2)} % halber Zusatzbeitrag) − PV {fmt(e.pvSatz, 1)} % = − {fmtEuro(e.erhoehung * e.abzugSatz)}</div>}
          <div>= netto vor Steuer <strong>{fmtEuro(e.nettoErhoehung)}</strong>{grenzsteuer > 0 && <> − Steuer {grenzsteuer} % ({fmtEuro(e.steuer)}) = <strong>{fmtEuro(e.nachSteuer)}</strong></>}</div>
          <div className="text-gray-500">Entgeltpunkte = {fmtEuro(rente)} ÷ {fmtEuro(RENTENWERT_ALT)} = {fmt(e.punkte, 4)} · × {fmtEuro(e.rentenwertNeu)} = {fmtEuro(e.neu)}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">📊 Tabelle: Rentenerhöhung 2027 bei {fmt(prozent, 1)} %</h3>
        <p className="text-xs text-gray-500 mb-3">Brutto-Erhöhung und Netto nach KV/PV ({fmt(e.abzugSatz * 100, 2)} % Abzug, ohne Steuer)</p>
        <table className="w-full text-sm">
          <thead><tr className="border-b-2 border-gray-200"><th className="text-left py-2 font-semibold text-gray-700">Rente heute</th><th className="text-right py-2 font-semibold text-gray-700">ab 1.7.2027</th><th className="text-right py-2 font-semibold text-gray-700">+ brutto</th><th className="text-right py-2 font-semibold text-gray-700">+ netto</th></tr></thead>
          <tbody>
            {beispiele.map((b) => { const plus = b * prozent / 100; return (
              <tr key={b} className={`border-b border-gray-100 ${b === rente ? 'bg-orange-50 font-bold text-orange-800' : 'text-gray-700'}`}>
                <td className="py-2">{fmtEuro(b, 0)}</td><td className="py-2 text-right">{fmtEuro(b + plus)}</td><td className="py-2 text-right">+{fmtEuro(plus)}</td><td className="py-2 text-right">+{fmtEuro(plus * (1 - e.abzugSatz))}</td>
              </tr>); })}
          </tbody>
        </table>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 text-sm text-amber-800">
        <strong>Prognose, kein Bescheid:</strong> Die 4,4 % stammen aus dem Rentenversicherungsbericht 2025 und der DRV-Finanzschätzung. Die tatsächliche Anpassung beschließt die Bundesregierung im Frühjahr 2027 anhand der Lohnentwicklung 2026 (§ 68 SGB VI) – sie kann höher oder niedriger ausfallen. 2026 waren es 4,24 %, 2025 3,74 %, 2024 4,57 %.
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-xs text-gray-500">
        <strong>Hinweis:</strong> Schätzung, keine Rentenberatung. Nicht berücksichtigt: Mütterrente III (ab 2027 bis zu 0,5 Entgeltpunkte je vor 1992 geborenem Kind zusätzlich, Auszahlung ab 2028), Grundrentenzuschlag, Einkommensanrechnung bei Hinterbliebenenrenten, Beitragsermäßigung in der Pflegeversicherung für Eltern mit Kindern unter 25, Zusatzbeitrag Ihrer Kasse ab 2027 (wird im Oktober 2026 festgelegt).
      </div>

      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a href="https://www.bmas.de/DE/Soziales/Rente-und-Altersvorsorge/rentenversicherungsbericht.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">BMAS – Rentenversicherungsbericht 2025 (Prognose Rentenwert 2027)</a>
          <a href="https://www.gesetze-im-internet.de/sgb_6/__68.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 68 SGB VI – Aktueller Rentenwert (Anpassungsformel)</a>
          <a href="https://www.gesetze-im-internet.de/sgb_5/__249a.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 249a SGB V – Beitragstragung bei Rentnern</a>
          <a href="https://www.gesetze-im-internet.de/sgb_11/__55.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 55 SGB XI – Beitragssatz Pflegeversicherung, Kinderlosenzuschlag</a>
          <a href="https://www.gesetze-im-internet.de/estg/__22.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 22 EStG – Besteuerung der Rentenerhöhung (Rentenfreibetrag fest)</a>
        </div>
      </div>
    </div>
  );
}
