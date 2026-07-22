import { useState, useMemo } from 'react';

// === VERIFIZIERTE GESETZLICHE WERTE (Erbrecht BGB, Stand 2026) ===
// Der Pflichtteil-Rechner arbeitet ausschliesslich mit gesetzlichen Bruchteilsquoten
// und dem vom Nutzer eingegebenen Nachlasswert. Es gibt keine amtlichen EUR-Betraege.

// Grundformel: Pflichtteil = die Haelfte des Wertes des gesetzlichen Erbteils.
// Quelle: § 2303 Abs. 1 Satz 2 BGB — https://www.gesetze-im-internet.de/bgb/__2303.html
const PFLICHTTEIL_FAKTOR = { n: 1, d: 2 };

// Gesetzliche Erbquote des Ehegatten neben Verwandten 1. Ordnung (Kindern): 1/4.
// Quelle: § 1931 Abs. 1 BGB — https://www.gesetze-im-internet.de/bgb/__1931.html
const EHEGATTE_NEBEN_KINDERN = { n: 1, d: 4 };

// Gesetzliche Erbquote des Ehegatten neben Verwandten 2. Ordnung / Grosseltern: 1/2.
// Quelle: § 1931 Abs. 1 BGB — https://www.gesetze-im-internet.de/bgb/__1931.html
const EHEGATTE_NEBEN_ZWEITER_ORDNUNG = { n: 1, d: 2 };

// Pauschale Erhoehung des Ehegattenerbteils um 1/4 der Erbschaft im gesetzlichen
// Gueterstand der Zugewinngemeinschaft (erbrechtliche Loesung).
// Quelle: § 1371 Abs. 1 BGB — https://www.gesetze-im-internet.de/bgb/__1371.html
const ZUGEWINN_VIERTEL = { n: 1, d: 4 };

// Abschmelzung der Schenkung fuer die Pflichtteilsergaenzung:
// im 1. Jahr vor dem Erbfall 100 %, je weiterem vollen Jahr -1/10, ab 10 Jahren 0 %.
// Quelle: § 2325 Abs. 3 Satz 1 u. 2 BGB — https://www.gesetze-im-internet.de/bgb/__2325.html
const ABSCHMELZUNG_JAHRE = 10;

// === Bruch-Hilfsfunktionen (exakte Quoten statt Rundungsfehler) ===
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
function reduce(n: number, d: number) {
  const g = gcd(n, d) || 1;
  return { n: n / g, d: d / g };
}
function mul(a: { n: number; d: number }, b: { n: number; d: number }) {
  return reduce(a.n * b.n, a.d * b.d);
}
function toDecimal(f: { n: number; d: number }) {
  return f.n / f.d;
}
function bruch(f: { n: number; d: number }) {
  return `${f.n}/${f.d}`;
}

type Gueterstand = 'zugewinn' | 'guetertrennung' | 'guetergemeinschaft';
type FuerWen = 'ehegatte' | 'kind';

