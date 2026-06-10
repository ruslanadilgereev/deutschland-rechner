import { useState, useMemo } from 'react';

// Körperschaftsteuer-Konstanten (Stand 2026)
const KST_SATZ = 0.15; // 15 % Körperschaftsteuer, § 23 Abs. 1 KStG
const SOLI_SATZ = 0.055; // 5,5 % Solidaritätszuschlag auf die KSt, § 4 SolZG
const GEWST_MESSZAHL = 0.035; // 3,5 % Steuermesszahl, § 11 Abs. 2 GewStG
// Kapitalgesellschaften: kein Gewerbesteuer-Freibetrag, keine § 35-Anrechnung

// Echte Hebesätze ausgewählter Großstädte (Stand 2025)
const HEBESATZ_PRESETS = [
  { name: 'Bundesschnitt 2024', satz: 409 },
  { name: 'München', satz: 490 },
  { name: 'Berlin', satz: 410 },
  { name: 'Hamburg', satz: 470 },
  { name: 'Köln', satz: 475 },
  { name: 'Frankfurt a. M.', satz: 460 },
  { name: 'Düsseldorf', satz: 440 },
  { name: 'Stuttgart', satz: 420 },
  { name: 'Leipzig', satz: 460 },
  { name: 'Monheim', satz: 250 },
];

