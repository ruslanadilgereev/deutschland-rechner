import { useState, useMemo } from 'react';

// Beitragsbemessungsgrenze Rentenversicherung 2026 (Deckel)
// § 4 Abs. 1 Nr. 1 SVBezGrV 2026, bundeseinheitlich
const BBG_RV_MONAT_2026 = 8450;        // 8.450,00 € / Monat = 101.400,00 € / Jahr
const BBG_RV_TAG_2026 = 8450 / 30;     // = 281,67 € / Kalendertag (SGB-Konvention 30 Tage)

export default function UebergangsgeldRechner() {
  // Eingabewerte
  const [bruttoMonat, setBruttoMonat] = useState(3000);
  const [nettoMonat, setNettoMonat] = useState(2000);
  const [hatKindOderPflege, setHatKindOderPflege] = useState(false);

  const ergebnis = useMemo(() => {
    // === 1. Regelentgelt kappen auf BBG-RV (auf das Brutto, VOR den 80 %) ===
    const regelentgeltBruttoMonat = Math.min(bruttoMonat, BBG_RV_MONAT_2026);

    // === 2. 80 % des Regelentgelts (§ 66 Abs. 1 Satz 1 SGB IX) ===
    const achtzigProzent = regelentgeltBruttoMonat * 0.80;

    // === 3. Berechnungsgrundlage = min(80 % Regelentgelt, Nettoarbeitsentgelt) ===
    const berechnungsgrundlageMonat = Math.min(achtzigProzent, nettoMonat);
    const nettoGrenzeGreift = achtzigProzent > nettoMonat;

    // === 4. Prozentsatz nach § 66 Abs. 1 Satz 3 SGB IX ===
    const satz = hatKindOderPflege ? 0.75 : 0.68;

    // === 5. Übergangsgeld ===
    const uebergangsgeldMonat = berechnungsgrundlageMonat * satz;
    const uebergangsgeldTag = uebergangsgeldMonat / 30; // kalendertäglicher Zahlbetrag

    return {
      bruttoMonat,
      nettoMonat,
      regelentgeltBruttoMonat,
      achtzigProzent,
      berechnungsgrundlageMonat,
      nettoGrenzeGreift,
      satz,
      uebergangsgeldMonat,
      uebergangsgeldTag,
    };
  }, [bruttoMonat, nettoMonat, hatKindOderPflege]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatProzent = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' %';

  return (
    <div className="max-w-2xl mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Bruttoarbeitsentgelt */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Monatliches Bruttoarbeitsentgelt</span>
            <span className="text-xs text-gray-500 block mt-1">
              Regelmäßiges Arbeitsentgelt vor Steuern und Abgaben (Regelentgelt)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={bruttoMonat}
              onChange={(e) => setBruttoMonat(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="15000"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={bruttoMonat}
            onChange={(e) => setBruttoMonat(Number(e.target.value))}
            className="w-full mt-3 accent-orange-500"
            min="1000"
            max="10000"
            step="50"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1.000 €</span>
            <span>5.500 €</span>
            <span>10.000 €</span>
          </div>
          {bruttoMonat > BBG_RV_MONAT_2026 && (
            <p className="text-sm text-amber-600 mt-2">
              ⚠️ Beitragsbemessungsgrenze erreicht: max. {formatEuro(BBG_RV_MONAT_2026)} werden berücksichtigt
            </p>
          )}
        </div>

        {/* Nettoarbeitsentgelt */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Monatliches Nettoarbeitsentgelt</span>
            <span className="text-xs text-gray-500 block mt-1">
              Auszahlungsbetrag nach Steuern und Sozialabgaben (Obergrenze nach § 66 SGB IX)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={nettoMonat}
              onChange={(e) => setNettoMonat(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="10000"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">€</span>
          </div>
          <input
            type="range"
            value={nettoMonat}
            onChange={(e) => setNettoMonat(Number(e.target.value))}
            className="w-full mt-3 accent-orange-500"
            min="500"
            max="6000"
            step="50"
          />
        </div>

        {/* Kind / Pflege */}
        <div className="mb-2">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Kind im Haushalt oder pflegender/pflegebedürftiger Partner?</span>
            <span className="text-xs text-gray-500 block mt-1">
              Mindestens 1 Kind (§ 32 EStG) oder Ehe-/Lebenspartner, der wegen Pflege nicht erwerbstätig sein kann → höherer Satz
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setHatKindOderPflege(false)}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                !hatKindOderPflege
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Nein (68 %)
            </button>
            <button
              onClick={() => setHatKindOderPflege(true)}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                hatKindOderPflege
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Ja (75 %)
            </button>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🔄 Ihr voraussichtliches Übergangsgeld</h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroRound(ergebnis.uebergangsgeldMonat)}</span>
            <span className="text-xl opacity-80">/ Monat</span>
          </div>
          <p className="text-orange-100 mt-2 text-sm">
            Das sind <strong>{formatEuro(ergebnis.uebergangsgeldTag)}</strong> pro Kalendertag
            ({formatProzent(ergebnis.satz * 100)} der Berechnungsgrundlage)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Berechnungsgrundlage</span>
            <div className="text-xl font-bold">{formatEuroRound(ergebnis.berechnungsgrundlageMonat)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Gewählter Satz</span>
            <div className="text-xl font-bold">{formatProzent(ergebnis.satz * 100)}</div>
          </div>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>

        <div className="space-y-3 text-sm">
          {/* Grundlage */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Berechnungsgrundlage (§§ 66–67 SGB IX)
          </div>

          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Bruttoarbeitsentgelt (monatlich)</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.bruttoMonat)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Regelentgelt (max. BBG-RV)</span>
            <span className="text-gray-900">{formatEuro(ergebnis.regelentgeltBruttoMonat)}</span>
          </div>

          {/* 80%-Schritt */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Berechnungsgrundlage = min(80 % Regelentgelt; Netto)
          </div>

          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">80 % des Regelentgelts</span>
            <span className={`${!ergebnis.nettoGrenzeGreift ? 'font-bold text-orange-600' : 'text-gray-400'}`}>
              {formatEuro(ergebnis.achtzigProzent)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Nettoarbeitsentgelt</span>
            <span className={`${ergebnis.nettoGrenzeGreift ? 'font-bold text-orange-600' : 'text-gray-400'}`}>
              {formatEuro(ergebnis.nettoMonat)}
            </span>
          </div>
          <div className="flex justify-between py-2 bg-orange-50 -mx-6 px-6">
            <span className="font-medium text-orange-700">
              = Berechnungsgrundlage
              <span className="text-xs font-normal ml-1">
                ({ergebnis.nettoGrenzeGreift ? 'Netto-Grenze' : '80 %-Regel'})
              </span>
            </span>
            <span className="font-bold text-orange-900">{formatEuro(ergebnis.berechnungsgrundlageMonat)}</span>
          </div>

          {/* Übergangsgeld */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Übergangsgeld (§ 66 Abs. 1 Satz 3 SGB IX)
          </div>

          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Prozentsatz</span>
            <span className="text-gray-900">
              {formatProzent(ergebnis.satz * 100)} {ergebnis.satz === 0.75 ? '(mit Kind / Pflege)' : '(allgemein)'}
            </span>
          </div>
          <div className="flex justify-between py-3 bg-orange-100 -mx-6 px-6 rounded-b-xl mt-2">
            <span className="font-bold text-orange-800">Übergangsgeld / Monat</span>
            <span className="font-bold text-2xl text-orange-900">{formatEuro(ergebnis.uebergangsgeldMonat)}</span>
          </div>
          <div className="flex justify-between py-2 -mx-6 px-6">
            <span className="text-gray-600">Übergangsgeld / Kalendertag (÷ 30)</span>
            <span className="font-bold text-orange-700">{formatEuro(ergebnis.uebergangsgeldTag)}</span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert Übergangsgeld</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>80 % Regelentgelt:</strong> Ausgangspunkt sind 80 % des regelmäßigen Bruttoarbeitsentgelts (§ 66 SGB IX)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Netto als Obergrenze:</strong> Die Berechnungsgrundlage ist höchstens das Nettoarbeitsentgelt</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>68 % oder 75 %:</strong> Von der Berechnungsgrundlage erhalten Sie 75 % mit Kind/Pflegefall, sonst 68 %</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>BBG-Deckel:</strong> Nur Entgelt bis zur Beitragsbemessungsgrenze der Rentenversicherung ({formatEuro(BBG_RV_MONAT_2026)}/Monat 2026) zählt</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Keine weiteren SV-Abzüge:</strong> Die Beiträge zur Kranken-, Pflege- und Rentenversicherung trägt während der Reha der Leistungsträger</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Gleiche Formel:</strong> Renten- (§ 21 SGB VI) und Unfallversicherung wenden dieselbe Berechnung nach §§ 66–68 SGB IX an</span>
          </li>
        </ul>
      </div>

      {/* Abgrenzung Krankengeld */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-orange-800 mb-3">🔍 Übergangsgeld oder Krankengeld?</h3>
        <div className="space-y-3 text-sm text-orange-700">
          <p>
            Beide Leistungen ersetzen ausgefallenes Entgelt – sie werden aber unterschiedlich berechnet:
          </p>
          <ul className="space-y-1 pl-4">
            <li>• <strong>Übergangsgeld</strong> (§ 66 SGB IX): bei medizinischer Reha bzw. Teilhabe am Arbeitsleben; 80 % Regelentgelt (max. Netto), davon <strong>68 % / 75 %</strong>; Deckel = BBG Rentenversicherung (8.450 €/Monat 2026).</li>
            <li>• <strong>Krankengeld</strong> (§ 47 SGB V): bei Arbeitsunfähigkeit; <strong>70 % Brutto</strong>, max. 90 % Netto; Deckel = BBG Krankenversicherung (5.812,50 €/Monat 2026).</li>
          </ul>
          <p>
            Den anderen Fall berechnen Sie mit dem <a href="/krankengeld-rechner" className="text-blue-600 hover:underline">Krankengeld-Rechner 2026</a>.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtiger Hinweis</h3>
        <p className="text-sm text-amber-700">
          Schätzung – keine Steuer- oder Rechtsberatung. Die Berechnung bildet die gesetzliche Formel nach
          §§ 66–68 SGB IX (für die Rentenversicherung über § 21 SGB VI) vereinfacht ab. Der tatsächliche
          Zahlbetrag wird vom zuständigen Reha-Träger (Deutsche Rentenversicherung, gesetzliche
          Unfallversicherung oder Bundesagentur für Arbeit) festgesetzt und kann abweichen, u. a. wegen der
          genauen Ermittlung des Regelentgelts und Nettoarbeitsentgelts nach § 67 SGB IX, Mindestbeträgen
          nach § 68 SGB IX (Leistungen zur Teilhabe am Arbeitsleben), Kontinuität der Bemessungsgrundlage
          (§ 69 SGB IX) sowie Anrechnung von sonstigem Einkommen. Dieser Rechner betrifft ausschließlich das
          Übergangsgeld bei medizinischer Reha bzw. Leistungen zur Teilhabe (SGB IX/SGB VI) – NICHT das
          Übergangsgeld für ausscheidende Politiker oder Beamte. Übergangsgeld ist steuerfrei
          (§ 3 Nr. 1 EStG), unterliegt aber dem Progressionsvorbehalt (§ 32b EStG).
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/sgb_9_2018/__66.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 66 SGB IX – Höhe und Berechnung des Übergangsgeldes
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_9_2018/__67.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 67 SGB IX – Berechnung des Regelentgelts
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_9_2018/__68.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 68 SGB IX – Berechnungsgrundlage in Sonderfällen
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_6/__21.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 21 SGB VI – Höhe und Berechnung des Übergangsgeldes
          </a>
          <a
            href="https://www.gesetze-im-internet.de/svbezgrv_2026/BJNR1160A0025.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            SVBezGrV 2026 – Beitragsbemessungsgrenze Rentenversicherung
          </a>
        </div>
      </div>
    </div>
  );
}
