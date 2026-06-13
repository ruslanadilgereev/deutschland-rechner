import { useState, useMemo } from 'react';

// ── Verifizierte Kernwerte 2026 (amtliche Primärquellen) ──────────────────
// Beitragsbemessungsgrenze allg. Rentenversicherung 2026 (bundeseinheitlich)
const BBG_RV_JAHR = 101400; // €/Jahr (SV-Rechengrößenverordnung 2026)

// § 3 Nr. 63 EStG: steuerfrei bis 8 % der BBG-RV
const STEUERFREI_MONAT = 676; // = 0,08 × 101.400 / 12

// § 1 Abs. 1 Satz 1 Nr. 9 SvEV: sozialversicherungsfrei bis 4 % der BBG-RV
const SVFREI_MONAT = 338; // = 0,04 × 101.400 / 12

// § 1a Abs. 1a BetrAVG: verpflichtender AG-Zuschuss bei SV-Ersparnis
const AG_ZUSCHUSS_PROZENT = 0.15; // 15 % des umgewandelten Entgelts

// Arbeitnehmer-SV-Beitragssätze 2026 (jeweils halber Satz, für Ersparnis-Schätzung)
const RV_AN = 0.093; // Rentenversicherung 18,6 % → AN 9,3 %
const AV_AN = 0.013; // Arbeitslosenversicherung 2,6 % → AN 1,3 %
const KV_AN = 0.0875; // GKV allg. 14,6 % + Ø Zusatzbeitrag 2,9 % = 17,5 % → AN 8,75 %
const PV_AN = 0.018; // Pflege 3,6 % → AN 1,8 %
const PV_KINDERLOS_ZUSCHLAG = 0.006; // +0,6 % voll vom AN (ab 23 J., keine Kinder)

// Auszahlphase 2026: Versorgungsbezüge – voller Beitragssatz (§ 248 SGB V)
const KV_VOLL = 0.175; // GKV 14,6 % + Ø Zusatzbeitrag 2,9 %
const PV_VOLL = 0.036; // Pflege 3,6 %
const KV_FREIBETRAG_MONAT = 197.75; // § 226 Abs. 2 SGB V 2026 = 3.955 / 20 (NUR KV)
const KAPITAL_VERTEILUNG_MONATE = 120; // § 229 Abs. 1 Satz 3 SGB V (10 Jahre)

const formatCurrency = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
};

const formatPercent = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';
};

