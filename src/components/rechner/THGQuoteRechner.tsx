import { useState, useMemo } from 'react';

// Fahrzeugklassen mit THG-Quote-Faktoren
// Die THG-Quote basiert auf der pauschalen Strommenge, die dem Fahrzeug zugerechnet wird
// PKW (M1): 2.000 kWh/Jahr, Motorrad (L3e-L7e): ~600 kWh, leichte Nutzfahrzeuge (N1): 3.000 kWh

type Fahrzeugklasse = 'pkw-m1' | 'motorrad' | 'nutzfahrzeug-n1';

interface THGQuoteErgebnis {
  minPraemie: number;
  maxPraemie: number;
  durchschnittsPraemie: number;
  pauschaleStrommenge: number; // kWh
  co2Einsparung: number; // kg
  fahrzeugklasseName: string;
  hinweis: string;
}

// THG-Quoten-Preise schwanken stark je nach Markt und Anbieter
// 2024/2025: ca. 50-85€ für PKW, 2026: voraussichtlich 50-250€
// Wir verwenden realistische Marktschätzungen
const THG_PRAEMIEN_2026: Record<Fahrzeugklasse, { min: number; max: number; strom: number }> = {
  'pkw-m1': { min: 50, max: 250, strom: 2000 },
  'motorrad': { min: 15, max: 75, strom: 600 },
  'nutzfahrzeug-n1': { min: 75, max: 350, strom: 3000 },
};

// CO2-Faktor: ca. 0,4 kg CO2 pro kWh (Strommix) vs. fossiler Kraftstoff
const CO2_FAKTOR_KG_PRO_KWH = 0.4;

const FAHRZEUGKLASSEN_INFO: Record<Fahrzeugklasse, { name: string; beschreibung: string; icon: string }> = {
  'pkw-m1': {
    name: 'PKW (Klasse M1)',
    beschreibung: 'Elektrische Personenkraftwagen bis 8 Sitzplätze',
    icon: '🚗',
  },
  'motorrad': {
    name: 'Elektromotorrad',
    beschreibung: 'E-Motorräder, E-Roller (Klasse L3e-L7e)',
    icon: '🏍️',
  },
  'nutzfahrzeug-n1': {
    name: 'Leichtes Nutzfahrzeug (N1)',
    beschreibung: 'E-Transporter bis 3,5t zGG',
    icon: '🚐',
  },
};

