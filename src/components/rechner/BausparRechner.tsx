import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

export default function BausparRechner() {
  const [bausparsumme, setBausparsumme] = useState<number>(50000);
  const [sparrate, setSparrate] = useState<number>(200);
  const [guthabenzins, setGuthabenzins] = useState<number>(0.1);
  const [darlehenszins, setDarlehenszins] = useState<number>(1.95);
  const [abschlussgebuehr, setAbschlussgebuehr] = useState<number>(1.0);
  const [wohnungsbau, setWohnungsbau] = useState(false);
  const [familienstand, setFamilienstand] = useState<'ledig' | 'verheiratet'>('ledig');
  const [berechnet, setBerechnet] = useState(false);

  const ergebnis = useMemo(() => {
    if (!bausparsumme || bausparsumme <= 0 || !sparrate || sparrate <= 0) return null;

    const abschlussKosten = bausparsumme * (abschlussgebuehr / 100);
    const mindestguthaben = bausparsumme * 0.4; // 40% Mindestansparung

    // Ansparphase berechnen
    let guthaben = -abschlussKosten; // Abschlussgebühr wird verrechnet
    let monate = 0;
    let zinsenGesamt = 0;
    const maxMonate = 360; // max 30 Jahre

    while (guthaben < mindestguthaben && monate < maxMonate) {
      monate++;
      guthaben += sparrate;
      const monatszins = guthaben * (guthabenzins / 100 / 12);
      zinsenGesamt += monatszins > 0 ? monatszins : 0;
      guthaben += monatszins > 0 ? monatszins : 0;
    }

    const ansparJahre = Math.ceil(monate / 12 * 10) / 10;
    const ansparMonate = monate;
    const guthabenBeiZuteilung = Math.round(guthaben * 100) / 100;
    const eingezahlt = sparrate * monate;

    // Wohnungsbauprämie
    let praemieGesamt = 0;
    if (wohnungsbau) {
      const maxEigen = familienstand === 'ledig' ? 700 : 1400;
      const jahrSpar = sparrate * 12;
      const foerderSpar = Math.min(jahrSpar, maxEigen);
      const praemieJahr = foerderSpar * 0.10; // 10% Prämie
      const praemieMax = familienstand === 'ledig' ? 70 : 140;
      praemieGesamt = Math.min(praemieJahr, praemieMax) * Math.ceil(monate / 12);
    }

    // Darlehensphase
    const darlehen = bausparsumme - guthabenBeiZuteilung;
    const darlehensRate = bausparsumme * 0.006; // Regelrate ~6‰ der Bausparsumme
    const monatsZinsDarlehen = darlehenszins / 100 / 12;

    let restschuld = darlehen;
    let tilgungsMonate = 0;
    let zinsenDarlehen = 0;

    while (restschuld > 0 && tilgungsMonate < maxMonate) {
      tilgungsMonate++;
      const zins = restschuld * monatsZinsDarlehen;
      const tilgung = darlehensRate - zins;
      if (tilgung <= 0) {
        tilgungsMonate = maxMonate;
        break;
      }
      zinsenDarlehen += zins;
      restschuld -= tilgung;
    }

    const darlehensJahre = Math.ceil(tilgungsMonate / 12 * 10) / 10;
    const gesamtKosten = abschlussKosten + zinsenDarlehen - zinsenGesamt - praemieGesamt;

    return {
      bausparsumme,
      abschlussKosten,
      mindestguthaben,
      ansparMonate,
      ansparJahre,
      eingezahlt,
      zinsenGesamt: Math.round(zinsenGesamt * 100) / 100,
      guthabenBeiZuteilung,
      praemieGesamt: Math.round(praemieGesamt * 100) / 100,
      darlehen: Math.round(darlehen * 100) / 100,
      darlehensRate: Math.round(darlehensRate * 100) / 100,
      tilgungsMonate,
      darlehensJahre,
      zinsenDarlehen: Math.round(zinsenDarlehen * 100) / 100,
      gesamtKosten: Math.round(gesamtKosten * 100) / 100,
      gesamtLaufzeit: ansparJahre + darlehensJahre,
    };
  }, [bausparsumme, sparrate, guthabenzins, darlehenszins, abschlussgebuehr, wohnungsbau, familienstand]);

  const fmt = (n: number) => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  const fmtPct = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';

  const schnellSummen = [25000, 50000, 75000, 100000, 150000];

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Bauspar-Rechner" rechnerSlug="bauspar-rechner" />

<div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">🏠</span>
          Bauspar-Rechner
        </h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bausparsumme (€)</label>
            <input
              type="number"
              value={bausparsumme}
              onChange={(e) => setBausparsumme(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-lg"
              min={5000}
              step={1000}
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {schnellSummen.map(s => (
                <button
                  key={s}
                  onClick={() => setBausparsumme(s)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    bausparsumme === s 
                      ? 'bg-teal-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-teal-100 hover:text-teal-700'
                  }`}
                >
                  {(s/1000)}k
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monatliche Sparrate (€)</label>
            <input
              type="number"
              value={sparrate}
              onChange={(e) => setSparrate(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-lg"
              min={25}
              step={25}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Guthabenzins (%)</label>
              <input
                type="number"
                value={guthabenzins}
                onChange={(e) => setGuthabenzins(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                min={0}
                max={5}
                step={0.01}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Darlehenszins (%)</label>
              <input
                type="number"
                value={darlehenszins}
                onChange={(e) => setDarlehenszins(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                min={0}
                max={10}
                step={0.05}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Abschlussgebühr (%)</label>
            <input
              type="number"
              value={abschlussgebuehr}
              onChange={(e) => setAbschlussgebuehr(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              min={0}
              max={3}
              step={0.1}
            />
          </div>

          <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={wohnungsbau}
                onChange={(e) => setWohnungsbau(e.target.checked)}
                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
              />
              <span className="text-sm font-medium text-teal-800">Wohnungsbauprämie berücksichtigen</span>
            </label>
            {wohnungsbau && (
              <div className="mt-3 flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={familienstand === 'ledig'}
                    onChange={() => setFamilienstand('ledig')}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-teal-700">Ledig (max. 70 €/Jahr)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={familienstand === 'verheiratet'}
                    onChange={() => setFamilienstand('verheiratet')}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-teal-700">Verheiratet (max. 140 €/Jahr)</span>
                </label>
              </div>
            )}
          </div>

          <button
            onClick={() => setBerechnet(true)}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold py-4 px-6 rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
          >
            🏠 Bausparvertrag berechnen
          </button>
        </div>
      </div>

      {berechnet && ergebnis && (
        <>
          {/* Timeline */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📅</span>
              Zeitplan
            </h2>

            <div className="relative">
              {/* Ansparphase */}
              <div className="flex items-start gap-4 mb-6">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-sm">1</div>
                  <div className="w-0.5 h-16 bg-teal-200"></div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">Ansparphase</h3>
                  <p className="text-sm text-gray-500">ca. {ergebnis.ansparJahre} Jahre ({ergebnis.ansparMonate} Monate)</p>
                  <div className="mt-2 p-3 bg-teal-50 rounded-lg text-sm">
                    <div className="flex justify-between"><span>Eingezahlt:</span><span className="font-medium">{fmt(ergebnis.eingezahlt)}</span></div>
                    <div className="flex justify-between"><span>Guthabenzinsen:</span><span className="font-medium text-green-600">+ {fmt(ergebnis.zinsenGesamt)}</span></div>
                    <div className="flex justify-between"><span>Abschlussgebühr:</span><span className="font-medium text-red-600">- {fmt(ergebnis.abschlussKosten)}</span></div>
                    {ergebnis.praemieGesamt > 0 && (
                      <div className="flex justify-between"><span>Wohnungsbauprämie:</span><span className="font-medium text-green-600">+ {fmt(ergebnis.praemieGesamt)}</span></div>
                    )}
                    <div className="flex justify-between border-t border-teal-200 mt-2 pt-2 font-bold">
                      <span>Guthaben bei Zuteilung:</span><span>{fmt(ergebnis.guthabenBeiZuteilung)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Zuteilung */}
              <div className="flex items-start gap-4 mb-6">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm">✓</div>
                  <div className="w-0.5 h-16 bg-amber-200"></div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">Zuteilung</h3>
                  <p className="text-sm text-gray-500">Mindestguthaben {fmt(ergebnis.mindestguthaben)} erreicht</p>
                  <div className="mt-2 p-3 bg-amber-50 rounded-lg text-sm">
                    <div className="flex justify-between font-bold">
                      <span>Bauspardarlehen:</span><span>{fmt(ergebnis.darlehen)}</span>
                    </div>
                    <p className="text-xs text-amber-600 mt-1">= Bausparsumme minus Guthaben</p>
                  </div>
                </div>
              </div>

              {/* Darlehensphase */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">2</div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">Darlehensphase</h3>
                  <p className="text-sm text-gray-500">ca. {ergebnis.darlehensJahre} Jahre ({ergebnis.tilgungsMonate} Monate)</p>
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
                    <div className="flex justify-between"><span>Monatliche Rate:</span><span className="font-medium">{fmt(ergebnis.darlehensRate)}</span></div>
                    <div className="flex justify-between"><span>Darlehenszins:</span><span className="font-medium">{fmtPct(darlehenszins)}</span></div>
                    <div className="flex justify-between"><span>Zinsen gesamt:</span><span className="font-medium text-red-600">{fmt(ergebnis.zinsenDarlehen)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Zusammenfassung */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Zusammenfassung
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Bausparsumme</span>
                <span className="font-medium">{fmt(ergebnis.bausparsumme)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Abschlussgebühr</span>
                <span className="font-medium text-red-600">{fmt(ergebnis.abschlussKosten)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Guthabenzinsen (Ansparphase)</span>
                <span className="font-medium text-green-600">+ {fmt(ergebnis.zinsenGesamt)}</span>
              </div>
              {ergebnis.praemieGesamt > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Wohnungsbauprämie gesamt</span>
                  <span className="font-medium text-green-600">+ {fmt(ergebnis.praemieGesamt)}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Darlehenszinsen</span>
                <span className="font-medium text-red-600">{fmt(ergebnis.zinsenDarlehen)}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-teal-50 -mx-2 px-4 rounded-lg">
                <span className="font-bold text-teal-800">Gesamtkosten (netto)</span>
                <span className="font-bold text-teal-800 text-xl">{fmt(ergebnis.gesamtKosten)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Gesamtlaufzeit</span>
                <span className="font-medium">ca. {ergebnis.gesamtLaufzeit.toFixed(1)} Jahre</span>
              </div>
            </div>
          </div>

          {/* Hinweise */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Hinweise
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg">
                <span className="text-xl">🏦</span>
                <p className="text-teal-800">
                  <strong>Zuteilung:</strong> Erfolgt i.d.R. nach Erreichen von 40-50% der Bausparsumme. 
                  Zusätzlich muss eine Mindestbewertungszahl erreicht werden.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-xl">📋</span>
                <p className="text-blue-800">
                  <strong>Wohnungsbauprämie 2026:</strong> 10% auf max. 700 €/Jahr (ledig) bzw. 1.400 €/Jahr (verheiratet). 
                  Einkommensgrenze: 35.000 € / 70.000 € zvE.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <span className="text-xl">⚠️</span>
                <p className="text-amber-800">
                  <strong>Vereinfachung:</strong> Dieser Rechner dient zur Orientierung. Die tatsächlichen 
                  Konditionen hängen vom jeweiligen Tarif der Bausparkasse ab.
                </p>
              </div>
            </div>
</div>
        </>
      )}
    </div>
  );
}
