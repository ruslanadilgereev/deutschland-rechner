import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Verzugszinsen nach § 288 BGB
// Basiszinssatz der Deutschen Bundesbank (§ 247 BGB): 1,27 % – Stand 1. Januar 2026 (unverändert seit 1. Juli 2025)
// Quelle: https://www.bundesbank.de/de/bundesbank/organisation/agb-und-regelungen/basiszinssatz-607820
const BASISZINSSATZ = 1.27; // % p. a.
const ZUSCHLAG_VERBRAUCHER = 5; // Prozentpunkte (§ 288 Abs. 1 BGB)
const ZUSCHLAG_B2B = 9; // Prozentpunkte (§ 288 Abs. 2 BGB)
const MAHNPAUSCHALE_B2B = 40; // € (§ 288 Abs. 5 BGB)

type Modus = 'verbraucher' | 'b2b';

function parseDe(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/\./g, '').replace(',', '.').replace(/[^0-9.]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function tageZwischen(startISO: string, endISO: string): number {
  if (!startISO || !endISO) return 0;
  const start = new Date(startISO + 'T00:00:00');
  const end = new Date(endISO + 'T00:00:00');
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

const eur = (n: number) =>
  n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function VerzugszinsenRechner() {
  const [betragStr, setBetragStr] = useState('1000');
  const [modus, setModus] = useState<Modus>('verbraucher');

  // Tage entweder per Datum oder direkt eingeben
  const [tageManuell, setTageManuell] = useState(true);
  const [tageStr, setTageStr] = useState('30');
  const [start, setStart] = useState('');
  const [ende, setEnde] = useState('');

  const betrag = parseDe(betragStr);
  const tage = tageManuell
    ? Math.max(0, Math.round(parseDe(tageStr)))
    : tageZwischen(start, ende);

  const zuschlag = modus === 'verbraucher' ? ZUSCHLAG_VERBRAUCHER : ZUSCHLAG_B2B;
  const verzugszinssatz = BASISZINSSATZ + zuschlag; // % p. a.

  // Taggenaue Berechnung: Betrag × Zinssatz × Tage ÷ 365
  const zinsen = (betrag * (verzugszinssatz / 100) * tage) / 365;
  const pauschale = modus === 'b2b' ? MAHNPAUSCHALE_B2B : 0;
  const gesamtforderung = betrag + zinsen + pauschale;

  const eingabeOk = betrag > 0 && tage > 0;

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Verzugszinsen-Rechner" rechnerSlug="verzugszinsen-rechner" />

      {/* Eingabe */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        {/* Forderungsbetrag */}
        <label className="block">
          <span className="text-gray-700 font-medium">Offene Forderung</span>
          <div className="mt-2 relative">
            <input
              type="text"
              inputMode="decimal"
              value={betragStr}
              onChange={(e) => setBetragStr(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="z. B. 1.000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </label>

        {/* Verbraucher / B2B */}
        <div>
          <span className="text-gray-700 font-medium">Wer schuldet das Geld?</span>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setModus('verbraucher')}
              className={`rounded-xl border px-4 py-3 text-left transition-all ${
                modus === 'verbraucher'
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="block font-semibold text-gray-800">Verbraucher</span>
              <span className="block text-xs text-gray-500">Basiszins + 5 Punkte · § 288 I BGB</span>
            </button>
            <button
              type="button"
              onClick={() => setModus('b2b')}
              className={`rounded-xl border px-4 py-3 text-left transition-all ${
                modus === 'b2b'
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="block font-semibold text-gray-800">Unternehmen (B2B)</span>
              <span className="block text-xs text-gray-500">Basiszins + 9 Punkte · § 288 II BGB</span>
            </button>
          </div>
        </div>

        {/* Zeitraum: Tage oder Datum */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 font-medium">Dauer des Verzugs</span>
            <div className="inline-flex rounded-lg bg-gray-100 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setTageManuell(true)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  tageManuell ? 'bg-white shadow text-gray-800 font-medium' : 'text-gray-500'
                }`}
              >
                Tage
              </button>
              <button
                type="button"
                onClick={() => setTageManuell(false)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  !tageManuell ? 'bg-white shadow text-gray-800 font-medium' : 'text-gray-500'
                }`}
              >
                Datum
              </button>
            </div>
          </div>

          {tageManuell ? (
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={tageStr}
                onChange={(e) => setTageStr(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-16 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="z. B. 30"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Tage</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs text-gray-500">Verzugsbeginn</span>
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs text-gray-500">Verzugsende / Zahlung</span>
                <input
                  type="date"
                  value={ende}
                  onChange={(e) => setEnde(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </label>
            </div>
          )}
          {!tageManuell && start && ende && tage === 0 && (
            <p className="mt-2 text-xs text-red-600">
              Das Enddatum muss nach dem Verzugsbeginn liegen.
            </p>
          )}
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Ihre Verzugszinsen</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{eingabeOk ? eur(zinsen) : '0,00'}</span>
            <span className="text-xl text-blue-200">€</span>
          </div>
          <p className="text-blue-100 text-sm mt-1">
            für {tage.toLocaleString('de-DE')} {tage === 1 ? 'Tag' : 'Tage'} Verzug
          </p>
        </div>

        <div className="space-y-2">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Verzugszinssatz</span>
              <span className="font-bold">
                {verzugszinssatz.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} % p. a.
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-blue-200 mt-1">
              <span>Basiszins {BASISZINSSATZ.toLocaleString('de-DE')} % + {zuschlag} Punkte</span>
              <span>§ 288 {modus === 'verbraucher' ? 'Abs. 1' : 'Abs. 2'} BGB</span>
            </div>
          </div>

          {modus === 'b2b' && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">+ Mahnpauschale</span>
                <span className="font-bold">{eur(pauschale)} €</span>
              </div>
              <p className="text-xs text-blue-200 mt-1">§ 288 Abs. 5 BGB – nur wenn der Schuldner kein Verbraucher ist</p>
            </div>
          )}

          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Gesamtforderung</span>
              <span className="text-xl font-bold">{eingabeOk ? eur(gesamtforderung) : eur(betrag)} €</span>
            </div>
            <p className="text-xs text-blue-200 mt-1">Forderung + Zinsen{modus === 'b2b' ? ' + Pauschale' : ''}</p>
          </div>
        </div>
      </div>

      {/* So funktioniert's */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert&apos;s</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Basiszinssatz {BASISZINSSATZ.toLocaleString('de-DE')} %</strong> (Deutsche Bundesbank, Stand 1. Januar 2026, halbjährliche Anpassung nach § 247 BGB)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Verbraucher:</strong> Basiszins + 5 Prozentpunkte = {(BASISZINSSATZ + 5).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} % (§ 288 Abs. 1 BGB)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Geschäftskunden (B2B):</strong> Basiszins + 9 Prozentpunkte = {(BASISZINSSATZ + 9).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} % (§ 288 Abs. 2 BGB)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Formel:</strong> Forderung × Zinssatz × Verzugstage ÷ 365
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Im B2B kommt eine <strong>Mahnpauschale von 40 €</strong> hinzu (§ 288 Abs. 5 BGB)</span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
        <div className="flex gap-3">
          <span className="text-xl">⚠️</span>
          <p className="text-sm text-yellow-800">
            <strong>Hinweis:</strong> Diese Berechnung erfolgt ohne Gewähr und ersetzt keine Rechts- oder
            Steuerberatung. Der Verzugszins gilt für <strong>Entgeltforderungen</strong>; vertraglich oder per Gesetz
            können abweichende Zinssätze gelten. Ob und ab wann tatsächlich Verzug eingetreten ist, hängt vom Einzelfall ab
            (Mahnung, Fälligkeit, 30-Tage-Regel nach § 286 Abs. 3 BGB).
          </p>
        </div>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.bundesbank.de/de/bundesbank/organisation/agb-und-regelungen/basiszinssatz-607820"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsche Bundesbank – Basiszinssatz nach § 247 BGB
          </a>
          <a
            href="https://www.gesetze-im-internet.de/bgb/__288.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 288 BGB – Verzugszinsen und sonstiger Verzugsschaden
          </a>
        </div>
      </div>
    </div>
  );
}

export default VerzugszinsenRechner;
