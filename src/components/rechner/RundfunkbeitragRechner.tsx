import { useState, useMemo } from 'react';

// Rundfunkbeitrag-Daten 2024/2025/2026
const BEITRAG = {
  standard: 18.36,           // € pro Monat (seit 2024)
  ermaessigt: 6.12,          // € pro Monat für Ermäßigungsberechtigte
  quartal: 55.08,            // € pro Quartal (3 × 18,36€)
  quartalErmaessigt: 18.36,  // € pro Quartal ermäßigt
  jahr: 220.32,              // € pro Jahr
  jahrErmaessigt: 73.44,     // € pro Jahr ermäßigt
};

// Befreiungsgründe nach § 4 RBStV
const BEFREIUNGSGRUENDE = [
  {
    id: 'buergergeld',
    name: 'Bürgergeld / Arbeitslosengeld II',
    beschreibung: 'Empfänger von Bürgergeld (früher Hartz IV) oder Sozialgeld',
    vollBefreiung: true,
  },
  {
    id: 'grundsicherung',
    name: 'Grundsicherung im Alter / bei Erwerbsminderung',
    beschreibung: 'Nach SGB XII (Sozialhilfe)',
    vollBefreiung: true,
  },
  {
    id: 'bafoeg',
    name: 'BAföG / Berufsausbildungsbeihilfe',
    beschreibung: 'Studierende mit BAföG oder Azubis mit BAB',
    vollBefreiung: true,
  },
  {
    id: 'asylbewerber',
    name: 'Asylbewerberleistungen',
    beschreibung: 'Leistungen nach dem Asylbewerberleistungsgesetz',
    vollBefreiung: true,
  },
  {
    id: 'hilfe_pflege',
    name: 'Hilfe zur Pflege / Blindenhilfe',
    beschreibung: 'Nach SGB XII oder Landesblindengeld',
    vollBefreiung: true,
  },
  {
    id: 'taubblind',
    name: 'Taubblinde Menschen',
    beschreibung: 'Merkzeichen TBl im Schwerbehindertenausweis',
    vollBefreiung: true,
  },
  {
    id: 'pflegeheim',
    name: 'Vollstationäre Pflege',
    beschreibung: 'Personen in Pflegeheimen, die Hilfe zur Pflege erhalten',
    vollBefreiung: true,
  },
  {
    id: 'sonderfuersorge',
    name: 'Sonderfürsorgeberechtigte',
    beschreibung: 'Nach § 27e BVG (Kriegsopferfürsorge)',
    vollBefreiung: true,
  },
];

// Ermäßigungsgründe nach § 4 Abs. 2 RBStV
const ERMAESSIGUNGSGRUENDE = [
  {
    id: 'rf_merkzeichen',
    name: 'RF-Merkzeichen (Schwerbehindertenausweis)',
    beschreibung: 'Blinde, wesentlich Sehbehinderte, Gehörlose, Schwerbehinderte mit GdB 80+ und Merkzeichen "RF"',
    ermaessigung: 6.12,
  },
];

