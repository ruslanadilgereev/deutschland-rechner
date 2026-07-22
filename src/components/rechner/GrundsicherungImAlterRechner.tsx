import { useState, useMemo } from 'react';

// === OFFIZIELLE WERTE 2026 (Grundsicherung im Alter und bei Erwerbsminderung, SGB XII) ===
// Alle Konstanten sind auf amtliche Primaerquellen belegt (siehe Quellen-Kommentare + Quellen-Sektion).

// Regelbedarfsstufen 2026 in Euro/Monat (Besitzschutz: 2025-Werte gelten fort, RBSFV 2026 §28a Abs.5 SGB XII)
// RBS 1 (Alleinstehende): 563 € — BMAS-Infoblatt Fortschreibung Regelbedarfe ab 2026 (563,00 € Besitzschutz)
//   https://www.bmas.de/SharedDocs/Downloads/DE/Publikationen/a-206k-infoblatt-fortschreibung-der-regelbedarfe-ab-2026.pdf
const REGELBEDARF_STUFE_1 = 563; // § Anlage zu §28 SGB XII / BMAS-Infoblatt 2026
// RBS 2 (Ehe-/Lebenspartner im gemeinsamen Haushalt): 506 € — Anlage zu §28 SGB XII
//   https://www.gesetze-im-internet.de/sgb_12/anlage.html
const REGELBEDARF_STUFE_2 = 506; // Anlage zu §28 SGB XII, Regelbedarfsstufe 2

// Mehrbedarf Merkzeichen G / volle dauerhafte Erwerbsminderung: 17 % der maßgebenden Regelbedarfsstufe
//   §30 Abs.1 SGB XII — https://www.gesetze-im-internet.de/sgb_12/__30.html
const MEHRBEDARF_G_SATZ = 0.17; // §30 Abs.1 SGB XII

// Mehrbedarf dezentrale Warmwassererzeugung: 2,3 % der Regelbedarfsstufe (RBS 1-2)
//   §30 Abs.7 SGB XII — https://www.gesetze-im-internet.de/sgb_12/__30.html
const MEHRBEDARF_WARMWASSER_SATZ = 0.023; // §30 Abs.7 SGB XII

// Einkommensfreibetrag Erwerbseinkommen: 30 % des Erwerbseinkommens, max. 50 % der RBS 1
//   §82 Abs.3 SGB XII — https://www.gesetze-im-internet.de/sgb_12/__82.html
const FREIBETRAG_ERWERB_SATZ = 0.30; // §82 Abs.3 SGB XII

// Freibetrag zusaetzliche/private Altersvorsorge: 100 € + 30 % des uebersteigenden Betrags, max. 50 % der RBS 1
//   §82 Abs.4 SGB XII — https://www.gesetze-im-internet.de/sgb_12/__82.html
const FREIBETRAG_VORSORGE_SOCKEL = 100; // §82 Abs.4 SGB XII
const FREIBETRAG_VORSORGE_SATZ = 0.30; // §82 Abs.4 SGB XII

// Gemeinsame Obergrenze beider Freibetraege: 50 % der Regelbedarfsstufe 1
//   §82 Abs.3/4 SGB XII
const FREIBETRAG_MAX = REGELBEDARF_STUFE_1 * 0.5; // 281,50 €

