import { useMemo, useState } from 'react';
import pf from '../../data/pfaendung-2026.json';

// P-Konto-Freibeträge nach §§ 899, 902 ZPO: Grundfreibetrag = Betrag des § 850c Abs. 1 Nr. 1
// (Pfändungsfreigrenzenbekanntmachung 2026, ab 01.07.2026); Erhöhungsbeträge nur mit
// Bescheinigung nach § 903 ZPO. Kindergeld: 259 €/Kind/Monat (§ 66 EStG, Stand 2026).
const M = pf.monatlich;
const KINDERGELD = 259;

function formatEuro(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export default function PKontoRechner() {
  const [personen, setPersonen] = useState(0);
  const [kindergeldKinder, setKindergeldKinder] = useState(0);

  const ergebnis = useMemo(() => {
    const p = Math.min(Math.max(personen, 0), 5);
    const erhoehung = (p >= 1 ? M.erhoehungErstePerson : 0) + Math.max(0, p - 1) * M.erhoehungWeiterePerson;
    const kg = Math.max(0, kindergeldKinder) * KINDERGELD;
    return {
      grund: M.grundbetrag,
      erhoehung,
      kg,
      gesamt: M.grundbetrag + erhoehung + kg,
      brauchtBescheinigung: p > 0 || kindergeldKinder > 0,
    };
  }, [personen, kindergeldKinder]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Personen, denen Sie Unterhalt gewähren</label>
          <select value={personen} onChange={(e) => setPersonen(Number(e.target.value))}
            className="w-full text-xl text-center py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 outline-none">
            {[0, 1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n === 5 ? "5 oder mehr" : n}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kinder, für die Sie Kindergeld erhalten</label>
          <select value={kindergeldKinder} onChange={(e) => setKindergeldKinder(Number(e.target.value))}
            className="w-full text-xl text-center py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 outline-none">
            {[0, 1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-teal-50 rounded-xl p-5 mb-4">
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>Grundfreibetrag (automatisch, § 899 ZPO)</span><span className="font-medium">{formatEuro(ergebnis.grund)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>+ Erhöhung für Unterhaltspersonen (§ 902 ZPO)</span><span className="font-medium">{formatEuro(ergebnis.erhoehung)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-teal-100 pb-2">
          <span>+ Kindergeld ({KINDERGELD} € × {kindergeldKinder})</span><span className="font-medium">{formatEuro(ergebnis.kg)}</span>
        </div>
        <div className="flex justify-between pt-2">
          <span className="font-semibold text-gray-800">Geschützter Betrag pro Monat</span>
          <span className="text-2xl font-bold text-teal-700">{formatEuro(ergebnis.gesamt)}</span>
        </div>
      </div>

      {ergebnis.brauchtBescheinigung && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          <strong>Wichtig:</strong> Nur der Grundfreibetrag von {formatEuro(M.grundbetrag)} gilt automatisch.
          Alle Erhöhungsbeträge schützt die Bank erst mit einer <strong>Bescheinigung nach § 903 ZPO</strong> –
          ausgestellt z. B. von Arbeitgeber, Familienkasse, Sozialleistungsträger, einer anerkannten
          Schuldnerberatungsstelle oder einem Rechtsanwalt. Lehnt die Bank ab, setzt das Vollstreckungsgericht
          den Betrag auf Antrag fest (§ 905 ZPO).
        </div>
      )}
    </div>
  );
}
