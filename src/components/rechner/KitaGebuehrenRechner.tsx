import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: September 2026) ===
//
// BERLIN: Kita und Kindertagespflege seit August 2018 beitragsfrei; Verpflegungsanteil 23 €/Monat bei Mittagessen
// (entfällt mit berlinpass-BuT); Zuzahlungen für Extras seit 2025 auf 100 €/Monat gedeckelt. (SenBJF, Kostenbeteiligung)
//
// HAMBURG: 5 Stunden/Tag beitragsfrei bis Einschulung; ab 6 Std. Elternbeitrag nach Netto-Familieneinkommen/Monat und
// Familiengröße (Broschüre "Elternbeiträge", Tabellen A–D, gültig ab August 2019, Mindest-/Höchstsätze unverändert 2026:
// 6 Std. 4–115 €, 8 Std. 11–191 €, 10 und 12 Std. 16/22–204 €). Mittagessen inklusive. Geschwister: jüngstes Kind voll,
// älteres Kind 1/3 (mind. Mindestsatz), weitere Mindestsatz. Bezieher SGB II/XII, AsylbLG, KiZ, Wohngeld: beitragsfrei.
//
// MÜNCHEN (städtische Kitas, Kita-Gebührensatzung, Broschüre 2026): Krippe nach Jahreseinkünften (Gesamtbetrag der
// Einkünfte des vorletzten Jahres) und Buchungszeit; Kindergarten durch 100-€-Beitragszuschuss des Freistaats gebührenfrei;
// Verpflegungsgeld 105 €/Monat; Geschwister: Ordnungsnummer 2 eine Einkommensstufe niedriger, ab Nr. 3 frei.
// Anpassung zum 1.9.2027 geplant (Krippe max. 330 €, Kindergarten 174 €, Verpflegung 140 €) – noch nicht beschlossen.
//
// KÖLN (Elternbeitragssatzung vom 17.4.2025, gültig ab 1.8.2025): 10 Einkommensstufen nach Jahreseinkommen (positive
// Einkünfte), 25/35/45 Wochenstunden, Altersgruppen unter 2 / 2 bis unter 3 / ab 3; Vorschulkinder (4. Geburtstag bis 30.9.)
// ab dem folgenden Kindergartenjahr beitragsfrei; nur ein Zahlkind je Familie (§ 8); Bürgergeld/Wohngeld/KiZ: beitragsfrei.
//
// STUTTGART (Satzung 4/6 mit Anlage 1, gültig 1.8.2026–31.7.2027): einkommensunabhängig, gestaffelt nach Betreuungsart und
// Anzahl der Kinder unter 18 im Haushalt; FamilienCard ermäßigt, Bonuscard befreit; 11 Monatsbeiträge (August frei);
// Essensgeld 77 €/Monat.

type Stadt = 'berlin' | 'hamburg' | 'muenchen' | 'koeln' | 'stuttgart';

