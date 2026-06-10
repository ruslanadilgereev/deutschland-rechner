import { useState, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════
// TÜV / HU überzogen (§ 29 StVZO, Anlage VIII), Stand 2026
// Quelle: bussgeldkatalog.org, ADAC, gesetze-im-internet.de (StVZO)
// ═══════════════════════════════════════════════════════════════

interface Stufe {
  id: string;
  label: string;
  kurz: string;
  bussgeld: number;
  punkte: number;
  vertiefteHu: boolean;
  beschreibung: string;
}

// Gebührenstufen nach Überziehung der HU-Frist (PKW)
const STUFEN: Stufe[] = [
  {
    id: 'bis2',
    label: 'Bis 2 Monate überzogen',
    kurz: 'bis 2 Monate',
    bussgeld: 0,
    punkte: 0,
    vertiefteHu: false,
    beschreibung: 'Bis 2 Monate Überziehung – kein Bußgeld, aber die Plakette ist abgelaufen.',
  },
  {
    id: 'bis4',
    label: 'Über 2 bis 4 Monate',
    kurz: '2–4 Monate',
    bussgeld: 15,
    punkte: 0,
    vertiefteHu: true,
    beschreibung: 'Über 2 bis 4 Monate Überziehung – Verwarnungsgeld, vertiefte HU fällig.',
  },
  {
    id: 'bis8',
    label: 'Über 4 bis 8 Monate',
    kurz: '4–8 Monate',
    bussgeld: 25,
    punkte: 0,
    vertiefteHu: true,
    beschreibung: 'Über 4 bis 8 Monate Überziehung – Verwarnungsgeld, vertiefte HU fällig.',
  },
  {
    id: 'ueber8',
    label: 'Mehr als 8 Monate',
    kurz: 'über 8 Monate',
    bussgeld: 60,
    punkte: 1,
    vertiefteHu: true,
    beschreibung: 'Mehr als 8 Monate Überziehung – Bußgeld plus 1 Punkt in Flensburg.',
  },
];

function toNumber(value: string, fallback = 0): number {
  const n = Number(value.replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function TuevUeberzogenRechner() {
  const [stufeId, setStufeId] = useState<string>('bis4');
  const [huGebuehr, setHuGebuehr] = useState('140');

  const stufe = STUFEN.find((s) => s.id === stufeId) || STUFEN[0];

  const ergebnis = useMemo(() => {
    const basisGebuehr = toNumber(huGebuehr, 0);
    // Vertiefte HU: ca. +20 % auf die reguläre HU-Gebühr ab >2 Monaten Überziehung
    const aufschlag = stufe.vertiefteHu ? Math.round(basisGebuehr * 0.2) : 0;
    const huMitAufschlag = basisGebuehr + aufschlag;
    const gesamt = stufe.bussgeld + huMitAufschlag;
    return {
      bussgeld: stufe.bussgeld,
      punkte: stufe.punkte,
      aufschlag,
      huMitAufschlag,
      gesamt,
    };
  }, [stufe, huGebuehr]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';

  return (
    <div className="max-w-2xl mx-auto">

      {/* Überziehungsdauer */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block mb-3">
          <span className="text-gray-700 font-medium">Wie lange ist die HU (TÜV) überzogen?</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {STUFEN.map((s) => (
            <button
              key={s.id}
              onClick={() => setStufeId(s.id)}
              className={`py-3 px-3 rounded-xl font-medium transition-all text-sm ${
                stufeId === s.id
                  ? s.punkte > 0
                    ? 'bg-red-500 text-white'
                    : 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* HU-Gebühr */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block mb-2">
          <span className="text-gray-700 font-medium">Reguläre HU-Gebühr Ihrer Prüfstelle</span>
          <span className="text-xs text-gray-500 block mt-1">
            Für die HU mit AU zahlen Sie je nach Bundesland und Prüforganisation meist 120–160 € (PKW).
          </span>
        </label>
        <div className="relative">
          <input
            type="number"
            value={huGebuehr}
            onChange={(e) => setHuGebuehr(e.target.value)}
            className="w-full text-2xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
            min="0"
            max="300"
            step="5"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
        </div>
      </div>

      {/* Ergebnis */}
      <div
        className={`rounded-2xl shadow-lg p-6 text-white mb-6 ${
          ergebnis.punkte > 0
            ? 'bg-gradient-to-br from-orange-500 to-red-600'
            : ergebnis.bussgeld > 0
            ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
            : 'bg-gradient-to-br from-green-500 to-emerald-600'
        }`}
      >
        <h3 className="text-sm font-medium opacity-80 mb-1">🔧 Ihre Kosten</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.bussgeld)}</span>
            <span className="text-xl opacity-80">{ergebnis.bussgeld > 0 ? 'Bußgeld' : 'kein Bußgeld'}</span>
          </div>
          <p className="mt-2 opacity-90">{stufe.beschreibung}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Punkte in Flensburg</span>
            <div className="text-3xl font-bold">{ergebnis.punkte}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Vertiefte HU?</span>
            <div className="text-3xl font-bold">{stufe.vertiefteHu ? 'Ja' : 'Nein'}</div>
          </div>
        </div>

        {/* Kosten-Aufstellung */}
        <div className="mt-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between text-sm">
            <span className="opacity-80">Reguläre HU-Gebühr</span>
            <span>{formatEuro(toNumber(huGebuehr, 0))}</span>
          </div>
          {stufe.vertiefteHu && (
            <div className="flex justify-between text-sm mt-1">
              <span className="opacity-80">+ vertiefte HU (≈ 20 %)</span>
              <span>{formatEuro(ergebnis.aufschlag)}</span>
            </div>
          )}
          {ergebnis.bussgeld > 0 && (
            <div className="flex justify-between text-sm mt-1">
              <span className="opacity-80">+ Bußgeld</span>
              <span>{formatEuro(ergebnis.bussgeld)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold mt-2 pt-2 border-t border-white/20">
            <span>Voraussichtliche Gesamtkosten</span>
            <span>{formatEuro(ergebnis.gesamt)}</span>
          </div>
        </div>
      </div>

      {/* So wird gerechnet */}
      <div className="bg-blue-50 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <p className="text-sm text-gray-700">
          Das Bußgeld richtet sich nach der Überziehungsdauer der HU-Frist (§ 29 StVZO). Ab mehr als
          zwei Monaten Überziehung wird zusätzlich eine <strong>vertiefte Hauptuntersuchung</strong>
          fällig, die rund 20 % mehr kostet als die reguläre HU-Gebühr.
        </p>
        <div className="bg-white rounded-lg p-4 mt-3 text-sm text-gray-700">
          <p className="font-medium mb-1">Überziehung: {stufe.kurz}</p>
          <p>
            {ergebnis.bussgeld > 0 ? `${formatEuro(ergebnis.bussgeld)} Bußgeld` : 'Kein Bußgeld'}
            {stufe.vertiefteHu
              ? ` + ${formatEuro(toNumber(huGebuehr, 0))} HU + ${formatEuro(ergebnis.aufschlag)} vertiefte HU`
              : ` + ${formatEuro(toNumber(huGebuehr, 0))} HU`}
            {' = '}<strong>{formatEuro(ergebnis.gesamt)}</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-yellow-800 mb-2">⚠️ Angaben ohne Gewähr</h3>
        <p className="text-sm text-yellow-700">
          Die Bußgelder entsprechen dem bundesweiten Katalog zur Hauptuntersuchung (§ 29 StVZO, Stand
          2026). Die HU-Gebühr und der Aufschlag für die vertiefte HU variieren je nach Bundesland und
          Prüforganisation – die 20 % sind ein Richtwert. Bei einem Unfall mit abgelaufenem TÜV kann es
          versicherungsrechtliche Folgen geben. Dieser Rechner ersetzt keine Rechtsberatung.
        </p>
      </div>
    </div>
  );
}

export default TuevUeberzogenRechner;
