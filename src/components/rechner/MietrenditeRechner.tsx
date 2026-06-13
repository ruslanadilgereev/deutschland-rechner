import { useState, useMemo } from 'react';

// Mietrendite-Rechner
// Kaufmaennische Standard-Kennzahlen (keine Gesetzeswerte):
//   Jahresnettokaltmiete (JNKM) = Monatsnettokaltmiete x 12
//   Brutto-Mietrendite [%]      = JNKM / Kaufpreis x 100
//   Kaufnebenkosten (KNK)       = Kaufpreis x (GrESt% + Notar/Grundbuch% + Makler%) / 100
//   Gesamtinvestition (GI)      = Kaufpreis + KNK
//   Netto-Mietrendite [%]       = (JNKM - Bewirtschaftungskosten) / GI x 100
//   Kaufpreisfaktor             = Kaufpreis / JNKM
//   Zinskosten                  = Fremdkapital x Sollzins% / 100; Fremdkapital = GI - Eigenkapital (min. 0)
//   Cashflow (vor Steuer)       = JNKM - Bewirtschaftungskosten - Zinskosten
//   Eigenkapitalrendite [%]     = (JNKM - Bewirtschaftungskosten - Zinskosten) / Eigenkapital x 100
//
// Grunderwerbsteuer je Bundesland: Stand 2026, identisch zur KaufnebenkostenRechner-Tabelle.
// Quellen: § 11 GrEStG, § 32 ImmoWertV 2022, GNotKG, § 656c BGB.

// Grunderwerbsteuer nach Bundesland (Stand 2026) – § 11 GrEStG i.V.m. Landesrecht
interface Bundesland {
  id: string;
  name: string;
  grunderwerbsteuer: number; // in Prozent
}

const BUNDESLAENDER: Bundesland[] = [
  { id: 'bw', name: 'Baden-Württemberg', grunderwerbsteuer: 5.0 },
  { id: 'by', name: 'Bayern', grunderwerbsteuer: 3.5 },
  { id: 'be', name: 'Berlin', grunderwerbsteuer: 6.0 },
  { id: 'bb', name: 'Brandenburg', grunderwerbsteuer: 6.5 },
  { id: 'hb', name: 'Bremen', grunderwerbsteuer: 5.5 },
  { id: 'hh', name: 'Hamburg', grunderwerbsteuer: 5.5 },
  { id: 'he', name: 'Hessen', grunderwerbsteuer: 6.0 },
  { id: 'mv', name: 'Mecklenburg-Vorpommern', grunderwerbsteuer: 6.0 },
  { id: 'ni', name: 'Niedersachsen', grunderwerbsteuer: 5.0 },
  { id: 'nw', name: 'Nordrhein-Westfalen', grunderwerbsteuer: 6.5 },
  { id: 'rp', name: 'Rheinland-Pfalz', grunderwerbsteuer: 5.0 },
  { id: 'sl', name: 'Saarland', grunderwerbsteuer: 6.5 },
  { id: 'sn', name: 'Sachsen', grunderwerbsteuer: 5.5 },
  { id: 'st', name: 'Sachsen-Anhalt', grunderwerbsteuer: 5.0 },
  { id: 'sh', name: 'Schleswig-Holstein', grunderwerbsteuer: 6.5 },
  { id: 'th', name: 'Thüringen', grunderwerbsteuer: 5.0 },
];

