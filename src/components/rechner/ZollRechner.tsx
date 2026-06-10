import { useState } from 'react';

// Zoll-Rechner – Einfuhrabgaben für Bestellungen aus Nicht-EU-Staaten
// Stand: 5. Juni 2026
// Quellen:
//  - https://www.zoll.de/DE/Privatpersonen/Postsendungen-Internetbestellungen/Sendungen-aus-einem-Nicht-EU-Staat/Zoll-und-Steuern/Internetbestellungen/internetbestellungen_node.html
//  - https://www.zoll.de/SharedDocs/Boxen/DE/Fragen/0082_beispiele_zollsaetze.html
//
// Regeln (Stand 06/2026, vor der Reform zum 1. Juli 2026):
//  - Einfuhrumsatzsteuer (EUSt): 19 % (bzw. 7 %) – ab dem ersten Euro, keine 22-€-Freigrenze mehr (seit 1.7.2021)
//  - Zoll: erst ab Sachwert über 150 € (darunter zollfrei, EUSt fällt trotzdem an)
//  - Zollwert  = Warenwert + Versandkosten bis zur EU-Außengrenze
//  - EUSt-Bemessungsgrundlage = Zollwert + Zollbetrag
//
// Hinweis zur 2026-Reform: Die EU schafft die 150-€-Zollfreigrenze zum 1. Juli 2026 ab.
// Übergangsweise (1.7.2026–1.7.2028) ist ein Pauschalzoll von 3 € je Warenkategorie geplant.

// Warenarten mit beispielhaften Zollsätzen (Anhaltspunkte laut zoll.de – können je nach Beschaffenheit abweichen)
const WARENARTEN: { id: string; label: string; zollsatz: number; hinweis: string }[] = [
  { id: 'elektronik', label: 'Elektronik (Smartphone, Laptop, Tablet, Kamera)', zollsatz: 0, hinweis: 'IT-Waren sind nach dem ITA-Abkommen zollfrei (0 %).' },
  { id: 'bekleidung', label: 'Bekleidung / Textilien (T-Shirt, Pullover, Hose)', zollsatz: 12, hinweis: 'Textile Bekleidung: 8–12 % – wir rechnen mit dem oberen Richtwert 12 %.' },
  { id: 'schuhe_leder', label: 'Schuhe mit Lederoberteil', zollsatz: 8, hinweis: 'Lederschuhe: 5–8 % – wir rechnen mit 8 %.' },
  { id: 'schuhe_synthetik', label: 'Schuhe ohne Leder (Sneaker, Synthetik)', zollsatz: 17, hinweis: 'Schuhe ohne Lederoberteil: bis ca. 17 %.' },
  { id: 'lederwaren', label: 'Taschen & Lederwaren', zollsatz: 9.7, hinweis: 'Handtaschen / Lederwaren: 3–9,7 % – wir rechnen mit 9,7 %.' },
  { id: 'fahrrad', label: 'Fahrrad', zollsatz: 14, hinweis: 'Fahrräder: 14 %.' },
  { id: 'buecher', label: 'Bücher', zollsatz: 0, hinweis: 'Bücher sind zollfrei (0 %), reduzierte EUSt 7 % möglich.' },
  { id: 'moebel', label: 'Möbel', zollsatz: 0, hinweis: 'Möbel: 0 – 5,6 % – wir rechnen mit 0 %.' },
  { id: 'sonstiges', label: 'Sonstige Ware (Schätzwert wählen)', zollsatz: 4, hinweis: 'Ohne genaue Zolltarifnummer dient 4 % als grober Mittelwert. Bitte im EZT-Online prüfen.' },
];

