import { useState, useMemo } from 'react';

// Offizielle Mindestlohn-Daten (Quelle: Mindestlohnkommission)
const MINDESTLOHN = {
  2024: 12.41,
  2025: 12.82,
  2026: 13.90,
  2027: 14.60, // Ab 01.01.2027
};

// Minijob-Grenzen entsprechend dem Mindestlohn (45 Stunden × Mindestlohn)
const MINIJOB_GRENZEN = {
  2025: 556,
  2026: 603,
  2027: 657,
};

// Ausnahmen vom Mindestlohn (§ 22 MiLoG)
const AUSNAHMEN = [
  {
    id: 'jugendliche',
    name: 'Jugendliche unter 18 ohne Berufsausbildung',
    beschreibung: 'Personen unter 18 Jahren ohne abgeschlossene Berufsausbildung',
    keinMindestlohn: true,
  },
  {
    id: 'azubi',
    name: 'Auszubildende',
    beschreibung: 'Personen während ihrer Berufsausbildung (eigene Mindestausbildungsvergütung)',
    keinMindestlohn: true,
  },
  {
    id: 'pflichtpraktikum',
    name: 'Pflichtpraktikum',
    beschreibung: 'Praktikum aufgrund schulrechtlicher, hochschulrechtlicher Bestimmungen oder Ausbildungsordnung',
    keinMindestlohn: true,
  },
  {
    id: 'orientierung',
    name: 'Orientierungspraktikum (max. 3 Monate)',
    beschreibung: 'Praktikum bis zu 3 Monaten zur Orientierung für Berufsausbildung oder Studium',
    keinMindestlohn: true,
  },
  {
    id: 'begleitpraktikum',
    name: 'Begleitendes Praktikum (max. 3 Monate)',
    beschreibung: 'Praktikum bis zu 3 Monaten begleitend zu Berufs- oder Hochschulausbildung (einmalig)',
    keinMindestlohn: true,
  },
  {
    id: 'einstieg',
    name: 'Einstiegsqualifizierung / Berufsvorbereitung',
    beschreibung: 'Teilnahme an Einstiegsqualifizierung nach § 54a SGB III oder Berufsvorbereitung nach BBiG',
    keinMindestlohn: true,
  },
  {
    id: 'langzeitarbeitslos',
    name: 'Langzeitarbeitslose (erste 6 Monate)',
    beschreibung: 'Personen, die unmittelbar vor Beschäftigung mindestens 1 Jahr arbeitslos waren',
    keinMindestlohn: true,
    sonderfall: 'Nur die ersten 6 Monate der Beschäftigung',
  },
  {
    id: 'ehrenamt',
    name: 'Ehrenamtlich Tätige',
    beschreibung: 'Ehrenamtliche Arbeit ohne Arbeitnehmerstatus',
    keinMindestlohn: true,
  },
];

// Aktuelle Mindestausbildungsvergütung (§ 17 BBiG)
const MINDESTAUSBILDUNGSVERGUETUNG_2026 = {
  1: 682,  // 1. Ausbildungsjahr
  2: 805,  // 2. Ausbildungsjahr  
  3: 921,  // 3. Ausbildungsjahr
  4: 955,  // 4. Ausbildungsjahr
};

