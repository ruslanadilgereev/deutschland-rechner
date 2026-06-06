import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Gradtagzahl-Faktor (FGt) Default fuer Deutschland.
// Quelle: VDI 3807 / Verbraucherzentrale-Rechenbeispiel (Heizgrenze 15 Grad C,
// Raumtemperatur 20 Grad C) -> ~65 kKh/a. Regional anpassbar.
const FGT_DEFAULT = 65; // kKh/a (Kilo-Kelvinstunden pro Jahr)

// Foerderquote BEG/BAFA (Stand 2026): 15 % Grundfoerderung Einzelmassnahme,
// optional +5 % iSFP-Bonus -> bis 20 %. Default konservativ 15 %.
const FOERDERQUOTE_DEFAULT = 15; // Prozent

// Bauteil-Voreinstellungen: typische Flaeche, U-Werte und Daemmkosten pro m2.
// Quellen: Verbraucherzentrale (Fassade DeltaU 1,31), Energie-Fachberater,
// co2online (Stand 2026). Werte sind Richtwerte und objektabhaengig.
type BauteilVoreinstellung = {
  name: string;
  icon: string;
  flaeche: number; // m2
  uAlt: number; // W/(m2*K)
  uNeu: number; // W/(m2*K)
  kostenProM2: number; // EUR/m2
};

const BAUTEILE: BauteilVoreinstellung[] = [
  { name: 'Fassade (WDVS)', icon: '🏠', flaeche: 110, uAlt: 1.4, uNeu: 0.24, kostenProM2: 175 },
  { name: 'Oberste Geschossdecke', icon: '🔺', flaeche: 80, uAlt: 0.8, uNeu: 0.2, kostenProM2: 30 },
  { name: 'Kellerdecke', icon: '🧱', flaeche: 80, uAlt: 1.0, uNeu: 0.3, kostenProM2: 50 },
  { name: 'Steildach (Aufsparren)', icon: '🏚️', flaeche: 120, uAlt: 0.9, uNeu: 0.2, kostenProM2: 200 },
  { name: 'Eigene Eingabe', icon: '🔧', flaeche: 100, uAlt: 1.2, uNeu: 0.24, kostenProM2: 150 },
];

// Energietraeger-Voreinstellungen: Energiepreis pro kWh.
// Quellen: Finanztip/Verivox Gas & Strom (Stand 2026); Heizoel-Aequivalent.
// Bei Waermepumpe: Strompreis geteilt durch JAZ (Jahresarbeitszahl).
type EnergietraegerVoreinstellung = {
  name: string;
  icon: string;
  preisProKwh: number; // EUR/kWh (Nutzenergie)
};

const ENERGIETRAEGER: EnergietraegerVoreinstellung[] = [
  { name: 'Erdgas', icon: '🔥', preisProKwh: 0.12 },
  { name: 'Heizöl', icon: '🛢️', preisProKwh: 0.11 },
  { name: 'Wärmepumpe', icon: '♨️', preisProKwh: 0.089 },
];

