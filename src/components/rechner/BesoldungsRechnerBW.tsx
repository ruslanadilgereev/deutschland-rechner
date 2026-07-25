import { useMemo, useState } from 'react';
import besoldung from '../../data/besoldung-bw.json';

// Datenbasis: LBV Baden-Württemberg, Grundgehaltssätze ab 01.04.2026 (Erhöhung 2,82 %).
// BW-Systematik: Gruppen beginnen bei unterschiedlichen Erfahrungsstufen (startStufe).
type GruppeA = { startStufe: number; werte: number[] };
const A = besoldung.grundgehaltA as Record<string, GruppeA>;
const B = besoldung.grundgehaltB as Record<string, number>;
const W = besoldung.grundgehaltW as Record<string, number>;

function formatEuro(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export default function BesoldungsRechnerBW() {
  const [ordnung, setOrdnung] = useState<'A' | 'B' | 'W'>('A');
  const [gruppeA, setGruppeA] = useState('A 12');
  const [stufe, setStufe] = useState(5);
  const [gruppeB, setGruppeB] = useState('B 3');
  const [gruppeW, setGruppeW] = useState('W 2');

  const stufen = useMemo(() => {
    const g = A[gruppeA];
    return Array.from({ length: g.werte.length }, (_, i) => g.startStufe + i);
  }, [gruppeA]);

  const aktiveStufe = stufen.includes(stufe) ? stufe : stufen[0];
  const grundgehalt = ordnung === 'A'
    ? A[gruppeA].werte[aktiveStufe - A[gruppeA].startStufe]
    : ordnung === 'B' ? B[gruppeB] : W[gruppeW];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Besoldungsordnung</label>
          <select value={ordnung} onChange={(e) => setOrdnung(e.target.value as 'A' | 'B' | 'W')}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-amber-500 outline-none">
            <option value="A">A (Laufbahn)</option>
            <option value="B">B (Festgehälter)</option>
            <option value="W">W (Professuren)</option>
          </select>
        </div>
        {ordnung === 'A' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Besoldungsgruppe</label>
              <select value={gruppeA} onChange={(e) => setGruppeA(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-amber-500 outline-none">
                {Object.keys(A).map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Erfahrungsstufe</label>
              <select value={aktiveStufe} onChange={(e) => setStufe(Number(e.target.value))}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-amber-500 outline-none">
                {stufen.map((s) => <option key={s} value={s}>Stufe {s}</option>)}
              </select>
            </div>
          </>
        )}
        {ordnung === 'B' && (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Besoldungsgruppe</label>
            <select value={gruppeB} onChange={(e) => setGruppeB(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-amber-500 outline-none">
              {Object.keys(B).map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        )}
        {ordnung === 'W' && (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Besoldungsgruppe</label>
            <select value={gruppeW} onChange={(e) => setGruppeW(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-amber-500 outline-none">
              {Object.keys(W).map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="bg-amber-50 rounded-xl p-5 text-center mb-4">
        <p className="text-sm text-gray-600">
          Grundgehalt ({ordnung === 'A' ? `${gruppeA}, Stufe ${aktiveStufe}` : ordnung === 'B' ? gruppeB : gruppeW}) – Stand 01.04.2026
        </p>
        <p className="text-3xl font-bold text-amber-700 mt-1">{formatEuro(grundgehalt)} <span className="text-base font-normal text-gray-500">/ Monat</span></p>
        <p className="text-sm text-gray-600 mt-1">Jahresbrutto (12 Monatsbezüge): <strong>{formatEuro(grundgehalt * 12)}</strong></p>
      </div>

      <p className="text-xs text-gray-500">
        Quelle: {besoldung.meta.quelle}. Zuzüglich Familienzuschlag, Struktur- und Amtszulagen nach LBesGBW.
        In der Landesbesoldungsordnung A beginnen höhere Gruppen erst in höheren Erfahrungsstufen
        (z. B. A 13 ab Stufe 3) – der Rechner bildet das automatisch ab.
      </p>
    </div>
  );
}
