import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

/**
 * Einfache Wertgebühr nach GNotKG Tabelle B (Anlage 2 zum Gerichts- und
 * Notarkostengesetz). Wird für Notar- und Grundbuchkosten verwendet, falls
 * die Teilung mit einem (Teil-)Verkauf bzw. einer Beurkundung verbunden ist.
 * Identische Logik wie im Notarkosten-Rechner – Stand 2026.
 */
function einfacheGebuehrTabelleB(geschaeftswert: number): number {
  if (geschaeftswert <= 0) return 0;

  let gebuehr = 15; // bis 500 €
  let rest = geschaeftswert - 500;
  if (rest <= 0) return gebuehr;

  const stufe1 = Math.min(rest, 1500); // 500–2.000 €: je 500 € = 4 €
  gebuehr += Math.ceil(stufe1 / 500) * 4;
  rest -= 1500;
  if (rest <= 0) return gebuehr;

  const stufe2 = Math.min(rest, 8000); // 2.000–10.000 €: je 1.000 € = 6 €
  gebuehr += Math.ceil(stufe2 / 1000) * 6;
  rest -= 8000;
  if (rest <= 0) return gebuehr;

  const stufe3 = Math.min(rest, 15000); // 10.000–25.000 €: je 3.000 € = 8 €
  gebuehr += Math.ceil(stufe3 / 3000) * 8;
  rest -= 15000;
  if (rest <= 0) return gebuehr;

  const stufe4 = Math.min(rest, 25000); // 25.000–50.000 €: je 5.000 € = 10 €
  gebuehr += Math.ceil(stufe4 / 5000) * 10;
  rest -= 25000;
  if (rest <= 0) return gebuehr;

  const stufe5 = Math.min(rest, 150000); // 50.000–200.000 €: je 15.000 € = 27 €
  gebuehr += Math.ceil(stufe5 / 15000) * 27;
  rest -= 150000;
  if (rest <= 0) return gebuehr;

  const stufe6 = Math.min(rest, 300000); // 200.000–500.000 €: je 30.000 € = 50 €
  gebuehr += Math.ceil(stufe6 / 30000) * 50;
  rest -= 300000;
  if (rest <= 0) return gebuehr;

  const stufe7 = Math.min(rest, 4500000); // 500.000–5.000.000 €: je 50.000 € = 80 €
  gebuehr += Math.ceil(stufe7 / 50000) * 80;
  rest -= 4500000;
  if (rest <= 0) return gebuehr;

  // Vereinfachung für sehr hohe Werte (für Grundstücksteilungen unüblich)
  gebuehr += Math.ceil(rest / 50000) * 80;
  return gebuehr;
}

