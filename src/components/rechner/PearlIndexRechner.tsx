import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Pearl-Index = Schwangerschaften pro 100 Frauen pro Jahr.
// Referenzwerte aus den DGGG-Leitlinien, veröffentlicht von pro familia,
// ergänzt um die typische Anwendung (typical use) gemäß BARMER/familienplanung.de (BZgA).
// pi = ideale/methodische Anwendung (perfect use), piTypisch = typische Anwendung (typical use).
// Quellen: pro familia (Pearl-Index), BARMER, BZgA/familienplanung.de – siehe Seite.

type Methode = {
  id: string;
  name: string;
  icon: string;
  pi: string; // ideale Anwendung (Methodensicherheit)
  piTypisch: string; // typische Anwendung (Anwendungssicherheit)
  einfach: number; // gerundeter Mittelwert typische Anwendung für den Klartext
  gruppe: 'hormonell' | 'mechanisch' | 'natuerlich' | 'dauerhaft' | 'keine';
  hinweis?: string;
};

const METHODEN: Methode[] = [
  {
    id: 'implantat',
    name: 'Hormonimplantat (Stäbchen)',
    icon: '💉',
    pi: '0 – 0,08',
    piTypisch: '0 – 0,08',
    einfach: 0,
    gruppe: 'hormonell',
    hinweis: 'Gilt als sicherste reversible Methode – kaum Spielraum für Anwendungsfehler.',
  },
  {
    id: 'hormonspirale',
    name: 'Hormonspirale (IUS)',
    icon: '🌀',
    pi: '0,16',
    piTypisch: '0,16',
    einfach: 0,
    gruppe: 'hormonell',
    hinweis: 'Wirkt mehrere Jahre, unabhängig von der täglichen Anwendung.',
  },
  {
    id: 'kupferspirale',
    name: 'Kupferspirale / Kupferkette',
    icon: '🌀',
    pi: '0,3 – 0,8',
    piTypisch: '0,3 – 0,8',
    einfach: 1,
    gruppe: 'mechanisch',
    hinweis: 'Hormonfrei, wirkt mehrere Jahre, kaum anwendungsabhängig.',
  },
  {
    id: 'pille',
    name: 'Pille (Kombipille)',
    icon: '💊',
    pi: '0,1 – 0,9',
    piTypisch: '0,3 – 7',
    einfach: 7,
    gruppe: 'hormonell',
    hinweis: 'Sehr sicher bei perfekter Einnahme – bei vergessenen Pillen, Durchfall oder Erbrechen sinkt der Schutz deutlich.',
  },
  {
    id: 'spritze',
    name: 'Dreimonatsspritze',
    icon: '💉',
    pi: '0,3 – 0,88',
    piTypisch: '0,3 – 0,88',
    einfach: 1,
    gruppe: 'hormonell',
    hinweis: 'Schutz hängt am rechtzeitigen Spritz-Termin alle drei Monate.',
  },
  {
    id: 'ring',
    name: 'Vaginalring',
    icon: '⭕',
    pi: '0,4 – 0,65',
    piTypisch: '0,4 – 0,65',
    einfach: 1,
    gruppe: 'hormonell',
  },
  {
    id: 'pflaster',
    name: 'Verhütungspflaster',
    icon: '🩹',
    pi: '0,72 – 0,9',
    piTypisch: '0,72 – 0,9',
    einfach: 1,
    gruppe: 'hormonell',
  },
  {
    id: 'minipille',
    name: 'Minipille (Gestagenpille)',
    icon: '💊',
    pi: '0,5 – 3',
    piTypisch: '0,5 – 3',
    einfach: 2,
    gruppe: 'hormonell',
    hinweis: 'Einnahmefenster ist enger als bei der Kombipille – Pünktlichkeit entscheidet.',
  },
  {
    id: 'symptothermal',
    name: 'Symptothermale Methode (NFP)',
    icon: '🌡️',
    pi: '0,4 – 2,3',
    piTypisch: '1,8 – 12',
    einfach: 5,
    gruppe: 'natuerlich',
    hinweis: 'Bei sorgfältiger, geschulter Anwendung sehr sicher – bei Flüchtigkeit deutlich unsicherer.',
  },
  {
    id: 'kondom',
    name: 'Kondom',
    icon: '🛡️',
    pi: '2',
    piTypisch: '2 – 12',
    einfach: 12,
    gruppe: 'mechanisch',
    hinweis: 'Einziges Verhütungsmittel, das auch vor sexuell übertragbaren Infektionen (z. B. HIV) schützt.',
  },
  {
    id: 'diaphragma',
    name: 'Diaphragma (mit Gel)',
    icon: '🔘',
    pi: '1 – 20',
    piTypisch: '1 – 20',
    einfach: 10,
    gruppe: 'mechanisch',
    hinweis: 'Sicherheit hängt stark von korrekter Größe und Anwendung ab.',
  },
  {
    id: 'kalender',
    name: 'Kalendermethode',
    icon: '📅',
    pi: '9',
    piTypisch: '9',
    einfach: 9,
    gruppe: 'natuerlich',
    hinweis: 'Reine Kalenderberechnung gilt als unsicher – moderne NFP-Methoden sind zuverlässiger.',
  },
  {
    id: 'coitus',
    name: 'Coitus interruptus',
    icon: '⏸️',
    pi: '4 – 18',
    piTypisch: '4 – 18',
    einfach: 18,
    gruppe: 'natuerlich',
    hinweis: 'Der „Rückzieher" gilt als eine der unsichersten Methoden.',
  },
  {
    id: 'sterilisation-frau',
    name: 'Sterilisation (Frau)',
    icon: '✂️',
    pi: '0,2 – 0,3',
    piTypisch: '0,2 – 0,3',
    einfach: 0,
    gruppe: 'dauerhaft',
    hinweis: 'Dauerhaft und kaum rückgängig zu machen.',
  },
  {
    id: 'vasektomie',
    name: 'Vasektomie (Mann)',
    icon: '✂️',
    pi: '0,1',
    piTypisch: '0,1',
    einfach: 0,
    gruppe: 'dauerhaft',
    hinweis: 'Dauerhaft; erst nach Kontrolluntersuchung sicher.',
  },
  {
    id: 'keine',
    name: 'Keine Verhütung',
    icon: '🚫',
    pi: '85',
    piTypisch: '85',
    einfach: 85,
    gruppe: 'keine',
    hinweis: 'Statistischer Referenzwert für sexuell aktive Paare ohne jede Verhütung.',
  },
];

