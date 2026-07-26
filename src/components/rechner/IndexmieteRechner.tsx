import { useMemo, useState } from 'react';
import vpi from '../../data/vpi-monatswerte.json';

// Indexmiete nach § 557b BGB: neue Miete = alte Miete × VPI_neu / VPI_alt
// (VPI Deutschland, Basis 2020=100, Quelle Destatis). Die Miete muss dabei
// mindestens ein Jahr unverändert geblieben sein (§ 557b Abs. 2).
const WERTE = vpi.werte as Record<string, number>;
const KEYS = Object.keys(WERTE).sort();
const NEUESTER = KEYS[KEYS.length - 1];

const MONATSNAMEN = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

function label(key: string) {
  const [j, m] = key.split('-');
  return `${MONATSNAMEN[Number(m) - 1]} ${j}`;
}

function monateDiff(a: string, b: string) {
  const [aj, am] = a.split('-').map(Number);
  const [bj, bm] = b.split('-').map(Number);
  return (bj - aj) * 12 + (bm - am);
}

function formatEuro(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export default function IndexmieteRechner() {
  const [miete, setMiete] = useState(1000);
  const [altMonat, setAltMonat] = useState('2024-06');
  const [neuMonat, setNeuMonat] = useState(NEUESTER);

  const ergebnis = useMemo(() => {
    const alt = WERTE[altMonat];
    const neu = WERTE[neuMonat];
    const m = Math.max(0, miete || 0);
    const faktor = neu / alt;
    const neueMiete = Math.round(m * faktor * 100) / 100;
    return {
      alt,
      neu,
      prozent: Math.round((faktor - 1) * 10000) / 100,
      neueMiete,
      differenz: Math.round((neueMiete - m) * 100) / 100,
      zuKurz: monateDiff(altMonat, neuMonat) < 12,
      gesunken: neu < alt,
    };
  }, [miete, altMonat, neuMonat]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="grid sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aktuelle Kaltmiete</label>
          <div className="relative">
            <input
              type="number"
              min={0}
              step={10}
              value={miete}
              onChange={(e) => setMiete(Number(e.target.value))}
              className="w-full text-xl font-bold text-center py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-cyan-600 outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Letzte Mietfestlegung (Monat)</label>
          <select
            value={altMonat}
            onChange={(e) => setAltMonat(e.target.value)}
            className="w-full py-2.5 px-3 border-2 border-gray-200 rounded-xl focus:border-cyan-600 outline-none text-sm"
          >
            {KEYS.map((k) => <option key={k} value={k}>{label(k)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vergleichsmonat (neuester VPI)</label>
          <select
            value={neuMonat}
            onChange={(e) => setNeuMonat(e.target.value)}
            className="w-full py-2.5 px-3 border-2 border-gray-200 rounded-xl focus:border-cyan-600 outline-none text-sm"
          >
            {KEYS.map((k) => <option key={k} value={k}>{label(k)}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-cyan-50 rounded-xl p-5">
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>VPI {label(altMonat)} → {label(neuMonat)} (Basis 2020 = 100)</span>
          <span className="font-medium">{ergebnis.alt.toLocaleString('de-DE')} → {ergebnis.neu.toLocaleString('de-DE')}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-cyan-100 pb-2">
          <span>Indexänderung</span>
          <span className="font-medium">{ergebnis.prozent > 0 ? '+' : ''}{ergebnis.prozent.toLocaleString('de-DE')} %</span>
        </div>
        <div className="flex justify-between pt-2 items-center">
          <span className="font-semibold text-gray-800">Rechnerische neue Indexmiete</span>
          <span className="text-2xl font-bold text-cyan-700">{formatEuro(ergebnis.neueMiete)}</span>
        </div>
        <p className="text-sm text-gray-600 text-right mt-1">
          {ergebnis.differenz >= 0 ? '+' : ''}{formatEuro(ergebnis.differenz)} gegenüber heute
        </p>
      </div>

      {ergebnis.zuKurz && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 mt-4">
          <strong>Sperrfrist beachten:</strong> Zwischen den gewählten Monaten liegt weniger als ein Jahr.
          Bei einer Indexmiete muss die Miete jeweils mindestens ein Jahr unverändert bleiben
          (§ 557b Abs. 2 BGB); eine Erhöhung wäre jetzt noch nicht zulässig.
        </div>
      )}
      {ergebnis.gesunken && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800 mt-4">
          Der Index ist gesunken: Auch Mieterinnen und Mieter können die Anpassung nach unten
          verlangen, die Änderungserklärung nach § 557b Abs. 3 BGB steht beiden Seiten offen.
        </div>
      )}

      <p className="text-xs text-gray-500 mt-3">
        Die Änderung muss in Textform erklärt werden und dabei die Indexänderung sowie die neue Miete
        oder die Erhöhung als Geldbetrag angeben; die geänderte Miete gilt ab Beginn des übernächsten
        Monats nach Zugang der Erklärung (§ 557b Abs. 3 BGB).
      </p>
    </div>
  );
}
