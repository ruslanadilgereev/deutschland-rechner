import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: September 2026) ===

// Krankengeld wegen derselben Krankheit: längstens 78 Wochen innerhalb von je drei Jahren, gerechnet vom
// Tag des Beginns der Arbeitsunfähigkeit an (Blockfrist) – § 48 Abs. 1 SGB V
const MAX_TAGE = 78 * 7; // 546 Kalendertage
const BLOCKFRIST_JAHRE = 3;

// Zeiten, in denen der Anspruch ruht (z. B. Entgeltfortzahlung durch den Arbeitgeber), zählen wie Bezugszeiten – § 48 Abs. 3 SGB V
// Entgeltfortzahlung: 6 Wochen = 42 Kalendertage – § 3 Abs. 1 EFZG
const ENTGELTFORTZAHLUNG_TAGE = 42;

// Neuer Anspruch in der nächsten Blockfrist nur, wenn zwischenzeitlich mind. 6 Monate nicht wegen dieser
// Krankheit arbeitsunfähig und erwerbstätig bzw. der Arbeitsvermittlung zur Verfügung stehend – § 48 Abs. 2 SGB V
const MINDEST_PAUSE_MONATE = 6;

interface Zeitraum { id: number; von: string; bis: string }

const MS_TAG = 86400000;
const parse = (s: string): Date | null => { if (!s) return null; const d = new Date(s + 'T00:00:00Z'); return isNaN(d.getTime()) ? null : d; };
const tage = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / MS_TAG) + 1; // inklusive beider Tage
const addTage = (d: Date, n: number) => new Date(d.getTime() + n * MS_TAG);
const fmtDatum = (d: Date) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
const heuteUtc = () => { const h = new Date(); return new Date(Date.UTC(h.getFullYear(), h.getMonth(), h.getDate())); };

