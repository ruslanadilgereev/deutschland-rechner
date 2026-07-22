import { useState, useMemo } from 'react';

// === VERIFIZIERTE AMTLICHE WERTE (Bewertungsgesetz + BMF-Schreiben) ===
// Alle Konstanten stammen aus amtlichen Primärquellen. Kein Wert ohne Beleg.

// Jahreswert einer Geldsumme = 5,5 % (§ 15 Abs. 1 BewG)
// https://www.gesetze-im-internet.de/bewg/__15.html
const GELDSUMME_ZINS = 0.055;

// Deckelung des Jahreswerts: höchstens Wert des Wirtschaftsguts / 18,6 (§ 16 BewG)
// https://www.gesetze-im-internet.de/bewg/__16.html
const DECKEL_TEILER = 18.6;

// Immerwährende Nutzungen: das 18,6-fache des Jahreswerts (§ 13 Abs. 2 BewG)
// https://www.gesetze-im-internet.de/bewg/__13.html
const VF_IMMERWAEHREND = 18.6;

// Nutzungen von unbestimmter Dauer: das 9,3-fache des Jahreswerts (§ 13 Abs. 2 BewG)
// https://www.gesetze-im-internet.de/bewg/__13.html
const VF_UNBESTIMMT = 9.3;

// Vervielfältiger für lebenslängliche Nutzungen (§ 14 Abs. 1 BewG).
// Anlage zum BMF-Schreiben vom 21.10.2025 (GZ IV D 4 - S 3104/00002/013/003),
// Bewertungsstichtage ab 01.01.2026, Allgemeine Sterbetafel 2022/2024, 5,5 % Zins.
// Nur die amtlich verifizierten Altersstufen (le = mittlere Lebenserwartung in Jahren).
// https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Erbschaft_Schenkungsteuerrecht/2025-10-21-bewert-lebensl-nutzung-leistung-1-1-26.pdf
const BMF_VERVIELFAELTIGER: {
  alter: number;
  mann: { vf: number; le: number };
  frau: { vf: number; le: number };
}[] = [
  { alter: 0, mann: { vf: 18.402, le: 78.47 }, frau: { vf: 18.465, le: 83.19 } },
  { alter: 60, mann: { vf: 12.798, le: 21.58 }, frau: { vf: 13.832, le: 25.19 } },
  { alter: 65, mann: { vf: 11.444, le: 17.71 }, frau: { vf: 12.583, le: 20.91 } },
  { alter: 70, mann: { vf: 9.938, le: 14.18 }, frau: { vf: 11.107, le: 16.86 } },
];

// Vervielfältiger für zeitlich befristete Nutzungen / Zeitrenten (§ 13 Abs. 1 BewG, Anlage 9a BewG),
// Zinssatz 5,5 %. Nur die amtlich verifizierten Laufzeiten.
// https://www.gesetze-im-internet.de/bewg/anlage_9a.html
const ANLAGE_9A: { jahre: number; vf: number }[] = [
  { jahre: 5, vf: 4.388 },
  { jahre: 10, vf: 7.745 },
  { jahre: 15, vf: 10.314 },
  { jahre: 20, vf: 12.279 },
];

type Art = 'lebenslaenglich' | 'immerwaehrend' | 'unbestimmt' | 'zeitrente';

