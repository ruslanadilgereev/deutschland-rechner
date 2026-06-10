import { useState } from 'react';

// Renteneintrittsalter / Regelaltersgrenze (Stand 2026)
// Quelle: §235 SGB VI (Regelaltersrente), §236b SGB VI (besonders langjährig Versicherte)
// Deutsche Rentenversicherung
//
// Regelaltersgrenze (§235 SGB VI):
//   - bis 1946: 65 Jahre
//   - 1947–1958: +1 Monat pro Jahrgang (65 J 1 M ... 66 J 0 M)
//   - 1959–1963: +2 Monate pro Jahrgang (66 J 2 M ... 66 J 10 M)
//   - ab 1964: 67 Jahre
//
// Besonders langjährig Versicherte / 45 Jahre (§236b SGB VI):
//   - bis 1952: 63 Jahre
//   - 1953–1963: +2 Monate pro Jahrgang (63 J 2 M ... 64 J 10 M)
//   - ab 1964: 65 Jahre

// Liefert die Regelaltersgrenze in Monaten für ein Geburtsjahr.
function regelaltersgrenzeMonate(jahr: number): number {
  if (jahr <= 1946) return 65 * 12; // 780
  if (jahr >= 1964) return 67 * 12; // 804
  if (jahr <= 1958) {
    // 1947 -> 65 J 1 M, ... 1958 -> 66 J 0 M
    return 65 * 12 + (jahr - 1946);
  }
  // 1959–1963: ab 66 J 0 M je +2 Monate
  return 66 * 12 + (jahr - 1958) * 2;
}

// Liefert die abschlagsfreie Altersgrenze für besonders langjährig Versicherte (45 Jahre) in Monaten.
function langjaehrigMonate(jahr: number): number {
  if (jahr <= 1952) return 63 * 12; // 756
  if (jahr >= 1964) return 65 * 12; // 780
  // 1953–1963: ab 63 J 0 M je +2 Monate
  return 63 * 12 + (jahr - 1952) * 2;
}

function formatJahreMonate(monate: number): string {
  const jahre = Math.floor(monate / 12);
  const rest = monate % 12;
  if (rest === 0) return `${jahre} Jahre`;
  return `${jahre} Jahre, ${rest} ${rest === 1 ? 'Monat' : 'Monate'}`;
}

const HEUTE = new Date();
const AKTUELLES_JAHR = HEUTE.getFullYear();
const MIN_JAHR = 1940;
const MAX_JAHR = 2010;

const MONATSNAMEN = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

