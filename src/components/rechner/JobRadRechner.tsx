import { useState } from 'react';

// JobRad- & Dienstrad-Rechner – 0,25%-Regelung (seit 2020)
// Geldwerter Vorteil = 0,25% des UVP pro Monat. Berechnungsweise des Finanzamts:
// UVP geviertelt, auf volle 100 € abgerundet, davon 1% => entspricht 0,25% des
// abgerundeten Viertels. Quelle: BMF-Schreiben v. 09.01.2020 (gleich lautende
// Ländererlasse), JobRad, Finanztip.
// Beispiel: UVP 2.500 € -> 2.500/4 = 625 -> abgerundet 600 -> 1% = 6,00 €/Monat.

// Sozialversicherungs-Arbeitnehmeranteil (Näherung, 2026): RV 9,3% + AV 1,3%
// + KV ~8,75% (7,3% + 1,45% bei Ø-Zusatzbeitrag 2,9%) + PV 1,8% (mit Kind;
// Kinderlose ab 23: 2,4%) = ~21,15% (kinderlos ~21,75%).
// Konservativ runden wir auf ~20% als Pauschale, da oberhalb der
// Beitragsbemessungsgrenze keine SV-Ersparnis mehr greift.
const SV_ANTEIL_PAUSCHAL = 0.20;

