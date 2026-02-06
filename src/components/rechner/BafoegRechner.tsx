import { useState, useMemo } from 'react';

// BAföG Bedarfssätze 2024/2025 (letzte Erhöhung WS 2024)
const BAFOEG_SAETZE = {
  grundbedarf: 475,                    // Grundbedarf
  wohnpauschale_eltern: 62,            // Bei Eltern wohnend
  wohnpauschale_eigene: 380,           // Eigene Wohnung
  kv_zuschlag: 122,                    // Krankenversicherung
  pv_zuschlag: 36,                     // Pflegeversicherung (wenn selbst versichert)
};

// Freibeträge 2024/2025
const FREIBETRAEGE = {
  eltern_verheiratet: 2_485,           // Netto-Freibetrag verheiratete Eltern
  eltern_alleinerziehend: 1_655,       // Netto-Freibetrag alleinerziehend
  zusatz_pro_kind: 730,                // Zusätzlich pro unterhaltsberechtigtem Kind
  eigenes_einkommen: 520,              // Minijob-Grenze (brutto)
  vermoegen_unter_30: 15_000,          // Vermögensfreibetrag < 30 Jahre
  vermoegen_ab_30: 45_000,             // Vermögensfreibetrag ≥ 30 Jahre
};

// Anrechnungssätze
const ANRECHNUNG = {
  elterneinkommen: 0.45,               // 45% vom übersteigenden Einkommen
  eigenes_einkommen: 1.0,              // 100% nach Freibetrag
  vermoegen: 1 / 12,                   // Monatliche Anrechnung
};

type Wohnsituation = 'eltern' | 'eigene';
type Ausbildungsart = 'studium' | 'schule';
type Familienstand = 'verheiratet' | 'alleinerziehend' | 'getrennt';

