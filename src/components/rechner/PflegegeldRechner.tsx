import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Pflegegeld 2025/2026 (keine Erhöhung 2026 - "Nullrunde")
const PFLEGEGELD = {
  1: 0,      // Kein Anspruch
  2: 347,
  3: 599,
  4: 800,
  5: 990,
};

// Pflegesachleistungen 2025/2026
const SACHLEISTUNGEN = {
  1: 0,      // Kein Anspruch
  2: 796,
  3: 1497,
  4: 1859,
  5: 2299,
};

// Weitere Leistungen
const ENTLASTUNGSBETRAG = 131; // monatlich, alle Pflegegrade inkl. PG 1
const PFLEGEHILFSMITTEL = 42;  // monatlich
const VERHINDERUNGSPFLEGE_JAHR = 1685; // jährlich (ab PG 2)
const KURZZEITPFLEGE_JAHR = 1854; // jährlich (ab PG 2)

// Tagespflege/Nachtpflege (eigenes Budget)
const TAGESPFLEGE = {
  1: 0,
  2: 721,
  3: 1357,
  4: 1685,
  5: 2085,
};

// Wohnraumanpassung
const WOHNRAUMANPASSUNG = 4180; // einmalig pro Maßnahme

// Beratungspflicht §37.3 SGB XI
const BERATUNGSPFLICHT = {
  2: 2, // 2x pro Jahr (halbjährlich)
  3: 2, // 2x pro Jahr (halbjährlich)
  4: 4, // 4x pro Jahr (vierteljährlich)
  5: 4, // 4x pro Jahr (vierteljährlich)
};

type Pflegegrad = 1 | 2 | 3 | 4 | 5;

