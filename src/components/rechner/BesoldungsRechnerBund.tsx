import { useState } from 'react';
import besoldung from '../../data/besoldung-bund.json';

// Datenbasis: Anlage IV BBesG, gültig ab 01.03.2024 (BGBl. 2023 I Nr. 414).
// Die Anpassung 2025/2026 ist noch nicht verkündet (Stand Juli 2026: Gesetzgebungsverfahren,
// seit Sept. 2025 Abschlagszahlungen) — nach Verkündung besoldung-bund.json aktualisieren.
const A_GRUPPEN = Object.keys(besoldung.grundgehaltA);
const B_GRUPPEN = Object.keys(besoldung.grundgehaltB);

function formatEuro(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export default function BesoldungsRechnerBund() {
  const [ordnung, setOrdnung] = useState<'A' | 'B'>('A');
  const [gruppeA, setGruppeA] = useState('A 9');
  const [stufe, setStufe] = useState(5);
  const [gruppeB, setGruppeB] = useState('B 3');

  const grundgehalt = ordnung === 'A'
    ? (besoldung.grundgehaltA as Record<string, number[]>)[gruppeA][stufe - 1]
    : (besoldung.grundgehaltB as Record<string, number>)[gruppeB];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Besoldungsordnung</label>
          <select value={ordnung} onChange={(e) => setOrdnung(e.target.value as 'A' | 'B')}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-indigo-500 outline-none">
            <option value="A">A (aufsteigende Gehälter)</option>
            <option value="B">B (Festgehälter)</option>
          </select>
        </div>
        {ordnung === 'A' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Besoldungsgruppe</label>
              <select value={gruppeA} onChange={(e) => setGruppeA(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-indigo-500 outline-none">
                {A_GRUPPEN.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Erfahrungsstufe</label>
              <select value={stufe} onChange={(e) => setStufe(Number(e.target.value))}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-indigo-500 outline-none">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <option key={s} value={s}>Stufe {s}</option>)}
              </select>
            </div>
          </>
        ) : (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Besoldungsgruppe</label>
            <select value={gruppeB} onChange={(e) => setGruppeB(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-indigo-500 outline-none">
              {B_GRUPPEN.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="bg-indigo-50 rounded-xl p-5 text-center mb-4">
        <p className="text-sm text-gray-600">Grundgehalt ({ordnung === 'A' ? `${gruppeA}, Stufe ${stufe}` : gruppeB}) – verkündeter Stand</p>
        <p className="text-3xl font-bold text-indigo-700 mt-1">{formatEuro(grundgehalt)} <span className="text-base font-normal text-gray-500">/ Monat</span></p>
        <p className="text-sm text-gray-600 mt-1">Jahresbrutto (12 Monatsbezüge): <strong>{formatEuro(grundgehalt * 12)}</strong></p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        <strong>⚠️ Wichtig:</strong> Tabelle gültig ab 01.03.2024 ({besoldung.meta.fundstelle}) – das ist der aktuell
        <strong> verkündete</strong> Rechtsstand. Die Besoldungsanpassung 2025/2026 (Übertragung des Tarifabschlusses
        + amtsangemessene Alimentation) befindet sich im Gesetzgebungsverfahren; seit September 2025 zahlt der Bund
        <strong> Abschläge</strong> auf die erwartete Erhöhung. Sobald die neuen Tabellen im Bundesgesetzblatt stehen,
        aktualisieren wir taggleich. Hinzu kommen je nach Familienstand der Familienzuschlag (Anlage V BBesG) sowie
        Amts- und Stellenzulagen.
      </div>
    </div>
  );
}
