import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: September 2026) ===

// Beitragspflichtige Einnahmen nicht erwerbsmäßig tätiger Pflegepersonen in Prozent
// der Bezugsgröße, je Pflegegrad und Leistungsart des Pflegebedürftigen.
// Quelle: § 166 Abs. 2 SGB VI – https://www.gesetze-im-internet.de/sgb_6/__166.html
const PROZENT_BEZUGSGROESSE: Record<Pflegegrad, Record<Leistungsart, number>> = {
  2: { geld: 0.27, kombi: 0.2295, sach: 0.189 },
  3: { geld: 0.43, kombi: 0.3655, sach: 0.301 },
  4: { geld: 0.70, kombi: 0.595, sach: 0.49 },
  5: { geld: 1.00, kombi: 0.85, sach: 0.70 },
};

// Bezugsgröße 2026 (bundeseinheitlich): 47.460 €/Jahr = 3.955 €/Monat
// Quelle: § 1 SVBezGrV 2026 – https://www.gesetze-im-internet.de/svbezgrv_2026/BJNR1160A0025.html
const BEZUGSGROESSE_MONAT = 3955;

// Vorläufiges Durchschnittsentgelt 2026: 51.944 € (= 1,0 Entgeltpunkt)
// Quelle: § 3 Abs. 2 SVBezGrV 2026
const DURCHSCHNITTSENTGELT_2026 = 51944;

// Aktueller Rentenwert seit 1. Juli 2026: 42,52 € je Entgeltpunkt (Rentenanpassung +4,24 %)
// Quelle: Deutsche Rentenversicherung – Rentenanpassung 2026
const RENTENWERT = 42.52;

// Beitragssatz allgemeine Rentenversicherung 2026: 18,6 % (unverändert)
const BEITRAGSSATZ_RV = 0.186;

type Pflegegrad = 2 | 3 | 4 | 5;
type Leistungsart = 'geld' | 'kombi' | 'sach';

const LEISTUNGSARTEN: { id: Leistungsart; label: string; hinweis: string }[] = [
  { id: 'geld', label: 'Nur Pflegegeld', hinweis: 'Angehörige pflegen allein, kein Pflegedienst' },
  { id: 'kombi', label: 'Kombinationsleistung', hinweis: 'Pflegegeld plus ambulanter Pflegedienst' },
  { id: 'sach', label: 'Nur Sachleistung', hinweis: 'Ausschließlich ambulanter Pflegedienst' },
];

const fmtEuro = (n: number) =>
  n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtEP = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
const fmtProzent = (n: number) => (n * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 }) + ' %';