export default function ZollRechner() {
  const [warenwert, setWarenwert] = useState<number | ''>(200);
  const [versand, setVersand] = useState<number | ''>(15);
  const [warenart, setWarenart] = useState('bekleidung');
  const [eustSatz, setEustSatz] = useState(19);

  const warenwertNum = typeof warenwert === 'number' ? warenwert : 0;
  const versandNum = typeof versand === 'number' ? versand : 0;
  const art = WARENARTEN.find((w) => w.id === warenart) ?? WARENARTEN[0];

  // Zollwert = Warenwert + Versandkosten
  const zollwert = warenwertNum + versandNum;

  // Zoll fällt erst ab Sachwert (Warenwert) über 150 € an
  const zollpflichtig = warenwertNum > 150;
  const zollsatz = zollpflichtig ? art.zollsatz : 0;
  const zollbetrag = zollwert * (zollsatz / 100);

  // EUSt-Bemessungsgrundlage = Zollwert + Zoll
  const eustBasis = zollwert + zollbetrag;
  const eustBetrag = eustBasis * (eustSatz / 100);

  const abgabenGesamt = zollbetrag + eustBetrag;
  const endpreis = zollwert + abgabenGesamt;

  const fmt = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Eingabe */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Ihre Bestellung aus dem Nicht-EU-Ausland</h2>

        <div className="space-y-5">
          <label className="block">
            <span className="text-gray-700 font-medium">Warenwert (Kaufpreis)</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                value={warenwert}
                onChange={(e) => setWarenwert(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value)))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                placeholder="z. B. 200"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
            <span className="text-xs text-gray-500 mt-1 block">Preis der Ware ohne Versand – maßgeblich für die 150-€-Zollgrenze.</span>
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium">Versandkosten</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                value={versand}
                onChange={(e) => setVersand(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value)))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                placeholder="z. B. 15"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
            <span className="text-xs text-gray-500 mt-1 block">Versand zählt zum Zollwert und zur EUSt-Bemessungsgrundlage.</span>
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium">Warenart</span>
            <select
              value={warenart}
              onChange={(e) => setWarenart(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-base bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            >
              {WARENARTEN.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label} – Zoll {w.zollsatz.toLocaleString('de-DE')} %
                </option>
              ))}
            </select>
            <span className="text-xs text-gray-500 mt-1 block">{art.hinweis}</span>
          </label>

          <div>
            <span className="text-gray-700 font-medium">Einfuhrumsatzsteuer-Satz</span>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                onClick={() => setEustSatz(19)}
                className={`rounded-xl py-3 font-semibold transition-all ${
                  eustSatz === 19 ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                19 % (Regelsatz)
              </button>
              <button
                onClick={() => setEustSatz(7)}
                className={`rounded-xl py-3 font-semibold transition-all ${
                  eustSatz === 7 ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                7 % (ermäßigt)
              </button>
            </div>
            <span className="text-xs text-gray-500 mt-1 block">7 % gilt z. B. für Bücher und bestimmte Lebensmittel.</span>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Einfuhrabgaben gesamt</h3>
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{fmt(abgabenGesamt)}</span>
            <span className="text-xl text-blue-200">€</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">Zoll + Einfuhrumsatzsteuer</p>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-blue-100">Zollwert (Ware + Versand)</span>
            <span className="font-semibold">{fmt(zollwert)} €</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-blue-100">
              Zoll ({zollpflichtig ? `${art.zollsatz.toLocaleString('de-DE')} %` : 'entfällt – unter 150 €'})
            </span>
            <span className="font-semibold">{fmt(zollbetrag)} €</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-blue-100">Einfuhrumsatzsteuer ({eustSatz} %)</span>
            <span className="font-semibold">{fmt(eustBetrag)} €</span>
          </div>
          <div className="border-t border-white/20 pt-3 flex justify-between items-center">
            <span className="text-blue-100">Gesamtkosten inkl. Abgaben</span>
            <span className="text-xl font-bold">{fmt(endpreis)} €</span>
          </div>
        </div>

        {!zollpflichtig && warenwertNum > 0 && (
          <p className="text-xs text-blue-100 mt-4 bg-white/10 rounded-lg p-3">
            Bei einem Warenwert bis 150 € ist die Sendung zollfrei – die Einfuhrumsatzsteuer
            ({eustSatz} %) wird aber ab dem ersten Euro fällig.
          </p>
        )}
        {zollpflichtig && (
          <p className="text-xs text-blue-100 mt-4 bg-white/10 rounded-lg p-3">
            Warenwert über 150 € – zusätzlich zur EUSt fällt der warenspezifische Zoll an. Bei
            einem Sachwert bis 700 € ist alternativ ein pauschaler Abgabensatz von 17,5 % möglich.
          </p>
        )}
      </div>

      {/* So funktioniert's */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So rechnet der Zoll</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Einfuhrumsatzsteuer</strong> 19 % (bzw. 7 %) – seit Juli 2021 ab dem ersten Euro, ohne 22-€-Freigrenze.</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Zoll</strong> erst ab einem Warenwert über <strong>150 €</strong> – darunter zollfrei.</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Zollwert</strong> = Warenwert <strong>plus Versandkosten</strong> bis zur EU-Außengrenze.</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Die EUSt wird auf <strong>Zollwert + Zoll</strong> berechnet.</span>
          </li>
        </ul>
      </div>

      {/* 2026-Reform-Hinweis */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">📅 Reform zum 1. Juli 2026</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium text-yellow-800">150-€-Zollfreigrenze fällt weg</p>
              <p className="text-yellow-700">Die EU schafft die zollfreie Grenze von 150 € zum 1. Juli 2026 ab – dann wird jede Sendung aus dem Nicht-EU-Ausland zollpflichtig.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">📦</span>
            <div>
              <p className="font-medium text-blue-800">3-Euro-Pauschalzoll als Übergang</p>
              <p className="text-blue-700">Für Sendungen unter 150 € ist von Juli 2026 bis Juli 2028 ein Pauschalzoll von 3 € je Warenkategorie geplant. Dieser Rechner bildet die Regeln <strong>vor</strong> der Reform ab (Stand Juni 2026).</p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Wichtiger Hinweis</h3>
        <div className="flex gap-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-600">
          <span className="text-xl">ℹ️</span>
          <p>
            Die hinterlegten Zollsätze sind <strong>Anhaltspunkte laut Zoll</strong> und können je nach
            genauer Zolltarifnummer abweichen. Diese Berechnung erfolgt <strong>ohne Gewähr</strong> und
            ersetzt keine verbindliche Zollauskunft. Den exakten Zollsatz Ihrer Ware finden Sie im
            EZT-Online (Elektronischer Zolltarif).
          </p>
        </div>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.zoll.de/DE/Privatpersonen/Postsendungen-Internetbestellungen/Sendungen-aus-einem-Nicht-EU-Staat/Zoll-und-Steuern/Internetbestellungen/internetbestellungen_node.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Zoll online – Internetbestellungen aus Nicht-EU-Staaten
          </a>
          <a
            href="https://www.zoll.de/SharedDocs/Boxen/DE/Fragen/0082_beispiele_zollsaetze.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Zoll online – Beispiele für Warenarten und Zollsätze
          </a>
        </div>
      </div>
    </div>
  );
}
