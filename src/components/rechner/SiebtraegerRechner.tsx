import { useState, useMemo } from 'react';

type Sieb = 'single' | 'double';
type DrinkId = 'single-espresso' | 'doppelter-espresso' | 'ristretto';
type Druck = 'niedrig' | 'optimal' | 'hoch';

interface Getraenk {
  id: DrinkId;
  name: string;
  espresso: number;
  espressoToleranz: number;
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

// Relative Toleranz, innerhalb derer ein Brühverhältnis als getroffen gilt
const TOLERANZ_VERHAELTNIS = 0.1;

// Espresso-Toleranzen: 12,5 % des Normgewichts – dieselbe relative Spanne
// wie beim Single-Shot-Sieb (8 g ± 1 g)
const GETRAENKE: Getraenk[] = [
  { id: 'single-espresso', name: 'Single Espresso', espresso: 20, espressoToleranz: 2.5, cup: 20, sollVerhaeltnis: 2.5, hinweis: '20 g Espresso, 20-ml-Tasse' },
  { id: 'doppelter-espresso', name: 'Doppelter Espresso', espresso: 40, espressoToleranz: 5, cup: 40, sollVerhaeltnis: 2.5, hinweis: '40 g Espresso, 40-ml-Tasse' },
  { id: 'ristretto', name: 'Ristretto', espresso: 12, espressoToleranz: 1.5, cup: 20, sollVerhaeltnis: 1.5, hinweis: '12 g Espresso, 20-ml-Tasse' },
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

/** Ganze Zahl ohne Dezimalstellen – für die erläuternden Sätze */
const fmtGanz = (n: number) => Math.round(n).toLocaleString('de-DE');

/**
 * Brühverhältnis als "1 : 2.35" – mit Punkt als Dezimalzeichen und ohne
 * überflüssige Nullen. Nur hier weicht die Schreibweise bewusst ab.
 */
const fmtVerhaeltnis = (n: number) => `1 : ${String(Math.round(n * 100) / 100)}`;

type DiagnoseFarbe = 'blau' | 'gruen' | 'bernstein';

const FARBEN: Record<DiagnoseFarbe, { box: string; titel: string; text: string }> = {
  blau: { box: 'bg-blue-50 border-blue-500', titel: 'text-blue-900', text: 'text-blue-800' },
  gruen: { box: 'bg-emerald-50 border-emerald-500', titel: 'text-emerald-900', text: 'text-emerald-800' },
  bernstein: { box: 'bg-amber-50 border-amber-500', titel: 'text-amber-900', text: 'text-amber-800' },
};

function Diagnose({ statement, satz, farbe = 'blau' }: { statement: string; satz?: string; farbe?: DiagnoseFarbe }) {
  const f = FARBEN[farbe];
  return (
    <div className={`rounded-xl p-4 border-l-4 ${f.box}`}>
      <p className={`font-semibold ${f.titel}`}>{statement}</p>
      {satz && <p className={`mt-2 text-sm ${f.text}`}>{satz}</p>}
    </div>
  );
}

/** Küchenwaage mit Häufchen Espressopulver */
function WaageMitPulver({ wert }: { wert: number }) {
  return (
    <svg
      viewBox="0 0 400 150"
      className="w-full max-w-[220px] mx-auto mt-4"
      role="img"
      aria-label="Espressopulver auf einer Küchenwaage"
    >
      <path d="M112,90 Q145,44 200,42 Q255,44 288,90 Z" fill="#4a2c17" />
      <path d="M112,90 Q145,44 200,42 Q225,50 236,90 Z" fill="#5d3a20" opacity="0.7" />
      <ellipse cx="200" cy="90" rx="88" ry="9" fill="#3b2415" />
      <circle cx="168" cy="74" r="2.4" fill="#2f1c10" opacity="0.6" />
      <circle cx="212" cy="66" r="2" fill="#2f1c10" opacity="0.5" />
      <circle cx="243" cy="80" r="2.2" fill="#2f1c10" opacity="0.55" />
      <circle cx="186" cy="60" r="1.8" fill="#7a4a28" opacity="0.7" />
      <rect x="70" y="90" width="260" height="11" rx="5" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="2" />
      <rect x="60" y="101" width="280" height="32" rx="9" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="2" />
      <rect x="246" y="108" width="78" height="19" rx="3" fill="#1f2937" />
      <text x="285" y="122" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#86efac">
        {fmt(wert)} g
      </text>
      <circle cx="96" cy="117" r="8" fill="none" stroke="#9ca3af" strokeWidth="2" />
      <rect x="84" y="133" width="26" height="6" rx="3" fill="#9ca3af" />
      <rect x="290" y="133" width="26" height="6" rx="3" fill="#9ca3af" />
    </svg>
  );
}

/** Küchenwaage mit weißer Espressotasse */
function WaageMitTasse({ wert }: { wert: number }) {
  return (
    <svg
      viewBox="0 0 400 150"
      className="w-full max-w-[220px] mx-auto mt-4"
      role="img"
      aria-label="Weiße Espressotasse auf einer Küchenwaage"
    >
      <path d="M160,44 h80 l-9,46 h-62 z" fill="#ffffff" stroke="#4a2c17" strokeWidth="2.5" />
      <path d="M240,52 a13,13 0 0 1 0,26" fill="none" stroke="#4a2c17" strokeWidth="2.5" />
      <rect x="165" y="49" width="70" height="9" rx="3" fill="#6f4423" opacity="0.55" />
      <rect x="70" y="90" width="260" height="11" rx="5" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="2" />
      <rect x="60" y="101" width="280" height="32" rx="9" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="2" />
      <rect x="246" y="108" width="78" height="19" rx="3" fill="#1f2937" />
      <text x="285" y="122" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#86efac">
        {fmt(wert)} g
      </text>
      <circle cx="96" cy="117" r="8" fill="none" stroke="#9ca3af" strokeWidth="2" />
      <rect x="84" y="133" width="26" height="6" rx="3" fill="#9ca3af" />
      <rect x="290" y="133" width="26" height="6" rx="3" fill="#9ca3af" />
    </svg>
  );
}

export default function SiebtraegerRechner() {
  const [sieb, setSieb] = useState<Sieb>('double');
  const [drinkId, setDrinkId] = useState<DrinkId>('single-espresso');
  const [voll, setVoll] = useState(false);
  const [pulver, setPulver] = useState(NORM_PULVER.double.wert);
  const [espresso, setEspresso] = useState(getraenkVon('single-espresso').espresso);
  const [optionalAktiv, setOptionalAktiv] = useState(false);
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

  // Auswahl wechseln: Pulver auf die Normdosis des Siebs, Espresso auf das
  // Normgewicht des Getränks. Ein festes 1:2 wäre für kein Getränk der Sollwert
  // und würde jeden Wechsel sofort als Fehler melden.
  const uebernehmeAuswahl = (naechsterSieb: Sieb, naechsteId: DrinkId, naechstesVoll: boolean) => {
    setSieb(naechsterSieb);
    setDrinkId(naechsteId);
    setVoll(naechstesVoll);
    setPulver(NORM_PULVER[naechsterSieb].wert);
    setEspresso(getraenkVon(naechsteId).espresso);
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

    // Alle Durchfluss-Angaben beziehen sich auf eine Tasse
    const normProTasse = getraenk.espresso;
    const oberesLimit = normProTasse / (NORM_BEZUGSZEIT.wert - NORM_BEZUGSZEIT.toleranz);
    const unteresLimit = normProTasse / (NORM_BEZUGSZEIT.wert + NORM_BEZUGSZEIT.toleranz);
    const fluss = espresso / bezugszeit;

    // Brühverhältnis gegen das Soll des Getränks
    const sollVerhaeltnis = getraenk.sollVerhaeltnis;
    let verhaeltnisStatus: 'ok' | 'hoch' | 'niedrig';
    if (bruehverhaeltnis > sollVerhaeltnis * (1 + TOLERANZ_VERHAELTNIS)) verhaeltnisStatus = 'hoch';
    else if (bruehverhaeltnis < sollVerhaeltnis * (1 - TOLERANZ_VERHAELTNIS)) verhaeltnisStatus = 'niedrig';
    else verhaeltnisStatus = 'ok';

    const verhaeltnisStatement =
      verhaeltnisStatus === 'ok'
        ? 'Das Brühverhältnis liegt im Soll.'
        : verhaeltnisStatus === 'hoch'
          ? 'Das Brühverhältnis ist zu hoch.'
          : 'Das Brühverhältnis ist zu niedrig.';
    const verhaeltnisSatz = `Soll für ${getraenk.name} ist ${fmtVerhaeltnis(sollVerhaeltnis)}.`;

    // Mahlgrad: der Durchfluss entscheidet, der Druck darf nicht widersprechen
    let mahlgradStatus: 'ok' | 'feiner' | 'groeber' | 'unklar';
    if (fluss > oberesLimit) mahlgradStatus = druck === 'hoch' ? 'unklar' : 'feiner';
    else if (fluss < unteresLimit) mahlgradStatus = druck === 'niedrig' ? 'unklar' : 'groeber';
    else mahlgradStatus = 'ok';

    const mahlgradStatement =
      mahlgradStatus === 'feiner'
        ? 'Kaffeepulver muss feiner gemahlen werden.'
        : mahlgradStatus === 'groeber'
          ? 'Kaffeepulver muss gröber gemahlen werden.'
          : mahlgradStatus === 'unklar'
            ? 'Druck und Durchfluss widersprechen sich.'
            : 'Der Mahlgrad passt.';

    const mahlgradSatz =
      mahlgradStatus === 'feiner'
        ? 'Es läuft mehr Espresso pro Sekunde in die Tasse, als das obere Limit erlaubt.'
        : mahlgradStatus === 'groeber'
          ? 'Es läuft weniger Espresso pro Sekunde in die Tasse, als das untere Limit vorgibt.'
          : mahlgradStatus === 'unklar'
            ? 'Prüfen Sie Pumpe, Tamper-Druck und Bohnenmenge, bevor Sie am Mahlgrad drehen.'
            : 'Das Espresso-Gewicht pro Sekunde liegt zwischen unterem und oberem Limit.';

    // Bezugszeit: welche Zeit hätte das Norm-Gewicht bzw. 1:2 in dieser Tasse ergeben?
    const zielProTasse1zu2 = (2 * pulver) / tassen;
    const zeitFuerNormgewicht = fluss > 0 ? normProTasse / fluss : 0;
    const zeitFuer1zu2 = fluss > 0 ? zielProTasse1zu2 / fluss : 0;

    // Die Bezugszeit wird gegen ihr eigenes Normfenster (25 s +/- 5 s) geprueft.
    // Ein Vergleich gegen zeitFuerNormgewicht kuerzt sich zu einem reinen
    // Gewichtsvergleich und wuerde nur die Espresso-Pruefung doppeln.
    let zeitStatus: 'ok' | 'laenger' | 'kuerzer';
    if (Math.abs(bezugszeit - NORM_BEZUGSZEIT.wert) <= NORM_BEZUGSZEIT.toleranz) zeitStatus = 'ok';
    else if (bezugszeit < NORM_BEZUGSZEIT.wert) zeitStatus = 'laenger';
    else zeitStatus = 'kuerzer';

    const zeitStatement =
      zeitStatus === 'ok'
        ? 'Die Bezugszeit passt.'
        : zeitStatus === 'laenger'
          ? 'Länger extrahieren.'
          : 'Kürzer extrahieren.';

    const zeitSatz =
      zeitStatus === 'ok'
        ? `${bezugszeit} s liegen im Normfenster von ${NORM_BEZUGSZEIT.wert} s ± ${NORM_BEZUGSZEIT.toleranz} s.`
        : zeitStatus === 'laenger'
          ? `${bezugszeit} s liegen unter dem Normfenster von ${NORM_BEZUGSZEIT.wert} s ± ${NORM_BEZUGSZEIT.toleranz} s. Für etwa ${fmtGanz(normProTasse)} g in der Tasse wären bei diesem Durchfluss etwa ${fmtGanz(zeitFuerNormgewicht)} s nötig.`
          : `${bezugszeit} s liegen über dem Normfenster von ${NORM_BEZUGSZEIT.wert} s ± ${NORM_BEZUGSZEIT.toleranz} s. Für etwa ${fmtGanz(normProTasse)} g in der Tasse hätten bei diesem Durchfluss etwa ${fmtGanz(zeitFuerNormgewicht)} s gereicht.`;

    // Toleranzen für Dosierung und Espresso-Gewicht
    const n = NORM_PULVER[sieb];
    const pulverOk = Math.abs(pulver - n.wert) <= n.toleranz;
    const espressoOk = Math.abs(espresso - normProTasse) <= getraenk.espressoToleranz;

    // Feinschliff-Empfehlung, wenn alles in der Toleranz liegt
    const kandidaten = [
      { was: 'die Dosierung', wert: pulver, norm: n.wert, einheit: 'g' },
      { was: 'das Espresso-Gewicht', wert: espresso, norm: normProTasse, einheit: 'g' },
      ...(optionalAktiv
        ? [{ was: 'die Bezugszeit', wert: bezugszeit, norm: NORM_BEZUGSZEIT.wert, einheit: 's' }]
        : []),
    ]
      .map((k) => ({ ...k, diff: k.wert - k.norm, rel: Math.abs(k.wert - k.norm) / k.norm }))
      // erst ab einer vollen Einheit Abweichung lohnt der Hinweis – sonst
      // würde eine 0,5-g-Abweichung als "etwa 1 g" gemeldet
      .filter((k) => Math.abs(k.diff) >= 1)
      .sort((a, b) => b.rel - a.rel);

    const feinschliff =
      kandidaten.length > 0
        ? `Wenn Sie noch optimieren wollen: ${kandidaten[0].was} liegt etwa ${fmtGanz(
            Math.abs(kandidaten[0].diff)
          )} ${kandidaten[0].einheit} ${kandidaten[0].diff > 0 ? 'über' : 'unter'} dem Normwert von etwa ${fmtGanz(
            kandidaten[0].norm
          )} ${kandidaten[0].einheit}.`
        : 'Alle Werte liegen praktisch auf den Normwerten – hier ist nichts mehr zu holen.';

    // Nächster Schritt
    let schrittStatement: string;
    let schrittSatz: string;
    let schrittFarbe: DiagnoseFarbe = 'bernstein';

    if (!optionalAktiv) {
      const offen: string[] = [];
      if (!pulverOk) offen.push('die Dosierung');
      if (!espressoOk) offen.push('das Espresso-Gewicht');
      if (verhaeltnisStatus !== 'ok') offen.push('das Brühverhältnis');
      if (offen.length > 0) {
        const liste = offen.length === 1 ? offen[0] : `${offen.slice(0, -1).join(', ')} und ${offen[offen.length - 1]}`;
        schrittStatement = `Zuerst ${liste} anpassen.`;
      } else {
        schrittStatement = 'Dosierung, Espresso-Gewicht und Brühverhältnis liegen in der Toleranz.';
        schrittFarbe = 'gruen';
      }
      schrittSatz =
        'Für die Mahlgrad- und Bezugszeit-Diagnose fehlen noch Brühdruck und Bezugszeit – bitte die optionalen Angaben oben aktivieren.';
    } else if (mahlgradStatus === 'feiner' || mahlgradStatus === 'groeber') {
      schrittStatement = `Zuerst den Mahlgrad anpassen: ${mahlgradStatus === 'feiner' ? 'feiner' : 'gröber'} mahlen.`;
      schrittSatz = 'Erst wenn der Durchfluss zwischen den Limits liegt, lohnt sich das Nachjustieren der Bezugszeit.';
    } else if (mahlgradStatus === 'unklar') {
      schrittStatement = 'Druck und Durchfluss passen nicht zusammen.';
      schrittSatz = 'Prüfen Sie Pumpe, Tamper-Druck und Bohnenmenge, bevor Sie am Mahlgrad drehen.';
    } else if (zeitStatus !== 'ok') {
      schrittStatement = `Der Mahlgrad passt. Als Nächstes die Bezugszeit einstellen: ${
        zeitStatus === 'laenger' ? 'länger' : 'kürzer'
      } extrahieren.`;
      schrittSatz = `Ziel sind etwa ${fmtGanz(normProTasse)} g in der Tasse, das entspricht etwa ${fmtGanz(
        zeitFuerNormgewicht
      )} s.`;
    } else if (!pulverOk) {
      schrittStatement = 'Mahlgrad und Bezugszeit passen. Als Nächstes die Dosierung anpassen.';
      schrittSatz = `Das Sieb ist auf etwa ${fmtGanz(n.wert)} g ausgelegt, eingestellt sind etwa ${fmtGanz(pulver)} g.`;
    } else if (!espressoOk) {
      schrittStatement = 'Mahlgrad, Bezugszeit und Dosierung passen. Als Nächstes das Espresso-Gewicht anpassen.';
      schrittSatz = `Für ${getraenk.name} sind etwa ${fmtGanz(normProTasse)} g pro Tasse vorgesehen, gewogen sind etwa ${fmtGanz(espresso)} g.`;
    } else if (verhaeltnisStatus !== 'ok') {
      schrittStatement = `Nur das Brühverhältnis liegt noch ${verhaeltnisStatus === 'hoch' ? 'über' : 'unter'} dem Soll.`;
      schrittSatz = `Soll für ${getraenk.name} ist ${fmtVerhaeltnis(sollVerhaeltnis)}.`;
    } else {
      schrittStatement = 'Alles OK – alle Werte liegen innerhalb der Toleranz.';
      schrittSatz = feinschliff;
      schrittFarbe = 'gruen';
    }

    return {
      espressoGesamt,
      bruehverhaeltnis,
      verhaeltnisStatus,
      verhaeltnisStatement,
      verhaeltnisSatz,
      sollVerhaeltnis,
      fluss,
      oberesLimit,
      unteresLimit,
      normProTasse,
      mahlgradStatus,
      mahlgradStatement,
      mahlgradSatz,
      zeitStatus,
      zeitStatement,
      zeitSatz,
      zeitFuerNormgewicht,
      zeitFuer1zu2,
      zielProTasse1zu2,
      pulverOk,
      espressoOk,
      pulverNorm: n.wert,
      schrittStatement,
      schrittSatz,
      schrittFarbe,
    };
  }, [espresso, tassen, pulver, bezugszeit, getraenk, druck, sieb, optionalAktiv]);

  const vergleich = (wert: number, norm: number) => {
    const diff = wert - norm;
    if (Math.abs(diff) < 0.05) return { wort: 'genau auf dem Normwert', farbe: 'text-emerald-700', diff: 0 };
    return diff > 0
      ? { wort: 'höher als der Normwert', farbe: 'text-amber-700', diff }
      : { wort: 'niedriger als der Normwert', farbe: 'text-sky-700', diff };
  };

  const pulverVergleich = vergleich(pulver, ergebnis.pulverNorm);
  const espressoVergleich = vergleich(espresso, getraenk.espresso);

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
    <div className="max-w-2xl mx-auto">
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
          viewBox="0 0 400 150"
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
          <rect x="120" y="6" width="160" height="18" rx="4" fill="#2f1c10" />
          <polygon points="132,24 268,24 250,62 150,62" fill="#4a2c17" />
          <rect x="268" y="34" width="104" height="16" rx="8" fill="#2f1c10" />
          <rect x="262" y="30" width="14" height="24" rx="3" fill="#4a2c17" />

          {sieb === 'single' ? (
            <>
              <polygon points="170,62 200,62 194,80 176,80" fill="#3b2415" />
              <rect x="183" y="80" width="4" height="26" fill="#8b5a2b" opacity="0.85" />
              <path d="M158,108 h54 l-6,30 h-42 z" fill="#ffffff" stroke="#4a2c17" strokeWidth="2.5" />
              <path d="M212,114 a10,10 0 0 1 0,18" fill="none" stroke="#4a2c17" strokeWidth="2.5" />
              <rect x="162" y="112" width="46" height="7" rx="2" fill="#6f4423" opacity="0.55" />
            </>
          ) : (
            <>
              <polygon points="152,62 182,62 176,80 158,80" fill="#3b2415" />
              <polygon points="218,62 248,62 242,80 224,80" fill="#3b2415" />
              <rect x="165" y="80" width="4" height={voll ? 30 : 26} fill="#8b5a2b" opacity="0.85" />
              <rect x="231" y="80" width="4" height={voll ? 30 : 26} fill="#8b5a2b" opacity="0.85" />

              {voll ? (
                <>
                  <path d="M140,112 h120 l-9,32 h-102 z" fill="#ffffff" stroke="#4a2c17" strokeWidth="2.5" />
                  <path d="M260,118 a11,11 0 0 1 0,20" fill="none" stroke="#4a2c17" strokeWidth="2.5" />
                  <rect x="145" y="116" width="110" height="8" rx="2" fill="#6f4423" opacity="0.55" />
                </>
              ) : (
                <>
                  <path d="M140,108 h54 l-6,30 h-42 z" fill="#ffffff" stroke="#4a2c17" strokeWidth="2.5" />
                  <path d="M194,114 a10,10 0 0 1 0,18" fill="none" stroke="#4a2c17" strokeWidth="2.5" />
                  <rect x="144" y="112" width="46" height="7" rx="2" fill="#6f4423" opacity="0.55" />
                  <path d="M206,108 h54 l-6,30 h-42 z" fill="#ffffff" stroke="#4a2c17" strokeWidth="2.5" />
                  <path d="M260,114 a10,10 0 0 1 0,18" fill="none" stroke="#4a2c17" strokeWidth="2.5" />
                  <rect x="210" y="112" width="46" height="7" rx="2" fill="#6f4423" opacity="0.55" />
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
            <p className="text-xs font-medium text-gray-500">Linker Auslass</p>
            {halbeListe.map((g) =>
              auswahlKarte(g, !voll && drinkId === g.id, () => uebernehmeAuswahl(sieb, g.id, false))
            )}
          </div>
          <div className="space-y-3">
            <p className="text-xs font-medium text-gray-500">Rechter Auslass</p>
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
          <WaageMitPulver wert={pulver} />
          <input
            type="range"
            min={pulverGrenzen.min}
            max={pulverGrenzen.max}
            step={0.5}
            value={pulver}
            onChange={(e) => setPulver(parseFloat(e.target.value))}
            className="w-full mt-4 accent-[#4a2c17]"
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
          <WaageMitTasse wert={espresso} />
          <input
            type="range"
            min={espressoGrenzen.min}
            max={espressoGrenzen.max}
            step={0.5}
            value={espresso}
            onChange={(e) => setEspresso(parseFloat(e.target.value))}
            className="w-full mt-4 accent-[#4a2c17]"
            aria-label="Espresso-Gewicht pro Tasse in Gramm"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{fmt(espressoGrenzen.min)} g</span>
            <span>{fmt(espressoGrenzen.max)} g</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Normwert für {getraenk.name}: {fmt(getraenk.espresso)} g ± {fmt(getraenk.espressoToleranz)} g
            {tassen === 2 && (
              <>
                {' '}– zwei Tassen à {fmt(espresso)} g = <strong>{fmt(ergebnis.espressoGesamt)} g</strong> Gesamtbezug
              </>
            )}
          </p>
        </label>
      </div>

      {/* Optionale Angaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={optionalAktiv}
            onChange={(e) => setOptionalAktiv(e.target.checked)}
            className="w-5 h-5 accent-[#4a2c17]"
          />
          <span className="text-gray-700 font-medium">Brühdruck und Bezugszeit angeben</span>
          <span className="text-xs text-gray-400">(optional)</span>
        </label>

        {optionalAktiv && (
          <div className="mt-6 space-y-6">
            {/* Druck */}
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-2">Brühdruck</span>
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
            <label className="block">
              <span className="text-gray-700 font-medium">Bezugszeit (Sekunden)</span>
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
        )}
      </div>

      {/* Ergebnis: Brühverhältnis */}
      <div className="bg-gradient-to-br from-[#4a2c17] to-[#7a4a28] rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-[#e2d0bf] mb-1 text-center">Brühverhältnis</h3>
        <div className="text-center">
          <span className="text-5xl font-bold">{fmtVerhaeltnis(ergebnis.bruehverhaeltnis)}</span>
        </div>
        <div className="mt-4">
          <Diagnose statement={ergebnis.verhaeltnisStatement} satz={ergebnis.verhaeltnisSatz} />
        </div>
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-2 text-sm mt-4">
          <div className="flex justify-between">
            <span className="text-[#e2d0bf]">Gesamtbezug</span>
            <span className="font-semibold">{fmt(ergebnis.espressoGesamt)} g</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#e2d0bf]">Kaffeepulver</span>
            <span className="font-semibold">{fmt(pulver)} g</span>
          </div>
        </div>
      </div>

      {/* Mahlgrad-Diagnose */}
      {optionalAktiv && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-3">Mahlgrad-Diagnose</h3>
          <Diagnose statement={ergebnis.mahlgradStatement} satz={ergebnis.mahlgradSatz} />
          <div className="mt-4 space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Espresso-Gewicht pro Sekunde</span>
              <span className="font-medium">{fmt(ergebnis.fluss, 2)} g/s</span>
            </div>
            <div className="flex justify-between">
              <span>oberes Limit ({NORM_BEZUGSZEIT.wert - NORM_BEZUGSZEIT.toleranz} s)</span>
              <span className="font-medium">{fmt(ergebnis.oberesLimit, 2)} g/s</span>
            </div>
            <div className="flex justify-between">
              <span>unteres Limit ({NORM_BEZUGSZEIT.wert + NORM_BEZUGSZEIT.toleranz} s)</span>
              <span className="font-medium">{fmt(ergebnis.unteresLimit, 2)} g/s</span>
            </div>
          </div>
        </div>
      )}

      {/* Bezugszeit-Diagnose */}
      {optionalAktiv && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-3">Bezugszeit-Diagnose</h3>
          <Diagnose statement={ergebnis.zeitStatement} satz={ergebnis.zeitSatz} />
          <div className="mt-4 space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Zeit für {fmt(ergebnis.normProTasse)} g in der Tasse</span>
              <span className="font-medium">{fmt(ergebnis.zeitFuerNormgewicht)} s</span>
            </div>
            <div className="flex justify-between">
              <span>Zeit für Verhältnis 1:2 ({fmt(ergebnis.zielProTasse1zu2)} g in der Tasse)</span>
              <span className="font-medium">{fmt(ergebnis.zeitFuer1zu2)} s</span>
            </div>
          </div>
        </div>
      )}

      {/* Nächster Schritt */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">Nächster Schritt</h3>
        <Diagnose statement={ergebnis.schrittStatement} satz={ergebnis.schrittSatz} farbe={ergebnis.schrittFarbe} />
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
          <li>Espresso-Toleranz je Getränk: 12,5 % des Normgewichts – dieselbe relative Spanne wie beim Single-Shot-Sieb</li>
          <li>Brühverhältnis und Espresso-Gewicht pro Sekunde als reine Massenbilanz (Physik)</li>
        </ul>
      </div>
    </div>
  );
}