export function KoerperschaftsteuerRechner() {
  const [gewinn, setGewinn] = useState(100000);
  const [hebesatz, setHebesatz] = useState(409);

  const ergebnis = useMemo(() => {
    const g = Math.max(0, gewinn);
    const h = Math.max(200, hebesatz);

    // Körperschaftsteuer = Gewinn × 15 %
    const kst = g * KST_SATZ;
    // Solidaritätszuschlag = KSt × 5,5 %
    const soli = kst * SOLI_SATZ;
    // Gewerbesteuer (KapGes ohne Freibetrag): Messbetrag × Hebesatz
    const messbetrag = g * GEWST_MESSZAHL;
    const gewst = messbetrag * (h / 100);

    const gesamt = kst + soli + gewst;
    const belastung = g > 0 ? (gesamt / g) * 100 : 0;
    const nachSteuer = g - gesamt;

    return { g, h, kst, soli, messbetrag, gewst, gesamt, belastung, nachSteuer };
  }, [gewinn, hebesatz]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatProzent = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';

  return (
    <div className="max-w-2xl mx-auto">

      {/* Eingabe */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Gewinn */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Zu versteuernder Gewinn der Gesellschaft</span>
            <span className="text-xs text-gray-500 block mt-1">
              Jahresgewinn der GmbH, UG oder AG vor Steuern
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={gewinn}
              onChange={(e) => setGewinn(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none"
              min="0"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={Math.min(gewinn, 500000)}
            onChange={(e) => setGewinn(Number(e.target.value))}
            className="w-full mt-3 accent-indigo-500"
            min="0"
            max="500000"
            step="5000"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span>250.000 €</span>
            <span>500.000 €</span>
          </div>
        </div>

        {/* Hebesatz */}
        <div className="mb-2">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Gewerbesteuer-Hebesatz der Gemeinde</span>
            <span className="text-xs text-gray-500 block mt-1">
              Editierbar – jede Gemeinde legt ihren Hebesatz selbst fest (mindestens 200 %). Voreingestellt
              ist der bundesweite Durchschnitt 2024 von 409 % (Destatis).
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={hebesatz}
              onChange={(e) => setHebesatz(Math.max(200, Math.min(1000, Number(e.target.value))))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none"
              min="200"
              max="1000"
              step="5"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">%</span>
          </div>
          <input
            type="range"
            value={Math.min(hebesatz, 600)}
            onChange={(e) => setHebesatz(Number(e.target.value))}
            className="w-full mt-3 accent-indigo-500"
            min="200"
            max="600"
            step="5"
          />

          {/* Stadt-Schnellauswahl */}
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">Stadt-Schnellauswahl (echte Hebesätze, Stand 2025):</p>
            <div className="flex flex-wrap gap-2">
              {HEBESATZ_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setHebesatz(preset.satz)}
                  className={`px-3 py-1 text-xs rounded-full transition-all ${
                    hebesatz === preset.satz
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {preset.name} ({preset.satz}%)
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🏢 Gesamte Steuerlast Ihrer Kapitalgesellschaft</h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroRound(ergebnis.gesamt)}</span>
            <span className="text-xl opacity-80">/ Jahr</span>
          </div>
          <p className="text-indigo-100 mt-2 text-sm">
            Gesamtbelastung {formatProzent(ergebnis.belastung)} bei {formatEuroRound(ergebnis.g)} Gewinn und {ergebnis.h}% Hebesatz
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-xs opacity-80">Körperschaftsteuer</span>
            <div className="text-lg font-bold">{formatEuroRound(ergebnis.kst)}</div>
            <span className="text-xs opacity-70">15 %</span>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-xs opacity-80">Solidaritätszuschlag</span>
            <div className="text-lg font-bold">{formatEuroRound(ergebnis.soli)}</div>
            <span className="text-xs opacity-70">5,5 % der KSt</span>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-xs opacity-80">Gewerbesteuer</span>
            <div className="text-lg font-bold">{formatEuroRound(ergebnis.gewst)}</div>
            <span className="text-xs opacity-70">{ergebnis.h}% Hebesatz</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-80">Gewinn nach Steuern (vor Ausschüttung)</span>
            <span className="text-lg font-bold">{formatEuroRound(ergebnis.nachSteuer)}</span>
          </div>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>

        <div className="space-y-3 text-sm">
          {/* Körperschaftsteuer */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            1. Körperschaftsteuer (§ 23 KStG)
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Gewinn × 15 %</span>
            <span className="text-gray-900">{formatEuro(ergebnis.g)} × 15 %</span>
          </div>
          <div className="flex justify-between py-2 bg-indigo-50 -mx-6 px-6">
            <span className="font-medium text-indigo-700">= Körperschaftsteuer</span>
            <span className="font-bold text-indigo-900">{formatEuro(ergebnis.kst)}</span>
          </div>

          {/* Soli */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            2. Solidaritätszuschlag (§ 4 SolZG)
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Körperschaftsteuer × 5,5 %</span>
            <span className="text-gray-900">{formatEuro(ergebnis.kst)} × 5,5 %</span>
          </div>
          <div className="flex justify-between py-2 bg-indigo-50 -mx-6 px-6">
            <span className="font-medium text-indigo-700">= Solidaritätszuschlag</span>
            <span className="font-bold text-indigo-900">{formatEuro(ergebnis.soli)}</span>
          </div>

          {/* Gewerbesteuer */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            3. Gewerbesteuer (§ 11 / § 16 GewStG) – ohne Freibetrag bei Kapitalgesellschaften
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Gewinn × 3,5 % (Steuermesszahl)</span>
            <span className="text-gray-900">= {formatEuro(ergebnis.messbetrag)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Messbetrag × {ergebnis.h}% (Hebesatz)</span>
            <span className="text-gray-900">{formatEuro(ergebnis.messbetrag)} × {ergebnis.h}%</span>
          </div>
          <div className="flex justify-between py-2 bg-indigo-50 -mx-6 px-6">
            <span className="font-medium text-indigo-700">= Gewerbesteuer</span>
            <span className="font-bold text-indigo-900">{formatEuro(ergebnis.gewst)}</span>
          </div>

          {/* Summe */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            4. Gesamte Steuerbelastung
          </div>
          <div className="flex justify-between py-2 bg-indigo-100 -mx-6 px-6">
            <span className="font-bold text-indigo-800">KSt + Soli + Gewerbesteuer</span>
            <span className="font-bold text-2xl text-indigo-900">{formatEuro(ergebnis.gesamt)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Gesamtbelastung in Prozent vom Gewinn</span>
            <span className="font-bold text-gray-900">{formatProzent(ergebnis.belastung)}</span>
          </div>
        </div>

        <div className="mt-4 p-4 bg-indigo-50 rounded-xl text-sm text-indigo-800">
          💡 Kapitalgesellschaften können die Gewerbesteuer <strong>nicht</strong> auf eine andere Steuer
          anrechnen (kein § 35 EStG wie bei Einzelunternehmern). KSt und Soli sind bundeseinheitlich,
          nur der Hebesatz und damit die Gewerbesteuer hängen vom Standort ab.
        </div>
      </div>

      {/* Hebesatz-Vergleich */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📍 Standortvergleich – Gesamtbelastung nach Hebesatz</h3>
        <p className="text-sm text-gray-500 mb-4">
          KSt und Soli (zusammen 15,825 %) sind überall gleich. Nur die Gewerbesteuer ändert sich mit dem Hebesatz:
        </p>
        <div className="space-y-3">
          {HEBESATZ_PRESETS.map((preset) => {
            const gewStBeiPreset = ergebnis.messbetrag * (preset.satz / 100);
            const gesamtBeiPreset = ergebnis.kst + ergebnis.soli + gewStBeiPreset;
            const differenz = gesamtBeiPreset - ergebnis.gesamt;
            const isAktuell = preset.satz === hebesatz;

            return (
              <div
                key={preset.name}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  isAktuell ? 'bg-indigo-100 border-2 border-indigo-300' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${isAktuell ? 'text-indigo-800' : 'text-gray-600'}`}>
                    {preset.name}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isAktuell ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {preset.satz}%
                  </span>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${isAktuell ? 'text-indigo-900' : 'text-gray-800'}`}>
                    {formatEuroRound(gesamtBeiPreset)}
                  </div>
                  {!isAktuell && (
                    <div className={`text-xs ${differenz > 0 ? 'text-red-500' : 'text-green-600'}`}>
                      {differenz > 0 ? '+' : ''}{formatEuroRound(differenz)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So setzt sich die Steuerlast zusammen</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Körperschaftsteuer 15 %:</strong> bundeseinheitlicher Satz auf den zu versteuernden Gewinn (§ 23 KStG)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Solidaritätszuschlag 5,5 %:</strong> wird auf die Körperschaftsteuer erhoben – ergibt zusammen 15,825 %</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Gewerbesteuer:</strong> Steuermesszahl 3,5 % × Hebesatz der Gemeinde – ohne Freibetrag bei Kapitalgesellschaften</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Keine § 35-Anrechnung:</strong> anders als Einzelunternehmer können GmbH, UG und AG die Gewerbesteuer nicht verrechnen</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Ausschüttung:</strong> bei Gewinnausschüttung an Gesellschafter fällt zusätzlich Kapitalertragsteuer an</span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-2">⚠️ Wichtiger Hinweis</h3>
        <p className="text-sm text-amber-700">
          Dieser Rechner liefert eine <strong>Schätzung ohne Gewähr</strong> auf Basis der gesetzlichen
          Standardsätze (Stand 2026) und <strong>ersetzt keine Steuerberatung</strong>. Hinzurechnungen
          und Kürzungen bei der Gewerbesteuer, verdeckte Gewinnausschüttungen, organschaftliche
          Besonderheiten oder Verlustvorträge sind nicht berücksichtigt. Für eine verbindliche
          Berechnung wenden Sie sich an Ihren Steuerberater oder Ihr Finanzamt.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/kstg_1977/__23.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 23 KStG – Steuersatz (15 %) – Gesetze im Internet
          </a>
          <a
            href="https://www.gesetze-im-internet.de/solzg_1995/__4.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 4 SolZG – Zuschlagsatz (5,5 %) – Gesetze im Internet
          </a>
          <a
            href="https://www.gesetze-im-internet.de/gewstg/__11.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 11 GewStG – Steuermesszahl und Steuermessbetrag – Gesetze im Internet
          </a>
          <a
            href="https://www.gesetze-im-internet.de/gewstg/__16.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 16 GewStG – Hebesatz – Gesetze im Internet
          </a>
          <a
            href="https://www.destatis.de/DE/Themen/Staat/Steuern/Steuereinnahmen/_inhalt.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Statistisches Bundesamt – durchschnittliche Hebesätze
          </a>
        </div>
      </div>
    </div>
  );
}

export default KoerperschaftsteuerRechner;
