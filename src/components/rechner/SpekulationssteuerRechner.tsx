import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: September 2026) ===

// Private Veräußerungsgeschäfte bei Grundstücken: steuerpflichtig, wenn zwischen Anschaffung und Veräußerung
// nicht mehr als zehn Jahre liegen – § 23 Abs. 1 Satz 1 Nr. 1 EStG. Maßgeblich sind die obligatorischen
// Verträge (notarieller Kaufvertrag), nicht Übergabe oder Grundbucheintragung.
const SPEKULATIONSFRIST_JAHRE = 10;

// Ausnahme Selbstnutzung: ausschließlich eigene Wohnzwecke seit Anschaffung ODER im Jahr der Veräußerung
// und den beiden vorangegangenen Jahren – § 23 Abs. 1 Satz 1 Nr. 1 Satz 3 EStG
// Freigrenze: Gesamtgewinn im Kalenderjahr unter 1.000 € bleibt steuerfrei – § 23 Abs. 3 Satz 5 EStG
const FREIGRENZE = 1000;

// Gewinn = Veräußerungspreis − (Anschaffungskosten − in Anspruch genommene AfA) − Werbungskosten – § 23 Abs. 3 Satz 1 und 4 EStG

// Einkommensteuertarif 2026 – § 32a EStG
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
function soli(est: number, splitting: boolean): number {
  const freigrenze = splitting ? 40700 : 20350;
  if (est <= freigrenze) return 0;
  return Math.round(Math.min(0.055 * est, 0.119 * (est - freigrenze)) * 100) / 100;
}

const MS_TAG = 86400000;
const parse = (s: string): Date | null => { if (!s) return null; const d = new Date(s + 'T00:00:00Z'); return isNaN(d.getTime()) ? null : d; };
const fmtDatum = (d: Date) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
const fmtEuro = (n: number) =>
  n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });

type Nutzung = 'vermietet' | 'selbst-immer' | 'selbst-3jahre' | 'gemischt';

const inputCls = 'w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none';
const btn = (aktiv: boolean) =>
  `py-3 px-3 rounded-xl font-medium transition-all text-sm ${aktiv ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`;

// Außerhalb der Komponente definiert, damit die Inputs beim Tippen nicht neu gemountet werden
function Feld({ label, hint, value, set, step = 1000 }: { label: string; hint?: string; value: number; set: (n: number) => void; step?: number }) {
  return (
    <div>
      <label className="block mb-2"><span className="text-gray-700 font-medium">{label}</span>{hint && <span className="text-xs text-gray-500 block mt-1">{hint}</span>}</label>
      <div className="relative"><input type="number" value={value} onChange={(e) => set(Math.max(0, Number(e.target.value) || 0))} className={inputCls} min="0" step={step} /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span></div>
    </div>
  );
}

