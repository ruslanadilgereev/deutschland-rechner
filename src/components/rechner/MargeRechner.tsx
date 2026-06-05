import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Margen- & Aufschlag-Rechner (Handelskalkulation)
// Formeln (alle mit Nettopreisen):
//   Gewinn (absolut)            = VK - EK
//   Marge / Handelsspanne (%)   = (VK - EK) / VK * 100   -> Bezug Verkaufspreis ("von oben")
//   Aufschlag / Kalk.-Zuschlag  = (VK - EK) / EK * 100   -> Bezug Einkaufspreis ("von unten")
// Quellen:
//   https://welt-der-bwl.de/Handelsspanne
//   https://www.blitzrechner.de/marge-berechnen/

type Modus = 'preise' | 'marge';

const MWST_SAETZE = [0, 7, 19];

function fmtEuro(value: number): string {
  if (!isFinite(value)) return '–';
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtProzent(value: number): string {
  if (!isFinite(value)) return '–';
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export default function MargeRechner() {
  const [modus, setModus] = useState<Modus>('preise');

  // Modus "preise": EK + VK eingeben
  const [ekStr, setEkStr] = useState('60');
  const [vkStr, setVkStr] = useState('100');

  // Modus "marge": EK + gewünschte Marge eingeben
  const [margeEkStr, setMargeEkStr] = useState('60');
  const [zielMargeStr, setZielMargeStr] = useState('40');

  // MwSt-Anzeige (Bruttopreis aus Netto-VK)
  const [mwst, setMwst] = useState(19);

  const ek = parseFloat((modus === 'preise' ? ekStr : margeEkStr).replace(',', '.')) || 0;

  let vk: number;
  if (modus === 'preise') {
    vk = parseFloat(vkStr.replace(',', '.')) || 0;
  } else {
    // VK aus EK + gewünschter Marge (Handelsspanne vom VK):
    //   Marge = (VK - EK) / VK   =>   VK = EK / (1 - Marge/100)
    const zielMarge = parseFloat(zielMargeStr.replace(',', '.')) || 0;
    vk = zielMarge < 100 && zielMarge >= 0 ? ek / (1 - zielMarge / 100) : 0;
  }

  const gewinn = vk - ek;
  const marge = vk > 0 ? (gewinn / vk) * 100 : 0; // Handelsspanne, Bezug VK
  const aufschlag = ek > 0 ? (gewinn / ek) * 100 : 0; // Kalkulationszuschlag, Bezug EK
  const vkBrutto = vk * (1 + mwst / 100);

  const verlust = gewinn < 0;

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Margen- & Aufschlag-Rechner" rechnerSlug="marge-rechner" />

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Modus-Umschalter */}
        <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
          <button
            onClick={() => setModus('preise')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              modus === 'preise'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Aus EK &amp; VK
          </button>
          <button
            onClick={() => setModus('marge')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              modus === 'marge'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Aus EK &amp; Wunsch-Marge
          </button>
        </div>

        {modus === 'preise' ? (
          <div className="space-y-5">
            <label className="block">
              <span className="text-gray-700 font-medium">Einkaufspreis (EK, netto)</span>
              <div className="mt-2 relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={ekStr}
                  onChange={(e) => setEkStr(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-300 text-lg font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="z. B. 60"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">Verkaufspreis (VK, netto)</span>
              <div className="mt-2 relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={vkStr}
                  onChange={(e) => setVkStr(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-300 text-lg font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="z. B. 100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
            </label>
          </div>
        ) : (
          <div className="space-y-5">
            <label className="block">
              <span className="text-gray-700 font-medium">Einkaufspreis (EK, netto)</span>
              <div className="mt-2 relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={margeEkStr}
                  onChange={(e) => setMargeEkStr(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-300 text-lg font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="z. B. 60"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">Gewünschte Marge (Handelsspanne)</span>
              <div className="mt-2 relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={zielMargeStr}
                  onChange={(e) => setZielMargeStr(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-300 text-lg font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="z. B. 40"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                Anteil des Gewinns am Verkaufspreis (muss unter 100 % liegen)
              </span>
            </label>
          </div>
        )}

        {/* MwSt-Auswahl */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <span className="text-gray-700 font-medium text-sm">
            Brutto-Verkaufspreis anzeigen mit MwSt
          </span>
          <div className="mt-2 flex gap-2">
            {MWST_SAETZE.map((satz) => (
              <button
                key={satz}
                onClick={() => setMwst(satz)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  mwst === satz
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {satz === 0 ? 'ohne' : `${satz} %`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">
          {modus === 'marge' ? 'Empfohlener Verkaufspreis (netto)' : 'Ihre Marge'}
        </h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">
              {modus === 'marge' ? fmtEuro(vk) : fmtProzent(marge)}
            </span>
            <span className="text-xl text-blue-200">{modus === 'marge' ? '€' : '%'}</span>
          </div>
          {modus === 'marge' && (
            <p className="text-sm text-blue-100 mt-1">
              für eine Marge von {fmtProzent(parseFloat(zielMargeStr.replace(',', '.')) || 0)} %
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Gewinn (VK − EK)</span>
              <span className={`text-xl font-bold ${verlust ? 'text-red-200' : ''}`}>
                {fmtEuro(gewinn)} €
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-xs text-blue-100 mb-1">Marge / Handelsspanne</p>
              <p className="text-lg font-bold">{fmtProzent(marge)} %</p>
              <p className="text-[11px] text-blue-200 mt-0.5">vom Verkaufspreis</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-xs text-blue-100 mb-1">Aufschlag / Zuschlag</p>
              <p className="text-lg font-bold">{fmtProzent(aufschlag)} %</p>
              <p className="text-[11px] text-blue-200 mt-0.5">auf den Einkaufspreis</p>
            </div>
          </div>

          {mwst > 0 && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">VK brutto ({mwst} % MwSt)</span>
                <span className="text-xl font-bold">{fmtEuro(vkBrutto)} €</span>
              </div>
            </div>
          )}
        </div>

        {verlust && (
          <div className="mt-4 bg-red-500/20 border border-red-300/30 rounded-xl p-3 text-sm">
            ⚠️ Der Verkaufspreis liegt unter dem Einkaufspreis – Sie machen pro Stück Verlust.
          </div>
        )}
      </div>

      {/* Erklärung Aufschlag vs. Marge */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">📐 Aufschlag oder Marge? Der Unterschied</h3>
        <p className="text-sm text-gray-600 mb-4">
          Beide Kennzahlen beschreiben denselben Gewinn – aber mit unterschiedlichem Bezugswert.
          Die Verwechslung ist der häufigste Kalkulationsfehler.
        </p>
        <div className="space-y-3 text-sm">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="font-semibold text-blue-900">Aufschlag (Kalkulationszuschlag)</p>
            <p className="text-blue-700 mt-1">
              Gewinn ÷ <strong>Einkaufspreis</strong> × 100. Frage: „Wie viel schlage ich auf den
              EK drauf, um zum VK zu kommen?“
            </p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4">
            <p className="font-semibold text-purple-900">Marge (Handelsspanne)</p>
            <p className="text-purple-700 mt-1">
              Gewinn ÷ <strong>Verkaufspreis</strong> × 100. Frage: „Wie viel Prozent vom VK bleibt
              als Rohertrag übrig?“
            </p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 text-yellow-800">
            <strong>Faustregel:</strong> Der Aufschlag ist bei gleichem Gewinn immer größer als die
            Marge. 100 % Aufschlag entsprechen nur 50 % Marge, 50 % Aufschlag nur 33,3 % Marge.
          </div>
        </div>
      </div>

      {/* So funktioniert's */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Berechnung</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Gewinn</strong> = Verkaufspreis − Einkaufspreis (Rohertrag pro Stück)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Marge</strong> = Gewinn ÷ VK × 100 (in Prozent vom Verkaufspreis)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Aufschlag</strong> = Gewinn ÷ EK × 100 (in Prozent vom Einkaufspreis)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Gerechnet wird mit <strong>Nettopreisen</strong> – die MwSt ist nur ein Durchlaufposten
            </span>
          </li>
        </ul>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://welt-der-bwl.de/Handelsspanne"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Welt der BWL – Handelsspanne &amp; Kalkulationszuschlag
          </a>
          <a
            href="https://www.blitzrechner.de/marge-berechnen/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Blitzrechner – Marge &amp; Aufschlag berechnen
          </a>
        </div>
      </div>
    </div>
  );
}
