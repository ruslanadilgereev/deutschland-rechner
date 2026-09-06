import { useState, useMemo } from 'react';

type Sieb = 'single' | 'double';
type DrinkId = 'single-espresso' | 'doppelter-espresso' | 'ristretto';
type Druck = 'niedrig' | 'optimal' | 'hoch';

interface Getraenk {
  id: DrinkId;
  name: string;
  espresso: number;
  cup: number;
  sollVerhaeltnis: number;
  hinweis: string;
}

const NORM_PULVER: Record<Sieb, { wert: number; toleranz: number }> = {
  single: { wert: 8, toleranz: 1 },
  double: { wert: 17, toleranz: 2 },
};

const NORM_BEZUGSZEIT = { wert: 25, toleranz: 5 };
const NORM_DRUCK = { wert: 9, toleranz: 1 };

const GETRAENKE: Getraenk[] = [
  { id: 'single-espresso', name: 'Single Espresso', espresso: 20, cup: 20, sollVerhaeltnis: 2.5, hinweis: '20 g Espresso, 20-ml-Tasse' },
  { id: 'doppelter-espresso', name: 'Doppelter Espresso', espresso: 40, cup: 40, sollVerhaeltnis: 2.5, hinweis: '40 g Espresso, 40-ml-Tasse' },
  { id: 'ristretto', name: 'Ristretto', espresso: 12, cup: 20, sollVerhaeltnis: 1.5, hinweis: '12 g Espresso, 20-ml-Tasse' },
];

const getraenkVon = (id: DrinkId) => GETRAENKE.find((g) => g.id === id)!;

// Pulvermenge, die ein Getränk in der gewählten Tassenzahl bei seinem Soll-Brühverhältnis braucht
const noetigeDosis = (g: Getraenk, tassen: number) => (g.espresso * tassen) / g.sollVerhaeltnis;

const passtInSieb = (dosis: number, sieb: Sieb) => {
  const n = NORM_PULVER[sieb];
  return dosis >= n.wert - n.toleranz && dosis <= n.wert + n.toleranz;
};

const halbeListeFuer = (sieb: Sieb) => {
  const tassen = sieb === 'double' ? 2 : 1;
  return GETRAENKE.filter((g) => passtInSieb(noetigeDosis(g, tassen), sieb));
};

const volleListeFuer = (sieb: Sieb) =>
  sieb === 'double' ? GETRAENKE.filter((g) => passtInSieb(noetigeDosis(g, 1), sieb)) : [];

const runde = (n: number) => Math.round(n * 2) / 2;

const fmt = (n: number, dezimalen = 1) =>
  n.toLocaleString('de-DE', { minimumFractionDigits: dezimalen, maximumFractionDigits: dezimalen });

