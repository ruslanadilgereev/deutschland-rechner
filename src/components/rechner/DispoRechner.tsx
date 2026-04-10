import { useState, useEffect, useCallback } from 'react';
import RechnerFeedback from './RechnerFeedback';

interface DispoResult {
  zinskosten: number;
  zinskostenProTag: number;
  zinskostenProMonat: number;
  zinskostenProJahr: number;
  vergleichRatenkredit: {
    zinssatz: number;
    monatlicheRate: number;
    gesamtkosten: number;
    ersparnis: number;
  } | null;
  hochgerechnetAufJahr: number;
  warnungsstufe: 'niedrig' | 'mittel' | 'hoch' | 'kritisch';
}

const formatCurrency = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
};

const formatCurrencyShort = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
};

const formatPercent = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
};

export default function DispoRechner() {
  // Input State
  const [betrag, setBetrag] = useState<number>(1000);
  const [zinssatz, setZinssatz] = useState<number>(11.5);
  const [dauerWert, setDauerWert] = useState<number>(30);
  const [dauerEinheit, setDauerEinheit] = useState<'tage' | 'monate'>('tage');
  
  // Result State
  const [result, setResult] = useState<DispoResult | null>(null);

  const berechneDispokosten = useCallback(() => {
    // Umrechnung in Tage
    const tage = dauerEinheit === 'tage' ? dauerWert : dauerWert * 30;
    
    // Zinsberechnung: Betrag × (Zinssatz/100) × (Tage/365)
    const zinskosten = betrag * (zinssatz / 100) * (tage / 365);
    const zinskostenProTag = betrag * (zinssatz / 100) / 365;
    const zinskostenProMonat = betrag * (zinssatz / 100) / 12;
    const zinskostenProJahr = betrag * (zinssatz / 100);
    
    // Hochrechnung auf ein Jahr bei aktueller Nutzung
    const hochgerechnetAufJahr = zinskostenProJahr;
    
    // Vergleich mit Ratenkredit (nur wenn Betrag >= 500€ und Dauer > 30 Tage)
    let vergleichRatenkredit = null;
    if (betrag >= 500 && tage >= 30) {
      const ratenkreditZins = 6.5; // Durchschnittlicher Ratenkredit-Zins
      const laufzeitMonate = Math.max(6, Math.ceil(tage / 30)); // Mindestens 6 Monate
      
      // Vereinfachte Annuitätenberechnung
      const monatszins = ratenkreditZins / 100 / 12;
      const monatlicheRate = betrag * (monatszins * Math.pow(1 + monatszins, laufzeitMonate)) / 
                            (Math.pow(1 + monatszins, laufzeitMonate) - 1);
      const gesamtkosten = monatlicheRate * laufzeitMonate;
      const zinsenRatenkredit = gesamtkosten - betrag;
      
      // Dispo-Kosten für gleichen Zeitraum
      const dispoKostenGleicherZeitraum = betrag * (zinssatz / 100) * (laufzeitMonate / 12);
      
      vergleichRatenkredit = {
        zinssatz: ratenkreditZins,
        monatlicheRate,
        gesamtkosten,
        ersparnis: dispoKostenGleicherZeitraum - zinsenRatenkredit
      };
    }
    
    // Warnungsstufe bestimmen
    let warnungsstufe: DispoResult['warnungsstufe'] = 'niedrig';
    if (zinskosten > 100 || tage > 60) {
      warnungsstufe = 'mittel';
    }
    if (zinskosten > 250 || tage > 90 || betrag > 3000) {
      warnungsstufe = 'hoch';
    }
    if (zinskosten > 500 || tage > 180 || betrag > 5000) {
      warnungsstufe = 'kritisch';
    }
    
    setResult({
      zinskosten,
      zinskostenProTag,
      zinskostenProMonat,
      zinskostenProJahr,
      vergleichRatenkredit,
      hochgerechnetAufJahr,
      warnungsstufe
    });
  }, [betrag, zinssatz, dauerWert, dauerEinheit]);

  useEffect(() => {
    berechneDispokosten();
  }, [berechneDispokosten]);

  // Warnung-Farben
  const getWarnungFarben = (stufe: DispoResult['warnungsstufe']) => {
    switch (stufe) {
      case 'niedrig': return { bg: 'from-green-500 to-emerald-600', text: 'text-green-100' };
      case 'mittel': return { bg: 'from-yellow-500 to-amber-600', text: 'text-yellow-100' };
      case 'hoch': return { bg: 'from-orange-500 to-red-500', text: 'text-orange-100' };
      case 'kritisch': return { bg: 'from-red-600 to-red-800', text: 'text-red-100' };
    }
  };

  const getWarnungText = (stufe: DispoResult['warnungsstufe']) => {
    switch (stufe) {
      case 'niedrig': return '✓ Kurzfristige Überziehung';
      case 'mittel': return '⚠ Erhöhte Kosten';
      case 'hoch': return '⚠ Hohe Belastung – Umschuldung prüfen!';
      case 'kritisch': return '🚨 Kritisch – dringend Alternativen prüfen!';
    }
  };

  return (
    <div className="space-y-6">
      <RechnerFeedback rechnerName="Dispo-Rechner" rechnerSlug="dispo-rechner" />

{/* Eingabebereich */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Dispo-Überziehung berechnen</h2>
        
        <div className="space-y-4">
          {/* Überzogener Betrag */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Überzogener Betrag *
            </label>
            <div className="relative">
              <input
                type="number"
                value={betrag || ''}
                onChange={(e) => setBetrag(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="1000"
                min="1"
                step="100"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Wie viel ist Ihr Konto im Minus?</p>
          </div>

          {/* Dispozins */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dispozins Ihrer Bank: <span className="font-bold text-red-600">{formatPercent(zinssatz)}</span>
            </label>
            <input
              type="range"
              min="5"
              max="20"
              step="0.25"
              value={zinssatz}
              onChange={(e) => setZinssatz(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5%</span>
              <span className="text-red-600 font-medium">~11% (Durchschnitt)</span>
              <span>20%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              💡 Stand 2025: Durchschnitt ~11,31%, einige Banken bis 19,75%
            </p>
          </div>

          {/* Dauer der Überziehung */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dauer der Überziehung
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={dauerWert || ''}
                  onChange={(e) => setDauerWert(Math.max(1, Number(e.target.value)))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="30"
                  min="1"
                />
              </div>
              <select
                value={dauerEinheit}
                onChange={(e) => setDauerEinheit(e.target.value as 'tage' | 'monate')}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
              >
                <option value="tage">Tage</option>
                <option value="monate">Monate</option>
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">Wie lange ist das Konto überzogen?</p>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      {result && (
        <div className={`bg-gradient-to-br ${getWarnungFarben(result.warnungsstufe).bg} rounded-2xl shadow-lg p-6 text-white`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-lg font-medium ${getWarnungFarben(result.warnungsstufe).text}`}>
              Ihre Dispo-Kosten
            </h3>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
              {getWarnungText(result.warnungsstufe)}
            </span>
          </div>
          
          <div className="text-center py-4">
            <div className="text-4xl font-bold mb-1">
              {formatCurrency(result.zinskosten)}
            </div>
            <div className={`text-sm ${getWarnungFarben(result.warnungsstufe).text}`}>
              Zinskosten für {dauerWert} {dauerEinheit === 'tage' ? 'Tage' : 'Monate'}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <div className="text-lg font-bold">{formatCurrency(result.zinskostenProTag)}</div>
              <div className={`text-xs ${getWarnungFarben(result.warnungsstufe).text}`}>pro Tag</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <div className="text-lg font-bold">{formatCurrency(result.zinskostenProMonat)}</div>
              <div className={`text-xs ${getWarnungFarben(result.warnungsstufe).text}`}>pro Monat</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <div className="text-lg font-bold">{formatCurrency(result.zinskostenProJahr)}</div>
              <div className={`text-xs ${getWarnungFarben(result.warnungsstufe).text}`}>pro Jahr</div>
            </div>
          </div>

          {/* Hochrechnung */}
          <div className="mt-4 bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className={getWarnungFarben(result.warnungsstufe).text}>
                Bei dauerhafter Überziehung von {formatCurrencyShort(betrag)}:
              </span>
              <span className="text-xl font-bold">{formatCurrencyShort(result.hochgerechnetAufJahr)} / Jahr</span>
            </div>
          </div>
        </div>
      )}

      {/* Vergleich mit Ratenkredit */}
      {result && result.vergleichRatenkredit && result.vergleichRatenkredit.ersparnis > 10 && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-emerald-800 mb-3 flex items-center gap-2">
            💡 Tipp: Umschuldung auf Ratenkredit
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-xl p-4 border border-red-200">
              <div className="text-sm text-gray-500 mb-1">Dispo ({formatPercent(zinssatz)})</div>
              <div className="text-xl font-bold text-red-600">
                {formatCurrency(betrag * (zinssatz / 100) * (Math.max(6, Math.ceil((dauerEinheit === 'tage' ? dauerWert : dauerWert * 30) / 30)) / 12))}
              </div>
              <div className="text-xs text-gray-500">Zinsen bei gleicher Laufzeit</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-emerald-200">
              <div className="text-sm text-gray-500 mb-1">Ratenkredit (~{result.vergleichRatenkredit.zinssatz}%)</div>
              <div className="text-xl font-bold text-emerald-600">
                {formatCurrency(result.vergleichRatenkredit.gesamtkosten - betrag)}
              </div>
              <div className="text-xs text-gray-500">{formatCurrency(result.vergleichRatenkredit.monatlicheRate)}/Monat</div>
            </div>
          </div>
          
          <div className="bg-emerald-100 rounded-xl p-4 text-center">
            <span className="text-emerald-700">Mögliche Ersparnis:</span>
            <span className="text-2xl font-bold text-emerald-800 ml-2">
              {formatCurrency(result.vergleichRatenkredit.ersparnis)}
            </span>
          </div>
          
          <p className="text-sm text-emerald-700 mt-3">
            ⚡ Ein Ratenkredit ist oft deutlich günstiger als der Dispo – und Sie haben einen festen Tilgungsplan!
          </p>
        </div>
      )}

      {/* Kostenvisualisierung */}
      {result && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Was Sie mit dem Geld sonst kaufen könnten</h3>
          
          <div className="space-y-3">
            {result.zinskostenProJahr >= 50 && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-2xl">☕</span>
                <span className="text-gray-700">
                  <strong>{Math.floor(result.zinskostenProJahr / 4)}</strong> Kaffee pro Jahr
                </span>
              </div>
            )}
            {result.zinskostenProJahr >= 100 && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-2xl">🎬</span>
                <span className="text-gray-700">
                  <strong>{Math.floor(result.zinskostenProJahr / 12)}</strong> Kinobesuche
                </span>
              </div>
            )}
            {result.zinskostenProJahr >= 200 && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-2xl">📱</span>
                <span className="text-gray-700">
                  <strong>{Math.floor(result.zinskostenProJahr / 15)} Monate</strong> Streaming-Abos
                </span>
              </div>
            )}
            {result.zinskostenProJahr >= 500 && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-2xl">✈️</span>
                <span className="text-gray-700">
                  <strong>{Math.floor(result.zinskostenProJahr / 200)}</strong> Wochenend-Trips
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Zinssatz-Vergleich */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Dispozins im Vergleich</h3>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Tagesgeld (Sparzins)</span>
              <span className="font-medium text-emerald-600">~3%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '15%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Ratenkredit</span>
              <span className="font-medium text-blue-600">~6-8%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '35%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 font-medium">Dispozins (Ihr Wert)</span>
              <span className="font-medium text-red-600">{formatPercent(zinssatz)}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(100, zinssatz * 5)}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Überziehungszins (noch teurer!)</span>
              <span className="font-medium text-red-800">~15-20%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-800 rounded-full" style={{ width: '90%' }}></div>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          ⚠️ Der <strong>Überziehungszins</strong> (geduldete Überziehung) ist noch höher als der Dispozins 
          und wird berechnet, wenn Sie Ihren vereinbarten Disporahmen überschreiten!
        </p>
      </div>

      {/* Warnhinweise je nach Stufe */}
      {result && (result.warnungsstufe === 'hoch' || result.warnungsstufe === 'kritisch') && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6">
          <h3 className="font-semibold text-red-800 mb-3">🚨 Achtung: Schuldenfalle Dispo!</h3>
          <ul className="space-y-2 text-sm text-red-700">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              <span>Dauerhaft im Dispo zu sein ist <strong>sehr teuer</strong> – die Kosten summieren sich schnell</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              <span>Ein <strong>Ratenkredit</strong> ist oft nur halb so teuer und hat einen festen Rückzahlungsplan</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              <span>Sprechen Sie mit Ihrer Bank über eine <strong>Umschuldung</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              <span>Bei ernsten Problemen: <strong>Schuldnerberatung</strong> kontaktieren (kostenlos!)</span>
            </li>
          </ul>
        </div>
      )}

      {/* Info-Box: Was ist ein Dispo? */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="font-semibold text-blue-800 mb-3">ℹ️ Was ist ein Dispositionskredit?</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span><strong>Dispokredit (Dispo):</strong> Erlaubt Ihnen, Ihr Konto bis zu einem vereinbarten Limit zu überziehen</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span><strong>Dispozins:</strong> Der Zinssatz für die Überziehung – durchschnittlich ~11% p.a.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span><strong>Geduldete Überziehung:</strong> Über den Disporahmen hinaus – noch teurer!</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span><strong>Zinsberechnung:</strong> Täglich auf den überzogenen Betrag, abgerechnet meist quartalsweise</span>
          </li>
        </ul>
      </div>

      {/* Tipps zum Sparen */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
        <h3 className="font-semibold text-emerald-800 mb-3">💡 Tipps: So vermeiden Sie hohe Dispo-Kosten</h3>
        <ul className="space-y-2 text-sm text-emerald-700">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">1.</span>
            <span><strong>Notgroschen aufbauen:</strong> 2-3 Monatsgehälter als Puffer vermeiden den Dispo</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">2.</span>
            <span><strong>Umschulden:</strong> Dauerhaften Dispo in günstigen Ratenkredit umwandeln</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">3.</span>
            <span><strong>Disporahmen senken:</strong> Weniger Verlockung, ins Minus zu rutschen</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">4.</span>
            <span><strong>Bank wechseln:</strong> Einige Banken bieten Dispos unter 10%</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">5.</span>
            <span><strong>Haushaltsbuch:</strong> Ausgaben tracken, um Engpässe zu vermeiden</span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h3 className="font-semibold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Dieser Rechner dient nur zur <strong>Orientierung</strong> – die tatsächlichen Kosten können abweichen</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Die Zinsberechnung erfolgt bei den meisten Banken <strong>taggenau</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Bei <strong>Überziehung über den Disporahmen</strong> wird ein noch höherer Überziehungszins fällig</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Die Bank kann den <strong>Disporahmen jederzeit kürzen</strong> oder kündigen</span>
          </li>
        </ul>
      </div>

      {/* Anlaufstellen */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-4">📞 Hilfe bei Schulden</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-2xl">🏦</span>
            <div>
              <div className="font-medium text-gray-800">Verbraucherzentrale</div>
              <div className="text-sm text-gray-600">Kostenlose Schuldnerberatung</div>
              <a 
                href="https://www.verbraucherzentrale.de/schuldnerberatung" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                verbraucherzentrale.de/schuldnerberatung →
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-2xl">🤝</span>
            <div>
              <div className="font-medium text-gray-800">Caritas & Diakonie</div>
              <div className="text-sm text-gray-600">Kostenlose Beratungsstellen bundesweit</div>
              <a 
                href="https://www.caritas.de/hilfeundberatung/onlineberatung/schuldnerberatung" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                caritas.de/schuldnerberatung →
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-2xl">📊</span>
            <div>
              <div className="font-medium text-gray-800">BaFin - Dispozins-Übersicht</div>
              <div className="text-sm text-gray-600">Offizielle Statistik der Dispozinsen</div>
              <a 
                href="https://www.bafin.de/DE/Verbraucher/verbraucher_node.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                bafin.de →
              </a>
            </div>
          </div>
        </div>
      </div>
{/* Quellen */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-700 mb-3">📚 Quellen & Rechtliche Grundlagen</h3>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>
            <a href="https://www.gesetze-im-internet.de/bgb/__488.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              § 488 BGB – Vertragstypische Pflichten beim Darlehensvertrag
            </a>
          </li>
          <li>
            <a href="https://www.gesetze-im-internet.de/bgb/__493.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              § 493 BGB – Informationen während des Vertragsverhältnisses
            </a>
          </li>
          <li>
            <a href="https://www.bundesbank.de/de/statistiken/geld-und-kapitalmaerkte/zinssaetze-und-renditen" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Bundesbank – Statistik zu Überziehungskrediten
            </a>
          </li>
          <li>
            <a href="https://www.bafin.de/DE/PublikationenDaten/Statistiken/Zinsstatistik/zinsstatistik_node.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              BaFin – Zinsstatistik Deutschland
            </a>
          </li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          Stand: Januar 2026. Alle Angaben ohne Gewähr. 
          Durchschnittlicher Dispozins laut BaFin: ~11,31% (11/2025).
        </p>
      </div>
    </div>
  );
}
