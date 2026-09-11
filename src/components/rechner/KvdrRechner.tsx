import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: September 2026) ===

// Vorversicherungszeit KVdR: seit der erstmaligen Aufnahme einer Erwerbstätigkeit bis zur
// Stellung des Rentenantrags mindestens 9/10 der zweiten Hälfte dieses Zeitraums Mitglied
// (pflicht- oder freiwillig) oder familienversichert (§ 10) in der GKV.
// Quelle: § 5 Abs. 1 Nr. 11 SGB V – https://www.gesetze-im-internet.de/sgb_5/__5.html
const ANTEIL_ERFORDERLICH = 0.9;

// Kinderanrechnung: je Kind, Stiefkind oder Pflegekind werden 3 Jahre auf die erforderliche
// Mitgliedszeit angerechnet. Quelle: § 5 Abs. 2 Satz 3 SGB V (seit 1.8.2017)
const JAHRE_JE_KIND = 3;
const TAGE_JE_JAHR = 365.25;

const MS_TAG = 24 * 60 * 60 * 1000;

interface Luecke {
  id: number;
  von: string;
  bis: string;
}

const parse = (s: string): Date | null => {
  if (!s) return null;
  const d = new Date(s + 'T00:00:00Z');
  return isNaN(d.getTime()) ? null : d;
};
const tage = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / MS_TAG);
const fmtDatum = (d: Date) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
const fmtJahreMonate = (t: number) => {
  const jahre = Math.floor(t / TAGE_JE_JAHR);
  const monate = Math.round(((t / TAGE_JE_JAHR) - jahre) * 12);
  if (monate === 12) return `${jahre + 1} Jahre`;
  if (jahre === 0) return `${monate} ${monate === 1 ? 'Monat' : 'Monate'}`;
  return `${jahre} ${jahre === 1 ? 'Jahr' : 'Jahre'}${monate > 0 ? `, ${monate} ${monate === 1 ? 'Monat' : 'Monate'}` : ''}`;
};

// Zeiträume ohne GKV innerhalb [start, ende] vereinigen und Tage summieren
function lueckenTageIm(luecken: Luecke[], start: Date, ende: Date): { tage: number; segmente: { von: Date; bis: Date }[] } {
  const segs = luecken
    .map((l) => ({ von: parse(l.von), bis: parse(l.bis) }))
    .filter((s): s is { von: Date; bis: Date } => !!s.von && !!s.bis && s.bis > s.von)
    .map((s) => ({ von: new Date(Math.max(s.von.getTime(), start.getTime())), bis: new Date(Math.min(s.bis.getTime(), ende.getTime())) }))
    .filter((s) => s.bis > s.von)
    .sort((a, b) => a.von.getTime() - b.von.getTime());
  const merged: { von: Date; bis: Date }[] = [];
  for (const s of segs) {
    const last = merged[merged.length - 1];
    if (last && s.von <= last.bis) {
      if (s.bis > last.bis) last.bis = s.bis;
    } else {
      merged.push({ von: s.von, bis: s.bis });
    }
  }
  return { tage: merged.reduce((sum, s) => sum + tage(s.von, s.bis), 0), segmente: merged };
}

function pruefe(erste: Date, antrag: Date, kinder: number, luecken: Luecke[]) {
  const gesamtTage = tage(erste, antrag);
  const mitte = new Date(erste.getTime() + Math.floor(gesamtTage / 2) * MS_TAG);
  const zweiteHaelfteTage = tage(mitte, antrag);
  const erforderlich = zweiteHaelfteTage * ANTEIL_ERFORDERLICH;
  const l = lueckenTageIm(luecken, mitte, antrag);
  const gkvTage = zweiteHaelfteTage - l.tage;
  const kinderTage = kinder * JAHRE_JE_KIND * TAGE_JE_JAHR;
  const anrechenbar = gkvTage + kinderTage;
  return {
    gesamtTage,
    mitte,
    zweiteHaelfteTage,
    erforderlich,
    lueckenTage: l.tage,
    segmente: l.segmente,
    gkvTage,
    kinderTage,
    anrechenbar,
    erfuellt: anrechenbar >= erforderlich,
    puffer: anrechenbar - erforderlich, // > 0: so viele Tage ohne GKV wären noch unschädlich
    lueckeInDerErstenHaelfte: lueckenTageIm(luecken, erste, mitte).tage,
  };
}

