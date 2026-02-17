import { useState, useMemo } from 'react';

/**
 * Berechnung der Gebühr nach GNotKG § 34 Tabelle B
 * Offizielle Formel gemäß Gerichts- und Notarkostengesetz
 * Letzte Aktualisierung: Juni 2025 (nach BGBl. 2025 I Nr. 109)
 */
function berechneGebueehrTabelleB(geschaeftswert: number): number {
  if (geschaeftswert <= 0) return 0;
  
  // Basis: bis 500 € = 15 €
  let gebuehr = 15;
  let restWert = geschaeftswert - 500;
  
  if (restWert <= 0) return gebuehr;
  
  // 500 - 2.000 € (1.500 €): je angefangene 500 € = 4 €
  const stufe1 = Math.min(restWert, 1500);
  gebuehr += Math.ceil(stufe1 / 500) * 4;
  restWert -= 1500;
  
  if (restWert <= 0) return gebuehr;
  
  // 2.000 - 10.000 € (8.000 €): je angefangene 1.000 € = 6 €
  const stufe2 = Math.min(restWert, 8000);
  gebuehr += Math.ceil(stufe2 / 1000) * 6;
  restWert -= 8000;
  
  if (restWert <= 0) return gebuehr;
  
  // 10.000 - 25.000 € (15.000 €): je angefangene 3.000 € = 8 €
  const stufe3 = Math.min(restWert, 15000);
  gebuehr += Math.ceil(stufe3 / 3000) * 8;
  restWert -= 15000;
  
  if (restWert <= 0) return gebuehr;
  
  // 25.000 - 50.000 € (25.000 €): je angefangene 5.000 € = 10 €
  const stufe4 = Math.min(restWert, 25000);
  gebuehr += Math.ceil(stufe4 / 5000) * 10;
  restWert -= 25000;
  
  if (restWert <= 0) return gebuehr;
  
  // 50.000 - 200.000 € (150.000 €): je angefangene 15.000 € = 27 €
  const stufe5 = Math.min(restWert, 150000);
  gebuehr += Math.ceil(stufe5 / 15000) * 27;
  restWert -= 150000;
  
  if (restWert <= 0) return gebuehr;
  
  // 200.000 - 500.000 € (300.000 €): je angefangene 30.000 € = 50 €
  const stufe6 = Math.min(restWert, 300000);
  gebuehr += Math.ceil(stufe6 / 30000) * 50;
  restWert -= 300000;
  
  if (restWert <= 0) return gebuehr;
  
  // 500.000 - 5.000.000 € (4.500.000 €): je angefangene 50.000 € = 80 €
  const stufe7 = Math.min(restWert, 4500000);
  gebuehr += Math.ceil(stufe7 / 50000) * 80;
  restWert -= 4500000;
  
  if (restWert <= 0) return gebuehr;
  
  // 5.000.000 - 10.000.000 € (5.000.000 €): je angefangene 200.000 € = 130 €
  const stufe8 = Math.min(restWert, 5000000);
  gebuehr += Math.ceil(stufe8 / 200000) * 130;
  restWert -= 5000000;
  
  if (restWert <= 0) return gebuehr;
  
  // 10.000.000 - 20.000.000 € (10.000.000 €): je angefangene 250.000 € = 150 €
  const stufe9 = Math.min(restWert, 10000000);
  gebuehr += Math.ceil(stufe9 / 250000) * 150;
  restWert -= 10000000;
  
  if (restWert <= 0) return gebuehr;
  
  // 20.000.000 - 30.000.000 € (10.000.000 €): je angefangene 500.000 € = 280 €
  const stufe10 = Math.min(restWert, 10000000);
  gebuehr += Math.ceil(stufe10 / 500000) * 280;
  restWert -= 10000000;
  
  if (restWert <= 0) return gebuehr;
  
  // Über 30.000.000 €: je angefangene 1.000.000 € = 120 €
  gebuehr += Math.ceil(restWert / 1000000) * 120;
  
  return gebuehr;
}

interface KostenPosition {
  bezeichnung: string;
  gebueehrenfaktor: number;
  geschaeftswert: number;
  einfacheGebuehr: number;
  betrag: number;
  kategorie: 'notar' | 'grundbuch';
}

