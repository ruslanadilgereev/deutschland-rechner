import { useState, useMemo } from 'react';

// ============================================================================
// Bürgergeld Berechnungsgrundlagen 2025/2026
// ============================================================================
// Rechtsgrundlage: SGB II (Sozialgesetzbuch Zweites Buch)
// - § 20 SGB II: Regelbedarf zur Sicherung des Lebensunterhalts
// - § 21 SGB II: Mehrbedarfe
// - § 22 SGB II: Bedarfe für Unterkunft und Heizung (KdU)
// - § 11b SGB II: Absetzbeträge (Freibeträge vom Einkommen)
// - § 72 SGB II: Kindersofortzuschlag
//
// Regelsätze 2025/2026: NULLRUNDE - keine Erhöhung gegenüber 2024
// Quelle: https://www.bundesregierung.de/breg-de/aktuelles/nullrunde-buergergeld-2383676
// Quelle: https://www.bmas.de/DE/Arbeit/Grundsicherung-Buergergeld/Buergergeld/buergergeld.html
// Quelle: https://www.buergergeld.org/sgb-ii/regelsatz/
// ============================================================================

// Regelbedarfsstufen 2025/2026 (§ 20 SGB II, § 8 RBEG)
// Stand: 01.01.2024, unverändert für 2025 und 2026 (Besitzschutzregelung)
const REGELSAETZE_2026 = {
  // Regelbedarfsstufe 1: Alleinstehende/Alleinerziehende
  alleinstehend: 563,
  
  // Regelbedarfsstufe 2: Volljährige Partner in Bedarfsgemeinschaft (je 90%)
  partner: 506,
  
  // Regelbedarfsstufe 3: Erwachsene unter 25 im Haushalt der Eltern / Behinderte in Einrichtung
  unter25_bei_eltern: 451,
  
  // Regelbedarfsstufe 4: Jugendliche 14-17 Jahre
  kind_14_17: 471,
  
  // Regelbedarfsstufe 5: Kinder 6-13 Jahre
  kind_6_13: 390,
  
  // Regelbedarfsstufe 6: Kinder 0-5 Jahre
  kind_0_5: 357,
};

// Kindersofortzuschlag nach § 72 SGB II
// 25€ pro Kind zusätzlich zum Regelbedarf für Kinder in RBS 3, 4, 5, 6
// Quelle: https://www.buergergeld.org/news/kindersofortzuschlag/
const KINDERSOFORTZUSCHLAG = 25;

// ============================================================================
// Freibeträge vom Erwerbseinkommen nach § 11b SGB II
// ============================================================================
// Bei Erwerbstätigkeit wird nicht das gesamte Einkommen angerechnet!
// Quelle: https://www.buergergeld.org/sgb-ii/einkommen/
const FREIBETRAEGE = {
  // § 11b Abs. 2 SGB II: Grundfreibetrag
  grundfreibetrag: 100,
  
  // § 11b Abs. 3 SGB II: Erwerbstätigenfreibetrag (gestaffelt)
  freibetrag_100_520: 0.20,    // 20% von 100,01€ bis 520€
  freibetrag_520_1000: 0.30,   // 30% von 520,01€ bis 1.000€
  freibetrag_1000_1200: 0.10,  // 10% von 1.000,01€ bis 1.200€ (ohne Kind)
  freibetrag_1000_1500: 0.10,  // 10% von 1.000,01€ bis 1.500€ (mit Kind)
};

interface Kind {
  alter: 'klein' | 'mittel' | 'gross';
}

function berechneKindRegelsatz(alter: 'klein' | 'mittel' | 'gross'): number {
  switch (alter) {
    case 'klein': return REGELSAETZE_2026.kind_0_5;
    case 'mittel': return REGELSAETZE_2026.kind_6_13;
    case 'gross': return REGELSAETZE_2026.kind_14_17;
  }
}

