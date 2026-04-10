import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Verpflegungspauschalen 2025/2026 (Inland)
// Quelle: § 9 Abs. 4a EStG, BMF-Schreiben
// Die Pauschalen betragen seit 2020 unverändert 28€/14€
// Die geplante Erhöhung auf 32€/16€ wurde nie umgesetzt
const PAUSCHALEN_INLAND = {
  ab24Stunden: 28, // Abwesenheit von 24 Stunden
  mehr8bisUnter24: 14, // Mehr als 8 Stunden, aber weniger als 24
  anUndAbreise: 14, // An- und Abreisetag bei mehrtägiger Reise
};

// Auslandspauschalen 2025/2026 (Auszug der wichtigsten Länder)
// Quelle: BMF-Schreiben zu Auslandsreisekosten
const PAUSCHALEN_AUSLAND: Record<string, { land: string; ab24: number; mehr8: number }> = {
  AT: { land: 'Österreich', ab24: 50, mehr8: 25 },
  BE: { land: 'Belgien', ab24: 59, mehr8: 30 },
  CH: { land: 'Schweiz', ab24: 77, mehr8: 39 },
  CZ: { land: 'Tschechien', ab24: 35, mehr8: 18 },
  DK: { land: 'Dänemark', ab24: 75, mehr8: 38 },
  ES: { land: 'Spanien', ab24: 44, mehr8: 22 },
  FR: { land: 'Frankreich', ab24: 58, mehr8: 29 },
  GB: { land: 'Großbritannien (London)', ab24: 66, mehr8: 33 },
  GR: { land: 'Griechenland', ab24: 40, mehr8: 20 },
  IT: { land: 'Italien', ab24: 52, mehr8: 26 },
  NL: { land: 'Niederlande', ab24: 53, mehr8: 27 },
  PL: { land: 'Polen', ab24: 36, mehr8: 18 },
  PT: { land: 'Portugal', ab24: 38, mehr8: 19 },
  SE: { land: 'Schweden', ab24: 61, mehr8: 31 },
  US: { land: 'USA (New York)', ab24: 66, mehr8: 33 },
  CN: { land: 'China (Peking)', ab24: 51, mehr8: 26 },
  JP: { land: 'Japan (Tokio)', ab24: 62, mehr8: 31 },
  AE: { land: 'VAE (Dubai)', ab24: 56, mehr8: 28 },
  TR: { land: 'Türkei', ab24: 39, mehr8: 20 },
  XX: { land: 'Sonstige Länder', ab24: 39, mehr8: 20 },
};

// Übernachtungspauschalen (pauschal, ohne Nachweis)
const UEBERNACHTUNGSPAUSCHALE_INLAND = 20; // €/Nacht (nur für Arbeitnehmer mit Nachweis höher)

// Kürzungen bei Mahlzeiten
const KUERZUNG = {
  fruehstueck: 0.20, // 20% der vollen Pauschale
  mittag: 0.40, // 40%
  abend: 0.40, // 40%
};

interface Reisetag {
  id: number;
  datum: string;
  typ: 'anreise' | 'vollertag' | 'abreise' | 'eintag';
  abwesenheitStunden: number;
  fruehstueck: boolean;
  mittagessen: boolean;
  abendessen: boolean;
}

