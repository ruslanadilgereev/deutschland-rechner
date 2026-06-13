import { useState, useMemo } from 'react';

// Einkommensteuer 2026 – nach § 32a EStG (1:1 aus EinkommensteuerRechner)
// Grundfreibetrag 2026: 12.348 €
const GRUNDFREIBETRAG_2026 = 12348;

// Steuertarif 2026 Zonen
const TARIFZONEN_2026 = {
  zone1Ende: 17799,   // Ende Zone 1
  zone2Ende: 69878,   // Ende Zone 2
  zone3Ende: 277825,  // Ende Zone 3
  // darüber: 45 % Reichensteuer
};

// Berechnung Einkommensteuer nach § 32a EStG 2026 (Splitting: faktor = 2)
function berechneEinkommensteuer(zvE: number, verheiratet: boolean): number {
  const faktor = verheiratet ? 2 : 1;
  const zvEHalb = zvE / faktor;

  if (zvEHalb <= 0) return 0;

  let steuer = 0;

  if (zvEHalb <= GRUNDFREIBETRAG_2026) {
    steuer = 0;
  } else if (zvEHalb <= TARIFZONEN_2026.zone1Ende) {
    const y = (zvEHalb - GRUNDFREIBETRAG_2026) / 10000;
    steuer = (914.51 * y + 1400) * y;
  } else if (zvEHalb <= TARIFZONEN_2026.zone2Ende) {
    const z = (zvEHalb - TARIFZONEN_2026.zone1Ende) / 10000;
    steuer = (173.10 * z + 2397) * z + 1034.87;
  } else if (zvEHalb <= TARIFZONEN_2026.zone3Ende) {
    steuer = 0.42 * zvEHalb - 11135.63;
  } else {
    steuer = 0.45 * zvEHalb - 19470.38;
  }

  return Math.round(steuer * faktor);
}

// Veranlagungsarten
const VERANLAGUNGSARTEN = [
  { wert: 'single', label: 'Einzelveranlagung', faktor: 1 },
  { wert: 'zusammen', label: 'Zusammenveranlagung (verheiratet)', faktor: 2 },
];

// Lineare Gebäude-AfA nach § 7 Abs. 4 EStG
const AFA_SAETZE = [
  { wert: 0.03, label: '3,0 % – Wohngebäude Neubau (Fertigstellung ab 2023)' },
  { wert: 0.02, label: '2,0 % – Bestandsgebäude (Fertigstellung 1925–2022)' },
  { wert: 0.025, label: '2,5 % – Altbau (Fertigstellung vor 1925)' },
];