export default function RenteneintrittsalterRechner() {
  const [geburtsjahr, setGeburtsjahr] = useState(1965);
  const [geburtsmonat, setGeburtsmonat] = useState(1); // 1–12
  const [langjaehrig45, setLangjaehrig45] = useState(false);

  const ragMonate = regelaltersgrenzeMonate(geburtsjahr);

  // Geburtsdatum (1. des Monats) als Referenz
  const geburtJahr = geburtsjahr;
  const geburtMonatIndex = geburtsmonat - 1; // 0-basiert

  // Erreichen der Regelaltersgrenze: Geburtsdatum + Altersgrenze (in Monaten)
  const ragGesamtMonate = geburtJahr * 12 + geburtMonatIndex + ragMonate;
  const ragJahr = Math.floor(ragGesamtMonate / 12);
  const ragMonatIndex = ragGesamtMonate % 12;

  // Abschlagsfrei für besonders langjährig Versicherte (45 Jahre)
  const lvMonate = langjaehrigMonate(geburtsjahr);
  const lvGesamtMonate = geburtJahr * 12 + geburtMonatIndex + lvMonate;
  const lvJahr = Math.floor(lvGesamtMonate / 12);
  const lvMonatIndex = lvGesamtMonate % 12;

  // Vorzeitiger Bezug der Altersrente für langjährig Versicherte (35 Jahre) ab 63:
  // max. Abschlag bis zur Regelaltersgrenze, 0,3 % pro Monat.
  // Frühestmöglicher Beginn (mit Abschlag) ab 63. Geburtstag.
  const fruehMonate = 63 * 12;
  const fruehGesamtMonate = geburtJahr * 12 + geburtMonatIndex + fruehMonate;
  const fruehJahr = Math.floor(fruehGesamtMonate / 12);
  const fruehMonatIndex = fruehGesamtMonate % 12;
  // Anzahl Monate vom frühesten Bezug (63) bis Regelaltersgrenze
  const abschlagMonateAnzahl = Math.max(0, ragMonate - fruehMonate);
  const maxAbschlagProzent = abschlagMonateAnzahl * 0.3;

  const istVergangen = ragJahr < AKTUELLES_JAHR || (ragJahr === AKTUELLES_JAHR && ragMonatIndex < HEUTE.getMonth());

  return (
    <div className="max-w-lg mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block mb-5">
          <span className="text-gray-700 font-medium">Geburtsjahr</span>
          <input
            type="number"
            min={MIN_JAHR}
            max={MAX_JAHR}
            value={geburtsjahr}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!Number.isNaN(v)) {
                setGeburtsjahr(Math.min(MAX_JAHR, Math.max(MIN_JAHR, v)));
              }
            }}
            className="mt-2 block w-full rounded-xl border border-gray-300 px-4 py-3 text-lg font-semibold text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            inputMode="numeric"
          />
        </label>

        <label className="block mb-5">
          <span className="text-gray-700 font-medium">Geburtsmonat</span>
          <select
            value={geburtsmonat}
            onChange={(e) => setGeburtsmonat(parseInt(e.target.value, 10))}
            className="mt-2 block w-full rounded-xl border border-gray-300 px-4 py-3 text-lg font-semibold text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
          >
            {MONATSNAMEN.map((name, i) => (
              <option key={i} value={i + 1}>{name}</option>
            ))}
          </select>
        </label>

        <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl">
          <input
            type="checkbox"
            checked={langjaehrig45}
            onChange={(e) => setLangjaehrig45(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            <strong>Ich habe (voraussichtlich) 45 Versicherungsjahre.</strong>{' '}
            Dann kann ich als „besonders langjährig Versicherter“ abschlagsfrei früher in Rente.
          </span>
        </label>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Ihre Regelaltersgrenze</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-4xl font-bold">{formatJahreMonate(ragMonate)}</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            abschlagsfreie Regelaltersrente (§235 SGB VI)
          </p>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-3">
          <div className="flex justify-between items-center gap-3">
            <span className="text-blue-100">Renteneintritt frühestens ab</span>
            <span className="text-lg font-bold text-right">
              {MONATSNAMEN[ragMonatIndex]} {ragJahr}
            </span>
          </div>
          {istVergangen && (
            <p className="text-xs text-blue-100">
              Dieser Zeitpunkt liegt bereits in der Vergangenheit.
            </p>
          )}
        </div>

        {langjaehrig45 && (
          <div className="mt-4 bg-emerald-400/20 border border-emerald-200/40 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center gap-3 mb-1">
              <span className="text-emerald-50 font-medium">Mit 45 Versicherungsjahren</span>
              <span className="text-lg font-bold text-right">{formatJahreMonate(lvMonate)}</span>
            </div>
            <p className="text-sm text-emerald-50">
              Abschlagsfrei ab <strong>{MONATSNAMEN[lvMonatIndex]} {lvJahr}</strong> –
              das sind <strong>{formatJahreMonate(ragMonate - lvMonate)}</strong> früher als die Regelaltersgrenze, ohne Abschlag.
            </p>
          </div>
        )}
      </div>

      {/* Vorzeitiger Bezug */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">⏩ Früher in Rente – mit Abschlag</h3>
        <p className="text-sm text-gray-600 mb-3">
          Mit mindestens <strong>35 Versicherungsjahren</strong> (Altersrente für langjährig Versicherte)
          können Sie ab <strong>63 Jahren</strong> in Rente – allerdings mit einem dauerhaften Abschlag von
          <strong> 0,3 % pro Monat</strong>, den Sie früher in Rente gehen.
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-600">Frühester Beginn (ab 63)</span>
            <span className="font-semibold text-gray-800">{MONATSNAMEN[fruehMonatIndex]} {fruehJahr}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
            <span className="text-orange-800">Maximaler Abschlag (63 → Regelalter)</span>
            <span className="font-bold text-orange-800">
              −{maxAbschlagProzent.toLocaleString('de-DE', { maximumFractionDigits: 1 })} %
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Hinweis: Der gesetzliche Abschlag ist auf höchstens 14,4 % begrenzt (48 Monate × 0,3 %).
          Der genaue Abschlag hängt vom tatsächlichen Rentenbeginn ab.
        </p>
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert's</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>Ab Jahrgang <strong>1964</strong> gilt die Regelaltersgrenze von <strong>67 Jahren</strong></span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Jahrgänge <strong>1947–1963</strong> liegen stufenweise zwischen 65 und 67 Jahren</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>45 Versicherungsjahre</strong> = abschlagsfrei bis zu 2 Jahre früher (§236b SGB VI)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Mit <strong>35 Jahren</strong> ab 63 möglich – aber mit 0,3 % Abschlag pro Monat</span>
          </li>
        </ul>
      </div>

      {/* Hinweis */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Wichtige Hinweise</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium text-yellow-800">Rente wird nicht automatisch gezahlt</p>
              <p className="text-yellow-700">Sie müssen den Rentenantrag bei der Deutschen Rentenversicherung stellen – idealerweise rund 3 Monate vor dem gewünschten Rentenbeginn.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">📄</span>
            <div>
              <p className="font-medium text-blue-800">45 Jahre sauber prüfen</p>
              <p className="text-blue-700">Zur 45-Jahre-Wartezeit zählen u. a. Pflichtbeiträge aus Beschäftigung und Kindererziehungszeiten – aber keine Anrechnungszeiten wie Schule oder Studium. Ihre Rentenauskunft zeigt den exakten Stand.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Zuständige Behörde */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Stelle</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="font-semibold text-blue-900">Deutsche Rentenversicherung</p>
            <p className="text-sm text-blue-700 mt-1">Zuständig für Rentenauskunft, Kontenklärung und Rentenantrag</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">📞</span>
            <div>
              <p className="font-medium text-gray-800">Servicetelefon</p>
              <a href="tel:08001000480" className="text-blue-600 hover:underline font-mono">0800 1000 4800</a>
              <p className="text-xs text-gray-500 mt-1">Kostenfrei · Mo–Do 7:30–19:30 Uhr, Fr 7:30–15:30 Uhr</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">🌐</span>
            <div>
              <p className="font-medium text-gray-800">Online-Dienste &amp; Rentenantrag</p>
              <a
                href="https://www.deutsche-rentenversicherung.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                deutsche-rentenversicherung.de →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/sgb_6/__235.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            §235 SGB VI – Regelaltersrente (gesetze-im-internet.de)
          </a>
          <a
            href="https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Allgemeine-Informationen/Rentenarten-und-Leistungen/Altersrente-fuer-langjaehrig-Versicherte/altersrente-fuer-langjaehrig-versicherte_node.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsche Rentenversicherung – Renten für (besonders) langjährig Versicherte
          </a>
        </div>
      </div>
    </div>
  );
}
