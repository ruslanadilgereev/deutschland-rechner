import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: Juli 2026) ===

// Max. Anspruchstage je Beschäftigtem: bis zu 10 Arbeitstage je Kalenderjahr
// Quelle: § 44a Abs. 3 Satz 1 SGB XI – https://www.gesetze-im-internet.de/sgb_11/__44a.html
const MAX_TAGE_JE_KALENDERJAHR = 10;

// Regelsatz: 90 % des ausgefallenen Nettoarbeitsentgelts aus beitragspflichtigem Arbeitsentgelt
// Quelle: § 45 Abs. 2 Satz 3 SGB V i.V.m. § 44a Abs. 3 Satz 4 SGB XI – https://www.gesetze-im-internet.de/sgb_5/__45.html
const SATZ_REGEL = 0.90;

// 100 % bei beitragspflichtiger Einmalzahlung (§ 23a SGB IV) in den vorangegangenen 12 Kalendermonaten
// Quelle: § 45 Abs. 2 Satz 3 SGB V – https://www.gesetze-im-internet.de/sgb_5/__45.html
const SATZ_EINMALZAHLUNG = 1.00;

// Selbständige (Berechnung aus Arbeitseinkommen): 70 % des regelmäßigen beitragspflichtigen Arbeitseinkommens
// Quelle: § 45 Abs. 2 Satz 4 SGB V – https://www.gesetze-im-internet.de/sgb_5/__45.html
const SATZ_ARBEITSEINKOMMEN = 0.70;

// Jahresarbeitsentgeltgrenze nach § 6 Abs. 7 SGB V für 2026
// Quelle: SV-Rechengrößen-Verordnung 2026 – https://www.gesetze-im-internet.de/svbezgrv_2026/BJNR1160A0025.html
const JAEG_2026 = 69750; // Euro/Jahr

// Deckelung: 70 % der kalendertäglichen Beitragsbemessungsgrenze (1/360 der JAEG)
// Quellen: § 45 Abs. 2 Satz 3 SGB V + § 223 Abs. 3 SGB V – https://www.gesetze-im-internet.de/sgb_5/__223.html
const DECKEL_FAKTOR = 0.70;
const TAGES_HOECHSTBETRAG_2026 = DECKEL_FAKTOR * (JAEG_2026 / 360); // = 135,625 € je Arbeitstag (Anzeige gerundet 135,63 €)