export default function KvdrRechner() {
  const [ersteErwerb, setErsteErwerb] = useState('1985-09-01');
  const [rentenantrag, setRentenantrag] = useState('2027-01-01');
  const [kinder, setKinder] = useState(0);
  const [luecken, setLuecken] = useState<Luecke[]>([{ id: 1, von: '', bis: '' }]);

  const ergebnis = useMemo(() => {
    const erste = parse(ersteErwerb);
    const antrag = parse(rentenantrag);
    if (!erste || !antrag) return null;
    if (tage(erste, antrag) < 365) return { fehler: 'Der Rentenantrag muss mindestens ein Jahr nach der ersten Erwerbstätigkeit liegen.' } as const;

    const heute = new Date();
    const basis = pruefe(erste, antrag, kinder, luecken);

    // Frühestes Antragsdatum, ab dem die 9/10-Regel erfüllt wäre – Annahme: ab jetzt durchgehend GKV
    let fruehestens: Date | null = null;
    if (!basis.erfuellt) {
      const start = antrag > heute ? antrag : heute;
      for (let m = 1; m <= 300; m++) {
        const kandidat = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + m, 1));
        if (pruefe(erste, kandidat, kinder, luecken).erfuellt) { fruehestens = kandidat; break; }
      }
    }
    return { ...basis, erste, antrag, fruehestens };
  }, [ersteErwerb, rentenantrag, kinder, luecken]);

  const setLuecke = (id: number, feld: 'von' | 'bis', wert: string) =>
    setLuecken((ls) => ls.map((l) => (l.id === id ? { ...l, [feld]: wert } : l)));
  const addLuecke = () => setLuecken((ls) => [...ls, { id: Math.max(0, ...ls.map((l) => l.id)) + 1, von: '', bis: '' }]);
  const removeLuecke = (id: number) => setLuecken((ls) => (ls.length > 1 ? ls.filter((l) => l.id !== id) : [{ id: 1, von: '', bis: '' }]));

  const inputCls = 'w-full text-lg font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-sky-500 focus:ring-0 outline-none';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Beginn der ersten Erwerbstätigkeit</span>
              <span className="text-xs text-gray-500 block mt-1">Erster Job, Ausbildung oder Lehre – auch ein Ferienjob zählt, wenn er versicherungspflichtig war</span>
            </label>
            <input type="date" value={ersteErwerb} onChange={(e) => setErsteErwerb(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Geplantes Datum des Rentenantrags</span>
              <span className="text-xs text-gray-500 block mt-1">Es zählt die Antragstellung, nicht der Rentenbeginn</span>
            </label>
            <input type="date" value={rentenantrag} onChange={(e) => setRentenantrag(e.target.value)} className={inputCls} />
          </div>
        </div>

        {/* Kinder */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Kinder, Stief- oder Pflegekinder</span>
            <span className="text-xs text-gray-500 block mt-1">Je Kind werden pauschal 3 Jahre angerechnet (§ 5 Abs. 2 Satz 3 SGB V) – für beide Elternteile</span>
          </label>
          <div className="grid grid-cols-6 gap-2">
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setKinder(n)}
                className={`py-3 rounded-xl font-medium transition-all ${(n === 5 ? kinder >= 5 : kinder === n) ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {n === 5 ? '5+' : n}
              </button>
            ))}
          </div>
          {kinder >= 5 && (
            <input
              type="number"
              value={kinder}
              onChange={(e) => setKinder(Math.max(5, Math.min(20, Math.round(Number(e.target.value)))))}
              className={`${inputCls} mt-2`}
              min="5"
              max="20"
            />
          )}
        </div>

        {/* Lücken */}
        <div>
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Zeiten ohne gesetzliche Krankenversicherung</span>
            <span className="text-xs text-gray-500 block mt-1">
              Privat versichert (auch als Beamtin/Beamter mit Beihilfe), nicht versichert oder im Ausland ohne GKV.
              Zeiten als Pflicht-, freiwilliges oder Familienmitglied der GKV sind <strong>keine</strong> Lücke.
            </span>
          </label>
          <div className="space-y-3">
            {luecken.map((l, i) => (
              <div key={l.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                <div>
                  {i === 0 && <span className="text-xs text-gray-500 block mb-1">von</span>}
                  <input type="date" value={l.von} onChange={(e) => setLuecke(l.id, 'von', e.target.value)} className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-sky-500 focus:ring-0 outline-none text-sm" />
                </div>
                <div>
                  {i === 0 && <span className="text-xs text-gray-500 block mb-1">bis</span>}
                  <input type="date" value={l.bis} onChange={(e) => setLuecke(l.id, 'bis', e.target.value)} className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-sky-500 focus:ring-0 outline-none text-sm" />
                </div>
                <button onClick={() => removeLuecke(l.id)} className="py-2 px-3 rounded-xl bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 text-sm" aria-label="Zeitraum entfernen">✕</button>
              </div>
            ))}
          </div>
          {luecken.length < 8 && (
            <button onClick={addLuecke} className="mt-3 text-sm text-sky-600 hover:underline font-medium">+ weiteren Zeitraum hinzufügen</button>
          )}
        </div>
      </div>

      {/* Ergebnis */}
      {!ergebnis ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 text-sm text-amber-800">Bitte beide Datumsangaben ausfüllen.</div>
      ) : 'fehler' in ergebnis ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 text-sm text-amber-800">{ergebnis.fehler}</div>
      ) : (
        <>
          <div className={`bg-gradient-to-br ${ergebnis.erfuellt ? 'from-sky-500 to-blue-600' : 'from-amber-500 to-orange-600'} rounded-2xl shadow-lg p-6 text-white mb-6`}>
            <h3 className="text-sm font-medium opacity-80 mb-1">🏥 Krankenversicherung der Rentner (KVdR)</h3>
            <div className="mb-4">
              <div className="text-3xl sm:text-4xl font-bold leading-tight">
                {ergebnis.erfuellt ? 'Vorversicherungszeit erfüllt' : 'Vorversicherungszeit nicht erfüllt'}
              </div>
              <p className="mt-2 text-sm opacity-90">
                {ergebnis.erfuellt
                  ? `Sie wären pflichtversichert in der KVdR. Puffer: ${fmtJahreMonate(ergebnis.puffer)} ohne GKV in der zweiten Hälfte wären noch unschädlich.`
                  : `Es fehlen ${fmtJahreMonate(-ergebnis.puffer)} anrechenbare Zeit. Sie könnten sich nur freiwillig versichern – mit Beiträgen auch auf Mieten, Kapitalerträge und Privatrenten.`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Erforderlich (9/10 der 2. Hälfte)</span>
                <div className="text-xl font-bold">{fmtJahreMonate(ergebnis.erforderlich)}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Anrechenbar</span>
                <div className="text-xl font-bold">{fmtJahreMonate(ergebnis.anrechenbar)}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Zweite Hälfte des Erwerbslebens</span>
                <div className="text-lg font-bold">{fmtDatum(ergebnis.mitte)} – {fmtDatum(ergebnis.antrag)}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">{ergebnis.erfuellt ? 'Verbleibender Puffer' : 'Fehlende Zeit'}</span>
                <div className="text-xl font-bold">{fmtJahreMonate(Math.abs(ergebnis.puffer))}</div>
              </div>
            </div>

            {!ergebnis.erfuellt && ergebnis.fruehestens && (
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-sm">
                📅 Wenn Sie ab sofort durchgehend gesetzlich versichert bleiben und den Rentenantrag erst am{' '}
                <strong>{fmtDatum(ergebnis.fruehestens)}</strong> stellen, wäre die Vorversicherungszeit erfüllt
                (die zweite Hälfte verschiebt sich nach hinten, die Lücke rutscht heraus).
              </div>
            )}
            {!ergebnis.erfuellt && !ergebnis.fruehestens && (
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-sm">
                Auch ein um bis zu 25 Jahre späterer Rentenantrag würde die 9/10-Regel unter diesen Angaben nicht erfüllen.
              </div>
            )}
          </div>

          {/* Zeitachse */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-1">📊 Zeitachse: Erwerbsleben von {fmtDatum(ergebnis.erste)} bis {fmtDatum(ergebnis.antrag)}</h3>
            <p className="text-xs text-gray-500 mb-4">Nur die zweite Hälfte zählt – Lücken in der ersten Hälfte sind unschädlich</p>
            <div className="relative h-10 rounded-xl overflow-hidden bg-gray-200">
              {/* zweite Hälfte */}
              <div className="absolute top-0 bottom-0 bg-sky-400" style={{ left: '50%', right: 0 }} />
              {/* Lücken (nur in der zweiten Hälfte rot) */}
              {ergebnis.segmente.map((s, i) => {
                const left = (tage(ergebnis.erste, s.von) / ergebnis.gesamtTage) * 100;
                const width = (tage(s.von, s.bis) / ergebnis.gesamtTage) * 100;
                return <div key={i} className="absolute top-0 bottom-0 bg-red-500" style={{ left: `${left}%`, width: `${Math.max(width, 0.5)}%` }} title={`${fmtDatum(s.von)} – ${fmtDatum(s.bis)}`} />;
              })}
              <div className="absolute top-0 bottom-0 w-0.5 bg-gray-700" style={{ left: '50%' }} />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>{fmtDatum(ergebnis.erste)}</span>
              <span className="font-medium text-gray-700">Mitte: {fmtDatum(ergebnis.mitte)}</span>
              <span>{fmtDatum(ergebnis.antrag)}</span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-gray-600 mt-3">
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-gray-200" /> erste Hälfte (zählt nicht)</span>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-sky-400" /> zweite Hälfte mit GKV</span>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-red-500" /> ohne GKV</span>
            </div>
            {ergebnis.lueckeInDerErstenHaelfte > 0 && ergebnis.segmente.length === 0 && (
              <p className="text-xs text-emerald-700 mt-3">✓ Ihre Zeit ohne GKV liegt vollständig in der ersten Hälfte und ist damit unschädlich.</p>
            )}
          </div>

          {/* Rechenweg */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">🧮 So wird gerechnet</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
                <span className="text-gray-600">Rahmenzeit: erste Erwerbstätigkeit bis Rentenantrag</span>
                <span className="font-medium text-gray-800 text-right">{fmtJahreMonate(ergebnis.gesamtTage)} ({ergebnis.gesamtTage.toLocaleString('de-DE')} Tage)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
                <span className="text-gray-600">Zweite Hälfte ab {fmtDatum(ergebnis.mitte)}</span>
                <span className="font-medium text-gray-800 text-right">{ergebnis.zweiteHaelfteTage.toLocaleString('de-DE')} Tage</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
                <span className="text-gray-600">× 9/10 = erforderliche Vorversicherungszeit</span>
                <span className="font-medium text-gray-800 text-right">{Math.ceil(ergebnis.erforderlich).toLocaleString('de-DE')} Tage</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
                <span className="text-gray-600">GKV-Zeit in der zweiten Hälfte (abzgl. {ergebnis.lueckenTage.toLocaleString('de-DE')} Tage Lücke)</span>
                <span className="font-medium text-gray-800 text-right">{ergebnis.gkvTage.toLocaleString('de-DE')} Tage</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
                <span className="text-gray-600">+ Kinderanrechnung {kinder} × 3 Jahre</span>
                <span className="font-medium text-gray-800 text-right">{Math.round(ergebnis.kinderTage).toLocaleString('de-DE')} Tage</span>
              </div>
              <div className="flex justify-between py-2 gap-4">
                <span className="text-gray-600">= anrechenbar {ergebnis.erfuellt ? '≥' : '<'} erforderlich</span>
                <span className={`font-bold text-right ${ergebnis.erfuellt ? 'text-sky-700' : 'text-orange-700'}`}>{Math.round(ergebnis.anrechenbar).toLocaleString('de-DE')} Tage</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Folgen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">⚖️ Was der Unterschied kostet</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="border border-sky-200 bg-sky-50 rounded-xl p-4">
            <h4 className="font-semibold text-sky-800 mb-2">Pflichtversichert (KVdR)</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• Beiträge nur auf gesetzliche Rente, Versorgungsbezüge (Betriebsrente) und Arbeitseinkommen (§ 237 SGB V)</li>
              <li>• Mieten, Zinsen, Dividenden, private Renten und Riester bleiben beitragsfrei</li>
              <li>• Rentenversicherung trägt die Hälfte des Beitrags auf die Rente</li>
            </ul>
          </div>
          <div className="border border-orange-200 bg-orange-50 rounded-xl p-4">
            <h4 className="font-semibold text-orange-800 mb-2">Freiwillig versichert</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• Beiträge auf die gesamte wirtschaftliche Leistungsfähigkeit: auch Mieten, Kapitalerträge, Privatrenten (§ 240 SGB V)</li>
              <li>• Mindestbeitrag auch bei kleiner Rente (Mindestbemessung 1.318,33 €/Monat 2026)</li>
              <li>• Zuschuss der Rentenversicherung nur zur Rente selbst (§ 106 SGB VI)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-xs text-gray-500">
        <strong>Hinweis:</strong> Der Rechner bildet die 9/10-Regel des § 5 Abs. 1 Nr. 11 SGB V mit Kinderanrechnung
        taggenau ab. Über den Versicherungsstatus entscheidet allein die Krankenkasse anhand der Versicherungsverläufe.
        Nicht abgebildet: Sonderregeln für Künstler (Nr. 11a), Ehezeiten bis 1988 (Abs. 2 Satz 1), abgeleitete
        Hinterbliebenenrenten (Abs. 2 Satz 2), Vorrang anderer Pflichtversicherungen (Abs. 8), Beitrittsrecht nach § 9 SGB V.
        Keine Rechtsberatung.
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a href="https://www.gesetze-im-internet.de/sgb_5/__5.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 5 Abs. 1 Nr. 11, Abs. 2 SGB V – Versicherungspflicht der Rentner, 9/10-Regel, Kinderanrechnung
          </a>
          <a href="https://www.gesetze-im-internet.de/sgb_5/__237.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 237 SGB V – Beitragspflichtige Einnahmen versicherungspflichtiger Rentner
          </a>
          <a href="https://www.gesetze-im-internet.de/sgb_5/__240.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 240 SGB V – Beitragspflichtige Einnahmen freiwilliger Mitglieder
          </a>
          <a href="https://www.gesetze-im-internet.de/sgb_6/__106.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 106 SGB VI – Zuschuss zur Krankenversicherung für freiwillig und privat versicherte Rentner
          </a>
          <a href="https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/In-der-Rente/Kranken-und-Pflegeversicherung-der-Rentner/kranken-und-pflegeversicherung-der-rentner.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            Deutsche Rentenversicherung – Kranken- und Pflegeversicherung der Rentner
          </a>
        </div>
      </div>
    </div>
  );
}
