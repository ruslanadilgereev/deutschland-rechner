import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Minijob-Grenzen und Abgaben 2026
// Quelle: Minijob-Zentrale, BMAS, DRV
const MINIJOB = {
  verdienstgrenze: 603,                 // Monatliche Verdienstgrenze ab 01.01.2026
  jahresgrenze: 7236,                   // 603 × 12 Monate
  mindestlohn: 13.90,                   // Mindestlohn ab 01.01.2026 (12,82€ war 2025)
  // Formel: Mindestlohn × 130 ÷ 3 = 13,90 × 130 / 3 = 602,33 → aufgerundet 603€
};

// Arbeitgeber-Pauschalen 2026 (in Prozent)
// Quelle: https://magazin.minijob-zentrale.de/minijob-beitraege-2026/
const AG_ABGABEN = {
  krankenversicherung: 13.0,            // Pauschale KV (unverändert)
  rentenversicherung: 15.0,             // RV (volle Pauschale, unverändert)
  pauschsteuer: 2.0,                    // 2% Pauschsteuer (unverändert)
  unfallversicherung: 1.6,              // Durchschnitt UV (unverändert)
  umlage_u1: 0.80,                      // Umlage Krankheit (gesenkt von 1,1% auf 0,8%)
  umlage_u2: 0.22,                      // Umlage Mutterschaft (angepasst von 0,24%)
  insolvenzumlage: 0.15,                // Insolvenzgeldumlage (erhöht von 0,06%)
};

// Arbeitnehmer-Anteile 2026
const AN_ABGABEN = {
  rv_eigenanteil: 3.6,                  // RV Eigenanteil bei gewerblichem Minijob
  rv_eigenanteil_privathaushalt: 13.6,  // RV Eigenanteil bei Privathaushalt (weil AG nur 5% zahlt)
};

type Steuermodell = 'pauschal' | 'lohnsteuer';

