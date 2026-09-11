import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: September 2026) ===

// Abfindung bei der ersten Wiederheirat: das 24-Fache des Monatsbetrags – § 107 Abs. 1 Satz 1 SGB VI
const FAKTOR = 24;

// Kleine Witwenrente (befristet auf 24 Monate): das 24-Fache vermindert sich um die Zahl der Monate,
// für die die kleine Witwenrente bereits geleistet wurde – § 107 Abs. 1 Satz 3 SGB VI
const KLEINE_RENTE_MAX_MONATE = 24;

// Monatsbetrag = Durchschnitt der Witwenrente der letzten 12 Kalendermonate; bei Wiederheirat vor Ablauf
// des 15. Kalendermonats nach dem Tod: Durchschnitt der Rente nach dem Sterbevierteljahr – § 107 Abs. 2 SGB VI
const KURZ_NACH_TOD_MONATE = 15;

const fmtEuro = (n: number) =>
  n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function WitwenrenteAbfindungRechner() {
  const [art, setArt] = useState<'gross' | 'klein'>('gross');
  const [monatsbetrag, setMonatsbetrag] = useState(950);
  const [kurzNachTod, setKurzNachTod] = useState(false);
  const [renteNachSterbevierteljahr, setRenteNachSterbevierteljahr] = useState(950);
  const [bezogeneMonate, setBezogeneMonate] = useState(6);
  const [ersteWiederheirat, setErsteWiederheirat] = useState(true);

  const ergebnis = useMemo(() => {
    const basis = kurzNachTod ? Math.max(0, renteNachSterbevierteljahr) : Math.max(0, monatsbetrag);
    const monate = art === 'klein' ? Math.max(0, KLEINE_RENTE_MAX_MONATE - Math.min(KLEINE_RENTE_MAX_MONATE, bezogeneMonate)) : FAKTOR;
    const abfindung = ersteWiederheirat ? basis * monate : 0;
    return { basis, monate, abfindung };
  }, [art, monatsbetrag, kurzNachTod, renteNachSterbevierteljahr, bezogeneMonate, ersteWiederheirat]);

  const btn = (aktiv: boolean) =>
    `py-3 px-3 rounded-xl font-medium transition-all text-sm ${aktiv ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`;
  const inputCls = 'w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-0 outline-none';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="mb-6">
          <span className="text-gray-700 font-medium block mb-2">Welche Witwen-/Witwerrente beziehen Sie?</span>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setArt('gross')} className={btn(art === 'gross')}>Große Witwenrente<span className="block text-xs font-normal">unbefristet, 55 % / 60 %</span></button>
            <button onClick={() => setArt('klein')} className={btn(art === 'klein')}>Kleine Witwenrente<span className="block text-xs font-normal">befristet auf 24 Monate, 25 %</span></button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Durchschnittliche Witwenrente der letzten 12 Monate</span>
            <span className="text-xs text-gray-500 block mt-1">Monatsbetrag der Rente nach Einkommensanrechnung laut Rentenbescheid (vor Abzug Ihrer Kranken- und Pflegeversicherungsbeiträge) – Summe der letzten zwölf Monatsbeträge geteilt durch 12</span>
          </label>
          <div className="relative">
            <input type="number" value={monatsbetrag} onChange={(e) => setMonatsbetrag(Math.max(0, Number(e.target.value) || 0))} className={inputCls} min="0" step="10" disabled={kurzNachTod} />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€/Monat</span>
          </div>
          <input type="range" value={monatsbetrag} onChange={(e) => setMonatsbetrag(Number(e.target.value))} className="w-full mt-3 accent-violet-600" min="100" max="2500" step="10" disabled={kurzNachTod} />
        </div>

        <div className="space-y-3 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={kurzNachTod} onChange={(e) => setKurzNachTod(e.target.checked)} className="w-5 h-5 mt-0.5 accent-violet-600" />
            <span className="text-sm text-gray-700">Ich heirate <strong>vor Ablauf des 15. Kalendermonats nach dem Tod</strong> – dann zählt nicht der Zwölfmonats-Durchschnitt, sondern die Rente nach dem Sterbevierteljahr (§ 107 Abs. 2 Satz 2 und 3)</span>
          </label>
          {kurzNachTod && (
            <div>
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Monatliche Witwenrente nach dem Sterbevierteljahr</span>
                <span className="text-xs text-gray-500 block mt-1">Der gekürzte Betrag ab dem 4. Monat nach dem Sterbemonat (nicht die volle Versichertenrente der ersten drei Monate)</span>
              </label>
              <div className="relative">
                <input type="number" value={renteNachSterbevierteljahr} onChange={(e) => setRenteNachSterbevierteljahr(Math.max(0, Number(e.target.value) || 0))} className={inputCls} min="0" step="10" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€/Monat</span>
              </div>
            </div>
          )}
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={ersteWiederheirat} onChange={(e) => setErsteWiederheirat(e.target.checked)} className="w-5 h-5 mt-0.5 accent-violet-600" />
            <span className="text-sm text-gray-700">Es ist meine <strong>erste Wiederheirat</strong> (bzw. erste Begründung einer Lebenspartnerschaft) nach dem Tod des Versicherten</span>
          </label>
        </div>

        {art === 'klein' && (
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Bereits bezogene Monate der kleinen Witwenrente</span>
              <span className="text-xs text-gray-500 block mt-1">Die kleine Witwenrente ist auf 24 Monate befristet – abgefunden werden nur die restlichen Monate</span>
            </label>
            <div className="relative">
              <input type="number" value={bezogeneMonate} onChange={(e) => setBezogeneMonate(Math.max(0, Math.min(24, Math.round(Number(e.target.value) || 0))))} className={inputCls} min="0" max="24" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">Monate</span>
            </div>
          </div>
        )}
      </div>

      {!ersteWiederheirat ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-amber-800 mb-2">Keine Abfindung bei einer zweiten Wiederheirat</h3>
          <p className="text-sm text-amber-800">
            Die Rentenabfindung gibt es nur bei der <strong>ersten</strong> Wiederheirat (§ 107 Abs. 1 Satz 1 SGB VI). Wer nach dem
            Ende der zweiten Ehe eine wiederaufgelebte Witwenrente bezieht und erneut heiratet, erhält keine weitere Abfindung – die
            Witwenrente endet dann einfach mit dem Ablauf des Heiratsmonats.
          </p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl shadow-lg p-6 text-white mb-6">
          <h3 className="text-sm font-medium opacity-80 mb-1">💍 Ihre Rentenabfindung bei Wiederheirat</h3>
          <div className="mb-4">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-5xl font-bold">{fmtEuro(ergebnis.abfindung)}</span>
              <span className="text-xl opacity-80">einmalig</span>
            </div>
            <p className="text-violet-100 mt-2 text-sm">
              {ergebnis.monate} × {fmtEuro(ergebnis.basis)} – steuerfrei (§ 3 Nr. 3 Buchst. a EStG), keine Sozialabgaben
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">Maßgeblicher Monatsbetrag</span>
              <div className="text-xl font-bold">{fmtEuro(ergebnis.basis)}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">Abgefundene Monate</span>
              <div className="text-xl font-bold">{ergebnis.monate}{art === 'klein' ? ` von ${KLEINE_RENTE_MAX_MONATE}` : ''}</div>
            </div>
          </div>
          {art === 'klein' && ergebnis.monate === 0 && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm mt-3 text-sm">Die 24 Monate der kleinen Witwenrente sind aufgebraucht – es bleibt nichts abzufinden.</div>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Was Sie vor der Hochzeit wissen sollten</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2"><span>•</span><span><strong>Die Rente endet mit dem Heiratsmonat.</strong> Ab dem Folgemonat gibt es keine Witwenrente mehr – die Abfindung ersetzt zwei Jahre Rente, danach ist Schluss. Bei einer durchschnittlichen Restlebenserwartung ist die laufende Rente meist deutlich mehr wert.</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Antrag nötig:</strong> Die Abfindung wird nicht automatisch gezahlt. Antrag bei der Deutschen Rentenversicherung stellen und die Heiratsurkunde beilegen; die Rentenversicherung ist über die Heirat ohnehin unverzüglich zu informieren.</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Wiederaufleben (§ 46 Abs. 3 SGB VI):</strong> Endet die neue Ehe durch Tod oder Scheidung, lebt die Witwenrente aus der ersten Ehe auf Antrag wieder auf – aber Unterhalts- oder Rentenansprüche aus der zweiten Ehe werden angerechnet, und eine weitere Abfindung gibt es nicht.</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Gekürzte Rente zählt:</strong> Maßgeblich ist die tatsächlich geleistete Rente nach Einkommensanrechnung. Wer wegen hohen Einkommens nur eine gekürzte Witwenrente erhält, bekommt entsprechend weniger Abfindung.</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Nicht heiraten ist auch eine Option:</strong> Eine nichteheliche Lebensgemeinschaft lässt die Witwenrente unberührt – Partnereinkommen wird nicht angerechnet.</span></li>
        </ul>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-xs text-gray-500">
        <strong>Hinweis:</strong> Der Rechner setzt den eingegebenen Durchschnittsbetrag als Monatsbetrag nach § 107 Abs. 2 SGB VI an.
        Die Rentenversicherung bildet den Durchschnitt aus den tatsächlich geleisteten Beträgen der letzten zwölf Kalendermonate;
        Rentenanpassungen zum 1. Juli fließen anteilig ein. Für Witwengeld nach Beamtenrecht gilt § 21 BeamtVG (ebenfalls 24-Fach),
        für Unfall-Hinterbliebenenrenten § 80 SGB VII. Keine Rechtsberatung.
      </div>

      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a href="https://www.gesetze-im-internet.de/sgb_6/__107.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 107 SGB VI – Rentenabfindung bei Wiederheirat (24-Fach, kleine Witwenrente, Monatsbetrag)</a>
          <a href="https://www.gesetze-im-internet.de/sgb_6/__46.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 46 SGB VI – Witwenrente, Wiederaufleben nach Auflösung der neuen Ehe (Abs. 3)</a>
          <a href="https://www.gesetze-im-internet.de/estg/__3.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 3 Nr. 3 Buchst. a EStG – Steuerfreiheit der Rentenabfindung</a>
          <a href="https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Familie-und-Kinder/Hinterbliebenenrente/hinterbliebenenrente_node.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">Deutsche Rentenversicherung – Hinterbliebenenrente</a>
        </div>
      </div>
    </div>
  );
}
