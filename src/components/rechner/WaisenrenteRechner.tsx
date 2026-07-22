import { useState, useMemo } from 'react';

// === OFFIZIELLE WERTE 2026 (Stand: ab 1. Juli 2026) ===
// Alle Werte an amtlichen Primärquellen belegt (gesetze-im-internet.de, RWBestV 2026, DRV).

// Aktueller Rentenwert (bundeseinheitlich ab 01.07.2026)
// Quelle: § 1 RWBestV 2026 – https://www.gesetze-im-internet.de/rwbestv_2026/__1.html
const RENTENWERT_2026 = 42.52; // Euro pro Entgeltpunkt
// Vorheriger Rentenwert (bis 30.06.2026)
// Quelle: DRV-Meldung Rentenanpassung 2026 – https://www.deutsche-rentenversicherung.de/DRV/DE/Ueber-uns-und-Presse/Presse/Meldungen/2026/260429-rentenanpassung-2026-bundeskabinett?nn=6a097debca84ce5471c1aa2d
const RENTENWERT_VORHER = 40.79; // Euro (nur informativ)

// Rentenartfaktoren für Waisenrenten
// Quelle: § 67 Nr. 7 SGB VI (Halbwaise 0,1) – https://www.gesetze-im-internet.de/sgb_6/__67.html
const RENTENARTFAKTOR_HALBWAISE = 0.1; // 10 % der Versichertenrente
// Quelle: § 67 Nr. 8 SGB VI (Vollwaise 0,2) – https://www.gesetze-im-internet.de/sgb_6/__67.html
const RENTENARTFAKTOR_VOLLWAISE = 0.2; // 20 % der Versichertenrente

// Zuschlag an persönlichen Entgeltpunkten je Kalendermonat (§ 78 SGB VI)
// Quelle: § 78 Abs. 2 SGB VI (Halbwaise) – https://www.gesetze-im-internet.de/sgb_6/__78.html
const ZUSCHLAG_HALBWAISE_EP_PRO_MONAT = 0.0833; // EP je Kalendermonat
// Quelle: § 78 Abs. 3 SGB VI (Vollwaise) – https://www.gesetze-im-internet.de/sgb_6/__78.html
const ZUSCHLAG_VOLLWAISE_EP_PRO_MONAT = 0.075; // EP je Kalendermonat

// Altersgrenzen für den Anspruch (§ 48 Abs. 4 SGB VI)
// Quelle: § 48 Abs. 4 S. 1 Nr. 1 SGB VI – https://www.gesetze-im-internet.de/sgb_6/__48.html
const ALTERSGRENZE_REGEL = 18; // längstens bis Vollendung des 18. Lebensjahres
// Quelle: § 48 Abs. 4 S. 1 Nr. 2 SGB VI – https://www.gesetze-im-internet.de/sgb_6/__48.html
const ALTERSGRENZE_AUSBILDUNG = 27; // bis 27 bei Ausbildung/Übergangszeit/Freiwilligendienst/Behinderung
// Quelle: § 48 Abs. 4 S. 2 SGB VI – https://www.gesetze-im-internet.de/sgb_6/__48.html
const AUSBILDUNG_MIN_STUNDEN = 20; // Ausbildung erfordert wöchentlich MEHR als 20 Stunden

