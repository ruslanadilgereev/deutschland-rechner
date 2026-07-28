import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: Juli 2026) ===

// Aktueller Rentenwert ab 01.07.2026
// Quelle: § 1 RWBestV 2026 – https://www.gesetze-im-internet.de/rwbestv_2026/__1.html
const RENTENWERT_2026 = 42.52; // Euro pro Entgeltpunkt

// Splittingzuwachs = Hälfte des EP-Unterschieds in der Splittingzeit
// Quelle: § 120a Abs. 8 SGB VI – https://www.gesetze-im-internet.de/sgb_6/__120a.html
const SPLITTING_FAKTOR = 0.5;

// Rentenartfaktor für Renten wegen Alters (EP-Änderung wirkt 1:1 mit dem Rentenwert)
// Quelle: § 67 Nr. 1 SGB VI – https://www.gesetze-im-internet.de/sgb_6/__67.html
const RENTENARTFAKTOR_ALTERSRENTE = 1.0;

// Wartezeit: 25 Jahre rentenrechtliche Zeiten am Ende der Splittingzeit
// Quelle: § 120a Abs. 4 SGB VI – https://www.gesetze-im-internet.de/sgb_6/__120a.html
const WARTEZEIT_JAHRE = 25;

// Entkürzung auf Antrag, wenn dem Verstorbenen höchstens 36 Monate Rente aus dem Splitting gezahlt wurde
// Quelle: § 120b Abs. 1 SGB VI – https://www.gesetze-im-internet.de/sgb_6/__120b.html
const RUECKABWICKLUNG_MONATE = 36;

// Ausschlussfrist für die Splitting-Erklärung nach dem Tod (Todesfälle ab 01.01.2008)
// Quelle: § 120d Abs. 1 SGB VI – https://www.gesetze-im-internet.de/sgb_6/__120d.html
const AUSSCHLUSSFRIST_MONATE = 12;