export default function MieteinnahmenVersteuernRechner() {
  // Einnahmen
  const [jahresKaltmiete, setJahresKaltmiete] = useState(12000);

  // Gebäude-AfA
  const [gebaeudewert, setGebaeudewert] = useState(250000);
  const [afaSatz, setAfaSatz] = useState(0.02);

  // Weitere Werbungskosten
  const [schuldzinsen, setSchuldzinsen] = useState(4000);
  const [erhaltungsaufwand, setErhaltungsaufwand] = useState(1500);
  const [verwaltungSonstiges, setVerwaltungSonstiges] = useState(800);

  // Übriges zu versteuerndes Einkommen (ohne Mieteinkünfte)
  const [uebrigesZvE, setUebrigesZvE] = useState(50000);

  // Veranlagung
  const [veranlagung, setVeranlagung] = useState<'single' | 'zusammen'>('single');

  const ergebnis = useMemo(() => {
    const verheiratet = veranlagung === 'zusammen';

    // 1. Gebäude-AfA (Gebäudewert × Satz – Grund und Boden ist nicht abschreibbar)
    const gebaeudeAfa = Math.round(gebaeudewert * afaSatz);

    // 2. Werbungskosten gesamt (§ 9 EStG, kein Pauschbetrag für V+V – § 9a EStG)
    const werbungskostenGesamt = gebaeudeAfa + schuldzinsen + erhaltungsaufwand + verwaltungSonstiges;

    // 3. Überschuss/Verlust aus V+V (§ 21 EStG) = Einnahmen − Werbungskosten
    const ueberschuss = jahresKaltmiete - werbungskostenGesamt;

    // 4. Differenzmethode: Steuer mit vs. ohne Mieteinkünfte
    const stOhne = berechneEinkommensteuer(uebrigesZvE, verheiratet);
    const stMit = berechneEinkommensteuer(Math.max(0, uebrigesZvE + ueberschuss), verheiratet);
    const steuerAufMiete = stMit - stOhne; // bei Verlust negativ = Steuerersparnis

    // 5. Netto-Mietüberschuss nach Steuer
    const nettoMietueberschuss = ueberschuss - steuerAufMiete;

    // 6. Effektiver Grenzsteuersatz auf die Mieteinkünfte (Differenzmethode)
    const effektiverGrenzsteuersatz = ueberschuss !== 0 ? (steuerAufMiete / ueberschuss) * 100 : 0;

    return {
      gebaeudeAfa,
      werbungskostenGesamt,
      ueberschuss,
      stOhne,
      stMit,
      steuerAufMiete,
      nettoMietueberschuss,
      effektiverGrenzsteuersatz,
      istVerlust: ueberschuss < 0,
    };
  }, [
    jahresKaltmiete, gebaeudewert, afaSatz,
    schuldzinsen, erhaltungsaufwand, verwaltungSonstiges,
    uebrigesZvE, veranlagung,
  ]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';
  const formatProzent = (n: number) => n.toFixed(1).replace('.', ',') + ' %';

  return (
    <div className="max-w-2xl mx-auto">

      {/* Einnahmen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">💶</span> Mieteinnahmen (Jahresbetrag)
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jahres-Kaltmiete (inkl. umgelegter Nebenkosten)
          </label>
          <div className="relative">
            <input
              type="number"
              value={jahresKaltmiete}
              onChange={(e) => setJahresKaltmiete(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              step="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <input
            type="range"
            min="0"
            max="60000"
            step="500"
            value={jahresKaltmiete}
            onChange={(e) => setJahresKaltmiete(Number(e.target.value))}
            className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <p className="text-xs text-gray-400 mt-1">12 × Monatskaltmiete – z. B. 1.000 €/Monat = 12.000 €/Jahr</p>
        </div>
      </div>

      {/* Gebäude-AfA */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🏠</span> Gebäude-Abschreibung (AfA)
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Nur der <strong>Gebäudeanteil</strong> ist abschreibbar (§ 7 Abs. 4 EStG) – nicht der Grund und Boden.
          Der Gebäudeanteil liegt typisch bei 70–80 % des Kaufpreises.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gebäudewert (ohne Grundstück)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={gebaeudewert}
                  onChange={(e) => setGebaeudewert(Math.max(0, Number(e.target.value)))}
                  className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                  min="0"
                  step="1000"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AfA-Satz
              </label>
              <select
                value={afaSatz}
                onChange={(e) => setAfaSatz(Number(e.target.value))}
                className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              >
                {AFA_SAETZE.map((a) => (
                  <option key={a.wert} value={a.wert}>{a.label}</option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-sm text-orange-600 bg-orange-50 p-2 rounded-lg">
            📉 Jährliche Gebäude-AfA: <strong>{formatEuro(ergebnis.gebaeudeAfa)}</strong>
            <span className="block text-xs mt-1">{formatEuro(gebaeudewert)} × {formatProzent(afaSatz * 100)}</span>
          </p>
        </div>
      </div>

      {/* Weitere Werbungskosten */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📋</span> Weitere Werbungskosten (Jahr)
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Für Vermietung &amp; Verpachtung gibt es <strong>keinen</strong> Werbungskosten-Pauschbetrag
          (§ 9a EStG) – nur tatsächliche Kosten zählen.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Schuldzinsen (Finanzierung)
            </label>
            <div className="relative">
              <input
                type="number"
                value={schuldzinsen}
                onChange={(e) => setSchuldzinsen(Math.max(0, Number(e.target.value)))}
                className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                min="0"
                step="100"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Nur Zinsen – Tilgung ist nicht absetzbar!</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Erhaltungsaufwand
            </label>
            <div className="relative">
              <input
                type="number"
                value={erhaltungsaufwand}
                onChange={(e) => setErhaltungsaufwand(Math.max(0, Number(e.target.value)))}
                className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                min="0"
                step="100"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Reparaturen, Instandhaltung</p>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verwaltung &amp; Sonstiges
            </label>
            <div className="relative">
              <input
                type="number"
                value={verwaltungSonstiges}
                onChange={(e) => setVerwaltungSonstiges(Math.max(0, Number(e.target.value)))}
                className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                min="0"
                step="100"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Hausverwaltung, Grundsteuer, Versicherung, nicht umlagefähige Nebenkosten</p>
          </div>
        </div>
      </div>

      {/* Steuerliche Situation */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">👤</span> Steuerliche Situation
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Veranlagungsart</label>
            <div className="grid grid-cols-2 gap-3">
              {VERANLAGUNGSARTEN.map((v) => (
                <button
                  key={v.wert}
                  onClick={() => setVeranlagung(v.wert as 'single' | 'zusammen')}
                  className={`py-3 px-4 rounded-xl font-medium transition-all ${
                    veranlagung === v.wert
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Übriges zu versteuerndes Einkommen (ohne Mieteinkünfte)
            </label>
            <div className="relative">
              <input
                type="number"
                value={uebrigesZvE}
                onChange={(e) => setUebrigesZvE(Math.max(0, Number(e.target.value)))}
                className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                min="0"
                step="1000"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              z. B. Ihr zvE aus Lohn/Gehalt – der Mietüberschuss erhöht dieses zvE
            </p>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-blue-200 mb-1">
          {ergebnis.istVerlust ? 'Steuerersparnis durch Verlust (Vermietung 2026)' : 'Steuer auf Ihre Mieteinnahmen 2026'}
        </h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(Math.abs(ergebnis.steuerAufMiete))}</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            {ergebnis.istVerlust
              ? 'Der Verlust mindert Ihre übrige Einkommensteuer (Verlustverrechnung)'
              : 'Zusätzliche Einkommensteuer durch die Vermietungseinkünfte (Differenzmethode)'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <span className="text-blue-200 text-xs block">Überschuss V+V</span>
            <span className="text-xl font-bold">{formatEuro(ergebnis.ueberschuss)}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <span className="text-blue-200 text-xs block">Effektiver Satz</span>
            <span className="text-xl font-bold">{formatProzent(ergebnis.effektiverGrenzsteuersatz)}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <span className="text-blue-200 text-xs block">Netto nach Steuer</span>
            <span className="text-xl font-bold">{formatEuro(ergebnis.nettoMietueberschuss)}</span>
          </div>
        </div>
      </div>

      {/* Aufschlüsselung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnung im Detail</h3>

        <div className="space-y-4">
          {/* Einnahmen */}
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="font-medium text-gray-700">Mieteinnahmen (Jahres-Kaltmiete)</span>
            <span className="font-bold text-gray-900">{formatEuro(jahresKaltmiete)}</span>
          </div>

          {/* Werbungskosten */}
          <div>
            <div className="flex justify-between items-center text-orange-600 font-medium mb-2">
              <span>Werbungskosten gesamt</span>
              <span>− {formatEuro(ergebnis.werbungskostenGesamt)}</span>
            </div>
            <div className="pl-4 space-y-1 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Gebäude-AfA</span>
                <span>− {formatEuro(ergebnis.gebaeudeAfa)}</span>
              </div>
              <div className="flex justify-between">
                <span>Schuldzinsen</span>
                <span>− {formatEuro(schuldzinsen)}</span>
              </div>
              <div className="flex justify-between">
                <span>Erhaltungsaufwand</span>
                <span>− {formatEuro(erhaltungsaufwand)}</span>
              </div>
              <div className="flex justify-between">
                <span>Verwaltung &amp; Sonstiges</span>
                <span>− {formatEuro(verwaltungSonstiges)}</span>
              </div>
            </div>
          </div>

          {/* Überschuss */}
          <div className="flex justify-between items-center py-2 border-b border-gray-200 bg-gray-50 -mx-6 px-6">
            <span className="font-bold text-gray-800">
              {ergebnis.istVerlust ? 'Verlust aus V+V (§ 21 EStG)' : 'Überschuss aus V+V (§ 21 EStG)'}
            </span>
            <span className={`font-bold ${ergebnis.istVerlust ? 'text-red-600' : 'text-gray-900'}`}>
              {formatEuro(ergebnis.ueberschuss)}
            </span>
          </div>

          {/* Steuer-Differenz */}
          <div>
            <div className="flex justify-between items-center text-red-600 font-medium mb-2">
              <span>{ergebnis.istVerlust ? 'Steuerersparnis (Differenzmethode)' : 'Steuer auf den Überschuss (Differenzmethode)'}</span>
              <span>{ergebnis.istVerlust ? '+ ' : ''}{formatEuro(Math.abs(ergebnis.steuerAufMiete))}</span>
            </div>
            <div className="pl-4 space-y-1 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Einkommensteuer ohne Mieteinkünfte</span>
                <span>{formatEuro(ergebnis.stOhne)}</span>
              </div>
              <div className="flex justify-between">
                <span>Einkommensteuer mit Mieteinkünften</span>
                <span>{formatEuro(ergebnis.stMit)}</span>
              </div>
            </div>
          </div>

          {/* Netto-Ergebnis */}
          <div className="flex justify-between items-center py-3 border-t-2 border-green-200 bg-green-50 -mx-6 px-6 rounded-b-2xl">
            <div>
              <span className="font-bold text-green-800 text-lg">Mietüberschuss nach Steuer</span>
              <span className="text-green-600 text-sm block">(Überschuss − Steuer auf Miete)</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-green-600 text-xl block">{formatEuro(ergebnis.nettoMietueberschuss)}</span>
              <span className="text-green-500 text-sm">{formatEuro(Math.round(ergebnis.nettoMietueberschuss / 12))}/Monat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hinweis § 7b Sonderabschreibung */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-green-800 mb-3">💡 Tipp: § 7b-Sonderabschreibung Mietwohnungsneubau</h3>
        <p className="text-sm text-green-700 mb-2">
          Für neu geschaffenen Mietwohnraum kann zusätzlich zur linearen AfA eine
          <strong> Sonderabschreibung von bis zu 5 %/Jahr über vier Jahre</strong> nach § 7b EStG geltend
          gemacht werden – an strenge Voraussetzungen geknüpft:
        </p>
        <ul className="space-y-1 text-sm text-green-700">
          <li className="flex gap-2"><span>•</span><span>Bemessungsgrundlage max. 4.000 €/m² (Bauantrag ab 01.01.2023)</span></li>
          <li className="flex gap-2"><span>•</span><span>Baukostenobergrenze 5.200 €/m² (Bauantrag 01.01.2023 bis 30.09.2029)</span></li>
          <li className="flex gap-2"><span>•</span><span>10-Jahres-Vermietungsbindung, EU-Lage, Effizienzstandard</span></li>
        </ul>
        <p className="text-xs text-green-600 mt-3">
          Dieser Rechner bildet die <strong>lineare AfA</strong> ab. Die § 7b-Förderung ist zeitlich
          befristet und komplex – lassen Sie sie individuell prüfen.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ Schätzung – keine Steuer-/Rechtsberatung.</strong> Diese Berechnung bildet die
          Einkünfte aus Vermietung und Verpachtung (§ 21 EStG) und die darauf entfallende Einkommensteuer
          nach dem Tarif 2026 (§ 32a EStG) per Differenzmethode ab. Nicht berücksichtigt sind u. a.
          Solidaritätszuschlag und Kirchensteuer, die § 7b-Sonderabschreibung, degressive AfA-Sonderfälle,
          die Aufteilung bei verbilligter Vermietung (50 %/66 %-Grenze, § 21 Abs. 2 EStG), die
          Spekulationssteuer bei Verkauf (§ 23 EStG) sowie individuelle Frei- und Abzugsbeträge.
          Maßgeblich ist allein Ihr Steuerbescheid; nutzen Sie für die Steuererklärung ELSTER oder ziehen
          Sie einen Steuerberater hinzu.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen &amp; Rechtsgrundlagen (Stand: 2026)</h4>
        <div className="space-y-1">
          <a href="https://www.gesetze-im-internet.de/estg/__21.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 21 EStG – Einkünfte aus Vermietung und Verpachtung
          </a>
          <a href="https://www.gesetze-im-internet.de/estg/__9a.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 9a EStG – Pauschbeträge für Werbungskosten
          </a>
          <a href="https://www.gesetze-im-internet.de/estg/__7.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 7 EStG – Absetzung für Abnutzung (AfA)
          </a>
          <a href="https://www.gesetze-im-internet.de/estg/__7b.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 7b EStG – Sonderabschreibung Mietwohnungsneubau
          </a>
          <a href="https://www.gesetze-im-internet.de/estg/__32a.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 32a EStG – Einkommensteuertarif
          </a>
          <a href="https://esth.bundesfinanzministerium.de/lsth/2026/A-Einkommensteuergesetz/IV-Tarif-31-34b/Paragraf-32a/paragraf-32a.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            BMF – Lohnsteuerhandbuch 2026, § 32a EStG
          </a>
          <a href="https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/das-aendert-sich-2026.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            BMF – Das ändert sich 2026
          </a>
        </div>
      </div>
    </div>
  );
}