export default function GrundsicherungImAlterRechner() {
  // Wohnsituation → Regelbedarfsstufe
  const [alleinstehend, setAlleinstehend] = useState(true);

  // Anspruch dem Grunde nach (§41 SGB XII: Altersgrenze 67 ab Jg. 1964 ODER volle Erwerbsminderung)
  const [anspruchGrund, setAnspruchGrund] = useState(true);

  // Kosten der Unterkunft und Heizung (angemessene tatsaechliche Kosten – Nutzereingabe, §42 Nr.4 / §42a SGB XII)
  const [miete, setMiete] = useState(450); // Kaltmiete + kalte Nebenkosten
  const [heizkosten, setHeizkosten] = useState(70);

  // Mehrbedarfe
  const [merkzeichenG, setMerkzeichenG] = useState(false);
  const [warmwasserDezentral, setWarmwasserDezentral] = useState(false);
  const [ernaehrungMehrbedarf, setErnaehrungMehrbedarf] = useState(0); // individuell – Naeherung

  // Einkommen
  const [gesetzlicheRente, setGesetzlicheRente] = useState(700); // Zahlbetrag/Monat
  const [erwerbseinkommen, setErwerbseinkommen] = useState(0);
  const [privateVorsorge, setPrivateVorsorge] = useState(0); // Riester/Betriebsrente etc.

  const ergebnis = useMemo(() => {
    // === 1. Regelbedarf nach Regelbedarfsstufe ===
    const regelbedarf = alleinstehend ? REGELBEDARF_STUFE_1 : REGELBEDARF_STUFE_2;

    // === 2. Mehrbedarfe (§30 SGB XII) ===
    const mehrbedarfG = merkzeichenG ? regelbedarf * MEHRBEDARF_G_SATZ : 0;
    const mehrbedarfWarmwasser = warmwasserDezentral ? regelbedarf * MEHRBEDARF_WARMWASSER_SATZ : 0;
    const mehrbedarfErnaehrung = Math.max(0, ernaehrungMehrbedarf); // Naeherung, individuell
    const mehrbedarfeGesamt = mehrbedarfG + mehrbedarfWarmwasser + mehrbedarfErnaehrung;

    // === 3. Bedarfe fuer Unterkunft und Heizung (angemessene tatsaechliche Kosten) ===
    const kdu = Math.max(0, miete) + Math.max(0, heizkosten);

    // === 4. Gesamtbedarf ===
    const gesamtbedarf = regelbedarf + mehrbedarfeGesamt + kdu;

    // === 5. Anrechenbares Einkommen (§82 SGB XII) ===
    // 5a. Erwerbseinkommen: 30 % absetzbar, max. 50 % der RBS 1
    const freibetragErwerb = Math.min(erwerbseinkommen * FREIBETRAG_ERWERB_SATZ, FREIBETRAG_MAX);
    const anrechenbarErwerb = Math.max(0, erwerbseinkommen - freibetragErwerb);

    // 5b. Zusaetzliche Altersvorsorge: 100 € + 30 % des uebersteigenden Betrags, max. 50 % der RBS 1
    const freibetragVorsorge = privateVorsorge > 0
      ? Math.min(FREIBETRAG_VORSORGE_SOCKEL + Math.max(0, privateVorsorge - FREIBETRAG_VORSORGE_SOCKEL) * FREIBETRAG_VORSORGE_SATZ, FREIBETRAG_MAX)
      : 0;
    const anrechenbarVorsorge = Math.max(0, privateVorsorge - freibetragVorsorge);

    // 5c. Gesetzliche Rente: voll anrechenbar (kein Freibetrag nach §82 Abs.3/4).
    //     Ein zusaetzlicher Grundrentenfreibetrag (§82a SGB XII) bei >=33 Jahren Grundrentenzeiten
    //     ist hier NICHT beruecksichtigt – siehe Hinweis unten.
    const anrechenbareRente = Math.max(0, gesetzlicheRente);

    const anrechenbaresEinkommen = anrechenbareRente + anrechenbarErwerb + anrechenbarVorsorge;

    // === 6. Grundsicherungsanspruch ===
    const anspruch = Math.max(0, gesamtbedarf - anrechenbaresEinkommen);

    return {
      regelbedarf,
      mehrbedarfG,
      mehrbedarfWarmwasser,
      mehrbedarfErnaehrung,
      mehrbedarfeGesamt,
      kdu,
      gesamtbedarf,
      freibetragErwerb,
      anrechenbarErwerb,
      freibetragVorsorge,
      anrechenbarVorsorge,
      anrechenbareRente,
      anrechenbaresEinkommen,
      anspruch,
    };
  }, [alleinstehend, miete, heizkosten, merkzeichenG, warmwasserDezentral,
      ernaehrungMehrbedarf, gesetzlicheRente, erwerbseinkommen, privateVorsorge]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Wohnsituation → Regelbedarfsstufe */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Wohnsituation</span>
            <span className="text-xs text-gray-500 block mt-1">
              Bestimmt die maßgebende Regelbedarfsstufe (§ 27a SGB XII)
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setAlleinstehend(true)}
              className={`py-3 px-4 rounded-xl font-medium transition-all text-sm ${
                alleinstehend ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Alleinstehend
              <span className="block text-xs font-normal opacity-80">Stufe 1 · {formatEuroRound(REGELBEDARF_STUFE_1)}</span>
            </button>
            <button
              onClick={() => setAlleinstehend(false)}
              className={`py-3 px-4 rounded-xl font-medium transition-all text-sm ${
                !alleinstehend ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Mit Partner im Haushalt
              <span className="block text-xs font-normal opacity-80">Stufe 2 · {formatEuroRound(REGELBEDARF_STUFE_2)}</span>
            </button>
          </div>
        </div>

        {/* Anspruch dem Grunde nach */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={anspruchGrund}
              onChange={(e) => setAnspruchGrund(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <div>
              <span className="text-gray-700 font-medium">Altersgrenze erreicht oder voll erwerbsgemindert</span>
              <span className="text-xs text-gray-500 block">
                Regelaltersgrenze (67 Jahre ab Jahrgang 1964) oder volle dauerhafte Erwerbsminderung (§ 41 SGB XII)
              </span>
            </div>
          </label>
          {!anspruchGrund && (
            <p className="text-xs text-amber-600 mt-2">
              ⚠️ Ohne diese Voraussetzung besteht kein Anspruch auf Grundsicherung im Alter/bei Erwerbsminderung –
              stattdessen ggf. <a href="/buergergeld-rechner" className="underline">Bürgergeld</a> nach SGB II.
            </p>
          )}
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Kosten der Unterkunft */}
        <h3 className="font-bold text-gray-800 mb-4">🏠 Unterkunft & Heizung</h3>
        <p className="text-xs text-gray-500 mb-4">
          Anerkannt werden die tatsächlichen Kosten, soweit sie angemessen sind (§ 42a SGB XII).
          Die Angemessenheitsgrenze legt Ihre Kommune fest – geben Sie Ihre realen Kosten ein.
        </p>

        <div className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Kaltmiete + kalte Nebenkosten</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={miete}
              onChange={(e) => setMiete(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="2000"
              step="10"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Heizkosten</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={heizkosten}
              onChange={(e) => setHeizkosten(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="1000"
              step="10"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Mehrbedarfe */}
        <h3 className="font-bold text-gray-800 mb-4">➕ Mehrbedarfe (§ 30 SGB XII)</h3>

        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={merkzeichenG}
              onChange={(e) => setMerkzeichenG(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <div>
              <span className="text-gray-700 font-medium">Merkzeichen G oder volle Erwerbsminderung</span>
              <span className="text-xs text-gray-500 block">
                Mehrbedarf 17 % der Regelbedarfsstufe (§ 30 Abs. 1 SGB XII)
              </span>
            </div>
          </label>
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={warmwasserDezentral}
              onChange={(e) => setWarmwasserDezentral(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <div>
              <span className="text-gray-700 font-medium">Dezentrale Warmwassererzeugung</span>
              <span className="text-xs text-gray-500 block">
                z. B. Durchlauferhitzer/Boiler – Mehrbedarf 2,3 % der Regelbedarfsstufe (§ 30 Abs. 7 SGB XII)
              </span>
            </div>
          </label>
        </div>

        <div className="mb-2">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Ernährungsbedingter Mehrbedarf</span>
            <span className="text-xs text-gray-500 block mt-1">
              Nur bei ärztlich bescheinigter kostenaufwändiger Ernährung (§ 30 Abs. 5 SGB XII) –
              individuelle Höhe, kein gesetzlicher Festbetrag. Näherung.
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={ernaehrungMehrbedarf}
              onChange={(e) => setErnaehrungMehrbedarf(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="500"
              step="10"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Einkommen */}
        <h3 className="font-bold text-gray-800 mb-4">💰 Anrechenbares Einkommen (§ 82 SGB XII)</h3>

        <div className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Gesetzliche Rente (Zahlbetrag)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Monatlicher Auszahlungsbetrag – wird grundsätzlich voll angerechnet
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={gesetzlicheRente}
              onChange={(e) => setGesetzlicheRente(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="3000"
              step="10"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Erwerbseinkommen</span>
            <span className="text-xs text-gray-500 block mt-1">
              z. B. Minijob – 30 % bleiben anrechnungsfrei (max. {formatEuro(FREIBETRAG_MAX)})
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={erwerbseinkommen}
              onChange={(e) => setErwerbseinkommen(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="3000"
              step="10"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
          </div>
        </div>

        <div className="mb-2">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Zusätzliche Altersvorsorge</span>
            <span className="text-xs text-gray-500 block mt-1">
              Riester-, Betriebs- oder private Rente – 100 € + 30 % bleiben frei (max. {formatEuro(FREIBETRAG_MAX)})
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={privateVorsorge}
              onChange={(e) => setPrivateVorsorge(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="2000"
              step="10"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🧓 Ihr geschätzter Grundsicherungsanspruch</h3>
        {anspruchGrund ? (
          <div className="mb-4">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-5xl font-bold">{formatEuroRound(ergebnis.anspruch)}</span>
              <span className="text-xl opacity-80">/ Monat</span>
            </div>
            <p className="text-orange-100 mt-2 text-sm">
              {ergebnis.anspruch > 0 ? (
                <>Gesamtbedarf {formatEuro(ergebnis.gesamtbedarf)} − anrechenbares Einkommen {formatEuro(ergebnis.anrechenbaresEinkommen)}</>
              ) : (
                <>Ihr anrechenbares Einkommen deckt den Bedarf – voraussichtlich kein Anspruch auf Grundsicherung.</>
              )}
            </p>
          </div>
        ) : (
          <div className="mb-4">
            <div className="text-3xl font-bold">Kein Anspruch dem Grunde nach</div>
            <p className="text-orange-100 mt-2 text-sm">
              Voraussetzung ist die Regelaltersgrenze oder volle dauerhafte Erwerbsminderung (§ 41 SGB XII).
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Gesamtbedarf</span>
            <div className="text-xl font-bold">{formatEuroRound(ergebnis.gesamtbedarf)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Anrechenbares Einkommen</span>
            <div className="text-xl font-bold">{formatEuroRound(ergebnis.anrechenbaresEinkommen)}</div>
          </div>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>

        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">Bedarf</div>

          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Regelbedarf ({alleinstehend ? 'Stufe 1' : 'Stufe 2'})</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.regelbedarf)}</span>
          </div>
          {ergebnis.mehrbedarfG > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">+ Mehrbedarf Merkzeichen G / EM (17 %)</span>
              <span className="text-gray-900">{formatEuro(ergebnis.mehrbedarfG)}</span>
            </div>
          )}
          {ergebnis.mehrbedarfWarmwasser > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">+ Mehrbedarf Warmwasser (2,3 %)</span>
              <span className="text-gray-900">{formatEuro(ergebnis.mehrbedarfWarmwasser)}</span>
            </div>
          )}
          {ergebnis.mehrbedarfErnaehrung > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">+ Mehrbedarf Ernährung (Näherung)</span>
              <span className="text-gray-900">{formatEuro(ergebnis.mehrbedarfErnaehrung)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">+ Unterkunft & Heizung</span>
            <span className="text-gray-900">{formatEuro(ergebnis.kdu)}</span>
          </div>
          <div className="flex justify-between py-2 bg-orange-50 -mx-6 px-6">
            <span className="font-medium text-orange-700">= Gesamtbedarf</span>
            <span className="font-bold text-orange-900">{formatEuro(ergebnis.gesamtbedarf)}</span>
          </div>

          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">Anrechenbares Einkommen (§ 82 SGB XII)</div>

          {gesetzlicheRente > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Gesetzliche Rente (voll anrechenbar)</span>
              <span className="text-gray-900">{formatEuro(ergebnis.anrechenbareRente)}</span>
            </div>
          )}
          {erwerbseinkommen > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">
                Erwerbseinkommen {formatEuro(erwerbseinkommen)} − Freibetrag {formatEuro(ergebnis.freibetragErwerb)}
              </span>
              <span className="text-gray-900">{formatEuro(ergebnis.anrechenbarErwerb)}</span>
            </div>
          )}
          {privateVorsorge > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">
                Altersvorsorge {formatEuro(privateVorsorge)} − Freibetrag {formatEuro(ergebnis.freibetragVorsorge)}
              </span>
              <span className="text-gray-900">{formatEuro(ergebnis.anrechenbarVorsorge)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600 font-medium">= Anrechenbares Einkommen</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.anrechenbaresEinkommen)}</span>
          </div>

          <div className="flex justify-between py-3 bg-orange-100 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-orange-800">Grundsicherungsanspruch</span>
            <span className="font-bold text-2xl text-orange-900">
              {anspruchGrund ? formatEuro(ergebnis.anspruch) : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Hinweis Grundrentenfreibetrag / Vermoegen */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Was dieser Rechner nicht abbildet</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Grundrentenfreibetrag (§ 82a SGB XII):</strong> Wer mindestens 33 Jahre
              Grundrentenzeiten hat, kann einen zusätzlichen Freibetrag auf die Rente geltend machen –
              hier nicht eingerechnet. Ihr Anspruch kann dadurch höher ausfallen.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Vermögen:</strong> Über dem Schonvermögen liegendes Vermögen ist vorrangig einzusetzen
              (§ 90 SGB XII). Der Rechner prüft kein Vermögen.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Kranken-/Pflegeversicherung:</strong> Angemessene Beiträge übernimmt das Sozialamt
              zusätzlich (§ 42 Nr. 2 SGB XII) – sie sind hier nicht als Auszahlung enthalten.
            </span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
        <p className="text-sm text-gray-600">
          <strong>Hinweis:</strong> Dieses Ergebnis ist eine unverbindliche <strong>Schätzung</strong> und
          ersetzt keine Rechts- oder Steuerberatung. Über Ihren tatsächlichen Anspruch entscheidet der
          zuständige Träger der Sozialhilfe (Sozialamt) auf Grundlage Ihrer individuellen Verhältnisse.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a href="https://www.gesetze-im-internet.de/sgb_12/__41.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 41 SGB XII – Leistungsberechtigte (Altersgrenze/Erwerbsminderung)
          </a>
          <a href="https://www.gesetze-im-internet.de/sgb_12/__42.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 42 SGB XII – Bedarfe
          </a>
          <a href="https://www.gesetze-im-internet.de/sgb_12/__42a.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 42a SGB XII – Bedarfe für Unterkunft und Heizung
          </a>
          <a href="https://www.gesetze-im-internet.de/sgb_12/__30.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 30 SGB XII – Mehrbedarfe
          </a>
          <a href="https://www.gesetze-im-internet.de/sgb_12/__82.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 82 SGB XII – Einkommensanrechnung & Freibeträge
          </a>
          <a href="https://www.gesetze-im-internet.de/sgb_12/anlage.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            Anlage zu § 28 SGB XII – Regelbedarfsstufen
          </a>
          <a href="https://www.bmas.de/SharedDocs/Downloads/DE/Publikationen/a-206k-infoblatt-fortschreibung-der-regelbedarfe-ab-2026.pdf?__blob=publicationFile&v=2" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            BMAS – Infoblatt Fortschreibung der Regelbedarfe ab 2026 (Regelbedarfsstufe 1 = 563 €)
          </a>
        </div>
      </div>
    </div>
  );
}