// Schwellen der Zeilen "ab �" (Netto-Familieneinkommen/Monat); unter 1.023 � gilt die erste Zeile
const HH_SCHWELLEN = [1023, 1074, 1125, 1176, 1227, 1278, 1329, 1380, 1432, 1483, 1534, 1585, 1636, 1687, 1738, 1790, 1841, 1892, 1943, 1994, 2045, 2096, 2147, 2199, 2250, 2301, 2352, 2403, 2454, 2505, 2556, 2608, 2659, 2710, 2761, 2812, 2863, 2914, 2965, 3017, 3068, 3119, 3170, 3221, 3272, 3323, 3375];
const HH_TAB_6 = [[4,4,4,4,4], [4,4,4,4,4], [4,4,4,4,4], [4,4,4,4,4], [4,4,4,4,4], [4,4,4,4,4], [4,4,4,4,4], [5,4,4,4,4], [5,4,4,4,4], [5,4,4,4,4], [6,5,4,4,4], [7,6,4,4,4], [7,6,4,4,4], [7,6,4,4,4], [8,7,4,4,4], [9,8,5,4,4], [9,9,6,4,4], [10,9,7,4,4], [11,10,7,4,4], [11,11,8,4,4], [12,12,9,5,4], [14,13,10,7,4], [15,14,12,8,4], [17,15,12,9,4], [17,17,13,9,6], [18,17,14,11,7], [19,18,15,12,8], [20,19,17,13,9], [21,21,17,14,10], [22,22,19,15,11], [24,22,20,16,12], [24,24,22,18,13], [35,25,23,19,14], [46,37,24,20,16], [58,48,24,22,17], [69,60,36,23,19], [82,72,48,24,20], [94,85,61,30,22], [107,98,73,43,23], [115,111,86,55,25], [115,115,99,68,31], [115,115,112,82,45], [115,115,115,94,58], [115,115,115,107,70], [115,115,115,115,83], [115,115,115,115,96], [115,115,115,115,109], [115,115,115,115,115]];
const HH_TAB_8 = [[11,11,11,11,11], [12,11,11,11,11], [12,11,11,11,11], [12,11,11,11,11], [13,11,11,11,11], [13,11,11,11,11], [14,11,11,11,11], [15,12,11,11,11], [16,12,11,11,11], [17,14,11,11,11], [18,16,11,11,11], [21,17,11,11,11], [22,19,11,11,11], [24,20,11,11,11], [25,22,14,11,11], [28,25,16,11,11], [30,28,18,11,11], [32,29,21,11,11], [35,31,23,11,11], [37,35,25,14,11], [40,38,28,17,11], [44,41,32,21,11], [48,44,35,24,11], [51,48,38,28,14], [54,51,41,30,17], [57,54,45,34,21], [61,57,48,37,24], [64,61,52,41,28], [67,65,55,44,31], [71,68,58,47,34], [75,71,63,51,38], [77,76,67,56,42], [91,79,71,59,45], [105,94,75,64,50], [120,108,77,68,54], [135,123,93,72,59], [150,139,108,77,64], [166,154,123,85,68], [182,171,140,101,72], [191,186,156,117,77], [191,191,172,134,88], [191,191,188,150,104], [191,191,191,166,120], [191,191,191,182,136], [191,191,191,191,152], [191,191,191,191,168], [191,191,191,191,184], [191,191,191,191,191]];
const HH_TAB_10 = [[16,16,16,16,16], [17,16,16,16,16], [17,16,16,16,16], [18,16,16,16,16], [19,16,16,16,16], [19,16,16,16,16], [20,16,16,16,16], [22,17,16,16,16], [23,18,16,16,16], [25,20,16,16,16], [27,23,16,16,16], [30,25,16,16,16], [32,27,16,16,16], [35,29,16,16,16], [37,32,19,16,16], [41,36,23,16,16], [44,39,26,16,16], [47,42,29,16,16], [51,46,33,16,16], [54,50,36,20,16], [58,55,41,24,16], [64,58,46,29,16], [69,64,51,34,16], [74,69,55,39,19], [78,74,60,44,24], [83,78,65,48,29], [88,83,70,54,34], [93,88,75,58,39], [98,94,80,64,45], [103,99,86,69,50], [109,104,91,74,55], [113,110,97,81,61], [129,116,103,87,66], [145,132,109,92,72], [161,149,114,99,79], [178,165,131,105,86], [196,183,148,112,92], [204,201,166,122,99], [204,204,184,140,105], [204,204,202,159,113], [204,204,204,177,125], [204,204,204,195,143], [204,204,204,204,161], [204,204,204,204,180], [204,204,204,204,198], [204,204,204,204,204], [204,204,204,204,204], [204,204,204,204,204]];
const HH_TAB_12 = [[22,22,22,22,22], [22,22,22,22,22], [23,22,22,22,22], [24,22,22,22,22], [24,22,22,22,22], [25,22,22,22,22], [26,22,22,22,22], [28,22,22,22,22], [31,24,22,22,22], [33,26,22,22,22], [36,30,22,22,22], [39,33,22,22,22], [42,36,22,22,22], [45,38,22,22,22], [49,42,25,22,22], [54,47,30,22,22], [57,52,34,22,22], [62,55,38,22,22], [67,60,43,22,22], [71,66,48,26,22], [77,72,54,32,22], [84,77,60,38,22], [90,84,67,45,22], [97,90,72,52,25], [102,97,79,57,32], [109,102,85,64,38], [115,109,92,71,45], [122,115,98,77,52], [128,123,105,84,58], [135,130,112,91,65], [143,136,119,98,73], [149,144,127,106,79], [166,152,135,114,87], [184,170,143,122,95], [203,188,150,130,104], [204,204,168,138,113], [204,204,188,146,121], [204,204,204,159,130], [204,204,204,180,138], [204,204,204,200,148], [204,204,204,204,162], [204,204,204,204,182], [204,204,204,204,203], [204,204,204,204,204], [204,204,204,204,204], [204,204,204,204,204], [204,204,204,204,204], [204,204,204,204,204]];

