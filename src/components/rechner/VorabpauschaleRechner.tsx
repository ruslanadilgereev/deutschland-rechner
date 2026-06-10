import { useState } from 'react';

// Vorabpauschale 2026
// Basiszins zum 2. Januar 2026 = 3,20 % (BMF-Schreiben vom 13.01.2026, § 18 Abs. 4 InvStG;
// auf Basis der von der Deutschen Bundesbank berechneten Rendite öffentlicher Anleihen).
// Quelle: https://www.bundesfinanzministerium.de
const BASISZINS = 0.0320; // 3,20 % (2025 zum Vergleich: 2,53 %)
const BASISERTRAG_FAKTOR = 0.7; // gesetzlicher Abschlag: nur 70 % des Basiszinses

const KAPST = 0.25; // Kapitalertragsteuer / Abgeltungsteuer
const SOLI = 0.055; // Solidaritätszuschlag (5,5 % der KapSt)

type Fondstyp = 'aktien' | 'misch' | 'sonstige';

const TEILFREISTELLUNG: Record<Fondstyp, number> = {
  aktien: 0.30, // Aktienfonds / Aktien-ETF (Aktienanteil >= 51 %)
  misch: 0.15, // Mischfonds (Aktienanteil >= 25 %)
  sonstige: 0.0, // sonstige Fonds (z. B. Renten-/Geldmarkt-ETF)
};

const FONDSTYP_LABEL: Record<Fondstyp, string> = {
  aktien: 'Aktien-ETF / Aktienfonds (30 %)',
  misch: 'Mischfonds (15 %)',
  sonstige: 'Sonstige Fonds (0 %)',
};