export default function RentensplittingRechner() {
  // Entgeltpunkte in der Splittingzeit (Ehezeit)
  const [epPartnerA, setEpPartnerA] = useState(30);
  const [epPartnerB, setEpPartnerB] = useState(12);

  // Zulässigkeitsprüfung (§ 120a Abs. 2 SGB VI)
  const [eheNach2001, setEheNach2001] = useState(true);
  const [beideNach1962, setBeideNach1962] = useState(true);

  // 25 Jahre rentenrechtliche Zeiten bei beiden Partnern (§ 120a Abs. 4 SGB VI)
  const [wartezeitErfuellt, setWartezeitErfuellt] = useState(true);

  const ergebnis = useMemo(() => {
    // === 1. Zulässigkeit (§ 120a Abs. 2 SGB VI) ===
    // Ehe nach 31.12.2001 geschlossen ODER Ehe bestand am 31.12.2001
    // und beide Ehegatten sind nach dem 01.01.1962 geboren
    const zulaessig = eheNach2001 || beideNach1962;

    // === 2. Splittingzuwachs (§ 120a Abs. 8 SGB VI) ===
    const epHoeher = Math.max(epPartnerA, epPartnerB);
    const epNiedriger = Math.min(epPartnerA, epPartnerB);
    const differenz = epHoeher - epNiedriger;
    const splittingzuwachs = differenz * SPLITTING_FAKTOR;

    // Wer gibt ab, wer erhält?
    const aGibtAb = epPartnerA > epPartnerB;
    const gleichstand = epPartnerA === epPartnerB;

    // === 3. Neue EP-Stände nach Splitting (beide erhalten den Mittelwert) ===
    const neuerStand = (epPartnerA + epPartnerB) / 2;

    // === 4. Monatliche Rentenwirkung (§ 64, § 67 Nr. 1 SGB VI) ===
    // Näherung: Zugangsfaktor 1,0 angenommen (keine Ab-/Zuschläge für vorzeitigen/späteren Rentenbeginn)
    const monatlicheAenderung = splittingzuwachs * RENTENARTFAKTOR_ALTERSRENTE * RENTENWERT_2026;

    // Monatswerte vor/nach Splitting je Partner (nur EP der Splittingzeit)
    const renteA_vorher = epPartnerA * RENTENARTFAKTOR_ALTERSRENTE * RENTENWERT_2026;
    const renteB_vorher = epPartnerB * RENTENARTFAKTOR_ALTERSRENTE * RENTENWERT_2026;
    const renteNachher = neuerStand * RENTENARTFAKTOR_ALTERSRENTE * RENTENWERT_2026;

    return {
      zulaessig,
      wartezeitErfuellt,
      anspruchMoeglich: zulaessig && wartezeitErfuellt,
      epHoeher,
      epNiedriger,
      differenz,
      splittingzuwachs,
      aGibtAb,
      gleichstand,
      neuerStand,
      monatlicheAenderung,
      renteA_vorher,
      renteB_vorher,
      renteNachher,
      rentenwert: RENTENWERT_2026,
    };
  }, [epPartnerA, epPartnerB, eheNach2001, beideNach1962, wartezeitErfuellt]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEP = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 4 });

  const empfaenger = ergebnis.aGibtAb ? 'Partner B' : 'Partner A';
  const abgebender = ergebnis.aGibtAb ? 'Partner A' : 'Partner B';

  return (
    <div className="max-w-2xl mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🔀 Entgeltpunkte in der Ehezeit (Splittingzeit)</h3>
        <p className="text-xs text-gray-500 mb-4">
          Geteilt werden nur die Entgeltpunkte, die vom Monat der Eheschließung bis zum Ende der
          Splittingzeit erworben wurden (§ 120a Abs. 6 SGB VI). Die Werte finden Sie in Ihrer
          Renteninformation bzw. Rentenauskunft der Deutschen Rentenversicherung.
        </p>

        {/* Partner A */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Entgeltpunkte Partner A (Ehezeit)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={epPartnerA}
              onChange={(e) => setEpPartnerA(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none"
              min="0"
              max="100"
              step="0.5"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">EP</span>
          </div>
          <input
            type="range"
            value={epPartnerA}
            onChange={(e) => setEpPartnerA(Number(e.target.value))}
            className="w-full mt-3 accent-indigo-500"
            min="0"
            max="60"
            step="0.5"
          />
        </div>

        {/* Partner B */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Entgeltpunkte Partner B (Ehezeit)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={epPartnerB}
              onChange={(e) => setEpPartnerB(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none"
              min="0"
              max="100"
              step="0.5"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">EP</span>
          </div>
          <input
            type="range"
            value={epPartnerB}
            onChange={(e) => setEpPartnerB(Number(e.target.value))}
            className="w-full mt-3 accent-indigo-500"
            min="0"
            max="60"
            step="0.5"
          />
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Zulässigkeit */}
        <h3 className="font-bold text-gray-800 mb-3">✅ Voraussetzungen prüfen</h3>

        <div className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Wann wurde die Ehe / Lebenspartnerschaft geschlossen?</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setEheNach2001(true)}
              className={`py-3 px-4 rounded-xl font-medium transition-all text-sm ${
                eheNach2001
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Nach dem 31.12.2001
            </button>
            <button
              onClick={() => setEheNach2001(false)}
              className={`py-3 px-4 rounded-xl font-medium transition-all text-sm ${
                !eheNach2001
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Bestand schon am 31.12.2001
            </button>
          </div>
        </div>

        {!eheNach2001 && (
          <div className="mb-4 p-4 bg-indigo-50 rounded-xl">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={beideNach1962}
                onChange={(e) => setBeideNach1962(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
              />
              <div>
                <span className="text-gray-700 font-medium">Beide Partner nach dem 01.01.1962 geboren</span>
                <span className="text-xs text-gray-500 block">
                  Bei Altehen (Bestand am 31.12.2001) nur dann zulässig (§ 120a Abs. 2 Nr. 2 SGB VI)
                </span>
              </div>
            </label>
          </div>
        )}

        <div className="mb-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={wartezeitErfuellt}
              onChange={(e) => setWartezeitErfuellt(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
            />
            <div>
              <span className="text-gray-700 font-medium">{WARTEZEIT_JAHRE} Jahre rentenrechtliche Zeiten erfüllt</span>
              <span className="text-xs text-gray-500 block">
                Am Ende der Splittingzeit müssen {WARTEZEIT_JAHRE} Jahre rentenrechtliche Zeiten vorhanden sein (§ 120a Abs. 4 SGB VI)
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🔀 Splittingzuwachs</h3>

        {ergebnis.gleichstand ? (
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">0 EP</span>
            </div>
            <p className="text-indigo-100 mt-2 text-sm">
              Beide Partner haben gleich viele Entgeltpunkte in der Ehezeit – ein Rentensplitting
              würde nichts verändern.
            </p>
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{formatEP(ergebnis.splittingzuwachs)} EP</span>
            </div>
            <p className="text-indigo-100 mt-2 text-sm">
              <strong>{empfaenger}</strong> erhält {formatEP(ergebnis.splittingzuwachs)} Entgeltpunkte
              von <strong>{abgebender}</strong> – das entspricht{' '}
              <strong>{formatEuro(ergebnis.monatlicheAenderung)}</strong> Rente pro Monat
              (Rentenwert {formatEuro(ergebnis.rentenwert)} ab 01.07.2026).
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Partner A nach Splitting</span>
            <div className="text-xl font-bold">{formatEP(ergebnis.neuerStand)} EP</div>
            <div className="text-sm opacity-80">vorher {formatEP(epPartnerA)} EP</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Partner B nach Splitting</span>
            <div className="text-xl font-bold">{formatEP(ergebnis.neuerStand)} EP</div>
            <div className="text-sm opacity-80">vorher {formatEP(epPartnerB)} EP</div>
          </div>
        </div>

        <div className={`rounded-xl p-4 ${ergebnis.anspruchMoeglich ? 'bg-white/10' : 'bg-red-500/30'}`}>
          {ergebnis.anspruchMoeglich ? (
            <p className="text-sm">
              ✓ Nach Ihren Angaben ist das Rentensplitting <strong>zulässig</strong> (§ 120a Abs. 2
              und 4 SGB VI). Zusätzlich müssen beide Partner die Regelaltersgrenze mit Anspruch auf
              Vollrente wegen Alters erreicht haben – oder ein Partner ist verstorben (§ 120a Abs. 3 SGB VI).
            </p>
          ) : (
            <p className="text-sm">
              ✗ Nach Ihren Angaben ist das Rentensplitting <strong>nicht zulässig</strong>:{' '}
              {!ergebnis.zulaessig && 'Bei Altehen (Bestand am 31.12.2001) müssen beide Partner nach dem 01.01.1962 geboren sein (§ 120a Abs. 2 SGB VI). '}
              {!ergebnis.wartezeitErfuellt && `Es müssen ${WARTEZEIT_JAHRE} Jahre rentenrechtliche Zeiten vorhanden sein (§ 120a Abs. 4 SGB VI).`}
            </p>
          )}
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>

        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Halbteilung der Ehezeit-Entgeltpunkte (§ 120a Abs. 8 SGB VI)
          </div>

          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Entgeltpunkte Partner A (Ehezeit)</span>
            <span className="font-bold text-gray-900">{formatEP(epPartnerA)} EP</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Entgeltpunkte Partner B (Ehezeit)</span>
            <span className="font-bold text-gray-900">{formatEP(epPartnerB)} EP</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Unterschied</span>
            <span className="font-bold text-gray-900">{formatEP(ergebnis.differenz)} EP</span>
          </div>
          <div className="flex justify-between py-2 bg-indigo-50 -mx-6 px-6">
            <span className="font-medium text-indigo-700">Splittingzuwachs (Hälfte des Unterschieds)</span>
            <span className="font-bold text-indigo-900">{formatEP(ergebnis.splittingzuwachs)} EP</span>
          </div>

          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Monatliche Rentenwirkung (§ 64, § 67 Nr. 1 SGB VI)
          </div>

          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Aktueller Rentenwert (ab 01.07.2026)</span>
            <span className="text-gray-900">{formatEuro(ergebnis.rentenwert)} / EP</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Rentenartfaktor Altersrente</span>
            <span className="text-gray-900">1,0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
            <span>{empfaenger}: Rente aus Ehezeit-EP steigt</span>
            <span className="font-bold">
              {formatEuro(ergebnis.aGibtAb ? ergebnis.renteB_vorher : ergebnis.renteA_vorher)} → {formatEuro(ergebnis.renteNachher)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>{abgebender}: Rente aus Ehezeit-EP sinkt</span>
            <span className="font-bold">
              {formatEuro(ergebnis.aGibtAb ? ergebnis.renteA_vorher : ergebnis.renteB_vorher)} → {formatEuro(ergebnis.renteNachher)}
            </span>
          </div>

          <div className="flex justify-between py-3 bg-indigo-100 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-indigo-800">Monatliche Umverteilung</span>
            <span className="font-bold text-2xl text-indigo-900">{formatEuro(ergebnis.monatlicheAenderung)}</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Vereinfachende Annahme: Zugangsfaktor 1,0 (keine Ab- oder Zuschläge wegen vorzeitigem
          oder späterem Rentenbeginn). Dargestellt ist nur die Rente aus den Ehezeit-Entgeltpunkten –
          vor und nach der Ehe erworbene Entgeltpunkte bleiben vom Splitting unberührt.
        </p>
      </div>

      {/* Wichtige Folgen */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Folgen des Rentensplittings</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Witwen-/Witwerrente entfällt:</strong> Ab dem Kalendermonat, zu dessen Beginn
              das Rentensplitting durchgeführt ist, besteht kein Anspruch auf Witwen- oder
              Witwerrente mehr (§ 46 Abs. 2b SGB VI).
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Härtefallregel:</strong> Verstirbt der begünstigte Partner und wurden ihm aus
              dem Splitting höchstens {RUECKABWICKLUNG_MONATE} Monate Rentenleistungen erbracht, wird die Rente des
              Überlebenden auf Antrag nicht länger gekürzt (§ 120b SGB VI).
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Ausschlussfrist nach Tod:</strong> Die Splitting-Erklärung muss spätestens {AUSSCHLUSSFRIST_MONATE}{' '}
              Kalendermonate nach Ablauf des Sterbemonats abgegeben werden (Todesfälle ab 01.01.2008,
              § 120d Abs. 1 SGB VI).
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Bis zur Durchführung widerruflich:</strong> Die Erklärung kann bis zur
              Durchführung des Splittings widerrufen werden (§ 120d SGB VI).
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Lebenspartner:</strong> Das Rentensplitting gilt entsprechend für eingetragene
              Lebenspartner (§ 120e SGB VI).
            </span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-gray-700 mb-2">ℹ️ Hinweis</h3>
        <p className="text-sm text-gray-600">
          Dieser Rechner liefert eine <strong>vereinfachte Schätzung</strong> und ersetzt keine
          Renten- oder Rechtsberatung. Die exakten Entgeltpunkte der Splittingzeit ermittelt die
          Deutsche Rentenversicherung im Splittingverfahren; Entgeltpunkte der allgemeinen und der
          knappschaftlichen Rentenversicherung werden dabei getrennt geteilt (Einzelsplitting,
          § 120a Abs. 7 SGB VI). Dieser Rechner betrachtet ausschließlich Entgeltpunkte der
          allgemeinen Rentenversicherung. Eine verbindliche Auskunft erteilt nur die Deutsche
          Rentenversicherung (kostenlose Hotline: 0800 1000 4800).
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/sgb_6/__120a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 120a SGB VI – Rentensplitting unter Ehegatten
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_6/__120b.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 120b SGB VI – Rentensplitting bei Tod (Entkürzung)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_6/__120d.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 120d SGB VI – Verfahren und Zuständigkeit
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_6/__120e.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 120e SGB VI – Rentensplitting unter Lebenspartnern
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_6/__46.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 46 SGB VI – Ausschluss der Witwen-/Witwerrente (Abs. 2b)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_6/__64.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 64 SGB VI – Rentenformel
          </a>
          <a
            href="https://www.gesetze-im-internet.de/rwbestv_2026/__1.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 1 RWBestV 2026 – Aktueller Rentenwert 42,52 € ab 01.07.2026
          </a>
        </div>
      </div>
    </div>
  );
}
