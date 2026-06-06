import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Vermessungskosten-Schaetzmodell, Stand Juni 2026
// ------------------------------------------------------------------
// WICHTIG: Vermessungsgebuehren sind in Deutschland gesetzlich geregelt und
// je BUNDESLAND unterschiedlich (eigene Vermessungsgebuehrenordnung pro Land).
// Eine bundesweit einheitliche verbindliche Zahl existiert NICHT. Dieses Modell
// liefert ausschliesslich eine UNVERBINDLICHE Orientierungsschaetzung mit Spanne.
// Grundlage: repraesentative degressive Staffeltarife in Anlehnung an die
// Vermessungsgebuehrenordnungen (z. B. NRW VermWertKostO, Brandenburg VermGebO)
// sowie die Gebuehrenrechner der Landesvermessungsaemter SH/Bayern.

type ArtKey = 'gebaeude' | 'lageplan' | 'grenz' | 'teilung';

type VermessungsArt = {
  key: ArtKey;
  name: string;
  icon: string;
  // basiert auf Bauwert (Gebaeude/Lageplan) oder Bodenwert (Grenz/Teilung)
  basis: 'bauwert' | 'bodenwert';
  hinweis: string;
};

const ARTEN: VermessungsArt[] = [
  {
    key: 'gebaeude',
    name: 'Gebäudeeinmessung',
    icon: '🏠',
    basis: 'bauwert',
    hinweis: 'Pflicht-Einmessung eines neuen Gebäudes für das Liegenschaftskataster.',
  },
  {
    key: 'lageplan',
    name: 'Amtlicher Lageplan',
    icon: '📐',
    basis: 'bauwert',
    hinweis: 'Lageplan zum Bauantrag (objektbezogen, auf Basis der Baukosten).',
  },
  {
    key: 'grenz',
    name: 'Grenzvermessung',
    icon: '📍',
    basis: 'bodenwert',
    hinweis: 'Grenzfeststellung / Abmarkung vorhandener Flurstücksgrenzen.',
  },
  {
    key: 'teilung',
    name: 'Teilungsvermessung',
    icon: '✂️',
    basis: 'bodenwert',
    hinweis: 'Zerlegung eines Grundstücks in zwei oder mehr neue Flurstücke.',
  },
];

// ------------------------------------------------------------------
// Bauwert-Staffel (degressiv), repraesentativ in Anlehnung an die
// Kostentarife fuer Gebaeudeeinmessung. Grundbetrag + wertabhaengiger
// Anteil. Werte als Orientierung, Stand Juni 2026.
// Stuetzpunkte (Gebaeudeeinmessung):
//   bis  10.000 EUR  -> ~405 EUR
//   bis 150.000 EUR  -> ~990 EUR
//   bis 250.000 EUR  -> ~1.445 EUR
//   darueber: + ca. 0,5 % des Mehrbetrags, degressiv
// ------------------------------------------------------------------
function gebuehrAusBauwert(bauwert: number): number {
  const w = Math.max(0, bauwert);
  if (w <= 10000) {
    // unterer Sockel: 250 EUR Grundbetrag + linear bis 405 EUR bei 10.000 EUR
    return 250 + (155 / 10000) * w;
  }
  if (w <= 150000) {
    // 405 EUR bei 10.000 EUR, linear bis 990 EUR bei 150.000 EUR
    return 405 + ((990 - 405) / (150000 - 10000)) * (w - 10000);
  }
  if (w <= 250000) {
    // 990 EUR bei 150.000 EUR, linear bis 1.445 EUR bei 250.000 EUR
    return 990 + ((1445 - 990) / (250000 - 150000)) * (w - 150000);
  }
  // ueber 250.000 EUR: 1.445 EUR + 0,5 % des Mehrbetrags (degressiver Aufschlag)
  return 1445 + 0.005 * (w - 250000);
}

// Lageplan etwas guenstiger als die vollwertige Gebaeudeeinmessung (~80 %).
function gebuehrLageplan(bauwert: number): number {
  return 0.8 * gebuehrAusBauwert(bauwert);
}