export default function NiessbrauchRechner() {
  // Eingaben
  const [art, setArt] = useState<Art>('lebenslaenglich');
  const [wert, setWert] = useState(400000);
  const [jahreswertInput, setJahreswertInput] = useState(16000);
  const [ausGeldsumme, setAusGeldsumme] = useState(false);
  const [alter, setAlter] = useState(65);
  const [geschlecht, setGeschlecht] = useState<'mann' | 'frau'>('frau');
  const [laufzeit, setLaufzeit] = useState(10);

  const ergebnis = useMemo(() => {
    // === 1. Jahreswert der Nutzung ermitteln ===
    // Optional bei Geldsumme: Jahreswert = Kapital × 5,5 % (§ 15 Abs. 1 BewG)
    const roherJahreswert = ausGeldsumme ? wert * GELDSUMME_ZINS : jahreswertInput;

    // === 2. Deckelung des Jahreswerts nach § 16 BewG ===
    const maxJahreswert = wert / DECKEL_TEILER;
    const gedeckelterJahreswert = Math.min(roherJahreswert, maxJahreswert);
    const deckelGegriffen = roherJahreswert > maxJahreswert;

    // === 3. Vervielfältiger je nach Art des Nießbrauchs ===
    let vervielfaeltiger = 0;
    let vfQuelle = '';
    let lebenserwartung: number | null = null;

    if (art === 'lebenslaenglich') {
      const zeile = BMF_VERVIELFAELTIGER.find((z) => z.alter === alter);
      if (zeile) {
        const spalte = geschlecht === 'mann' ? zeile.mann : zeile.frau;
        vervielfaeltiger = spalte.vf;
        lebenserwartung = spalte.le;
        vfQuelle = `BMF-Tabelle (§ 14 BewG), Alter ${alter}, ${geschlecht === 'mann' ? 'Mann' : 'Frau'}`;
      }
    } else if (art === 'immerwaehrend') {
      vervielfaeltiger = VF_IMMERWAEHREND;
      vfQuelle = '§ 13 Abs. 2 BewG (immerwährend)';
    } else if (art === 'unbestimmt') {
      vervielfaeltiger = VF_UNBESTIMMT;
      vfQuelle = '§ 13 Abs. 2 BewG (unbestimmte Dauer)';
    } else if (art === 'zeitrente') {
      const zeile = ANLAGE_9A.find((z) => z.jahre === laufzeit);
      if (zeile) {
        vervielfaeltiger = zeile.vf;
        vfQuelle = `Anlage 9a BewG, Laufzeit ${laufzeit} Jahre`;
      }
    }

    // === 4. Kapitalwert = gedeckelter Jahreswert × Vervielfältiger (§ 14 Abs. 1 BewG) ===
    const kapitalwert = gedeckelterJahreswert * vervielfaeltiger;

    return {
      roherJahreswert,
      maxJahreswert,
      gedeckelterJahreswert,
      deckelGegriffen,
      vervielfaeltiger,
      vfQuelle,
      lebenserwartung,
      kapitalwert,
    };
  }, [art, wert, jahreswertInput, ausGeldsumme, alter, geschlecht, laufzeit]);

  // Formatierung (de-DE)
  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRund = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatVf = (n: number) => n.toFixed(3).replace('.', ',');
  const formatJahre = (n: number) => n.toFixed(2).replace('.', ',');

  const artLabels: Record<Art, string> = {
    lebenslaenglich: 'Lebenslänglich',
    immerwaehrend: 'Immerwährend',
    unbestimmt: 'Unbestimmte Dauer',
    zeitrente: 'Zeitlich befristet',
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Eingabe */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Art des Nießbrauchs */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Art des Nießbrauchs</span>
            <span className="text-xs text-gray-500 block mt-1">
              Bestimmt, welcher Vervielfältiger angewendet wird (§§ 13, 14 BewG)
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(artLabels) as Art[]).map((a) => (
              <button
                key={a}
                onClick={() => setArt(a)}
                className={`py-3 px-4 rounded-xl font-medium transition-all text-sm ${
                  art === a
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {artLabels[a]}
              </button>
            ))}
          </div>
        </div>

        {/* Wert des Wirtschaftsguts */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Wert des Wirtschaftsguts</span>
            <span className="text-xs text-gray-500 block mt-1">
              z.&nbsp;B. Verkehrs-/Steuerwert der Immobilie oder Kapitalbetrag
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={wert}
              onChange={(e) => setWert(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
              min="0"
              step="10000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
        </div>

        {/* Jahreswert */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Jahreswert der Nutzung</span>
            <span className="text-xs text-gray-500 block mt-1">
              Jährlicher Reinertrag, z.&nbsp;B. Jahresnettokaltmiete (§ 15 BewG)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={ausGeldsumme ? Math.round(wert * GELDSUMME_ZINS) : jahreswertInput}
              onChange={(e) => setJahreswertInput(Math.max(0, Number(e.target.value)))}
              disabled={ausGeldsumme}
              className={`w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none ${
                ausGeldsumme ? 'bg-gray-100 text-gray-500' : ''
              }`}
              min="0"
              step="500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Jahr</span>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 mt-3 cursor-pointer">
            <input
              type="checkbox"
              checked={ausGeldsumme}
              onChange={(e) => setAusGeldsumme(e.target.checked)}
              className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
            />
            Jahreswert automatisch aus Geldsumme (5,5 %, § 15 Abs. 1 BewG)
          </label>
        </div>

        {/* Lebenslänglich: Alter + Geschlecht */}
        {art === 'lebenslaenglich' && (
          <div className="mb-2 p-4 bg-emerald-50 rounded-xl space-y-4">
            <div>
              <label className="block mb-2">
                <span className="text-emerald-800 font-medium text-sm">Vollendetes Lebensalter des Nießbrauchers</span>
                <span className="text-xs text-emerald-700 block mt-1">
                  Nur amtlich verifizierte Altersstufen wählbar (Auszug aus der BMF-Tabelle)
                </span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {BMF_VERVIELFAELTIGER.map((z) => (
                  <button
                    key={z.alter}
                    onClick={() => setAlter(z.alter)}
                    className={`py-2 rounded-lg font-medium text-sm transition-all ${
                      alter === z.alter
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-emerald-100'
                    }`}
                  >
                    {z.alter} J.
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-emerald-800 font-medium text-sm block mb-2">Geschlecht (eigene Tabellen-Spalte)</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setGeschlecht('frau')}
                  className={`py-2 rounded-lg font-medium text-sm transition-all ${
                    geschlecht === 'frau'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-emerald-100'
                  }`}
                >
                  Frau
                </button>
                <button
                  onClick={() => setGeschlecht('mann')}
                  className={`py-2 rounded-lg font-medium text-sm transition-all ${
                    geschlecht === 'mann'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-emerald-100'
                  }`}
                >
                  Mann
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Zeitrente: Laufzeit */}
        {art === 'zeitrente' && (
          <div className="mb-2 p-4 bg-emerald-50 rounded-xl">
            <label className="block mb-2">
              <span className="text-emerald-800 font-medium text-sm">Laufzeit des befristeten Nießbrauchs</span>
              <span className="text-xs text-emerald-700 block mt-1">
                Nur amtlich verifizierte Laufzeiten wählbar (Auszug aus Anlage 9a BewG)
              </span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ANLAGE_9A.map((z) => (
                <button
                  key={z.jahre}
                  onClick={() => setLaufzeit(z.jahre)}
                  className={`py-2 rounded-lg font-medium text-sm transition-all ${
                    laufzeit === z.jahre
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-emerald-100'
                  }`}
                >
                  {z.jahre} J.
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🏠 Kapitalwert des Nießbrauchs</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-5xl font-bold">{formatEuroRund(ergebnis.kapitalwert)}</span>
          </div>
          <p className="text-emerald-100 mt-2 text-sm">
            {artLabels[art]} · Vervielfältiger {formatVf(ergebnis.vervielfaeltiger)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Gedeckelter Jahreswert (§ 16)</span>
            <div className="text-xl font-bold">{formatEuroRund(ergebnis.gedeckelterJahreswert)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Vervielfältiger</span>
            <div className="text-xl font-bold">{formatVf(ergebnis.vervielfaeltiger)}</div>
          </div>
        </div>

        {ergebnis.deckelGegriffen && (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm mt-3">
            <p className="text-sm">
              ⚠️ Die Deckelung nach § 16 BewG greift: Der Jahreswert von{' '}
              {formatEuroRund(ergebnis.roherJahreswert)} wurde auf{' '}
              {formatEuroRund(ergebnis.maxJahreswert)} (Wert / 18,6) begrenzt.
            </p>
          </div>
        )}
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Wert des Wirtschaftsguts</span>
            <span className="font-bold text-gray-900">{formatEuro(wert)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              Jahreswert der Nutzung{ausGeldsumme ? ' (5,5 % der Geldsumme)' : ''}
            </span>
            <span className="text-gray-900">{formatEuro(ergebnis.roherJahreswert)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Höchstwert nach § 16 (Wert / 18,6)</span>
            <span className="text-gray-900">{formatEuro(ergebnis.maxJahreswert)}</span>
          </div>
          <div className="flex justify-between py-2 bg-emerald-50 -mx-6 px-6">
            <span className="font-medium text-emerald-700">= Anzusetzender Jahreswert</span>
            <span className="font-bold text-emerald-900">{formatEuro(ergebnis.gedeckelterJahreswert)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Vervielfältiger ({ergebnis.vfQuelle})</span>
            <span className="font-bold text-emerald-600">× {formatVf(ergebnis.vervielfaeltiger)}</span>
          </div>
          {ergebnis.lebenserwartung !== null && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Mittlere Lebenserwartung (informativ)</span>
              <span className="text-gray-900">{formatJahre(ergebnis.lebenserwartung)} Jahre</span>
            </div>
          )}
          <div className="flex justify-between py-3 bg-emerald-100 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-emerald-800">Kapitalwert des Nießbrauchs</span>
            <span className="font-bold text-2xl text-emerald-900">{formatEuro(ergebnis.kapitalwert)}</span>
          </div>
        </div>
      </div>

      {/* Info: So wird gerechnet */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Bewertung</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>1.</span>
            <span><strong>Jahreswert</strong> der Nutzung ermitteln (z.&nbsp;B. Jahresnettokaltmiete; bei Geldsumme 5,5 %, § 15 BewG).</span>
          </li>
          <li className="flex gap-2">
            <span>2.</span>
            <span><strong>Deckelung</strong> nach § 16 BewG: höchstens Wert des Wirtschaftsguts geteilt durch 18,6.</span>
          </li>
          <li className="flex gap-2">
            <span>3.</span>
            <span><strong>Vervielfältiger</strong> wählen – lebenslänglich aus der BMF-Tabelle nach Alter &amp; Geschlecht (§ 14 BewG), sonst § 13 / Anlage 9a.</span>
          </li>
          <li className="flex gap-2">
            <span>4.</span>
            <span><strong>Kapitalwert</strong> = anzusetzender Jahreswert × Vervielfältiger.</span>
          </li>
        </ul>
      </div>

      {/* Hinweis: nur verifizierte Werte */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              Bei <strong>lebenslänglichem</strong> Nießbrauch enthält dieser Rechner nur die amtlich
              verifizierten Altersstufen (0, 60, 65, 70 Jahre). Für andere Alter gilt die
              <a
                href="https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Erbschaft_Schenkungsteuerrecht/2025-10-21-bewert-lebensl-nutzung-leistung-1-1-26.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {' '}vollständige BMF-Tabelle
              </a>.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              Bei <strong>zeitlich befristetem</strong> Nießbrauch sind nur die verifizierten Laufzeiten
              (5, 10, 15, 20 Jahre) hinterlegt; weitere Laufzeiten stehen in Anlage 9a BewG.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              Der anzusetzende <strong>Jahreswert</strong> einer Immobilie (übliche Jahresnettokaltmiete)
              ist eine Sachverhaltsfrage und nicht ziffernmäßig im Gesetz festgelegt – hier als Näherung.
            </span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6 text-xs text-gray-500">
        <strong>Schätzung – keine Rechts- oder Steuerberatung.</strong> Die Bewertung ersetzt keine
        verbindliche Auskunft des Finanzamts oder eines Steuerberaters. Maßgeblich sind der
        Einzelfall, der amtlich festgestellte Wert des Wirtschaftsguts und der Bewertungsstichtag.
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen (amtlich)</h4>
        <div className="space-y-1">
          <a href="https://www.gesetze-im-internet.de/bewg/__14.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 14 BewG – Lebenslängliche Nutzungen und Leistungen
          </a>
          <a href="https://www.gesetze-im-internet.de/bewg/__13.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 13 BewG – Kapitalwert wiederkehrender Nutzungen (18,6-/9,3-fach)
          </a>
          <a href="https://www.gesetze-im-internet.de/bewg/__15.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 15 BewG – Jahreswert von Nutzungen und Leistungen (5,5 %)
          </a>
          <a href="https://www.gesetze-im-internet.de/bewg/__16.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 16 BewG – Begrenzung des Jahreswerts (Teiler 18,6)
          </a>
          <a href="https://www.gesetze-im-internet.de/bewg/anlage_9a.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            Anlage 9a BewG – Vervielfältiger für Zeitrenten
          </a>
          <a href="https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Erbschaft_Schenkungsteuerrecht/2025-10-21-bewert-lebensl-nutzung-leistung-1-1-26.pdf" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            BMF-Schreiben vom 21.10.2025 – Vervielfältiger ab 01.01.2026
          </a>
        </div>
      </div>
    </div>
  );
}