export default function SiebtraegerRechner() {
  const [sieb, setSieb] = useState<Sieb>('double');
  const [drinkId, setDrinkId] = useState<DrinkId>('single-espresso');
  const [voll, setVoll] = useState(false);
  const [pulver, setPulver] = useState(16);
  const [espresso, setEspresso] = useState(16);
  const [druck, setDruck] = useState<Druck>('optimal');
  const [bezugszeit, setBezugszeit] = useState(NORM_BEZUGSZEIT.wert);

  const tassen = sieb === 'double' && !voll ? 2 : 1;
  const getraenk = getraenkVon(drinkId);
  const halbeListe = halbeListeFuer(sieb);
  const volleListe = volleListeFuer(sieb);

  const pulverGrenzen = useMemo(() => {
    const n = NORM_PULVER[sieb];
    return { min: runde(n.wert - n.toleranz * 4), max: runde(n.wert + n.toleranz * 4.5) };
  }, [sieb]);

  const espressoGrenzen = useMemo(
    () => ({ min: runde(getraenk.espresso * 0.4), max: runde(getraenk.espresso * 2.2) }),
    [getraenk]
  );

  // Auswahl wechseln: Pulver auf die nötige Dosis, Espresso auf 2:1 zurücksetzen
  const uebernehmeAuswahl = (naechsterSieb: Sieb, naechsteId: DrinkId, naechstesVoll: boolean) => {
    const naechsteTassen = naechsterSieb === 'double' && !naechstesVoll ? 2 : 1;
    const g = getraenkVon(naechsteId);
    const neuesPulver = runde(noetigeDosis(g, naechsteTassen));
    setSieb(naechsterSieb);
    setDrinkId(naechsteId);
    setVoll(naechstesVoll);
    setPulver(neuesPulver);
    setEspresso(runde((2 * neuesPulver) / naechsteTassen));
  };

  const wechsleSieb = (naechsterSieb: Sieb) => {
    if (naechsterSieb === sieb) return;
    const halbe = halbeListeFuer(naechsterSieb);
    const passtNoch = !voll && halbe.some((g) => g.id === drinkId);
    const naechsteId = passtNoch ? drinkId : halbe[0].id;
    uebernehmeAuswahl(naechsterSieb, naechsteId, false);
  };

  const ergebnis = useMemo(() => {
    const espressoGesamt = espresso * tassen;
    const bruehverhaeltnis = espressoGesamt / pulver;
    const massenstrom = espressoGesamt / bezugszeit;

    const normEspressoGesamt = getraenk.espresso * tassen;
    const hoherWorstCase = normEspressoGesamt / (NORM_BEZUGSZEIT.wert - NORM_BEZUGSZEIT.toleranz);
    const niedrigerWorstCase = normEspressoGesamt / (NORM_BEZUGSZEIT.wert + NORM_BEZUGSZEIT.toleranz);

    let mahlgrad: { richtung: 'feiner' | 'groeber' | 'keine'; text: string };
    if (druck === 'niedrig' && massenstrom > hoherWorstCase) {
      mahlgrad = { richtung: 'feiner', text: 'Kaffeepulver muss feiner gemahlen werden' };
    } else if (druck === 'hoch' && massenstrom < niedrigerWorstCase) {
      mahlgrad = { richtung: 'groeber', text: 'Kaffeepulver muss gröber gemahlen werden' };
    } else {
      mahlgrad = { richtung: 'keine', text: 'Aus Druck und Massenstrom ergibt sich keine eindeutige Mahlgrad-Korrektur.' };
    }

    const zeitFuerNormgewicht = massenstrom > 0 ? normEspressoGesamt / massenstrom : 0;
    const zeitFuerZweiZuEins = massenstrom > 0 ? (2 * pulver) / massenstrom : 0;

    const abweichungVerhaeltnis = bruehverhaeltnis - getraenk.sollVerhaeltnis;
    const pulverNorm = NORM_PULVER[sieb].wert;

    return {
      espressoGesamt,
      bruehverhaeltnis,
      massenstrom,
      normEspressoGesamt,
      hoherWorstCase,
      niedrigerWorstCase,
      mahlgrad,
      zeitFuerNormgewicht,
      zeitFuerZweiZuEins,
      abweichungVerhaeltnis,
      pulverNorm,
    };
  }, [espresso, tassen, pulver, bezugszeit, getraenk, druck, sieb]);

  const vergleich = (wert: number, norm: number) => {
    const diff = wert - norm;
    if (Math.abs(diff) < 0.05) return { wort: 'genau auf dem Normwert', farbe: 'text-emerald-700', diff: 0 };
    return diff > 0
      ? { wort: 'höher als der Normwert', farbe: 'text-amber-700', diff }
      : { wort: 'niedriger als der Normwert', farbe: 'text-sky-700', diff };
  };

  const pulverVergleich = vergleich(pulver, ergebnis.pulverNorm);
  const espressoVergleich = vergleich(espresso, getraenk.espresso);
  const verhaeltnisVergleich = vergleich(ergebnis.bruehverhaeltnis, getraenk.sollVerhaeltnis);

  const auswahlKarte = (g: Getraenk, aktiv: boolean, onClick: () => void, zusatz?: string) => (
    <button
      key={g.id}
      onClick={onClick}
      className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
        aktiv ? 'border-[#4a2c17] bg-[#f7f1ea]' : 'border-gray-200 hover:border-[#b08968]'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">☕</span>
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-sm leading-tight ${aktiv ? 'text-[#4a2c17]' : 'text-gray-800'}`}>
            {g.name}
          </div>
          <div className="text-xs text-gray-500">{zusatz ?? g.hinweis}</div>
        </div>
        <div
          className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
            aktiv ? 'border-[#4a2c17] bg-[#4a2c17]' : 'border-gray-300'
          }`}
        >
          {aktiv && (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>
    </button>
  );

  return (
    <div className="max-w-lg mx-auto">
      {/* Sieb-Auswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Sieb im Siebträger</label>
        <div className="flex gap-2">
          <button
            onClick={() => wechsleSieb('single')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              sieb === 'single'
                ? 'bg-[#4a2c17] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-[#f0e6dc] hover:text-[#4a2c17]'
            }`}
          >
            Single Shot Sieb
          </button>
          <button
            onClick={() => wechsleSieb('double')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              sieb === 'double'
                ? 'bg-[#4a2c17] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-[#f0e6dc] hover:text-[#4a2c17]'
            }`}
          >
            Double Shot Sieb
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Normdosis: {fmt(NORM_PULVER[sieb].wert)} g ± {fmt(NORM_PULVER[sieb].toleranz)} g
        </p>

        {/* Siebträger-Grafik */}
        <svg
          viewBox="0 0 400 180"
          className="w-full mt-5"
          role="img"
          aria-label={
            sieb === 'single'
              ? 'Siebträger mit einem Auslass nach links'
              : voll
                ? 'Siebträger mit zwei Auslässen, beide laufen in eine Tasse'
                : 'Siebträger mit zwei Auslässen nach links und rechts'
          }
        >
          {/* Brühgruppe */}
          <rect x="120" y="6" width="160" height="18" rx="4" fill="#2f1c10" />
          {/* Siebträger-Körper */}
          <polygon points="132,24 268,24 250,62 150,62" fill="#4a2c17" />
          {/* Griff */}
          <rect x="268" y="34" width="104" height="16" rx="8" fill="#2f1c10" />
          <rect x="262" y="30" width="14" height="24" rx="3" fill="#4a2c17" />

          {sieb === 'single' ? (
            <>
              {/* ein Auslass links */}
              <polygon points="170,62 200,62 194,80 176,80" fill="#3b2415" />
              <rect x="183" y="80" width="4" height="26" fill="#8b5a2b" opacity="0.85" />
              {/* Tasse links */}
              <path d="M158,108 h54 l-6,30 h-42 z" fill="#ffffff" stroke="#4a2c17" strokeWidth="2.5" />
              <path d="M212,114 a10,10 0 0 1 0,18" fill="none" stroke="#4a2c17" strokeWidth="2.5" />
              <rect x="162" y="112" width="46" height="7" rx="2" fill="#6f4423" opacity="0.55" />
              <text x="185" y="156" textAnchor="middle" fontSize="11" fill="#6b7280">
                linker Auslass
              </text>
            </>
          ) : (
            <>
              {/* zwei Auslässe */}
              <polygon points="152,62 182,62 176,80 158,80" fill="#3b2415" />
              <polygon points="218,62 248,62 242,80 224,80" fill="#3b2415" />
              <rect x="165" y="80" width="4" height={voll ? 30 : 26} fill="#8b5a2b" opacity="0.85" />
              <rect x="231" y="80" width="4" height={voll ? 30 : 26} fill="#8b5a2b" opacity="0.85" />

              {voll ? (
                <>
                  {/* eine breite Tasse unter beiden Auslässen */}
                  <path d="M140,112 h120 l-9,32 h-102 z" fill="#ffffff" stroke="#4a2c17" strokeWidth="2.5" />
                  <path d="M260,118 a11,11 0 0 1 0,20" fill="none" stroke="#4a2c17" strokeWidth="2.5" />
                  <rect x="145" y="116" width="110" height="8" rx="2" fill="#6f4423" opacity="0.55" />
                  <text x="200" y="162" textAnchor="middle" fontSize="11" fill="#6b7280">
                    beide Auslässe in eine Tasse
                  </text>
                </>
              ) : (
                <>
                  {/* zwei Tassen */}
                  <path d="M140,108 h54 l-6,30 h-42 z" fill="#ffffff" stroke="#4a2c17" strokeWidth="2.5" />
                  <path d="M194,114 a10,10 0 0 1 0,18" fill="none" stroke="#4a2c17" strokeWidth="2.5" />
                  <rect x="144" y="112" width="46" height="7" rx="2" fill="#6f4423" opacity="0.55" />
                  <path d="M206,108 h54 l-6,30 h-42 z" fill="#ffffff" stroke="#4a2c17" strokeWidth="2.5" />
                  <path d="M260,114 a10,10 0 0 1 0,18" fill="none" stroke="#4a2c17" strokeWidth="2.5" />
                  <rect x="210" y="112" width="46" height="7" rx="2" fill="#6f4423" opacity="0.55" />
                  <text x="167" y="156" textAnchor="middle" fontSize="11" fill="#6b7280">
                    linker Auslass
                  </text>
                  <text x="233" y="156" textAnchor="middle" fontSize="11" fill="#6b7280">
                    rechter Auslass
                  </text>
                </>
              )}
            </>
          )}
        </svg>
      </div>

      {/* Getränke-Auswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block text-gray-700 font-medium mb-3">Welches Getränk soll es werden?</label>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-3">
            {halbeListe.map((g) =>
              auswahlKarte(g, !voll && drinkId === g.id, () => uebernehmeAuswahl(sieb, g.id, false))
            )}
          </div>
          <div className="space-y-3">
            {sieb === 'double' ? (
              halbeListe.map((g) =>
                auswahlKarte(g, !voll && drinkId === g.id, () => uebernehmeAuswahl(sieb, g.id, false))
              )
            ) : (
              <div className="h-full min-h-[68px] rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center p-3">
                <span className="text-xs text-gray-400 text-center">
                  Single Shot Sieb –<br />kein zweiter Auslass
                </span>
              </div>
            )}
          </div>
        </div>

        {sieb === 'double' && volleListe.length > 0 && (
          <div className="mt-3 space-y-3">
            {volleListe.map((g) =>
              auswahlKarte(
                g,
                voll && drinkId === g.id,
                () => uebernehmeAuswahl(sieb, g.id, true),
                `${g.hinweis} – nutzt beide Auslässe`
              )
            )}
          </div>
        )}

        {sieb === 'double' && !voll && (
          <p className="text-xs text-gray-500 mt-3">
            Beide Auslässe liefern immer dasselbe Gewicht – die Auswahl gilt für beide Tassen.
          </p>
        )}
      </div>

      {/* Kaffeepulver */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block">
          <span className="text-gray-700 font-medium">Kaffeepulver-Gewicht (Gramm)</span>
          <div className="mt-3 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => setPulver(Math.max(pulverGrenzen.min, runde(pulver - 0.5)))}
              className="w-14 h-14 rounded-full bg-gray-100 text-2xl font-bold text-gray-600 hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-40"
              disabled={pulver <= pulverGrenzen.min}
              aria-label="Kaffeepulver verringern"
            >
              −
            </button>
            <span className="text-5xl font-bold text-[#4a2c17] w-28 text-center">{fmt(pulver)}</span>
            <button
              type="button"
              onClick={() => setPulver(Math.min(pulverGrenzen.max, runde(pulver + 0.5)))}
              className="w-14 h-14 rounded-full bg-[#4a2c17] text-2xl font-bold text-white hover:bg-[#5d3a20] active:scale-95 transition-all disabled:opacity-40"
              disabled={pulver >= pulverGrenzen.max}
              aria-label="Kaffeepulver erhöhen"
            >
              +
            </button>
          </div>
          <input
            type="range"
            min={pulverGrenzen.min}
            max={pulverGrenzen.max}
            step={0.5}
            value={pulver}
            onChange={(e) => setPulver(parseFloat(e.target.value))}
            className="w-full mt-5 accent-[#4a2c17]"
            aria-label="Kaffeepulver-Gewicht in Gramm"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{fmt(pulverGrenzen.min)} g</span>
            <span>{fmt(pulverGrenzen.max)} g</span>
          </div>
        </label>
      </div>

      {/* Espresso-Gewicht */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block">
          <span className="text-gray-700 font-medium">Espresso-Gewicht pro Tasse (Gramm)</span>
          <div className="mt-3 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => setEspresso(Math.max(espressoGrenzen.min, runde(espresso - 0.5)))}
              className="w-14 h-14 rounded-full bg-gray-100 text-2xl font-bold text-gray-600 hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-40"
              disabled={espresso <= espressoGrenzen.min}
              aria-label="Espresso-Gewicht verringern"
            >
              −
            </button>
            <span className="text-5xl font-bold text-[#4a2c17] w-28 text-center">{fmt(espresso)}</span>
            <button
              type="button"
              onClick={() => setEspresso(Math.min(espressoGrenzen.max, runde(espresso + 0.5)))}
              className="w-14 h-14 rounded-full bg-[#4a2c17] text-2xl font-bold text-white hover:bg-[#5d3a20] active:scale-95 transition-all disabled:opacity-40"
              disabled={espresso >= espressoGrenzen.max}
              aria-label="Espresso-Gewicht erhöhen"
            >
              +
            </button>
          </div>
          <input
            type="range"
            min={espressoGrenzen.min}
            max={espressoGrenzen.max}
            step={0.5}
            value={espresso}
            onChange={(e) => setEspresso(parseFloat(e.target.value))}
            className="w-full mt-5 accent-[#4a2c17]"
            aria-label="Espresso-Gewicht pro Tasse in Gramm"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{fmt(espressoGrenzen.min)} g</span>
            <span>{fmt(espressoGrenzen.max)} g</span>
          </div>
          {tassen === 2 && (
            <p className="text-xs text-gray-500 mt-2">
              Zwei Tassen à {fmt(espresso)} g = <strong>{fmt(ergebnis.espressoGesamt)} g</strong> Gesamtbezug
            </p>
          )}
        </label>
      </div>

      {/* Druck */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Brühdruck <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <div className="flex gap-2">
          {(
            [
              { id: 'niedrig' as const, label: 'zu gering', sub: `< ${NORM_DRUCK.wert - NORM_DRUCK.toleranz} bar` },
              { id: 'optimal' as const, label: 'etwa optimal', sub: `${NORM_DRUCK.wert} bar` },
              { id: 'hoch' as const, label: 'zu hoch', sub: `> ${NORM_DRUCK.wert + NORM_DRUCK.toleranz} bar` },
            ] as const
          ).map((d) => (
            <button
              key={d.id}
              onClick={() => setDruck(d.id)}
              className={`flex-1 py-2 px-2 rounded-lg text-sm font-medium transition-all ${
                druck === d.id
                  ? 'bg-[#4a2c17] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-[#f0e6dc] hover:text-[#4a2c17]'
              }`}
            >
              <span className="block">{d.label}</span>
              <span className={`block text-xs ${druck === d.id ? 'text-[#d9c3ae]' : 'text-gray-400'}`}>{d.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bezugszeit */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block">
          <span className="text-gray-700 font-medium">
            Bezugszeit (Sekunden) <span className="font-normal text-gray-400">(optional)</span>
          </span>
          <div className="mt-3 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => setBezugszeit(Math.max(10, bezugszeit - 1))}
              className="w-14 h-14 rounded-full bg-gray-100 text-2xl font-bold text-gray-600 hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-40"
              disabled={bezugszeit <= 10}
              aria-label="Bezugszeit verringern"
            >
              −
            </button>
            <span className="text-5xl font-bold text-[#4a2c17] w-28 text-center">{bezugszeit}</span>
            <button
              type="button"
              onClick={() => setBezugszeit(Math.min(45, bezugszeit + 1))}
              className="w-14 h-14 rounded-full bg-[#4a2c17] text-2xl font-bold text-white hover:bg-[#5d3a20] active:scale-95 transition-all disabled:opacity-40"
              disabled={bezugszeit >= 45}
              aria-label="Bezugszeit erhöhen"
            >
              +
            </button>
          </div>
          <input
            type="range"
            min={10}
            max={45}
            step={1}
            value={bezugszeit}
            onChange={(e) => setBezugszeit(parseInt(e.target.value, 10))}
            className="w-full mt-5 accent-[#4a2c17]"
            aria-label="Bezugszeit in Sekunden"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>10 s</span>
            <span>45 s</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Normwert: {NORM_BEZUGSZEIT.wert} s ± {NORM_BEZUGSZEIT.toleranz} s
          </p>
        </label>
      </div>

      {/* Ergebnis: Brühverhältnis */}
      <div className="bg-gradient-to-br from-[#4a2c17] to-[#7a4a28] rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-[#e2d0bf] mb-1">Brühverhältnis</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold">1:{fmt(ergebnis.bruehverhaeltnis, 2)}</span>
        </div>
        <p className="mt-3 text-sm text-[#f0e4d8]">
          {verhaeltnisVergleich.diff === 0
            ? `Das entspricht genau dem Soll-Verhältnis für ${getraenk.name} (1:${fmt(getraenk.sollVerhaeltnis, 2)}).`
            : `Das Brühverhältnis ist ${verhaeltnisVergleich.diff > 0 ? 'höher' : 'niedriger'} als der Normwert für ${getraenk.name} (1:${fmt(getraenk.sollVerhaeltnis, 2)}).`}
        </p>
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-2 text-sm mt-4">
          <div className="flex justify-between">
            <span className="text-[#e2d0bf]">Gesamtbezug</span>
            <span className="font-semibold">{fmt(ergebnis.espressoGesamt)} g</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#e2d0bf]">Kaffeepulver</span>
            <span className="font-semibold">{fmt(pulver)} g</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#e2d0bf]">Massenstrom</span>
            <span className="font-semibold">{fmt(ergebnis.massenstrom, 2)} g/s</span>
          </div>
        </div>
      </div>

      {/* Mahlgrad-Diagnose */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">Mahlgrad-Diagnose</h3>
        <div
          className={`rounded-xl p-4 border-l-4 ${
            ergebnis.mahlgrad.richtung === 'feiner'
              ? 'bg-amber-50 border-amber-500'
              : ergebnis.mahlgrad.richtung === 'groeber'
                ? 'bg-sky-50 border-sky-500'
                : 'bg-gray-50 border-gray-300'
          }`}
        >
          <p
            className={`font-semibold ${
              ergebnis.mahlgrad.richtung === 'feiner'
                ? 'text-amber-800'
                : ergebnis.mahlgrad.richtung === 'groeber'
                  ? 'text-sky-800'
                  : 'text-gray-600'
            }`}
          >
            {ergebnis.mahlgrad.text}
          </p>
        </div>
        <div className="mt-4 space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Massenstrom</span>
            <span className="font-medium">{fmt(ergebnis.massenstrom, 2)} g/s</span>
          </div>
          <div className="flex justify-between">
            <span>Worst Case hoch ({NORM_BEZUGSZEIT.wert - NORM_BEZUGSZEIT.toleranz} s)</span>
            <span className="font-medium">{fmt(ergebnis.hoherWorstCase, 2)} g/s</span>
          </div>
          <div className="flex justify-between">
            <span>Worst Case niedrig ({NORM_BEZUGSZEIT.wert + NORM_BEZUGSZEIT.toleranz} s)</span>
            <span className="font-medium">{fmt(ergebnis.niedrigerWorstCase, 2)} g/s</span>
          </div>
        </div>
      </div>

      {/* Bezugszeiten */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">Bezugszeit bei gleichem Massenstrom</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
            <span>
              für das Norm-Espressogewicht ({fmt(ergebnis.normEspressoGesamt)} g)
            </span>
            <span className="text-lg font-bold text-[#4a2c17]">{fmt(ergebnis.zeitFuerNormgewicht)} s</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span>für ein Brühverhältnis von 1:2 ({fmt(2 * pulver)} g)</span>
            <span className="text-lg font-bold text-[#4a2c17]">{fmt(ergebnis.zeitFuerZweiZuEins)} s</span>
          </div>
        </div>
      </div>

      {/* Abweichungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">Abweichung von den Normwerten</h3>
        <div className="space-y-3 text-sm">
          <p className={pulverVergleich.farbe}>
            Das Kaffeepulver-Gewicht von <strong>{fmt(pulver)} g</strong> ist {pulverVergleich.wort} von{' '}
            {fmt(ergebnis.pulverNorm)} g für das {sieb === 'single' ? 'Single' : 'Double'} Shot Sieb
            {pulverVergleich.diff !== 0 && ` (${pulverVergleich.diff > 0 ? '+' : '−'}${fmt(Math.abs(pulverVergleich.diff))} g)`}.
          </p>
          <p className={espressoVergleich.farbe}>
            Das Espresso-Gewicht von <strong>{fmt(espresso)} g</strong> ist {espressoVergleich.wort} von{' '}
            {fmt(getraenk.espresso)} g für {getraenk.name}
            {espressoVergleich.diff !== 0 && ` (${espressoVergleich.diff > 0 ? '+' : '−'}${fmt(Math.abs(espressoVergleich.diff))} g)`}.
          </p>
        </div>
      </div>

      {/* Disclaimer & Quellen */}
      <div className="bg-gray-50 rounded-2xl p-6 text-sm text-gray-600">
        <p className="mb-3">
          <strong>Hinweis:</strong> Die Werte sind Richtwerte für die Espresso-Zubereitung. Bohnensorte,
          Röstgrad, Frische und Maschine verschieben das optimale Ergebnis – der Geschmack in der Tasse
          entscheidet.
        </p>
        <p className="font-medium text-gray-700 mb-1">Grundlage</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Norm- und Toleranzwerte der Siebträger-Zubereitung: Dosierung {fmt(NORM_PULVER.single.wert)} g ± {fmt(NORM_PULVER.single.toleranz)} g (Single) bzw. {fmt(NORM_PULVER.double.wert)} g ± {fmt(NORM_PULVER.double.toleranz)} g (Double), Brühdruck {NORM_DRUCK.wert} bar ± {NORM_DRUCK.toleranz} bar, Bezugszeit {NORM_BEZUGSZEIT.wert} s ± {NORM_BEZUGSZEIT.toleranz} s</li>
          <li>Brühverhältnis und Massenstrom als reine Massenbilanz (Physik)</li>
        </ul>
      </div>
    </div>
  );
}
