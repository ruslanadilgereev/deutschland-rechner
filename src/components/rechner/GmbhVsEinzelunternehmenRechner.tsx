import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// ════════════════════════════════════════════════════════════════════
// GmbH vs. Einzelunternehmen – Steuervergleich 2026
// Gleicher Vorsteuer-Gewinn → welche Rechtsform zahlt weniger?
//
// Einzelunternehmen (natürliche Person):
//   Gewerbesteuer mit Freibetrag 24.500 € (§ 11 Abs. 1 GewStG)
//   Einkommensteuer nach § 32a EStG 2026 (zvE = Gewinn, vereinfacht)
//   § 35-Anrechnung: min(4,0 × Messbetrag, gezahlte GewSt, ESt) mindert die ESt
//   Solidaritätszuschlag mit Freigrenze auf die ESt nach Anrechnung (§ 4 SolZG)
//
// GmbH (Kapitalgesellschaft):
//   Gewerbesteuer OHNE Freibetrag (§ 11 GewStG)
//   Körperschaftsteuer 15 % (§ 23 KStG) + 5,5 % Soli (§ 4 SolZG)
//   Ausschüttung: Abgeltungsteuer 25 % + 5,5 % Soli (§ 32d / § 43a EStG)
//   thesaurierter Anteil bleibt steuerfrei in der GmbH (nur Stufe 1)
//
// Tarif-, GewSt-/§ 35- und Ausschüttungslogik übernommen aus den bereits
// verifizierten Komponenten EinkommensteuerSelbststaendigeRechner.tsx,
// GewerbesteuerRechner.tsx, KoerperschaftsteuerRechner.tsx und
// GmbhSteuerGesamtbelastungRechner.tsx.
// ════════════════════════════════════════════════════════════════════

// § 32a EStG 2026 – Grundfreibetrag und Tarifzonen (Grundtarif)
const GRUNDFREIBETRAG_2026 = 12348;
const ZONE1_ENDE = 17799;
const ZONE2_ENDE = 69878;
const ZONE3_ENDE = 277825;

// Solidaritätszuschlag 2026 – Freigrenze (Einzelveranlagung) + Milderungszone
const SOLI_FREIGRENZE_EINZEL = 20350;
const SOLI_SATZ = 0.055; // 5,5 %
const SOLI_MILDERUNG = 0.119; // 11,9 % Milderungszone

// Gewerbesteuer
const GEWST_MESSZAHL = 0.035; // 3,5 % Steuermesszahl (§ 11 Abs. 2 GewStG)
const GEWST_FREIBETRAG = 24500; // nur Einzelunternehmer/Personengesellschaften
const ANRECHNUNGSFAKTOR = 4.0; // § 35 EStG: max. 4,0 × Messbetrag

// Kapitalgesellschaft
const KST_SATZ = 0.15; // 15 % Körperschaftsteuer (§ 23 KStG)
const ABGELTUNGSTEUER = 0.25; // 25 % Kapitalertragsteuer (§ 43a EStG)

// Einkommensteuer nach § 32a EStG 2026 (Grundtarif, auf vollen Euro)
function berechneEinkommensteuer(zvE: number): number {
  const x = Math.floor(Math.max(0, zvE));
  if (x <= GRUNDFREIBETRAG_2026) return 0;
  let steuer = 0;
  if (x <= ZONE1_ENDE) {
    const y = (x - GRUNDFREIBETRAG_2026) / 10000;
    steuer = (914.51 * y + 1400) * y;
  } else if (x <= ZONE2_ENDE) {
    const z = (x - ZONE1_ENDE) / 10000;
    steuer = (173.10 * z + 2397) * z + 1034.87;
  } else if (x <= ZONE3_ENDE) {
    steuer = 0.42 * x - 11135.63;
  } else {
    steuer = 0.45 * x - 19470.38;
  }
  return Math.floor(steuer);
}

// Solidaritätszuschlag 2026 mit Freigrenze + Milderungszone (Einzelveranlagung)
function berechneSoli(einkommensteuer: number): number {
  if (einkommensteuer <= SOLI_FREIGRENZE_EINZEL) return 0;
  const milderung = SOLI_MILDERUNG * (einkommensteuer - SOLI_FREIGRENZE_EINZEL);
  const voll = SOLI_SATZ * einkommensteuer;
  return Math.min(voll, milderung);
}

