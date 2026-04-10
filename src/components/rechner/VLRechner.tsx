import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// VL & Arbeitnehmersparzulage 2026
// Quelle: §13 VermBG, §19a EStG

// Arbeitnehmersparzulage für Bausparen
// Seit 2024: Einheitliche Einkommensgrenzen 40.000/80.000€ für ALLE Anlageformen
// Quelle: Zukunftsfinanzierungsgesetz (ZuFinG), §13 VermBG
const BAUSPAR = {
  maxBeitrag: 470, // €/Jahr für Zulage
  zulageProz: 9, // 9% Sparzulage
  maxZulage: 43, // €/Jahr (gerundet: 470 * 0.09 = 42,30€)
  einkommensgrenzeSingle: 40_000, // € zvE (seit 2024, vorher 17.900€)
  einkommensgrenzeVerheiratet: 80_000, // € zvE (seit 2024, vorher 35.800€)
};

// Arbeitnehmersparzulage für Aktienfonds/Beteiligungen
const AKTIENFONDS = {
  maxBeitrag: 400, // €/Jahr für Zulage
  zulageProz: 20, // 20% Sparzulage
  maxZulage: 80, // €/Jahr
  einkommensgrenzeSingle: 40_000, // € zvE (seit 2024, vorher 20.000€)
  einkommensgrenzeVerheiratet: 80_000, // € zvE (seit 2024, vorher 40.000€)
};

// Allgemeine VL-Konstanten
const VL = {
  maxArbeitgeberBeitrag: 40, // €/Monat typisch (nicht gesetzlich begrenzt)
  sperrfrist: 7, // Jahre
};

type Anlageform = 'bauspar' | 'aktienfonds' | 'kombi';
type Familienstand = 'ledig' | 'verheiratet';

