import { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Brückentage-Rechner 2026
//
// Gesetzliche Feiertage 2026 (Wochentage berechnet & geprüft):
//   01.01. Do  Neujahr ............................ bundesweit
//   06.01. Di  Heilige Drei Könige ............... BW, BY, ST
//   08.03. So  Internationaler Frauentag ......... BE, MV (fällt 2026 auf Sonntag → verpufft)
//   03.04. Fr  Karfreitag ........................ bundesweit
//   06.04. Mo  Ostermontag ....................... bundesweit
//   01.05. Fr  Tag der Arbeit .................... bundesweit
//   14.05. Do  Christi Himmelfahrt ............... bundesweit
//   25.05. Mo  Pfingstmontag ..................... bundesweit
//   04.06. Do  Fronleichnam ...................... BW, BY, HE, NW, RP, SL (+ Teile SN/TH)
//   15.08. Sa  Mariä Himmelfahrt ................. SL (+ kath. Gemeinden BY) (fällt 2026 auf Samstag → verpufft)
//   20.09. So  Weltkindertag ..................... TH (Sonntag → verpufft)
//   03.10. Sa  Tag der Deutschen Einheit ......... bundesweit (Samstag → verpufft)
//   31.10. Sa  Reformationstag ................... BB, HB, HH, MV, NI, SH, SN, ST, TH (Samstag → verpufft)
//   01.11. So  Allerheiligen ..................... BW, BY, NW, RP, SL (Sonntag → verpufft)
//   18.11. Mi  Buß- und Bettag ................... SN
//   25.12. Fr  1. Weihnachtstag .................. bundesweit
//   26.12. Sa  2. Weihnachtstag .................. bundesweit (Samstag)
//
// Quelle: feiertage-deutschland.de · dgb.de/service/ratgeber/feiertage
// Hebel-Faktor = freie Tage am Stück / eingesetzte Urlaubstage
// ─────────────────────────────────────────────────────────────────────────────

type BundeslandCode =
  | 'BW' | 'BY' | 'BE' | 'BB' | 'HB' | 'HH' | 'HE' | 'MV'
  | 'NI' | 'NW' | 'RP' | 'SL' | 'SN' | 'ST' | 'SH' | 'TH';

const BUNDESLAENDER: { code: BundeslandCode; name: string }[] = [
  { code: 'BW', name: 'Baden-Württemberg' },
  { code: 'BY', name: 'Bayern' },
  { code: 'BE', name: 'Berlin' },
  { code: 'BB', name: 'Brandenburg' },
  { code: 'HB', name: 'Bremen' },
  { code: 'HH', name: 'Hamburg' },
  { code: 'HE', name: 'Hessen' },
  { code: 'MV', name: 'Mecklenburg-Vorpommern' },
  { code: 'NI', name: 'Niedersachsen' },
  { code: 'NW', name: 'Nordrhein-Westfalen' },
  { code: 'RP', name: 'Rheinland-Pfalz' },
  { code: 'SL', name: 'Saarland' },
  { code: 'SN', name: 'Sachsen' },
  { code: 'ST', name: 'Sachsen-Anhalt' },
  { code: 'SH', name: 'Schleswig-Holstein' },
  { code: 'TH', name: 'Thüringen' },
];

interface Konstellation {
  anlass: string;
  feiertag: string; // freundlich formuliert
  urlaubstage: number; // eingesetzte Urlaubstage
  freieTage: number; // freie Tage am Stück
  zeitraum: string; // freier Zeitraum
  welcheUrlaubstage: string; // welche Tage genau nehmen
  // in welchen Bundesländern diese Konstellation gilt; undefined = bundesweit
  laender?: BundeslandCode[];
}

// Bundesweite Konstellationen (gelten in allen 16 Bundesländern)
const BUNDESWEIT: Konstellation[] = [
  {
    anlass: 'Ostern',
    feiertag: 'Karfreitag (Fr, 03.04.) + Ostermontag (Mo, 06.04.)',
    urlaubstage: 8,
    freieTage: 16,
    zeitraum: 'Sa, 28.03. – So, 12.04.2026',
    welcheUrlaubstage: 'Mo–Do (30.03.–02.04.) und Di–Fr (07.–10.04.)',
  },
  {
    anlass: 'Christi Himmelfahrt + Pfingsten',
    feiertag: 'Christi Himmelfahrt (Do, 14.05.) + Pfingstmontag (Mo, 25.05.)',
    urlaubstage: 6,
    freieTage: 12,
    zeitraum: 'Do, 14.05. – Mo, 25.05.2026',
    welcheUrlaubstage: 'Fr (15.05.) und Mo–Fr (18.–22.05.)',
  },
  {
    anlass: 'Pfingsten',
    feiertag: 'Pfingstmontag (Mo, 25.05.)',
    urlaubstage: 4,
    freieTage: 9,
    zeitraum: 'Sa, 23.05. – So, 31.05.2026',
    welcheUrlaubstage: 'Di–Fr (26.–29.05.)',
  },
  {
    anlass: 'Weihnachten & Neujahr',
    feiertag: '1. + 2. Weihnachtstag (Fr/Sa, 25./26.12.) + Neujahr (Fr, 01.01.2027)',
    urlaubstage: 8,
    freieTage: 16,
    zeitraum: 'Sa, 19.12.2026 – So, 03.01.2027',
    welcheUrlaubstage: 'Mo–Do (21.–24.12.) und Mo–Do (28.–31.12.)',
  },
  {
    anlass: 'Christi Himmelfahrt',
    feiertag: 'Christi Himmelfahrt (Do, 14.05.)',
    urlaubstage: 1,
    freieTage: 4,
    zeitraum: 'Do, 14.05. – So, 17.05.2026',
    welcheUrlaubstage: 'Fr (15.05.)',
  },
  {
    anlass: 'Neujahr',
    feiertag: 'Neujahr (Do, 01.01.)',
    urlaubstage: 1,
    freieTage: 4,
    zeitraum: 'Do, 01.01. – So, 04.01.2026',
    welcheUrlaubstage: 'Fr (02.01.)',
  },
  {
    anlass: 'Tag der Arbeit',
    feiertag: '1. Mai (Fr, 01.05.)',
    urlaubstage: 1,
    freieTage: 4,
    zeitraum: 'Fr, 01.05. – Mo, 04.05.2026',
    welcheUrlaubstage: 'Mo (04.05.)',
  },
];

// Regionale Konstellationen (nur in bestimmten Bundesländern)
const REGIONAL: Konstellation[] = [
  {
    anlass: 'Fronleichnam',
    feiertag: 'Fronleichnam (Do, 04.06.)',
    urlaubstage: 1,
    freieTage: 4,
    zeitraum: 'Do, 04.06. – So, 07.06.2026',
    welcheUrlaubstage: 'Fr (05.06.)',
    laender: ['BW', 'BY', 'HE', 'NW', 'RP', 'SL'],
  },
  {
    anlass: 'Heilige Drei Könige + Neujahr',
    feiertag: 'Neujahr (Do, 01.01.) + Heilige Drei Könige (Di, 06.01.)',
    urlaubstage: 2,
    freieTage: 6,
    zeitraum: 'Do, 01.01. – Di, 06.01.2026',
    welcheUrlaubstage: 'Fr (02.01.) und Mo (05.01.)',
    laender: ['BW', 'BY', 'ST'],
  },
  {
    anlass: 'Buß- und Bettag',
    feiertag: 'Buß- und Bettag (Mi, 18.11.)',
    urlaubstage: 2,
    freieTage: 5,
    zeitraum: 'Mi, 18.11. – So, 22.11.2026',
    welcheUrlaubstage: 'Do (19.11.) und Fr (20.11.)',
    laender: ['SN'],
  },
];

// Feiertage, die 2026 auf ein Wochenende fallen und damit „verpuffen"
const VERPUFFT: { name: string; datum: string; wochentag: string; laender?: BundeslandCode[] }[] = [
  { name: 'Internationaler Frauentag', datum: '08.03.2026', wochentag: 'Sonntag', laender: ['BE', 'MV'] },
  { name: 'Mariä Himmelfahrt', datum: '15.08.2026', wochentag: 'Samstag', laender: ['SL', 'BY'] },
  { name: 'Weltkindertag', datum: '20.09.2026', wochentag: 'Sonntag', laender: ['TH'] },
  { name: 'Tag der Deutschen Einheit', datum: '03.10.2026', wochentag: 'Samstag' },
  { name: 'Reformationstag', datum: '31.10.2026', wochentag: 'Samstag', laender: ['BB', 'HB', 'HH', 'MV', 'NI', 'SH', 'SN', 'ST', 'TH'] },
  { name: 'Allerheiligen', datum: '01.11.2026', wochentag: 'Sonntag', laender: ['BW', 'BY', 'NW', 'RP', 'SL'] },
  { name: '2. Weihnachtstag', datum: '26.12.2026', wochentag: 'Samstag' },
];

function gehoertZuLand(k: Konstellation, land: BundeslandCode): boolean {
  if (!k.laender) return true; // bundesweit
  return k.laender.includes(land);
}

function hebel(k: Konstellation): number {
  return k.freieTage / k.urlaubstage;
}

export default function BrueckentageRechner() {
  const [bundesland, setBundesland] = useState<BundeslandCode>('NW');

  const aktiv = [...BUNDESWEIT, ...REGIONAL]
    .filter((k) => gehoertZuLand(k, bundesland))
    .sort((a, b) => {
      // zuerst nach freien Tagen, dann nach Hebel
      if (b.freieTage !== a.freieTage) return b.freieTage - a.freieTage;
      return hebel(b) - hebel(a);
    });

  const verpufftImLand = VERPUFFT.filter(
    (v) => !v.laender || v.laender.includes(bundesland)
  );

  const summeUrlaubstage = aktiv.reduce((s, k) => s + k.urlaubstage, 0);
  const summeFreieTage = aktiv.reduce((s, k) => s + k.freieTage, 0);
  const landName = BUNDESLAENDER.find((b) => b.code === bundesland)?.name ?? '';

  return (
    <div className="max-w-lg mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block">
          <span className="text-gray-700 font-medium">Ihr Bundesland</span>
          <select
            value={bundesland}
            onChange={(e) => setBundesland(e.target.value as BundeslandCode)}
            className="mt-2 block w-full rounded-xl border border-gray-300 px-4 py-3 text-lg font-semibold text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
          >
            {BUNDESLAENDER.map((b) => (
              <option key={b.code} value={b.code}>{b.name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2">
            Die Auswahl ist wichtig: Fronleichnam, Heilige Drei Könige und der Buß- und Bettag
            gelten nur in bestimmten Bundesländern.
          </p>
        </label>
      </div>

      {/* Result Summary */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">
          Maximaler Hebel in {landName} (2026)
        </h3>
        <div className="mb-6">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-4xl font-bold">{summeFreieTage}</span>
            <span className="text-xl text-blue-200">freie Tage</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            mit nur <strong>{summeUrlaubstage} Urlaubstagen</strong>, wenn Sie alle empfohlenen
            Brücken nutzen
          </p>
        </div>
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <span className="text-blue-100">Durchschnittlicher Hebel</span>
            <span className="text-xl font-bold">
              {(summeFreieTage / summeUrlaubstage).toLocaleString('de-DE', { maximumFractionDigits: 1 })}×
            </span>
          </div>
          <p className="text-xs text-blue-100 mt-2">
            Aus 1 Urlaubstag werden im Schnitt {(summeFreieTage / summeUrlaubstage).toLocaleString('de-DE', { maximumFractionDigits: 1 })} freie Tage.
          </p>
        </div>
      </div>

      {/* Konstellationen */}
      <div className="mt-6 space-y-4">
        {aktiv.map((k, i) => {
          const h = hebel(k);
          return (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-bold text-gray-800">{k.anlass}</h3>
                  <p className="text-xs text-gray-500">{k.feiertag}</p>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">
                  {h.toLocaleString('de-DE', { maximumFractionDigits: 1 })}× Hebel
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{k.urlaubstage}</p>
                  <p className="text-xs text-blue-700">Urlaubstage</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{k.freieTage}</p>
                  <p className="text-xs text-emerald-700">freie Tage am Stück</p>
                </div>
              </div>

              <div className="space-y-1 text-sm">
                <p className="text-gray-700">
                  <span className="font-medium">Zeitraum:</span> {k.zeitraum}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Urlaub nehmen:</span> {k.welcheUrlaubstage}
                </p>
                {k.laender && (
                  <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1 inline-block mt-1">
                    Gilt nur in: {k.laender.map((c) => BUNDESLAENDER.find((b) => b.code === c)?.name).join(', ')}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Verpuffte Feiertage */}
      {verpufftImLand.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-gray-800 mb-3">😕 Diese Feiertage „verpuffen" 2026</h3>
          <p className="text-sm text-gray-600 mb-3">
            Folgende Feiertage fallen 2026 in {landName} auf ein Wochenende – sie bringen
            also keinen zusätzlichen freien Tag:
          </p>
          <ul className="space-y-2 text-sm">
            {verpufftImLand.map((v, i) => (
              <li key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{v.name}</span>
                <span className="text-gray-500">{v.datum} ({v.wochentag})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert's</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>Ein <strong>Brückentag</strong> ist ein Arbeitstag zwischen einem Feiertag und dem Wochenende</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Der <strong>Hebel-Faktor</strong> zeigt, wie viele freie Tage Sie pro eingesetztem Urlaubstag bekommen</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>2026 ist ein eher schwaches Brückentage-Jahr – mehrere Feiertage fallen aufs Wochenende</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Die <strong>stärksten Hebel</strong> liegen 2026 an Christi Himmelfahrt, Neujahr und Fronleichnam (je 4× Hebel)</span>
          </li>
        </ul>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.bmi.bund.de/DE/themen/verfassung/staatliche-symbole/nationale-feiertage/nationale-feiertage-node.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesministerium des Innern – Gesetzliche Feiertage in Deutschland
          </a>
        </div>
      </div>
    </div>
  );
}
