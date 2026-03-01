import { useState, useMemo } from 'react';

// Überstundenzuschläge (branchenüblich, nicht gesetzlich vorgeschrieben)
const ZUSCHLAEGE = {
  normal: { label: 'Ohne Zuschlag (0%)', prozent: 0 },
  zuschlag25: { label: 'Normalzuschlag (25%)', prozent: 25 },
  zuschlag50: { label: 'Nacht-/Sonntagszuschlag (50%)', prozent: 50 },
  zuschlag100: { label: 'Feiertagszuschlag (100%)', prozent: 100 },
};

// Mindestlohn 2025
const MINDESTLOHN_2025 = 12.82;

export default function UeberstundenRechner() {
  // Eingabewerte
  const [stundenlohn, setStundenlohn] = useState(20);
  const [ueberstunden, setUeberstunden] = useState(10);
  const [zuschlagTyp, setZuschlagTyp] = useState<keyof typeof ZUSCHLAEGE>('zuschlag25');
  const [individuellerZuschlag, setIndividuellerZuschlag] = useState(25);
  const [nutzeIndividuell, setNutzeIndividuell] = useState(false);
  
  // Mehrere Überstunden-Kategorien
  const [mehrereStufen, setMehrereStufen] = useState(false);
  const [stufe1Stunden, setStufe1Stunden] = useState(5);
  const [stufe1Zuschlag, setStufe1Zuschlag] = useState(25);
  const [stufe2Stunden, setStufe2Stunden] = useState(5);
  const [stufe2Zuschlag, setStufe2Zuschlag] = useState(50);
  const [stufe3Stunden, setStufe3Stunden] = useState(0);
  const [stufe3Zuschlag, setStufe3Zuschlag] = useState(100);

  const ergebnis = useMemo(() => {
    // Aktueller Zuschlagssatz
    const zuschlagProzent = nutzeIndividuell 
      ? individuellerZuschlag 
      : ZUSCHLAEGE[zuschlagTyp].prozent;
    
    if (mehrereStufen) {
      // Berechnung mit mehreren Stufen
      const stufe1Betrag = stufe1Stunden * stundenlohn;
      const stufe1ZuschlagBetrag = stufe1Betrag * (stufe1Zuschlag / 100);
      const stufe1Gesamt = stufe1Betrag + stufe1ZuschlagBetrag;
      
      const stufe2Betrag = stufe2Stunden * stundenlohn;
      const stufe2ZuschlagBetrag = stufe2Betrag * (stufe2Zuschlag / 100);
      const stufe2Gesamt = stufe2Betrag + stufe2ZuschlagBetrag;
      
      const stufe3Betrag = stufe3Stunden * stundenlohn;
      const stufe3ZuschlagBetrag = stufe3Betrag * (stufe3Zuschlag / 100);
      const stufe3Gesamt = stufe3Betrag + stufe3ZuschlagBetrag;
      
      const gesamtStunden = stufe1Stunden + stufe2Stunden + stufe3Stunden;
      const grundbetrag = stufe1Betrag + stufe2Betrag + stufe3Betrag;
      const zuschlagBetrag = stufe1ZuschlagBetrag + stufe2ZuschlagBetrag + stufe3ZuschlagBetrag;
      const gesamtauszahlung = stufe1Gesamt + stufe2Gesamt + stufe3Gesamt;
      
      const durchschnittlicherStundenlohn = gesamtStunden > 0 
        ? gesamtauszahlung / gesamtStunden 
        : 0;
      
      return {
        mehrereStufen: true,
        stufen: [
          { stunden: stufe1Stunden, zuschlag: stufe1Zuschlag, betrag: stufe1Betrag, zuschlagBetrag: stufe1ZuschlagBetrag, gesamt: stufe1Gesamt },
          { stunden: stufe2Stunden, zuschlag: stufe2Zuschlag, betrag: stufe2Betrag, zuschlagBetrag: stufe2ZuschlagBetrag, gesamt: stufe2Gesamt },
          { stunden: stufe3Stunden, zuschlag: stufe3Zuschlag, betrag: stufe3Betrag, zuschlagBetrag: stufe3ZuschlagBetrag, gesamt: stufe3Gesamt },
        ],
        gesamtStunden,
        grundbetrag,
        zuschlagBetrag,
        gesamtauszahlung,
        durchschnittlicherStundenlohn,
        stundenlohn,
      };
    } else {
      // Einfache Berechnung
      const grundbetrag = ueberstunden * stundenlohn;
      const zuschlagBetrag = grundbetrag * (zuschlagProzent / 100);
      const gesamtauszahlung = grundbetrag + zuschlagBetrag;
      
      const stundenlohnMitZuschlag = stundenlohn * (1 + zuschlagProzent / 100);
      
      return {
        mehrereStufen: false,
        ueberstunden,
        stundenlohn,
        zuschlagProzent,
        grundbetrag,
        zuschlagBetrag,
        gesamtauszahlung,
        stundenlohnMitZuschlag,
      };
    }
  }, [stundenlohn, ueberstunden, zuschlagTyp, individuellerZuschlag, nutzeIndividuell, mehrereStufen, stufe1Stunden, stufe1Zuschlag, stufe2Stunden, stufe2Zuschlag, stufe3Stunden, stufe3Zuschlag]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatZahl = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <div className="max-w-2xl mx-auto">
      {/* Stundenlohn Input */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">💰 Ihr Brutto-Stundenlohn</h3>
        
        <div className="relative mb-4">
          <input
            type="number"
            value={stundenlohn}
            onChange={(e) => setStundenlohn(Math.max(0, Number(e.target.value)))}
            className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
            min="0"
            max="200"
            step="0.5"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€ / Std.</span>
        </div>
        
        <input
          type="range"
          value={stundenlohn}
          onChange={(e) => setStundenlohn(Number(e.target.value))}
          className="w-full accent-blue-500"
          min="10"
          max="80"
          step="0.5"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>10 €</span>
          <span>Mindestlohn: {formatEuro(MINDESTLOHN_2025)}</span>
          <span>80 €</span>
        </div>

        {stundenlohn < MINDESTLOHN_2025 && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            ⚠️ Dieser Stundenlohn liegt unter dem gesetzlichen Mindestlohn von {formatEuro(MINDESTLOHN_2025)}.
          </div>
        )}
      </div>

      {/* Überstunden Input */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">⏱️ Ihre Überstunden</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={mehrereStufen}
              onChange={(e) => setMehrereStufen(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Mehrere Zuschlagsstufen</span>
          </label>
        </div>

        {mehrereStufen ? (
          <div className="space-y-4">
            {/* Stufe 1 */}
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-blue-800">Stufe 1 – Normalzuschlag</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Stunden</label>
                  <input
                    type="number"
                    value={stufe1Stunden}
                    onChange={(e) => setStufe1Stunden(Math.max(0, Number(e.target.value)))}
                    className="w-full py-2 px-3 border border-gray-200 rounded-lg text-lg font-bold text-center"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Zuschlag %</label>
                  <input
                    type="number"
                    value={stufe1Zuschlag}
                    onChange={(e) => setStufe1Zuschlag(Math.max(0, Number(e.target.value)))}
                    className="w-full py-2 px-3 border border-gray-200 rounded-lg text-lg font-bold text-center"
                    min="0"
                    max="200"
                  />
                </div>
              </div>
            </div>

            {/* Stufe 2 */}
            <div className="bg-amber-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-amber-800">Stufe 2 – z.B. Nachtzuschlag</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Stunden</label>
                  <input
                    type="number"
                    value={stufe2Stunden}
                    onChange={(e) => setStufe2Stunden(Math.max(0, Number(e.target.value)))}
                    className="w-full py-2 px-3 border border-gray-200 rounded-lg text-lg font-bold text-center"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Zuschlag %</label>
                  <input
                    type="number"
                    value={stufe2Zuschlag}
                    onChange={(e) => setStufe2Zuschlag(Math.max(0, Number(e.target.value)))}
                    className="w-full py-2 px-3 border border-gray-200 rounded-lg text-lg font-bold text-center"
                    min="0"
                    max="200"
                  />
                </div>
              </div>
            </div>

            {/* Stufe 3 */}
            <div className="bg-red-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-red-800">Stufe 3 – z.B. Feiertagszuschlag</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Stunden</label>
                  <input
                    type="number"
                    value={stufe3Stunden}
                    onChange={(e) => setStufe3Stunden(Math.max(0, Number(e.target.value)))}
                    className="w-full py-2 px-3 border border-gray-200 rounded-lg text-lg font-bold text-center"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Zuschlag %</label>
                  <input
                    type="number"
                    value={stufe3Zuschlag}
                    onChange={(e) => setStufe3Zuschlag(Math.max(0, Number(e.target.value)))}
                    className="w-full py-2 px-3 border border-gray-200 rounded-lg text-lg font-bold text-center"
                    min="0"
                    max="200"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={() => setUeberstunden(Math.max(0, ueberstunden - 1))}
                className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-2xl font-bold transition-colors"
              >
                −
              </button>
              <div className="text-center">
                <input
                  type="number"
                  value={ueberstunden}
                  onChange={(e) => setUeberstunden(Math.max(0, Number(e.target.value)))}
                  className="w-24 text-4xl font-bold text-center border-none outline-none bg-transparent"
                  min="0"
                  max="200"
                />
                <div className="text-sm text-gray-500">Stunden</div>
              </div>
              <button
                onClick={() => setUeberstunden(Math.min(200, ueberstunden + 1))}
                className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-2xl font-bold transition-colors"
              >
                +
              </button>
            </div>

            <input
              type="range"
              value={ueberstunden}
              onChange={(e) => setUeberstunden(Number(e.target.value))}
              className="w-full accent-blue-500"
              min="0"
              max="50"
              step="1"
            />
            <div className="flex justify-center gap-2 mt-3">
              {[5, 10, 20, 30, 50].map((std) => (
                <button
                  key={std}
                  onClick={() => setUeberstunden(std)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    ueberstunden === std
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {std}h
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Zuschlag Auswahl (nur bei einfacher Berechnung) */}
      {!mehrereStufen && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">📊 Überstundenzuschlag</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            {Object.entries(ZUSCHLAEGE).map(([key, value]) => (
              <button
                key={key}
                onClick={() => {
                  setZuschlagTyp(key as keyof typeof ZUSCHLAEGE);
                  setNutzeIndividuell(false);
                }}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  !nutzeIndividuell && zuschlagTyp === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-bold text-lg text-gray-800">{value.prozent}%</div>
                <div className="text-xs text-gray-500">{value.label}</div>
              </button>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <label className="flex items-center gap-3 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={nutzeIndividuell}
                onChange={(e) => setNutzeIndividuell(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-gray-700 font-medium">Individueller Zuschlag</span>
            </label>
            
            {nutzeIndividuell && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={individuellerZuschlag}
                    onChange={(e) => setIndividuellerZuschlag(Math.max(0, Math.min(500, Number(e.target.value))))}
                    className="w-24 text-2xl font-bold text-center py-2 border border-gray-200 rounded-lg"
                    min="0"
                    max="500"
                  />
                  <span className="text-xl text-gray-600">%</span>
                </div>
                <input
                  type="range"
                  value={individuellerZuschlag}
                  onChange={(e) => setIndividuellerZuschlag(Number(e.target.value))}
                  className="w-full mt-3 accent-blue-500"
                  min="0"
                  max="200"
                  step="5"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">💵 Ihre Überstunden-Vergütung (brutto)</h3>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-5xl font-bold">{formatEuro(ergebnis.gesamtauszahlung)}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Grundvergütung</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.grundbetrag)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Zuschläge</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.zuschlagBetrag)}</div>
          </div>
        </div>

        {ergebnis.mehrereStufen ? (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Gesamtstunden</span>
            <div className="text-xl font-bold">{ergebnis.gesamtStunden} Stunden</div>
            <span className="text-xs opacity-70">
              Durchschnitt: {formatEuro(ergebnis.durchschnittlicherStundenlohn)} / Std.
            </span>
          </div>
        ) : (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Stundenlohn mit Zuschlag</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.stundenlohnMitZuschlag)}</div>
            <span className="text-xs opacity-70">
              {formatEuro(stundenlohn)} + {ergebnis.zuschlagProzent}% Zuschlag
            </span>
          </div>
        )}
      </div>

      {/* Detaillierte Berechnung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
        
        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Überstunden-Berechnung
          </div>
          
          {ergebnis.mehrereStufen ? (
            <>
              {ergebnis.stufen.filter(s => s.stunden > 0).map((stufe, idx) => (
                <div key={idx} className={`p-3 rounded-lg ${idx === 0 ? 'bg-blue-50' : idx === 1 ? 'bg-amber-50' : 'bg-red-50'}`}>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600">Stufe {idx + 1}: {stufe.stunden} Std. × {formatEuro(stundenlohn)}</span>
                    <span className="font-medium">{formatEuro(stufe.betrag)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600">+ {stufe.zuschlag}% Zuschlag</span>
                    <span className="font-medium text-green-600">+{formatEuro(stufe.zuschlagBetrag)}</span>
                  </div>
                  <div className="flex justify-between py-1 font-bold border-t border-gray-200 mt-1 pt-1">
                    <span>Zwischensumme Stufe {idx + 1}</span>
                    <span>{formatEuro(stufe.gesamt)}</span>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Überstunden</span>
                <span className="font-bold text-gray-900">{ueberstunden} Stunden</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Stundenlohn (brutto)</span>
                <span className="font-bold text-gray-900">{formatEuro(stundenlohn)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Grundvergütung ({ueberstunden} × {formatEuro(stundenlohn)})</span>
                <span className="text-gray-900">{formatEuro(ergebnis.grundbetrag)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Zuschlag {ergebnis.zuschlagProzent}%</span>
                <span className="text-green-600 font-medium">+{formatEuro(ergebnis.zuschlagBetrag)}</span>
              </div>
            </>
          )}
          
          <div className="flex justify-between py-3 bg-blue-50 -mx-6 px-6 mt-4">
            <span className="font-bold text-blue-800">Gesamtauszahlung (brutto)</span>
            <span className="font-bold text-2xl text-blue-900">{formatEuro(ergebnis.gesamtauszahlung)}</span>
          </div>
        </div>
      </div>

      {/* Formel-Erklärung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🔢 Formel: Überstunden berechnen</h3>
        
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-center font-mono text-lg text-gray-800 mb-2">
            Vergütung = Stunden × Stundenlohn × (1 + Zuschlag%)
          </p>
          <p className="text-center text-xs text-gray-500">
            Oder: Grundvergütung + (Grundvergütung × Zuschlag%)
          </p>
        </div>
        
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            <strong>Beispiel:</strong> Bei 10 Überstunden à 20 € mit 25% Zuschlag:
          </p>
          <p className="font-mono bg-blue-50 p-3 rounded-lg">
            10 × 20 € × 1,25 = <strong>250 €</strong>
            <br />
            <span className="text-gray-500 text-xs">Oder: 200 € Grundvergütung + 50 € Zuschlag</span>
          </p>
        </div>
      </div>

      {/* Vergleichstabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Zuschlag-Übersicht</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-600 font-medium">Zuschlagsart</th>
                <th className="text-right py-2 text-gray-600 font-medium">Zuschlag</th>
                <th className="text-right py-2 text-gray-600 font-medium">Stundenlohn</th>
                <th className="text-right py-2 text-gray-600 font-medium">Bei 10h</th>
              </tr>
            </thead>
            <tbody>
              {[0, 25, 50, 75, 100].map((zuschlag) => {
                const stundeMitZuschlag = stundenlohn * (1 + zuschlag / 100);
                const bei10h = stundeMitZuschlag * 10;
                const aktuellerZuschlag = nutzeIndividuell ? individuellerZuschlag : ZUSCHLAEGE[zuschlagTyp].prozent;
                return (
                  <tr 
                    key={zuschlag} 
                    className={`border-b border-gray-100 ${
                      !mehrereStufen && zuschlag === aktuellerZuschlag
                        ? 'bg-blue-50' 
                        : ''
                    }`}
                  >
                    <td className="py-2">{zuschlag === 0 ? 'Ohne' : zuschlag === 25 ? 'Normal' : zuschlag === 50 ? 'Nacht/Sonntag' : zuschlag === 75 ? 'Nacht Sonntag' : 'Feiertag'}</td>
                    <td className="py-2 text-right font-medium">{zuschlag}%</td>
                    <td className="py-2 text-right">{formatEuro(stundeMitZuschlag)}</td>
                    <td className="py-2 text-right font-bold text-gray-900">{formatEuro(bei10h)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          * Basierend auf Ihrem Stundenlohn von {formatEuro(stundenlohn)}
        </p>
      </div>

      {/* Rechtliche Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚖️ Rechtlicher Hintergrund</h3>
        <div className="space-y-3 text-sm text-amber-700">
          <p>
            <strong>Wichtig:</strong> Es gibt in Deutschland <strong>keinen gesetzlichen Anspruch</strong> auf Überstundenzuschläge! 
            Die Zuschläge ergeben sich aus:
          </p>
          <ul className="space-y-1 pl-4">
            <li>• <strong>Arbeitsvertrag</strong> – individuelle Vereinbarungen</li>
            <li>• <strong>Tarifvertrag</strong> – branchenspezifische Regelungen</li>
            <li>• <strong>Betriebsvereinbarung</strong> – unternehmensinterne Regeln</li>
          </ul>
          <p className="mt-3">
            <strong>ArbZG (Arbeitszeitgesetz):</strong> Regelt nur die <em>maximale</em> Arbeitszeit 
            (8h/Tag, ausnahmsweise 10h), nicht die Vergütung.
          </p>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Typische Überstundenzuschläge</h3>
        <div className="space-y-4 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">📊</span>
            <div>
              <strong className="text-blue-800">25% – Normalzuschlag</strong>
              <p>Üblich für reguläre Überstunden (Montag–Freitag, tagsüber)</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-amber-50 rounded-xl">
            <span className="text-xl">🌙</span>
            <div>
              <strong className="text-amber-800">50% – Nacht-/Sonntagszuschlag</strong>
              <p>Für Nachtarbeit (20–6 Uhr) und Sonntagsarbeit</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-red-50 rounded-xl">
            <span className="text-xl">🎉</span>
            <div>
              <strong className="text-red-800">100% – Feiertagszuschlag</strong>
              <p>Für Arbeit an gesetzlichen Feiertagen</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">💡</span>
            <div>
              <strong className="text-green-800">Steuerfrei nach §3b EStG</strong>
              <p>Bestimmte Zuschläge sind steuerfrei (z.B. Nacht 25%, Sonntag 50%, Feiertag 125%)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Arbeitszeitgesetz Info */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📚 Das Arbeitszeitgesetz (ArbZG)</h3>
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>⏰</span>
            <span><strong>Tägliche Arbeitszeit:</strong> Max. 8 Stunden, Verlängerung auf 10 Stunden möglich</span>
          </li>
          <li className="flex gap-2">
            <span>📅</span>
            <span><strong>Ausgleich:</strong> Innerhalb von 6 Monaten muss der Durchschnitt bei 8h/Tag liegen</span>
          </li>
          <li className="flex gap-2">
            <span>🛑</span>
            <span><strong>Ruhezeit:</strong> Mindestens 11 Stunden zwischen zwei Arbeitstagen</span>
          </li>
          <li className="flex gap-2">
            <span>☕</span>
            <span><strong>Pausen:</strong> Ab 6h: 30 Min., ab 9h: 45 Min. Pause</span>
          </li>
          <li className="flex gap-2">
            <span>📝</span>
            <span><strong>Aufzeichnung:</strong> Überstunden über 8h/Tag müssen dokumentiert werden</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Stellen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Beratung & Informationen</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Bürgertelefon Arbeitsrecht</p>
                <p className="text-lg font-bold">030 221 911 004</p>
                <p className="text-xs text-gray-500">BMAS Hotline</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">⚖️</span>
              <div>
                <p className="font-medium text-gray-800">Gewerkschaften</p>
                <a 
                  href="https://www.dgb.de/service/ratgeber/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  DGB Ratgeber →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">❓ Häufige Fragen</h3>
        <div className="space-y-4 text-sm">
          <details className="group">
            <summary className="flex justify-between items-center cursor-pointer p-3 bg-gray-50 rounded-xl font-medium">
              Muss mein Arbeitgeber Überstunden bezahlen?
              <span className="transition-transform group-open:rotate-180">▼</span>
            </summary>
            <p className="p-3 text-gray-600">
              Nicht automatisch. Überstunden müssen vom Arbeitgeber angeordnet oder geduldet sein. 
              Die Vergütung hängt vom Arbeitsvertrag ab – manche Verträge enthalten Pauschalklauseln 
              ("mit dem Gehalt abgegolten"), die aber oft unwirksam sind.
            </p>
          </details>
          
          <details className="group">
            <summary className="flex justify-between items-center cursor-pointer p-3 bg-gray-50 rounded-xl font-medium">
              Sind Überstundenzuschläge steuerfrei?
              <span className="transition-transform group-open:rotate-180">▼</span>
            </summary>
            <p className="p-3 text-gray-600">
              Nur bestimmte Zuschläge sind nach §3b EStG steuerfrei: Nachtarbeit (20–6 Uhr) bis 25%, 
              Sonntagsarbeit bis 50%, Feiertagsarbeit bis 125%. Der Grundlohn muss versteuert werden – 
              nur der Zuschlag kann steuerfrei sein.
            </p>
          </details>
          
          <details className="group">
            <summary className="flex justify-between items-center cursor-pointer p-3 bg-gray-50 rounded-xl font-medium">
              Kann ich statt Geld auch Freizeitausgleich bekommen?
              <span className="transition-transform group-open:rotate-180">▼</span>
            </summary>
            <p className="p-3 text-gray-600">
              Ja, wenn es im Arbeitsvertrag, Tarifvertrag oder einer Betriebsvereinbarung so geregelt ist. 
              Bei Freizeitausgleich entfällt die Steuerpflicht komplett. Der Zuschlag sollte aber 
              zusätzlich gewährt werden.
            </p>
          </details>
          
          <details className="group">
            <summary className="flex justify-between items-center cursor-pointer p-3 bg-gray-50 rounded-xl font-medium">
              Wie viele Überstunden sind erlaubt?
              <span className="transition-transform group-open:rotate-180">▼</span>
            </summary>
            <p className="p-3 text-gray-600">
              Nach dem Arbeitszeitgesetz darf die tägliche Arbeitszeit auf max. 10 Stunden ausgedehnt werden. 
              Innerhalb von 6 Monaten muss der Durchschnitt aber bei 8 Stunden liegen. Das bedeutet: 
              bei 5-Tage-Woche max. 48h/Woche, kurzzeitig bis 60h/Woche.
            </p>
          </details>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/arbzg/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Arbeitszeitgesetz (ArbZG) – Gesetze im Internet
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/estg/__3b.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            §3b EStG – Steuerfreie Zuschläge
          </a>
          <a 
            href="https://www.bmas.de/DE/Arbeit/Arbeitsrecht/arbeitsrecht.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesministerium für Arbeit und Soziales – Arbeitsrecht
          </a>
          <a 
            href="https://www.dgb.de/themen/++co++085c1fd2-467a-11df-77e8-00188b4dc422"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            DGB – Arbeitszeit und Überstunden
          </a>
        </div>
      </div>
    </div>
  );
}
