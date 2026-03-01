import { useState, useEffect, useCallback } from 'react';

interface MieterhoehungResult {
  aktuelleKaltmiete: number;
  maxErhoehteMiete: number;
  maxErhoehungAbsolut: number;
  maxErhoehungProzent: number;
  kappungsgrenzeAngewandt: boolean;
  vergleichsmieteAngewandt: boolean;
  naechsteErhoehungMoeglich: Date;
  wirksamkeitsDatum: Date;
  hinweise: string[];
}

// Städte mit 15% Kappungsgrenze (vereinfachte Liste der wichtigsten)
const STAEDTE_15_PROZENT = [
  // Bayern
  'München', 'Augsburg', 'Ingolstadt', 'Bamberg', 'Regensburg', 'Nürnberg', 'Würzburg', 'Erlangen', 'Fürth', 'Rosenheim', 'Freising', 'Dachau', 'Landshut', 'Passau', 'Straubing',
  // Baden-Württemberg
  'Stuttgart', 'Karlsruhe', 'Heidelberg', 'Freiburg', 'Mannheim', 'Ulm', 'Heilbronn', 'Pforzheim', 'Reutlingen', 'Esslingen', 'Ludwigsburg', 'Tübingen', 'Konstanz', 'Böblingen',
  // Berlin
  'Berlin',
  // Brandenburg
  'Potsdam', 'Hoppegarten', 'Wildau', 'Kleinmachnow', 'Teltow', 'Stahnsdorf', 'Falkensee', 'Bernau', 'Oranienburg',
  // Bremen
  'Bremen',
  // Hamburg
  'Hamburg',
  // Hessen
  'Frankfurt', 'Frankfurt am Main', 'Wiesbaden', 'Darmstadt', 'Kassel', 'Offenbach', 'Hanau', 'Gießen', 'Marburg', 'Bad Homburg', 'Rüsselsheim', 'Oberursel',
  // Mecklenburg-Vorpommern
  'Rostock', 'Greifswald',
  // Niedersachsen
  'Hannover', 'Braunschweig', 'Wolfsburg', 'Osnabrück', 'Oldenburg', 'Göttingen', 'Lüneburg', 'Celle',
  // Nordrhein-Westfalen
  'Düsseldorf', 'Köln', 'Bonn', 'Münster', 'Aachen', 'Bielefeld', 'Leverkusen', 'Paderborn',
  // Rheinland-Pfalz
  'Mainz', 'Landau', 'Ludwigshafen', 'Speyer',
  // Sachsen
  'Dresden', 'Leipzig',
  // Schleswig-Holstein
  'Kiel', 'Lübeck', 'Flensburg', 'Neumünster', 'Sylt',
  // Thüringen
  'Erfurt', 'Jena', 'Weimar'
];

const formatCurrency = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
};

