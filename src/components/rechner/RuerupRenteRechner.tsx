import { useState, useMemo } from 'react';

// === Höchstbetrag Altersvorsorgeaufwendungen 2026 (§ 10 Abs. 3 EStG) ===
// Abgeleitet aus Höchstbeitrag knappschaftliche Rentenversicherung:
//   BBG knappsch. RV 2026 = 124.800 €/Jahr (SVBezGrV 2026, § 4 Abs. 1 Nr. 2)
//   Beitragssatz knappsch. RV 2026 = 24,7 %
//   124.800 € × 0,247 = 30.825,60 € → aufgerundet auf vollen Euro (§ 10 Abs. 3 S. 1)
const HOECHSTBETRAG_LEDIG = 30826;       // Euro/Jahr (Einzelveranlagung)
const HOECHSTBETRAG_VERHEIRATET = 61652; // Euro/Jahr (Zusammenveranlagung, § 10 Abs. 3 S. 2: verdoppelt)

// Abzugsquote: seit Kalenderjahr 2023 zu 100 % abziehbar (§ 10 Abs. 3 S. 6 EStG)
const ABZUGSQUOTE = 1.0; // 100 %

// Besteuerungsanteil Leibrente bei Rentenbeginn 2026 (nur Hinweis, NICHT in Hauptrechnung)
// § 22 Nr. 1 S. 3 Buchst. a Doppelbuchst. aa EStG
const BESTEUERUNGSANTEIL_2026 = 84; // % (Rentenbeginn 2026; steigt 0,5 PP/Jahr, 100 % bei Rentenbeginn 2058)

interface RuerupResult {
  hoechstbetrag: number;
  abziehbar: number;
  steuerersparnis: number;
  nettoAufwand: number;
  foerderquote: number;
  ueberHoechstbetrag: boolean;
  nichtAbziehbar: number;
}

const formatCurrency = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
};

const formatPercent = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';
};