// München Krippe: Zeilen bis 60.000 / bis 70.000 / bis 80.000 / über 80.000 €; Spalten bis 4/5/6/7/8/9/über 9 Std.
const MUC_GRENZEN = [60000, 70000, 80000];
const MUC_KRIPPE = [[100, 100, 100, 100, 100, 100, 100], [115, 130, 145, 160, 175, 190, 205], [130, 147, 164, 181, 198, 215, 232], [145, 162, 179, 196, 213, 230, 250]];
const MUC_VERPFLEGUNG = 105;

// Köln: Einkommensstufen 1–10 (Obergrenzen), Tabellen je Altersgruppe: Zeilen 25/35/45 Wochenstunden
const K_GRENZEN = [24542, 36813, 49084, 61355, 78000, 100000, 120000, 140000, 160000];
const K_U2 = [[0, 120.02, 190.73, 268.64, 331.51, 430.96, 517.15, 594.72, 620.58, 672.30], [0, 133.36, 211.92, 298.49, 368.35, 478.86, 574.63, 660.82, 689.56, 747.02], [0, 148.18, 235.47, 331.65, 409.29, 532.06, 638.48, 734.25, 766.18, 830.02]];
const K_U3 = [[0, 120.02, 181.65, 244.22, 276.26, 331.51, 397.81, 457.48, 477.37, 517.15], [0, 133.36, 201.83, 271.35, 306.96, 368.35, 442.02, 508.32, 530.42, 574.63], [0, 148.18, 224.26, 301.50, 341.07, 409.28, 491.14, 564.81, 589.37, 638.48]];
const K_UE3 = [[0, 31.52, 70.73, 112.85, 148.46, 178.15, 213.78, 245.85, 256.54, 277.91], [0, 35.03, 78.59, 125.39, 164.96, 197.95, 237.54, 273.17, 285.05, 308.80], [0, 42.00, 123.67, 193.94, 256.36, 307.63, 369.16, 424.53, 442.99, 479.91]];

// Stuttgart Anlage 1: Spalten VÖ 6 Std / VÖ 7 Std / GT 8 Std / GT +1 Std / GT +2 Std; Zeilen 1 / 2 / 3 / 4+ Kinder; [FamilienCard, Vollzahler]
const S_U3 = [[[104, 195], [122, 215], [146, 243], [165, 264], [184, 284]], [[76, 165], [90, 180], [108, 202], [123, 218], [137, 233]], [[0, 119], [0, 126], [0, 138], [0, 145], [0, 153]], [[0, 114], [0, 120], [0, 131], [0, 138], [0, 144]]];
const S_UE3 = [[[57, 117], [75, 136], [98, 160], [116, 180], [134, 200]], [[31, 88], [44, 102], [61, 120], [75, 135], [88, 150]], [[0, 42], [0, 49], [0, 58], [0, 65], [0, 72]], [[0, 38], [0, 44], [0, 52], [0, 58], [0, 64]]];
const S_ESSEN = 77;
const BERLIN_ESSEN = 23;

