import { useState, useMemo } from 'react';

// 2025 Werte - Quellen: BMF, Deutsche Rentenversicherung, GKV
const SOZIALVERSICHERUNG_2025 = {
  rentenversicherung: 0.093, // 9,3% AN-Anteil
  arbeitslosenversicherung: 0.013, // 1,3% AN-Anteil
  pflegeversicherung: {
    basis: 0.017, // 1,7% AN-Anteil
    kinderlos_zuschlag: 0.006, // +0,6% für Kinderlose ab 23
  },
  krankenversicherung: {
    basis: 0.073, // 7,3% AN-Anteil
    zusatzbeitrag: 0.008, // ~0,8% durchschnittl. Zusatzbeitrag
  },
};

const BBG_2025 = {
  rente_west: 96600, // Beitragsbemessungsgrenze RV West
  rente_ost: 96600, // 2025 vereinheitlicht
  kranken: 66150, // BBG Kranken/Pflege
};

const STEUERKLASSEN = [
  { wert: 1, label: 'Steuerklasse 1', beschreibung: 'Ledig / Geschieden' },
  { wert: 2, label: 'Steuerklasse 2', beschreibung: 'Alleinerziehend' },
  { wert: 3, label: 'Steuerklasse 3', beschreibung: 'Verheiratet (höheres Einkommen)' },
  { wert: 4, label: 'Steuerklasse 4', beschreibung: 'Verheiratet (gleiches Einkommen)' },
  { wert: 5, label: 'Steuerklasse 5', beschreibung: 'Verheiratet (geringeres Einkommen)' },
  { wert: 6, label: 'Steuerklasse 6', beschreibung: 'Zweitjob / Nebenjob' },
];

// Vereinfachte Lohnsteuerberechnung 2025
function berechneLohnsteuer(jahresbrutto: number, steuerklasse: number): number {
  // Grundfreibetrag 2025: 12.096 € (geplant)
  const grundfreibetrag = 12096;
  
  // Vereinfachte Freibeträge je Steuerklasse
  let freibetrag = grundfreibetrag;
  if (steuerklasse === 2) freibetrag += 4260; // Entlastungsbetrag Alleinerziehende
  if (steuerklasse === 3) freibetrag = grundfreibetrag * 2;
  
  const zvE = Math.max(0, jahresbrutto - freibetrag);
  
  // 2025 Steuertarif (vereinfacht)
  let steuer = 0;
  if (zvE <= 0) {
    steuer = 0;
  } else if (zvE <= 17005) {
    const y = (zvE - 1) / 10000;
    steuer = (922.98 * y + 1400) * y;
  } else if (zvE <= 66760) {
    const z = (zvE - 17005) / 10000;
    steuer = (181.19 * z + 2397) * z + 1025.38;
  } else if (zvE <= 277825) {
    steuer = 0.42 * zvE - 10602.13;
  } else {
    steuer = 0.45 * zvE - 18936.88;
  }
  
  // Steuerklasse 5 & 6 haben höhere Abzüge
  if (steuerklasse === 5) steuer *= 1.6;
  if (steuerklasse === 6) steuer *= 1.8;
  
  return Math.max(0, Math.round(steuer));
}

// Soli nur noch bei hohen Einkommen
function berechneSoli(lohnsteuer: number): number {
  const freigrenze = 18130; // Jahresgrenze
  if (lohnsteuer <= freigrenze) return 0;
  
  // Gleitzone 18.130 - 33.063
  if (lohnsteuer <= 33063) {
    return Math.min(0.055 * lohnsteuer, 0.119 * (lohnsteuer - freigrenze));
  }
  
  return Math.round(lohnsteuer * 0.055);
}

function berechneKirchensteuer(lohnsteuer: number, bundesland: string): number {
  // Bayern & Baden-Württemberg: 8%, Rest: 9%
  const satz = ['BY', 'BW'].includes(bundesland) ? 0.08 : 0.09;
  return Math.round(lohnsteuer * satz);
}