export default function KrankengeldAussteuerungRechner() {
  const [beginn, setBeginn] = useState('2026-02-02');
  const [laufend, setLaufend] = useState(true);
  const [aktuellBis, setAktuellBis] = useState('');
  const [vorerkrankungen, setVorerkrankungen] = useState<Zeitraum[]>([{ id: 1, von: '', bis: '' }]);
  const [entgeltfortzahlung, setEntgeltfortzahlung] = useState(true);

  const ergebnis = useMemo(() => {
    const start = parse(beginn);
    if (!start) return null;
    const heute = heuteUtc();

    // === 1. Blockfrist: 3 Jahre ab dem ersten AU-Tag wegen dieser Krankheit ===
    // Der erste AU-Tag wegen dieser Krankheit ist der früheste Tag aller angegebenen Zeiträume
    const vor = vorerkrankungen
      .map((z) => ({ von: parse(z.von), bis: parse(z.bis) }))
      .filter((z): z is { von: Date; bis: Date } => !!z.von && !!z.bis && z.bis >= z.von);
    let ersterTag = vor.reduce((min, z) => (z.von < min ? z.von : min), start);
    const blockEndeVon = (d: Date) => addTage(new Date(Date.UTC(d.getUTCFullYear() + BLOCKFRIST_JAHRE, d.getUTCMonth(), d.getUTCDate())), -1);
    let blockEnde = blockEndeVon(ersterTag);
    // Liegt der Beginn der aktuellen AU schon hinter dem Ende dieser Blockfrist, startet mit ihm eine neue Blockfrist
    let neueBlockfrist = false;
    if (start > blockEnde) { ersterTag = start; blockEnde = blockEndeVon(start); neueBlockfrist = true; }

    // === 2. Verbrauchte Tage: Vorerkrankungen innerhalb der Blockfrist (inkl. Entgeltfortzahlung, § 48 Abs. 3) ===
    let verbraucht = 0;
    for (const z of neueBlockfrist ? [] : vor) {
      const a = z.von < ersterTag ? ersterTag : z.von;
      const b = z.bis > blockEnde ? blockEnde : z.bis;
      if (b >= a) verbraucht += tage(a, b);
    }

    // === 3. Aktueller AU-Zeitraum ===
    const aktuellEnde = laufend ? null : parse(aktuellBis);
    const restVorAktuell = Math.max(0, MAX_TAGE - verbraucht);
    // Aussteuerung: der Tag, an dem der 546. Tag erreicht ist
    const aussteuerung = addTage(start, restVorAktuell - 1);
    const aussteuerungInBlock = aussteuerung <= blockEnde;
    const aktuellTageBisHeute = tage(start, aktuellEnde && aktuellEnde < heute ? aktuellEnde : heute);
    const verbrauchtGesamt = Math.min(MAX_TAGE, verbraucht + Math.max(0, aktuellTageBisHeute));
    const restHeute = Math.max(0, MAX_TAGE - verbrauchtGesamt);
    const efzTage = entgeltfortzahlung ? Math.min(ENTGELTFORTZAHLUNG_TAGE, restVorAktuell) : 0;
    const krankengeldTage = Math.max(0, restVorAktuell - efzTage);
    const krankengeldBeginn = addTage(start, efzTage);

    // === 4. Nächste Blockfrist ===
    const naechsteBlockfrist = addTage(blockEnde, 1);
    const fruehesterNeuerAnspruch = new Date(Date.UTC(aussteuerung.getUTCFullYear(), aussteuerung.getUTCMonth() + MINDEST_PAUSE_MONATE, aussteuerung.getUTCDate() + 1));

    return {
      ersterTag, blockEnde, neueBlockfrist, verbraucht, restVorAktuell, aussteuerung, aussteuerungInBlock, restHeute, verbrauchtGesamt,
      efzTage, krankengeldTage, krankengeldBeginn, naechsteBlockfrist,
      neuerAnspruchAb: fruehesterNeuerAnspruch > naechsteBlockfrist ? fruehesterNeuerAnspruch : naechsteBlockfrist,
      bereitsAusgesteuert: !laufend && aktuellEnde ? false : heute > aussteuerung,
      wochenRest: Math.floor(restVorAktuell / 7),
    };
  }, [beginn, laufend, aktuellBis, vorerkrankungen, entgeltfortzahlung]);

  const setZ = (id: number, f: 'von' | 'bis', v: string) => setVorerkrankungen((zs) => zs.map((z) => (z.id === id ? { ...z, [f]: v } : z)));
  const addZ = () => setVorerkrankungen((zs) => [...zs, { id: Math.max(0, ...zs.map((z) => z.id)) + 1, von: '', bis: '' }]);
  const rmZ = (id: number) => setVorerkrankungen((zs) => (zs.length > 1 ? zs.filter((z) => z.id !== id) : [{ id: 1, von: '', bis: '' }]));

  const inputCls = 'w-full text-lg font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-0 outline-none';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Beginn der aktuellen Arbeitsunfähigkeit</span>
              <span className="text-xs text-gray-500 block mt-1">Erster Tag der laufenden Krankschreibung wegen dieser Krankheit</span>
            </label>
            <input type="date" value={beginn} onChange={(e) => setBeginn(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Voraussichtliches Ende</span>
              <span className="text-xs text-gray-500 block mt-1">Leer lassen, wenn offen</span>
            </label>
            <input type="date" value={aktuellBis} onChange={(e) => { setAktuellBis(e.target.value); setLaufend(!e.target.value); }} className={inputCls} />
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer mb-5">
          <input type="checkbox" checked={entgeltfortzahlung} onChange={(e) => setEntgeltfortzahlung(e.target.checked)} className="w-5 h-5 mt-0.5 accent-red-500" />
          <span className="text-sm text-gray-700">Zu Beginn zahlt der Arbeitgeber <strong>6 Wochen Entgeltfortzahlung</strong> (kein Anspruch, wenn die Beschäftigung noch keine 4 Wochen bestand oder bei Fortsetzungserkrankung innerhalb von 6 Monaten schon ausgeschöpft)</span>
        </label>

        <div>
          <span className="text-gray-700 font-medium block mb-1">Frühere Arbeitsunfähigkeit wegen derselben Krankheit</span>
          <span className="text-xs text-gray-500 block mb-3">Alle Zeiten der letzten drei Jahre, in denen Sie wegen dieser Krankheit krankgeschrieben waren – auch mit Lohnfortzahlung, auch wenn eine andere Krankheit hinzukam. Der früheste Tag startet die Blockfrist.</span>
          <div className="space-y-3">
            {vorerkrankungen.map((z, i) => (
              <div key={z.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                <div>{i === 0 && <span className="text-xs text-gray-500 block mb-1">von</span>}<input type="date" value={z.von} onChange={(e) => setZ(z.id, 'von', e.target.value)} className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-0 outline-none text-sm" /></div>
                <div>{i === 0 && <span className="text-xs text-gray-500 block mb-1">bis</span>}<input type="date" value={z.bis} onChange={(e) => setZ(z.id, 'bis', e.target.value)} className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-0 outline-none text-sm" /></div>
                <button onClick={() => rmZ(z.id)} className="py-2 px-3 rounded-xl bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 text-sm" aria-label="Zeitraum entfernen">✕</button>
              </div>
            ))}
          </div>
          {vorerkrankungen.length < 8 && <button onClick={addZ} className="mt-3 text-sm text-red-600 hover:underline font-medium">+ weiteren Zeitraum hinzufügen</button>}
        </div>
      </div>

      {!ergebnis ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 text-sm text-amber-800">Bitte den Beginn der Arbeitsunfähigkeit eingeben.</div>
      ) : (
        <>
          <div className={`bg-gradient-to-br ${ergebnis.restVorAktuell === 0 ? 'from-gray-600 to-gray-800' : 'from-red-500 to-rose-600'} rounded-2xl shadow-lg p-6 text-white mb-6`}>
            <h3 className="text-sm font-medium opacity-80 mb-1">🗓️ Voraussichtliche Aussteuerung (Ende des Krankengeldes)</h3>
            <div className="mb-4">
              <div className="text-4xl sm:text-5xl font-bold">{ergebnis.restVorAktuell === 0 ? 'bereits ausgeschöpft' : fmtDatum(ergebnis.aussteuerung)}</div>
              <p className="mt-2 text-sm opacity-90">
                {ergebnis.restVorAktuell === 0
                  ? 'Die 78 Wochen dieser Blockfrist sind durch die Vorerkrankungen bereits verbraucht – für die aktuelle Arbeitsunfähigkeit gibt es in dieser Blockfrist kein Krankengeld mehr.'
                  : `Ab diesem Tag sind die 78 Wochen (546 Tage) wegen dieser Krankheit innerhalb der Blockfrist verbraucht${ergebnis.aussteuerungInBlock ? '' : ' – die Blockfrist endet aber schon vorher, dann beginnt eine neue'}.`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Blockfrist (3 Jahre)</span><div className="text-lg font-bold">{fmtDatum(ergebnis.ersterTag)} – {fmtDatum(ergebnis.blockEnde)}</div></div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Durch Vorerkrankungen verbraucht</span><div className="text-xl font-bold">{ergebnis.verbraucht} Tage</div></div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Noch offen ab Beginn der aktuellen AU</span><div className="text-xl font-bold">{ergebnis.restVorAktuell} Tage <span className="text-sm font-normal opacity-80">({ergebnis.wochenRest} Wochen)</span></div></div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Davon Krankengeld der Kasse</span><div className="text-xl font-bold">{ergebnis.krankengeldTage} Tage</div>{ergebnis.efzTage > 0 && <span className="text-xs opacity-70">nach {ergebnis.efzTage} Tagen Entgeltfortzahlung, ab {fmtDatum(ergebnis.krankengeldBeginn)}</span>}</div>
            </div>
            {ergebnis.neueBlockfrist && (
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm mt-3 text-sm">
                Ihre Vorerkrankungen liegen in einer abgelaufenen Blockfrist. Mit der aktuellen Arbeitsunfähigkeit beginnt eine neue –
                vorausgesetzt, Sie waren zwischendurch mindestens 6 Monate nicht wegen dieser Krankheit arbeitsunfähig und erwerbstätig (§ 48 Abs. 2).
              </div>
            )}
            {ergebnis.restVorAktuell > 0 && (
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm mt-3 text-sm">
                Stand heute sind {ergebnis.verbrauchtGesamt} von 546 Tagen verbraucht – <strong>{ergebnis.restHeute} Tage</strong> Restanspruch.
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-3">➡️ Und danach?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2"><span>•</span><span><strong>Neue Blockfrist ab {fmtDatum(ergebnis.naechsteBlockfrist)}:</strong> Ein neuer Anspruch auf 78 Wochen wegen derselben Krankheit entsteht nur, wenn Sie bei erneuter Arbeitsunfähigkeit mit Krankengeldanspruch versichert sind und zwischendurch mindestens 6 Monate nicht wegen dieser Krankheit arbeitsunfähig und erwerbstätig oder arbeitsuchend gemeldet waren (§ 48 Abs. 2 SGB V) – frühestens also ab {fmtDatum(ergebnis.neuerAnspruchAb)}.</span></li>
              <li className="flex gap-2"><span>•</span><span><strong>Andere Krankheit:</strong> Für eine neue, unabhängige Krankheit beginnt eine eigene Blockfrist mit eigenen 78 Wochen. Kommt sie aber während der laufenden Arbeitsunfähigkeit hinzu, verlängert sie den Anspruch nicht (§ 48 Abs. 1 Satz 2).</span></li>
              <li className="flex gap-2"><span>•</span><span><strong>Arbeitslosengeld nach § 145 SGB III (Nahtlosigkeit):</strong> Wer nach der Aussteuerung weiter arbeitsunfähig ist, beantragt Arbeitslosengeld – die Agentur zahlt, bis die Rentenversicherung über Reha oder Erwerbsminderungsrente entschieden hat. Spätestens 3 Monate vor der Aussteuerung arbeitsuchend melden.</span></li>
              <li className="flex gap-2"><span>•</span><span><strong>Reha vor Rente:</strong> Die Krankenkasse fordert oft schon nach einigen Monaten zum Reha-Antrag auf (§ 51 SGB V); wird daraus ein Rentenantrag, endet das Krankengeld mit Rentenbeginn.</span></li>
            </ul>
          </div>
        </>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-xs text-gray-500">
        <strong>Hinweis:</strong> Der Rechner zählt Kalendertage (78 Wochen = 546 Tage) inklusive Wochenenden und rechnet Zeiten mit
        Entgeltfortzahlung oder ruhendem Anspruch mit (§ 48 Abs. 3 SGB V). Ob eine frühere Arbeitsunfähigkeit „dieselbe Krankheit"
        betrifft, entscheidet die Krankenkasse anhand der ärztlichen Diagnosen – auch verschiedene Diagnosen können als
        dieselbe Krankheit gelten, wenn sie auf einem gemeinsamen Grundleiden beruhen. Zeiten des Verletztengeldbezugs bleiben
        außer Betracht. Keine Rechtsberatung.
      </div>

      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a href="https://www.gesetze-im-internet.de/sgb_5/__48.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 48 SGB V – Dauer des Krankengeldes (78 Wochen in 3 Jahren, neuer Anspruch, Anrechnung ruhender Zeiten)</a>
          <a href="https://www.gesetze-im-internet.de/sgb_5/__46.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 46 SGB V – Entstehen des Anspruchs auf Krankengeld</a>
          <a href="https://www.gesetze-im-internet.de/entgfg/__3.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 3 EFZG – Entgeltfortzahlung für 6 Wochen</a>
          <a href="https://www.gesetze-im-internet.de/sgb_3/__145.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 145 SGB III – Arbeitslosengeld bei Minderung der Leistungsfähigkeit (Nahtlosigkeitsregelung)</a>
          <a href="https://www.gesetze-im-internet.de/sgb_5/__51.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 51 SGB V – Aufforderung zum Reha-Antrag</a>
        </div>
      </div>
    </div>
  );
}
