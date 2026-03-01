import { useState, useMemo } from 'react';

// THG-Prämien 2026 (geschätzte Werte basierend auf Marktentwicklung)
// Die Prämien schwanken je nach Anbieter und Marktlage
const THG_PRAEMIEN_2026 = {
  pkw: {
    min: 50,
    max: 90,
    durchschnitt: 70,
    beschreibung: 'Elektro-PKW (M1)',
    co2Einsparung: 2000, // kg CO2 pro Jahr (Schätzwert)
  },
  motorrad: {
    min: 15,
    max: 35,
    durchschnitt: 25,
    beschreibung: 'Elektro-Motorrad/Roller (L1e-L7e)',
    co2Einsparung: 350, // kg CO2 pro Jahr
  },
  transporter: {
    min: 150,
    max: 400,
    durchschnitt: 250,
    beschreibung: 'Leichter E-Nutzfahrzeug (N1)',
    co2Einsparung: 4500, // kg CO2 pro Jahr
  },
  bus: {
    min: 4000,
    max: 10000,
    durchschnitt: 7000,
    beschreibung: 'Elektro-Bus (M2/M3)',
    co2Einsparung: 60000, // kg CO2 pro Jahr
  },
  lkw: {
    min: 8000,
    max: 20000,
    durchschnitt: 14000,
    beschreibung: 'Elektro-LKW (N2/N3)',
    co2Einsparung: 80000, // kg CO2 pro Jahr
  },
};

// Öffentliche Ladepunkte (§7 Abs. 2 38. BImSchV)
const LADEPUNKT_PAUSCHALE = {
  normal: 500, // AC bis 22 kW
  schnell: 2000, // DC über 22 kW
};

type FahrzeugTyp = keyof typeof THG_PRAEMIEN_2026;

interface BerechnungDetails {
  jahresPraemie: { min: number; max: number; durchschnitt: number };
  mehrjahresPraemie: { min: number; max: number; durchschnitt: number };
  co2Einsparung: number;
  co2EinsparungMehrjahre: number;
  fahrzeugTypBeschreibung: string;
  ladepunktPraemie: number;
}

