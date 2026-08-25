import { useState, useMemo } from 'react';

// Zinsrechner – einfache Verzinsung (Z = K · p/100 · t) nach jeder Variablen
// auflösbar, plus Tageszinsen mit Zinstage-Methoden (30/360, act/360, act/365).
// Kontext: § 246 BGB (gesetzlicher Zinssatz 4 %), § 248 BGB (Zinseszinsverbot).
// Der Zinseszins-Vergleich zeigt den Unterschied zur exponentiellen Verzinsung.

type Gesucht = 'zinsen' | 'zinssatz' | 'laufzeit' | 'kapital';

function rund2(x: number): number {
  return Math.round(x * 100) / 100;
}

function formatEuro(betrag: number): string {
  return betrag.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function formatZahl(x: number, dez = 2): string {
  return x.toLocaleString('de-DE', { maximumFractionDigits: dez });
}

export default function ZinsRechner() {
  const [gesucht, setGesucht] = useState<Gesucht>('zinsen');
  const [kapital, setKapital] = useState(10000);
  const [zinssatz, setZinssatz] = useState(3);
  const [laufzeit, setLaufzeit] = useState(2);
  const [zinsen, setZinsen] = useState(600);

  // Tageszinsen
  const [tgKapital, setTgKapital] = useState(10000);
  const [tgZinssatz, setTgZinssatz] = useState(3.65);
  const [tgTage, setTgTage] = useState(90);
  const [tgBasis, setTgBasis] = useState(360);

  const ergebnis = useMemo(() => {
    const K = Math.max(0, kapital || 0);
    const p = Math.max(0, zinssatz || 0);
    const t = Math.max(0, laufzeit || 0);
    const Z = Math.max(0, zinsen || 0);

    let wert: number | null = null;
    let einheit = '';
    let erklaerung = '';

    if (gesucht === 'zinsen') {
      wert = rund2(K * (p / 100) * t);
      einheit = '€';
      erklaerung = `${formatZahl(K)} € × ${formatZahl(p)} % × ${formatZahl(t)} Jahre`;
    } else if (gesucht === 'zinssatz') {
      wert = K > 0 && t > 0 ? rund2((Z / (K * t)) * 100) : null;
      einheit = '% p. a.';
      erklaerung = `${formatZahl(Z)} € ÷ (${formatZahl(K)} € × ${formatZahl(t)} Jahre)`;
    } else if (gesucht === 'laufzeit') {
      wert = K > 0 && p > 0 ? rund2(Z / (K * (p / 100))) : null;
      einheit = 'Jahre';
      erklaerung = `${formatZahl(Z)} € ÷ (${formatZahl(K)} € × ${formatZahl(p)} %)`;
    } else {
      wert = p > 0 && t > 0 ? rund2(Z / ((p / 100) * t)) : null;
      einheit = '€';
      erklaerung = `${formatZahl(Z)} € ÷ (${formatZahl(p)} % × ${formatZahl(t)} Jahre)`;
    }

    // Zinseszins-Vergleich (nur sinnvoll, wenn Zinsen gesucht sind und t > 1)
    const zinseszins = rund2(K * (Math.pow(1 + p / 100, t) - 1));
    const einfach = rund2(K * (p / 100) * t);
    const zzDifferenz = rund2(zinseszins - einfach);

    return { wert, einheit, erklaerung, zinseszins, einfach, zzDifferenz };
  }, [gesucht, kapital, zinssatz, laufzeit, zinsen]);

  const tagesErgebnis = useMemo(() => {
    const K = Math.max(0, tgKapital || 0);
    const p = Math.max(0, tgZinssatz || 0);
    const tage = Math.max(0, tgTage || 0);
    const basis = tgBasis === 365 ? 365 : 360;
    return { zins: rund2(K * (p / 100) * (tage / basis)), basis };
  }, [tgKapital, tgZinssatz, tgTage, tgBasis]);

  const felder: { key: Gesucht; label: string }[] = [
    { key: 'zinsen', label: 'Zinsen' },
    { key: 'zinssatz', label: 'Zinssatz' },
    { key: 'laufzeit', label: 'Laufzeit' },
    { key: 'kapital', label: 'Kapital' },
  ];

  return (
    <div>
      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Was möchten Sie berechnen?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          {felder.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setGesucht(f.key)}
              className={`p-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${gesucht === f.key ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {gesucht !== 'kapital' && (
            <div>
              <label htmlFor="z-kapital" className="block text-sm font-medium text-gray-700 mb-1">Kapital (€)</label>
              <input
                id="z-kapital"
                type="number"
                min="0"
                step="500"
                value={kapital}
                onChange={(e) => setKapital(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 text-lg"
              />
            </div>
          )}
          {gesucht !== 'zinssatz' && (
            <div>
              <label htmlFor="z-satz" className="block text-sm font-medium text-gray-700 mb-1">Zinssatz (% p. a.)</label>
              <input
                id="z-satz"
                type="number"
                min="0"
                step="0.05"
                value={zinssatz}
                onChange={(e) => setZinssatz(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 text-lg"
              />
            </div>
          )}
          {gesucht !== 'laufzeit' && (
            <div>
              <label htmlFor="z-laufzeit" className="block text-sm font-medium text-gray-700 mb-1">Laufzeit (Jahre)</label>
              <input
                id="z-laufzeit"
                type="number"
                min="0"
                step="0.5"
                value={laufzeit}
                onChange={(e) => setLaufzeit(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 text-lg"
              />
            </div>
          )}
          {gesucht !== 'zinsen' && (
            <div>
              <label htmlFor="z-zinsen" className="block text-sm font-medium text-gray-700 mb-1">Zinsen (€)</label>
              <input
                id="z-zinsen"
                type="number"
                min="0"
                step="50"
                value={zinsen}
                onChange={(e) => setZinsen(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 text-lg"
              />
            </div>
          )}
        </div>
      </div>

      {/* Hauptergebnis */}
      <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
        <p className="text-sky-100 text-sm mb-1">
          {gesucht === 'zinsen' && 'Zinsen (einfache Verzinsung, ohne Zinseszins)'}
          {gesucht === 'zinssatz' && 'Erforderlicher Zinssatz'}
          {gesucht === 'laufzeit' && 'Erforderliche Laufzeit'}
          {gesucht === 'kapital' && 'Erforderliches Kapital'}
        </p>
        <p className="text-5xl font-bold mb-2">
          {ergebnis.wert === null ? '–' : `${formatZahl(ergebnis.wert)} ${ergebnis.einheit}`}
        </p>
        <p className="text-sky-100 text-sm">
          {ergebnis.wert === null
            ? 'Bitte alle Werte größer als null eingeben.'
            : `Rechnung: ${ergebnis.erklaerung}`}
        </p>
      </div>

      {/* Zinseszins-Vergleich */}
      {gesucht === 'zinsen' && ergebnis.zzDifferenz > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Vergleich: einfache Verzinsung vs. Zinseszins</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="text-gray-600">
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-2">Einfache Zinsen (Auszahlung jährlich)</td>
                  <td className="py-2 pl-2 text-right font-medium text-gray-800">{formatEuro(ergebnis.einfach)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-2">Mit Zinseszins (Zinsen bleiben angelegt)</td>
                  <td className="py-2 pl-2 text-right font-medium text-gray-800">{formatEuro(ergebnis.zinseszins)}</td>
                </tr>
                <tr className="font-bold text-gray-800">
                  <td className="py-3 pr-2">Zinseszins-Effekt</td>
                  <td className="py-3 pl-2 text-right text-sky-700">+{formatEuro(ergebnis.zzDifferenz)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Mehrjährige Anlagen mit wiederangelegten Zinsen rechnet der{' '}
            <a href="/zinseszins-rechner" className="text-sky-600 underline">Zinseszins-Rechner</a> im Detail.
          </p>
        </div>
      )}

      {/* Tageszinsen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Tageszinsen berechnen</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="tg-kapital" className="block text-sm font-medium text-gray-700 mb-1">Kapital (€)</label>
            <input
              id="tg-kapital"
              type="number"
              min="0"
              step="500"
              value={tgKapital}
              onChange={(e) => setTgKapital(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500"
            />
          </div>
          <div>
            <label htmlFor="tg-satz" className="block text-sm font-medium text-gray-700 mb-1">Zinssatz (% p. a.)</label>
            <input
              id="tg-satz"
              type="number"
              min="0"
              step="0.05"
              value={tgZinssatz}
              onChange={(e) => setTgZinssatz(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500"
            />
          </div>
          <div>
            <label htmlFor="tg-tage" className="block text-sm font-medium text-gray-700 mb-1">Zinstage</label>
            <input
              id="tg-tage"
              type="number"
              min="0"
              step="1"
              value={tgTage}
              onChange={(e) => setTgTage(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Tage zwischen zwei Daten liefert der <a href="/tage-rechner" className="underline">Tage-Rechner</a>.
            </p>
          </div>
          <div>
            <label htmlFor="tg-basis" className="block text-sm font-medium text-gray-700 mb-1">Zinstage-Methode</label>
            <select
              id="tg-basis"
              value={tgBasis}
              onChange={(e) => setTgBasis(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500"
            >
              <option value={360}>Basis 360 Tage (deutsche Methode 30/360, act/360)</option>
              <option value={365}>Basis 365 Tage (act/365, englische Methode)</option>
            </select>
          </div>
        </div>
        <div className="bg-sky-50 rounded-lg p-4 flex items-baseline justify-between">
          <span className="text-sm text-sky-800 font-medium">Tageszinsen für {formatZahl(Math.max(0, tgTage || 0), 0)} Tage:</span>
          <span className="text-2xl font-bold text-sky-700">{formatEuro(tagesErgebnis.zins)}</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Formel: Kapital × Zinssatz ÷ 100 × Zinstage ÷ {tagesErgebnis.basis}. Banken in Deutschland
          rechnen traditionell mit der 30/360-Methode (Jahr = 360 Zinstage), am Geldmarkt ist act/360
          üblich, im englischen Raum act/365.
        </p>
      </div>

      {/* Disclaimer + Quellen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <p className="text-xs text-gray-500 mb-4">
          ⚠️ Rechenhilfe für einfache (lineare) Verzinsung ohne Steuern (Abgeltungsteuer siehe
          Kapitalertragsteuer-Rechner), Gebühren und unterjährige Zinsgutschriften. Die Zinstage-Methode
          Ihres Vertrags steht im Preis- und Leistungsverzeichnis. Keine Anlageberatung.
        </p>
        <h3 className="text-sm font-bold text-gray-800 mb-2">📚 Quellen</h3>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>
            <a href="https://www.gesetze-im-internet.de/bgb/__246.html" target="_blank" rel="noopener noreferrer" className="hover:underline">
              § 246 BGB – Gesetzlicher Zinssatz (4 % p. a.)
            </a>
          </li>
          <li>
            <a href="https://www.gesetze-im-internet.de/bgb/__248.html" target="_blank" rel="noopener noreferrer" className="hover:underline">
              § 248 BGB – Zinseszinsverbot (Vereinbarungsgrenzen)
            </a>
          </li>
          <li>
            <a href="https://www.bundesbank.de/de/statistiken/geld-und-kapitalmaerkte/zinssaetze-und-renditen" target="_blank" rel="noopener noreferrer" className="hover:underline">
              Deutsche Bundesbank – Zinssätze und Renditen
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