const STAEDTE: { id: Stadt; name: string }[] = [
  { id: 'berlin', name: 'Berlin' }, { id: 'hamburg', name: 'Hamburg' }, { id: 'muenchen', name: 'München' }, { id: 'koeln', name: 'Köln' }, { id: 'stuttgart', name: 'Stuttgart' },
];

const fmt = (n: number) => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmt2 = (n: number) => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface Eingaben {
  alter: number; stunden: number; erwachsene: number; kinder: number; juengeresKind: boolean; aeltereGeschwister: number;
  nettoMonat: number; bruttoJahr: number; sozialleistung: boolean; familienCard: boolean; essen: boolean;
}
interface Ergebnis { beitrag: number; essen: number; regel: string; hinweis?: string }

function berechne(stadt: Stadt, e: Eingaben): Ergebnis {
  const u3 = e.alter < 3;
  if (e.sozialleistung) {
    return { beitrag: 0, essen: 0, regel: stadt === 'stuttgart' ? 'Bonuscard: Befreiung vom Elternbeitrag, Essensgeld über Bildung und Teilhabe' : 'Beitragsfrei bei Bezug von Bürgergeld, Sozialhilfe, Wohngeld oder Kinderzuschlag, Mittagessen über Bildung und Teilhabe' };
  }
  switch (stadt) {
    case 'berlin':
      return { beitrag: 0, essen: e.essen ? BERLIN_ESSEN : 0, regel: 'Kita seit 2018 beitragsfrei, nur Verpflegungsanteil 23 € bei Mittagessen' };
    case 'hamburg': {
      if (e.stunden <= 5) return { beitrag: 0, essen: 0, regel: 'Bis 5 Stunden täglich beitragsfrei (Grundbetreuung), Mittagessen inklusive' };
      const tab = e.stunden <= 6 ? HH_TAB_6 : e.stunden <= 8 ? HH_TAB_8 : e.stunden <= 10 ? HH_TAB_10 : HH_TAB_12;
      const minSatz = tab[0][0];
      let zeile = 0;
      for (let i = 0; i < HH_SCHWELLEN.length; i++) if (e.nettoMonat >= HH_SCHWELLEN[i]) zeile = i + 1;
      const spalte = Math.min(6, Math.max(2, e.erwachsene + e.kinder)) - 2;
      let beitrag = tab[zeile][spalte];
      let hinweis: string | undefined;
      if (e.juengeresKind) { beitrag = Math.max(minSatz, Math.round(beitrag / 3)); hinweis = 'Älteres Geschwisterkind: ein Drittel des regulären Beitrags, mindestens Mindestsatz'; }
      const tabName = e.stunden <= 6 ? 'A (6 Std.)' : e.stunden <= 8 ? 'B (8 Std.)' : e.stunden <= 10 ? 'C (10 Std.)' : 'D (12 Std.)';
      const eink = zeile === 0 ? 'unter 1.023 €' : 'ab ' + fmt(HH_SCHWELLEN[zeile - 1]);
      return { beitrag, essen: 0, regel: 'Tabelle ' + tabName + ', Familie mit ' + (spalte + 2) + ' Personen, Nettoeinkommen ' + eink + '. Mittagessen inklusive', hinweis };
    }
    case 'muenchen': {
      if (!u3) return { beitrag: 0, essen: e.essen ? MUC_VERPFLEGUNG : 0, regel: 'Kindergarten: Besuchsgebühr (max. 100 €) wird mit dem staatlichen Beitragszuschuss von 100 € verrechnet, nur Verpflegungsgeld 105 €' };
      if (e.aeltereGeschwister >= 2) return { beitrag: 0, essen: e.essen ? MUC_VERPFLEGUNG : 0, regel: 'Geschwisterermäßigung: ab Ordnungsnummer 3 vollständig von der Besuchsgebühr befreit', hinweis: 'Antrag jährlich erforderlich' };
      let zeile = 3;
      for (let i = MUC_GRENZEN.length - 1; i >= 0; i--) if (e.bruttoJahr <= MUC_GRENZEN[i]) zeile = i;
      let hinweis: string | undefined;
      if (e.aeltereGeschwister === 1) { zeile = Math.max(0, zeile - 1); hinweis = 'Geschwisterermäßigung (Ordnungsnummer 2): eine Einkommensstufe niedriger'; }
      const spalte = e.stunden <= 4 ? 0 : e.stunden <= 5 ? 1 : e.stunden <= 6 ? 2 : e.stunden <= 7 ? 3 : e.stunden <= 8 ? 4 : e.stunden <= 9 ? 5 : 6;
      const eink = zeile === 3 ? 'über 80.000 €' : 'bis ' + fmt(MUC_GRENZEN[zeile]);
      return { beitrag: MUC_KRIPPE[zeile][spalte], essen: e.essen ? MUC_VERPFLEGUNG : 0, regel: 'Krippe, Einkünfte ' + eink + ', Buchungszeit ' + (e.stunden > 9 ? 'über 9' : 'bis ' + e.stunden) + ' Std., plus Verpflegungsgeld', hinweis };
    }
    case 'koeln': {
      if (e.alter >= 4) return { beitrag: 0, essen: 0, regel: 'Vorschulkind: ab dem Kindergartenjahr nach dem 4. Geburtstag (Stichtag 30.9.) bis zur Einschulung beitragsfrei', hinweis: 'Verpflegung legt der Träger fest' };
      if (e.juengeresKind) return { beitrag: 0, essen: 0, regel: 'Geschwisterregel § 8: nur ein Zahlkind je Familie, das jüngere Kind mit dem höheren Beitrag zahlt', hinweis: 'Verpflegung legt der Träger fest' };
      let stufe = 9;
      for (let i = K_GRENZEN.length - 1; i >= 0; i--) if (e.bruttoJahr <= K_GRENZEN[i]) stufe = i;
      const tab = e.alter < 2 ? K_U2 : e.alter < 3 ? K_U3 : K_UE3;
      const zeile = e.stunden <= 5 ? 0 : e.stunden <= 7 ? 1 : 2;
      const gruppe = e.alter < 2 ? 'Unter 2 Jahre' : e.alter < 3 ? '2 bis unter 3 Jahre' : 'Ab 3 Jahre';
      const eink = stufe === 9 ? 'über 160.000 €' : 'bis ' + fmt(K_GRENZEN[stufe]);
      return { beitrag: tab[zeile][stufe], essen: 0, regel: gruppe + ', ' + [25, 35, 45][zeile] + ' Wochenstunden, Einkommensstufe ' + (stufe + 1) + ' (' + eink + ')', hinweis: 'Verpflegung legt der Träger fest' };
    }
    case 'stuttgart': {
      const tab = u3 ? S_U3 : S_UE3;
      const zeile = Math.min(4, Math.max(1, e.kinder)) - 1;
      const spalte = e.stunden <= 6 ? 0 : e.stunden <= 7 ? 1 : e.stunden <= 8 ? 2 : e.stunden <= 9 ? 3 : 4;
      const beitrag = tab[zeile][spalte][e.familienCard ? 0 : 1];
      const art = ['VÖ 6 Std.', 'VÖ 7 Std.', 'Ganztag 8 Std.', 'Ganztag + 1 Std. Früh/Spät', 'Ganztag + 2 Std. Früh/Spät'][spalte];
      const kinderText = Math.min(4, e.kinder) + (e.kinder >= 4 ? '+' : '') + (e.kinder === 1 ? ' Kind' : ' Kinder');
      return { beitrag, essen: e.essen ? S_ESSEN : 0, regel: (u3 ? 'Kleinkind (inkl. Kleinkindzuschlag)' : 'Kindergartenkind') + ', ' + art + ', ' + kinderText + ' im Haushalt, ' + (e.familienCard ? 'FamilienCard' : 'Vollzahler') + '; 11 Beiträge pro Jahr (August frei)' };
    }
  }
}

