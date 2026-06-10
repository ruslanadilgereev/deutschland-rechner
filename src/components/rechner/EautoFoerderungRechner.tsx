import { useState, useMemo } from 'react';
import {
  berechneFoerderung,
  type Fahrzeugtyp,
  type Nutzungsart,
  type Wohnungstyp,
  type Bundesland,
} from '../../data/eautoFoerderung';

const formatEuro = (n: number) =>
  n.toLocaleString('de-DE', { maximumFractionDigits: 0 }) + ' €';

export default function EautoFoerderungRechner() {
  const [fahrzeugtyp, setFahrzeugtyp] = useState<Fahrzeugtyp>('bev');
  const [zvE, setZvE] = useState(50_000);
  const [kinder, setKinder] = useState<0 | 1 | 2>(0);
  const [nutzungsart, setNutzungsart] = useState<Nutzungsart>('privat');
  const [listenpreis, setListenpreis] = useState(40_000);
  const [erweiterung, setErweiterung] = useState(false);
  const [istDienstwagen, setIstDienstwagen] = useState(false);
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(0.35);
  const [wohnungstyp, setWohnungstyp] = useState<Wohnungstyp>('efh');
  const [bundesland, setBundesland] = useState<Bundesland>('sonstige');
  const [jahresfahrleistungKm, setJahresfahrleistungKm] = useState(13_500);

  const ergebnis = useMemo(
    () =>
      berechneFoerderung({
        fahrzeugtyp,
        zvE,
        kinder,
        nutzungsart,
        listenpreis,
        wohnungstyp,
        bundesland,
        istDienstwagen,
        grenzsteuersatz,
        jahresfahrleistungKm,
      }),
    [fahrzeugtyp, zvE, kinder, nutzungsart, listenpreis, wohnungstyp, bundesland, istDienstwagen, grenzsteuersatz, jahresfahrleistungKm],
  );

  return (
    <div className="max-w-2xl mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Fahrzeugtyp */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Fahrzeugtyp</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setFahrzeugtyp('bev')}
              className={`py-3 px-3 rounded-xl font-medium transition-colors ${
                fahrzeugtyp === 'bev'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ⚡ BEV (Reines E-Auto)
            </button>
            <button
              onClick={() => setFahrzeugtyp('phev')}
              className={`py-3 px-3 rounded-xl font-medium transition-colors ${
                fahrzeugtyp === 'phev'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🔌 PHEV (Plug-in-Hybrid)
            </button>
          </div>
          {fahrzeugtyp === 'phev' && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2">
              ⚠ PHEV-Förderung läuft am <strong>30.06.2027</strong> aus. Plus: mind. 60 g CO₂/km ODER 80 km E-Reichweite Pflicht.
            </p>
          )}
        </div>

        {/* Nutzungsart */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Nutzungsart</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setNutzungsart('privat')}
              className={`py-3 px-3 rounded-xl font-medium transition-colors ${
                nutzungsart === 'privat'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              👤 Privat
            </button>
            <button
              onClick={() => setNutzungsart('gewerbe')}
              className={`py-3 px-3 rounded-xl font-medium transition-colors ${
                nutzungsart === 'gewerbe'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🏢 Gewerbe
            </button>
          </div>
          {nutzungsart === 'gewerbe' && (
            <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-2 mt-2">
              ℹ Gewerbe ist von BAFA-Kaufprämie ausgeschlossen — dafür Turbo-AfA (§7 Abs.2a EStG, 75% im Jahr 1).
            </p>
          )}
        </div>

        {/* Listenpreis */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Bruttolistenpreis</span>
          </label>
          <input
            type="number"
            value={listenpreis}
            onChange={(e) => setListenpreis(Math.max(0, Number(e.target.value)))}
            className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
          />
          <input
            type="range"
            min={15000}
            max={120000}
            step={1000}
            value={listenpreis}
            onChange={(e) => setListenpreis(Number(e.target.value))}
            className="w-full mt-3 accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>15.000 €</span>
            <span>120.000 €</span>
          </div>
        </div>

        {/* zvE (nur für Privat relevant) */}
        {nutzungsart === 'privat' && (
          <>
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">zu versteuerndes Haushaltseinkommen (zvE)</span>
                <span className="text-xs text-gray-500 block mt-0.5">
                  ≠ Brutto! Aus dem Steuerbescheid. Faustregel: Brutto −20–25%.
                </span>
              </label>
              <input
                type="number"
                value={zvE}
                onChange={(e) => setZvE(Math.max(0, Number(e.target.value)))}
                className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
              />
              <input
                type="range"
                min={10000}
                max={150000}
                step={1000}
                value={zvE}
                onChange={(e) => setZvE(Number(e.target.value))}
                className="w-full mt-3 accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10.000 €</span>
                <span>150.000 €</span>
              </div>
            </div>

            {/* Kinder */}
            <div className="mb-6">
              <label className="block mb-3">
                <span className="text-gray-700 font-medium">Kinder unter 18 Jahren</span>
                <span className="text-xs text-gray-500 block mt-0.5">+500 € pro Kind, max. 2</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((n) => (
                  <button
                    key={n}
                    onClick={() => setKinder(n as 0 | 1 | 2)}
                    className={`py-3 rounded-xl font-medium transition-colors ${
                      kinder === n
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {n === 2 ? '2 oder mehr' : n}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Erweiterte Optionen */}
        <button
          onClick={() => setErweiterung(!erweiterung)}
          className="w-full flex items-center justify-between py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium text-gray-700"
        >
          <span>⚙️ Erweiterte Optionen (Wallbox, Fahrleistung, Dienstwagen)</span>
          <span className={`transform transition-transform ${erweiterung ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {erweiterung && (
          <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-xl">
            <div>
              <label className="block mb-2 text-sm">
                <span className="text-gray-700 font-medium">Jahresfahrleistung (km)</span>
              </label>
              <input
                type="number"
                value={jahresfahrleistungKm}
                onChange={(e) => setJahresfahrleistungKm(Math.max(0, Number(e.target.value)))}
                className="w-full text-lg font-bold text-center py-2 px-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-0 outline-none bg-white"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm">
                <span className="text-gray-700 font-medium">Wohnsituation (für Wallbox)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ['efh', 'Eigenes EFH'],
                  ['mfh', 'Mehrfamilienhaus'],
                  ['mieter', 'Mieter'],
                ] as [Wohnungstyp, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setWohnungstyp(key)}
                    className={`py-2 text-xs rounded-lg font-medium transition-colors ${
                      wohnungstyp === key ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-200 text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm">
                <span className="text-gray-700 font-medium">Bundesland (für Landesförderung)</span>
              </label>
              <select
                value={bundesland}
                onChange={(e) => setBundesland(e.target.value as Bundesland)}
                className="w-full py-2 px-3 border-2 border-gray-200 rounded-lg bg-white focus:border-emerald-500 focus:ring-0 outline-none"
              >
                <option value="sonstige">Andere</option>
                <option value="nrw">Nordrhein-Westfalen</option>
                <option value="bw">Baden-Württemberg</option>
              </select>
            </div>

            {nutzungsart === 'gewerbe' && (
              <>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="dw"
                    checked={istDienstwagen}
                    onChange={(e) => setIstDienstwagen(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                  />
                  <label htmlFor="dw" className="text-sm text-gray-700">
                    Als Dienstwagen privat genutzt (0,25%-Regelung)
                  </label>
                </div>
                <div>
                  <label className="block mb-2 text-sm">
                    <span className="text-gray-700 font-medium">Persönlicher Grenzsteuersatz</span>
                  </label>
                  <select
                    value={grenzsteuersatz}
                    onChange={(e) => setGrenzsteuersatz(Number(e.target.value))}
                    className="w-full py-2 px-3 border-2 border-gray-200 rounded-lg bg-white focus:border-emerald-500 focus:ring-0 outline-none"
                  >
                    <option value={0.25}>25%</option>
                    <option value={0.30}>30%</option>
                    <option value={0.35}>35%</option>
                    <option value={0.42}>42%</option>
                    <option value={0.45}>45%</option>
                  </select>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">💰 Gesamt-Förderpaket</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.gesamtFoerderpaket)}</span>
          </div>
          <p className="text-emerald-100 mt-2 text-sm">
            Effektiver Kaufpreis nach Kaufprämie + Turbo-AfA: <strong>{formatEuro(ergebnis.effektiverKaufpreis)}</strong>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {ergebnis.kaufpraemie > 0 && (
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <span className="text-xs opacity-80">BAFA-Kaufprämie</span>
              <div className="text-xl font-bold">{formatEuro(ergebnis.kaufpraemie)}</div>
              {ergebnis.kaufpraemieDetail.kinderBonus > 0 && (
                <span className="text-xs text-emerald-100">inkl. {formatEuro(ergebnis.kaufpraemieDetail.kinderBonus)} Kinderbonus</span>
              )}
            </div>
          )}
          {ergebnis.kfzSteuerErsparnis > 0 && (
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <span className="text-xs opacity-80">KFZ-Steuer (10 J.)</span>
              <div className="text-xl font-bold">{formatEuro(ergebnis.kfzSteuerErsparnis)}</div>
              <span className="text-xs text-emerald-100">≈ {formatEuro(ergebnis.kfzSteuerProJahr)}/Jahr</span>
            </div>
          )}
          {ergebnis.thgQuoteFuenfJahre > 0 && (
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <span className="text-xs opacity-80">THG-Quote (5 J.)</span>
              <div className="text-xl font-bold">{formatEuro(ergebnis.thgQuoteFuenfJahre)}</div>
              <span className="text-xs text-emerald-100">≈ {formatEuro(ergebnis.thgProJahr)}/Jahr</span>
            </div>
          )}
          {ergebnis.wallboxFoerderung > 0 && (
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <span className="text-xs opacity-80">Wallbox-Zuschuss</span>
              <div className="text-xl font-bold">{formatEuro(ergebnis.wallboxFoerderung)}</div>
            </div>
          )}
          {ergebnis.turboAfaJahr1 > 0 && (
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <span className="text-xs opacity-80">Turbo-AfA Jahr 1</span>
              <div className="text-xl font-bold">{formatEuro(ergebnis.turboAfaJahr1)}</div>
              <span className="text-xs text-emerald-100">Liquidität §7 Abs.2a</span>
            </div>
          )}
          {ergebnis.dienstwagenVorteilProJahr > 0 && (
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <span className="text-xs opacity-80">Dienstwagen-Vorteil</span>
              <div className="text-xl font-bold">{formatEuro(ergebnis.dienstwagenVorteilProJahr)}/Jahr</div>
              <span className="text-xs text-emerald-100">0,25%-Regel</span>
            </div>
          )}
        </div>

        {/* Spritersparnis-Block */}
        <div className="mt-4 bg-white/10 rounded-xl p-4">
          <p className="text-sm">
            <strong>Plus laufende Spritersparnis</strong> ggü. Verbrenner:
            ca. {formatEuro(ergebnis.spritersparnisProJahr)}/Jahr ·
            {formatEuro(ergebnis.spritersparnis10Jahre)} über 10 Jahre
          </p>
        </div>

        {/* Klippe-Warnung */}
        {ergebnis.kaufpraemieDetail.klippeWarnung && (
          <div className="mt-4 bg-amber-500/20 border border-amber-300/30 rounded-xl p-3 text-sm">
            ⚠ {ergebnis.kaufpraemieDetail.klippeWarnung}
          </div>
        )}
      </div>

      {/* Berechnungs-Details */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 So setzt sich Ihre Förderung zusammen</h3>
        <div className="space-y-3 text-sm">
          {ergebnis.kaufpraemieDetail.foerderfaehig && (
            <div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">BAFA-Kaufprämie Basis ({ergebnis.kaufpraemieDetail.tier})</span>
                <span className="font-bold text-gray-900">{formatEuro(ergebnis.kaufpraemieDetail.basisBetrag)}</span>
              </div>
              {ergebnis.kaufpraemieDetail.kinderBonus > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">+ Kinderbonus ({kinder} Kind{kinder > 1 ? 'er' : ''} × 500 €)</span>
                  <span className="font-bold text-gray-900">+{formatEuro(ergebnis.kaufpraemieDetail.kinderBonus)}</span>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">KFZ-Steuer-Befreiung (10 Jahre, §3d KraftStG)</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.kfzSteuerErsparnis)}</span>
          </div>
          {ergebnis.thgQuoteFuenfJahre > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">THG-Quote (5 Jahre, geschätzt 200–330€/Jahr)</span>
              <span className="font-bold text-gray-900">{formatEuro(ergebnis.thgQuoteFuenfJahre)}</span>
            </div>
          )}
          {ergebnis.wallboxFoerderung > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Wallbox-Förderung</span>
              <span className="font-bold text-gray-900">{formatEuro(ergebnis.wallboxFoerderung)}</span>
            </div>
          )}
          {ergebnis.turboAfaJahr1 > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Turbo-AfA Jahr 1 (§7 Abs.2a EStG, Liquiditätswirkung)</span>
              <span className="font-bold text-gray-900">{formatEuro(ergebnis.turboAfaJahr1)}</span>
            </div>
          )}
          {ergebnis.dienstwagenVorteilProJahr > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Dienstwagen-Vorteil pro Jahr (0,25%-Regel)</span>
              <span className="font-bold text-gray-900">{formatEuro(ergebnis.dienstwagenVorteilProJahr)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 bg-emerald-50 -mx-6 px-6 mt-2 font-bold text-emerald-900">
            <span>Gesamt-Förderpaket</span>
            <span>{formatEuro(ergebnis.gesamtFoerderpaket)}</span>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
        <h4 className="font-bold text-blue-900 mb-2 text-sm">📌 Wichtige Hinweise zur Förderung 2026</h4>
        <ul className="text-xs text-blue-800 space-y-1.5">
          <li>• <strong>Antrag-Portal</strong>: BAFA voraussichtlich ab Mai 2026 online (Förderung gilt rückwirkend ab 01.01.2026)</li>
          <li>• <strong>Mindesthaltedauer</strong>: 36 Monate (von 12 auf 36 verdreifacht!) — bei vorzeitigem Verkauf wird Kaufprämie zurückgefordert</li>
          <li>• <strong>Topf-Begrenzung</strong>: 3 Mrd. € für ~800.000 Fahrzeuge bis 2029 — Antrag früh stellen</li>
          <li>• <strong>Beratung</strong>: Bei Unsicherheit BAFA-Hotline 06196 908-1009</li>
        </ul>
      </div>
    </div>
  );
}
