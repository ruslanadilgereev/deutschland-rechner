import { useState } from 'react';

// Zahnimplantat-Kosten 2026 (Schätzung, Richtwerte für Deutschland)
// Quellen:
//  - implantate.com – Was kosten Zahnimplantate (Stand 2026)
//  - AOK – Festzuschuss Zahnersatz 2026 (60/70/75/100 %)
//  - da-direkt.de, zahn-direkt.de – Kostenspannen Zahnimplantat 2026
//
// WICHTIG: Nur grobe Richtwerte. Verbindlich ist allein der
// Heil- und Kostenplan (HKP) des behandelnden Zahnarztes.

// Einzelimplantat inkl. Aufbau + Krone (gesamt, ohne Knochenaufbau)
const IMPLANTAT_MIN = 1800; // € konservative Untergrenze
const IMPLANTAT_MAX = 3500; // € obere Spanne (Frontzahn/Großstadt)

// Knochenaufbau / Augmentation Aufpreis pro Kieferbereich (falls nötig)
const KNOCHENAUFBAU_MIN = 300; // € (kleine Augmentation)
const KNOCHENAUFBAU_MAX = 1500; // € (Sinuslift / größerer Aufbau)

// Festzuschuss der gesetzlichen Krankenkasse pro Einzelzahnlücke
// Befund 2.1 (Brücke als Regelversorgung), amtliche Festzuschussbeträge
// gültig ab 01.01.2026 (Quelle: GKV-Spitzenverband / G-BA, Basis Regelversorgung
// 921,60 €; gerundete Werte). Die Kasse bezuschusst NUR den Zahnersatz, NICHT
// das Implantat selbst.
const FESTZUSCHUSS: Record<string, number> = {
  ohne: 553, // 60 % – ohne Bonusheft (552,96 €)
  bonus5: 645, // 70 % – 5 Jahre lückenloses Bonusheft (645,12 €)
  bonus10: 691, // 75 % – 10 Jahre lückenloses Bonusheft (691,20 €)
  haertefall: 922, // 100 % – Härtefallregelung (921,60 €)
};

const BONUS_LABEL: Record<string, string> = {
  ohne: 'Kein Bonusheft (60 %)',
  bonus5: '5 Jahre Bonusheft (70 %)',
  bonus10: '10 Jahre Bonusheft (75 %)',
  haertefall: 'Härtefall (100 %)',
};

function euro(n: number): string {
  return Math.round(n).toLocaleString('de-DE') + ' €';
}

