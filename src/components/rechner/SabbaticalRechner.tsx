import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Sozialversicherungsbeiträge 2026 (Arbeitnehmer + Arbeitgeber gesamt)
const SV_BEITRAEGE = {
  krankenversicherung: 0.146 + 0.029, // 14,6% + 2,9% Ø Zusatzbeitrag 2026 (GKV-Schätzerkreis)
  rentenversicherung: 0.186,
  arbeitslosenversicherung: 0.026,
  pflegeversicherung: 0.036,
};

// Beitragsbemessungsgrenzen 2026
const BBG_2026 = {
  krankenversicherung: 69750, // Jahres-BBG KV/PV (5.812,50€ × 12)
  rentenversicherung: 101400, // Jahres-BBG RV/AV (8.450€ × 12, einheitlich seit 2025)
};

export default function SabbaticalRechner() {
  // Eingabewerte
  const [bruttogehaltMonat, setBruttogehaltMonat] = useState(4500);
  const [arbeitsphaseJahre, setArbeitsphaseJahre] = useState(4);
  const [arbeitsphaseMonate, setArbeitsphaseMonate] = useState(0);
  const [freistellungMonate, setFreistellungMonate] = useState(12);
  const [steuerklasse, setSteuerklasse] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [hatKinder, setHatKinder] = useState(false);
  const [kirchensteuer, setKirchensteuer] = useState(false);
  const [bundesland, setBundesland] = useState<'west' | 'ost'>('west');

  const ergebnis = useMemo(() => {
    // === 1. Gesamtdauer berechnen ===
    const arbeitsphaseGesamtMonate = arbeitsphaseJahre * 12 + arbeitsphaseMonate;
    const gesamtMonate = arbeitsphaseGesamtMonate + freistellungMonate;
    
    // === 2. Gehaltsprozentsatz berechnen (Ansparmodell) ===
    // Arbeitsphase-Monate / Gesamtmonate = Gehaltsprozentsatz
    const gehaltsProzent = arbeitsphaseGesamtMonate / gesamtMonate;
    const reduziertesBruttoMonat = bruttogehaltMonat * gehaltsProzent;
    
    // === 3. Jährliche Werte berechnen ===
    const bruttoJahr = bruttogehaltMonat * 12;
    const reduziertesJahr = reduziertesBruttoMonat * 12;
    
    // === 4. Gesamtersparnis während Ansparphase ===
    const monatlicheErsparnis = bruttogehaltMonat - reduziertesBruttoMonat;
    const gesamtErsparnis = monatlicheErsparnis * arbeitsphaseGesamtMonate;
    
    // === 5. Kosten für Arbeitgeber (ungefähre SV-Beiträge) ===
    // Vereinfachte Berechnung der AG-Sozialabgaben
    const agAnteilProzent = (
      SV_BEITRAEGE.krankenversicherung / 2 +
      SV_BEITRAEGE.rentenversicherung / 2 +
      SV_BEITRAEGE.arbeitslosenversicherung / 2 +
      SV_BEITRAEGE.pflegeversicherung / 2
    ); // ca. 20-21%
    
    const agKostenVorher = bruttogehaltMonat * (1 + agAnteilProzent);
    const agKostenNachher = reduziertesBruttoMonat * (1 + agAnteilProzent);
    const agErsparnis = (agKostenVorher - agKostenNachher) * arbeitsphaseGesamtMonate;
    
    // === 6. Netto-Gehalt Schätzung (vereinfacht) ===
    // Basierend auf Steuerklasse, grobe Schätzung
    const nettoQuoten: Record<number, number> = {
      1: 0.60, // ca. 60% netto bei Stkl 1
      2: 0.62,
      3: 0.70,
      4: 0.60,
      5: 0.50,
      6: 0.48,
    };
    
    const nettoQuote = nettoQuoten[steuerklasse] || 0.60;
    const nettoVorher = bruttogehaltMonat * nettoQuote;
    const nettoNachher = reduziertesBruttoMonat * nettoQuote;
    const nettoVerlust = nettoVorher - nettoNachher;
    
    // === 7. Rentenanspruch (Entgeltpunkte) ===
    // Durchschnittsentgelt 2026 (vorläufig, per SV-Rechengrößenverordnung 2026)
    const durchschnittsentgelt = 51944; // 51.944€ per Bundesregierung/DRV
    const entgeltpunkteVorher = bruttoJahr / durchschnittsentgelt;
    const entgeltpunkteNachher = reduziertesJahr / durchschnittsentgelt;
    const entgeltpunkteVerlust = entgeltpunkteVorher - entgeltpunkteNachher;
    const entgeltpunkteVerlustGesamt = entgeltpunkteVerlust * (gesamtMonate / 12);
    
    // Aktueller Rentenwert (seit 01.07.2025)
    const rentenwert = 40.79; // €/EP/Monat
    const rentenVerlustMonatlich = entgeltpunkteVerlustGesamt * rentenwert;
    
    // === 8. Zeitangaben formatieren ===
    const arbeitsphaseFormatiert = `${arbeitsphaseJahre} Jahr${arbeitsphaseJahre !== 1 ? 'e' : ''}${arbeitsphaseMonate > 0 ? ` und ${arbeitsphaseMonate} Monat${arbeitsphaseMonate !== 1 ? 'e' : ''}` : ''}`;
    const freistellungFormatiert = freistellungMonate >= 12 
      ? `${Math.floor(freistellungMonate / 12)} Jahr${Math.floor(freistellungMonate / 12) !== 1 ? 'e' : ''}${freistellungMonate % 12 > 0 ? ` und ${freistellungMonate % 12} Monat${freistellungMonate % 12 !== 1 ? 'e' : ''}` : ''}`
      : `${freistellungMonate} Monat${freistellungMonate !== 1 ? 'e' : ''}`;
    const gesamtFormatiert = gesamtMonate >= 12
      ? `${Math.floor(gesamtMonate / 12)} Jahr${Math.floor(gesamtMonate / 12) !== 1 ? 'e' : ''}${gesamtMonate % 12 > 0 ? ` und ${gesamtMonate % 12} Monat${gesamtMonate % 12 !== 1 ? 'e' : ''}` : ''}`
      : `${gesamtMonate} Monat${gesamtMonate !== 1 ? 'e' : ''}`;
    
    return {
      // Zeiträume
      arbeitsphaseGesamtMonate,
      freistellungMonate,
      gesamtMonate,
      arbeitsphaseFormatiert,
      freistellungFormatiert,
      gesamtFormatiert,
      
      // Gehalt
      bruttogehaltMonat,
      gehaltsProzent,
      reduziertesBruttoMonat,
      bruttoJahr,
      reduziertesJahr,
      
      // Ersparnis/Verlust
      monatlicheErsparnis,
      gesamtErsparnis,
      
      // Netto
      nettoVorher,
      nettoNachher,
      nettoVerlust,
      
      // Arbeitgeber
      agKostenVorher,
      agKostenNachher,
      agErsparnis,
      
      // Rente
      entgeltpunkteVorher,
      entgeltpunkteNachher,
      entgeltpunkteVerlust,
      entgeltpunkteVerlustGesamt,
      rentenVerlustMonatlich,
    };
  }, [bruttogehaltMonat, arbeitsphaseJahre, arbeitsphaseMonate, freistellungMonate, steuerklasse, hatKinder, kirchensteuer, bundesland]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatProzent = (n: number) => (n * 100).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Ihre Angaben</h3>
        
        {/* Bruttogehalt */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Aktuelles Bruttogehalt (monatlich)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Ihr reguläres monatliches Gehalt vor dem Sabbatical-Modell
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={bruttogehaltMonat}
              onChange={(e) => setBruttogehaltMonat(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none"
              min="0"
              max="20000"
              step="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={bruttogehaltMonat}
            onChange={(e) => setBruttogehaltMonat(Number(e.target.value))}
            className="w-full mt-3 accent-indigo-500"
            min="2000"
            max="12000"
            step="100"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>2.000 €</span>
            <span>7.000 €</span>
            <span>12.000 €</span>
          </div>
        </div>

        {/* Arbeitsphase */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Arbeitsphase (Ansparzeit)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Wie lange arbeiten Sie mit reduziertem Gehalt, bevor das Sabbatical beginnt?
            </span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Jahre</label>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setArbeitsphaseJahre(Math.max(0, arbeitsphaseJahre - 1))}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
                >
                  −
                </button>
                <span className="text-2xl font-bold text-gray-800 w-8 text-center">{arbeitsphaseJahre}</span>
                <button
                  onClick={() => setArbeitsphaseJahre(Math.min(10, arbeitsphaseJahre + 1))}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Monate</label>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setArbeitsphaseMonate(Math.max(0, arbeitsphaseMonate - 1))}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
                >
                  −
                </button>
                <span className="text-2xl font-bold text-gray-800 w-8 text-center">{arbeitsphaseMonate}</span>
                <button
                  onClick={() => setArbeitsphaseMonate(Math.min(11, arbeitsphaseMonate + 1))}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Freistellungsphase */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Freistellungsphase (Sabbatical-Dauer)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Wie lange dauert Ihre Auszeit? In dieser Zeit erhalten Sie weiterhin das reduzierte Gehalt.
            </span>
          </label>
          <div className="flex items-center justify-center gap-4 mb-3">
            <button
              onClick={() => setFreistellungMonate(Math.max(1, freistellungMonate - 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
            >
              −
            </button>
            <div className="text-center">
              <span className="text-3xl font-bold text-gray-800">{freistellungMonate}</span>
              <span className="text-gray-500 ml-1">Monate</span>
            </div>
            <button
              onClick={() => setFreistellungMonate(Math.min(24, freistellungMonate + 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
            >
              +
            </button>
          </div>
          <input
            type="range"
            value={freistellungMonate}
            onChange={(e) => setFreistellungMonate(Number(e.target.value))}
            className="w-full accent-indigo-500"
            min="1"
            max="24"
            step="1"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 Monat</span>
            <span>12 Monate</span>
            <span>24 Monate</span>
          </div>
          
          {/* Schnellauswahl */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[3, 6, 12, 18, 24].map((m) => (
              <button
                key={m}
                onClick={() => setFreistellungMonate(m)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  freistellungMonate === m
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {m} Mon.
              </button>
            ))}
          </div>
        </div>

        {/* Steuerklasse */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Steuerklasse</span>
            <span className="text-xs text-gray-500 block mt-1">
              Für die Netto-Schätzung
            </span>
          </label>
          <div className="grid grid-cols-6 gap-2">
            {([1, 2, 3, 4, 5, 6] as const).map((sk) => (
              <button
                key={sk}
                onClick={() => setSteuerklasse(sk)}
                className={`py-3 rounded-xl font-bold transition-all ${
                  steuerklasse === sk
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {sk}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Section - Hauptergebnis */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🏖️ Ihr Sabbatical-Gehalt</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroRound(ergebnis.reduziertesBruttoMonat)}</span>
            <span className="text-xl opacity-80">brutto / Monat</span>
          </div>
          <p className="text-indigo-100 mt-2 text-sm">
            Das sind <strong>{formatProzent(ergebnis.gehaltsProzent)}</strong> Ihres regulären Gehalts
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Gehalt vorher</span>
            <div className="text-xl font-bold">{formatEuroRound(ergebnis.bruttogehaltMonat)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Monatlicher Verzicht</span>
            <div className="text-xl font-bold text-red-200">−{formatEuroRound(ergebnis.monatlicheErsparnis)}</div>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-80">Gesamte Sabbatical-Dauer</span>
            <span className="text-lg font-bold">{ergebnis.freistellungFormatiert}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm opacity-80">Arbeitsphase davor</span>
            <span className="text-lg font-bold">{ergebnis.arbeitsphaseFormatiert}</span>
          </div>
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/20">
            <span className="text-sm opacity-80">Gesamtlaufzeit</span>
            <span className="text-lg font-bold">{ergebnis.gesamtFormatiert}</span>
          </div>
        </div>
      </div>

      {/* Visualisierung Timeline */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📅 Zeitlicher Ablauf</h3>
        
        <div className="relative h-16 bg-gray-100 rounded-xl overflow-hidden mb-4">
          {/* Arbeitsphase */}
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center text-white text-sm font-medium"
            style={{ width: `${(ergebnis.arbeitsphaseGesamtMonate / ergebnis.gesamtMonate) * 100}%` }}
          >
            {ergebnis.arbeitsphaseGesamtMonate > 6 && (
              <span>Arbeiten ({ergebnis.arbeitsphaseGesamtMonate} Mon.)</span>
            )}
          </div>
          {/* Freistellungsphase */}
          <div 
            className="absolute right-0 top-0 h-full bg-gradient-to-r from-green-500 to-emerald-400 flex items-center justify-center text-white text-sm font-medium"
            style={{ width: `${(ergebnis.freistellungMonate / ergebnis.gesamtMonate) * 100}%` }}
          >
            {ergebnis.freistellungMonate > 3 && (
              <span>Sabbatical ({ergebnis.freistellungMonate} Mon.)</span>
            )}
          </div>
        </div>
        
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span className="text-gray-600">Arbeitsphase mit {formatProzent(ergebnis.gehaltsProzent)} Gehalt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-gray-600">Freistellung mit {formatProzent(ergebnis.gehaltsProzent)} Gehalt</span>
          </div>
        </div>
      </div>

      {/* Detaillierte Berechnung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
        
        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Das Ansparmodell erklärt
          </div>
          
          <div className="bg-indigo-50 rounded-xl p-4 mb-4">
            <p className="text-indigo-800 text-sm">
              <strong>So funktioniert's:</strong> Sie verzichten über {ergebnis.arbeitsphaseGesamtMonate} Monate 
              auf einen Teil Ihres Gehalts. Das "angesparte" Geld finanziert dann Ihr Sabbatical 
              von {ergebnis.freistellungMonate} Monaten – während Sie weiterhin {formatProzent(ergebnis.gehaltsProzent)} Gehalt erhalten.
            </p>
          </div>

          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Reguläres Bruttogehalt</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.bruttogehaltMonat)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Arbeitsphase</span>
            <span className="text-gray-900">{ergebnis.arbeitsphaseGesamtMonate} Monate</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">+ Freistellungsphase</span>
            <span className="text-gray-900">{ergebnis.freistellungMonate} Monate</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">= Gesamtlaufzeit</span>
            <span className="font-bold text-gray-900">{ergebnis.gesamtMonate} Monate</span>
          </div>
          
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Gehalt während des Modells
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Berechnungsformel</span>
            <span className="text-gray-900">{ergebnis.arbeitsphaseGesamtMonate} ÷ {ergebnis.gesamtMonate} = {formatProzent(ergebnis.gehaltsProzent)}</span>
          </div>
          <div className="flex justify-between py-2 bg-indigo-50 -mx-6 px-6">
            <span className="font-medium text-indigo-700">Reduziertes Bruttogehalt</span>
            <span className="font-bold text-indigo-900">{formatEuro(ergebnis.reduziertesBruttoMonat)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>Monatlicher Verzicht (Brutto)</span>
            <span>−{formatEuro(ergebnis.monatlicheErsparnis)}</span>
          </div>
          
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Netto-Schätzung (Steuerklasse {steuerklasse})
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Netto vorher (ca.)</span>
            <span className="text-gray-900">{formatEuro(ergebnis.nettoVorher)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Netto während Modell (ca.)</span>
            <span className="text-gray-900">{formatEuro(ergebnis.nettoNachher)}</span>
          </div>
          <div className="flex justify-between py-2 bg-red-50 -mx-6 px-6">
            <span className="font-medium text-red-700">Monatlicher Nettoverzicht</span>
            <span className="font-bold text-red-900">−{formatEuro(ergebnis.nettoVerlust)}</span>
          </div>
          
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Gesamtübersicht
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Gesamtverzicht in Arbeitsphase</span>
            <span className="text-gray-900">{formatEuro(ergebnis.gesamtErsparnis)}</span>
          </div>
          <div className="flex justify-between py-2 bg-green-50 -mx-6 px-6 rounded-b-xl">
            <span className="font-medium text-green-700">Sabbatical-Gehalt ({ergebnis.freistellungMonate} Mon.)</span>
            <span className="font-bold text-green-900">{formatEuro(ergebnis.reduziertesBruttoMonat * ergebnis.freistellungMonate)}</span>
          </div>
        </div>
      </div>

      {/* Auswirkungen auf Rente */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">👴 Auswirkungen auf die Rente</h3>
        
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <p className="text-amber-800 text-sm">
            <strong>Wichtig:</strong> Während des gesamten Sabbatical-Modells zahlen Sie weniger in die 
            Rentenversicherung ein. Das wirkt sich auf Ihre spätere Rente aus.
          </p>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Entgeltpunkte/Jahr (vorher)</span>
            <span className="text-gray-900">{ergebnis.entgeltpunkteVorher.toFixed(3)} EP</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Entgeltpunkte/Jahr (während Modell)</span>
            <span className="text-gray-900">{ergebnis.entgeltpunkteNachher.toFixed(3)} EP</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>Weniger EP pro Jahr</span>
            <span>−{ergebnis.entgeltpunkteVerlust.toFixed(3)} EP</span>
          </div>
          <div className="flex justify-between py-2 bg-red-50 -mx-6 px-6">
            <span className="font-medium text-red-700">Gesamtverlust über {(ergebnis.gesamtMonate / 12).toFixed(1)} Jahre</span>
            <span className="font-bold text-red-900">−{ergebnis.entgeltpunkteVerlustGesamt.toFixed(3)} EP</span>
          </div>
          <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
            <span className="text-gray-600">≈ Weniger Monatsrente später</span>
            <span className="font-bold text-red-600">−{formatEuro(ergebnis.rentenVerlustMonatlich)}</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          Berechnung basiert auf Durchschnittsentgelt 51.944€ (vorläufig 2026) und aktuellem Rentenwert 40,79€ (seit 01.07.2025).
          Die tatsächliche Auswirkung hängt von vielen Faktoren ab.
        </p>
      </div>

      {/* Vorteile für Arbeitgeber */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🏢 Perspektive des Arbeitgebers</h3>
        
        <div className="bg-blue-50 rounded-xl p-4 mb-4">
          <p className="text-blue-800 text-sm">
            Das Sabbatical-Modell ist auch für Arbeitgeber attraktiv: Sie behalten qualifizierte 
            Mitarbeiter und sparen während der Ansparphase Lohnnebenkosten.
          </p>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">AG-Kosten/Monat (vorher)</span>
            <span className="text-gray-900">ca. {formatEuro(ergebnis.agKostenVorher)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">AG-Kosten/Monat (während Modell)</span>
            <span className="text-gray-900">ca. {formatEuro(ergebnis.agKostenNachher)}</span>
          </div>
          <div className="flex justify-between py-2 bg-green-50 -mx-6 px-6">
            <span className="font-medium text-green-700">AG-Ersparnis in Arbeitsphase</span>
            <span className="font-bold text-green-900">ca. {formatEuro(ergebnis.agErsparnis)}</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          Vereinfachte Berechnung. AG-Sozialabgaben ca. 20-21% des Bruttogehalts.
        </p>
      </div>

      {/* Beliebte Modelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Beliebte Sabbatical-Modelle</h3>
        
        <div className="space-y-3">
          {[
            { arbeitsJahre: 4, freistellungMonate: 12, name: '4+1 Modell', desc: '4 Jahre arbeiten, 1 Jahr frei (80% Gehalt)' },
            { arbeitsJahre: 3, freistellungMonate: 6, name: '3+0,5 Modell', desc: '3 Jahre arbeiten, 6 Monate frei (~86% Gehalt)' },
            { arbeitsJahre: 2, freistellungMonate: 6, name: '2+0,5 Modell', desc: '2 Jahre arbeiten, 6 Monate frei (80% Gehalt)' },
            { arbeitsJahre: 5, freistellungMonate: 12, name: '5+1 Modell', desc: '5 Jahre arbeiten, 1 Jahr frei (~83% Gehalt)' },
          ].map((modell) => {
            const arbeitsMonate = modell.arbeitsJahre * 12;
            const gesamt = arbeitsMonate + modell.freistellungMonate;
            const prozent = (arbeitsMonate / gesamt * 100).toFixed(0);
            const isActive = arbeitsphaseJahre === modell.arbeitsJahre && arbeitsphaseMonate === 0 && freistellungMonate === modell.freistellungMonate;
            
            return (
              <button
                key={modell.name}
                onClick={() => {
                  setArbeitsphaseJahre(modell.arbeitsJahre);
                  setArbeitsphaseMonate(0);
                  setFreistellungMonate(modell.freistellungMonate);
                }}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-800">{modell.name}</span>
                    <p className="text-sm text-gray-600">{modell.desc}</p>
                  </div>
                  <span className={`text-lg font-bold ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                    {prozent}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Vor- und Nachteile */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">⚖️ Vor- und Nachteile</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* Vorteile */}
          <div className="bg-green-50 rounded-xl p-4">
            <h4 className="font-semibold text-green-800 mb-3">✅ Vorteile</h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex gap-2">
                <span>✓</span>
                <span>Gesichertes Einkommen während Auszeit</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Arbeitsplatz bleibt erhalten</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Sozialversicherung durchgehend</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Planbare, längere Auszeit möglich</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Keine Kündigung nötig</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Betriebszugehörigkeit läuft weiter</span>
              </li>
            </ul>
          </div>
          
          {/* Nachteile */}
          <div className="bg-red-50 rounded-xl p-4">
            <h4 className="font-semibold text-red-800 mb-3">❌ Nachteile</h4>
            <ul className="space-y-2 text-sm text-red-700">
              <li className="flex gap-2">
                <span>✗</span>
                <span>Reduziertes Gehalt über Jahre</span>
              </li>
              <li className="flex gap-2">
                <span>✗</span>
                <span>Geringere Rentenansprüche</span>
              </li>
              <li className="flex gap-2">
                <span>✗</span>
                <span>Lange Bindung an Arbeitgeber</span>
              </li>
              <li className="flex gap-2">
                <span>✗</span>
                <span>Bei Kündigung: Nachverrechnung möglich</span>
              </li>
              <li className="flex gap-2">
                <span>✗</span>
                <span>Weniger Krankengeld/ALG bei Krankheit</span>
              </li>
              <li className="flex gap-2">
                <span>✗</span>
                <span>Nicht in allen Betrieben verfügbar</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Rechtliche Grundlagen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">⚖️ Rechtliche Grundlagen</h3>
        
        <div className="space-y-4 text-sm text-gray-600">
          <p>
            Ein gesetzlicher Anspruch auf ein Sabbatical besteht in Deutschland <strong>nicht</strong>. 
            Es handelt sich um eine freiwillige Vereinbarung zwischen Arbeitnehmer und Arbeitgeber.
          </p>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-800 mb-2">📝 Was sollte im Vertrag stehen?</h4>
            <ul className="space-y-1">
              <li>• Dauer der Ansparphase und Freistellung</li>
              <li>• Höhe des reduzierten Gehalts</li>
              <li>• Regelung bei vorzeitiger Kündigung</li>
              <li>• Urlaubsanspruch während Freistellung</li>
              <li>• Rückkehrgarantie und Position</li>
              <li>• Dienstwagen, Firmenlaptop etc. in der Freistellung</li>
            </ul>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 className="font-semibold text-amber-800 mb-2">⚠️ Achtung bei Kündigung</h4>
            <p className="text-amber-700">
              Endet das Arbeitsverhältnis vor oder während des Sabbaticals, muss in der Regel 
              eine Ausgleichszahlung erfolgen. Regeln Sie dies unbedingt im Vertrag!
            </p>
          </div>
        </div>
      </div>

      {/* Tipps */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-indigo-800 mb-3">💡 Tipps für Ihr Sabbatical</h3>
        <ul className="space-y-2 text-sm text-indigo-700">
          <li className="flex gap-2">
            <span>1.</span>
            <span><strong>Frühzeitig planen:</strong> Beginnen Sie das Gespräch 1-2 Jahre vor dem gewünschten Sabbatical</span>
          </li>
          <li className="flex gap-2">
            <span>2.</span>
            <span><strong>Schriftlich fixieren:</strong> Sabbatical-Vereinbarung als Ergänzung zum Arbeitsvertrag</span>
          </li>
          <li className="flex gap-2">
            <span>3.</span>
            <span><strong>Finanzen prüfen:</strong> Können Sie das reduzierte Gehalt über Jahre stemmen?</span>
          </li>
          <li className="flex gap-2">
            <span>4.</span>
            <span><strong>Versicherungen checken:</strong> Kranken-, Haftpflicht- und Unfallversicherung prüfen</span>
          </li>
          <li className="flex gap-2">
            <span>5.</span>
            <span><strong>Rückkehr planen:</strong> Wie wird die Wiedereingliederung gestaltet?</span>
          </li>
          <li className="flex gap-2">
            <span>6.</span>
            <span><strong>Steuerberater fragen:</strong> Steuerliche Auswirkungen können komplex sein</span>
          </li>
        </ul>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">❓ Häufige Fragen</h3>
        
        <div className="space-y-4">
          <details className="group">
            <summary className="cursor-pointer font-medium text-gray-800 hover:text-indigo-600">
              Was passiert mit meinem Urlaub während des Sabbaticals?
            </summary>
            <p className="mt-2 text-sm text-gray-600 pl-4">
              Während der Freistellungsphase entsteht in der Regel kein Urlaubsanspruch, da keine 
              Arbeitspflicht besteht. Dies sollte aber im Vertrag klar geregelt werden.
            </p>
          </details>
          
          <details className="group">
            <summary className="cursor-pointer font-medium text-gray-800 hover:text-indigo-600">
              Bin ich während des Sabbaticals krankenversichert?
            </summary>
            <p className="mt-2 text-sm text-gray-600 pl-4">
              Ja! Da Sie weiterhin Gehalt beziehen, bleiben Sie in der gesetzlichen Krankenversicherung 
              pflichtversichert. Auch alle anderen Sozialversicherungen laufen weiter.
            </p>
          </details>
          
          <details className="group">
            <summary className="cursor-pointer font-medium text-gray-800 hover:text-indigo-600">
              Kann ich während des Sabbaticals woanders arbeiten?
            </summary>
            <p className="mt-2 text-sm text-gray-600 pl-4">
              In der Regel nein. Das Arbeitsverhältnis besteht weiter und damit auch die Treuepflicht. 
              Nebentätigkeiten müssen wie gewohnt genehmigt werden.
            </p>
          </details>
          
          <details className="group">
            <summary className="cursor-pointer font-medium text-gray-800 hover:text-indigo-600">
              Was ist, wenn ich während des Sabbaticals krank werde?
            </summary>
            <p className="mt-2 text-sm text-gray-600 pl-4">
              Das Sabbatical läuft weiter. Ein "Nachholen" ist nicht vorgesehen, sofern nicht anders 
              vereinbart. Bei längerer Krankheit greifen die normalen Regelungen (Lohnfortzahlung, Krankengeld).
            </p>
          </details>
          
          <details className="group">
            <summary className="cursor-pointer font-medium text-gray-800 hover:text-indigo-600">
              Ist das Ansparmodell das einzige Sabbatical-Modell?
            </summary>
            <p className="mt-2 text-sm text-gray-600 pl-4">
              Nein, es gibt auch das Zeitwertkontenmodell (Überstunden/Urlaub ansparen) oder unbezahlten 
              Sonderurlaub. Das Ansparmodell ist aber das häufigste, da es planbar und sozialversichert ist.
            </p>
          </details>
        </div>
      </div>

            <RechnerFeedback rechnerName="Sabbatical-Rechner" rechnerSlug="sabbatical-rechner" />

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & weitere Infos</h4>
        <div className="space-y-1">
          <a 
            href="https://www.bmas.de/DE/Arbeit/Arbeitsrecht/arbeitsrecht.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesministerium für Arbeit und Soziales – Arbeitsrecht
          </a>
          <a 
            href="https://www.haufe.de/personal/arbeitsrecht/sabbatical-rechtliche-grundlagen_76_520432.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Haufe – Sabbatical: Rechtliche Grundlagen
          </a>
          <a 
            href="https://www.deutsche-rentenversicherung.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsche Rentenversicherung – Auswirkungen auf die Rente
          </a>
        </div>
      </div>
    </div>
  );
}
