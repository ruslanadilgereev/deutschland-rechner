import { useState, useMemo } from 'react';

// Renten-Rechner 2026 - Quellen: Deutsche Rentenversicherung, BMAS
// Stand: Rentenwert ab 1. Juli 2025 (bundeseinheitlich)
const RENTEN_2026 = {
  rentenwert: 40.79,           // € pro Entgeltpunkt (ab 01.07.2025)
  durchschnittsentgelt: 51944, // € pro Jahr für 1 Entgeltpunkt (2026)
  beitragssatz: 18.6,          // % vom Bruttolohn (Arbeitnehmer + Arbeitgeber)
  beitragsbemessungsgrenze: 8050, // € pro Monat (West, 2026)
  rentenniveau: 48,            // % (Haltelinie)
  abschlagProMonat: 0.3,       // % Abzug pro Monat vor Regelaltersgrenze
  maxAbschlag: 14.4,           // % maximaler Abschlag (48 Monate × 0,3%)
  rentenartfaktorAltersrente: 1.0, // Faktor für normale Altersrente
};

// Regelaltersgrenze nach Geburtsjahr
function getRegelaltersgrenze(geburtsJahr: number): { jahre: number; monate: number } {
  if (geburtsJahr < 1947) return { jahre: 65, monate: 0 };
  if (geburtsJahr === 1947) return { jahre: 65, monate: 1 };
  if (geburtsJahr === 1948) return { jahre: 65, monate: 2 };
  if (geburtsJahr === 1949) return { jahre: 65, monate: 3 };
  if (geburtsJahr === 1950) return { jahre: 65, monate: 4 };
  if (geburtsJahr === 1951) return { jahre: 65, monate: 5 };
  if (geburtsJahr === 1952) return { jahre: 65, monate: 6 };
  if (geburtsJahr === 1953) return { jahre: 65, monate: 7 };
  if (geburtsJahr === 1954) return { jahre: 65, monate: 8 };
  if (geburtsJahr === 1955) return { jahre: 65, monate: 9 };
  if (geburtsJahr === 1956) return { jahre: 65, monate: 10 };
  if (geburtsJahr === 1957) return { jahre: 65, monate: 11 };
  if (geburtsJahr === 1958) return { jahre: 66, monate: 0 };
  if (geburtsJahr === 1959) return { jahre: 66, monate: 2 };
  if (geburtsJahr === 1960) return { jahre: 66, monate: 4 };
  if (geburtsJahr === 1961) return { jahre: 66, monate: 6 };
  if (geburtsJahr === 1962) return { jahre: 66, monate: 8 };
  if (geburtsJahr === 1963) return { jahre: 66, monate: 10 };
  return { jahre: 67, monate: 0 }; // Ab 1964
}

// Rente mit 63 (für langjährig Versicherte mit 45 Beitragsjahren)
function getRenteMit63Alter(geburtsJahr: number): { jahre: number; monate: number } | null {
  if (geburtsJahr < 1953) return { jahre: 63, monate: 0 };
  if (geburtsJahr === 1953) return { jahre: 63, monate: 2 };
  if (geburtsJahr === 1954) return { jahre: 63, monate: 4 };
  if (geburtsJahr === 1955) return { jahre: 63, monate: 6 };
  if (geburtsJahr === 1956) return { jahre: 63, monate: 8 };
  if (geburtsJahr === 1957) return { jahre: 63, monate: 10 };
  if (geburtsJahr === 1958) return { jahre: 64, monate: 0 };
  if (geburtsJahr === 1959) return { jahre: 64, monate: 2 };
  if (geburtsJahr === 1960) return { jahre: 64, monate: 4 };
  if (geburtsJahr === 1961) return { jahre: 64, monate: 6 };
  if (geburtsJahr === 1962) return { jahre: 64, monate: 8 };
  if (geburtsJahr === 1963) return { jahre: 64, monate: 10 };
  return { jahre: 65, monate: 0 }; // Ab 1964
}