export default function ZahnimplantatKostenRechner() {
  const [anzahl, setAnzahl] = useState(1);
  const [knochenaufbau, setKnochenaufbau] = useState(false);
  const [bonus, setBonus] = useState<keyof typeof FESTZUSCHUSS>('ohne');

  // Gesamtkosten-Spanne
  let gesamtMin = anzahl * IMPLANTAT_MIN;
  let gesamtMax = anzahl * IMPLANTAT_MAX;
  if (knochenaufbau) {
    gesamtMin += anzahl * KNOCHENAUFBAU_MIN;
    gesamtMax += anzahl * KNOCHENAUFBAU_MAX;
  }

  // Festzuschuss gesamt (pro Lücke)
  const zuschussGesamt = anzahl * FESTZUSCHUSS[bonus];

  // Geschätzter Eigenanteil (Gesamtkosten minus Festzuschuss)
  const eigenMin = Math.max(0, gesamtMin - zuschussGesamt);
  const eigenMax = Math.max(0, gesamtMax - zuschussGesamt);

  return (
    <div className="max-w-lg mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-6">
        {/* Anzahl Implantate */}
        <div>
          <span className="text-gray-700 font-medium">Anzahl Implantate</span>
          <div className="mt-3 flex items-center justify-center gap-6">
            <button
              onClick={() => setAnzahl(Math.max(1, anzahl - 1))}
              className="w-14 h-14 rounded-full bg-gray-100 text-2xl font-bold text-gray-600 hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-40"
              disabled={anzahl <= 1}
              aria-label="Weniger Implantate"
            >
              −
            </button>
            <span className="text-5xl font-bold text-cyan-600 w-20 text-center">{anzahl}</span>
            <button
              onClick={() => setAnzahl(Math.min(8, anzahl + 1))}
              className="w-14 h-14 rounded-full bg-cyan-500 text-2xl font-bold text-white hover:bg-cyan-600 active:scale-95 transition-all"
              aria-label="Mehr Implantate"
            >
              +
            </button>
          </div>
        </div>

        {/* Knochenaufbau */}
        <div>
          <span className="text-gray-700 font-medium">Knochenaufbau nötig?</span>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              onClick={() => setKnochenaufbau(false)}
              className={`py-3 rounded-xl font-medium transition-all ${
                !knochenaufbau
                  ? 'bg-cyan-500 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Nein
            </button>
            <button
              onClick={() => setKnochenaufbau(true)}
              className={`py-3 rounded-xl font-medium transition-all ${
                knochenaufbau
                  ? 'bg-cyan-500 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Ja
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Knochenaufbau bzw. Sinuslift kostet je Bereich rund {euro(KNOCHENAUFBAU_MIN)}–{euro(KNOCHENAUFBAU_MAX)} extra.
          </p>
        </div>

        {/* Bonusheft-Status */}
        <div>
          <span className="text-gray-700 font-medium">Bonusheft-Status</span>
          <select
            value={bonus}
            onChange={(e) => setBonus(e.target.value as keyof typeof FESTZUSCHUSS)}
            className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 focus:outline-none"
          >
            <option value="ohne">{BONUS_LABEL.ohne}</option>
            <option value="bonus5">{BONUS_LABEL.bonus5}</option>
            <option value="bonus10">{BONUS_LABEL.bonus10}</option>
            <option value="haertefall">{BONUS_LABEL.haertefall}</option>
          </select>
          <p className="text-xs text-gray-400 mt-2">
            Der Festzuschuss bezieht sich nur auf den Zahnersatz (Krone), nicht auf das Implantat selbst.
          </p>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-cyan-100 mb-1">Geschätzte Gesamtkosten</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-4xl font-bold">{euro(gesamtMin)}</span>
            <span className="text-xl text-cyan-200">–</span>
            <span className="text-4xl font-bold">{euro(gesamtMax)}</span>
          </div>
          <p className="text-cyan-100 text-sm mt-1">
            {anzahl} {anzahl === 1 ? 'Implantat' : 'Implantate'}
            {knochenaufbau ? ' inkl. Knochenaufbau' : ''}
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-cyan-100">Festzuschuss der Kasse (ca.)</span>
              <span className="text-lg font-bold">− {euro(zuschussGesamt)}</span>
            </div>
            <p className="text-xs text-cyan-200 mt-1">{BONUS_LABEL[bonus]}</p>
          </div>

          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">Geschätzter Eigenanteil</span>
              <span className="text-xl font-bold">
                {euro(eigenMin)} – {euro(eigenMax)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Starker Disclaimer */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">Nur grobe Richtwerte – keine ärztliche Beratung</p>
            <p>
              Dieser Rechner liefert eine <strong>unverbindliche Schätzung</strong> auf Basis
              typischer Marktpreise. Die tatsächlichen Kosten hängen von Implantattyp, Material,
              Befund, Region und Praxis ab. <strong>Verbindlich ist allein der Heil- und Kostenplan
              (HKP)</strong> Ihres Zahnarztes, den Ihre Krankenkasse vor der Behandlung genehmigt.
              Angabe ohne Gewähr.
            </p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Schätzung</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>{euro(IMPLANTAT_MIN)}–{euro(IMPLANTAT_MAX)}</strong> pro Einzelimplantat inkl.
              Aufbau und Krone (Richtwert 2026)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Knochenaufbau / Sinuslift</strong> kostet je Bereich rund{' '}
              {euro(KNOCHENAUFBAU_MIN)}–{euro(KNOCHENAUFBAU_MAX)} zusätzlich
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Die Kasse zahlt einen <strong>befundbezogenen Festzuschuss</strong> auf den Zahnersatz –
              je nach Bonusheft 60 % bis 100 %
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Das <strong>Implantat selbst</strong> (Schraube, OP) wird von der gesetzlichen Kasse in
              der Regel nicht bezuschusst
            </span>
          </li>
        </ul>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/sgb_5/__55.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-cyan-700 hover:underline"
          >
            § 55 SGB V – Festzuschüsse & Bonusregelung (gesetze-im-internet.de)
          </a>
        </div>
      </div>
    </div>
  );
}
