import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Tilgungsplan-Zeile
interface TilgungsPlanZeile {
  monat: number;
  jahr: number;
  restschuld: number;
  zinsen: number;
  tilgung: number;
  rate: number;
}

type Finanzierungsart = 'klassisch' | 'ballon' | 'dreiwege';

export default function AutofinanzierungRechner() {
  // Eingabewerte
  const [fahrzeugpreis, setFahrzeugpreis] = useState(25000);
  const [anzahlung, setAnzahlung] = useState(5000);
  const [zinssatz, setZinssatz] = useState(4.99);
  const [laufzeitMonate, setLaufzeitMonate] = useState(48);
  const [finanzierungsart, setFinanzierungsart] = useState<Finanzierungsart>('klassisch');
  const [schlussrateInput, setSchlussrateInput] = useState(30); // Prozent des Fahrzeugpreises
  const [zeigeTilgungsplan, setZeigeTilgungsplan] = useState(false);

  const ergebnis = useMemo(() => {
    const kreditsumme = Math.max(0, fahrzeugpreis - anzahlung);
    const r = zinssatz / 100 / 12; // Monatlicher Zinssatz
    const n = laufzeitMonate;

    if (kreditsumme <= 0) {
      return {
        monatsrate: 0,
        schlussrate: 0,
        gesamtzinsen: 0,
        gesamtbetrag: fahrzeugpreis,
        kreditsumme: 0,
        zinssatz,
        effektivzins: zinssatz,
        laufzeitMonate: n,
        tilgungsplan: [] as TilgungsPlanZeile[],
        finanzierungsart,
        anzahlung,
        fahrzeugpreis,
      };
    }

    let monatsrate: number;
    let schlussrate: number;
    let gesamtzinsen: number;
    let gesamtbetrag: number;

    if (finanzierungsart === 'klassisch') {
      // === Klassischer Autokredit (Annuitätendarlehen) ===
      schlussrate = 0;
      if (r === 0) {
        monatsrate = kreditsumme / n;
      } else {
        const faktor = Math.pow(1 + r, n);
        monatsrate = kreditsumme * (r * faktor) / (faktor - 1);
      }
      gesamtbetrag = monatsrate * n;
      gesamtzinsen = gesamtbetrag - kreditsumme;

    } else if (finanzierungsart === 'ballon' || finanzierungsart === 'dreiwege') {
      // === Ballonfinanzierung / 3-Wege-Finanzierung ===
      // Schlussrate = Restwert am Ende
      schlussrate = (schlussrateInput / 100) * fahrzeugpreis;
      
      // Kredit mit Schlussrate: Annuität für den Rest
      // Barwert der Schlussrate abziehen
      const barwertSchlussrate = schlussrate / Math.pow(1 + r, n);
      const zuFinanzieren = kreditsumme - barwertSchlussrate;
      
      if (r === 0) {
        monatsrate = zuFinanzieren / n;
      } else {
        const faktor = Math.pow(1 + r, n);
        monatsrate = zuFinanzieren * (r * faktor) / (faktor - 1);
      }
      
      // Gesamtkosten
      gesamtbetrag = monatsrate * n + schlussrate;
      gesamtzinsen = gesamtbetrag - kreditsumme;

    } else {
      monatsrate = 0;
      schlussrate = 0;
      gesamtzinsen = 0;
      gesamtbetrag = 0;
    }

    // Effektivzins (vereinfacht)
    const effektivzins = (Math.pow(1 + r, 12) - 1) * 100;

    // === Tilgungsplan erstellen (jährlich zusammengefasst) ===
    const tilgungsplan: TilgungsPlanZeile[] = [];
    let restschuld = kreditsumme;

    for (let jahr = 1; jahr <= Math.ceil(n / 12); jahr++) {
      const monateImJahr = Math.min(12, n - (jahr - 1) * 12);
      let zinsenJahr = 0;
      let tilgungJahr = 0;
      let rateJahr = 0;

      for (let monat = 0; monat < monateImJahr; monat++) {
        const aktuellerMonat = (jahr - 1) * 12 + monat + 1;
        const zinsenMonat = restschuld * r;
        
        let tilgungMonat: number;
        if (finanzierungsart === 'klassisch') {
          tilgungMonat = monatsrate - zinsenMonat;
        } else {
          // Bei Ballonfinanzierung: Tilgung = Rate - Zinsen, aber Schlussrate am Ende
          if (aktuellerMonat === n) {
            tilgungMonat = restschuld; // Letzte Zahlung tilgt alles
          } else {
            tilgungMonat = monatsrate - zinsenMonat;
          }
        }
        
        zinsenJahr += zinsenMonat;
        tilgungJahr += tilgungMonat;
        rateJahr += (aktuellerMonat === n && finanzierungsart !== 'klassisch') 
          ? monatsrate + schlussrate 
          : monatsrate;
        restschuld = Math.max(0, restschuld - tilgungMonat);
      }

      tilgungsplan.push({
        monat: jahr * 12,
        jahr,
        restschuld: Math.max(0, restschuld),
        zinsen: zinsenJahr,
        tilgung: tilgungJahr,
        rate: rateJahr,
      });
    }

    return {
      monatsrate,
      schlussrate,
      gesamtzinsen,
      gesamtbetrag,
      kreditsumme,
      zinssatz,
      effektivzins,
      laufzeitMonate: n,
      tilgungsplan,
      finanzierungsart,
      anzahlung,
      fahrzeugpreis,
    };
  }, [fahrzeugpreis, anzahlung, zinssatz, laufzeitMonate, finanzierungsart, schlussrateInput]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatEuroExact = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatProzent = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';

  // Anteile für Visualisierung
  const tilgungAnteil = ergebnis.gesamtbetrag > 0 
    ? (ergebnis.kreditsumme / (ergebnis.gesamtbetrag + ergebnis.anzahlung)) * 100 
    : 0;
  const zinsenAnteil = ergebnis.gesamtbetrag > 0 
    ? (ergebnis.gesamtzinsen / (ergebnis.gesamtbetrag + ergebnis.anzahlung)) * 100 
    : 0;
  const anzahlungAnteil = 100 - tilgungAnteil - zinsenAnteil;

  // Vergleich der Finanzierungsarten
  const vergleich = useMemo(() => {
    const kreditsumme = Math.max(0, fahrzeugpreis - anzahlung);
    const r = zinssatz / 100 / 12;
    const n = laufzeitMonate;

    if (kreditsumme <= 0 || r === 0) return null;

    // Klassisch
    const faktor = Math.pow(1 + r, n);
    const monatsrateKlassisch = kreditsumme * (r * faktor) / (faktor - 1);
    const gesamtKlassisch = monatsrateKlassisch * n;

    // Ballon 30%
    const schlussrate30 = 0.3 * fahrzeugpreis;
    const barwert30 = schlussrate30 / Math.pow(1 + r, n);
    const monatsrateBallon30 = (kreditsumme - barwert30) * (r * faktor) / (faktor - 1);
    const gesamtBallon30 = monatsrateBallon30 * n + schlussrate30;

    // Ballon 40%
    const schlussrate40 = 0.4 * fahrzeugpreis;
    const barwert40 = schlussrate40 / Math.pow(1 + r, n);
    const monatsrateBallon40 = (kreditsumme - barwert40) * (r * faktor) / (faktor - 1);
    const gesamtBallon40 = monatsrateBallon40 * n + schlussrate40;

    return {
      klassisch: { rate: monatsrateKlassisch, gesamt: gesamtKlassisch, zinsen: gesamtKlassisch - kreditsumme },
      ballon30: { rate: monatsrateBallon30, schluss: schlussrate30, gesamt: gesamtBallon30, zinsen: gesamtBallon30 - kreditsumme },
      ballon40: { rate: monatsrateBallon40, schluss: schlussrate40, gesamt: gesamtBallon40, zinsen: gesamtBallon40 - kreditsumme },
    };
  }, [fahrzeugpreis, anzahlung, zinssatz, laufzeitMonate]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Finanzierungsart */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Finanzierungsart</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setFinanzierungsart('klassisch')}
              className={`py-4 px-4 rounded-xl transition-all ${
                finanzierungsart === 'klassisch'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="font-bold block">📊 Klassisch</span>
              <span className="text-xs opacity-80">Gleichbleibende Rate</span>
            </button>
            <button
              onClick={() => setFinanzierungsart('ballon')}
              className={`py-4 px-4 rounded-xl transition-all ${
                finanzierungsart === 'ballon'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="font-bold block">🎈 Ballon</span>
              <span className="text-xs opacity-80">Niedrige Rate + Schlussrate</span>
            </button>
            <button
              onClick={() => setFinanzierungsart('dreiwege')}
              className={`py-4 px-4 rounded-xl transition-all ${
                finanzierungsart === 'dreiwege'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="font-bold block">🔄 3-Wege</span>
              <span className="text-xs opacity-80">Flexibel am Ende</span>
            </button>
          </div>
          {(finanzierungsart === 'ballon' || finanzierungsart === 'dreiwege') && (
            <p className="text-sm text-orange-600 mt-2 bg-orange-50 p-3 rounded-lg">
              💡 Bei der Ballonfinanzierung zahlen Sie niedrigere Monatsraten, aber am Ende eine hohe Schlussrate. 
              Diese kann finanziert, bar bezahlt oder durch Rückgabe des Fahrzeugs beglichen werden.
            </p>
          )}
        </div>

        {/* Fahrzeugpreis */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Fahrzeugpreis</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={fahrzeugpreis}
              onChange={(e) => setFahrzeugpreis(Math.max(1000, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="1000"
              max="200000"
              step="500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={fahrzeugpreis}
            onChange={(e) => setFahrzeugpreis(Number(e.target.value))}
            className="w-full mt-3 accent-orange-500"
            min="5000"
            max="100000"
            step="1000"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>5.000 €</span>
            <span>50.000 €</span>
            <span>100.000 €</span>
          </div>
        </div>

        {/* Anzahlung */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Anzahlung</span>
            <span className="text-xs text-gray-500 ml-2">
              ({((anzahlung / fahrzeugpreis) * 100).toFixed(0)}% des Fahrzeugpreises)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={anzahlung}
              onChange={(e) => setAnzahlung(Math.max(0, Math.min(fahrzeugpreis - 1000, Number(e.target.value))))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max={fahrzeugpreis - 1000}
              step="500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">€</span>
          </div>
          <input
            type="range"
            value={anzahlung}
            onChange={(e) => setAnzahlung(Number(e.target.value))}
            className="w-full mt-3 accent-orange-500"
            min="0"
            max={Math.max(0, fahrzeugpreis - 1000)}
            step="500"
          />
          <p className="text-sm text-gray-500 mt-2">
            💡 Empfehlung: 10-20% Anzahlung senken die Zinskosten erheblich
          </p>
        </div>

        {/* Zinssatz */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Sollzinssatz (p.a.)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={zinssatz}
              onChange={(e) => setZinssatz(Math.max(0, Math.min(15, Number(e.target.value))))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="15"
              step="0.01"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">%</span>
          </div>
          <input
            type="range"
            value={zinssatz}
            onChange={(e) => setZinssatz(Number(e.target.value))}
            className="w-full mt-3 accent-orange-500"
            min="0"
            max="12"
            step="0.1"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>6%</span>
            <span>12%</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            💡 Herstellerfinanzierung: 0-5% | Bankkredit: 3-8% | Gebrauchtwagen: 4-10%
          </p>
        </div>

        {/* Laufzeit */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Laufzeit</span>
          </label>
          <div className="flex items-center justify-center gap-4 mb-3">
            <button
              onClick={() => setLaufzeitMonate(Math.max(12, laufzeitMonate - 12))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
            >
              −
            </button>
            <div className="text-center px-4">
              <div className="text-4xl font-bold text-gray-800">{laufzeitMonate}</div>
              <div className="text-sm text-gray-500">
                Monate ({(laufzeitMonate / 12).toFixed(1)} Jahre)
              </div>
            </div>
            <button
              onClick={() => setLaufzeitMonate(Math.min(84, laufzeitMonate + 12))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
            >
              +
            </button>
          </div>
          <input
            type="range"
            value={laufzeitMonate}
            onChange={(e) => setLaufzeitMonate(Number(e.target.value))}
            className="w-full mt-2 accent-orange-500"
            min="12"
            max="84"
            step="12"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>12 Mo.</span>
            <span>48 Mo.</span>
            <span>84 Mo.</span>
          </div>
        </div>

        {/* Schlussrate bei Ballon/3-Wege */}
        {(finanzierungsart === 'ballon' || finanzierungsart === 'dreiwege') && (
          <div className="mb-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
            <label className="block mb-2">
              <span className="text-orange-800 font-medium">Schlussrate (% vom Fahrzeugpreis)</span>
              <span className="text-xs text-orange-600 ml-2">
                = {formatEuro((schlussrateInput / 100) * fahrzeugpreis)}
              </span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                value={schlussrateInput}
                onChange={(e) => setSchlussrateInput(Number(e.target.value))}
                className="flex-1 accent-orange-500"
                min="10"
                max="50"
                step="5"
              />
              <span className="text-2xl font-bold text-orange-700 w-16 text-right">{schlussrateInput}%</span>
            </div>
            <div className="flex justify-between text-xs text-orange-500 mt-1">
              <span>10%</span>
              <span>30%</span>
              <span>50%</span>
            </div>
            <p className="text-xs text-orange-600 mt-2">
              ℹ️ Die Schlussrate entspricht oft dem geschätzten Restwert des Fahrzeugs nach der Laufzeit.
            </p>
          </div>
        )}
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🚗 Ihre Monatsrate</h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroExact(ergebnis.monatsrate)}</span>
            <span className="text-xl opacity-80">/ Monat</span>
          </div>
          {ergebnis.schlussrate > 0 && (
            <p className="text-orange-100 mt-2 text-sm bg-white/10 p-3 rounded-lg">
              ⚠️ <strong>Schlussrate am Ende:</strong> {formatEuro(ergebnis.schlussrate)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Gesamtkosten</span>
            <div className="text-xl font-bold">{formatEuroExact(ergebnis.gesamtbetrag + ergebnis.anzahlung)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Zinskosten</span>
            <div className="text-xl font-bold">{formatEuroExact(ergebnis.gesamtzinsen)}</div>
          </div>
        </div>

        {/* Kostenaufteilung */}
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between text-sm mb-2">
            <span>Anzahlung: {formatEuro(ergebnis.anzahlung)}</span>
            <span>Kredit: {formatEuro(ergebnis.kreditsumme)}</span>
            <span>Zinsen: {formatEuro(ergebnis.gesamtzinsen)}</span>
          </div>
          <div className="h-4 rounded-full overflow-hidden bg-white/20 flex">
            <div
              className="bg-green-400 h-full transition-all duration-500"
              style={{ width: `${anzahlungAnteil}%` }}
              title="Anzahlung"
            ></div>
            <div
              className="bg-white h-full transition-all duration-500"
              style={{ width: `${tilgungAnteil}%` }}
              title="Tilgung"
            ></div>
            <div
              className="bg-red-400 h-full transition-all duration-500"
              style={{ width: `${zinsenAnteil}%` }}
              title="Zinsen"
            ></div>
          </div>
          <div className="flex justify-between text-xs mt-1 opacity-70">
            <span className="text-green-300">Anzahlung</span>
            <span>Tilgung</span>
            <span className="text-red-300">Zinsen</span>
          </div>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Fahrzeugpreis</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.fahrzeugpreis)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">– Anzahlung</span>
            <span className="text-green-600 font-medium">−{formatEuro(ergebnis.anzahlung)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 bg-gray-50 -mx-6 px-6">
            <span className="font-medium text-gray-800">= Kreditsumme (Netto)</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.kreditsumme)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Sollzinssatz (p.a.)</span>
            <span className="text-gray-900">{formatProzent(ergebnis.zinssatz)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Effektiver Jahreszins (ca.)</span>
            <span className="font-medium text-orange-600">{formatProzent(ergebnis.effektivzins)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Laufzeit</span>
            <span className="text-gray-900">{ergebnis.laufzeitMonate} Monate ({(ergebnis.laufzeitMonate / 12).toFixed(1)} Jahre)</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Monatliche Rate</span>
            <span className="font-bold text-gray-900">{formatEuroExact(ergebnis.monatsrate)}</span>
          </div>
          {ergebnis.schlussrate > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 bg-orange-50 -mx-6 px-6">
              <span className="text-orange-800 font-medium">Schlussrate (Monat {ergebnis.laufzeitMonate})</span>
              <span className="font-bold text-orange-900">{formatEuroExact(ergebnis.schlussrate)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>Gesamte Zinskosten</span>
            <span className="font-bold">{formatEuroExact(ergebnis.gesamtzinsen)}</span>
          </div>
          <div className="flex justify-between py-3 bg-orange-50 -mx-6 px-6 rounded-b-xl">
            <span className="font-bold text-orange-800">Gesamtkosten (inkl. Anzahlung)</span>
            <span className="font-bold text-2xl text-orange-900">
              {formatEuroExact(ergebnis.gesamtbetrag + ergebnis.anzahlung)}
            </span>
          </div>
        </div>
      </div>

      {/* Vergleich der Finanzierungsarten */}
      {vergleich && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">⚖️ Vergleich der Finanzierungsarten</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2 text-gray-600">Art</th>
                  <th className="text-right py-2 text-gray-600">Monatsrate</th>
                  <th className="text-right py-2 text-gray-600">Schlussrate</th>
                  <th className="text-right py-2 text-gray-600">Zinskosten</th>
                </tr>
              </thead>
              <tbody>
                <tr className={`border-b border-gray-100 ${finanzierungsart === 'klassisch' ? 'bg-orange-50' : ''}`}>
                  <td className="py-3 font-medium">📊 Klassisch</td>
                  <td className="text-right py-3 font-bold">{formatEuroExact(vergleich.klassisch.rate)}</td>
                  <td className="text-right py-3 text-gray-400">–</td>
                  <td className="text-right py-3 text-red-600">{formatEuro(vergleich.klassisch.zinsen)}</td>
                </tr>
                <tr className={`border-b border-gray-100 ${finanzierungsart === 'ballon' && schlussrateInput === 30 ? 'bg-orange-50' : ''}`}>
                  <td className="py-3 font-medium">🎈 Ballon 30%</td>
                  <td className="text-right py-3 font-bold">{formatEuroExact(vergleich.ballon30.rate)}</td>
                  <td className="text-right py-3 text-orange-600">{formatEuro(vergleich.ballon30.schluss)}</td>
                  <td className="text-right py-3 text-red-600">{formatEuro(vergleich.ballon30.zinsen)}</td>
                </tr>
                <tr className={`${finanzierungsart === 'ballon' && schlussrateInput === 40 ? 'bg-orange-50' : ''}`}>
                  <td className="py-3 font-medium">🎈 Ballon 40%</td>
                  <td className="text-right py-3 font-bold">{formatEuroExact(vergleich.ballon40.rate)}</td>
                  <td className="text-right py-3 text-orange-600">{formatEuro(vergleich.ballon40.schluss)}</td>
                  <td className="text-right py-3 text-red-600">{formatEuro(vergleich.ballon40.zinsen)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-3 bg-amber-50 rounded-lg text-sm text-amber-800">
            <strong>💡 Hinweis:</strong> Die Ballonfinanzierung hat höhere Gesamtkosten, aber eine niedrigere Monatsrate. 
            Wählen Sie klassisch, wenn Sie die Rate leisten können und keine Schlussrate wünschen.
          </div>
        </div>
      )}

      {/* Tilgungsplan */}
      {ergebnis.tilgungsplan.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">📅 Tilgungsplan (jährlich)</h3>
            <button
              onClick={() => setZeigeTilgungsplan(!zeigeTilgungsplan)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                zeigeTilgungsplan
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {zeigeTilgungsplan ? '▲ Ausblenden' : '▼ Anzeigen'}
            </button>
          </div>

          {zeigeTilgungsplan && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 text-gray-600">Jahr</th>
                    <th className="text-right py-2 text-gray-600">Zahlungen</th>
                    <th className="text-right py-2 text-gray-600">Zinsen</th>
                    <th className="text-right py-2 text-gray-600">Tilgung</th>
                    <th className="text-right py-2 text-gray-600">Restschuld</th>
                  </tr>
                </thead>
                <tbody>
                  {ergebnis.tilgungsplan.map((zeile) => (
                    <tr key={zeile.jahr} className="border-b border-gray-100">
                      <td className="py-2 font-medium">{zeile.jahr}</td>
                      <td className="text-right py-2">{formatEuroExact(zeile.rate)}</td>
                      <td className="text-right py-2 text-red-600">{formatEuroExact(zeile.zinsen)}</td>
                      <td className="text-right py-2 text-green-600">{formatEuroExact(zeile.tilgung)}</td>
                      <td className="text-right py-2 font-medium">{formatEuroExact(zeile.restschuld)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-bold">
                    <td className="py-2">Gesamt</td>
                    <td className="text-right py-2">{formatEuroExact(ergebnis.gesamtbetrag)}</td>
                    <td className="text-right py-2 text-red-600">{formatEuroExact(ergebnis.gesamtzinsen)}</td>
                    <td className="text-right py-2 text-green-600">{formatEuroExact(ergebnis.kreditsumme)}</td>
                    <td className="text-right py-2">0,00 €</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Info Section - Finanzierungsarten */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Finanzierungsarten erklärt</h3>
        <ul className="space-y-4 text-sm text-gray-600">
          <li className="flex gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <strong className="text-gray-800">Klassischer Autokredit (Ratenkredit)</strong>
              <p className="mt-1">Gleichbleibende Monatsrate über die gesamte Laufzeit. Am Ende gehört das Auto Ihnen, ohne weitere Zahlungen. <strong className="text-green-600">Geringste Gesamtkosten</strong>, aber höhere Monatsrate.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-2xl">🎈</span>
            <div>
              <strong className="text-gray-800">Ballonfinanzierung</strong>
              <p className="mt-1">Niedrige Monatsraten, aber eine hohe Schlussrate am Ende. Ideal, wenn Sie das Auto später verkaufen oder weiterfinanzieren wollen. <strong className="text-orange-600">Achtung:</strong> Höhere Gesamtzinskosten!</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-2xl">🔄</span>
            <div>
              <strong className="text-gray-800">3-Wege-Finanzierung</strong>
              <p className="mt-1">Wie Ballonfinanzierung, aber am Ende haben Sie 3 Optionen: Schlussrate zahlen (Auto behalten), Anschlussfinanzierung oder Auto zurückgeben. Beliebt bei Neuwagen-Leasing des Herstellers.</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Tipps */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-orange-800 mb-3">💡 Tipps zur Autofinanzierung</h3>
        <ul className="space-y-2 text-sm text-orange-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Anzahlung erhöhen:</strong> Je mehr Eigenkapital, desto weniger Zinsen zahlen Sie.
              20% Anzahlung ist ein guter Richtwert.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>0%-Finanzierung prüfen:</strong> Hersteller bieten oft zinslose Finanzierungen an – 
              aber prüfen Sie, ob Sie beim Barkauf einen höheren Rabatt bekommen hätten!
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Bankkredit vergleichen:</strong> Ein unabhängiger Autokredit von der Bank kann günstiger 
              sein als die Händlerfinanzierung – und Sie treten beim Kauf als Barzahler auf.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Kurze Laufzeit:</strong> Längere Laufzeiten bedeuten mehr Zinskosten. 
              Ideal: Kredit ist abbezahlt, bevor größere Reparaturen anfallen.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Sondertilgung:</strong> Achten Sie darauf, dass kostenlose Sondertilgungen möglich sind.
            </span>
          </li>
        </ul>
      </div>

      {/* Warnhinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Schlussrate einplanen:</strong> Bei Ballonfinanzierung: Können Sie die Schlussrate in 3-4 Jahren bezahlen? 
              Oder planen Sie eine Anschlussfinanzierung (zusätzliche Zinsen!)?
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Wertverlust beachten:</strong> Autos verlieren schnell an Wert. Bei der Rückgabe 
              kann der Restwert unter der Schlussrate liegen – Sie zahlen die Differenz!
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Vollkasko-Pflicht:</strong> Bei Finanzierung ist oft eine Vollkasko-Versicherung Pflicht – 
              das erhöht die monatlichen Kosten.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Fahrzeugbrief beim Kreditgeber:</strong> Bis zur vollständigen Tilgung behält 
              die Bank den Fahrzeugbrief als Sicherheit.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>14-Tage Widerrufsrecht:</strong> Sie können einen Verbraucherkreditvertrag 
              innerhalb von 14 Tagen ohne Angabe von Gründen widerrufen.
            </span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Verbraucherschutz & Beratung</h3>
        <div className="space-y-4">
          <div className="bg-orange-50 rounded-xl p-4">
            <p className="font-semibold text-orange-900">Verbraucherzentrale</p>
            <p className="text-sm text-orange-700 mt-1">
              Unabhängige Beratung zu Autofinanzierung, Leasing und Kreditverträgen.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">ADAC Rechtsberatung</p>
                <a
                  href="https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/autofinanzierung/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  ADAC Autofinanzierung →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">BaFin</p>
                <a
                  href="https://www.bafin.de/DE/Verbraucher/Finanzwissen/BA/Autofinanzierung/autofinanzierung_artikel.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  BaFin Autofinanzierung →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

            <RechnerFeedback rechnerName="Autofinanzierung-Rechner" rechnerSlug="autofinanzierung-rechner" />

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/bgb/__491.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BGB § 491 – Verbraucherdarlehensvertrag
          </a>
          <a
            href="https://www.gesetze-im-internet.de/preisabg/__6.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            PAngV § 6 – Effektiver Jahreszins
          </a>
          <a
            href="https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/autofinanzierung/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            ADAC – Ratgeber Autofinanzierung
          </a>
          <a
            href="https://www.bafin.de/DE/Verbraucher/Finanzwissen/BA/Autofinanzierung/autofinanzierung_artikel.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BaFin – Autofinanzierung erklärt
          </a>
          <a
            href="https://www.verbraucherzentrale.de/wissen/geld-versicherungen/kredit"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Verbraucherzentrale – Kredit & Finanzierung
          </a>
        </div>
      </div>
    </div>
  );
}