export default function THGQuoteRechner() {
  const [fahrzeugklasse, setFahrzeugklasse] = useState<Fahrzeugklasse>('pkw-m1');
  const [anzahlFahrzeuge, setAnzahlFahrzeuge] = useState(1);

  const ergebnis = useMemo((): THGQuoteErgebnis => {
    const praemienInfo = THG_PRAEMIEN_2026[fahrzeugklasse];
    const klassenInfo = FAHRZEUGKLASSEN_INFO[fahrzeugklasse];
    
    const minPraemie = praemienInfo.min * anzahlFahrzeuge;
    const maxPraemie = praemienInfo.max * anzahlFahrzeuge;
    const durchschnittsPraemie = Math.round((minPraemie + maxPraemie) / 2);
    const pauschaleStrommenge = praemienInfo.strom * anzahlFahrzeuge;
    const co2Einsparung = Math.round(pauschaleStrommenge * CO2_FAKTOR_KG_PRO_KWH);
    
    let hinweis = '';
    if (fahrzeugklasse === 'pkw-m1') {
      hinweis = 'Tipp: Vergleichen Sie mehrere THG-Anbieter – die Prämien können stark variieren!';
    } else if (fahrzeugklasse === 'motorrad') {
      hinweis = 'Hinweis: E-Motorräder erhalten eine geringere Prämie aufgrund der niedrigeren pauschalen Strommenge.';
    } else {
      hinweis = 'Für Flotten mit mehreren Fahrzeugen bieten einige Anbieter Mengenrabatte oder höhere Prämien.';
    }
    
    return {
      minPraemie,
      maxPraemie,
      durchschnittsPraemie,
      pauschaleStrommenge,
      co2Einsparung,
      fahrzeugklasseName: klassenInfo.name,
      hinweis,
    };
  }, [fahrzeugklasse, anzahlFahrzeuge]);

  const formatEuro = (n: number) => 
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Fahrzeugklasse */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Fahrzeugtyp</span>
            <span className="text-xs text-gray-500 block mt-1">
              Wählen Sie Ihren Elektrofahrzeugtyp
            </span>
          </label>
          <div className="grid gap-3">
            {(Object.entries(FAHRZEUGKLASSEN_INFO) as [Fahrzeugklasse, typeof FAHRZEUGKLASSEN_INFO[Fahrzeugklasse]][]).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setFahrzeugklasse(key)}
                className={`p-4 rounded-xl font-medium transition-all text-left border-2 ${
                  fahrzeugklasse === key
                    ? 'bg-orange-50 border-orange-500 text-orange-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{info.icon}</span>
                  <div>
                    <div className="font-semibold">{info.name}</div>
                    <div className="text-xs text-gray-500">{info.beschreibung}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Anzahl Fahrzeuge */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Anzahl Fahrzeuge</span>
            <span className="text-xs text-gray-500 block mt-1">
              Für Flotten: Wie viele E-Fahrzeuge haben Sie?
            </span>
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAnzahlFahrzeuge(Math.max(1, anzahlFahrzeuge - 1))}
              className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xl transition-colors"
            >
              −
            </button>
            <input
              type="number"
              value={anzahlFahrzeuge}
              onChange={(e) => setAnzahlFahrzeuge(Math.max(1, Math.min(100, Number(e.target.value))))}
              className="w-24 text-3xl font-bold text-center py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="1"
              max="100"
            />
            <button
              onClick={() => setAnzahlFahrzeuge(Math.min(100, anzahlFahrzeuge + 1))}
              className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xl transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <div className="text-center mb-6">
          <div className="text-green-100 text-sm font-medium mb-1">Geschätzte THG-Prämie 2026</div>
          <div className="text-4xl sm:text-5xl font-bold mb-2">
            {formatEuro(ergebnis.minPraemie)} – {formatEuro(ergebnis.maxPraemie)}
          </div>
          <div className="text-green-100 text-sm">
            Durchschnitt: ca. {formatEuro(ergebnis.durchschnittsPraemie)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-green-100 text-xs font-medium mb-1">Pauschale Strommenge</div>
            <div className="text-xl font-bold">{ergebnis.pauschaleStrommenge.toLocaleString('de-DE')} kWh</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-green-100 text-xs font-medium mb-1">CO₂-Einsparung</div>
            <div className="text-xl font-bold">{ergebnis.co2Einsparung.toLocaleString('de-DE')} kg</div>
          </div>
        </div>

        {anzahlFahrzeuge > 1 && (
          <div className="bg-white/10 rounded-xl p-3 text-center text-sm">
            <span className="text-green-100">Prämie pro Fahrzeug:</span>{' '}
            <span className="font-semibold">
              {formatEuro(THG_PRAEMIEN_2026[fahrzeugklasse].min)} – {formatEuro(THG_PRAEMIEN_2026[fahrzeugklasse].max)}
            </span>
          </div>
        )}
      </div>

      {/* Anbietervergleich Hinweis */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-bold text-amber-800 mb-1">Wichtig: Anbietervergleich lohnt sich!</h3>
            <p className="text-amber-700 text-sm">
              Die THG-Prämien variieren stark zwischen verschiedenen Anbietern. Manche zahlen Fixbeträge, 
              andere garantieren einen Mindestpreis oder bieten Prämien-Garantien. Vergleichen Sie vor 
              der Anmeldung mehrere Anbieter!
            </p>
          </div>
        </div>
      </div>

      {/* Hinweis zur Fahrzeugklasse */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-bold text-blue-800 mb-1">{ergebnis.fahrzeugklasseName}</h3>
            <p className="text-blue-700 text-sm">{ergebnis.hinweis}</p>
          </div>
        </div>
      </div>

      {/* So funktioniert's */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>📋</span> So funktioniert die THG-Quote
        </h3>
        <div className="space-y-4 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
            <div>
              <div className="font-semibold text-gray-700">Fahrzeug registrieren</div>
              <div>Melden Sie Ihr E-Fahrzeug bei einem THG-Quoten-Anbieter an. Sie benötigen die Zulassungsbescheinigung Teil I.</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
            <div>
              <div className="font-semibold text-gray-700">Zertifizierung durch UBA</div>
              <div>Der Anbieter lässt Ihre THG-Quote beim Umweltbundesamt zertifizieren (ca. 8-12 Wochen).</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
            <div>
              <div className="font-semibold text-gray-700">Prämie erhalten</div>
              <div>Nach erfolgreicher Zertifizierung wird Ihnen die Prämie ausgezahlt – je nach Anbieter sofort oder nach Verkauf der Quote.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Voraussetzungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>✅</span> Voraussetzungen für die THG-Prämie
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Vollelektrisches Fahrzeug (BEV) – keine Hybride</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Fahrzeug in Deutschland zugelassen (deutsche Zulassungsbescheinigung)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Sie sind der Fahrzeughalter (Privatperson oder Unternehmen)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Fahrzeug war im Quotenjahr mindestens einen Tag zugelassen</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Quote wurde noch nicht für das aktuelle Jahr beantragt</span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-100 rounded-xl p-4 text-xs text-gray-500 text-center">
        <p>
          Die angegebenen Prämien sind Schätzungen für 2026 basierend auf aktuellen Marktdaten. 
          Die tatsächlichen Beträge hängen vom jeweiligen Anbieter und der Marktentwicklung ab. 
          Dieser Rechner dient nur zur Orientierung und ersetzt keine individuelle Beratung.
        </p>
      </div>
    </div>
  );
}
