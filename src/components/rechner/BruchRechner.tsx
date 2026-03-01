import { useState, useMemo } from 'react';

type Operation = 'addieren' | 'subtrahieren' | 'multiplizieren' | 'dividieren';

const OPERATIONEN = [
  {
    id: 'addieren' as const,
    icon: '➕',
    title: 'Addieren',
    symbol: '+',
    beispiel: '1/2 + 1/4 = 3/4'
  },
  {
    id: 'subtrahieren' as const,
    icon: '➖',
    title: 'Subtrahieren',
    symbol: '−',
    beispiel: '3/4 − 1/4 = 1/2'
  },
  {
    id: 'multiplizieren' as const,
    icon: '✖️',
    title: 'Multiplizieren',
    symbol: '×',
    beispiel: '1/2 × 2/3 = 1/3'
  },
  {
    id: 'dividieren' as const,
    icon: '➗',
    title: 'Dividieren',
    symbol: '÷',
    beispiel: '1/2 ÷ 1/4 = 2'
  }
];

// Größter gemeinsamer Teiler (ggT) mit Euklid
function ggt(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

// Kleinstes gemeinsames Vielfaches (kgV)
function kgv(a: number, b: number): number {
  return Math.abs(a * b) / ggt(a, b);
}

// Bruch kürzen
function kuerzen(zaehler: number, nenner: number): { zaehler: number; nenner: number } {
  if (nenner === 0) return { zaehler: 0, nenner: 0 };
  const teiler = ggt(zaehler, nenner);
  let z = zaehler / teiler;
  let n = nenner / teiler;
  // Negatives Vorzeichen immer im Zähler
  if (n < 0) {
    z = -z;
    n = -n;
  }
  return { zaehler: z, nenner: n };
}

// Bruch als String formatieren
function bruchAlsString(zaehler: number, nenner: number): string {
  if (nenner === 0) return 'undefiniert';
  if (zaehler === 0) return '0';
  if (nenner === 1) return zaehler.toString();
  return `${zaehler}/${nenner}`;
}

export default function BruchRechner() {
  const [operation, setOperation] = useState<Operation>('addieren');
  
  // Erster Bruch
  const [zaehler1, setZaehler1] = useState(1);
  const [nenner1, setNenner1] = useState(2);
  
  // Zweiter Bruch
  const [zaehler2, setZaehler2] = useState(1);
  const [nenner2, setNenner2] = useState(4);

  const ergebnis = useMemo(() => {
    // Prüfe auf Division durch 0
    if (nenner1 === 0 || nenner2 === 0) {
      return {
        zaehler: 0,
        nenner: 0,
        dezimal: NaN,
        fehler: 'Nenner darf nicht 0 sein',
        schritte: []
      };
    }
    
    if (operation === 'dividieren' && zaehler2 === 0) {
      return {
        zaehler: 0,
        nenner: 0,
        dezimal: NaN,
        fehler: 'Division durch 0 nicht möglich',
        schritte: []
      };
    }

    let ergebnisZaehler: number;
    let ergebnisNenner: number;
    let schritte: { text: string; rechnung?: string; ergebnis?: string }[] = [];

    switch (operation) {
      case 'addieren': {
        // Hauptnenner finden
        const hauptnenner = kgv(nenner1, nenner2);
        const faktor1 = hauptnenner / nenner1;
        const faktor2 = hauptnenner / nenner2;
        const erweiterterZ1 = zaehler1 * faktor1;
        const erweiterterZ2 = zaehler2 * faktor2;
        ergebnisZaehler = erweiterterZ1 + erweiterterZ2;
        ergebnisNenner = hauptnenner;
        
        schritte = [
          { text: '1. Hauptnenner finden (kgV):' },
          { rechnung: `kgV(${nenner1}, ${nenner2}) = ${hauptnenner}` },
          { text: '2. Brüche erweitern:' },
          { rechnung: `${zaehler1}/${nenner1} = ${erweiterterZ1}/${hauptnenner}` },
          { rechnung: `${zaehler2}/${nenner2} = ${erweiterterZ2}/${hauptnenner}` },
          { text: '3. Zähler addieren:' },
          { rechnung: `${erweiterterZ1} + ${erweiterterZ2} = ${ergebnisZaehler}` },
          { text: '4. Ergebnis:' },
          { ergebnis: bruchAlsString(ergebnisZaehler, ergebnisNenner) }
        ];
        break;
      }
      
      case 'subtrahieren': {
        const hauptnenner = kgv(nenner1, nenner2);
        const faktor1 = hauptnenner / nenner1;
        const faktor2 = hauptnenner / nenner2;
        const erweiterterZ1 = zaehler1 * faktor1;
        const erweiterterZ2 = zaehler2 * faktor2;
        ergebnisZaehler = erweiterterZ1 - erweiterterZ2;
        ergebnisNenner = hauptnenner;
        
        schritte = [
          { text: '1. Hauptnenner finden (kgV):' },
          { rechnung: `kgV(${nenner1}, ${nenner2}) = ${hauptnenner}` },
          { text: '2. Brüche erweitern:' },
          { rechnung: `${zaehler1}/${nenner1} = ${erweiterterZ1}/${hauptnenner}` },
          { rechnung: `${zaehler2}/${nenner2} = ${erweiterterZ2}/${hauptnenner}` },
          { text: '3. Zähler subtrahieren:' },
          { rechnung: `${erweiterterZ1} − ${erweiterterZ2} = ${ergebnisZaehler}` },
          { text: '4. Ergebnis:' },
          { ergebnis: bruchAlsString(ergebnisZaehler, ergebnisNenner) }
        ];
        break;
      }
      
      case 'multiplizieren': {
        ergebnisZaehler = zaehler1 * zaehler2;
        ergebnisNenner = nenner1 * nenner2;
        
        schritte = [
          { text: '1. Zähler multiplizieren:' },
          { rechnung: `${zaehler1} × ${zaehler2} = ${ergebnisZaehler}` },
          { text: '2. Nenner multiplizieren:' },
          { rechnung: `${nenner1} × ${nenner2} = ${ergebnisNenner}` },
          { text: '3. Ergebnis:' },
          { ergebnis: bruchAlsString(ergebnisZaehler, ergebnisNenner) }
        ];
        break;
      }
      
      case 'dividieren': {
        // Division = Multiplikation mit Kehrwert
        ergebnisZaehler = zaehler1 * nenner2;
        ergebnisNenner = nenner1 * zaehler2;
        
        schritte = [
          { text: '1. Kehrwert des zweiten Bruchs:' },
          { rechnung: `${zaehler2}/${nenner2} → ${nenner2}/${zaehler2}` },
          { text: '2. Mit Kehrwert multiplizieren:' },
          { rechnung: `${zaehler1}/${nenner1} × ${nenner2}/${zaehler2}` },
          { text: '3. Zähler multiplizieren:' },
          { rechnung: `${zaehler1} × ${nenner2} = ${ergebnisZaehler}` },
          { text: '4. Nenner multiplizieren:' },
          { rechnung: `${nenner1} × ${zaehler2} = ${ergebnisNenner}` },
          { text: '5. Ergebnis:' },
          { ergebnis: bruchAlsString(ergebnisZaehler, ergebnisNenner) }
        ];
        break;
      }
    }

    // Bruch kürzen
    const gekuerzt = kuerzen(ergebnisZaehler, ergebnisNenner);
    
    // Prüfe ob gekürzt wurde
    const wurdeGekuerzt = gekuerzt.zaehler !== ergebnisZaehler || gekuerzt.nenner !== ergebnisNenner;
    
    if (wurdeGekuerzt && gekuerzt.nenner !== 0) {
      const teiler = ggt(Math.abs(ergebnisZaehler), Math.abs(ergebnisNenner));
      schritte.push({ text: '5. Kürzen (ggT ermitteln):' });
      schritte.push({ rechnung: `ggT(${Math.abs(ergebnisZaehler)}, ${Math.abs(ergebnisNenner)}) = ${teiler}` });
      schritte.push({ text: '6. Gekürzt:' });
      schritte.push({ ergebnis: bruchAlsString(gekuerzt.zaehler, gekuerzt.nenner) });
    }

    const dezimal = gekuerzt.nenner !== 0 ? gekuerzt.zaehler / gekuerzt.nenner : NaN;

    return {
      zaehler: gekuerzt.zaehler,
      nenner: gekuerzt.nenner,
      ungekuerztZaehler: ergebnisZaehler,
      ungekuerztNenner: ergebnisNenner,
      wurdeGekuerzt,
      dezimal,
      fehler: null,
      schritte
    };
  }, [operation, zaehler1, nenner1, zaehler2, nenner2]);

  // Einzelnen Bruch kürzen (für Anzeige)
  const bruch1Gekuerzt = useMemo(() => {
    if (nenner1 === 0) return null;
    const gekuerzt = kuerzen(zaehler1, nenner1);
    const istGekuerzt = gekuerzt.zaehler === zaehler1 && gekuerzt.nenner === nenner1;
    return { ...gekuerzt, istGekuerzt };
  }, [zaehler1, nenner1]);

  const bruch2Gekuerzt = useMemo(() => {
    if (nenner2 === 0) return null;
    const gekuerzt = kuerzen(zaehler2, nenner2);
    const istGekuerzt = gekuerzt.zaehler === zaehler2 && gekuerzt.nenner === nenner2;
    return { ...gekuerzt, istGekuerzt };
  }, [zaehler2, nenner2]);

  const opSymbol = OPERATIONEN.find(o => o.id === operation)?.symbol || '+';

  return (
    <div className="max-w-lg mx-auto">
      {/* Operation Auswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block text-gray-700 font-medium mb-3">Rechenart</label>
        <div className="grid grid-cols-2 gap-3">
          {OPERATIONEN.map((op) => (
            <button
              key={op.id}
              onClick={() => setOperation(op.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                operation === op.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{op.icon}</span>
                <div className="flex-1">
                  <div className={`font-semibold ${operation === op.id ? 'text-blue-700' : 'text-gray-800'}`}>
                    {op.title}
                  </div>
                  <div className="text-xs text-gray-400">{op.beispiel}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Eingabe der Brüche */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📝 Brüche eingeben</h3>
        
        <div className="flex items-center justify-center gap-4">
          {/* Erster Bruch */}
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 mb-2">Bruch 1</span>
            <div className="flex flex-col items-center">
              <input
                type="number"
                value={zaehler1}
                onChange={(e) => setZaehler1(parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-2 text-xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
              <div className="w-20 h-0.5 bg-gray-800 my-1"></div>
              <input
                type="number"
                value={nenner1}
                onChange={(e) => setNenner1(parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-2 text-xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>
            {bruch1Gekuerzt && !bruch1Gekuerzt.istGekuerzt && (
              <span className="text-xs text-blue-600 mt-1">
                = {bruchAlsString(bruch1Gekuerzt.zaehler, bruch1Gekuerzt.nenner)}
              </span>
            )}
          </div>

          {/* Operator */}
          <div className="text-3xl font-bold text-gray-700 px-2">
            {opSymbol}
          </div>

          {/* Zweiter Bruch */}
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 mb-2">Bruch 2</span>
            <div className="flex flex-col items-center">
              <input
                type="number"
                value={zaehler2}
                onChange={(e) => setZaehler2(parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-2 text-xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
              <div className="w-20 h-0.5 bg-gray-800 my-1"></div>
              <input
                type="number"
                value={nenner2}
                onChange={(e) => setNenner2(parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-2 text-xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>
            {bruch2Gekuerzt && !bruch2Gekuerzt.istGekuerzt && (
              <span className="text-xs text-blue-600 mt-1">
                = {bruchAlsString(bruch2Gekuerzt.zaehler, bruch2Gekuerzt.nenner)}
              </span>
            )}
          </div>

          {/* Gleichheitszeichen */}
          <div className="text-3xl font-bold text-gray-700 px-2">
            =
          </div>

          {/* Ergebnis-Vorschau */}
          <div className="flex flex-col items-center">
            <span className="text-xs text-blue-500 mb-2">Ergebnis</span>
            <div className="flex flex-col items-center">
              <div className="w-20 px-3 py-2 text-xl font-bold text-center bg-blue-100 rounded-xl text-blue-700">
                {ergebnis.fehler ? '?' : ergebnis.zaehler}
              </div>
              <div className="w-20 h-0.5 bg-blue-700 my-1"></div>
              <div className="w-20 px-3 py-2 text-xl font-bold text-center bg-blue-100 rounded-xl text-blue-700">
                {ergebnis.fehler ? '?' : ergebnis.nenner}
              </div>
            </div>
          </div>
        </div>

        {/* Rechnung als Formel */}
        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-center font-mono text-lg">
          <span>{zaehler1}/{nenner1}</span>
          <span className="mx-2">{opSymbol}</span>
          <span>{zaehler2}/{nenner2}</span>
          <span className="mx-2">=</span>
          <span className="font-bold text-blue-600">
            {ergebnis.fehler ? '?' : bruchAlsString(ergebnis.zaehler, ergebnis.nenner)}
          </span>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-blue-100 mb-2">Ergebnis</h3>
        
        {ergebnis.fehler ? (
          <div className="text-2xl font-bold text-red-200">{ergebnis.fehler}</div>
        ) : (
          <>
            <div className="flex items-center gap-6">
              {/* Als Bruch */}
              <div>
                <div className="text-blue-100 text-xs mb-1">Als Bruch</div>
                <div className="text-4xl font-bold">
                  {bruchAlsString(ergebnis.zaehler, ergebnis.nenner)}
                </div>
                {ergebnis.wurdeGekuerzt && (
                  <div className="text-blue-200 text-sm mt-1">
                    (gekürzt von {bruchAlsString(ergebnis.ungekuerztZaehler!, ergebnis.ungekuerztNenner!)})
                  </div>
                )}
              </div>
              
              {/* Trennlinie */}
              <div className="h-16 w-px bg-white/20"></div>
              
              {/* Als Dezimalzahl */}
              <div>
                <div className="text-blue-100 text-xs mb-1">Als Dezimalzahl</div>
                <div className="text-4xl font-bold">
                  {isNaN(ergebnis.dezimal) ? '—' : ergebnis.dezimal.toLocaleString('de-DE', { maximumFractionDigits: 6 })}
                </div>
              </div>
            </div>

            {/* Zusätzliche Infos */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-blue-100 text-xs">Prozent</div>
                <div className="text-lg font-semibold">
                  {isNaN(ergebnis.dezimal) ? '—' : (ergebnis.dezimal * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })}%
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-blue-100 text-xs">Gemischte Zahl</div>
                <div className="text-lg font-semibold">
                  {(() => {
                    if (ergebnis.nenner === 0 || ergebnis.nenner === 1) return bruchAlsString(ergebnis.zaehler, ergebnis.nenner);
                    const ganz = Math.floor(Math.abs(ergebnis.zaehler) / ergebnis.nenner);
                    const rest = Math.abs(ergebnis.zaehler) % ergebnis.nenner;
                    const vorzeichen = ergebnis.zaehler < 0 ? '-' : '';
                    if (ganz === 0) return bruchAlsString(ergebnis.zaehler, ergebnis.nenner);
                    if (rest === 0) return `${vorzeichen}${ganz}`;
                    return `${vorzeichen}${ganz} ${rest}/${ergebnis.nenner}`;
                  })()}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Schritt-für-Schritt Lösung */}
      {!ergebnis.fehler && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">📐 Schritt-für-Schritt Lösung</h3>
          
          <div className="space-y-2">
            {ergebnis.schritte.map((schritt, index) => (
              <div key={index} className={schritt.ergebnis ? 'p-3 bg-green-50 rounded-xl' : ''}>
                {schritt.text && (
                  <p className="font-semibold text-gray-800">{schritt.text}</p>
                )}
                {schritt.rechnung && (
                  <code className="block bg-blue-50 p-2 rounded text-blue-900 font-mono text-sm my-1">
                    {schritt.rechnung}
                  </code>
                )}
                {schritt.ergebnis && (
                  <p className="text-xl font-bold text-green-700">
                    {schritt.ergebnis}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kürzen-Tool */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">✂️ Bruch kürzen (einzeln)</h3>
        
        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col items-center">
            <input
              type="number"
              id="kuerzen-zaehler"
              defaultValue={6}
              className="w-20 px-3 py-2 text-xl font-bold text-center border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:outline-none"
            />
            <div className="w-20 h-0.5 bg-orange-600 my-1"></div>
            <input
              type="number"
              id="kuerzen-nenner"
              defaultValue={8}
              className="w-20 px-3 py-2 text-xl font-bold text-center border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:outline-none"
            />
          </div>
          
          <button
            onClick={() => {
              const zInput = document.getElementById('kuerzen-zaehler') as HTMLInputElement;
              const nInput = document.getElementById('kuerzen-nenner') as HTMLInputElement;
              const ergebnisDiv = document.getElementById('kuerzen-ergebnis');
              
              const z = parseInt(zInput.value) || 0;
              const n = parseInt(nInput.value) || 1;
              const gekuerzt = kuerzen(z, n);
              const teiler = ggt(Math.abs(z), Math.abs(n));
              
              if (ergebnisDiv) {
                ergebnisDiv.innerHTML = `
                  <div class="text-center">
                    <div class="text-2xl font-bold text-orange-600 mb-2">
                      ${bruchAlsString(gekuerzt.zaehler, gekuerzt.nenner)}
                    </div>
                    ${teiler !== 1 && n !== 0 ? `
                      <div class="text-sm text-gray-600">
                        ggT(${Math.abs(z)}, ${Math.abs(n)}) = ${teiler}
                      </div>
                      <div class="text-xs text-gray-500">
                        (${z} ÷ ${teiler}) / (${n} ÷ ${teiler})
                      </div>
                    ` : `<div class="text-sm text-gray-500">Bereits vollständig gekürzt!</div>`}
                  </div>
                `;
              }
            }}
            className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors"
          >
            Kürzen
          </button>
          
          <div id="kuerzen-ergebnis" className="p-4 bg-orange-50 rounded-xl min-w-[150px]">
            <div className="text-center text-gray-400">← Klicke auf Kürzen</div>
          </div>
        </div>
      </div>

      {/* Dezimal zu Bruch */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🔄 Dezimalzahl → Bruch</h3>
        
        <div className="flex items-center justify-center gap-4">
          <input
            type="number"
            id="dezimal-input"
            defaultValue={0.75}
            step="0.001"
            className="w-32 px-4 py-3 text-xl font-bold text-center border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none"
          />
          
          <button
            onClick={() => {
              const input = document.getElementById('dezimal-input') as HTMLInputElement;
              const ergebnisDiv = document.getElementById('dezimal-ergebnis');
              
              const dezimal = parseFloat(input.value);
              if (isNaN(dezimal) || !ergebnisDiv) return;
              
              // Dezimalzahl in Bruch umwandeln
              const precision = 1000000; // 6 Dezimalstellen
              let z = Math.round(dezimal * precision);
              let n = precision;
              const gekuerzt = kuerzen(z, n);
              
              ergebnisDiv.innerHTML = `
                <div class="text-center">
                  <div class="text-2xl font-bold text-purple-600 mb-1">
                    ${bruchAlsString(gekuerzt.zaehler, gekuerzt.nenner)}
                  </div>
                  <div class="text-sm text-gray-500">
                    ${dezimal} = ${gekuerzt.zaehler}/${gekuerzt.nenner}
                  </div>
                </div>
              `;
            }}
            className="px-6 py-3 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-600 transition-colors"
          >
            Umwandeln
          </button>
          
          <div id="dezimal-ergebnis" className="p-4 bg-purple-50 rounded-xl min-w-[150px]">
            <div className="text-center text-gray-400">← Klicke auf Umwandeln</div>
          </div>
        </div>
      </div>

      {/* Rechenregeln */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📚 Rechenregeln für Brüche</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-xl">
            <p className="font-semibold text-green-800 mb-2">➕ Addition & ➖ Subtraktion</p>
            <ol className="text-green-700 text-sm space-y-1 list-decimal list-inside">
              <li>Hauptnenner finden (kgV der Nenner)</li>
              <li>Beide Brüche auf Hauptnenner erweitern</li>
              <li>Zähler addieren/subtrahieren</li>
              <li>Ergebnis kürzen</li>
            </ol>
            <code className="block mt-2 bg-green-100 p-2 rounded text-sm">
              a/b + c/d = (a·d + c·b) / (b·d)
            </code>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="font-semibold text-blue-800 mb-2">✖️ Multiplikation</p>
            <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
              <li>Zähler mit Zähler multiplizieren</li>
              <li>Nenner mit Nenner multiplizieren</li>
              <li>Ergebnis kürzen</li>
            </ol>
            <code className="block mt-2 bg-blue-100 p-2 rounded text-sm">
              a/b × c/d = (a·c) / (b·d)
            </code>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-xl">
            <p className="font-semibold text-orange-800 mb-2">➗ Division</p>
            <ol className="text-orange-700 text-sm space-y-1 list-decimal list-inside">
              <li>Zweiten Bruch umkehren (Kehrwert)</li>
              <li>Dann multiplizieren</li>
              <li>Ergebnis kürzen</li>
            </ol>
            <code className="block mt-2 bg-orange-100 p-2 rounded text-sm">
              a/b ÷ c/d = a/b × d/c = (a·d) / (b·c)
            </code>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-xl">
            <p className="font-semibold text-purple-800 mb-2">✂️ Kürzen</p>
            <p className="text-purple-700 text-sm">
              Zähler und Nenner durch den größten gemeinsamen Teiler (ggT) teilen.
            </p>
            <code className="block mt-2 bg-purple-100 p-2 rounded text-sm">
              12/18 = (12÷6)/(18÷6) = 2/3 (ggT = 6)
            </code>
          </div>
        </div>
      </div>

      {/* Wichtige Begriffe */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📖 Wichtige Begriffe</h3>
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="font-bold text-gray-800">Zähler:</span>
            <span className="text-gray-600 ml-2">Die Zahl oben im Bruch (über dem Bruchstrich)</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="font-bold text-gray-800">Nenner:</span>
            <span className="text-gray-600 ml-2">Die Zahl unten im Bruch (unter dem Bruchstrich)</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="font-bold text-gray-800">Kehrwert:</span>
            <span className="text-gray-600 ml-2">Zähler und Nenner vertauschen (z.B. 3/4 → 4/3)</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="font-bold text-gray-800">Erweitern:</span>
            <span className="text-gray-600 ml-2">Zähler und Nenner mit gleicher Zahl multiplizieren</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="font-bold text-gray-800">ggT:</span>
            <span className="text-gray-600 ml-2">Größter gemeinsamer Teiler (zum Kürzen)</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="font-bold text-gray-800">kgV:</span>
            <span className="text-gray-600 ml-2">Kleinstes gemeinsames Vielfaches (für Hauptnenner)</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="font-bold text-gray-800">Gemischte Zahl:</span>
            <span className="text-gray-600 ml-2">Ganze Zahl + Bruch (z.B. 1 3/4 statt 7/4)</span>
          </div>
        </div>
      </div>

      {/* Beispiele */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">💡 Praktische Beispiele</h3>
        <div className="space-y-4 text-sm">
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">🍕</span>
            <div>
              <p className="font-medium text-green-800">Pizza teilen</p>
              <p className="text-green-700">1/4 Pizza + 1/4 Pizza = 2/4 = 1/2 Pizza</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">📏</span>
            <div>
              <p className="font-medium text-blue-800">Handwerken</p>
              <p className="text-blue-700">3/4 Meter − 1/8 Meter = 6/8 − 1/8 = 5/8 Meter</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">🍳</span>
            <div>
              <p className="font-medium text-yellow-800">Rezept verdoppeln</p>
              <p className="text-yellow-700">2/3 Tasse × 2 = 4/3 = 1 1/3 Tassen</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-purple-50 rounded-xl">
            <span className="text-xl">💰</span>
            <div>
              <p className="font-medium text-purple-800">Geld aufteilen</p>
              <p className="text-purple-700">1/2 ÷ 3 = 1/2 × 1/3 = 1/6 (jeder bekommt ein Sechstel)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Häufige Brüche Tabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📊 Häufige Brüche als Dezimalzahl</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-600">Bruch</th>
                <th className="text-center py-2 text-gray-600">Dezimal</th>
                <th className="text-center py-2 text-gray-600">Prozent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { bruch: '1/2', dezimal: 0.5, prozent: 50 },
                { bruch: '1/3', dezimal: 0.333, prozent: 33.3 },
                { bruch: '2/3', dezimal: 0.667, prozent: 66.7 },
                { bruch: '1/4', dezimal: 0.25, prozent: 25 },
                { bruch: '3/4', dezimal: 0.75, prozent: 75 },
                { bruch: '1/5', dezimal: 0.2, prozent: 20 },
                { bruch: '1/8', dezimal: 0.125, prozent: 12.5 },
                { bruch: '1/10', dezimal: 0.1, prozent: 10 },
              ].map((row) => (
                <tr key={row.bruch} className="hover:bg-gray-50">
                  <td className="py-2 font-mono font-bold text-blue-600">{row.bruch}</td>
                  <td className="py-2 text-center">{row.dezimal}</td>
                  <td className="py-2 text-center">{row.prozent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Nützliche Ressourcen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.mathematik.de/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsche Mathematiker-Vereinigung
          </a>
          <a 
            href="https://www.frustfrei-lernen.de/mathematik/bruchrechnung.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Frustfrei-Lernen – Bruchrechnung
          </a>
          <a 
            href="https://www.mathe-lexikon.at/arithmetik/bruchrechnen/grundlagen.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Mathe-Lexikon – Bruchrechnen Grundlagen
          </a>
        </div>
      </div>
    </div>
  );
}
