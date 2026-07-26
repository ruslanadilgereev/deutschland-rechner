import { useMemo, useState } from 'react';

// Verletztengeld nach Arbeitsunfall/Berufskrankheit (§ 47 SGB VII):
// 80 % des kalendertäglichen Regelentgelts (Brutto/30), höchstens das
// kalendertägliche Nettoarbeitsentgelt. Zum Vergleich das Krankengeld
// (§ 47 SGB V): 70 % vom Brutto, höchstens 90 % vom Netto.
function formatEuro(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export default function VerletztengeldRechner() {
  const [brutto, setBrutto] = useState(3600);
  const [netto, setNetto] = useState(2400);

  const e = useMemo(() => {
    const bTag = Math.max(0, brutto || 0) / 30;
    const nTag = Math.max(0, netto || 0) / 30;
    const vgTag = Math.min(0.8 * bTag, nTag);
    const kgTag = Math.min(0.7 * bTag, 0.9 * nTag);
    const r2 = (n: number) => Math.round(n * 100) / 100;
    return {
      vgTag: r2(vgTag),
      vgMonat: r2(vgTag * 30),
      kgTag: r2(kgTag),
      kgMonat: r2(kgTag * 30),
      differenzMonat: r2((vgTag - kgTag) * 30),
      nettoDeckelt: nTag < 0.8 * bTag,
    };
  }, [brutto, netto]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monatsbrutto (vor der Arbeitsunfähigkeit)</label>
          <div className="relative">
            <input type="number" min={0} step={100} value={brutto}
              onChange={(ev) => setBrutto(Number(ev.target.value))}
              className="w-full text-xl font-bold text-center py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-red-500 outline-none" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monatsnetto</label>
          <div className="relative">
            <input type="number" min={0} step={100} value={netto}
              onChange={(ev) => setNetto(Number(ev.target.value))}
              className="w-full text-xl font-bold text-center py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-red-500 outline-none" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </div>
      </div>

      <div className="bg-red-50 rounded-xl p-5 mb-4">
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>80 % des Regelentgelts (Brutto ÷ 30 × 0,8)</span>
          <span className="font-medium">{formatEuro(0.8 * Math.max(0, brutto || 0) / 30)} / Tag</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-red-100 pb-2">
          <span>Deckel: kalendertägliches Netto</span>
          <span className="font-medium">{formatEuro(Math.max(0, netto || 0) / 30)} / Tag</span>
        </div>
        <div className="flex justify-between pt-2 items-center">
          <span className="font-semibold text-gray-800">Verletztengeld (brutto)</span>
          <span className="text-2xl font-bold text-red-700">{formatEuro(e.vgTag)} / Tag</span>
        </div>
        <p className="text-sm text-gray-600 text-right mt-1">= {formatEuro(e.vgMonat)} je 30-Tage-Monat{e.nettoDeckelt ? ' (Netto-Deckel greift)' : ''}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm max-w-xl">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Leistung</th>
              <th className="py-2 text-right">pro Tag</th>
              <th className="py-2 text-right">pro Monat (30 Tage)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            <tr>
              <td className="py-2 font-medium">Verletztengeld (Arbeitsunfall, 80 % / max. Netto)</td>
              <td className="py-2 text-right font-mono font-bold">{formatEuro(e.vgTag)}</td>
              <td className="py-2 text-right font-mono font-bold">{formatEuro(e.vgMonat)}</td>
            </tr>
            <tr>
              <td className="py-2">Krankengeld (normale Krankheit, 70 % / max. 90 % Netto)</td>
              <td className="py-2 text-right font-mono">{formatEuro(e.kgTag)}</td>
              <td className="py-2 text-right font-mono">{formatEuro(e.kgMonat)}</td>
            </tr>
            <tr>
              <td className="py-2 text-gray-500">Vorteil Verletztengeld</td>
              <td className="py-2 text-right font-mono text-green-700">+{formatEuro(e.vgTag - e.kgTag)}</td>
              <td className="py-2 text-right font-mono text-green-700">+{formatEuro(e.differenzMonat)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Bruttowerte der Leistung: Vom Verletztengeld gehen noch Ihre Anteile zur Renten-,
        Arbeitslosen- und Pflegeversicherung ab (keine Kranken­versicherungsbeiträge). Bei sehr
        hohen Einkommen begrenzt zusätzlich der Höchstjahresarbeitsverdienst der
        Berufsgenossenschaft. Einmalzahlungen wie Weihnachtsgeld erhöhen das Regelentgelt.
      </p>
    </div>
  );
}
