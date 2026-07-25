import { useMemo, useState } from 'react';
import besoldung from '../../data/besoldung-nrw.json';

// Datenbasis: LBV NRW, Besoldungstabellen gültig ab 01.02.2025 (Anlage 6 LBesG NRW).
// Seit 01.04.2026 zahlt NRW Abschläge von +3,36 % (Runderlass FM 18.05.2026, MB.NRW 2026
// Nr. 132) unter Vorbehalt des Anpassungsgesetzes 2026-2028 — nach Verkündung Tabelle tauschen.
type GruppeA = { startStufe: number; werte: number[] };
const A = besoldung.grundgehaltA as Record<string, GruppeA>;
const ABSCHLAG_FAKTOR = 1.0336;

function formatEuro(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export default function BesoldungsRechnerNRW() {
  const [gruppe, setGruppe] = useState('A 12');
  const [stufe, setStufe] = useState(6);

  const stufen = useMemo(() => {
    const g = A[gruppe];
    return Array.from({ length: g.werte.length }, (_, i) => g.startStufe + i);
  }, [gruppe]);

  const aktiveStufe = stufen.includes(stufe) ? stufe : stufen[0];
  const tabellenwert = A[gruppe].werte[aktiveStufe - A[gruppe].startStufe];
  const mitAbschlag = tabellenwert * ABSCHLAG_FAKTOR;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Besoldungsgruppe</label>
          <select value={gruppe} onChange={(e) => setGruppe(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-green-600 outline-none">
            {Object.keys(A).map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Erfahrungsstufe</label>
          <select value={aktiveStufe} onChange={(e) => setStufe(Number(e.target.value))}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-green-600 outline-none">
            {stufen.map((s) => <option key={s} value={s}>Stufe {s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-xl p-5 text-center">
          <p className="text-sm text-gray-600">Verkündete Tabelle (ab 01.02.2025)</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{formatEuro(tabellenwert)}</p>
          <p className="text-xs text-gray-500">Grundgehalt / Monat</p>
        </div>
        <div className="bg-green-50 rounded-xl p-5 text-center">
          <p className="text-sm text-gray-600">Aktuell gezahlt (inkl. Abschlag +3,36 %)</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{formatEuro(mitAbschlag)}</p>
          <p className="text-xs text-gray-500">seit 01.04.2026, unter Gesetzesvorbehalt</p>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        {gruppe}, Stufe {aktiveStufe} · Jahresbrutto nach Tabelle: <strong>{formatEuro(tabellenwert * 12)}</strong> ·
        mit Abschlag: <strong>{formatEuro(mitAbschlag * 12)}</strong>. Zuzüglich Familienzuschlag und Zulagen nach
        LBesG NRW. Quelle Abschlag: Runderlass des FM vom 18.05.2026 (MB.NRW 2026 Nr. 132).
      </p>
    </div>
  );
}