export default function NotarkostenRechner() {
  const [kaufpreis, setKaufpreis] = useState(350000);
  const [mitGrundschuld, setMitGrundschuld] = useState(true);
  const [grundschuldBetrag, setGrundschuldBetrag] = useState(280000);

  const ergebnis = useMemo(() => {
    const positionen: KostenPosition[] = [];
    
    // Einfache Gebühr für Kaufpreis (Tabelle B)
    const gebKaufpreis = berechneGebueehrTabelleB(kaufpreis);
    
    // 1. Beurkundung Kaufvertrag (2,0 Gebühren)
    positionen.push({
      bezeichnung: 'Beurkundung Kaufvertrag',
      gebueehrenfaktor: 2.0,
      geschaeftswert: kaufpreis,
      einfacheGebuehr: gebKaufpreis,
      betrag: Math.round(gebKaufpreis * 2.0),
      kategorie: 'notar',
    });
    
    // 2. Vollzugstätigkeit (0,5 Gebühr) - z.B. Fälligkeitsmitteilung
    positionen.push({
      bezeichnung: 'Vollzugstätigkeit',
      gebueehrenfaktor: 0.5,
      geschaeftswert: kaufpreis,
      einfacheGebuehr: gebKaufpreis,
      betrag: Math.round(gebKaufpreis * 0.5),
      kategorie: 'notar',
    });
    
    // 3. Betreuungstätigkeit (0,5 Gebühr)
    positionen.push({
      bezeichnung: 'Betreuungstätigkeit',
      gebueehrenfaktor: 0.5,
      geschaeftswert: kaufpreis,
      einfacheGebuehr: gebKaufpreis,
      betrag: Math.round(gebKaufpreis * 0.5),
      kategorie: 'notar',
    });
    
    // 4. Eigentumsumschreibung im Grundbuch (1,0 Gebühr)
    positionen.push({
      bezeichnung: 'Eigentumsumschreibung (Grundbuch)',
      gebueehrenfaktor: 1.0,
      geschaeftswert: kaufpreis,
      einfacheGebuehr: gebKaufpreis,
      betrag: Math.round(gebKaufpreis * 1.0),
      kategorie: 'grundbuch',
    });
    
    // 5. Auflassungsvormerkung im Grundbuch (0,5 Gebühr)
    positionen.push({
      bezeichnung: 'Auflassungsvormerkung (Grundbuch)',
      gebueehrenfaktor: 0.5,
      geschaeftswert: kaufpreis,
      einfacheGebuehr: gebKaufpreis,
      betrag: Math.round(gebKaufpreis * 0.5),
      kategorie: 'grundbuch',
    });
    
    // Bei Grundschuld zusätzliche Kosten
    if (mitGrundschuld && grundschuldBetrag > 0) {
      const gebGrundschuld = berechneGebueehrTabelleB(grundschuldBetrag);
      
      // 6. Beurkundung Grundschuldbestellung (1,0 Gebühr)
      positionen.push({
        bezeichnung: 'Grundschuldbeurkundung',
        gebueehrenfaktor: 1.0,
        geschaeftswert: grundschuldBetrag,
        einfacheGebuehr: gebGrundschuld,
        betrag: Math.round(gebGrundschuld * 1.0),
        kategorie: 'notar',
      });
      
      // 7. Vollzug Grundschuld (0,5 Gebühr)
      positionen.push({
        bezeichnung: 'Vollzug Grundschuld',
        gebueehrenfaktor: 0.5,
        geschaeftswert: grundschuldBetrag,
        einfacheGebuehr: gebGrundschuld,
        betrag: Math.round(gebGrundschuld * 0.5),
        kategorie: 'notar',
      });
      
      // 8. Grundschuldeintragung im Grundbuch (1,0 Gebühr)
      positionen.push({
        bezeichnung: 'Grundschuldeintragung (Grundbuch)',
        gebueehrenfaktor: 1.0,
        geschaeftswert: grundschuldBetrag,
        einfacheGebuehr: gebGrundschuld,
        betrag: Math.round(gebGrundschuld * 1.0),
        kategorie: 'grundbuch',
      });
    }
    
    // Summen berechnen
    const notarkostenNetto = positionen
      .filter(p => p.kategorie === 'notar')
      .reduce((sum, p) => sum + p.betrag, 0);
    
    const grundbuchkosten = positionen
      .filter(p => p.kategorie === 'grundbuch')
      .reduce((sum, p) => sum + p.betrag, 0);
    
    // MwSt nur auf Notarkosten (19%)
    const mehrwertsteuer = Math.round(notarkostenNetto * 0.19);
    const notarkostenBrutto = notarkostenNetto + mehrwertsteuer;
    
    // Auslagen (Pauschale ca. 20-50€ je nach Aufwand)
    const auslagen = 50;
    
    const gesamtkosten = notarkostenBrutto + grundbuchkosten + auslagen;
    
    // Prozentualer Anteil am Kaufpreis
    const prozentVomKaufpreis = (gesamtkosten / kaufpreis) * 100;
    
    return {
      positionen,
      notarkostenNetto,
      mehrwertsteuer,
      notarkostenBrutto,
      grundbuchkosten,
      auslagen,
      gesamtkosten,
      prozentVomKaufpreis,
      kaufpreis,
    };
  }, [kaufpreis, mitGrundschuld, grundschuldBetrag]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRund = (n: number) => n.toLocaleString('de-DE') + ' €';

  // Referenztabelle für Vergleich
  const referenzwerte = [
    { kaufpreis: 100000, gebuehr: berechneGebueehrTabelleB(100000) },
    { kaufpreis: 200000, gebuehr: berechneGebueehrTabelleB(200000) },
    { kaufpreis: 300000, gebuehr: berechneGebueehrTabelleB(300000) },
    { kaufpreis: 400000, gebuehr: berechneGebueehrTabelleB(400000) },
    { kaufpreis: 500000, gebuehr: berechneGebueehrTabelleB(500000) },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Kaufpreis */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Kaufpreis der Immobilie</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={kaufpreis}
              onChange={(e) => setKaufpreis(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
              min="0"
              step="10000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            min="50000"
            max="1500000"
            step="10000"
            value={kaufpreis}
            onChange={(e) => setKaufpreis(Number(e.target.value))}
            className="w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>50.000 €</span>
            <span>1.500.000 €</span>
          </div>
        </div>

        {/* Grundschuld Toggle */}
        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={mitGrundschuld}
                onChange={(e) => setMitGrundschuld(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-14 h-8 rounded-full transition-colors ${mitGrundschuld ? 'bg-purple-500' : 'bg-gray-300'}`}>
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${mitGrundschuld ? 'translate-x-7' : 'translate-x-1'}`} />
              </div>
            </div>
            <span className="text-gray-700 font-medium">Mit Grundschuld (Bankfinanzierung)</span>
          </label>
        </div>

        {/* Grundschuldbetrag */}
        {mitGrundschuld && (
          <div className="mt-4 p-4 bg-purple-50 rounded-xl">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Grundschuldbetrag (Darlehen + Nebenleistung)</span>
              <span className="text-sm text-gray-500 block">Meist ca. 15-20% über dem Darlehensbetrag</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={grundschuldBetrag}
                onChange={(e) => setGrundschuldBetrag(Math.max(0, Number(e.target.value)))}
                className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
                min="0"
                step="10000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
            <input
              type="range"
              min="0"
              max={kaufpreis}
              step="10000"
              value={grundschuldBetrag}
              onChange={(e) => setGrundschuldBetrag(Number(e.target.value))}
              className="w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        )}
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-purple-100 mb-1">Gesamtkosten (Notar + Grundbuch)</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroRund(ergebnis.gesamtkosten)}</span>
          </div>
          <p className="text-purple-100 mt-2">
            ≈ {ergebnis.prozentVomKaufpreis.toFixed(2)}% vom Kaufpreis
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-purple-400/30">
          <div>
            <p className="text-purple-200 text-xs">Notarkosten (brutto)</p>
            <p className="text-xl font-bold">{formatEuroRund(ergebnis.notarkostenBrutto)}</p>
          </div>
          <div>
            <p className="text-purple-200 text-xs">Grundbuchkosten</p>
            <p className="text-xl font-bold">{formatEuroRund(ergebnis.grundbuchkosten)}</p>
          </div>
        </div>
      </div>

      {/* Detaillierte Aufstellung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Detaillierte Kostenaufstellung</h3>
        
        {/* Notarkosten */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Notarkosten</h4>
          <div className="space-y-2">
            {ergebnis.positionen.filter(p => p.kategorie === 'notar').map((pos, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{pos.bezeichnung}</p>
                  <p className="text-xs text-gray-500">
                    {pos.gebueehrenfaktor}× Gebühr auf {formatEuroRund(pos.geschaeftswert)}
                  </p>
                </div>
                <span className="font-bold text-gray-900">{formatEuro(pos.betrag)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
              <span className="text-gray-600">Zwischensumme (netto)</span>
              <span className="font-bold text-gray-800">{formatEuro(ergebnis.notarkostenNetto)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
              <span className="text-gray-600">+ 19% MwSt</span>
              <span className="font-bold text-gray-800">{formatEuro(ergebnis.mehrwertsteuer)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
              <span className="text-gray-600">+ Auslagen (Pauschale)</span>
              <span className="font-bold text-gray-800">{formatEuro(ergebnis.auslagen)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-100 rounded-lg">
              <span className="font-semibold text-purple-800">Notarkosten gesamt</span>
              <span className="font-bold text-purple-800">{formatEuro(ergebnis.notarkostenBrutto + ergebnis.auslagen)}</span>
            </div>
          </div>
        </div>
        
        {/* Grundbuchkosten */}
        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Grundbuchkosten</h4>
          <div className="space-y-2">
            {ergebnis.positionen.filter(p => p.kategorie === 'grundbuch').map((pos, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{pos.bezeichnung}</p>
                  <p className="text-xs text-gray-500">
                    {pos.gebueehrenfaktor}× Gebühr auf {formatEuroRund(pos.geschaeftswert)}
                  </p>
                </div>
                <span className="font-bold text-gray-900">{formatEuro(pos.betrag)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center p-3 bg-blue-100 rounded-lg">
              <span className="font-semibold text-blue-800">Grundbuchkosten gesamt</span>
              <span className="font-bold text-blue-800">{formatEuro(ergebnis.grundbuchkosten)}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            ℹ️ Grundbuchkosten sind keine MwSt-pflichtig (staatliche Gebühren)
          </p>
        </div>
      </div>

      {/* GNotKG Tabelle B Referenz */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📊 GNotKG Tabelle B – Einfache Gebühr</h3>
        <p className="text-sm text-gray-600 mb-4">
          Die Notarkosten basieren auf dem Geschäftswert und werden mit verschiedenen Faktoren multipliziert (z.B. 2,0 für Beurkundung).
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-semibold text-gray-600">Geschäftswert</th>
                <th className="text-right py-2 font-semibold text-gray-600">Einfache Gebühr</th>
              </tr>
            </thead>
            <tbody>
              {referenzwerte.map((ref) => (
                <tr key={ref.kaufpreis} className={`border-b ${ref.kaufpreis === kaufpreis ? 'bg-purple-50' : ''}`}>
                  <td className="py-2">{formatEuroRund(ref.kaufpreis)}</td>
                  <td className="text-right py-2 font-medium">{formatEuro(ref.gebuehr)}</td>
                </tr>
              ))}
              <tr className="bg-purple-100">
                <td className="py-2 font-medium text-purple-800">Ihr Wert: {formatEuroRund(kaufpreis)}</td>
                <td className="text-right py-2 font-bold text-purple-800">{formatEuro(berechneGebueehrTabelleB(kaufpreis))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert's</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>Notarkosten sind gesetzlich festgelegt im <strong>GNotKG</strong> (Gerichts- und Notarkostengesetz)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Alle Notare in Deutschland berechnen die <strong>gleichen Gebühren</strong></span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Gebühren richten sich nach dem <strong>Geschäftswert</strong> (Kaufpreis)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Grundbuchkosten werden vom <strong>Amtsgericht</strong> erhoben (MwSt-frei)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Bei Finanzierung: Zusätzliche Kosten für <strong>Grundschuldbestellung</strong></span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Stellen</h3>
        <div className="space-y-4">
          <div className="bg-purple-50 rounded-xl p-4">
            <p className="font-semibold text-purple-900">Notar</p>
            <p className="text-sm text-purple-700 mt-1">Für die Beurkundung des Kaufvertrags und der Grundschuld</p>
            <a 
              href="https://www.notar.de/notarsuche" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline text-sm mt-2 inline-block"
            >
              → Notar in Ihrer Nähe finden
            </a>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="font-semibold text-blue-900">Grundbuchamt (Amtsgericht)</p>
            <p className="text-sm text-blue-700 mt-1">Für die Eintragung im Grundbuch (Eigentum & Grundschuld)</p>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">📞</span>
            <div>
              <p className="font-medium text-gray-800">Bundesnotarkammer</p>
              <p className="text-gray-600">Hotline: 030 / 3 83 86 60</p>
              <a 
                href="https://www.bnotk.de" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                www.bnotk.de
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">💡</span>
            <div>
              <p className="font-medium text-yellow-800">Keine Verhandlung möglich!</p>
              <p className="text-yellow-700">Notargebühren sind gesetzlich festgelegt. Kein Notar darf mehr oder weniger verlangen.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-medium text-green-800">Käufer zahlt Notar- und Grundbuchkosten</p>
              <p className="text-green-700">Bei einem Immobilienkauf trägt üblicherweise der Käufer alle Kosten für Notar und Grundbuch.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">📝</span>
            <div>
              <p className="font-medium text-blue-800">Zusätzliche Kosten möglich</p>
              <p className="text-blue-700">Bei komplexen Verträgen (z.B. Erbbaurecht, Teilungserklärung) können weitere Gebühren anfallen.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-orange-50 rounded-xl">
            <span className="text-xl">🏦</span>
            <div>
              <p className="font-medium text-orange-800">Löschung alter Grundschulden</p>
              <p className="text-orange-700">Wenn der Verkäufer noch eine Grundschuld hat, kommen ggf. Löschungskosten hinzu (ca. 0,5 Gebühr).</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ablauf */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📅 Ablauf beim Notar</h3>
        <ol className="space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <div>
              <p className="font-medium text-gray-800">Kaufvertrag vorbereiten</p>
              <p className="text-gray-600">Notar erstellt Entwurf (mind. 2 Wochen vor Termin bei Verbrauchern)</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <div>
              <p className="font-medium text-gray-800">Beurkundungstermin</p>
              <p className="text-gray-600">Notar liest Vertrag vor, beantwortet Fragen, alle unterschreiben</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <div>
              <p className="font-medium text-gray-800">Auflassungsvormerkung</p>
              <p className="text-gray-600">Notar beantragt Eintragung im Grundbuch als Sicherheit</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
            <div>
              <p className="font-medium text-gray-800">Fälligkeitsmitteilung</p>
              <p className="text-gray-600">Notar bestätigt, dass Kaufpreis gezahlt werden kann</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
            <div>
              <p className="font-medium text-gray-800">Eigentumsumschreibung</p>
              <p className="text-gray-600">Nach Kaufpreiszahlung: Eintragung als neuer Eigentümer</p>
            </div>
          </li>
        </ol>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/gnotkg/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            GNotKG – Gerichts- und Notarkostengesetz
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/gnotkg/anlage_2.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            GNotKG Anlage 2 – Gebührentabelle B
          </a>
          <a 
            href="https://dejure.org/gesetze/GNotKG/34.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 34 GNotKG – Wertgebühren
          </a>
          <a 
            href="https://www.bnotk.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesnotarkammer
          </a>
          <a 
            href="http://www.gnotkg.de/gebuehrentabelle.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            GNotKG Gebührentabelle (gnotkg.de)
          </a>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Stand: Juni 2025 (BGBl. 2025 I Nr. 109) · Alle Angaben ohne Gewähr
        </p>
      </div>
    </div>
  );
}
