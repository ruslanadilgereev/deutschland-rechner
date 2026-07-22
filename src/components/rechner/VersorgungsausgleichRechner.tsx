import { useState, useMemo } from 'react';

// === OFFIZIELLE WERTE & RECHTSGRUNDLAGEN (Stand: Juli 2026) ===
// Alle Zahlenkonstanten sind auf amtliche Primärquellen zurückführbar.

// Halbteilung: Ausgleichswert = Hälfte des Werts des Ehezeitanteils
// Quelle: § 1 Abs. 1 u. 2 VersAusglG – https://www.gesetze-im-internet.de/versausglg/__1.html
const HALBTEILUNG_FAKTOR = 0.5;

// Bagatellregel: Bei einer Ehezeit von bis zu drei Jahren findet ein
// Versorgungsausgleich nur auf Antrag statt (3 Jahre = 36 Monate).
// Quelle: § 3 Abs. 3 VersAusglG – https://www.gesetze-im-internet.de/versausglg/__3.html
const BAGATELL_EHEZEIT_MONATE = 36;

// Aktueller Rentenwert ab 01.07.2026 = 42,52 € pro Entgeltpunkt (monatlich).
// Nur für die illustrative EUR-Umrechnung des in Entgeltpunkten ausgedrückten Ausgleichswerts.
// Quelle: § 1 RWBestV 2026 – https://www.gesetze-im-internet.de/rwbestv_2026/__1.html
const RENTENWERT_2026 = 42.52;

const MONATE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

