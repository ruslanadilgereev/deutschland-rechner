import { useMemo, useState } from 'react';
import besoldung from '../../data/besoldung-niedersachsen.json';

// Datenbasis: NLBV, Besoldungstabellen Niedersachsen gültig ab 01.04.2026 (+2,8 %, mind. 100 €).
type GruppeA = { startStufe: number; werte: number[] };
const A = besoldung.grundgehaltA as Record<string, GruppeA>;
const B = besoldung.grundgehaltB as Record<string, number>;

function formatEuro(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export default function BesoldungsRechnerNiedersachsen() {
  const [ordnung, setOrdnung] = useState<'A' | 'B'>('A');
  const [gruppeA, setGruppeA] = useState('A 13');
  const [stufe, setStufe] = useState(6);
  const [gruppeB, setGruppeB] = useState('B 3');

  const stufen = useMemo(() => {
    const g = A[gruppeA];
    return Array.from({ length: g.werte.length }, (_, i) => g.startStufe + i);
  }, [gruppeA]);

  const aktiveStufe = stufen.includes(stufe) ? stufe : stufen[0];
  const grundgehalt = ordnung === 'A' ? A[gruppeA].werte[aktiveStufe - A[gruppeA].startStufe] : B[gruppeB];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Besoldungsordnung</label>
          <select value={ordnung} onChange={(e) => setOrdnung(e.target.value as 'A' | 'B')}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-rose-500 outline-none">
            <option value="A">A (Laufbahn)</option>
            <option value="B">B (Festgehälter)</option>
          </select>
        </div>
        {ordnung === 'A' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Besoldungsgruppe</label>
              <select value={gruppeA} onChange={(e) => setGruppeA(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-rose-500 outline-none">
                {Object.keys(A).map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Erfahrungsstufe</label>
              <select value={aktiveStufe} onChange={(e) => setStufe(Number(e.target.value))}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-rose-500 outline-none">
                {stufen.map((s) => <option key={s} value={s}>Stufe {s}</option>)}
              </select>
            </div>
          </>
        ) : (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Besoldungsgruppe</label>
            <select value={gruppeB} onChange={(e) => setGruppeB(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-rose-500 outline-none">
              {Object.keys(B).map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="bg-rose-50 rounded-xl p-5 text-center mb-4">
        <p className="text-sm text-gray-600">
          Grundgehalt ({ordnung === 'A' ? `${gruppeA}, Stufe ${aktiveStufe}` : gruppeB}) – Stand 01.04.2026
        </p>
        <p className="text-3xl font-bold text-rose-700 mt-1">{formatEuro(grundgehalt)} <span className="text-base font-normal text-gray-500">/ Monat</span></p>
        <p className="text-sm text-gray-600 mt-1">Jahresbrutto (12 Monatsbezüge): <strong>{formatEuro(grundgehalt * 12)}</strong></p>
      </div>

      <p className="text-xs text-gray-500">
        Quelle: {besoldung.meta.quelle}. Die Erhöhung um {besoldung.meta.erhoehung} ist bereits enthalten.
        Zuzüglich Familienzuschlag (ab 01.04.2026: 162,26–170,36 € Stufe 1) und Zulagen nach NBesG.
      </p>
    </div>
  );
}
