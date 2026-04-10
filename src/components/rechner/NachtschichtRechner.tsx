import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// §3b EStG - Steuerfreie Zuschläge 2025/2026
// Grundlohn-Deckel: max. 50 €/Stunde für steuerfreie Zuschläge
const GRUNDLOHN_DECKEL = 50;

// Steuerfreie Zuschlagssätze nach §3b EStG
const ZUSCHLAEGE = {
  nacht: {
    standard: 0.25, // 25% (20-6 Uhr)
    erhoet: 0.40,   // 40% (0-4 Uhr, wenn vor 0 Uhr begonnen)
    beschreibung: 'Nachtarbeit (20-6 Uhr)',
    beschreibungErhoet: 'Nachtarbeit (0-4 Uhr, erhöht)',
  },
  sonntag: {
    satz: 0.50, // 50%
    beschreibung: 'Sonntagsarbeit',
  },
  feiertag: {
    standard: 1.25, // 125%
    besonders: 1.50, // 150%
    beschreibung: 'Feiertagsarbeit (allgemein)',
    beschreibungBesonders: 'Besondere Feiertage (24.12. ab 14h, 25./26.12., 1. Mai)',
  },
};

// Gesetzliche Feiertage Bundesweit
const BUNDESWEITE_FEIERTAGE = [
  'Neujahr (1. Januar)',
  'Karfreitag',
  'Ostermontag',
  'Tag der Arbeit (1. Mai)',
  'Christi Himmelfahrt',
  'Pfingstmontag',
  'Tag der Deutschen Einheit (3. Oktober)',
  '1. Weihnachtstag (25. Dezember)',
  '2. Weihnachtstag (26. Dezember)',
];

type ArbeitsTyp = 'nacht' | 'sonntag' | 'feiertag' | 'feiertag_besonders' | 'nacht_sonntag' | 'nacht_feiertag' | 'nacht_feiertag_besonders';