export default function KitaGebuehrenRechner() {
  const [stadt, setStadt] = useState<Stadt>('hamburg');
  const [alter, setAlter] = useState(2);
  const [stunden, setStunden] = useState(8);
  const [erwachsene, setErwachsene] = useState(2);
  const [kinder, setKinder] = useState(1);
  const [juengeresKind, setJuengeresKind] = useState(false);
  const [aeltereGeschwister, setAeltereGeschwister] = useState(0);
  const [nettoMonat, setNettoMonat] = useState(4200);
  const [bruttoJahr, setBruttoJahr] = useState(75000);
  const [sozialleistung, setSozialleistung] = useState(false);
  const [familienCard, setFamilienCard] = useState(false);
  const [essen, setEssen] = useState(true);

  const eingaben: Eingaben = { alter, stunden, erwachsene, kinder, juengeresKind, aeltereGeschwister, nettoMonat, bruttoJahr, sozialleistung, familienCard, essen };
  const ergebnis = useMemo(() => berechne(stadt, eingaben), [stadt, alter, stunden, erwachsene, kinder, juengeresKind, aeltereGeschwister, nettoMonat, bruttoJahr, sozialleistung, familienCard, essen]);
  const vergleich = useMemo(() => STAEDTE.map((s) => ({ ...s, ...berechne(s.id, eingaben) })), [alter, stunden, erwachsene, kinder, juengeresKind, aeltereGeschwister, nettoMonat, bruttoJahr, sozialleistung, familienCard, essen]);

  const btn = (aktiv: boolean) => 'py-2 px-2 rounded-xl font-medium transition-all text-sm ' + (aktiv ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200');
  const inputCls = 'w-full text-lg font-bold text-center py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-0 outline-none';
  const gesamt = ergebnis.beitrag + ergebnis.essen;
  const stadtName = STAEDTE.find((s) => s.id === stadt)!.name;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">1. Stadt und Kind</h3>
        <div className="grid grid-cols-5 gap-1 mb-4">{STAEDTE.map((s) => <button key={s.id} onClick={() => setStadt(s.id)} className={btn(stadt === s.id)}>{s.name}</button>)}</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <span className="text-gray-700 font-medium block mb-2 text-sm">Alter des Kindes (Jahre)</span>
            <div className="grid grid-cols-6 gap-1">{[0, 1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setAlter(n)} className={btn(alter === n)}>{n}</button>)}</div>
          </div>
          <div>
            <span className="text-gray-700 font-medium block mb-2 text-sm">Betreuung pro Tag (Stunden)</span>
            <div className="grid grid-cols-7 gap-1">{[4, 5, 6, 7, 8, 9, 10].map((n) => <button key={n} onClick={() => setStunden(n)} className={btn(stunden === n)}>{n}</button>)}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">2. Familie und Einkommen</h3>
        <p className="text-xs text-gray-500 mb-4">Jede Stadt rechnet mit einem anderen Einkommensbegriff. Füllen Sie beide Felder aus, dann stimmt auch der Städtevergleich.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Netto-Familieneinkommen pro Monat <span className="text-gray-400">(Hamburg)</span></label><div className="relative"><input type="number" value={nettoMonat} onChange={(e) => setNettoMonat(Math.max(0, Number(e.target.value) || 0))} className={inputCls} min="0" step="100" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span></div></div>
          <div><label className="block mb-1 text-sm text-gray-700 font-medium">Jahreseinkünfte der Eltern brutto <span className="text-gray-400">(München, Köln)</span></label><div className="relative"><input type="number" value={bruttoJahr} onChange={(e) => setBruttoJahr(Math.max(0, Number(e.target.value) || 0))} className={inputCls} min="0" step="1000" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span></div></div>
          <div>
            <span className="text-gray-700 font-medium block mb-2 text-sm">Erwachsene im Haushalt</span>
            <div className="grid grid-cols-2 gap-1">{[1, 2].map((n) => <button key={n} onClick={() => setErwachsene(n)} className={btn(erwachsene === n)}>{n}</button>)}</div>
          </div>
          <div>
            <span className="text-gray-700 font-medium block mb-2 text-sm">Kinder unter 18 im Haushalt (inkl. dieses Kind)</span>
            <div className="grid grid-cols-4 gap-1">{[1, 2, 3, 4].map((n) => <button key={n} onClick={() => { setKinder(n); if (n === 1) { setJuengeresKind(false); setAeltereGeschwister(0); } }} className={btn(kinder === n)}>{n}{n === 4 ? '+' : ''}</button>)}</div>
          </div>
          {kinder > 1 && (
            <>
              <div>
                <span className="text-gray-700 font-medium block mb-2 text-sm">Ältere Geschwister mit Kindergeld <span className="text-gray-400">(München)</span></span>
                <div className="grid grid-cols-3 gap-1">{[0, 1, 2].map((n) => <button key={n} onClick={() => setAeltereGeschwister(n)} className={btn(aeltereGeschwister === n)}>{n}{n === 2 ? '+' : ''}</button>)}</div>
              </div>
              <label className="flex items-start gap-2 cursor-pointer text-sm text-gray-700 sm:pt-7"><input type="checkbox" checked={juengeresKind} onChange={(e) => setJuengeresKind(e.target.checked)} className="w-5 h-5 mt-0.5 accent-rose-500" />Jüngeres Geschwisterkind gleichzeitig in Kita/Tagespflege <span className="text-gray-400">(Hamburg, Köln)</span></label>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-700">
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={essen} onChange={(e) => setEssen(e.target.checked)} className="w-5 h-5 accent-rose-500" />Mittagessen in der Kita</label>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={familienCard} onChange={(e) => setFamilienCard(e.target.checked)} className="w-5 h-5 accent-rose-500" />Stuttgarter FamilienCard</label>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={sozialleistung} onChange={(e) => setSozialleistung(e.target.checked)} className="w-5 h-5 accent-rose-500" />Bürgergeld, Wohngeld oder Kinderzuschlag</label>
        </div>
      </div>

      <div className="bg-gradient-to-br from-rose-500 to-pink-700 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🧸 Kita-Kosten in {stadtName} pro Monat</h3>
        <div className="mb-4">
          <div className="text-4xl sm:text-5xl font-bold">{fmt2(gesamt)}</div>
          <p className="mt-2 text-sm opacity-90">{ergebnis.regel}.{ergebnis.hinweis ? ' ' + ergebnis.hinweis + '.' : ''}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Elternbeitrag</span><div className="text-xl font-bold">{fmt2(ergebnis.beitrag)}</div></div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Verpflegung</span><div className="text-xl font-bold">{stadt === 'koeln' ? 'je Träger' : stadt === 'hamburg' ? 'inklusive' : fmt2(ergebnis.essen)}</div></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">🏙️ Dasselbe Kind in fünf Städten</h3>
        <p className="text-xs text-gray-500 mb-4">Elternbeitrag plus städtisches Essensgeld pro Monat bei Ihren Eingaben. Köln: Verpflegung nicht enthalten (Trägersache), Hamburg: Mittagessen im Beitrag enthalten.</p>
        <table className="w-full text-sm">
          <thead><tr className="border-b-2 border-gray-200"><th className="text-left py-2 font-semibold text-gray-700">Stadt</th><th className="text-right py-2 font-semibold text-gray-700">Beitrag</th><th className="text-right py-2 font-semibold text-gray-700">Essen</th><th className="text-right py-2 font-semibold text-gray-700">Gesamt</th><th className="text-right py-2 font-semibold text-gray-700">pro Jahr</th></tr></thead>
          <tbody>
            {vergleich.map((v) => (
              <tr key={v.id} className={'border-b border-gray-100 ' + (v.id === stadt ? 'bg-rose-50 font-bold text-rose-800' : 'text-gray-700')}>
                <td className="py-2">{v.name}</td><td className="py-2 text-right">{fmt2(v.beitrag)}</td><td className="py-2 text-right">{v.id === 'koeln' ? '–' : v.id === 'hamburg' ? 'inkl.' : fmt2(v.essen)}</td><td className="py-2 text-right">{fmt2(v.beitrag + v.essen)}</td><td className="py-2 text-right">{fmt((v.beitrag + v.essen) * (v.id === 'stuttgart' ? 11 : 12))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-xs text-gray-500">
        <strong>Hinweis:</strong> Der Rechner bildet die Gebührentabellen der städtischen bzw. gebührengeregelten Kitas ab (Berlin und Hamburg: alle Träger
        im Gutscheinsystem; München: städtische Kitas und Einrichtungen der Münchner Kita-Förderung; Köln: alle Kitas nach der Elternbeitragssatzung;
        Stuttgart: städtische Kitas). Freie Träger in München und Stuttgart, Elterninitiativen und private Kitas können abweichen. Nicht berücksichtigt:
        Härtefallregelungen, Kindertagespflege, Hort, Frühförderung, das Bayerische Krippengeld (bis 100 €, Kinder vor 2025 geboren, Einkommensgrenze),
        Kölner Zuschlag von 10 % für Beamte (§ 4 Abs. 4) und Abzug der Kinderfreibeträge ab dem dritten Kind, Stuttgarter Kleinkindzuschlag nur einmal
        bei mehreren Kleinkindern. Verbindlich ist der Gebührenbescheid.
      </div>

      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a href="https://www.berlin.de/sen/jugend/familie-und-kinder/kindertagesbetreuung/kostenbeteiligung/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">Berlin, SenBJF – Kostenbeteiligung: beitragsfrei seit 2018, Verpflegungsanteil 23 €, Zuzahlungsdeckel 100 €</a>
          <a href="https://www.hamburg.de/politik-und-verwaltung/behoerden/bsfb/familie/kinderbetreuung/elterninformationen/elternbeitrag-hoehe-35372" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">Hamburg, Sozialbehörde – Höhe der Elternbeiträge (Mindest-/Höchstsätze) und Broschüre „Elternbeiträge“ (Tabellen A–D)</a>
          <a href="https://www.hamburg.de/politik-und-verwaltung/behoerden/bsfb/familie/kinderbetreuung/elterninformationen/elternbeitrag-berechnung-35312" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">Hamburg – Berechnung des Elternbeitrags: Familieneinkommen, Familiengröße, Geschwisterregel</a>
          <a href="https://stadt.muenchen.de/infos/kosten-kita-platz.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">München, Referat für Bildung und Sport – Kosten für einen Kita-Platz, Gebührentabelle Besuchsgebühr und Broschüre 2026</a>
          <a href="https://www.stadt-koeln.de/mediaasset/content/satzungen/elternbeitraege_20250417.pdf" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">Köln – Satzung über die Erhebung von Elternbeiträgen vom 17.04.2025 (§§ 4, 8, 9), gültig ab 1.8.2025</a>
          <a href="https://www.stuttgart.de/rathaus/verwaltung/stadtrecht/4/anlagen-1-bis-5-zu-4-6-verzeichnis-der-kostenbeitraege-und-des-essensgeldes-pro-monat" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">Stuttgart – Satzung 4/6 und Anlage 1: Verzeichnis der Kostenbeiträge und des Essensgeldes ab 1.8.2026</a>
        </div>
      </div>
    </div>
  );
}
