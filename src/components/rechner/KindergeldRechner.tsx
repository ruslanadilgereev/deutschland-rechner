import { useState } from 'react';

// Kindergeld 2025 (ab Januar 2025)
// Quelle: https://www.arbeitsagentur.de/familie-und-kinder/kindergeld-anspruch-hoehe-dauer
const KINDERGELD_PRO_KIND = 255; // € pro Kind pro Monat (2025)

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
            <span><strong>255 € pro Kind</strong> pro Monat (Stand: 2025)</span>
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

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <a 
          href="https://www.arbeitsagentur.de/familie-und-kinder/kindergeld-anspruch-hoehe-dauer"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline break-all"
        >
          Bundesagentur für Arbeit – Kindergeld 2025
        </a>
      </div>
    </div>
  );
}