export default function JobRadRechner() {
  const [uvp, setUvp] = useState(3000);
  const [leasingrate, setLeasingrate] = useState(90);
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(35);
  const [svErsparnis, setSvErsparnis] = useState(true);
  const [agZuschuss, setAgZuschuss] = useState(0);

  // Geldwerter Vorteil: UVP / 4, auf volle 100 € abrunden, davon 1%
  const viertelGerundet = Math.floor(uvp / 4 / 100) * 100;
  const geldwerterVorteil = viertelGerundet * 0.01; // = 0,25% des abgerundeten UVP

  // Effektive Bruttoumwandlung = Leasingrate minus Arbeitgeberzuschuss
  const eigeneRate = Math.max(0, leasingrate - agZuschuss);

  // Steuersatz als Dezimalwert
  const stq = grenzsteuersatz / 100;
  const svq = svErsparnis ? SV_ANTEIL_PAUSCHAL : 0;
  const ersparnisQuote = Math.min(0.95, stq + svq); // kombinierte Abgabenquote

  // Die Bruttoumwandlung senkt das Netto nur um (1 - Abgabenquote) der Rate.
  const nettoKostenUmwandlung = eigeneRate * (1 - ersparnisQuote);

  // Der geldwerte Vorteil wird versteuert + ggf. verbeitragt -> erhöht Nettobelastung.
  const nettoKostenGwV = geldwerterVorteil * ersparnisQuote;

  // Effektive monatliche Nettobelastung
  const nettoBelastungMonat = nettoKostenUmwandlung + nettoKostenGwV;

  // Über 36 Monate (Standard-Leasinglaufzeit)
  const laufzeitMonate = 36;
  const nettoBelastung36 = nettoBelastungMonat * laufzeitMonate;

  // Vergleich Direktkauf: UVP als Referenz (Marktpreis ~ UVP)
  const direktkauf = uvp;

  // Ersparnis ggü. Direktkauf (über die Leasinglaufzeit, ohne späteren Übernahmewert)
  const ersparnisEuro = Math.max(0, direktkauf - nettoBelastung36);
  const ersparnisProzent = direktkauf > 0 ? (ersparnisEuro / direktkauf) * 100 : 0;

  const fmt = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmt0 = (n: number) =>
    Math.round(n).toLocaleString('de-DE');

  return (
    <div className="max-w-lg mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Ihre Angaben</h2>

        {/* UVP */}
        <label className="block mb-5">
          <span className="text-gray-700 font-medium">UVP des Rads (Listenpreis)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              min={0}
              step={100}
              value={uvp}
              onChange={(e) => setUvp(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 text-lg font-semibold text-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <input
            type="range"
            min={500}
            max={12000}
            step={100}
            value={Math.min(12000, uvp)}
            onChange={(e) => setUvp(Number(e.target.value))}
            className="w-full mt-3 accent-green-500"
          />
          <span className="text-xs text-gray-500">
            Bruttolistenpreis inkl. Zubehör zum Zeitpunkt der Inbetriebnahme
          </span>
        </label>

        {/* Leasingrate */}
        <label className="block mb-5">
          <span className="text-gray-700 font-medium">Monatliche Leasingrate (Bruttoumwandlung)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              min={0}
              step={1}
              value={leasingrate}
              onChange={(e) => setLeasingrate(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 text-lg font-semibold text-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <span className="text-xs text-gray-500">
            Der Betrag, der monatlich vom Bruttogehalt umgewandelt wird (inkl. Versicherung)
          </span>
        </label>

        {/* Arbeitgeberzuschuss */}
        <label className="block mb-5">
          <span className="text-gray-700 font-medium">Arbeitgeberzuschuss (optional)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              min={0}
              step={1}
              value={agZuschuss}
              onChange={(e) => setAgZuschuss(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 text-lg font-semibold text-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <span className="text-xs text-gray-500">
            Manche Arbeitgeber übernehmen einen Teil der Rate – senkt Ihre eigene Belastung
          </span>
        </label>

        {/* Grenzsteuersatz */}
        <label className="block mb-5">
          <span className="text-gray-700 font-medium">
            Persönlicher Grenzsteuersatz: <span className="text-green-600 font-bold">{grenzsteuersatz} %</span>
          </span>
          <input
            type="range"
            min={14}
            max={45}
            step={1}
            value={grenzsteuersatz}
            onChange={(e) => setGrenzsteuersatz(Number(e.target.value))}
            className="w-full mt-2 accent-green-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>14 % (niedrig)</span>
            <span>42 % (Spitze)</span>
            <span>45 %</span>
          </div>
          <span className="text-xs text-gray-500">
            Grobe Orientierung: ~25 % bei mittlerem Einkommen, ~35–42 % bei höherem Gehalt
          </span>
        </label>

        {/* SV-Ersparnis Toggle */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={svErsparnis}
            onChange={(e) => setSvErsparnis(e.target.checked)}
            className="mt-1 w-5 h-5 accent-green-500"
          />
          <span className="text-sm text-gray-700">
            <strong>Sozialabgaben werden gespart</strong> (Pauschale ~20 %).
            Häkchen entfernen, wenn Ihr Gehalt über der Beitragsbemessungsgrenze
            liegt – dann greift keine SV-Ersparnis.
          </span>
        </label>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-green-100 mb-1">Ihre effektive Nettobelastung</h3>

        <div className="mb-5">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{fmt(nettoBelastungMonat)}</span>
            <span className="text-xl text-green-200">€ / Monat</span>
          </div>
          <p className="text-green-100 text-sm mt-1">
            statt {fmt(leasingrate)} € Leasingrate – Sie sparen {fmt(leasingrate - nettoBelastungMonat)} €/Monat
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-green-100">Geldwerter Vorteil (zu versteuern)</span>
              <span className="font-bold">{fmt(geldwerterVorteil)} € / Monat</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-green-100">Nettobelastung über 36 Monate</span>
              <span className="font-bold">{fmt0(nettoBelastung36)} €</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-green-100">Direktkauf (UVP) zum Vergleich</span>
              <span className="font-bold">{fmt0(direktkauf)} €</span>
            </div>
          </div>

          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-green-50 font-medium">Ersparnis ggü. Direktkauf</span>
              <span className="text-2xl font-bold">{ersparnisProzent.toFixed(0)} %</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-green-100">in Euro (über die Laufzeit)</span>
              <span className="font-bold">~{fmt0(ersparnisEuro)} €</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-green-100 mt-4">
          Hinweis: Eine spätere Übernahme des Rads (Restwert) ist hier nicht eingerechnet.
          Die Ersparnis ist eine Näherung – Ihre echte Lohnabrechnung kann leicht abweichen.
        </p>
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So rechnet der Rechner</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>0,25%-Regelung:</strong> Geldwerter Vorteil = UVP geviertelt, auf volle 100 € abgerundet, davon 1 % pro Monat</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Bruttoumwandlung:</strong> Die Leasingrate wird vom Brutto abgezogen – sie spart Lohnsteuer und (meist) Sozialabgaben</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Gegenrechnung:</strong> Der geldwerte Vorteil wird Ihrem Brutto zugerechnet und versteuert – er reduziert die Ersparnis leicht</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Gilt für Fahrräder und <strong>E-Bikes/Pedelecs bis 25 km/h</strong> – nicht für S-Pedelecs (45 km/h)</span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Wichtige Hinweise</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium text-yellow-800">Übernahme am Ende</p>
              <p className="text-yellow-700">Nach der Laufzeit (meist 36 Monate) können Sie das Rad oft für rund 18 % des UVP übernehmen. Das Finanzamt setzt den Restwert pauschal auf 40 % an – die Differenz kann steuerpflichtig sein, wird aber häufig vom Anbieter übernommen.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-medium text-green-800">Gehaltsextra ist noch günstiger</p>
              <p className="text-green-700">Übernimmt der Arbeitgeber die Rate komplett zusätzlich zum Gehalt (statt Umwandlung), bleibt das Rad für Sie komplett lohnsteuer- und SV-frei – der geldwerte Vorteil entfällt.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">📄</span>
            <div>
              <p className="font-medium text-blue-800">Auswirkung auf Sozialleistungen</p>
              <p className="text-blue-700">Die Gehaltsumwandlung senkt Ihr Bruttogehalt – das kann sich minimal auf Renten- und Arbeitslosenanspruch sowie Lohnersatzleistungen (Elterngeld, Krankengeld) auswirken.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/estg/__6.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 6 Abs. 1 Nr. 4 EStG – Bewertung der Privatnutzung (0,25%-Regelung)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/estg/__3.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 3 Nr. 37 EStG – Steuerfreie Dienstrad-Überlassung
          </a>
          <a
            href="https://lsth.bundesfinanzministerium.de/lsth/2025/B-Anhaenge/Anhang-24/IV/IV-5/anhang-24-IV-5.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF (Lohnsteuer-Handbuch) – Überlassung von (Elektro-)Fahrrädern
          </a>
        </div>
      </div>
    </div>
  );
}
