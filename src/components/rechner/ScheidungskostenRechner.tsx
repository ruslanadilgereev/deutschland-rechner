import { useState } from 'react';

// Gerichtskosten nach GKG (Anlage 2) - Stand 2024/2025
// Gebührentabelle für Familienverfahren (2 Gerichtsgebühren)
const GERICHTSKOSTEN_TABELLE = [
  { bis: 500, gebuehr: 38 },
  { bis: 1000, gebuehr: 58 },
  { bis: 1500, gebuehr: 78 },
  { bis: 2000, gebuehr: 98 },
  { bis: 3000, gebuehr: 119 },
  { bis: 4000, gebuehr: 140 },
  { bis: 5000, gebuehr: 161 },
  { bis: 6000, gebuehr: 182 },
  { bis: 7000, gebuehr: 203 },
  { bis: 8000, gebuehr: 224 },
  { bis: 9000, gebuehr: 245 },
  { bis: 10000, gebuehr: 266 },
  { bis: 13000, gebuehr: 295 },
  { bis: 16000, gebuehr: 324 },
  { bis: 19000, gebuehr: 353 },
  { bis: 22000, gebuehr: 382 },
  { bis: 25000, gebuehr: 411 },
  { bis: 30000, gebuehr: 449 },
  { bis: 35000, gebuehr: 487 },
  { bis: 40000, gebuehr: 525 },
  { bis: 45000, gebuehr: 563 },
  { bis: 50000, gebuehr: 601 },
  { bis: 65000, gebuehr: 733 },
  { bis: 80000, gebuehr: 865 },
  { bis: 95000, gebuehr: 997 },
  { bis: 110000, gebuehr: 1129 },
  { bis: 125000, gebuehr: 1261 },
  { bis: 140000, gebuehr: 1393 },
  { bis: 155000, gebuehr: 1525 },
  { bis: 170000, gebuehr: 1657 },
  { bis: 185000, gebuehr: 1789 },
  { bis: 200000, gebuehr: 1921 },
  { bis: 230000, gebuehr: 2119 },
  { bis: 260000, gebuehr: 2317 },
  { bis: 290000, gebuehr: 2515 },
  { bis: 320000, gebuehr: 2713 },
  { bis: 350000, gebuehr: 2911 },
  { bis: 380000, gebuehr: 3109 },
  { bis: 410000, gebuehr: 3307 },
  { bis: 440000, gebuehr: 3505 },
  { bis: 470000, gebuehr: 3703 },
  { bis: 500000, gebuehr: 3901 },
];

// RVG Gebührentabelle (Anlage 2 zu § 13 Abs. 1 RVG) - Auszug
const RVG_TABELLE = [
  { bis: 500, gebuehr: 49 },
  { bis: 1000, gebuehr: 88 },
  { bis: 1500, gebuehr: 127 },
  { bis: 2000, gebuehr: 166 },
  { bis: 3000, gebuehr: 222 },
  { bis: 4000, gebuehr: 278 },
  { bis: 5000, gebuehr: 334 },
  { bis: 6000, gebuehr: 390 },
  { bis: 7000, gebuehr: 446 },
  { bis: 8000, gebuehr: 502 },
  { bis: 9000, gebuehr: 558 },
  { bis: 10000, gebuehr: 614 },
  { bis: 13000, gebuehr: 666 },
  { bis: 16000, gebuehr: 718 },
  { bis: 19000, gebuehr: 770 },
  { bis: 22000, gebuehr: 822 },
  { bis: 25000, gebuehr: 874 },
  { bis: 30000, gebuehr: 955 },
  { bis: 35000, gebuehr: 1036 },
  { bis: 40000, gebuehr: 1117 },
  { bis: 45000, gebuehr: 1198 },
  { bis: 50000, gebuehr: 1279 },
  { bis: 65000, gebuehr: 1373 },
  { bis: 80000, gebuehr: 1467 },
  { bis: 95000, gebuehr: 1561 },
  { bis: 110000, gebuehr: 1655 },
  { bis: 125000, gebuehr: 1749 },
  { bis: 140000, gebuehr: 1843 },
  { bis: 155000, gebuehr: 1937 },
  { bis: 170000, gebuehr: 2031 },
  { bis: 185000, gebuehr: 2125 },
  { bis: 200000, gebuehr: 2219 },
  { bis: 230000, gebuehr: 2359 },
  { bis: 260000, gebuehr: 2499 },
  { bis: 290000, gebuehr: 2639 },
  { bis: 320000, gebuehr: 2779 },
  { bis: 350000, gebuehr: 2919 },
  { bis: 380000, gebuehr: 3059 },
  { bis: 410000, gebuehr: 3199 },
  { bis: 440000, gebuehr: 3339 },
  { bis: 470000, gebuehr: 3479 },
  { bis: 500000, gebuehr: 3619 },
];