export default function VerpflegungsmehraufwandRechner() {
  const [reiseart, setReiseart] = useState<'inland' | 'ausland'>('inland');
  const [zielland, setZielland] = useState('AT');
  const [reisedauer, setReisedauer] = useState<'eintag' | 'mehrtag'>('mehrtag');
  const [anzahlVollerTage, setAnzahlVollerTage] = useState(2);
  const [abwesenheitEintag, setAbwesenheitEintag] = useState(10);
  
  // Mahlzeiten die vom Arbeitgeber gestellt werden
  const [fruehstueckAnreise, setFruehstueckAnreise] = useState(false);
  const [mittagAnreise, setMittagAnreise] = useState(false);
  const [abendAnreise, setAbendAnreise] = useState(false);
  const [fruehstueckVoll, setFruehstueckVoll] = useState(false);
  const [mittagVoll, setMittagVoll] = useState(false);
  const [abendVoll, setAbendVoll] = useState(false);
  const [fruehstueckAbreise, setFruehstueckAbreise] = useState(false);
  const [mittagAbreise, setMittagAbreise] = useState(false);
  const [abendAbreise, setAbendAbreise] = useState(false);
  
  const [anzahlUebernachtungen, setAnzahlUebernachtungen] = useState(2);
  const [eigeneUebernachtung, setEigeneUebernachtung] = useState(false);

  const ergebnis = useMemo(() => {
    // Pauschalen bestimmen
    let pauschale24 = PAUSCHALEN_INLAND.ab24Stunden;
    let pauschale8 = PAUSCHALEN_INLAND.mehr8bisUnter24;
    let pauschaleAnAb = PAUSCHALEN_INLAND.anUndAbreise;
    
    if (reiseart === 'ausland') {
      const land = PAUSCHALEN_AUSLAND[zielland] || PAUSCHALEN_AUSLAND.XX;
      pauschale24 = land.ab24;
      pauschale8 = land.mehr8;
      pauschaleAnAb = land.mehr8; // An/Abreise = halbe Pauschale
    }

    let verpflegungGesamt = 0;
    let verpflegungDetails: Array<{
      tag: string;
      brutto: number;
      kuerzungen: number;
      netto: number;
    }> = [];

    if (reisedauer === 'eintag') {
      // Eintägige Reise ohne Übernachtung
      if (abwesenheitEintag > 8) {
        const brutto = pauschale8;
        let kuerzungen = 0;
        
        // Kürzungen für gestellte Mahlzeiten
        if (fruehstueckAnreise) kuerzungen += pauschale24 * KUERZUNG.fruehstueck;
        if (mittagAnreise) kuerzungen += pauschale24 * KUERZUNG.mittag;
        if (abendAnreise) kuerzungen += pauschale24 * KUERZUNG.abend;
        
        const netto = Math.max(0, brutto - kuerzungen);
        verpflegungGesamt = netto;
        verpflegungDetails.push({
          tag: `Eintägige Reise (${abwesenheitEintag}h)`,
          brutto,
          kuerzungen: Math.round(kuerzungen * 100) / 100,
          netto: Math.round(netto * 100) / 100,
        });
      } else {
        verpflegungDetails.push({
          tag: `Eintägige Reise (${abwesenheitEintag}h)`,
          brutto: 0,
          kuerzungen: 0,
          netto: 0,
        });
      }
    } else {
      // Mehrtägige Reise mit Übernachtung
      
      // Anreisetag
      let bruttoAnreise = pauschaleAnAb;
      let kuerzungAnreise = 0;
      if (fruehstueckAnreise) kuerzungAnreise += pauschale24 * KUERZUNG.fruehstueck;
      if (mittagAnreise) kuerzungAnreise += pauschale24 * KUERZUNG.mittag;
      if (abendAnreise) kuerzungAnreise += pauschale24 * KUERZUNG.abend;
      const nettoAnreise = Math.max(0, bruttoAnreise - kuerzungAnreise);
      verpflegungDetails.push({
        tag: 'Anreisetag',
        brutto: bruttoAnreise,
        kuerzungen: Math.round(kuerzungAnreise * 100) / 100,
        netto: Math.round(nettoAnreise * 100) / 100,
      });
      verpflegungGesamt += nettoAnreise;
      
      // Volle Tage
      for (let i = 0; i < anzahlVollerTage; i++) {
        let bruttoVoll = pauschale24;
        let kuerzungVoll = 0;
        if (fruehstueckVoll) kuerzungVoll += pauschale24 * KUERZUNG.fruehstueck;
        if (mittagVoll) kuerzungVoll += pauschale24 * KUERZUNG.mittag;
        if (abendVoll) kuerzungVoll += pauschale24 * KUERZUNG.abend;
        const nettoVoll = Math.max(0, bruttoVoll - kuerzungVoll);
        verpflegungDetails.push({
          tag: `Tag ${i + 2} (24h)`,
          brutto: bruttoVoll,
          kuerzungen: Math.round(kuerzungVoll * 100) / 100,
          netto: Math.round(nettoVoll * 100) / 100,
        });
        verpflegungGesamt += nettoVoll;
      }
      
      // Abreisetag
      let bruttoAbreise = pauschaleAnAb;
      let kuerzungAbreise = 0;
      if (fruehstueckAbreise) kuerzungAbreise += pauschale24 * KUERZUNG.fruehstueck;
      if (mittagAbreise) kuerzungAbreise += pauschale24 * KUERZUNG.mittag;
      if (abendAbreise) kuerzungAbreise += pauschale24 * KUERZUNG.abend;
      const nettoAbreise = Math.max(0, bruttoAbreise - kuerzungAbreise);
      verpflegungDetails.push({
        tag: 'Abreisetag',
        brutto: bruttoAbreise,
        kuerzungen: Math.round(kuerzungAbreise * 100) / 100,
        netto: Math.round(nettoAbreise * 100) / 100,
      });
      verpflegungGesamt += nettoAbreise;
    }

    // Übernachtungspauschale (nur wenn nicht eigene Übernachtung)
    let uebernachtungGesamt = 0;
    if (reisedauer === 'mehrtag' && !eigeneUebernachtung) {
      uebernachtungGesamt = anzahlUebernachtungen * UEBERNACHTUNGSPAUSCHALE_INLAND;
    }

    const gesamterstattung = Math.round((verpflegungGesamt + uebernachtungGesamt) * 100) / 100;

    // Steuerersparnis berechnen (Annahme: 35% Grenzsteuersatz)
    const steuerersparnis = Math.round(gesamterstattung * 0.35 * 100) / 100;

    return {
      pauschale24,
      pauschale8,
      pauschaleAnAb,
      verpflegungDetails,
      verpflegungGesamt: Math.round(verpflegungGesamt * 100) / 100,
      uebernachtungGesamt,
      gesamterstattung,
      steuerersparnis,
      anzahlTage: reisedauer === 'eintag' ? 1 : 2 + anzahlVollerTage,
    };
  }, [
    reiseart, zielland, reisedauer, anzahlVollerTage, abwesenheitEintag,
    fruehstueckAnreise, mittagAnreise, abendAnreise,
    fruehstueckVoll, mittagVoll, abendVoll,
    fruehstueckAbreise, mittagAbreise, abendAbreise,
    anzahlUebernachtungen, eigeneUebernachtung
  ]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Reiseart */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Reiseziel</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setReiseart('inland')}
              className={`py-4 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                reiseart === 'inland'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">🇩🇪</span>
              <span>Inland</span>
            </button>
            <button
              onClick={() => setReiseart('ausland')}
              className={`py-4 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                reiseart === 'ausland'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">🌍</span>
              <span>Ausland</span>
            </button>
          </div>
        </div>

        {/* Zielland bei Ausland */}
        {reiseart === 'ausland' && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Zielland</span>
            </label>
            <select
              value={zielland}
              onChange={(e) => setZielland(e.target.value)}
              className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none text-lg"
            >
              {Object.entries(PAUSCHALEN_AUSLAND).map(([code, data]) => (
                <option key={code} value={code}>
                  {data.land} ({data.ab24} € / {data.mehr8} €)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Reisedauer */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Art der Dienstreise</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setReisedauer('eintag')}
              className={`py-4 px-4 rounded-xl font-medium transition-all flex flex-col items-center gap-1 ${
                reisedauer === 'eintag'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">📅</span>
              <span>Eintägig</span>
              <span className="text-xs opacity-80">ohne Übernachtung</span>
            </button>
            <button
              onClick={() => setReisedauer('mehrtag')}
              className={`py-4 px-4 rounded-xl font-medium transition-all flex flex-col items-center gap-1 ${
                reisedauer === 'mehrtag'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">🗓️</span>
              <span>Mehrtägig</span>
              <span className="text-xs opacity-80">mit Übernachtung</span>
            </button>
          </div>
        </div>

        {/* Eintägige Reise: Abwesenheitsstunden */}
        {reisedauer === 'eintag' && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Abwesenheit von der Wohnung</span>
              <span className="text-xs text-gray-500 block mt-1">Pauschale gilt erst ab mehr als 8 Stunden</span>
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setAbwesenheitEintag(Math.max(1, abwesenheitEintag - 1))}
                className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
              >
                −
              </button>
              <div className="text-center px-6">
                <div className="text-4xl font-bold text-gray-800">{abwesenheitEintag}</div>
                <div className="text-sm text-gray-500">Stunden</div>
              </div>
              <button
                onClick={() => setAbwesenheitEintag(Math.min(24, abwesenheitEintag + 1))}
                className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
              >
                +
              </button>
            </div>
            {abwesenheitEintag <= 8 && (
              <p className="text-amber-600 text-sm mt-3 text-center">
                ⚠️ Bei Abwesenheit bis 8 Stunden gibt es keine Verpflegungspauschale
              </p>
            )}
          </div>
        )}

        {/* Mehrtägige Reise: Anzahl voller Tage */}
        {reisedauer === 'mehrtag' && (
          <>
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Anzahl voller Reisetage</span>
                <span className="text-xs text-gray-500 block mt-1">Tage mit 24h Abwesenheit (zwischen An- und Abreise)</span>
              </label>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setAnzahlVollerTage(Math.max(0, anzahlVollerTage - 1))}
                  className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
                >
                  −
                </button>
                <div className="text-center px-6">
                  <div className="text-4xl font-bold text-gray-800">{anzahlVollerTage}</div>
                  <div className="text-sm text-gray-500">volle Tage</div>
                </div>
                <button
                  onClick={() => setAnzahlVollerTage(Math.min(30, anzahlVollerTage + 1))}
                  className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
                >
                  +
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-2 text-center">
                Gesamt: 1 Anreisetag + {anzahlVollerTage} volle Tage + 1 Abreisetag = {2 + anzahlVollerTage} Tage
              </p>
            </div>

            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Anzahl Übernachtungen</span>
              </label>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setAnzahlUebernachtungen(Math.max(1, anzahlUebernachtungen - 1))}
                  className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
                >
                  −
                </button>
                <div className="text-center px-6">
                  <div className="text-4xl font-bold text-gray-800">{anzahlUebernachtungen}</div>
                  <div className="text-sm text-gray-500">Nächte</div>
                </div>
                <button
                  onClick={() => setAnzahlUebernachtungen(Math.min(30, anzahlUebernachtungen + 1))}
                  className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </>
        )}

        {/* Mahlzeiten-Kürzungen */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">🍽️ Gestellte Mahlzeiten</span>
            <span className="text-xs text-gray-500 block mt-1">
              Mahlzeiten die vom Arbeitgeber bezahlt werden (z.B. Hotel-Frühstück, Geschäftsessen)
            </span>
          </label>
          
          {reisedauer === 'eintag' ? (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Eintägige Reise</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setFruehstueckAnreise(!fruehstueckAnreise)}
                  className={`py-2 px-3 rounded-lg text-sm transition-all ${
                    fruehstueckAnreise
                      ? 'bg-amber-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  🥐 Frühstück
                </button>
                <button
                  onClick={() => setMittagAnreise(!mittagAnreise)}
                  className={`py-2 px-3 rounded-lg text-sm transition-all ${
                    mittagAnreise
                      ? 'bg-amber-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  🍝 Mittag
                </button>
                <button
                  onClick={() => setAbendAnreise(!abendAnreise)}
                  className={`py-2 px-3 rounded-lg text-sm transition-all ${
                    abendAnreise
                      ? 'bg-amber-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  🍽️ Abend
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Anreisetag */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Anreisetag</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setFruehstueckAnreise(!fruehstueckAnreise)}
                    className={`py-2 px-3 rounded-lg text-sm transition-all ${
                      fruehstueckAnreise
                        ? 'bg-amber-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    🥐 Frühstück
                  </button>
                  <button
                    onClick={() => setMittagAnreise(!mittagAnreise)}
                    className={`py-2 px-3 rounded-lg text-sm transition-all ${
                      mittagAnreise
                        ? 'bg-amber-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    🍝 Mittag
                  </button>
                  <button
                    onClick={() => setAbendAnreise(!abendAnreise)}
                    className={`py-2 px-3 rounded-lg text-sm transition-all ${
                      abendAnreise
                        ? 'bg-amber-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    🍽️ Abend
                  </button>
                </div>
              </div>

              {/* Volle Tage */}
              {anzahlVollerTage > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Volle Reisetage ({anzahlVollerTage}x)
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setFruehstueckVoll(!fruehstueckVoll)}
                      className={`py-2 px-3 rounded-lg text-sm transition-all ${
                        fruehstueckVoll
                          ? 'bg-amber-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      🥐 Frühstück
                    </button>
                    <button
                      onClick={() => setMittagVoll(!mittagVoll)}
                      className={`py-2 px-3 rounded-lg text-sm transition-all ${
                        mittagVoll
                          ? 'bg-amber-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      🍝 Mittag
                    </button>
                    <button
                      onClick={() => setAbendVoll(!abendVoll)}
                      className={`py-2 px-3 rounded-lg text-sm transition-all ${
                        abendVoll
                          ? 'bg-amber-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      🍽️ Abend
                    </button>
                  </div>
                </div>
              )}

              {/* Abreisetag */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Abreisetag</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setFruehstueckAbreise(!fruehstueckAbreise)}
                    className={`py-2 px-3 rounded-lg text-sm transition-all ${
                      fruehstueckAbreise
                        ? 'bg-amber-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    🥐 Frühstück
                  </button>
                  <button
                    onClick={() => setMittagAbreise(!mittagAbreise)}
                    className={`py-2 px-3 rounded-lg text-sm transition-all ${
                      mittagAbreise
                        ? 'bg-amber-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    🍝 Mittag
                  </button>
                  <button
                    onClick={() => setAbendAbreise(!abendAbreise)}
                    className={`py-2 px-3 rounded-lg text-sm transition-all ${
                      abendAbreise
                        ? 'bg-amber-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    🍽️ Abend
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-3">
            💡 Kürzungen: Frühstück = 20%, Mittag/Abend = je 40% der vollen Tagespauschale
          </p>
        </div>

        {/* Übernachtung selbst gezahlt */}
        {reisedauer === 'mehrtag' && (
          <div className="mb-4">
            <button
              onClick={() => setEigeneUebernachtung(!eigeneUebernachtung)}
              className={`w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-between ${
                eigeneUebernachtung
                  ? 'bg-gray-400 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>🏨 Übernachtung vom Arbeitgeber bezahlt</span>
              <span>{eigeneUebernachtung ? '✓ Ja' : '✗ Nein'}</span>
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Übernachtungspauschale nur, wenn Sie selbst zahlen und keinen Nachweis erbringen
            </p>
          </div>
        )}
      </div>

      {/* Result Section */}
      <div className="rounded-2xl shadow-lg p-6 text-white mb-6 bg-gradient-to-br from-green-500 to-emerald-600">
        <h3 className="text-sm font-medium opacity-80 mb-1">
          💰 Ihr Verpflegungsmehraufwand
        </h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.gesamterstattung)}</span>
          </div>
          <p className="text-green-100 mt-2 text-sm">
            Steuerfrei erstattungsfähig für {ergebnis.anzahlTage} Reisetag{ergebnis.anzahlTage > 1 ? 'e' : ''}
            {reiseart === 'ausland' && ` nach ${PAUSCHALEN_AUSLAND[zielland]?.land || 'Ausland'}`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Verpflegung</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.verpflegungGesamt)}</div>
          </div>
          {reisedauer === 'mehrtag' && !eigeneUebernachtung && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">Übernachtung</span>
              <div className="text-xl font-bold">{formatEuro(ergebnis.uebernachtungGesamt)}</div>
            </div>
          )}
        </div>
        
        <div className="mt-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
          <p className="text-sm">
            <strong>Steuerersparnis:</strong> ~{formatEuro(ergebnis.steuerersparnis)} 
            <span className="opacity-80"> (bei 35% Grenzsteuersatz als Werbungskosten)</span>
          </p>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
        
        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Verpflegungspauschalen {reiseart === 'ausland' ? PAUSCHALEN_AUSLAND[zielland]?.land : 'Deutschland'}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-600">Tag</th>
                  <th className="text-right py-2 font-medium text-gray-600">Pauschale</th>
                  <th className="text-right py-2 font-medium text-gray-600">Kürzung</th>
                  <th className="text-right py-2 font-medium text-gray-600">Netto</th>
                </tr>
              </thead>
              <tbody>
                {ergebnis.verpflegungDetails.map((detail, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2 text-gray-700">{detail.tag}</td>
                    <td className="py-2 text-right text-gray-600">{formatEuro(detail.brutto)}</td>
                    <td className="py-2 text-right text-red-600">
                      {detail.kuerzungen > 0 ? `-${formatEuro(detail.kuerzungen)}` : '—'}
                    </td>
                    <td className="py-2 text-right font-medium text-gray-800">{formatEuro(detail.netto)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={3} className="py-2 font-medium">Summe Verpflegung</td>
                  <td className="py-2 text-right font-bold text-gray-800">{formatEuro(ergebnis.verpflegungGesamt)}</td>
                </tr>
                {reisedauer === 'mehrtag' && !eigeneUebernachtung && (
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="py-2 font-medium">
                      + Übernachtungspauschale ({anzahlUebernachtungen} × {UEBERNACHTUNGSPAUSCHALE_INLAND} €)
                    </td>
                    <td className="py-2 text-right font-bold text-gray-800">{formatEuro(ergebnis.uebernachtungGesamt)}</td>
                  </tr>
                )}
                <tr className="bg-green-100">
                  <td colSpan={3} className="py-3 font-bold text-green-800">Gesamt erstattungsfähig</td>
                  <td className="py-3 text-right font-bold text-xl text-green-800">{formatEuro(ergebnis.gesamterstattung)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Pauschalen-Übersicht */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Aktuelle Pauschalen 2025/2026</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="font-semibold text-blue-900 mb-2">🇩🇪 Inland (Deutschland)</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 24h Abwesenheit: <strong>{PAUSCHALEN_INLAND.ab24Stunden} €</strong></li>
              <li>• &gt;8h bis &lt;24h: <strong>{PAUSCHALEN_INLAND.mehr8bisUnter24} €</strong></li>
              <li>• An-/Abreisetag: <strong>{PAUSCHALEN_INLAND.anUndAbreise} €</strong></li>
            </ul>
          </div>
          
          {reiseart === 'ausland' && (
            <div className="bg-green-50 rounded-xl p-4">
              <p className="font-semibold text-green-900 mb-2">
                🌍 {PAUSCHALEN_AUSLAND[zielland]?.land || 'Ausland'}
              </p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• 24h Abwesenheit: <strong>{ergebnis.pauschale24} €</strong></li>
                <li>• &gt;8h bis &lt;24h / An-/Abreise: <strong>{ergebnis.pauschale8} €</strong></li>
              </ul>
            </div>
          )}
        </div>

        <div className="bg-amber-50 rounded-xl p-4">
          <p className="font-semibold text-amber-900 mb-2">🍽️ Kürzungen bei gestellten Mahlzeiten</p>
          <p className="text-sm text-amber-700 mb-2">
            Bezogen auf die volle Tagespauschale ({reiseart === 'ausland' ? ergebnis.pauschale24 : PAUSCHALEN_INLAND.ab24Stunden} €):
          </p>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Frühstück: <strong>-20%</strong> = -{formatEuro((reiseart === 'ausland' ? ergebnis.pauschale24 : PAUSCHALEN_INLAND.ab24Stunden) * 0.20)}</li>
            <li>• Mittagessen: <strong>-40%</strong> = -{formatEuro((reiseart === 'ausland' ? ergebnis.pauschale24 : PAUSCHALEN_INLAND.ab24Stunden) * 0.40)}</li>
            <li>• Abendessen: <strong>-40%</strong> = -{formatEuro((reiseart === 'ausland' ? ergebnis.pauschale24 : PAUSCHALEN_INLAND.ab24Stunden) * 0.40)}</li>
          </ul>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert der Verpflegungsmehraufwand</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Steuerfreie Erstattung:</strong> Arbeitgeber kann Pauschalen steuerfrei erstatten</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Werbungskosten:</strong> Ohne Erstattung als Werbungskosten absetzbar</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Keine Nachweise:</strong> Pauschalen gelten ohne Einzelnachweise für Mahlzeiten</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Kürzungspflicht:</strong> Bei gestellten Mahlzeiten muss gekürzt werden</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>3-Monatsfrist:</strong> Bei Langzeitdienstreise sinkt Pauschale nach 3 Monaten</span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Auswärtstätigkeit:</strong> Pauschalen nur bei beruflich veranlassten Reisen außerhalb der ersten Tätigkeitsstätte</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Dreimonatsfrist:</strong> Nach 3 Monaten an derselben Tätigkeitsstätte entfällt der Anspruch</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Dokumentation:</strong> Reisezweck, Datum, Dauer und Ziel sollten dokumentiert werden</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Übernachtung:</strong> Die Pauschale von 20 € gilt nur ohne Nachweis – mit Belegen sind höhere Kosten absetzbar</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Ausland:</strong> Bei Auslandsreisen gilt am An- und Abreisetag der Satz des Landes mit der geringeren Pauschale</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Informationen & Antrag</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="font-semibold text-blue-900">Finanzamt</p>
            <p className="text-sm text-blue-700 mt-1">
              Verpflegungsmehraufwand wird über die Einkommensteuererklärung als Werbungskosten 
              geltend gemacht (Anlage N, Zeile „Reisekosten").
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📋</span>
              <div>
                <p className="font-medium text-gray-800">Benötigte Angaben</p>
                <ul className="text-gray-600 mt-1 text-xs space-y-1">
                  <li>• Datum und Dauer der Reise</li>
                  <li>• Reiseziel und Anlass</li>
                  <li>• Erhaltene Erstattungen</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Offizielle Pauschalen</p>
                <a 
                  href="https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Lohnsteuer/2023-11-21-steuerliche-behandlung-reisekosten-reisekostenverguetungen.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-xs"
                >
                  BMF-Schreiben →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

            <RechnerFeedback rechnerName="Verpflegungsmehraufwand-Rechner 2025 & 2026" rechnerSlug="verpflegungsmehraufwand-rechner" />

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/estg/__9.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 9 EStG – Werbungskosten
          </a>
          <a 
            href="https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Lohnsteuer/2023-11-21-steuerliche-behandlung-reisekosten-reisekostenverguetungen.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF – Steuerliche Behandlung von Reisekosten
          </a>
          <a 
            href="https://www.haufe.de/steuern/steuer-office-gold/verpflegungsmehraufwendungen_idesk_PI11525_HI1119281.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Haufe – Verpflegungsmehraufwendungen
          </a>
        </div>
      </div>
    </div>
  );
}