export default function PflegeRentenpunkteRechner() {
  const [pflegegrad, setPflegegrad] = useState<Pflegegrad>(3);
  const [leistungsart, setLeistungsart] = useState<Leistungsart>('geld');
  const [mehrerePersonen, setMehrerePersonen] = useState(false);
  const [anteil, setAnteil] = useState(50);
  const [monate, setMonate] = useState(24);

  // Voraussetzungen nach § 44 Abs. 1 SGB XI / § 3 Satz 1 Nr. 1a, Satz 3 SGB VI
  const [mind10Stunden, setMind10Stunden] = useState(true);
  const [max30Stunden, setMax30Stunden] = useState(true);
  const [keineVollrente, setKeineVollrente] = useState(true);

  const ergebnis = useMemo(() => {
    const voraussetzungenErfuellt = mind10Stunden && max30Stunden && keineVollrente;
    const anteilFaktor = mehrerePersonen ? Math.min(100, Math.max(1, anteil)) / 100 : 1;
    const prozent = PROZENT_BEZUGSGROESSE[pflegegrad][leistungsart];

    // === 1. Beitragsbemessungsgrundlage (§ 166 Abs. 2 u. 3 SGB VI) ===
    const bemessungMonat = BEZUGSGROESSE_MONAT * prozent * anteilFaktor;
    const bemessungJahr = bemessungMonat * 12;

    // === 2. Beitrag, den die Pflegekasse an die Rentenversicherung zahlt (§ 170 Abs. 1 Nr. 6 SGB VI) ===
    const beitragMonat = bemessungMonat * BEITRAGSSATZ_RV;

    // === 3. Entgeltpunkte (§ 70 Abs. 1 SGB VI): Bemessungsgrundlage ÷ Durchschnittsentgelt ===
    const epProJahr = bemessungJahr / DURCHSCHNITTSENTGELT_2026;
    const epGesamt = epProJahr * (Math.max(0, monate) / 12);

    // === 4. Rentenplus zum heutigen Rentenwert ===
    const renteProPflegejahr = epProJahr * RENTENWERT;
    const renteGesamtMonat = epGesamt * RENTENWERT;

    return {
      voraussetzungenErfuellt,
      anteilFaktor,
      prozent,
      bemessungMonat,
      bemessungJahr,
      beitragMonat,
      beitragJahr: beitragMonat * 12,
      epProJahr,
      epGesamt,
      renteProPflegejahr,
      renteGesamtMonat,
      renteGesamtJahr: renteGesamtMonat * 12,
    };
  }, [pflegegrad, leistungsart, mehrerePersonen, anteil, monate, mind10Stunden, max30Stunden, keineVollrente]);

  const jahreText = (() => {
    const j = Math.floor(monate / 12);
    const m = monate % 12;
    if (j === 0) return `${m} ${m === 1 ? 'Monat' : 'Monate'}`;
    if (m === 0) return `${j} ${j === 1 ? 'Jahr' : 'Jahre'}`;
    return `${j} ${j === 1 ? 'Jahr' : 'Jahre'} und ${m} ${m === 1 ? 'Monat' : 'Monate'}`;
  })();

  const btn = (aktiv: boolean) =>
    `py-3 px-3 rounded-xl font-medium transition-all ${aktiv ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Pflegegrad */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Pflegegrad der gepflegten Person</span>
            <span className="text-xs text-gray-500 block mt-1">Rentenbeiträge gibt es erst ab Pflegegrad 2 (§ 44 Abs. 1 SGB XI)</span>
          </label>
          <div className="grid grid-cols-4 gap-3">
            {([2, 3, 4, 5] as Pflegegrad[]).map((pg) => (
              <button key={pg} onClick={() => setPflegegrad(pg)} className={btn(pflegegrad === pg)}>
                PG {pg}
              </button>
            ))}
          </div>
        </div>

        {/* Leistungsart */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Welche Leistung bezieht die gepflegte Person?</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {LEISTUNGSARTEN.map((l) => (
              <button key={l.id} onClick={() => setLeistungsart(l.id)} className={btn(leistungsart === l.id)}>
                <span className="block">{l.label}</span>
                <span className={`block text-xs font-normal mt-1 ${leistungsart === l.id ? 'text-emerald-100' : 'text-gray-500'}`}>{l.hinweis}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mehrere Pflegepersonen */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={mehrerePersonen}
              onChange={(e) => setMehrerePersonen(e.target.checked)}
              className="w-5 h-5 accent-emerald-500"
            />
            <span className="text-gray-700 font-medium">Ich teile mir die Pflege mit anderen Pflegepersonen</span>
          </label>
          {mehrerePersonen && (
            <div className="mt-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Mein Anteil an der gesamten Pflege</span>
                <span className="font-bold text-gray-800">{anteil} %</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={anteil}
                onChange={(e) => setAnteil(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-2">
                Bei mehreren Pflegepersonen werden die Beiträge nach dem vom Medizinischen Dienst festgestellten
                prozentualen Umfang der jeweiligen Pflegetätigkeit aufgeteilt (§ 44 Abs. 1 Satz 3 SGB XI, § 166 Abs. 3 SGB VI).
              </p>
            </div>
          )}
        </div>

        {/* Pflegedauer */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Voraussichtliche Pflegedauer</span>
            <span className="text-xs text-gray-500 block mt-1">Für die Hochrechnung der gesamten Entgeltpunkte</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={monate}
              onChange={(e) => setMonate(Math.max(0, Math.min(480, Math.round(Number(e.target.value)))))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
              min="1"
              max="480"
              step="1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">Monate</span>
          </div>
          <input
            type="range"
            value={monate}
            onChange={(e) => setMonate(Number(e.target.value))}
            className="w-full mt-3 accent-emerald-500"
            min="1"
            max="240"
            step="1"
          />
          <p className="text-xs text-gray-500 mt-1 text-center">= {jahreText}</p>
        </div>

        {/* Voraussetzungen */}
        <div className="border-t border-gray-100 pt-5">
          <span className="text-gray-700 font-medium block mb-3">Voraussetzungen (§ 44 Abs. 1 SGB XI, § 3 SGB VI)</span>
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={mind10Stunden} onChange={(e) => setMind10Stunden(e.target.checked)} className="w-5 h-5 mt-0.5 accent-emerald-500" />
              <span className="text-sm text-gray-700">Ich pflege <strong>mindestens 10 Stunden pro Woche</strong>, verteilt auf regelmäßig <strong>mindestens 2 Tage</strong>, in häuslicher Umgebung</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={max30Stunden} onChange={(e) => setMax30Stunden(e.target.checked)} className="w-5 h-5 mt-0.5 accent-emerald-500" />
              <span className="text-sm text-gray-700">Ich bin daneben <strong>nicht mehr als 30 Stunden pro Woche</strong> erwerbstätig</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={keineVollrente} onChange={(e) => setKeineVollrente(e.target.checked)} className="w-5 h-5 mt-0.5 accent-emerald-500" />
              <span className="text-sm text-gray-700">Ich beziehe <strong>noch keine volle Altersrente</strong> nach Erreichen der Regelaltersgrenze</span>
            </label>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      {ergebnis.voraussetzungenErfuellt ? (
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white mb-6">
          <h3 className="text-sm font-medium opacity-80 mb-1">🤲 Ihr Rentenplus durch die Pflege (brutto, heutiger Rentenwert)</h3>
          <div className="mb-4">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-5xl font-bold">{fmtEuro(ergebnis.renteGesamtMonat)}</span>
              <span className="text-xl opacity-80">pro Monat</span>
            </div>
            <p className="text-emerald-100 mt-2 text-sm">
              nach {jahreText} Pflege bei Pflegegrad {pflegegrad}
              {mehrerePersonen ? ` (Ihr Anteil ${anteil} %)` : ''} – lebenslang ab Rentenbeginn
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">Entgeltpunkte gesamt</span>
              <div className="text-xl font-bold">{fmtEP(ergebnis.epGesamt)} EP</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">Rentenplus je Pflegejahr</span>
              <div className="text-xl font-bold">{fmtEuro(ergebnis.renteProPflegejahr)}/Monat</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">Entgeltpunkte je Pflegejahr</span>
              <div className="text-xl font-bold">{fmtEP(ergebnis.epProJahr)} EP</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">Beitrag der Pflegekasse</span>
              <div className="text-xl font-bold">{fmtEuro(ergebnis.beitragMonat)}/Monat</div>
            </div>
          </div>
          <p className="text-xs text-emerald-100">
            Aufs Jahr gerechnet: {fmtEuro(ergebnis.renteGesamtJahr)} zusätzliche Bruttorente. Die Beiträge zahlt die Pflegekasse
            der gepflegten Person – Sie selbst zahlen nichts.
          </p>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-amber-800 mb-2">⚠️ Voraussetzungen nicht erfüllt – keine Rentenbeiträge</h3>
          <p className="text-sm text-amber-800">
            {!mind10Stunden && 'Die Pflegekasse zahlt Rentenbeiträge nur, wenn Sie wenigstens 10 Stunden wöchentlich an regelmäßig mindestens 2 Tagen pflegen (§ 44 Abs. 1 Satz 1 SGB XI). Mehrere Pflegebedürftige dürfen dafür zusammengerechnet werden (Additionspflege). '}
            {!max30Stunden && 'Wer daneben regelmäßig mehr als 30 Stunden pro Woche erwerbstätig ist, ist als Pflegeperson nicht rentenversicherungspflichtig (§ 3 Satz 3 SGB VI). '}
            {!keineVollrente && 'Wer nach Erreichen der Regelaltersgrenze eine Vollrente wegen Alters bezieht, ist versicherungsfrei (§ 5 Abs. 4 Nr. 1 SGB VI) – die Pflegekasse zahlt dann keine Rentenbeiträge mehr. Bis zur Regelaltersgrenze werden Beiträge auch neben einer vorgezogenen Altersrente gezahlt.'}
          </p>
        </div>
      )}

      {/* Rechenweg */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 So wird gerechnet</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
            <span className="text-gray-600">Bezugsgröße 2026 (monatlich)</span>
            <span className="font-medium text-gray-800 text-right">{fmtEuro(BEZUGSGROESSE_MONAT)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
            <span className="text-gray-600">× Prozentsatz für PG {pflegegrad}, {LEISTUNGSARTEN.find((l) => l.id === leistungsart)!.label}</span>
            <span className="font-medium text-gray-800 text-right">{fmtProzent(ergebnis.prozent)}</span>
          </div>
          {mehrerePersonen && (
            <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
              <span className="text-gray-600">× Ihr Pflegeanteil</span>
              <span className="font-medium text-gray-800 text-right">{anteil} %</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
            <span className="text-gray-600">= Beitragsbemessungsgrundlage je Monat</span>
            <span className="font-medium text-gray-800 text-right">{fmtEuro(ergebnis.bemessungMonat)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
            <span className="text-gray-600">× 18,6 % Beitragssatz = Beitrag der Pflegekasse</span>
            <span className="font-medium text-gray-800 text-right">{fmtEuro(ergebnis.beitragMonat)}/Monat</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
            <span className="text-gray-600">Jahresbemessung {fmtEuro(ergebnis.bemessungJahr)} ÷ Durchschnittsentgelt {fmtEuro(DURCHSCHNITTSENTGELT_2026)}</span>
            <span className="font-medium text-gray-800 text-right">{fmtEP(ergebnis.epProJahr)} EP/Jahr</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
            <span className="text-gray-600">× {jahreText}</span>
            <span className="font-medium text-gray-800 text-right">{fmtEP(ergebnis.epGesamt)} EP</span>
          </div>
          <div className="flex justify-between py-2 gap-4">
            <span className="text-gray-600">× Rentenwert {fmtEuro(RENTENWERT)} (seit 1.7.2026)</span>
            <span className="font-bold text-emerald-700 text-right">{fmtEuro(ergebnis.renteGesamtMonat)}/Monat</span>
          </div>
        </div>
      </div>

      {/* Vergleichstabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">📋 Rentenplus je Pflegejahr – alle Pflegegrade im Vergleich</h3>
        <p className="text-xs text-gray-500 mb-4">Monatliche Bruttorente, die ein volles Jahr Pflege (100 % Pflegeanteil) zum Rentenwert 2026 bringt</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 pr-2 font-semibold text-gray-700">Pflegegrad</th>
                {LEISTUNGSARTEN.map((l) => (
                  <th key={l.id} className="text-right py-2 px-2 font-semibold text-gray-700">{l.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {([2, 3, 4, 5] as Pflegegrad[]).map((pg) => (
                <tr key={pg} className={`border-b border-gray-100 ${pg === pflegegrad ? 'bg-emerald-50' : ''}`}>
                  <td className="py-2 pr-2 font-medium text-gray-800">PG {pg}</td>
                  {LEISTUNGSARTEN.map((l) => {
                    const ep = (BEZUGSGROESSE_MONAT * 12 * PROZENT_BEZUGSGROESSE[pg][l.id]) / DURCHSCHNITTSENTGELT_2026;
                    const aktiv = pg === pflegegrad && l.id === leistungsart;
                    return (
                      <td key={l.id} className={`py-2 px-2 text-right ${aktiv ? 'font-bold text-emerald-700' : 'text-gray-700'}`}>
                        {fmtEuro(ep * RENTENWERT)}
                        <span className="block text-xs text-gray-400">{fmtEP(ep)} EP</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hinweise */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Gut zu wissen</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2"><span>•</span><span><strong>Kein Antrag bei der Rentenversicherung nötig:</strong> Die Pflegekasse fordert einen „Fragebogen zur Zahlung der Beiträge zur sozialen Sicherung für Pflegepersonen" an und meldet die Beiträge selbst. Die Zeiten tauchen dann in Ihrer Renteninformation als Pflichtbeitragszeiten auf.</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Pflegezeiten zählen voll:</strong> Sie sind Pflichtbeitragszeiten – auch für die Wartezeit von 5 Jahren und für die 35 bzw. 45 Jahre der Altersrente für langjährig bzw. besonders langjährig Versicherte.</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Zusätzlich abgesichert:</strong> Pflegepersonen sind während der Pflege gesetzlich unfallversichert (§ 2 Abs. 1 Nr. 17 SGB VII) und unter bestimmten Voraussetzungen arbeitslosenversichert (§ 44 Abs. 2a, 2b SGB XI) – ebenfalls beitragsfrei.</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Private Pflegepflichtversicherung:</strong> Ist die gepflegte Person privat pflegeversichert, zahlt das private Versicherungsunternehmen die Beiträge nach denselben Regeln (§ 44 Abs. 1 Satz 1 SGB XI).</span></li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-xs text-gray-500">
        <strong>Hinweis:</strong> Dieser Rechner liefert eine Schätzung auf Basis der Rechengrößen 2026 und des Rentenwerts
        seit 1. Juli 2026. Die Entgeltpunkte künftiger Jahre hängen vom jeweiligen Durchschnittsentgelt ab, der Rentenwert wird
        jährlich angepasst. Ob die Voraussetzungen vorliegen, stellt die Pflegekasse fest; die Rente wird brutto ausgewiesen –
        Kranken-/Pflegeversicherungsbeiträge und Steuern werden nicht berücksichtigt. Keine Rechts- oder Rentenberatung.
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a href="https://www.gesetze-im-internet.de/sgb_6/__166.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 166 Abs. 2 SGB VI – Beitragspflichtige Einnahmen von Pflegepersonen (Prozentsätze je Pflegegrad)
          </a>
          <a href="https://www.gesetze-im-internet.de/sgb_11/__44.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 44 SGB XI – Leistungen zur sozialen Sicherung der Pflegepersonen (Voraussetzungen)
          </a>
          <a href="https://www.gesetze-im-internet.de/sgb_6/__3.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 3 Satz 1 Nr. 1a, Satz 3 SGB VI – Versicherungspflicht nicht erwerbsmäßig tätiger Pflegepersonen
          </a>
          <a href="https://www.gesetze-im-internet.de/sgb_6/__70.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 70 Abs. 1 SGB VI – Entgeltpunkte für Beitragszeiten
          </a>
          <a href="https://www.gesetze-im-internet.de/svbezgrv_2026/BJNR1160A0025.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            SV-Rechengrößen-Verordnung 2026 – Bezugsgröße 3.955 €/Monat, vorläufiges Durchschnittsentgelt 51.944 €
          </a>
          <a href="https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Familie-und-Kinder/Angehoerige-pflegen/angehoerige-pflegen_node.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            Deutsche Rentenversicherung – Angehörige pflegen: Rentenbeiträge für Pflegepersonen
          </a>
        </div>
      </div>
    </div>
  );
}