export default function MinijobRechner() {
  const [bruttolohn, setBruttolohn] = useState(603);
  const [steuermodell, setSteuermodell] = useState<Steuermodell>('pauschal');
  const [rentenversicherungspflicht, setRentenversicherungspflicht] = useState(true);
  const [stundenWoche, setStundenWoche] = useState(10);
  const [istPrivathaushalt, setIstPrivathaushalt] = useState(false);

  const ergebnis = useMemo(() => {
    // === Arbeitgeber-Kosten ===
    let agKrankenversicherung = 0;
    let agRentenversicherung = 0;
    let agPauschsteuer = 0;
    let agUnfallversicherung = 0;
    let agUmlagen = 0;

    if (istPrivathaushalt) {
      // Haushaltsscheck-Verfahren: Ermäßigte Pauschalen für Privathaushalte
      agKrankenversicherung = bruttolohn * 0.05;    // 5% KV
      agRentenversicherung = bruttolohn * 0.05;     // 5% RV
      agPauschsteuer = bruttolohn * 0.02;           // 2% Steuer
      agUnfallversicherung = bruttolohn * 0.016;    // 1.6% UV
      agUmlagen = bruttolohn * 0.014;               // Umlagen ca. 1.4%
    } else {
      // Gewerblicher Minijob
      agKrankenversicherung = bruttolohn * (AG_ABGABEN.krankenversicherung / 100);
      agRentenversicherung = bruttolohn * (AG_ABGABEN.rentenversicherung / 100);
      agPauschsteuer = steuermodell === 'pauschal' 
        ? bruttolohn * (AG_ABGABEN.pauschsteuer / 100)
        : 0;
      agUnfallversicherung = bruttolohn * (AG_ABGABEN.unfallversicherung / 100);
      agUmlagen = bruttolohn * ((AG_ABGABEN.umlage_u1 + AG_ABGABEN.umlage_u2 + AG_ABGABEN.insolvenzumlage) / 100);
    }

    const agGesamtAbgaben = agKrankenversicherung + agRentenversicherung + agPauschsteuer + agUnfallversicherung + agUmlagen;
    const agGesamtkosten = bruttolohn + agGesamtAbgaben;
    const agAbgabenProzent = (agGesamtAbgaben / bruttolohn) * 100;

    // === Arbeitnehmer-Abzüge ===
    let anRentenversicherung = 0;
    
    if (rentenversicherungspflicht && !istPrivathaushalt) {
      // AN muss nur Differenz zu 18.6% Gesamt-RV zahlen (AG zahlt 15%)
      anRentenversicherung = bruttolohn * (AN_ABGABEN.rv_eigenanteil / 100);
    } else if (rentenversicherungspflicht && istPrivathaushalt) {
      // Bei Privathaushalt: AN zahlt 13,6% (weil AG nur 5% zahlt statt 15%)
      anRentenversicherung = bruttolohn * (AN_ABGABEN.rv_eigenanteil_privathaushalt / 100);
    }

    const nettolohn = bruttolohn - anRentenversicherung;

    // === Stundenlohn-Berechnung ===
    const stundenMonat = stundenWoche * 4.33; // Durchschnitt Wochen pro Monat
    const stundenlohn = stundenMonat > 0 ? bruttolohn / stundenMonat : 0;
    const istUeberMindestlohn = stundenlohn >= MINIJOB.mindestlohn;

    // === Grenzprüfung ===
    const ueberschreitetGrenze = bruttolohn > MINIJOB.verdienstgrenze;
    const jahresverdienst = bruttolohn * 12;

    // === Rentenauswirkung ===
    // Bei RV-Pflicht: Rentenpunkte = Jahresverdienst / Durchschnittsentgelt
    const rentenPunkteJahr = rentenversicherungspflicht 
      ? (bruttolohn * 12 / 51944) // Durchschnittsentgelt 2026: 51.944€ (vorläufig, Bundesregierung)
      : 0;
    const rentenProMonat = rentenPunkteJahr * 40.79; // Rentenwert 2026: 40,79€ (einheitlich seit 01.07.2025)

    return {
      // Arbeitgeber
      agKrankenversicherung: Math.round(agKrankenversicherung * 100) / 100,
      agRentenversicherung: Math.round(agRentenversicherung * 100) / 100,
      agPauschsteuer: Math.round(agPauschsteuer * 100) / 100,
      agUnfallversicherung: Math.round(agUnfallversicherung * 100) / 100,
      agUmlagen: Math.round(agUmlagen * 100) / 100,
      agGesamtAbgaben: Math.round(agGesamtAbgaben * 100) / 100,
      agGesamtkosten: Math.round(agGesamtkosten * 100) / 100,
      agAbgabenProzent: Math.round(agAbgabenProzent * 10) / 10,
      // Arbeitnehmer
      bruttolohn,
      anRentenversicherung: Math.round(anRentenversicherung * 100) / 100,
      nettolohn: Math.round(nettolohn * 100) / 100,
      // Stundenlohn
      stundenlohn: Math.round(stundenlohn * 100) / 100,
      stundenMonat: Math.round(stundenMonat * 10) / 10,
      istUeberMindestlohn,
      // Grenze
      ueberschreitetGrenze,
      jahresverdienst,
      verdienstgrenze: MINIJOB.verdienstgrenze,
      // Rente
      rentenPunkteJahr: Math.round(rentenPunkteJahr * 1000) / 1000,
      rentenProMonat: Math.round(rentenProMonat * 100) / 100,
    };
  }, [bruttolohn, steuermodell, rentenversicherungspflicht, stundenWoche, istPrivathaushalt]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatProzent = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Bruttolohn */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Monatlicher Bruttolohn</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={bruttolohn}
              onChange={(e) => setBruttolohn(Math.max(0, Math.min(1000, Number(e.target.value))))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              min="0"
              max="1000"
              step="10"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={bruttolohn}
            onChange={(e) => setBruttolohn(Number(e.target.value))}
            className="w-full mt-3 accent-blue-500"
            min="0"
            max="800"
            step="10"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span className={bruttolohn <= 603 ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
              Grenze: {MINIJOB.verdienstgrenze} €
            </span>
            <span>800 €</span>
          </div>
        </div>

        {/* Art des Minijobs */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Art des Minijobs</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIstPrivathaushalt(false)}
              className={`p-4 rounded-xl text-center transition-all ${
                !istPrivathaushalt
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl">🏢</span>
              <div className="font-bold mt-1">Gewerblich</div>
              <div className="text-xs mt-1 opacity-80">Firma / Unternehmen</div>
            </button>
            <button
              onClick={() => setIstPrivathaushalt(true)}
              className={`p-4 rounded-xl text-center transition-all ${
                istPrivathaushalt
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl">🏠</span>
              <div className="font-bold mt-1">Privathaushalt</div>
              <div className="text-xs mt-1 opacity-80">Haushaltsscheck</div>
            </button>
          </div>
        </div>

        {/* Steuermodell (nur bei gewerblich) */}
        {!istPrivathaushalt && (
          <div className="mb-6">
            <label className="block mb-3">
              <span className="text-gray-700 font-medium">Besteuerung</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSteuermodell('pauschal')}
                className={`p-4 rounded-xl text-center transition-all ${
                  steuermodell === 'pauschal'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-2xl">📊</span>
                <div className="font-bold mt-1">2% Pauschsteuer</div>
                <div className="text-xs mt-1 opacity-80">AG zahlt pauschal</div>
              </button>
              <button
                onClick={() => setSteuermodell('lohnsteuer')}
                className={`p-4 rounded-xl text-center transition-all ${
                  steuermodell === 'lohnsteuer'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-2xl">📋</span>
                <div className="font-bold mt-1">Lohnsteuer</div>
                <div className="text-xs mt-1 opacity-80">Nach Steuerklasse</div>
              </button>
            </div>
          </div>
        )}

        {/* Rentenversicherungspflicht */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Rentenversicherung</span>
          </label>
          <button
            onClick={() => setRentenversicherungspflicht(!rentenversicherungspflicht)}
            className={`w-full py-4 px-6 rounded-xl font-medium transition-all flex items-center justify-between ${
              rentenversicherungspflicht
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>
              {rentenversicherungspflicht 
                ? '✓ Rentenversicherungspflichtig (Standard)' 
                : '✗ Befreit (auf Antrag)'}
            </span>
            <span className={`text-sm ${rentenversicherungspflicht ? 'bg-white/20' : 'bg-gray-200'} px-2 py-1 rounded`}>
              {rentenversicherungspflicht 
                ? `−${formatEuro(ergebnis.anRentenversicherung)}/Monat` 
                : 'Voller Brutto'}
            </span>
          </button>
          <p className="text-xs text-gray-500 mt-2">
            {rentenversicherungspflicht 
              ? `Du baust ca. ${ergebnis.rentenPunkteJahr.toFixed(3)} Rentenpunkte pro Jahr auf (≈ ${formatEuro(ergebnis.rentenProMonat)}/Monat Rente)`
              : 'Keine eigenen Rentenpunkte – AG zahlt trotzdem 15% Pauschale an RV'}
          </p>
        </div>

        {/* Wochenstunden */}
        <div>
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Arbeitsstunden pro Woche</span>
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setStundenWoche(Math.max(1, stundenWoche - 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold"
            >
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-3xl font-bold text-gray-800">{stundenWoche}</span>
              <span className="text-gray-500 ml-2">Std/Woche</span>
            </div>
            <button
              onClick={() => setStundenWoche(Math.min(20, stundenWoche + 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold"
            >
              +
            </button>
          </div>
          <p className={`text-sm mt-2 text-center ${ergebnis.istUeberMindestlohn ? 'text-green-600' : 'text-red-600'}`}>
            Stundenlohn: {formatEuro(ergebnis.stundenlohn)} 
            {ergebnis.istUeberMindestlohn 
              ? ` ✓ Über Mindestlohn (${MINIJOB.mindestlohn} €)` 
              : ` ⚠️ Unter Mindestlohn!`}
          </p>
        </div>
      </div>

      {/* Warnung bei Überschreitung */}
      {ergebnis.ueberschreitetGrenze && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-bold text-red-800">Minijob-Grenze überschritten!</h4>
              <p className="text-sm text-red-700 mt-1">
                Mit {formatEuro(bruttolohn)} monatlich überschreitest du die 603€-Grenze. 
                Dies ist dann ein <strong>Midijob</strong> (603,01€ – 2.000€) mit anderen Abgaben.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Result Section - Arbeitnehmer */}
      <div className={`rounded-2xl shadow-lg p-6 text-white mb-6 ${
        ergebnis.ueberschreitetGrenze 
          ? 'bg-gradient-to-br from-orange-500 to-red-500'
          : 'bg-gradient-to-br from-green-500 to-emerald-600'
      }`}>
        <h3 className="text-sm font-medium opacity-80 mb-1">👤 Dein Netto-Verdienst</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.nettolohn)}</span>
            <span className="text-xl opacity-80">/ Monat</span>
          </div>
          {!rentenversicherungspflicht && (
            <span className="inline-block mt-2 bg-white/20 px-2 py-1 rounded text-sm">
              💰 Brutto = Netto (RV-befreit)
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Pro Jahr</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.nettolohn * 12)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Pro Stunde</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.stundenlohn)}</div>
          </div>
        </div>

        {rentenversicherungspflicht && (
          <div className="mt-4 pt-4 border-t border-white/20 text-sm">
            <div className="flex justify-between">
              <span className="opacity-80">Dein RV-Beitrag (3,6%)</span>
              <span>−{formatEuro(ergebnis.anRentenversicherung)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Result Section - Arbeitgeber */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🏢 Arbeitgeber-Kosten</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Bruttolohn</span>
            <span className="font-bold text-gray-900">{formatEuro(bruttolohn)}</span>
          </div>
          
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-2">Pauschale Abgaben</div>
          
          <div className="flex justify-between py-2 border-b border-gray-100 text-orange-600">
            <span>+ Krankenversicherung ({istPrivathaushalt ? '5%' : '13%'})</span>
            <span>{formatEuro(ergebnis.agKrankenversicherung)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-orange-600">
            <span>+ Rentenversicherung ({istPrivathaushalt ? '5%' : '15%'})</span>
            <span>{formatEuro(ergebnis.agRentenversicherung)}</span>
          </div>
          {ergebnis.agPauschsteuer > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-orange-600">
              <span>+ Pauschsteuer (2%)</span>
              <span>{formatEuro(ergebnis.agPauschsteuer)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b border-gray-100 text-orange-600">
            <span>+ Unfallversicherung (~1,6%)</span>
            <span>{formatEuro(ergebnis.agUnfallversicherung)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-orange-600">
            <span>+ Umlagen (U1, U2, Insolvenz)</span>
            <span>{formatEuro(ergebnis.agUmlagen)}</span>
          </div>
          
          <div className="flex justify-between py-2 bg-orange-50 -mx-6 px-6">
            <span className="font-medium text-orange-700">= Gesamte AG-Abgaben</span>
            <span className="font-bold text-orange-800">
              {formatEuro(ergebnis.agGesamtAbgaben)} ({formatProzent(ergebnis.agAbgabenProzent)})
            </span>
          </div>
          
          <div className="flex justify-between py-3 bg-gray-100 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-gray-800">Gesamtkosten AG</span>
            <span className="font-bold text-xl text-gray-900">{formatEuro(ergebnis.agGesamtkosten)}</span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert der Minijob</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>603€-Grenze 2026:</strong> Bis zu 603€ monatlich (7.236€ im Jahr) ohne volle Sozialabgaben</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Für Arbeitnehmer:</strong> Keine Sozialabgaben (außer opt. 3,6% RV)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Für Arbeitgeber:</strong> Pauschale Abgaben ca. 28-31% des Bruttolohns</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Krankenversicherung:</strong> Minijobber bleiben familien- oder anderweitig versichert</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Mehrere Minijobs:</strong> Werden zusammengerechnet – max. 603€ gesamt!</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Neben Hauptjob:</strong> Ein Minijob zusätzlich zur Hauptbeschäftigung möglich</span>
          </li>
        </ul>
      </div>

      {/* Rentenversicherung Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-blue-800 mb-3">🏦 Rentenversicherung im Minijob</h3>
        <div className="space-y-3 text-sm text-blue-700">
          <p>
            Seit 2013 sind Minijobber <strong>automatisch rentenversicherungspflichtig</strong>. 
            Du zahlst 3,6% deines Bruttolohns (Eigenanteil), der AG zahlt 15%.
          </p>
          <div className="bg-white/50 rounded-xl p-4">
            <h4 className="font-semibold mb-2">Vorteile der RV-Pflicht:</h4>
            <ul className="space-y-1">
              <li>✓ Volle Rentenanwartschaft (Wartezeit für Altersrente)</li>
              <li>✓ Anspruch auf Erwerbsminderungsrente</li>
              <li>✓ Anspruch auf Reha-Leistungen</li>
              <li>✓ Anrechnung von Kindererziehungszeiten</li>
            </ul>
          </div>
          <p>
            <strong>Befreiung möglich:</strong> Mit einem schriftlichen Antrag an den Arbeitgeber 
            kannst du dich befreien lassen – dann erhältst du den vollen Bruttolohn.
          </p>
          <div className="bg-green-100 border border-green-300 rounded-xl p-3 mt-3">
            <p className="text-green-800">
              <strong>Neu ab Juli 2026:</strong> Wer sich bereits von der RV-Pflicht befreit hat, 
              kann erstmals wieder zurück in den vollen Rund-um-Schutz wechseln!
            </p>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise 2026</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Mindestlohn 2026:</strong> 13,90€/Stunde (erhöht von 12,82€ in 2025)</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Verdienstgrenze gekoppelt:</strong> Bei Mindestlohn-Erhöhung steigt auch die Grenze → jetzt 603€ statt 556€</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Kurzfristige Beschäftigung:</strong> Alternativ max. 3 Monate oder 70 Arbeitstage/Jahr ohne Verdienstgrenze</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Meldung bei Minijob-Zentrale:</strong> AG muss Minijob bei der Minijob-Zentrale anmelden</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Umlage U1 gesenkt:</strong> Ab 2026 nur noch 0,8% statt 1,1% – Arbeitgeber profitieren</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="font-semibold text-blue-900">Minijob-Zentrale</p>
            <p className="text-sm text-blue-700 mt-1">Deutsche Rentenversicherung Knappschaft-Bahn-See</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Website</p>
                <a 
                  href="https://www.minijob-zentrale.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  minijob-zentrale.de →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Service-Telefon</p>
                <a href="tel:03555898033" className="text-blue-600 hover:underline font-mono">0355 2902-70799</a>
                <p className="text-xs text-gray-500">Mo-Fr 7-17 Uhr</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-medium text-gray-800">Für Arbeitgeber</p>
              <p className="text-gray-600">An- und Abmeldung, Beitragsberechnung, Haushaltsscheck-Verfahren</p>
            </div>
          </div>
        </div>
      </div>

            <RechnerFeedback rechnerName="Minijob-Rechner 2026" rechnerSlug="minijob-rechner" />

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.minijob-zentrale.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Minijob-Zentrale – Offizielle Informationen
          </a>
          <a 
            href="https://magazin.minijob-zentrale.de/minijob-beitraege-2026/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Minijob-Zentrale – Beiträge & Abgaben 2026
          </a>
          <a 
            href="https://www.bmas.de/DE/Service/Presse/Pressemitteilungen/2025/mindestlohn-steigt-zum-ersten-januar-2026.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMAS – Mindestlohn 13,90€ ab 2026
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/sgb_4/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Sozialgesetzbuch IV – Geringfügige Beschäftigung
          </a>
        </div>
      </div>
    </div>
  );
}
