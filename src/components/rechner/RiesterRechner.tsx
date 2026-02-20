import { useState, useMemo } from 'react';

export default function RiesterRechner() {
  // Eingabewerte
  const [bruttojahresgehalt, setBruttojahresgehalt] = useState(45000);
  const [familienstand, setFamilienstand] = useState<'ledig' | 'verheiratet'>('ledig');
  const [partnerEigenerVertrag, setPartnerEigenerVertrag] = useState(false);
  const [kinderVor2008, setKinderVor2008] = useState(0);
  const [kinderAb2008, setKinderAb2008] = useState(1);
  const [istBerufseinsteiger, setIstBerufseinsteiger] = useState(false);
  const [eigeneBeitraege, setEigeneBeitraege] = useState(0);
  const [steuersatz, setSteuersatz] = useState(30);
  const [ansparphase, setAnsparphase] = useState(30);

  // Konstanten (Stand 2025/2026)
  const GRUNDZULAGE = 175; // € pro Jahr
  const KINDERZULAGE_VOR_2008 = 185; // € pro Kind/Jahr
  const KINDERZULAGE_AB_2008 = 300; // € pro Kind/Jahr
  const BERUFSEINSTEIGER_BONUS = 200; // € einmalig
  const HOECHSTBEITRAG = 2100; // € pro Jahr (inkl. Zulagen)
  const SOCKELBEITRAG = 60; // € Mindestbeitrag pro Jahr
  const FOERDERSATZ = 0.04; // 4% des Vorjahreseinkommens

  const ergebnis = useMemo(() => {
    // Zulagen berechnen
    const grundzulage = GRUNDZULAGE;
    const kinderzulage = (kinderVor2008 * KINDERZULAGE_VOR_2008) + (kinderAb2008 * KINDERZULAGE_AB_2008);
    const berufseinsteiger = istBerufseinsteiger ? BERUFSEINSTEIGER_BONUS : 0;
    
    // Bei Verheirateten mit eigenem Vertrag des Partners
    const grundzulagePartner = (familienstand === 'verheiratet' && partnerEigenerVertrag) ? GRUNDZULAGE : 0;
    
    const gesamtZulage = grundzulage + kinderzulage + berufseinsteiger;
    const gesamtZulageMitPartner = gesamtZulage + grundzulagePartner;

    // Mindesteigenbeitrag für volle Zulage
    // = 4% des Vorjahres-Brutto - Zulagen, min 60€, max so dass Gesamtbeitrag = 2.100€
    const vierProzent = bruttojahresgehalt * FOERDERSATZ;
    const berechneterMindesteigen = vierProzent - gesamtZulage;
    const mindesteigenbeitrag = Math.max(SOCKELBEITRAG, Math.min(berechneterMindesteigen, HOECHSTBEITRAG - gesamtZulage));
    
    // Gesamtbeitrag für volle Förderung
    const gesamtbeitragVolleFoerderung = Math.min(mindesteigenbeitrag + gesamtZulage, HOECHSTBEITRAG);
    
    // Monatlicher Eigenbeitrag
    const monatlichMindesteigen = mindesteigenbeitrag / 12;
    
    // Tatsächlicher Beitrag (wenn eingegeben)
    const tatsaechlicherEigenbeitrag = eigeneBeitraege > 0 ? eigeneBeitraege : mindesteigenbeitrag;
    const tatsaechlicherGesamtbeitrag = tatsaechlicherEigenbeitrag + gesamtZulage;
    
    // Zulagenquote berechnen (wie viel % kommt vom Staat)
    const zulagenquote = tatsaechlicherGesamtbeitrag > 0 
      ? (gesamtZulage / tatsaechlicherGesamtbeitrag) * 100 
      : 0;
    
    // Sonderausgabenabzug (max. 2.100€)
    const sonderausgabenabzug = Math.min(tatsaechlicherGesamtbeitrag, HOECHSTBEITRAG);
    const steuerersparnis = (sonderausgabenabzug * steuersatz) / 100;
    
    // Günstigerprüfung: Ist Sonderausgabenabzug besser als Zulagen?
    const effektiverVorteil = Math.max(steuerersparnis, gesamtZulage);
    const guenstigerSteuer = steuerersparnis > gesamtZulage;
    
    // Wenn Steuerersparnis größer, gibt es zusätzliche Erstattung
    const zusaetzlicheErstattung = guenstigerSteuer ? steuerersparnis - gesamtZulage : 0;
    
    // Gesamtförderung
    const gesamtfoerderung = gesamtZulage + zusaetzlicheErstattung + berufseinsteiger;
    
    // Langzeitprojektion
    const jahresSparrate = tatsaechlicherGesamtbeitrag;
    const jahresFoerderung = gesamtZulage + zusaetzlicheErstattung;
    
    // Annahme: 4% durchschnittliche Rendite p.a.
    const rendite = 0.04;
    let endkapital = 0;
    let eigenBeitraegeGesamt = 0;
    let zulagenGesamt = 0;
    let zinsGesamt = 0;
    
    for (let jahr = 1; jahr <= ansparphase; jahr++) {
      // Beitrag zu Beginn des Jahres
      endkapital += jahresSparrate;
      eigenBeitraegeGesamt += tatsaechlicherEigenbeitrag;
      zulagenGesamt += gesamtZulage;
      
      // Zinsen auf das Kapital
      const zinsenJahr = endkapital * rendite;
      endkapital += zinsenJahr;
      zinsGesamt += zinsenJahr;
      
      // Berufseinsteigerbonus nur im 1. Jahr
      if (jahr === 1 && istBerufseinsteiger) {
        zulagenGesamt += BERUFSEINSTEIGER_BONUS;
      }
    }

    return {
      grundzulage,
      kinderzulage,
      berufseinsteiger,
      gesamtZulage,
      grundzulagePartner,
      gesamtZulageMitPartner,
      mindesteigenbeitrag,
      monatlichMindesteigen,
      gesamtbeitragVolleFoerderung,
      tatsaechlicherEigenbeitrag,
      tatsaechlicherGesamtbeitrag,
      zulagenquote,
      sonderausgabenabzug,
      steuerersparnis,
      guenstigerSteuer,
      zusaetzlicheErstattung,
      gesamtfoerderung,
      // Langfrist
      endkapital,
      eigenBeitraegeGesamt,
      zulagenGesamt,
      zinsGesamt,
      ansparphase,
    };
  }, [bruttojahresgehalt, familienstand, partnerEigenerVertrag, kinderVor2008, kinderAb2008, istBerufseinsteiger, eigeneBeitraege, steuersatz, ansparphase]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  
  const formatEuroExact = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  
  const formatProzent = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Bruttojahresgehalt */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Bruttojahresgehalt (Vorjahr)</span>
            <span className="text-xs text-gray-500 block mt-1">Rentenversicherungspflichtiges Einkommen</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={bruttojahresgehalt}
              onChange={(e) => setBruttojahresgehalt(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none"
              min="0"
              max="200000"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={bruttojahresgehalt}
            onChange={(e) => setBruttojahresgehalt(Number(e.target.value))}
            className="w-full mt-3 accent-indigo-500"
            min="12000"
            max="100000"
            step="1000"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>12.000 €</span>
            <span>56.000 €</span>
            <span>100.000 €</span>
          </div>
        </div>

        {/* Familienstand */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Familienstand</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFamilienstand('ledig')}
              className={`py-4 px-4 rounded-xl transition-all ${
                familienstand === 'ledig'
                  ? 'bg-indigo-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="font-bold block">👤 Ledig</span>
            </button>
            <button
              onClick={() => setFamilienstand('verheiratet')}
              className={`py-4 px-4 rounded-xl transition-all ${
                familienstand === 'verheiratet'
                  ? 'bg-indigo-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="font-bold block">👫 Verheiratet</span>
            </button>
          </div>
        </div>

        {/* Partner eigener Vertrag */}
        {familienstand === 'verheiratet' && (
          <div className="mb-6 bg-indigo-50 rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={partnerEigenerVertrag}
                onChange={(e) => setPartnerEigenerVertrag(e.target.checked)}
                className="w-5 h-5 rounded text-indigo-500 focus:ring-indigo-500"
              />
              <div>
                <span className="text-gray-700 font-medium">Partner hat eigenen Riester-Vertrag</span>
                <span className="text-xs text-gray-500 block">+175 € Grundzulage für Partner</span>
              </div>
            </label>
          </div>
        )}

        {/* Kinder */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Kindergeldberechtigte Kinder</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 block mb-2">
                Geboren vor 2008 (185 €/Kind)
              </label>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setKinderVor2008(Math.max(0, kinderVor2008 - 1))}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold"
                >
                  −
                </button>
                <span className="text-2xl font-bold w-8 text-center">{kinderVor2008}</span>
                <button
                  onClick={() => setKinderVor2008(Math.min(10, kinderVor2008 + 1))}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-2">
                Geboren ab 2008 (300 €/Kind)
              </label>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setKinderAb2008(Math.max(0, kinderAb2008 - 1))}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold"
                >
                  −
                </button>
                <span className="text-2xl font-bold w-8 text-center">{kinderAb2008}</span>
                <button
                  onClick={() => setKinderAb2008(Math.min(10, kinderAb2008 + 1))}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Berufseinsteiger */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={istBerufseinsteiger}
              onChange={(e) => setIstBerufseinsteiger(e.target.checked)}
              className="w-5 h-5 rounded text-indigo-500 focus:ring-indigo-500"
            />
            <div>
              <span className="text-gray-700 font-medium">Berufseinsteiger (unter 25 Jahre)</span>
              <span className="text-xs text-gray-500 block">Einmaliger Bonus: +200 €</span>
            </div>
          </label>
        </div>

        {/* Grenzsteuersatz */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Persönlicher Grenzsteuersatz</span>
            <span className="text-xs text-gray-500 block mt-1">Für Günstigerprüfung Sonderausgaben</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={steuersatz}
              onChange={(e) => setSteuersatz(Math.max(0, Math.min(45, Number(e.target.value))))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none"
              min="0"
              max="45"
              step="1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">%</span>
          </div>
          <input
            type="range"
            value={steuersatz}
            onChange={(e) => setSteuersatz(Number(e.target.value))}
            className="w-full mt-3 accent-indigo-500"
            min="0"
            max="45"
            step="1"
          />
          <p className="text-sm text-gray-500 mt-2">
            💡 Typisch: 25-35% bei mittlerem Einkommen, 42% bei hohem
          </p>
        </div>

        {/* Ansparphase */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Ansparphase (Jahre bis Rente)</span>
          </label>
          <div className="flex items-center justify-center gap-4 mb-3">
            <button
              onClick={() => setAnsparphase(Math.max(5, ansparphase - 5))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold"
            >
              −
            </button>
            <div className="text-center px-4">
              <div className="text-4xl font-bold text-gray-800">{ansparphase}</div>
              <div className="text-sm text-gray-500">Jahre</div>
            </div>
            <button
              onClick={() => setAnsparphase(Math.min(45, ansparphase + 5))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold"
            >
              +
            </button>
          </div>
          <input
            type="range"
            value={ansparphase}
            onChange={(e) => setAnsparphase(Number(e.target.value))}
            className="w-full accent-indigo-500"
            min="5"
            max="45"
            step="1"
          />
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🏛️ Ihre Riester-Förderung (pro Jahr)</h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.gesamtfoerderung)}</span>
            <span className="text-xl opacity-80">/ Jahr</span>
          </div>
          <p className="text-indigo-100 mt-1 text-sm">
            Zulagen + Steuerersparnis
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Mindesteigenbeitrag</span>
            <div className="text-xl font-bold">{formatEuroExact(ergebnis.mindesteigenbeitrag)}</div>
            <span className="text-xs opacity-70">{formatEuroExact(ergebnis.monatlichMindesteigen)} / Monat</span>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Gesamtbeitrag</span>
            <div className="text-xl font-bold">{formatEuroExact(ergebnis.gesamtbeitragVolleFoerderung)}</div>
            <span className="text-xs opacity-70">für volle Förderung</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm mb-4">
          <div className="flex justify-between items-center mb-2">
            <span>Zulagenquote</span>
            <span className="text-xl font-bold">{formatProzent(ergebnis.zulagenquote)}</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden bg-white/20">
            <div
              className="bg-green-400 h-full transition-all duration-500"
              style={{ width: `${Math.min(ergebnis.zulagenquote, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs opacity-70 mt-1">
            {ergebnis.zulagenquote >= 30 ? '✅ Riester lohnt sich!' : 'Prüfen Sie Alternativen'}
          </p>
        </div>

        {ergebnis.guenstigerSteuer && (
          <div className="bg-green-500/30 rounded-xl p-3 text-sm">
            <span className="font-medium">💰 Günstigerprüfung:</span> Ihr Sonderausgabenabzug ist höher als die Zulagen. 
            Sie erhalten zusätzlich {formatEuro(ergebnis.zusaetzlicheErstattung)} Steuererstattung!
          </div>
        )}
      </div>

      {/* Zulagen-Aufschlüsselung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Zulagen-Aufschlüsselung</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Grundzulage</span>
            <span className="font-bold text-indigo-700">{formatEuro(ergebnis.grundzulage)}</span>
          </div>
          {familienstand === 'verheiratet' && partnerEigenerVertrag && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Grundzulage Partner</span>
              <span className="font-bold text-indigo-700">{formatEuro(ergebnis.grundzulagePartner)}</span>
            </div>
          )}
          {ergebnis.kinderzulage > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">
                Kinderzulage ({kinderVor2008 > 0 && `${kinderVor2008}×185€`}
                {kinderVor2008 > 0 && kinderAb2008 > 0 && ' + '}
                {kinderAb2008 > 0 && `${kinderAb2008}×300€`})
              </span>
              <span className="font-bold text-indigo-700">{formatEuro(ergebnis.kinderzulage)}</span>
            </div>
          )}
          {istBerufseinsteiger && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Berufseinsteigerbonus (einmalig)</span>
              <span className="font-bold text-green-600">{formatEuro(ergebnis.berufseinsteiger)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 bg-indigo-50 -mx-6 px-6">
            <span className="font-bold text-indigo-800">Staatliche Zulagen gesamt</span>
            <span className="font-bold text-2xl text-indigo-900">{formatEuro(ergebnis.gesamtZulage)}</span>
          </div>
        </div>
      </div>

      {/* Steuerliche Betrachtung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🧾 Steuerliche Betrachtung</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Sonderausgabenabzug (max. 2.100€)</span>
            <span className="text-gray-900">{formatEuro(ergebnis.sonderausgabenabzug)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Grenzsteuersatz</span>
            <span className="text-gray-900">{steuersatz} %</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Theoretische Steuerersparnis</span>
            <span className="text-gray-900">{formatEuro(ergebnis.steuerersparnis)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Staatliche Zulagen</span>
            <span className="text-gray-900">{formatEuro(ergebnis.gesamtZulage)}</span>
          </div>
          <div className="flex justify-between py-3 bg-green-50 -mx-6 px-6">
            <span className="font-bold text-green-800">
              {ergebnis.guenstigerSteuer 
                ? '✅ Günstigerprüfung: Sonderausgabenabzug besser'
                : '✅ Günstigerprüfung: Zulagen besser'}
            </span>
            <span className="font-bold text-green-900">
              {ergebnis.guenstigerSteuer 
                ? `+${formatEuro(ergebnis.zusaetzlicheErstattung)}`
                : 'Zulagen werden gewährt'}
            </span>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          ℹ️ Die Günstigerprüfung erfolgt automatisch durch das Finanzamt. Sie erhalten immer den höheren Vorteil – 
          entweder die Zulagen oder die Steuerersparnis durch Sonderausgabenabzug.
        </p>
      </div>

      {/* Langzeitprojektion */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📈 Vermögensentwicklung über {ansparphase} Jahre</h3>
        
        <div className="text-center mb-6">
          <span className="text-4xl font-bold text-indigo-600">{formatEuro(ergebnis.endkapital)}</span>
          <p className="text-gray-500 text-sm mt-1">Geschätztes Riester-Guthaben bei Rentenbeginn</p>
          <p className="text-xs text-gray-400">(Annahme: 4% durchschnittliche Rendite p.a.)</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <span className="text-xs text-gray-500 block">Eigenbeiträge</span>
            <span className="font-bold text-gray-800">{formatEuro(ergebnis.eigenBeitraegeGesamt)}</span>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <span className="text-xs text-gray-500 block">Zulagen</span>
            <span className="font-bold text-green-700">{formatEuro(ergebnis.zulagenGesamt)}</span>
          </div>
          <div className="bg-indigo-50 rounded-xl p-3 text-center">
            <span className="text-xs text-gray-500 block">Zinsen</span>
            <span className="font-bold text-indigo-700">{formatEuro(ergebnis.zinsGesamt)}</span>
          </div>
        </div>

        {/* Visualisierung */}
        <div className="h-8 rounded-full overflow-hidden flex">
          <div 
            className="bg-gray-400 h-full"
            style={{ width: `${(ergebnis.eigenBeitraegeGesamt / ergebnis.endkapital) * 100}%` }}
          ></div>
          <div 
            className="bg-green-500 h-full"
            style={{ width: `${(ergebnis.zulagenGesamt / ergebnis.endkapital) * 100}%` }}
          ></div>
          <div 
            className="bg-indigo-500 h-full"
            style={{ width: `${(ergebnis.zinsGesamt / ergebnis.endkapital) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Eigenbeiträge</span>
          <span>Zulagen</span>
          <span>Zinsen</span>
        </div>
      </div>

      {/* Fördervoraussetzungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">✅ Fördervoraussetzungen</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>👤</span>
            <span>
              <strong>Unmittelbar förderberechtigt:</strong> Pflichtversicherte in der gesetzlichen 
              Rentenversicherung, Beamte, Richter, Soldaten, Bezieher von Arbeitslosengeld
            </span>
          </li>
          <li className="flex gap-2">
            <span>👫</span>
            <span>
              <strong>Mittelbar förderberechtigt:</strong> Ehepartner von unmittelbar Förderberechtigten 
              (auch ohne eigenes Einkommen)
            </span>
          </li>
          <li className="flex gap-2">
            <span>📄</span>
            <span>
              <strong>Vertrag:</strong> Zertifizierter Riester-Vertrag (Bank, Versicherung, Fondsgesellschaft)
            </span>
          </li>
          <li className="flex gap-2">
            <span>💰</span>
            <span>
              <strong>Mindesteigenbeitrag:</strong> 4% des Vorjahres-Brutto minus Zulagen, mind. 60€/Jahr
            </span>
          </li>
          <li className="flex gap-2">
            <span>📝</span>
            <span>
              <strong>Dauerzulagenantrag:</strong> Einmal stellen, gilt dauerhaft
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
              <strong>Nachgelagerte Besteuerung:</strong> Die Riester-Rente wird in der Auszahlungsphase 
              voll versteuert. Im Alter ist Ihr Steuersatz aber meist niedriger.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Lebenslange Rente:</strong> Riester-Vermögen wird in eine lebenslange Rente umgewandelt. 
              Maximal 30% als Einmalzahlung möglich.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Beitragsgarantie:</strong> Der Anbieter muss mindestens die eingezahlten Beiträge 
              und Zulagen garantieren.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Kosten beachten:</strong> Riester-Verträge haben oft hohe Kosten (Abschluss, Verwaltung). 
              Vergleichen Sie vor Abschluss!
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Schädliche Verwendung:</strong> Bei vorzeitiger Kündigung müssen Zulagen und 
              Steuervorteile zurückgezahlt werden.
            </span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Stellen & Beratung</h3>
        <div className="space-y-4">
          <div className="bg-indigo-50 rounded-xl p-4">
            <p className="font-semibold text-indigo-900">Zentrale Zulagenstelle für Altersvermögen (ZfA)</p>
            <p className="text-sm text-indigo-700 mt-1">
              Prüft Förderberechtigung, zahlt Zulagen aus
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">ZfA Service-Telefon</p>
                <p className="text-gray-600">0800 100 0880 (kostenfrei)</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Online-Rechner ZfA</p>
                <a
                  href="https://riester.deutsche-rentenversicherung.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Offizieller Riester-Rechner →
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">📧</span>
            <div>
              <p className="font-medium text-gray-800">Zulagen beantragen</p>
              <p className="text-gray-600">
                Stellen Sie einen <strong>Dauerzulagenantrag</strong> bei Ihrem Riester-Anbieter. 
                Die Zulagen werden dann automatisch jährlich beantragt und Ihrem Vertrag gutgeschrieben.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://riester.deutsche-rentenversicherung.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsche Rentenversicherung – Riester-Rechner
          </a>
          <a
            href="https://www.gesetze-im-internet.de/estg/__10a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            §10a EStG – Zusätzliche Altersvorsorge
          </a>
          <a
            href="https://www.gesetze-im-internet.de/estg/__79.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            §79 EStG – Altersvorsorgezulage
          </a>
          <a
            href="https://www.bmas.de/DE/Soziales/Rente-und-Altersvorsorge/Riester-Rente/riester-rente.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMAS – Riester-Rente Informationen
          </a>
          <a
            href="https://www.verbraucherzentrale.de/wissen/geld-versicherungen/altersvorsorge/riesterrente"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Verbraucherzentrale – Riester-Rente Ratgeber
          </a>
        </div>
      </div>
    </div>
  );
}
