import { useState } from 'react';

// Richtwerte fuer Hausanschlusskosten (einmalige Anschlussgebuehren je Medium).
// Quellen: Verbraucherzentrale, Bauratgeber-Portale, kommunale Gebuehrenordnungen
// (Stand 2026). Werte sind Spannen – wir nutzen jeweils einen mittleren Richtwert
// als Voreinstellung. Die tatsaechlichen Kosten haengen von Gemeinde, Entfernung
// zur Hauptleitung und Grundstueckslage ab.
type Medium = {
  key: string;
  name: string;
  icon: string;
  // mittlerer Richtwert in Euro (Hausanschluss)
  richtwert: number;
  // Spanne fuer den Hinweistext
  von: number;
  bis: number;
};

const MEDIEN: Medium[] = [
  { key: 'wasser', name: 'Wasser', icon: '🚰', richtwert: 3500, von: 2000, bis: 5000 },
  { key: 'abwasser', name: 'Abwasser / Kanal', icon: '🚽', richtwert: 5000, von: 3000, bis: 7000 },
  { key: 'strom', name: 'Strom', icon: '⚡', richtwert: 2250, von: 1500, bis: 3000 },
  { key: 'gas', name: 'Gas', icon: '🔥', richtwert: 2500, von: 2000, bis: 3000 },
  { key: 'telekom', name: 'Telekom / Glasfaser', icon: '🌐', richtwert: 750, von: 500, bis: 1000 },
  { key: 'strasse', name: 'Öffentliche Straße', icon: '🛣️', richtwert: 9000, von: 3000, bis: 15000 },
];

// Voreinstellungen je Erschliessungsgrad (welche Medien typischerweise noch
// fehlen / bezahlt werden muessen).
const GRAD_PRESETS: Record<string, string[]> = {
  // voll erschlossen: nur noch Hausanschluss der Versorgungsmedien, Strasse + Kanal
  // sind bereits vorhanden und abgerechnet
  voll: ['wasser', 'strom'],
  // teilerschlossen: Versorgungsmedien fehlen noch teilweise
  teil: ['wasser', 'abwasser', 'strom', 'gas'],
  // unerschlossen: alles inkl. Straßen- und Kanalbau
  unerschlossen: ['wasser', 'abwasser', 'strom', 'gas', 'telekom', 'strasse'],
};