export default function RuerupRenteRechner() {
  // Input State
  const [beitrag, setBeitrag] = useState<number>(6000);
  const [grenzsteuersatz, setGrenzsteuersatz] = useState<number>(30);
  const [verheiratet, setVerheiratet] = useState<boolean>(false);

  const result = useMemo<RuerupResult>(() => {
    const B = Math.max(0, beitrag);
    const s = Math.min(Math.max(0, grenzsteuersatz), 45);
    const hoechstbetrag = verheiratet ? HOECHSTBETRAG_VERHEIRATET : HOECHSTBETRAG_LEDIG;

    const abziehbar = Math.min(B, hoechstbetrag) * ABZUGSQUOTE;
    const steuerersparnis = abziehbar * (s / 100);
    const nettoAufwand = B - steuerersparnis;
    const foerderquote = B > 0 ? (steuerersparnis / B) * 100 : 0;
    const ueberHoechstbetrag = B > hoechstbetrag;
    const nichtAbziehbar = ueberHoechstbetrag ? B - hoechstbetrag : 0;

    return {
      hoechstbetrag,
      abziehbar,
      steuerersparnis,
      nettoAufwand,
      foerderquote,
      ueberHoechstbetrag,
      nichtAbziehbar,
    };
  }, [beitrag, grenzsteuersatz, verheiratet]);

  return (
    <div className="space-y-6">

      {/* Eingabebereich */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Deine Daten zur Rürup-/Basisrente</h2>

        <div className="space-y-4">
          {/* Jährlicher Beitrag */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jährlicher Rürup-/Basisrente-Beitrag *
            </label>
            <div className="relative">
              <input
                type="number"
                value={beitrag || ''}
                onChange={(e) => setBeitrag(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:border-orange-500"
                placeholder="6000"
                min="0"
                step="100"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Absetzbar sind bis zu {formatCurrency(result.hoechstbetrag).replace(',00', '')} pro Jahr
              {verheiratet ? ' (Zusammenveranlagung)' : ' (Einzelveranlagung)'}.
            </p>
            {result.ueberHoechstbetrag && (
              <p className="text-xs text-red-600 mt-1">
                ⚠️ {formatCurrency(result.nichtAbziehbar)} liegen über dem Höchstbetrag und werden steuerlich nicht berücksichtigt.
              </p>
            )}
          </div>

          {/* Grenzsteuersatz Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Persönlicher Grenzsteuersatz: <span className="font-bold text-orange-600">{grenzsteuersatz} %</span>
            </label>
            <input
              type="range"
              min="0"
              max="45"
              step="1"
              value={grenzsteuersatz}
              onChange={(e) => setGrenzsteuersatz(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0 %</span>
              <span>30 %</span>
              <span>45 %</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              💡 Den persönlichen Grenzsteuersatz ermitteln Sie über den{' '}
              <a href="/einkommensteuer-rechner" className="text-orange-600 hover:underline">Einkommensteuer-Rechner</a>.
            </p>
          </div>

          {/* Verheiratet-Toggle */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="verheiratet"
                checked={verheiratet}
                onChange={(e) => setVerheiratet(e.target.checked)}
                className="w-5 h-5 mt-0.5 text-orange-600 border-gray-300 rounded focus:ring-0 focus:border-orange-500"
              />
              <label htmlFor="verheiratet" className="text-sm font-medium text-gray-700">
                Zusammenveranlagung (verheiratet / eingetragene Lebenspartnerschaft)
                <span className="block text-xs font-normal text-gray-500 mt-0.5">
                  Verdoppelt den Höchstbetrag auf 61.652 € pro Jahr (§ 10 Abs. 3 S. 2 EStG).
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-lg font-medium text-orange-100 mb-2">Deine Steuerersparnis pro Jahr</h3>

        <div className="text-center py-4">
          <div className="text-5xl font-bold mb-1">
            {formatCurrency(result.steuerersparnis)}
          </div>
          <div className="text-orange-200 text-sm">
            über den Sonderausgabenabzug (§ 10 EStG)
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{formatCurrency(result.abziehbar)}</div>
            <div className="text-orange-200 text-sm">Abziehbar als Sonderausgaben</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{formatCurrency(result.nettoAufwand)}</div>
            <div className="text-orange-200 text-sm">Netto-Aufwand</div>
          </div>
        </div>

        {/* Förderquote */}
        <div className="mt-4 bg-white/10 backdrop-blur rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-orange-100">Effektive Förderquote</span>
            <span className="text-2xl font-bold">{formatPercent(result.foerderquote)}</span>
          </div>
          <div className="text-orange-200 text-sm">
            Das Finanzamt trägt {formatPercent(result.foerderquote)} Ihres Beitrags über die Steuerersparnis mit.
          </div>
        </div>
      </div>

      {/* Aufschlüsselung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">So setzt sich die Ersparnis zusammen</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Eingezahlter Beitrag</span>
            <span className="font-semibold text-gray-800">{formatCurrency(beitrag)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Höchstbetrag {verheiratet ? '(Zusammenveranlagung)' : '(Einzelveranlagung)'}</span>
            <span className="font-semibold text-gray-800">{formatCurrency(result.hoechstbetrag)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Abziehbarer Sonderausgabenanteil (100 % seit 2023)</span>
            <span className="font-semibold text-orange-600">{formatCurrency(result.abziehbar)}</span>
          </div>
          {result.ueberHoechstbetrag && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Nicht berücksichtigter Beitrag (über Höchstbetrag)</span>
              <span className="font-semibold text-red-600">{formatCurrency(result.nichtAbziehbar)}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Steuerersparnis (Abzug × Grenzsteuersatz)</span>
            <span className="font-semibold text-gray-800">{formatCurrency(result.steuerersparnis)}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Netto-Aufwand (Beitrag − Steuerersparnis)</span>
            <span className="font-semibold text-gray-800">{formatCurrency(result.nettoAufwand)}</span>
          </div>
        </div>
      </div>

      {/* Info-Box */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-orange-800 mb-3">ℹ️ Was ist die Rürup-/Basisrente?</h3>
        <ul className="space-y-2 text-sm text-orange-700">
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>Die <strong>Rürup-Rente</strong> (offiziell <strong>Basisrente</strong>) ist eine staatlich geförderte private Altersvorsorge mit reinem <strong>Sonderausgabenabzug</strong> nach § 10 Abs. 1 Nr. 2 Buchst. b EStG.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>Sie richtet sich vor allem an <strong>Selbstständige und Gutverdiener</strong>, die keine Riester-Zulagen erhalten – statt Zulagen wirkt der Steuervorteil.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>Beiträge sind <strong>seit 2023 zu 100 %</strong> als Sonderausgaben absetzbar (§ 10 Abs. 3 S. 6 EStG).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>Der Höchstbetrag 2026 beträgt <strong>30.826 €</strong> (Ledige) bzw. <strong>61.652 €</strong> (Zusammenveranlagung) – er entspricht dem Höchstbeitrag zur knappschaftlichen Rentenversicherung.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>Anders als beim <a href="/altersvorsorgedepot-rechner" className="text-orange-700 underline hover:no-underline">Altersvorsorgedepot</a> (Zulagenmodell ab 2027) gibt es keine Zulagen – die Förderung läuft ausschließlich über die Steuer.</span>
          </li>
        </ul>
      </div>

      {/* Hinweis: nachgelagerte Besteuerung */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-amber-800 mb-3">⚠️ Hinweis zur nachgelagerten Besteuerung</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Die spätere <strong>Rente unterliegt der nachgelagerten Besteuerung</strong> nach § 22 Nr. 1 S. 3 EStG.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Der <strong>Besteuerungsanteil</strong> beträgt bei Rentenbeginn im Jahr <strong>2026 = {BESTEUERUNGSANTEIL_2026} %</strong> und steigt um 0,5 Prozentpunkte pro Jahr auf <strong>100 % bei Rentenbeginn 2058</strong>.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Der Höchstbetrag wird ggf. durch <strong>andere Beiträge zur Basisversorgung</strong> (gesetzliche Rentenversicherung, Versorgungswerk) mitgefüllt und kann bei <strong>Beamten/Arbeitnehmern</strong> mit steuerfreiem Arbeitgeberanteil gekürzt sein (§ 10 Abs. 3 S. 4 EStG).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span><strong>Solidaritätszuschlag und Kirchensteuer</strong>-Effekte auf die Ersparnis sind nicht berücksichtigt.</span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">
        <p className="text-xs text-gray-500">
          <strong>Schätzung – keine Steuer- oder Rechtsberatung.</strong> Der Rechner ermittelt die Steuerersparnis
          über den Sonderausgabenabzug nach § 10 Abs. 1 Nr. 2 Buchst. b i.V.m. Abs. 3 EStG (Stand 2026). Der
          abziehbare Höchstbetrag (30.826 € Ledige / 61.652 € Zusammenveranlagung) wird ggf. durch andere Beiträge
          zur Basisversorgung (gesetzliche Rentenversicherung, Versorgungswerk) mitgefüllt und kann bei
          Beamten/Arbeitnehmern mit steuerfreiem Arbeitgeberanteil gekürzt sein (§ 10 Abs. 3 S. 4 EStG). Die spätere
          Rente unterliegt der nachgelagerten Besteuerung nach § 22 Nr. 1 S. 3 EStG (Besteuerungsanteil bei
          Rentenbeginn 2026 = 84 %, steigend bis 100 % bei Rentenbeginn 2058). Solidaritätszuschlag und
          Kirchensteuer-Effekte sind nicht berücksichtigt. Angaben ohne Gewähr. Für eine verbindliche Berechnung
          Steuerberater bzw. Finanzamt konsultieren.
        </p>
      </div>

      {/* Quellen */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-700 mb-3">📚 Quellen & Rechtliche Grundlagen</h3>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>
            <a href="https://www.gesetze-im-internet.de/estg/__10.html" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
              § 10 EStG – Sonderausgabenabzug, Höchstbetrag Altersvorsorgeaufwendungen (Abs. 3)
            </a>
          </li>
          <li>
            <a href="https://www.gesetze-im-internet.de/estg/__22.html" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
              § 22 EStG – Nachgelagerte Besteuerung, Besteuerungsanteil-Tabelle
            </a>
          </li>
          <li>
            <a href="https://www.gesetze-im-internet.de/svbezgrv_2026/BJNR1160A0025.html" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
              SVBezGrV 2026 – Beitragsbemessungsgrenze knappschaftliche RV (124.800 €/Jahr)
            </a>
          </li>
          <li>
            <a href="https://www.deutsche-rentenversicherung.de/KnappschaftBahnSee/DE/Aktuelles/Meldungen/2026/2026_01_02_Sozialversicherungsrechengroessen2026.html" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
              DRV Knappschaft-Bahn-See – Beitragssatz knappschaftliche RV 2026 = 24,7 %
            </a>
          </li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          Stand: Juni 2026. Alle Angaben ohne Gewähr. Keine Steuer- oder Rechtsberatung – Ergebnisse dienen nur der Orientierung.
        </p>
      </div>
    </div>
  );
}