export default function VersorgungsausgleichRechner() {
  // Eingaben: Ehezeit
  const [heiratMonat, setHeiratMonat] = useState(6); // Juni
  const [heiratJahr, setHeiratJahr] = useState(2005);
  const [antragMonat, setAntragMonat] = useState(4); // April
  const [antragJahr, setAntragJahr] = useState(2026);

  // Eingaben: in der Ehezeit erworbene Entgeltpunkte je Ehegatte
  const [epA, setEpA] = useState(18.0);
  const [epB, setEpB] = useState(6.0);

  const ergebnis = useMemo(() => {
    // === 1. Ehezeit bestimmen (§ 3 Abs. 1 VersAusglG) ===
    // Beginn = erster Tag des Monats der Eheschließung.
    // Ende   = letzter Tag des Monats VOR Zustellung des Scheidungsantrags.
    // Der Monat vor dem Antragsmonat ist der letzte volle Ehezeit-Monat.
    const beginnIndex = heiratJahr * 12 + (heiratMonat - 1); // 0-basiert
    const endeIndex = antragJahr * 12 + (antragMonat - 1) - 1; // Monat vor Zustellung

    // Anzahl voller Ehezeit-Monate (inklusive Beginn- und Endemonat)
    const ehezeitMonate = Math.max(0, endeIndex - beginnIndex + 1);
    const ehezeitJahre = ehezeitMonate / 12;

    // Datumsangaben für die Anzeige
    const endeMonatIndex = ((antragMonat - 2) % 12 + 12) % 12; // 0-basiert, Monat vor Antrag
    const endeJahrAnzeige = antragMonat === 1 ? antragJahr - 1 : antragJahr;

    // Bagatellhinweis (§ 3 Abs. 3): Ehezeit bis 3 Jahre => nur auf Antrag
    const bagatell = ehezeitMonate > 0 && ehezeitMonate <= BAGATELL_EHEZEIT_MONATE;
    const ehezeitUngueltig = ehezeitMonate <= 0;

    // === 2./3. Ausgleichswert je Anrecht (Halbteilung, § 1 VersAusglG) ===
    // Bewertung in Entgeltpunkten (unmittelbare Bewertung, § 5 Abs. 1, § 39, § 43).
    const ausgleichswertA = epA * HALBTEILUNG_FAKTOR; // was A an B abgibt
    const ausgleichswertB = epB * HALBTEILUNG_FAKTOR; // was B an A abgibt

    // === 5. Verrechnung bei beidseitiger gesetzlicher Rente (§ 10 Abs. 2) ===
    // Netto-Übertrag = 0,5 × (EP_A − EP_B), vom höheren zum niedrigeren Konto.
    const nettoUebertragEP = Math.abs(epA - epB) * HALBTEILUNG_FAKTOR;
    const richtungVonA = epA > epB; // true: A gibt an B ab
    const gleichstand = Math.abs(epA - epB) < 1e-9;

    // Ehezeit-EP je Person NACH Ausgleich (beide erhalten gleich viele Ehezeit-EP)
    const epNachAusgleich = (epA + epB) / 2;

    // === 6. Illustrative EUR-Umrechnung (heutiger Monatswert) ===
    // Wert = Ausgleichswert_EP × aktueller Rentenwert.
    // Nur illustrativ – der spätere Zahlbetrag hängt zusätzlich von Zugangs- und
    // Rentenartfaktor bei Rentenbeginn ab (nicht Teil der EP-Übertragung).
    const nettoUebertragEuro = nettoUebertragEP * RENTENWERT_2026;
    const ausgleichswertAEuro = ausgleichswertA * RENTENWERT_2026;
    const ausgleichswertBEuro = ausgleichswertB * RENTENWERT_2026;

    return {
      ehezeitMonate,
      ehezeitJahre,
      beginnMonatIndex: heiratMonat - 1,
      beginnJahr: heiratJahr,
      endeMonatIndex,
      endeJahrAnzeige,
      bagatell,
      ehezeitUngueltig,
      ausgleichswertA,
      ausgleichswertB,
      nettoUebertragEP,
      richtungVonA,
      gleichstand,
      epNachAusgleich,
      nettoUebertragEuro,
      ausgleichswertAEuro,
      ausgleichswertBEuro,
    };
  }, [heiratMonat, heiratJahr, antragMonat, antragJahr, epA, epB]);

  const formatEP = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

  const ehezeitText = () => {
    if (ergebnis.ehezeitUngueltig) return 'Ende der Ehezeit liegt vor dem Beginn';
    const jahre = Math.floor(ergebnis.ehezeitMonate / 12);
    const monate = ergebnis.ehezeitMonate % 12;
    const teile: string[] = [];
    if (jahre > 0) teile.push(`${jahre} Jahr${jahre === 1 ? '' : 'e'}`);
    if (monate > 0) teile.push(`${monate} Monat${monate === 1 ? '' : 'e'}`);
    return teile.length > 0 ? teile.join(' ') : '0 Monate';
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Eingabe: Ehezeit */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📅 Ehezeit</h3>
        <p className="text-xs text-gray-500 mb-4">
          Die Ehezeit beginnt am ersten Tag des Monats der Eheschließung und endet am letzten Tag
          des Monats vor Zustellung des Scheidungsantrags (§ 3 Abs. 1 VersAusglG).
        </p>

        {/* Eheschließung */}
        <div className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Monat der Eheschließung</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={heiratMonat}
              onChange={(e) => setHeiratMonat(Number(e.target.value))}
              className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-0 outline-none"
            >
              {MONATE.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <input
              type="number"
              value={heiratJahr}
              onChange={(e) => setHeiratJahr(Math.max(1950, Math.min(2026, Number(e.target.value))))}
              className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-0 outline-none"
              min="1950"
              max="2026"
              step="1"
            />
          </div>
        </div>

        {/* Zustellung Scheidungsantrag */}
        <div className="mb-2">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Monat der Zustellung des Scheidungsantrags</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={antragMonat}
              onChange={(e) => setAntragMonat(Number(e.target.value))}
              className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-0 outline-none"
            >
              {MONATE.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <input
              type="number"
              value={antragJahr}
              onChange={(e) => setAntragJahr(Math.max(1977, Math.min(2035, Number(e.target.value))))}
              className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-0 outline-none"
              min="1977"
              max="2035"
              step="1"
            />
          </div>
        </div>

        {!ergebnis.ehezeitUngueltig && (
          <div className="mt-4 p-3 bg-violet-50 rounded-xl text-sm text-violet-800">
            <strong>Ehezeit:</strong> {MONATE[ergebnis.beginnMonatIndex]} {ergebnis.beginnJahr} bis{' '}
            {MONATE[ergebnis.endeMonatIndex]} {ergebnis.endeJahrAnzeige} ={' '}
            <strong>{ehezeitText()}</strong>
          </div>
        )}
        {ergebnis.ehezeitUngueltig && (
          <div className="mt-4 p-3 bg-red-50 rounded-xl text-sm text-red-700">
            ⚠️ Das Ende der Ehezeit liegt vor dem Beginn. Bitte prüfen Sie die Datumsangaben.
          </div>
        )}
      </div>

      {/* Eingabe: Entgeltpunkte */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 In der Ehezeit erworbene Entgeltpunkte</h3>
        <p className="text-xs text-gray-500 mb-4">
          Maßgeblich sind nur die <strong>während der Ehezeit</strong> erworbenen Entgeltpunkte
          (unmittelbare Bewertung, § 5 Abs. 1, § 39, § 43 VersAusglG). Diese finden Sie in der
          Auskunft der Deutschen Rentenversicherung zum Versorgungsausgleich (Formular V0500 ff.).
        </p>

        {/* EP Person A */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Ehegatte A – Entgeltpunkte (Ehezeit)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={epA}
              onChange={(e) => setEpA(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-0 outline-none"
              min="0"
              max="60"
              step="0.5"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">EP</span>
          </div>
          <input
            type="range"
            value={epA}
            onChange={(e) => setEpA(Number(e.target.value))}
            className="w-full mt-3 accent-violet-500"
            min="0"
            max="40"
            step="0.5"
          />
        </div>

        {/* EP Person B */}
        <div className="mb-2">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Ehegatte B – Entgeltpunkte (Ehezeit)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={epB}
              onChange={(e) => setEpB(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-0 outline-none"
              min="0"
              max="60"
              step="0.5"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">EP</span>
          </div>
          <input
            type="range"
            value={epB}
            onChange={(e) => setEpB(Number(e.target.value))}
            className="w-full mt-3 accent-violet-500"
            min="0"
            max="40"
            step="0.5"
          />
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">⚖️ Netto-Übertrag nach Verrechnung</h3>
        {ergebnis.gleichstand ? (
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">0,0000</span>
              <span className="text-xl opacity-80">EP</span>
            </div>
            <p className="text-violet-100 mt-2 text-sm">
              Beide Ehegatten haben gleich viele Ehezeit-Entgeltpunkte – nach Verrechnung findet
              kein Übertrag statt (§ 10 Abs. 2 VersAusglG).
            </p>
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{formatEP(ergebnis.nettoUebertragEP)}</span>
              <span className="text-xl opacity-80">EP</span>
            </div>
            <p className="text-violet-100 mt-2 text-sm">
              Übertragung von <strong>Ehegatte {ergebnis.richtungVonA ? 'A' : 'B'}</strong> auf{' '}
              <strong>Ehegatte {ergebnis.richtungVonA ? 'B' : 'A'}</strong> auf das Rentenkonto bei
              der Deutschen Rentenversicherung (interne Teilung, § 10 VersAusglG).
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-2">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Ehezeit-EP je Person danach</span>
            <div className="text-xl font-bold">{formatEP(ergebnis.epNachAusgleich)} EP</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Monatswert (illustrativ)</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.nettoUebertragEuro)}</div>
          </div>
        </div>
        <p className="text-violet-100 text-xs mt-3">
          Monatswert = Netto-Übertrag {formatEP(ergebnis.nettoUebertragEP)} EP × aktueller Rentenwert
          42,52 € (ab 01.07.2026). Nur illustrativ – siehe Hinweis unten.
        </p>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🧮 Berechnungsdetails</h3>
        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Ausgleichswerte (Halbteilung, § 1 VersAusglG)
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Ausgleichswert Anrecht A = 0,5 × {formatEP(epA)} EP</span>
            <span className="font-bold text-gray-900">{formatEP(ergebnis.ausgleichswertA)} EP</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Ausgleichswert Anrecht B = 0,5 × {formatEP(epB)} EP</span>
            <span className="font-bold text-gray-900">{formatEP(ergebnis.ausgleichswertB)} EP</span>
          </div>

          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Verrechnung (§ 10 Abs. 2 VersAusglG)
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              0,5 × ({formatEP(epA)} − {formatEP(epB)}) EP
            </span>
            <span className="font-bold text-gray-900">{formatEP(ergebnis.nettoUebertragEP)} EP</span>
          </div>
          <div className="flex justify-between py-2 bg-violet-50 -mx-6 px-6">
            <span className="font-medium text-violet-700">= Netto-Übertrag</span>
            <span className="font-bold text-violet-900">
              {ergebnis.gleichstand
                ? 'kein Übertrag'
                : `${formatEP(ergebnis.nettoUebertragEP)} EP (${ergebnis.richtungVonA ? 'A → B' : 'B → A'})`}
            </span>
          </div>

          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            EUR-Umrechnung (illustrativ, RWBestV 2026)
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Netto-Übertrag × 42,52 €</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.nettoUebertragEuro)}/Monat</span>
          </div>
        </div>
      </div>

      {/* Bagatell-Hinweis */}
      {ergebnis.bagatell && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-amber-800 mb-2">⚠️ Kurze Ehezeit (bis 3 Jahre)</h3>
          <p className="text-sm text-amber-700">
            Ihre Ehezeit beträgt <strong>{ehezeitText()}</strong> und liegt damit bei bis zu drei
            Jahren. In diesem Fall findet ein Versorgungsausgleich <strong>nur auf Antrag</strong>
            {' '}eines Ehegatten statt (§ 3 Abs. 3 VersAusglG). Ohne Antrag wird der Ausgleich vom
            Familiengericht nicht von Amts wegen durchgeführt.
          </p>
        </div>
      )}

      {/* Wichtige Hinweise */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Was dieser Rechner abbildet</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Gesetzliche Rentenversicherung:</strong> Halbteilung der in der Ehezeit
              erworbenen Entgeltpunkte je Anrecht (§ 1, § 43 VersAusglG).
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Interne Teilung mit Verrechnung:</strong> Bei beidseitiger gesetzlicher Rente
              wird nur der Wertunterschied übertragen (§ 10 Abs. 1 u. 2 VersAusglG).
            </span>
          </li>
          <li className="flex gap-2">
            <span>✗</span>
            <span>
              <strong>Nicht abgebildet:</strong> Betriebs-, Beamten- und private Anrechte, externe
              Teilung, Geringfügigkeitsgrenzen (§ 18 VersAusglG) sowie Zugangs- und Rentenartfaktor
              bei späterem Rentenbeginn.
            </span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <p className="text-sm text-amber-800">
          <strong>Schätzung – keine Rechts- oder Steuerberatung.</strong> Dieser Rechner liefert
          eine vereinfachte Modellrechnung für Anrechte der gesetzlichen Rentenversicherung. Die
          verbindliche Ermittlung des Ehezeitanteils und des Ausgleichswerts nimmt der jeweilige
          Versorgungsträger vor; über den Versorgungsausgleich entscheidet das Familiengericht. Die
          EUR-Umrechnung ist rein illustrativ und entspricht nicht dem später ausgezahlten
          Rentenbetrag.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a href="https://www.gesetze-im-internet.de/versausglg/__1.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 1 VersAusglG – Halbteilung der Anrechte
          </a>
          <a href="https://www.gesetze-im-internet.de/versausglg/__3.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 3 VersAusglG – Ehezeit &amp; Bagatellgrenze (3 Jahre)
          </a>
          <a href="https://www.gesetze-im-internet.de/versausglg/__5.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 5 VersAusglG – Ehezeitanteil &amp; Bewertungsstichtag
          </a>
          <a href="https://www.gesetze-im-internet.de/versausglg/__10.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 10 VersAusglG – Interne Teilung &amp; Verrechnung
          </a>
          <a href="https://www.gesetze-im-internet.de/versausglg/__39.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 39 VersAusglG – Unmittelbare Bewertung (Entgeltpunkte)
          </a>
          <a href="https://www.gesetze-im-internet.de/versausglg/__43.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 43 VersAusglG – Gesetzliche Rentenversicherung
          </a>
          <a href="https://www.gesetze-im-internet.de/rwbestv_2026/__1.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 1 RWBestV 2026 – Aktueller Rentenwert 42,52 €
          </a>
        </div>
      </div>
    </div>
  );
}