// ------------------------------------------------------------------
// Bodenwert-Staffel Grenzvermessung (Bodenwert = Bodenrichtwert EUR/m2 x Flaeche).
// Stuetzpunkte (inkl. 4 Grenzpunkte):
//   Bodenwert bis    50.000 EUR -> ~714 EUR
//   Bodenwert bis   300.000 EUR -> ~1.047 EUR
//   Bodenwert bis 1.000.000 EUR -> ~1.332 EUR
//   darueber: + ca. 0,1 % des Mehrbetrags (degressiv)
// Je Grenzpunkt ueber 4 ein Aufschlag.
// ------------------------------------------------------------------
function gebuehrAusBodenwert(bodenwert: number): number {
  const w = Math.max(0, bodenwert);
  if (w <= 50000) {
    // Sockel 600 EUR, linear bis 714 EUR bei 50.000 EUR
    return 600 + ((714 - 600) / 50000) * w;
  }
  if (w <= 300000) {
    return 714 + ((1047 - 714) / (300000 - 50000)) * (w - 50000);
  }
  if (w <= 1000000) {
    return 1047 + ((1332 - 1047) / (1000000 - 300000)) * (w - 300000);
  }
  return 1332 + 0.001 * (w - 1000000);
}

const GRUNDPUNKTE = 4; // in der Grundgebuehr enthaltene Grenzpunkte
const PUNKT_AUFSCHLAG = 95; // EUR je weiterem Grenzpunkt (Richtwert)