export default function NachtschichtRechner() {
  // Eingabewerte
  const [stundenlohn, setStundenlohn] = useState(20);
  const [stunden, setStunden] = useState(8);
  const [arbeitsTyp, setArbeitsTyp] = useState<ArbeitsTyp>('nacht');
  const [nachtArt, setNachtArt] = useState<'standard' | 'erhoet'>('standard');
  const [arbeitgeberZuschlag, setArbeitgeberZuschlag] = useState(25); // Tatsächlich gezahlter Zuschlag in %
  const [monatlicheStunden, setMonatlicheStunden] = useState(40); // für Jahresberechnung

  const ergebnis = useMemo(() => {
    // === 1. Effektiver Grundlohn (max. 50 €) für Steuerfreiheit ===
    const effektiverGrundlohn = Math.min(stundenlohn, GRUNDLOHN_DECKEL);
    const grundlohnGedeckelt = stundenlohn > GRUNDLOHN_DECKEL;
    
    // === 2. Steuerfreie Zuschlagssätze nach §3b EStG bestimmen ===
    let maxSteuerfrei = 0;
    let beschreibung = '';
    
    switch (arbeitsTyp) {
      case 'nacht':
        maxSteuerfrei = nachtArt === 'erhoet' ? ZUSCHLAEGE.nacht.erhoet : ZUSCHLAEGE.nacht.standard;
        beschreibung = nachtArt === 'erhoet' ? ZUSCHLAEGE.nacht.beschreibungErhoet : ZUSCHLAEGE.nacht.beschreibung;
        break;
      case 'sonntag':
        maxSteuerfrei = ZUSCHLAEGE.sonntag.satz;
        beschreibung = ZUSCHLAEGE.sonntag.beschreibung;
        break;
      case 'feiertag':
        maxSteuerfrei = ZUSCHLAEGE.feiertag.standard;
        beschreibung = ZUSCHLAEGE.feiertag.beschreibung;
        break;
      case 'feiertag_besonders':
        maxSteuerfrei = ZUSCHLAEGE.feiertag.besonders;
        beschreibung = ZUSCHLAEGE.feiertag.beschreibungBesonders;
        break;
      case 'nacht_sonntag':
        // Nacht + Sonntag = beide addieren
        maxSteuerfrei = (nachtArt === 'erhoet' ? ZUSCHLAEGE.nacht.erhoet : ZUSCHLAEGE.nacht.standard) + ZUSCHLAEGE.sonntag.satz;
        beschreibung = `Nachtarbeit + Sonntagsarbeit`;
        break;
      case 'nacht_feiertag':
        // Nacht + Feiertag (allgemein)
        maxSteuerfrei = (nachtArt === 'erhoet' ? ZUSCHLAEGE.nacht.erhoet : ZUSCHLAEGE.nacht.standard) + ZUSCHLAEGE.feiertag.standard;
        beschreibung = `Nachtarbeit + Feiertagsarbeit`;
        break;
      case 'nacht_feiertag_besonders':
        // Nacht + besonderer Feiertag
        maxSteuerfrei = (nachtArt === 'erhoet' ? ZUSCHLAEGE.nacht.erhoet : ZUSCHLAEGE.nacht.standard) + ZUSCHLAEGE.feiertag.besonders;
        beschreibung = `Nachtarbeit + besonderer Feiertag`;
        break;
    }
    
    // === 3. Tatsächlicher Zuschlag vom Arbeitgeber ===
    const tatsaechlicherSatz = arbeitgeberZuschlag / 100;
    
    // === 4. Steuerfreier Anteil berechnen ===
    // Steuerfrei ist der Zuschlag bis zum max. Satz auf max. 50 € Grundlohn
    const maxSteuerfreibetragProStunde = effektiverGrundlohn * maxSteuerfrei;
    const tatsaechlicherZuschlagProStunde = stundenlohn * tatsaechlicherSatz;
    
    // Wie viel davon ist steuerfrei?
    const steuerfreierBetragProStunde = Math.min(tatsaechlicherZuschlagProStunde, maxSteuerfreibetragProStunde);
    const steuerpflichtigerBetragProStunde = Math.max(0, tatsaechlicherZuschlagProStunde - steuerfreierBetragProStunde);
    
    // === 5. Berechnung für die angegebene Stundenzahl ===
    const grundlohnGesamt = stundenlohn * stunden;
    const zuschlagGesamt = tatsaechlicherZuschlagProStunde * stunden;
    const steuerfreierBetrag = steuerfreierBetragProStunde * stunden;
    const steuerpflichtigerBetrag = steuerpflichtigerBetragProStunde * stunden;
    const gesamtVerdienst = grundlohnGesamt + zuschlagGesamt;
    
    // === 6. Monatliche/Jährliche Hochrechnung ===
    const monatlichGrundlohn = stundenlohn * monatlicheStunden;
    const monatlichZuschlag = tatsaechlicherZuschlagProStunde * monatlicheStunden;
    const monatlichSteuerfrei = steuerfreierBetragProStunde * monatlicheStunden;
    const monatlichSteuerpflichtig = steuerpflichtigerBetragProStunde * monatlicheStunden;
    const monatlichGesamt = monatlichGrundlohn + monatlichZuschlag;
    
    const jaehrlichSteuerfrei = monatlichSteuerfrei * 12;
    const jaehrlichSteuerpflichtig = monatlichSteuerpflichtig * 12;
    
    // === 7. Steuervorteil schätzen (ca. 30% Durchschnittssteuersatz) ===
    const geschaetzterSteuervorteil = jaehrlichSteuerfrei * 0.30;
    
    // === 8. Sozialversicherungsfreiheit ===
    // Zuschläge sind auch SV-frei bis zur gleichen Grenze
    const svFreierBetrag = steuerfreierBetrag;
    const svPflichtBetrag = steuerpflichtigerBetrag;
    
    return {
      // Eingangswerte
      stundenlohn,
      effektiverGrundlohn,
      grundlohnGedeckelt,
      stunden,
      
      // Zuschlagssätze
      maxSteuerfrei: maxSteuerfrei * 100, // in %
      tatsaechlicherSatz: arbeitgeberZuschlag,
      beschreibung,
      
      // Pro Stunde
      maxSteuerfreibetragProStunde,
      tatsaechlicherZuschlagProStunde,
      steuerfreierBetragProStunde,
      steuerpflichtigerBetragProStunde,
      
      // Für die Schicht
      grundlohnGesamt,
      zuschlagGesamt,
      steuerfreierBetrag,
      steuerpflichtigerBetrag,
      gesamtVerdienst,
      
      // Monatlich
      monatlichGrundlohn,
      monatlichZuschlag,
      monatlichSteuerfrei,
      monatlichSteuerpflichtig,
      monatlichGesamt,
      
      // Jährlich
      jaehrlichSteuerfrei,
      jaehrlichSteuerpflichtig,
      geschaetzterSteuervorteil,
      
      // SV
      svFreierBetrag,
      svPflichtBetrag,
    };
  }, [stundenlohn, stunden, arbeitsTyp, nachtArt, arbeitgeberZuschlag, monatlicheStunden]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Eingabebereich */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          📝 Ihre Angaben
        </h2>
        
        <div className="grid gap-4">
          {/* Stundenlohn */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brutto-Stundenlohn
            </label>
            <div className="relative">
              <input
                type="number"
                value={stundenlohn}
                onChange={(e) => setStundenlohn(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                min="0"
                step="0.50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/h</span>
            </div>
            {ergebnis.grundlohnGedeckelt && (
              <p className="text-amber-600 text-xs mt-1">
                ⚠️ Für die Steuerfreiheit zählt nur max. 50 €/h
              </p>
            )}
          </div>

          {/* Art der Arbeit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Art der Arbeit
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setArbeitsTyp('nacht')}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  arbeitsTyp === 'nacht' 
                    ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🌙 Nachtarbeit
              </button>
              <button
                onClick={() => setArbeitsTyp('sonntag')}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  arbeitsTyp === 'sonntag' 
                    ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                ☀️ Sonntag
              </button>
              <button
                onClick={() => setArbeitsTyp('feiertag')}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  arbeitsTyp === 'feiertag' 
                    ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🎉 Feiertag
              </button>
              <button
                onClick={() => setArbeitsTyp('feiertag_besonders')}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  arbeitsTyp === 'feiertag_besonders' 
                    ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🎄 Weihnachten/1. Mai
              </button>
              <button
                onClick={() => setArbeitsTyp('nacht_sonntag')}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  arbeitsTyp === 'nacht_sonntag' 
                    ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🌙☀️ Nacht + Sonntag
              </button>
              <button
                onClick={() => setArbeitsTyp('nacht_feiertag')}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  arbeitsTyp === 'nacht_feiertag' 
                    ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🌙🎉 Nacht + Feiertag
              </button>
            </div>
          </div>

          {/* Nachtart (nur bei Nachtarbeit) */}
          {(arbeitsTyp === 'nacht' || arbeitsTyp === 'nacht_sonntag' || arbeitsTyp === 'nacht_feiertag' || arbeitsTyp === 'nacht_feiertag_besonders') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nachtarbeit-Zeitraum
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setNachtArt('standard')}
                  className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    nachtArt === 'standard' 
                      ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  20-6 Uhr (25%)
                </button>
                <button
                  onClick={() => setNachtArt('erhoet')}
                  className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    nachtArt === 'erhoet' 
                      ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  0-4 Uhr (40%)*
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                *40% gilt nur, wenn die Arbeit vor 0 Uhr begonnen wurde
              </p>
            </div>
          )}

          {/* Tatsächlicher Zuschlag vom Arbeitgeber */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ihr Zuschlag vom Arbeitgeber
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={arbeitgeberZuschlag}
                onChange={(e) => setArbeitgeberZuschlag(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="w-20">
                <input
                  type="number"
                  value={arbeitgeberZuschlag}
                  onChange={(e) => setArbeitgeberZuschlag(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-2 py-1 text-center border border-gray-200 rounded-lg"
                  min="0"
                />
              </div>
              <span className="text-gray-500">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Max. steuerfrei nach §3b EStG: {ergebnis.maxSteuerfrei.toFixed(0)}%
            </p>
          </div>

          {/* Arbeitsstunden */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stunden (Schicht)
              </label>
              <input
                type="number"
                value={stunden}
                onChange={(e) => setStunden(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                min="0"
                step="0.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stunden/Monat (Ø)
              </label>
              <input
                type="number"
                value={monatlicheStunden}
                onChange={(e) => setMonatlicheStunden(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                min="0"
                step="1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ergebnis: Einzelne Schicht */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          💰 Ergebnis für {stunden} Stunden {ergebnis.beschreibung}
        </h2>
        
        <div className="space-y-4">
          {/* Hauptergebnis */}
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-indigo-100">Gesamtverdienst</span>
              <span className="text-3xl font-bold">{formatCurrency(ergebnis.gesamtVerdienst)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-indigo-200">Grundlohn</span>
                <span>{formatCurrency(ergebnis.grundlohnGesamt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-200">+ Zuschlag ({arbeitgeberZuschlag}%)</span>
                <span>{formatCurrency(ergebnis.zuschlagGesamt)}</span>
              </div>
            </div>
          </div>

          {/* Steuerfreier Anteil */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-400/20 rounded-xl p-3">
              <div className="text-green-200 text-sm mb-1">✓ Steuerfrei</div>
              <div className="text-xl font-bold">{formatCurrency(ergebnis.steuerfreierBetrag)}</div>
              <div className="text-green-200 text-xs">Nach §3b EStG</div>
            </div>
            {ergebnis.steuerpflichtigerBetrag > 0 && (
              <div className="bg-red-400/20 rounded-xl p-3">
                <div className="text-red-200 text-sm mb-1">⚠ Steuerpflichtig</div>
                <div className="text-xl font-bold">{formatCurrency(ergebnis.steuerpflichtigerBetrag)}</div>
                <div className="text-red-200 text-xs">Über max. Satz</div>
              </div>
            )}
          </div>

          {/* Info zur Berechnung */}
          <div className="text-xs text-indigo-200 bg-white/5 rounded-lg p-3">
            <p>
              <strong>Berechnung:</strong> Steuerfrei sind max. {ergebnis.maxSteuerfrei.toFixed(0)}% 
              von {formatCurrency(ergebnis.effektiverGrundlohn)}/h = {formatCurrency(ergebnis.maxSteuerfreibetragProStunde)}/h
            </p>
          </div>
        </div>
      </div>

      {/* Monatliche Hochrechnung */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          📊 Monatliche Hochrechnung ({monatlicheStunden}h)
        </h2>
        
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Grundlohn</span>
            <span className="font-medium">{formatCurrency(ergebnis.monatlichGrundlohn)}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">+ Zuschläge gesamt</span>
            <span className="font-medium">{formatCurrency(ergebnis.monatlichZuschlag)}</span>
          </div>
          <div className="flex justify-between py-2 border-b text-green-600">
            <span>↳ davon steuerfrei</span>
            <span className="font-medium">{formatCurrency(ergebnis.monatlichSteuerfrei)}</span>
          </div>
          {ergebnis.monatlichSteuerpflichtig > 0 && (
            <div className="flex justify-between py-2 border-b text-amber-600">
              <span>↳ davon steuerpflichtig</span>
              <span className="font-medium">{formatCurrency(ergebnis.monatlichSteuerpflichtig)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 bg-gray-50 rounded-lg px-3 -mx-3">
            <span className="font-semibold text-gray-800">Gesamtverdienst brutto</span>
            <span className="font-bold text-lg">{formatCurrency(ergebnis.monatlichGesamt)}</span>
          </div>
        </div>
      </div>

      {/* Jährlicher Steuervorteil */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-green-800 mb-4">
          💚 Ihr jährlicher Steuervorteil
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-green-600 text-sm mb-1">Steuerfreie Zuschläge/Jahr</div>
            <div className="text-2xl font-bold text-green-800">
              {formatCurrency(ergebnis.jaehrlichSteuerfrei)}
            </div>
          </div>
          <div>
            <div className="text-green-600 text-sm mb-1">Geschätzte Steuerersparnis*</div>
            <div className="text-2xl font-bold text-green-800">
              ~{formatCurrency(ergebnis.geschaetzterSteuervorteil)}
            </div>
          </div>
        </div>
        <p className="text-xs text-green-600 mt-3">
          *Bei ca. 30% durchschnittlichem Steuersatz. Die Zuschläge sind auch sozialversicherungsfrei!
        </p>
      </div>

      {/* Detailberechnung */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          🔍 Detailberechnung pro Stunde
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-gray-500">Position</th>
                <th className="text-right py-2 text-gray-500">Betrag</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-2">Ihr Stundenlohn (brutto)</td>
                <td className="py-2 text-right font-medium">{formatCurrency(stundenlohn)}</td>
              </tr>
              {ergebnis.grundlohnGedeckelt && (
                <tr className="text-amber-600">
                  <td className="py-2">↳ Für Steuerfreiheit angesetzt (max. 50 €)</td>
                  <td className="py-2 text-right">{formatCurrency(ergebnis.effektiverGrundlohn)}</td>
                </tr>
              )}
              <tr>
                <td className="py-2">Max. steuerfreier Zuschlag ({ergebnis.maxSteuerfrei.toFixed(0)}%)</td>
                <td className="py-2 text-right">{formatCurrency(ergebnis.maxSteuerfreibetragProStunde)}</td>
              </tr>
              <tr>
                <td className="py-2">Tatsächlicher Zuschlag ({arbeitgeberZuschlag}%)</td>
                <td className="py-2 text-right">{formatCurrency(ergebnis.tatsaechlicherZuschlagProStunde)}</td>
              </tr>
              <tr className="text-green-600">
                <td className="py-2">= Steuerfreier Betrag</td>
                <td className="py-2 text-right font-medium">{formatCurrency(ergebnis.steuerfreierBetragProStunde)}</td>
              </tr>
              {ergebnis.steuerpflichtigerBetragProStunde > 0 && (
                <tr className="text-amber-600">
                  <td className="py-2">= Steuerpflichtiger Betrag</td>
                  <td className="py-2 text-right font-medium">{formatCurrency(ergebnis.steuerpflichtigerBetragProStunde)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Übersicht: Steuerfreie Zuschlagssätze */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          📋 Steuerfreie Zuschlagssätze nach §3b EStG
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-2 px-3">Arbeitszeit</th>
                <th className="text-right py-2 px-3">Max. steuerfrei</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-2 px-3">🌙 Nachtarbeit (20-6 Uhr)</td>
                <td className="py-2 px-3 text-right font-medium">25%</td>
              </tr>
              <tr>
                <td className="py-2 px-3">🌙 Nachtarbeit (0-4 Uhr, Beginn vor 0 Uhr)</td>
                <td className="py-2 px-3 text-right font-medium">40%</td>
              </tr>
              <tr>
                <td className="py-2 px-3">☀️ Sonntagsarbeit</td>
                <td className="py-2 px-3 text-right font-medium">50%</td>
              </tr>
              <tr>
                <td className="py-2 px-3">🎉 Gesetzliche Feiertage</td>
                <td className="py-2 px-3 text-right font-medium">125%</td>
              </tr>
              <tr>
                <td className="py-2 px-3">🎄 24.12. ab 14h, 25./26.12., 1. Mai</td>
                <td className="py-2 px-3 text-right font-medium">150%</td>
              </tr>
              <tr className="bg-yellow-50">
                <td className="py-2 px-3">🌙☀️ Nacht + Sonntag (kombiniert)</td>
                <td className="py-2 px-3 text-right font-medium">75% / 90%*</td>
              </tr>
              <tr className="bg-yellow-50">
                <td className="py-2 px-3">🌙🎉 Nacht + Feiertag (kombiniert)</td>
                <td className="py-2 px-3 text-right font-medium">150% / 165%*</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-gray-500 mt-2">*Je nach Nacht-Zeitraum (25% oder 40%)</p>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-amber-800 mb-4">
          ⚠️ Wichtige Hinweise
        </h2>
        
        <ul className="space-y-2 text-sm text-amber-900">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>50-Euro-Grenze:</strong> Steuerfreiheit gilt nur für Grundlöhne bis 50 €/Stunde. Darüber sind Zuschläge anteilig steuerpflichtig.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Tatsächliche Arbeit:</strong> Nur für tatsächlich geleistete Arbeit – Pauschalen ohne Nachweis sind nicht steuerfrei.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Nachweis erforderlich:</strong> Arbeitgeber muss Zeiten dokumentieren (Stechuhr, Dienstplan).</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Kombinationen möglich:</strong> Nacht- und Sonntags-/Feiertagszuschläge können addiert werden!</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Auch SV-frei:</strong> Steuerfreie Zuschläge sind auch von Sozialversicherungsbeiträgen befreit.</span>
          </li>
        </ul>
      </div>

      {/* Gesetzliche Feiertage */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          🗓️ Bundesweite gesetzliche Feiertage
        </h2>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          {BUNDESWEITE_FEIERTAGE.map((feiertag, index) => (
            <div key={index} className="flex items-center gap-2 py-1">
              <span className="text-indigo-500">•</span>
              <span>{feiertag}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Zusätzliche Feiertage je nach Bundesland (z.B. Fronleichnam, Allerheiligen) gelten ebenfalls als Feiertage i.S.d. §3b EStG.
        </p>
      </div>

      {/* Zuständige Behörden */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-4">
          🏛️ Zuständige Behörden & Kontakt
        </h2>
        
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-medium text-blue-800">Ihr Finanzamt</h3>
            <p className="text-blue-700">Zuständig für Einkommensteuer-Fragen</p>
            <a 
              href="https://www.bzst.de/DE/Privatpersonen/Finanzamtsuche/finanzamtsuche_node.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              → Finanzamt finden
            </a>
          </div>
          
          <div>
            <h3 className="font-medium text-blue-800">Vereinigte Lohnsteuerhilfe (VLH)</h3>
            <p className="text-blue-700">Beratung zur Steuererklärung</p>
            <a 
              href="https://www.vlh.de" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              → www.vlh.de
            </a>
          </div>
        </div>
      </div>

            <RechnerFeedback rechnerName="Nachtschicht-Zuschlag-Rechner" rechnerSlug="nachtschicht-rechner" />

      {/* Quellen */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          📚 Quellen & Rechtsgrundlagen
        </h2>
        
        <ul className="space-y-2 text-sm">
          <li>
            <a 
              href="https://www.gesetze-im-internet.de/estg/__3b.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline flex items-center gap-1"
            >
              §3b EStG – Steuerfreiheit von Zuschlägen für Sonntags-, Feiertags- oder Nachtarbeit
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </li>
          <li>
            <a 
              href="https://lsth.bundesfinanzministerium.de/lsth/2025/A-Einkommensteuergesetz/II-Einkommen-2-24b/2-Steuerfreie-Einnahmen-3-3c/Paragraf-3b/inhalt.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline flex items-center gap-1"
            >
              BMF Lohnsteuer-Handbuch 2025 – §3b Erläuterungen
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </li>
          <li>
            <a 
              href="https://www.bundesfinanzministerium.de" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline flex items-center gap-1"
            >
              Bundesministerium der Finanzen
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </li>
        </ul>
        
        <p className="text-xs text-gray-500 mt-4">
          Stand: März 2026. Alle Angaben ohne Gewähr. Bei komplexen Sachverhalten empfehlen wir 
          die Beratung durch einen Steuerberater oder Lohnsteuerhilfeverein.
        </p>
      </div>
    </div>
  );
}
