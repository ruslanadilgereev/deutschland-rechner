import { useState, useMemo } from 'react';

// Mindestausbildungsvergütung (MiAV) nach § 17 Abs. 2 BBiG
// Basisbetrag (1. Ausbildungsjahr) wird jährlich vom BMBF im Bundesgesetzblatt
// bekanntgegeben. Staffelung: +18 % (2. LJ), +35 % (3. LJ), +40 % (4. LJ),
// amtlich auf volle Euro gerundet (NICHT roh multiplizieren!).
// Schlüssel = Ausbildungsbeginn-Jahr, Werte = [1. LJ, 2. LJ, 3. LJ, 4. LJ] in €/Monat.
// Quellen: § 17 BBiG (gesetze-im-internet.de), BIBB/BMBF (Bundesgesetzblatt).
const MIAV: Record<number, [number, number, number, number]> = {
  2020: [515, 608, 695, 721],
  2021: [550, 649, 743, 770],
  2022: [585, 690, 790, 819],
  2023: [620, 732, 837, 868],
  2024: [649, 766, 876, 909],
  2025: [682, 805, 921, 955],
  2026: [724, 854, 977, 1014],
};

const BEGINN_JAHRE = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

// Sozialversicherungs-Arbeitnehmeranteile 2026 (in Prozent vom Brutto)
// Quelle: SV-Sätze 2026; § 20 Abs. 3 SGB IV (Geringverdienergrenze 325 €)
const SV_AN = {
  rv: 9.3,    // Rentenversicherung (18,6 % gesamt → AN-Anteil 9,3 %)
  av: 1.3,    // Arbeitslosenversicherung (2,6 % gesamt → AN-Anteil 1,3 %)
  kv: 8.75,   // Krankenversicherung 14,6 % + ⌀-Zusatzbeitrag 2,9 % = 17,5 % → AN 8,75 %
  pv: 1.8,    // Pflegeversicherung (3,6 % gesamt → AN-Anteil 1,8 %, ohne Kinderlosen-Zuschlag)
};
const SV_AN_SUMME = SV_AN.rv + SV_AN.av + SV_AN.kv + SV_AN.pv; // = 21,15 %

// § 20 Abs. 3 Nr. 1 SGB IV: bis 325 €/Monat trägt der AG die SV-Beiträge allein
const GERINGVERDIENER_GRENZE = 325;