export default function SpekulationssteuerRechner() {
  const [kauf, setKauf] = useState('2019-05-15');
  const [verkauf, setVerkauf] = useState('2026-11-01');
  const [nutzung, setNutzung] = useState<Nutzung>('vermietet');
  const [verkaufspreis, setVerkaufspreis] = useState(420000);
  const [kaufpreis, setKaufpreis] = useState(300000);
  const [nebenkosten, setNebenkosten] = useState(30000);
  const [herstellung, setHerstellung] = useState(0);
  const [afa, setAfa] = useState(0);
  const [verkaufskosten, setVerkaufskosten] = useState(12000);
  const [zvE, setZvE] = useState(60000);
  const [splitting, setSplitting] = useState(false);
  const [kirchensteuer, setKirchensteuer] = useState<0 | 0.08 | 0.09>(0);

  const ergebnis = useMemo(() => {
    const k = parse(kauf);
    const v = parse(verkauf);
    if (!k || !v || v <= k) return null;

    // === 1. Spekulationsfrist: Ablauf = Kaufdatum + 10 Jahre (Verkauf am Tag danach ist steuerfrei) ===
    const fristEnde = new Date(Date.UTC(k.getUTCFullYear() + SPEKULATIONSFRIST_JAHRE, k.getUTCMonth(), k.getUTCDate()));
    const innerhalbFrist = v <= fristEnde;
    const tageBisFristende = Math.ceil((fristEnde.getTime() - v.getTime()) / MS_TAG) + 1;

    // === 2. Selbstnutzungs-Ausnahme ===
    const selbstnutzungBefreit = nutzung === 'selbst-immer' || nutzung === 'selbst-3jahre';

    // === 3. Gewinn (§ 23 Abs. 3) ===
    const anschaffung = Math.max(0, kaufpreis) + Math.max(0, nebenkosten) + Math.max(0, herstellung) - Math.max(0, afa);
    const gewinn = Math.max(0, verkaufspreis) - anschaffung - Math.max(0, verkaufskosten);
    const unterFreigrenze = gewinn > 0 && gewinn < FREIGRENZE;

    const steuerpflichtig = innerhalbFrist && !selbstnutzungBefreit && gewinn > 0 && !unterFreigrenze;

    // === 4. Steuer: Differenz der Einkommensteuer mit und ohne Gewinn ===
    const estOhne = einkommensteuer(zvE, splitting);
    const estMit = einkommensteuer(zvE + (steuerpflichtig ? gewinn : 0), splitting);
    const est = estMit - estOhne;
    const so = soli(estMit, splitting) - soli(estOhne, splitting);
    const kist = est * kirchensteuer;
    const steuer = steuerpflichtig ? est + so + kist : 0;
    const grenzsatz = steuerpflichtig && gewinn > 0 ? (est / gewinn) * 100 : 0;

    return {
      fristEnde, innerhalbFrist, tageBisFristende, selbstnutzungBefreit, anschaffung, gewinn, unterFreigrenze,
      steuerpflichtig, est, so, kist, steuer, grenzsatz, netto: Math.max(0, verkaufspreis) - Math.max(0, verkaufskosten) - steuer,
      haltedauerJahre: (v.getTime() - k.getTime()) / MS_TAG / 365.25,
    };
  }, [kauf, verkauf, nutzung, verkaufspreis, kaufpreis, nebenkosten, herstellung, afa, verkaufskosten, zvE, splitting, kirchensteuer]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">1. Frist und Nutzung</h3>
        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div><label className="block mb-2"><span className="text-gray-700 font-medium">Datum des notariellen Kaufvertrags</span><span className="text-xs text-gray-500 block mt-1">Bei Erbschaft/Schenkung: Kaufdatum des Vorbesitzers</span></label><input type="date" value={kauf} onChange={(e) => setKauf(e.target.value)} className={inputCls} /></div>
          <div><label className="block mb-2"><span className="text-gray-700 font-medium">Datum des Verkaufsvertrags</span><span className="text-xs text-gray-500 block mt-1">Geplantes Beurkundungsdatum</span></label><input type="date" value={verkauf} onChange={(e) => setVerkauf(e.target.value)} className={inputCls} /></div>
        </div>
        <span className="text-gray-700 font-medium block mb-2">Wie wurde die Immobilie genutzt?</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button onClick={() => setNutzung('vermietet')} className={btn(nutzung === 'vermietet')}>Vermietet / Kapitalanlage</button>
          <button onClick={() => setNutzung('selbst-immer')} className={btn(nutzung === 'selbst-immer')}>Seit dem Kauf ausschließlich selbst bewohnt</button>
          <button onClick={() => setNutzung('selbst-3jahre')} className={btn(nutzung === 'selbst-3jahre')}>Im Verkaufsjahr und den beiden Vorjahren selbst bewohnt</button>
          <button onClick={() => setNutzung('gemischt')} className={btn(nutzung === 'gemischt')}>Zeitweise selbst, zuletzt aber vermietet/leer</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">2. Zahlen zur Immobilie</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Feld label="Verkaufspreis" value={verkaufspreis} set={setVerkaufspreis} />
          <Feld label="Verkaufskosten" hint="Makler (Ihr Anteil), Vorfälligkeitsentschädigung, Notar für Löschung" value={verkaufskosten} set={setVerkaufskosten} step={500} />
          <Feld label="Kaufpreis damals" value={kaufpreis} set={setKaufpreis} />
          <Feld label="Kaufnebenkosten damals" hint="Grunderwerbsteuer, Notar, Grundbuch, Makler" value={nebenkosten} set={setNebenkosten} step={500} />
          <Feld label="Nachträgliche Herstellungskosten" hint="Anbau, Dachausbau, wesentliche Verbesserungen (keine Reparaturen)" value={herstellung} set={setHerstellung} />
          <Feld label="Bisher abgesetzte AfA (Summe)" hint="Nur bei Vermietung: Abschreibungen aller Jahre – sie erhöhen den Gewinn" value={afa} set={setAfa} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">3. Ihre Steuersituation im Verkaufsjahr</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Feld label="Zu versteuerndes Einkommen ohne den Gewinn" hint="Der Gewinn kommt obendrauf und wird mit Ihrem Grenzsteuersatz besteuert" value={zvE} set={setZvE} />
          <div className="space-y-3">
            <div><span className="text-gray-700 font-medium block mb-2">Veranlagung</span><div className="grid grid-cols-2 gap-2"><button onClick={() => setSplitting(false)} className={btn(!splitting)}>Einzeln</button><button onClick={() => setSplitting(true)} className={btn(splitting)}>Zusammen</button></div></div>
            <div><span className="text-gray-700 font-medium block mb-2">Kirchensteuer</span><div className="grid grid-cols-3 gap-2"><button onClick={() => setKirchensteuer(0)} className={btn(kirchensteuer === 0)}>keine</button><button onClick={() => setKirchensteuer(0.08)} className={btn(kirchensteuer === 0.08)}>8 %</button><button onClick={() => setKirchensteuer(0.09)} className={btn(kirchensteuer === 0.09)}>9 %</button></div></div>
          </div>
        </div>
      </div>

      {!ergebnis ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 text-sm text-amber-800">Bitte gültige Daten eingeben – der Verkauf muss nach dem Kauf liegen.</div>
      ) : (
        <>
          <div className={`bg-gradient-to-br ${ergebnis.steuerpflichtig ? 'from-red-500 to-rose-600' : 'from-emerald-500 to-green-600'} rounded-2xl shadow-lg p-6 text-white mb-6`}>
            <h3 className="text-sm font-medium opacity-80 mb-1">🏠 Spekulationssteuer auf den Verkauf</h3>
            <div className="mb-4">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-5xl font-bold">{fmtEuro(ergebnis.steuer)}</span>
                {ergebnis.steuerpflichtig && <span className="text-xl opacity-80">≈ {ergebnis.grenzsatz.toLocaleString('de-DE', { maximumFractionDigits: 1 })} % vom Gewinn</span>}
              </div>
              <p className="mt-2 text-sm opacity-90">
                {!ergebnis.innerhalbFrist && `Steuerfrei: Die Zehnjahresfrist ist am ${fmtDatum(ergebnis.fristEnde)} abgelaufen – Sie halten die Immobilie seit ${ergebnis.haltedauerJahre.toLocaleString('de-DE', { maximumFractionDigits: 1 })} Jahren.`}
                {ergebnis.innerhalbFrist && ergebnis.selbstnutzungBefreit && 'Steuerfrei trotz Verkauf innerhalb von zehn Jahren: Die Selbstnutzung im Verkaufsjahr und den beiden Vorjahren befreit (§ 23 Abs. 1 Nr. 1 Satz 3 EStG).'}
                {ergebnis.innerhalbFrist && !ergebnis.selbstnutzungBefreit && ergebnis.gewinn <= 0 && 'Kein Gewinn, keine Steuer. Der Verlust ist nur mit anderen privaten Veräußerungsgewinnen verrechenbar (§ 23 Abs. 3 Satz 7).'}
                {ergebnis.innerhalbFrist && !ergebnis.selbstnutzungBefreit && ergebnis.unterFreigrenze && `Der Gewinn von ${fmtEuro(ergebnis.gewinn)} bleibt unter der Freigrenze von 1.000 € – steuerfrei.`}
                {ergebnis.steuerpflichtig && `Gewinn ${fmtEuro(ergebnis.gewinn)} nach ${ergebnis.haltedauerJahre.toLocaleString('de-DE', { maximumFractionDigits: 1 })} Jahren Haltedauer – Frist läuft erst am ${fmtDatum(ergebnis.fristEnde)} ab.`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Steuerpflichtiger Gewinn</span><div className="text-xl font-bold">{fmtEuro(ergebnis.steuerpflichtig ? ergebnis.gewinn : 0)}</div></div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Was Ihnen netto bleibt</span><div className="text-xl font-bold">{fmtEuro(ergebnis.netto)}</div><span className="text-xs opacity-70">Verkaufspreis − Verkaufskosten − Steuer</span></div>
              {ergebnis.steuerpflichtig && (
                <>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Einkommensteuer / Soli / KiSt</span><div className="text-lg font-bold">{fmtEuro(ergebnis.est)} / {fmtEuro(ergebnis.so)} / {fmtEuro(ergebnis.kist)}</div></div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Warten würde sparen</span><div className="text-lg font-bold">{ergebnis.tageBisFristende} Tage</div><span className="text-xs opacity-70">Verkauf ab {fmtDatum(new Date(ergebnis.fristEnde.getTime() + MS_TAG))} steuerfrei</span></div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">📊 Gewinnermittlung nach § 23 Abs. 3 EStG</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100 gap-4"><span className="text-gray-600">Veräußerungspreis</span><span className="font-medium text-gray-800">{fmtEuro(verkaufspreis)}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-100 gap-4"><span className="text-gray-600">− Anschaffungskosten (Kaufpreis + Nebenkosten + Herstellungskosten)</span><span className="font-medium text-gray-800">− {fmtEuro(kaufpreis + nebenkosten + herstellung)}</span></div>
              {afa > 0 && <div className="flex justify-between py-2 border-b border-gray-100 gap-4"><span className="text-gray-600">+ abgesetzte AfA (mindert die Anschaffungskosten, Satz 4)</span><span className="font-medium text-gray-800">+ {fmtEuro(afa)}</span></div>}
              <div className="flex justify-between py-2 border-b border-gray-100 gap-4"><span className="text-gray-600">− Werbungskosten (Verkaufskosten)</span><span className="font-medium text-gray-800">− {fmtEuro(verkaufskosten)}</span></div>
              <div className="flex justify-between py-2 gap-4"><span className="text-gray-600">= Gewinn / Verlust</span><span className={`font-bold ${ergebnis.gewinn >= 0 ? 'text-gray-900' : 'text-red-600'}`}>{fmtEuro(ergebnis.gewinn)}</span></div>
            </div>
          </div>
        </>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-xs text-gray-500">
        <strong>Hinweis:</strong> Fristbeginn und -ende richten sich nach den Daten der notariellen Kaufverträge. Bei geerbten oder
        geschenkten Immobilien gilt die Anschaffung des Rechtsvorgängers. Nicht abgebildet: Drei-Objekt-Grenze (gewerblicher
        Grundstückshandel), Verkauf aus dem Betriebsvermögen, anteilige Selbstnutzung einzelner Räume oder eines
        Arbeitszimmers, Verlustverrechnung mit Vorjahren, Progressionsvorbehalt. Keine Steuerberatung.
      </div>

      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a href="https://www.gesetze-im-internet.de/estg/__23.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 23 EStG – Private Veräußerungsgeschäfte: Zehnjahresfrist, Selbstnutzung, Gewinnermittlung, Freigrenze 1.000 €</a>
          <a href="https://www.gesetze-im-internet.de/estg/__22.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 22 Nr. 2 EStG – Sonstige Einkünfte aus privaten Veräußerungsgeschäften</a>
          <a href="https://www.gesetze-im-internet.de/estg/__32a.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 32a EStG – Einkommensteuertarif 2026</a>
        </div>
      </div>
    </div>
  );
}