export function GmbhVsEinzelunternehmenRechner() {
  const [gewinn, setGewinn] = useState(100000);
  const [hebesatz, setHebesatz] = useState(409);
  const [ausschuettungsquote, setAusschuettungsquote] = useState(100);

  const ergebnis = useMemo(() => {
    const g = Math.max(0, gewinn);
    const h = Math.max(200, hebesatz);
    const quote = Math.min(100, Math.max(0, ausschuettungsquote));

    // ─── EINZELUNTERNEHMEN ──────────────────────────────────────────
    // 1. Gewerbesteuer (mit Freibetrag 24.500 €)
    const euErtragNachFB = Math.max(0, g - GEWST_FREIBETRAG);
    const euErtragGerundet = Math.floor(euErtragNachFB / 100) * 100; // Abrundung auf volle 100 €
    const euMessbetrag = euErtragGerundet * GEWST_MESSZAHL;
    const euGewSt = euMessbetrag * (h / 100);

    // 2. Einkommensteuer (zvE = Gewinn, vereinfacht)
    const euEstVorAnrechnung = berechneEinkommensteuer(g);

    // 3. § 35-Anrechnung: min(4,0 × Messbetrag, gezahlte GewSt, ESt)
    const euAnrechnungMax = ANRECHNUNGSFAKTOR * euMessbetrag;
    const euAnrechnung = Math.min(euAnrechnungMax, euGewSt, euEstVorAnrechnung);
    const euEstNachAnrechnung = euEstVorAnrechnung - euAnrechnung;

    // 4. Soli auf die ESt nach Anrechnung (Freigrenze + Milderung)
    const euSoli = berechneSoli(euEstNachAnrechnung);

    const euGesamtsteuer = euGewSt + euEstNachAnrechnung + euSoli;
    const euNetto = g - euGesamtsteuer;
    const euEffektiv = g > 0 ? (euGesamtsteuer / g) * 100 : 0;

    // ─── GMBH ───────────────────────────────────────────────────────
    // Stufe 1 – Gesellschaft: GewSt (kein Freibetrag) + KSt + Soli
    const gmbhMessbetrag = g * GEWST_MESSZAHL;
    const gmbhGewSt = gmbhMessbetrag * (h / 100);
    const gmbhKSt = g * KST_SATZ;
    const gmbhSoliKSt = gmbhKSt * SOLI_SATZ;
    const gmbhStufe1 = gmbhGewSt + gmbhKSt + gmbhSoliKSt;
    const gmbhNachSteuer = Math.max(0, g - gmbhStufe1);

    // Ausschüttung
    const ausschuettungBrutto = gmbhNachSteuer * (quote / 100);
    const thesauriert = gmbhNachSteuer - ausschuettungBrutto;

    // Stufe 2 – Gesellschafter: Abgeltungsteuer 25 % + 5,5 % Soli (Privatvermögen)
    const gmbhKapSt = ausschuettungBrutto * ABGELTUNGSTEUER;
    const gmbhSoliKap = gmbhKapSt * SOLI_SATZ;
    const gmbhStufe2 = gmbhKapSt + gmbhSoliKap;
    const ausschuettungNetto = ausschuettungBrutto - gmbhStufe2;

    const gmbhGesamtsteuer = gmbhStufe1 + gmbhStufe2;
    // Was vom Gewinn beim Gesellschafter ankommt (Netto-Ausschüttung) + in der GmbH bleibt (thesauriert)
    const gmbhVerbleibt = ausschuettungNetto + thesauriert;
    const gmbhEffektiv = g > 0 ? (gmbhGesamtsteuer / g) * 100 : 0;

    // ─── VERGLEICH ──────────────────────────────────────────────────
    // Differenz der Steuerbelastung (positiv = GmbH zahlt mehr)
    const differenzSteuer = gmbhGesamtsteuer - euGesamtsteuer;
    // Differenz des verfügbaren Vermögens (positiv = GmbH lässt mehr übrig)
    const differenzNetto = gmbhVerbleibt - euNetto;
    const gmbhGuenstiger = gmbhGesamtsteuer < euGesamtsteuer;

    return {
      g,
      h,
      quote,
      // EU
      euGewSt,
      euMessbetrag,
      euEstVorAnrechnung,
      euAnrechnung,
      euEstNachAnrechnung,
      euSoli,
      euGesamtsteuer,
      euNetto,
      euEffektiv,
      // GmbH
      gmbhGewSt,
      gmbhKSt,
      gmbhSoliKSt,
      gmbhStufe1,
      gmbhNachSteuer,
      ausschuettungBrutto,
      thesauriert,
      gmbhKapSt,
      gmbhSoliKap,
      gmbhStufe2,
      ausschuettungNetto,
      gmbhGesamtsteuer,
      gmbhVerbleibt,
      gmbhEffektiv,
      // Vergleich
      differenzSteuer,
      differenzNetto,
      gmbhGuenstiger,
    };
  }, [gewinn, hebesatz, ausschuettungsquote]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatProzent = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';

  const HEBESATZ_PRESETS = [
    { name: 'Bundesschnitt', satz: 409 },
    { name: 'München', satz: 490 },
    { name: 'Berlin', satz: 410 },
    { name: 'Hamburg', satz: 470 },
    { name: 'Köln', satz: 475 },
    { name: 'Monheim', satz: 250 },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback
        rechnerName="GmbH vs. Einzelunternehmen Rechner"
        rechnerSlug="gmbh-vs-einzelunternehmen-rechner"
      />

      {/* Eingabe */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Gewinn */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Vorsteuer-Gewinn (gleich für beide Rechtsformen)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Jahresgewinn vor Ertragsteuern – beim Einzelunternehmen vor ESt/GewSt, bei der GmbH vor
              KSt/GewSt. Damit der Vergleich fair ist, ist der Wert für beide identisch.
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={gewinn}
              onChange={(e) => setGewinn(Math.max(0, Number(e.target.value) || 0))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none"
              min="0"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={Math.min(gewinn, 500000)}
            onChange={(e) => setGewinn(Number(e.target.value) || 0)}
            className="w-full mt-3 accent-indigo-500"
            min="0"
            max="500000"
            step="5000"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span>250.000 €</span>
            <span>500.000 €</span>
          </div>
        </div>

        {/* Hebesatz */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Gewerbesteuer-Hebesatz der Gemeinde</span>
            <span className="text-xs text-gray-500 block mt-1">
              Jede Gemeinde legt ihren Hebesatz selbst fest (mindestens 200 %). Voreingestellt ist der
              bundesweite Durchschnitt von 409 %.
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={hebesatz}
              onChange={(e) => setHebesatz(Math.max(200, Math.min(1000, Number(e.target.value) || 0)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none"
              min="200"
              max="1000"
              step="5"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">%</span>
          </div>
          <input
            type="range"
            value={Math.min(hebesatz, 600)}
            onChange={(e) => setHebesatz(Number(e.target.value) || 200)}
            className="w-full mt-3 accent-indigo-500"
            min="200"
            max="600"
            step="5"
          />
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">Stadt-Schnellauswahl:</p>
            <div className="flex flex-wrap gap-2">
              {HEBESATZ_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setHebesatz(preset.satz)}
                  className={`px-3 py-1 text-xs rounded-full transition-all ${
                    hebesatz === preset.satz
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {preset.name} ({preset.satz}%)
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ausschüttungsquote */}
        <div className="mb-2">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Ausschüttungsquote der GmbH</span>
            <span className="text-xs text-gray-500 block mt-1">
              Anteil des GmbH-Gewinns nach Steuern, der an die Gesellschafter ausgeschüttet wird. Der Rest
              bleibt thesauriert (in der GmbH). 100 % = voll ausschütten.
            </span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              value={ausschuettungsquote}
              onChange={(e) => setAusschuettungsquote(Number(e.target.value) || 0)}
              className="flex-1 accent-indigo-500"
              min="0"
              max="100"
              step="5"
            />
            <span className="text-lg font-bold text-indigo-700 w-16 text-right">{ausschuettungsquote} %</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {[0, 50, 100].map((q) => (
              <button
                key={q}
                onClick={() => setAusschuettungsquote(q)}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  ausschuettungsquote === q
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {q === 0 ? 'Voll thesaurieren (0 %)' : q === 100 ? 'Voll ausschütten (100 %)' : '50 %'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ergebnis – Empfehlung */}
      <div
        className={`rounded-2xl shadow-lg p-6 text-white mb-6 bg-gradient-to-br ${
          ergebnis.gmbhGuenstiger ? 'from-purple-600 to-indigo-700' : 'from-emerald-600 to-teal-700'
        }`}
      >
        <h3 className="text-sm font-medium opacity-80 mb-1">⚖️ Vergleich der Steuerbelastung</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-3xl sm:text-4xl font-bold">
              {ergebnis.gmbhGuenstiger ? 'GmbH zahlt weniger' : 'Einzelunternehmen zahlt weniger'}
            </span>
          </div>
          <p className="opacity-90 mt-2 text-sm">
            Differenz der Steuerlast:{' '}
            <strong>{formatEuroRound(Math.abs(ergebnis.differenzSteuer))} / Jahr</strong>{' '}
            zugunsten {ergebnis.gmbhGuenstiger ? 'der GmbH' : 'des Einzelunternehmens'} – bei{' '}
            {formatEuroRound(ergebnis.g)} Gewinn, {ergebnis.h} % Hebesatz und{' '}
            {ergebnis.quote} % Ausschüttung.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-xs opacity-80 block">👤 Einzelunternehmen</span>
            <div className="text-2xl font-bold">{formatEuroRound(ergebnis.euGesamtsteuer)}</div>
            <span className="text-xs opacity-70">{formatProzent(ergebnis.euEffektiv)} effektiv</span>
            <div className="text-xs opacity-80 mt-2">Netto: {formatEuroRound(ergebnis.euNetto)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-xs opacity-80 block">🏢 GmbH</span>
            <div className="text-2xl font-bold">{formatEuroRound(ergebnis.gmbhGesamtsteuer)}</div>
            <span className="text-xs opacity-70">{formatProzent(ergebnis.gmbhEffektiv)} effektiv</span>
            <div className="text-xs opacity-80 mt-2">
              Verfügbar: {formatEuroRound(ergebnis.gmbhVerbleibt)}
            </div>
          </div>
        </div>

        {ergebnis.quote < 100 && (
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm mt-3 text-sm">
            💡 Bei {ergebnis.quote} % Ausschüttung bleiben{' '}
            <strong>{formatEuroRound(ergebnis.thesauriert)}</strong> thesauriert in der GmbH – darauf
            fällt (noch) keine Abgeltungsteuer an. Genau das ist der Thesaurierungs-Vorteil der GmbH.
          </div>
        )}
      </div>

      {/* Empfehlungs-Hinweis */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🧭 Einordnung &amp; Empfehlung</h3>
        <p className="text-sm text-gray-600 mb-3">
          {ergebnis.quote === 100 ? (
            <>
              Bei <strong>voller Ausschüttung</strong> (100 %) trägt die GmbH die klassische
              Doppelbelastung: erst Körperschaft- und Gewerbesteuer auf der Gesellschaftsebene, dann
              Abgeltungsteuer auf die Ausschüttung. Das ergibt eine nahezu konstante Belastung von rund{' '}
              <strong>48–49 %</strong>. Das Einzelunternehmen profitiert dagegen vom progressiven
              Einkommensteuertarif und der § 35-Anrechnung der Gewerbesteuer – und ist bei
              Vollausschüttung fast immer günstiger.
            </>
          ) : (
            <>
              Sobald Gewinne <strong>in der GmbH thesauriert</strong> werden, spielt die GmbH ihren
              größten Vorteil aus: Auf den einbehaltenen Teil fällt nur die Belastung der ersten Stufe
              an (KSt + Soli + GewSt, rund <strong>30 %</strong>). Die Abgeltungsteuer wird erst bei
              späterer Ausschüttung fällig – ein Steuerstundungs- und Reinvestitionsvorteil, den ein
              Einzelunternehmen mit voll progressiver ESt nicht hat.
            </>
          )}
        </p>
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-800">
          <strong>Faustregel:</strong> Wer den Gewinn{' '}
          <strong>privat zum Leben braucht</strong> (hohe Ausschüttung), fährt mit dem
          Einzelunternehmen meist günstiger. Wer Gewinne{' '}
          <strong>im Unternehmen reinvestiert oder anspart</strong> (niedrige Ausschüttung), profitiert
          vom Thesaurierungs-Vorteil der GmbH. Haftungsbeschränkung, Geschäftsführergehalt und
          Sozialversicherung sind dabei weitere – hier nicht abgebildete – Argumente.
        </div>
      </div>

      {/* Berechnungsdetails Einzelunternehmen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">👤 Einzelunternehmen im Detail</h3>
        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            1. Gewerbesteuer (mit Freibetrag 24.500 €)
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Gewinn − 24.500 € Freibetrag → Messbetrag (× 3,5 %)</span>
            <span className="text-gray-900">{formatEuro(ergebnis.euMessbetrag)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Messbetrag × {ergebnis.h} % Hebesatz</span>
            <span className="text-gray-900">{formatEuro(ergebnis.euGewSt)}</span>
          </div>

          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-3">
            2. Einkommensteuer (§ 32a EStG 2026, zvE = Gewinn)
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Einkommensteuer vor Anrechnung</span>
            <span className="text-gray-900">{formatEuro(ergebnis.euEstVorAnrechnung)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
            <span>− § 35-Anrechnung der Gewerbesteuer (4,0 × Messbetrag, gedeckelt)</span>
            <span>{formatEuro(ergebnis.euAnrechnung)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">= Einkommensteuer nach Anrechnung</span>
            <span className="text-gray-900">{formatEuro(ergebnis.euEstNachAnrechnung)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              Solidaritätszuschlag
              {ergebnis.euSoli === 0 && (
                <span className="text-xs text-green-600 block">Freigrenze 20.350 € ESt nicht überschritten</span>
              )}
            </span>
            <span className="text-gray-900">{formatEuro(ergebnis.euSoli)}</span>
          </div>

          <div className="flex justify-between py-2 bg-emerald-50 -mx-6 px-6">
            <span className="font-bold text-emerald-800">= Gesamte Steuerlast Einzelunternehmen</span>
            <span className="font-bold text-emerald-900">{formatEuro(ergebnis.euGesamtsteuer)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Netto (Gewinn − Steuern), effektiver Steuersatz</span>
            <span className="font-bold text-gray-900">
              {formatEuroRound(ergebnis.euNetto)} · {formatProzent(ergebnis.euEffektiv)}
            </span>
          </div>
        </div>
      </div>

      {/* Berechnungsdetails GmbH */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🏢 GmbH im Detail</h3>
        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Stufe 1 – Besteuerung auf GmbH-Ebene
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>− Gewerbesteuer (3,5 % × {ergebnis.h} %, ohne Freibetrag)</span>
            <span>{formatEuro(ergebnis.gmbhGewSt)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>− Körperschaftsteuer (15 %)</span>
            <span>{formatEuro(ergebnis.gmbhKSt)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>− Solidaritätszuschlag (5,5 % der KSt)</span>
            <span>{formatEuro(ergebnis.gmbhSoliKSt)}</span>
          </div>
          <div className="flex justify-between py-2 bg-indigo-50 -mx-6 px-6">
            <span className="font-medium text-indigo-700">= Gewinn nach Steuern</span>
            <span className="font-bold text-indigo-900">{formatEuroRound(ergebnis.gmbhNachSteuer)}</span>
          </div>

          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-3">
            Ausschüttung ({ergebnis.quote} %)
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Ausschüttung brutto</span>
            <span className="text-gray-900">{formatEuro(ergebnis.ausschuettungBrutto)}</span>
          </div>
          {ergebnis.thesauriert > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-gray-500">
              <span>davon thesauriert (in der GmbH belassen)</span>
              <span>{formatEuro(ergebnis.thesauriert)}</span>
            </div>
          )}

          {ergebnis.ausschuettungBrutto > 0 && (
            <>
              <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-3">
                Stufe 2 – Abgeltungsteuer beim Gesellschafter
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
                <span>− Kapitalertragsteuer (25 %) + Soli (5,5 %)</span>
                <span>{formatEuro(ergebnis.gmbhStufe2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">= Ausschüttung netto beim Gesellschafter</span>
                <span className="text-gray-900">{formatEuro(ergebnis.ausschuettungNetto)}</span>
              </div>
            </>
          )}

          <div className="flex justify-between py-2 bg-indigo-100 -mx-6 px-6">
            <span className="font-bold text-indigo-800">= Gesamte Steuerlast GmbH</span>
            <span className="font-bold text-indigo-900">{formatEuro(ergebnis.gmbhGesamtsteuer)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Verfügbar (Netto-Ausschüttung + thesauriert), effektiv</span>
            <span className="font-bold text-gray-900">
              {formatEuroRound(ergebnis.gmbhVerbleibt)} · {formatProzent(ergebnis.gmbhEffektiv)}
            </span>
          </div>
        </div>

        <div className="mt-4 p-4 bg-indigo-50 rounded-xl text-sm text-indigo-800">
          💡 Die GmbH hat <strong>keinen Gewerbesteuer-Freibetrag</strong> und kann die Gewerbesteuer
          <strong> nicht</strong> nach § 35 EStG anrechnen. Dafür bleibt der thesaurierte Gewinn allein
          mit der Stufe-1-Belastung (rund 30 %) – die Abgeltungsteuer entsteht erst bei Ausschüttung.
        </div>
      </div>

      {/* Disclaimer / Vereinfachungen */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
          <span>⚠️</span> Wichtiger Hinweis &amp; Vereinfachungen
        </h3>
        <p className="text-sm text-amber-700 mb-3">
          Diese Berechnung ist eine <strong>Schätzung ohne Gewähr</strong> und{' '}
          <strong>ersetzt keine Steuerberatung</strong>. Der Vergleich bildet die steuerliche
          Grundsystematik 2026 ab, lässt aber bewusst mehrere Faktoren weg:
        </p>
        <ul className="space-y-1 text-sm text-amber-700 list-disc pl-5">
          <li>
            <strong>kein Geschäftsführergehalt:</strong> Ein GF-Gehalt mindert als Betriebsausgabe den
            GmbH-Gewinn und wird separat als Arbeitslohn versteuert – das kann die GmbH deutlich
            günstiger machen und ist hier nicht abgebildet.
          </li>
          <li><strong>keine Kirchensteuer</strong> und kein individueller Sparer-Pauschbetrag.</li>
          <li>
            <strong>keine Vorsorgeaufwendungen / Sozialversicherung</strong> – beim Einzelunternehmen
            ist das zvE vereinfacht gleich dem Gewinn gesetzt (keine Sonderausgaben).
          </li>
          <li>
            <strong>keine gewerbesteuerlichen Hinzurechnungen/Kürzungen</strong> (§ 8, § 9 GewStG) und
            keine Verlustvorträge.
          </li>
          <li>
            Beim Einzelunternehmen wird der Splittingtarif nicht berücksichtigt (Grundtarif,
            Einzelveranlagung).
          </li>
        </ul>
        <p className="text-sm text-amber-700 mt-3">
          Für eine verbindliche, auf Ihre Situation zugeschnittene Entscheidung wenden Sie sich an einen
          Steuerberater.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen &amp; Rechtsgrundlagen (Stand: 2026)</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/estg/__32a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 32a EStG – Einkommensteuertarif (Grundtarif 2026)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/estg/__35.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 35 EStG – Anrechnung der Gewerbesteuer (4,0 × Messbetrag)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/gewstg/__11.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 11 GewStG – Steuermesszahl &amp; Freibetrag 24.500 €
          </a>
          <a
            href="https://www.gesetze-im-internet.de/kstg_1977/__23.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 23 KStG – Körperschaftsteuersatz (15 %)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/estg/__32d.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 32d EStG – Abgeltungsteuer (25 %) auf Kapitalerträge
          </a>
          <a
            href="https://www.gesetze-im-internet.de/solzg_1995/__4.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 4 SolZG – Solidaritätszuschlag (5,5 %)
          </a>
        </div>
      </div>
    </div>
  );
}

export default GmbhVsEinzelunternehmenRechner;
