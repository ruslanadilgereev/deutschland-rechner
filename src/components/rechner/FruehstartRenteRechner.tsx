import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: 13. September 2026) ===
// Regierungsentwurf „Gesetz zur Einführung einer Frühstartrente" (Kabinett 12.08.2026, BMF-Pressemitteilung):
// – Der Bund zahlt für jedes Kind, das sechs Jahre alt wird, bis zum 18. Lebensjahr 10 € pro Monat in ein zertifiziertes
//   Altersvorsorgedepot (Start rückwirkend 01.01.2026 mit dem Geburtsjahrgang 2020; danach kommt jedes Jahr der neue
//   Jahrgang der Sechsjährigen hinzu).
// – Eltern können freiwillig zuzahlen, bis zu 6.840 € pro Jahr (= Höchstbetrag des Altersvorsorgedepots).
// – Erträge bleiben bis zum Beginn der Auszahlungsphase steuerfrei; Auszahlung grundsätzlich nicht vor Vollendung des
//   65. Lebensjahres. Wahlrecht: eigenes Depot oder kollektive Verwaltung durch die Deutsche Bundesbank.
// Das Gesetz muss noch Bundestag und Bundesrat passieren; Start der Depots: 01.01.2027 (Altersvorsorgereformgesetz).
const STAAT_MONAT = 10;
const START_ALTER = 6;
const END_ALTER = 18;
const AUSZAHLUNG_ALTER = 65;
const ZUZAHLUNG_MAX_JAHR = 6840;
const ERSTER_JAHRGANG = 2020;

const fmtEuro = (n: number) => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });

// Kapital nach `monate` Monaten bei monatlicher Einzahlung `rate` und Jahresrendite `p` (monatliche Verzinsung, nachschüssig)
function sparplan(rate: number, monate: number, p: number, start = 0) {
  const i = p / 100 / 12;
  if (monate <= 0) return start;
  if (i === 0) return start + rate * monate;
  return start * Math.pow(1 + i, monate) + rate * ((Math.pow(1 + i, monate) - 1) / i);
}