function getGebuehr(tabelle: { bis: number; gebuehr: number }[], wert: number): number {
  for (const stufe of tabelle) {
    if (wert <= stufe.bis) {
      return stufe.gebuehr;
    }
  }
  // Für höhere Werte: Letzte Stufe + Zuschlag
  const letzterEintrag = tabelle[tabelle.length - 1];
  const mehrwert = wert - letzterEintrag.bis;
  const zusatzStufen = Math.ceil(mehrwert / 50000);
  return letzterEintrag.gebuehr + (zusatzStufen * 198); // Vereinfachte Berechnung
}

export default function ScheidungskostenRechner() {
  const [nettoEinkommen1, setNettoEinkommen1] = useState(3000);
  const [nettoEinkommen2, setNettoEinkommen2] = useState(2000);
  const [vermoegen, setVermoegen] = useState(0);
  const [versorgungsausgleich, setVersorgungsausgleich] = useState(true);
  const [einvernehmlich, setEinvernehmlich] = useState(true);
  const [mitAnwalt, setMitAnwalt] = useState<'einer' | 'beide'>('einer');

  // Verfahrenswert berechnen (§ 43 FamGKG)
  // Grundlage: 3 x gemeinsames Nettoeinkommen
  const basisVerfahrenswert = (nettoEinkommen1 + nettoEinkommen2) * 3;
  
  // Vermögenswert: 5% des Vermögens über 60.000€ Freibetrag (vereinfacht)
  const vermoegensFreibetrag = 60000;
  const vermoegensZuschlag = vermoegen > vermoegensFreibetrag 
    ? (vermoegen - vermoegensFreibetrag) * 0.05 
    : 0;
  
  // Versorgungsausgleich: 10% des Verfahrenswerts pro Anrecht, mindestens 1.000€
  const versorgungsausgleichWert = versorgungsausgleich 
    ? Math.max(1000, basisVerfahrenswert * 0.1) * 2 // Annahme: 2 Anrechte
    : 0;
  
  // Gesamter Verfahrenswert (mindestens 3.000€)
  const verfahrenswert = Math.max(3000, 
    Math.round(basisVerfahrenswert + vermoegensZuschlag + versorgungsausgleichWert)
  );

  // Gerichtskosten: 2 Gebühren nach GKG
  const einzelGebuehrGericht = getGebuehr(GERICHTSKOSTEN_TABELLE, verfahrenswert);
  const gerichtskosten = einzelGebuehrGericht * 2;

  // Anwaltskosten nach RVG
  // Verfahrensgebühr: 1,3 (§ 13 RVG Nr. 3100 VV)
  // Terminsgebühr: 1,2 (§ 13 RVG Nr. 3104 VV)
  // Einigungsgebühr bei einvernehmlicher Scheidung: 1,0 (§ 13 RVG Nr. 1000 VV)
  const einzelGebuehrRVG = getGebuehr(RVG_TABELLE, verfahrenswert);
  
  const verfahrensgebuehr = einzelGebuehrRVG * 1.3;
  const terminsgebuehr = einzelGebuehrRVG * 1.2;
  const einigungsgebuehr = einvernehmlich ? einzelGebuehrRVG * 1.0 : 0;
  
  // Auslagenpauschale: 20€ (§ 7 RVG)
  const auslagenpauschale = 20;
  
  // MwSt. auf Anwaltskosten
  const anwaltNettoEiner = verfahrensgebuehr + terminsgebuehr + einigungsgebuehr + auslagenpauschale;
  const mwstEiner = anwaltNettoEiner * 0.19;
  const anwaltskostenEiner = Math.round(anwaltNettoEiner + mwstEiner);
  
  const anwaltskostenGesamt = mitAnwalt === 'beide' 
    ? anwaltskostenEiner * 2 
    : anwaltskostenEiner;

  // Gesamtkosten
  const gesamtkosten = gerichtskosten + anwaltskostenGesamt;

  // Kosten pro Person (bei einvernehmlicher Scheidung meist 50/50)
  const kostenProPerson = Math.round(gesamtkosten / 2);

  return (
    <div className="max-w-lg mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">💰 Finanzielle Situation</h3>
        
        {/* Netto-Einkommen Ehepartner 1 */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Nettoeinkommen Partner 1 (€/Monat)
          </label>
          <input
            type="number"
            value={nettoEinkommen1}
            onChange={(e) => setNettoEinkommen1(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none text-lg"
            min="0"
            step="100"
          />
          <input
            type="range"
            value={nettoEinkommen1}
            onChange={(e) => setNettoEinkommen1(parseInt(e.target.value))}
            min="0"
            max="15000"
            step="100"
            className="w-full mt-2 accent-purple-500"
          />
        </div>

        {/* Netto-Einkommen Ehepartner 2 */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Nettoeinkommen Partner 2 (€/Monat)
          </label>
          <input
            type="number"
            value={nettoEinkommen2}
            onChange={(e) => setNettoEinkommen2(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none text-lg"
            min="0"
            step="100"
          />
          <input
            type="range"
            value={nettoEinkommen2}
            onChange={(e) => setNettoEinkommen2(parseInt(e.target.value))}
            min="0"
            max="15000"
            step="100"
            className="w-full mt-2 accent-purple-500"
          />
        </div>

        {/* Vermögen */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Gemeinsames Vermögen (€)
          </label>
          <input
            type="number"
            value={vermoegen}
            onChange={(e) => setVermoegen(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none text-lg"
            min="0"
            step="10000"
          />
          <input
            type="range"
            value={vermoegen}
            onChange={(e) => setVermoegen(parseInt(e.target.value))}
            min="0"
            max="500000"
            step="10000"
            className="w-full mt-2 accent-purple-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Immobilien, Ersparnisse, Wertpapiere etc. (Freibetrag: 60.000€)
          </p>
        </div>
      </div>

      {/* Options Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">⚙️ Art der Scheidung</h3>
        
        {/* Einvernehmlich */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Scheidungsart
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setEinvernehmlich(true)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                einvernehmlich
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✅ Einvernehmlich
            </button>
            <button
              onClick={() => setEinvernehmlich(false)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                !einvernehmlich
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ⚔️ Streitig
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {einvernehmlich 
              ? 'Beide sind sich einig → günstiger' 
              : 'Streit um Unterhalt, Sorgerecht etc. → teurer'}
          </p>
        </div>

        {/* Anzahl Anwälte */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Anwälte
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMitAnwalt('einer')}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                mitAnwalt === 'einer'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              👤 Ein Anwalt
            </button>
            <button
              onClick={() => setMitAnwalt('beide')}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                mitAnwalt === 'beide'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              👥 Zwei Anwälte
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {mitAnwalt === 'einer' 
              ? 'Bei einvernehmlicher Scheidung reicht oft ein Anwalt' 
              : 'Jeder Partner hat eigenen Anwalt'}
          </p>
        </div>

        {/* Versorgungsausgleich */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={versorgungsausgleich}
              onChange={(e) => setVersorgungsausgleich(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-gray-300 text-purple-500 focus:ring-purple-500"
            />
            <span className="text-gray-700">Versorgungsausgleich durchführen</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-8">
            Ausgleich der Rentenansprüche (meist erforderlich bei Ehen &gt; 3 Jahre)
          </p>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-purple-100 mb-1">Geschätzte Gesamtkosten</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{gesamtkosten.toLocaleString('de-DE')}</span>
            <span className="text-xl text-purple-200">€</span>
          </div>
          <p className="text-sm text-purple-200 mt-1">
            ca. {kostenProPerson.toLocaleString('de-DE')} € pro Person
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-purple-100">Verfahrenswert</span>
              <span className="text-lg font-bold">{verfahrenswert.toLocaleString('de-DE')} €</span>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-purple-100">Gerichtskosten</span>
              <span className="text-lg font-bold">{gerichtskosten.toLocaleString('de-DE')} €</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-purple-100">
                Anwaltskosten ({mitAnwalt === 'beide' ? '2 Anwälte' : '1 Anwalt'})
              </span>
              <span className="text-lg font-bold">{anwaltskostenGesamt.toLocaleString('de-DE')} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Kostenaufschlüsselung */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Kostenaufschlüsselung</h3>
        
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">Verfahrenswert berechnet sich aus:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
              <span>3 × Nettoeinkommen ({(nettoEinkommen1 + nettoEinkommen2).toLocaleString('de-DE')} €)</span>
              <span className="font-medium">{basisVerfahrenswert.toLocaleString('de-DE')} €</span>
            </div>
            {vermoegensZuschlag > 0 && (
              <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                <span>+ Vermögenszuschlag (5% über Freibetrag)</span>
                <span className="font-medium">{Math.round(vermoegensZuschlag).toLocaleString('de-DE')} €</span>
              </div>
            )}
            {versorgungsausgleich && (
              <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                <span>+ Versorgungsausgleich</span>
                <span className="font-medium">{Math.round(versorgungsausgleichWert).toLocaleString('de-DE')} €</span>
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">Anwaltskosten (pro Anwalt):</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
              <span>Verfahrensgebühr (1,3 ×)</span>
              <span className="font-medium">{Math.round(verfahrensgebuehr).toLocaleString('de-DE')} €</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
              <span>Terminsgebühr (1,2 ×)</span>
              <span className="font-medium">{Math.round(terminsgebuehr).toLocaleString('de-DE')} €</span>
            </div>
            {einvernehmlich && (
              <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                <span>Einigungsgebühr (1,0 ×)</span>
                <span className="font-medium">{Math.round(einigungsgebuehr).toLocaleString('de-DE')} €</span>
              </div>
            )}
            <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
              <span>Auslagenpauschale</span>
              <span className="font-medium">{auslagenpauschale.toLocaleString('de-DE')} €</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
              <span>+ 19% MwSt.</span>
              <span className="font-medium">{Math.round(mwstEiner).toLocaleString('de-DE')} €</span>
            </div>
            <div className="flex justify-between p-2 bg-purple-100 rounded-lg font-medium">
              <span>Summe pro Anwalt</span>
              <span>{anwaltskostenEiner.toLocaleString('de-DE')} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spartipps */}
      <div className="mt-6 bg-green-50 rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-green-800 mb-3">💡 So sparen Sie Kosten</h3>
        <div className="space-y-3 text-sm text-green-700">
          <div className="flex gap-3">
            <span>✓</span>
            <span><strong>Einvernehmliche Scheidung:</strong> Ein gemeinsamer Anwalt spart bis zu 50% der Anwaltskosten</span>
          </div>
          <div className="flex gap-3">
            <span>✓</span>
            <span><strong>Trennungsjahr nutzen:</strong> Nutzen Sie die Zeit für außergerichtliche Einigungen</span>
          </div>
          <div className="flex gap-3">
            <span>✓</span>
            <span><strong>Online-Scheidung:</strong> Seriöse Anbieter wickeln vieles per E-Mail ab – spart Zeit und Geld</span>
          </div>
          <div className="flex gap-3">
            <span>✓</span>
            <span><strong>Verfahrenskostenhilfe:</strong> Bei niedrigem Einkommen übernimmt der Staat die Kosten</span>
          </div>
        </div>
      </div>

      {/* Zuständige Behörden */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Stellen & Hotlines</h3>
        <div className="space-y-4">
          <div className="bg-purple-50 rounded-xl p-4">
            <p className="font-semibold text-purple-900">Familiengericht</p>
            <p className="text-sm text-purple-700 mt-1">Zuständig ist das Amtsgericht (Familiengericht) am Wohnort eines Ehegatten.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Anwaltssuche</p>
                <a 
                  href="https://anwaltauskunft.de/anwaltssuche"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  anwaltauskunft.de →
                </a>
                <p className="text-xs text-gray-500 mt-1">Fachanwalt Familienrecht</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">💬</span>
              <div>
                <p className="font-medium text-gray-800">Rechtsberatung</p>
                <a 
                  href="https://www.bmjv.de/DE/Themen/GessellsBeratungshilfe/Beratungshilfe_node.html"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  Beratungshilfe beantragen →
                </a>
                <p className="text-xs text-gray-500 mt-1">Kostenlose Erstberatung</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">💰</span>
              <div>
                <p className="font-medium text-gray-800">Verfahrenskostenhilfe</p>
                <a 
                  href="https://www.bmj.de/DE/Service/Formulare/Prozesskostenhilfe/prozesskostenhilfe.html"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  VKH-Antrag (Formular) →
                </a>
                <p className="text-xs text-gray-500 mt-1">Bei geringem Einkommen</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📋</span>
              <div>
                <p className="font-medium text-gray-800">Scheidungsantrag</p>
                <a 
                  href="https://www.justiz.de/service/formular/index.php"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  justiz.de Formulare →
                </a>
                <p className="text-xs text-gray-500 mt-1">Nur über Anwalt einreichbar</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Berechnung</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Verfahrenswert:</strong> 3 × gemeinsames Nettoeinkommen + Vermögenszuschlag + ggf. Versorgungsausgleich</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Gerichtskosten:</strong> Nach GKG (Gerichtskostengesetz) – 2 Gebühren</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Anwaltskosten:</strong> Nach RVG (Rechtsanwaltsvergütungsgesetz) – zzgl. 19% MwSt.</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Mindestverfahrenswert:</strong> 3.000 € (auch bei keinem Einkommen)</span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Wichtige Hinweise</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium text-yellow-800">Schätzung – keine Garantie</p>
              <p className="text-yellow-700">Die tatsächlichen Kosten können je nach Einzelfall abweichen.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">⏱️</span>
            <div>
              <p className="font-medium text-blue-800">Trennungsjahr erforderlich</p>
              <p className="text-blue-700">Vor der Scheidung muss 1 Jahr Trennung nachgewiesen werden (§ 1566 BGB).</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">⚖️</span>
            <div>
              <p className="font-medium text-green-800">Anwaltszwang</p>
              <p className="text-green-700">Mindestens ein Anwalt ist für den Scheidungsantrag gesetzlich vorgeschrieben.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-purple-50 rounded-xl">
            <span className="text-xl">💑</span>
            <div>
              <p className="font-medium text-purple-800">Folgekostenabkommen</p>
              <p className="text-purple-700">Unterhalt, Zugewinn und Sorgerecht können separate Verfahren und Kosten verursachen.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Checkliste */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">✅ Checkliste Scheidung</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <span>☐</span>
            <span>Trennungsjahr abwarten (Beginn dokumentieren)</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <span>☐</span>
            <span>Unterlagen sammeln (Heiratsurkunde, Einkommensnachweise)</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <span>☐</span>
            <span>Fachanwalt Familienrecht kontaktieren</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <span>☐</span>
            <span>Verfahrenskostenhilfe prüfen (bei geringem Einkommen)</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <span>☐</span>
            <span>Regelung zu Kindern, Unterhalt, Vermögen besprechen</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <span>☐</span>
            <span>Versorgungsausgleich klären (Rentenansprüche)</span>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/gkg_2004/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-purple-600 hover:underline"
          >
            Gerichtskostengesetz (GKG) – Gebührentabelle
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/rvg/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-purple-600 hover:underline"
          >
            Rechtsanwaltsvergütungsgesetz (RVG)
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/famgkg/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-purple-600 hover:underline"
          >
            Familiengerichtskostengesetz (FamGKG)
          </a>
          <a 
            href="https://www.bmj.de/DE/Themen/FamilieUndPartnerschaft/Scheidung/Scheidung_node.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-purple-600 hover:underline"
          >
            BMJ – Informationen zur Scheidung
          </a>
        </div>
      </div>
    </div>
  );
}
