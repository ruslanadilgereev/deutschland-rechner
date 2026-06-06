import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Default-Kostenkomponenten (alle netto, Stand Juni 2026).
// Quellen: Marktrecherche zu Baugrundgutachten / geotechnischen Untersuchungen
// nach DIN 4020 / DIN EN 1997-2 (Eurocode 7). Werte sind Richtwerte – die
// tatsaechlichen Kosten haengen vom Baugrundgutachter, der Region und dem
// Untersuchungsumfang ab.
const GRUNDPAUSCHALE_DEFAULT = 300; // Anfahrt + Vorbereitung, EUR
const KOSTEN_PRO_BOHRUNG_DEFAULT = 250; // EUR je Bohrung/Sondierung (Basis bis 6 m)
const LABOR_DEFAULT = 350; // Laboranalyse der Bodenproben, EUR
const BERICHT_DEFAULT = 450; // geotechnischer Bericht / Auswertung, EUR

// Geotechnische Kategorie nach DIN 4020 / Eurocode 7 (DIN EN 1997-2).
// GK1 = einfacher Baugrund (Basis), GK2 = mittlere Verhaeltnisse (+30 %),
// GK3 = schwierige Baugrundverhaeltnisse / Altlastverdacht (+75 %).
type GkOption = { id: 'gk1' | 'gk2' | 'gk3'; label: string; faktor: number };
const GK_OPTIONEN: GkOption[] = [
  { id: 'gk1', label: 'GK1 – einfach', faktor: 1.0 },
  { id: 'gk2', label: 'GK2 – mittel', faktor: 1.3 },
  { id: 'gk3', label: 'GK3 – schwierig', faktor: 1.75 },
];

const KELLER_FAKTOR = 1.18; // Unterkellerung statt Bodenplatte: +18 %
const BALLUNGSRAUM_FAKTOR = 1.15; // Ballungsraum vs. laendlich: +15 %