export default function FruehstartRenteRechner() {
  const [jahrgang, setJahrgang] = useState(2021);
  const [zuzahlung, setZuzahlung] = useState(25);
  const [rendite, setRendite] = useState(6);
  const [renditeSpaeter, setRenditeSpaeter] = useState(5);

  const e = useMemo(() => {
    const monate = (END_ALTER - START_ALTER) * 12; // 144 Monate mit staatlichem Beitrag
    const zz = Math.min(zuzahlung, ZUZAHLUNG_MAX_JAHR / 12);
    const staatSumme = STAAT_MONAT * monate;
    const zuzahlungSumme = zz * monate;
    const kapital18Staat = sparplan(STAAT_MONAT, monate, rendite);
    const kapital18 = sparplan(STAAT_MONAT + zz, monate, rendite);
    const nach18 = (alter: number) => kapital18 * Math.pow(1 + renditeSpaeter / 100, alter - END_ALTER);
    const nach18Staat = (alter: number) => kapital18Staat * Math.pow(1 + renditeSpaeter / 100, alter - END_ALTER);
    const jahr6 = jahrgang + START_ALTER;
    const jahr18 = jahrgang + END_ALTER;
    const jahr65 = jahrgang + AUSZAHLUNG_ALTER;
    return { monate, zz, staatSumme, zuzahlungSumme, kapital18Staat, kapital18, k30: nach18(30), k50: nach18(50), k65: nach18(65), k65Staat: nach18Staat(65), jahr6, jahr18, jahr65, ertrag18: kapital18 - staatSumme - zuzahlungSumme };
  }, [jahrgang, zuzahlung, rendite, renditeSpaeter]);

  const inputCls = 'w-full text-lg font-bold text-center py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none';
  const btn = (aktiv: boolean) => `py-2 px-3 rounded-xl font-medium transition-all text-sm ${aktiv ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`;
  const jahrgaenge = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027];
  const zeilen: [string, number, number][] = [
    [`mit 18 (${e.jahr18})`, e.kapital18Staat, e.kapital18],
    [`mit 30 (${e.jahr18 + 12})`, e.kapital18Staat * Math.pow(1 + renditeSpaeter / 100, 12), e.k30],
    [`mit 50 (${e.jahr18 + 32})`, e.kapital18Staat * Math.pow(1 + renditeSpaeter / 100, 32), e.k50],
    [`mit 65 (${e.jahr65})`, e.k65Staat, e.k65],
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">Ihr Kind</h3>
        <p className="text-xs text-gray-500 mb-4">Die Frühstart-Rente gibt es lt. Regierungsentwurf ab dem Geburtsjahrgang 2020 – vom 6. bis zum 18. Geburtstag.</p>
        <label className="block mb-1 text-sm text-gray-700 font-medium">Geburtsjahr</label>
        <div className="grid grid-cols-4 gap-2">
          {jahrgaenge.map((j) => <button key={j} type="button" onClick={() => setJahrgang(j)} className={btn(jahrgang === j)}>{j}</button>)}
        </div>
        <p className="text-xs text-gray-500 mt-2">Staatliche Einzahlung {e.jahr6}–{e.jahr18} · Auszahlung frühestens {e.jahr65} (65. Geburtstag)</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">Zuzahlung und Rendite</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Eigene Zuzahlung pro Monat</label><div className="relative"><input type="number" value={zuzahlung} onChange={(ev) => setZuzahlung(Math.max(0, Math.min(570, Number(ev.target.value) || 0)))} className={inputCls} min="0" max="570" step="5" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span></div><p className="text-xs text-gray-500 mt-1">max. 6.840 €/Jahr (570 €/Monat)</p></div>
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Rendite bis 18 p. a.</label><div className="relative"><input type="number" value={rendite} onChange={(ev) => setRendite(Math.max(0, Math.min(12, Number(ev.target.value) || 0)))} className={inputCls} min="0" max="12" step="0.5" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span></div><p className="text-xs text-gray-500 mt-1">Aktien-ETF langfristig ca. 6–7 %</p></div>
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Rendite 18 bis 65 p. a.</label><div className="relative"><input type="number" value={renditeSpaeter} onChange={(ev) => setRenditeSpaeter(Math.max(0, Math.min(12, Number(ev.target.value) || 0)))} className={inputCls} min="0" max="12" step="0.5" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span></div><p className="text-xs text-gray-500 mt-1">ohne weitere Einzahlung</p></div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🌱 Frühstart-Rente</h3>
        <div className="mb-4">
          <div className="text-4xl sm:text-5xl font-bold">{fmtEuro(e.k65)}</div>
          <p className="mt-2 text-sm opacity-90">Kapital mit 65 (im Jahr {e.jahr65}) aus {fmtEuro(e.staatSumme)} Staatsgeld{e.zz > 0 && <> plus {fmtEuro(e.zuzahlungSumme)} eigener Zuzahlung</>} – bei {rendite.toLocaleString('de-DE')} % Rendite bis 18 und {renditeSpaeter.toLocaleString('de-DE')} % danach. Nur mit den 10 € vom Staat wären es <strong>{fmtEuro(e.k65Staat)}</strong>.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Kapital mit 18</span><div className="text-xl font-bold">{fmtEuro(e.kapital18)}</div><span className="text-xs opacity-70">davon Erträge {fmtEuro(e.ertrag18)}</span></div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Staat zahlt insgesamt</span><div className="text-xl font-bold">{fmtEuro(e.staatSumme)}</div><span className="text-xs opacity-70">{e.monate} × 10 € ({e.jahr6}–{e.jahr18})</span></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">📊 Kapitalentwicklung</h3>
        <p className="text-xs text-gray-500 mb-3">Nach dem 18. Geburtstag endet die staatliche Zahlung; das Depot wächst bis 65 weiter (steuerfrei in der Ansparphase). Eigene Einzahlungen ab 18 sind hier nicht enthalten.</p>
        <table className="w-full text-sm">
          <thead><tr className="border-b-2 border-gray-200"><th className="text-left py-2 font-semibold text-gray-700">Alter</th><th className="text-right py-2 font-semibold text-gray-700">nur Staat (10 €)</th><th className="text-right py-2 font-semibold text-gray-700">mit Zuzahlung {fmtEuro(e.zz)}</th></tr></thead>
          <tbody>
            {zeilen.map(([l, a, b]) => (
              <tr key={l} className="border-b border-gray-100 text-gray-700"><td className="py-2">{l}</td><td className="py-2 text-right">{fmtEuro(a)}</td><td className="py-2 text-right font-semibold">{fmtEuro(b)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">🧮 Rechenweg</h3>
        <div className="text-sm text-gray-700 space-y-1 font-mono">
          <div>Monatsrate = 10 € Staat + {fmtEuro(e.zz)} Zuzahlung über {e.monate} Monate ({START_ALTER}. bis {END_ALTER}. Geburtstag)</div>
          <div>Kapital mit 18 = Rate × ((1 + i)^n − 1) ÷ i, i = {rendite.toLocaleString('de-DE')} % ÷ 12 → <strong>{fmtEuro(e.kapital18)}</strong></div>
          <div>Kapital mit 65 = Kapital mit 18 × (1 + {renditeSpaeter.toLocaleString('de-DE')} %)^{AUSZAHLUNG_ALTER - END_ALTER} → <strong>{fmtEuro(e.k65)}</strong></div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 text-sm text-amber-800">
        <strong>Regierungsentwurf, noch nicht beschlossen:</strong> Das Frühstartrenten-Gesetz wurde am 12. August 2026 vom Kabinett beschlossen; Bundestag und Bundesrat müssen zustimmen, Start der Altersvorsorgedepots ist der 1. Januar 2027. Beträge, Altersgrenzen und Zuzahlungsgrenze können sich im Verfahren noch ändern. Die Rendite ist eine Annahme – Depots ohne Garantie können auch verlieren.
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-xs text-gray-500">
        <strong>Hinweis:</strong> Modellrechnung, keine Anlageberatung. Nicht berücksichtigt: Depotkosten und Fondsgebühren (mindern die Rendite), Inflation (bei 2 % ist die Kaufkraft von 100.000 € in 59 Jahren rund 31.000 €), Besteuerung der Auszahlung ab 65 (nachgelagert), spätere Zulagen und Beiträge im Altersvorsorgedepot ab dem 18. Lebensjahr (Berufseinsteigerbonus 200 €, Grundzulage bis 540 €/Jahr).
      </div>

      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a href="https://www.bundesfinanzministerium.de/Content/DE/Pressemitteilungen/Finanzpolitik/2026/08/2026-08-12-regierungsentwurf-fruehstartrente.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">BMF – Kabinett beschließt Frühstartrente (Regierungsentwurf, 12.08.2026)</a>
          <a href="https://www.bundesregierung.de/breg-de/aktuelles/reform-private-altersvorsorge-2400072" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">Bundesregierung – Reform der privaten Altersvorsorge (Altersvorsorgedepot ab 2027)</a>
          <a href="https://www.bundestag.de/dokumente/textarchiv/2026/kw13-de-altersvorsorge-1156798" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">Deutscher Bundestag – Beschluss des Altersvorsorgereformgesetzes (27.03.2026)</a>
        </div>
      </div>
    </div>
  );
}
