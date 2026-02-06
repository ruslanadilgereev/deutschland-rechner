import { useState, useMemo } from 'react';

// Kurzarbeitergeld Berechnungsgrundlagen 2026
// Quelle: https://www.arbeitsagentur.de/unternehmen/finanziell/kurzarbeitergeld
// Quelle: https://www.gesetze-im-internet.de/sgb_3/__105.html

// Beitragsbemessungsgrenze 2026 (monatlich) - bundesweit einheitlich
const BEITRAGSBEMESSUNGSGRENZE = 8450; // 2026: 8.450€/Monat

// Lohnsteuerklassen
const STEUERKLASSEN = [1, 2, 3, 4, 5, 6] as const;
type Steuerklasse = (typeof STEUERKLASSEN)[number];

// Sozialabgaben für pauschale Nettoberechnung 2026
const SOZIALABGABEN = {
  rentenversicherung: 0.093, // 9,3% AN-Anteil
  krankenversicherung: 0.073, // 7,3% AN-Anteil
  zusatzbeitrag_kv: 0.0145, // 1,45% AN-Anteil
  pflegeversicherung: 0.018, // 1,8% AN-Anteil
  pflegeversicherung_kinderlos: 0.024, // 2,4% AN-Anteil
  arbeitslosenversicherung: 0.013, // 1,3% AN-Anteil
};

// Vereinfachte Lohnsteuer-Näherung nach Steuerklasse (monatlich, 2026)
function berechneUngefaehreLohnsteuer(
  brutto: number,
  steuerklasse: Steuerklasse,
  kirchensteuer: boolean
): number {
  // Grundfreibetrag 2026: 12.348€/Jahr = 1.029€/Monat
  const grundfreibetrag = 1029;

  let steuerpflichtig = brutto - grundfreibetrag;
  if (steuerpflichtig < 0) return 0;

  // Steuerklassen-Faktoren (vereinfacht)
  const faktoren: Record<Steuerklasse, number> = {
    1: 0.2,
    2: 0.18,
    3: 0.12,
    4: 0.2,
    5: 0.3,
    6: 0.35,
  };

  let steuer = steuerpflichtig * faktoren[steuerklasse];

  // Kirchensteuer (8-9%)
  if (kirchensteuer) {
    steuer *= 1.085;
  }

  // Soli (nur für hohe Einkommen)
  if (brutto > 4500) {
    steuer *= 1.055;
  }

  return Math.max(0, Math.round(steuer));
}

// Netto-Berechnung
function berechneNetto(
  brutto: number,
  steuerklasse: Steuerklasse,
  kirchensteuer: boolean,
  hatKinder: boolean
): { netto: number; details: any } {
  const bemessungsbrutto = Math.min(brutto, BEITRAGSBEMESSUNGSGRENZE);

  const rv = bemessungsbrutto * SOZIALABGABEN.rentenversicherung;
  const kv =
    bemessungsbrutto *
    (SOZIALABGABEN.krankenversicherung + SOZIALABGABEN.zusatzbeitrag_kv);
  const pv =
    bemessungsbrutto *
    (hatKinder
      ? SOZIALABGABEN.pflegeversicherung
      : SOZIALABGABEN.pflegeversicherung_kinderlos);
  const av = bemessungsbrutto * SOZIALABGABEN.arbeitslosenversicherung;

  const sozialabgaben = rv + kv + pv + av;
  const lohnsteuer = berechneUngefaehreLohnsteuer(
    brutto,
    steuerklasse,
    kirchensteuer
  );

  const netto = brutto - sozialabgaben - lohnsteuer;

  return {
    netto: Math.max(0, Math.round(netto)),
    details: {
      brutto,
      bemessungsbrutto,
      rentenversicherung: Math.round(rv),
      krankenversicherung: Math.round(kv),
      pflegeversicherung: Math.round(pv),
      arbeitslosenversicherung: Math.round(av),
      sozialabgabenGesamt: Math.round(sozialabgaben),
      lohnsteuer,
    },
  };
}