export default function MietrenditeRechner() {
  // Eingabewerte (Default-Beispiel: 4,00 % Brutto, 3,22 % Netto)
  const [kaufpreis, setKaufpreis] = useState(300000);
  const [monatsmiete, setMonatsmiete] = useState(1000);
  const [bundeslandId, setBundeslandId] = useState('by'); // Default: Bayern (3,5 %)
  const [notarGrundbuchProzent, setNotarGrundbuchProzent] = useState(2.0);
  const [maklerProzent, setMaklerProzent] = useState(0);
  const [bewirtschaftung, setBewirtschaftung] = useState(1800); // €/Jahr, nicht umlagefähig
  const [eigenkapital, setEigenkapital] = useState(80000);
  const [sollzins, setSollzins] = useState(4.0);

  const ergebnis = useMemo(() => {
    const bundesland = BUNDESLAENDER.find((b) => b.id === bundeslandId)!;

    // Jahresnettokaltmiete
    const jnkm = monatsmiete * 12;

    // Brutto-Mietrendite
    const bruttorendite = kaufpreis > 0 ? (jnkm / kaufpreis) * 100 : 0;

    // Kaufnebenkosten: GrESt + Notar/Grundbuch + Makler
    const grunderwerbsteuer = kaufpreis * (bundesland.grunderwerbsteuer / 100);
    const notarGrundbuch = kaufpreis * (notarGrundbuchProzent / 100);
    const makler = kaufpreis * (maklerProzent / 100);
    const kaufnebenkosten = grunderwerbsteuer + notarGrundbuch + makler;

    // Gesamtinvestition
    const gesamtinvestition = kaufpreis + kaufnebenkosten;

    // Netto-Mietrendite (auf Gesamtinvestition)
    const nettorendite =
      gesamtinvestition > 0 ? ((jnkm - bewirtschaftung) / gesamtinvestition) * 100 : 0;

    // Kaufpreisfaktor (Vervielfältiger)
    const kaufpreisfaktor = jnkm > 0 ? kaufpreis / jnkm : 0;

    // Finanzierung
    const fremdkapital = Math.max(0, gesamtinvestition - eigenkapital);
    const zinskosten = fremdkapital * (sollzins / 100);

    // Cashflow vor Steuer (ohne Tilgung)
    const cashflow = jnkm - bewirtschaftung - zinskosten;

    // Eigenkapitalrendite (Leverage) – nur sinnvoll bei Eigenkapital > 0
    const ekRenditeBerechenbar = eigenkapital > 0;
    const ekRendite = ekRenditeBerechenbar ? (cashflow / eigenkapital) * 100 : 0;

    return {
      bundesland,
      jnkm,
      bruttorendite,
      grunderwerbsteuer,
      notarGrundbuch,
      makler,
      kaufnebenkosten,
      gesamtinvestition,
      nettorendite,
      kaufpreisfaktor,
      fremdkapital,
      zinskosten,
      cashflow,
      ekRenditeBerechenbar,
      ekRendite,
    };
  }, [
    kaufpreis,
    monatsmiete,
    bundeslandId,
    notarGrundbuchProzent,
    maklerProzent,
    bewirtschaftung,
    eigenkapital,
    sollzins,
  ]);

  const formatEuro = (n: number) =>
    Math.round(n).toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatProzent = (n: number) => n.toFixed(2).replace('.', ',') + ' %';
  const formatFaktor = (n: number) => n.toFixed(1).replace('.', ',');

  // Farbgebung nach Nettorendite-Höhe (grün gut, gelb mittel, rot schwach)
  const getRenditeColor = () => {
    if (ergebnis.nettorendite >= 4) return 'from-green-500 to-emerald-600';
    if (ergebnis.nettorendite >= 2.5) return 'from-amber-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  return (
    <div className="max-w-2xl mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Ihre Immobilie</h2>

        {/* Kaufpreis */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Kaufpreis der Immobilie</span>
            <span className="text-xs text-gray-500 block mt-1">Wohnung oder Haus zur Vermietung</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={kaufpreis === 0 ? '' : kaufpreis}
              onChange={(e) => setKaufpreis(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              step="10000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
        </div>

        {/* Monatsmiete */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Monatliche Nettokaltmiete</span>
            <span className="text-xs text-gray-500 block mt-1">Miete ohne Betriebs-/Nebenkosten</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={monatsmiete === 0 ? '' : monatsmiete}
              onChange={(e) => setMonatsmiete(Math.max(0, Number(e.target.value)))}
              className="w-full py-3 px-4 pr-10 text-lg border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Jahresnettokaltmiete: <strong>{formatEuro(ergebnis.jnkm)}</strong>
          </p>
        </div>

        {/* Bundesland (Grunderwerbsteuer) */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Bundesland</span>
            <span className="text-xs text-gray-500 block mt-1">Bestimmt die Grunderwerbsteuer der Kaufnebenkosten</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {BUNDESLAENDER.map((bl) => (
              <button
                key={bl.id}
                onClick={() => setBundeslandId(bl.id)}
                className={`py-2 px-3 rounded-lg text-sm transition-all ${
                  bundeslandId === bl.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="font-medium block truncate">{bl.name}</span>
                <span className={`text-xs ${bundeslandId === bl.id ? 'text-blue-100' : 'text-gray-400'}`}>
                  {formatProzent(bl.grunderwerbsteuer)} GrESt
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notar/Grundbuch + Makler */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <label className="block">
            <span className="text-gray-700 font-medium text-sm">Notar + Grundbuch</span>
            <span className="text-xs text-gray-500 block mt-1 mb-2">üblich ca. 2,0 % (GNotKG)</span>
            <div className="relative">
              <input
                type="number"
                value={notarGrundbuchProzent}
                onChange={(e) => setNotarGrundbuchProzent(Math.max(0, Number(e.target.value)))}
                className="w-full py-2 px-4 pr-9 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                min="0"
                step="0.1"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium text-sm">Makler (Käuferanteil)</span>
            <span className="text-xs text-gray-500 block mt-1 mb-2">0 % bis 3,57 % (§ 656c BGB)</span>
            <div className="relative">
              <input
                type="number"
                value={maklerProzent}
                onChange={(e) => setMaklerProzent(Math.max(0, Number(e.target.value)))}
                className="w-full py-2 px-4 pr-9 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                min="0"
                step="0.01"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
          </label>
        </div>

        {/* Bewirtschaftungskosten */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Nicht-umlagefähige Bewirtschaftungskosten</span>
            <span className="text-xs text-gray-500 block mt-1">
              pro Jahr (§ 32 ImmoWertV 2022): Verwaltung, Instandhaltung, Mietausfallwagnis, nicht umlagefähige Betriebskosten
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={bewirtschaftung === 0 ? '' : bewirtschaftung}
              onChange={(e) => setBewirtschaftung(Math.max(0, Number(e.target.value)))}
              className="w-full py-3 px-4 pr-16 text-lg border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              step="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€/Jahr</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Grobe Orientierung: ca. 15–35 €/m²/Jahr bzw. rund eine Monatsmiete Instandhaltungsrücklage. Bitte objektbezogen schätzen.
          </p>
        </div>

        {/* Finanzierung */}
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-gray-700 font-medium text-sm">Eigenkapital</span>
            <span className="text-xs text-gray-500 block mt-1 mb-2">für die EK-Rendite</span>
            <div className="relative">
              <input
                type="number"
                value={eigenkapital === 0 ? '' : eigenkapital}
                onChange={(e) => setEigenkapital(Math.max(0, Number(e.target.value)))}
                className="w-full py-2 px-4 pr-9 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                min="0"
                step="10000"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium text-sm">Sollzins p.&nbsp;a.</span>
            <span className="text-xs text-gray-500 block mt-1 mb-2">auf das Darlehen</span>
            <div className="relative">
              <input
                type="number"
                value={sollzins}
                onChange={(e) => setSollzins(Math.max(0, Number(e.target.value)))}
                className="w-full py-2 px-4 pr-9 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                min="0"
                step="0.1"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
          </label>
        </div>
      </div>

      {/* Result Section */}
      <div className={`rounded-2xl shadow-lg p-6 text-white mb-6 bg-gradient-to-br ${getRenditeColor()}`}>
        <h3 className="text-sm font-medium opacity-80 mb-1">📈 Netto-Mietrendite</h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatProzent(ergebnis.nettorendite)}</span>
          </div>
          <p className="text-white/80 mt-2 text-sm">
            bezogen auf die Gesamtinvestition von <strong>{formatEuro(ergebnis.gesamtinvestition)}</strong> (Kaufpreis + Kaufnebenkosten)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Brutto-Mietrendite</span>
            <div className="text-xl font-bold">{formatProzent(ergebnis.bruttorendite)}</div>
            <span className="text-xs opacity-70">nur Kaufpreis</span>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Kaufpreisfaktor</span>
            <div className="text-xl font-bold">{formatFaktor(ergebnis.kaufpreisfaktor)}</div>
            <span className="text-xs opacity-70">Kaufpreis ÷ Jahresmiete</span>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Cashflow (vor Steuer)</span>
            <div className="text-xl font-bold">
              {ergebnis.cashflow >= 0 ? '+' : ''}{formatEuro(ergebnis.cashflow)}
            </div>
            <span className="text-xs opacity-70">pro Jahr</span>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Eigenkapitalrendite</span>
            <div className="text-xl font-bold">
              {ergebnis.ekRenditeBerechenbar ? formatProzent(ergebnis.ekRendite) : '–'}
            </div>
            <span className="text-xs opacity-70">auf Eigenkapital</span>
          </div>
        </div>
      </div>

      {/* Aufschlüsselung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 So setzt sich die Rendite zusammen</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-700">Jahresnettokaltmiete</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.jnkm)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100 text-gray-600">
            <span>− Grunderwerbsteuer ({formatProzent(ergebnis.bundesland.grunderwerbsteuer)} in {ergebnis.bundesland.name})</span>
            <span>{formatEuro(ergebnis.grunderwerbsteuer)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100 text-gray-600">
            <span>Notar + Grundbuch ({formatProzent(notarGrundbuchProzent)})</span>
            <span>{formatEuro(ergebnis.notarGrundbuch)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100 text-gray-600">
            <span>Maklerprovision ({formatProzent(maklerProzent)})</span>
            <span>{formatEuro(ergebnis.makler)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-700 font-medium">Kaufnebenkosten gesamt</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.kaufnebenkosten)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-700 font-medium">Gesamtinvestition (Kaufpreis + Nebenkosten)</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.gesamtinvestition)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100 text-gray-600">
            <span>− Bewirtschaftungskosten p.&nbsp;a.</span>
            <span>{formatEuro(bewirtschaftung)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100 text-gray-600">
            <span>− Zinskosten ({formatProzent(sollzins)} auf {formatEuro(ergebnis.fremdkapital)} Fremdkapital)</span>
            <span>{formatEuro(ergebnis.zinskosten)}</span>
          </div>
          <div className="flex justify-between py-4 bg-orange-50 -mx-6 px-6 rounded-b-xl mt-2">
            <span className="font-bold text-orange-800">Jährlicher Cashflow vor Steuer</span>
            <span className="font-bold text-xl text-orange-900">
              {ergebnis.cashflow >= 0 ? '+' : ''}{formatEuro(ergebnis.cashflow)}
            </span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So rechnet der Mietrendite-Rechner</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Brutto-Mietrendite</strong> = Jahresnettokaltmiete ÷ Kaufpreis × 100</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Netto-Mietrendite</strong> = (Jahresnettokaltmiete − Bewirtschaftungskosten) ÷ Gesamtinvestition × 100</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Kaufpreisfaktor</strong> = Kaufpreis ÷ Jahresnettokaltmiete (Kehrwert der Bruttorendite)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Eigenkapitalrendite</strong> = Cashflow ÷ Eigenkapital × 100 (Hebelwirkung der Finanzierung)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Werte <strong>vor Steuern (AfA, Einkommensteuer)</strong> und ohne Tilgung gerechnet</span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6">
        <p className="text-xs text-gray-500">
          <strong>Hinweis:</strong> Schätzung – keine Steuer-, Rechts- oder Anlageberatung. Der Rechner liefert
          kaufmännische Standard-Kennzahlen (Brutto-/Nettomietrendite, Kaufpreisfaktor, Cashflow,
          Eigenkapitalrendite) und stellt keine Empfehlung zum Kauf oder Verkauf einer Immobilie dar.
          Die Grunderwerbsteuersätze (3,5 %–6,5 %) richten sich nach § 11 GrEStG i.&nbsp;V.&nbsp;m. dem jeweiligen
          Landesrecht (Stand 2026); Notar-/Grundbuchkosten (GNotKG) und Maklerprovision (§ 656c BGB) sind
          Pauschal-Annahmen und können im Einzelfall abweichen. Bewirtschaftungskosten i.&nbsp;S.&nbsp;d.
          § 32 ImmoWertV 2022 müssen objektbezogen geschätzt werden. Mietausfall, Leerstand, Wertentwicklung,
          Steuern (AfA, Einkommensteuer) und individuelle Finanzierungskonditionen sind nicht oder nur
          vereinfacht berücksichtigt. Alle Angaben ohne Gewähr.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Rechtsgrundlagen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/grestg_1983/__11.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 11 GrEStG – Steuersatz (Grunderwerbsteuer)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/immowertv_2022/__32.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 32 ImmoWertV 2022 – Bewirtschaftungskosten
          </a>
          <a
            href="https://www.gesetze-im-internet.de/gnotkg/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Gerichts- und Notarkostengesetz (GNotKG)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/bgb/__656c.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 656c BGB – Verteilung der Maklerprovision
          </a>
        </div>
      </div>
    </div>
  );
}