const GRUPPEN_LABEL: Record<Methode['gruppe'], string> = {
  hormonell: 'Hormonelle Methoden',
  mechanisch: 'Mechanische / Barriere-Methoden',
  natuerlich: 'Natürliche Methoden',
  dauerhaft: 'Dauerhafte Methoden',
  keine: 'Vergleichswert',
};

function einschaetzung(einfach: number): { label: string; farbe: string } {
  if (einfach <= 1) return { label: 'Sehr sicher', farbe: 'bg-green-100 text-green-800' };
  if (einfach <= 5) return { label: 'Sicher', farbe: 'bg-emerald-100 text-emerald-800' };
  if (einfach <= 12) return { label: 'Eingeschränkt sicher', farbe: 'bg-yellow-100 text-yellow-800' };
  return { label: 'Unsicher', farbe: 'bg-red-100 text-red-800' };
}

export default function PearlIndexRechner() {
  const [methodeId, setMethodeId] = useState('pille');

  const methode = METHODEN.find((m) => m.id === methodeId) ?? METHODEN[0];
  const bewertung = einschaetzung(methode.einfach);

  // Klartext: ca. X von 100 Frauen werden pro Jahr schwanger (typische Anwendung).
  const klartextZahl =
    methode.einfach === 0 ? 'unter 1' : `ca. ${methode.einfach}`;

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Pearl-Index-Rechner" rechnerSlug="pearl-index-rechner" />

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block">
          <span className="text-gray-700 font-medium">Verhütungsmethode wählen</span>
          <select
            value={methodeId}
            onChange={(e) => setMethodeId(e.target.value)}
            className="mt-3 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg text-gray-800 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none"
          >
            {(['hormonell', 'mechanisch', 'natuerlich', 'dauerhaft', 'keine'] as const).map(
              (gruppe) => (
                <optgroup key={gruppe} label={GRUPPEN_LABEL[gruppe]}>
                  {METHODEN.filter((m) => m.gruppe === gruppe).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.icon} {m.name}
                    </option>
                  ))}
                </optgroup>
              ),
            )}
          </select>
        </label>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium text-pink-100">
            {methode.icon} {methode.name}
          </h3>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${bewertung.farbe}`}>
            {bewertung.label}
          </span>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{methode.piTypisch}</span>
            <span className="text-lg text-pink-200">Pearl-Index (typische Anwendung)</span>
          </div>
          <p className="text-pink-100 text-sm mt-2">
            Bedeutet: Von 100 Frauen werden mit dieser Methode <strong>{klartextZahl} pro Jahr</strong>{' '}
            ungewollt schwanger.
          </p>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-pink-100 text-sm">Ideale Anwendung (Methodensicherheit)</span>
            <span className="font-bold">{methode.pi}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-pink-100 text-sm">Typische Anwendung (Anwendung im Alltag)</span>
            <span className="font-bold">{methode.piTypisch}</span>
          </div>
        </div>

        {methode.hinweis && (
          <p className="text-pink-100 text-sm mt-4 flex gap-2">
            <span aria-hidden="true">💡</span>
            <span>{methode.hinweis}</span>
          </p>
        )}
      </div>

      {/* YMYL-Disclaimer */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex gap-3">
          <span className="text-xl" aria-hidden="true">⚕️</span>
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">Kein Ersatz für ärztliche Beratung</p>
            <p>
              Dieser Rechner liefert statistische Orientierungswerte und ersetzt{' '}
              <strong>keine ärztliche oder gynäkologische Beratung</strong>. Welche Verhütung für Sie
              persönlich passt, hängt von Gesundheit, Lebensphase und Verträglichkeit ab. Sprechen Sie
              vor der Wahl oder dem Wechsel einer Methode mit Ihrer Frauenärztin oder Ihrem Frauenarzt.
            </p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So lesen Sie den Pearl-Index</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span aria-hidden="true">✓</span>
            <span>
              Der Pearl-Index zählt <strong>Schwangerschaften pro 100 Frauen pro Jahr</strong> – je
              niedriger der Wert, desto sicherer die Methode.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true">✓</span>
            <span>
              <strong>Methodensicherheit</strong> (ideale Anwendung) gilt nur bei fehlerfreier
              Nutzung – im Labor sozusagen.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true">✓</span>
            <span>
              <strong>Anwendungssicherheit</strong> (typische Anwendung) berücksichtigt
              Alltagsfehler – das ist der realistischere Wert.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true">✓</span>
            <span>
              Die Werte stammen aus den Leitlinien der DGGG und werden von pro familia und der BZgA
              herausgegeben.
            </span>
          </li>
        </ul>
      </div>

      {/* Komplett-Tabelle */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">📊 Alle Methoden im Überblick</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="py-2 pr-2 font-medium">Methode</th>
                <th className="py-2 px-2 font-medium">Ideal</th>
                <th className="py-2 pl-2 font-medium">Typisch</th>
              </tr>
            </thead>
            <tbody>
              {METHODEN.map((m) => (
                <tr
                  key={m.id}
                  className={`border-b border-gray-100 ${m.id === methodeId ? 'bg-pink-50 font-medium' : ''}`}
                >
                  <td className="py-2 pr-2 text-gray-700">
                    {m.icon} {m.name}
                  </td>
                  <td className="py-2 px-2 text-gray-600 whitespace-nowrap">{m.pi}</td>
                  <td className="py-2 pl-2 text-gray-600 whitespace-nowrap">{m.piTypisch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Werte als Pearl-Index (Schwangerschaften pro 100 Frauen pro Jahr). Literaturangaben
          schwanken je nach Studie und Anwendungssicherheit.
        </p>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.profamilia.de/themen/verhuetung/pearl-index"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-pink-600 hover:underline"
          >
            pro familia – Pearl-Index (Referenzwerte)
          </a>
          <a
            href="https://www.familienplanung.de/service/lexikon/pearl-index/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-pink-600 hover:underline"
          >
            BZgA / familienplanung.de – Pearl-Index
          </a>
          <a
            href="https://www.barmer.de/gesundheit-verstehen/familie/sexualitaet/pearl-index-1261484"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-pink-600 hover:underline"
          >
            BARMER – Sicherheit von Verhütungsmitteln
          </a>
        </div>
      </div>
    </div>
  );
}
