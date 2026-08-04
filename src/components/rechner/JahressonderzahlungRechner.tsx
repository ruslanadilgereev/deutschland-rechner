import { useMemo, useState } from 'react';

// =============================================================
// Jahressonderzahlung-Rechner (TVöD VKA, TVöD Bund, TV-L)
// Stand: Kalenderjahr 2026 (Auszahlung mit dem November-Entgelt)
// =============================================================
// Rechtsgrundlagen (Quellen siehe Seite):
// - § 20 TVöD (VKA)  – Bemessungssätze ab 2026 vereinheitlicht auf 85 %,
//                      90 % für EG 1–8 in den Besonderen Teilen K und B
//                      (Krankenhäuser bzw. Pflege-/Betreuungseinrichtungen).
//                      Grundlage: Tarifeinigung Bund/VKA vom 06.04.2025.
// - § 20 TVöD (Bund) – ab 2026 gestaffelt 95 / 90 / 75 % (vorher 90 / 80 / 60 %).
// - § 20 TV-L        – Bemessungssätze seit der Tarifrunde 2019 eingefroren.
// - § 29a TVöD       – Umwandlung eines Teils der Jahressonderzahlung in bis zu
//                      drei Freistellungstage (VKA und Bund, ab 2026).
//
// Bemessungszeitraum ist in allen drei Tarifwerken das durchschnittlich
// gezahlte monatliche Entgelt der Kalendermonate Juli, August und September.
// Überstundenentgelt, Leistungszulagen und Leistungsprämien bleiben außer Betracht.

type Tarif = 'vka' | 'bund' | 'tvl';

// Entgeltgruppen-Bänder je Tarifwerk. Der Schlüssel ist die Gruppe, wie sie in
// der Auswahl steht; der Wert ist der Bemessungssatz in Prozent.
const GRUPPEN_TVOED = [
  '1', '2', '3', '4', '5', '6', '7', '8',
  '9a', '9b', '9c', '10', '11', '12', '13', '14', '15',
] as const;

const GRUPPEN_TVL = [
  '1', '2', '3', '4', '5', '6', '7', '8',
  '9a', '9b', '10', '11', '12', '13', '14', '15',
] as const;

// Ordnungszahl einer Entgeltgruppe für Bereichsvergleiche (9a/9b/9c -> 9).
function gruppenZahl(g: string): number {
  return parseInt(g, 10);
}

// --- Bemessungssätze 2026 -------------------------------------------------
function satz2026(tarif: Tarif, gruppe: string, besondererTeilKB: boolean): number {
  const n = gruppenZahl(gruppe);
  if (tarif === 'vka') {
    // Ab 2026 einheitlich 85 %; 90 % nur für EG 1–8 in den Besonderen Teilen K/B.
    return besondererTeilKB && n <= 8 ? 90 : 85;
  }
  if (tarif === 'bund') {
    if (n <= 8) return 95;
    if (n <= 12) return 90;
    return 75;
  }
  // TV-L (eingefroren)
  if (n <= 4) return 87.43;
  if (n <= 8) return 88.14;
  if (n <= 11) return 74.35;
  if (n <= 13) return 46.47;
  return 32.53;
}

// --- Bemessungssätze 2025 (für den Vorjahresvergleich) --------------------
function satz2025(tarif: Tarif, gruppe: string): number {
  const n = gruppenZahl(gruppe);
  if (tarif === 'vka') {
    if (n <= 8) return 84.51;
    if (n <= 12) return 70.28;
    return 51.78;
  }
  if (tarif === 'bund') {
    if (n <= 8) return 90;
    if (n <= 12) return 80;
    return 60;
  }
  // TV-L: unverändert eingefroren, 2025 = 2026
  return satz2026('tvl', gruppe, false);
}

const TARIF_LABEL: Record<Tarif, string> = {
  vka: 'TVöD VKA (Kommunen)',
  bund: 'TVöD Bund',
  tvl: 'TV-L (Länder)',
};

// Ein Freistellungstag entspricht nach § 29a TVöD rund 5,4 % der
// Jahressonderzahlung (Umrechnung über die durchschnittliche Monatsarbeitszeit).
const FREISTELLUNGSTAG_ANTEIL = 5.4;

