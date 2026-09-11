import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: September 2026, AFBG in der Fassung des 4. AFBGÄndG) ===

// Maßnahmebeitrag: Lehrgangs- und Prüfungsgebühren bis 15.000 €, davon 50 % Zuschuss, Rest KfW-Darlehen
// Quelle: § 12 Abs. 1 AFBG – https://www.gesetze-im-internet.de/afbg/__12.html
const MAX_GEBUEHREN = 15000;
const ZUSCHUSS_ANTEIL = 0.5;

// Meisterstück / fachpraktische Arbeit: bis zur Hälfte der Materialkosten, höchstens 2.000 € – § 12 Abs. 1 Nr. 2
const MAX_MEISTERSTUECK = 2000;

// Erlass bei bestandener Prüfung: 50 % des noch nicht fälligen Darlehens für die Gebühren (nur Nr. 1) – § 13b Abs. 1
const ERLASS_BESTANDEN = 0.5;
// Existenzgründung binnen 3 Jahren, Betrieb mind. 3 Jahre: Restdarlehen für Gebühren zu 100 % – § 13b Abs. 2
const ERLASS_GRUENDUNG = 1.0;

// Unterhaltsbedarf (nur Vollzeit): § 13 Abs. 1 Nr. 1 BAföG 442 € + § 13 Abs. 2 Nr. 2 BAföG 380 € Wohnpauschale
// + § 13a BAföG KV 102 € / PV 35 € + Erhöhung 60 € (§ 10 Abs. 2 S. 3 AFBG) = 1.019 € (offizielle Angabe BMBFSFJ)
const GRUNDBEDARF = 442;
const WOHNPAUSCHALE = 380;
const KV_ZUSCHLAG = 102;
const PV_ZUSCHLAG = 35;
const ERHOEHUNG_TEILNEHMER = 60;
const ERHOEHUNG_EHEGATTE = 235;
const ERHOEHUNG_KIND = 235;

// Kinderbetreuungszuschlag Alleinerziehende, Kind unter 14: 150 €/Monat je Kind, Voll- und Teilzeit – § 10 Abs. 3 AFBG
const KINDERBETREUUNG = 150;

// Einkommensfreibeträge (§ 17 AFBG i.V.m. §§ 23, 25 BAföG): Teilnehmer 353 €, Ehegatte 850 €, je Kind 770 €;
// Ehegatte eigener Freibetrag 1.690 €, je Kind 770 €; übersteigendes Ehegatteneinkommen zu 50 % + 5 % je Kind frei
const FREIBETRAG_SELBST = 353;
const FREIBETRAG_EHEGATTE_BEIM_TEILNEHMER = 850;
const FREIBETRAG_KIND = 770;
const FREIBETRAG_EHEGATTE_EIGEN = 1690;
const EHEGATTE_ANRECHNUNGSFREI = 0.5;
const EHEGATTE_ANRECHNUNGSFREI_JE_KIND = 0.05;

// Vermögensfreibeträge: 45.000 € Teilnehmer, je 2.300 € Ehegatte und Kind – § 17a AFBG
const VERMOEGEN_FREI = 45000;
const VERMOEGEN_FREI_JE_PERSON = 2300;

// Darlehen: zins- und tilgungsfrei während der Maßnahme + 2 Jahre Karenz (max. 6 Jahre), danach 10 Jahre
// Rückzahlung, Mindestrate 128 €/Monat – § 13 Abs. 3 und 5 AFBG
const MINDESTRATE = 128;

// Reformentwurf (5. AFBGÄndG, Kabinettbeschluss 15.7.2026, geplant ab 1.8.2027): 18.000 €, Meisterstück 4.000 €,
// Erlass 60 %, Kinderbetreuungszuschlag 160 €, Arbeitgeberzuschüsse nicht mehr angerechnet – noch nicht geltendes Recht
const REFORM = { maxGebuehren: 18000, maxMeisterstueck: 4000, erlass: 0.6, kbz: 160 };

