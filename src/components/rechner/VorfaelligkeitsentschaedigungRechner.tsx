import { useState, useMemo } from 'react';

// Detaillierte Zeile für die Berechnung
interface BerechnungsZeile {
  monat: number;
  restschuld: number;
  vertragszins: number;
  marktzins: number;
  zinsdifferenz: number;
  barwert: number;
}

export default function VorfaelligkeitsentschaedigungRechner() {
  // Eingabewerte
  const [restschuld, setRestschuld] = useState(150000);
  const [vertragszins, setVertragszins] = useState(3.5);
  const [restlaufzeitMonate, setRestlaufzeitMonate] = useState(60);
  const [marktzins, setMarktzins] = useState(3.0);
  const [tilgungssatz, setTilgungssatz] = useState(2.0);
  const [berechnungsmethode, setBerechnungsmethode] = useState<'aktiv-passiv' | 'vereinfacht'>('aktiv-passiv');
  const [kreditart, setKreditart] = useState<'immobilien' | 'verbraucher'>('immobilien');
  const [zeigeDetails, setZeigeDetails] = useState(false);

  const ergebnis = useMemo(() => {
    // Grundwerte
    const P = restschuld; // Restschuld
    const rV = vertragszins / 100 / 12; // Monatlicher Vertragszins
    const rM = marktzins / 100 / 12; // Monatlicher Marktzins
    const n = restlaufzeitMonate; // Restlaufzeit in Monaten
    const tilgung = tilgungssatz / 100; // Jährliche Tilgung

    // === Berechnung der monatlichen Rate (Annuität) ===
    // Rate = Restschuld × (Zinssatz + Tilgung) / 12
    const jahresRate = P * (vertragszins / 100 + tilgung);
    const monatsRate = jahresRate / 12;

    // === Methode 1: Aktiv-Passiv-Methode (Barwertmethode) ===
    // Die Bank berechnet den Zinsmargenschaden als Barwert der entgangenen Zinsen
    const berechnungszeilen: BerechnungsZeile[] = [];
    let aktuelleRestschuld = P;
    let gesamtZinsmargenschaden = 0;

    for (let monat = 1; monat <= n; monat++) {
      // Zinsen im aktuellen Monat bei Vertragszins
      const vertragszinsBetrag = aktuelleRestschuld * rV;
      
      // Was die Bank bei Wiederanlage zum Marktzins verdienen würde
      const marktzinsBetrag = aktuelleRestschuld * rM;
      
      // Zinsdifferenz (entgangener Gewinn pro Monat)
      const zinsdifferenz = Math.max(0, vertragszinsBetrag - marktzinsBetrag);
      
      // Barwert dieser Zinsdifferenz (abgezinst auf heute)
      // Diskontierung mit Marktzins
      const diskontfaktor = Math.pow(1 + rM, -monat);
      const barwert = zinsdifferenz * diskontfaktor;
      
      gesamtZinsmargenschaden += barwert;
      
      berechnungszeilen.push({
        monat,
        restschuld: aktuelleRestschuld,
        vertragszins: vertragszinsBetrag,
        marktzins: marktzinsBetrag,
        zinsdifferenz,
        barwert,
      });
      
      // Tilgung für nächsten Monat berechnen
      const tilgungBetrag = monatsRate - vertragszinsBetrag;
      aktuelleRestschuld = Math.max(0, aktuelleRestschuld - tilgungBetrag);
    }

    // === Gesetzliche Obergrenzen nach §502 BGB ===
    // ACHTUNG: §502 BGB gilt NUR für Verbraucherdarlehen OHNE Grundpfandrecht!
    // Bei Immobilienkrediten (mit Grundschuld) gilt der volle Zinsmargenschaden.
    const maxProzent = n > 12 ? 1.0 : 0.5;
    const gesetzlicheObergrenze = P * (maxProzent / 100);
    const istImmobilienkredit = kreditart === 'immobilien';

    // === Bearbeitungsgebühr (ca. 100-300€ üblich) ===
    const bearbeitungsgebuehr = 300;

    // === Vorfälligkeitsentschädigung ===
    // Immobilienkredit: Voller Zinsmargenschaden (keine §502-Deckelung)
    // Verbraucherkredit: Gedeckelt nach §502 BGB
    const zinsmargenschadenGedeckelt = istImmobilienkredit
      ? gesamtZinsmargenschaden
      : Math.min(gesamtZinsmargenschaden, gesetzlicheObergrenze);
    
    // Bei negativer Zinsdifferenz (Marktzins > Vertragszins) = keine VFE
    const vorfaelligkeitsentschaedigung = zinsmargenschadenGedeckelt > 0 
      ? zinsmargenschadenGedeckelt + bearbeitungsgebuehr 
      : bearbeitungsgebuehr;

    // === Zusätzliche Informationen ===
    const zinsdifferenzProzent = vertragszins - marktzins;
    const restlaufzeitJahre = n / 12;
    
    // Ersparnis durch vorzeitige Ablösung (Zinsen die man sich spart)
    let gesamtZinsenOhneAbloese = 0;
    let tempRestschuld = P;
    for (let monat = 1; monat <= n; monat++) {
      const zinsenMonat = tempRestschuld * rV;
      gesamtZinsenOhneAbloese += zinsenMonat;
      const tilgungMonat = monatsRate - zinsenMonat;
      tempRestschuld = Math.max(0, tempRestschuld - tilgungMonat);
    }

    // Nettoersparnis bei vorzeitiger Ablösung
    const nettoErsparnis = gesamtZinsenOhneAbloese - vorfaelligkeitsentschaedigung;

    // Empfehlung ob Ablösung sinnvoll
    const abloeseEmpfehlung = nettoErsparnis > 0 ? 'sinnvoll' : 'nicht_sinnvoll';

    return {
      restschuld: P,
      vertragszins,
      marktzins,
      restlaufzeitMonate: n,
      restlaufzeitJahre,
      monatsRate,
      zinsdifferenzProzent,
      zinsmargenschaden: gesamtZinsmargenschaden,
      gesetzlicheObergrenze,
      maxProzent,
      bearbeitungsgebuehr,
      vorfaelligkeitsentschaedigung,
      gesamtZinsenOhneAbloese,
      nettoErsparnis,
      abloeseEmpfehlung,
      berechnungszeilen,
      istGedeckelt: !istImmobilienkredit && gesamtZinsmargenschaden > gesetzlicheObergrenze,
      istImmobilienkredit,
    };
  }, [restschuld, vertragszins, restlaufzeitMonate, marktzins, tilgungssatz, berechnungsmethode, kreditart]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatEuroExact = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatProzent = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Kreditart */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Kreditart</span>
            <span className="text-xs text-gray-500 block mt-1">Bestimmt ob §502 BGB-Deckelung gilt</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setKreditart('immobilien')}
              className={`p-3 rounded-xl text-center transition-all text-sm ${
                kreditart === 'immobilien'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="text-xl">🏠</div>
              <div className="font-medium">Immobilienkredit</div>
              <div className="text-xs opacity-80 mt-1">Voller Zinsmargenschaden</div>
            </button>
            <button
              onClick={() => setKreditart('verbraucher')}
              className={`p-3 rounded-xl text-center transition-all text-sm ${
                kreditart === 'verbraucher'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="text-xl">💳</div>
              <div className="font-medium">Verbraucherkredit</div>
              <div className="text-xs opacity-80 mt-1">§502 BGB (max 1%/0,5%)</div>
            </button>
          </div>
          {kreditart === 'immobilien' && (
            <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg mt-2">
              ⚠️ Bei Immobilienkrediten mit Grundschuld gilt §502 BGB <strong>nicht</strong>. Die Bank kann den vollen Zinsmargenschaden berechnen.
            </p>
          )}
        </div>

        {/* Restschuld */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Restschuld des Darlehens</span>
            <span className="text-xs text-gray-500 block mt-1">Aktueller Restbetrag des Kredits</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={restschuld}
              onChange={(e) => setRestschuld(Math.max(1000, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
              min="1000"
              max="2000000"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={restschuld}
            onChange={(e) => setRestschuld(Number(e.target.value))}
            className="w-full mt-3 accent-purple-500"
            min="10000"
            max="500000"
            step="5000"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>10.000 €</span>
            <span>250.000 €</span>
            <span>500.000 €</span>
          </div>
        </div>

        {/* Vertragszins */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Vertraglicher Sollzinssatz (p.a.)</span>
            <span className="text-xs text-gray-500 block mt-1">Ihr aktueller Kreditzins laut Vertrag</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={vertragszins}
              onChange={(e) => setVertragszins(Math.max(0.1, Math.min(15, Number(e.target.value))))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
              min="0.1"
              max="15"
              step="0.1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">%</span>
          </div>
          <input
            type="range"
            value={vertragszins}
            onChange={(e) => setVertragszins(Number(e.target.value))}
            className="w-full mt-3 accent-purple-500"
            min="0.5"
            max="8"
            step="0.1"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0,5%</span>
            <span>4%</span>
            <span>8%</span>
          </div>
        </div>

        {/* Marktzins */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Aktueller Marktzins (p.a.)</span>
            <span className="text-xs text-gray-500 block mt-1">Aktuelle Zinsen für vergleichbare Anlagen (Pfandbriefe)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={marktzins}
              onChange={(e) => setMarktzins(Math.max(0, Math.min(15, Number(e.target.value))))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
              min="0"
              max="15"
              step="0.1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">%</span>
          </div>
          <input
            type="range"
            value={marktzins}
            onChange={(e) => setMarktzins(Number(e.target.value))}
            className="w-full mt-3 accent-purple-500"
            min="0"
            max="8"
            step="0.1"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>4%</span>
            <span>8%</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            💡 Aktuell (2025/2026): Pfandbriefrendite ca. 2,5-3,5% je nach Laufzeit
          </p>
        </div>

        {/* Restlaufzeit */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Restlaufzeit der Zinsbindung</span>
            <span className="text-xs text-gray-500 block mt-1">Verbleibende Monate bis zum Ende der Zinsbindung</span>
          </label>
          <div className="flex items-center justify-center gap-4 mb-3">
            <button
              onClick={() => setRestlaufzeitMonate(Math.max(1, restlaufzeitMonate - 6))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
            >
              −
            </button>
            <div className="text-center px-4">
              <div className="text-4xl font-bold text-gray-800">{restlaufzeitMonate}</div>
              <div className="text-sm text-gray-500">
                Monate ({(restlaufzeitMonate / 12).toFixed(1)} Jahre)
              </div>
            </div>
            <button
              onClick={() => setRestlaufzeitMonate(Math.min(180, restlaufzeitMonate + 6))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
            >
              +
            </button>
          </div>
          <input
            type="range"
            value={restlaufzeitMonate}
            onChange={(e) => setRestlaufzeitMonate(Number(e.target.value))}
            className="w-full mt-2 accent-purple-500"
            min="1"
            max="180"
            step="1"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 Mo.</span>
            <span>7,5 Jahre</span>
            <span>15 Jahre</span>
          </div>
        </div>

        {/* Tilgungssatz */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Anfänglicher Tilgungssatz (p.a.)</span>
            <span className="text-xs text-gray-500 block mt-1">Tilgungsanteil laut Darlehensvertrag</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={tilgungssatz}
              onChange={(e) => setTilgungssatz(Math.max(0.5, Math.min(10, Number(e.target.value))))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
              min="0.5"
              max="10"
              step="0.1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">%</span>
          </div>
          <input
            type="range"
            value={tilgungssatz}
            onChange={(e) => setTilgungssatz(Number(e.target.value))}
            className="w-full mt-3 accent-purple-500"
            min="1"
            max="5"
            step="0.5"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1%</span>
            <span>3%</span>
            <span>5%</span>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">💸 Geschätzte Vorfälligkeitsentschädigung</h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroExact(ergebnis.vorfaelligkeitsentschaedigung)}</span>
          </div>
          <p className="text-purple-100 mt-2 text-sm">
            {ergebnis.istGedeckelt ? (
              <span>⚠️ Gedeckelt auf gesetzliches Maximum ({ergebnis.maxProzent}% der Restschuld) nach §502 BGB</span>
            ) : ergebnis.istImmobilienkredit ? (
              <span>ℹ️ Immobilienkredit: Voller Zinsmargenschaden (§502 BGB gilt nicht)</span>
            ) : (
              <span>ℹ️ Barwertmethode nach Aktiv-Passiv-Verfahren</span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Zinsmargenschaden</span>
            <div className="text-xl font-bold">{formatEuroExact(ergebnis.zinsmargenschaden)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">+ Bearbeitungsgeb.</span>
            <div className="text-xl font-bold">{formatEuroExact(ergebnis.bearbeitungsgebuehr)}</div>
          </div>
        </div>

        {/* Zinsdifferenz-Anzeige */}
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Vertragszins: {formatProzent(ergebnis.vertragszins)}</span>
            <span>Marktzins: {formatProzent(ergebnis.marktzins)}</span>
          </div>
          <div className="flex items-center justify-center">
            <span className={`text-2xl font-bold ${ergebnis.zinsdifferenzProzent > 0 ? 'text-yellow-300' : 'text-green-300'}`}>
              Zinsdifferenz: {ergebnis.zinsdifferenzProzent > 0 ? '+' : ''}{formatProzent(ergebnis.zinsdifferenzProzent)}
            </span>
          </div>
          {ergebnis.zinsdifferenzProzent <= 0 && (
            <p className="text-green-200 text-sm text-center mt-2">
              ✓ Marktzins höher = keine/geringe VFE
            </p>
          )}
        </div>

        {/* Empfehlung */}
        <div className={`rounded-xl p-4 ${ergebnis.abloeseEmpfehlung === 'sinnvoll' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{ergebnis.abloeseEmpfehlung === 'sinnvoll' ? '✅' : '⚠️'}</span>
            <span className="font-bold text-lg">
              Vorzeitige Ablösung {ergebnis.abloeseEmpfehlung === 'sinnvoll' ? 'kann sinnvoll sein' : 'eher nicht empfohlen'}
            </span>
          </div>
          <div className="text-sm">
            <p>Zinsersparnis ohne Ablösung: {formatEuro(ergebnis.gesamtZinsenOhneAbloese)}</p>
            <p className="font-bold">Nettoersparnis bei Ablösung: {formatEuro(ergebnis.nettoErsparnis)}</p>
          </div>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Restschuld</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.restschuld)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Vertragszinssatz</span>
            <span className="text-gray-900">{formatProzent(ergebnis.vertragszins)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Aktueller Marktzins</span>
            <span className="text-gray-900">{formatProzent(ergebnis.marktzins)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Zinsdifferenz</span>
            <span className={`font-medium ${ergebnis.zinsdifferenzProzent > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {ergebnis.zinsdifferenzProzent > 0 ? '+' : ''}{formatProzent(ergebnis.zinsdifferenzProzent)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Restlaufzeit</span>
            <span className="text-gray-900">
              {ergebnis.restlaufzeitMonate} Monate ({ergebnis.restlaufzeitJahre.toFixed(1)} Jahre)
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Monatliche Rate</span>
            <span className="text-gray-900">{formatEuroExact(ergebnis.monatsRate)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Zinsmargenschaden (Barwert)</span>
            <span className="text-red-600">{formatEuroExact(ergebnis.zinsmargenschaden)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Gesetzliche Obergrenze ({ergebnis.maxProzent}%)</span>
            <span className="text-gray-900">{formatEuroExact(ergebnis.gesetzlicheObergrenze)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Bearbeitungsgebühr (geschätzt)</span>
            <span className="text-gray-900">{formatEuroExact(ergebnis.bearbeitungsgebuehr)}</span>
          </div>
          <div className="flex justify-between py-3 bg-purple-50 -mx-6 px-6 rounded-b-xl">
            <span className="font-bold text-purple-800">Vorfälligkeitsentschädigung (gesamt)</span>
            <span className="font-bold text-2xl text-purple-900">
              {formatEuroExact(ergebnis.vorfaelligkeitsentschaedigung)}
            </span>
          </div>
        </div>
      </div>

      {/* Detailberechnung (aufklappbar) */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">📅 Monatliche Aufschlüsselung</h3>
          <button
            onClick={() => setZeigeDetails(!zeigeDetails)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              zeigeDetails
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {zeigeDetails ? '▲ Ausblenden' : '▼ Erste 12 Monate'}
          </button>
        </div>

        {zeigeDetails && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2 text-gray-600">Monat</th>
                  <th className="text-right py-2 text-gray-600">Restschuld</th>
                  <th className="text-right py-2 text-gray-600">Vertr.-Zins</th>
                  <th className="text-right py-2 text-gray-600">Markt-Zins</th>
                  <th className="text-right py-2 text-gray-600">Differenz</th>
                </tr>
              </thead>
              <tbody>
                {ergebnis.berechnungszeilen.slice(0, 12).map((zeile) => (
                  <tr key={zeile.monat} className="border-b border-gray-100">
                    <td className="py-2 font-medium">{zeile.monat}</td>
                    <td className="text-right py-2">{formatEuro(zeile.restschuld)}</td>
                    <td className="text-right py-2">{formatEuroExact(zeile.vertragszins)}</td>
                    <td className="text-right py-2">{formatEuroExact(zeile.marktzins)}</td>
                    <td className="text-right py-2 text-red-600">
                      {formatEuroExact(zeile.zinsdifferenz)}
                    </td>
                  </tr>
                ))}
                {ergebnis.restlaufzeitMonate > 12 && (
                  <tr className="bg-gray-50">
                    <td colSpan={5} className="py-2 text-center text-gray-500 italic">
                      ... weitere {ergebnis.restlaufzeitMonate - 12} Monate
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-purple-50 font-bold">
                  <td className="py-2">Summe (Barwert)</td>
                  <td colSpan={3}></td>
                  <td className="text-right py-2 text-purple-700">
                    {formatEuroExact(ergebnis.zinsmargenschaden)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Was ist die Vorfälligkeitsentschädigung?</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>📋</span>
            <span>
              <strong>Definition:</strong> Die Vorfälligkeitsentschädigung (VFE) ist eine Gebühr, 
              die die Bank berechnet, wenn Sie Ihren Kredit vor Ende der Zinsbindung ablösen.
            </span>
          </li>
          <li className="flex gap-2">
            <span>💰</span>
            <span>
              <strong>Zinsmargenschaden:</strong> Die Bank verliert die Differenz zwischen Ihrem 
              höheren Vertragszins und dem niedrigeren Marktzins (z.B. Pfandbriefrendite).
            </span>
          </li>
          <li className="flex gap-2">
            <span>📊</span>
            <span>
              <strong>Aktiv-Passiv-Methode:</strong> Die Bank berechnet den Barwert aller 
              entgangenen Zinserträge über die Restlaufzeit.
            </span>
          </li>
          <li className="flex gap-2">
            <span>⚖️</span>
            <span>
              <strong>Gesetzliche Grenzen (§502 BGB):</strong> Max. 1% der Restschuld bei 
              &gt;12 Monaten Restlaufzeit, max. 0,5% bei ≤12 Monaten.
            </span>
          </li>
        </ul>
      </div>

      {/* Wann keine VFE anfällt */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-green-800 mb-3">✅ Wann fällt keine VFE an?</h3>
        <ul className="space-y-2 text-sm text-green-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Nach 10 Jahren:</strong> Sonderkündigungsrecht nach §489 BGB – 
              6 Monate Kündigungsfrist, dann VFE-frei!
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Ende der Zinsbindung:</strong> Zum Ende der vereinbarten Zinsbindung 
              können Sie immer kostenfrei ablösen.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Sondertilgungsrecht:</strong> Vereinbarte Sondertilgungen (z.B. 5% p.a.) 
              sind immer VFE-frei.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Fehlerhafte Widerrufsbelehrung:</strong> Bei falscher Belehrung kann der 
              Vertrag auch Jahre später noch widerrufen werden (Widerrufsjoker).
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Marktzins ≥ Vertragszins:</strong> Wenn der aktuelle Marktzins höher ist 
              als Ihr Vertragszins, entsteht der Bank kein Schaden.
            </span>
          </li>
        </ul>
      </div>

      {/* Tipps zur Vermeidung */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-purple-800 mb-3">💡 Tipps zur Reduzierung der VFE</h3>
        <ul className="space-y-2 text-sm text-purple-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>10-Jahres-Regel nutzen:</strong> Warten Sie wenn möglich bis 10 Jahre 
              nach Vollauszahlung – dann können Sie kostenlos kündigen.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Sondertilgungen ausschöpfen:</strong> Nutzen Sie Ihr jährliches 
              Sondertilgungsrecht vollständig vor der Ablösung.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>VFE prüfen lassen:</strong> Banken berechnen oft zu viel – 
              Verbraucherzentralen oder spezialisierte Anwälte können die Berechnung prüfen.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Verhandeln:</strong> Manche Banken erlassen einen Teil der VFE, 
              besonders wenn Sie dort ein neues Darlehen aufnehmen.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Timing:</strong> Bei steigenden Marktzinsen sinkt die VFE – 
              manchmal lohnt sich etwas Geduld.
            </span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Näherungswert:</strong> Diese Berechnung ist eine Schätzung. Die tatsächliche 
              VFE hängt von der individuellen Berechnungsmethode Ihrer Bank ab.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Bank-Berechnung anfordern:</strong> Lassen Sie sich von Ihrer Bank eine 
              verbindliche VFE-Berechnung erstellen.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Prüfung empfohlen:</strong> Studien zeigen, dass ca. 50% der VFE-Berechnungen 
              fehlerhaft sind – eine Prüfung kann sich lohnen!
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Immobilienverkauf:</strong> Bei Verkauf der Immobilie ist die Bank zur 
              Ablösung verpflichtet, kann aber weiterhin VFE verlangen.
            </span>
          </li>
        </ul>
      </div>

      {/* Rechtliche Grundlagen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">⚖️ Rechtliche Grundlagen</h3>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="font-semibold text-gray-900">§502 BGB – Vorfälligkeitsentschädigung</p>
            <p className="text-sm text-gray-700 mt-1">
              Regelt die maximale Höhe der VFE: 1% der Restschuld bei &gt;12 Monaten 
              Restlaufzeit, 0,5% bei ≤12 Monaten.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="font-semibold text-gray-900">§489 BGB – Ordentliches Kündigungsrecht</p>
            <p className="text-sm text-gray-700 mt-1">
              Nach 10 Jahren ab Vollauszahlung kann jedes Darlehen mit 6 Monaten Frist 
              gekündigt werden – ohne VFE.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="font-semibold text-gray-900">BGH-Urteile zur VFE-Berechnung</p>
            <p className="text-sm text-gray-700 mt-1">
              Diverse BGH-Urteile (z.B. XI ZR 388/14) haben die Anforderungen an eine 
              korrekte VFE-Berechnung verschärft.
            </p>
          </div>
        </div>
      </div>

      {/* Verbraucherschutz */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Beratung & Prüfung</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">📞</span>
            <div>
              <p className="font-medium text-gray-800">Verbraucherzentrale</p>
              <a
                href="https://www.verbraucherzentrale.de/wissen/geld-versicherungen/bau-und-immobilienfinanzierung"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                VFE prüfen lassen →
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">⚖️</span>
            <div>
              <p className="font-medium text-gray-800">Fachanwalt Bankrecht</p>
              <p className="text-gray-600">
                Spezialisierte Anwälte prüfen VFE-Berechnungen
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
            href="https://www.gesetze-im-internet.de/bgb/__502.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BGB § 502 – Vorfälligkeitsentschädigung
          </a>
          <a
            href="https://www.gesetze-im-internet.de/bgb/__489.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BGB § 489 – Ordentliches Kündigungsrecht
          </a>
          <a
            href="https://www.gesetze-im-internet.de/bgb/__490.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BGB § 490 – Außerordentliches Kündigungsrecht
          </a>
          <a
            href="https://www.bundesbank.de/de/statistiken/geld-und-kapitalmaerkte/zinssaetze-und-renditen"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesbank – Aktuelle Pfandbriefrenditen
          </a>
          <a
            href="https://www.verbraucherzentrale.de/wissen/geld-versicherungen/bau-und-immobilienfinanzierung/vorfaelligkeitsentschaedigung-so-koennen-sie-die-hoehe-pruefen-5765"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Verbraucherzentrale – VFE prüfen
          </a>
        </div>
      </div>
    </div>
  );
}
