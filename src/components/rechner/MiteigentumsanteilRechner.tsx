import { useState, useMemo } from 'react';

// Miteigentumsanteil (MEA) – flächenanteilige Schätzung.
// Verbindlich festgelegt wird der MEA in der Teilungserklärung (§ 8 WEG) und
// als Bruchteil im Grundbuch eingetragen (§ 47 GBO). Übliche Faustformel:
//   MEA (in tausendstel) = (Wohnfläche Einheit / Summe aller Wohnflächen) × 1.000
//   Anteil in Prozent     = (Wohnfläche Einheit / Summe aller Wohnflächen) × 100
// Das WEG schreibt KEINE bestimmte Formel vor – die Flächenformel ist verbreitet,
// aber nicht zwingend (auch Verkehrswert oder umbauter Raum sind möglich).

type Einheit = {
  id: number;
  name: string;
  flaeche: number; // m²
};

let nextId = 4;

const STANDARD_EINHEITEN: Einheit[] = [
  { id: 1, name: 'Wohnung 1 (EG)', flaeche: 65 },
  { id: 2, name: 'Wohnung 2 (1. OG)', flaeche: 80 },
  { id: 3, name: 'Wohnung 3 (DG)', flaeche: 55 },
];

export function MiteigentumsanteilRechner() {
  const [modus, setModus] = useState<'schnell' | 'liste'>('schnell');

  // Schnellmodus
  const [eigeneFlaeche, setEigeneFlaeche] = useState<number>(80);
  const [gesamtFlaeche, setGesamtFlaeche] = useState<number>(200);

  // Listenmodus
  const [einheiten, setEinheiten] = useState<Einheit[]>(STANDARD_EINHEITEN);

  // Optionale Hausgeld-/Kostenverteilung
  const [gesamtkosten, setGesamtkosten] = useState<number>(12000);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungültige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const updateEinheit = (id: number, patch: Partial<Einheit>) => {
    setEinheiten((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const addEinheit = () => {
    setEinheiten((prev) => [...prev, { id: nextId++, name: 'Einheit', flaeche: 60 }]);
  };

  const removeEinheit = (id: number) => {
    setEinheiten((prev) => prev.filter((e) => e.id !== id));
  };

  const formatProzent = (v: number) => v.toFixed(2).replace('.', ',');
  const formatTausendstel = (v: number) => Math.round(v).toLocaleString('de-DE');
  const formatEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

  // ---- Schnellmodus-Ergebnis ----
  const schnell = useMemo(() => {
    if (gesamtFlaeche <= 0) {
      return { prozent: 0, tausendstel: 0, kosten: 0 };
    }
    const anteil = eigeneFlaeche / gesamtFlaeche;
    return {
      prozent: anteil * 100,
      tausendstel: anteil * 1000,
      kosten: gesamtkosten * anteil,
    };
  }, [eigeneFlaeche, gesamtFlaeche, gesamtkosten]);

  // ---- Listenmodus-Ergebnis ----
  const liste = useMemo(() => {
    const summe = einheiten.reduce((acc, e) => acc + e.flaeche, 0);
    const zeilen = einheiten.map((e) => {
      const anteil = summe > 0 ? e.flaeche / summe : 0;
      return {
        id: e.id,
        name: e.name,
        flaeche: e.flaeche,
        prozent: anteil * 100,
        tausendstelExakt: anteil * 1000,
        tausendstelGerundet: Math.round(anteil * 1000),
        kosten: gesamtkosten * anteil,
      };
    });
    const summeGerundet = zeilen.reduce((acc, z) => acc + z.tausendstelGerundet, 0);
    return { summe, zeilen, summeGerundet };
  }, [einheiten, gesamtkosten]);

  return (
    <div className="max-w-2xl mx-auto">

      {/* Modus-Auswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Berechnungsmodus</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setModus('schnell')}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
              modus === 'schnell'
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-2xl">⚡</span>
            <span className="text-center leading-tight">Schnell (eine Einheit)</span>
          </button>
          <button
            onClick={() => setModus('liste')}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
              modus === 'liste'
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-2xl">🏘️</span>
            <span className="text-center leading-tight">Mehrere Einheiten</span>
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          {modus === 'schnell'
            ? 'Schnellmodus: Wohnfläche Ihrer Einheit und Gesamtwohnfläche aller Einheiten eingeben.'
            : 'Listenmodus: alle Einheiten der Gemeinschaft erfassen – der Rechner verteilt 1.000/1.000-tel auf alle.'}
        </p>
      </div>

      {/* Schnellmodus-Eingaben */}
      {modus === 'schnell' && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-4">
          <label className="block">
            <span className="text-sm text-gray-600">Wohnfläche meiner Einheit</span>
            <div className="mt-1 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={eigeneFlaeche}
                onChange={(e) => setEigeneFlaeche(toNumber(e.target.value))}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-base focus:ring-0 focus:border-orange-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">m²</span>
            </div>
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Gesamtwohnfläche aller Einheiten</span>
            <div className="mt-1 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={gesamtFlaeche}
                onChange={(e) => setGesamtFlaeche(toNumber(e.target.value))}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-base focus:ring-0 focus:border-orange-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">m²</span>
            </div>
          </label>
        </div>
      )}

      {/* Listenmodus-Eingaben */}
      {modus === 'liste' && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
          {einheiten.map((e) => (
            <div key={e.id} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={e.name}
                  onChange={(ev) => updateEinheit(e.id, { name: ev.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-0 focus:border-orange-500"
                />
                <button
                  onClick={() => removeEinheit(e.id)}
                  className="text-gray-400 hover:text-red-500 px-2 text-lg"
                  aria-label="Einheit entfernen"
                >
                  ✕
                </button>
              </div>
              <label className="block">
                <span className="text-sm text-gray-600">Wohnfläche</span>
                <div className="mt-1 relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={0.1}
                    value={e.flaeche}
                    onChange={(ev) => updateEinheit(e.id, { flaeche: toNumber(ev.target.value) })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-base focus:ring-0 focus:border-orange-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">m²</span>
                </div>
              </label>
            </div>
          ))}

          <button
            onClick={addEinheit}
            className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 font-medium hover:border-orange-400 hover:text-orange-600 transition-colors"
          >
            + Einheit hinzufügen
          </button>
        </div>
      )}

      {/* Optional: Hausgeld / Gemeinschaftskosten */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block">
          <span className="text-sm text-gray-600">Gesamt-Hausgeld / Gemeinschaftskosten p. a. (optional)</span>
          <div className="mt-1 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={100}
              value={gesamtkosten}
              onChange={(e) => setGesamtkosten(toNumber(e.target.value))}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-base focus:ring-0 focus:border-orange-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
          </div>
        </label>
        <p className="text-xs text-gray-400 mt-2">
          Verteilung nach Miteigentumsanteil gemäß § 16 Abs. 2 Satz 1 WEG (sofern nicht abweichend
          beschlossen).
        </p>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        {modus === 'schnell' ? (
          <>
            <h3 className="text-sm font-medium text-blue-100 mb-1">
              Geschätzter Miteigentumsanteil (MEA)
            </h3>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">{formatTausendstel(schnell.tausendstel)}</span>
                <span className="text-xl text-blue-200">/1.000-tel</span>
              </div>
              <p className="text-blue-200 text-sm mt-1">
                entspricht {formatProzent(schnell.prozent)} % am gemeinschaftlichen Eigentum
              </p>
            </div>
            {gesamtkosten > 0 && (
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-100">Kostenanteil (Hausgeld) p. a.</span>
                  <span className="font-bold">{formatEuro(schnell.kosten)}</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <h3 className="text-sm font-medium text-blue-100 mb-1">
              Geschätzte Miteigentumsanteile (MEA)
            </h3>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">{formatTausendstel(liste.summeGerundet)}</span>
                <span className="text-xl text-blue-200">/1.000-tel</span>
              </div>
              <p className="text-blue-200 text-sm mt-1">
                Summe (gerundet) aus {liste.zeilen.length}{' '}
                {liste.zeilen.length === 1 ? 'Einheit' : 'Einheiten'}
                {' '}· Gesamtfläche {liste.summe.toLocaleString('de-DE')} m²
              </p>
            </div>

            <div className="space-y-3">
              {liste.zeilen.map((z) => (
                <div key={z.id} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-100">{z.name || 'Einheit'}</span>
                    <span className="font-bold">
                      {formatTausendstel(z.tausendstelGerundet)}/1.000-tel
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-blue-200 mt-1">
                    <span>{z.flaeche.toLocaleString('de-DE')} m²</span>
                    <span>
                      {formatProzent(z.prozent)} %
                      {gesamtkosten > 0 && <> · {formatEuro(z.kosten)} p. a.</>}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {liste.summeGerundet !== 1000 && liste.summe > 0 && (
              <p className="text-blue-100 text-xs mt-4 bg-white/10 rounded-lg p-2">
                ⚠️ Rundungsdifferenz: Die Summe der gerundeten Tausendstel ergibt{' '}
                {formatTausendstel(liste.summeGerundet)}/1.000 statt genau 1.000/1.000. In der
                Teilungserklärung wird die Differenz meist einer Einheit zugeschlagen.
              </p>
            )}
          </>
        )}
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Anteil in Tausendstel</strong> = (Wohnfläche Einheit ÷ Gesamtwohnfläche) × 1.000
          </p>
          <p>
            <strong>Anteil in Prozent</strong> = (Wohnfläche Einheit ÷ Gesamtwohnfläche) × 100
          </p>
          <p>
            <strong>Kostenanteil</strong> = Gesamtkosten × (Tausendstel ÷ 1.000) &nbsp;(§ 16 Abs. 2
            Satz 1 WEG)
          </p>
          <p className="text-xs text-gray-500 pt-1">
            Hinweis: Die Flächenformel ist nur die übliche Schätzung. Verbindlich ist der in der
            Teilungserklärung festgelegte und im Grundbuch eingetragene Anteil.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Wichtiger Hinweis:</strong> Dieser Rechner liefert eine{' '}
          <strong>Schätzung – keine Steuer-/Rechtsberatung</strong>. Der Miteigentumsanteil (MEA)
          wird rechtlich verbindlich in der Teilungserklärung (§ 8 WEG) festgelegt und als Bruchteil
          im Grundbuch eingetragen (§ 47 GBO) – meist nach Wohnfläche, aber nicht zwingend; ebenso
          können nach Verkehrswert oder umbautem Raum bemessene Anteile gelten. Maßgeblich ist allein
          der in Teilungserklärung und Grundbuch eingetragene Wert. Dieser Rechner berechnet nur die
          übliche flächenanteilige Schätzung (Wohnfläche der Einheit ÷ Gesamtwohnfläche × 1.000).
          Auch die Kostenverteilung erfolgt nur regelmäßig nach MEA (§ 16 Abs. 2 Satz 1 WEG);
          abweichende Verteilungsschlüssel können beschlossen werden (§ 16 Abs. 2 Satz 2 WEG). Alle
          Angaben ohne Gewähr.
        </p>
      </div>

      {/* Quellen */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">📚 Quellen</h3>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>
            <a className="text-blue-600 hover:underline" href="https://www.gesetze-im-internet.de/woeigg/__1.html" target="_blank" rel="noopener noreferrer">§ 1 WEG – Begriffsbestimmungen (Wohnungseigentum, gemeinschaftliches Eigentum)</a>
          </li>
          <li>
            <a className="text-blue-600 hover:underline" href="https://www.gesetze-im-internet.de/woeigg/__3.html" target="_blank" rel="noopener noreferrer">§ 3 WEG – Vertragliche Einräumung von Sondereigentum</a>
          </li>
          <li>
            <a className="text-blue-600 hover:underline" href="https://www.gesetze-im-internet.de/woeigg/__8.html" target="_blank" rel="noopener noreferrer">§ 8 WEG – Teilung durch den Eigentümer (Teilungserklärung)</a>
          </li>
          <li>
            <a className="text-blue-600 hover:underline" href="https://www.gesetze-im-internet.de/woeigg/__16.html" target="_blank" rel="noopener noreferrer">§ 16 WEG – Nutzungen und Kosten (Verteilung nach Anteil)</a>
          </li>
          <li>
            <a className="text-blue-600 hover:underline" href="https://www.gesetze-im-internet.de/gbo/__47.html" target="_blank" rel="noopener noreferrer">§ 47 GBO – Eintragung des Bruchteils im Grundbuch</a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default MiteigentumsanteilRechner;
