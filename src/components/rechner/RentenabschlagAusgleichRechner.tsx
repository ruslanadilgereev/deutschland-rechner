import { useMemo, useState } from 'react';
import ra from '../../data/rentenausgleich.json';

// Ausgleichszahlung nach § 187a SGB VI:
// Abschlag = 0,3 % je Monat vorzeitiger Inanspruchnahme (§ 77 SGB VI).
// Kosten je Entgeltpunkt = Beitragssatz × vorläufiges Durchschnittsentgelt
// (§ 187 Abs. 3 SGB VI); auszugleichende EP = EP × a / (1 − a), weil auch
// nachgezahlte EP mit dem Zugangsfaktor multipliziert werden.
const KOSTEN_JE_EP = Math.round(ra.vorlaeufigesDurchschnittsentgelt * ra.rvBeitragssatz * 100) / 100; // 9.661,58

function formatEuro(n: number, dez = 2) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: dez, maximumFractionDigits: dez }) + ' €';
}

export default function RentenabschlagAusgleichRechner() {
  const [rente, setRente] = useState(1600);
  const [monate, setMonate] = useState(24);

  const e = useMemo(() => {
    const r = Math.max(0, rente || 0);
    const m = Math.min(Math.max(1, monate || 1), 60);
    const a = ra.abschlagJeMonat * m;
    const minderungMonat = Math.round(r * a * 100) / 100;
    const ep = r / ra.aktuellerRentenwert;
    const epZusatz = ep * a / (1 - a);
    const betrag = Math.round(epZusatz * KOSTEN_JE_EP * 100) / 100;
    const amortisationJahre = minderungMonat > 0 ? betrag / (minderungMonat * 12) : 0;
    return { a, minderungMonat, ep, epZusatz, betrag, amortisationJahre };
  }, [rente, monate]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Erwartete Monatsrente ohne Abschlag (brutto)</label>
          <div className="relative">
            <input
              type="number" min={0} step={50} value={rente}
              onChange={(ev) => setRente(Number(ev.target.value))}
              className="w-full text-xl font-bold text-center py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Steht in Ihrer Renteninformation</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vorzeitiger Rentenbeginn: Monate früher</label>
          <input
            type="number" min={1} max={60} step={1} value={monate}
            onChange={(ev) => setMonate(Number(ev.target.value))}
            className="w-full text-xl font-bold text-center py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">z.B. 24 = zwei Jahre, 48 = vier Jahre (max. üblicher Abschlag 14,4 %)</p>
        </div>
      </div>

      <div className="bg-orange-50 rounded-xl p-5">
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>Rentenabschlag ({monate} × 0,3 %)</span>
          <span className="font-medium">{(e.a * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })} %</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>Rentenminderung</span>
          <span className="font-medium">{formatEuro(e.minderungMonat)} / Monat, lebenslang</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-orange-100 pb-2">
          <span>Auszugleichende Entgeltpunkte × {formatEuro(KOSTEN_JE_EP)}</span>
          <span className="font-medium">{e.epZusatz.toLocaleString('de-DE', { maximumFractionDigits: 4 })} EP</span>
        </div>
        <div className="flex justify-between pt-2 items-center">
          <span className="font-semibold text-gray-800">Ausgleichszahlung (2026)</span>
          <span className="text-2xl font-bold text-orange-700">{formatEuro(e.betrag, 0)}</span>
        </div>
        <p className="text-sm text-gray-600 text-right mt-1">
          entspricht rund {e.amortisationJahre.toLocaleString('de-DE', { maximumFractionDigits: 1 })} Jahren Rentenminderung
        </p>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Näherung mit den Rechengrößen 2026 (Kosten je Entgeltpunkt: 18,6 % × 51.944 € vorläufiges
        Durchschnittsentgelt = {formatEuro(KOSTEN_JE_EP)}). Verbindlich ist allein die besondere
        Rentenauskunft der Deutschen Rentenversicherung (§ 109 Abs. 5 SGB VI, Vordruck V0210),
        möglich ab dem 50. Geburtstag. Teilzahlungen sind zulässig.
      </p>
    </div>
  );
}
