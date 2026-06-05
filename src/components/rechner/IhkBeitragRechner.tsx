import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// IHK-Beitrag 2026 – bundeseinheitlich gesicherte Werte
// Quelle: IHKG (§ 3) – https://www.gesetze-im-internet.de/ihkg/__3.html
// und Beitragsordnungen/Wirtschaftssatzungen der einzelnen IHKn.
const UMLAGE_FREIBETRAG = 15340; // € – Freibetrag bei der Umlage für nicht im HR eingetragene natürliche Personen & Personengesellschaften
const FREISTELLUNGSGRENZE_GRUNDBEITRAG = 5200; // € – Kleingewerbe (nicht im HR) unter dieser Grenze: kein Grundbeitrag
const EXISTENZGRUENDER_ERTRAGSGRENZE = 25000; // € – max. Gewerbeertrag/Gewinn für Existenzgründer-Befreiung (§ 3 Abs. 3 IHKG)

// Default-Beispielwerte für Grundbeitrag (regional stark abweichend – nur Orientierung!)
type Rechtsform = 'natuerlich' | 'personengesellschaft' | 'kapitalgesellschaft';

export default function IhkBeitragRechner() {
  // Eingabewerte
  const [gewerbeertrag, setGewerbeertrag] = useState(40000);
  const [rechtsform, setRechtsform] = useState<Rechtsform>('natuerlich');
  const [imHandelsregister, setImHandelsregister] = useState(false);
  const [gruenderJahr, setGruenderJahr] = useState(0); // 0 = kein Gründer, 1–4 = Gründungsjahr
  const [grundbeitrag, setGrundbeitrag] = useState(110); // € – editierbarer Beispiel-Default
  const [umlagesatz, setUmlagesatz] = useState(0.15); // % – editierbarer Beispiel-Default

  const ergebnis = useMemo(() => {
    // === Kapitalgesellschaften (GmbH, UG, AG) sind immer im HR eingetragen ===
    const istKapGes = rechtsform === 'kapitalgesellschaft';
    const istImHR = istKapGes ? true : imHandelsregister;

    // === Umlage-Freibetrag: nur natürliche Personen & Personengesellschaften, NICHT im HR ===
    const freibetragGreift = !istKapGes && !istImHR;
    const umlageFreibetrag = freibetragGreift ? UMLAGE_FREIBETRAG : 0;

    // === Existenzgründer-Befreiung (§ 3 Abs. 3 Satz 4 IHKG) ===
    // Nur NATÜRLICHE PERSONEN (nicht Personengesellschaften, nicht KapGes),
    // nicht im HR, Gewerbeertrag <= 25.000 €. Die Freistellungsgrenze (Satz 3)
    // gilt auch für Personengesellschaften, die Gründerbefreiung jedoch nicht.
    const istGruender = gruenderJahr >= 1 && gruenderJahr <= 4;
    const gruenderBerechtigt =
      istGruender &&
      rechtsform === 'natuerlich' &&
      !istImHR &&
      gewerbeertrag <= EXISTENZGRUENDER_ERTRAGSGRENZE;

    // Jahr 1–2: komplett beitragsfrei (Grundbeitrag + Umlage)
    // Jahr 3–4: nur Grundbeitrag fällig, Umlage befreit
    const befreiungGrundbeitrag = gruenderBerechtigt && gruenderJahr <= 2;
    const befreiungUmlage = gruenderBerechtigt; // Jahr 1–4

    // === Freistellungsgrenze Grundbeitrag (Kleingewerbe, nicht im HR) ===
    // Liegt der Ertrag unter 5.200 € und ist man nicht im HR eingetragen,
    // entfällt für natürliche Personen typischerweise der Grundbeitrag.
    const unterFreistellungsgrenze =
      !istKapGes && !istImHR && gewerbeertrag <= FREISTELLUNGSGRENZE_GRUNDBEITRAG;

    // === Grundbeitrag ermitteln ===
    let effektiverGrundbeitrag = grundbeitrag;
    let grundbeitragHinweis = '';
    if (befreiungGrundbeitrag) {
      effektiverGrundbeitrag = 0;
      grundbeitragHinweis = `Existenzgründer Jahr ${gruenderJahr}: beitragsfrei`;
    } else if (unterFreistellungsgrenze) {
      effektiverGrundbeitrag = 0;
      grundbeitragHinweis = `Gewerbeertrag unter ${FREISTELLUNGSGRENZE_GRUNDBEITRAG.toLocaleString('de-DE')} € (Kleingewerbe, nicht im HR): kein Grundbeitrag`;
    }

    // === Umlage ermitteln ===
    // Bemessungsgrundlage = Gewerbeertrag − Freibetrag (nicht negativ)
    const umlageBemessung = Math.max(0, gewerbeertrag - umlageFreibetrag);
    let effektiveUmlage = umlageBemessung * (umlagesatz / 100);
    let umlageHinweis = '';
    if (befreiungUmlage) {
      effektiveUmlage = 0;
      umlageHinweis = `Existenzgründer Jahr ${gruenderJahr}: Umlage befreit`;
    }

    // === Gesamtbeitrag ===
    const gesamtbeitrag = effektiverGrundbeitrag + effektiveUmlage;

    return {
      istKapGes,
      istImHR,
      freibetragGreift,
      umlageFreibetrag,
      istGruender,
      gruenderBerechtigt,
      befreiungGrundbeitrag,
      befreiungUmlage,
      unterFreistellungsgrenze,
      effektiverGrundbeitrag,
      grundbeitragHinweis,
      umlageBemessung,
      effektiveUmlage,
      umlageHinweis,
      gesamtbeitrag,
    };
  }, [gewerbeertrag, rechtsform, imHandelsregister, gruenderJahr, grundbeitrag, umlagesatz]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="IHK-Beitrag-Rechner" rechnerSlug="ihk-beitrag-rechner" />

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Rechtsform */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Rechtsform</span>
            <span className="text-xs text-gray-500 block mt-1">
              Entscheidet, ob der Umlage-Freibetrag von 15.340 € greift
            </span>
          </label>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => setRechtsform('natuerlich')}
              className={`py-3 px-4 rounded-xl font-medium transition-all text-left ${
                rechtsform === 'natuerlich'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">👤</span>
                <div>
                  <div className="font-semibold">Einzelunternehmer / natürliche Person</div>
                  <div className="text-xs opacity-80">Freibetrag 15.340 €, wenn nicht im HR</div>
                </div>
              </div>
            </button>
            <button
              onClick={() => setRechtsform('personengesellschaft')}
              className={`py-3 px-4 rounded-xl font-medium transition-all text-left ${
                rechtsform === 'personengesellschaft'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">👥</span>
                <div>
                  <div className="font-semibold">Personengesellschaft</div>
                  <div className="text-xs opacity-80">GbR, OHG, KG – Freibetrag 15.340 €, wenn nicht im HR</div>
                </div>
              </div>
            </button>
            <button
              onClick={() => setRechtsform('kapitalgesellschaft')}
              className={`py-3 px-4 rounded-xl font-medium transition-all text-left ${
                rechtsform === 'kapitalgesellschaft'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏢</span>
                <div>
                  <div className="font-semibold">Kapitalgesellschaft</div>
                  <div className="text-xs opacity-80">GmbH, UG, AG – kein Freibetrag (immer im HR)</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Handelsregister */}
        {rechtsform !== 'kapitalgesellschaft' && (
          <div className="mb-6 p-4 bg-emerald-50 rounded-xl">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={imHandelsregister}
                onChange={(e) => setImHandelsregister(e.target.checked)}
                className="w-5 h-5 rounded accent-emerald-500"
              />
              <span className="text-gray-700 font-medium">Im Handelsregister eingetragen (z. B. e. K., OHG, KG)</span>
            </label>
            <p className="text-xs text-emerald-700 mt-2">
              💡 Wer im Handelsregister eingetragen ist, hat <strong>keinen</strong> Umlage-Freibetrag von 15.340 €.
            </p>
          </div>
        )}

        {/* Gewerbeertrag */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Gewerbeertrag / Gewinn pro Jahr</span>
            <span className="text-xs text-gray-500 block mt-1">
              Bemessungsgrundlage für die Umlage (i. d. R. der Gewerbeertrag, ersatzweise der Gewinn)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={gewerbeertrag}
              onChange={(e) => setGewerbeertrag(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
              min="0"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={gewerbeertrag}
            onChange={(e) => setGewerbeertrag(Number(e.target.value))}
            className="w-full mt-3 accent-emerald-500"
            min="0"
            max="300000"
            step="1000"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span>150.000 €</span>
            <span>300.000 €</span>
          </div>
        </div>

        {/* Existenzgründer – nur natürliche Personen (§ 3 Abs. 3 Satz 4 IHKG) */}
        {rechtsform === 'natuerlich' && !imHandelsregister && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Existenzgründer? (§ 3 Abs. 3 IHKG)</span>
              <span className="text-xs text-gray-500 block mt-1">
                Befreiung nur für natürliche Personen bei Gewerbeertrag bis 25.000 € und wenn nicht im HR eingetragen
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setGruenderJahr(0)}
                className={`py-2 px-2 rounded-xl text-sm font-medium transition-all ${
                  gruenderJahr === 0 ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Kein Gründer
              </button>
              <button
                onClick={() => setGruenderJahr(1)}
                className={`py-2 px-2 rounded-xl text-sm font-medium transition-all ${
                  gruenderJahr === 1 ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Jahr 1
              </button>
              <button
                onClick={() => setGruenderJahr(2)}
                className={`py-2 px-2 rounded-xl text-sm font-medium transition-all ${
                  gruenderJahr === 2 ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Jahr 2
              </button>
              <button
                onClick={() => setGruenderJahr(3)}
                className={`py-2 px-2 rounded-xl text-sm font-medium transition-all ${
                  gruenderJahr === 3 ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Jahr 3
              </button>
              <button
                onClick={() => setGruenderJahr(4)}
                className={`py-2 px-2 rounded-xl text-sm font-medium transition-all ${
                  gruenderJahr === 4 ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Jahr 4
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Jahr 1–2: komplett beitragsfrei · Jahr 3–4: nur Grundbeitrag fällig (Umlage befreit)
            </p>
          </div>
        )}

        {/* Regionale Werte – editierbar */}
        <details className="mb-2" open>
          <summary className="cursor-pointer text-emerald-600 font-medium text-sm hover:text-emerald-700">
            Grundbeitrag &amp; Umlagesatz (regionale Werte – anpassen!)
          </summary>
          <div className="mt-4 space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-800">
              ⚠️ <strong>Beispiel-/Durchschnittswerte.</strong> Grundbeitrag und Umlagesatz legt jede IHK in
              ihrer Wirtschaftssatzung selbst fest – <strong>Ihre IHK weicht ab.</strong> Bitte die echten Werte
              aus der Beitragsordnung Ihrer IHK eintragen.
            </p>

            {/* Grundbeitrag */}
            <div>
              <label className="block mb-2">
                <span className="text-gray-700 font-medium text-sm">Grundbeitrag (€ / Jahr)</span>
                <span className="text-xs text-gray-500 block mt-1">
                  Je nach IHK und Ertragsstaffel typischerweise ca. 30–300 €
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={grundbeitrag}
                  onChange={(e) => setGrundbeitrag(Math.max(0, Number(e.target.value)))}
                  className="w-full text-lg font-bold text-center py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
                  min="0"
                  step="5"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
            </div>

            {/* Umlagesatz */}
            <div>
              <label className="block mb-2">
                <span className="text-gray-700 font-medium text-sm">Umlagesatz (% des Gewerbeertrags)</span>
                <span className="text-xs text-gray-500 block mt-1">
                  Je nach IHK typischerweise ca. 0,08–0,30 %
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={umlagesatz}
                  onChange={(e) => setUmlagesatz(Math.max(0, Number(e.target.value)))}
                  className="w-full text-lg font-bold text-center py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
                  min="0"
                  max="1"
                  step="0.01"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
              </div>
            </div>
          </div>
        </details>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🏛️ Ihr geschätzter IHK-Beitrag</h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroRound(ergebnis.gesamtbeitrag)}</span>
            <span className="text-xl opacity-80">/ Jahr</span>
          </div>
          {ergebnis.gesamtbeitrag === 0 && (
            <p className="text-emerald-100 mt-2 text-sm">
              ✅ In diesem Fall fällt kein IHK-Beitrag an.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Grundbeitrag</span>
            <div className="text-xl font-bold">{formatEuroRound(ergebnis.effektiverGrundbeitrag)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Umlage</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.effektiveUmlage)}</div>
          </div>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>

        <div className="space-y-3 text-sm">
          {/* Grundbeitrag */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            1. Grundbeitrag
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Grundbeitrag (Ihre IHK)</span>
            <span className="font-bold text-gray-900">{formatEuro(grundbeitrag)}</span>
          </div>
          {ergebnis.grundbeitragHinweis && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
              <span>{ergebnis.grundbeitragHinweis}</span>
              <span>− {formatEuro(grundbeitrag)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 bg-emerald-50 -mx-6 px-6">
            <span className="font-medium text-emerald-700">= Anzusetzender Grundbeitrag</span>
            <span className="font-bold text-emerald-900">{formatEuro(ergebnis.effektiverGrundbeitrag)}</span>
          </div>

          {/* Umlage */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            2. Umlage
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Gewerbeertrag</span>
            <span className="text-gray-900">{formatEuro(gewerbeertrag)}</span>
          </div>
          {ergebnis.umlageFreibetrag > 0 ? (
            <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
              <span>− Freibetrag (nicht im HR)</span>
              <span>{formatEuro(ergebnis.umlageFreibetrag)}</span>
            </div>
          ) : (
            <div className="flex justify-between py-2 border-b border-gray-100 text-gray-500">
              <span>− Freibetrag</span>
              <span>{ergebnis.istKapGes ? 'kein Freibetrag (KapGes)' : 'kein Freibetrag (im HR)'}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">= Umlage-Bemessungsgrundlage</span>
            <span className="text-gray-900">{formatEuro(ergebnis.umlageBemessung)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              × Umlagesatz {umlagesatz.toLocaleString('de-DE')} %
            </span>
            <span className="text-gray-900">{formatEuro(ergebnis.umlageBemessung * (umlagesatz / 100))}</span>
          </div>
          {ergebnis.umlageHinweis && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
              <span>{ergebnis.umlageHinweis}</span>
              <span>− {formatEuro(ergebnis.umlageBemessung * (umlagesatz / 100))}</span>
            </div>
          )}
          <div className="flex justify-between py-2 bg-emerald-50 -mx-6 px-6">
            <span className="font-medium text-emerald-700">= Anzusetzende Umlage</span>
            <span className="font-bold text-emerald-900">{formatEuro(ergebnis.effektiveUmlage)}</span>
          </div>

          {/* Gesamt */}
          <div className="flex justify-between py-2 bg-emerald-100 -mx-6 px-6 mt-2">
            <span className="font-bold text-emerald-800">= IHK-Beitrag gesamt</span>
            <span className="font-bold text-2xl text-emerald-900">{formatEuro(ergebnis.gesamtbeitrag)}</span>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Schätzung ohne Gewähr. Maßgeblich sind Beitragsbescheid und Wirtschaftssatzung Ihrer IHK.
        </p>
      </div>

      {/* Hinweise zu Befreiungen */}
      {(ergebnis.unterFreistellungsgrenze || ergebnis.gruenderBerechtigt) && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-green-800 mb-3">✅ Mögliche Befreiung erkannt</h3>
          <ul className="space-y-2 text-sm text-green-700">
            {ergebnis.unterFreistellungsgrenze && !ergebnis.gruenderBerechtigt && (
              <li className="flex gap-2">
                <span>•</span>
                <span>
                  Ihr Gewerbeertrag liegt unter der Freistellungsgrenze von 5.200 € und Sie sind nicht im
                  Handelsregister eingetragen – als Kleingewerbe entfällt für natürliche Personen
                  typischerweise der Grundbeitrag.
                </span>
              </li>
            )}
            {ergebnis.gruenderBerechtigt && gruenderJahr <= 2 && (
              <li className="flex gap-2">
                <span>•</span>
                <span>
                  Als Existenzgründer in Jahr 1–2 mit Gewerbeertrag bis 25.000 € sind Sie nach § 3 Abs. 3 IHKG
                  komplett beitragsfrei (Grundbeitrag und Umlage).
                </span>
              </li>
            )}
            {ergebnis.gruenderBerechtigt && gruenderJahr >= 3 && (
              <li className="flex gap-2">
                <span>•</span>
                <span>
                  Als Existenzgründer in Jahr 3–4 mit Gewerbeertrag bis 25.000 € entfällt nach § 3 Abs. 3 IHKG
                  die Umlage – nur der Grundbeitrag ist noch fällig.
                </span>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So setzt sich der IHK-Beitrag zusammen</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Grundbeitrag:</strong> fester Sockelbetrag, von jeder IHK gestaffelt nach Ertrag/Rechtsform festgelegt</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Umlage:</strong> Prozentsatz auf den Gewerbeertrag (nach Abzug des Freibetrags)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Freibetrag 15.340 €:</strong> nur für natürliche Personen und Personengesellschaften, die nicht im Handelsregister eingetragen sind</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Freistellungsgrenze 5.200 €:</strong> Kleingewerbe (nicht im HR) zahlen darunter keinen Grundbeitrag</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Existenzgründer (§ 3 Abs. 3 IHKG):</strong> nur natürliche Personen – Jahr 1–2 komplett beitragsfrei, Jahr 3–4 nur Grundbeitrag (bei Ertrag bis 25.000 €)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Pflichtmitgliedschaft:</strong> jedes Gewerbe ist kraft Gesetzes IHK-Mitglied (§ 2 IHKG)</span>
          </li>
        </ul>
      </div>

      {/* Wichtiger Hinweis (regional) */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtig: Werte sind regional verschieden</h3>
        <div className="space-y-2 text-sm text-amber-700">
          <p>
            <strong>Grundbeitrag und Umlagesatz legt jede IHK eigenständig</strong> in ihrer Wirtschaftssatzung
            fest. Die hier hinterlegten Werte ({formatEuroRound(grundbeitrag)} Grundbeitrag, {umlagesatz.toLocaleString('de-DE')} % Umlage)
            sind <strong>Beispiel-/Orientierungswerte</strong> – Ihre IHK weicht davon ab.
          </p>
          <p>
            Bundeseinheitlich gesichert sind dagegen: der Umlage-Freibetrag von 15.340 €, die Freistellungsgrenze
            von 5.200 € und die Existenzgründer-Regelung nach § 3 Abs. 3 IHKG.
          </p>
          <p className="font-medium">
            Für den exakten Beitrag bitte die Beitragsordnung / Wirtschaftssatzung Ihrer zuständigen IHK heranziehen.
          </p>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/ihkg/__3.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 3 IHKG – Beiträge (Gesetze im Internet)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/ihkg/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            IHKG – Gesetz über die Industrie- und Handelskammern (Gesetze im Internet)
          </a>
          <a
            href="https://www.ihk.de/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            IHK – Beitrag &amp; Wirtschaftssatzung der zuständigen IHK
          </a>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Diese Berechnung ist eine Schätzung ohne Gewähr und ersetzt keine Steuerberatung.
        </p>
      </div>
    </div>
  );
}