const fmtEuro = (n: number) =>
  n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtEuroRund = (n: number) =>
  n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function AufstiegsBafoegRechner() {
  const [gebuehren, setGebuehren] = useState(9500);
  const [meisterstueck, setMeisterstueck] = useState(0);
  const [arbeitgeber, setArbeitgeber] = useState(0);
  const [vollzeit, setVollzeit] = useState(true);
  const [monate, setMonate] = useState(12);
  const [bestanden, setBestanden] = useState(true);
  const [gruendung, setGruendung] = useState(false);

  const [verheiratet, setVerheiratet] = useState(false);
  const [kinder, setKinder] = useState(0);
  const [alleinerziehend, setAlleinerziehend] = useState(false);
  const [eigeneKv, setEigeneKv] = useState(true);
  const [einkommenSelbst, setEinkommenSelbst] = useState(0);
  const [einkommenPartner, setEinkommenPartner] = useState(0);
  const [vermoegen, setVermoegen] = useState(0);

  const ergebnis = useMemo(() => {
    // === 1. Maßnahmebeitrag (§ 10 Abs. 1, § 12 Abs. 1) ===
    const gebuehrenNetto = Math.max(0, gebuehren - Math.max(0, arbeitgeber)); // Arbeitgeber-/öffentliche Leistungen mindern (§ 10 Abs. 1 S. 2)
    const foerderfaehig = Math.min(MAX_GEBUEHREN, gebuehrenNetto);
    const zuschussGebuehren = foerderfaehig * ZUSCHUSS_ANTEIL;
    const darlehenGebuehren = foerderfaehig - zuschussGebuehren;
    const nichtGefoerdert = Math.max(0, gebuehrenNetto - MAX_GEBUEHREN);

    const meisterFoerderfaehig = Math.min(MAX_MEISTERSTUECK, Math.max(0, meisterstueck) * 0.5);
    const zuschussMeister = meisterFoerderfaehig * ZUSCHUSS_ANTEIL;
    const darlehenMeister = meisterFoerderfaehig - zuschussMeister;

    // === 2. Erlass (§ 13b) – nur auf das Gebühren-Darlehen ===
    const erlassQuote = gruendung && bestanden ? ERLASS_GRUENDUNG : bestanden ? ERLASS_BESTANDEN : 0;
    const erlass = darlehenGebuehren * erlassQuote;
    const restDarlehen = darlehenGebuehren - erlass + darlehenMeister;

    // Eigenanteil an den Gebühren: was weder Arbeitgeber noch Zuschuss noch Erlass abdecken
    const eigenanteilGebuehren = gebuehrenNetto - zuschussGebuehren - erlass;
    const eigenanteilMeister = Math.max(0, meisterstueck) - zuschussMeister;

    // === 3. Unterhaltsbeitrag (nur Vollzeit, § 10 Abs. 2, Vollzuschuss § 12 Abs. 2) ===
    const bedarf = vollzeit
      ? GRUNDBEDARF + WOHNPAUSCHALE + (eigeneKv ? KV_ZUSCHLAG + PV_ZUSCHLAG : 0) + ERHOEHUNG_TEILNEHMER
        + (verheiratet ? ERHOEHUNG_EHEGATTE : 0) + kinder * ERHOEHUNG_KIND
      : 0;

    // Eigenes Einkommen (§ 23 BAföG): Freibetrag 353 + (850 − Partnereinkommen) + 770 je Kind
    const freibetragSelbst = FREIBETRAG_SELBST
      + (verheiratet ? Math.max(0, FREIBETRAG_EHEGATTE_BEIM_TEILNEHMER - Math.max(0, einkommenPartner)) : 0)
      + kinder * FREIBETRAG_KIND;
    const anrechnungSelbst = Math.max(0, einkommenSelbst - freibetragSelbst);

    // Partnereinkommen (§ 25 BAföG): 1.690 + 770 je Kind frei, vom Rest 50 % + 5 % je Kind frei
    const freibetragPartner = FREIBETRAG_EHEGATTE_EIGEN + kinder * FREIBETRAG_KIND;
    const partnerUeber = verheiratet ? Math.max(0, einkommenPartner - freibetragPartner) : 0;
    const partnerAnrechnungsquote = Math.max(0, 1 - EHEGATTE_ANRECHNUNGSFREI - kinder * EHEGATTE_ANRECHNUNGSFREI_JE_KIND);
    const anrechnungPartner = partnerUeber * partnerAnrechnungsquote;

    // Vermögen (§ 17a AFBG, § 30 BAföG): Freibetrag abziehen, Rest auf die Monate des Bewilligungszeitraums verteilen
    const vermoegenFrei = VERMOEGEN_FREI + VERMOEGEN_FREI_JE_PERSON * ((verheiratet ? 1 : 0) + kinder);
    const anrechnungVermoegen = Math.max(0, vermoegen - vermoegenFrei) / Math.max(1, monate);

    const unterhaltMonat = vollzeit ? Math.max(0, bedarf - anrechnungSelbst - anrechnungPartner - anrechnungVermoegen) : 0;
    const kbzMonat = alleinerziehend ? kinder * KINDERBETREUUNG : 0;
    const unterhaltGesamt = (unterhaltMonat + kbzMonat) * Math.max(1, monate);

    // === 4. Reform-Vergleich (geplant ab 1.8.2027) ===
    const reformFoerderfaehig = Math.min(REFORM.maxGebuehren, gebuehren); // Arbeitgeberzuschüsse werden nicht mehr angerechnet
    const reformZuschuss = reformFoerderfaehig * ZUSCHUSS_ANTEIL;
    const reformDarlehen = reformFoerderfaehig - reformZuschuss;
    const reformErlass = reformDarlehen * (gruendung && bestanden ? 1 : bestanden ? REFORM.erlass : 0);
    const reformEigenanteil = Math.max(0, gebuehrenNetto - reformZuschuss - reformErlass);

    return {
      gebuehrenNetto, foerderfaehig, zuschussGebuehren, darlehenGebuehren, nichtGefoerdert,
      meisterFoerderfaehig, zuschussMeister, darlehenMeister,
      erlassQuote, erlass, restDarlehen, eigenanteilGebuehren, eigenanteilMeister,
      zuschussGesamt: zuschussGebuehren + zuschussMeister,
      bedarf, freibetragSelbst, anrechnungSelbst, freibetragPartner, partnerAnrechnungsquote, anrechnungPartner,
      vermoegenFrei, anrechnungVermoegen, unterhaltMonat, kbzMonat, unterhaltGesamt,
      reformEigenanteil, reformErlass, reformZuschuss,
      foerderungGesamt: zuschussGebuehren + zuschussMeister + erlass + unterhaltGesamt,
    };
  }, [gebuehren, meisterstueck, arbeitgeber, vollzeit, monate, bestanden, gruendung, verheiratet, kinder, alleinerziehend, eigeneKv, einkommenSelbst, einkommenPartner, vermoegen]);

  const btn = (aktiv: boolean) =>
    `py-3 px-3 rounded-xl font-medium transition-all text-sm ${aktiv ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`;
  const inputCls = 'w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none';
  const zahl = (setter: (n: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => setter(Math.max(0, Number(e.target.value) || 0));

  return (
    <div className="max-w-2xl mx-auto">
      {/* Fortbildung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">1. Ihre Fortbildung</h3>
        <div className="mb-5">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Lehrgangs- und Prüfungsgebühren gesamt</span>
            <span className="text-xs text-gray-500 block mt-1">Meister, Techniker, Fachwirt, Erzieher, Betriebswirt … – laut Angebot des Bildungsträgers und Prüfungsordnung</span>
          </label>
          <div className="relative">
            <input type="number" value={gebuehren} onChange={zahl(setGebuehren)} className={`${inputCls} text-3xl py-4`} min="0" max="50000" step="100" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input type="range" value={gebuehren} onChange={(e) => setGebuehren(Number(e.target.value))} className="w-full mt-3 accent-amber-500" min="1000" max="25000" step="100" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Materialkosten Meisterstück</span>
              <span className="text-xs text-gray-500 block mt-1">Nur Handwerk und vergleichbare Prüfungsarbeiten, sonst 0</span>
            </label>
            <div className="relative">
              <input type="number" value={meisterstueck} onChange={zahl(setMeisterstueck)} className={inputCls} min="0" step="100" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
          </div>
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Zuschuss vom Arbeitgeber zu den Gebühren</span>
              <span className="text-xs text-gray-500 block mt-1">Wird derzeit abgezogen (§ 10 Abs. 1 S. 2) – ab der Reform 2027 nicht mehr</span>
            </label>
            <div className="relative">
              <input type="number" value={arbeitgeber} onChange={zahl(setArbeitgeber)} className={inputCls} min="0" step="100" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div>
            <span className="text-gray-700 font-medium block mb-2">Unterrichtsform</span>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setVollzeit(true)} className={btn(vollzeit)}>Vollzeit</button>
              <button onClick={() => setVollzeit(false)} className={btn(!vollzeit)}>Teilzeit / berufsbegleitend</button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Unterhaltsbeitrag gibt es nur bei Vollzeit (mind. 25 Unterrichtsstunden an 4 Werktagen pro Woche)</p>
          </div>
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Dauer der Maßnahme</span>
              <span className="text-xs text-gray-500 block mt-1">Vollzeit max. 24, Teilzeit max. 48 Monate Förderung</span>
            </label>
            <div className="relative">
              <input type="number" value={monate} onChange={(e) => setMonate(Math.max(1, Math.min(48, Math.round(Number(e.target.value)))))} className={inputCls} min="1" max="48" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Monate</span>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={bestanden} onChange={(e) => setBestanden(e.target.checked)} className="w-5 h-5 mt-0.5 accent-amber-500" />
            <span className="text-sm text-gray-700"><strong>Ich bestehe die Fortbildungsprüfung</strong> – dann werden 50 % des Gebühren-Darlehens erlassen (§ 13b Abs. 1 AFBG)</span>
          </label>
          <label className={`flex items-start gap-3 cursor-pointer ${bestanden ? '' : 'opacity-50'}`}>
            <input type="checkbox" checked={gruendung && bestanden} disabled={!bestanden} onChange={(e) => setGruendung(e.target.checked)} className="w-5 h-5 mt-0.5 accent-amber-500" />
            <span className="text-sm text-gray-700"><strong>Ich gründe oder übernehme innerhalb von 3 Jahren ein Unternehmen</strong> und führe es mindestens 3 Jahre im Haupterwerb – dann wird das Rest-Darlehen für die Gebühren komplett erlassen (§ 13b Abs. 2 AFBG)</span>
          </label>
        </div>
      </div>

      {/* Persönliche Situation (nur Vollzeit relevant für Unterhalt, KBZ auch Teilzeit) */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">2. Ihre persönliche Situation</h3>
        <p className="text-xs text-gray-500 mb-4">{vollzeit ? 'Bestimmt den Unterhaltsbeitrag zum Lebensunterhalt (Vollzuschuss)' : 'Bei Teilzeit nur für den Kinderbetreuungszuschlag relevant'}</p>
        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div>
            <span className="text-gray-700 font-medium block mb-2">Familienstand</span>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setVerheiratet(false)} className={btn(!verheiratet)}>Ledig / getrennt</button>
              <button onClick={() => setVerheiratet(true)} className={btn(verheiratet)}>Verheiratet / verpartnert</button>
            </div>
          </div>
          <div>
            <span className="text-gray-700 font-medium block mb-2">Kinder mit Kindergeldanspruch</span>
            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4].map((n) => (
                <button key={n} onClick={() => setKinder(n)} className={btn(kinder === n)}>{n}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-3 mb-5">
          {kinder > 0 && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={alleinerziehend} onChange={(e) => setAlleinerziehend(e.target.checked)} className="w-5 h-5 mt-0.5 accent-amber-500" />
              <span className="text-sm text-gray-700">Ich bin alleinerziehend und die Kinder sind unter 14 (oder behindert) – Kinderbetreuungszuschlag 150 €/Monat je Kind, auch in Teilzeit</span>
            </label>
          )}
          {vollzeit && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={eigeneKv} onChange={(e) => setEigeneKv(e.target.checked)} className="w-5 h-5 mt-0.5 accent-amber-500" />
              <span className="text-sm text-gray-700">Ich zahle eigene Kranken- und Pflegeversicherungsbeiträge (nicht familienversichert) – Zuschlag 102 € + 35 €</span>
            </label>
          )}
        </div>
        {vollzeit && (
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Eigenes Einkommen während der Fortbildung</span>
                <span className="text-xs text-gray-500 block mt-1">Netto pro Monat (Nebenjob, Mieteinnahmen)</span>
              </label>
              <div className="relative">
                <input type="number" value={einkommenSelbst} onChange={zahl(setEinkommenSelbst)} className={inputCls} min="0" step="50" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
            </div>
            <div className={verheiratet ? '' : 'opacity-40'}>
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Einkommen des Ehe-/Lebenspartners</span>
                <span className="text-xs text-gray-500 block mt-1">Netto pro Monat (vorletztes Kalenderjahr)</span>
              </label>
              <div className="relative">
                <input type="number" value={einkommenPartner} disabled={!verheiratet} onChange={zahl(setEinkommenPartner)} className={inputCls} min="0" step="50" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
            </div>
            <div>
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Ihr Vermögen</span>
                <span className="text-xs text-gray-500 block mt-1">Sparguthaben, Depot, Bausparvertrag bei Antragstellung</span>
              </label>
              <div className="relative">
                <input type="number" value={vermoegen} onChange={zahl(setVermoegen)} className={inputCls} min="0" step="1000" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🎓 Ihr Eigenanteil an den Lehrgangs- und Prüfungsgebühren</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-5xl font-bold">{fmtEuroRund(ergebnis.eigenanteilGebuehren)}</span>
            <span className="text-xl opacity-80">statt {fmtEuroRund(ergebnis.gebuehrenNetto)}{arbeitgeber > 0 ? ' nach Arbeitgeberzuschuss' : ''}</span>
          </div>
          <p className="text-amber-100 mt-2 text-sm">
            {fmtEuroRund(ergebnis.zuschussGebuehren)} Zuschuss
            {ergebnis.erlass > 0 && ` + ${fmtEuroRund(ergebnis.erlass)} Darlehenserlass (${Math.round(ergebnis.erlassQuote * 100)} %)`}
            {ergebnis.nichtGefoerdert > 0 && ` – ${fmtEuroRund(ergebnis.nichtGefoerdert)} liegen über dem Höchstbetrag von 15.000 € und bleiben ungefördert`}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Zuschuss (geschenkt)</span>
            <div className="text-xl font-bold">{fmtEuroRund(ergebnis.zuschussGesamt)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">KfW-Darlehen zunächst</span>
            <div className="text-xl font-bold">{fmtEuroRund(ergebnis.darlehenGebuehren + ergebnis.darlehenMeister)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Davon erlassen</span>
            <div className="text-xl font-bold">{fmtEuroRund(ergebnis.erlass)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Tatsächlich zurückzuzahlen</span>
            <div className="text-xl font-bold">{fmtEuroRund(ergebnis.restDarlehen)}</div>
            {ergebnis.restDarlehen > 0 && <span className="text-xs opacity-70">≈ {fmtEuroRund(Math.max(MINDESTRATE, ergebnis.restDarlehen / 120))}/Monat über max. 10 Jahre, zzgl. Zinsen</span>}
          </div>
        </div>
        {vollzeit && (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm mb-3">
            <div className="flex justify-between items-center gap-3 flex-wrap">
              <span className="text-sm opacity-80">Unterhaltsbeitrag (Vollzuschuss, {monate} Monate)</span>
              <span className="text-lg font-bold">{fmtEuro(ergebnis.unterhaltMonat)}/Monat</span>
            </div>
            {ergebnis.kbzMonat > 0 && (
              <div className="flex justify-between items-center gap-3 flex-wrap mt-1">
                <span className="text-sm opacity-80">+ Kinderbetreuungszuschlag</span>
                <span className="text-lg font-bold">{fmtEuro(ergebnis.kbzMonat)}/Monat</span>
              </div>
            )}
            <div className="text-xs opacity-80 mt-2">Gesamt über die Maßnahme: {fmtEuroRund(ergebnis.unterhaltGesamt)} – muss nicht zurückgezahlt werden</div>
          </div>
        )}
        {!vollzeit && ergebnis.kbzMonat > 0 && (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm mb-3 flex justify-between items-center gap-3 flex-wrap">
            <span className="text-sm opacity-80">Kinderbetreuungszuschlag ({monate} Monate)</span>
            <span className="text-lg font-bold">{fmtEuro(ergebnis.kbzMonat)}/Monat</span>
          </div>
        )}
        <div className="text-sm">
          <strong>Förderung insgesamt: {fmtEuroRund(ergebnis.foerderungGesamt)}</strong> (Zuschüsse + Erlass + Unterhalt), ohne Rückzahlung
        </div>
      </div>

      {/* Maßnahmebeitrag Detail */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Maßnahmebeitrag im Detail</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
            <span className="text-gray-600">Gebühren{arbeitgeber > 0 ? ` abzgl. ${fmtEuroRund(arbeitgeber)} Arbeitgeberzuschuss` : ''}, förderfähig bis 15.000 €</span>
            <span className="font-medium text-gray-800 text-right">{fmtEuroRund(ergebnis.foerderfaehig)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
            <span className="text-gray-600">50 % Zuschuss</span>
            <span className="font-medium text-gray-800 text-right">{fmtEuroRund(ergebnis.zuschussGebuehren)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
            <span className="text-gray-600">50 % KfW-Darlehen</span>
            <span className="font-medium text-gray-800 text-right">{fmtEuroRund(ergebnis.darlehenGebuehren)}</span>
          </div>
          {ergebnis.meisterFoerderfaehig > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
              <span className="text-gray-600">Meisterstück: Hälfte der Materialkosten, max. 2.000 € → {fmtEuroRund(ergebnis.zuschussMeister)} Zuschuss + {fmtEuroRund(ergebnis.darlehenMeister)} Darlehen (kein Erlass)</span>
              <span className="font-medium text-gray-800 text-right">{fmtEuroRund(ergebnis.meisterFoerderfaehig)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
            <span className="text-gray-600">Erlass {Math.round(ergebnis.erlassQuote * 100)} % des Gebühren-Darlehens {gruendung && bestanden ? '(Existenzgründung)' : bestanden ? '(Prüfung bestanden)' : '(Prüfung nicht bestanden)'}</span>
            <span className="font-medium text-gray-800 text-right">− {fmtEuroRund(ergebnis.erlass)}</span>
          </div>
          <div className="flex justify-between py-2 gap-4">
            <span className="text-gray-600">Eigenanteil = Gebühren{arbeitgeber > 0 ? ' − Arbeitgeberzuschuss' : ''} − Zuschuss − Erlass</span>
            <span className="font-bold text-amber-700 text-right">{fmtEuroRund(ergebnis.eigenanteilGebuehren)}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Das Darlehen ist während der Maßnahme und zwei Jahre danach (höchstens sechs Jahre) zins- und tilgungsfrei.
          Danach: Rückzahlung innerhalb von zehn Jahren, mindestens 128 € im Monat, Zins = 6-Monats-EURIBOR + 1 %
          (§ 13 Abs. 2, 3, 5 AFBG). Vorzeitige Rückzahlung ist jederzeit möglich.
        </p>
      </div>

      {/* Unterhalt Detail */}
      {vollzeit && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">🏠 Unterhaltsbeitrag im Detail</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
              <span className="text-gray-600">Grundbedarf 442 € + Wohnpauschale 380 €{eigeneKv ? ' + KV/PV 137 €' : ''} + Erhöhung 60 €{verheiratet ? ' + Partner 235 €' : ''}{kinder > 0 ? ` + ${kinder} × 235 € Kinder` : ''}</span>
              <span className="font-medium text-gray-800 text-right">{fmtEuro(ergebnis.bedarf)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
              <span className="text-gray-600">− eigenes Einkommen über Freibetrag {fmtEuroRund(ergebnis.freibetragSelbst)}</span>
              <span className="font-medium text-gray-800 text-right">− {fmtEuro(ergebnis.anrechnungSelbst)}</span>
            </div>
            {verheiratet && (
              <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
                <span className="text-gray-600">− Partnereinkommen über {fmtEuroRund(ergebnis.freibetragPartner)}, davon {Math.round(ergebnis.partnerAnrechnungsquote * 100)} % angerechnet</span>
                <span className="font-medium text-gray-800 text-right">− {fmtEuro(ergebnis.anrechnungPartner)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
              <span className="text-gray-600">− Vermögen über {fmtEuroRund(ergebnis.vermoegenFrei)}, verteilt auf {monate} Monate</span>
              <span className="font-medium text-gray-800 text-right">− {fmtEuro(ergebnis.anrechnungVermoegen)}</span>
            </div>
            <div className="flex justify-between py-2 gap-4">
              <span className="text-gray-600">= Unterhaltsbeitrag (100 % Zuschuss)</span>
              <span className="font-bold text-amber-700 text-right">{fmtEuro(ergebnis.unterhaltMonat)}/Monat</span>
            </div>
          </div>
        </div>
      )}

      {/* Reform */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-900 mb-2">🔭 Ausblick: Reform ab 1. August 2027 (Regierungsentwurf)</h3>
        <p className="text-sm text-amber-900 mb-3">
          Das Bundeskabinett hat am 15. Juli 2026 das Fünfte AFBG-Änderungsgesetz beschlossen; es muss noch durch Bundestag
          und Bundesrat. Geplant: Höchstbetrag 18.000 € statt 15.000 €, Meisterstück bis 4.000 €, Erlass bei bestandener
          Prüfung 60 % statt 50 %, Kinderbetreuungszuschlag 160 €, Arbeitgeberzuschüsse werden nicht mehr angerechnet.
        </p>
        <div className="flex justify-between items-center gap-3 flex-wrap text-sm">
          <span className="text-amber-900">Ihr Eigenanteil nach der Reform (bei gleichen Angaben):</span>
          <span className="font-bold text-amber-900 text-lg">{fmtEuroRund(ergebnis.reformEigenanteil)} <span className="text-sm font-normal">statt {fmtEuroRund(ergebnis.eigenanteilGebuehren)}</span></span>
        </div>
        <p className="text-xs text-amber-800 mt-2">Wer die Fortbildung erst nach dem Inkrafttreten beginnt, profitiert davon – laufende Maßnahmen bleiben in der Regel im alten Recht. Bis zur Verkündung ist das keine Zusage.</p>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-xs text-gray-500">
        <strong>Hinweis:</strong> Maßnahmebeitrag und Erlass sind exakt nach §§ 12, 13b AFBG berechnet. Der Unterhaltsbeitrag
        ist eine Näherung: Die Ämter rechnen mit dem Einkommen des vorletzten Kalenderjahres nach § 21 BAföG (Brutto abzüglich
        Steuern und Sozialpauschale), nicht mit dem Netto; die KV/PV-Zuschläge hängen vom Versicherungsstatus ab
        (§ 13a BAföG); der Bewilligungszeitraum kann von der Maßnahmedauer abweichen. Förderfähig sind nur Maßnahmen nach
        § 2 AFBG (mind. 400 Unterrichtsstunden, Fortbildungsdichte). Keine Rechtsberatung – verbindlich ist der Bescheid
        der zuständigen Behörde.
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a href="https://www.gesetze-im-internet.de/afbg/__12.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 12 AFBG – Umfang der Förderung (15.000 €, 50 % Zuschuss, Meisterstück 2.000 €, Unterhalt als Vollzuschuss)
          </a>
          <a href="https://www.gesetze-im-internet.de/afbg/__10.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 10 AFBG – Maßnahmebeitrag, Unterhaltsbedarf (+60 €, +235 € Partner/Kind), Kinderbetreuungszuschlag 150 €
          </a>
          <a href="https://www.gesetze-im-internet.de/afbg/__13b.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 13b AFBG – Darlehenserlass: 50 % bei bestandener Prüfung, 100 % bei Existenzgründung
          </a>
          <a href="https://www.gesetze-im-internet.de/afbg/__13.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 13 AFBG – KfW-Darlehen: Karenzzeit, Zinsen, Rückzahlung in 10 Jahren, Mindestrate 128 €
          </a>
          <a href="https://www.gesetze-im-internet.de/afbg/__17a.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 17a AFBG – Vermögensfreibeträge 45.000 € / 2.300 €
          </a>
          <a href="https://www.gesetze-im-internet.de/baf_g/__13.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            §§ 13, 13a, 23, 25 BAföG – Bedarfssätze 442 € + 380 €, KV/PV-Zuschlag, Einkommensfreibeträge
          </a>
          <a href="https://www.aufstiegs-bafoeg.de/aufstiegsbafoeg/de/die-foerderung/wie-wird-gefoerdert/wie-wird-gefoerdert_node.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            BMBFSFJ – Aufstiegs-BAföG: Wie wird gefördert? (Unterhaltsbeitrag max. 1.019 €)
          </a>
          <a href="https://www.bundesregierung.de/breg-de/aktuelles/aufstiegs-bafoeg-reform-2026-1674632" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            Bundesregierung – Kabinettbeschluss zum 5. AFBG-Änderungsgesetz (15.7.2026, geplant ab 1.8.2027)
          </a>
        </div>
      </div>
    </div>
  );
}
