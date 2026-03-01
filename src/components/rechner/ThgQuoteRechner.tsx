import { useState, useMemo } from 'react';

// Fahrzeugtypen mit THG-Prämien 2026
type Fahrzeugtyp = 'pkw' | 'motorrad' | 'nutzfahrzeug' | 'bus';

interface Anbieter {
  name: string;
  praemie: number;
  praemieMax: number; // Mit Bonus
  modell: 'garantie' | 'risiko' | 'kombi';
  auszahlung: string;
  neukundenbonus: number;
  link?: string;
}

// Aktuelle THG-Anbieter mit Prämien 2026 (Stand: Januar 2026)
const ANBIETER: Anbieter[] = [
  { name: 'Elektrovorteil', praemie: 275, praemieMax: 305, modell: 'garantie', auszahlung: '2-4 Wochen', neukundenbonus: 30 },
  { name: 'emobility.energy', praemie: 250, praemieMax: 280, modell: 'garantie', auszahlung: '2-6 Wochen', neukundenbonus: 30 },
  { name: 'Geld für eAuto', praemie: 265, praemieMax: 295, modell: 'garantie', auszahlung: '4-6 Wochen', neukundenbonus: 30 },
  { name: 'fairnergy', praemie: 260, praemieMax: 290, modell: 'garantie', auszahlung: '2-4 Wochen', neukundenbonus: 30 },
  { name: 'Carbonify', praemie: 255, praemieMax: 275, modell: 'garantie', auszahlung: '4-8 Wochen', neukundenbonus: 20 },
  { name: 'ADAC', praemie: 230, praemieMax: 230, modell: 'garantie', auszahlung: '4-6 Wochen', neukundenbonus: 0 },
  { name: 'EnBW', praemie: 225, praemieMax: 225, modell: 'garantie', auszahlung: '4-8 Wochen', neukundenbonus: 0 },
  { name: 'E.ON', praemie: 220, praemieMax: 250, modell: 'garantie', auszahlung: '4-8 Wochen', neukundenbonus: 30 },
  { name: 'CHECK24', praemie: 275, praemieMax: 305, modell: 'garantie', auszahlung: '6-10 Wochen', neukundenbonus: 30 },
  { name: 'Verivox', praemie: 280, praemieMax: 330, modell: 'garantie', auszahlung: '4-8 Wochen', neukundenbonus: 50 },
];

// Fahrzeugkategorien und ihre Prämien-Faktoren
const FAHRZEUGTYPEN = {
  pkw: { 
    name: 'E-Auto (Pkw)', 
    emoji: '🚗', 
    faktor: 1.0,
    beschreibung: 'Rein batterieelektrischer Pkw (BEV)',
    hinweis: 'Hybride sind nicht berechtigt',
  },
  motorrad: { 
    name: 'E-Motorrad/Roller', 
    emoji: '🏍️', 
    faktor: 0.5,
    beschreibung: 'E-Motorrad oder E-Roller ab 11 kW (15 PS)',
    hinweis: 'Unter 11 kW nicht mehr berechtigt ab 2024',
  },
  nutzfahrzeug: { 
    name: 'E-Nutzfahrzeug', 
    emoji: '🚐', 
    faktor: 1.5,
    beschreibung: 'Elektrischer Transporter, Lkw bis 12t',
    hinweis: 'Höhere Prämie für größere Fahrzeuge',
  },
  bus: { 
    name: 'E-Bus (>12t)', 
    emoji: '🚌', 
    faktor: 4.0,
    beschreibung: 'Elektrischer Bus über 12 Tonnen',
    hinweis: 'Höchste Prämie für Schwerlastfahrzeuge',
  },
};

// CO2-Einsparung pro Fahrzeugtyp (kg/Jahr)
const CO2_EINSPARUNG = {
  pkw: 1000, // ca. 1 Tonne
  motorrad: 400,
  nutzfahrzeug: 1500,
  bus: 4000,
};

