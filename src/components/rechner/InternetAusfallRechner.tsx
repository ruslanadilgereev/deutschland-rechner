import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: September 2026) ===

// Entschädigung bei vollständigem Ausfall, wenn die Störung nicht innerhalb von zwei Kalendertagen
// nach Eingang der Störungsmeldung beseitigt ist: am 3. und 4. Tag 5 € oder 10 %, ab dem 5. Tag
// 10 € oder 20 % des vertraglich vereinbarten Monatsentgelts – je nachdem, was höher ist.
// Quelle: § 58 Abs. 3 TKG – https://www.gesetze-im-internet.de/tkg_2021/__58.html
const TAG_3_4 = { fix: 5, prozent: 0.10 };
const AB_TAG_5 = { fix: 10, prozent: 0.20 };
const ERSTER_ENTSCHAEDIGUNGSTAG = 3;

// Versäumter Kundendienst-/Installationstermin: je Termin 10 € oder 20 % – § 58 Abs. 4 TKG
const TERMIN = { fix: 10, prozent: 0.20 };

// Anbieterwechsel: Unterbrechung länger als ein Arbeitstag → je weiterer Arbeitstag 10 € oder 20 %
// vom abgebenden Anbieter – § 59 Abs. 4 TKG; verzögerte Rufnummernmitnahme 10 € je Tag – § 59 Abs. 6 TKG
const WECHSEL_TAG = { fix: 10, prozent: 0.20 };
const RUFNUMMER_TAG = 10;

type Modus = 'stoerung' | 'termin' | 'wechsel';

const MS_TAG = 86400000;
const parse = (s: string): Date | null => {
  if (!s) return null;
  const d = new Date(s + 'T00:00:00Z');
  return isNaN(d.getTime()) ? null : d;
};
const fmtEuro = (n: number) =>
  n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDatum = (d: Date) => d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });

export default function InternetAusfallRechner() {
  const [modus, setModus] = useState<Modus>('stoerung');
  const [entgelt, setEntgelt] = useState(39.99);

  // Störung
  const [meldung, setMeldung] = useState('2026-09-01');
  const [entstoert, setEntstoert] = useState('2026-09-10');
  const [dauertAn, setDauertAn] = useState(false);
  const [entstoerTagZaehlt, setEntstoerTagZaehlt] = useState(false);
  const [minderung, setMinderung] = useState(0);
  const [ausschluss, setAusschluss] = useState(false);

  // Termin
  const [termine, setTermine] = useState(1);

  // Wechsel
  const [wechselTage, setWechselTage] = useState(3);
  const [rufnummerTage, setRufnummerTage] = useState(0);

  const satz3_4 = Math.max(TAG_3_4.fix, entgelt * TAG_3_4.prozent);
  const satzAb5 = Math.max(AB_TAG_5.fix, entgelt * AB_TAG_5.prozent);
  const satzTermin = Math.max(TERMIN.fix, entgelt * TERMIN.prozent);
  const satzWechsel = Math.max(WECHSEL_TAG.fix, entgelt * WECHSEL_TAG.prozent);

  const stoerung = useMemo(() => {
    const m = parse(meldung);
    const heute = new Date();
    const e = dauertAn ? new Date(Date.UTC(heute.getFullYear(), heute.getMonth(), heute.getDate())) : parse(entstoert);
    if (!m || !e) return null;
    const diff = Math.round((e.getTime() - m.getTime()) / MS_TAG);
    if (diff < 0) return { fehler: 'Die Entstörung kann nicht vor der Störungsmeldung liegen.' } as const;
    // Tag 0 = Tag des Eingangs der Störungsmeldung; danach jeder volle Kalendertag des Ausfalls
    const ausfallTage = Math.max(0, diff - (entstoerTagZaehlt || dauertAn ? 0 : 1));
    const tage: { nr: number; datum: Date; satz: number }[] = [];
    for (let i = 1; i <= ausfallTage; i++) {
      const satz = i < ERSTER_ENTSCHAEDIGUNGSTAG ? 0 : i <= 4 ? satz3_4 : satzAb5;
      tage.push({ nr: i, datum: new Date(m.getTime() + i * MS_TAG), satz });
    }
    const brutto = tage.reduce((s, t) => s + t.satz, 0);
    const tage3_4 = tage.filter((t) => t.nr === 3 || t.nr === 4).length;
    const tageAb5 = tage.filter((t) => t.nr >= 5).length;
    const netto = Math.max(0, brutto - Math.max(0, minderung));
    return { ausfallTage, tage, tage3_4, tageAb5, brutto, netto, ende: e };
  }, [meldung, entstoert, dauertAn, entstoerTagZaehlt, minderung, satz3_4, satzAb5]);

  const terminSumme = Math.max(0, termine) * satzTermin;
  const wechselSumme = Math.max(0, wechselTage - 1) * satzWechsel + Math.max(0, rufnummerTage) * RUFNUMMER_TAG;

  const btn = (aktiv: boolean) =>
    `py-3 px-3 rounded-xl font-medium transition-all text-sm ${aktiv ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`;
  const inputCls = 'w-full text-lg font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="mb-6">
          <span className="text-gray-700 font-medium block mb-3">Was ist passiert?</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button onClick={() => setModus('stoerung')} className={btn(modus === 'stoerung')}>Internet/Telefon komplett ausgefallen</button>
            <button onClick={() => setModus('termin')} className={btn(modus === 'termin')}>Techniker-Termin versäumt</button>
            <button onClick={() => setModus('wechsel')} className={btn(modus === 'wechsel')}>Anbieterwechsel hakt</button>
          </div>
        </div>

        {/* Monatsentgelt */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Vertraglich vereinbartes Monatsentgelt</span>
            <span className="text-xs text-gray-500 block mt-1">Der feste Grundpreis Ihres Vertrags (ohne Einmalkosten, Router-Miete gehört dazu, wenn sie Teil des Monatspreises ist)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={entgelt}
              onChange={(e) => setEntgelt(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none"
              min="0"
              max="500"
              step="0.01"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€/Monat</span>
          </div>
          <input type="range" value={entgelt} onChange={(e) => setEntgelt(Number(e.target.value))} className="w-full mt-3 accent-indigo-500" min="10" max="120" step="1" />
          <p className="text-xs text-gray-500 mt-1">
            Tagessätze bei diesem Entgelt: Tag 3 und 4 je <strong>{fmtEuro(satz3_4)}</strong>, ab Tag 5 je <strong>{fmtEuro(satzAb5)}</strong>
            {entgelt * 0.1 > 5 ? ' (Prozentsatz greift)' : ' (Mindestbetrag greift)'}
          </p>
        </div>

        {modus === 'stoerung' && (
          <>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-2">
                  <span className="text-gray-700 font-medium">Störung gemeldet am</span>
                  <span className="text-xs text-gray-500 block mt-1">Tag, an dem die Meldung beim Anbieter eingegangen ist</span>
                </label>
                <input type="date" value={meldung} onChange={(e) => setMeldung(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block mb-2">
                  <span className="text-gray-700 font-medium">Wieder funktionsfähig seit</span>
                  <span className="text-xs text-gray-500 block mt-1">Tag der Entstörung</span>
                </label>
                <input type="date" value={entstoert} onChange={(e) => setEntstoert(e.target.value)} disabled={dauertAn} className={`${inputCls} ${dauertAn ? 'opacity-50' : ''}`} />
              </div>
            </div>
            <div className="space-y-3 mb-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={dauertAn} onChange={(e) => setDauertAn(e.target.checked)} className="w-5 h-5 mt-0.5 accent-indigo-500" />
                <span className="text-sm text-gray-700">Die Störung dauert noch an (bis heute rechnen)</span>
              </label>
              {!dauertAn && (
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={entstoerTagZaehlt} onChange={(e) => setEntstoerTagZaehlt(e.target.checked)} className="w-5 h-5 mt-0.5 accent-indigo-500" />
                  <span className="text-sm text-gray-700">Am Tag der Entstörung war der Anschluss noch den größten Teil des Tages tot (Tag mitzählen)</span>
                </label>
              )}
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={ausschluss} onChange={(e) => setAusschluss(e.target.checked)} className="w-5 h-5 mt-0.5 accent-indigo-500" />
                <span className="text-sm text-gray-700">
                  Ich habe die Störung selbst zu vertreten, oder sie beruht auf höherer Gewalt, behördlichen Anordnungen
                  oder gesetzlich vorgeschriebenen Maßnahmen (dann kein Anspruch)
                </span>
              </label>
            </div>
            <div>
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Bereits erhaltene Minderung für diese Störung</span>
                <span className="text-xs text-gray-500 block mt-1">Eine Minderung nach § 57 Abs. 4 TKG wird auf die Entschädigung angerechnet</span>
              </label>
              <div className="relative">
                <input type="number" value={minderung} onChange={(e) => setMinderung(Math.max(0, Number(e.target.value)))} className={inputCls} min="0" step="0.01" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
            </div>
          </>
        )}

        {modus === 'termin' && (
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Vom Anbieter versäumte Kundendienst- oder Installationstermine</span>
              <span className="text-xs text-gray-500 block mt-1">Vereinbarte Termine, zu denen der Techniker nicht erschienen ist – ohne dass Sie es zu vertreten haben</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setTermine(n)} className={btn(termine === n)}>{n}</button>
              ))}
            </div>
          </div>
        )}

        {modus === 'wechsel' && (
          <div className="space-y-4">
            <div>
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Arbeitstage ohne Anschluss beim Anbieterwechsel</span>
                <span className="text-xs text-gray-500 block mt-1">Der Dienst darf höchstens einen Arbeitstag unterbrochen sein (§ 59 Abs. 2 TKG) – jeder weitere Arbeitstag wird entschädigt</span>
              </label>
              <div className="relative">
                <input type="number" value={wechselTage} onChange={(e) => setWechselTage(Math.max(0, Math.round(Number(e.target.value))))} className={inputCls} min="0" max="60" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Arbeitstage</span>
              </div>
            </div>
            <div>
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Tage Verzögerung bei der Rufnummernmitnahme</span>
                <span className="text-xs text-gray-500 block mt-1">Wenn die Nummer nicht spätestens am Arbeitstag nach dem vereinbarten Tag aktiv ist: 10 € je Tag (§ 59 Abs. 6 TKG)</span>
              </label>
              <div className="relative">
                <input type="number" value={rufnummerTage} onChange={(e) => setRufnummerTage(Math.max(0, Math.round(Number(e.target.value))))} className={inputCls} min="0" max="60" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Tage</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ergebnis Störung */}
      {modus === 'stoerung' && (
        !stoerung ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 text-sm text-amber-800">Bitte beide Datumsangaben ausfüllen.</div>
        ) : 'fehler' in stoerung ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 text-sm text-amber-800">{stoerung.fehler}</div>
        ) : ausschluss ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-amber-800 mb-2">Kein Entschädigungsanspruch</h3>
            <p className="text-sm text-amber-800">
              Nach § 58 Abs. 3 Satz 1 TKG entfällt die Entschädigung, wenn der Verbraucher die Störung oder ihr Fortdauern zu
              vertreten hat oder die Unterbrechung auf gesetzlich festgelegten Maßnahmen, sicherheitsbehördlichen Anordnungen
              oder höherer Gewalt beruht. Ein Kabelschaden durch Bauarbeiten gilt dabei in der Regel nicht als höhere Gewalt.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-indigo-500 to-blue-700 rounded-2xl shadow-lg p-6 text-white mb-6">
              <h3 className="text-sm font-medium opacity-80 mb-1">📡 Ihre Entschädigung nach § 58 Abs. 3 TKG</h3>
              <div className="mb-4">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-5xl font-bold">{fmtEuro(stoerung.netto)}</span>
                  {minderung > 0 && <span className="text-xl opacity-80">nach Anrechnung der Minderung</span>}
                </div>
                <p className="text-indigo-100 mt-2 text-sm">
                  {stoerung.ausfallTage} {stoerung.ausfallTage === 1 ? 'Ausfalltag' : 'Ausfalltage'} nach der Meldung
                  {dauertAn ? ' (bis heute)' : ''} – davon {stoerung.tage3_4 + stoerung.tageAb5} entschädigungspflichtig
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <span className="text-sm opacity-80">Tag 1–2: Entstörfrist</span>
                  <div className="text-xl font-bold">0,00 €</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <span className="text-sm opacity-80">Tag 3–4: {stoerung.tage3_4} × {fmtEuro(satz3_4)}</span>
                  <div className="text-xl font-bold">{fmtEuro(stoerung.tage3_4 * satz3_4)}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <span className="text-sm opacity-80">Ab Tag 5: {stoerung.tageAb5} × {fmtEuro(satzAb5)}</span>
                  <div className="text-xl font-bold">{fmtEuro(stoerung.tageAb5 * satzAb5)}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <span className="text-sm opacity-80">Weiter aufgelaufen je Tag</span>
                  <div className="text-xl font-bold">{dauertAn ? `+ ${fmtEuro(stoerung.ausfallTage >= 4 ? satzAb5 : stoerung.ausfallTage >= 2 ? satz3_4 : 0)}` : '–'}</div>
                </div>
              </div>
              {stoerung.ausfallTage < ERSTER_ENTSCHAEDIGUNGSTAG && (
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-sm">
                  Der Anbieter hat zwei Kalendertage Zeit zur Entstörung. Erst ab dem dritten Tag nach der Meldung gibt es Geld.
                </div>
              )}
            </div>

            {/* Tagestabelle */}
            {stoerung.tage.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <h3 className="font-bold text-gray-800 mb-1">📅 Aufschlüsselung nach Tagen</h3>
                <p className="text-xs text-gray-500 mb-4">Tag 0 = Eingang der Störungsmeldung ({fmtDatum(parse(meldung)!)})</p>
                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-2 pr-2 font-semibold text-gray-700">Tag</th>
                        <th className="text-left py-2 px-2 font-semibold text-gray-700">Datum</th>
                        <th className="text-left py-2 px-2 font-semibold text-gray-700">Regel</th>
                        <th className="text-right py-2 pl-2 font-semibold text-gray-700">Entschädigung</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stoerung.tage.map((t) => (
                        <tr key={t.nr} className={`border-b border-gray-100 ${t.satz === 0 ? 'text-gray-400' : 'text-gray-700'}`}>
                          <td className="py-1.5 pr-2 font-medium">{t.nr}</td>
                          <td className="py-1.5 px-2">{fmtDatum(t.datum)}</td>
                          <td className="py-1.5 px-2 text-xs">{t.nr < 3 ? 'Entstörfrist' : t.nr <= 4 ? '5 € oder 10 %' : '10 € oder 20 %'}</td>
                          <td className="py-1.5 pl-2 text-right font-medium">{fmtEuro(t.satz)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-200">
                        <td colSpan={3} className="py-2 font-semibold text-gray-800">Summe{minderung > 0 ? ` (abzüglich ${fmtEuro(minderung)} Minderung)` : ''}</td>
                        <td className="py-2 pl-2 text-right font-bold text-indigo-700">{fmtEuro(stoerung.netto)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </>
        )
      )}

      {/* Ergebnis Termin */}
      {modus === 'termin' && (
        <div className="bg-gradient-to-br from-indigo-500 to-blue-700 rounded-2xl shadow-lg p-6 text-white mb-6">
          <h3 className="text-sm font-medium opacity-80 mb-1">📡 Ihre Entschädigung nach § 58 Abs. 4 TKG</h3>
          <div className="flex items-baseline gap-2 flex-wrap mb-2">
            <span className="text-5xl font-bold">{fmtEuro(terminSumme)}</span>
            <span className="text-xl opacity-80">für {termine} {termine === 1 ? 'versäumten Termin' : 'versäumte Termine'}</span>
          </div>
          <p className="text-indigo-100 text-sm">
            Je Termin 10 € oder 20 % des Monatsentgelts ({fmtEuro(entgelt * 0.2)}) – der höhere Betrag zählt: {fmtEuro(satzTermin)}.
            Die Entschädigung entfällt nur, wenn Sie das Versäumnis selbst zu vertreten haben.
          </p>
        </div>
      )}

      {/* Ergebnis Wechsel */}
      {modus === 'wechsel' && (
        <div className="bg-gradient-to-br from-indigo-500 to-blue-700 rounded-2xl shadow-lg p-6 text-white mb-6">
          <h3 className="text-sm font-medium opacity-80 mb-1">📡 Ihre Entschädigung nach § 59 Abs. 4 und 6 TKG</h3>
          <div className="flex items-baseline gap-2 flex-wrap mb-4">
            <span className="text-5xl font-bold">{fmtEuro(wechselSumme)}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">Unterbrechung: {Math.max(0, wechselTage - 1)} × {fmtEuro(satzWechsel)}</span>
              <div className="text-xl font-bold">{fmtEuro(Math.max(0, wechselTage - 1) * satzWechsel)}</div>
              <span className="text-xs opacity-70">vom abgebenden Anbieter, erster Arbeitstag ist erlaubt</span>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">Rufnummer: {rufnummerTage} × 10 €</span>
              <div className="text-xl font-bold">{fmtEuro(rufnummerTage * RUFNUMMER_TAG)}</div>
              <span className="text-xs opacity-70">vom Anbieter, der die Verzögerung zu vertreten hat</span>
            </div>
          </div>
        </div>
      )}

      {/* Nachweise */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📝 Das brauchen Sie für die Forderung</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2"><span>•</span><span><strong>Nachweis der Störungsmeldung:</strong> Ticketnummer, E-Mail-Bestätigung oder Datum/Uhrzeit des Anrufs. Der Anbieter muss den Eingang dokumentieren (§ 58 Abs. 2 TKG) – fragen Sie nach der Bestätigung.</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Nachweis des vollständigen Ausfalls:</strong> Screenshots der Router-Statusseite, Fehlermeldungen, Protokoll der Störungshotline. Nur ein <em>vollständiger</em> Ausfall wird entschädigt – bei langsamem Internet gilt stattdessen die Minderung nach § 57 Abs. 4 TKG mit der Breitbandmessung der Bundesnetzagentur.</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Rechnung mit dem Monatsentgelt:</strong> Der Prozentsatz bezieht sich auf das vertraglich vereinbarte monatliche Entgelt.</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Schriftliche Forderung:</strong> Betrag mit Rechenweg an den Anbieter, Frist von 14 Tagen setzen. Zahlt er nicht, hilft die Schlichtungsstelle Telekommunikation der Bundesnetzagentur – kostenlos.</span></li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-xs text-gray-500">
        <strong>Hinweis:</strong> Der Rechner zählt den Tag des Eingangs der Störungsmeldung als Tag 0 und jeden folgenden
        Kalendertag des vollständigen Ausfalls als Ausfalltag; Entschädigung gibt es ab Tag 3. Bei Verträgen ohne
        gleichbleibendes Monatsentgelt (z. B. Prepaid) gelten nur die festen Mindestbeträge. Die Entschädigung wird auf einen
        weitergehenden Schadensersatz angerechnet und umgekehrt. Geschäftskunden haben den Anspruch nur, wenn keine
        abweichende Individualvereinbarung besteht. Keine Rechtsberatung.
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a href="https://www.gesetze-im-internet.de/tkg_2021/__58.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 58 TKG – Entstörung: Entschädigung bei vollständigem Ausfall (Abs. 3) und versäumten Terminen (Abs. 4)
          </a>
          <a href="https://www.gesetze-im-internet.de/tkg_2021/__59.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 59 TKG – Anbieterwechsel und Rufnummernmitnahme: Entschädigung (Abs. 4 und 6)
          </a>
          <a href="https://www.gesetze-im-internet.de/tkg_2021/__57.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 57 TKG – Minderungsrecht bei Abweichung von der vertraglich vereinbarten Leistung (Abs. 4)
          </a>
          <a href="https://www.bundesnetzagentur.de/DE/Vportal/TK/InternetTelefon/Internetgeschwindigkeit/start.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            Bundesnetzagentur – Internetgeschwindigkeit und Breitbandmessung (Nachweisverfahren für Minderung)
          </a>
        </div>
      </div>
    </div>
  );
}
