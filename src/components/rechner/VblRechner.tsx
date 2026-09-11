import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: September 2026, VBL-Satzung) ===

// Punktemodell (§ 36 VBL-Satzung): Versorgungspunkte je Kalenderjahr =
// (zusatzversorgungspflichtiges Jahresentgelt ÷ 12) ÷ Referenzentgelt 1.000 € × Altersfaktor
// Betriebsrente/Monat = Summe der Versorgungspunkte × Messbetrag 4,00 €
const REFERENZENTGELT = 1000;
const MESSBETRAG = 4;

// Altersfaktor nach Alter im Kalenderjahr (Kalenderjahr − Geburtsjahr), § 36 Abs. 3 VBL-Satzung –
// enthält eine Verzinsung von 3,25 % in der Anwartschafts- und 5,25 % in der Rentenphase
const ALTERSFAKTOR: Record<number, number> = {
  17: 3.1, 18: 3.0, 19: 2.9, 20: 2.8, 21: 2.7, 22: 2.6, 23: 2.5, 24: 2.4, 25: 2.4, 26: 2.3, 27: 2.2, 28: 2.2, 29: 2.1,
  30: 2.0, 31: 2.0, 32: 1.9, 33: 1.9, 34: 1.8, 35: 1.7, 36: 1.7, 37: 1.6, 38: 1.6, 39: 1.6, 40: 1.5, 41: 1.5, 42: 1.4,
  43: 1.4, 44: 1.3, 45: 1.3, 46: 1.3, 47: 1.2, 48: 1.2, 49: 1.2, 50: 1.1, 51: 1.1, 52: 1.1, 53: 1.0, 54: 1.0, 55: 1.0,
  56: 1.0, 57: 0.9, 58: 0.9, 59: 0.9, 60: 0.9, 61: 0.9, 62: 0.8, 63: 0.8,
};
const altersfaktor = (alter: number) => (alter < 17 ? 3.1 : alter >= 64 ? 0.8 : ALTERSFAKTOR[alter]);

// Abschlag bei vorzeitiger Betriebsrente: 0,3 % je Monat, höchstens 10,8 % – § 35 VBL-Satzung (i.V.m. § 77 SGB VI)
const ABSCHLAG_JE_MONAT = 0.003;
const ABSCHLAG_MAX = 0.108;
// Wartezeit: 60 Umlage-/Beitragsmonate – § 34 VBL-Satzung
const WARTEZEIT_MONATE = 60;

const HEUTE_JAHR = 2026;