export default function ThgQuoteRechner() {
  const [fahrzeugtyp, setFahrzeugtyp] = useState<Fahrzeugtyp>('pkw');
  const [anzahlFahrzeuge, setAnzahlFahrzeuge] = useState(1);
  const [haltedauer, setHaltedauer] = useState(5); // Jahre
  const [inkludiereBonus, setInkludiereBonus] = useState(true);
  const [sortierung, setSortierung] = useState<'praemie' | 'auszahlung'>('praemie');

  const ergebnis = useMemo(() => {
    const fahrzeugInfo = FAHRZEUGTYPEN[fahrzeugtyp];
    
    // Sortierte Anbieter
    const sortierteAnbieter = [...ANBIETER].sort((a, b) => {
      if (sortierung === 'praemie') {
        const praemieA = inkludiereBonus ? a.praemieMax : a.praemie;
        const praemieB = inkludiereBonus ? b.praemieMax : b.praemie;
        return praemieB - praemieA;
      }
      // Nach Auszahlungsdauer (erste Zahl im String)
      const dauerA = parseInt(a.auszahlung.match(/\d+/)?.[0] || '99');
      const dauerB = parseInt(b.auszahlung.match(/\d+/)?.[0] || '99');
      return dauerA - dauerB;
    });

    const besterAnbieter = sortierteAnbieter[0];
    const basisPraemie = inkludiereBonus ? besterAnbieter.praemieMax : besterAnbieter.praemie;
    const praemieProFahrzeug = Math.round(basisPraemie * fahrzeugInfo.faktor);
    const praemieGesamt = praemieProFahrzeug * anzahlFahrzeuge;
    const praemieHaltedauer = praemieGesamt * haltedauer;

    // Durchschnittsprämie
    const durchschnittsPraemie = Math.round(
      ANBIETER.reduce((sum, a) => sum + (inkludiereBonus ? a.praemieMax : a.praemie), 0) / ANBIETER.length * fahrzeugInfo.faktor
    );

    // CO2-Einsparung
    const co2Einsparung = CO2_EINSPARUNG[fahrzeugtyp] * anzahlFahrzeuge;
    const co2EinsparungHaltedauer = co2Einsparung * haltedauer;

    // Prämienspanne
    const minPraemie = Math.round(Math.min(...ANBIETER.map(a => a.praemie)) * fahrzeugInfo.faktor);
    const maxPraemie = Math.round(Math.max(...ANBIETER.map(a => a.praemieMax)) * fahrzeugInfo.faktor);

    return {
      fahrzeugInfo,
      praemieProFahrzeug,
      praemieGesamt,
      praemieHaltedauer,
      durchschnittsPraemie,
      co2Einsparung,
      co2EinsparungHaltedauer,
      minPraemie,
      maxPraemie,
      sortierteAnbieter,
      besterAnbieter,
    };
  }, [fahrzeugtyp, anzahlFahrzeuge, haltedauer, inkludiereBonus, sortierung]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatNumber = (n: number) => n.toLocaleString('de-DE');

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Fahrzeugtyp */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Fahrzeugtyp</span>
            <span className="text-xs text-gray-500 block mt-1">
              Nur rein elektrische Fahrzeuge sind berechtigt
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(Object.entries(FAHRZEUGTYPEN) as [Fahrzeugtyp, typeof FAHRZEUGTYPEN.pkw][]).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setFahrzeugtyp(key)}
                className={`py-3 px-4 rounded-xl font-medium transition-all text-left ${
                  fahrzeugtyp === key
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{value.emoji}</span>
                  <div>
                    <span className="block text-sm font-semibold">{value.name}</span>
                    <span className={`text-xs ${fahrzeugtyp === key ? 'text-emerald-100' : 'text-gray-500'}`}>
                      {value.hinweis}
                    </span>
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
              Jedes E-Fahrzeug kann einmal pro Jahr die THG-Quote beantragen
            </span>
          </label>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-100 rounded-xl">
              <button
                onClick={() => setAnzahlFahrzeuge(Math.max(1, anzahlFahrzeuge - 1))}
                className="px-4 py-3 text-xl font-bold text-gray-600 hover:bg-gray-200 rounded-l-xl transition-all"
              >
                −
              </button>
              <span className="px-6 py-3 text-xl font-bold text-gray-800">{anzahlFahrzeuge}</span>
              <button
                onClick={() => setAnzahlFahrzeuge(Math.min(50, anzahlFahrzeuge + 1))}
                className="px-4 py-3 text-xl font-bold text-gray-600 hover:bg-gray-200 rounded-r-xl transition-all"
              >
                +
              </button>
            </div>
            <span className="text-gray-500">{anzahlFahrzeuge === 1 ? 'Fahrzeug' : 'Fahrzeuge'}</span>
          </div>
        </div>

        {/* Haltedauer */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Geplante Haltedauer: {haltedauer} Jahre</span>
            <span className="text-xs text-gray-500 block mt-1">
              Prognose der Gesamtprämie über die Haltedauer
            </span>
          </label>
          <input
            type="range"
            value={haltedauer}
            onChange={(e) => setHaltedauer(Number(e.target.value))}
            className="w-full accent-emerald-500"
            min="1"
            max="10"
            step="1"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 Jahr</span>
            <span>5 Jahre</span>
            <span>10 Jahre</span>
          </div>
        </div>

        {/* Bonus einbeziehen */}
        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={inkludiereBonus}
              onChange={(e) => setInkludiereBonus(e.target.checked)}
              className="w-5 h-5 rounded accent-emerald-500"
            />
            <div>
              <span className="text-gray-700 font-medium">Neukundenbonus einbeziehen</span>
              <span className="text-xs text-gray-500 block">
                Einmalig pro Anbieter & Fahrzeug – nicht jedes Jahr
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🔌 Ihre THG-Prämie 2026</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.praemieGesamt)}</span>
            <span className="text-emerald-100">/ Jahr</span>
          </div>
          <p className="text-emerald-100 mt-2 text-sm">
            {ergebnis.fahrzeugInfo.emoji} {anzahlFahrzeuge}× {ergebnis.fahrzeugInfo.name} • 
            Prämie: {formatEuro(ergebnis.minPraemie)} – {formatEuro(ergebnis.maxPraemie)} pro Fahrzeug
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Pro Fahrzeug</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.praemieProFahrzeug)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Über {haltedauer} Jahre</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.praemieHaltedauer)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm col-span-2 sm:col-span-1">
            <span className="text-sm opacity-80">CO₂-Einsparung/Jahr</span>
            <div className="text-xl font-bold">{formatNumber(ergebnis.co2Einsparung)} kg</div>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🏆</span>
            <span className="font-medium">Bester Anbieter: {ergebnis.besterAnbieter.name}</span>
          </div>
          <p className="text-sm text-emerald-100">
            {inkludiereBonus && ergebnis.besterAnbieter.neukundenbonus > 0 
              ? `${formatEuro(ergebnis.besterAnbieter.praemie)} + ${formatEuro(ergebnis.besterAnbieter.neukundenbonus)} Neukundenbonus`
              : `${formatEuro(ergebnis.besterAnbieter.praemie)} garantierte Auszahlung`
            } • Auszahlung in {ergebnis.besterAnbieter.auszahlung}
          </p>
        </div>
      </div>

      {/* Anbietervergleich */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">🏅 THG-Anbieter Vergleich 2026</h3>
          <select
            value={sortierung}
            onChange={(e) => setSortierung(e.target.value as 'praemie' | 'auszahlung')}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1"
          >
            <option value="praemie">Nach Prämie</option>
            <option value="auszahlung">Nach Auszahlung</option>
          </select>
        </div>

        <div className="space-y-3">
          {ergebnis.sortierteAnbieter.slice(0, 5).map((anbieter, index) => {
            const praemie = Math.round(
              (inkludiereBonus ? anbieter.praemieMax : anbieter.praemie) * ergebnis.fahrzeugInfo.faktor
            );
            const istBester = index === 0;

            return (
              <div 
                key={anbieter.name}
                className={`p-4 rounded-xl ${
                  istBester 
                    ? 'bg-emerald-50 border-2 border-emerald-300' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                    </span>
                    <div>
                      <span className={`font-semibold ${istBester ? 'text-emerald-800' : 'text-gray-800'}`}>
                        {anbieter.name}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>⏱️ {anbieter.auszahlung}</span>
                        {anbieter.neukundenbonus > 0 && inkludiereBonus && (
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                            +{formatEuro(anbieter.neukundenbonus)} Bonus
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xl font-bold ${istBester ? 'text-emerald-700' : 'text-gray-800'}`}>
                      {formatEuro(praemie)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Stand: Januar 2026. Preise können sich ändern. Neukundenbonus nur einmal pro Anbieter & Fahrzeug.
          Vergleiche vor Abschluss direkt auf der Anbieterseite.
        </p>
      </div>

      {/* Was ist die THG-Quote? */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">💡 Was ist die THG-Quote?</h3>
        
        <div className="space-y-4 text-sm text-gray-600">
          <p>
            Die <strong>Treibhausgasminderungsquote (THG-Quote)</strong> ist eine staatliche Regelung, 
            die Mineralölkonzerne verpflichtet, CO₂-Emissionen zu reduzieren. Da E-Autos keine direkten 
            Emissionen verursachen, können Sie Ihre <strong>CO₂-Einsparung verkaufen</strong>.
          </p>
          
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <h4 className="font-semibold text-emerald-800 mb-2">So funktioniert's:</h4>
            <ol className="list-decimal list-inside space-y-1 text-emerald-700">
              <li>Sie fahren ein E-Auto und sparen CO₂</li>
              <li>Ein Anbieter beantragt ein Zertifikat beim Umweltbundesamt</li>
              <li>Das Zertifikat wird an Mineralölkonzerne verkauft</li>
              <li>Sie erhalten Ihre THG-Prämie (ca. 50-300€/Jahr)</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Ablauf & Tipps */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 So beantragen Sie die THG-Prämie</h3>
        
        <div className="space-y-4">
          <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
            <span className="text-2xl">📱</span>
            <div>
              <h4 className="font-semibold text-gray-800">1. Anbieter wählen</h4>
              <p className="text-sm text-gray-600">
                Vergleichen Sie Anbieter – achten Sie auf garantierte Auszahlung.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
            <span className="text-2xl">📸</span>
            <div>
              <h4 className="font-semibold text-gray-800">2. Fahrzeugschein hochladen</h4>
              <p className="text-sm text-gray-600">
                Foto von Vorder- und Rückseite des Fahrzeugscheins (Zulassungsbescheinigung Teil I).
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
            <span className="text-2xl">⏳</span>
            <div>
              <h4 className="font-semibold text-gray-800">3. Auf Auszahlung warten</h4>
              <p className="text-sm text-gray-600">
                Das Umweltbundesamt stellt ein Zertifikat aus. Auszahlung in 2-10 Wochen.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
            <span className="text-2xl">🔄</span>
            <div>
              <h4 className="font-semibold text-gray-800">4. Jedes Jahr wiederholen</h4>
              <p className="text-sm text-gray-600">
                Die THG-Prämie können Sie jedes Jahr neu beantragen – Anbieter vergleichen lohnt sich!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Wichtige Fristen */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⏰ Wichtige Fristen 2026</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>📅</span>
            <span><strong>Bis 31. Oktober 2026:</strong> Antrag beim Anbieter stellen</span>
          </li>
          <li className="flex gap-2">
            <span>📄</span>
            <span><strong>Bis 15. November 2026:</strong> Anbieter reicht beim Umweltbundesamt ein</span>
          </li>
          <li className="flex gap-2">
            <span>💡</span>
            <span><strong>Tipp:</strong> Früh beantragen – manche Anbieter stoppen früher</span>
          </li>
        </ul>
      </div>

      {/* Welche Fahrzeuge sind berechtigt? */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🚗 Welche Fahrzeuge sind berechtigt?</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50 rounded-xl">
            <h4 className="font-semibold text-emerald-800 mb-2">✅ Berechtigt</h4>
            <ul className="space-y-1 text-sm text-emerald-700">
              <li>• Rein elektrische Pkw (BEV)</li>
              <li>• E-Motorräder ab 11 kW (15 PS)</li>
              <li>• E-Roller ab 11 kW (15 PS)</li>
              <li>• E-Nutzfahrzeuge & Transporter</li>
              <li>• E-Busse (höhere Prämie)</li>
            </ul>
          </div>
          <div className="p-4 bg-red-50 rounded-xl">
            <h4 className="font-semibold text-red-800 mb-2">❌ Nicht berechtigt</h4>
            <ul className="space-y-1 text-sm text-red-700">
              <li>• Plug-in-Hybride (PHEV)</li>
              <li>• Verbrenner (Benzin/Diesel)</li>
              <li>• E-Bikes / Pedelecs</li>
              <li>• E-Roller unter 11 kW</li>
              <li>• Wasserstoff-Fahrzeuge</li>
            </ul>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          Voraussetzung: Fahrzeug muss auf Sie zugelassen sein (Halter laut Fahrzeugschein).
          Leasing-Fahrzeuge sind berechtigt, wenn Sie als Halter eingetragen sind.
        </p>
      </div>

      {/* Steuerliche Behandlung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Steuerliche Behandlung</h3>
        
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 items-start">
            <span className="text-green-500">✓</span>
            <p>
              <strong>Privatpersonen:</strong> Die THG-Prämie ist steuerfrei! Sie müssen sie 
              nicht in der Steuererklärung angeben.
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-amber-500">!</span>
            <p>
              <strong>Firmenwagen/Betriebsvermögen:</strong> Der Erlös zählt zu den 
              Betriebseinnahmen und unterliegt der Einkommensteuer.
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-blue-500">💡</span>
            <p>
              <strong>Tipp:</strong> Manche Anbieter bieten die Option, die Prämie direkt 
              an Klimaschutzprojekte zu spenden (steuerlich absetzbar mit Spendenquittung).
            </p>
          </div>
        </div>
      </div>

      {/* Entwicklung der THG-Prämie */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📈 Entwicklung der THG-Prämie</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">2022</span>
            <span className="font-semibold text-gray-800">250 – 400 €</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">2023</span>
            <span className="font-semibold text-gray-800">300 – 410 €</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">2024</span>
            <span className="font-semibold text-gray-800">50 – 120 €</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">2025</span>
            <span className="font-semibold text-gray-800">80 – 150 €</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <span className="text-emerald-700 font-medium">2026</span>
            <span className="font-bold text-emerald-700">200 – 330 €</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          Die Prämie schwankt je nach Marktlage. 2024 war ein Tiefpunkt aufgrund von 
          Biokraftstoff-Importen aus China. Ab 2026 strengere Regeln → höhere Prämien.
        </p>
      </div>

      {/* Checkliste */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-blue-800 mb-3">✅ Checkliste: Darauf sollten Sie achten</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex gap-2">
            <span>☑️</span>
            <span><strong>Garantierte Prämie:</strong> Feste Auszahlung statt riskanter Erlösbeteiligung</span>
          </li>
          <li className="flex gap-2">
            <span>☑️</span>
            <span><strong>Nur 1 Jahr:</strong> Verkaufen Sie nur für das aktuelle Jahr, nicht mehrere</span>
          </li>
          <li className="flex gap-2">
            <span>☑️</span>
            <span><strong>Kündigungsfrist:</strong> Prüfen Sie, ob sich der Vertrag automatisch verlängert</span>
          </li>
          <li className="flex gap-2">
            <span>☑️</span>
            <span><strong>Neukundenbonus:</strong> Gibt es nur einmal – nächstes Jahr Anbieter wechseln</span>
          </li>
          <li className="flex gap-2">
            <span>☑️</span>
            <span><strong>Seriöser Anbieter:</strong> Bekannte Anbieter sind sicherer als No-Names</span>
          </li>
        </ul>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Links</h4>
        <div className="space-y-1">
          <a 
            href="https://www.umweltbundesamt.de/themen/verkehr-laerm/emissionsstandards/pkw-leichte-nutzfahrzeuge/treibhausgasquote"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Umweltbundesamt – Treibhausgasquote
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/bimschv_38_2017/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            38. BImSchV – THG-Quote Verordnung
          </a>
          <a 
            href="https://www.finanztip.de/thg-quote/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Finanztip – THG-Quote Ratgeber
          </a>
          <a 
            href="https://www.verivox.de/elektromobilitaet/thg-quote/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Verivox – THG-Prämie Vergleich
          </a>
        </div>
      </div>
    </div>
  );
}