export function BodengutachtenKostenRechner() {
  const [grundpauschale, setGrundpauschale] = useState(GRUNDPAUSCHALE_DEFAULT);
  const [anzahlBohrungen, setAnzahlBohrungen] = useState(3);
  const [kostenProBohrung, setKostenProBohrung] = useState(KOSTEN_PRO_BOHRUNG_DEFAULT);
  const [bohrtiefe, setBohrtiefe] = useState(6);
  const [mitLabor, setMitLabor] = useState(true);
  const [laborKosten, setLaborKosten] = useState(LABOR_DEFAULT);
  const [berichtKosten, setBerichtKosten] = useState(BERICHT_DEFAULT);
  const [unterkellert, setUnterkellert] = useState(false);
  const [gk, setGk] = useState<GkOption['id']>('gk1');
  const [ballungsraum, setBallungsraum] = useState(false);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  // Tiefen-Faktor: bis 6 m = Basis (1,0); je weitere angefangene 2 m + 20 %.
  const tiefenFaktor = 1 + Math.max(0, Math.ceil((bohrtiefe - 6) / 2)) * 0.2;

  const bohrkosten = anzahlBohrungen * kostenProBohrung * tiefenFaktor;
  const labor = mitLabor ? laborKosten : 0;
  const zwischensumme = grundpauschale + bohrkosten + labor + berichtKosten;

  const gkFaktor = GK_OPTIONEN.find((o) => o.id === gk)?.faktor ?? 1.0;
  const kellerFaktor = unterkellert ? KELLER_FAKTOR : 1.0;
  const lageFaktor = ballungsraum ? BALLUNGSRAUM_FAKTOR : 1.0;

  const gesamt = zwischensumme * kellerFaktor * gkFaktor * lageFaktor;
  const spanneVon = gesamt * 0.8;
  const spanneBis = gesamt * 1.2;

  // Aufschlag durch die Multiplikatoren (Differenz zur Zwischensumme)
  const zuschlaege = gesamt - zwischensumme;

  const formatEuro = (v: number) =>
    Math.round(v).toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatFaktor = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  const gkLabelKurz = gk === 'gk1' ? 'GK1' : gk === 'gk2' ? 'GK2' : 'GK3';

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Bodengutachten-Rechner (Baugrundgutachten Kosten)" rechnerSlug="bodengutachten-kosten-rechner" />

      {/* Kostenkomponenten */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Grundpauschale (Anfahrt + Vorbereitung)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={grundpauschale}
              onChange={(e) => setGrundpauschale(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">Richtwert 250–400 € netto.</span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Anzahl Bohrungen / Sondierungen</span>
          <div className="mt-2 flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={8}
              step={1}
              value={anzahlBohrungen}
              onChange={(e) => setAnzahlBohrungen(toNumber(e.target.value))}
              className="flex-1 accent-blue-600"
            />
            <span className="w-10 text-right text-lg font-semibold text-gray-800">{anzahlBohrungen}</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Einfamilienhaus typisch 2–4 Bohrungen (je Gebäudeecke eine).
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Kosten je Bohrung (Basis bis 6 m)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={kostenProBohrung}
              onChange={(e) => setKostenProBohrung(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">Richtwert 150–400 € je Bohrung, abhängig von Verfahren und Tiefe.</span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Bohrtiefe</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={bohrtiefe}
              onChange={(e) => setBohrtiefe(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Bis 6 m = Basis. Je weitere angefangene 2 m + 20 % auf die Bohrkosten (aktuell Faktor {formatFaktor(tiefenFaktor)}).
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Geotechnischer Bericht / Auswertung</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={berichtKosten}
              onChange={(e) => setBerichtKosten(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">Richtwert 300–700 € netto.</span>
        </label>

        {/* Laboranalyse */}
        <div className="border-t border-gray-100 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={mitLabor}
              onChange={(e) => setMitLabor(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Laboranalyse der Bodenproben</span>
          </label>
          {mitLabor && (
            <label className="block mt-3">
              <span className="text-sm text-gray-600">Kosten Laboranalyse</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={laborKosten}
                  onChange={(e) => setLaborKosten(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">Richtwert 200–600 € netto.</span>
            </label>
          )}
        </div>
      </div>

      {/* Zuschlaege */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <div>
          <span className="text-gray-700 font-medium block mb-3">Geotechnische Kategorie (DIN 4020)</span>
          <div className="grid grid-cols-3 gap-2">
            {GK_OPTIONEN.map((o) => (
              <button
                key={o.id}
                onClick={() => setGk(o.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                  gk === o.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-center leading-tight">{o.label}</span>
                <span className="text-[11px] text-gray-400">
                  {o.faktor === 1 ? 'Basis' : `+${Math.round((o.faktor - 1) * 100)} %`}
                </span>
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400 mt-2 block">
            GK1 = einfacher, gut bekannter Baugrund · GK3 = schwierige Verhältnisse, Altlast- oder Grundwasserverdacht.
          </span>
        </div>

        <label className="flex items-center gap-3 cursor-pointer border-t border-gray-100 pt-4">
          <input
            type="checkbox"
            checked={unterkellert}
            onChange={(e) => setUnterkellert(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-700 font-medium">Mit Keller (statt Bodenplatte) <span className="text-gray-400 font-normal text-sm">+18 %</span></span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={ballungsraum}
            onChange={(e) => setBallungsraum(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-700 font-medium">Ballungsraum (z. B. München, Hamburg) <span className="text-gray-400 font-normal text-sm">+15 %</span></span>
        </label>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Geschätzte Kosten Bodengutachten (netto)</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-4xl font-bold">{formatEuro(spanneVon)}</span>
            <span className="text-2xl font-bold text-blue-200">–</span>
            <span className="text-4xl font-bold">{formatEuro(spanneBis)}</span>
            <span className="text-xl text-blue-200">€</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            Punktschätzung ca. {formatEuro(gesamt)} € netto (± 20 %)
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-blue-100">Grundpauschale</span><span className="font-bold">{formatEuro(grundpauschale)} €</span></div>
            <div className="flex justify-between"><span className="text-blue-100">{anzahlBohrungen} Bohrung(en){tiefenFaktor > 1 ? ` × Faktor ${formatFaktor(tiefenFaktor)}` : ''}</span><span className="font-bold">{formatEuro(bohrkosten)} €</span></div>
            {mitLabor && (
              <div className="flex justify-between"><span className="text-blue-100">Laboranalyse</span><span className="font-bold">{formatEuro(labor)} €</span></div>
            )}
            <div className="flex justify-between"><span className="text-blue-100">Geotechnischer Bericht</span><span className="font-bold">{formatEuro(berichtKosten)} €</span></div>
            <div className="flex justify-between border-t border-white/20 pt-2"><span className="text-blue-100">Zwischensumme</span><span className="font-bold">{formatEuro(zwischensumme)} €</span></div>
            {zuschlaege > 0.5 && (
              <div className="flex justify-between"><span className="text-blue-100">Zuschläge ({gkLabelKurz}{unterkellert ? ', Keller' : ''}{ballungsraum ? ', Ballungsraum' : ''})</span><span className="font-bold">+{formatEuro(zuschlaege)} €</span></div>
            )}
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Zwischensumme</strong> = Grundpauschale + (Anzahl × Kosten/Bohrung × Tiefen-Faktor) + Labor + Bericht
          </p>
          <p>
            = {formatEuro(grundpauschale)} + ({anzahlBohrungen} × {formatEuro(kostenProBohrung)} × {formatFaktor(tiefenFaktor)}) + {formatEuro(labor)} + {formatEuro(berichtKosten)} ={' '}
            <strong>{formatEuro(zwischensumme)} €</strong>
          </p>
          <p>
            <strong>Gesamt</strong> = Zwischensumme × Keller ({formatFaktor(kellerFaktor)}) × {gkLabelKurz} ({formatFaktor(gkFaktor)}) × Lage ({formatFaktor(lageFaktor)})
          </p>
          <p>
            = {formatEuro(zwischensumme)} × {formatFaktor(kellerFaktor)} × {formatFaktor(gkFaktor)} × {formatFaktor(lageFaktor)} ={' '}
            <strong>{formatEuro(gesamt)} €</strong> (± 20 % → {formatEuro(spanneVon)}–{formatEuro(spanneBis)} €)
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Wichtiger Hinweis:</strong> Dieser Rechner liefert nur unverbindliche Kosten-Richtwerte und{' '}
          <strong>kein verbindliches Angebot und keinen geotechnischen Bericht</strong>. Das tatsächliche
          Bodengutachten muss durch einen qualifizierten Baugrundgutachter bzw. Sachverständigen für Geotechnik
          nach DIN 4020 / DIN EN 1997-2 (Eurocode 7) erstellt werden. Ein Baugrundgutachten kann
          bauordnungsrechtlich (geotechnischer Bericht) gefordert sein. Alle Angaben ohne Gewähr – keine
          Bau- oder Rechtsberatung.
        </p>
      </div>
    </div>
  );
}

export default BodengutachtenKostenRechner;
