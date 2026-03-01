import { useState, useMemo } from 'react';

interface RestwertErgebnis {
  restwert: number;
  wertverlust: number;
  wertverlustProzent: number;
  jahresAbschreibung: number[];
  wertverlustProMonat: number;
  wertProKm: number;
  effektiverWertverlustProzent: number;
}

interface FahrzeugTyp {
  name: string;
  icon: string;
  faktorErstesJahr: number;
  faktorFolgejahre: number;
  kmFaktor: number;
  beschreibung: string;
}

const fahrzeugTypen: FahrzeugTyp[] = [
  { name: 'Kleinwagen', icon: '🚗', faktorErstesJahr: 0.20, faktorFolgejahre: 0.08, kmFaktor: 0.03, beschreibung: 'z.B. VW Polo, Opel Corsa' },
  { name: 'Kompaktwagen', icon: '🚙', faktorErstesJahr: 0.22, faktorFolgejahre: 0.09, kmFaktor: 0.035, beschreibung: 'z.B. VW Golf, BMW 1er' },
  { name: 'Mittelklasse', icon: '🚘', faktorErstesJahr: 0.24, faktorFolgejahre: 0.10, kmFaktor: 0.04, beschreibung: 'z.B. BMW 3er, Audi A4' },
  { name: 'Oberklasse', icon: '🚕', faktorErstesJahr: 0.28, faktorFolgejahre: 0.12, kmFaktor: 0.05, beschreibung: 'z.B. BMW 5er, Mercedes E-Klasse' },
  { name: 'Luxusklasse', icon: '🏎️', faktorErstesJahr: 0.32, faktorFolgejahre: 0.14, kmFaktor: 0.06, beschreibung: 'z.B. BMW 7er, Mercedes S-Klasse' },
  { name: 'SUV', icon: '🚐', faktorErstesJahr: 0.22, faktorFolgejahre: 0.09, kmFaktor: 0.04, beschreibung: 'z.B. VW Tiguan, BMW X3' },
  { name: 'Elektroauto', icon: '🔋', faktorErstesJahr: 0.26, faktorFolgejahre: 0.11, kmFaktor: 0.025, beschreibung: 'z.B. Tesla, VW ID.3/ID.4' },
  { name: 'Sportwagen', icon: '🏁', faktorErstesJahr: 0.18, faktorFolgejahre: 0.08, kmFaktor: 0.05, beschreibung: 'z.B. Porsche 911, BMW M' },
  { name: 'Transporter', icon: '🚚', faktorErstesJahr: 0.18, faktorFolgejahre: 0.07, kmFaktor: 0.025, beschreibung: 'z.B. VW Transporter, Mercedes Vito' },
];