export default function BafoegRechner() {
  const [ausbildungsart, setAusbildungsart] = useState<Ausbildungsart>('studium');
  const [wohnsituation, setWohnsituation] = useState<Wohnsituation>('eigene');
  const [alter, setAlter] = useState(22);
  const [selbstVersichert, setSelbstVersichert] = useState(false);
  const [elternFamilienstand, setElternFamilienstand] = useState<Familienstand>('verheiratet');
  const [elternNettoeinkommen, setElternNettoeinkommen] = useState(3500);
  const [geschwisterAnzahl, setGeschwisterAnzahl] = useState(0);
  const [eigenesEinkommen, setEigenesEinkommen] = useState(0);
  const [vermoegen, setVermoegen] = useState(0);

  const ergebnis = useMemo(() => {
    // === SCHRITT 1: Bedarf berechnen ===
    let bedarf = BAFOEG_SAETZE.grundbedarf;
    
    // Wohnpauschale
    if (wohnsituation === 'eigene') {
      bedarf += BAFOEG_SAETZE.wohnpauschale_eigene;
    } else {
      bedarf += BAFOEG_SAETZE.wohnpauschale_eltern;
    }
    
    // KV/PV-Zuschlag (nur bei eigener Versicherung, meist ab 25 Jahren)
    let kvZuschlag = 0;
    let pvZuschlag = 0;
    if (selbstVersichert) {
      kvZuschlag = BAFOEG_SAETZE.kv_zuschlag;
      pvZuschlag = BAFOEG_SAETZE.pv_zuschlag;
      bedarf += kvZuschlag + pvZuschlag;
    }
    
    // === SCHRITT 2: Eltern-Freibetrag berechnen ===
    let elternFreibetrag = elternFamilienstand === 'verheiratet' 
      ? FREIBETRAEGE.eltern_verheiratet 
      : FREIBETRAEGE.eltern_alleinerziehend;
    
    // Bei getrennt lebenden Eltern: 2x alleinerziehend
    if (elternFamilienstand === 'getrennt') {
      elternFreibetrag = FREIBETRAEGE.eltern_alleinerziehend * 2;
    }
    
    // Zusatzfreibetrag für Geschwister (unterhaltsberechtigt)
    const geschwisterFreibetrag = geschwisterAnzahl * FREIBETRAEGE.zusatz_pro_kind;
    elternFreibetrag += geschwisterFreibetrag;
    
    // === SCHRITT 3: Anrechnung Elterneinkommen ===
    const uebersteigendesEinkommen = Math.max(0, elternNettoeinkommen - elternFreibetrag);
    const elternAnrechnung = Math.round(uebersteigendesEinkommen * ANRECHNUNG.elterneinkommen);
    
    // === SCHRITT 4: Anrechnung eigenes Einkommen ===
    const uebersteigendesEigenes = Math.max(0, eigenesEinkommen - FREIBETRAEGE.eigenes_einkommen);
    // Bei BAföG: Vom übersteigenden Brutto werden Sozialabgaben abgezogen (ca. 21.3%), dann voll angerechnet
    const eigenesAnrechnung = Math.round(uebersteigendesEigenes * 0.787); // Nach Sozialabgaben-Pauschale
    
    // === SCHRITT 5: Vermögensanrechnung ===
    const vermoegensFreibetrag = alter >= 30 ? FREIBETRAEGE.vermoegen_ab_30 : FREIBETRAEGE.vermoegen_unter_30;
    const uebersteigendesVermoegen = Math.max(0, vermoegen - vermoegensFreibetrag);
    const vermoegenAnrechnung = Math.round(uebersteigendesVermoegen * ANRECHNUNG.vermoegen);
    
    // === SCHRITT 6: Endberechnung ===
    const gesamtAnrechnung = elternAnrechnung + eigenesAnrechnung + vermoegenAnrechnung;
    const foerderung = Math.max(0, bedarf - gesamtAnrechnung);
    
    // Darlehensanteil (max. 10.010€ Gesamt, 50% des BAföG ist Darlehen für Studenten)
    const istVollfoerderung = foerderung >= bedarf * 0.9;
    const darlehensAnteil = ausbildungsart === 'studium' ? Math.round(foerderung * 0.5) : 0;
    const zuschussAnteil = foerderung - darlehensAnteil;
    
    return {
      bedarf,
      grundbedarf: BAFOEG_SAETZE.grundbedarf,
      wohnpauschale: wohnsituation === 'eigene' ? BAFOEG_SAETZE.wohnpauschale_eigene : BAFOEG_SAETZE.wohnpauschale_eltern,
      kvZuschlag,
      pvZuschlag,
      elternFreibetrag,
      geschwisterFreibetrag,
      elternAnrechnung,
      eigenesAnrechnung,
      vermoegenAnrechnung,
      vermoegensFreibetrag,
      gesamtAnrechnung,
      foerderung,
      darlehensAnteil,
      zuschussAnteil,
      istVollfoerderung,
      hatAnspruch: foerderung > 0,
      hoechstsatz: bedarf,
    };
  }, [ausbildungsart, wohnsituation, alter, selbstVersichert, elternFamilienstand, elternNettoeinkommen, geschwisterAnzahl, eigenesEinkommen, vermoegen]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Ausbildungsart */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Ausbildungsart</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setAusbildungsart('studium')}
              className={`p-4 rounded-xl text-center transition-all ${
                ausbildungsart === 'studium'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl">🎓</span>
              <div className="font-bold mt-1">Studium</div>
              <div className="text-xs mt-1 opacity-80">Hochschule / Uni</div>
            </button>
            <button
              onClick={() => setAusbildungsart('schule')}
              className={`p-4 rounded-xl text-center transition-all ${
                ausbildungsart === 'schule'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl">📚</span>
              <div className="font-bold mt-1">Schüler-BAföG</div>
              <div className="text-xs mt-1 opacity-80">Fachschule etc.</div>
            </button>
          </div>
        </div>

        {/* Wohnsituation */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Wohnsituation</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setWohnsituation('eltern')}
              className={`p-4 rounded-xl text-center transition-all ${
                wohnsituation === 'eltern'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl">🏠</span>
              <div className="font-bold mt-1">Bei Eltern</div>
              <div className="text-xs mt-1 opacity-80">+{formatEuro(BAFOEG_SAETZE.wohnpauschale_eltern)}</div>
            </button>
            <button
              onClick={() => setWohnsituation('eigene')}
              className={`p-4 rounded-xl text-center transition-all ${
                wohnsituation === 'eigene'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl">🏢</span>
              <div className="font-bold mt-1">Eigene Wohnung</div>
              <div className="text-xs mt-1 opacity-80">+{formatEuro(BAFOEG_SAETZE.wohnpauschale_eigene)}</div>
            </button>
          </div>
        </div>

        {/* Alter & Versicherung */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Dein Alter</span>
            </label>
            <input
              type="number"
              value={alter}
              onChange={(e) => setAlter(Math.max(16, Math.min(45, Number(e.target.value))))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              min="16"
              max="45"
            />
          </div>
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Krankenversicherung</span>
            </label>
            <button
              onClick={() => setSelbstVersichert(!selbstVersichert)}
              className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                selbstVersichert
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {selbstVersichert ? '✓ Selbst versichert' : 'Familienversichert'}
            </button>
          </div>
        </div>

        {/* Familiensituation Eltern */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Familiensituation deiner Eltern</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setElternFamilienstand('verheiratet')}
              className={`p-3 rounded-xl text-center transition-all text-sm ${
                elternFamilienstand === 'verheiratet'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="text-lg">💑</div>
              <div className="font-medium">Verheiratet</div>
            </button>
            <button
              onClick={() => setElternFamilienstand('alleinerziehend')}
              className={`p-3 rounded-xl text-center transition-all text-sm ${
                elternFamilienstand === 'alleinerziehend'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="text-lg">👤</div>
              <div className="font-medium">Alleinerziehend</div>
            </button>
            <button
              onClick={() => setElternFamilienstand('getrennt')}
              className={`p-3 rounded-xl text-center transition-all text-sm ${
                elternFamilienstand === 'getrennt'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="text-lg">👥</div>
              <div className="font-medium">Getrennt</div>
            </button>
          </div>
        </div>

        {/* Eltern-Nettoeinkommen */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Nettoeinkommen der Eltern</span>
            <span className="text-xs text-gray-500 ml-2">(monatlich, gesamt)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={elternNettoeinkommen}
              onChange={(e) => setElternNettoeinkommen(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              min="0"
              step="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Freibetrag: {formatEuro(ergebnis.elternFreibetrag)}
          </p>
        </div>

        {/* Geschwister */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Unterhaltsberechtigte Geschwister</span>
            <span className="text-xs text-gray-500 ml-2">(in Ausbildung, kein eigenes Einkommen)</span>
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setGeschwisterAnzahl(Math.max(0, geschwisterAnzahl - 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold"
            >
              −
            </button>
            <span className="text-3xl font-bold text-gray-800 w-12 text-center">{geschwisterAnzahl}</span>
            <button
              onClick={() => setGeschwisterAnzahl(Math.min(6, geschwisterAnzahl + 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold"
            >
              +
            </button>
            {geschwisterAnzahl > 0 && (
              <span className="text-sm text-green-600">+{formatEuro(ergebnis.geschwisterFreibetrag)} Freibetrag</span>
            )}
          </div>
        </div>

        {/* Eigenes Einkommen */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Dein monatliches Einkommen</span>
            <span className="text-xs text-gray-500 ml-2">(Nebenjob brutto)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={eigenesEinkommen}
              onChange={(e) => setEigenesEinkommen(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              min="0"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Freibetrag: {formatEuro(FREIBETRAEGE.eigenes_einkommen)} (Minijob-Grenze)
          </p>
        </div>

        {/* Vermögen */}
        <div>
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Dein Vermögen</span>
            <span className="text-xs text-gray-500 ml-2">(Sparbuch, Aktien, etc.)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={vermoegen}
              onChange={(e) => setVermoegen(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              min="0"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Freibetrag: {formatEuro(ergebnis.vermoegensFreibetrag)} (unter/ab 30 Jahre)
          </p>
        </div>
      </div>

      {/* Result Section */}
      <div className={`rounded-2xl shadow-lg p-6 text-white mb-6 ${
        ergebnis.hatAnspruch 
          ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
          : 'bg-gradient-to-br from-gray-500 to-gray-600'
      }`}>
        <h3 className="text-sm font-medium opacity-80 mb-1">
          {ergebnis.hatAnspruch ? 'Dein BAföG-Anspruch' : 'Vermutlich kein Anspruch'}
        </h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.foerderung)}</span>
            <span className="text-xl opacity-80">/ Monat</span>
          </div>
          {ergebnis.hatAnspruch && ergebnis.istVollfoerderung && (
            <span className="inline-block mt-2 bg-white/20 px-2 py-1 rounded text-sm">
              ✨ Höchstsatz erreicht!
            </span>
          )}
        </div>

        {ergebnis.hatAnspruch && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">Pro Semester</span>
              <div className="text-xl font-bold">{formatEuro(ergebnis.foerderung * 6)}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">Pro Jahr</span>
              <div className="text-xl font-bold">{formatEuro(ergebnis.foerderung * 12)}</div>
            </div>
          </div>
        )}

        {ergebnis.hatAnspruch && ausbildungsart === 'studium' && (
          <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="opacity-80">💸 Zuschuss (geschenkt)</span>
              <div className="text-lg font-bold">{formatEuro(ergebnis.zuschussAnteil)}</div>
            </div>
            <div>
              <span className="opacity-80">🔄 Darlehen (zinsfrei)</span>
              <div className="text-lg font-bold">{formatEuro(ergebnis.darlehensAnteil)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Aufschlüsselung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnung im Detail</h3>
        
        <div className="space-y-3 text-sm">
          {/* Bedarf */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-2">Dein Bedarf</div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Grundbedarf</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.grundbedarf)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">+ Wohnpauschale ({wohnsituation === 'eigene' ? 'eigene Wohnung' : 'bei Eltern'})</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.wohnpauschale)}</span>
          </div>
          {selbstVersichert && (
            <>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">+ KV-Zuschlag</span>
                <span className="font-bold text-gray-900">{formatEuro(ergebnis.kvZuschlag)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">+ PV-Zuschlag</span>
                <span className="font-bold text-gray-900">{formatEuro(ergebnis.pvZuschlag)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between py-2 border-b border-gray-200 bg-blue-50 -mx-6 px-6">
            <span className="font-medium text-blue-700">= Dein Bedarf (Höchstsatz)</span>
            <span className="font-bold text-blue-900">{formatEuro(ergebnis.bedarf)}</span>
          </div>
          
          {/* Anrechnungen */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">Anrechnungen</div>
          {elternNettoeinkommen > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
              <span>Elterneinkommen ({formatEuro(elternNettoeinkommen)} − {formatEuro(ergebnis.elternFreibetrag)} × 45%)</span>
              <span>− {formatEuro(ergebnis.elternAnrechnung)}</span>
            </div>
          )}
          {eigenesEinkommen > FREIBETRAEGE.eigenes_einkommen && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
              <span>Eigenes Einkommen</span>
              <span>− {formatEuro(ergebnis.eigenesAnrechnung)}</span>
            </div>
          )}
          {vermoegen > ergebnis.vermoegensFreibetrag && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
              <span>Vermögen (monatlich)</span>
              <span>− {formatEuro(ergebnis.vermoegenAnrechnung)}</span>
            </div>
          )}
          
          <div className={`flex justify-between py-3 -mx-6 px-6 rounded-b-2xl ${
            ergebnis.hatAnspruch ? 'bg-blue-50' : 'bg-gray-100'
          }`}>
            <span className="font-bold text-gray-800">BAföG-Anspruch</span>
            <span className={`font-bold text-xl ${ergebnis.hatAnspruch ? 'text-blue-600' : 'text-gray-600'}`}>
              {formatEuro(ergebnis.foerderung)}
            </span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert BAföG</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>50% Zuschuss</strong> (geschenkt) + 50% zinsfreies Darlehen</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Max. 10.010 € Rückzahlung</strong> – egal wie viel du bekommst</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>520 € Nebenjob</strong> anrechnungsfrei (Minijob-Grenze)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Vermögensfreibetrag:</strong> 15.000 € (unter 30) / 45.000 € (ab 30)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Schüler-BAföG:</strong> Komplett geschenkt (kein Darlehen)</span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>Dies ist eine <strong>Schätzung</strong>. Die tatsächliche Berechnung erfolgt durch das BAföG-Amt.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Das <strong>Brutto-Einkommen der Eltern</strong> wird vom Amt in Netto umgerechnet (komplexe Formel).</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Elternunabhängiges BAföG möglich bei: 5 Jahre Erwerbstätigkeit, Ausbildung + 3 Jahre Job, oder ab 30 Jahren.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Antrag stellen!</strong> BAföG wird nicht rückwirkend gezahlt – erst ab Antragsmonat.</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="font-semibold text-blue-900">Studierendenwerk / BAföG-Amt</p>
            <p className="text-sm text-blue-700 mt-1">Zuständig ist das BAföG-Amt am Standort deiner Hochschule.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Online beantragen</p>
                <a 
                  href="https://www.bafoeg-digital.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  bafoeg-digital.de →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">BAföG-Hotline</p>
                <a href="tel:08002236341" className="text-blue-600 hover:underline font-mono">0800 223 63 41</a>
                <p className="text-xs text-gray-500">Kostenfrei</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-medium text-gray-800">Benötigte Unterlagen</p>
              <p className="text-gray-600">Einkommensnachweise der Eltern, Immatrikulationsbescheinigung, Mietvertrag, Kontoauszüge</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.bafög.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Offizielles BAföG-Portal des BMBF
          </a>
          <a 
            href="https://www.studentenwerke.de/de/bafoeg"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsches Studierendenwerk – BAföG
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/baf_g/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BAföG-Gesetz (Bundesausbildungsförderungsgesetz)
          </a>
        </div>
      </div>
    </div>
  );
}