export default function RundfunkbeitragRechner() {
  const [anzahlMonate, setAnzahlMonate] = useState(12);
  const [selectedBefreiung, setSelectedBefreiung] = useState<string | null>(null);
  const [hatErmaessigung, setHatErmaessigung] = useState(false);
  const [anzahlPersonen, setAnzahlPersonen] = useState(1);
  const [istZweitwohnung, setIstZweitwohnung] = useState(false);
  const [wohnungAngemeldet, setWohnungAngemeldet] = useState(true);

  const ergebnis = useMemo(() => {
    // Wenn befreit → 0€
    const istBefreit = selectedBefreiung !== null;
    
    // Ermäßigter Beitrag bei RF-Merkzeichen
    const beitragMonat = istBefreit ? 0 : (hatErmaessigung ? BEITRAG.ermaessigt : BEITRAG.standard);
    const beitragQuartal = beitragMonat * 3;
    const beitragJahr = beitragMonat * 12;
    
    // Gesamtkosten für gewählten Zeitraum
    const gesamtBetrag = beitragMonat * anzahlMonate;
    
    // Pro-Person-Kosten (nur zur Info)
    const proPersonMonat = beitragMonat / Math.max(1, anzahlPersonen);
    const proPersonJahr = beitragJahr / Math.max(1, anzahlPersonen);
    
    // Ersparnis bei Befreiung/Ermäßigung
    const normalerBeitrag = BEITRAG.standard * anzahlMonate;
    const ersparnis = normalerBeitrag - gesamtBetrag;
    
    // Zweitwohnung: Befreiung möglich wenn Hauptwohnung angemeldet
    const zweitwohnungBefreit = istZweitwohnung && wohnungAngemeldet;
    
    return {
      istBefreit,
      hatErmaessigung,
      beitragMonat,
      beitragQuartal,
      beitragJahr,
      gesamtBetrag,
      proPersonMonat,
      proPersonJahr,
      ersparnis,
      zweitwohnungBefreit,
      normalerBeitrag,
      anzahlMonate,
      anzahlPersonen,
    };
  }, [selectedBefreiung, hatErmaessigung, anzahlMonate, anzahlPersonen, istZweitwohnung, wohnungAngemeldet]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Zeitraum */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Zeitraum berechnen</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 3, 6, 12].map((monate) => (
              <button
                key={monate}
                onClick={() => setAnzahlMonate(monate)}
                className={`py-3 px-4 rounded-xl text-center transition-all ${
                  anzahlMonate === monate
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="font-bold">{monate}</span>
                <span className="text-xs block">{monate === 1 ? 'Monat' : 'Monate'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Anzahl Personen im Haushalt */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Personen im Haushalt</span>
            <span className="text-xs text-gray-500 block mt-1">
              Der Beitrag gilt pro Wohnung – nicht pro Person!
            </span>
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setAnzahlPersonen(Math.max(1, anzahlPersonen - 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
            >
              −
            </button>
            <div className="text-center px-4">
              <div className="text-4xl font-bold text-gray-800">{anzahlPersonen}</div>
              <div className="text-sm text-gray-500">
                {anzahlPersonen === 1 ? 'Person' : 'Personen'}
              </div>
            </div>
            <button
              onClick={() => setAnzahlPersonen(Math.min(10, anzahlPersonen + 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
            >
              +
            </button>
          </div>
          {anzahlPersonen > 1 && (
            <div className="mt-3 p-3 bg-green-50 rounded-xl text-center">
              <p className="text-sm text-green-700">
                <strong>Tipp:</strong> Bei {anzahlPersonen} Personen zahlt jeder nur{' '}
                <strong>{formatEuro(BEITRAG.standard / anzahlPersonen)}/Monat</strong>
              </p>
            </div>
          )}
        </div>

        {/* Zweitwohnung */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Wohnungssituation</span>
          </label>
          <button
            onClick={() => setIstZweitwohnung(!istZweitwohnung)}
            className={`w-full py-4 px-6 rounded-xl font-medium transition-all flex items-center justify-between ${
              istZweitwohnung
                ? 'bg-amber-100 text-amber-800 border-2 border-amber-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>🏠 Dies ist meine Zweitwohnung</span>
            <span className={istZweitwohnung ? '' : 'opacity-50'}>
              {istZweitwohnung ? '✓' : ''}
            </span>
          </button>
          
          {istZweitwohnung && (
            <div className="mt-3 p-4 bg-amber-50 rounded-xl">
              <p className="text-sm text-amber-700 mb-3">
                Für Zweitwohnungen kann eine Befreiung beantragt werden, wenn Sie für Ihre 
                Hauptwohnung bereits Rundfunkbeitrag zahlen.
              </p>
              <button
                onClick={() => setWohnungAngemeldet(!wohnungAngemeldet)}
                className={`w-full py-3 px-4 rounded-lg text-sm transition-all ${
                  wohnungAngemeldet
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {wohnungAngemeldet 
                  ? '✓ Hauptwohnung ist angemeldet → Befreiung möglich'
                  : 'Hauptwohnung ist nicht angemeldet'}
              </button>
            </div>
          )}
        </div>

        {/* Befreiungsgründe */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Befreiung vom Rundfunkbeitrag</span>
            <span className="text-xs text-gray-500 block mt-1">
              Wählen Sie, falls ein Befreiungsgrund vorliegt (§ 4 RBStV)
            </span>
          </label>
          
          <div className="space-y-2">
            <button
              onClick={() => setSelectedBefreiung(null)}
              className={`w-full py-3 px-4 rounded-xl text-left transition-all ${
                selectedBefreiung === null && !hatErmaessigung
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="font-medium">Kein Befreiungsgrund</span>
              <span className="text-sm block opacity-80">Voller Beitrag: {formatEuro(BEITRAG.standard)}/Monat</span>
            </button>
            
            {BEFREIUNGSGRUENDE.map((grund) => (
              <button
                key={grund.id}
                onClick={() => {
                  setSelectedBefreiung(selectedBefreiung === grund.id ? null : grund.id);
                  if (selectedBefreiung !== grund.id) setHatErmaessigung(false);
                }}
                className={`w-full py-3 px-4 rounded-xl text-left transition-all ${
                  selectedBefreiung === grund.id
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="font-medium">{grund.name}</span>
                <span className="text-sm block opacity-80">{grund.beschreibung}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Ermäßigung */}
        {selectedBefreiung === null && (
          <div className="mb-6">
            <label className="block mb-3">
              <span className="text-gray-700 font-medium">Ermäßigung (RF-Merkzeichen)</span>
            </label>
            <button
              onClick={() => setHatErmaessigung(!hatErmaessigung)}
              className={`w-full py-4 px-6 rounded-xl font-medium transition-all ${
                hatErmaessigung
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <span className="block">RF-Merkzeichen im Schwerbehindertenausweis</span>
                  <span className="text-sm opacity-80 block">
                    Für Blinde, Gehörlose, Schwerbehinderte (GdB 80+)
                  </span>
                </div>
                <div className="text-right">
                  {hatErmaessigung ? (
                    <span className="text-lg font-bold">{formatEuro(BEITRAG.ermaessigt)}/Mon.</span>
                  ) : (
                    <span className="text-sm opacity-70">→ {formatEuro(BEITRAG.ermaessigt)}/Mon.</span>
                  )}
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Result Section */}
      <div className={`rounded-2xl shadow-lg p-6 text-white mb-6 ${
        ergebnis.istBefreit || ergebnis.zweitwohnungBefreit
          ? 'bg-gradient-to-br from-green-500 to-emerald-600'
          : hatErmaessigung
            ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
            : 'bg-gradient-to-br from-blue-500 to-blue-700'
      }`}>
        <h3 className="text-sm font-medium opacity-80 mb-1">
          {ergebnis.istBefreit 
            ? '✅ Sie sind befreit!' 
            : ergebnis.zweitwohnungBefreit
              ? '✅ Zweitwohnung befreit!'
              : hatErmaessigung
                ? '💜 Ermäßigter Beitrag'
                : '📺 Ihr Rundfunkbeitrag'}
        </h3>
        
        {ergebnis.istBefreit || ergebnis.zweitwohnungBefreit ? (
          <div className="py-4">
            <div className="text-5xl font-bold mb-2">0,00 €</div>
            <p className="opacity-80">
              {ergebnis.istBefreit 
                ? `Sie sparen ${formatEuro(ergebnis.normalerBeitrag)} in ${ergebnis.anzahlMonate} Monaten!`
                : 'Für Ihre Zweitwohnung entfällt der Beitrag.'}
            </p>
            <div className="mt-4 p-3 bg-white/20 rounded-xl">
              <p className="text-sm">
                ⚠️ Die Befreiung muss beim Beitragsservice beantragt werden.
                Sie wird nicht automatisch gewährt!
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">{formatEuro(ergebnis.beitragMonat)}</span>
                <span className="text-xl opacity-80">/ Monat</span>
              </div>
              {ergebnis.anzahlMonate > 1 && (
                <p className="opacity-80 mt-2 text-sm">
                  <strong>{formatEuro(ergebnis.gesamtBetrag)}</strong> für {ergebnis.anzahlMonate} Monate
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Pro Quartal</span>
                <div className="text-xl font-bold">{formatEuro(ergebnis.beitragQuartal)}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Pro Jahr</span>
                <div className="text-xl font-bold">{formatEuro(ergebnis.beitragJahr)}</div>
              </div>
            </div>
            
            {ergebnis.anzahlPersonen > 1 && (
              <div className="mt-3 p-3 bg-white/10 rounded-xl">
                <span className="text-sm opacity-80">Pro Person (bei {ergebnis.anzahlPersonen} Personen)</span>
                <div className="text-lg font-bold">
                  {formatEuro(ergebnis.proPersonMonat)}/Monat · {formatEuro(ergebnis.proPersonJahr)}/Jahr
                </div>
              </div>
            )}
            
            {hatErmaessigung && (
              <div className="mt-3 p-3 bg-white/20 rounded-xl">
                <span className="text-sm">💰 Sie sparen durch die Ermäßigung:</span>
                <div className="text-lg font-bold">{formatEuro(ergebnis.ersparnis)} in {ergebnis.anzahlMonate} Monaten</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Zahlungsübersicht */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">💳 Zahlungsübersicht</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Monatlicher Beitrag</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.beitragMonat)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Quartalsbeitrag (3 Monate)</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.beitragQuartal)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Halbjahresbeitrag (6 Monate)</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.beitragMonat * 6)}</span>
          </div>
          <div className="flex justify-between py-2 bg-blue-50 -mx-6 px-6 rounded-b-xl">
            <span className="font-medium text-blue-700">Jahresbeitrag (12 Monate)</span>
            <span className="font-bold text-blue-900">{formatEuro(ergebnis.beitragJahr)}</span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-600">
            <strong>Zahlungsweise:</strong> Der Rundfunkbeitrag wird in der Regel quartalsweise 
            (alle 3 Monate) per Lastschrift eingezogen. Überweisung und Dauerauftrag sind ebenfalls möglich.
          </p>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert der Rundfunkbeitrag</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Pro Wohnung:</strong> Der Beitrag gilt pro Wohnung – egal wie viele Personen dort leben oder wie viele Geräte vorhanden sind</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Aktueller Beitrag:</strong> {formatEuro(BEITRAG.standard)} pro Monat ({formatEuro(BEITRAG.quartal)} pro Quartal) seit Januar 2024</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Anmeldepflicht:</strong> Jede Wohnung muss beim Beitragsservice angemeldet sein</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Automatische Erfassung:</strong> Der Beitragsservice erhält Meldedaten von den Einwohnermeldeämtern</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Zweitwohnungen:</strong> Können auf Antrag befreit werden, wenn die Hauptwohnung angemeldet ist</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Finanziert:</strong> ARD, ZDF, Deutschlandradio und Landesmedienanstalten</span>
          </li>
        </ul>
      </div>

      {/* Befreiungsgründe-Checkliste */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-green-800 mb-3">✅ Vollständige Befreiung möglich bei:</h3>
        <ul className="space-y-2 text-sm text-green-700">
          {BEFREIUNGSGRUENDE.map((grund) => (
            <li key={grund.id} className="flex gap-2">
              <span>•</span>
              <span><strong>{grund.name}:</strong> {grund.beschreibung}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 p-3 bg-white/50 rounded-xl">
          <p className="text-sm text-green-700">
            <strong>💡 Tipp:</strong> Die Befreiung gilt auch für alle Mitbewohner in der gleichen Wohnung!
          </p>
        </div>
      </div>

      {/* Ermäßigung */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-purple-800 mb-3">💜 Ermäßigung auf {formatEuro(BEITRAG.ermaessigt)}/Monat bei:</h3>
        <ul className="space-y-2 text-sm text-purple-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>RF-Merkzeichen:</strong> Blinde, wesentlich Sehbehinderte, Gehörlose</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Schwerbehinderte:</strong> GdB mindestens 80 + Merkzeichen "RF" im Ausweis</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Sehbehinderte:</strong> GdB mindestens 60 für Sehbehinderung allein</span>
          </li>
        </ul>
        <p className="mt-3 text-sm text-purple-600">
          Die Ermäßigung muss mit entsprechendem Nachweis beantragt werden.
        </p>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Anmeldepflicht:</strong> Wer eine Wohnung bezieht, muss sich innerhalb eines Monats anmelden</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Bußgeld:</strong> Bei Nicht-Anmeldung oder falschen Angaben droht ein Bußgeld bis zu 1.000 €</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Rückwirkend:</strong> Der Beitrag kann bis zu 3 Jahre rückwirkend eingefordert werden</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Säumniszuschlag:</strong> Bei Zahlungsverzug fallen 1% pro Monat an</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Vollstreckung:</strong> Offene Forderungen können zwangsvollstreckt werden (Pfändung, Gerichtsvollzieher)</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="font-semibold text-blue-900">ARD ZDF Deutschlandradio Beitragsservice</p>
            <p className="text-sm text-blue-700 mt-1">
              Freimersdorfer Weg 6<br />
              50829 Köln
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Online-Portal</p>
                <a 
                  href="https://www.rundfunkbeitrag.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  rundfunkbeitrag.de →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Service-Telefon</p>
                <p className="text-gray-600">01806 999 555 10</p>
                <p className="text-xs text-gray-500">(20 ct/Anruf aus dt. Festnetz)</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📝</span>
              <div>
                <p className="font-medium text-gray-800">Online-Formulare</p>
                <ul className="text-gray-600 mt-1 space-y-1">
                  <li>• <a href="https://www.rundfunkbeitrag.de/anmelden" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Anmelden</a></li>
                  <li>• <a href="https://www.rundfunkbeitrag.de/abmelden" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Abmelden</a></li>
                  <li>• <a href="https://www.rundfunkbeitrag.de/buergerinnen_und_buerger/formulare/befreiung_oder_ermaessigung_beantragen/index_ger.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Befreiung beantragen</a></li>
                </ul>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📋</span>
              <div>
                <p className="font-medium text-gray-800">Benötigte Unterlagen</p>
                <ul className="text-gray-600 mt-1 space-y-1">
                  <li>• Bescheid über Sozialleistung</li>
                  <li>• Schwerbehindertenausweis (RF)</li>
                  <li>• Immatrikulationsbescheinigung</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.rundfunkbeitrag.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Rundfunkbeitrag.de – Offizielles Portal des Beitragsservice
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/rbstv/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Rundfunkbeitragsstaatsvertrag (RBStV) – Gesetze im Internet
          </a>
          <a 
            href="https://www.ard.de/die-ard/der-rundfunkbeitrag-100"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            ARD – Der Rundfunkbeitrag erklärt
          </a>
          <a 
            href="https://www.verbraucherzentrale.de/wissen/geld-versicherungen/rundfunkbeitrag"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Verbraucherzentrale – Rundfunkbeitrag Ratgeber
          </a>
        </div>
      </div>
    </div>
  );
}