export default function RestwertRechner() {
  const [neupreis, setNeupreis] = useState(35000);
  const [alter, setAlter] = useState(3);
  const [alterMonate, setAlterMonate] = useState(0);
  const [kilometerstand, setKilometerstand] = useState(45000);
  const [fahrzeugTypIndex, setFahrzeugTypIndex] = useState(1);
  const [zustand, setZustand] = useState<'sehr-gut' | 'gut' | 'normal' | 'maengel'>('gut');
  const [sonderausstattung, setSonderausstattung] = useState(3000);

  const fahrzeugTyp = fahrzeugTypen[fahrzeugTypIndex];

  // Durchschnittliche km pro Jahr (für Vergleich)
  const durchschnittsKmProJahr = 12000;

  const ergebnis = useMemo((): RestwertErgebnis => {
    const gesamtAlterJahre = alter + alterMonate / 12;
    
    // 1. Degressive Abschreibung nach Jahren
    let zeitwert = neupreis;
    const jahresAbschreibung: number[] = [];
    
    // Erstes Jahr: höherer Wertverlust
    if (gesamtAlterJahre >= 1) {
      const verlustErstesJahr = neupreis * fahrzeugTyp.faktorErstesJahr;
      zeitwert -= verlustErstesJahr;
      jahresAbschreibung.push(verlustErstesJahr);
    } else if (gesamtAlterJahre > 0) {
      // Anteilig für erstes Jahr
      const verlust = neupreis * fahrzeugTyp.faktorErstesJahr * gesamtAlterJahre;
      zeitwert -= verlust;
      jahresAbschreibung.push(verlust);
    }
    
    // Folgejahre: degressive Abschreibung
    for (let jahr = 2; jahr <= Math.floor(gesamtAlterJahre); jahr++) {
      const verlust = zeitwert * fahrzeugTyp.faktorFolgejahre;
      zeitwert -= verlust;
      jahresAbschreibung.push(verlust);
    }
    
    // Restmonate im aktuellen Jahr
    const restMonate = (gesamtAlterJahre - Math.floor(gesamtAlterJahre));
    if (restMonate > 0 && Math.floor(gesamtAlterJahre) >= 1) {
      const verlust = zeitwert * fahrzeugTyp.faktorFolgejahre * restMonate;
      zeitwert -= verlust;
    }
    
    // 2. Kilometerabzug/-zuschlag
    const erwarteteKm = gesamtAlterJahre * durchschnittsKmProJahr;
    const kmDifferenz = kilometerstand - erwarteteKm;
    const kmFaktorProKm = fahrzeugTyp.kmFaktor / 10000; // Pro 10.000 km
    const kmAnpassung = kmDifferenz * kmFaktorProKm;
    zeitwert -= kmAnpassung;
    
    // 3. Zustandsanpassung
    const zustandsFaktoren = {
      'sehr-gut': 1.05,
      'gut': 1.0,
      'normal': 0.95,
      'maengel': 0.85,
    };
    zeitwert *= zustandsFaktoren[zustand];
    
    // 4. Sonderausstattung (verliert ca. 60-80% schneller an Wert)
    const sonderausstattungRestwert = sonderausstattung * Math.max(0.1, 1 - (gesamtAlterJahre * 0.2));
    zeitwert += sonderausstattungRestwert;
    
    // Mindestrestwert: 5% des Neupreises
    const restwert = Math.max(zeitwert, neupreis * 0.05);
    const wertverlust = neupreis + sonderausstattung - restwert;
    const wertverlustProzent = (wertverlust / (neupreis + sonderausstattung)) * 100;
    
    return {
      restwert,
      wertverlust,
      wertverlustProzent,
      jahresAbschreibung,
      wertverlustProMonat: wertverlust / Math.max(gesamtAlterJahre * 12, 1),
      wertProKm: wertverlust / Math.max(kilometerstand, 1),
      effektiverWertverlustProzent: Math.pow(restwert / (neupreis + sonderausstattung), 1 / Math.max(gesamtAlterJahre, 0.5)) * 100 - 100,
    };
  }, [neupreis, alter, alterMonate, kilometerstand, fahrzeugTypIndex, zustand, sonderausstattung]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatProzent = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';
  const formatKm = (n: number) => n.toLocaleString('de-DE') + ' km';

  const gesamtAlterJahre = alter + alterMonate / 12;
  const erwarteteKm = gesamtAlterJahre * durchschnittsKmProJahr;
  const kmAbweichung = kilometerstand - erwarteteKm;

  // Wertverlauf berechnen für Grafik
  const wertverlauf = useMemo(() => {
    const punkte: { jahr: number; wert: number }[] = [];
    let wert = neupreis + sonderausstattung;
    punkte.push({ jahr: 0, wert });
    
    // Jahr 1
    wert -= neupreis * fahrzeugTyp.faktorErstesJahr;
    wert -= sonderausstattung * 0.3;
    punkte.push({ jahr: 1, wert: Math.max(wert, neupreis * 0.05) });
    
    // Jahre 2-10
    for (let j = 2; j <= 10; j++) {
      wert *= (1 - fahrzeugTyp.faktorFolgejahre);
      punkte.push({ jahr: j, wert: Math.max(wert, neupreis * 0.05) });
    }
    
    return punkte;
  }, [neupreis, sonderausstattung, fahrzeugTypIndex]);

  const maxWert = neupreis + sonderausstattung;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Fahrzeugtyp */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Fahrzeugtyp</span>
            <span className="text-xs text-gray-500 block mt-1">
              Beeinflusst den Wertverlust – Luxuswagen verlieren mehr
            </span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {fahrzeugTypen.map((typ, index) => (
              <button
                key={typ.name}
                onClick={() => setFahrzeugTypIndex(index)}
                className={`py-2 px-2 rounded-xl text-xs sm:text-sm transition-all border ${
                  fahrzeugTypIndex === index
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-orange-50 hover:border-orange-300'
                }`}
              >
                <span className="mr-1">{typ.icon}</span>
                {typ.name}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {fahrzeugTyp.beschreibung}
          </p>
        </div>

        {/* Neupreis */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Neupreis</span>
            <span className="text-xs text-gray-500 block mt-1">
              Ursprünglicher Listenpreis des Fahrzeugs (ohne Sonderausstattung)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={neupreis}
              onChange={(e) => setNeupreis(Math.max(1000, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="1000"
              max="500000"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={neupreis}
            onChange={(e) => setNeupreis(Number(e.target.value))}
            className="w-full mt-3 accent-orange-500"
            min="5000"
            max="150000"
            step="1000"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>5.000 €</span>
            <span>75.000 €</span>
            <span>150.000 €</span>
          </div>
        </div>

        {/* Sonderausstattung */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Sonderausstattung</span>
            <span className="text-xs text-gray-500 block mt-1">
              Wert der zusätzlichen Ausstattung (verliert schneller an Wert)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={sonderausstattung}
              onChange={(e) => setSonderausstattung(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="100000"
              step="500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">€</span>
          </div>
          <input
            type="range"
            value={sonderausstattung}
            onChange={(e) => setSonderausstattung(Number(e.target.value))}
            className="w-full mt-3 accent-orange-500"
            min="0"
            max="30000"
            step="500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span>15.000 €</span>
            <span>30.000 €</span>
          </div>
          {sonderausstattung > 0 && (
            <p className="text-sm text-orange-600 mt-2">
              Gesamtpreis inkl. Ausstattung: <strong>{formatEuro(neupreis + sonderausstattung)}</strong>
            </p>
          )}
        </div>

        {/* Fahrzeugalter */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Fahrzeugalter</span>
            <span className="text-xs text-gray-500 block mt-1">
              Alter seit Erstzulassung
            </span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="relative">
                <input
                  type="number"
                  value={alter}
                  onChange={(e) => setAlter(Math.max(0, Math.min(30, Number(e.target.value))))}
                  className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                  min="0"
                  max="30"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Jahre</span>
              </div>
            </div>
            <div>
              <div className="relative">
                <input
                  type="number"
                  value={alterMonate}
                  onChange={(e) => setAlterMonate(Math.max(0, Math.min(11, Number(e.target.value))))}
                  className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                  min="0"
                  max="11"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Monate</span>
              </div>
            </div>
          </div>
          <input
            type="range"
            value={alter}
            onChange={(e) => setAlter(Number(e.target.value))}
            className="w-full mt-3 accent-orange-500"
            min="0"
            max="15"
            step="1"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Neuwagen</span>
            <span>7 Jahre</span>
            <span>15+ Jahre</span>
          </div>
        </div>

        {/* Kilometerstand */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Kilometerstand</span>
            <span className="text-xs text-gray-500 block mt-1">
              Aktuelle Laufleistung
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={kilometerstand}
              onChange={(e) => setKilometerstand(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="500000"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">km</span>
          </div>
          <input
            type="range"
            value={kilometerstand}
            onChange={(e) => setKilometerstand(Number(e.target.value))}
            className="w-full mt-3 accent-orange-500"
            min="0"
            max="200000"
            step="5000"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 km</span>
            <span>100.000 km</span>
            <span>200.000 km</span>
          </div>
          {gesamtAlterJahre > 0 && (
            <div className="mt-2">
              {kmAbweichung > 10000 ? (
                <p className="text-sm text-red-600">
                  ⚠️ {formatKm(Math.abs(kmAbweichung))} <strong>über</strong> Durchschnitt → Wertminderung
                </p>
              ) : kmAbweichung < -10000 ? (
                <p className="text-sm text-green-600">
                  ✓ {formatKm(Math.abs(kmAbweichung))} <strong>unter</strong> Durchschnitt → Wertsteigerung
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  ○ Durchschnittliche Laufleistung (ca. {formatKm(Math.round(erwarteteKm))})
                </p>
              )}
            </div>
          )}
        </div>

        {/* Zustand */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Fahrzeugzustand</span>
            <span className="text-xs text-gray-500 block mt-1">
              Allgemeiner Zustand des Fahrzeugs
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { key: 'sehr-gut', label: 'Sehr gut', icon: '⭐', desc: 'Wie neu, scheckheftgepflegt' },
              { key: 'gut', label: 'Gut', icon: '✓', desc: 'Normale Gebrauchsspuren' },
              { key: 'normal', label: 'Normal', icon: '○', desc: 'Sichtbare Gebrauchsspuren' },
              { key: 'maengel', label: 'Mängel', icon: '⚠️', desc: 'Reparaturbedarf' },
            ].map((z) => (
              <button
                key={z.key}
                onClick={() => setZustand(z.key as typeof zustand)}
                className={`py-3 px-2 rounded-xl text-sm transition-all border ${
                  zustand === z.key
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-orange-50 hover:border-orange-300'
                }`}
              >
                <span className="block text-lg mb-1">{z.icon}</span>
                {z.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🚗 Geschätzter Restwert</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.restwert)}</span>
          </div>
          <p className="text-orange-100 mt-2 text-sm">
            bei {formatKm(kilometerstand)} nach {gesamtAlterJahre.toFixed(1)} Jahren
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Wertverlust</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.wertverlust)}</div>
            <p className="text-xs text-orange-100 mt-1">
              {formatProzent(ergebnis.wertverlustProzent)} vom Kaufpreis
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Restwert in %</span>
            <div className="text-xl font-bold">{formatProzent(100 - ergebnis.wertverlustProzent)}</div>
            <p className="text-xs text-orange-100 mt-1">
              vom ursprünglichen Wert
            </p>
          </div>
        </div>
      </div>

      {/* Wertverlust-Grafik */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📉 Wertverlauf über Zeit</h3>
        <div className="relative h-48 bg-gray-50 rounded-xl p-4">
          <svg viewBox="0 0 400 150" className="w-full h-full">
            {/* Grid */}
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(249, 115, 22)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(249, 115, 22)" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            
            {/* Y-Achse Labels */}
            <text x="5" y="15" className="text-[8px] fill-gray-400">{formatEuro(maxWert)}</text>
            <text x="5" y="75" className="text-[8px] fill-gray-400">{formatEuro(maxWert / 2)}</text>
            <text x="5" y="140" className="text-[8px] fill-gray-400">0 €</text>
            
            {/* Grid Lines */}
            {[0, 25, 50, 75, 100].map((pct) => (
              <line key={pct} x1="40" y1={10 + pct * 1.3} x2="390" y2={10 + pct * 1.3} stroke="#e5e7eb" strokeWidth="1" />
            ))}
            
            {/* Wertverlauf Linie */}
            <path
              d={`M 40,${10 + (1 - wertverlauf[0].wert / maxWert) * 130} ${wertverlauf.map((p, i) => `L ${40 + i * 35},${10 + (1 - p.wert / maxWert) * 130}`).join(' ')}`}
              fill="none"
              stroke="rgb(249, 115, 22)"
              strokeWidth="2.5"
            />
            
            {/* Fläche unter Kurve */}
            <path
              d={`M 40,${10 + (1 - wertverlauf[0].wert / maxWert) * 130} ${wertverlauf.map((p, i) => `L ${40 + i * 35},${10 + (1 - p.wert / maxWert) * 130}`).join(' ')} L 390,140 L 40,140 Z`}
              fill="url(#areaGradient)"
            />
            
            {/* Aktueller Punkt */}
            {alter <= 10 && (
              <>
                <circle
                  cx={40 + alter * 35}
                  cy={10 + (1 - ergebnis.restwert / maxWert) * 130}
                  r="6"
                  fill="rgb(220, 38, 38)"
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={40 + alter * 35}
                  y={10 + (1 - ergebnis.restwert / maxWert) * 130 - 10}
                  className="text-[9px] fill-red-600 font-bold"
                  textAnchor="middle"
                >
                  {formatEuro(ergebnis.restwert)}
                </text>
              </>
            )}
            
            {/* X-Achse Labels */}
            {[0, 2, 4, 6, 8, 10].map((jahr) => (
              <text key={jahr} x={40 + jahr * 35} y="148" className="text-[8px] fill-gray-400" textAnchor="middle">
                {jahr}J
              </text>
            ))}
          </svg>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          Geschätzter Wertverlauf für {fahrzeugTyp.name} (ohne km-Anpassung)
        </p>
      </div>

      {/* Detaillierte Berechnung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
        
        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Ausgangswert
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Neupreis</span>
            <span className="font-bold text-gray-900">{formatEuro(neupreis)}</span>
          </div>
          {sonderausstattung > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">+ Sonderausstattung</span>
              <span className="text-gray-900">+ {formatEuro(sonderausstattung)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 bg-gray-50 -mx-6 px-6">
            <span className="font-medium text-gray-700">Gesamtkaufpreis</span>
            <span className="font-bold text-gray-900">{formatEuro(neupreis + sonderausstattung)}</span>
          </div>

          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Abschreibung ({fahrzeugTyp.name})
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">1. Jahr</span>
            <span className="text-red-600">− {formatProzent(fahrzeugTyp.faktorErstesJahr * 100)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Folgejahre (pro Jahr)</span>
            <span className="text-red-600">− {formatProzent(fahrzeugTyp.faktorFolgejahre * 100)} (degressiv)</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Fahrzeugalter</span>
            <span className="text-gray-900">{alter} Jahre, {alterMonate} Monate</span>
          </div>

          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Kilometer-Anpassung
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Aktueller km-Stand</span>
            <span className="text-gray-900">{formatKm(kilometerstand)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Erwartete km (12.000/Jahr)</span>
            <span className="text-gray-900">{formatKm(Math.round(erwarteteKm))}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Abweichung</span>
            <span className={kmAbweichung > 0 ? 'text-red-600' : kmAbweichung < 0 ? 'text-green-600' : 'text-gray-900'}>
              {kmAbweichung > 0 ? '+' : ''}{formatKm(Math.round(kmAbweichung))}
            </span>
          </div>

          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Zustandsanpassung
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Zustand: {zustand === 'sehr-gut' ? 'Sehr gut' : zustand === 'gut' ? 'Gut' : zustand === 'normal' ? 'Normal' : 'Mängel'}</span>
            <span className={zustand === 'sehr-gut' ? 'text-green-600' : zustand === 'maengel' ? 'text-red-600' : 'text-gray-900'}>
              {zustand === 'sehr-gut' ? '+5%' : zustand === 'gut' ? '±0%' : zustand === 'normal' ? '-5%' : '-15%'}
            </span>
          </div>

          <div className="flex justify-between py-3 bg-orange-100 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-orange-800">Geschätzter Restwert</span>
            <span className="font-bold text-2xl text-orange-900">{formatEuro(ergebnis.restwert)}</span>
          </div>
        </div>
      </div>

      {/* Kennzahlen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📈 Kennzahlen</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <span className="text-sm text-gray-600">Wertverlust pro Monat</span>
            <div className="text-xl font-bold text-red-600">{formatEuro(ergebnis.wertverlustProMonat)}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <span className="text-sm text-gray-600">Wertverlust pro km</span>
            <div className="text-xl font-bold text-red-600">{ergebnis.wertProKm.toFixed(2)} €</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <span className="text-sm text-gray-600">Ø Wertverlust p.a.</span>
            <div className="text-xl font-bold text-gray-800">
              {gesamtAlterJahre > 0 ? formatProzent(ergebnis.wertverlustProzent / gesamtAlterJahre) : '—'}
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <span className="text-sm text-gray-600">Restwert-Quote</span>
            <div className="text-xl font-bold text-green-600">{formatProzent(100 - ergebnis.wertverlustProzent)}</div>
          </div>
        </div>
      </div>

      {/* Wertverlust nach Fahrzeugtyp */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🚗 Wertverlust nach Fahrzeugtyp</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 text-gray-500 font-medium">Typ</th>
                <th className="py-2 text-gray-500 font-medium text-right">1. Jahr</th>
                <th className="py-2 text-gray-500 font-medium text-right">Folgejahre</th>
              </tr>
            </thead>
            <tbody>
              {fahrzeugTypen.map((typ, i) => (
                <tr key={typ.name} className={i === fahrzeugTypIndex ? 'bg-orange-50' : ''}>
                  <td className="py-2">
                    <span className="mr-1">{typ.icon}</span>
                    {typ.name}
                  </td>
                  <td className="py-2 text-right text-red-600">−{(typ.faktorErstesJahr * 100).toFixed(0)}%</td>
                  <td className="py-2 text-right text-red-600">−{(typ.faktorFolgejahre * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          * Folgejahre werden degressiv (vom Vorjahreswert) abgeschrieben
        </p>
      </div>

      {/* Tipps */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-green-800 mb-3">💡 Tipps für höheren Restwert</h3>
        <ul className="space-y-2 text-sm text-green-700">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Scheckheftpflege:</strong> Regelmäßige Wartung beim Markenhändler dokumentieren</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Kilometerbegrenzung:</strong> 12.000 km/Jahr sind Durchschnitt – weniger ist besser</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Garagenpflege:</strong> Fahrzeug vor Witterung schützen</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Beliebte Ausstattung:</strong> Navigationssystem, Automatik, Einparkhilfe sind gefragt</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Neutrale Farben:</strong> Schwarz, Weiß, Grau sind am wertstabilsten</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Unfallfreiheit:</strong> Unfallfreie Fahrzeuge erzielen deutlich höhere Preise</span>
          </li>
        </ul>
      </div>

      {/* Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>Der Restwert ist eine <strong>Schätzung</strong> basierend auf durchschnittlichen Wertverlust-Daten</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Der tatsächliche Marktwert kann je nach Modell, Region und Nachfrage abweichen</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Für einen verbindlichen Wert nutzen Sie professionelle Bewertungsdienste (DAT, Schwacke)</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Händlerankauf liegt meist 10-20% unter dem Privatverkaufspreis</span>
          </li>
        </ul>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Bewertungsdienste</h4>
        <div className="space-y-1">
          <a 
            href="https://www.dat.de/fahrzeugbewertung/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            DAT – Deutsche Automobil Treuhand
          </a>
          <a 
            href="https://www.schwacke.de/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Schwacke – Fahrzeugbewertung
          </a>
          <a 
            href="https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            ADAC – Tipps zum Autoverkauf
          </a>
        </div>
      </div>
    </div>
  );
}