export default function MindestlohnRechner() {
  const currentYear = new Date().getFullYear();
  const [stundenlohn, setStundenlohn] = useState<string>('');
  const [wochenstunden, setWochenstunden] = useState<number>(40);
  const [ausnahmeId, setAusnahmeId] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  const mindestlohn = MINDESTLOHN[selectedYear as keyof typeof MINDESTLOHN] || MINDESTLOHN[2026];
  const minijobGrenze = MINIJOB_GRENZEN[selectedYear as keyof typeof MINIJOB_GRENZEN] || MINIJOB_GRENZEN[2026];

  const ergebnis = useMemo(() => {
    const lohn = parseFloat(stundenlohn.replace(',', '.')) || 0;
    const hatAusnahme = ausnahmeId !== null;
    
    // Monatliche Arbeitsstunden (Durchschnitt: 52 Wochen / 12 Monate = 4,33)
    const faktor = 52 / 12;
    const monatsStunden = wochenstunden * faktor;
    
    // Brutto-Monatsgehalt
    const bruttoMonat = lohn * monatsStunden;
    const bruttoJahr = bruttoMonat * 12;
    
    // Mindestlohn-Berechnung
    const mindestBruttoMonat = mindestlohn * monatsStunden;
    const mindestBruttoJahr = mindestBruttoMonat * 12;
    
    // Differenz
    const differenzProStunde = lohn - mindestlohn;
    const differenzProMonat = bruttoMonat - mindestBruttoMonat;
    const differenzProJahr = bruttoJahr - mindestBruttoJahr;
    
    // Status
    const istUnterMindestlohn = lohn > 0 && lohn < mindestlohn && !hatAusnahme;
    const istGenauMindestlohn = lohn > 0 && Math.abs(lohn - mindestlohn) < 0.01;
    const istUeberMindestlohn = lohn > mindestlohn;
    
    // Minijob-Check
    const istMinijob = bruttoMonat > 0 && bruttoMonat <= minijobGrenze;
    const maxMinijobStunden = minijobGrenze / mindestlohn;
    
    // Prozent über/unter Mindestlohn
    const prozentDifferenz = lohn > 0 ? ((lohn / mindestlohn) - 1) * 100 : 0;
    
    return {
      lohn,
      hatAusnahme,
      monatsStunden,
      bruttoMonat,
      bruttoJahr,
      mindestBruttoMonat,
      mindestBruttoJahr,
      differenzProStunde,
      differenzProMonat,
      differenzProJahr,
      istUnterMindestlohn,
      istGenauMindestlohn,
      istUeberMindestlohn,
      istMinijob,
      maxMinijobStunden,
      prozentDifferenz,
      wochenstunden,
    };
  }, [stundenlohn, wochenstunden, ausnahmeId, mindestlohn, minijobGrenze]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatZahl = (n: number, stellen = 2) => n.toLocaleString('de-DE', { minimumFractionDigits: stellen, maximumFractionDigits: stellen });

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Jahr auswählen */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Jahr</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[2025, 2026, 2027].map((jahr) => (
              <button
                key={jahr}
                onClick={() => setSelectedYear(jahr)}
                className={`py-3 px-4 rounded-xl text-center transition-all ${
                  selectedYear === jahr
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="font-bold">{jahr}</span>
                <span className="text-xs block">
                  {formatEuro(MINDESTLOHN[jahr as keyof typeof MINDESTLOHN])}/h
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Stundenlohn eingeben */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Ihr Brutto-Stundenlohn</span>
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={stundenlohn}
              onChange={(e) => setStundenlohn(e.target.value)}
              placeholder={`z.B. ${formatZahl(mindestlohn)}`}
              className="w-full text-3xl font-bold text-center py-4 px-6 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
              €/Stunde
            </span>
          </div>
          
          {/* Quick-Select Buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={() => setStundenlohn(String(mindestlohn))}
              className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Mindestlohn ({formatZahl(mindestlohn)} €)
            </button>
            <button
              onClick={() => setStundenlohn(String(15))}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              15,00 €
            </button>
            <button
              onClick={() => setStundenlohn(String(20))}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              20,00 €
            </button>
          </div>
        </div>

        {/* Wochenstunden */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Wochenstunden</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[10, 20, 30, 40].map((stunden) => (
              <button
                key={stunden}
                onClick={() => setWochenstunden(stunden)}
                className={`py-3 px-4 rounded-xl text-center transition-all ${
                  wochenstunden === stunden
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="font-bold">{stunden}</span>
                <span className="text-xs block">Std/Wo</span>
              </button>
            ))}
          </div>
          <input
            type="range"
            min={1}
            max={48}
            value={wochenstunden}
            onChange={(e) => setWochenstunden(Number(e.target.value))}
            className="w-full mt-3 accent-blue-500"
          />
          <p className="text-center text-sm text-gray-500 mt-1">
            {wochenstunden} Stunden/Woche = {formatZahl(ergebnis.monatsStunden, 1)} Stunden/Monat
          </p>
        </div>

        {/* Ausnahmen */}
        <div className="mb-4">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Gilt eine Ausnahme? (§ 22 MiLoG)</span>
          </label>
          <button
            onClick={() => setAusnahmeId(null)}
            className={`w-full py-3 px-4 rounded-xl text-left transition-all mb-2 ${
              ausnahmeId === null
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="font-medium">Keine Ausnahme – Mindestlohn gilt</span>
          </button>
          
          <details className="mt-2">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Ausnahmen anzeigen (klicken)
            </summary>
            <div className="space-y-2 mt-2">
              {AUSNAHMEN.map((ausnahme) => (
                <button
                  key={ausnahme.id}
                  onClick={() => setAusnahmeId(ausnahmeId === ausnahme.id ? null : ausnahme.id)}
                  className={`w-full py-3 px-4 rounded-xl text-left transition-all ${
                    ausnahmeId === ausnahme.id
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="font-medium">{ausnahme.name}</span>
                  <span className="text-sm block opacity-80">{ausnahme.beschreibung}</span>
                  {ausnahme.sonderfall && (
                    <span className="text-xs block opacity-70 mt-1">⚠️ {ausnahme.sonderfall}</span>
                  )}
                </button>
              ))}
            </div>
          </details>
        </div>
      </div>

      {/* Result Section */}
      {ergebnis.lohn > 0 && (
        <div className={`rounded-2xl shadow-lg p-6 text-white mb-6 ${
          ergebnis.hatAusnahme
            ? 'bg-gradient-to-br from-amber-500 to-orange-600'
            : ergebnis.istUnterMindestlohn
              ? 'bg-gradient-to-br from-red-500 to-red-700'
              : ergebnis.istGenauMindestlohn
                ? 'bg-gradient-to-br from-blue-500 to-blue-700'
                : 'bg-gradient-to-br from-green-500 to-emerald-600'
        }`}>
          <h3 className="text-sm font-medium opacity-80 mb-1">
            {ergebnis.hatAusnahme
              ? '⚠️ Ausnahme vom Mindestlohn'
              : ergebnis.istUnterMindestlohn
                ? '❌ Unter Mindestlohn!'
                : ergebnis.istGenauMindestlohn
                  ? '✓ Genau Mindestlohn'
                  : '✅ Über Mindestlohn'}
          </h3>
          
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{formatEuro(ergebnis.bruttoMonat)}</span>
              <span className="text-xl opacity-80">/ Monat brutto</span>
            </div>
            <p className="opacity-80 mt-2">
              {formatEuro(ergebnis.lohn)}/Stunde × {formatZahl(ergebnis.monatsStunden, 1)} Stunden
            </p>
          </div>

          {!ergebnis.hatAusnahme && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Differenz zum Mindestlohn</span>
                <div className={`text-xl font-bold ${ergebnis.differenzProStunde >= 0 ? '' : 'text-red-200'}`}>
                  {ergebnis.differenzProStunde >= 0 ? '+' : ''}{formatEuro(ergebnis.differenzProStunde)}/h
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Prozent</span>
                <div className={`text-xl font-bold ${ergebnis.prozentDifferenz >= 0 ? '' : 'text-red-200'}`}>
                  {ergebnis.prozentDifferenz >= 0 ? '+' : ''}{formatZahl(ergebnis.prozentDifferenz, 1)}%
                </div>
              </div>
            </div>
          )}

          {ergebnis.istUnterMindestlohn && !ergebnis.hatAusnahme && (
            <div className="mt-4 p-4 bg-white/20 rounded-xl">
              <h4 className="font-bold mb-2">⚠️ Achtung: Lohn unter Mindestlohn!</h4>
              <p className="text-sm">
                Ihnen steht mindestens <strong>{formatEuro(mindestlohn)}/Stunde</strong> zu.
                Das sind <strong>{formatEuro(Math.abs(ergebnis.differenzProMonat))} mehr pro Monat</strong> 
                {' '}bzw. <strong>{formatEuro(Math.abs(ergebnis.differenzProJahr))} mehr pro Jahr</strong>.
              </p>
            </div>
          )}

          {ergebnis.hatAusnahme && (
            <div className="mt-4 p-4 bg-white/20 rounded-xl">
              <h4 className="font-bold mb-2">ℹ️ Ausnahme vom Mindestlohn</h4>
              <p className="text-sm">
                Für die gewählte Personengruppe gilt der gesetzliche Mindestlohn nicht.
                Es können aber andere Mindestentgelte gelten (z.B. Mindestausbildungsvergütung für Azubis).
              </p>
            </div>
          )}
          
          {ergebnis.istMinijob && (
            <div className="mt-3 p-3 bg-white/10 rounded-xl">
              <span className="text-sm">💼 Minijob-Status:</span>
              <p className="text-sm opacity-80">
                Mit {formatEuro(ergebnis.bruttoMonat)}/Monat liegt das Gehalt unter der 
                Minijob-Grenze von {formatEuro(minijobGrenze)}.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Vergleichstabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Mindestlohn-Vergleich {selectedYear}</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-2 text-left text-gray-600">Stunden/Woche</th>
                <th className="py-2 text-right text-gray-600">Mindestlohn/Monat</th>
                <th className="py-2 text-right text-gray-600">Mindestlohn/Jahr</th>
              </tr>
            </thead>
            <tbody>
              {[10, 20, 30, 40].map((stunden) => {
                const monatsStunden = stunden * (52/12);
                const monatsLohn = mindestlohn * monatsStunden;
                const jahresLohn = monatsLohn * 12;
                const isSelected = stunden === wochenstunden;
                return (
                  <tr 
                    key={stunden} 
                    className={`border-b border-gray-100 ${isSelected ? 'bg-blue-50 font-bold' : ''}`}
                  >
                    <td className="py-3">{stunden} Std. {isSelected && '←'}</td>
                    <td className="py-3 text-right">{formatEuro(monatsLohn)}</td>
                    <td className="py-3 text-right">{formatEuro(jahresLohn)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mindestlohn-Entwicklung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📈 Mindestlohn-Entwicklung</h3>
        
        <div className="space-y-3">
          {Object.entries(MINDESTLOHN).map(([jahr, lohn]) => {
            const isCurrentYear = Number(jahr) === selectedYear;
            const isFuture = Number(jahr) > currentYear;
            return (
              <div
                key={jahr}
                className={`flex justify-between items-center p-3 rounded-xl ${
                  isCurrentYear 
                    ? 'bg-blue-100 border-2 border-blue-300' 
                    : isFuture 
                      ? 'bg-gray-50 border border-dashed border-gray-300' 
                      : 'bg-gray-100'
                }`}
              >
                <div>
                  <span className={`font-bold ${isCurrentYear ? 'text-blue-700' : 'text-gray-700'}`}>
                    {jahr}
                  </span>
                  {isFuture && <span className="ml-2 text-xs text-gray-500">(geplant)</span>}
                </div>
                <span className={`text-xl font-bold ${isCurrentYear ? 'text-blue-700' : 'text-gray-800'}`}>
                  {formatEuro(lohn)}/h
                </span>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-600">
            <strong>Steigerung 2024–2027:</strong> +17,6% (von 12,41 € auf 14,60 €)
          </p>
        </div>
      </div>

      {/* Minijob-Grenzen */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-blue-800 mb-3">💼 Minijob-Grenze {selectedYear}</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <p>
            Die Minijob-Grenze beträgt <strong>{formatEuro(minijobGrenze)}</strong> pro Monat.
          </p>
          <p>
            Bei Mindestlohn ({formatEuro(mindestlohn)}/h) können Sie maximal{' '}
            <strong>{formatZahl(ergebnis.maxMinijobStunden, 1)} Stunden/Monat</strong> arbeiten,
            ohne die Minijob-Grenze zu überschreiten.
          </p>
          <p className="text-xs opacity-80 mt-2">
            Die Minijob-Grenze ist dynamisch an den Mindestlohn gekoppelt (45 × Mindestlohn).
          </p>
        </div>
      </div>

      {/* Ausnahmen vom Mindestlohn */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wer bekommt keinen Mindestlohn? (§ 22 MiLoG)</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          {AUSNAHMEN.map((ausnahme) => (
            <li key={ausnahme.id} className="flex gap-2">
              <span>•</span>
              <div>
                <strong>{ausnahme.name}:</strong> {ausnahme.beschreibung}
                {ausnahme.sonderfall && (
                  <span className="block text-xs opacity-80 mt-0.5">↳ {ausnahme.sonderfall}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Mindestausbildungsvergütung */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-purple-800 mb-3">🎓 Mindestausbildungsvergütung 2026 (§ 17 BBiG)</h3>
        <p className="text-sm text-purple-700 mb-3">
          Für Auszubildende gilt statt dem Mindestlohn die Mindestausbildungsvergütung:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(MINDESTAUSBILDUNGSVERGUETUNG_2026).map(([jahr, betrag]) => (
            <div key={jahr} className="bg-white/50 rounded-lg p-3 text-center">
              <span className="text-xs text-purple-600 block">{jahr}. Jahr</span>
              <span className="text-lg font-bold text-purple-800">{formatEuro(betrag)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Wichtige Informationen</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Gesetzlicher Anspruch:</strong> Jeder Arbeitnehmer hat Anspruch auf mindestens {formatEuro(mindestlohn)}/Stunde ({selectedYear})</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Keine Verrechnung:</strong> Trinkgelder, Zuschläge oder Sachleistungen dürfen nicht auf den Mindestlohn angerechnet werden</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Dokumentationspflicht:</strong> Arbeitgeber müssen Arbeitszeit dokumentieren (bei Minijobs, Branchen nach § 2a SchwarzArbG)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Nachforderung:</strong> Mindestlohn kann bis zu 3 Jahre rückwirkend eingefordert werden</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Kontrolle:</strong> Der Zoll prüft die Einhaltung des Mindestlohns (Finanzkontrolle Schwarzarbeit)</span>
          </li>
        </ul>
      </div>

      {/* Rechte bei Mindestlohnverstoß */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-red-800 mb-3">⚖️ Ihre Rechte bei Mindestlohnverstoß</h3>
        <ul className="space-y-2 text-sm text-red-700">
          <li className="flex gap-2">
            <span>1.</span>
            <span><strong>Anspruch besteht automatisch:</strong> Der Mindestlohn gilt kraft Gesetz – auch ohne Arbeitsvertrag</span>
          </li>
          <li className="flex gap-2">
            <span>2.</span>
            <span><strong>Nachzahlung fordern:</strong> Schriftlich beim Arbeitgeber die Differenz einfordern</span>
          </li>
          <li className="flex gap-2">
            <span>3.</span>
            <span><strong>Arbeitsgericht:</strong> Bei Weigerung können Sie klagen (Gewerkschaft oder Anwalt hilft)</span>
          </li>
          <li className="flex gap-2">
            <span>4.</span>
            <span><strong>Meldung beim Zoll:</strong> Verstöße können anonym gemeldet werden</span>
          </li>
        </ul>
        <div className="mt-3 p-3 bg-white/50 rounded-xl">
          <p className="text-xs text-red-600">
            <strong>Bußgeld für Arbeitgeber:</strong> Bei Mindestlohnverstößen drohen Bußgelder bis zu 500.000 €
          </p>
        </div>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörden & Hilfe</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="font-semibold text-blue-900">Mindestlohn-Hotline</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">030 60 28 00 28</p>
            <p className="text-sm text-blue-600 mt-1">
              Mo–Do: 8–20 Uhr, Fr: 8–12 Uhr (kostenlos)
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Finanzkontrolle Schwarzarbeit (Zoll)</p>
                <a 
                  href="tel:03518442222"
                  className="text-blue-600 hover:underline"
                >
                  0351 844 22 22
                </a>
                <p className="text-xs text-gray-500">(Für Meldungen von Verstößen)</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">BMAS-Informationen</p>
                <a 
                  href="https://www.bmas.de/DE/Arbeit/Arbeitsrecht/Mindestlohn/mindestlohn.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  bmas.de/mindestlohn →
                </a>
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
            href="https://www.gesetze-im-internet.de/milog/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Mindestlohngesetz (MiLoG) – Gesetze im Internet
          </a>
          <a 
            href="https://www.mindestlohn-kommission.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Mindestlohnkommission – Offizielle Beschlüsse
          </a>
          <a 
            href="https://www.zoll.de/DE/Fachthemen/Arbeit/Mindestarbeitsbedingungen/Mindestlohn-Mindestlohngesetz/mindestlohn-mindestlohngesetz_node.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Zoll – Informationen zum Mindestlohn
          </a>
          <a 
            href="https://www.bmas.de/DE/Arbeit/Arbeitsrecht/Mindestlohn/mindestlohn.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesministerium für Arbeit und Soziales – Mindestlohn
          </a>
        </div>
      </div>
    </div>
  );
}
