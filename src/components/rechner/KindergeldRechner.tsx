import { useState } from 'react';

// Kindergeld 2026 (ab Januar 2026)
// Quelle: https://www.arbeitsagentur.de/familie-und-kinder/infos-rund-um-kindergeld/kindergeld-anspruch-hoehe-dauer
const KINDERGELD_PRO_KIND = 259; // € pro Kind pro Monat (2026)

export default function KindergeldRechner() {
  const [anzahlKinder, setAnzahlKinder] = useState(1);
  
  const monatlich = anzahlKinder * KINDERGELD_PRO_KIND;
  const jaehrlich = monatlich * 12;

  return (
    <div className="max-w-lg mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block mb-4">
          <span className="text-gray-700 font-medium">Anzahl Kinder</span>
          <div className="mt-3 flex items-center justify-center gap-6">
            <button
              onClick={() => setAnzahlKinder(Math.max(1, anzahlKinder - 1))}
              className="w-14 h-14 rounded-full bg-gray-100 text-2xl font-bold text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
              disabled={anzahlKinder <= 1}
            >
              −
            </button>
            <span className="text-5xl font-bold text-blue-600 w-20 text-center">
              {anzahlKinder}
            </span>
            <button
              onClick={() => setAnzahlKinder(Math.min(10, anzahlKinder + 1))}
              className="w-14 h-14 rounded-full bg-blue-500 text-2xl font-bold text-white hover:bg-blue-600 active:scale-95 transition-all"
            >
              +
            </button>
          </div>
        </label>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Dein Kindergeld</h3>
        
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{monatlich.toLocaleString('de-DE')}</span>
            <span className="text-xl text-blue-200">€ / Monat</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <span className="text-blue-100">Pro Jahr</span>
            <span className="text-xl font-bold">{jaehrlich.toLocaleString('de-DE')} €</span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert's</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>259 € pro Kind</strong> pro Monat (Stand: 2026)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Gilt für <strong>alle Kinder gleich</strong> (keine Staffelung mehr)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Anspruch bis zum <strong>18. Lebensjahr</strong> (in Ausbildung bis 25)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Auszahlung durch die <strong>Familienkasse</strong></span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="font-semibold text-blue-900">Familienkasse der Bundesagentur für Arbeit</p>
            <p className="text-sm text-blue-700 mt-1">Bundesweit einheitlich zuständig – unabhängig vom Bundesland</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Kindergeld-Hotline</p>
                <a href="tel:08004555530" className="text-blue-600 hover:underline font-mono">0800 4 555530</a>
                <p className="text-xs text-gray-500 mt-1">Kostenfrei · Mo–Fr 8–18 Uhr</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Online-Antrag</p>
                <a 
                  href="https://www.arbeitsagentur.de/familie-und-kinder/infos-rund-um-kindergeld/kindergeld-anspruch-hoehe-dauer/kindergeld-antrag-starten" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Jetzt beantragen →
                </a>
                <p className="text-xs text-gray-500 mt-1">Digital mit BundID</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">📍</span>
            <div>
              <p className="font-medium text-gray-800">Familienkasse vor Ort finden</p>
              <a 
                href="https://www.arbeitsagentur.de/ueber-uns/familienkasse-der-ba" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Standortsuche öffnen →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Wichtige Hinweise</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium text-yellow-800">Antrag erforderlich!</p>
              <p className="text-yellow-700">Kindergeld wird nicht automatisch gezahlt – du musst es bei der Familienkasse beantragen.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-medium text-green-800">Rückwirkend beantragbar</p>
              <p className="text-green-700">Bis zu 6 Monate rückwirkend ab Antragstellung.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">📄</span>
            <div>
              <p className="font-medium text-blue-800">Benötigte Unterlagen</p>
              <p className="text-blue-700">Geburtsurkunde des Kindes, Steuer-ID (Kind + Eltern), ggf. Ausbildungsnachweis ab 18.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.arbeitsagentur.de/familie-und-kinder/infos-rund-um-kindergeld/kindergeld-anspruch-hoehe-dauer"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesagentur für Arbeit – Kindergeld 2026
          </a>
          <a 
            href="https://familienportal.de/familienportal/familienleistungen/kindergeld"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Familienportal der Bundesregierung – Kindergeld
          </a>
        </div>
      </div>
    </div>
  );
}