function berechneEinkommenFreibetrag(brutto: number, hatKinder: boolean): number {
  if (brutto <= 100) return brutto; // Alles anrechnungsfrei
  
  let freibetrag = FREIBETRAEGE.grundfreibetrag;
  
  // 100-520€: 20% frei
  if (brutto > 100) {
    freibetrag += Math.min(brutto - 100, 420) * FREIBETRAEGE.freibetrag_100_520;
  }
  
  // 520-1000€: 30% frei
  if (brutto > 520) {
    freibetrag += Math.min(brutto - 520, 480) * FREIBETRAEGE.freibetrag_520_1000;
  }
  
  // 1000-1200/1500€: 10% frei
  const obergrenze = hatKinder ? 1500 : 1200;
  if (brutto > 1000) {
    freibetrag += Math.min(brutto - 1000, obergrenze - 1000) * FREIBETRAEGE.freibetrag_1000_1200;
  }
  
  return Math.round(freibetrag);
}

export default function BuergergeldRechner() {
  const [mitPartner, setMitPartner] = useState(false);
  const [kinder, setKinder] = useState<Kind[]>([]);
  const [warmmiete, setWarmmiete] = useState(600);
  const [einkommen, setEinkommen] = useState(0);

  const ergebnis = useMemo(() => {
    // Regelbedarf berechnen
    let regelbedarf = 0;
    if (mitPartner) {
      regelbedarf = REGELSAETZE_2026.partner * 2;
    } else {
      regelbedarf = REGELSAETZE_2026.alleinstehend;
    }
    
    // Kinder (Regelbedarf)
    kinder.forEach(kind => {
      regelbedarf += berechneKindRegelsatz(kind.alter);
    });
    
    // Kindersofortzuschlag nach § 72 SGB II (25€ pro Kind)
    // Wird zusätzlich zum Regelbedarf gezahlt
    const kindersofortzuschlag = kinder.length * KINDERSOFORTZUSCHLAG;
    
    // Kosten der Unterkunft (KdU) - vereinfacht: volle Warmmiete
    // Nach § 22 SGB II werden angemessene KdU übernommen
    const kdu = warmmiete;
    
    // Gesamtbedarf (inkl. Kindersofortzuschlag)
    const gesamtbedarf = regelbedarf + kindersofortzuschlag + kdu;
    
    // Anrechenbares Einkommen
    const freibetrag = berechneEinkommenFreibetrag(einkommen, kinder.length > 0);
    const anrechnung = Math.max(0, einkommen - freibetrag);
    
    // Bürgergeld-Anspruch
    const anspruch = Math.max(0, gesamtbedarf - anrechnung);
    
    return {
      regelbedarf,
      kindersofortzuschlag,
      kdu,
      gesamtbedarf,
      freibetrag,
      anrechnung,
      anspruch,
      hatAnspruch: anspruch > 0,
      anzahlKinder: kinder.length,
    };
  }, [mitPartner, kinder, warmmiete, einkommen]);

  const addKind = (alter: 'klein' | 'mittel' | 'gross') => {
    if (kinder.length < 5) {
      setKinder([...kinder, { alter }]);
    }
  };

  const removeKind = (index: number) => {
    setKinder(kinder.filter((_, i) => i !== index));
  };

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Haushalt */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Haushalt</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMitPartner(false)}
              className={`p-4 rounded-xl text-center transition-all ${
                !mitPartner
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl">👤</span>
              <div className="font-bold mt-1">Alleinstehend</div>
              <div className="text-xs mt-1 opacity-80">{formatEuro(REGELSAETZE_2026.alleinstehend)}</div>
            </button>
            <button
              onClick={() => setMitPartner(true)}
              className={`p-4 rounded-xl text-center transition-all ${
                mitPartner
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl">👫</span>
              <div className="font-bold mt-1">Mit Partner</div>
              <div className="text-xs mt-1 opacity-80">je {formatEuro(REGELSAETZE_2026.partner)}</div>
            </button>
          </div>
        </div>

        {/* Kinder */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Kinder im Haushalt</span>
          </label>
          
          {kinder.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {kinder.map((kind, i) => (
                <span 
                  key={i}
                  className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                >
                  {kind.alter === 'klein' ? '👶 0-5 J.' : kind.alter === 'mittel' ? '🧒 6-13 J.' : '🧑 14-17 J.'}
                  <button 
                    onClick={() => removeKind(i)}
                    className="text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => addKind('klein')}
              disabled={kinder.length >= 5}
              className="p-3 bg-gray-100 rounded-xl text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div>👶</div>
              <div className="font-medium">0-5 Jahre</div>
              <div className="text-xs text-gray-500">{formatEuro(REGELSAETZE_2026.kind_0_5)}</div>
            </button>
            <button
              onClick={() => addKind('mittel')}
              disabled={kinder.length >= 5}
              className="p-3 bg-gray-100 rounded-xl text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div>🧒</div>
              <div className="font-medium">6-13 Jahre</div>
              <div className="text-xs text-gray-500">{formatEuro(REGELSAETZE_2026.kind_6_13)}</div>
            </button>
            <button
              onClick={() => addKind('gross')}
              disabled={kinder.length >= 5}
              className="p-3 bg-gray-100 rounded-xl text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div>🧑</div>
              <div className="font-medium">14-17 Jahre</div>
              <div className="text-xs text-gray-500">{formatEuro(REGELSAETZE_2026.kind_14_17)}</div>
            </button>
          </div>
        </div>

        {/* Warmmiete */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Warmmiete (inkl. Nebenkosten)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={warmmiete}
              onChange={(e) => setWarmmiete(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none"
              min="0"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </div>

        {/* Einkommen */}
        <div>
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Monatliches Bruttoeinkommen</span>
            <span className="text-xs text-gray-500 ml-2">(aus Erwerbstätigkeit)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={einkommen}
              onChange={(e) => setEinkommen(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none"
              min="0"
              step="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className={`rounded-2xl shadow-lg p-6 text-white mb-6 ${
        ergebnis.hatAnspruch 
          ? 'bg-gradient-to-br from-green-500 to-teal-600' 
          : 'bg-gradient-to-br from-gray-500 to-gray-600'
      }`}>
        <h3 className="text-sm font-medium opacity-80 mb-1">
          {ergebnis.hatAnspruch ? 'Dein Bürgergeld-Anspruch' : 'Kein Anspruch'}
        </h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.anspruch)}</span>
            <span className="text-xl opacity-80">/ Monat</span>
          </div>
        </div>

        {ergebnis.hatAnspruch && (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="opacity-80">Pro Jahr</span>
              <span className="text-xl font-bold">{formatEuro(ergebnis.anspruch * 12)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Aufschlüsselung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnung im Detail</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Regelbedarf</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.regelbedarf)}</span>
          </div>
          {ergebnis.kindersofortzuschlag > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
              <span>+ Kindersofortzuschlag (§ 72 SGB II)</span>
              <span className="font-bold">{formatEuro(ergebnis.kindersofortzuschlag)} ({ergebnis.anzahlKinder} × 25€)</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">+ Kosten der Unterkunft (KdU)</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.kdu)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 bg-gray-50 -mx-6 px-6">
            <span className="font-medium text-gray-700">= Gesamtbedarf</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.gesamtbedarf)}</span>
          </div>
          
          {einkommen > 0 && (
            <>
              <div className="flex justify-between py-2 border-b border-gray-100 text-gray-500">
                <span>Bruttoeinkommen</span>
                <span>{formatEuro(einkommen)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
                <span>− Freibetrag</span>
                <span>− {formatEuro(ergebnis.freibetrag)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
                <span>= Anrechnung</span>
                <span>− {formatEuro(ergebnis.anrechnung)}</span>
              </div>
            </>
          )}
          
          <div className={`flex justify-between py-3 -mx-6 px-6 rounded-b-2xl ${
            ergebnis.hatAnspruch ? 'bg-green-50' : 'bg-gray-100'
          }`}>
            <span className="font-bold text-gray-800">Bürgergeld-Anspruch</span>
            <span className={`font-bold text-xl ${ergebnis.hatAnspruch ? 'text-green-600' : 'text-gray-600'}`}>
              {formatEuro(ergebnis.anspruch)}
            </span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert's</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Regelbedarf + Miete</strong> = Gesamtbedarf</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>100 € Grundfreibetrag</strong> bei Erwerbstätigkeit</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Bis 30% Freibetrag</strong> auf Einkommen 100-1000 €</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Vermögen bis <strong>40.000 € geschützt</strong> (1 Jahr Karenzzeit)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>+25 € Kindersofortzuschlag</strong> pro Kind zusätzlich (§ 72 SGB II)</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-green-50 rounded-xl p-4">
            <p className="font-semibold text-green-900">Jobcenter</p>
            <p className="text-sm text-green-700 mt-1">Zuständig ist das Jobcenter an deinem Wohnort.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Online beantragen</p>
                <a 
                  href="https://www.jobcenter.digital"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  jobcenter.digital →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Bürgertelefon</p>
                <a href="tel:08004555500" className="text-blue-600 hover:underline font-mono">0800 4 5555 00</a>
                <p className="text-xs text-gray-500">Kostenfrei</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mehrbedarf Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <h4 className="font-bold text-blue-800 mb-2">➕ Mehrbedarf (nicht im Rechner enthalten)</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Alleinerziehende:</strong> +12% bis +60% je nach Kinderzahl/Alter</li>
          <li>• <strong>Schwangere:</strong> +17% ab 13. Schwangerschaftswoche</li>
          <li>• <strong>Menschen mit Behinderung:</strong> +17-35% je nach Merkzeichen</li>
          <li>• <strong>Kranke:</strong> Mehrbedarf für kostenaufwändige Ernährung möglich</li>
        </ul>
        <p className="text-xs text-blue-600 mt-2">Diese Mehrbedarfe werden zusätzlich zum Regelbedarf gewährt (§ 21 SGB II).</p>
      </div>

      {/* Hinweis Gesetzesänderung */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <h4 className="font-bold text-amber-800 mb-2">📢 Änderungen ab 1. Juli 2026: „Grundsicherungsgeld"</h4>
        <div className="text-sm text-amber-700 space-y-2">
          <p>Das Bürgergeld wird zum <strong>„Grundsicherungsgeld"</strong> umbenannt. Wichtige Neuerungen:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Vermittlungsvorrang:</strong> Arbeitsvermittlung hat Priorität vor Weiterbildung</li>
            <li><strong>Vermögen:</strong> Karenzzeit wird abgeschafft, Freibeträge werden altersabhängig</li>
            <li><strong>Sanktionen verschärft:</strong> Bis zu 30% Kürzung bei Pflichtverletzung</li>
            <li><strong>Wohnkosten:</strong> Deckelung schon in Karenzzeit (1,5× Angemessenheitsgrenze)</li>
            <li><strong>Alleinerziehende:</strong> Ab 1 Jahr (statt 3 Jahre) für Arbeit heranziehbar</li>
          </ul>
          <p className="text-xs mt-2">Quelle: Bundeskabinett-Beschluss vom 17.12.2025, Bundestag berät aktuell</p>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.bundesregierung.de/breg-de/aktuelles/nullrunde-buergergeld-2383676"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesregierung – Regelbedarfe 2026
          </a>
          <a 
            href="https://www.arbeitsagentur.de/arbeitslos-arbeit-finden/buergergeld"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesagentur für Arbeit – Bürgergeld
          </a>
          <a 
            href="https://www.bmas.de/DE/Arbeit/Grundsicherung-Buergergeld/grundsicherung-buergergeld.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMAS – Bürgergeld
          </a>
          <a 
            href="https://www.finanztip.de/buergergeld/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Finanztip – Bürgergeld 2026 & Grundsicherungsgeld
          </a>
          <a 
            href="https://www.bundesregierung.de/breg-de/aktuelles/kabinett-neue-grundsicherung-2399562"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesregierung – Neue Grundsicherung (Kabinettsbeschluss)
          </a>
        </div>
      </div>
    </div>
  );
}