export function DaemmungAmortisationRechner() {
  const [bauteilIndex, setBauteilIndex] = useState(0);
  const [flaeche, setFlaeche] = useState(BAUTEILE[0].flaeche);
  const [uAlt, setUAlt] = useState(BAUTEILE[0].uAlt);
  const [uNeu, setUNeu] = useState(BAUTEILE[0].uNeu);
  const [kostenProM2, setKostenProM2] = useState(BAUTEILE[0].kostenProM2);
  const [fgt, setFgt] = useState(FGT_DEFAULT);
  const [energieIndex, setEnergieIndex] = useState(0);
  const [preisProKwh, setPreisProKwh] = useState(ENERGIETRAEGER[0].preisProKwh);
  const [foerderquote, setFoerderquote] = useState(FOERDERQUOTE_DEFAULT);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleBauteilWechsel = (index: number) => {
    setBauteilIndex(index);
    const b = BAUTEILE[index];
    setFlaeche(b.flaeche);
    setUAlt(b.uAlt);
    setUNeu(b.uNeu);
    setKostenProM2(b.kostenProM2);
  };

  const handleEnergieWechsel = (index: number) => {
    setEnergieIndex(index);
    setPreisProKwh(ENERGIETRAEGER[index].preisProKwh);
  };

  // U-Wert-Verbesserung (DeltaU). Nicht negativ werden lassen.
  const deltaU = Math.max(0, uAlt - uNeu);

  // Jaehrliche Heizenergie-Einsparung in kWh/a:
  // kWh/a = DeltaU [W/(m2*K)] x FGt [kKh/a] x Flaeche [m2]
  // (W x kKh = kW x h = kWh, daher direkt kWh/a ohne weitere Umrechnung)
  const einsparungKwh = deltaU * fgt * flaeche;

  // Jaehrliche Kostenersparnis in EUR/a
  const ersparnisProJahr = einsparungKwh * preisProKwh;

  // Daemmkosten und Foerderung
  const daemmkostenBrutto = flaeche * kostenProM2;
  const foerderbetrag = daemmkostenBrutto * (foerderquote / 100);
  const investitionNetto = Math.max(0, daemmkostenBrutto - foerderbetrag);

  // Amortisationszeit in Jahren = Netto-Investition / jaehrliche Ersparnis
  const amortisationJahre = ersparnisProJahr > 0 ? investitionNetto / ersparnisProJahr : Infinity;

  // Kumulierte Ersparnis ueber 20 Jahre (ohne Preissteigerung) abzueglich Netto-Investition
  const ersparnis20Jahre = ersparnisProJahr * 20;
  const nettoGewinn20 = ersparnis20Jahre - investitionNetto;

  // CO2-Einsparung pro Jahr (Erdgas-Emissionsfaktor 0,201 kg/kWh).
  // Nur als grobe Orientierung; bei Strom/Waermepumpe abweichend.
  const co2ProJahrKg = einsparungKwh * 0.201;

  const formatKwh = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatEuro2 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatZahl = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const formatJahre = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Dämmung-Amortisation-Rechner" rechnerSlug="daemmung-amortisation-rechner" />

      {/* Bauteil-Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Bauteil auswählen</span>
        <div className="grid grid-cols-3 gap-2">
          {BAUTEILE.map((b, i) => (
            <button
              key={b.name}
              onClick={() => handleBauteilWechsel(i)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                bauteilIndex === i
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{b.icon}</span>
              <span className="text-center leading-tight">{b.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Gedämmte Fläche</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={flaeche}
              onChange={(e) => setFlaeche(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
          </div>
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-gray-700 font-medium">U-Wert vorher</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.01}
                value={uAlt}
                onChange={(e) => setUAlt(toNumber(e.target.value))}
                className="w-full px-3 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <span className="text-xs text-gray-400 mt-1 block">W/(m²·K)</span>
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium">U-Wert nachher</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.01}
                value={uNeu}
                onChange={(e) => setUNeu(toNumber(e.target.value))}
                className="w-full px-3 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <span className="text-xs text-gray-400 mt-1 block">W/(m²·K)</span>
          </label>
        </div>

        <label className="block">
          <span className="text-gray-700 font-medium">Gradtagzahl-Faktor (FGt)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={1}
              value={fgt}
              onChange={(e) => setFgt(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">kKh/a</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Voreinstellung 65 kKh/a (VDI 3807, Mittel Deutschland) – regional anpassbar.
          </span>
        </label>

        {/* Energietraeger */}
        <div className="border-t border-gray-100 pt-4">
          <span className="text-gray-700 font-medium block mb-3">Energieträger</span>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {ENERGIETRAEGER.map((e, i) => (
              <button
                key={e.name}
                onClick={() => handleEnergieWechsel(i)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                  energieIndex === i
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-2xl">{e.icon}</span>
                <span className="text-center leading-tight">{e.name}</span>
              </button>
            ))}
          </div>
          <label className="block">
            <span className="text-gray-700 font-medium">Energiepreis</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.001}
                value={preisProKwh}
                onChange={(e) => setPreisProKwh(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/kWh</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">
              Gas ca. 0,12 €, Öl ca. 0,11 €, Wärmepumpe ca. 0,089 € (Strompreis ÷ JAZ).
            </span>
          </label>
        </div>

        <label className="block">
          <span className="text-gray-700 font-medium">Dämmkosten pro m²</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={kostenProM2}
              onChange={(e) => setKostenProM2(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/m²</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Fassade ca. 150–200 €, oberste Geschossdecke ca. 9–50 €, Dach ca. 150–250 €.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Förderquote (BEG/BAFA)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step={1}
              value={foerderquote}
              onChange={(e) => setFoerderquote(Math.min(100, toNumber(e.target.value)))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            15 % Grundförderung Einzelmaßnahme, +5 % mit Sanierungsfahrplan (iSFP) – bis 20 %.
          </span>
        </label>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Amortisationszeit der Dämmung</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">
              {Number.isFinite(amortisationJahre) ? formatJahre(amortisationJahre) : '–'}
            </span>
            <span className="text-xl text-blue-200">Jahre</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            bis sich die Dämmung über die Energieersparnis bezahlt macht
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Energieersparnis pro Jahr</span>
              <span className="text-xl font-bold">{formatKwh(einsparungKwh)} kWh</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Kostenersparnis pro Jahr</span>
              <span className="text-xl font-bold">{formatEuro(ersparnisProJahr)} €</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Investition nach Förderung</span>
              <span className="font-bold">
                {formatEuro(investitionNetto)} € (von {formatEuro(daemmkostenBrutto)} €)
              </span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Ersparnis über 20 Jahre (netto)</span>
              <span className="font-bold">{formatEuro(nettoGewinn20)} €</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">CO₂-Einsparung pro Jahr (Gas)</span>
              <span className="font-bold">{formatKwh(co2ProJahrKg)} kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>ΔU</strong> = U-Wert vorher − U-Wert nachher = {formatZahl(uAlt)} − {formatZahl(uNeu)} ={' '}
            <strong>{formatZahl(deltaU)} W/(m²·K)</strong>
          </p>
          <p>
            <strong>Energieersparnis</strong> = ΔU × FGt × Fläche = {formatZahl(deltaU)} × {formatZahl(fgt)} ×{' '}
            {formatZahl(flaeche)} = <strong>{formatKwh(einsparungKwh)} kWh/Jahr</strong>
          </p>
          <p>
            <strong>Kostenersparnis</strong> = kWh × Energiepreis = {formatKwh(einsparungKwh)} ×{' '}
            {formatEuro2(preisProKwh)} € = <strong>{formatEuro(ersparnisProJahr)} €/Jahr</strong>
          </p>
          <p>
            <strong>Investition netto</strong> = (Fläche × Preis/m²) − Förderung = ({formatZahl(flaeche)} ×{' '}
            {formatEuro(kostenProM2)} €) − {formatZahl(foerderquote)} % = <strong>{formatEuro(investitionNetto)} €</strong>
          </p>
          <p>
            <strong>Amortisation</strong> = Investition ÷ Ersparnis/Jahr = {formatEuro(investitionNetto)} € ÷{' '}
            {formatEuro(ersparnisProJahr)} € ={' '}
            <strong>{Number.isFinite(amortisationJahre) ? `${formatJahre(amortisationJahre)} Jahre` : '–'}</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Überschlägige Schätzung nach der Methodik der Verbraucherzentrale
          und VDI 3807 (ΔU × FGt × Fläche) – <strong>keine Energieberatung</strong>. Reale U-Werte,
          Gradtagzahlen und Kosten sind standort- und objektabhängig; das tatsächliche Sparpotenzial
          weicht ab. Für die Förderung (BEG/BAFA) und eine energetische Bewertung sollten Sie eine
          Energie-Effizienz-Expertin oder einen Energie-Effizienz-Experten (Energie-Effizienz-Experten-Liste)
          hinzuziehen. Fördersätze und GEG-Anforderungen können sich ändern (Stand 2026). Alle Angaben
          ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default DaemmungAmortisationRechner;