export default function PflegegeldRechner() {
  const [pflegegrad, setPflegegrad] = useState<Pflegegrad>(2);
  const [nutztPflegedienst, setNutztPflegedienst] = useState(false);
  const [sachleistungsAnteil, setSachleistungsAnteil] = useState(50); // Prozent
  const [nutztTagespflege, setNutztTagespflege] = useState(false);

  const ergebnis = useMemo(() => {
    const pflegegeldVoll = PFLEGEGELD[pflegegrad];
    const sachleistungenVoll = SACHLEISTUNGEN[pflegegrad];
    const tagespflegeVoll = TAGESPFLEGE[pflegegrad];
    
    // Kombinationsleistung berechnen
    let pflegegeldAnteil = 100;
    let genutzeSachleistungen = 0;
    let restPflegegeld = pflegegeldVoll;
    
    if (nutztPflegedienst && pflegegrad >= 2) {
      // Wenn Sachleistungen genutzt werden, reduziert sich das Pflegegeld anteilig
      pflegegeldAnteil = 100 - sachleistungsAnteil;
      genutzeSachleistungen = (sachleistungenVoll * sachleistungsAnteil) / 100;
      restPflegegeld = (pflegegeldVoll * pflegegeldAnteil) / 100;
    }
    
    // Tagespflege ist ein separates Budget (wird nicht angerechnet)
    const tagespflegeLeistung = nutztTagespflege ? tagespflegeVoll : 0;
    
    // Jahressumme berechnen
    const pflegegeldJahr = restPflegegeld * 12;
    const sachleistungenJahr = genutzeSachleistungen * 12;
    const tagespflegeJahr = tagespflegeLeistung * 12;
    const entlastungJahr = ENTLASTUNGSBETRAG * 12;
    const hilfsmittelJahr = PFLEGEHILFSMITTEL * 12;
    
    // Zusätzliche Leistungen (nur ab PG 2)
    const verhinderungspflege = pflegegrad >= 2 ? VERHINDERUNGSPFLEGE_JAHR : 0;
    const kurzzeitpflege = pflegegrad >= 2 ? KURZZEITPFLEGE_JAHR : 0;
    const gemeinsamerJahresbetrag = verhinderungspflege + kurzzeitpflege; // 3.539 €
    
    // Gesamtsumme monatlich
    const gesamtMonatlich = restPflegegeld + genutzeSachleistungen + tagespflegeLeistung + ENTLASTUNGSBETRAG + PFLEGEHILFSMITTEL;
    
    // Gesamtsumme jährlich (inkl. Verhinderungs- und Kurzzeitpflege)
    const gesamtJaehrlich = pflegegeldJahr + sachleistungenJahr + tagespflegeJahr + entlastungJahr + hilfsmittelJahr + gemeinsamerJahresbetrag;
    
    // Beratungspflicht
    const beratungenProJahr = pflegegrad >= 2 ? BERATUNGSPFLICHT[pflegegrad as 2|3|4|5] : 0;
    
    return {
      pflegegrad,
      pflegegeldVoll,
      sachleistungenVoll,
      tagespflegeVoll,
      
      // Kombinationsleistung
      nutztPflegedienst,
      sachleistungsAnteil,
      pflegegeldAnteil,
      genutzeSachleistungen,
      restPflegegeld,
      
      // Tagespflege
      tagespflegeLeistung,
      
      // Fixe Leistungen
      entlastungsbetrag: ENTLASTUNGSBETRAG,
      pflegehilfsmittel: PFLEGEHILFSMITTEL,
      
      // Jährlich
      pflegegeldJahr,
      sachleistungenJahr,
      tagespflegeJahr,
      entlastungJahr,
      hilfsmittelJahr,
      verhinderungspflege,
      kurzzeitpflege,
      gemeinsamerJahresbetrag,
      wohnraumanpassung: WOHNRAUMANPASSUNG,
      
      // Gesamt
      gesamtMonatlich,
      gesamtJaehrlich,
      
      // Beratung
      beratungenProJahr,
    };
  }, [pflegegrad, nutztPflegedienst, sachleistungsAnteil, nutztTagespflege]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  const pflegegradBeschreibung: Record<Pflegegrad, string> = {
    1: 'Geringe Beeinträchtigung der Selbstständigkeit',
    2: 'Erhebliche Beeinträchtigung der Selbstständigkeit',
    3: 'Schwere Beeinträchtigung der Selbstständigkeit',
    4: 'Schwerste Beeinträchtigung der Selbstständigkeit',
    5: 'Schwerste Beeinträchtigung mit besonderen Anforderungen',
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Pflegegrad Auswahl */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Pflegegrad</span>
            <span className="text-xs text-gray-500 block mt-1">
              Wählen Sie den anerkannten Pflegegrad der pflegebedürftigen Person
            </span>
          </label>
          
          <div className="grid grid-cols-5 gap-2 mb-3">
            {([1, 2, 3, 4, 5] as Pflegegrad[]).map((pg) => (
              <button
                key={pg}
                onClick={() => setPflegegrad(pg)}
                className={`py-3 px-2 rounded-xl font-bold transition-all text-lg ${
                  pflegegrad === pg
                    ? 'bg-teal-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {pg}
              </button>
            ))}
          </div>
          
          <div className={`p-4 rounded-xl ${
            pflegegrad === 1 ? 'bg-amber-50 border border-amber-200' : 'bg-teal-50 border border-teal-200'
          }`}>
            <p className={`text-sm ${pflegegrad === 1 ? 'text-amber-700' : 'text-teal-700'}`}>
              <strong>Pflegegrad {pflegegrad}:</strong> {pflegegradBeschreibung[pflegegrad]}
            </p>
            {pflegegrad === 1 && (
              <p className="text-xs text-amber-600 mt-2">
                ⚠️ Bei Pflegegrad 1 besteht kein Anspruch auf Pflegegeld oder Pflegesachleistungen
              </p>
            )}
          </div>
        </div>

        {/* Pflegedienst nutzen? */}
        {pflegegrad >= 2 && (
          <div className="mb-6">
            <label className="block mb-3">
              <span className="text-gray-700 font-medium">Nutzen Sie einen ambulanten Pflegedienst?</span>
              <span className="text-xs text-gray-500 block mt-1">
                Kombinationsleistung: Pflegegeld + Sachleistungen
              </span>
            </label>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                onClick={() => setNutztPflegedienst(false)}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  !nutztPflegedienst
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Nein, nur Angehörige
              </button>
              <button
                onClick={() => setNutztPflegedienst(true)}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  nutztPflegedienst
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Ja, Pflegedienst
              </button>
            </div>
            
            {nutztPflegedienst && (
              <div className="bg-teal-50 rounded-xl p-4 mt-3">
                <label className="block mb-2">
                  <span className="text-sm text-teal-700 font-medium">
                    Anteil Sachleistungen (Pflegedienst): {sachleistungsAnteil}%
                  </span>
                  <span className="text-xs text-teal-600 block">
                    = {formatEuroRound((ergebnis.sachleistungenVoll * sachleistungsAnteil) / 100)} / Monat
                  </span>
                </label>
                <input
                  type="range"
                  value={sachleistungsAnteil}
                  onChange={(e) => setSachleistungsAnteil(Number(e.target.value))}
                  className="w-full accent-teal-500"
                  min="0"
                  max="100"
                  step="5"
                />
                <div className="flex justify-between text-xs text-teal-600 mt-1">
                  <span>0% (nur Pflegegeld)</span>
                  <span>100% (nur Sachleistungen)</span>
                </div>
                <p className="text-xs text-teal-600 mt-3">
                  💡 Verbleibendes Pflegegeld: {ergebnis.pflegegeldAnteil}% = {formatEuroRound(ergebnis.restPflegegeld)}/Monat
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tagespflege */}
        {pflegegrad >= 2 && (
          <div className="mb-6">
            <label className="block mb-3">
              <span className="text-gray-700 font-medium">Nutzen Sie Tages- oder Nachtpflege?</span>
              <span className="text-xs text-gray-500 block mt-1">
                Separates Budget – wird nicht auf Pflegegeld angerechnet
              </span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setNutztTagespflege(false)}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  !nutztTagespflege
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Nein
              </button>
              <button
                onClick={() => setNutztTagespflege(true)}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  nutztTagespflege
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Ja, {formatEuroRound(ergebnis.tagespflegeVoll)}/Monat
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">💶 Ihre monatlichen Pflegeleistungen</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroRound(ergebnis.gesamtMonatlich)}</span>
            <span className="text-xl opacity-80">pro Monat</span>
          </div>
          <p className="text-teal-100 mt-2 text-sm">
            Pflegegrad {pflegegrad} • {nutztPflegedienst ? 'Kombinationsleistung' : 'Pflegegeld'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Pflegegeld</span>
            <div className="text-xl font-bold">{formatEuroRound(ergebnis.restPflegegeld)}</div>
            {nutztPflegedienst && (
              <span className="text-xs text-teal-200">{ergebnis.pflegegeldAnteil}% von {formatEuroRound(ergebnis.pflegegeldVoll)}</span>
            )}
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Sachleistungen</span>
            <div className="text-xl font-bold">{formatEuroRound(ergebnis.genutzeSachleistungen)}</div>
            {nutztPflegedienst && (
              <span className="text-xs text-teal-200">{ergebnis.sachleistungsAnteil}% von {formatEuroRound(ergebnis.sachleistungenVoll)}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {nutztTagespflege && pflegegrad >= 2 && (
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <span className="text-xs opacity-80">Tagespflege</span>
              <div className="text-lg font-bold">{formatEuroRound(ergebnis.tagespflegeLeistung)}</div>
            </div>
          )}
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <span className="text-xs opacity-80">Entlastungsbetrag</span>
            <div className="text-lg font-bold">{formatEuroRound(ergebnis.entlastungsbetrag)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <span className="text-xs opacity-80">Pflegehilfsmittel</span>
            <div className="text-lg font-bold">{formatEuroRound(ergebnis.pflegehilfsmittel)}</div>
          </div>
        </div>
      </div>

      {/* Jahresübersicht */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📅 Jahresübersicht Pflegegrad {pflegegrad}</h3>
        
        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Monatliche Leistungen (×12)
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Pflegegeld</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.pflegegeldJahr)}</span>
          </div>
          
          {nutztPflegedienst && pflegegrad >= 2 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Pflegesachleistungen</span>
              <span className="text-gray-900">{formatEuro(ergebnis.sachleistungenJahr)}</span>
            </div>
          )}
          
          {nutztTagespflege && pflegegrad >= 2 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Tages-/Nachtpflege</span>
              <span className="text-gray-900">{formatEuro(ergebnis.tagespflegeJahr)}</span>
            </div>
          )}
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Entlastungsbetrag</span>
            <span className="text-gray-900">{formatEuro(ergebnis.entlastungJahr)}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Pflegehilfsmittel (Verbrauch)</span>
            <span className="text-gray-900">{formatEuro(ergebnis.hilfsmittelJahr)}</span>
          </div>
          
          {pflegegrad >= 2 && (
            <>
              <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
                Zusätzliche jährliche Leistungen
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">
                  Verhinderungspflege
                  <span className="text-xs text-gray-400 ml-1">(bis zu)</span>
                </span>
                <span className="text-gray-900">{formatEuro(ergebnis.verhinderungspflege)}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">
                  Kurzzeitpflege
                  <span className="text-xs text-gray-400 ml-1">(bis zu)</span>
                </span>
                <span className="text-gray-900">{formatEuro(ergebnis.kurzzeitpflege)}</span>
              </div>
              
              <div className="flex justify-between py-2 bg-purple-50 -mx-6 px-6">
                <span className="text-purple-700">
                  Gemeinsamer Jahresbetrag
                  <span className="text-xs text-purple-500 block">kombinierbar für beide Leistungen</span>
                </span>
                <span className="font-bold text-purple-900">{formatEuro(ergebnis.gemeinsamerJahresbetrag)}</span>
              </div>
            </>
          )}
          
          <div className="flex justify-between py-3 bg-teal-100 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-teal-800">Gesamtleistungen pro Jahr</span>
            <span className="font-bold text-2xl text-teal-900">{formatEuroRound(ergebnis.gesamtJaehrlich)}</span>
          </div>
        </div>
      </div>

      {/* Pflegegeld-Tabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Pflegegeld-Tabelle 2025/2026</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Pflegegrad</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Pflegegeld</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Sachleistungen</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Tagespflege</th>
              </tr>
            </thead>
            <tbody>
              {([1, 2, 3, 4, 5] as Pflegegrad[]).map((pg) => (
                <tr 
                  key={pg} 
                  className={`border-b border-gray-100 ${pflegegrad === pg ? 'bg-teal-50' : ''}`}
                >
                  <td className={`py-3 px-4 ${pflegegrad === pg ? 'font-bold text-teal-700' : 'text-gray-600'}`}>
                    Pflegegrad {pg}
                  </td>
                  <td className={`py-3 px-4 text-right ${pflegegrad === pg ? 'font-bold text-teal-700' : 'text-gray-900'}`}>
                    {PFLEGEGELD[pg] === 0 ? '—' : formatEuroRound(PFLEGEGELD[pg])}
                  </td>
                  <td className={`py-3 px-4 text-right ${pflegegrad === pg ? 'font-bold text-teal-700' : 'text-gray-900'}`}>
                    {SACHLEISTUNGEN[pg] === 0 ? '—' : formatEuroRound(SACHLEISTUNGEN[pg])}
                  </td>
                  <td className={`py-3 px-4 text-right ${pflegegrad === pg ? 'font-bold text-teal-700' : 'text-gray-900'}`}>
                    {TAGESPFLEGE[pg] === 0 ? '—' : formatEuroRound(TAGESPFLEGE[pg])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <p className="text-xs text-gray-500 mt-3">
          Stand: Januar 2025 (keine Erhöhung 2026). Nächste geplante Anpassung: 01.01.2028.
        </p>
      </div>

      {/* Beratungspflicht */}
      {pflegegrad >= 2 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-amber-800 mb-3">📋 Pflicht-Beratung nach § 37.3 SGB XI</h3>
          <div className="text-sm text-amber-700">
            <p className="mb-3">
              Als Pflegegeld-Empfänger müssen Sie <strong>{ergebnis.beratungenProJahr}× pro Jahr</strong> einen 
              kostenlosen Beratungsbesuch durchführen lassen:
            </p>
            <div className="bg-white/50 rounded-xl p-4">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">•</span>
                  <span><strong>Pflegegrad 2 oder 3:</strong> Einmal pro Halbjahr (2× im Jahr)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">•</span>
                  <span><strong>Pflegegrad 4 oder 5:</strong> Einmal pro Quartal (4× im Jahr)</span>
                </li>
              </ul>
            </div>
            <p className="mt-3 text-amber-600 text-xs">
              ⚠️ Bei Versäumnis kann das Pflegegeld zunächst um die Hälfte und bei wiederholtem Versäumnis ganz gekürzt werden.
            </p>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert das Pflegegeld</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Für häusliche Pflege:</strong> Pflegegeld erhalten Pflegebedürftige ab Pflegegrad 2, die zuhause von Angehörigen gepflegt werden</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Freie Verwendung:</strong> Das Pflegegeld wird an den Pflegebedürftigen ausgezahlt und kann frei verwendet oder an Pflegepersonen weitergegeben werden</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Kombinationsleistung:</strong> Pflegegeld kann mit ambulanten Pflegesachleistungen kombiniert werden – das Pflegegeld wird dann anteilig gekürzt</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Tagespflege separat:</strong> Das Budget für Tages-/Nachtpflege ist eigenständig und wird nicht auf das Pflegegeld angerechnet</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Steuerfrei:</strong> Das Pflegegeld ist steuerfrei und wird nicht auf Sozialleistungen angerechnet</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Rentenversicherung:</strong> Pflegepersonen werden in der Rentenversicherung versichert (bei mind. 10 Std./Woche Pflege)</span>
          </li>
        </ul>
      </div>

      {/* Weitere Leistungen */}
      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-teal-800 mb-3">📦 Weitere Pflegeleistungen</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-xl p-4">
            <h4 className="font-semibold text-teal-900">Entlastungsbetrag</h4>
            <p className="text-teal-700 text-2xl font-bold mt-1">{formatEuroRound(ENTLASTUNGSBETRAG)}/Monat</p>
            <p className="text-teal-600 text-xs mt-1">Für Betreuung & Haushaltshilfe (alle Pflegegrade)</p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <h4 className="font-semibold text-teal-900">Pflegehilfsmittel</h4>
            <p className="text-teal-700 text-2xl font-bold mt-1">{formatEuroRound(PFLEGEHILFSMITTEL)}/Monat</p>
            <p className="text-teal-600 text-xs mt-1">Für Verbrauchsmittel wie Handschuhe, Desinfektionsmittel</p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <h4 className="font-semibold text-teal-900">Verhinderungspflege</h4>
            <p className="text-teal-700 text-2xl font-bold mt-1">{formatEuroRound(VERHINDERUNGSPFLEGE_JAHR)}/Jahr</p>
            <p className="text-teal-600 text-xs mt-1">Wenn Pflegeperson verhindert ist (ab PG 2)</p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <h4 className="font-semibold text-teal-900">Kurzzeitpflege</h4>
            <p className="text-teal-700 text-2xl font-bold mt-1">{formatEuroRound(KURZZEITPFLEGE_JAHR)}/Jahr</p>
            <p className="text-teal-600 text-xs mt-1">Vorübergehende stationäre Pflege (ab PG 2)</p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:col-span-2">
            <h4 className="font-semibold text-teal-900">Wohnraumanpassung</h4>
            <p className="text-teal-700 text-2xl font-bold mt-1">{formatEuroRound(WOHNRAUMANPASSUNG)}</p>
            <p className="text-teal-600 text-xs mt-1">Einmalig pro Maßnahme (z.B. barrierefreies Bad)</p>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Antrag stellen:</strong> Pflegegeld muss bei der Pflegekasse beantragt werden – ein formloser Antrag genügt zunächst</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>MD-Begutachtung:</strong> Der Medizinische Dienst (MD) prüft den Pflegegrad bei einem Hausbesuch</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Rückwirkend:</strong> Leistungen werden ab Antragstellung gewährt, nicht ab Feststellung des Pflegegrads</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Höherstufung:</strong> Bei Verschlechterung kann ein Antrag auf Höherstufung gestellt werden</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Krankenhaus/Reha:</strong> Bei Krankenhausaufenthalt wird Pflegegeld bis zu 28 Tage weitergezahlt</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Widerspruch:</strong> Bei Ablehnung oder zu niedrigem Pflegegrad innerhalb eines Monats Widerspruch einlegen</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-teal-50 rounded-xl p-4">
            <p className="font-semibold text-teal-900">Ihre Pflegekasse</p>
            <p className="text-sm text-teal-700 mt-1">
              Die Pflegekasse ist immer an Ihre Krankenkasse angebunden. 
              Den Antrag stellen Sie dort – ein Anruf, E-Mail oder Brief genügt zunächst.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Pflegetelefon</p>
                <p className="text-gray-600">030 / 340 60 66 - 02</p>
                <p className="text-xs text-gray-500">Bundesministerium für Familie</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Informationsportal</p>
                <a 
                  href="https://www.bundesgesundheitsministerium.de/themen/pflege"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  BMG Pflegeinfos →
                </a>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-medium text-gray-800">Für den Antrag benötigen Sie:</p>
              <ul className="text-gray-600 mt-1 space-y-1">
                <li>• Versichertenkarte der pflegebedürftigen Person</li>
                <li>• Formloser Antrag auf Pflegeleistungen</li>
                <li>• Ggf. Vollmacht, wenn Sie für jemand anderen beantragen</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

            <RechnerFeedback rechnerName="Pflegegeld-Rechner 2025 & 2026" rechnerSlug="pflegegeld-rechner" />

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/sgb_11/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            SGB XI – Soziale Pflegeversicherung – Gesetze im Internet
          </a>
          <a 
            href="https://www.bundesgesundheitsministerium.de/themen/pflege/pflegeversicherung-leistungen"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesministerium für Gesundheit – Leistungen der Pflegeversicherung
          </a>
          <a 
            href="https://www.pflege.de/pflegekasse-pflegefinanzierung/pflegeleistungen/pflegegeld/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            pflege.de – Pflegegeld: Definition, Höhe & Voraussetzungen
          </a>
          <a 
            href="https://www.verbraucherzentrale.de/wissen/gesundheit-pflege/pflegeantrag-und-leistungen"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Verbraucherzentrale – Pflegeantrag und Leistungen
          </a>
        </div>
      </div>
    </div>
  );
}
