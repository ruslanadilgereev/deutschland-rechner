import { useMemo, useState } from 'react';
import besoldung from '../../data/besoldung-bayern.json';

// Datenbasis: LfF Bayern, Anlage 3 BayBesG, Grundgehaltssätze Besoldungsordnung A,
// gültig ab 01.10.2026 - vom LfF publiziert vorbehaltlich der Zustimmung des Landtags.
type GruppeA = { startStufe: number; werte: number[] };
const A = besoldung.grundgehaltA as Record<string, GruppeA>;

function formatEuro(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export default function BesoldungsRechnerBayern() {
  const [gruppe, setGruppe] = useState('A 13');
  const [stufe, setStufe] = useState(7);

  const stufen = useMemo(() => {
    const g = A[gruppe];
    return Array.from({ length: g.werte.length }, (_, i) => g.startStufe + i);
  }, [gruppe]);

  const aktiveStufe = stufen.includes(stufe) ? stufe : stufen[0];
  const grundgehalt = A[gruppe].werte[aktiveStufe - A[gruppe].startStufe];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Besoldungsgruppe</label>
          <select value={gruppe} onChange={(e) => setGruppe(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-sky-600 outline-none">
            {Object.keys(A).map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Erfahrungsstufe</label>
          <select value={aktiveStufe} onChange={(e) => setStufe(Number(e.target.value))}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-sky-600 outline-none">
            {stufen.map((s) => <option key={s} value={s}>Stufe {s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-sky-50 rounded-xl p-5 text-center mb-4">
        <p className="text-sm text-gray-600">Grundgehalt ({gruppe}, Stufe {aktiveStufe}) – Tabelle ab 01.10.2026</p>
        <p className="text-3xl font-bold text-sky-700 mt-1">{formatEuro(grundgehalt)} <span className="text-base font-normal text-gray-500">/ Monat</span></p>
        <p className="text-sm text-gray-600 mt-1">Jahresbrutto (12 Monatsbezüge): <strong>{formatEuro(grundgehalt * 12)}</strong></p>
      </div>

      <p className="text-xs text-gray-500">
        Quelle: {besoldung.meta.quelle}. {besoldung.meta.vorbehalt} Zuzüglich Orts- und Familienzuschlag
        (Anlage 5 BayBesG) sowie Struktur-, Amts- und Berufszulagen.
      </p>
    </div>
  );
}
