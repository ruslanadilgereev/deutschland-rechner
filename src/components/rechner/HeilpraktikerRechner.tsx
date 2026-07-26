import { useMemo, useState } from 'react';
import hp from '../../data/heilpraktiker-beihilfe.json';

// Beihilfe-Erstattung für Heilpraktikerleistungen (Bund):
// beihilfefähig = min(Rechnungsbetrag, Höchstbetrag Anlage 2 BBhV),
// Beihilfe = beihilfefähig × Bemessungssatz (§ 46 BBhV: 50/70/80 %).
const LEISTUNGEN = hp.leistungen;
const SAETZE = hp.bemessungssaetze;

function formatEuro(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export default function HeilpraktikerRechner() {
  const [leistungIdx, setLeistungIdx] = useState(7); // Akupunktur
  const [rechnung, setRechnung] = useState(45);
  const [satzIdx, setSatzIdx] = useState(0);

  const ergebnis = useMemo(() => {
    const leistung = LEISTUNGEN[leistungIdx];
    const betrag = Math.max(0, rechnung || 0);
    const beihilfefaehig = Math.min(betrag, leistung.hoechstbetrag);
    const beihilfe = Math.round(beihilfefaehig * SAETZE[satzIdx].satz * 100) / 100;
    return {
      leistung,
      beihilfefaehig,
      beihilfe,
      eigenanteil: Math.round((betrag - beihilfe) * 100) / 100,
      gekappt: betrag > leistung.hoechstbetrag,
    };
  }, [leistungIdx, rechnung, satzIdx]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Leistung (Nummer nach GebüH-Systematik)</label>
        <select
          value={leistungIdx}
          onChange={(e) => setLeistungIdx(Number(e.target.value))}
          className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 outline-none text-sm"
        >
          {LEISTUNGEN.map((l, i) => (
            <option key={l.nr} value={i}>Nr. {l.nr}: {l.label} (max. {formatEuro(l.hoechstbetrag)})</option>
          ))}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Betrag auf der Heilpraktiker-Rechnung</label>
          <div className="relative">
            <input
              type="number"
              min={0}
              step={5}
              value={rechnung}
              onChange={(e) => setRechnung(Number(e.target.value))}
              className="w-full text-xl font-bold text-center py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-violet-500 outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ihr Bemessungssatz (§ 46 BBhV)</label>
          <select
            value={satzIdx}
            onChange={(e) => setSatzIdx(Number(e.target.value))}
            className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 outline-none text-sm"
          >
            {SAETZE.map((s, i) => (
              <option key={s.satz} value={i}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-violet-50 rounded-xl p-5">
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>Beihilfefähig (max. {formatEuro(ergebnis.leistung.hoechstbetrag)}, Anlage 2 BBhV)</span>
          <span className="font-medium">{formatEuro(ergebnis.beihilfefaehig)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-violet-100 pb-2">
          <span>× Bemessungssatz {Math.round(SAETZE[satzIdx].satz * 100)} %</span>
          <span className="font-medium">Beihilfe zahlt {formatEuro(ergebnis.beihilfe)}</span>
        </div>
        <div className="flex justify-between pt-2 items-center">
          <span className="font-semibold text-gray-800">Ihr Eigenanteil</span>
          <span className="text-2xl font-bold text-violet-700">{formatEuro(ergebnis.eigenanteil)}</span>
        </div>
      </div>

      {ergebnis.gekappt && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 mt-4">
          Die Rechnung liegt über dem Höchstbetrag der Anlage 2 BBhV: Der übersteigende Teil
          ({formatEuro(rechnung - ergebnis.leistung.hoechstbetrag)}) ist nicht beihilfefähig und bleibt
          komplett bei Ihnen. Eine private Zusatzversicherung kann diese Lücke je nach Tarif schließen.
        </div>
      )}

      <p className="text-xs text-gray-500 mt-3">
        Gilt für die Bundesbeihilfe; Landesbeihilfen haben teils eigene Regeln. Heilpraktiker-Honorare
        sind frei vereinbar und liegen oft über den Beihilfe-Höchstbeträgen.
      </p>
    </div>
  );
}