export function ErschliessungskostenRechner() {
  const [modus, setModus] = useState<'pauschal' | 'beitrag'>('pauschal');

  // --- Modus A: Pauschal-Schaetzung ---
  const [grad, setGrad] = useState<'voll' | 'teil' | 'unerschlossen'>('teil');
  const [gewaehlt, setGewaehlt] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    MEDIEN.forEach((m) => {
      init[m.key] = GRAD_PRESETS['teil'].includes(m.key);
    });
    return init;
  });
  const [flaeche, setFlaeche] = useState(600);

  // --- Modus B: Erschliessungsbeitrag nach BauGB ---
  const [aufwand, setAufwand] = useState(800000);
  const [eigenanteilProzent, setEigenanteilProzent] = useState(10);
  const [summeEinheiten, setSummeEinheiten] = useState(12000);
  const [beitragFlaeche, setBeitragFlaeche] = useState(600);
  const [nutzungsfaktor, setNutzungsfaktor] = useState(1.0);

  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleGradWechsel = (g: 'voll' | 'teil' | 'unerschlossen') => {
    setGrad(g);
    const preset = GRAD_PRESETS[g];
    const next: Record<string, boolean> = {};
    MEDIEN.forEach((m) => {
      next[m.key] = preset.includes(m.key);
    });
    setGewaehlt(next);
  };

  const toggleMedium = (key: string) => {
    setGewaehlt((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Modus A: Summe der gewaehlten Pauschalen
  const pauschalSumme = MEDIEN.reduce(
    (sum, m) => sum + (gewaehlt[m.key] ? m.richtwert : 0),
    0,
  );

  // Plausibilitaets-Check ueber Flaechenmethode (typisch 50–100 EUR/m2)
  const flaecheVon = flaeche * 50;
  const flaecheBis = flaeche * 100;

  // Modus B: Erschliessungsbeitrag nach BauGB
  const umlagefaehigerAufwand = aufwand * (1 - eigenanteilProzent / 100);
  const beitragssatz = summeEinheiten > 0 ? umlagefaehigerAufwand / summeEinheiten : 0;
  const einheitenGrundstueck = beitragFlaeche * nutzungsfaktor;
  const erschliessungsbeitrag = beitragssatz * einheitenGrundstueck;

  const formatEuro0 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatEuro2 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatNum = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Modus-Umschalter */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Berechnungsart</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setModus('pauschal')}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
              modus === 'pauschal'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-2xl">🏗️</span>
            <span className="text-center leading-tight">Pauschal-Schätzung</span>
          </button>
          <button
            onClick={() => setModus('beitrag')}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
              modus === 'beitrag'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-2xl">📜</span>
            <span className="text-center leading-tight">Erschließungsbeitrag (BauGB)</span>
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          {modus === 'pauschal'
            ? 'Schätzt die einmaligen Hausanschluss- und Erschließungskosten nach gewählten Maßnahmen.'
            : 'Berechnet den kommunalen Erschließungsbeitrag nach §§ 127–135 BauGB (Verteilung des Aufwands).'}
        </p>
      </div>

      {modus === 'pauschal' && (
        <>
          {/* Erschliessungsgrad */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <span className="text-gray-700 font-medium block mb-3">Erschließungsgrad des Grundstücks</span>
            <div className="grid grid-cols-3 gap-2">
              {([
                { key: 'voll', label: 'Voll erschlossen' },
                { key: 'teil', label: 'Teilerschlossen' },
                { key: 'unerschlossen', label: 'Unerschlossen' },
              ] as const).map((g) => (
                <button
                  key={g.key}
                  onClick={() => handleGradWechsel(g.key)}
                  className={`flex items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 text-center leading-tight ${
                    grad === g.key
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Die Auswahl setzt sinnvolle Voreinstellungen – Sie können die einzelnen Maßnahmen unten frei anpassen.
            </p>
          </div>

          {/* Medien-Checkboxen */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <span className="text-gray-700 font-medium block mb-3">Benötigte Maßnahmen</span>
            <div className="space-y-2">
              {MEDIEN.map((m) => (
                <label
                  key={m.key}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    gewaehlt[m.key]
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!gewaehlt[m.key]}
                    onChange={() => toggleMedium(m.key)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xl">{m.icon}</span>
                  <span className="flex-1 text-gray-700 font-medium text-sm">{m.name}</span>
                  <span className="text-sm text-gray-500">
                    {formatEuro0(m.von)}–{formatEuro0(m.bis)} €
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Grundstuecksflaeche fuer Plausibilitaets-Check */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <label className="block">
              <span className="text-gray-700 font-medium">Grundstücksfläche (für Plausibilitäts-Check)</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={flaeche}
                  onChange={(e) => setFlaeche(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                Faustregel zur Gegenprobe: 50–100 € je m² Grundstücksfläche.
              </span>
            </label>
          </div>

          {/* Ergebnis Pauschal */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="text-sm font-medium text-blue-100 mb-1">Geschätzte Erschließungskosten</h3>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{formatEuro0(pauschalSumme)}</span>
                <span className="text-xl text-blue-200">€</span>
              </div>
              <p className="text-blue-200 text-sm mt-1">Summe der gewählten Maßnahmen (Richtwerte)</p>
            </div>
            <div className="space-y-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-100">Plausibilität nach Fläche</span>
                  <span className="font-bold">
                    {formatEuro0(flaecheVon)}–{formatEuro0(flaecheBis)} €
                  </span>
                </div>
                <p className="text-blue-200 text-xs mt-1">
                  {flaeche} m² × 50–100 €/m² als grobe Gegenprobe
                </p>
              </div>
            </div>
          </div>

          {/* Rechenweg Pauschal */}
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
            <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
              <p><strong>Summe</strong> = alle angekreuzten Maßnahmen-Pauschalen</p>
              <div className="space-y-1">
                {MEDIEN.filter((m) => gewaehlt[m.key]).map((m) => (
                  <p key={m.key}>
                    {m.icon} {m.name}: {formatEuro0(m.richtwert)} €
                  </p>
                ))}
                {pauschalSumme === 0 && <p className="text-gray-500">Keine Maßnahme gewählt.</p>}
              </div>
              <p className="border-t border-blue-200 pt-2">
                = <strong>{formatEuro0(pauschalSumme)} €</strong>
              </p>
            </div>
          </div>
        </>
      )}

      {modus === 'beitrag' && (
        <>
          {/* Eingaben Beitrag */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
            <label className="block">
              <span className="text-gray-700 font-medium">Beitragsfähiger Gesamtaufwand der Gemeinde</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={aufwand}
                  onChange={(e) => setAufwand(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                Gesamtkosten der Erschließungsanlage (Straße, Kanal etc.) im Abrechnungsgebiet.
              </span>
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">Eigenanteil der Gemeinde</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={10}
                  max={100}
                  step={1}
                  value={eigenanteilProzent}
                  onChange={(e) => setEigenanteilProzent(Math.min(100, Math.max(10, toNumber(e.target.value))))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                Nach § 129 Abs. 1 S. 3 BauGB mindestens 10 %. Maximal 90 % sind umlagefähig.
              </span>
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">Summe aller Verteilungseinheiten im Gebiet</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={summeEinheiten}
                  onChange={(e) => setSummeEinheiten(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Einh.</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                Summe aller Grundstücksflächen × Nutzungsfaktor im Abrechnungsgebiet (§ 131 BauGB).
              </span>
            </label>

            <div className="border-t border-gray-100 pt-4 space-y-5">
              <label className="block">
                <span className="text-gray-700 font-medium">Ihre Grundstücksfläche</span>
                <div className="mt-2 relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={beitragFlaeche}
                    onChange={(e) => setBeitragFlaeche(toNumber(e.target.value))}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
                </div>
              </label>

              <label className="block">
                <span className="text-gray-700 font-medium">Nutzungsfaktor (Geschossfaktor)</span>
                <div className="mt-2 relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={0.05}
                    value={nutzungsfaktor}
                    onChange={(e) => setNutzungsfaktor(toNumber(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <span className="text-xs text-gray-400 mt-1 block">
                  Aus der Erschließungsbeitragssatzung, z. B. 1,0 bei 1 Vollgeschoss, 1,25 bei 2, 1,5 bei 3 Geschossen.
                </span>
              </label>
            </div>
          </div>

          {/* Ergebnis Beitrag */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="text-sm font-medium text-blue-100 mb-1">Geschätzter Erschließungsbeitrag</h3>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{formatEuro2(erschliessungsbeitrag)}</span>
                <span className="text-xl text-blue-200">€</span>
              </div>
              <p className="text-blue-200 text-sm mt-1">Ihr Anteil am umlagefähigen Aufwand</p>
            </div>
            <div className="space-y-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-100">Umlagefähiger Aufwand</span>
                  <span className="font-bold">{formatEuro0(umlagefaehigerAufwand)} €</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-100">Beitragssatz je Einheit</span>
                  <span className="font-bold">{formatEuro2(beitragssatz)} €</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-100">Ihre Verteilungseinheiten</span>
                  <span className="font-bold">{formatNum(einheitenGrundstueck)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rechenweg Beitrag */}
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
            <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
              <p>
                <strong>Umlagefähig</strong> = Aufwand × (100 % − Eigenanteil) ={' '}
                {formatEuro0(aufwand)} € × {formatNum(100 - eigenanteilProzent)} % ={' '}
                <strong>{formatEuro0(umlagefaehigerAufwand)} €</strong>
              </p>
              <p>
                <strong>Beitragssatz</strong> = umlagefähig ÷ Summe Einheiten ={' '}
                {formatEuro0(umlagefaehigerAufwand)} € ÷ {formatEuro0(summeEinheiten)} ={' '}
                <strong>{formatEuro2(beitragssatz)} €</strong>/Einheit
              </p>
              <p>
                <strong>Ihre Einheiten</strong> = Fläche × Nutzungsfaktor ={' '}
                {formatEuro0(beitragFlaeche)} m² × {formatNum(nutzungsfaktor)} ={' '}
                <strong>{formatNum(einheitenGrundstueck)}</strong>
              </p>
              <p className="border-t border-blue-200 pt-2">
                <strong>Beitrag</strong> = Beitragssatz × Ihre Einheiten ={' '}
                {formatEuro2(beitragssatz)} € × {formatNum(einheitenGrundstueck)} ={' '}
                <strong>{formatEuro2(erschliessungsbeitrag)} €</strong>
              </p>
            </div>
          </div>
        </>
      )}

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Wichtiger Hinweis:</strong> Das Ergebnis ist eine unverbindliche Schätzung und{' '}
          <strong>keine Rechts- oder Finanzberatung</strong>. Es gibt keine bundesweit einheitliche
          Formel – die tatsächliche Höhe richtet sich nach der Erschließungsbeitragssatzung Ihrer
          Gemeinde (§ 132 BauGB) und dem konkreten beitragsfähigen Aufwand. Die Gemeinde trägt
          mindestens 10 % selbst (§ 129 BauGB); der Beitrag wird erst mit dem Beitragsbescheid fällig
          (§ 135 BauGB). Die Pauschal-Richtwerte sind Spannen, keine Festbeträge. Für verbindliche
          Zahlen wenden Sie sich an das Bau- oder Tiefbauamt Ihrer Kommune. Alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default ErschliessungskostenRechner;