function eur(n: number): string {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function prozent(n: number): string {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' %';
}

export default function JahressonderzahlungRechner() {
  const [tarif, setTarif] = useState<Tarif>('vka');
  const [gruppe, setGruppe] = useState('9a');
  const [besondererTeilKB, setBesondererTeilKB] = useState(false);
  const [entgeltEinfach, setEntgeltEinfach] = useState(3400);
  const [einzelmonate, setEinzelmonate] = useState(false);
  const [juli, setJuli] = useState(3400);
  const [august, setAugust] = useState(3400);
  const [september, setSeptember] = useState(3400);
  const [monate, setMonate] = useState(12);
  const [freistellungstage, setFreistellungstage] = useState(0);

  const gruppen = tarif === 'tvl' ? GRUPPEN_TVL : GRUPPEN_TVOED;

  const e = useMemo(() => {
    // 1. Bemessungsentgelt: Durchschnitt Juli/August/September
    const bemessungsentgelt = einzelmonate
      ? (juli + august + september) / 3
      : entgeltEinfach;

    // 2. Bemessungssatz nach Tarifwerk und Entgeltgruppe
    const satz = satz2026(tarif, gruppe, besondererTeilKB);
    const vorjahresSatz = satz2025(tarif, gruppe);

    // 3. Ungekürzte Jahressonderzahlung
    const voll = bemessungsentgelt * (satz / 100);
    const vollVorjahr = bemessungsentgelt * (vorjahresSatz / 100);

    // 4. Zwölftelung: je Kalendermonat ohne Entgeltanspruch -1/12
    const faktor = Math.min(12, Math.max(0, monate)) / 12;
    const nachZwoelftelung = voll * faktor;
    const nachZwoelftelungVorjahr = vollVorjahr * faktor;

    // 5. Umwandlung in Freistellungstage (§ 29a, nur TVöD)
    const umwandlungMoeglich = tarif !== 'tvl';
    const tage = umwandlungMoeglich ? freistellungstage : 0;
    const abzugUmwandlung = nachZwoelftelung * (tage * FREISTELLUNGSTAG_ANTEIL) / 100;
    const auszahlung = nachZwoelftelung - abzugUmwandlung;

    const differenzVorjahr = nachZwoelftelung - nachZwoelftelungVorjahr;

    return {
      bemessungsentgelt,
      satz,
      vorjahresSatz,
      voll,
      faktor,
      nachZwoelftelung,
      nachZwoelftelungVorjahr,
      differenzVorjahr,
      umwandlungMoeglich,
      tage,
      abzugUmwandlung,
      auszahlung,
    };
  }, [tarif, gruppe, besondererTeilKB, entgeltEinfach, einzelmonate, juli, august, september, monate, freistellungstage]);

  const inputClass =
    'w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none';

  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-5">Ihre Angaben</h2>

        <div className="space-y-5">
          <label className="block">
            <span className="text-gray-700 font-medium">Tarifvertrag</span>
            <select
              value={tarif}
              onChange={(ev) => {
                const t = ev.target.value as Tarif;
                setTarif(t);
                if (t === 'tvl' && gruppe === '9c') setGruppe('9b');
                if (t !== 'vka') setBesondererTeilKB(false);
              }}
              className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl text-lg bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            >
              <option value="vka">TVöD VKA – Kommunen, kommunale Betriebe</option>
              <option value="bund">TVöD Bund – Bundesverwaltung</option>
              <option value="tvl">TV-L – Länder (außer Hessen)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Bei den Ländern gilt der TV-L. Hessen hat mit dem TV-H ein eigenes Tarifwerk.
            </p>
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium">Entgeltgruppe</span>
            <select
              value={gruppe}
              onChange={(ev) => setGruppe(ev.target.value)}
              className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl text-lg bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            >
              {gruppen.map((g) => (
                <option key={g} value={g}>
                  {tarif === 'tvl' ? 'E ' : 'EG '}
                  {g}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Maßgeblich ist die Eingruppierung am 1. September.
              {tarif === 'vka' &&
                ' Die Pflegetabelle (P) und der Sozial- und Erziehungsdienst (S) folgen demselben Satz von 85 %.'}
              {tarif === 'tvl' && ' Im TV-L sind die Sätze nach Entgeltgruppen gestaffelt.'}
            </p>
          </label>

          {tarif === 'vka' && gruppenZahl(gruppe) <= 8 && (
            <label className="flex items-start gap-3 cursor-pointer bg-teal-50 rounded-xl p-4">
              <input
                type="checkbox"
                checked={besondererTeilKB}
                onChange={(ev) => setBesondererTeilKB(ev.target.checked)}
                className="w-5 h-5 mt-0.5 rounded text-teal-600 focus:ring-teal-500"
              />
              <span className="text-gray-700 text-sm">
                Beschäftigung in einem <strong>Krankenhaus (BT-K)</strong> oder einer{' '}
                <strong>Pflege- und Betreuungseinrichtung (BT-B)</strong>
                <span className="block text-gray-500 mt-0.5">
                  Dort gilt in den Entgeltgruppen 1 bis 8 ein Bemessungssatz von 90 % statt 85 %,
                  weil die Umwandlung in Freistellungstage dort nicht offensteht.
                </span>
              </span>
            </label>
          )}

          {!einzelmonate ? (
            <label className="block">
              <span className="text-gray-700 font-medium">
                Monatliches Entgelt (Durchschnitt Juli bis September)
              </span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={entgeltEinfach}
                  onChange={(ev) => setEntgeltEinfach(Math.max(0, Number(ev.target.value)))}
                  className={inputClass}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
              <button
                onClick={() => {
                  setJuli(entgeltEinfach);
                  setAugust(entgeltEinfach);
                  setSeptember(entgeltEinfach);
                  setEinzelmonate(true);
                }}
                className="mt-2 text-sm text-teal-700 hover:text-teal-900 underline underline-offset-2"
              >
                Entgelt schwankte? Monate einzeln eingeben
              </button>
            </label>
          ) : (
            <div className="block">
              <span className="text-gray-700 font-medium">Entgelt je Bemessungsmonat</span>
              <div className="mt-2 grid grid-cols-3 gap-3">
                {[
                  { label: 'Juli', val: juli, set: setJuli },
                  { label: 'August', val: august, set: setAugust },
                  { label: 'September', val: september, set: setSeptember },
                ].map((m) => (
                  <label key={m.label} className="block">
                    <span className="text-xs text-gray-500">{m.label}</span>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={m.val}
                      onChange={(ev) => m.set(Math.max(0, Number(ev.target.value)))}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                  </label>
                ))}
              </div>
              <button
                onClick={() => setEinzelmonate(false)}
                className="mt-2 text-sm text-teal-700 hover:text-teal-900 underline underline-offset-2"
              >
                Zurück zum Durchschnittswert
              </button>
            </div>
          )}

          <label className="block">
            <span className="text-gray-700 font-medium">
              Monate mit Entgeltanspruch im Kalenderjahr
            </span>
            <select
              value={monate}
              onChange={(ev) => setMonate(Number(ev.target.value))}
              className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl text-lg bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            >
              {Array.from({ length: 13 }, (_, i) => 12 - i).map((m) => (
                <option key={m} value={m}>
                  {m} {m === 1 ? 'Monat' : 'Monate'}
                  {m === 12 ? ' (ganzjährig beschäftigt)' : ''}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Je Kalendermonat ohne Entgeltanspruch wird um 1/12 gekürzt. Mutterschutzfristen und
              Elternzeit im Geburtsjahr des Kindes kürzen nicht.
            </p>
          </label>

          {e.umwandlungMoeglich && (
            <label className="block">
              <span className="text-gray-700 font-medium">
                Umwandlung in Freistellungstage (§ 29a)
              </span>
              <select
                value={freistellungstage}
                onChange={(ev) => setFreistellungstage(Number(ev.target.value))}
                className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl text-lg bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              >
                <option value={0}>Keine Umwandlung – volle Auszahlung</option>
                <option value={1}>1 Freistellungstag</option>
                <option value={2}>2 Freistellungstage</option>
                <option value={3}>3 Freistellungstage</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Antrag bis zum 1. September. Je Tag werden rund {prozent(FREISTELLUNGSTAG_ANTEIL)} der
                Jahressonderzahlung einbehalten. In Krankenhäusern und Pflegeeinrichtungen (BT-K/BT-B)
                steht die Umwandlung nicht offen.
              </p>
            </label>
          )}
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <p className="text-gray-600 text-sm mb-1">
          Jahressonderzahlung 2026 brutto, {TARIF_LABEL[tarif]}
        </p>
        <p className="text-5xl font-bold text-teal-700 mb-1">{eur(e.auszahlung)}</p>
        <p className="text-gray-500 text-sm mb-6">
          Auszahlung mit dem Tabellenentgelt für November 2026
        </p>

        <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Bemessungsentgelt (Ø Juli–September)</span>
            <span className="font-medium text-gray-800">{eur(e.bemessungsentgelt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">
              Bemessungssatz {tarif === 'tvl' ? 'E' : 'EG'} {gruppe}
            </span>
            <span className="font-medium text-gray-800">{prozent(e.satz)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Ungekürzte Jahressonderzahlung</span>
            <span className="font-medium text-gray-800">{eur(e.voll)}</span>
          </div>
          {e.faktor < 1 && (
            <div className="flex justify-between">
              <span className="text-gray-600">
                Zwölftelung ({monate}/12 Monate)
              </span>
              <span className="font-medium text-amber-700">
                −{eur(e.voll - e.nachZwoelftelung)}
              </span>
            </div>
          )}
          {e.tage > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">
                {e.tage} {e.tage === 1 ? 'Freistellungstag' : 'Freistellungstage'} (§ 29a)
              </span>
              <span className="font-medium text-amber-700">−{eur(e.abzugUmwandlung)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-100 pt-2">
            <span className="text-gray-800 font-medium">Auszahlungsbetrag brutto</span>
            <span className="font-bold text-teal-700">{eur(e.auszahlung)}</span>
          </div>
        </div>
      </div>

      {/* Vorjahresvergleich */}
      {e.differenzVorjahr > 0.005 ? (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-teal-900 mb-2">
            {eur(e.differenzVorjahr)} mehr als 2025
          </h3>
          <p className="text-sm text-teal-900/80">
            Die Tarifeinigung vom 6. April 2025 hat die Bemessungssätze ab dem Kalenderjahr 2026
            angehoben. In Ihrer Konstellation steigt der Satz von {prozent(e.vorjahresSatz)} auf{' '}
            {prozent(e.satz)} – das sind bei gleichem Entgelt{' '}
            <strong>{eur(e.nachZwoelftelungVorjahr)}</strong> im Jahr 2025 gegenüber{' '}
            <strong>{eur(e.nachZwoelftelung)}</strong> im Jahr 2026 (jeweils vor einer Umwandlung in
            Freistellungstage).
          </p>
        </div>
      ) : (
        tarif === 'tvl' && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-2">Im TV-L unverändert</h3>
            <p className="text-sm text-gray-600">
              Die Bemessungssätze des TV-L sind seit der Tarifrunde 2019 eingefroren und wurden
              seither nicht an die Tabellenerhöhungen angepasst. Die Anhebung der Jahressonderzahlung
              ab 2026 betrifft nur den TVöD bei Bund und Kommunen, nicht die Länder.
            </p>
          </div>
        )
      )}

      {/* Netto-Hinweis */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-2">Was bleibt netto übrig?</h3>
        <p className="text-sm text-gray-600">
          Die Jahressonderzahlung ist ein sonstiger Bezug und wird nach der Jahreslohnsteuer-
          Differenzmethode versteuert. Der Abzug fällt daher meist höher aus als beim laufenden
          Gehalt. Den Nettobetrag schätzen Sie mit dem{' '}
          <a
            href="/weihnachtsgeld-rechner"
            className="text-teal-700 font-medium underline underline-offset-2 hover:text-teal-900"
          >
            Weihnachtsgeld-Rechner
          </a>
          , indem Sie den hier ermittelten Bruttobetrag dort als Sonderzahlung eintragen.
        </p>
      </div>

      {/* Disclaimer + Quellen */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-sm text-gray-600">
        <p className="mb-3">
          <strong>Hinweis:</strong> Diese Berechnung ist eine Orientierung nach den tariflichen
          Regelsätzen und ersetzt keine Entgeltabrechnung und keine Rechtsberatung. Maßgeblich sind
          Ihr Tarifvertrag, etwaige Besondere Teile sowie landes- oder betriebsspezifische
          Regelungen. Überstundenentgelt, Leistungszulagen und Leistungsprämien zählen nicht zum
          Bemessungsentgelt.
        </p>
        <p className="font-medium text-gray-700 mb-1">Quellen</p>
        <ul className="list-disc list-inside space-y-1">
          <li>§ 20 TVöD (VKA) – Jahressonderzahlung, Bemessungssätze ab 2026</li>
          <li>§ 20 TVöD (Bund) – Jahressonderzahlung, Bemessungssätze ab 2026</li>
          <li>§ 29a TVöD – Umwandlung in Freistellungstage (Bund und VKA)</li>
          <li>§ 20 TV-L – Jahressonderzahlung, Bemessungssätze eingefroren seit Tarifrunde 2019</li>
          <li>Tarifeinigung Bund/VKA vom 6. April 2025</li>
        </ul>
      </div>
    </div>
  );
}
