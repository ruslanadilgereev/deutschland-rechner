import { useState, useMemo } from 'react';

// Schritte-Rechner: Schritte ↔ Kilometer, Gehzeit und Kalorien
// Schrittlänge ≈ Körpergröße × 0,415 (Männer) bzw. × 0,413 (Frauen) – Faustformel,
// alternativ direkte Eingabe. Kalorien MET-basiert (Gehen moderat ≈ 3,5 MET,
// Compendium of Physical Activities): kcal = MET × kg × Stunden.

function rund(x: number, dez: number): number {
  const f = Math.pow(10, dez);
  return Math.round(x * f) / f;
}

function schrittlaengeAusGroesse(groesseCm: number, geschlecht: 'm' | 'w'): number {
  return rund(Math.max(0, groesseCm) * (geschlecht === 'w' ? 0.413 : 0.415), 1);
}

function formatZahl(x: number, dez = 0): string {
  return x.toLocaleString('de-DE', { minimumFractionDigits: dez, maximumFractionDigits: dez });
}

export default function SchritteRechner() {
  const [richtung, setRichtung] = useState<'schritte' | 'km'>('schritte');
  const [schritte, setSchritte] = useState(10000);
  const [km, setKm] = useState(5);
  const [groesse, setGroesse] = useState(175);
  const [geschlecht, setGeschlecht] = useState<'m' | 'w'>('m');
  const [manuelleLaenge, setManuelleLaenge] = useState(0); // 0 = automatisch
  const [tempo, setTempo] = useState(5);
  const [gewicht, setGewicht] = useState(75);

  const ergebnis = useMemo(() => {
    const laenge = manuelleLaenge > 0 ? manuelleLaenge : schrittlaengeAusGroesse(groesse, geschlecht);

    let distanzKm: number;
    let anzahlSchritte: number;

    if (richtung === 'schritte') {
      anzahlSchritte = Math.max(0, schritte || 0);
      distanzKm = laenge > 0 ? rund((anzahlSchritte * laenge) / 100000, 2) : 0;
    } else {
      distanzKm = Math.max(0, km || 0);
      anzahlSchritte = laenge > 0 ? Math.round((distanzKm * 100000) / laenge) : 0;
    }

    const t = Math.max(0.1, tempo || 5);
    const stunden = distanzKm / t;
    const minuten = Math.round(stunden * 60);
    const kcal = Math.round(3.5 * Math.max(0, gewicht || 0) * stunden);

    return { laenge, distanzKm, anzahlSchritte, minuten, kcal };
  }, [richtung, schritte, km, groesse, geschlecht, manuelleLaenge, tempo, gewicht]);

  return (
    <div>
      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => setRichtung('schritte')}
            className={`p-3 rounded-xl border-2 text-sm font-medium transition-colors ${richtung === 'schritte' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            Schritte → km
          </button>
          <button
            type="button"
            onClick={() => setRichtung('km')}
            className={`p-3 rounded-xl border-2 text-sm font-medium transition-colors ${richtung === 'km' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            km → Schritte
          </button>
        </div>

        <div className="space-y-4">
          {richtung === 'schritte' ? (
            <div>
              <label htmlFor="s-schritte" className="block text-sm font-medium text-gray-700 mb-1">Schritte</label>
              <input
                id="s-schritte"
                type="number"
                min="0"
                step="500"
                value={schritte}
                onChange={(e) => setSchritte(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 text-lg"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="s-km" className="block text-sm font-medium text-gray-700 mb-1">Entfernung (km)</label>
              <input
                id="s-km"
                type="number"
                min="0"
                step="0.5"
                value={km}
                onChange={(e) => setKm(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 text-lg"
              />
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label htmlFor="s-groesse" className="block text-xs font-medium text-gray-700 mb-1">Körpergröße (cm)</label>
              <input
                id="s-groesse"
                type="number"
                min="0"
                max="230"
                step="1"
                value={groesse}
                onChange={(e) => setGroesse(Number(e.target.value))}
                disabled={manuelleLaenge > 0}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-0 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
            <div>
              <label htmlFor="s-geschlecht" className="block text-xs font-medium text-gray-700 mb-1">Geschlecht</label>
              <select
                id="s-geschlecht"
                value={geschlecht}
                onChange={(e) => setGeschlecht(e.target.value as 'm' | 'w')}
                disabled={manuelleLaenge > 0}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-0 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="m">männlich</option>
                <option value="w">weiblich</option>
              </select>
            </div>
            <div>
              <label htmlFor="s-tempo" className="block text-xs font-medium text-gray-700 mb-1">Tempo (km/h)</label>
              <input
                id="s-tempo"
                type="number"
                min="1"
                max="9"
                step="0.5"
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-0 focus:border-orange-500"
              />
            </div>
            <div>
              <label htmlFor="s-gewicht" className="block text-xs font-medium text-gray-700 mb-1">Gewicht (kg)</label>
              <input
                id="s-gewicht"
                type="number"
                min="0"
                max="250"
                step="1"
                value={gewicht}
                onChange={(e) => setGewicht(Number(e.target.value))}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-0 focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="s-laenge" className="block text-xs font-medium text-gray-700 mb-1">
              Schrittlänge manuell (cm) – 0 = automatisch aus Körpergröße
            </label>
            <input
              id="s-laenge"
              type="number"
              min="0"
              max="150"
              step="1"
              value={manuelleLaenge}
              onChange={(e) => setManuelleLaenge(Number(e.target.value))}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-0 focus:border-orange-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Verwendete Schrittlänge: <strong>{ergebnis.laenge.toFixed(1).replace('.', ',')} cm</strong>
              {manuelleLaenge <= 0 && ` (Körpergröße × ${geschlecht === 'w' ? '0,413' : '0,415'})`}
            </p>
          </div>
        </div>
      </div>

      {/* Hauptergebnis */}
      <div className="bg-gradient-to-br from-lime-500 to-green-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
        <p className="text-lime-100 text-sm mb-1">
          {richtung === 'schritte'
            ? `${formatZahl(ergebnis.anzahlSchritte)} Schritte entsprechen`
            : `${formatZahl(ergebnis.distanzKm, 2)} km entsprechen`}
        </p>
        <p className="text-5xl font-bold mb-2">
          {richtung === 'schritte'
            ? `${ergebnis.distanzKm.toFixed(2).replace('.', ',')} km`
            : `${formatZahl(ergebnis.anzahlSchritte)} Schritten`}
        </p>
        <p className="text-lime-100 text-sm">
          Gehzeit bei {tempo.toString().replace('.', ',')} km/h: etwa <strong>{formatZahl(ergebnis.minuten)} Minuten</strong> ·
          Kalorienverbrauch: etwa <strong>{formatZahl(ergebnis.kcal)} kcal</strong>
        </p>
      </div>

      {/* Disclaimer + Quellen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <p className="text-xs text-gray-500 mb-4">
          ⚠️ Näherungswerte: Die Schrittlängen-Faustformel (Körpergröße × 0,415/0,413) und der
          MET-basierte Kalorienwert (Gehen moderat ≈ 3,5 MET) sind Durchschnittswerte – reale Werte
          hängen von Gangart, Gelände und Fitness ab. Keine medizinische Beratung.
        </p>
        <h3 className="text-sm font-bold text-gray-800 mb-2">📚 Quellen</h3>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>
            <a href="https://www.who.int/publications/i/item/9789240015128" target="_blank" rel="noopener noreferrer" className="hover:underline">
              WHO – Guidelines on physical activity and sedentary behaviour (2020)
            </a>
          </li>
          <li>
            <a href="https://www.gesundheitsinformation.de/koerperliche-aktivitaet.html" target="_blank" rel="noopener noreferrer" className="hover:underline">
              IQWiG / gesundheitsinformation.de – Körperliche Aktivität
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