export default function VLRechner() {
  const [anlageform, setAnlageform] = useState<Anlageform>('aktienfonds');
  const [familienstand, setFamilienstand] = useState<Familienstand>('ledig');
  const [zvE, setZvE] = useState(35000);
  const [arbeitgeberBeitrag, setArbeitgeberBeitrag] = useState(40);
  const [eigenanteil, setEigenanteil] = useState(0);
  const [laufzeit, setLaufzeit] = useState(7);
  const [rendite, setRendite] = useState(anlageform === 'bauspar' ? 1.5 : 6);

  // Bei Wechsel der Anlageform: Rendite anpassen
  const handleAnlageformChange = (newForm: Anlageform) => {
    setAnlageform(newForm);
    if (newForm === 'bauspar') {
      setRendite(1.5);
    } else if (newForm === 'aktienfonds') {
      setRendite(6);
    } else {
      setRendite(4);
    }
  };

  const ergebnis = useMemo(() => {
    const monatlichGesamt = arbeitgeberBeitrag + eigenanteil;
    const jahrlichGesamt = monatlichGesamt * 12;
    
    // Einkommensgrenzen prüfen
    const grenzeBauspar = familienstand === 'verheiratet' 
      ? BAUSPAR.einkommensgrenzeVerheiratet 
      : BAUSPAR.einkommensgrenzeSingle;
    const grenzeAktien = familienstand === 'verheiratet' 
      ? AKTIENFONDS.einkommensgrenzeVerheiratet 
      : AKTIENFONDS.einkommensgrenzeSingle;
    
    const anspruchBauspar = zvE <= grenzeBauspar;
    const anspruchAktien = zvE <= grenzeAktien;
    
    // Zulagen berechnen je nach Anlageform
    let zulageBauspar = 0;
    let zulageAktien = 0;
    let beitragBauspar = 0;
    let beitragAktien = 0;
    
    if (anlageform === 'bauspar') {
      beitragBauspar = jahrlichGesamt;
      if (anspruchBauspar) {
        const foerderfaehig = Math.min(beitragBauspar, BAUSPAR.maxBeitrag);
        zulageBauspar = Math.min(foerderfaehig * BAUSPAR.zulageProz / 100, BAUSPAR.maxZulage);
      }
    } else if (anlageform === 'aktienfonds') {
      beitragAktien = jahrlichGesamt;
      if (anspruchAktien) {
        const foerderfaehig = Math.min(beitragAktien, AKTIENFONDS.maxBeitrag);
        zulageAktien = Math.min(foerderfaehig * AKTIENFONDS.zulageProz / 100, AKTIENFONDS.maxZulage);
      }
    } else {
      // Kombi: Optimal aufteilen
      // Erst Aktienfonds bis 400€ (höhere Zulage), dann Bauspar
      if (jahrlichGesamt <= AKTIENFONDS.maxBeitrag) {
        beitragAktien = jahrlichGesamt;
        beitragBauspar = 0;
      } else {
        beitragAktien = AKTIENFONDS.maxBeitrag;
        beitragBauspar = Math.min(jahrlichGesamt - AKTIENFONDS.maxBeitrag, BAUSPAR.maxBeitrag);
      }
      
      if (anspruchAktien) {
        zulageAktien = Math.min(beitragAktien * AKTIENFONDS.zulageProz / 100, AKTIENFONDS.maxZulage);
      }
      if (anspruchBauspar) {
        zulageBauspar = Math.min(beitragBauspar * BAUSPAR.zulageProz / 100, BAUSPAR.maxZulage);
      }
    }
    
    const zulageGesamt = Math.round(zulageBauspar + zulageAktien);
    const zulageMonatlich = zulageGesamt / 12;
    
    // Foerderquote
    const eigenEinzahlungJahr = eigenanteil * 12;
    const foerderquote = eigenEinzahlungJahr > 0 
      ? ((arbeitgeberBeitrag * 12 + zulageGesamt) / eigenEinzahlungJahr) * 100
      : Infinity;
    
    // Renditeberechnung über Laufzeit
    const jahresrendite = rendite / 100;
    let endkapital = 0;
    let einzahlungenGesamt = 0;
    let zulagenGesamt = 0;
    let zinsenGesamt = 0;
    let arbeitgeberGesamt = 0;
    let eigenGesamt = 0;
    
    for (let jahr = 1; jahr <= laufzeit; jahr++) {
      // Monatliche Einzahlungen und Zulagen zu Jahresbeginn vereinfacht
      const jahreseinzahlung = jahrlichGesamt + zulageGesamt;
      endkapital += jahreseinzahlung;
      einzahlungenGesamt += jahrlichGesamt;
      zulagenGesamt += zulageGesamt;
      arbeitgeberGesamt += arbeitgeberBeitrag * 12;
      eigenGesamt += eigenanteil * 12;
      
      // Zinsen
      const zinsen = endkapital * jahresrendite;
      endkapital += zinsen;
      zinsenGesamt += zinsen;
    }
    
    // Effektive Rendite (bezogen auf eigene Einzahlung)
    const effektiveRendite = eigenGesamt > 0
      ? ((endkapital - eigenGesamt) / eigenGesamt) * 100
      : ((endkapital) / 1) * 100; // Wenn kein Eigenanteil, theoretisch unendlich
    
    // Prüfen ob maximale Zulage erreicht
    const maxZulageMoeglich = anlageform === 'bauspar' 
      ? BAUSPAR.maxZulage 
      : anlageform === 'aktienfonds' 
        ? AKTIENFONDS.maxZulage 
        : BAUSPAR.maxZulage + AKTIENFONDS.maxZulage;
    
    const maxZulageErreicht = zulageGesamt >= maxZulageMoeglich * 0.99;
    
    return {
      monatlichGesamt,
      jahrlichGesamt,
      anspruchBauspar,
      anspruchAktien,
      grenzeBauspar,
      grenzeAktien,
      zulageBauspar: Math.round(zulageBauspar),
      zulageAktien: Math.round(zulageAktien),
      zulageGesamt,
      zulageMonatlich,
      foerderquote,
      endkapital: Math.round(endkapital),
      einzahlungenGesamt: Math.round(einzahlungenGesamt),
      zulagenGesamt: Math.round(zulagenGesamt),
      zinsenGesamt: Math.round(zinsenGesamt),
      arbeitgeberGesamt: Math.round(arbeitgeberGesamt),
      eigenGesamt: Math.round(eigenGesamt),
      effektiveRendite,
      maxZulageErreicht,
      maxZulageMoeglich,
      beitragBauspar,
      beitragAktien,
    };
  }, [anlageform, familienstand, zvE, arbeitgeberBeitrag, eigenanteil, laufzeit, rendite]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';
  const formatProzent = (n: number) => n.toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' %';

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="VL-Rechner 2025 & 2026" rechnerSlug="vl-rechner" />

{/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Anlageform */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Anlageform</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleAnlageformChange('bauspar')}
              className={`p-3 rounded-xl text-center transition-all text-sm ${
                anlageform === 'bauspar'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="text-xl">🏠</div>
              <div className="font-medium">Bauspar</div>
              <div className="text-xs opacity-80 mt-1">9% Zulage</div>
            </button>
            <button
              onClick={() => handleAnlageformChange('aktienfonds')}
              className={`p-3 rounded-xl text-center transition-all text-sm ${
                anlageform === 'aktienfonds'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="text-xl">📈</div>
              <div className="font-medium">Aktienfonds</div>
              <div className="text-xs opacity-80 mt-1">20% Zulage</div>
            </button>
            <button
              onClick={() => handleAnlageformChange('kombi')}
              className={`p-3 rounded-xl text-center transition-all text-sm ${
                anlageform === 'kombi'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="text-xl">🎯</div>
              <div className="font-medium">Kombi</div>
              <div className="text-xs opacity-80 mt-1">Bis 123€</div>
            </button>
          </div>
        </div>

        {/* Familienstand */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Familienstand</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFamilienstand('ledig')}
              className={`p-3 rounded-xl text-center transition-all ${
                familienstand === 'ledig'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">👤</span>
              <div className="font-medium mt-1">Ledig</div>
            </button>
            <button
              onClick={() => setFamilienstand('verheiratet')}
              className={`p-3 rounded-xl text-center transition-all ${
                familienstand === 'verheiratet'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">💑</span>
              <div className="font-medium mt-1">Verheiratet</div>
            </button>
          </div>
        </div>

        {/* Zu versteuerndes Einkommen */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Zu versteuerndes Einkommen</span>
            <span className="text-xs text-gray-500 block mt-1">Aus dem Steuerbescheid (gemeinsam veranlagt bei Verheirateten)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={zvE}
              onChange={(e) => setZvE(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none"
              min="0"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Jahr</span>
          </div>
          
          {/* Einkommens-Status */}
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {anlageform !== 'aktienfonds' && (
              <span className={`px-2 py-1 rounded ${
                ergebnis.anspruchBauspar 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {ergebnis.anspruchBauspar ? '✓' : '✗'} Bauspar-Zulage 
                (Grenze: {formatEuro(ergebnis.grenzeBauspar)})
              </span>
            )}
            {anlageform !== 'bauspar' && (
              <span className={`px-2 py-1 rounded ${
                ergebnis.anspruchAktien 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {ergebnis.anspruchAktien ? '✓' : '✗'} Aktien-Zulage 
                (Grenze: {formatEuro(ergebnis.grenzeAktien)})
              </span>
            )}
          </div>
        </div>

        {/* Arbeitgeberbeitrag */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">VL vom Arbeitgeber</span>
            <span className="text-xs text-gray-500 block mt-1">Oft im Tarif- oder Arbeitsvertrag geregelt</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={arbeitgeberBeitrag}
              onChange={(e) => setArbeitgeberBeitrag(Math.max(0, Math.min(100, Number(e.target.value))))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none"
              min="0"
              max="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Typisch: 6,65€ (IG Metall) bis 40€. Prüfe deinen Tarif-/Arbeitsvertrag!
          </p>
        </div>

        {/* Eigener Beitrag */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Eigener Beitrag (Aufstockung)</span>
            <span className="text-xs text-gray-500 block mt-1">Optional: Um volle Zulage zu erreichen</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={eigenanteil}
              onChange={(e) => setEigenanteil(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none"
              min="0"
              step="5"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
          </div>
          
          {/* Empfehlung für volle Zulage */}
          {!ergebnis.maxZulageErreicht && ergebnis.zulageGesamt > 0 && (
            <div className="mt-2 p-2 bg-yellow-50 rounded-lg text-xs text-yellow-800">
              💡 Tipp: Mit {formatEuro(Math.ceil(
                (anlageform === 'bauspar' ? BAUSPAR.maxBeitrag : 
                 anlageform === 'aktienfonds' ? AKTIENFONDS.maxBeitrag : 
                 BAUSPAR.maxBeitrag + AKTIENFONDS.maxBeitrag) / 12 - arbeitgeberBeitrag
              ))}/Monat erreichst du die maximale Zulage von {formatEuro(ergebnis.maxZulageMoeglich)}/Jahr.
            </div>
          )}
        </div>

        {/* Annahmen für Projektion */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium text-sm">Laufzeit</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={laufzeit}
                onChange={(e) => setLaufzeit(Math.max(1, Math.min(30, Number(e.target.value))))}
                className="w-full text-lg font-bold text-center py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none"
                min="1"
                max="30"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Jahre</span>
            </div>
          </div>
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium text-sm">Erwartete Rendite</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={rendite}
                onChange={(e) => setRendite(Math.max(0, Math.min(15, Number(e.target.value))))}
                className="w-full text-lg font-bold text-center py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none"
                min="0"
                max="15"
                step="0.5"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">% p.a.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ergebnis-Karte */}
      <div className={`rounded-2xl shadow-lg p-6 text-white mb-6 ${
        ergebnis.zulageGesamt > 0 
          ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
          : 'bg-gradient-to-br from-gray-500 to-gray-600'
      }`}>
        <h3 className="text-sm font-medium opacity-80 mb-1">
          {ergebnis.zulageGesamt > 0 ? 'Deine Arbeitnehmersparzulage' : 'Keine Zulage (Einkommen zu hoch)'}
        </h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.zulageGesamt)}</span>
            <span className="text-xl opacity-80">/ Jahr</span>
          </div>
          {ergebnis.maxZulageErreicht && ergebnis.zulageGesamt > 0 && (
            <span className="inline-block mt-2 bg-white/20 px-2 py-1 rounded text-sm">
              ✨ Maximale Zulage erreicht!
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Monatliche Einzahlung</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.monatlichGesamt)}</div>
            <div className="text-xs opacity-70 mt-1">
              (AG: {formatEuro(arbeitgeberBeitrag)} + Eigen: {formatEuro(eigenanteil)})
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Pro Jahr inkl. Zulage</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.jahrlichGesamt + ergebnis.zulageGesamt)}</div>
          </div>
        </div>

        {/* Zulage-Aufschlüsselung bei Kombi */}
        {anlageform === 'kombi' && (ergebnis.zulageBauspar > 0 || ergebnis.zulageAktien > 0) && (
          <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="opacity-80">🏠 Bauspar-Zulage</span>
              <div className="text-lg font-bold">{formatEuro(ergebnis.zulageBauspar)}</div>
            </div>
            <div>
              <span className="opacity-80">📈 Aktien-Zulage</span>
              <div className="text-lg font-bold">{formatEuro(ergebnis.zulageAktien)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Vermögensprojektion */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">💰 Vermögensentwicklung nach {laufzeit} Jahren</h3>
        
        <div className="bg-green-50 rounded-xl p-4 mb-4">
          <div className="text-sm text-green-600 mb-1">Endkapital</div>
          <div className="text-3xl font-bold text-green-700">{formatEuro(ergebnis.endkapital)}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 rounded-xl p-3">
            <span className="text-gray-500">Eigene Einzahlungen</span>
            <div className="font-bold text-gray-800">{formatEuro(ergebnis.eigenGesamt)}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <span className="text-gray-500">Vom Arbeitgeber</span>
            <div className="font-bold text-gray-800">{formatEuro(ergebnis.arbeitgeberGesamt)}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <span className="text-gray-500">Staatliche Zulagen</span>
            <div className="font-bold text-green-600">{formatEuro(ergebnis.zulagenGesamt)}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <span className="text-gray-500">Zinsen/Rendite</span>
            <div className="font-bold text-gray-800">{formatEuro(ergebnis.zinsenGesamt)}</div>
          </div>
        </div>
        
        {eigenanteil === 0 && arbeitgeberBeitrag > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
            🎁 <strong>Geschenktes Geld:</strong> Du zahlst nichts, bekommst aber {formatEuro(ergebnis.arbeitgeberGesamt)} 
            vom Arbeitgeber + {formatEuro(ergebnis.zulagenGesamt)} vom Staat!
          </div>
        )}
      </div>

      {/* Förderübersicht */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Arbeitnehmersparzulage im Detail</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium text-gray-500">Anlageform</th>
                <th className="text-right py-2 font-medium text-gray-500">Zulage</th>
                <th className="text-right py-2 font-medium text-gray-500">Max. Beitrag</th>
                <th className="text-right py-2 font-medium text-gray-500">Einkommensgrenze</th>
              </tr>
            </thead>
            <tbody>
              <tr className={`border-b border-gray-100 ${anlageform === 'bauspar' || anlageform === 'kombi' ? 'bg-green-50' : ''}`}>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span>🏠</span>
                    <span className="font-medium">Bausparvertrag</span>
                  </div>
                </td>
                <td className="text-right font-bold text-green-600">9%</td>
                <td className="text-right">470 €/Jahr</td>
                <td className="text-right text-gray-600">
                  {formatEuro(familienstand === 'verheiratet' ? BAUSPAR.einkommensgrenzeVerheiratet : BAUSPAR.einkommensgrenzeSingle)}
                </td>
              </tr>
              <tr className={anlageform === 'aktienfonds' || anlageform === 'kombi' ? 'bg-green-50' : ''}>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span>📈</span>
                    <span className="font-medium">Aktienfonds</span>
                  </div>
                </td>
                <td className="text-right font-bold text-green-600">20%</td>
                <td className="text-right">400 €/Jahr</td>
                <td className="text-right text-gray-600">
                  {formatEuro(familienstand === 'verheiratet' ? AKTIENFONDS.einkommensgrenzeVerheiratet : AKTIENFONDS.einkommensgrenzeSingle)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 font-bold">
                <td className="py-3">Kombi (Maximum)</td>
                <td className="text-right text-green-600">123 €</td>
                <td className="text-right">870 €/Jahr</td>
                <td className="text-right text-gray-600">–</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Wichtige Infos */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktionieren VL</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Arbeitgeber zahlt:</strong> VL werden vom Arbeitgeber auf dein VL-Konto überwiesen (nicht aufs Girokonto)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>7 Jahre Sperrfrist:</strong> Einzahlungen + Zulagen sind nach 7 Jahren verfügbar (6 Einzahlungsjahre + 1 Ruhejahr)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Antrag nötig:</strong> Arbeitnehmersparzulage muss mit der Steuererklärung beantragt werden (Anlage VL)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Kombination möglich:</strong> Bauspar + Aktienfonds parallel für max. 123 €/Jahr Zulage</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Auch ohne AG-Zahlung:</strong> Du kannst VL auch aus eigener Tasche einzahlen und trotzdem die Zulage bekommen</span>
          </li>
        </ul>
      </div>

      {/* Warnung bei hohem Einkommen */}
      {!ergebnis.anspruchBauspar && !ergebnis.anspruchAktien && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-amber-800 mb-3">⚠️ Kein Anspruch auf Arbeitnehmersparzulage</h3>
          <p className="text-sm text-amber-700 mb-3">
            Dein zu versteuerndes Einkommen von <strong>{formatEuro(zvE)}</strong> übersteigt die Grenzen für die 
            Arbeitnehmersparzulage.
          </p>
          <p className="text-sm text-amber-700">
            <strong>Aber:</strong> VL vom Arbeitgeber lohnen sich trotzdem! Es ist geschenktes Geld, das du fürs 
            Sparen nutzen kannst – nur ohne die zusätzliche staatliche Zulage.
          </p>
        </div>
      )}

      {/* Tipps */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-blue-800 mb-3">💡 Tipps zur Optimierung</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex gap-2">
            <span>1.</span>
            <span><strong>Arbeitgeber fragen:</strong> Viele Arbeitnehmer wissen nicht, dass ihnen VL zustehen – oft 6,65€ bis 40€/Monat</span>
          </li>
          <li className="flex gap-2">
            <span>2.</span>
            <span><strong>Aktienfonds bevorzugen:</strong> Bei gleichem Beitrag gibt es 20% statt 9% Zulage (wenn Einkommen passt)</span>
          </li>
          <li className="flex gap-2">
            <span>3.</span>
            <span><strong>Aufstocken:</strong> Mit kleinem Eigenanteil die volle Zulage mitnehmen</span>
          </li>
          <li className="flex gap-2">
            <span>4.</span>
            <span><strong>Steuererklärung machen:</strong> Sonst verfällt die Zulage! (Anlage VL nicht vergessen)</span>
          </li>
        </ul>
      </div>
{/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/vermbildg/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            5. Vermögensbildungsgesetz (VermBG)
          </a>
          <a 
            href="https://www.bundesfinanzministerium.de/Web/DE/Themen/Steuern/Steuerarten/Einkommensteuer/Arbeitnehmer_Sparzulage/arbeitnehmer_sparzulage.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF – Arbeitnehmer-Sparzulage
          </a>
          <a 
            href="https://www.verbraucherzentrale.de/wissen/geld-versicherungen/sparen-und-anlegen/vermoegenswirksame-leistungen-wann-sich-vl-lohnen-5765"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Verbraucherzentrale – Vermögenswirksame Leistungen
          </a>
        </div>
      </div>
    </div>
  );
}
