import { useState, useMemo } from 'react';

export default function RiesterKuendigenRechner() {
  // Eingabewerte
  const [kapital, setKapital] = useState(15000);
  const [zulagen, setZulagen] = useState(2625);
  const [steuerermaessigung, setSteuerermaessigung] = useState(0);
  const [eingezahlt, setEingezahlt] = useState(9000);
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(30);

  // Konstanten / Rechtswerte (Stand 2026)
  // § 93 Abs. 3 Nr. 2 EStG: Kleinbetragsrente bis 1,5 % der monatlichen Bezugsgröße (§ 18 SGB IV)
  // Monatliche Bezugsgröße 2026 = 3.955 € → 1,5 % = 59,33 €/Monat (bundeseinheitlich)
  const BEZUGSGROESSE_MONAT_2026 = 3955; // €
  const KLEINBETRAGSRENTE_GRENZE = BEZUGSGROESSE_MONAT_2026 * 0.015; // 59,33 €/Monat

  const ergebnis = useMemo(() => {
    // § 93 Abs. 1 S. 1 EStG: Rückzahlungsbetrag = entfallende Zulagen + § 10a-Steuerermäßigung
    const rueckzahlungsbetrag = zulagen + steuerermaessigung; // wird vom Anbieter einbehalten

    // § 22 Nr. 5 S. 3 EStG: Erträge/Wertsteigerungen sind nachzuversteuern (NICHT das Eigenkapital)
    // Vereinfachte Schätzung: Kapital − eigene Beiträge (überschätzt die Erträge leicht)
    const ertraege = Math.max(0, kapital - eingezahlt);
    const ertragsteuer = ertraege * (grenzsteuersatz / 100); // separat über ESt-Erklärung

    const bruttoAuszahlung = kapital; // Vertragsguthaben
    const nachRueckzahlung = Math.max(0, kapital - rueckzahlungsbetrag); // Auszahlung vom Anbieter
    const nettoNachSteuer = Math.max(0, nachRueckzahlung - ertragsteuer); // nach späterer Ertragsbesteuerung

    const gesamtBelastung = rueckzahlungsbetrag + ertragsteuer;
    const verlustquote = kapital > 0 ? (gesamtBelastung / kapital) * 100 : 0;

    return {
      rueckzahlungsbetrag,
      ertraege,
      ertragsteuer,
      bruttoAuszahlung,
      nachRueckzahlung,
      nettoNachSteuer,
      gesamtBelastung,
      verlustquote,
    };
  }, [kapital, zulagen, steuerermaessigung, eingezahlt, grenzsteuersatz]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { maximumFractionDigits: 0 }) + ' €';

  const formatProzent = (n: number) =>
    n.toFixed(1).replace('.', ',') + ' %';

  // Severity-Farbe der Verlustquote
  const severity =
    ergebnis.verlustquote < 20 ? 'gruen' : ergebnis.verlustquote <= 40 ? 'gelb' : 'rot';
  const severityClasses =
    severity === 'gruen'
      ? 'from-emerald-500 to-green-600'
      : severity === 'gelb'
      ? 'from-amber-500 to-orange-600'
      : 'from-rose-500 to-red-600';
  const severityText =
    severity === 'gruen'
      ? 'Geringer Förderverlust'
      : severity === 'gelb'
      ? 'Spürbarer Förderverlust'
      : 'Hoher Förderverlust';

  return (
    <div className="max-w-2xl mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Vertragsguthaben / Kapital */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Angespartes Riester-Kapital</span>
            <span className="text-xs text-gray-500 block mt-1">Vertragsguthaben laut Anbieter</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={kapital}
              onChange={(e) => setKapital(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="200000"
              step="500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={kapital}
            onChange={(e) => setKapital(Number(e.target.value))}
            className="w-full mt-3 accent-rose-500"
            min="1000"
            max="100000"
            step="500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1.000 €</span>
            <span>50.000 €</span>
            <span>100.000 €</span>
          </div>
        </div>

        {/* Erhaltene Zulagen */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Erhaltene Zulagen (gesamt)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Summe aller Grund- und Kinderzulagen über die Laufzeit — steht in der jährlichen
              Zulagenbescheinigung des Anbieters
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={zulagen}
              onChange={(e) => setZulagen(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              step="25"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">€</span>
          </div>
        </div>

        {/* Steuerermäßigung § 10a */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Steuerermäßigung nach § 10a (gesamt)</span>
            <span className="text-xs text-gray-500 block mt-1">
              In Anspruch genommene zusätzliche Steuerermäßigung (gesondert festgestellter Betrag).
              Steht im Einkommensteuerbescheid (Zeile zur Anlage AV) bzw. in der Zulagenbescheinigung.
              Wenn unbekannt: 0 lassen — viele erhielten nur die Zulagen.
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={steuerermaessigung}
              onChange={(e) => setSteuerermaessigung(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              step="25"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">€</span>
          </div>
        </div>

        {/* Eigene Beiträge */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Eigene eingezahlte Beiträge (gesamt)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Zur Schätzung des steuerpflichtigen Ertragsanteils (Kapital − Eigenbeiträge)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={eingezahlt}
              onChange={(e) => setEingezahlt(Math.max(0, Math.min(kapital, Number(e.target.value))))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max={kapital}
              step="500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">€</span>
          </div>
          <input
            type="range"
            value={eingezahlt}
            onChange={(e) => setEingezahlt(Number(e.target.value))}
            className="w-full mt-3 accent-rose-500"
            min="0"
            max={kapital}
            step="500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span>{formatEuro(kapital)}</span>
          </div>
        </div>

        {/* Grenzsteuersatz */}
        <div className="mb-2">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Persönlicher Grenzsteuersatz</span>
            <span className="text-xs text-gray-500 block mt-1">Für die Besteuerung der Erträge (§ 22 Nr. 5 EStG)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={grenzsteuersatz}
              onChange={(e) => setGrenzsteuersatz(Math.max(0, Math.min(45, Number(e.target.value))))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="45"
              step="1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">%</span>
          </div>
          <input
            type="range"
            value={grenzsteuersatz}
            onChange={(e) => setGrenzsteuersatz(Number(e.target.value))}
            className="w-full mt-3 accent-rose-500"
            min="0"
            max="45"
            step="1"
          />
          <p className="text-sm text-gray-500 mt-2">
            💡 Typisch: 25–35 % bei mittlerem Einkommen, 42 % bei hohem
          </p>
        </div>
      </div>

      {/* Result Section */}
      <div className={`bg-gradient-to-br ${severityClasses} rounded-2xl shadow-lg p-6 text-white mb-6`}>
        <h3 className="text-sm font-medium opacity-80 mb-1">📉 Bei Kündigung mit Kapitalauszahlung</h3>

        <div className="mb-4">
          <span className="text-xs uppercase tracking-wide opacity-80 block">Das bleibt Ihnen netto</span>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.nettoNachSteuer)}</span>
          </div>
          <p className="text-white/90 mt-1 text-sm">
            geschätzt, nach Rückzahlung der Förderung und Steuer auf die Erträge
          </p>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm mb-4">
          <div className="flex justify-between items-center mb-2">
            <span>Verlustquote</span>
            <span className="text-xl font-bold">{formatProzent(ergebnis.verlustquote)}</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden bg-white/20">
            <div
              className="bg-white h-full transition-all duration-500"
              style={{ width: `${Math.min(ergebnis.verlustquote, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs opacity-80 mt-1">{severityText} (Förderung + Steuer vs. Kapital)</p>
        </div>
      </div>

      {/* Aufschlüsselung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🧾 So setzt sich die Auszahlung zusammen</h3>

        <div className="space-y-1 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Bruttoauszahlung (Vertragsguthaben)</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.bruttoAuszahlung)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              − Rückzahlung Zulagen + Steuerermäßigung (§ 93)
              <span className="text-xs text-gray-400 block">Anbieter behält ein und führt an die ZfA ab</span>
            </span>
            <span className="font-bold text-rose-600">− {formatEuro(ergebnis.rueckzahlungsbetrag)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-700 font-medium">= Auszahlung vom Anbieter</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.nachRueckzahlung)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              − geschätzte Steuer auf Erträge (§ 22 Nr. 5)
              <span className="text-xs text-gray-400 block">separat über die Steuererklärung — nicht vom Anbieter einbehalten</span>
            </span>
            <span className="font-bold text-rose-600">− {formatEuro(ergebnis.ertragsteuer)}</span>
          </div>
          <div className="flex justify-between py-3 bg-rose-50 -mx-6 px-6">
            <span className="font-bold text-rose-800">= geschätztes Netto</span>
            <span className="font-bold text-2xl text-rose-900">{formatEuro(ergebnis.nettoNachSteuer)}</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          ℹ️ Der steuerpflichtige Ertragsanteil ist eine <strong>Schätzung</strong> (Kapital −
          Eigenbeiträge). Da Eigenbeiträge und Zulagen ebenfalls im Kapital stecken, überschätzt diese
          einfache Differenz die Erträge leicht. Den genauen Ertragsanteil weist der Anbieter in der
          Kündigungs-/Auszahlungsbescheinigung aus.
        </p>
      </div>

      {/* Kleinbetragsrenten-Hinweis */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-blue-800 mb-2">💡 Kleinbetragsrente: förderunschädlich abfinden</h3>
        <p className="text-sm text-blue-800">
          Kleinbetragsrenten bis <strong>59 €/Monat</strong> dürfen 2026 förderunschädlich abgefunden
          werden (§ 93 Abs. 3 Nr. 2 EStG). Die Grenze sind 1,5 % der monatlichen Bezugsgröße nach § 18
          SGB IV — bei einer Bezugsgröße von {formatEuro(BEZUGSGROESSE_MONAT_2026)}/Monat (bundeseinheitlich
          2026) entspricht das {KLEINBETRAGSRENTE_GRENZE.toFixed(2).replace('.', ',')} €/Monat. In diesem
          Fall müssen Zulagen und Steuervorteile <strong>nicht</strong> zurückgezahlt werden.
        </p>
      </div>

      {/* Förderunschädliche Alternativen */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-emerald-800 mb-3">✅ Vor der Kündigung prüfen: förderunschädliche Alternativen</h3>
        <p className="text-sm text-emerald-800 mb-3">
          Bei diesen Wegen muss die Förderung <strong>nicht</strong> zurückgezahlt werden:
        </p>
        <ul className="space-y-2 text-sm text-emerald-800">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Anbieterwechsel:</strong> Übertragung des Guthabens auf einen anderen zertifizierten Riester-Vertrag</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Beitragsfreistellung (Ruhenlassen):</strong> Beiträge auf 0 € setzen, Vertrag und Förderung bleiben bestehen</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Versorgungsausgleich:</strong> Teilung des Guthabens bei Scheidung</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Wohn-Riester-Entnahme</strong> für selbstgenutztes Wohneigentum (§ 92a EStG)</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Auszahlung im Rentenalter</strong> als lebenslange Rente (zzgl. bis zu 30 % Teilkapital)</span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-2">⚠️ Schätzung – keine Steuer- oder Rechtsberatung</h3>
        <p className="text-sm text-amber-700">
          Der angezeigte Netto-Betrag ist eine vereinfachte Schätzung: Der genaue Rückzahlungsbetrag und
          der steuerpflichtige Ertragsanteil werden vom Anbieter bzw. der Zentralen Zulagenstelle für
          Altersvermögen (ZfA) ermittelt und in der Kündigungs-/Auszahlungsbescheinigung ausgewiesen.
          Stornokosten des Anbieters, Solidaritätszuschlag und Kirchensteuer sind nicht enthalten. Wichtig:
          Die staatliche Förderung muss <strong>nur bei schädlicher Verwendung</strong> (z. B. vorzeitige
          Kapitalauszahlung/Kündigung) zurückgezahlt werden — <strong>nicht</strong> bei Anbieterwechsel,
          Beitragsfreistellung (Ruhenlassen) oder Übertragung im Versorgungsausgleich. Prüfen Sie vor einer
          Kündigung diese förderunschädlichen Alternativen.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/estg/__93.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 93 EStG – Schädliche Verwendung (Rückzahlungsbetrag)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/estg/__94.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 94 EStG – Verfahren bei schädlicher Verwendung (Einbehalt durch Anbieter)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/estg/__22.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 22 Nr. 5 EStG – Besteuerung der Leistungen aus Altersvorsorgeverträgen
          </a>
          <a
            href="https://www.gesetze-im-internet.de/estg/__10a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 10a EStG – Zusätzliche Altersvorsorge (gesondert festgestellte Steuerermäßigung)
          </a>
          <a
            href="https://www.deutsche-rentenversicherung.de/KnappschaftBahnSee/DE/Aktuelles/Meldungen/2026/2026_01_02_Sozialversicherungsrechengroessen2026.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            DRV – Sozialversicherungs-Rechengrößen 2026 (Bezugsgröße)
          </a>
        </div>
      </div>
    </div>
  );
}
