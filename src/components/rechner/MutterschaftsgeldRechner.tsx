import { useMemo, useState } from 'react';

// Mutterschaftsgeld (§§ 19, 20 MuSchG, Stand Juli 2026):
// GKV-Mitglieder: Kasse zahlt max. 13 €/Kalendertag; der Arbeitgeber zahlt
// als Zuschuss die Differenz zum durchschnittlichen kalendertäglichen
// Nettoentgelt der letzten 3 abgerechneten Monate (Summe/90).
// Nicht GKV-versicherte Arbeitnehmerinnen: einmalig max. 210 € vom
// Bundesamt für Soziale Sicherung, AG-Zuschuss aber ebenso.
// Schutzfrist: 6 Wochen vor + Entbindungstag + 8 Wochen nach = 99 Tage;
// bei Früh-/Mehrlingsgeburt 12 Wochen danach = 127 Tage (§ 3 MuSchG).
const KASSE_TAG = 13;
const BUND_EINMALIG = 210;

function formatEuro(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export default function MutterschaftsgeldRechner() {
  const [netto, setNetto] = useState(2400);
  const [gkv, setGkv] = useState(true);
  const [verlaengert, setVerlaengert] = useState(false);

  const e = useMemo(() => {
    const nettoTag = Math.max(0, netto || 0) * 3 / 90;
    const tage = verlaengert ? 127 : 99;
    const agTag = Math.max(0, nettoTag - KASSE_TAG);
    const agGesamt = Math.round(agTag * tage * 100) / 100;
    const kasseGesamt = gkv ? KASSE_TAG * tage : Math.min(BUND_EINMALIG, KASSE_TAG * tage);
    return {
      nettoTag: Math.round(nettoTag * 100) / 100,
      tage,
      agTag: Math.round(agTag * 100) / 100,
      agGesamt,
      kasseGesamt: Math.round(kasseGesamt * 100) / 100,
      gesamt: Math.round((agGesamt + kasseGesamt) * 100) / 100,
    };
  }, [netto, gkv, verlaengert]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="grid sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monatsnetto (Ø letzte 3 Monate)</label>
          <div className="relative">
            <input type="number" min={0} step={50} value={netto}
              onChange={(ev) => setNetto(Number(ev.target.value))}
              className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 outline-none text-center font-bold" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Krankenversicherung</label>
          <button onClick={() => setGkv(!gkv)}
            className={`w-full py-2 px-3 rounded-xl text-sm font-medium border-2 transition-colors ${
              gkv ? 'bg-pink-600 border-pink-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-pink-300'
            }`}>
            {gkv ? 'Gesetzlich (Mitglied)' : 'Privat / familienversichert'}
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Früh-/Mehrlingsgeburt?</label>
          <button onClick={() => setVerlaengert(!verlaengert)}
            className={`w-full py-2 px-3 rounded-xl text-sm font-medium border-2 transition-colors ${
              verlaengert ? 'bg-pink-600 border-pink-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-pink-300'
            }`}>
            {verlaengert ? 'Ja: 12 Wochen danach' : 'Nein: 8 Wochen danach'}
          </button>
        </div>
      </div>

      <div className="bg-pink-50 rounded-xl p-5">
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>Kalendertägliches Netto (÷ 90)</span>
          <span className="font-medium">{formatEuro(e.nettoTag)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>{gkv ? `Mutterschaftsgeld der Kasse (13 €/Tag × ${e.tage} Tage)` : 'Mutterschaftsgeld vom Bundesamt (einmalig)'}</span>
          <span className="font-medium">{formatEuro(e.kasseGesamt)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-pink-100 pb-2">
          <span>Arbeitgeberzuschuss ({formatEuro(e.agTag)}/Tag × {e.tage} Tage)</span>
          <span className="font-medium">{formatEuro(e.agGesamt)}</span>
        </div>
        <div className="flex justify-between pt-2 items-center">
          <span className="font-semibold text-gray-800">Gesamt für {e.tage} Tage Schutzfrist</span>
          <span className="text-2xl font-bold text-pink-700">{formatEuro(e.gesamt)}</span>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Schutzfrist: 6 Wochen vor der Entbindung + Entbindungstag + {verlaengert ? '12' : '8'} Wochen
        danach = {e.tage} Kalendertage; kommt das Kind früher, wandern die fehlenden Tage nach hinten
        (§ 3 MuSchG). Mutterschaftsgeld und Zuschuss sind steuerfrei, unterliegen aber dem
        Progressionsvorbehalt. GKV-Mitglieder erhalten die 13 €/Tag von ihrer Kasse; privat oder
        familienversicherte Arbeitnehmerinnen bekommen einmalig höchstens 210 € vom Bundesamt für
        Soziale Sicherung, der Arbeitgeberzuschuss bleibt gleich.
      </p>
    </div>
  );
}
