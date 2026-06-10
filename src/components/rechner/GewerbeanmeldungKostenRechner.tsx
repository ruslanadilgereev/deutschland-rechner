import { useMemo, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Gewerbeanmeldung-Kosten 2026
//
// WICHTIG: Die Gebühr für die Gewerbeanmeldung ist KOMMUNAL geregelt – sie ist
// keine Steuer und kein Prozentsatz, sondern eine Verwaltungsgebühr, die jede
// Gemeinde über ihre Gebührensatzung selbst festlegt. Die hier hinterlegten
// Werte sind Richtwerte (Stand 2026) und können sich – z. B. zwischen Online-
// und Vor-Ort-Anmeldung – unterscheiden.
//
// Formel:  Gesamtkosten = Anmeldegebühr (Stadt) × Anzahl anzeigepflichtiger Personen
//          (bei einer GbR meldet jeder Gesellschafter an → jede Person zahlt die Gebühr)
//
// Quellen: kommunale Gebührensatzungen, z. B.
//   Berlin:  https://service.berlin.de/dienstleistung/121921/
//   Köln:    https://www.stadt-koeln.de/service/produkte/00268/index.html
// ─────────────────────────────────────────────────────────────────────────────

interface Stadt {
  name: string;
  vorOrt: number; // Gebühr bei persönlicher Anmeldung (€)
  online?: number; // ggf. günstigere Online-Gebühr (€)
}

// Richtwerte 2026 – maßgeblich ist die jeweilige Gebührensatzung der Kommune.
const STAEDTE: Stadt[] = [
  { name: 'Berlin', vorOrt: 26, online: 15 },
  { name: 'Hamburg', vorOrt: 20 },
  { name: 'München', vorOrt: 47 },
  { name: 'Köln', vorOrt: 26 },
  { name: 'Frankfurt am Main', vorOrt: 25 },
  { name: 'Düsseldorf', vorOrt: 26, online: 20 },
  { name: 'Stuttgart', vorOrt: 54 },
  { name: 'Leipzig', vorOrt: 20 },
  { name: 'Dresden', vorOrt: 20 },
  { name: 'Hannover', vorOrt: 35 },
  { name: 'Nürnberg', vorOrt: 40 },
  { name: 'Essen', vorOrt: 20 },
  { name: 'Bochum', vorOrt: 20 },
  { name: 'Bonn', vorOrt: 20 },
  { name: 'Münster', vorOrt: 20 },
];

const DURCHSCHNITT = 30; // grober Bundesschnitt als Richtwert (Spanne ~15–65 €)

export default function GewerbeanmeldungKostenRechner() {
  const [stadtName, setStadtName] = useState<string>('Berlin');
  const [eigeneGebuehr, setEigeneGebuehr] = useState<number>(30);
  const [online, setOnline] = useState<boolean>(false);
  const [anzahlPersonen, setAnzahlPersonen] = useState<number>(1);

  const ergebnis = useMemo(() => {
    const istEigeneEingabe = stadtName === '__eigene__';
    const stadt = STAEDTE.find((s) => s.name === stadtName);

    // Gebühr pro Person ermitteln
    let gebuehrProPerson: number;
    let onlineMoeglich = false;

    if (istEigeneEingabe) {
      gebuehrProPerson = Math.max(0, eigeneGebuehr);
    } else if (stadt) {
      onlineMoeglich = typeof stadt.online === 'number';
      gebuehrProPerson = online && stadt.online != null ? stadt.online : stadt.vorOrt;
    } else {
      gebuehrProPerson = DURCHSCHNITT;
    }

    const personen = Math.max(1, anzahlPersonen);
    const gesamt = gebuehrProPerson * personen;

    return {
      istEigeneEingabe,
      stadt,
      onlineMoeglich,
      gebuehrProPerson,
      personen,
      gesamt,
    };
  }, [stadtName, eigeneGebuehr, online, anzahlPersonen]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  return (
    <div className="max-w-2xl mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Stadt */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Stadt / Gemeinde</span>
            <span className="text-xs text-gray-500 block mt-1">
              Richtwerte 2026 – maßgeblich ist die Gebührensatzung Ihrer Kommune
            </span>
          </label>
          <select
            value={stadtName}
            onChange={(e) => {
              const val = e.target.value;
              setStadtName(val);
              setOnline(false);
            }}
            className="w-full text-lg font-medium py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none bg-white"
          >
            {STAEDTE.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name} (ab {formatEuro(s.online ?? s.vorOrt)})
              </option>
            ))}
            <option value="__eigene__">Andere Stadt / eigener Wert …</option>
          </select>

          {/* Eigene Gebühr (Fallback) */}
          {ergebnis.istEigeneEingabe && (
            <div className="mt-4">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium text-sm">
                  Gebühr laut Ihrer Gemeinde
                </span>
                <span className="text-xs text-gray-500 block mt-1">
                  Steht in der Gebührensatzung der Stadt – üblicher Rahmen 15–65 €,
                  Bundesschnitt ca. 30 €
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={eigeneGebuehr}
                  onChange={(e) => setEigeneGebuehr(Math.max(0, Number(e.target.value)))}
                  className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
                  min="0"
                  step="1"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                  €
                </span>
              </div>
            </div>
          )}

          {/* Online-Option, falls Stadt sie anbietet */}
          {!ergebnis.istEigeneEingabe && ergebnis.onlineMoeglich && (
            <label className="flex items-center gap-3 mt-4 p-3 bg-emerald-50 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={online}
                onChange={(e) => setOnline(e.target.checked)}
                className="w-5 h-5 rounded accent-emerald-500"
              />
              <span className="text-sm text-emerald-800">
                Online anmelden (oft günstiger)
                {ergebnis.stadt?.online != null && (
                  <strong> – {formatEuro(ergebnis.stadt.online)} statt {formatEuro(ergebnis.stadt.vorOrt)}</strong>
                )}
              </span>
            </label>
          )}
        </div>

        {/* Anzahl Personen */}
        <div>
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Anzahl anzeigepflichtiger Personen</span>
            <span className="text-xs text-gray-500 block mt-1">
              Bei einer GbR meldet jeder Gesellschafter an – die Gebühr fällt je Person an
            </span>
          </label>
          <div className="mt-2 flex items-center justify-center gap-6">
            <button
              onClick={() => setAnzahlPersonen(Math.max(1, anzahlPersonen - 1))}
              className="w-14 h-14 rounded-full bg-gray-100 text-2xl font-bold text-gray-600 hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-40"
              disabled={anzahlPersonen <= 1}
              aria-label="Person entfernen"
            >
              −
            </button>
            <span className="text-5xl font-bold text-emerald-600 w-16 text-center">
              {anzahlPersonen}
            </span>
            <button
              onClick={() => setAnzahlPersonen(Math.min(20, anzahlPersonen + 1))}
              className="w-14 h-14 rounded-full bg-emerald-500 text-2xl font-bold text-white hover:bg-emerald-600 active:scale-95 transition-all"
              aria-label="Person hinzufügen"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">📝 Kosten der Gewerbeanmeldung</h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.gesamt)}</span>
            <span className="text-xl opacity-80">einmalig</span>
          </div>
          <p className="text-emerald-100 mt-2 text-sm">
            {formatEuro(ergebnis.gebuehrProPerson)} ×{' '}
            {ergebnis.personen === 1
              ? '1 Person'
              : `${ergebnis.personen} Personen`}
            {ergebnis.istEigeneEingabe ? '' : ` in ${stadtName}`}
            {online && ergebnis.onlineMoeglich ? ' (Online-Anmeldung)' : ''}
          </p>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-80">Gebühr pro Person</span>
            <span className="text-xl font-bold">{formatEuro(ergebnis.gebuehrProPerson)}</span>
          </div>
        </div>

        <p className="text-xs text-emerald-100 mt-4">
          ⚠️ Richtwert – maßgeblich ist die Gebührensatzung Ihrer Kommune. Werte können
          schwanken (online vs. persönlich). Schätzung ohne Gewähr, ersetzt keine
          Steuerberatung.
        </p>
      </div>

      {/* Mögliche Zusatzkosten */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">➕ Mögliche Zusatzkosten</h3>
        <p className="text-sm text-gray-600 mb-3">
          Die reine Anmeldegebühr ist nur ein Teil. Je nach Tätigkeit und Rechtsform
          können weitere Kosten anfallen – diese sind nicht Teil der Berechnung oben:
        </p>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Erweitertes Führungszeugnis / Auskunft Gewerbezentralregister:</strong>{' '}
              bei erlaubnispflichtigen Tätigkeiten (z. B. Gastronomie, Handwerk) – jeweils ca. 13 €
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Handwerksrolle / Handwerkskammer:</strong> Eintragung bei zulassungspflichtigem Handwerk
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>IHK-/HWK-Beitrag:</strong> Pflichtmitgliedschaft, im Gründungsjahr oft beitragsfrei
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Handelsregister & Notar:</strong> nur bei GmbH, UG, OHG, KG – nicht beim
              klassischen Kleingewerbe
            </span>
          </li>
        </ul>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Berechnung</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Kommunale Gebühr:</strong> Jede Stadt legt ihre Anmeldegebühr selbst fest – sie
              ist eine Verwaltungsgebühr, keine Steuer und kein Prozentsatz
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Spanne 15–65 €:</strong> Bundesweit liegen die Gebühren grob in diesem Rahmen,
              der Schnitt bei rund 30 €
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Online oft günstiger:</strong> Manche Städte (z. B. Berlin, Düsseldorf) bieten
              die digitale Anmeldung zu einem reduzierten Satz an
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>GbR = mehrere Anmeldungen:</strong> Bei einer Gesellschaft bürgerlichen Rechts
              meldet jeder Gesellschafter an, die Gebühr fällt je Person an
            </span>
          </li>
        </ul>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen &amp; Rechtsgrundlage</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/gewo/__14.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 14 GewO – Anzeigepflicht bei Gewerbebeginn (Gesetze im Internet)
          </a>
          <a
            href="https://service.berlin.de/dienstleistung/121921/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Berlin – Gewerbe anmelden (Gebühren der Stadt Berlin)
          </a>
          <a
            href="https://www.stadt-koeln.de/service/produkte/00268/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Köln – Gewerbemeldung eines Einzelunternehmens
          </a>
          <a
            href="https://www.ihk.de/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            IHK – Informationen zur Gewerbeanmeldung
          </a>
        </div>
      </div>
    </div>
  );
}