export default function AusbildungsverguetungRechner() {
  const [beginnJahr, setBeginnJahr] = useState(2026);
  const [lehrjahr, setLehrjahr] = useState(1); // 1–4
  const [eigeneVerguetung, setEigeneVerguetung] = useState(false);
  const [bruttoEingabe, setBruttoEingabe] = useState(724);
  const [nettoAnzeigen, setNettoAnzeigen] = useState(false);

  const ergebnis = useMemo(() => {
    const tabelle = MIAV[beginnJahr];
    const miavWert = tabelle[lehrjahr - 1];

    // Maßgebliches Brutto: amtliche MiAV oder eigene Eingabe
    const brutto = eigeneVerguetung ? bruttoEingabe : miavWert;

    // Vergleich eigene Vergütung ↔ MiAV-Untergrenze
    const unterMiav = eigeneVerguetung && brutto < miavWert;

    // Netto-Schätzung
    const istGeringverdiener = brutto <= GERINGVERDIENER_GRENZE;
    // Bei ≤ 325 €: AG trägt SV allein → Netto = Brutto (§ 20 Abs. 3 SGB IV)
    const svAnteil = istGeringverdiener ? 0 : brutto * (SV_AN_SUMME / 100);
    const svRv = istGeringverdiener ? 0 : brutto * (SV_AN.rv / 100);
    const svAv = istGeringverdiener ? 0 : brutto * (SV_AN.av / 100);
    const svKv = istGeringverdiener ? 0 : brutto * (SV_AN.kv / 100);
    const svPv = istGeringverdiener ? 0 : brutto * (SV_AN.pv / 100);
    // Lohnsteuer: alle MiAV-Beträge unter Grundfreibetrag (⌀ 1.029 €/Monat) → i.d.R. 0 €
    const netto = brutto - svAnteil;

    // Faktor für die Staffelungs-Anzeige
    const faktoren = [1.0, 1.18, 1.35, 1.4];

    return {
      miavWert,
      brutto: Math.round(brutto * 100) / 100,
      bruttoJahr: Math.round(brutto * 12 * 100) / 100,
      unterMiav,
      istGeringverdiener,
      svAnteil: Math.round(svAnteil * 100) / 100,
      svRv: Math.round(svRv * 100) / 100,
      svAv: Math.round(svAv * 100) / 100,
      svKv: Math.round(svKv * 100) / 100,
      svPv: Math.round(svPv * 100) / 100,
      netto: Math.round(netto * 100) / 100,
      faktor: faktoren[lehrjahr - 1],
      basisbetrag: tabelle[0],
      tabelle,
    };
  }, [beginnJahr, lehrjahr, eigeneVerguetung, bruttoEingabe, nettoAnzeigen]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuro0 = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  return (
    <div className="max-w-2xl mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Berechnungs-Modus */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Was möchtest du berechnen?</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setEigeneVerguetung(false)}
              className={`p-4 rounded-xl text-center transition-all ${
                !eigeneVerguetung
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl">📋</span>
              <div className="font-bold mt-1">Mindestvergütung</div>
              <div className="text-xs mt-1 opacity-80">Gesetzliche MiAV</div>
            </button>
            <button
              onClick={() => setEigeneVerguetung(true)}
              className={`p-4 rounded-xl text-center transition-all ${
                eigeneVerguetung
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl">✏️</span>
              <div className="font-bold mt-1">Eigene Vergütung</div>
              <div className="text-xs mt-1 opacity-80">z. B. laut Vertrag</div>
            </button>
          </div>
        </div>

        {/* Ausbildungsbeginn-Jahr */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Jahr des Ausbildungsbeginns</span>
          </label>
          <select
            value={beginnJahr}
            onChange={(e) => setBeginnJahr(Number(e.target.value))}
            className="w-full text-xl font-bold py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none bg-white"
          >
            {BEGINN_JAHRE.map((jahr) => (
              <option key={jahr} value={jahr}>{jahr}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2">
            Der Basisbetrag deines <strong>Start-Jahres</strong> bleibt für die gesamte Ausbildung
            maßgeblich – die Vergütung wächst nicht jährlich mit.
          </p>
        </div>

        {/* Ausbildungsjahr */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Aktuelles Ausbildungsjahr</span>
          </label>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((lj) => (
              <button
                key={lj}
                onClick={() => setLehrjahr(lj)}
                className={`p-4 rounded-xl text-center transition-all ${
                  lehrjahr === lj
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="font-bold text-lg">{lj}.</div>
                <div className="text-xs mt-1 opacity-80">
                  {lj === 1 ? 'Basis' : lj === 2 ? '+18 %' : lj === 3 ? '+35 %' : '+40 %'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Eigene Vergütung (nur bei eigeneVerguetung) */}
        {eigeneVerguetung && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Deine monatliche Brutto-Ausbildungsvergütung</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={bruttoEingabe}
                onChange={(e) => setBruttoEingabe(Math.max(0, Math.min(5000, Number(e.target.value))))}
                className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                min="0"
                max="5000"
                step="10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Gesetzliche Mindestvergütung ({beginnJahr}, {lehrjahr}. Jahr):
              <strong> {formatEuro0(ergebnis.miavWert)}</strong>
            </p>
          </div>
        )}

        {/* Netto-Toggle */}
        <div>
          <button
            onClick={() => setNettoAnzeigen(!nettoAnzeigen)}
            className={`w-full py-4 px-6 rounded-xl font-medium transition-all flex items-center justify-between ${
              nettoAnzeigen
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{nettoAnzeigen ? '✓ Netto-Schätzung anzeigen' : 'Netto-Schätzung anzeigen'}</span>
            <span className={`text-sm ${nettoAnzeigen ? 'bg-white/20' : 'bg-gray-200'} px-2 py-1 rounded`}>
              {nettoAnzeigen ? `ca. ${formatEuro(ergebnis.netto)}` : 'SV-Abzüge'}
            </span>
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Näherung: AN-Anteile RV 9,3 % + AV 1,3 % + KV 8,75 % + PV 1,8 % = 21,15 %.
            Lohnsteuer fällt bei diesen Beträgen i.d.R. nicht an (unter Grundfreibetrag).
          </p>
        </div>
      </div>

      {/* Warnung: eigene Vergütung unter MiAV */}
      {ergebnis.unterMiav && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-bold text-red-800">Unter der Mindestausbildungsvergütung!</h4>
              <p className="text-sm text-red-700 mt-1">
                Deine Vergütung von {formatEuro0(ergebnis.brutto)} liegt unter der gesetzlichen
                Untergrenze von {formatEuro0(ergebnis.miavWert)} (§ 17 Abs. 2 BBiG).
                Bei nach BBiG/HwO geregelten Ausbildungen ohne Tarifbindung ist das unzulässig.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Result Section - Hauptergebnis */}
      <div className="rounded-2xl shadow-lg p-6 text-white mb-6 bg-gradient-to-br from-green-500 to-emerald-600">
        <h3 className="text-sm font-medium opacity-80 mb-1">
          🎓 {eigeneVerguetung ? 'Deine Ausbildungsvergütung' : 'Mindestausbildungsvergütung'}
        </h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro0(ergebnis.brutto)}</span>
            <span className="text-xl opacity-80">brutto / Monat</span>
          </div>
          <span className="inline-block mt-2 bg-white/20 px-2 py-1 rounded text-sm">
            {beginnJahr} · {lehrjahr}. Ausbildungsjahr
            {!eigeneVerguetung && lehrjahr > 1 && ` · Faktor ${ergebnis.faktor.toLocaleString('de-DE')}`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Pro Jahr (brutto)</span>
            <div className="text-xl font-bold">{formatEuro0(ergebnis.bruttoJahr)}</div>
          </div>
          {nettoAnzeigen ? (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">Netto (ca.)</span>
              <div className="text-xl font-bold">{formatEuro(ergebnis.netto)}</div>
            </div>
          ) : (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">Basisbetrag {beginnJahr}</span>
              <div className="text-xl font-bold">{formatEuro0(ergebnis.basisbetrag)}</div>
            </div>
          )}
        </div>

        {nettoAnzeigen && ergebnis.istGeringverdiener && (
          <div className="mt-4 bg-white/20 rounded-xl p-3 text-sm">
            💡 Bis 325 €/Monat trägt der Arbeitgeber die Sozialversicherung allein
            (§ 20 Abs. 3 SGB IV) – hier gilt: <strong>Netto = Brutto</strong>.
          </div>
        )}
      </div>

      {/* Netto-Aufschlüsselung */}
      {nettoAnzeigen && !ergebnis.istGeringverdiener && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">📉 Netto-Schätzung (Abzüge)</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Brutto-Ausbildungsvergütung</span>
              <span className="font-bold text-gray-900">{formatEuro(ergebnis.brutto)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 text-orange-600">
              <span>− Rentenversicherung (9,3 %)</span>
              <span>{formatEuro(ergebnis.svRv)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 text-orange-600">
              <span>− Arbeitslosenversicherung (1,3 %)</span>
              <span>{formatEuro(ergebnis.svAv)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 text-orange-600">
              <span>− Krankenversicherung (8,75 %)</span>
              <span>{formatEuro(ergebnis.svKv)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 text-orange-600">
              <span>− Pflegeversicherung (1,8 %)</span>
              <span>{formatEuro(ergebnis.svPv)}</span>
            </div>
            <div className="flex justify-between py-2 bg-gray-50 -mx-6 px-6">
              <span className="font-medium text-gray-700">= SV-Abzüge gesamt (21,15 %)</span>
              <span className="font-bold text-gray-800">−{formatEuro(ergebnis.svAnteil)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 text-gray-400">
              <span>− Lohnsteuer (unter Grundfreibetrag)</span>
              <span>0,00 €</span>
            </div>
            <div className="flex justify-between py-3 bg-green-50 -mx-6 px-6 rounded-b-xl mt-4">
              <span className="font-bold text-green-800">= Netto (ca.)</span>
              <span className="font-bold text-xl text-green-900">{formatEuro(ergebnis.netto)}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Näherung: Der KV-Zusatzbeitrag (⌀ 2,9 % 2026) variiert je Kasse, der
            Pflegeversicherungs-Zuschlag für Kinderlose (+0,6 %) und die abweichende
            Aufteilung in Sachsen sind nicht individuell berücksichtigt.
          </p>
        </div>
      )}

      {/* Staffelungs-Tabelle für das Beginn-Jahr */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📊 Staffelung für Ausbildungsbeginn {beginnJahr}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="py-2 font-medium">Ausbildungsjahr</th>
                <th className="py-2 font-medium">Faktor</th>
                <th className="py-2 font-medium text-right">Mindestvergütung</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((lj) => (
                <tr
                  key={lj}
                  className={`border-b border-gray-100 ${lehrjahr === lj ? 'bg-green-50 font-medium' : ''}`}
                >
                  <td className="py-2 text-gray-700">{lj}. Jahr</td>
                  <td className="py-2 text-gray-600">
                    {lj === 1 ? '1,00' : lj === 2 ? '1,18' : lj === 3 ? '1,35' : '1,40'}
                  </td>
                  <td className="py-2 text-right font-bold text-gray-900">
                    {formatEuro0(ergebnis.tabelle[lj - 1])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Amtlich auf volle Euro gerundete Beträge (§ 17 Abs. 2 BBiG, BMBF-Bekanntgabe im
          Bundesgesetzblatt). Die Aufschläge gelten als feste Staffelung auf den Basisbetrag
          des Start-Jahres.
        </p>
      </div>

      {/* Hinweis: Tarif & Geltungsbereich */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>MiAV ist die Untergrenze:</strong> Tarifvertragliche Ausbildungsvergütungen (z. B. TVAöD, IG-Metall-Branchen) liegen meist deutlich höher und gehen vor. Bei Tarifbindung gilt der höhere Tarifsatz.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Gilt nur für BBiG/HwO-Berufe:</strong> Nicht für landesrechtlich geregelte Gesundheits-, Pflege- und Erzieherberufe oder schulische Ausbildungen – dort gelten eigene Vergütungsregeln.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Jährliche Fortschreibung:</strong> Ab 2024 gibt das BMBF den Basisbetrag jährlich neu bekannt (spätestens 1. November im Bundesgesetzblatt).</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Kein Mitwachsen:</strong> Maßgeblich ist der Basisbetrag des Jahres, in dem die Ausbildung begonnen hat – nicht der jeweils aktuelle.</span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">
        <p className="text-xs text-gray-500">
          <strong>Schätzung – keine Steuer- oder Rechtsberatung.</strong> Die
          Mindestausbildungsvergütung (MiAV) nach § 17 Abs. 2 BBiG ist die gesetzliche Untergrenze;
          tarifvertragliche Ausbildungsvergütungen liegen häufig höher und gehen vor. Die optionale
          Netto-Berechnung ist eine Näherung (KV-Zusatzbeitrag und PV-Zuschlag variieren). Maßgeblich
          sind der konkrete Ausbildungs-/Tarifvertrag und die Lohnabrechnung.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/bbig_2005/__17.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 17 BBiG – Vergütungsanspruch und Mindestvergütung
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_4/__20.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 20 SGB IV – Aufbringung der Mittel (Geringverdienergrenze)
          </a>
          <a
            href="https://www.bibb.de/de/199658.php"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BIBB – Mindestausbildungsvergütung (MiAV)
          </a>
          <a
            href="https://www.bibb.de/de/pressemitteilung_212952.php"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BIBB – Mindestausbildungsvergütung 2026
          </a>
          <a
            href="https://www.bibb.de/de/pressemitteilung_199964.php"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BIBB – Mindestausbildungsvergütung 2025
          </a>
        </div>
      </div>
    </div>
  );
}
