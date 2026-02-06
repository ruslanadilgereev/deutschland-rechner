import { useState, useMemo } from 'react';

// Naegele-Regel: ET = LMP + 280 Tage (40 Wochen)
const SCHWANGERSCHAFT_TAGE = 280;
const EMPFAENGNIS_OFFSET = 14; // Tage nach LMP bis Empfängnis

interface Meilenstein {
  woche: number;
  label: string;
  beschreibung: string;
  icon: string;
}

const MEILENSTEINE: Meilenstein[] = [
  { woche: 5, label: 'Herzschlag', beschreibung: 'Erstes Herzschlagen erkennbar', icon: '💓' },
  { woche: 12, label: 'Erstes Trimester', beschreibung: 'Ende 1. Trimester, kritische Phase vorbei', icon: '🎉' },
  { woche: 16, label: 'Geschlecht', beschreibung: 'Geschlecht oft erkennbar', icon: '🔎' },
  { woche: 20, label: 'Halbzeit', beschreibung: 'Halbzeit! Baby ca. 25cm groß', icon: '⚖️' },
  { woche: 24, label: 'Lebensfähig', beschreibung: 'Lebensfähigkeit außerhalb des Bauches', icon: '🏥' },
  { woche: 28, label: 'Drittes Trimester', beschreibung: 'Start 3. Trimester', icon: '🌟' },
  { woche: 34, label: 'Mutterschutz', beschreibung: 'Mutterschutz beginnt (6 Wochen vor ET)', icon: '🏠' },
  { woche: 37, label: 'Frühtermin', beschreibung: 'Baby gilt nicht mehr als Frühchen', icon: '✅' },
  { woche: 40, label: 'Geburtstermin', beschreibung: 'Errechneter Geburtstermin (ET)', icon: '👶' },
  { woche: 42, label: 'Übertragung', beschreibung: 'Ab hier gilt Schwangerschaft als übertragen', icon: '⏰' },
];

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function diffDays(date1: Date, date2: Date): number {
  return Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDatum(date: Date): string {
  return date.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatDatumKurz(date: Date): string {
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getSternzeichen(date: Date): { zeichen: string; name: string } {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const sternzeichen = [
    { name: 'Steinbock', zeichen: '♑', start: [1, 1], end: [1, 19] },
    { name: 'Wassermann', zeichen: '♒', start: [1, 20], end: [2, 18] },
    { name: 'Fische', zeichen: '♓', start: [2, 19], end: [3, 20] },
    { name: 'Widder', zeichen: '♈', start: [3, 21], end: [4, 19] },
    { name: 'Stier', zeichen: '♉', start: [4, 20], end: [5, 20] },
    { name: 'Zwillinge', zeichen: '♊', start: [5, 21], end: [6, 20] },
    { name: 'Krebs', zeichen: '♋', start: [6, 21], end: [7, 22] },
    { name: 'Löwe', zeichen: '♌', start: [7, 23], end: [8, 22] },
    { name: 'Jungfrau', zeichen: '♍', start: [8, 23], end: [9, 22] },
    { name: 'Waage', zeichen: '♎', start: [9, 23], end: [10, 22] },
    { name: 'Skorpion', zeichen: '♏', start: [10, 23], end: [11, 21] },
    { name: 'Schütze', zeichen: '♐', start: [11, 22], end: [12, 21] },
    { name: 'Steinbock', zeichen: '♑', start: [12, 22], end: [12, 31] },
  ];
  
  for (const sz of sternzeichen) {
    const [startMonth, startDay] = sz.start;
    const [endMonth, endDay] = sz.end;
    
    if (
      (month === startMonth && day >= startDay) ||
      (month === endMonth && day <= endDay)
    ) {
      return { zeichen: sz.zeichen, name: sz.name };
    }
  }
  
  return { zeichen: '♑', name: 'Steinbock' };
}

export default function GeburtsterminRechner() {
  const [berechnungsModus, setBerechnungsModus] = useState<'lmp' | 'empfaengnis' | 'et'>('lmp');
  const [inputDatum, setInputDatum] = useState(() => {
    // Default: vor 8 Wochen
    const d = new Date();
    d.setDate(d.getDate() - 56);
    return d.toISOString().split('T')[0];
  });
  const [zyklusLaenge, setZyklusLaenge] = useState(28);

  const ergebnis = useMemo(() => {
    const eingabe = new Date(inputDatum);
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    
    let lmp: Date;
    let empfaengnis: Date;
    let et: Date;
    
    // Zyklusanpassung: Bei Zyklen ≠ 28 Tage verschieben
    const zyklusOffset = zyklusLaenge - 28;
    
    switch (berechnungsModus) {
      case 'lmp':
        lmp = eingabe;
        empfaengnis = addDays(lmp, EMPFAENGNIS_OFFSET + zyklusOffset);
        et = addDays(lmp, SCHWANGERSCHAFT_TAGE + zyklusOffset);
        break;
      case 'empfaengnis':
        empfaengnis = eingabe;
        lmp = addDays(eingabe, -(EMPFAENGNIS_OFFSET + zyklusOffset));
        et = addDays(empfaengnis, SCHWANGERSCHAFT_TAGE - EMPFAENGNIS_OFFSET);
        break;
      case 'et':
        et = eingabe;
        lmp = addDays(et, -SCHWANGERSCHAFT_TAGE);
        empfaengnis = addDays(lmp, EMPFAENGNIS_OFFSET);
        break;
      default:
        lmp = eingabe;
        empfaengnis = addDays(lmp, EMPFAENGNIS_OFFSET);
        et = addDays(lmp, SCHWANGERSCHAFT_TAGE);
    }
    
    // Schwangerschaftstag & Woche berechnen
    const schwangerschaftstage = diffDays(lmp, heute);
    const ssw = Math.floor(schwangerschaftstage / 7);
    const tage = schwangerschaftstage % 7;
    
    // Verbleibende Tage bis ET
    const verbleibendeTage = diffDays(heute, et);
    
    // Trimester
    let trimester: 1 | 2 | 3;
    if (ssw < 13) trimester = 1;
    else if (ssw < 28) trimester = 2;
    else trimester = 3;
    
    // Geburtszeitraum (95% der Babys kommen 2 Wochen vor/nach ET)
    const fruehestens = addDays(et, -14);
    const spaetestens = addDays(et, 14);
    
    // Mutterschutz (6 Wochen vor, 8 Wochen nach ET)
    const mutterschutzStart = addDays(et, -42);
    const mutterschutzEnde = addDays(et, 56);
    
    // Sternzeichen
    const sternzeichen = getSternzeichen(et);
    
    // Fortschritt in %
    const fortschritt = Math.min(100, Math.max(0, (schwangerschaftstage / SCHWANGERSCHAFT_TAGE) * 100));
    
    // Baby-Größe & Gewicht (Schätzwerte)
    let babyGroesse = '< 1 mm';
    let babyGewicht = '< 1 g';
    let babyVergleich = 'Mohnkorn';
    
    if (ssw >= 4) { babyGroesse = '1 mm'; babyGewicht = '< 1 g'; babyVergleich = 'Mohnkorn'; }
    if (ssw >= 5) { babyGroesse = '2 mm'; babyGewicht = '< 1 g'; babyVergleich = 'Sesamkorn'; }
    if (ssw >= 6) { babyGroesse = '5 mm'; babyGewicht = '< 1 g'; babyVergleich = 'Linse'; }
    if (ssw >= 7) { babyGroesse = '1 cm'; babyGewicht = '< 1 g'; babyVergleich = 'Blaubeere'; }
    if (ssw >= 8) { babyGroesse = '1,5 cm'; babyGewicht = '1 g'; babyVergleich = 'Himbeere'; }
    if (ssw >= 9) { babyGroesse = '2,5 cm'; babyGewicht = '2 g'; babyVergleich = 'Olive'; }
    if (ssw >= 10) { babyGroesse = '3 cm'; babyGewicht = '4 g'; babyVergleich = 'Kumquat'; }
    if (ssw >= 11) { babyGroesse = '4 cm'; babyGewicht = '7 g'; babyVergleich = 'Feige'; }
    if (ssw >= 12) { babyGroesse = '5 cm'; babyGewicht = '14 g'; babyVergleich = 'Limette'; }
    if (ssw >= 13) { babyGroesse = '7 cm'; babyGewicht = '25 g'; babyVergleich = 'Pfirsich'; }
    if (ssw >= 14) { babyGroesse = '9 cm'; babyGewicht = '45 g'; babyVergleich = 'Zitrone'; }
    if (ssw >= 16) { babyGroesse = '12 cm'; babyGewicht = '100 g'; babyVergleich = 'Avocado'; }
    if (ssw >= 18) { babyGroesse = '14 cm'; babyGewicht = '190 g'; babyVergleich = 'Paprika'; }
    if (ssw >= 20) { babyGroesse = '25 cm'; babyGewicht = '300 g'; babyVergleich = 'Banane'; }
    if (ssw >= 22) { babyGroesse = '28 cm'; babyGewicht = '430 g'; babyVergleich = 'Kokosnuss'; }
    if (ssw >= 24) { babyGroesse = '30 cm'; babyGewicht = '600 g'; babyVergleich = 'Maiskolben'; }
    if (ssw >= 26) { babyGroesse = '35 cm'; babyGewicht = '900 g'; babyVergleich = 'Salat'; }
    if (ssw >= 28) { babyGroesse = '37 cm'; babyGewicht = '1100 g'; babyVergleich = 'Aubergine'; }
    if (ssw >= 30) { babyGroesse = '40 cm'; babyGewicht = '1500 g'; babyVergleich = 'Kohlkopf'; }
    if (ssw >= 32) { babyGroesse = '42 cm'; babyGewicht = '1800 g'; babyVergleich = 'Ananas'; }
    if (ssw >= 34) { babyGroesse = '45 cm'; babyGewicht = '2200 g'; babyVergleich = 'Melone'; }
    if (ssw >= 36) { babyGroesse = '47 cm'; babyGewicht = '2700 g'; babyVergleich = 'Honigmelone'; }
    if (ssw >= 38) { babyGroesse = '49 cm'; babyGewicht = '3100 g'; babyVergleich = 'Kürbis'; }
    if (ssw >= 40) { babyGroesse = '51 cm'; babyGewicht = '3400 g'; babyVergleich = 'Wassermelone'; }
    
    return {
      lmp,
      empfaengnis,
      et,
      ssw: Math.max(0, ssw),
      tage: Math.max(0, tage),
      verbleibendeTage,
      trimester,
      fruehestens,
      spaetestens,
      mutterschutzStart,
      mutterschutzEnde,
      sternzeichen,
      fortschritt,
      schwangerschaftstage,
      babyGroesse,
      babyGewicht,
      babyVergleich,
      istSchwanger: schwangerschaftstage >= 0 && schwangerschaftstage <= SCHWANGERSCHAFT_TAGE + 14,
    };
  }, [inputDatum, berechnungsModus, zyklusLaenge]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Berechnungsmodus */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Berechnung basierend auf</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setBerechnungsModus('lmp')}
              className={`p-3 rounded-xl text-center transition-all text-sm ${
                berechnungsModus === 'lmp'
                  ? 'bg-pink-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="font-bold">Letzte Periode</div>
              <div className="text-xs mt-1 opacity-80">1. Tag</div>
            </button>
            <button
              onClick={() => setBerechnungsModus('empfaengnis')}
              className={`p-3 rounded-xl text-center transition-all text-sm ${
                berechnungsModus === 'empfaengnis'
                  ? 'bg-pink-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="font-bold">Empfängnis</div>
              <div className="text-xs mt-1 opacity-80">Zeugungstag</div>
            </button>
            <button
              onClick={() => setBerechnungsModus('et')}
              className={`p-3 rounded-xl text-center transition-all text-sm ${
                berechnungsModus === 'et'
                  ? 'bg-pink-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="font-bold">Bekannter ET</div>
              <div className="text-xs mt-1 opacity-80">Vom Arzt</div>
            </button>
          </div>
        </div>

        {/* Datum */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">
              {berechnungsModus === 'lmp' && 'Erster Tag deiner letzten Periode'}
              {berechnungsModus === 'empfaengnis' && 'Tag der Empfängnis'}
              {berechnungsModus === 'et' && 'Errechneter Geburtstermin (vom Arzt)'}
            </span>
          </label>
          <input
            type="date"
            value={inputDatum}
            onChange={(e) => setInputDatum(e.target.value)}
            className="w-full text-xl font-medium py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 outline-none"
          />
        </div>

        {/* Zykluslänge (nur bei LMP) */}
        {berechnungsModus === 'lmp' && (
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Durchschnittliche Zykluslänge</span>
              <span className="text-xs text-gray-500 ml-2">(Standard: 28 Tage)</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="21"
                max="35"
                value={zyklusLaenge}
                onChange={(e) => setZyklusLaenge(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <span className="text-xl font-bold text-pink-600 w-20 text-center">
                {zyklusLaenge} Tage
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-pink-100 mb-1">
          Errechneter Geburtstermin (ET)
        </h3>
        
        <div className="mb-4">
          <div className="text-4xl font-bold mb-2">
            📅 {formatDatum(ergebnis.et)}
          </div>
          <div className="flex items-center gap-3 text-pink-100">
            <span className="text-2xl">{ergebnis.sternzeichen.zeichen}</span>
            <span>Sternzeichen: {ergebnis.sternzeichen.name}</span>
          </div>
        </div>

        {ergebnis.istSchwanger && (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-pink-100">Aktuelle SSW</span>
              <span className="text-2xl font-bold">
                {ergebnis.ssw}+{ergebnis.tage}
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="bg-white rounded-full h-3 transition-all duration-500"
                style={{ width: `${ergebnis.fortschritt}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-pink-200 mt-1">
              <span>0 Wochen</span>
              <span>{Math.round(ergebnis.fortschritt)}% geschafft</span>
              <span>40 Wochen</span>
            </div>
          </div>
        )}

        {ergebnis.verbleibendeTage > 0 && ergebnis.istSchwanger && (
          <div className="mt-4 text-center">
            <span className="text-pink-100">Noch </span>
            <span className="text-3xl font-bold">{ergebnis.verbleibendeTage}</span>
            <span className="text-pink-100"> Tage bis zum ET</span>
          </div>
        )}
      </div>

      {/* Baby Entwicklung */}
      {ergebnis.istSchwanger && ergebnis.ssw >= 4 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">
            👶 Dein Baby in SSW {ergebnis.ssw}
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-pink-50 rounded-xl p-4">
              <div className="text-3xl mb-2">📏</div>
              <div className="text-xl font-bold text-pink-600">{ergebnis.babyGroesse}</div>
              <div className="text-xs text-gray-500">Größe</div>
            </div>
            <div className="bg-pink-50 rounded-xl p-4">
              <div className="text-3xl mb-2">⚖️</div>
              <div className="text-xl font-bold text-pink-600">{ergebnis.babyGewicht}</div>
              <div className="text-xs text-gray-500">Gewicht</div>
            </div>
            <div className="bg-pink-50 rounded-xl p-4">
              <div className="text-3xl mb-2">🍎</div>
              <div className="text-xl font-bold text-pink-600">{ergebnis.babyVergleich}</div>
              <div className="text-xs text-gray-500">Vergleich</div>
            </div>
          </div>
          <p className="text-center text-gray-500 text-sm mt-3">
            {ergebnis.trimester}. Trimester
          </p>
        </div>
      )}

      {/* Wichtige Termine */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Wichtige Termine</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-xl">🩸</span>
              <span className="text-gray-700">Letzte Periode (LMP)</span>
            </div>
            <span className="font-medium">{formatDatumKurz(ergebnis.lmp)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-xl">✨</span>
              <span className="text-gray-700">Wahrsch. Empfängnis</span>
            </div>
            <span className="font-medium">{formatDatumKurz(ergebnis.empfaengnis)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-pink-50 rounded-xl border-2 border-pink-200">
            <div className="flex items-center gap-3">
              <span className="text-xl">🏠</span>
              <span className="text-pink-700 font-medium">Mutterschutz beginnt</span>
            </div>
            <span className="font-bold text-pink-700">{formatDatumKurz(ergebnis.mutterschutzStart)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl border-2 border-green-200">
            <div className="flex items-center gap-3">
              <span className="text-xl">👶</span>
              <span className="text-green-700 font-medium">Errechneter Geburtstermin</span>
            </div>
            <span className="font-bold text-green-700">{formatDatumKurz(ergebnis.et)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-xl">🏠</span>
              <span className="text-gray-700">Mutterschutz endet</span>
            </div>
            <span className="font-medium">{formatDatumKurz(ergebnis.mutterschutzEnde)}</span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-xl text-sm">
          <p className="text-blue-800">
            <strong>💡 Geburtszeitraum:</strong> 95% der Babys kommen zwischen {formatDatumKurz(ergebnis.fruehestens)} und {formatDatumKurz(ergebnis.spaetestens)} zur Welt.
          </p>
        </div>
      </div>

      {/* Meilensteine */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🎯 Meilensteine der Schwangerschaft</h3>
        <div className="space-y-2">
          {MEILENSTEINE.map((m) => {
            const meilensteinDatum = addDays(ergebnis.lmp, m.woche * 7);
            const istErreicht = ergebnis.ssw >= m.woche;
            const istAktuell = ergebnis.ssw === m.woche;
            
            return (
              <div
                key={m.woche}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  istAktuell
                    ? 'bg-pink-100 border-2 border-pink-400'
                    : istErreicht
                    ? 'bg-green-50'
                    : 'bg-gray-50'
                }`}
              >
                <span className="text-2xl">{istErreicht ? '✅' : m.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${istErreicht ? 'text-green-700' : 'text-gray-700'}`}>
                      SSW {m.woche}: {m.label}
                    </span>
                    {istAktuell && (
                      <span className="text-xs bg-pink-500 text-white px-2 py-0.5 rounded-full">
                        Jetzt
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{m.beschreibung}</p>
                </div>
                <span className="text-sm text-gray-400">{formatDatumKurz(meilensteinDatum)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Berechnung</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Naegele-Regel:</strong> ET = 1. Tag der letzten Periode + 280 Tage (40 Wochen)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>SSW-Zählung:</strong> Beginnt am 1. Tag der letzten Periode (nicht ab Empfängnis!)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Zyklusanpassung:</strong> Bei Zyklen ≠ 28 Tage wird der ET entsprechend angepasst</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Geburtszeitraum:</strong> Nur ~4% der Babys kommen am errechneten ET zur Welt</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Stellen & Vorsorge</h3>
        <div className="space-y-4">
          <div className="bg-pink-50 rounded-xl p-4">
            <p className="font-semibold text-pink-900">Gynäkologe / Hebamme</p>
            <p className="text-sm text-pink-700 mt-1">
              Regelmäßige Vorsorgeuntersuchungen alle 4 Wochen, ab SSW 32 alle 2 Wochen.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Hebammen-Suche</p>
                <a 
                  href="https://www.hebammensuche.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  hebammensuche.de →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🏥</span>
              <div>
                <p className="font-medium text-gray-800">Mutterpass</p>
                <p className="text-gray-600">Wird vom Frauenarzt bei Feststellung der Schwangerschaft ausgestellt</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Wichtige Hinweise</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium text-yellow-800">Nur ein Schätzwert!</p>
              <p className="text-yellow-700">Der errechnete Geburtstermin ist eine Schätzung. Nur ca. 4% der Babys kommen genau am ET zur Welt.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">🩺</span>
            <div>
              <p className="font-medium text-blue-800">Ultraschall ist genauer</p>
              <p className="text-blue-700">Im ersten Trimester kann der Arzt per Ultraschall einen genaueren ET berechnen (Scheitel-Steiß-Länge).</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-purple-50 rounded-xl">
            <span className="text-xl">🏠</span>
            <div>
              <p className="font-medium text-purple-800">Mutterschutz</p>
              <p className="text-purple-700">
                <strong>6 Wochen vor ET:</strong> Beschäftigungsverbot (freiwillig). 
                <strong> 8 Wochen nach Geburt:</strong> Absolutes Beschäftigungsverbot.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-medium text-green-800">Frühzeitig erledigen</p>
              <p className="text-green-700">Hebamme suchen (ab SSW 6), Geburtsvorbereitungskurs anmelden (SSW 20), Elterngeld beantragen, Klinik anmelden (SSW 30).</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.familienplanung.de/schwangerschaft/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BZgA Familienplanung – Schwangerschaft
          </a>
          <a 
            href="https://www.frauenaerzte-im-netz.de/schwangerschaft-geburt/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Frauenärzte im Netz – Schwangerschaft & Geburt
          </a>
          <a 
            href="https://www.bmfsfj.de/bmfsfj/themen/familie/familienleistungen/mutterschutz"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMFSFJ – Mutterschutz
          </a>
        </div>
      </div>
    </div>
  );
}