export default function PflegeunterstuetzungsgeldRechner() {
  // Eingaben
  const [istSelbstaendig, setIstSelbstaendig] = useState(false);
  const [monatsnetto, setMonatsnetto] = useState(2400);
  const [arbeitseinkommen, setArbeitseinkommen] = useState(3000);
  const [arbeitstageProMonat, setArbeitstageProMonat] = useState(21);
  const [einmalzahlung, setEinmalzahlung] = useState(false);
  const [tage, setTage] = useState(5);
  const [bereitsBezogen, setBereitsBezogen] = useState(0);

  const ergebnis = useMemo(() => {
    // === 1. Verfügbare Tage im Kalenderjahr (§ 44a Abs. 3 S. 1 SGB XI) ===
    const verfuegbareTage = Math.max(0, MAX_TAGE_JE_KALENDERJAHR - bereitsBezogen);
    const effektiveTage = Math.min(tage, verfuegbareTage);
    const tageGekappt = tage > verfuegbareTage;

    // === 2. Ausgefallenes Entgelt je Arbeitstag (Näherung: Monatswert / Arbeitstage) ===
    // Hinweis: Die exakte Umrechnung regeln GKV-Verfahrensvereinbarungen – hier vereinfachte Näherung.
    const basisProTag = (istSelbstaendig ? arbeitseinkommen : monatsnetto) / Math.max(1, arbeitstageProMonat);

    // === 3. Satz bestimmen (§ 45 Abs. 2 S. 3 u. 4 SGB V) ===
    const satz = istSelbstaendig
      ? SATZ_ARBEITSEINKOMMEN
      : (einmalzahlung ? SATZ_EINMALZAHLUNG : SATZ_REGEL);

    // === 4. Tagesbetrag vor und nach Deckelung ===
    const tagesbetragVorDeckel = basisProTag * satz;
    const tagesbetrag = Math.min(tagesbetragVorDeckel, TAGES_HOECHSTBETRAG_2026);
    const deckelGreift = tagesbetragVorDeckel > TAGES_HOECHSTBETRAG_2026;

    // === 5. Gesamtbetrag & Resttage ===
    const gesamt = tagesbetrag * effektiveTage;
    const resttageNachher = verfuegbareTage - effektiveTage;

    return {
      verfuegbareTage,
      effektiveTage,
      tageGekappt,
      basisProTag,
      satz,
      satzProzent: satz * 100,
      tagesbetragVorDeckel,
      tagesbetrag,
      deckelGreift,
      gesamt,
      resttageNachher,
      hoechstbetrag: TAGES_HOECHSTBETRAG_2026,
    };
  }, [istSelbstaendig, monatsnetto, arbeitseinkommen, arbeitstageProMonat, einmalzahlung, tage, bereitsBezogen]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  return (
    <div className="max-w-2xl mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Beschäftigt oder selbständig */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Wie sind Sie tätig?</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIstSelbstaendig(false)}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                !istSelbstaendig
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Angestellt
            </button>
            <button
              onClick={() => setIstSelbstaendig(true)}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                istSelbstaendig
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Selbständig (GKV)
            </button>
          </div>
          {istSelbstaendig && (
            <p className="text-xs text-gray-500 mt-2">
              Bei Berechnung aus Arbeitseinkommen gelten 70 % des regelmäßigen beitragspflichtigen
              Arbeitseinkommens (§ 45 Abs. 2 Satz 4 SGB V).
            </p>
          )}
        </div>

        {/* Einkommen */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">
              {istSelbstaendig ? 'Beitragspflichtiges Arbeitseinkommen (Monat)' : 'Ausgefallenes Nettoarbeitsentgelt (Monat)'}
            </span>
            <span className="text-xs text-gray-500 block mt-1">
              {istSelbstaendig
                ? 'Ihr regelmäßiges Arbeitseinkommen, soweit es der Beitragsberechnung unterliegt'
                : 'Ihr monatliches Netto aus beitragspflichtigem Arbeitsentgelt'}
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={istSelbstaendig ? arbeitseinkommen : monatsnetto}
              onChange={(e) => {
                const v = Math.max(0, Number(e.target.value));
                if (istSelbstaendig) { setArbeitseinkommen(v); } else { setMonatsnetto(v); }
              }}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none"
              min="0"
              max="15000"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€/Monat</span>
          </div>
          <input
            type="range"
            value={istSelbstaendig ? arbeitseinkommen : monatsnetto}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (istSelbstaendig) { setArbeitseinkommen(v); } else { setMonatsnetto(v); }
            }}
            className="w-full mt-3 accent-teal-500"
            min="500"
            max="6000"
            step="50"
          />
        </div>

        {/* Arbeitstage pro Monat */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Arbeitstage pro Monat</span>
            <span className="text-xs text-gray-500 block mt-1">
              Zur Umrechnung des Monatswerts auf einen Arbeitstag (vereinfachte Näherung)
            </span>
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setArbeitstageProMonat(Math.max(1, arbeitstageProMonat - 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
            >
              −
            </button>
            <div className="text-center">
              <span className="text-3xl font-bold text-gray-800">{arbeitstageProMonat}</span>
              <span className="text-gray-500 ml-1">Tage</span>
            </div>
            <button
              onClick={() => setArbeitstageProMonat(Math.min(27, arbeitstageProMonat + 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Einmalzahlung (nur Angestellte) */}
        {!istSelbstaendig && (
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={einmalzahlung}
                onChange={(e) => setEinmalzahlung(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
              />
              <div>
                <span className="text-gray-700 font-medium">Beitragspflichtige Einmalzahlung in den letzten 12 Monaten</span>
                <span className="text-xs text-gray-500 block">
                  Z. B. Weihnachts- oder Urlaubsgeld (§ 23a SGB IV) → 100 % statt 90 % vom Netto
                </span>
              </div>
            </label>
          </div>
        )}

        <hr className="my-6 border-gray-200" />

        {/* Freistellungstage */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Anzahl der Freistellungstage</span>
            <span className="text-xs text-gray-500 block mt-1">
              Maximal {MAX_TAGE_JE_KALENDERJAHR} Arbeitstage je Kalenderjahr (§ 44a Abs. 3 SGB XI)
            </span>
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setTage(Math.max(1, tage - 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
            >
              −
            </button>
            <div className="text-center">
              <span className="text-3xl font-bold text-gray-800">{tage}</span>
              <span className="text-gray-500 ml-1">{tage === 1 ? 'Tag' : 'Tage'}</span>
            </div>
            <button
              onClick={() => setTage(Math.min(MAX_TAGE_JE_KALENDERJAHR, tage + 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Bereits bezogene Tage */}
        <div className="mb-2">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Bereits bezogene Tage in diesem Kalenderjahr</span>
            <span className="text-xs text-gray-500 block mt-1">
              Für die Berechnung Ihres Restanspruchs
            </span>
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setBereitsBezogen(Math.max(0, bereitsBezogen - 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
            >
              −
            </button>
            <div className="text-center">
              <span className="text-3xl font-bold text-gray-800">{bereitsBezogen}</span>
              <span className="text-gray-500 ml-1">{bereitsBezogen === 1 ? 'Tag' : 'Tage'}</span>
            </div>
            <button
              onClick={() => setBereitsBezogen(Math.min(MAX_TAGE_JE_KALENDERJAHR, bereitsBezogen + 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🫂 Ihr Pflegeunterstützungsgeld (brutto)</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroRound(ergebnis.gesamt)}</span>
            <span className="text-xl opacity-80">für {ergebnis.effektiveTage} {ergebnis.effektiveTage === 1 ? 'Tag' : 'Tage'}</span>
          </div>
          <p className="text-teal-100 mt-2 text-sm">
            {ergebnis.satzProzent.toLocaleString('de-DE')} % {istSelbstaendig ? 'des Arbeitseinkommens' : 'des ausgefallenen Nettoarbeitsentgelts'} je Arbeitstag
            {ergebnis.deckelGreift && ', gedeckelt auf den Höchstbetrag'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Je Arbeitstag</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.tagesbetrag)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Resttage im Kalenderjahr</span>
            <div className="text-xl font-bold">{ergebnis.resttageNachher} von {MAX_TAGE_JE_KALENDERJAHR}</div>
          </div>
        </div>

        {ergebnis.deckelGreift && (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm mb-3">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-80">Deckelung greift: Höchstbetrag 2026 (70 % der BBG)</span>
              <span className="text-lg font-bold">{formatEuro(ergebnis.hoechstbetrag)}</span>
            </div>
          </div>
        )}

        {ergebnis.tageGekappt && (
          <div className="bg-amber-400/20 border border-amber-200/40 rounded-xl p-4">
            <p className="text-sm">
              ⚠️ Sie haben nur noch <strong>{ergebnis.verfuegbareTage} {ergebnis.verfuegbareTage === 1 ? 'Tag' : 'Tage'}</strong> Restanspruch
              in diesem Kalenderjahr – die Berechnung wurde entsprechend gekappt.
            </p>
          </div>
        )}
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              {istSelbstaendig ? 'Arbeitseinkommen' : 'Nettoarbeitsentgelt'} je Arbeitstag
              ({formatEuro(istSelbstaendig ? arbeitseinkommen : monatsnetto)} ÷ {arbeitstageProMonat} Tage)
            </span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.basisProTag)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              Satz: {ergebnis.satzProzent.toLocaleString('de-DE')} %
              {istSelbstaendig
                ? ' (Arbeitseinkommen, § 45 Abs. 2 S. 4 SGB V)'
                : einmalzahlung
                  ? ' (mit Einmalzahlung, § 45 Abs. 2 S. 3 SGB V)'
                  : ' (Regelfall, § 45 Abs. 2 S. 3 SGB V)'}
            </span>
            <span className="font-bold text-teal-600">{formatEuro(ergebnis.tagesbetragVorDeckel)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              Höchstbetrag 2026: 70 % × (69.750 € ÷ 360)
            </span>
            <span className={ergebnis.deckelGreift ? 'font-bold text-red-600' : 'text-gray-500'}>
              {formatEuro(ergebnis.hoechstbetrag)}
            </span>
          </div>
          <div className="flex justify-between py-2 bg-teal-50 -mx-6 px-6">
            <span className="font-medium text-teal-700">= Pflegeunterstützungsgeld je Arbeitstag</span>
            <span className="font-bold text-teal-900">{formatEuro(ergebnis.tagesbetrag)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">× {ergebnis.effektiveTage} Freistellungstage</span>
            <span className="text-gray-900">{ergebnis.effektiveTage}</span>
          </div>
          <div className="flex justify-between py-3 bg-teal-100 -mx-6 px-6 rounded-b-xl mt-2">
            <span className="font-bold text-teal-800">Gesamtbetrag (brutto)</span>
            <span className="font-bold text-2xl text-teal-900">{formatEuro(ergebnis.gesamt)}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Näherung: Die Umrechnung des Monatswerts auf den Arbeitstag (÷ Arbeitstage) ist vereinfacht –
          die exakte Ermittlung des ausgefallenen Nettoarbeitsentgelts regeln die Verfahrensvereinbarungen
          der Pflegekassen. Vom Brutto-Betrag können zudem noch Arbeitnehmeranteile zur Renten-,
          Arbeitslosen- und ggf. Pflegeversicherung abgehen.
        </p>
      </div>

      {/* So funktioniert der Anspruch */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert das Pflegeunterstützungsgeld</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Bis zu 10 Arbeitstage je Kalenderjahr</strong> bei akut aufgetretener Pflegesituation eines nahen Angehörigen (§ 44a Abs. 3 SGB XI, § 2 PflegeZG)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>90 % des ausgefallenen Nettoarbeitsentgelts</strong> – 100 % bei beitragspflichtiger Einmalzahlung in den letzten 12 Monaten (§ 45 Abs. 2 S. 3 SGB V)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Höchstbetrag 2026: 135,63 € je Arbeitstag</strong> (70 % von 69.750 € ÷ 360, § 223 Abs. 3 SGB V)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Antrag unverzüglich</strong> bei der Pflegekasse (bzw. dem privaten Versicherer) des pflegebedürftigen Angehörigen – mit ärztlicher Bescheinigung</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Mehrere Pflegende:</strong> Für denselben Pflegebedürftigen sind es insgesamt max. 10 Arbeitstage je Kalenderjahr (§ 44a Abs. 3 S. 2 SGB XI)</span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Kein Anspruch bei Entgeltfortzahlung:</strong> Zahlt der Arbeitgeber für die Freistellungstage weiter (z. B. nach § 616 BGB oder Tarifvertrag), gibt es kein Pflegeunterstützungsgeld (§ 44a Abs. 3 S. 1 SGB XI)</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Auch kein Anspruch,</strong> soweit Kinderkrankengeld oder Verletztengeld für dieselben Tage beansprucht werden kann</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Brutto-Wert:</strong> Der Rechner zeigt das Pflegeunterstützungsgeld vor Abzug von Arbeitnehmeranteilen zur Renten-, Arbeitslosen- und ggf. Pflegeversicherung</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Abgrenzung:</strong> Für längere Pflege gibt es die (unbezahlte) Pflegezeit bis 6 Monate (§ 3, 4 PflegeZG) und die Familienpflegezeit bis 24 Monate (§ 2 FPfZG)</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Stelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Stelle</h3>
        <div className="bg-teal-50 rounded-xl p-4 mb-4">
          <p className="font-semibold text-teal-900">Pflegekasse des pflegebedürftigen Angehörigen</p>
          <p className="text-sm text-teal-700 mt-1">
            Der Antrag ist unverzüglich bei der Pflegekasse (bei Privatversicherten: beim Versicherungsunternehmen)
            des <strong>Pflegebedürftigen</strong> zu stellen – nicht bei Ihrer eigenen Krankenkasse
            (§ 44a Abs. 3 S. 3 SGB XI).
          </p>
        </div>
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
          <span className="text-xl">📋</span>
          <div>
            <p className="font-medium text-gray-800">Benötigte Unterlagen</p>
            <ul className="text-gray-600 mt-1 space-y-1">
              <li>• Ärztliche Bescheinigung (oder Bescheinigung einer Pflegefachperson) über die akute Pflegesituation</li>
              <li>• Angaben zum Verdienstausfall (über den Arbeitgeber)</li>
              <li>• Versichertendaten des pflegebedürftigen Angehörigen</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-xs text-gray-500">
        <strong>Hinweis:</strong> Dieser Rechner liefert eine vereinfachte Schätzung des Brutto-Pflegeunterstützungsgelds
        und ersetzt keine Rechts- oder Sozialversicherungsberatung. Die verbindliche Berechnung – einschließlich der
        exakten Ermittlung des ausgefallenen Nettoarbeitsentgelts und der Beitragsabzüge – nimmt die zuständige
        Pflegekasse vor. Alle Angaben ohne Gewähr.
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/sgb_11/__44a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 44a SGB XI – Pflegeunterstützungsgeld (Abs. 3)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_5/__45.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 45 Abs. 2 SGB V – Höhe (90 %/100 %/70 %, Deckelung)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_5/__223.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 223 Abs. 3 SGB V – Kalendertägliche Beitragsbemessungsgrenze (1/360 der JAEG)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/svbezgrv_2026/BJNR1160A0025.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            SV-Rechengrößen-Verordnung 2026 – Jahresarbeitsentgeltgrenze 69.750 €
          </a>
          <a
            href="https://www.gesetze-im-internet.de/pflegezg/__2.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 2 PflegeZG – Kurzzeitige Arbeitsverhinderung (bis zu 10 Arbeitstage)
          </a>
        </div>
      </div>
    </div>
  );
}