export function VermessungskostenRechner() {
  const [art, setArt] = useState<ArtKey>('gebaeude');

  // Bauwert-Pfad
  const [bauwert, setBauwert] = useState(300000);

  // Bodenwert-Pfad
  const [bodenrichtwert, setBodenrichtwert] = useState(350); // EUR/m2
  const [flaeche, setFlaeche] = useState(600); // m2
  const [grenzpunkte, setGrenzpunkte] = useState(4);

  // USt-Schalter: OebVI (19 %) vs. Landesamt (umsatzsteuerfrei)
  const [mitUst, setMitUst] = useState(true);

  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const aktuelleArt = ARTEN.find((a) => a.key === art)!;
  const istBauwert = aktuelleArt.basis === 'bauwert';

  // Netto-Grundgebuehr je nach Art
  let nettoGrund = 0;
  if (art === 'gebaeude') {
    nettoGrund = gebuehrAusBauwert(bauwert);
  } else if (art === 'lageplan') {
    nettoGrund = gebuehrLageplan(bauwert);
  } else if (art === 'grenz') {
    nettoGrund = gebuehrAusBodenwert(bodenrichtwert * flaeche);
  } else {
    // Teilungsvermessung: hoeherer Aufwand als reine Grenzvermessung (Faktor ~1,9)
    nettoGrund = gebuehrAusBodenwert(bodenrichtwert * flaeche) * 1.9;
  }

  // Aufschlag fuer zusaetzliche Grenzpunkte (nur Bodenwert-Pfad)
  const zusatzPunkte = istBauwert ? 0 : Math.max(0, grenzpunkte - GRUNDPUNKTE);
  const punktKosten = zusatzPunkte * PUNKT_AUFSCHLAG;

  const netto = nettoGrund + punktKosten;

  // Umsatzsteuer: OebVI 19 %, Landesamt steuerfrei
  const ustSatz = mitUst ? 0.19 : 0;
  const ust = netto * ustSatz;
  const brutto = netto + ust;

  // Orientierungsspanne -15 % / +25 %
  const spanneUnten = brutto * 0.85;
  const spanneOben = brutto * 1.25;

  const bodenwertGesamt = bodenrichtwert * flaeche;

  const formatEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatEuro2 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatZahl = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Vermessungskosten-Rechner" rechnerSlug="vermessungskosten-rechner" />

      {/* Vermessungsart waehlen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Vermessungsart auswählen</span>
        <div className="grid grid-cols-2 gap-2">
          {ARTEN.map((a) => (
            <button
              key={a.key}
              onClick={() => setArt(a.key)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                art === a.key
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{a.icon}</span>
              <span className="text-center leading-tight">{a.name}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">{aktuelleArt.hinweis}</p>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        {istBauwert ? (
          <label className="block">
            <span className="text-gray-700 font-medium">Bauwert / Baukosten des Gebäudes</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={1000}
                value={bauwert}
                onChange={(e) => setBauwert(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">
              Reine Baukosten ohne Grundstück (Bauwert laut Bauantrag / Kostenaufstellung).
            </span>
          </label>
        ) : (
          <>
            <label className="block">
              <span className="text-gray-700 font-medium">Bodenrichtwert</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={1}
                  value={bodenrichtwert}
                  onChange={(e) => setBodenrichtwert(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/m²</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                Aus dem Bodenrichtwert­portal Ihres Bundeslands (BORIS).
              </span>
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">Grundstücksgröße</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={10}
                  value={flaeche}
                  onChange={(e) => setFlaeche(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
              </div>
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">Anzahl Grenzpunkte</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={grenzpunkte}
                  onChange={(e) => setGrenzpunkte(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Punkte</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                {GRUNDPUNKTE} Grenzpunkte sind in der Grundgebühr enthalten, je weiterer Punkt ca.{' '}
                {PUNKT_AUFSCHLAG} € netto.
              </span>
            </label>
          </>
        )}

        {/* USt-Schalter */}
        <div className="border-t border-gray-100 pt-4">
          <span className="text-gray-700 font-medium block mb-2">Wer vermisst?</span>
          <div className="grid grid-cols-1 gap-2">
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50">
              <input
                type="radio"
                name="ust"
                checked={mitUst}
                onChange={() => setMitUst(true)}
                className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                <strong>Öffentlich bestellter Vermessungsingenieur (ÖbVI)</strong> – zzgl. 19 % USt
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50">
              <input
                type="radio"
                name="ust"
                checked={!mitUst}
                onChange={() => setMitUst(false)}
                className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                <strong>Landesvermessungsamt / Katasteramt</strong> – umsatzsteuerfrei (hoheitlich)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Geschätzte Vermessungskosten ({aktuelleArt.name})</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatEuro(brutto)}</span>
            <span className="text-xl text-blue-200">€ {mitUst ? 'brutto' : '(USt-frei)'}</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            Orientierungsspanne {formatEuro(spanneUnten)} – {formatEuro(spanneOben)} €
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Gebühr (netto)</span>
              <span className="text-xl font-bold">{formatEuro2(netto)} €</span>
            </div>
          </div>

          {mitUst && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">zzgl. 19 % Umsatzsteuer</span>
                <span className="font-bold">{formatEuro2(ust)} €</span>
              </div>
            </div>
          )}

          {!istBauwert && zusatzPunkte > 0 && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">davon {zusatzPunkte} zusätzliche Grenzpunkte</span>
                <span className="font-bold">{formatEuro2(punktKosten)} €</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          {istBauwert ? (
            <p>
              <strong>Bemessungsgrundlage</strong> = Bauwert {formatEuro(bauwert)} €
            </p>
          ) : (
            <p>
              <strong>Bodenwert</strong> = Bodenrichtwert × Fläche = {formatZahl(bodenrichtwert)} €/m² ×{' '}
              {formatZahl(flaeche)} m² = <strong>{formatEuro(bodenwertGesamt)} €</strong>
            </p>
          )}
          <p>
            <strong>Grundgebühr (netto)</strong> nach degressiver Staffel ={' '}
            <strong>{formatEuro2(nettoGrund)} €</strong>
          </p>
          {!istBauwert && zusatzPunkte > 0 && (
            <p>
              <strong>+ Grenzpunkte</strong> = {zusatzPunkte} × {PUNKT_AUFSCHLAG} € ={' '}
              {formatEuro2(punktKosten)} €
            </p>
          )}
          <p>
            <strong>Netto gesamt</strong> = {formatEuro2(netto)} €{' '}
            {mitUst ? (
              <>
                × 1,19 = <strong>{formatEuro2(brutto)} € brutto</strong>
              </>
            ) : (
              <>
                (umsatzsteuerfrei) = <strong>{formatEuro2(brutto)} €</strong>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Wichtiger Hinweis:</strong> Vermessungsgebühren sind gesetzlich geregelt und je{' '}
          <strong>Bundesland unterschiedlich</strong> – jedes Land hat eine eigene
          Vermessungsgebührenordnung. Eine bundesweit einheitliche, verbindliche Zahl existiert
          nicht. Dieser Rechner liefert nur eine <strong>unverbindliche Orientierungsschätzung</strong>.
          Die verbindliche Gebühr ermittelt der ÖbVI bzw. das Landesamt für Ihr Bundesland. Tarife
          ändern sich (zuletzt z. B. Brandenburg Ende 2025). Keine Rechtsberatung – Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default VermessungskostenRechner;