interface RentenErgebnis {
  entgeltpunkte: number;
  regelaltersgrenze: { jahre: number; monate: number };
  renteMitRegelalter: number;
  renteMit63: { alter: { jahre: number; monate: number }; abschlag: number; rente: number } | null;
  fruehrente: { abschlag: number; rente: number; monateVorher: number } | null;
  durchschnittsentgeltAnteil: number;
}

function berechneRente(
  geburtsJahr: number,
  beitragsJahre: number,
  durchschnittsBrutto: number,
  hat45Beitragsjahre: boolean
): RentenErgebnis {
  // Entgeltpunkte berechnen
  // 1 Punkt = Durchschnittsverdienst eines Jahres
  const jahresentgelt = durchschnittsBrutto * 12;
  const entgeltpunkteProJahr = Math.min(jahresentgelt / RENTEN_2026.durchschnittsentgelt, 2.0); // Max ~2 EP/Jahr (BBG)
  const entgeltpunkte = entgeltpunkteProJahr * beitragsJahre;
  
  const durchschnittsentgeltAnteil = (jahresentgelt / RENTEN_2026.durchschnittsentgelt) * 100;
  
  // Regelaltersgrenze
  const regelaltersgrenze = getRegelaltersgrenze(geburtsJahr);
  
  // Rente mit Regelaltersgrenze (Zugangsfaktor = 1.0)
  const renteMitRegelalter = entgeltpunkte * 1.0 * RENTEN_2026.rentenwert * RENTEN_2026.rentenartfaktorAltersrente;
  
  // Rente mit 63 (nur bei 45 Beitragsjahren, ohne Abschläge)
  let renteMit63 = null;
  if (hat45Beitragsjahre) {
    const alterMit63 = getRenteMit63Alter(geburtsJahr);
    if (alterMit63) {
      renteMit63 = {
        alter: alterMit63,
        abschlag: 0, // Bei 45 Jahren: abschlagsfrei
        rente: entgeltpunkte * 1.0 * RENTEN_2026.rentenwert * RENTEN_2026.rentenartfaktorAltersrente,
      };
    }
  }
  
  // Frührente mit 63 (mit Abschlägen, bei mind. 35 Beitragsjahren)
  let fruehrente = null;
  if (beitragsJahre >= 35 && !hat45Beitragsjahre) {
    const regelalterMonate = regelaltersgrenze.jahre * 12 + regelaltersgrenze.monate;
    const fruehrenteMonate = 63 * 12;
    const monateVorher = Math.max(0, regelalterMonate - fruehrenteMonate);
    
    const abschlagProzent = Math.min(monateVorher * RENTEN_2026.abschlagProMonat, RENTEN_2026.maxAbschlag);
    const zugangsfaktor = 1 - (abschlagProzent / 100);
    
    fruehrente = {
      monateVorher,
      abschlag: abschlagProzent,
      rente: entgeltpunkte * zugangsfaktor * RENTEN_2026.rentenwert * RENTEN_2026.rentenartfaktorAltersrente,
    };
  }
  
  return {
    entgeltpunkte,
    regelaltersgrenze,
    renteMitRegelalter,
    renteMit63,
    fruehrente,
    durchschnittsentgeltAnteil,
  };
}