export default function PflichtteilRechner() {
  // Eingabewerte
  const [gueterstand, setGueterstand] = useState<Gueterstand>('zugewinn');
  const [anzahlKinder, setAnzahlKinder] = useState(2);
  const [fuerWen, setFuerWen] = useState<FuerWen>('kind');
  const [nettonachlass, setNettonachlass] = useState(400000);

  // Optional: Schenkung (Pflichtteilsergaenzung § 2325 BGB)
  const [schenkungAktiv, setSchenkungAktiv] = useState(false);
  const [schenkungWert, setSchenkungWert] = useState(50000);
  const [schenkungJahre, setSchenkungJahre] = useState(3);
  const [schenkungAnEhegatte, setSchenkungAnEhegatte] = useState(false);

  const ergebnis = useMemo(() => {
    const hatKinder = anzahlKinder > 0;
    // Falls keine Kinder: nur der Ehegatte kann sinnvoll berechnet werden.
    const person: FuerWen = hatKinder ? fuerWen : 'ehegatte';

    // === SCHRITT 1: gesetzliche Erbquote des Ehegatten ===
    let ehegattenErbquote: { n: number; d: number };
    let quotenHerleitung = '';

    if (gueterstand === 'zugewinn') {
      if (hatKinder) {
        // 1/4 (§ 1931 Abs. 1) + 1/4 (§ 1371 Abs. 1) = 1/2
        ehegattenErbquote = reduce(
          EHEGATTE_NEBEN_KINDERN.n * ZUGEWINN_VIERTEL.d + ZUGEWINN_VIERTEL.n * EHEGATTE_NEBEN_KINDERN.d,
          EHEGATTE_NEBEN_KINDERN.d * ZUGEWINN_VIERTEL.d,
        );
        quotenHerleitung = '1/4 (§ 1931 Abs. 1) + 1/4 Zugewinnviertel (§ 1371 Abs. 1) = 1/2';
      } else {
        // neben 2. Ordnung: 1/2 (§ 1931 Abs. 1) + 1/4 (§ 1371 Abs. 1) = 3/4
        ehegattenErbquote = reduce(
          EHEGATTE_NEBEN_ZWEITER_ORDNUNG.n * ZUGEWINN_VIERTEL.d + ZUGEWINN_VIERTEL.n * EHEGATTE_NEBEN_ZWEITER_ORDNUNG.d,
          EHEGATTE_NEBEN_ZWEITER_ORDNUNG.d * ZUGEWINN_VIERTEL.d,
        );
        quotenHerleitung = '1/2 (§ 1931 Abs. 1, neben 2. Ordnung) + 1/4 Zugewinnviertel (§ 1371 Abs. 1) = 3/4';
      }
    } else if (gueterstand === 'guetertrennung') {
      if (anzahlKinder === 1) {
        // § 1931 Abs. 4: Ehegatte und Kind zu gleichen Teilen => je 1/2
        ehegattenErbquote = { n: 1, d: 2 };
        quotenHerleitung = 'Gütertrennung, 1 Kind: gleiche Teile (§ 1931 Abs. 4) => 1/2';
      } else if (anzahlKinder === 2) {
        // § 1931 Abs. 4: Ehegatte und 2 Kinder zu gleichen Teilen => je 1/3
        ehegattenErbquote = { n: 1, d: 3 };
        quotenHerleitung = 'Gütertrennung, 2 Kinder: gleiche Teile (§ 1931 Abs. 4) => 1/3';
      } else if (anzahlKinder >= 3) {
        // Bei 3+ Kindern greift § 1931 Abs. 4 nicht mehr => 1/4 nach § 1931 Abs. 1
        ehegattenErbquote = { n: 1, d: 4 };
        quotenHerleitung = 'Gütertrennung, 3+ Kinder: § 1931 Abs. 4 greift nicht => 1/4 (§ 1931 Abs. 1)';
      } else {
        // keine Kinder: neben 2. Ordnung 1/2 (§ 1931 Abs. 1), § 1371 nicht anwendbar
        ehegattenErbquote = { n: 1, d: 2 };
        quotenHerleitung = 'Gütertrennung, keine Kinder: 1/2 (§ 1931 Abs. 1, neben 2. Ordnung)';
      }
    } else {
      // Gütergemeinschaft: § 1371 nicht anwendbar
      if (hatKinder) {
        ehegattenErbquote = { n: 1, d: 4 };
        quotenHerleitung = 'Gütergemeinschaft: 1/4 (§ 1931 Abs. 1), kein Zugewinnviertel';
      } else {
        ehegattenErbquote = { n: 1, d: 2 };
        quotenHerleitung = 'Gütergemeinschaft, keine Kinder: 1/2 (§ 1931 Abs. 1, neben 2. Ordnung)';
      }
    }

    // === SCHRITT 2: gesetzliche Erbquote je Kind ===
    // Rest der Erbschaft (1 - Ehegattenquote) wird zu gleichen Teilen auf die Kinder verteilt.
    const restN = ehegattenErbquote.d - ehegattenErbquote.n;
    const restD = ehegattenErbquote.d;
    const kindErbquote = hatKinder ? reduce(restN, restD * anzahlKinder) : { n: 0, d: 1 };

    // === Gewaehlte Person: gesetzliche Erbquote ===
    const gesetzlicheErbquote = person === 'ehegatte' ? ehegattenErbquote : kindErbquote;

    // === SCHRITT 3: Pflichtteilsquote = 1/2 × gesetzlicher Erbteil (§ 2303 Abs. 1 S. 2) ===
    const pflichtteilsquote = mul(gesetzlicheErbquote, PFLICHTTEIL_FAKTOR);
    const pflichtteilEUR = toDecimal(pflichtteilsquote) * nettonachlass;

    // === SCHRITT 4: Pflichtteilsergaenzung fuer Schenkungen (§ 2325 BGB) ===
    // Abschmelzung: Anrechnungsfaktor = max(0, (10 - vollendete Jahre) / 10).
    // Sonderfall Ehegattenschenkung: Frist beginnt erst mit Aufloesung der Ehe
    // (§ 2325 Abs. 3 Satz 3) => bei Tod praktisch immer voll (100 %) anrechenbar.
    let anrechnungsfaktor = 0;
    if (schenkungAktiv) {
      if (schenkungAnEhegatte) {
        anrechnungsfaktor = 1;
      } else {
        anrechnungsfaktor = Math.max(0, (ABSCHMELZUNG_JAHRE - schenkungJahre) / ABSCHMELZUNG_JAHRE);
      }
    }
    const anrechenbareSchenkung = schenkungAktiv ? schenkungWert * anrechnungsfaktor : 0;
    const ergaenzungEUR = toDecimal(pflichtteilsquote) * anrechenbareSchenkung;

    // === Gesamtanspruch ===
    const gesamtanspruch = pflichtteilEUR + ergaenzungEUR;

    // === Info: kleiner Pflichtteil (§ 1371 Abs. 2/3) – nur Zugewinngemeinschaft, Ehegatte ===
    // Alternative erbrechtliche Loesung: Ehegatte schlaegt aus / wird nicht Erbe =>
    // konkreter Zugewinnausgleich + kleiner Pflichtteil aus dem NICHT erhoehten Erbteil (1/4).
    let kleinerPflichtteilsquote: { n: number; d: number } | null = null;
    let kleinerPflichtteilEUR = 0;
    if (gueterstand === 'zugewinn' && person === 'ehegatte' && hatKinder) {
      kleinerPflichtteilsquote = mul(EHEGATTE_NEBEN_KINDERN, PFLICHTTEIL_FAKTOR); // 1/2 × 1/4 = 1/8
      kleinerPflichtteilEUR = toDecimal(kleinerPflichtteilsquote) * nettonachlass;
    }

    return {
      person,
      hatKinder,
      ehegattenErbquote,
      kindErbquote,
      gesetzlicheErbquote,
      quotenHerleitung,
      pflichtteilsquote,
      pflichtteilEUR,
      anrechnungsfaktor,
      anrechenbareSchenkung,
      ergaenzungEUR,
      gesamtanspruch,
      kleinerPflichtteilsquote,
      kleinerPflichtteilEUR,
    };
  }, [gueterstand, anzahlKinder, fuerWen, nettonachlass, schenkungAktiv, schenkungWert, schenkungJahre, schenkungAnEhegatte]);

  // === Formatierung (de-DE) ===
  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) =>
    Math.round(n).toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatProzent = (n: number) =>
    (n * 100).toFixed(1).replace('.', ',') + ' %';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Eingabe */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Nettonachlass */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Nettonachlass (Erbmasse)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Vermögen des Erblassers minus Nachlassverbindlichkeiten (Schulden, Beerdigung)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={nettonachlass}
              onChange={(e) => setNettonachlass(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="10000000"
              step="10000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={Math.min(nettonachlass, 2000000)}
            onChange={(e) => setNettonachlass(Number(e.target.value))}
            className="w-full mt-3 accent-amber-600"
            min="0"
            max="2000000"
            step="10000"
          />
        </div>

        {/* Güterstand */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Güterstand der Ehe</span>
            <span className="text-xs text-gray-500 block mt-1">
              Ohne Ehevertrag gilt automatisch die Zugewinngemeinschaft
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {([
              ['zugewinn', 'Zugewinn­gemeinschaft', 'gesetzlicher Standard'],
              ['guetertrennung', 'Gütertrennung', 'per Ehevertrag'],
              ['guetergemeinschaft', 'Güter­gemeinschaft', 'per Ehevertrag'],
            ] as [Gueterstand, string, string][]).map(([wert, titel, sub]) => (
              <button
                key={wert}
                onClick={() => setGueterstand(wert)}
                className={`py-3 px-3 rounded-xl font-medium transition-all text-sm ${
                  gueterstand === wert ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="block">{titel}</span>
                <span className={`block text-xs mt-0.5 ${gueterstand === wert ? 'text-amber-100' : 'text-gray-400'}`}>
                  {sub}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Anzahl Kinder */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Anzahl der Kinder des Erblassers</span>
            <span className="text-xs text-gray-500 block mt-1">
              Abkömmlinge 1. Ordnung (auch enterbte Kinder zählen für die Quote)
            </span>
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                const v = Math.max(0, anzahlKinder - 1);
                setAnzahlKinder(v);
                if (v === 0) setFuerWen('ehegatte');
              }}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
            >
              −
            </button>
            <div className="text-center">
              <span className="text-3xl font-bold text-gray-800">{anzahlKinder}</span>
              <span className="text-gray-500 ml-1">{anzahlKinder === 1 ? 'Kind' : 'Kinder'}</span>
            </div>
            <button
              onClick={() => setAnzahlKinder(Math.min(10, anzahlKinder + 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Für wen */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Pflichtteil berechnen für</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFuerWen('ehegatte')}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                ergebnis.person === 'ehegatte' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Ehegatte / -in
            </button>
            <button
              onClick={() => setFuerWen('kind')}
              disabled={anzahlKinder === 0}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                ergebnis.person === 'kind'
                  ? 'bg-amber-600 text-white'
                  : anzahlKinder === 0
                  ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Ein Kind
            </button>
          </div>
          {anzahlKinder === 0 && (
            <p className="text-xs text-amber-600 mt-2">
              Ohne Kinder wird der Pflichtteil des Ehegatten berechnet (Konstellation neben Verwandten 2. Ordnung, sofern vorhanden).
            </p>
          )}
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Schenkung / Pflichtteilsergänzung */}
        <label className="flex items-center gap-3 cursor-pointer mb-2">
          <input
            type="checkbox"
            checked={schenkungAktiv}
            onChange={(e) => setSchenkungAktiv(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
          />
          <div>
            <span className="text-gray-700 font-medium">Schenkung berücksichtigen (Pflichtteilsergänzung)</span>
            <span className="text-xs text-gray-500 block">
              Schenkungen des Erblassers innerhalb 10 Jahren vor dem Tod (§ 2325 BGB)
            </span>
          </div>
        </label>

        {schenkungAktiv && (
          <div className="space-y-4 p-4 bg-amber-50 rounded-xl mt-3">
            <div>
              <label className="block mb-2">
                <span className="text-sm font-medium text-amber-800">Wert der Schenkung</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={schenkungWert}
                  onChange={(e) => setSchenkungWert(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-amber-200 rounded-xl bg-white focus:border-orange-500 focus:ring-0 outline-none"
                  min="0"
                  step="5000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={schenkungAnEhegatte}
                onChange={(e) => setSchenkungAnEhegatte(e.target.checked)}
                className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm text-amber-800">
                Schenkung ging an den Ehegatten
                <span className="block text-xs text-amber-600">
                  Dann beginnt die Abschmelzungsfrist erst mit Auflösung der Ehe (§ 2325 Abs. 3 S. 3) – volle Anrechnung
                </span>
              </span>
            </label>

            {!schenkungAnEhegatte && (
              <div>
                <label className="block mb-2">
                  <span className="text-sm font-medium text-amber-800">
                    Vollendete Jahre zwischen Schenkung und Erbfall: {schenkungJahre}
                  </span>
                </label>
                <input
                  type="range"
                  value={schenkungJahre}
                  onChange={(e) => setSchenkungJahre(Number(e.target.value))}
                  className="w-full accent-amber-600"
                  min="0"
                  max="10"
                  step="1"
                />
                <div className="flex justify-between text-xs text-amber-600 mt-1">
                  <span>0 J. (100 %)</span>
                  <span>5 J. (50 %)</span>
                  <span>≥ 10 J. (0 %)</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-stone-500 to-amber-700 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">
          📜 Pflichtteil {ergebnis.person === 'ehegatte' ? 'des Ehegatten' : 'des Kindes'}
        </h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-5xl font-bold">{formatEuroRound(ergebnis.gesamtanspruch)}</span>
            {schenkungAktiv && ergebnis.ergaenzungEUR > 0 && (
              <span className="text-lg opacity-80">Gesamtanspruch</span>
            )}
          </div>
          <p className="text-amber-50 mt-2 text-sm">
            Pflichtteilsquote <strong>{bruch(ergebnis.pflichtteilsquote)}</strong> des Nachlasses
            {' '}({formatProzent(toDecimal(ergebnis.pflichtteilsquote))})
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Gesetzlicher Erbteil</span>
            <div className="text-xl font-bold">{bruch(ergebnis.gesetzlicheErbquote)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Pflichtteil aus Nachlass</span>
            <div className="text-xl font-bold">{formatEuroRound(ergebnis.pflichtteilEUR)}</div>
          </div>
        </div>

        {schenkungAktiv && ergebnis.ergaenzungEUR > 0 && (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm mt-3">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-80">
                + Pflichtteilsergänzung (Anrechnung {formatProzent(ergebnis.anrechnungsfaktor)})
              </span>
              <span className="text-lg font-bold">+{formatEuroRound(ergebnis.ergaenzungEUR)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnung Schritt für Schritt</h3>
        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Schritt 1 – Gesetzlicher Erbteil
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Erbteil des Ehegatten</span>
            <span className="font-bold text-gray-900">{bruch(ergebnis.ehegattenErbquote)}</span>
          </div>
          {ergebnis.hatKinder && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Erbteil je Kind</span>
              <span className="font-bold text-gray-900">{bruch(ergebnis.kindErbquote)}</span>
            </div>
          )}
          <div className="text-xs text-gray-500 py-1">{ergebnis.quotenHerleitung}</div>

          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Schritt 2 – Pflichtteilsquote (½ des Erbteils, § 2303 BGB)
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              ½ × {bruch(ergebnis.gesetzlicheErbquote)} ({ergebnis.person === 'ehegatte' ? 'Ehegatte' : 'Kind'})
            </span>
            <span className="font-bold text-amber-700">{bruch(ergebnis.pflichtteilsquote)}</span>
          </div>

          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Schritt 3 – Pflichtteil in Euro
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              {bruch(ergebnis.pflichtteilsquote)} × {formatEuroRound(nettonachlass)}
            </span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.pflichtteilEUR)}</span>
          </div>

          {schenkungAktiv && (
            <>
              <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
                Schritt 4 – Pflichtteilsergänzung (§ 2325 BGB)
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Schenkungswert</span>
                <span className="text-gray-900">{formatEuro(schenkungWert)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">
                  Anrechnungsfaktor {schenkungAnEhegatte ? '(Ehegattenschenkung – volle Anrechnung)' : `(nach ${schenkungJahre} J. Abschmelzung)`}
                </span>
                <span className="text-gray-900">{formatProzent(ergebnis.anrechnungsfaktor)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Anrechenbarer Schenkungswert</span>
                <span className="text-gray-900">{formatEuro(ergebnis.anrechenbareSchenkung)}</span>
              </div>
              <div className="flex justify-between py-2 bg-amber-50 -mx-6 px-6">
                <span className="font-medium text-amber-700">Ergänzungspflichtteil</span>
                <span className="font-bold text-amber-900">{formatEuro(ergebnis.ergaenzungEUR)}</span>
              </div>
            </>
          )}

          <div className="flex justify-between py-3 bg-amber-100 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-amber-800">Gesamter Pflichtteilsanspruch</span>
            <span className="font-bold text-2xl text-amber-900">{formatEuro(ergebnis.gesamtanspruch)}</span>
          </div>
        </div>
      </div>

      {/* Info: kleiner Pflichtteil (Zugewinn, Ehegatte) */}
      {ergebnis.kleinerPflichtteilsquote && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-3">⚖️ Großer vs. kleiner Pflichtteil (§ 1371 BGB)</h3>
          <p className="text-sm text-gray-600 mb-3">
            Als überlebender Ehegatte im Güterstand der Zugewinngemeinschaft haben Sie eine Wahl, wenn Sie enterbt sind:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-4 bg-amber-50 rounded-xl">
              <p className="font-semibold text-amber-800">Großer Pflichtteil</p>
              <p className="text-xs text-amber-700 mt-1">
                Aus dem um das Zugewinnviertel erhöhten Erbteil (½). Quote {bruch(ergebnis.pflichtteilsquote)}.
              </p>
              <p className="text-lg font-bold text-amber-900 mt-2">{formatEuroRound(ergebnis.pflichtteilEUR)}</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-xl">
              <p className="font-semibold text-stone-700">Kleiner Pflichtteil + Zugewinnausgleich</p>
              <p className="text-xs text-stone-600 mt-1">
                Aus dem nicht erhöhten Erbteil (¼). Quote {bruch(ergebnis.kleinerPflichtteilsquote)} PLUS konkreter
                Zugewinnausgleich (individuell zu berechnen).
              </p>
              <p className="text-lg font-bold text-stone-800 mt-2">
                {formatEuroRound(ergebnis.kleinerPflichtteilEUR)} <span className="text-sm font-normal">+ Zugewinnausgleich</span>
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Welche Variante günstiger ist, hängt vom konkreten Zugewinn während der Ehe ab. Der Zugewinnausgleich
            (§§ 1373–1378 BGB) lässt sich nicht pauschal beziffern – hier ist anwaltliche Beratung sinnvoll.
          </p>
        </div>
      )}

      {/* Hinweise / Sonderfälle */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Geldanspruch:</strong> Der Pflichtteil ist ein reiner Geldanspruch gegen die Erben – kein Anspruch auf konkrete Nachlassgegenstände (§ 2303 BGB).</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Nettonachlass:</strong> Grundlage ist der Nachlass nach Abzug der Nachlassverbindlichkeiten (Schulden, Beerdigungskosten). Eine korrekte Bewertung ist entscheidend.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Berechtigter Personenkreis:</strong> Nur Abkömmlinge, Eltern und Ehegatte des Erblassers sind pflichtteilsberechtigt (§ 2303 BGB) – Geschwister z. B. nicht.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Bewertung der Schenkung:</strong> Der anrechenbare Schenkungswert richtet sich nach § 2325 Abs. 2 BGB (Niederstwertprinzip, Kaufkraftbereinigung) – dieser Rechner nimmt vereinfachend den eingegebenen Wert an.</span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
        <p className="text-sm text-gray-600">
          <strong>Hinweis:</strong> Dieser Rechner liefert eine unverbindliche <strong>Schätzung</strong> auf Basis
          der gesetzlichen Quoten und ist <strong>keine Rechts- oder Steuerberatung</strong>. Die konkrete Höhe des
          Pflichtteils hängt von der genauen Nachlassbewertung, Sonderfällen (Ausschlagung, Anrechnung/Ausgleichung
          nach §§ 2315, 2316 BGB, Verjährung nach § 2332 BGB) und der Familienkonstellation ab. Für eine verbindliche
          Auskunft wenden Sie sich an eine Rechtsanwältin oder einen Notar.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen (amtliche Primärquellen)</h4>
        <div className="space-y-1">
          <a href="https://www.gesetze-im-internet.de/bgb/__2303.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 2303 BGB – Pflichtteilsberechtigte; Höhe des Pflichtteils
          </a>
          <a href="https://www.gesetze-im-internet.de/bgb/__1931.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 1931 BGB – Gesetzliches Erbrecht des Ehegatten
          </a>
          <a href="https://www.gesetze-im-internet.de/bgb/__1371.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 1371 BGB – Zugewinnausgleich im Todesfall
          </a>
          <a href="https://www.gesetze-im-internet.de/bgb/__2325.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 2325 BGB – Pflichtteilsergänzung bei Schenkungen
          </a>
        </div>
      </div>
    </div>
  );
}