export default function BruttoNettoRechner() {
  const [bruttoMonat, setBruttoMonat] = useState(4000);
  const [steuerklasse, setSteuerklasse] = useState(1);
  const [kinderlos, setKinderlos] = useState(true);
  const [kirchensteuer, setKirchensteuer] = useState(false);
  const [bundesland, setBundesland] = useState('NW');

  const ergebnis = useMemo(() => {
    const bruttoJahr = bruttoMonat * 12;
    
    // Sozialversicherung
    const rvBrutto = Math.min(bruttoJahr, BBG_2025.rente_west);
    const kvBrutto = Math.min(bruttoJahr, BBG_2025.kranken);
    
    const rv = rvBrutto * SOZIALVERSICHERUNG_2025.rentenversicherung;
    const av = rvBrutto * SOZIALVERSICHERUNG_2025.arbeitslosenversicherung;
    
    let pv = kvBrutto * SOZIALVERSICHERUNG_2025.pflegeversicherung.basis;
    if (kinderlos) {
      pv += kvBrutto * SOZIALVERSICHERUNG_2025.pflegeversicherung.kinderlos_zuschlag;
    }
    
    const kv = kvBrutto * (
      SOZIALVERSICHERUNG_2025.krankenversicherung.basis + 
      SOZIALVERSICHERUNG_2025.krankenversicherung.zusatzbeitrag
    );
    
    const svGesamt = rv + av + pv + kv;
    
    // Steuern
    const lohnsteuerJahr = berechneLohnsteuer(bruttoJahr, steuerklasse);
    const soliJahr = berechneSoli(lohnsteuerJahr);
    const kistJahr = kirchensteuer ? berechneKirchensteuer(lohnsteuerJahr, bundesland) : 0;
    const steuernGesamt = lohnsteuerJahr + soliJahr + kistJahr;
    
    // Netto
    const nettoJahr = bruttoJahr - svGesamt - steuernGesamt;
    const nettoMonat = nettoJahr / 12;
    
    return {
      bruttoJahr,
      nettoJahr: Math.round(nettoJahr),
      nettoMonat: Math.round(nettoMonat),
      // Monatliche Abzüge
      rv: Math.round(rv / 12),
      av: Math.round(av / 12),
      pv: Math.round(pv / 12),
      kv: Math.round(kv / 12),
      svGesamt: Math.round(svGesamt / 12),
      lohnsteuer: Math.round(lohnsteuerJahr / 12),
      soli: Math.round(soliJahr / 12),
      kist: Math.round(kistJahr / 12),
      steuernGesamt: Math.round(steuernGesamt / 12),
      abzuegeGesamt: Math.round((svGesamt + steuernGesamt) / 12),
    };
  }, [bruttoMonat, steuerklasse, kinderlos, kirchensteuer, bundesland]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Brutto */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Brutto-Monatsgehalt</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={bruttoMonat}
              onChange={(e) => setBruttoMonat(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              min="0"
              step="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            min="0"
            max="15000"
            step="100"
            value={bruttoMonat}
            onChange={(e) => setBruttoMonat(Number(e.target.value))}
            className="w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span>15.000 €</span>
          </div>
        </div>

        {/* Steuerklasse */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Steuerklasse</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {STEUERKLASSEN.map((sk) => (
              <button
                key={sk.wert}
                onClick={() => setSteuerklasse(sk.wert)}
                className={`py-3 px-2 rounded-xl font-bold text-lg transition-all ${
                  steuerklasse === sk.wert
                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={sk.beschreibung}
              >
                {sk.wert}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            {STEUERKLASSEN.find(sk => sk.wert === steuerklasse)?.beschreibung}
          </p>
        </div>

        {/* Optionen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={kinderlos}
              onChange={(e) => setKinderlos(e.target.checked)}
              className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-700">Kinderlos (ab 23)</span>
              <p className="text-xs text-gray-500">+0,6% Pflegeversicherung</p>
            </div>
          </label>
          
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={kirchensteuer}
              onChange={(e) => setKirchensteuer(e.target.checked)}
              className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-700">Kirchensteuer</span>
              <p className="text-xs text-gray-500">8-9% der Lohnsteuer</p>
            </div>
          </label>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-green-100 mb-1">Dein Netto</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.nettoMonat)}</span>
            <span className="text-xl text-green-200">/ Monat</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <span className="text-green-100">Pro Jahr</span>
            <span className="text-xl font-bold">{formatEuro(ergebnis.nettoJahr)}</span>
          </div>
        </div>
      </div>

      {/* Aufschlüsselung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Abzüge im Detail</h3>
        
        <div className="space-y-4">
          {/* Brutto */}
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="font-medium text-gray-700">Brutto</span>
            <span className="font-bold text-gray-900">{formatEuro(bruttoMonat)}</span>
          </div>

          {/* Sozialversicherung */}
          <div>
            <div className="flex justify-between items-center text-red-600 font-medium mb-2">
              <span>Sozialversicherung</span>
              <span>− {formatEuro(ergebnis.svGesamt)}</span>
            </div>
            <div className="pl-4 space-y-1 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Rentenversicherung (9,3%)</span>
                <span>− {formatEuro(ergebnis.rv)}</span>
              </div>
              <div className="flex justify-between">
                <span>Krankenversicherung (~8,1%)</span>
                <span>− {formatEuro(ergebnis.kv)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pflegeversicherung ({kinderlos ? '2,3%' : '1,7%'})</span>
                <span>− {formatEuro(ergebnis.pv)}</span>
              </div>
              <div className="flex justify-between">
                <span>Arbeitslosenversicherung (1,3%)</span>
                <span>− {formatEuro(ergebnis.av)}</span>
              </div>
            </div>
          </div>

          {/* Steuern */}
          <div>
            <div className="flex justify-between items-center text-red-600 font-medium mb-2">
              <span>Steuern</span>
              <span>− {formatEuro(ergebnis.steuernGesamt)}</span>
            </div>
            <div className="pl-4 space-y-1 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Lohnsteuer (Stkl. {steuerklasse})</span>
                <span>− {formatEuro(ergebnis.lohnsteuer)}</span>
              </div>
              {ergebnis.soli > 0 && (
                <div className="flex justify-between">
                  <span>Solidaritätszuschlag</span>
                  <span>− {formatEuro(ergebnis.soli)}</span>
                </div>
              )}
              {kirchensteuer && ergebnis.kist > 0 && (
                <div className="flex justify-between">
                  <span>Kirchensteuer</span>
                  <span>− {formatEuro(ergebnis.kist)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Netto */}
          <div className="flex justify-between items-center py-3 border-t-2 border-green-200 bg-green-50 -mx-6 px-6 rounded-b-2xl">
            <span className="font-bold text-green-800 text-lg">Netto</span>
            <span className="font-bold text-green-600 text-xl">{formatEuro(ergebnis.nettoMonat)}</span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert's</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>Berechnung nach <strong>Steuerformel 2025</strong> (BMF)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Grundfreibetrag: 12.096 €</strong> (geplant für 2025)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Beitragsbemessungsgrenzen <strong>RV: 96.600 €</strong> / <strong>KV: 66.150 €</strong></span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Vereinfachte Berechnung – exakte Werte via <a href="https://www.bmf-steuerrechner.de" target="_blank" rel="noopener" className="text-blue-600 hover:underline">BMF-Steuerrechner</a></span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörden</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-medium text-gray-800">Finanzamt</p>
              <p className="text-gray-500">Lohnsteuer, Steuerklasse</p>
              <a 
                href="https://www.elster.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                ELSTER Online →
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">🏥</span>
            <div>
              <p className="font-medium text-gray-800">Krankenkasse</p>
              <p className="text-gray-500">KV-Beitrag, Zusatzbeitrag</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.bmf-steuerrechner.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF – Offizieller Lohnsteuerrechner
          </a>
          <a 
            href="https://www.deutsche-rentenversicherung.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsche Rentenversicherung – Beitragssätze 2025
          </a>
        </div>
      </div>
    </div>
  );
}