export default function RentenRechner() {
  const currentYear = new Date().getFullYear();
  const [geburtsJahr, setGeburtsJahr] = useState(1980);
  const [beitragsJahre, setBeitragsJahre] = useState(35);
  const [durchschnittsBrutto, setDurchschnittsBrutto] = useState(4000);
  const [hat45Beitragsjahre, setHat45Beitragsjahre] = useState(false);

  const ergebnis = useMemo(() => {
    return berechneRente(geburtsJahr, beitragsJahre, durchschnittsBrutto, hat45Beitragsjahre);
  }, [geburtsJahr, beitragsJahre, durchschnittsBrutto, hat45Beitragsjahre]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatAlter = (a: { jahre: number; monate: number }) => 
    a.monate > 0 ? `${a.jahre} Jahre + ${a.monate} Monate` : `${a.jahre} Jahre`;

  const aktuellesAlter = currentYear - geburtsJahr;
  const jahreeBisRente = Math.max(0, ergebnis.regelaltersgrenze.jahre - aktuellesAlter);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Geburtsjahr */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Geburtsjahr</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={geburtsJahr}
              onChange={(e) => setGeburtsJahr(Math.max(1940, Math.min(2010, Number(e.target.value))))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none"
              min="1940"
              max="2010"
            />
          </div>
          <input
            type="range"
            min="1940"
            max="2010"
            value={geburtsJahr}
            onChange={(e) => setGeburtsJahr(Number(e.target.value))}
            className="w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
          <p className="text-xs text-gray-500 mt-1 text-center">
            Aktuelles Alter: <strong>{aktuellesAlter} Jahre</strong>
          </p>
        </div>

        {/* Durchschnittliches Bruttogehalt */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Durchschnittliches Bruttogehalt</span>
            <span className="text-xs text-gray-500 ml-2">(pro Monat über Berufsleben)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={durchschnittsBrutto}
              onChange={(e) => setDurchschnittsBrutto(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none"
              min="0"
              step="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            min="1000"
            max="8000"
            step="100"
            value={durchschnittsBrutto}
            onChange={(e) => setDurchschnittsBrutto(Number(e.target.value))}
            className="w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
          <p className="text-xs text-gray-500 mt-1 text-center">
            ≈ <strong>{ergebnis.durchschnittsentgeltAnteil.toFixed(0)}%</strong> des Durchschnittsentgelts 
            ({RENTEN_2026.durchschnittsentgelt.toLocaleString('de-DE')} €/Jahr)
          </p>
        </div>

        {/* Beitragsjahre */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Voraussichtliche Beitragsjahre</span>
            <span className="text-xs text-gray-500 ml-2">(inkl. Ausbildung, Studium, Kindererziehung)</span>
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setBeitragsJahre(Math.max(5, beitragsJahre - 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-2xl font-bold"
            >
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-4xl font-bold text-gray-800">{beitragsJahre}</span>
              <span className="text-gray-500 ml-2">Jahre</span>
            </div>
            <button
              onClick={() => setBeitragsJahre(Math.min(50, beitragsJahre + 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-2xl font-bold"
            >
              +
            </button>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            value={beitragsJahre}
            onChange={(e) => setBeitragsJahre(Number(e.target.value))}
            className="w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
        </div>

        {/* 45 Beitragsjahre Option */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hat45Beitragsjahre}
              onChange={(e) => setHat45Beitragsjahre(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
            />
            <div>
              <span className="font-medium text-gray-800">45 Beitragsjahre erreicht?</span>
              <p className="text-xs text-gray-500">Für "Rente mit 63" ohne Abschläge (besonders langjährig Versicherte)</p>
            </div>
          </label>
        </div>
      </div>

      {/* Result Section - Hauptergebnis */}
      <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-teal-100 mb-1">
          Deine Rente mit {formatAlter(ergebnis.regelaltersgrenze)}
        </h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">
              {formatEuro(ergebnis.renteMitRegelalter)}
            </span>
            <span className="text-xl text-teal-200">/ Monat</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-teal-100 text-sm">Entgeltpunkte</p>
            <p className="text-2xl font-bold">{ergebnis.entgeltpunkte.toFixed(2)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-teal-100 text-sm">Rentenwert</p>
            <p className="text-2xl font-bold">{RENTEN_2026.rentenwert.toFixed(2)} €</p>
          </div>
        </div>

        {jahreeBisRente > 0 && (
          <p className="text-teal-100 text-sm mt-4 text-center">
            📅 Noch <strong>{jahreeBisRente} Jahre</strong> bis zur Regelaltersgrenze
          </p>
        )}
      </div>

      {/* Rentenformel */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📐 Rentenformel</h3>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-center text-sm text-gray-600 mb-2">Monatliche Bruttorente =</p>
          <div className="flex items-center justify-center gap-2 flex-wrap text-lg">
            <div className="bg-teal-100 px-3 py-2 rounded-lg">
              <span className="text-teal-800 font-bold">{ergebnis.entgeltpunkte.toFixed(2)}</span>
              <span className="text-xs text-teal-600 block">Entgeltpunkte</span>
            </div>
            <span className="text-gray-400">×</span>
            <div className="bg-blue-100 px-3 py-2 rounded-lg">
              <span className="text-blue-800 font-bold">1,0</span>
              <span className="text-xs text-blue-600 block">Zugangsfaktor</span>
            </div>
            <span className="text-gray-400">×</span>
            <div className="bg-purple-100 px-3 py-2 rounded-lg">
              <span className="text-purple-800 font-bold">{RENTEN_2026.rentenwert} €</span>
              <span className="text-xs text-purple-600 block">Rentenwert</span>
            </div>
            <span className="text-gray-400">×</span>
            <div className="bg-orange-100 px-3 py-2 rounded-lg">
              <span className="text-orange-800 font-bold">1,0</span>
              <span className="text-xs text-orange-600 block">Rentenartfaktor</span>
            </div>
          </div>
        </div>
      </div>

      {/* Frührente Optionen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">⏰ Frührente-Optionen</h3>
        <div className="space-y-4">
          {/* Rente mit 63 (45 Jahre) */}
          {ergebnis.renteMit63 && (
            <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎉</span>
                <div>
                  <p className="font-bold text-green-800">Rente mit {formatAlter(ergebnis.renteMit63.alter)}</p>
                  <p className="text-sm text-green-600">Besonders langjährig Versicherte (45 Jahre)</p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-green-700">Ohne Abschläge!</span>
                <span className="text-2xl font-bold text-green-800">{formatEuro(ergebnis.renteMit63.rente)}</span>
              </div>
            </div>
          )}

          {/* Frührente mit Abschlägen */}
          {ergebnis.fruehrente && (
            <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-bold text-yellow-800">Rente mit 63</p>
                  <p className="text-sm text-yellow-600">Langjährig Versicherte (35 Jahre)</p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-700">{ergebnis.fruehrente.monateVorher} Monate vor Regelaltersgrenze</span>
                  <span className="text-red-600 font-bold">-{ergebnis.fruehrente.abschlag.toFixed(1)}% Abschlag</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-700">Reduzierte Rente:</span>
                  <span className="text-2xl font-bold text-yellow-800">{formatEuro(ergebnis.fruehrente.rente)}</span>
                </div>
                <p className="text-xs text-yellow-600 mt-2">
                  Abschlag gilt <strong>lebenslang</strong> – {RENTEN_2026.abschlagProMonat}% pro Monat früher (max. {RENTEN_2026.maxAbschlag}%)
                </p>
              </div>
            </div>
          )}

          {beitragsJahre < 35 && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-600 text-sm">
                💡 <strong>Hinweis:</strong> Für Frührente mit 63 brauchst du mindestens 35 Beitragsjahre.
                Du hast aktuell {beitragsJahre} Jahre geplant.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Entgeltpunkte erklärt */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📊 So sammelst du Entgeltpunkte</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-teal-700">1.0</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Durchschnittsverdienst = 1 Punkt</p>
              <p className="text-sm text-gray-500">
                {RENTEN_2026.durchschnittsentgelt.toLocaleString('de-DE')} € brutto/Jahr (2026)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-700">~2.0</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Maximum pro Jahr</p>
              <p className="text-sm text-gray-500">
                Durch Beitragsbemessungsgrenze ({RENTEN_2026.beitragsbemessungsgrenze.toLocaleString('de-DE')} €/Monat)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-purple-700">{(ergebnis.entgeltpunkte / beitragsJahre).toFixed(2)}</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Dein Durchschnitt</p>
              <p className="text-sm text-gray-500">
                Punkte pro Jahr bei {durchschnittsBrutto.toLocaleString('de-DE')} € Brutto/Monat
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Zusätzliche Zeiten */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">➕ Anrechnungszeiten (zählen auch!)</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>👶</span>
            <span><strong>Kindererziehungszeiten:</strong> 3 Jahre pro Kind (ca. 3 Entgeltpunkte)</span>
          </li>
          <li className="flex gap-2">
            <span>🎓</span>
            <span><strong>Schulausbildung:</strong> Ab 17 Jahren (max. 8 Jahre, keine Punkte)</span>
          </li>
          <li className="flex gap-2">
            <span>📚</span>
            <span><strong>Studium:</strong> Anrechnungszeit ohne Punkte (zählt für Wartezeit)</span>
          </li>
          <li className="flex gap-2">
            <span>💼</span>
            <span><strong>Arbeitslosigkeit:</strong> Mit ALG I (80% des Bemessungsentgelts)</span>
          </li>
          <li className="flex gap-2">
            <span>🏥</span>
            <span><strong>Krankheit:</strong> Krankengeld zählt als Beitragszeit</span>
          </li>
          <li className="flex gap-2">
            <span>🪖</span>
            <span><strong>Wehrdienst/Zivildienst:</strong> Vollständig anerkannt</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-teal-50 rounded-xl p-4">
            <p className="font-semibold text-teal-900">Deutsche Rentenversicherung (DRV)</p>
            <p className="text-sm text-teal-700 mt-1">Zuständig für alle Fragen zur gesetzlichen Rente</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Servicetelefon</p>
                <a 
                  href="tel:08001000480"
                  className="text-blue-600 hover:underline font-bold"
                >
                  0800 1000 480
                </a>
                <p className="text-xs text-gray-500 mt-1">Kostenlos, Mo-Do 7:30-19:30, Fr 7:30-15:30</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Online-Dienste</p>
                <a 
                  href="https://www.deutsche-rentenversicherung.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  deutsche-rentenversicherung.de →
                </a>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-yellow-50 rounded-xl text-sm">
            <p className="text-yellow-800">
              💡 <strong>Tipp:</strong> Fordere deine persönliche <strong>Renteninformation</strong> an oder nutze den 
              kostenlosen <strong>Rentenbescheid</strong> ab 55 Jahren!
            </p>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Wichtige Hinweise</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">📈</span>
            <div>
              <p className="font-medium text-blue-800">Rentenwert steigt jährlich</p>
              <p className="text-blue-700">Der Rentenwert wird jedes Jahr zum 1. Juli angepasst (ca. 2-4% Steigerung).</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-orange-50 rounded-xl">
            <span className="text-xl">💰</span>
            <div>
              <p className="font-medium text-orange-800">Bruttorente ≠ Nettorente</p>
              <p className="text-orange-700">
                Abzüge: Krankenversicherung (~7,3%), Pflegeversicherung (~3,4%), ggf. Steuern.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-purple-50 rounded-xl">
            <span className="text-xl">🧮</span>
            <div>
              <p className="font-medium text-purple-800">Vereinfachte Berechnung</p>
              <p className="text-purple-700">
                Dies ist eine Prognose. Die tatsächliche Rente hängt von vielen Faktoren ab 
                (z.B. zukünftige Lohnentwicklung, Beitragsjahre).
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">📊</span>
            <div>
              <p className="font-medium text-green-800">Rentenniveau 48%</p>
              <p className="text-green-700">
                Die "Haltelinie" garantiert, dass die Standardrente mindestens 48% des Durchschnittseinkommens beträgt.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.deutsche-rentenversicherung.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsche Rentenversicherung – Offizielle Website
          </a>
          <a 
            href="https://www.bundesregierung.de/breg-de/aktuelles/rentenanpassung-2025-2337000"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesregierung – Rentenanpassung 2025
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/sgb_6/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            SGB VI – Gesetzliche Rentenversicherung
          </a>
        </div>
      </div>
    </div>
  );
}