function eur(value: number): string {
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function VorabpauschaleRechner() {
  const [fondswert, setFondswert] = useState(20000);
  const [wertsteigerung, setWertsteigerung] = useState(2000);
  const [fondstyp, setFondstyp] = useState<Fondstyp>('aktien');
  const [kirchensteuer, setKirchensteuer] = useState(false);
  const [kirchensteuerSatz, setKirchensteuerSatz] = useState(0.09); // 9 % (8 % in BY/BW)

  // 1) Basisertrag = Fondswert Jahresanfang x Basiszins x 0,7
  const basisertrag = Math.max(0, fondswert) * BASISZINS * BASISERTRAG_FAKTOR;

  // 2) Vorabpauschale = kleinerer Wert aus Basisertrag und tatsächlicher Wertsteigerung,
  //    niemals negativ (bei Wertverlust oder Ausschüttung > Basisertrag = 0)
  const wertsteigerungPositiv = Math.max(0, wertsteigerung);
  const vorabpauschale = Math.max(0, Math.min(basisertrag, wertsteigerungPositiv));

  // 3) Teilfreistellung je nach Fondstyp
  const teilfreistellungsSatz = TEILFREISTELLUNG[fondstyp];
  const teilfreistellungsBetrag = vorabpauschale * teilfreistellungsSatz;
  const steuerpflichtigerBetrag = vorabpauschale - teilfreistellungsBetrag;

  // 4) Steuer: 25 % KapSt + 5,5 % Soli (+ ggf. Kirchensteuer)
  const kapitalertragsteuer = steuerpflichtigerBetrag * KAPST;
  const soli = kapitalertragsteuer * SOLI;
  const kirche = kirchensteuer ? kapitalertragsteuer * kirchensteuerSatz : 0;
  const steuerGesamt = kapitalertragsteuer + soli + kirche;

  // effektiver Steuersatz auf die (volle) Vorabpauschale
  const effektivSatz = vorabpauschale > 0 ? (steuerGesamt / vorabpauschale) * 100 : 0;

  const keineSteuerGrund =
    wertsteigerungPositiv <= 0
      ? 'Der Fonds ist im Jahr nicht gestiegen – es fällt keine Vorabpauschale an.'
      : steuerGesamt <= 0
        ? 'Auf diese Vorabpauschale fällt rechnerisch keine Steuer an.'
        : null;

  return (
    <div className="max-w-lg mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block mb-5">
          <span className="text-gray-700 font-medium">Fondswert am Jahresanfang (Rücknahmepreis 2. Januar)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              min={0}
              step={500}
              value={fondswert}
              onChange={(e) => setFondswert(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 text-lg font-semibold text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </label>

        <label className="block mb-5">
          <span className="text-gray-700 font-medium">Wertsteigerung im Jahr (Kursgewinn)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              step={250}
              value={wertsteigerung}
              onChange={(e) => setWertsteigerung(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 text-lg font-semibold text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <span className="mt-1 block text-xs text-gray-500">
            Wertzuwachs Ihres Anteils im Kalenderjahr. Bei Verlust 0 oder negativen Wert eintragen.
          </span>
        </label>

        <label className="block mb-5">
          <span className="text-gray-700 font-medium">Fondstyp (Teilfreistellung)</span>
          <select
            value={fondstyp}
            onChange={(e) => setFondstyp(e.target.value as Fondstyp)}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          >
            <option value="aktien">{FONDSTYP_LABEL.aktien}</option>
            <option value="misch">{FONDSTYP_LABEL.misch}</option>
            <option value="sonstige">{FONDSTYP_LABEL.sonstige}</option>
          </select>
        </label>

        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-medium">Kirchensteuer einbeziehen</span>
          <button
            type="button"
            onClick={() => setKirchensteuer(!kirchensteuer)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              kirchensteuer ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            aria-pressed={kirchensteuer}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                kirchensteuer ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {kirchensteuer && (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setKirchensteuerSatz(0.09)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                kirchensteuerSatz === 0.09
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-600'
              }`}
            >
              9 % (die meisten Länder)
            </button>
            <button
              type="button"
              onClick={() => setKirchensteuerSatz(0.08)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                kirchensteuerSatz === 0.08
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-600'
              }`}
            >
              8 % (Bayern, BW)
            </button>
          </div>
        )}
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Vorabpauschale 2026</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{eur(vorabpauschale)}</span>
            <span className="text-xl text-blue-200">€</span>
          </div>
          <p className="text-blue-100 text-sm mt-1">
            steuerpflichtiger Ertrag (vor Steuer, vor Sparerpauschbetrag)
          </p>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-100">Basisertrag (Fondswert × 3,20 % × 0,7)</span>
            <span className="font-medium">{eur(basisertrag)} €</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-100">Vergleichswert Wertsteigerung</span>
            <span className="font-medium">{eur(wertsteigerungPositiv)} €</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-100">– Teilfreistellung ({(teilfreistellungsSatz * 100).toFixed(0)} %)</span>
            <span className="font-medium">−{eur(teilfreistellungsBetrag)} €</span>
          </div>
          <div className="flex justify-between border-t border-white/20 pt-2">
            <span className="text-blue-100">steuerpflichtig nach Teilfreistellung</span>
            <span className="font-medium">{eur(steuerpflichtigerBetrag)} €</span>
          </div>
        </div>

        <div className="mt-4 bg-white/15 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-blue-100">Zu zahlende Steuer</span>
            <span className="text-2xl font-bold">{eur(steuerGesamt)} €</span>
          </div>
          <div className="space-y-1 text-xs text-blue-100">
            <div className="flex justify-between">
              <span>Kapitalertragsteuer (25 %)</span>
              <span>{eur(kapitalertragsteuer)} €</span>
            </div>
            <div className="flex justify-between">
              <span>Solidaritätszuschlag (5,5 %)</span>
              <span>{eur(soli)} €</span>
            </div>
            {kirchensteuer && (
              <div className="flex justify-between">
                <span>Kirchensteuer ({(kirchensteuerSatz * 100).toFixed(0)} %)</span>
                <span>{eur(kirche)} €</span>
              </div>
            )}
            {vorabpauschale > 0 && (
              <div className="flex justify-between border-t border-white/20 pt-1 mt-1">
                <span>effektiver Steuersatz</span>
                <span>{effektivSatz.toFixed(2).replace('.', ',')} %</span>
              </div>
            )}
          </div>
        </div>

        {keineSteuerGrund && (
          <p className="mt-4 text-sm bg-white/10 rounded-lg p-3">ℹ️ {keineSteuerGrund}</p>
        )}
      </div>

      {/* Hinweis Sparerpauschbetrag */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-900">
        <p className="font-semibold mb-1">💡 Sparerpauschbetrag nicht vergessen</p>
        <p>
          Bis zu <strong>1.000 € pro Jahr</strong> (Verheiratete 2.000 €) bleiben durch den
          Sparerpauschbetrag steuerfrei. Liegen Ihre gesamten Kapitalerträge inklusive
          Vorabpauschale darunter und haben Sie einen Freistellungsauftrag erteilt, führt die Bank
          <strong> keine Steuer</strong> ab. Der Rechner zeigt die Steuer <em>vor</em> Verrechnung
          mit dem Freibetrag.
        </p>
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert's</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Basiszins 2026: 3,20 %</strong> (BMF, Stand 2. Januar 2026; 2025: 2,53 %)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Basisertrag = Fondswert zum Jahresanfang × Basiszins × <strong>0,7</strong> (gesetzlicher Abschlag)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Vorabpauschale = <strong>kleinerer Wert</strong> aus Basisertrag und tatsächlicher Wertsteigerung
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Bei Wertverlust im Jahr: <strong>keine</strong> Vorabpauschale (nie negativ)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Teilfreistellung: Aktien-ETF 30 %, Mischfonds 15 %, sonstige 0 %</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Fällig im <strong>Januar 2027</strong> – die Depotbank bucht die Steuer automatisch vom Verrechnungskonto ab
            </span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 bg-gray-50 rounded-2xl p-5 text-sm text-gray-600">
        <p>
          <strong>Hinweis:</strong> Dieser Rechner liefert eine vereinfachte Berechnung nach
          § 18 InvStG ohne Gewähr und ersetzt keine Steuerberatung. Im Einzelfall können unterjährige
          Käufe/Verkäufe (Zwölftelung), Ausschüttungen und der individuelle Freistellungsauftrag das
          Ergebnis verändern.
        </p>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Investmentsteuer/2026-01-13-basiszins-berechnung-vorabpauschale.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF – Basiszins zur Berechnung der Vorabpauschale zum 2. Januar 2026 (§ 18 Abs. 4 InvStG)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/invstg_2018/__18.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 18 InvStG – Vorabpauschale (Gesetze im Internet)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/invstg_2018/__20.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 20 InvStG – Teilfreistellung (Gesetze im Internet)
          </a>
        </div>
      </div>
    </div>
  );
}
