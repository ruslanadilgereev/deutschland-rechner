import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Frührente-Rechner 2026 - Quellen: Deutsche Rentenversicherung
// Stand: Aktuelle Regelaltersgrenzen nach SGB VI

const FRUEHRENTE_2026 = {
  abschlagProMonat: 0.3,       // % Abzug pro Monat vor Regelaltersgrenze
  maxAbschlag: 14.4,           // % maximaler Abschlag (48 Monate × 0,3%)
  fruehestesRentenalter: 63,   // Frühestmöglicher Rentenbeginn (mit 35 Beitragsjahren)
  durchschnittlicheRentenbezugsdauer: 20, // Jahre (statistische Annahme)
};

// Regelaltersgrenze nach Geburtsjahr (volle Tabelle ab 1947)
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

// Altersgrenze für abschlagsfreie Rente bei 45 Beitragsjahren (besonders langjährig Versicherte)
function getAlter45Jahre(geburtsJahr: number): { jahre: number; monate: number } {
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

interface FruehrenteErgebnis {
  regelaltersgrenze: { jahre: number; monate: number };
  gewuenschtesAlterMonate: number;
  regelalterMonate: number;
  monateVorRegelalter: number;
  abschlagProzent: number;
  renteMitAbschlag: number;
  rentenminderungProMonat: number;
  gesamtverlustProJahr: number;
  gesamtverlust20Jahre: number;
  istMoeglich: boolean;
  alter45Jahre: { jahre: number; monate: number };
  kannAbschlagsfrei: boolean;
}

function berechneFruehrente(
  geburtsJahr: number,
  gewuenschtesAlterJahre: number,
  gewuenschtesAlterMonate: number,
  erwarteteRente: number,
  hat45Beitragsjahre: boolean
): FruehrenteErgebnis {
  const regelaltersgrenze = getRegelaltersgrenze(geburtsJahr);
  const alter45Jahre = getAlter45Jahre(geburtsJahr);
  
  const regelalterMonate = regelaltersgrenze.jahre * 12 + regelaltersgrenze.monate;
  const gewuenschtMonate = gewuenschtesAlterJahre * 12 + gewuenschtesAlterMonate;
  const alter45JahreMonate = alter45Jahre.jahre * 12 + alter45Jahre.monate;
  
  // Prüfen ob gewünschtes Alter unter 63 liegt
  const istMoeglich = gewuenschtMonate >= 63 * 12;
  
  // Prüfen ob bei 45 Beitragsjahren abschlagsfrei möglich
  const kannAbschlagsfrei = hat45Beitragsjahre && gewuenschtMonate >= alter45JahreMonate;
  
  // Monate vor Regelaltersgrenze
  const monateVorRegelalter = Math.max(0, regelalterMonate - gewuenschtMonate);
  
  // Abschlag berechnen (nur wenn nicht abschlagsfrei)
  let abschlagProzent = 0;
  if (!kannAbschlagsfrei && monateVorRegelalter > 0) {
    abschlagProzent = Math.min(
      monateVorRegelalter * FRUEHRENTE_2026.abschlagProMonat,
      FRUEHRENTE_2026.maxAbschlag
    );
  }
  
  // Rente nach Abschlag
  const renteMitAbschlag = erwarteteRente * (1 - abschlagProzent / 100);
  const rentenminderungProMonat = erwarteteRente - renteMitAbschlag;
  
  // Gesamtverlust über Rentenbezugsdauer
  const gesamtverlustProJahr = rentenminderungProMonat * 12;
  const gesamtverlust20Jahre = gesamtverlustProJahr * FRUEHRENTE_2026.durchschnittlicheRentenbezugsdauer;
  
  return {
    regelaltersgrenze,
    gewuenschtesAlterMonate: gewuenschtMonate,
    regelalterMonate,
    monateVorRegelalter,
    abschlagProzent,
    renteMitAbschlag,
    rentenminderungProMonat,
    gesamtverlustProJahr,
    gesamtverlust20Jahre,
    istMoeglich,
    alter45Jahre,
    kannAbschlagsfrei,
  };
}

export default function FruehrenteRechner() {
  const currentYear = new Date().getFullYear();
  const [geburtsJahr, setGeburtsJahr] = useState(1965);
  const [gewuenschtesAlterJahre, setGewuenschtesAlterJahre] = useState(63);
  const [gewuenschtesAlterMonate, setGewuenschtesAlterMonate] = useState(0);
  const [erwarteteRente, setErwarteteRente] = useState(1800);
  const [hat45Beitragsjahre, setHat45Beitragsjahre] = useState(false);

  const ergebnis = useMemo(() => {
    return berechneFruehrente(
      geburtsJahr,
      gewuenschtesAlterJahre,
      gewuenschtesAlterMonate,
      erwarteteRente,
      hat45Beitragsjahre
    );
  }, [geburtsJahr, gewuenschtesAlterJahre, gewuenschtesAlterMonate, erwarteteRente, hat45Beitragsjahre]);

  const formatEuro = (n: number) => 
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  
  const formatAlter = (a: { jahre: number; monate: number }) => 
    a.monate > 0 ? `${a.jahre} Jahre + ${a.monate} Monate` : `${a.jahre} Jahre`;

  const aktuellesAlter = currentYear - geburtsJahr;

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
              onChange={(e) => setGeburtsJahr(Math.max(1950, Math.min(2000, Number(e.target.value))))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="1950"
              max="2000"
            />
          </div>
          <input
            type="range"
            min="1950"
            max="2000"
            value={geburtsJahr}
            onChange={(e) => setGeburtsJahr(Number(e.target.value))}
            className="w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Alter: <strong>{aktuellesAlter} Jahre</strong></span>
            <span>Regelaltersgrenze: <strong>{formatAlter(ergebnis.regelaltersgrenze)}</strong></span>
          </div>
        </div>

        {/* Gewünschtes Rentenalter */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Gewünschtes Rentenalter</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Jahre</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setGewuenschtesAlterJahre(Math.max(63, gewuenschtesAlterJahre - 1))}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-xl font-bold"
                >
                  −
                </button>
                <input
                  type="number"
                  value={gewuenschtesAlterJahre}
                  onChange={(e) => setGewuenschtesAlterJahre(Math.max(63, Math.min(70, Number(e.target.value))))}
                  className="flex-1 text-2xl font-bold text-center py-2 px-2 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                  min="63"
                  max="70"
                />
                <button
                  onClick={() => setGewuenschtesAlterJahre(Math.min(70, gewuenschtesAlterJahre + 1))}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-xl font-bold"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">+ Monate</label>
              <select
                value={gewuenschtesAlterMonate}
                onChange={(e) => setGewuenschtesAlterMonate(Number(e.target.value))}
                className="w-full text-xl font-bold text-center py-3 px-2 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((m) => (
                  <option key={m} value={m}>{m} Monate</option>
                ))}
              </select>
            </div>
          </div>
          {!ergebnis.istMoeglich && (
            <p className="text-red-600 text-sm mt-2">
              ⚠️ Frührente ist frühestens mit 63 Jahren möglich (mit 35 Beitragsjahren).
            </p>
          )}
        </div>

        {/* Erwartete Rente */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Erwartete monatliche Bruttorente</span>
            <span className="text-xs text-gray-500 ml-2">(lt. Renteninformation)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={erwarteteRente}
              onChange={(e) => setErwarteteRente(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            min="500"
            max="4000"
            step="50"
            value={erwarteteRente}
            onChange={(e) => setErwarteteRente(Number(e.target.value))}
            className="w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <p className="text-xs text-gray-500 mt-1 text-center">
            💡 Die erwartete Rente finden Sie in Ihrer jährlichen <strong>Renteninformation</strong>
          </p>
        </div>

        {/* 45 Beitragsjahre Option */}
        <div className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hat45Beitragsjahre}
              onChange={(e) => setHat45Beitragsjahre(e.target.checked)}
              className="w-5 h-5 mt-1 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <div>
              <span className="font-medium text-gray-800">Ich habe/werde 45 Beitragsjahre haben</span>
              <p className="text-sm text-gray-600 mt-1">
                Mit 45 Beitragsjahren können Sie als "besonders langjährig Versicherter" 
                <strong> ohne Abschläge</strong> vor der Regelaltersgrenze in Rente gehen.
              </p>
              {hat45Beitragsjahre && (
                <p className="text-sm text-orange-700 mt-2 font-medium">
                  ✓ Abschlagsfreie Rente ab {formatAlter(ergebnis.alter45Jahre)} möglich
                </p>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Result Section */}
      {ergebnis.istMoeglich && (
        <>
          {/* Hauptergebnis */}
          {ergebnis.kannAbschlagsfrei ? (
            // Abschlagsfrei mit 45 Jahren
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">🎉</span>
                <h3 className="text-xl font-bold">Abschlagsfrei in Rente!</h3>
              </div>
              
              <div className="mb-4">
                <p className="text-green-100 text-sm mb-1">Ihre Rente mit {gewuenschtesAlterJahre} Jahren {gewuenschtesAlterMonate > 0 ? `+ ${gewuenschtesAlterMonate} Monaten` : ''}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{formatEuro(erwarteteRente)}</span>
                  <span className="text-xl text-green-200">/ Monat</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-green-100 text-sm">
                  Als besonders langjährig Versicherter (45 Beitragsjahre) können Sie ab 
                  <strong> {formatAlter(ergebnis.alter45Jahre)}</strong> ohne Abschläge in Rente gehen – 
                  <strong> {Math.floor(ergebnis.regelalterMonate / 12 - ergebnis.alter45Jahre.jahre)} Jahre</strong> vor der Regelaltersgrenze!
                </p>
              </div>
            </div>
          ) : ergebnis.monateVorRegelalter > 0 ? (
            // Mit Abschlägen
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg p-6 text-white mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⚠️</span>
                <h3 className="text-sm font-medium text-orange-100">Frührente mit Abschlag</h3>
              </div>
              
              <div className="mb-4">
                <p className="text-orange-100 text-sm mb-1">Ihre Rente mit {gewuenschtesAlterJahre} Jahren {gewuenschtesAlterMonate > 0 ? `+ ${gewuenschtesAlterMonate} Monaten` : ''}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{formatEuro(ergebnis.renteMitAbschlag)}</span>
                  <span className="text-xl text-orange-200">/ Monat</span>
                </div>
                <p className="text-orange-200 text-sm mt-2">
                  statt {formatEuro(erwarteteRente)} (ohne Abschlag)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-orange-100 text-sm">Abschlag</p>
                  <p className="text-3xl font-bold">-{ergebnis.abschlagProzent.toFixed(1)}%</p>
                  <p className="text-orange-200 text-xs mt-1">{ergebnis.monateVorRegelalter} Monate × 0,3%</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-orange-100 text-sm">Minderung/Monat</p>
                  <p className="text-3xl font-bold">-{formatEuro(ergebnis.rentenminderungProMonat)}</p>
                  <p className="text-orange-200 text-xs mt-1">lebenslang</p>
                </div>
              </div>
            </div>
          ) : (
            // Regelaltersgrenze erreicht oder später
            <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">✅</span>
                <h3 className="text-xl font-bold">Reguläre Altersrente</h3>
              </div>
              
              <div className="mb-4">
                <p className="text-teal-100 text-sm mb-1">Ihre Rente mit {gewuenschtesAlterJahre} Jahren {gewuenschtesAlterMonate > 0 ? `+ ${gewuenschtesAlterMonate} Monaten` : ''}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{formatEuro(erwarteteRente)}</span>
                  <span className="text-xl text-teal-200">/ Monat</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-teal-100 text-sm">
                  Sie erreichen die Regelaltersgrenze mit <strong>{formatAlter(ergebnis.regelaltersgrenze)}</strong>. 
                  Ab dann gibt es keine Abschläge auf Ihre Rente.
                </p>
              </div>
            </div>
          )}

          {/* Gesamtverlust über Rentenbezugsdauer */}
          {ergebnis.monateVorRegelalter > 0 && !ergebnis.kannAbschlagsfrei && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">📊</span>
                Gesamtkosten der Frührente
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-xl border-l-4 border-red-400">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Rentenverlust pro Jahr</span>
                    <span className="text-xl font-bold text-red-600">-{formatEuro(ergebnis.gesamtverlustProJahr)}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatEuro(ergebnis.rentenminderungProMonat)} × 12 Monate
                  </p>
                </div>

                <div className="p-4 bg-red-100 rounded-xl border-l-4 border-red-500">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 font-medium">Gesamtverlust (20 Jahre)</span>
                    <span className="text-2xl font-bold text-red-700">-{formatEuro(ergebnis.gesamtverlust20Jahre)}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Bei durchschnittlicher Rentenbezugsdauer von 20 Jahren
                  </p>
                </div>

                <div className="p-3 bg-yellow-50 rounded-xl text-sm">
                  <p className="text-yellow-800">
                    💡 <strong>Hinweis:</strong> Der Abschlag von <strong>{ergebnis.abschlagProzent.toFixed(1)}%</strong> gilt 
                    <strong> lebenslang</strong> – auch nach Erreichen der Regelaltersgrenze!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Vergleichstabelle */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">📋</span>
              Ihre Optionen im Vergleich
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-2">Option</th>
                    <th className="text-right py-3 px-2">Alter</th>
                    <th className="text-right py-3 px-2">Abschlag</th>
                    <th className="text-right py-3 px-2">Rente/Monat</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Frühestmöglich mit 63 */}
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <span className="text-orange-600">⚡</span> Frühestmöglich
                    </td>
                    <td className="text-right py-3 px-2 font-medium">63 Jahre</td>
                    <td className="text-right py-3 px-2 text-red-600">
                      -{Math.min((ergebnis.regelalterMonate - 63 * 12) * 0.3, 14.4).toFixed(1)}%
                    </td>
                    <td className="text-right py-3 px-2 font-bold">
                      {formatEuro(erwarteteRente * (1 - Math.min((ergebnis.regelalterMonate - 63 * 12) * 0.3, 14.4) / 100))}
                    </td>
                  </tr>
                  
                  {/* Gewähltes Alter */}
                  {gewuenschtesAlterJahre !== 63 && (
                    <tr className="border-b border-gray-100 bg-orange-50">
                      <td className="py-3 px-2">
                        <span className="text-orange-600">👉</span> <strong>Ihre Wahl</strong>
                      </td>
                      <td className="text-right py-3 px-2 font-medium">
                        {gewuenschtesAlterJahre} J. {gewuenschtesAlterMonate > 0 ? `+ ${gewuenschtesAlterMonate} M.` : ''}
                      </td>
                      <td className="text-right py-3 px-2 text-red-600">
                        {ergebnis.kannAbschlagsfrei ? '0%' : `-${ergebnis.abschlagProzent.toFixed(1)}%`}
                      </td>
                      <td className="text-right py-3 px-2 font-bold">
                        {formatEuro(ergebnis.renteMitAbschlag)}
                      </td>
                    </tr>
                  )}
                  
                  {/* Mit 45 Beitragsjahren */}
                  {hat45Beitragsjahre && (
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <span className="text-green-600">🎉</span> 45 Beitragsjahre
                      </td>
                      <td className="text-right py-3 px-2 font-medium">{formatAlter(ergebnis.alter45Jahre)}</td>
                      <td className="text-right py-3 px-2 text-green-600 font-medium">0%</td>
                      <td className="text-right py-3 px-2 font-bold">{formatEuro(erwarteteRente)}</td>
                    </tr>
                  )}
                  
                  {/* Regelaltersgrenze */}
                  <tr className="border-b border-gray-100 bg-teal-50">
                    <td className="py-3 px-2">
                      <span className="text-teal-600">✓</span> Regelaltersgrenze
                    </td>
                    <td className="text-right py-3 px-2 font-medium">{formatAlter(ergebnis.regelaltersgrenze)}</td>
                    <td className="text-right py-3 px-2 text-green-600 font-medium">0%</td>
                    <td className="text-right py-3 px-2 font-bold">{formatEuro(erwarteteRente)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Regelaltersgrenze nach Jahrgang */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📅</span>
          Regelaltersgrenze nach Jahrgang
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3">Jahrgang</th>
                <th className="text-center py-2 px-3">Regelaltersgrenze</th>
                <th className="text-center py-2 px-3">45 Beitragsjahre</th>
                <th className="text-center py-2 px-3">Max. Abschlag*</th>
              </tr>
            </thead>
            <tbody>
              {[1959, 1960, 1961, 1962, 1963, 1964, 1965, 1966].map((jahr) => {
                const regel = getRegelaltersgrenze(jahr);
                const abschl = getAlter45Jahre(jahr);
                const maxAbschlag = Math.min((regel.jahre * 12 + regel.monate - 63 * 12) * 0.3, 14.4);
                const isSelected = jahr === geburtsJahr;
                return (
                  <tr 
                    key={jahr} 
                    className={`border-b border-gray-100 ${isSelected ? 'bg-orange-100 font-medium' : 'hover:bg-gray-50'}`}
                  >
                    <td className="py-2 px-3">{jahr}{isSelected ? ' ← Sie' : ''}</td>
                    <td className="text-center py-2 px-3">{formatAlter(regel)}</td>
                    <td className="text-center py-2 px-3">{formatAlter(abschl)}</td>
                    <td className="text-center py-2 px-3">{maxAbschlag.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          * Maximaler Abschlag bei Rente mit 63 Jahren (mit 35 Beitragsjahren)
        </p>
      </div>

      {/* So funktioniert der Abschlag */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🧮</span>
          So funktioniert der Abschlag
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-orange-50 rounded-xl">
            <p className="font-medium text-orange-800 mb-2">Die Formel:</p>
            <div className="bg-white rounded-lg p-3 text-center">
              <code className="text-lg">
                Abschlag = Monate vor Regelaltersgrenze × <strong>0,3%</strong>
              </code>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-gray-800">0,3%</p>
              <p className="text-sm text-gray-600">pro Monat früher</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-gray-800">3,6%</p>
              <p className="text-sm text-gray-600">pro Jahr früher</p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl">
              <p className="text-3xl font-bold text-red-600">14,4%</p>
              <p className="text-sm text-gray-600">max. Abschlag</p>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-blue-800">
              <strong>Beispiel Jahrgang 1964:</strong> Regelaltersgrenze ist 67 Jahre. 
              Bei Rente mit 63 = 48 Monate früher = 48 × 0,3% = <strong>14,4% Abschlag</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Voraussetzungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">✅</span>
          Voraussetzungen für Frührente
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-orange-50 rounded-xl border-l-4 border-orange-400">
            <p className="font-medium text-orange-800 mb-1">Langjährig Versicherte (mit Abschlag)</p>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Mindestens <strong>35 Versicherungsjahre</strong></li>
              <li>• Frühestens ab <strong>63 Jahren</strong></li>
              <li>• Abschlag: <strong>0,3% pro Monat</strong> vor Regelaltersgrenze</li>
            </ul>
          </div>
          
          <div className="p-4 bg-green-50 rounded-xl border-l-4 border-green-400">
            <p className="font-medium text-green-800 mb-1">Besonders langjährig Versicherte (ohne Abschlag)</p>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Mindestens <strong>45 Versicherungsjahre</strong></li>
              <li>• Ab Jahrgang 1964: <strong>ab 65 Jahren</strong> abschlagsfrei</li>
              <li>• Kein Abschlag auf die Rente!</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Was zählt zu den Beitragsjahren */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📝</span>
          Was zählt zu den Beitragsjahren?
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-xl">
            <p className="font-medium text-green-800 mb-2">✓ Zählt dazu:</p>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Pflichtbeiträge aus Beschäftigung</li>
              <li>• Freiwillige Beiträge</li>
              <li>• Kindererziehungszeiten</li>
              <li>• Pflegezeiten</li>
              <li>• Wehr-/Zivildienst</li>
              <li>• ALG I-Bezug</li>
              <li>• Krankengeld/Übergangsgeld</li>
            </ul>
          </div>
          <div className="p-4 bg-red-50 rounded-xl">
            <p className="font-medium text-red-800 mb-2">✗ Zählt NICHT für 45 Jahre:</p>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• ALG II / Bürgergeld</li>
              <li>• Schulzeiten</li>
              <li>• Studium</li>
              <li>• ALG I in den letzten 2 Jahren vor Rente*</li>
            </ul>
            <p className="text-xs text-red-600 mt-2">
              * Ausnahme: Insolvenz des Arbeitgebers
            </p>
          </div>
        </div>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🏛️</span>
          Beratung & Ansprechpartner
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-teal-50 rounded-xl">
            <p className="font-semibold text-teal-900 mb-2">Deutsche Rentenversicherung (DRV)</p>
            <p className="text-sm text-teal-700">
              Die DRV berät Sie kostenlos zu allen Fragen rund um Ihre Rente – 
              auch zur Frührente und den Auswirkungen von Abschlägen.
            </p>
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
                  0800 1000 4800
                </a>
                <p className="text-xs text-gray-500 mt-1">Kostenlos, Mo-Do 7:30-19:30</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Online-Rechner der DRV</p>
                <a 
                  href="https://www.deutsche-rentenversicherung.de/DRV/DE/Online-Services/Online-Rechner/RentenbeginnUndHoehenRechner/rentenbeginnrechner_node.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Rentenbeginn-Rechner →
                </a>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-yellow-50 rounded-xl text-sm">
            <p className="text-yellow-800">
              💡 <strong>Tipp:</strong> Vereinbaren Sie einen kostenlosen Beratungstermin 
              bei Ihrer nächsten <strong>Auskunfts- und Beratungsstelle</strong> der DRV!
            </p>
          </div>
        </div>
      </div>

            <RechnerFeedback rechnerName="Frührente-Rechner 2025 & 2026" rechnerSlug="fruehrente-rechner" />

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Kurz-vor-der-Rente/Wann-kann-ich-in-Rente-gehen/Wann-kann-ich-in-Rente-gehen_detailseite.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsche Rentenversicherung – Wann kann ich in Rente gehen?
          </a>
          <a 
            href="https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Allgemeine-Informationen/Rentenarten-und-Leistungen/Altersrente-fuer-langjaehrig-Versicherte/Altersrente_fuer_langjaehrig_Versicherte.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsche Rentenversicherung – Altersrente für langjährig Versicherte
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/sgb_6/__77.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 77 SGB VI – Zugangsfaktor
          </a>
        </div>
      </div>
    </div>
  );
}