export default function KurzarbeitergeldRechner() {
  // Eingabewerte
  const [bruttogehalt, setBruttogehalt] = useState(3500);
  const [arbeitszeitNormal, setArbeitszeitNormal] = useState(100); // Prozent
  const [arbeitszeitReduziert, setArbeitszeitReduziert] = useState(50); // Prozent
  const [steuerklasse, setSteuerklasse] = useState<Steuerklasse>(1);
  const [kirchensteuer, setKirchensteuer] = useState(false);
  const [hatKinder, setHatKinder] = useState(false);
  const [kurzarbeitMonate, setKurzarbeitMonate] = useState(1);

  const ergebnis = useMemo(() => {
    // Arbeitsentgeltausfall berechnen
    const ausfallProzent = arbeitszeitNormal - arbeitszeitReduziert;
    const ausfallFaktor = ausfallProzent / 100;

    // SOLL-Entgelt (normales Brutto)
    const sollBrutto = bruttogehalt;
    const sollNetto = berechneNetto(
      sollBrutto,
      steuerklasse,
      kirchensteuer,
      hatKinder
    );

    // IST-Entgelt (reduziertes Brutto)
    const istBrutto = bruttogehalt * (arbeitszeitReduziert / 100);
    const istNetto = berechneNetto(
      istBrutto,
      steuerklasse,
      kirchensteuer,
      hatKinder
    );

    // Nettoentgeltdifferenz
    const nettoDifferenz = sollNetto.netto - istNetto.netto;

    // KuG-Leistungssatz: 60% ohne Kind, 67% mit Kind
    const kugProzent = hatKinder ? 0.67 : 0.6;
    const kug = Math.round(nettoDifferenz * kugProzent);

    // Gesamteinkommen während Kurzarbeit
    const gesamtNetto = istNetto.netto + kug;

    // Differenz zum normalen Netto
    const differenzZuNormal = sollNetto.netto - gesamtNetto;
    const differenzProzent =
      sollNetto.netto > 0
        ? Math.round((differenzZuNormal / sollNetto.netto) * 100)
        : 0;

    // Gesamtkosten für Arbeitgeber (vereinfacht)
    // Arbeitgeber zahlt weiterhin Sozialabgaben auf 80% des ausgefallenen Bruttoentgelts
    const agAnteilAusgefallen = bruttogehalt * ausfallFaktor * 0.8 * 0.2; // ca. 20% AG-Anteil Sozialversicherung

    return {
      // SOLL-Entgelt
      sollBrutto,
      sollNetto: sollNetto.netto,
      sollNettoDetails: sollNetto.details,

      // IST-Entgelt
      istBrutto: Math.round(istBrutto),
      istNetto: istNetto.netto,
      istNettoDetails: istNetto.details,

      // Ausfall
      ausfallProzent,
      ausfallBrutto: Math.round(bruttogehalt * ausfallFaktor),
      nettoDifferenz,

      // KuG
      kugProzent,
      kug,
      kugTaeglich: Math.round((kug / 30) * 100) / 100,

      // Gesamt
      gesamtNetto,
      differenzZuNormal,
      differenzProzent,

      // Für Arbeitgeber
      agKosten: Math.round(agAnteilAusgefallen),

      // Sonstiges
      beitragsbemessungsgrenze: BEITRAGSBEMESSUNGSGRENZE,
    };
  }, [
    bruttogehalt,
    arbeitszeitNormal,
    arbeitszeitReduziert,
    steuerklasse,
    kirchensteuer,
    hatKinder,
    kurzarbeitMonate,
  ]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }) + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Bruttogehalt */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">
              Monatliches Bruttogehalt (SOLL)
            </span>
            <span className="text-xs text-gray-500 block mt-1">
              Ihr normales Brutto bei voller Arbeitszeit
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={bruttogehalt}
              onChange={(e) =>
                setBruttogehalt(Math.max(0, Number(e.target.value)))
              }
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              min="0"
              max="15000"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
              €
            </span>
          </div>
          <input
            type="range"
            value={bruttogehalt}
            onChange={(e) => setBruttogehalt(Number(e.target.value))}
            className="w-full mt-3 accent-blue-500"
            min="500"
            max="8000"
            step="50"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>500 €</span>
            <span>4.000 €</span>
            <span>8.000 €</span>
          </div>
        </div>

        {/* Arbeitszeit-Reduktion */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">
              Arbeitszeitreduzierung
            </span>
            <span className="text-xs text-gray-500 block mt-1">
              Wie viel arbeiten Sie noch (in % der normalen Arbeitszeit)?
            </span>
          </label>

          <div className="bg-gray-50 rounded-xl p-4 mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Verbleibende Arbeit</span>
              <span className="text-2xl font-bold text-blue-600">
                {arbeitszeitReduziert}%
              </span>
            </div>
            <input
              type="range"
              value={arbeitszeitReduziert}
              onChange={(e) =>
                setArbeitszeitReduziert(Number(e.target.value))
              }
              className="w-full accent-blue-500"
              min="0"
              max="100"
              step="10"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0% (Kurzarbeit Null)</span>
              <span>50%</span>
              <span>100% (keine)</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[0, 25, 50, 75].map((pct) => (
              <button
                key={pct}
                onClick={() => setArbeitszeitReduziert(pct)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  arbeitszeitReduziert === pct
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>

          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Arbeitsausfall:</strong>{' '}
              {ergebnis.ausfallProzent}% = {formatEuro(ergebnis.ausfallBrutto)}{' '}
              Brutto
              {arbeitszeitReduziert === 0 && (
                <span className="block mt-1 text-blue-600">
                  → „Kurzarbeit Null" (vollständiger Arbeitsausfall)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Steuerklasse */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Steuerklasse</span>
          </label>
          <div className="grid grid-cols-6 gap-2">
            {STEUERKLASSEN.map((sk) => (
              <button
                key={sk}
                onClick={() => setSteuerklasse(sk)}
                className={`py-3 px-2 rounded-xl text-center transition-all ${
                  steuerklasse === sk
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="font-bold">{sk}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {steuerklasse === 1 && '👤 Ledig, geschieden oder verwitwet'}
            {steuerklasse === 2 && '👨‍👧 Alleinerziehend mit Kind'}
            {steuerklasse === 3 && '💑 Verheiratet, Partner hat Steuerklasse 5'}
            {steuerklasse === 4 && '💑 Verheiratet, beide verdienen ähnlich'}
            {steuerklasse === 5 && '💑 Verheiratet, Partner hat Steuerklasse 3'}
            {steuerklasse === 6 && '📋 Zweit- oder Nebenjob'}
          </p>
        </div>

        {/* Kinder */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">
              Kindergeld-Anspruch?
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setHatKinder(false)}
              className={`py-4 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                !hatKinder
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">👤</span>
              <span>Ohne Kinder (60%)</span>
            </button>
            <button
              onClick={() => setHatKinder(true)}
              className={`py-4 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                hatKinder
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">👨‍👧</span>
              <span>Mit Kindern (67%)</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Mit Kindern erhalten Sie 67% statt 60% der Nettoentgeltdifferenz
          </p>
        </div>

        {/* Kirchensteuer */}
        <div className="mb-4">
          <button
            onClick={() => setKirchensteuer(!kirchensteuer)}
            className={`w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-between ${
              kirchensteuer
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>⛪ Kirchensteuer</span>
            <span>{kirchensteuer ? '✓ Ja' : '✗ Nein'}</span>
          </button>
        </div>
      </div>

      {/* Result Section */}
      <div className="rounded-2xl shadow-lg p-6 text-white mb-6 bg-gradient-to-br from-orange-500 to-red-600">
        <h3 className="text-sm font-medium opacity-80 mb-1">
          📊 Ihr voraussichtliches Kurzarbeitergeld
        </h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.kug)}</span>
            <span className="text-xl opacity-80">/ Monat</span>
          </div>
          <p className="text-orange-100 mt-2 text-sm">
            Das sind <strong>{Math.round(ergebnis.kugProzent * 100)}%</strong> der
            Nettoentgeltdifferenz ({formatEuro(ergebnis.nettoDifferenz)})
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Ihr Gehalt (IST)</span>
            <div className="text-xl font-bold">
              {formatEuro(ergebnis.istNetto)}
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">+ Kurzarbeitergeld</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.kug)}</div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-white/20 rounded-xl backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <span className="font-medium">= Ihr Gesamteinkommen</span>
            <span className="text-2xl font-bold">
              {formatEuro(ergebnis.gesamtNetto)}
            </span>
          </div>
          <p className="text-sm opacity-90 mt-2">
            Das sind{' '}
            <strong>
              {formatEuro(ergebnis.differenzZuNormal)} weniger (
              {ergebnis.differenzProzent}%)
            </strong>{' '}
            als Ihr normales Netto ({formatEuro(ergebnis.sollNetto)})
          </p>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>

        <div className="space-y-3 text-sm">
          {/* SOLL-Entgelt */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            SOLL-Entgelt (normaler Verdienst)
          </div>

          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Brutto (100%)</span>
            <span className="font-bold text-gray-900">
              {formatEuro(ergebnis.sollBrutto)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>− Abzüge (Steuer + Sozialabgaben)</span>
            <span>
              {formatEuro(
                ergebnis.sollBrutto - ergebnis.sollNetto
              )}
            </span>
          </div>
          <div className="flex justify-between py-2 bg-gray-50 -mx-6 px-6">
            <span className="font-medium text-gray-700">= SOLL-Netto</span>
            <span className="font-bold text-gray-900">
              {formatEuro(ergebnis.sollNetto)}
            </span>
          </div>

          {/* IST-Entgelt */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            IST-Entgelt (reduzierter Verdienst)
          </div>

          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              Brutto ({arbeitszeitReduziert}%)
            </span>
            <span className="font-bold text-gray-900">
              {formatEuro(ergebnis.istBrutto)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>− Abzüge (Steuer + Sozialabgaben)</span>
            <span>
              {formatEuro(ergebnis.istBrutto - ergebnis.istNetto)}
            </span>
          </div>
          <div className="flex justify-between py-2 bg-gray-50 -mx-6 px-6">
            <span className="font-medium text-gray-700">= IST-Netto</span>
            <span className="font-bold text-gray-900">
              {formatEuro(ergebnis.istNetto)}
            </span>
          </div>

          {/* KuG Berechnung */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Kurzarbeitergeld-Berechnung
          </div>

          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">SOLL-Netto</span>
            <span className="text-gray-900">{formatEuro(ergebnis.sollNetto)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>− IST-Netto</span>
            <span>{formatEuro(ergebnis.istNetto)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">= Nettoentgeltdifferenz</span>
            <span className="font-medium text-gray-900">
              {formatEuro(ergebnis.nettoDifferenz)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              × Leistungssatz ({hatKinder ? 'mit Kind' : 'ohne Kind'})
            </span>
            <span className="text-gray-900">
              {Math.round(ergebnis.kugProzent * 100)}%
            </span>
          </div>

          <div className="flex justify-between py-3 bg-orange-100 -mx-6 px-6 rounded-b-xl">
            <span className="font-bold text-orange-800">
              = Kurzarbeitergeld pro Monat
            </span>
            <span className="font-bold text-2xl text-orange-900">
              {formatEuro(ergebnis.kug)}
            </span>
          </div>
        </div>
      </div>

      {/* Vergleichsübersicht */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📈 Vergleich: Normal vs. Kurzarbeit</h3>
        
        <div className="space-y-4">
          {/* Normale Arbeit */}
          <div className="p-4 bg-green-50 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-green-800">Normale Arbeit (100%)</span>
              <span className="text-xl font-bold text-green-700">{formatEuro(ergebnis.sollNetto)}</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
          
          {/* Kurzarbeit */}
          <div className="p-4 bg-orange-50 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-orange-800">Kurzarbeit ({arbeitszeitReduziert}%)</span>
              <span className="text-xl font-bold text-orange-700">{formatEuro(ergebnis.gesamtNetto)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 flex overflow-hidden">
              <div 
                className="bg-blue-500 h-3" 
                style={{ width: `${(ergebnis.istNetto / ergebnis.sollNetto) * 100}%` }}
                title="Ihr Gehalt"
              ></div>
              <div 
                className="bg-orange-500 h-3" 
                style={{ width: `${(ergebnis.kug / ergebnis.sollNetto) * 100}%` }}
                title="KuG"
              ></div>
            </div>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-blue-500 rounded"></span>
                Gehalt: {formatEuro(ergebnis.istNetto)}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-orange-500 rounded"></span>
                KuG: {formatEuro(ergebnis.kug)}
              </span>
            </div>
          </div>
          
          {/* Differenz */}
          <div className="p-4 bg-red-50 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="font-medium text-red-800">Einkommensverlust</span>
              <span className="text-xl font-bold text-red-700">
                −{formatEuro(ergebnis.differenzZuNormal)} ({ergebnis.differenzProzent}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert Kurzarbeitergeld</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Leistungssatz:</strong> 60% der Nettoentgeltdifferenz (67%
              mit mindestens einem Kind)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Berechnung:</strong> Differenz zwischen SOLL-Netto
              (normaler Verdienst) und IST-Netto (reduzierter Verdienst)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Bezugsdauer:</strong> Maximal 12 Monate innerhalb von 24
              Monaten (kann verlängert werden)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Voraussetzung:</strong> Mindestens 10% der Beschäftigten
              betroffen, erheblicher Arbeitsausfall
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Sozialversicherung:</strong> Sie bleiben voll
              sozialversichert (AG zahlt Beiträge auf fiktives Entgelt)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Steuerfrei:</strong> KuG ist steuerfrei, unterliegt aber
              dem Progressionsvorbehalt
            </span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Antragstellung:</strong> Der Arbeitgeber muss Kurzarbeit
              bei der Agentur für Arbeit anzeigen
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Erheblicher Arbeitsausfall:</strong> Muss unvermeidbar und
              vorübergehend sein (z.B. Auftragsmangel, Lieferengpässe)
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Nebenjob:</strong> Einkünfte aus während der Kurzarbeit
              neu aufgenommenen Nebenjobs werden angerechnet
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Urlaub:</strong> Urlaubstage werden voll bezahlt (kein KuG
              während des Urlaubs)
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Steuererklärung:</strong> KuG muss in der Steuererklärung
              angegeben werden (Progressionsvorbehalt)
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Schätzung:</strong> Dieser Rechner liefert eine
              Orientierung – die exakte Berechnung erfolgt durch die Agentur für
              Arbeit
            </span>
          </li>
        </ul>
      </div>

      {/* Neuerungen 2026 */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-blue-800 mb-3">🆕 Regelungen 2026</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Standardregelung:</strong> 60% (ohne Kind) bzw. 67% (mit
              Kind) der Nettoentgeltdifferenz
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Bezugsdauer:</strong> 12 Monate (keine verlängerten
              Corona-Regelungen mehr)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Beitragsbemessungsgrenze:</strong> 8.450€/Monat bundesweit
              einheitlich
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Mindesterfordernisse:</strong> 10% der Beschäftigten
              betroffen, erheblicher Arbeitsausfall
            </span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-orange-50 rounded-xl p-4">
            <p className="font-semibold text-orange-900">Agentur für Arbeit</p>
            <p className="text-sm text-orange-700 mt-1">
              Die Bundesagentur für Arbeit ist zuständig für Kurzarbeitergeld.
              Der Arbeitgeber muss den Antrag stellen.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">
                  Arbeitgeber-Service
                </p>
                <a
                  href="tel:08004555520"
                  className="text-blue-600 hover:underline font-bold"
                >
                  0800 4 555520
                </a>
                <p className="text-gray-500 text-xs mt-1">
                  Kostenfrei, Mo-Fr 8-18 Uhr
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Online-Anzeige</p>
                <a
                  href="https://www.arbeitsagentur.de/unternehmen/finanziell/kurzarbeitergeld"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  arbeitsagentur.de →
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-medium text-gray-800">Für Arbeitgeber</p>
              <ul className="text-gray-600 mt-1 space-y-1">
                <li>
                  • Kurzarbeit bei der Agentur für Arbeit anzeigen
                </li>
                <li>• Antrag auf KuG stellen (nach Beginn der Kurzarbeit)</li>
                <li>• Arbeitszeiten und Entgelte dokumentieren</li>
                <li>• KuG an Arbeitnehmer auszahlen (AG ist Zahlstelle)</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl text-sm">
            <span className="text-xl">👷</span>
            <div>
              <p className="font-medium text-amber-800">Für Arbeitnehmer</p>
              <ul className="text-amber-700 mt-1 space-y-1">
                <li>• Sie müssen keinen eigenen Antrag stellen</li>
                <li>• KuG wird vom Arbeitgeber mit dem Lohn ausgezahlt</li>
                <li>• Bei Fragen: Betriebsrat oder Agentur für Arbeit</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Weiterführende Links */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-blue-800 mb-3">
          🔗 Das könnte Sie auch interessieren
        </h3>
        <div className="flex flex-wrap gap-3">
          <a
            href="/arbeitslosengeld-rechner"
            className="inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            📋 ALG I-Rechner →
          </a>
          <a
            href="/buergergeld-rechner"
            className="inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            🏦 Bürgergeld-Rechner →
          </a>
          <a
            href="/brutto-netto-rechner"
            className="inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            💵 Brutto-Netto-Rechner →
          </a>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
          Quellen
        </h4>
        <div className="space-y-1">
          <a
            href="https://www.arbeitsagentur.de/unternehmen/finanziell/kurzarbeitergeld"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesagentur für Arbeit – Kurzarbeitergeld
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_3/__105.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            SGB III §105 – Anspruch auf Kurzarbeitergeld
          </a>
          <a
            href="https://www.bmas.de/DE/Arbeit/Arbeitsrecht/Kurzarbeit/kurzarbeit-artikel.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMAS – Kurzarbeit und Kurzarbeitergeld
          </a>
          <a
            href="https://www.haufe.de/personal/entgelt/kurzarbeitergeld-berechnung-hoehe-und-auszahlung_78_389810.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Haufe – KuG Berechnung und Höhe
          </a>
        </div>
      </div>
    </div>
  );
}