export default function WaisenrenteRechner() {
  // Eingabewerte
  const [renteVerstorbener, setRenteVerstorbener] = useState(1500);
  const [waisentyp, setWaisentyp] = useState<'halb' | 'voll'>('halb');
  const [alterWaise, setAlterWaise] = useState(15);
  const [inAusbildung, setInAusbildung] = useState(false);

  // Optionaler Zuschlag nach § 78 (nur Näherung – siehe Hinweis)
  const [zuschlagAktiv, setZuschlagAktiv] = useState(false);
  const [zuschlagMonate, setZuschlagMonate] = useState(0);

  const ergebnis = useMemo(() => {
    // === 1. Rentenartfaktor bestimmen (§ 67 Nr. 7/8 SGB VI) ===
    const rentenartfaktor =
      waisentyp === 'voll' ? RENTENARTFAKTOR_VOLLWAISE : RENTENARTFAKTOR_HALBWAISE;
    const prozentVonRente = rentenartfaktor * 100;

    // === 2. Grundbetrag (§ 64 SGB VI: EP × Rentenartfaktor × Rentenwert) ===
    // Versichertenrente = persönliche EP × 1,0 × Rentenwert, daher Grundbetrag
    // = Versichertenrente × Rentenartfaktor.
    const grundbetrag = renteVerstorbener * rentenartfaktor;

    // Hergeleitete Entgeltpunkte des Verstorbenen (Näherung):
    // EP = Versichertenrente / aktueller Rentenwert
    const epVerstorbener = renteVerstorbener / RENTENWERT_2026;

    // === 3. Optionaler Zuschlag nach § 78 SGB VI (Näherung) ===
    const zuschlagEpProMonat =
      waisentyp === 'voll'
        ? ZUSCHLAG_VOLLWAISE_EP_PRO_MONAT
        : ZUSCHLAG_HALBWAISE_EP_PRO_MONAT;
    const zuschlagEp = zuschlagAktiv ? zuschlagEpProMonat * zuschlagMonate : 0;
    // Der Zuschlag wird als persönliche EP dem Grundbetrag zugeschlagen und
    // durchläuft ebenfalls die Rentenformel (§ 64 SGB VI).
    const zuschlagBetrag = zuschlagEp * rentenartfaktor * RENTENWERT_2026;

    // === 4. Monatliche Waisenrente (brutto) ===
    const waisenrenteGesamt = grundbetrag + zuschlagBetrag;

    // === 5. Anspruchsdauer (§ 48 Abs. 4 SGB VI) ===
    const altersgrenze = inAusbildung ? ALTERSGRENZE_AUSBILDUNG : ALTERSGRENZE_REGEL;
    const anspruchBesteht = alterWaise < altersgrenze;
    const restJahre = Math.max(0, altersgrenze - alterWaise);

    return {
      rentenartfaktor,
      prozentVonRente,
      grundbetrag,
      epVerstorbener,
      zuschlagEpProMonat,
      zuschlagEp,
      zuschlagBetrag,
      waisenrenteGesamt,
      altersgrenze,
      anspruchBesteht,
      restJahre,
      renteVerstorbener,
      rentenwert: RENTENWERT_2026,
    };
  }, [renteVerstorbener, waisentyp, alterWaise, inAusbildung, zuschlagAktiv, zuschlagMonate]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatEp = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-2xl mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Versichertenrente des Verstorbenen */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Rente des verstorbenen Elternteils (brutto)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Die Altersrente oder der Rentenanspruch (Versichertenrente) des verstorbenen Elternteils
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={renteVerstorbener}
              onChange={(e) => setRenteVerstorbener(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
              min="0"
              max="5000"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€/Monat</span>
          </div>
          <input
            type="range"
            value={renteVerstorbener}
            onChange={(e) => setRenteVerstorbener(Number(e.target.value))}
            className="w-full mt-3 accent-purple-500"
            min="500"
            max="4000"
            step="50"
          />
        </div>

        {/* Waisentyp */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Art der Waisenrente</span>
            <span className="text-xs text-gray-500 block mt-1">
              Halbwaise: ein Elternteil lebt noch. Vollwaise: beide Elternteile verstorben.
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setWaisentyp('halb')}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                waisentyp === 'halb'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Halbwaise (10 %)
            </button>
            <button
              onClick={() => setWaisentyp('voll')}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                waisentyp === 'voll'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Vollwaise (20 %)
            </button>
          </div>
          {waisentyp === 'voll' && (
            <p className="text-xs text-gray-500 mt-2">
              Bei der Vollwaisenrente ist die Rente des Elternteils mit der höchsten
              Versichertenrente maßgeblich (§ 67 Nr. 8 SGB VI).
            </p>
          )}
        </div>

        {/* Alter der Waise */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Alter der Waise</span>
            <span className="text-xs text-gray-500 block mt-1">
              Anspruch bis zum {ALTERSGRENZE_REGEL}. Lebensjahr, mit Ausbildung bis {ALTERSGRENZE_AUSBILDUNG}.
            </span>
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setAlterWaise(Math.max(0, alterWaise - 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
            >
              −
            </button>
            <div className="text-center">
              <span className="text-3xl font-bold text-gray-800">{alterWaise}</span>
              <span className="text-gray-500 ml-1">Jahre</span>
            </div>
            <button
              onClick={() => setAlterWaise(Math.min(30, alterWaise + 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Ausbildung */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={inAusbildung}
              onChange={(e) => setInAusbildung(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
            />
            <div>
              <span className="text-gray-700 font-medium">
                In Schul-/Berufsausbildung, Freiwilligendienst oder Behinderung
              </span>
              <span className="text-xs text-gray-500 block">
                Verlängert den Anspruch bis zum {ALTERSGRENZE_AUSBILDUNG}. Lebensjahr
                (Ausbildung: mehr als {AUSBILDUNG_MIN_STUNDEN} Std./Woche, § 48 Abs. 4 SGB VI)
              </span>
            </div>
          </label>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Optionaler Zuschlag § 78 */}
        <label className="flex items-center gap-3 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={zuschlagAktiv}
            onChange={(e) => setZuschlagAktiv(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
          />
          <div>
            <span className="text-gray-700 font-medium">Zuschlag nach § 78 SGB VI schätzen (optional)</span>
            <span className="text-xs text-gray-500 block">
              Näherung – der genaue Zuschlag hängt von den rentenrechtlichen Zeiten des
              Verstorbenen ab und wird verbindlich von der Rentenversicherung ermittelt.
            </span>
          </div>
        </label>

        {zuschlagAktiv && (
          <div className="p-4 bg-purple-50 rounded-xl">
            <label className="block mb-2">
              <span className="text-sm text-purple-700 font-medium">
                Kalendermonate mit rentenrechtlichen Zeiten des Verstorbenen
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={zuschlagMonate}
                onChange={(e) => setZuschlagMonate(Math.max(0, Number(e.target.value)))}
                className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
                min="0"
                max="600"
                step="1"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Monate</span>
            </div>
            <p className="text-xs text-purple-600 mt-2">
              Zuschlag: {formatEp(ergebnis.zuschlagEpProMonat)} EP × {zuschlagMonate} Monate
              = {formatEp(ergebnis.zuschlagEp)} EP (Näherung)
            </p>
          </div>
        )}
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">
          👼 {waisentyp === 'voll' ? 'Ihre Vollwaisenrente' : 'Ihre Halbwaisenrente'}
        </h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroRound(ergebnis.waisenrenteGesamt)}</span>
            <span className="text-xl opacity-80">brutto / Monat</span>
          </div>
          <p className="text-purple-100 mt-2 text-sm">
            {ergebnis.prozentVonRente.toLocaleString('de-DE')} % der Versichertenrente
            {zuschlagAktiv && ergebnis.zuschlagBetrag > 0 ? ' zzgl. geschätztem § 78-Zuschlag' : ''}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Grundbetrag</span>
            <div className="text-xl font-bold">{formatEuroRound(ergebnis.grundbetrag)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">
              {zuschlagAktiv ? 'Zuschlag § 78 (Näherung)' : 'Anspruch'}
            </span>
            <div className="text-xl font-bold">
              {zuschlagAktiv
                ? formatEuroRound(ergebnis.zuschlagBetrag)
                : ergebnis.anspruchBesteht
                ? '✓'
                : 'endet'}
            </div>
          </div>
        </div>

        {!ergebnis.anspruchBesteht && (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm mt-3 text-sm">
            ⚠️ Mit {alterWaise} Jahren besteht ohne anerkannten Verlängerungsgrund kein Anspruch
            mehr (Grenze: {ergebnis.altersgrenze}. Lebensjahr).
          </div>
        )}
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>

        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Grundbetrag (§ 64 SGB VI)
          </div>

          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Rente des verstorbenen Elternteils</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.renteVerstorbener)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              Rentenartfaktor ({waisentyp === 'voll' ? 'Vollwaise' : 'Halbwaise'})
            </span>
            <span className="font-bold text-purple-600">
              {ergebnis.rentenartfaktor.toLocaleString('de-DE')} ({ergebnis.prozentVonRente.toLocaleString('de-DE')} %)
            </span>
          </div>
          <div className="flex justify-between py-2 bg-purple-50 -mx-6 px-6">
            <span className="font-medium text-purple-700">= Grundbetrag der Waisenrente</span>
            <span className="font-bold text-purple-900">{formatEuro(ergebnis.grundbetrag)}</span>
          </div>

          {zuschlagAktiv && (
            <>
              <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
                Zuschlag nach § 78 SGB VI (Näherung)
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">
                  {formatEp(ergebnis.zuschlagEpProMonat)} EP × {zuschlagMonate} Monate
                </span>
                <span className="text-gray-900">{formatEp(ergebnis.zuschlagEp)} EP</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">
                  × Rentenartfaktor × Rentenwert ({formatEuro(ergebnis.rentenwert)})
                </span>
                <span className="text-gray-900">{formatEuro(ergebnis.zuschlagBetrag)}</span>
              </div>
            </>
          )}

          <div className="flex justify-between py-3 bg-purple-100 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-purple-800">Monatliche Waisenrente (brutto)</span>
            <span className="font-bold text-2xl text-purple-900">
              {formatEuro(ergebnis.waisenrenteGesamt)}
            </span>
          </div>

          <p className="text-xs text-gray-500 pt-2">
            Hergeleitete Entgeltpunkte des Verstorbenen (Näherung):
            ≈ {formatEp(ergebnis.epVerstorbener)} EP (Versichertenrente ÷ Rentenwert).
          </p>
        </div>
      </div>

      {/* Keine Einkommensanrechnung */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-green-800 mb-3">✅ Keine Einkommensanrechnung</h3>
        <p className="text-sm text-green-700">
          Anders als bei der Witwen- oder Witwerrente wird eigenes Einkommen der Waise
          <strong> nicht auf die Waisenrente angerechnet</strong>. § 97 SGB VI nennt nur
          Witwen-, Witwer- und Erziehungsrente – Waisenrenten sind ausdrücklich nicht erfasst.
          Ausbildungsvergütung, Nebenjob oder Halbwaisenrente mindern die Rente also nicht.
        </p>
      </div>

      {/* Anspruchsdauer */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📅 Anspruchsdauer (§ 48 SGB VI)</h3>
        <div className={`p-4 rounded-xl ${ergebnis.anspruchBesteht ? 'bg-green-100' : 'bg-amber-100'}`}>
          {ergebnis.anspruchBesteht ? (
            <p className="text-green-800 text-sm">
              ✓ Anspruch besteht{' '}
              <strong>
                bis zum {ergebnis.altersgrenze}. Lebensjahr
              </strong>{' '}
              – das sind noch etwa {ergebnis.restJahre} {ergebnis.restJahre === 1 ? 'Jahr' : 'Jahre'}
              {inAusbildung
                ? ' (verlängert durch Ausbildung/Freiwilligendienst/Behinderung).'
                : '. Mit Ausbildung verlängert sich der Anspruch bis 27.'}
            </p>
          ) : (
            <p className="text-amber-800 text-sm">
              ⚠️ Mit {alterWaise} Jahren endet der Anspruch grundsätzlich (Grenze:{' '}
              {ergebnis.altersgrenze}. Lebensjahr). Eine Verlängerung bis 27 ist nur bei
              Ausbildung, Übergangszeit, Freiwilligendienst oder Behinderung möglich.
            </p>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-2">⚠️ Wichtiger Hinweis</h3>
        <p className="text-sm text-amber-700">
          Dieser Rechner liefert eine <strong>unverbindliche Schätzung</strong> und ist{' '}
          <strong>keine Rechts- oder Steuerberatung</strong>. Der Grundbetrag (10 % bzw. 20 %)
          ist gesetzlich klar geregelt; der Zuschlag nach § 78 SGB VI ist nur näherungsweise
          darstellbar, da er von den rentenrechtlichen Zeiten des Verstorbenen abhängt. Die
          verbindliche Berechnung erfolgt durch die Deutsche Rentenversicherung.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/sgb_6/__48.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 48 SGB VI – Waisenrente (Anspruch & Altersgrenzen)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_6/__67.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 67 SGB VI – Rentenartfaktor (0,1 / 0,2)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_6/__78.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 78 SGB VI – Zuschlag bei Waisenrenten
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
            href="https://www.gesetze-im-internet.de/sgb_6/__97.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 97 SGB VI – Einkommensanrechnung (gilt nicht für Waisen)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/rwbestv_2026/__1.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 1 RWBestV 2026 – aktueller Rentenwert 42,52 €
          </a>
        </div>
      </div>
    </div>
  );
}