const formatPercent = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function MieterhoehungRechner() {
  // Input State
  const [aktuelleKaltmiete, setAktuelleKaltmiete] = useState<number>(800);
  const [wohnflaeche, setWohnflaeche] = useState<number>(60);
  const [vergleichsmieteQm, setVergleichsmieteQm] = useState<number>(12);
  const [letzteErhoehungDatum, setLetzteErhoehungDatum] = useState<string>('');
  const [mietbeginnDatum, setMietbeginnDatum] = useState<string>('');
  const [stadt, setStadt] = useState<string>('');
  const [manuelleKappungsgrenze, setManuelleKappungsgrenze] = useState<number | null>(null);
  
  // Berechnung States
  const [kappungsgrenze, setKappungsgrenze] = useState<number>(20);
  const [result, setResult] = useState<MieterhoehungResult | null>(null);
  const [showStadtInfo, setShowStadtInfo] = useState(false);

  // Kappungsgrenze basierend auf Stadt ermitteln
  useEffect(() => {
    if (manuelleKappungsgrenze !== null) {
      setKappungsgrenze(manuelleKappungsgrenze);
      return;
    }
    
    const stadtNormalized = stadt.trim().toLowerCase();
    const ist15Prozent = STAEDTE_15_PROZENT.some(s => 
      s.toLowerCase() === stadtNormalized || 
      stadtNormalized.includes(s.toLowerCase()) ||
      s.toLowerCase().includes(stadtNormalized)
    );
    setKappungsgrenze(ist15Prozent ? 15 : 20);
  }, [stadt, manuelleKappungsgrenze]);

  const berechneMieterhoehung = useCallback(() => {
    const vergleichsmieteGesamt = vergleichsmieteQm * wohnflaeche;
    const hinweise: string[] = [];
    
    // Maximale Erhöhung nach Kappungsgrenze (in 3 Jahren)
    const maxNachKappung = aktuelleKaltmiete * (1 + kappungsgrenze / 100);
    
    // Maximale Miete ist das Minimum aus Vergleichsmiete und Kappungsgrenze
    let maxErhoehteMiete = Math.min(maxNachKappung, vergleichsmieteGesamt);
    
    // Prüfen welche Grenze greift
    let kappungsgrenzeAngewandt = false;
    let vergleichsmieteAngewandt = false;
    
    if (maxErhoehteMiete === maxNachKappung && maxNachKappung < vergleichsmieteGesamt) {
      kappungsgrenzeAngewandt = true;
      hinweise.push(`Die Kappungsgrenze von ${kappungsgrenze}% begrenzt die Erhöhung.`);
    } else if (maxErhoehteMiete === vergleichsmieteGesamt && vergleichsmieteGesamt < maxNachKappung) {
      vergleichsmieteAngewandt = true;
      hinweise.push('Die ortsübliche Vergleichsmiete begrenzt die Erhöhung.');
    } else if (maxNachKappung === vergleichsmieteGesamt) {
      kappungsgrenzeAngewandt = true;
      vergleichsmieteAngewandt = true;
      hinweise.push('Kappungsgrenze und Vergleichsmiete greifen gleichermaßen.');
    }
    
    // Wenn aktuelle Miete bereits >= Vergleichsmiete
    if (aktuelleKaltmiete >= vergleichsmieteGesamt) {
      maxErhoehteMiete = aktuelleKaltmiete;
      hinweise.push('⚠️ Ihre Miete entspricht bereits der ortsüblichen Vergleichsmiete oder liegt darüber. Eine Erhöhung ist nicht zulässig.');
    }
    
    const maxErhoehungAbsolut = Math.max(0, maxErhoehteMiete - aktuelleKaltmiete);
    const maxErhoehungProzent = aktuelleKaltmiete > 0 ? (maxErhoehungAbsolut / aktuelleKaltmiete) * 100 : 0;
    
    // Berechnung der Fristen
    let naechsteErhoehungMoeglich: Date;
    let wirksamkeitsDatum: Date;
    
    const heute = new Date();
    
    if (letzteErhoehungDatum) {
      // 15 Monate nach Wirksamkeit der letzten Erhöhung (12 Monate Sperrfrist + 3 Monate Zustimmungsfrist)
      const letzteErhoehung = new Date(letzteErhoehungDatum);
      naechsteErhoehungMoeglich = new Date(letzteErhoehung);
      naechsteErhoehungMoeglich.setMonth(naechsteErhoehungMoeglich.getMonth() + 12);
      
      // Wirksamkeit nach Zustimmungsfrist (3 Monate nach Zugang des Erhöhungsverlangens)
      wirksamkeitsDatum = new Date(naechsteErhoehungMoeglich);
      wirksamkeitsDatum.setMonth(wirksamkeitsDatum.getMonth() + 3);
      
      if (naechsteErhoehungMoeglich > heute) {
        hinweise.push(`Eine neue Mieterhöhung kann frühestens am ${formatDate(naechsteErhoehungMoeglich)} verlangt werden.`);
      }
    } else if (mietbeginnDatum) {
      // Erste Erhöhung: 12 Monate nach Mietbeginn möglich
      const mietbeginn = new Date(mietbeginnDatum);
      naechsteErhoehungMoeglich = new Date(mietbeginn);
      naechsteErhoehungMoeglich.setMonth(naechsteErhoehungMoeglich.getMonth() + 12);
      
      wirksamkeitsDatum = new Date(naechsteErhoehungMoeglich);
      wirksamkeitsDatum.setMonth(wirksamkeitsDatum.getMonth() + 3);
      
      if (naechsteErhoehungMoeglich > heute) {
        hinweise.push(`Erste Mieterhöhung kann frühestens am ${formatDate(naechsteErhoehungMoeglich)} verlangt werden.`);
      }
    } else {
      // Ohne Datumsangabe: Frühestens heute
      naechsteErhoehungMoeglich = heute;
      wirksamkeitsDatum = new Date(heute);
      wirksamkeitsDatum.setMonth(wirksamkeitsDatum.getMonth() + 3);
    }
    
    // Zusätzliche Hinweise
    if (kappungsgrenze === 15) {
      hinweise.push(`In ${stadt || 'Ihrer Stadt'} gilt die abgesenkte Kappungsgrenze von 15%.`);
    }
    
    setResult({
      aktuelleKaltmiete,
      maxErhoehteMiete,
      maxErhoehungAbsolut,
      maxErhoehungProzent,
      kappungsgrenzeAngewandt,
      vergleichsmieteAngewandt,
      naechsteErhoehungMoeglich,
      wirksamkeitsDatum,
      hinweise
    });
  }, [aktuelleKaltmiete, wohnflaeche, vergleichsmieteQm, letzteErhoehungDatum, mietbeginnDatum, stadt, kappungsgrenze]);

  useEffect(() => {
    berechneMieterhoehung();
  }, [berechneMieterhoehung]);

  // Aktuelle Miete pro qm
  const aktuelleQmMiete = wohnflaeche > 0 ? aktuelleKaltmiete / wohnflaeche : 0;
  const differenzZuVergleichsmiete = vergleichsmieteQm - aktuelleQmMiete;

  return (
    <div className="space-y-6">
      {/* Eingabebereich */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Ihre Mietdaten</h2>
        
        <div className="space-y-4">
          {/* Aktuelle Kaltmiete */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aktuelle Kaltmiete (netto) *
            </label>
            <div className="relative">
              <input
                type="number"
                value={aktuelleKaltmiete || ''}
                onChange={(e) => setAktuelleKaltmiete(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="800"
                min="0"
                step="10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€/Monat</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Nur Kaltmiete ohne Nebenkosten</p>
          </div>

          {/* Wohnfläche */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wohnfläche *
            </label>
            <div className="relative">
              <input
                type="number"
                value={wohnflaeche || ''}
                onChange={(e) => setWohnflaeche(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="60"
                min="1"
                step="1"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">m²</span>
            </div>
          </div>

          {/* Ortsübliche Vergleichsmiete */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ortsübliche Vergleichsmiete (laut Mietspiegel) *
            </label>
            <div className="relative">
              <input
                type="number"
                value={vergleichsmieteQm || ''}
                onChange={(e) => setVergleichsmieteQm(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="12"
                min="0"
                step="0.5"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€/m²</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              💡 Finden Sie im <a href="https://www.immobilienscout24.de/wissen/mieten/mietspiegel.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Mietspiegel Ihrer Gemeinde</a>
            </p>
          </div>

          {/* Stadt/Gemeinde */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stadt/Gemeinde
            </label>
            <input
              type="text"
              value={stadt}
              onChange={(e) => setStadt(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="z.B. München, Berlin, Hamburg..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Zur automatischen Ermittlung der Kappungsgrenze (15% oder 20%)
            </p>
          </div>

          {/* Kappungsgrenze manuell */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kappungsgrenze: <span className="font-bold text-blue-600">{kappungsgrenze}%</span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setManuelleKappungsgrenze(15)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  kappungsgrenze === 15
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                15% (angespannte Wohnungsmärkte)
              </button>
              <button
                onClick={() => setManuelleKappungsgrenze(20)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  kappungsgrenze === 20
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                20% (Standard)
              </button>
            </div>
            <button
              onClick={() => setShowStadtInfo(!showStadtInfo)}
              className="mt-2 text-xs text-blue-600 hover:underline"
            >
              {showStadtInfo ? 'Städte-Liste ausblenden ↑' : 'Welche Städte haben 15%? ↓'}
            </button>
            {showStadtInfo && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg text-xs text-gray-600 max-h-40 overflow-y-auto">
                <strong>Städte mit 15% Kappungsgrenze (Auswahl):</strong><br/>
                Berlin, Hamburg, München, Köln, Frankfurt, Stuttgart, Düsseldorf, Dortmund, Leipzig, Dresden, Hannover, Nürnberg, Potsdam, Freiburg, Heidelberg, Bonn, Münster, Augsburg, Kiel, Erfurt, Jena, Rostock, Greifswald, Mainz, Ludwigshafen u.v.m.
                <br/><br/>
                <a href="https://mieterbund.de/service/mieterschutzverordnungen/kappungsgrenze/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Vollständige Liste beim Deutschen Mieterbund →
                </a>
              </div>
            )}
          </div>

          {/* Datum letzte Mieterhöhung */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Datum der letzten Mieterhöhung
            </label>
            <input
              type="date"
              value={letzteErhoehungDatum}
              onChange={(e) => {
                setLetzteErhoehungDatum(e.target.value);
                if (e.target.value) setMietbeginnDatum('');
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Wann wurde die Miete zuletzt erhöht (Wirksamkeitsdatum)?
            </p>
          </div>

          {/* Alternativ: Mietbeginn */}
          {!letzteErhoehungDatum && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Oder: Mietbeginn (wenn noch keine Erhöhung)
              </label>
              <input
                type="date"
                value={mietbeginnDatum}
                onChange={(e) => setMietbeginnDatum(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Ergebnis */}
      {result && (
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-medium text-emerald-100 mb-2">Maximale Mieterhöhung</h3>
          
          <div className="text-center py-4">
            <div className="text-4xl font-bold mb-1">
              + {formatCurrency(result.maxErhoehungAbsolut)}
            </div>
            <div className="text-emerald-200 text-sm">
              maximal zulässige Erhöhung ({formatPercent(result.maxErhoehungProzent)})
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-sm text-emerald-200">Aktuelle Miete</div>
              <div className="text-xl font-bold">{formatCurrency(aktuelleKaltmiete)}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-sm text-emerald-200">Maximal erhöhte Miete</div>
              <div className="text-xl font-bold">{formatCurrency(result.maxErhoehteMiete)}</div>
            </div>
          </div>

          {/* Vergleichsmiete Info */}
          <div className="mt-4 bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-100">Ihre aktuelle Miete/m²:</span>
              <span className="font-bold">{formatCurrency(aktuelleQmMiete)}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-100">Vergleichsmiete/m²:</span>
              <span className="font-bold">{formatCurrency(vergleichsmieteQm)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-100">Differenz:</span>
              <span className={`font-bold ${differenzZuVergleichsmiete > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
                {differenzZuVergleichsmiete > 0 ? '+' : ''}{formatCurrency(differenzZuVergleichsmiete)}/m²
              </span>
            </div>
          </div>

          {/* Fristen */}
          <div className="mt-4 grid grid-cols-1 gap-2">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-sm text-emerald-200">Nächste Erhöhung möglich ab:</div>
              <div className="text-lg font-bold">{formatDate(result.naechsteErhoehungMoeglich)}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-sm text-emerald-200">Wirksamkeit frühestens:</div>
              <div className="text-lg font-bold">{formatDate(result.wirksamkeitsDatum)}</div>
              <div className="text-xs text-emerald-200 mt-1">
                (3 Monate Zustimmungsfrist nach Erhöhungsverlangen)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hinweise */}
      {result && result.hinweise.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h3 className="font-semibold text-amber-800 mb-3">📋 Hinweise zu Ihrer Situation</h3>
          <ul className="space-y-2 text-sm text-amber-700">
            {result.hinweise.map((hinweis, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>{hinweis}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Visualisierung */}
      {result && result.maxErhoehungAbsolut > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Mietentwicklung</h3>
          
          <div className="space-y-3">
            {/* Aktuelle Miete */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Aktuelle Kaltmiete</span>
                <span className="font-medium">{formatCurrency(aktuelleKaltmiete)}</span>
              </div>
              <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-lg transition-all duration-500"
                  style={{ width: `${(aktuelleKaltmiete / (vergleichsmieteQm * wohnflaeche)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Maximal erhöhte Miete */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Maximal erhöhte Miete</span>
                <span className="font-medium">{formatCurrency(result.maxErhoehteMiete)}</span>
              </div>
              <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-lg transition-all duration-500"
                  style={{ width: `${(result.maxErhoehteMiete / (vergleichsmieteQm * wohnflaeche)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Vergleichsmiete */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Ortsübliche Vergleichsmiete</span>
                <span className="font-medium">{formatCurrency(vergleichsmieteQm * wohnflaeche)}</span>
              </div>
              <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div 
                  className="h-full bg-gray-400 rounded-lg"
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info-Box: Kappungsgrenze */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="font-semibold text-blue-800 mb-3">ℹ️ Was ist die Kappungsgrenze?</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span><strong>Definition:</strong> Die Kappungsgrenze begrenzt Mieterhöhungen auf maximal 20% (bzw. 15% in angespannten Wohnungsmärkten) innerhalb von 3 Jahren.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span><strong>Rechtsgrundlage:</strong> § 558 Abs. 3 BGB</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span><strong>Vergleichsmiete:</strong> Die Miete darf zusätzlich nie die ortsübliche Vergleichsmiete übersteigen (§ 558 Abs. 1 BGB).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span><strong>Sperrfrist:</strong> Zwischen zwei Erhöhungen müssen mindestens 12 Monate liegen.</span>
          </li>
        </ul>
      </div>

      {/* Info-Box: Zustimmungsverfahren */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
        <h3 className="font-semibold text-emerald-800 mb-3">📝 So läuft eine Mieterhöhung ab</h3>
        <ol className="space-y-2 text-sm text-emerald-700 list-decimal pl-5">
          <li><strong>Erhöhungsverlangen:</strong> Der Vermieter muss die Erhöhung schriftlich begründen (z.B. mit Mietspiegel).</li>
          <li><strong>Überlegungsfrist:</strong> Sie haben bis zum Ende des übernächsten Monats Zeit, zuzustimmen.</li>
          <li><strong>Prüfung:</strong> Prüfen Sie, ob die Erhöhung formal korrekt und inhaltlich berechtigt ist.</li>
          <li><strong>Zustimmung oder Ablehnung:</strong> Bei Ablehnung kann der Vermieter binnen 3 Monaten klagen.</li>
          <li><strong>Wirksamkeit:</strong> Erst nach Ihrer Zustimmung wird die höhere Miete fällig.</li>
        </ol>
      </div>

      {/* Info-Box: Modernisierungsumlage */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
        <h3 className="font-semibold text-purple-800 mb-3">🔧 Modernisierungsumlage (§ 559 BGB)</h3>
        <ul className="space-y-2 text-sm text-purple-700">
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">•</span>
            <span><strong>8% Umlage:</strong> Bei Modernisierungen darf der Vermieter 8% der Kosten jährlich auf die Miete umlegen.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">•</span>
            <span><strong>Deckelung:</strong> Maximal 3 €/m² innerhalb von 6 Jahren (2 €/m² bei Mieten unter 7 €/m²).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">•</span>
            <span><strong>Heizungstausch:</strong> Maximal 50 Cent/m² bei Heizungsmodernisierung (ab 2024).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">•</span>
            <span><strong>Wichtig:</strong> Die Modernisierungsumlage gilt zusätzlich zur normalen Mieterhöhung!</span>
          </li>
        </ul>
      </div>

      {/* Warnhinweise */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <h3 className="font-semibold text-red-800 mb-3">⚠️ Wichtige Hinweise für Mieter</h3>
        <ul className="space-y-2 text-sm text-red-700">
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">•</span>
            <span><strong>Formale Prüfung:</strong> Eine Mieterhöhung muss schriftlich erfolgen und korrekt begründet sein.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">•</span>
            <span><strong>Keine automatische Pflicht:</strong> Sie müssen der Erhöhung nicht zustimmen – prüfen Sie erst!</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">•</span>
            <span><strong>Mieterverein:</strong> Bei Zweifeln lassen Sie das Schreiben vom Mieterverein prüfen.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">•</span>
            <span>Dieser Rechner ersetzt keine <strong>rechtliche Beratung</strong>.</span>
          </li>
        </ul>
      </div>

      {/* Anlaufstellen */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-4">📞 Wichtige Anlaufstellen</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-2xl">🏠</span>
            <div>
              <div className="font-medium text-gray-800">Deutscher Mieterbund</div>
              <div className="text-sm text-gray-600">Beratung und Rechtsschutz für Mieter</div>
              <a 
                href="https://www.mieterbund.de/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                mieterbund.de →
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-2xl">📊</span>
            <div>
              <div className="font-medium text-gray-800">Mietspiegel Ihrer Stadt</div>
              <div className="text-sm text-gray-600">Ortsübliche Vergleichsmiete ermitteln</div>
              <a 
                href="https://www.immobilienscout24.de/wissen/mieten/mietspiegel.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Mietspiegel finden →
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-2xl">⚖️</span>
            <div>
              <div className="font-medium text-gray-800">Verbraucherzentrale</div>
              <div className="text-sm text-gray-600">Unabhängige Beratung zu Mietrecht</div>
              <a 
                href="https://www.verbraucherzentrale.de/wissen/geld-versicherungen/miete/mieterhoehung-wann-und-wie-viel-ist-erlaubt-5765" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                verbraucherzentrale.de/mieterhöhung →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-700 mb-3">📚 Rechtsgrundlagen</h3>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>
            <a href="https://www.gesetze-im-internet.de/bgb/__558.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              § 558 BGB – Mieterhöhung bis zur ortsüblichen Vergleichsmiete
            </a>
          </li>
          <li>
            <a href="https://www.gesetze-im-internet.de/bgb/__558a.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              § 558a BGB – Form und Begründung der Mieterhöhung
            </a>
          </li>
          <li>
            <a href="https://www.gesetze-im-internet.de/bgb/__558b.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              § 558b BGB – Zustimmung zur Mieterhöhung
            </a>
          </li>
          <li>
            <a href="https://www.gesetze-im-internet.de/bgb/__559.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              § 559 BGB – Mieterhöhung nach Modernisierungsmaßnahmen
            </a>
          </li>
          <li>
            <a href="https://mieterbund.de/service/mieterschutzverordnungen/kappungsgrenze/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Übersicht: Städte mit 15% Kappungsgrenze (Mieterbund)
            </a>
          </li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          Stand: März 2026. Alle Angaben ohne Gewähr. 
          Dieser Rechner dient nur zur Orientierung und ersetzt keine Rechtsberatung.
        </p>
      </div>
    </div>
  );
}