export function GrundstueckTeilungRechner() {
  // Flächen
  const [gesamtflaeche, setGesamtflaeche] = useState(1000);
  const [teilflaeche, setTeilflaeche] = useState(400);
  const [mindestgroesse, setMindestgroesse] = useState(400);

  // Bebaubarkeit der abgetrennten Teilfläche
  const [grz, setGrz] = useState(0.3);
  const [bestehendeGrundflaeche, setBestehendeGrundflaeche] = useState(0);

  // Kosten
  const [bodenrichtwert, setBodenrichtwert] = useState(300);
  const [mitBeurkundung, setMitBeurkundung] = useState(false);

  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  // Restfläche nach Abtrennung
  const restflaeche = Math.max(0, gesamtflaeche - teilflaeche);

  // Teilbarkeit: beide Grundstücke müssen die Mindestgröße erreichen
  const teilflaecheOk = teilflaeche >= mindestgroesse && teilflaeche > 0;
  const restflaecheOk = restflaeche >= mindestgroesse && restflaeche > 0;
  const teilbar = teilflaecheOk && restflaecheOk && teilflaeche < gesamtflaeche;

  // Bebaubarkeit der neuen Teilfläche (GRZ)
  const maxGrundflaeche = teilflaeche * grz; // zulässige überbaute Fläche
  const verbleibendeGrundflaeche = Math.max(0, maxGrundflaeche - bestehendeGrundflaeche);

  // Geschäftswert für Notar-/Grundbuchkosten = Wert der Teilfläche
  const geschaeftswert = teilflaeche * bodenrichtwert;

  // Teilungsvermessung – GNotKG-fremde Honorartabelle der Vermessungsbüros,
  // stark wert- und länderabhängig. Konservative Spanne als Schätzung.
  const vermessungMin = 1500;
  const vermessungMax = Math.max(3000, Math.round(geschaeftswert * 0.012));

  // Notar- & Grundbuchkosten nur bei Beurkundung (Teilverkauf / Auflassung)
  const einfGeb = einfacheGebuehrTabelleB(geschaeftswert);
  // Beurkundung Kaufvertrag (2,0) + Vollzug/Betreuung (1,0) -> netto, + 19 % MwSt
  const notarNetto = mitBeurkundung ? Math.round(einfGeb * 3.0) : 0;
  const notarBrutto = Math.round(notarNetto * 1.19);
  // Grundbuch: Eigentumsumschreibung (1,0) + Auflassungsvormerkung (0,5) = 1,5
  const grundbuch = mitBeurkundung ? Math.round(einfGeb * 1.5) : 0;

  // Teilungsgenehmigung / Kataster-Fortführung (Pauschale, kommunal verschieden)
  const behoerdenPauschale = 250;

  const kostenMin = vermessungMin + notarBrutto + grundbuch + behoerdenPauschale;
  const kostenMax = vermessungMax + notarBrutto + grundbuch + behoerdenPauschale;

  const fmt = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const fmt2 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Grundstücksteilung-Rechner" rechnerSlug="grundstueck-teilung-rechner" />

      {/* Flächen-Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <span className="text-gray-700 font-medium block">Flächen &amp; Mindestgröße</span>

        <label className="block">
          <span className="text-gray-700 font-medium">Gesamtfläche des Grundstücks</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={gesamtflaeche}
              onChange={(e) => setGesamtflaeche(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Abzutrennende Teilfläche</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={teilflaeche}
              onChange={(e) => setTeilflaeche(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Restgrundstück = Gesamtfläche − Teilfläche = {fmt(restflaeche)} m²
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Mindestgrundstücksgröße lt. Bebauungsplan</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={mindestgroesse}
              onChange={(e) => setMindestgroesse(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Typisch 300–500 m² – verbindlich nur über den Bebauungsplan bzw. das Bauamt.
          </span>
        </label>
      </div>

      {/* Bebaubarkeit */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <span className="text-gray-700 font-medium block">Bebaubarkeit der Teilfläche (GRZ)</span>

        <label className="block">
          <span className="text-gray-700 font-medium">Grundflächenzahl (GRZ)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={1}
              step={0.05}
              value={grz}
              onChange={(e) => setGrz(Math.min(1, toNumber(e.target.value)))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            GRZ 0,3 bedeutet: maximal 30 % der Grundstücksfläche dürfen überbaut werden (§ 19 BauNVO).
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Bereits bebaute Grundfläche auf der Teilfläche</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={bestehendeGrundflaeche}
              onChange={(e) => setBestehendeGrundflaeche(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            0 m² lassen, wenn die Teilfläche unbebaut ist (Baulücke / Bauplatz).
          </span>
        </label>
      </div>

      {/* Kosten-Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <span className="text-gray-700 font-medium block">Kosten-Schätzung</span>

        <label className="block">
          <span className="text-gray-700 font-medium">Bodenrichtwert</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={bodenrichtwert}
              onChange={(e) => setBodenrichtwert(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/m²</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Geschäftswert der Teilfläche = {fmt(teilflaeche)} m² × {fmt2(bodenrichtwert)} €/m² = {fmt(geschaeftswert)} €
          </span>
        </label>

        <div className="border-t border-gray-100 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={mitBeurkundung}
              onChange={(e) => setMitBeurkundung(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Teilfläche wird verkauft (Beurkundung &amp; Grundbuch)</span>
          </label>
          <span className="text-xs text-gray-400 mt-2 block">
            Aktivieren, wenn die Teilfläche verkauft wird – dann fallen Notar- und Grundbuchkosten nach GNotKG an.
            Bei reiner Teilung im eigenen Bestand ohne Verkauf bleibt der Schalter aus.
          </span>
        </div>
      </div>

      {/* Ergebnis Teilbarkeit */}
      <div
        className={`rounded-2xl shadow-lg p-6 text-white mb-6 ${
          teilbar
            ? 'bg-gradient-to-br from-green-500 to-emerald-600'
            : 'bg-gradient-to-br from-orange-500 to-red-600'
        }`}
      >
        <h3 className="text-sm font-medium text-white/80 mb-1">Teilbarkeit (Mindestgröße)</h3>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-bold">{teilbar ? 'Teilung möglich' : 'Teilung kritisch'}</span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm flex justify-between">
            <span>Teilfläche {fmt(teilflaeche)} m²</span>
            <span className="font-bold">{teilflaecheOk ? '✓ ≥ Mindestgröße' : '✗ zu klein'}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm flex justify-between">
            <span>Restgrundstück {fmt(restflaeche)} m²</span>
            <span className="font-bold">{restflaecheOk ? '✓ ≥ Mindestgröße' : '✗ zu klein'}</span>
          </div>
        </div>
      </div>

      {/* Ergebnis Bebaubarkeit */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Bebaubarkeit der Teilfläche</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{fmt(maxGrundflaeche)}</span>
            <span className="text-xl text-blue-200">m² überbaubar</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            max. zulässige Grundfläche bei GRZ {fmt2(grz)}
          </p>
        </div>
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <span className="text-blue-100">noch bebaubar (abzgl. Bestand)</span>
            <span className="text-xl font-bold">{fmt(verbleibendeGrundflaeche)} m²</span>
          </div>
        </div>
      </div>

      {/* Ergebnis Kosten */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-purple-100 mb-1">Geschätzte Gesamtkosten der Teilung</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{fmt(kostenMin)}</span>
            <span className="text-xl text-purple-200">– {fmt(kostenMax)} €</span>
          </div>
          <p className="text-purple-200 text-sm mt-1">grobe Spanne, kein Festpreis</p>
        </div>
        <div className="space-y-2 text-sm">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm flex justify-between">
            <span className="text-purple-100">Teilungsvermessung</span>
            <span className="font-bold">{fmt(vermessungMin)} – {fmt(vermessungMax)} €</span>
          </div>
          {mitBeurkundung && (
            <>
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm flex justify-between">
                <span className="text-purple-100">Notarkosten (inkl. MwSt)</span>
                <span className="font-bold">{fmt(notarBrutto)} €</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm flex justify-between">
                <span className="text-purple-100">Grundbuchkosten</span>
                <span className="font-bold">{fmt(grundbuch)} €</span>
              </div>
            </>
          )}
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm flex justify-between">
            <span className="text-purple-100">Behörde / Kataster-Fortführung</span>
            <span className="font-bold">ca. {fmt(behoerdenPauschale)} €</span>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Restgrundstück</strong> = Gesamtfläche − Teilfläche = {fmt(gesamtflaeche)} − {fmt(teilflaeche)} ={' '}
            <strong>{fmt(restflaeche)} m²</strong>
          </p>
          <p>
            <strong>Teilbar?</strong> Teilfläche ({fmt(teilflaeche)} m²) und Restgrundstück ({fmt(restflaeche)} m²) müssen
            jeweils ≥ Mindestgröße ({fmt(mindestgroesse)} m²) sein →{' '}
            <strong>{teilbar ? 'erfüllt' : 'nicht erfüllt'}</strong>
          </p>
          <p>
            <strong>Bebaubarkeit</strong> = Teilfläche × GRZ = {fmt(teilflaeche)} × {fmt2(grz)} ={' '}
            <strong>{fmt(maxGrundflaeche)} m²</strong> max. Grundfläche
          </p>
          <p>
            <strong>Geschäftswert</strong> = Teilfläche × Bodenrichtwert = {fmt(teilflaeche)} × {fmt2(bodenrichtwert)} € ={' '}
            <strong>{fmt(geschaeftswert)} €</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Wichtiger Hinweis:</strong> Das Ergebnis ist eine unverbindliche Schätzung und{' '}
          <strong>keine Rechts-, Bau- oder Vermessungsberatung</strong>. Ob ein Grundstück geteilt werden darf,
          richtet sich nach Bebauungsplan und Landesrecht – in einigen Bundesländern oder Sanierungsgebieten ist
          eine Teilungsgenehmigung nötig (§ 19 BauGB i. V. m. Landesrecht), in anderen wurde sie abgeschafft.
          Verbindlich sind allein Bebauungsplan und die Auskunft von Bauamt bzw. Gemeinde. Die Teilungsvermessung
          darf nur eine öffentlich bestellte Vermessungsingenieurin bzw. ein öffentlich bestellter
          Vermessungsingenieur oder die Katasterbehörde durchführen. Notar- und Grundbuchgebühren sind
          GNotKG-Wertgebühren – die exakten Beträge stehen erst nach der Wertfeststellung fest. Alle Kostenwerte
          sind Spannen, keine Festpreise. Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default GrundstueckTeilungRechner;