export default function BetriebsrenteRechner() {
  // ── Ansparphase: Inputs ──
  const [umwandlung, setUmwandlung] = useState<number>(300);
  const [grenzsteuersatz, setGrenzsteuersatz] = useState<number>(30);
  const [kinderlos, setKinderlos] = useState<boolean>(false);
  const [zuschussVoll, setZuschussVoll] = useState<boolean>(false);

  // ── Auszahlphase: Inputs (optionaler Toggle) ──
  const [mitAuszahlung, setMitAuszahlung] = useState<boolean>(false);
  const [auszahlungArt, setAuszahlungArt] = useState<'rente' | 'kapital'>('rente');
  const [betriebsrente, setBetriebsrente] = useState<number>(250);
  const [kapitalbetrag, setKapitalbetrag] = useState<number>(30000);
  const [kvdrPflicht, setKvdrPflicht] = useState<boolean>(true);
  const [steuersatzAlter, setSteuersatzAlter] = useState<number>(20);

  // ── Ansparphase: Ergebnis ──
  const anspar = useMemo(() => {
    // Steuerfrei bis 676 €/Monat (8 %), darüber lohnsteuerpflichtig
    const steuerfreierAnteil = Math.min(umwandlung, STEUERFREI_MONAT);
    // SV-frei nur bis 338 €/Monat (4 %)
    const svfreierAnteil = Math.min(umwandlung, SVFREI_MONAT);

    // AN-SV-Ersparnis-Satz (mit/ohne Kinderlosen-Zuschlag in der Pflege)
    const svSatzAN = RV_AN + AV_AN + KV_AN + PV_AN + (kinderlos ? PV_KINDERLOS_ZUSCHLAG : 0);

    const steuerersparnis = steuerfreierAnteil * (grenzsteuersatz / 100);
    const svErsparnis = svfreierAnteil * svSatzAN;
    const nettoAufwand = Math.max(0, umwandlung - steuerersparnis - svErsparnis);

    // AG-Pflichtzuschuss greift nur auf den SV-frei umgewandelten Anteil
    const agZuschuss = zuschussVoll
      ? umwandlung * AG_ZUSCHUSS_PROZENT
      : svfreierAnteil * AG_ZUSCHUSS_PROZENT;

    const sparbeitrag = umwandlung + agZuschuss;

    // Hinweis: Anteil zwischen 4 % und 8 % ist lohnsteuerfrei, aber SV-pflichtig
    const svPflichtigerAnteil = Math.max(0, steuerfreierAnteil - svfreierAnteil);

    return {
      steuerfreierAnteil,
      svfreierAnteil,
      svPflichtigerAnteil,
      svSatzAN,
      steuerersparnis,
      svErsparnis,
      nettoAufwand,
      agZuschuss,
      sparbeitrag,
    };
  }, [umwandlung, grenzsteuersatz, kinderlos, zuschussVoll]);

  // ── Auszahlphase: Ergebnis ──
  const auszahlung = useMemo(() => {
    if (!mitAuszahlung) return null;

    // Bei Kapitalauszahlung: fiktiver Monatsbetrag = Kapital / 120
    const monatsbezug =
      auszahlungArt === 'rente' ? betriebsrente : kapitalbetrag / KAPITAL_VERTEILUNG_MONATE;

    const pvSatz = PV_VOLL + (kinderlos ? PV_KINDERLOS_ZUSCHLAG : 0);

    // KV: Freibetrag nur für KVdR-Pflichtversicherte, NICHT für PV
    const kvBemessung = kvdrPflicht ? Math.max(0, monatsbezug - KV_FREIBETRAG_MONAT) : monatsbezug;
    const kvBeitrag = kvBemessung * KV_VOLL;
    const pvBeitrag = monatsbezug * pvSatz;

    // Nachgelagerte Besteuerung (§ 22 Nr. 5 Satz 1 EStG): voll steuerpflichtig
    const einkommensteuer = monatsbezug * (steuersatzAlter / 100);

    const nettoBezug = monatsbezug - kvBeitrag - pvBeitrag - einkommensteuer;

    return {
      monatsbezug,
      kvBeitrag,
      pvBeitrag,
      einkommensteuer,
      nettoBezug,
      pvSatz,
    };
  }, [mitAuszahlung, auszahlungArt, betriebsrente, kapitalbetrag, kvdrPflicht, kinderlos, steuersatzAlter]);

  // Visualisierung: Anteil Netto-Aufwand am Sparbeitrag
  const aufwandsQuote =
    anspar.sparbeitrag > 0 ? (anspar.nettoAufwand / anspar.sparbeitrag) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Eingabebereich Ansparphase */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Ihre Entgeltumwandlung (Ansparphase)</h2>

        <div className="space-y-4">
          {/* Umwandlungsbetrag */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Umgewandeltes Bruttoentgelt (pro Monat)
            </label>
            <div className="relative">
              <input
                type="number"
                value={umwandlung || ''}
                onChange={(e) => setUmwandlung(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="300"
                min="0"
                step="25"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Steuerfrei bis {formatCurrency(STEUERFREI_MONAT)}/Monat (8 % BBG) · SV-frei bis{' '}
              {formatCurrency(SVFREI_MONAT)}/Monat (4 % BBG)
            </p>
          </div>

          {/* Grenzsteuersatz Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Persönlicher Grenzsteuersatz:{' '}
              <span className="font-bold text-orange-600">{formatPercent(grenzsteuersatz)}</span>
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
              💡 Vereinfachte Schätzung der Steuerersparnis – kein exakter Lohnsteuerabzug (PAP).
            </p>
          </div>

          {/* Optionen */}
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={kinderlos}
                onChange={(e) => setKinderlos(e.target.checked)}
                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">
                Kinderlos (ab 23 J.) – Pflege-Zuschlag +0,6 %
              </span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={zuschussVoll}
                onChange={(e) => setZuschussVoll(e.target.checked)}
                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">
                AG zahlt 15 % auf den vollen Betrag (tariflich)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Ergebnis Ansparphase */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-lg font-medium text-orange-100 mb-2">Ihr Netto-Aufwand pro Monat</h3>

        <div className="text-center py-4">
          <div className="text-5xl font-bold mb-1">{formatCurrency(anspar.nettoAufwand)}</div>
          <div className="text-orange-200 text-sm">
            für {formatCurrency(anspar.sparbeitrag)} Sparbeitrag im Vertrag
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{formatCurrency(anspar.steuerersparnis)}</div>
            <div className="text-orange-200 text-sm">Steuerersparnis</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{formatCurrency(anspar.svErsparnis)}</div>
            <div className="text-orange-200 text-sm">SV-Ersparnis (AN)</div>
          </div>
        </div>

        <div className="mt-4 bg-white/10 backdrop-blur rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-orange-100">Arbeitgeber-Pflichtzuschuss (15 %)</span>
            <span className="text-2xl font-bold">+{formatCurrency(anspar.agZuschuss)}</span>
          </div>
          <div className="text-orange-200 text-sm">
            {zuschussVoll ? 'auf den vollen umgewandelten Betrag' : 'auf den SV-frei umgewandelten Anteil (§ 1a BetrAVG)'}
          </div>
        </div>
      </div>

      {/* Visualisierung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">So setzt sich Ihr Sparbeitrag zusammen</h3>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Ihr Netto-Aufwand</span>
              <span className="font-medium">{formatCurrency(anspar.nettoAufwand)}</span>
            </div>
            <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-lg transition-all duration-500"
                style={{ width: `${Math.min(100, aufwandsQuote)}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Steuer- & SV-Ersparnis + AG-Zuschuss</span>
              <span className="font-medium text-green-600">
                +{formatCurrency(anspar.steuerersparnis + anspar.svErsparnis + anspar.agZuschuss)}
              </span>
            </div>
            <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-lg transition-all duration-500"
                style={{ width: `${Math.min(100, 100 - aufwandsQuote)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span>Eigener Netto-Aufwand</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Förderung (Staat + Arbeitgeber)</span>
          </div>
        </div>

        {anspar.svPflichtigerAnteil > 0 && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <strong>Achtung:</strong> {formatCurrency(anspar.svPflichtigerAnteil)} Ihrer Umwandlung
            liegen zwischen 4 % und 8 % der BBG. Dieser Anteil ist zwar lohnsteuerfrei, aber{' '}
            <strong>sozialversicherungspflichtig</strong> – darauf gibt es keine SV-Ersparnis und auch
            keinen gesetzlichen 15 %-Zuschuss.
          </div>
        )}
      </div>

      {/* Auszahlphase (optional) */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            id="mitAuszahlung"
            checked={mitAuszahlung}
            onChange={(e) => setMitAuszahlung(e.target.checked)}
            className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
          />
          <label htmlFor="mitAuszahlung" className="text-lg font-semibold text-gray-800">
            Auszahlphase einbeziehen (Rentnerjahre)
          </label>
        </div>

        {mitAuszahlung && auszahlung && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auszahlungsart</label>
              <select
                value={auszahlungArt}
                onChange={(e) => setAuszahlungArt(e.target.value as 'rente' | 'kapital')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="rente">Monatliche Betriebsrente</option>
                <option value="kapital">Einmalige Kapitalauszahlung</option>
              </select>
            </div>

            {auszahlungArt === 'rente' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monatliche Betriebsrente (brutto)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={betriebsrente || ''}
                    onChange={(e) => setBetriebsrente(Math.max(0, Number(e.target.value)))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="250"
                    min="0"
                    step="25"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Einmalige Kapitalauszahlung
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={kapitalbetrag || ''}
                    onChange={(e) => setKapitalbetrag(Math.max(0, Number(e.target.value)))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="30000"
                    min="0"
                    step="1000"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Auf KV/PV verteilt über 10 Jahre: fiktiver Monatsbezug{' '}
                  {formatCurrency(auszahlung.monatsbezug)} (Kapital ÷ 120, § 229 SGB V)
                </p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={kvdrPflicht}
                  onChange={(e) => setKvdrPflicht(e.target.checked)}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">
                  KVdR-pflichtversichert (KV-Freibetrag {formatCurrency(KV_FREIBETRAG_MONAT)})
                </span>
              </label>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Voraussichtlicher Steuersatz im Alter:{' '}
                  <span className="font-bold text-orange-600">{formatPercent(steuersatzAlter)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="42"
                  step="1"
                  value={steuersatzAlter}
                  onChange={(e) => setSteuersatzAlter(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>
            </div>

            {/* Ergebnis Auszahlphase */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Monatlicher Bezug (brutto)</span>
                <span className="font-medium">{formatCurrency(auszahlung.monatsbezug)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>− Krankenversicherung (17,5 %{kvdrPflicht ? ', nach Freibetrag' : ''})</span>
                <span className="font-medium">−{formatCurrency(auszahlung.kvBeitrag)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>− Pflegeversicherung ({formatPercent(auszahlung.pvSatz * 100)}, kein Freibetrag)</span>
                <span className="font-medium">−{formatCurrency(auszahlung.pvBeitrag)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>− Einkommensteuer ({formatPercent(steuersatzAlter)}, nachgelagert)</span>
                <span className="font-medium">−{formatCurrency(auszahlung.einkommensteuer)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-800">
                <span>= Netto-Auszahlung pro Monat</span>
                <span>{formatCurrency(auszahlung.nettoBezug)}</span>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              Der KV-Freibetrag von {formatCurrency(KV_FREIBETRAG_MONAT)}/Monat (§ 226 Abs. 2 SGB V)
              gilt nur in der gesetzlichen Krankenversicherung und nur für KVdR-Pflichtversicherte –{' '}
              <strong>nicht für die Pflegeversicherung</strong>.
            </div>
          </div>
        )}
      </div>

      {/* Info-Box */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-orange-800 mb-3">ℹ️ Was ist Entgeltumwandlung (bAV)?</h3>
        <ul className="space-y-2 text-sm text-orange-700">
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>Ein Teil des <strong>Bruttogehalts</strong> wird direkt in eine Betriebsrente eingezahlt</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>Steuerfrei bis <strong>8 % der BBG</strong> ({formatCurrency(STEUERFREI_MONAT)}/Monat 2026)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>Sozialversicherungsfrei nur bis <strong>4 % der BBG</strong> ({formatCurrency(SVFREI_MONAT)}/Monat 2026)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>Der <strong>Arbeitgeber muss 15 %</strong> zuschießen, soweit er SV-Beiträge spart</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>In der Auszahlung sind Leistungen <strong>voll steuerpflichtig</strong> und tragen die vollen KV-/PV-Beiträge</span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-amber-800 mb-2">⚠️ Schätzung – keine Steuer-/Rechtsberatung</h3>
        <p className="text-sm text-amber-700">
          Die berechnete Steuer- und Sozialversicherungs-Ersparnis ist eine vereinfachte Schätzung auf
          Basis des eingegebenen Grenzsteuersatzes und pauschaler Arbeitnehmer-SV-Beitragssätze 2026; der
          exakte Lohnsteuerabzug (PAP), Kirchensteuer und individuelle Zusatzbeiträge der Krankenkasse
          bleiben unberücksichtigt. In der Auszahlphase sind Betriebsrenten voll einkommensteuerpflichtig
          (nachgelagerte Besteuerung, § 22 Nr. 5 Satz 1 EStG) und unterliegen vollen KV-/PV-Beiträgen.
          Stand: Juni 2026. Für eine verbindliche Berechnung einen Steuerberater oder die Deutsche
          Rentenversicherung konsultieren.
        </p>
      </div>

      {/* Quellen */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-700 mb-3">📚 Quellen & Rechtliche Grundlagen</h3>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>
            <a href="https://www.gesetze-im-internet.de/estg/__3.html" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
              § 3 Nr. 63 EStG – Steuerfreiheit bAV (8 % der BBG)
            </a>
          </li>
          <li>
            <a href="https://www.gesetze-im-internet.de/betravg/__1a.html" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
              § 1a BetrAVG – Anspruch auf Entgeltumwandlung & 15 % AG-Zuschuss
            </a>
          </li>
          <li>
            <a href="https://www.gesetze-im-internet.de/svev/__1.html" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
              § 1 SvEV – Sozialversicherungsfreiheit bis 4 % der BBG
            </a>
          </li>
          <li>
            <a href="https://www.gesetze-im-internet.de/sgb_5/__226.html" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
              § 226 SGB V – KV-Freibetrag auf Versorgungsbezüge
            </a>
          </li>
          <li>
            <a href="https://www.gesetze-im-internet.de/sgb_5/__229.html" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
              § 229 SGB V – Versorgungsbezüge & Kapitalleistungen (1/120-Regel)
            </a>
          </li>
          <li>
            <a href="https://www.gesetze-im-internet.de/estg/__22.html" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
              § 22 Nr. 5 EStG – Nachgelagerte Besteuerung
            </a>
          </li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          Stand: Juni 2026. Alle Angaben ohne Gewähr. Keine Steuer- oder Rechtsberatung – Ergebnisse
          dienen nur der Orientierung.
        </p>
      </div>
    </div>
  );
}