const fmtEuro = (n: number) =>
  n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtP = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function VblRechner() {
  const [geburtsjahr, setGeburtsjahr] = useState(1985);
  const [jahresentgelt, setJahresentgelt] = useState(48000);
  const [bisherigePunkte, setBisherigePunkte] = useState(40);
  const [rentenalter, setRentenalter] = useState(67);
  const [gehaltssteigerung, setGehaltssteigerung] = useState(2);
  const [abschlagMonate, setAbschlagMonate] = useState(0);
  const [umlagemonate, setUmlagemonate] = useState(120);

  const ergebnis = useMemo(() => {
    const alterHeute = HEUTE_JAHR - geburtsjahr;
    const faktorHeute = altersfaktor(alterHeute);

    // === 1. Punkte des laufenden Jahres ===
    const punkteJahr = (Math.max(0, jahresentgelt) / 12 / REFERENZENTGELT) * faktorHeute;

    // === 2. Prognose bis zum Rentenalter: Jahr für Jahr mit sinkendem Altersfaktor ===
    const jahre: { jahr: number; alter: number; faktor: number; entgelt: number; punkte: number }[] = [];
    let entgelt = Math.max(0, jahresentgelt);
    let summe = Math.max(0, bisherigePunkte);
    for (let alter = alterHeute; alter < Math.max(alterHeute, rentenalter); alter++) {
      const f = altersfaktor(alter);
      const p = (entgelt / 12 / REFERENZENTGELT) * f;
      jahre.push({ jahr: HEUTE_JAHR + (alter - alterHeute), alter, faktor: f, entgelt, punkte: p });
      summe += p;
      entgelt *= 1 + Math.max(0, gehaltssteigerung) / 100;
    }
    const punkteZukunft = summe - Math.max(0, bisherigePunkte);

    // === 3. Rente und Abschlag ===
    const renteBrutto = summe * MESSBETRAG;
    const abschlag = Math.min(ABSCHLAG_MAX, Math.max(0, abschlagMonate) * ABSCHLAG_JE_MONAT);
    const rente = renteBrutto * (1 - abschlag);
    const renteHeute = Math.max(0, bisherigePunkte) * MESSBETRAG;

    return {
      alterHeute, faktorHeute, punkteJahr, jahre, summe, punkteZukunft, renteBrutto, abschlag, rente, renteHeute,
      wartezeitErfuellt: umlagemonate + jahre.length * 12 >= WARTEZEIT_MONATE,
      renteJahr: rente * 12,
    };
  }, [geburtsjahr, jahresentgelt, bisherigePunkte, rentenalter, gehaltssteigerung, abschlagMonate, umlagemonate]);

  const inputCls = 'w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none';
  const zahl = (setter: (n: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => setter(Math.max(0, Number(e.target.value) || 0));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2"><span className="text-gray-700 font-medium">Zusatzversorgungspflichtiges Jahresentgelt</span><span className="text-xs text-gray-500 block mt-1">Brutto inkl. Jahressonderzahlung – steht in Ihrer VBL-Jahresmitteilung</span></label>
            <div className="relative"><input type="number" value={jahresentgelt} onChange={zahl(setJahresentgelt)} className={inputCls} min="0" step="1000" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span></div>
          </div>
          <div>
            <label className="block mb-2"><span className="text-gray-700 font-medium">Geburtsjahr</span><span className="text-xs text-gray-500 block mt-1">Bestimmt den Altersfaktor ({ergebnis.alterHeute} Jahre → {ergebnis.faktorHeute.toLocaleString('de-DE')})</span></label>
            <input type="number" value={geburtsjahr} onChange={(e) => setGeburtsjahr(Math.max(1940, Math.min(2009, Math.round(Number(e.target.value) || 0))))} className={inputCls} min="1940" max="2009" />
          </div>
          <div>
            <label className="block mb-2"><span className="text-gray-700 font-medium">Bisher erworbene Versorgungspunkte</span><span className="text-xs text-gray-500 block mt-1">Summe laut letzter Jahresmitteilung (inkl. Startgutschrift und Bonuspunkte)</span></label>
            <div className="relative"><input type="number" value={bisherigePunkte} onChange={zahl(setBisherigePunkte)} className={inputCls} min="0" step="1" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Punkte</span></div>
          </div>
          <div>
            <label className="block mb-2"><span className="text-gray-700 font-medium">Bisherige Umlage-/Beitragsmonate</span><span className="text-xs text-gray-500 block mt-1">Für die Wartezeit von 60 Monaten</span></label>
            <div className="relative"><input type="number" value={umlagemonate} onChange={zahl(setUmlagemonate)} className={inputCls} min="0" step="12" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Monate</span></div>
          </div>
          <div>
            <label className="block mb-2"><span className="text-gray-700 font-medium">Geplantes Rentenalter</span></label>
            <input type="number" value={rentenalter} onChange={(e) => setRentenalter(Math.max(60, Math.min(70, Math.round(Number(e.target.value) || 0))))} className={inputCls} min="60" max="70" />
          </div>
          <div>
            <label className="block mb-2"><span className="text-gray-700 font-medium">Jährliche Gehaltssteigerung</span><span className="text-xs text-gray-500 block mt-1">Annahme für die Prognose</span></label>
            <div className="relative"><input type="number" value={gehaltssteigerung} onChange={(e) => setGehaltssteigerung(Math.max(0, Math.min(10, Number(e.target.value) || 0)))} className={inputCls} min="0" max="10" step="0.5" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span></div>
          </div>
        </div>
        <div>
          <label className="block mb-2"><span className="text-gray-700 font-medium">Vorzeitiger Rentenbeginn: Monate vor der Regelaltersgrenze</span><span className="text-xs text-gray-500 block mt-1">Abschlag 0,3 % je Monat, höchstens 10,8 % (36 Monate) – wie in der gesetzlichen Rente</span></label>
          <div className="relative"><input type="number" value={abschlagMonate} onChange={(e) => setAbschlagMonate(Math.max(0, Math.min(60, Math.round(Number(e.target.value) || 0))))} className={inputCls} min="0" max="60" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Monate</span></div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-teal-600 to-cyan-700 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🏛️ Ihre voraussichtliche VBLklassik-Betriebsrente (brutto)</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-5xl font-bold">{fmtEuro(ergebnis.rente)}</span>
            <span className="text-xl opacity-80">pro Monat ab {rentenalter}</span>
          </div>
          <p className="text-teal-100 mt-2 text-sm">
            {fmtP(ergebnis.summe)} Versorgungspunkte × 4,00 € Messbetrag{ergebnis.abschlag > 0 ? ` − ${(ergebnis.abschlag * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })} % Abschlag` : ''}
            {!ergebnis.wartezeitErfuellt && ' – Achtung: Wartezeit von 60 Umlagemonaten noch nicht erfüllt'}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Bereits erworben</span><div className="text-xl font-bold">{fmtEuro(ergebnis.renteHeute)}</div><span className="text-xs opacity-70">{fmtP(bisherigePunkte)} Punkte</span></div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Punkte im laufenden Jahr</span><div className="text-xl font-bold">{fmtP(ergebnis.punkteJahr)}</div><span className="text-xs opacity-70">= {fmtEuro(ergebnis.punkteJahr * MESSBETRAG)} Rente je Jahr</span></div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Bis zur Rente noch</span><div className="text-xl font-bold">{fmtP(ergebnis.punkteZukunft)} Punkte</div><span className="text-xs opacity-70">in {ergebnis.jahre.length} Jahren</span></div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Jahresrente</span><div className="text-xl font-bold">{fmtEuro(ergebnis.renteJahr)}</div></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">📊 Prognose Jahr für Jahr</h3>
        <p className="text-xs text-gray-500 mb-4">Der Altersfaktor sinkt mit dem Alter – frühe Beitragsjahre bringen mehr Punkte pro Euro</p>
        <div className="overflow-x-auto max-h-72 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white"><tr className="border-b-2 border-gray-200"><th className="text-left py-2 font-semibold text-gray-700">Jahr</th><th className="text-right py-2 font-semibold text-gray-700">Alter</th><th className="text-right py-2 font-semibold text-gray-700">Faktor</th><th className="text-right py-2 font-semibold text-gray-700">Entgelt</th><th className="text-right py-2 font-semibold text-gray-700">Punkte</th></tr></thead>
            <tbody>
              {ergebnis.jahre.map((j) => (
                <tr key={j.jahr} className="border-b border-gray-100 text-gray-700"><td className="py-1.5">{j.jahr}</td><td className="py-1.5 text-right">{j.alter}</td><td className="py-1.5 text-right">{j.faktor.toLocaleString('de-DE')}</td><td className="py-1.5 text-right">{j.entgelt.toLocaleString('de-DE', { maximumFractionDigits: 0 })} €</td><td className="py-1.5 text-right font-medium">{fmtP(j.punkte)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Was die Prognose nicht enthält</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2"><span>•</span><span><strong>Bonuspunkte:</strong> Überschüsse aus der Kapitalanlage werden als Bonuspunkte gutgeschrieben – in den letzten Jahren selten und nicht planbar.</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Soziale Komponenten:</strong> Für Elternzeit werden Punkte aus einem fiktiven Entgelt von 500 € je Monat gutgeschrieben; bei Erwerbsminderung Zurechnungszeiten.</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Rentenanpassung:</strong> Laufende VBL-Renten steigen jährlich um 1 % (§ 39 Satzung).</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Abzüge:</strong> Auf die Betriebsrente fallen Steuern (Ertragsanteil bzw. voll nachgelagert für seit 2002 geförderte Anteile) und für gesetzlich Versicherte volle Kranken- und Pflegeversicherungsbeiträge oberhalb des Freibetrags (2026: 197,75 € = 1/20 der Bezugsgröße, § 226 Abs. 2 SGB V) an.</span></li>
        </ul>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-xs text-gray-500">
        <strong>Hinweis:</strong> Der Rechner bildet die Formel des Punktemodells ab (VBL-Satzung §§ 34–36, Altersfaktortabelle der VBL).
        Für Pflichtversicherte im Abrechnungsverband West und Ost gilt dieselbe Leistungsformel; Startgutschriften für Zeiten vor 2002
        sind über die eingegebenen Punkte zu berücksichtigen. Verbindlich ist ausschließlich die Rentenauskunft der VBL. Keine Rechts-
        oder Rentenberatung.
      </div>

      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a href="https://www.vbl.de/de/berechnung" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">VBL – Berechnung der Betriebsrente VBLklassik: Formel, Altersfaktortabelle, Messbetrag 4 €, Abschlag § 35</a>
          <a href="https://www.vbl.de/de/betriebsrentenrechner" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">VBL – Offizieller Betriebsrentenrechner</a>
          <a href="https://www.vbl.de/documents/d/vbl/vbl-satzung-33-anderung" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">VBL-Satzung (33. Änderung) – §§ 34 Wartezeit, 35 Höhe, 36 Versorgungspunkte, 39 Anpassung</a>
          <a href="https://www.gesetze-im-internet.de/sgb_6/__77.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 77 SGB VI – Zugangsfaktor (0,3 % je Monat vorzeitigen Rentenbezugs)</a>
        </div>
      </div>
    </div>
  );
}