export default function THGQuoteRechner() {
  const [fahrzeugTyp, setFahrzeugTyp] = useState<FahrzeugTyp>('pkw');
  const [anzahlFahrzeuge, setAnzahlFahrzeuge] = useState(1);
  const [haltedauerJahre, setHaltedauerJahre] = useState(3);
  const [hatLadepunkt, setHatLadepunkt] = useState(false);
  const [ladepunktTyp, setLadepunktTyp] = useState<'normal' | 'schnell'>('normal');
  const [anzahlLadepunkte, setAnzahlLadepunkte] = useState(1);

  const ergebnis = useMemo((): BerechnungDetails => {
    const praemien = THG_PRAEMIEN_2026[fahrzeugTyp];
    
    // Jahresprämie (pro Fahrzeug × Anzahl)
    const jahresPraemie = {
      min: praemien.min * anzahlFahrzeuge,
      max: praemien.max * anzahlFahrzeuge,
      durchschnitt: praemien.durchschnitt * anzahlFahrzeuge,
    };
    
    // Mehrjahresprämie
    const mehrjahresPraemie = {
      min: jahresPraemie.min * haltedauerJahre,
      max: jahresPraemie.max * haltedauerJahre,
      durchschnitt: jahresPraemie.durchschnitt * haltedauerJahre,
    };
    
    // CO2-Einsparung
    const co2Einsparung = praemien.co2Einsparung * anzahlFahrzeuge;
    const co2EinsparungMehrjahre = co2Einsparung * haltedauerJahre;
    
    // Ladepunkt-Prämie (falls vorhanden)
    let ladepunktPraemie = 0;
    if (hatLadepunkt) {
      ladepunktPraemie = LADEPUNKT_PAUSCHALE[ladepunktTyp] * anzahlLadepunkte;
    }
    
    return {
      jahresPraemie,
      mehrjahresPraemie,
      co2Einsparung,
      co2EinsparungMehrjahre,
      fahrzeugTypBeschreibung: praemien.beschreibung,
      ladepunktPraemie,
    };
  }, [fahrzeugTyp, anzahlFahrzeuge, haltedauerJahre, hatLadepunkt, ladepunktTyp, anzahlLadepunkte]);

  const formatEuro = (n: number) => 
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  
  const formatKg = (n: number) => 
    n.toLocaleString('de-DE') + ' kg';

  const fahrzeugOptionen: { value: FahrzeugTyp; label: string; icon: string }[] = [
    { value: 'pkw', label: 'E-Auto (PKW)', icon: '🚗' },
    { value: 'motorrad', label: 'E-Motorrad/Roller', icon: '🛵' },
    { value: 'transporter', label: 'E-Transporter (N1)', icon: '🚐' },
    { value: 'bus', label: 'E-Bus (M2/M3)', icon: '🚌' },
    { value: 'lkw', label: 'E-LKW (N2/N3)', icon: '🚛' },
  ];

  const gesamtPraemie = ergebnis.jahresPraemie.durchschnitt + ergebnis.ladepunktPraemie;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Fahrzeugtyp */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Fahrzeugtyp</span>
            <span className="text-xs text-gray-500 block mt-1">
              Wählen Sie Ihr Elektrofahrzeug
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {fahrzeugOptionen.map((option) => (
              <button
                key={option.value}
                onClick={() => setFahrzeugTyp(option.value)}
                className={`py-3 px-3 rounded-xl font-medium transition-all text-sm ${
                  fahrzeugTyp === option.value
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Anzahl Fahrzeuge */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Anzahl Fahrzeuge</span>
            <span className="text-xs text-gray-500 block mt-1">
              Wie viele E-Fahrzeuge möchten Sie anmelden?
            </span>
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAnzahlFahrzeuge(Math.max(1, anzahlFahrzeuge - 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold"
            >
              -
            </button>
            <div className="flex-1 text-center">
              <span className="text-4xl font-bold text-gray-900">{anzahlFahrzeuge}</span>
              <span className="text-gray-500 ml-2">Fahrzeug{anzahlFahrzeuge > 1 ? 'e' : ''}</span>
            </div>
            <button
              onClick={() => setAnzahlFahrzeuge(Math.min(100, anzahlFahrzeuge + 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Haltedauer */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Geplante Haltedauer</span>
            <span className="text-xs text-gray-500 block mt-1">
              Wie lange planen Sie, das Fahrzeug zu halten?
            </span>
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 5, 8, 10].map((jahre) => (
              <button
                key={jahre}
                onClick={() => setHaltedauerJahre(jahre)}
                className={`flex-1 py-2 px-2 rounded-xl font-medium transition-all text-sm ${
                  haltedauerJahre === jahre
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {jahre} {jahre === 1 ? 'Jahr' : 'Jahre'}
              </button>
            ))}
          </div>
        </div>

        {/* Ladepunkt Option */}
        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hatLadepunkt}
              onChange={(e) => setHatLadepunkt(e.target.checked)}
              className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
            />
            <span className="text-gray-700 font-medium">
              Öffentlichen Ladepunkt anmelden
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-8">
            Betreiber öffentlicher Ladepunkte können zusätzliche THG-Prämie erhalten
          </p>
        </div>

        {/* Ladepunkt Details */}
        {hatLadepunkt && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Ladepunkt-Typ
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setLadepunktTyp('normal')}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm ${
                    ladepunktTyp === 'normal'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border'
                  }`}
                >
                  ⚡ AC (bis 22 kW)
                </button>
                <button
                  onClick={() => setLadepunktTyp('schnell')}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm ${
                    ladepunktTyp === 'schnell'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border'
                  }`}
                >
                  ⚡⚡ DC (über 22 kW)
                </button>
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Anzahl Ladepunkte
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setAnzahlLadepunkte(Math.max(1, anzahlLadepunkte - 1))}
                  className="w-10 h-10 rounded-xl bg-white hover:bg-gray-100 border text-lg font-bold"
                >
                  -
                </button>
                <span className="text-2xl font-bold text-gray-900 w-12 text-center">{anzahlLadepunkte}</span>
                <button
                  onClick={() => setAnzahlLadepunkte(Math.min(50, anzahlLadepunkte + 1))}
                  className="w-10 h-10 rounded-xl bg-white hover:bg-gray-100 border text-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <strong>Pauschale:</strong> {formatEuro(LADEPUNKT_PAUSCHALE[ladepunktTyp])} pro Ladepunkt/Jahr
            </div>
          </div>
        )}
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🔌 Ihre THG-Prämie 2026</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">ca. {formatEuro(gesamtPraemie)}</span>
            <span className="text-xl opacity-80">pro Jahr</span>
          </div>
          <p className="text-emerald-100 mt-2 text-sm">
            Spanne: {formatEuro(ergebnis.jahresPraemie.min)} – {formatEuro(ergebnis.jahresPraemie.max)}
            {ergebnis.ladepunktPraemie > 0 && ` + ${formatEuro(ergebnis.ladepunktPraemie)} Ladepunkte`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Über {haltedauerJahre} Jahre</span>
            <div className="text-xl font-bold">
              ca. {formatEuro(ergebnis.mehrjahresPraemie.durchschnitt + (ergebnis.ladepunktPraemie * haltedauerJahre))}
            </div>
            <p className="text-xs text-emerald-100 mt-1">
              {formatEuro(ergebnis.mehrjahresPraemie.min)} – {formatEuro(ergebnis.mehrjahresPraemie.max)}
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">CO₂-Einsparung/Jahr</span>
            <div className="text-xl font-bold">ca. {formatKg(ergebnis.co2Einsparung)}</div>
            <p className="text-xs text-emerald-100 mt-1">
              {formatKg(ergebnis.co2EinsparungMehrjahre)} in {haltedauerJahre} Jahren
            </p>
          </div>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Fahrzeugtyp</span>
            <span className="font-bold text-gray-900">{ergebnis.fahrzeugTypBeschreibung}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Anzahl Fahrzeuge</span>
            <span className="text-gray-900">{anzahlFahrzeuge}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">THG-Prämie pro Fahrzeug (2026)</span>
            <span className="text-gray-900">
              ca. {formatEuro(THG_PRAEMIEN_2026[fahrzeugTyp].durchschnitt)}
            </span>
          </div>
          <div className="flex justify-between py-2 bg-emerald-50 -mx-6 px-6">
            <span className="font-medium text-emerald-700">= Fahrzeug-Prämie/Jahr</span>
            <span className="font-bold text-emerald-900">{formatEuro(ergebnis.jahresPraemie.durchschnitt)}</span>
          </div>
          
          {hatLadepunkt && (
            <>
              <div className="flex justify-between py-2 border-b border-gray-100 pt-4">
                <span className="text-gray-600">Ladepunkte ({ladepunktTyp === 'normal' ? 'AC' : 'DC'})</span>
                <span className="text-gray-900">{anzahlLadepunkte} × {formatEuro(LADEPUNKT_PAUSCHALE[ladepunktTyp])}</span>
              </div>
              <div className="flex justify-between py-2 bg-blue-50 -mx-6 px-6">
                <span className="font-medium text-blue-700">= Ladepunkt-Prämie/Jahr</span>
                <span className="font-bold text-blue-900">{formatEuro(ergebnis.ladepunktPraemie)}</span>
              </div>
            </>
          )}
          
          <div className="flex justify-between py-3 bg-emerald-100 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-emerald-800">Gesamtprämie / Jahr</span>
            <span className="font-bold text-2xl text-emerald-900">{formatEuro(gesamtPraemie)}</span>
          </div>
        </div>
      </div>

      {/* THG-Prämien Übersicht */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📈 THG-Prämien 2026 nach Fahrzeugtyp</h3>
        <p className="text-sm text-gray-600 mb-4">
          Die tatsächliche Prämie variiert je nach Anbieter und Marktentwicklung. 
          Hier die geschätzten Werte für 2026:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2 px-3 rounded-tl-lg">Fahrzeugklasse</th>
                <th className="text-right py-2 px-3">Min</th>
                <th className="text-right py-2 px-3">Ø</th>
                <th className="text-right py-2 px-3 rounded-tr-lg">Max</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(THG_PRAEMIEN_2026).map(([key, val], idx, arr) => (
                <tr key={key} className={idx < arr.length - 1 ? 'border-b border-gray-100' : ''}>
                  <td className={`py-2 px-3 text-gray-600 ${idx === arr.length - 1 ? 'rounded-bl-lg' : ''}`}>
                    {val.beschreibung}
                  </td>
                  <td className="py-2 px-3 text-right text-gray-500">{formatEuro(val.min)}</td>
                  <td className="py-2 px-3 text-right font-medium">{formatEuro(val.durchschnitt)}</td>
                  <td className={`py-2 px-3 text-right text-emerald-600 font-medium ${idx === arr.length - 1 ? 'rounded-br-lg' : ''}`}>
                    {formatEuro(val.max)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Stand: Prognose 2026. Die Prämien können je nach THG-Quotenpreis und Anbieter variieren.
        </p>
      </div>

      {/* So funktioniert die THG-Quote */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die THG-Quote</h3>
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex gap-3">
            <span className="text-emerald-500 font-bold">1.</span>
            <span>
              <strong>Anmeldung:</strong> Registrieren Sie Ihr E-Fahrzeug bei einem THG-Anbieter 
              (z.B. Geld für eAuto, M3E, The Mobility House)
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-500 font-bold">2.</span>
            <span>
              <strong>Zertifizierung:</strong> Der Anbieter bündelt die THG-Quoten und 
              lässt sie vom Umweltbundesamt zertifizieren
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-500 font-bold">3.</span>
            <span>
              <strong>Verkauf:</strong> Die zertifizierten Quoten werden an Mineralölkonzerne 
              verkauft, die damit ihre CO₂-Verpflichtungen erfüllen
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-500 font-bold">4.</span>
            <span>
              <strong>Auszahlung:</strong> Sie erhalten Ihre THG-Prämie – meist innerhalb 
              weniger Wochen nach Zertifizierung
            </span>
          </li>
        </ul>
      </div>

      {/* Voraussetzungen */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-emerald-800 mb-3">✅ Voraussetzungen</h3>
        <ul className="space-y-2 text-sm text-emerald-700">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Reines Elektrofahrzeug</strong> (BEV) – keine Hybride!</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Auf Sie zugelassen</strong> – Halter laut Fahrzeugschein (Zulassungsbescheinigung Teil I)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>In Deutschland zugelassen</strong> – deutsches Kennzeichen</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Fahrzeugklasse M1, N1, L1e-L7e, M2, M3, N2, N3</strong></span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Einmal pro Jahr</strong> – THG-Quote kann nur 1× jährlich verkauft werden</span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Prämie schwankt:</strong> Die THG-Prämie ist vom Marktpreis der THG-Quote 
              abhängig und kann sich ändern
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Anbietervergleich:</strong> Die Prämien unterscheiden sich je nach Anbieter 
              um bis zu 30% – vergleichen lohnt sich!
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Einmal pro Jahr:</strong> Sie können die THG-Quote nur einmal jährlich 
              pro Fahrzeug verkaufen
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Steuerlich relevant:</strong> Die THG-Prämie ist als „sonstige Einkünfte" 
              steuerpflichtig (Freigrenze 256 €/Jahr)
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Plug-in-Hybride ausgeschlossen:</strong> Nur reine Elektrofahrzeuge 
              sind THG-quotenberechtigt
            </span>
          </li>
        </ul>
      </div>

      {/* Anbietervergleich */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏆 Beliebte THG-Anbieter</h3>
        <p className="text-sm text-gray-600 mb-4">
          Vergleichen Sie die Konditionen verschiedener Anbieter:
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-800">Geld für eAuto</p>
              <p className="text-xs text-gray-500">Schnelle Auszahlung, hohe Prämien</p>
            </div>
            <span className="text-emerald-600 font-bold">★★★★★</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-800">The Mobility House</p>
              <p className="text-xs text-gray-500">Tesla-Partner, seriös</p>
            </div>
            <span className="text-emerald-600 font-bold">★★★★★</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-800">M3E / Emobia</p>
              <p className="text-xs text-gray-500">Gute Prämien, einfacher Prozess</p>
            </div>
            <span className="text-emerald-600 font-bold">★★★★☆</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-800">ADAC</p>
              <p className="text-xs text-gray-500">Für ADAC-Mitglieder</p>
            </div>
            <span className="text-emerald-600 font-bold">★★★★☆</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Tipp: Achten Sie auf Fixprämie vs. Flex-Modell und die Auszahlungsdauer.
        </p>
      </div>

      {/* Was ist die THG-Quote? */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🌱 Was ist die THG-Quote?</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            Die <strong>Treibhausgasminderungsquote (THG-Quote)</strong> ist ein Instrument 
            zur Reduzierung von CO₂-Emissionen im Verkehrssektor. Mineralölkonzerne müssen 
            ihre CO₂-Emissionen Jahr für Jahr senken.
          </p>
          <p>
            Als E-Fahrzeug-Halter können Sie Ihre eingesparten Emissionen als THG-Quote 
            verkaufen. Mineralölkonzerne kaufen diese Quoten, um ihre Verpflichtungen zu erfüllen.
          </p>
          <div className="bg-emerald-50 rounded-xl p-4 mt-4">
            <p className="font-medium text-emerald-800">
              📊 THG-Quotenverpflichtung 2026: <strong>10,5%</strong>
            </p>
            <p className="text-xs text-emerald-700 mt-1">
              Steigerung bis 2030 auf 25% geplant
            </p>
          </div>
        </div>
      </div>

      {/* Rechtliche Grundlage */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📜 Rechtliche Grundlage</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            Die THG-Quote basiert auf dem <strong>Bundes-Immissionsschutzgesetz (BImSchG)</strong> 
            und der <strong>38. Bundes-Immissionsschutzverordnung (38. BImSchV)</strong>.
          </p>
          <p>
            Seit 2022 können auch <strong>private E-Fahrzeug-Halter</strong> ihre THG-Quote 
            verkaufen (§5 38. BImSchV).
          </p>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/bimschv_38_2017/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            38. BImSchV – Gesetze im Internet
          </a>
          <a 
            href="https://www.umweltbundesamt.de/themen/klima-energie/erneuerbare-energien/in-fluessigen-o-gasfoermigen-kraftstoffen"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Umweltbundesamt – THG-Quote
          </a>
          <a 
            href="https://www.bmwk.de/Redaktion/DE/Artikel/Energie/thg-quote.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMWK – Treibhausgasminderungsquote
          </a>
          <a 
            href="https://www.adac.de/rund-ums-fahrzeug/elektromobilitaet/kaufen/thg-quote/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            ADAC – THG-Quote für E-Autos
          </a>
        </div>
      </div>
    </div>
  );
}
