import { useState, useMemo } from 'react';

// Pendlerpauschale 2026 - Neue einheitliche Pauschale ab 01.01.2026!
// Quelle: https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/das-aendert-sich-2026.html
const PAUSCHALE_2026 = {
  km_einheitlich: 0.38,  // 38 Cent ab dem ERSTEN km (neu ab 2026!)
  arbeitstage_max: 230,  // Maximal anerkannte Arbeitstage
};

export default function PendlerpauschaleRechner() {
  const [entfernung, setEntfernung] = useState(25);
  const [arbeitstage, setArbeitstage] = useState(220);
  const [homeoffice, setHomeoffice] = useState(0);
  const [steuersatz, setSteuersatz] = useState(35);

  const ergebnis = useMemo(() => {
    const effektiveArbeitstage = Math.min(arbeitstage - homeoffice, PAUSCHALE_2026.arbeitstage_max);
    
    // NEU ab 2026: Einheitlich 38 Cent ab dem ERSTEN Kilometer!
    const pauschaleProTag = entfernung * PAUSCHALE_2026.km_einheitlich;
    
    const jahresPauschale = Math.round(pauschaleProTag * effektiveArbeitstage);
    
    // Werbungskostenpauschale (1.230 € in 2026 - unverändert)
    const werbungskostenpauschale = 1230;
    const ueberschuss = Math.max(0, jahresPauschale - werbungskostenpauschale);
    
    // Steuerersparnis (nur auf Überschuss)
    const steuerersparnis = Math.round(ueberschuss * (steuersatz / 100));
    
    // Auch wenn unter Pauschale: Steuerersparnis auf vollen Betrag wenn > Pauschale
    const effektiveErsparnis = jahresPauschale > werbungskostenpauschale 
      ? steuerersparnis 
      : 0;
    
    return {
      pauschaleProTag: Math.round(pauschaleProTag * 100) / 100,
      jahresPauschale,
      effektiveArbeitstage,
      werbungskostenpauschale,
      ueberschuss,
      steuerersparnis: effektiveErsparnis,
      lohntSich: jahresPauschale > werbungskostenpauschale,
    };
  }, [entfernung, arbeitstage, homeoffice, steuersatz]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Entfernung */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Einfache Entfernung zur Arbeit</span>
            <span className="text-xs text-gray-500 ml-2">(kürzeste Straßenverbindung)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={entfernung}
              onChange={(e) => setEntfernung(Math.max(1, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              min="1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">km</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={entfernung}
            onChange={(e) => setEntfernung(Number(e.target.value))}
            className="w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Arbeitstage */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Arbeitstage pro Jahr</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[200, 210, 220, 230].map((tage) => (
              <button
                key={tage}
                onClick={() => setArbeitstage(tage)}
                className={`py-3 rounded-xl font-bold transition-all ${
                  arbeitstage === tage
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tage}
              </button>
            ))}
          </div>
        </div>

        {/* Homeoffice */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Homeoffice-Tage pro Jahr</span>
            <span className="text-xs text-gray-500 ml-2">(abziehen von Arbeitstagen)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={homeoffice}
              onChange={(e) => setHomeoffice(Math.max(0, Math.min(arbeitstage, Number(e.target.value))))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              min="0"
              max={arbeitstage}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Tage</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            ℹ️ Homeoffice-Pauschale: 6 €/Tag (max. 1.260 €/Jahr) – wird separat geltend gemacht
          </p>
        </div>

        {/* Steuersatz */}
        <div>
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Dein Grenzsteuersatz</span>
            <span className="text-xs text-gray-500 ml-2">(ca. 25-42%)</span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="45"
              value={steuersatz}
              onChange={(e) => setSteuersatz(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="w-16 text-center font-bold text-xl text-blue-600">{steuersatz}%</span>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Deine Pendlerpauschale</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.jahresPauschale)}</span>
            <span className="text-xl text-blue-200">/ Jahr</span>
          </div>
          <p className="text-blue-100 mt-2">
            {ergebnis.effektiveArbeitstage} Tage × {ergebnis.pauschaleProTag.toFixed(2)} € = {formatEuro(ergebnis.jahresPauschale)}
          </p>
        </div>

        {ergebnis.lohntSich && (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">💰 Steuerersparnis (bei {steuersatz}%)</span>
              <span className="text-xl font-bold">ca. {formatEuro(ergebnis.steuerersparnis)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Aufschlüsselung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnung</h3>
        
        <div className="space-y-3 text-sm">
          {/* Ab 2026: Einheitlich 38 Cent pro km */}
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">{entfernung} km × 0,38 € × {ergebnis.effektiveArbeitstage} Tage</span>
            <span className="font-bold">{formatEuro(ergebnis.jahresPauschale)}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-200 bg-blue-50 -mx-6 px-6">
            <span className="font-medium">Pendlerpauschale gesamt</span>
            <span className="font-bold">{formatEuro(ergebnis.jahresPauschale)}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100 text-gray-500">
            <span>Werbungskostenpauschale (automatisch)</span>
            <span>− {formatEuro(ergebnis.werbungskostenpauschale)}</span>
          </div>
          
          <div className={`flex justify-between py-3 -mx-6 px-6 rounded-b-2xl ${
            ergebnis.lohntSich ? 'bg-green-50' : 'bg-yellow-50'
          }`}>
            <span className="font-bold">Zusätzlich absetzbar</span>
            <span className={`font-bold ${ergebnis.lohntSich ? 'text-green-600' : 'text-yellow-600'}`}>
              {ergebnis.lohntSich ? formatEuro(ergebnis.ueberschuss) : '0 € (unter Pauschale)'}
            </span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert's (2026)</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>🆕</span>
            <span><strong>38 Cent/km ab dem ersten Kilometer</strong> – neu seit 01.01.2026!</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Nur die <strong>einfache Strecke</strong> zählt (nicht Hin + Rück)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Max. <strong>230 Arbeitstage</strong> werden anerkannt</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Gilt unabhängig vom <strong>Verkehrsmittel</strong> (Auto, Bahn, Fahrrad...)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Werbungskostenpauschale</strong>: 1.230 € automatisch abgezogen</span>
          </li>
        </ul>
        <div className="mt-4 p-3 bg-green-50 rounded-xl text-sm">
          <p className="text-green-800">
            <strong>💡 Neu 2026:</strong> Die Erhöhung auf 38 Cent ab dem ersten Kilometer entlastet besonders Pendler mit kürzeren Strecken (unter 20 km) – eine Verbesserung gegenüber 2025!
          </p>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Wichtige Hinweise</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium text-yellow-800">Werbungskostenpauschale beachten!</p>
              <p className="text-yellow-700">Die ersten 1.230 € sind bereits durch die Pauschale abgedeckt. Nur darüber hinaus gibt's Steuerersparnis.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-medium text-green-800">Kürzeste Straßenverbindung</p>
              <p className="text-green-700">Das Finanzamt akzeptiert die kürzeste Straßenroute, nicht die schnellste. Google Maps hilft!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            Die Pendlerpauschale gibst du in der <strong>Steuererklärung</strong> an – genauer in der <strong>Anlage N</strong> (Werbungskosten).
          </p>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-medium text-blue-800">Finanzamt</p>
              <p className="text-blue-700">Dein zuständiges Finanzamt bearbeitet deine Steuererklärung. Du erreichst es am einfachsten über ELSTER.</p>
              <a 
                href="https://www.elster.de" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-block mt-1"
              >
                → www.elster.de (Online-Steuererklärung)
              </a>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Tipp: Viele Steuersoftware-Programme (z.B. WISO Steuer, Tax) berechnen die Pendlerpauschale automatisch.
          </p>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/das-aendert-sich-2026.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesfinanzministerium – Steuerliche Änderungen 2026
          </a>
          <a 
            href="https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/autokosten/pendlerpauschale/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            ADAC – Pendlerpauschale 2026
          </a>
          <a 
            href="https://www.vlh.de/presse/pressemitteilungen/fuenf-aenderungen-fuer-2026-mit-blick-auf-die-einkommensteuer.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            VLH – Fünf Steueränderungen 2026 (inkl. Pendlerpauschale)
          </a>
        </div>
      </div>
    </div>
  );
}
