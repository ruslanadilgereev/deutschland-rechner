/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, u as unescapeHTML, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DmT1JwUR.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const MIETSTUFEN = ["I", "II", "III", "IV", "V", "VI", "VII"];
const HOECHSTBETRAEGE = {
  "I": [490.6, 604.4, 720.8, 840.2, 958.6],
  "II": [537.6, 660.4, 786.8, 918.2, 1046.6],
  "III": [585.6, 718.4, 856.8, 998.2, 1139.6],
  "IV": [640.6, 786.4, 936.8, 1090.2, 1246.6],
  "V": [691.6, 847.4, 1008.8, 1178.2, 1344.6],
  "VI": [744.6, 912.4, 1086.8, 1267.2, 1447.6],
  "VII": [806.6, 987.4, 1174.8, 1371.2, 1566.6]
};
const MEHRBETRAG_PRO_PERSON = {
  "I": 114.4,
  "II": 126.4,
  "III": 138.4,
  "IV": 151.4,
  "V": 161.4,
  "VI": 181.4,
  "VII": 195.4
};
const KOEFFIZIENTEN = {
  1: { a: 0.04, b: 4991e-7, c: 462e-7 },
  // 0.04, 0.0004991, 0.0000462
  2: { a: 0.03, b: 3716e-7, c: 345e-7 },
  // 0.03, 0.0003716, 0.0000345
  3: { a: 0.02, b: 3035e-7, c: 278e-7 },
  // 0.02, 0.0003035, 0.0000278
  4: { a: 0.01, b: 2251e-7, c: 2e-5 },
  // 0.01, 0.0002251, 0.00002
  5: { a: 0, b: 1985e-7, c: 195e-7 },
  // 0, 0.0001985, 0.0000195
  6: { a: -0.01, b: 1792e-7, c: 188e-7 },
  // -0.01, 0.0001792, 0.0000188
  7: { a: -0.02, b: 1657e-7, c: 187e-7 },
  // -0.02, 0.0001657, 0.0000187
  8: { a: -0.03, b: 1648e-7, c: 187e-7 },
  // -0.03, 0.0001648, 0.0000187
  9: { a: -0.04, b: 1432e-7, c: 188e-7 },
  // -0.04, 0.0001432, 0.0000188
  10: { a: -0.06, b: 13e-5, c: 188e-7 },
  // -0.06, 0.00013, 0.0000188
  11: { a: -0.09, b: 1188e-7, c: 222e-7 },
  // -0.09, 0.0001188, 0.0000222
  12: { a: -0.12, b: 1152e-7, c: 251e-7 }
  // -0.12, 0.0001152, 0.0000251
};
const ZUSATZ_AB_13_PERSON = 57;
const FREIBETRAEGE = {
  // Werbungskostenpauschale (jährlich, § 16 Abs. 1 Nr. 2 WoGG)
  werbungskosten_pauschal: 1230,
  // 102.50€/Monat
  // Erwerbstätigenfreibetrag (§ 17 Nr. 3 WoGG): 10% vom Brutto, max. 100€/Monat = 1200€/Jahr
  erwerbstaetig_prozent: 0.1,
  erwerbstaetig_max_jahr: 1200,
  // Schwerbehinderten-Pauschbetrag (§ 17 Nr. 4 WoGG, jährlich)
  schwerbehindert_50_80: 1800,
  // GdB 50-80
  schwerbehindert_80_100: 2100,
  // GdB 80-100 oder häusliche Pflege
  // Alleinerziehenden-Freibetrag (§ 17 Nr. 5 WoGG, jährlich pro Kind)
  alleinerziehend: 1320
};
const BEISPIELSTAEDTE = {
  "I": ["Chemnitz", "Halle (Saale)", "Magdeburg", "Gera", "Cottbus"],
  "II": ["Leipzig", "Dresden", "Erfurt", "Rostock", "Kiel"],
  "III": ["Hannover", "Bremen", "Dortmund", "Essen", "Duisburg"],
  "IV": ["Köln", "Düsseldorf", "Hamburg", "Nürnberg", "Bonn"],
  "V": ["Berlin", "Potsdam", "Mainz", "Wiesbaden"],
  "VI": ["Frankfurt a.M.", "Stuttgart", "Freiburg", "Heidelberg"],
  "VII": ["München", "Starnberg", "Miesbach", "Garmisch-Partenkirchen"]
};
const EINKOMMENSGRENZEN = {
  "I": [1443, 1953, 2453, 3324, 3822],
  "II": [1530, 2074, 2610, 3542, 4077],
  "III": [1620, 2199, 2773, 3769, 4341],
  "IV": [1713, 2327, 2942, 4004, 4617],
  "V": [1803, 2451, 3104, 4229, 4880],
  "VI": [1896, 2580, 3273, 4465, 5158],
  "VII": [1992, 2715, 3451, 4714, 5451]
};
function getHoechstbetrag(mietstufe, personen) {
  if (personen <= 5) {
    return HOECHSTBETRAEGE[mietstufe][personen - 1];
  }
  const basis = HOECHSTBETRAEGE[mietstufe][4];
  const mehrbetrag = MEHRBETRAG_PRO_PERSON[mietstufe] * (personen - 5);
  return basis + mehrbetrag;
}
function getEinkommensgrenze(mietstufe, personen) {
  if (personen <= 5) {
    return EINKOMMENSGRENZEN[mietstufe][personen - 1];
  }
  return EINKOMMENSGRENZEN[mietstufe][4] + (personen - 5) * 500;
}
function WohngeldRechner() {
  const [bruttoeinkommen, setBruttoeinkommen] = useState(1800);
  const [warmmiete, setWarmmiete] = useState(650);
  const [haushaltsgroesse, setHaushaltsgroesse] = useState(2);
  const [mietstufe, setMietstufe] = useState("III");
  const [schwerbehindert, setSchwerbehindert] = useState("none");
  const [alleinerziehend, setAlleinerziehend] = useState(false);
  const [anzahlKinder, setAnzahlKinder] = useState(0);
  const [istErwerbstaetig, setIstErwerbstaetig] = useState(true);
  const ergebnis = useMemo(() => {
    const jahresbrutto = bruttoeinkommen * 12;
    const werbungskosten = FREIBETRAEGE.werbungskosten_pauschal;
    const erwerbstaetigenfreibetrag = istErwerbstaetig ? Math.min(jahresbrutto * FREIBETRAEGE.erwerbstaetig_prozent, FREIBETRAEGE.erwerbstaetig_max_jahr) : 0;
    let schwerbehindertenfreibetrag = 0;
    if (schwerbehindert === "50-80") {
      schwerbehindertenfreibetrag = FREIBETRAEGE.schwerbehindert_50_80;
    } else if (schwerbehindert === "80-100") {
      schwerbehindertenfreibetrag = FREIBETRAEGE.schwerbehindert_80_100;
    }
    const alleinerziehendenfreibetrag = alleinerziehend ? FREIBETRAEGE.alleinerziehend * Math.max(1, anzahlKinder) : 0;
    const gesamtfreibetraege = werbungskosten + erwerbstaetigenfreibetrag + schwerbehindertenfreibetrag + alleinerziehendenfreibetrag;
    const anrechenbaresEinkommenJahr = Math.max(0, jahresbrutto - gesamtfreibetraege);
    const anrechenbaresEinkommenMonat = anrechenbaresEinkommenJahr / 12;
    const hoechstbetrag = getHoechstbetrag(mietstufe, haushaltsgroesse);
    const beruecksichtigteMiete = Math.min(warmmiete, hoechstbetrag);
    const anzahlPersonen = Math.min(haushaltsgroesse, 12);
    const koeff = KOEFFIZIENTEN[anzahlPersonen];
    const M = beruecksichtigteMiete;
    const Y = anrechenbaresEinkommenMonat;
    const z1 = koeff.a + koeff.b * M + koeff.c * Y;
    const z2 = z1 * Y;
    const z3 = M - z2;
    const z4 = 1.15 * z3;
    let zusatzAbPerson13 = 0;
    if (haushaltsgroesse > 12) {
      zusatzAbPerson13 = (haushaltsgroesse - 12) * ZUSATZ_AB_13_PERSON;
    }
    let wohngeldMonatlich = Math.ceil(z4) + zusatzAbPerson13;
    wohngeldMonatlich = Math.min(wohngeldMonatlich, M);
    if (wohngeldMonatlich < 10) {
      wohngeldMonatlich = 0;
    }
    const einkommensgrenze = getEinkommensgrenze(mietstufe, haushaltsgroesse);
    const hatAnspruch = wohngeldMonatlich >= 10;
    const wohngeldJaehrlich = wohngeldMonatlich * 12;
    return {
      // Einkommen
      bruttoMonat: bruttoeinkommen,
      bruttoJahr: jahresbrutto,
      werbungskosten,
      erwerbstaetigenfreibetrag: Math.round(erwerbstaetigenfreibetrag),
      schwerbehindertenfreibetrag,
      alleinerziehendenfreibetrag,
      gesamtfreibetraege: Math.round(gesamtfreibetraege),
      anrechenbaresEinkommenJahr: Math.round(anrechenbaresEinkommenJahr),
      anrechenbaresEinkommenMonat: Math.round(anrechenbaresEinkommenMonat),
      // Miete
      warmmiete,
      hoechstbetrag,
      beruecksichtigteMiete,
      mieteGekappt: warmmiete > hoechstbetrag,
      // Formel-Zwischenwerte (für Nachvollziehbarkeit)
      koeffizienten: koeff,
      z1: z1.toFixed(10),
      z2: z2.toFixed(2),
      z3: z3.toFixed(2),
      z4Ungerundet: z4.toFixed(2),
      // Ergebnis
      wohngeldMonatlich,
      wohngeldJaehrlich,
      hatAnspruch,
      einkommensgrenze,
      // Zusatzinfo
      mietstufe,
      haushaltsgroesse
    };
  }, [bruttoeinkommen, warmmiete, haushaltsgroesse, mietstufe, schwerbehindert, alleinerziehend, anzahlKinder, istErwerbstaetig]);
  const formatEuro = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";
  const formatEuro2 = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Haushaltsgröße" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setHaushaltsgroesse(Math.max(1, haushaltsgroesse - 1)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors",
              children: "−"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "text-center px-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-4xl font-bold text-gray-800", children: haushaltsgroesse }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: haushaltsgroesse === 1 ? "Person" : "Personen" })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setHaushaltsgroesse(Math.min(12, haushaltsgroesse + 1)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors",
              children: "+"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Monatliches Bruttoeinkommen (Haushalt gesamt)" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Alle Einkünfte vor Steuern" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: bruttoeinkommen,
              onChange: (e) => setBruttoeinkommen(Math.max(0, Number(e.target.value))),
              className: "w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none",
              min: "0",
              max: "10000",
              step: "50"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl", children: "€" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: bruttoeinkommen,
            onChange: (e) => setBruttoeinkommen(Number(e.target.value)),
            className: "w-full mt-3 accent-purple-500",
            min: "0",
            max: "5000",
            step: "50"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "0 €" }),
          /* @__PURE__ */ jsx("span", { children: "2.500 €" }),
          /* @__PURE__ */ jsx("span", { children: "5.000 €" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Monatliche Warmmiete" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Kaltmiete + Nebenkosten + Heizung" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: warmmiete,
              onChange: (e) => setWarmmiete(Math.max(0, Number(e.target.value))),
              className: "w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none",
              min: "0",
              max: "3000",
              step: "10"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg", children: "€" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: warmmiete,
            onChange: (e) => setWarmmiete(Number(e.target.value)),
            className: "w-full mt-3 accent-purple-500",
            min: "200",
            max: "2000",
            step: "10"
          }
        ),
        ergebnis.mieteGekappt && /* @__PURE__ */ jsxs("p", { className: "text-sm text-amber-600 mt-2", children: [
          "⚠️ Höchstbetrag für Mietstufe ",
          mietstufe,
          ": ",
          formatEuro2(ergebnis.hoechstbetrag)
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Mietstufe Ihres Wohnorts" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Nach § 12 WoGG – je höher, desto teurer die Region" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 gap-2", children: MIETSTUFEN.map((stufe) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setMietstufe(stufe),
            className: `py-3 px-2 rounded-xl text-center transition-all ${mietstufe === stufe ? "bg-purple-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: /* @__PURE__ */ jsx("span", { className: "font-bold", children: stufe })
          },
          stufe
        )) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 p-3 bg-purple-50 rounded-xl", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-purple-700", children: [
            /* @__PURE__ */ jsxs("strong", { children: [
              "Beispiele für Mietstufe ",
              mietstufe,
              ":"
            ] }),
            " ",
            BEISPIELSTAEDTE[mietstufe].join(", ")
          ] }),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "https://www.wohngeld.org/mietstufe/",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-xs text-purple-600 hover:underline mt-1 inline-block",
              children: "→ Alle Mietstufen nachschlagen"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Erwerbstätigkeit" }) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setIstErwerbstaetig(!istErwerbstaetig),
            className: `w-full py-4 px-6 rounded-xl font-medium transition-all flex items-center justify-between ${istErwerbstaetig ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: /* @__PURE__ */ jsx("span", { children: istErwerbstaetig ? "✓ Mindestens ein Haushaltsmitglied ist erwerbstätig" : "✗ Keine Erwerbstätigkeit im Haushalt" })
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-2", children: "Erwerbstätige erhalten einen Freibetrag von 10% (max. 100€/Monat)" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Zusätzliche Freibeträge" }) }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm text-gray-600 block mb-2", children: "Schwerbehinderung (GdB)" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setSchwerbehindert("none"),
                className: `py-3 px-4 rounded-xl text-sm transition-all ${schwerbehindert === "none" ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
                children: "Keine"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setSchwerbehindert("50-80"),
                className: `py-3 px-4 rounded-xl text-sm transition-all ${schwerbehindert === "50-80" ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
                children: "GdB 50-80"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setSchwerbehindert("80-100"),
                className: `py-3 px-4 rounded-xl text-sm transition-all ${schwerbehindert === "80-100" ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
                children: "GdB 80-100"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setAlleinerziehend(!alleinerziehend),
            className: `w-full py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-between ${alleinerziehend ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: [
              /* @__PURE__ */ jsx("span", { children: "👨‍👧 Alleinerziehend" }),
              /* @__PURE__ */ jsx("span", { className: alleinerziehend ? "opacity-80" : "", children: alleinerziehend ? "+110€/Monat pro Kind" : "" })
            ]
          }
        ) }),
        alleinerziehend && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 p-4 bg-purple-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm text-purple-700", children: "Anzahl Kinder:" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setAnzahlKinder(Math.max(1, anzahlKinder - 1)),
              className: "w-10 h-10 rounded-xl bg-white hover:bg-purple-100 text-lg font-bold transition-colors",
              children: "−"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-purple-800 w-8 text-center", children: anzahlKinder || 1 }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setAnzahlKinder(Math.min(6, anzahlKinder + 1)),
              className: "w-10 h-10 rounded-xl bg-white hover:bg-purple-100 text-lg font-bold transition-colors",
              children: "+"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: `rounded-2xl shadow-lg p-6 text-white mb-6 ${ergebnis.hatAnspruch ? "bg-gradient-to-br from-purple-500 to-indigo-600" : "bg-gradient-to-br from-gray-400 to-gray-500"}`, children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: ergebnis.hatAnspruch ? "🏠 Ihr voraussichtliches Wohngeld" : "❌ Kein Wohngeld-Anspruch" }),
      ergebnis.hatAnspruch ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuro(ergebnis.wohngeldMonatlich) }),
            /* @__PURE__ */ jsx("span", { className: "text-xl opacity-80", children: "/ Monat" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-purple-100 mt-2 text-sm", children: [
            "Das sind ",
            /* @__PURE__ */ jsx("strong", { children: formatEuro(ergebnis.wohngeldJaehrlich) }),
            " pro Jahr Mietzuschuss vom Staat!"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Pro Jahr" }),
            /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.wohngeldJaehrlich) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Mietentlastung" }),
            /* @__PURE__ */ jsxs("div", { className: "text-xl font-bold", children: [
              Math.round(ergebnis.wohngeldMonatlich / warmmiete * 100),
              "%"
            ] })
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "py-4", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-white/90", children: [
          "Mit einem anrechenbaren Einkommen von ",
          /* @__PURE__ */ jsxs("strong", { children: [
            formatEuro(ergebnis.anrechenbaresEinkommenMonat),
            "/Monat"
          ] }),
          " ",
          "ergibt die Wohngeldformel keinen Anspruch (Ergebnis unter 10€)."
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-white/70", children: "Prüfen Sie, ob weitere Freibeträge anwendbar sind, oder schauen Sie sich alternative Leistungen wie Bürgergeld oder Kinderzuschlag an." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Berechnungsdetails nach § 19 WoGG" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide", children: "1. Einkommensberechnung (§§ 14-17 WoGG)" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Bruttoeinkommen (monatlich)" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.bruttoMonat) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Bruttoeinkommen (jährlich)" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatEuro(ergebnis.bruttoJahr) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-green-600", children: [
          /* @__PURE__ */ jsx("span", { children: "− Werbungskostenpauschale (§ 16)" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.werbungskosten) })
        ] }),
        ergebnis.erwerbstaetigenfreibetrag > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-green-600", children: [
          /* @__PURE__ */ jsx("span", { children: "− Erwerbstätigenfreibetrag 10% (§ 17 Nr. 3)" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.erwerbstaetigenfreibetrag) })
        ] }),
        ergebnis.schwerbehindertenfreibetrag > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-green-600", children: [
          /* @__PURE__ */ jsx("span", { children: "− Schwerbehindertenfreibetrag (§ 17 Nr. 4)" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.schwerbehindertenfreibetrag) })
        ] }),
        ergebnis.alleinerziehendenfreibetrag > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-green-600", children: [
          /* @__PURE__ */ jsx("span", { children: "− Alleinerziehenden-Freibetrag (§ 17 Nr. 5)" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.alleinerziehendenfreibetrag) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-gray-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "= Anrechenbares Einkommen (Jahr)" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.anrechenbaresEinkommenJahr) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "= Y (monatliches Gesamteinkommen)" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-purple-700", children: formatEuro(ergebnis.anrechenbaresEinkommenMonat) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide pt-4", children: "2. Berücksichtigte Miete (§ 12 WoGG)" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Ihre Warmmiete" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatEuro(ergebnis.warmmiete) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
            "Höchstbetrag (Mietstufe ",
            mietstufe,
            ", ",
            haushaltsgroesse,
            " Pers.)"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatEuro2(ergebnis.hoechstbetrag) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-purple-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-purple-700", children: "= M (berücksichtigte Miete)" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-purple-900", children: formatEuro2(ergebnis.beruecksichtigteMiete) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide pt-4", children: "3. Wohngeldformel nach § 19 Abs. 1 WoGG" }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-blue-50 rounded-xl text-blue-800 text-sm font-mono", children: [
          /* @__PURE__ */ jsxs("p", { className: "mb-2", children: [
            /* @__PURE__ */ jsx("strong", { children: "Formel:" }),
            " Wohngeld = 1,15 × (M − (a + b×M + c×Y) × Y)"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-blue-600", children: [
            "Koeffizienten für ",
            haushaltsgroesse,
            " Pers.: a=",
            ergebnis.koeffizienten.a,
            ", b=",
            ergebnis.koeffizienten.b,
            ", c=",
            ergebnis.koeffizienten.c
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-gray-500 text-xs", children: [
          /* @__PURE__ */ jsx("span", { children: "z1 = a + b×M + c×Y" }),
          /* @__PURE__ */ jsx("span", { children: ergebnis.z1 })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-gray-500 text-xs", children: [
          /* @__PURE__ */ jsx("span", { children: "z2 = z1 × Y" }),
          /* @__PURE__ */ jsxs("span", { children: [
            ergebnis.z2,
            " €"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-gray-500 text-xs", children: [
          /* @__PURE__ */ jsx("span", { children: "z3 = M − z2" }),
          /* @__PURE__ */ jsxs("span", { children: [
            ergebnis.z3,
            " €"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-gray-500 text-xs", children: [
          /* @__PURE__ */ jsx("span", { children: "z4 = 1,15 × z3 (ungerundet)" }),
          /* @__PURE__ */ jsxs("span", { children: [
            ergebnis.z4Ungerundet,
            " €"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-3 bg-purple-100 -mx-6 px-6 rounded-b-xl mt-4", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-purple-800", children: "Wohngeld pro Monat (aufgerundet)" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-2xl text-purple-900", children: formatEuro(ergebnis.wohngeldMonatlich) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert Wohngeld" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Mietzuschuss:" }),
            " Wohngeld ist ein staatlicher Zuschuss zur Miete für einkommensschwache Haushalte"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Keine Rückzahlung:" }),
            " Im Gegensatz zu BAföG muss Wohngeld nicht zurückgezahlt werden"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Wohngeld-Plus:" }),
            " Seit 2023 deutlich höhere Leistungen mit Heizkosten- und Klimakomponente"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Mieter & Eigentümer:" }),
            " Mieter erhalten Mietzuschuss, Eigentümer Lastenzuschuss"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Bewilligungszeitraum:" }),
            " In der Regel 12 Monate, dann Neuantrag erforderlich"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Kombinierbar:" }),
            " Mit Kindergeld, Kinderzuschlag, aber nicht mit Bürgergeld oder BAföG"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-purple-800 mb-3", children: "👥 Wer hat Anspruch auf Wohngeld?" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm text-purple-700", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Grundsätzlich anspruchsberechtigt" }),
          " sind Mieter, die zur Miete wohnen und deren Einkommen innerhalb bestimmter Grenzen liegt:"
        ] }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-1 pl-4", children: [
          /* @__PURE__ */ jsx("li", { children: "• Arbeitnehmer mit geringem Einkommen" }),
          /* @__PURE__ */ jsx("li", { children: "• Rentner mit niedriger Rente" }),
          /* @__PURE__ */ jsx("li", { children: "• Studenten, die kein BAföG erhalten (können)" }),
          /* @__PURE__ */ jsx("li", { children: "• Empfänger von Arbeitslosengeld I" }),
          /* @__PURE__ */ jsx("li", { children: "• Bezieher von Krankengeld, Übergangsgeld" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/50 rounded-xl p-4 mt-3", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-purple-800 mb-2", children: "⚠️ Kein Wohngeld erhalten:" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("li", { children: "• Empfänger von Bürgergeld (Kosten der Unterkunft enthalten)" }),
            /* @__PURE__ */ jsx("li", { children: "• BAföG-Empfänger (Wohnkostenanteil enthalten)" }),
            /* @__PURE__ */ jsx("li", { children: "• Personen in Bedarfsgemeinschaften mit Bürgergeld" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-amber-800 mb-3", children: "⚠️ Wichtige Hinweise" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-amber-700", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Exakte Berechnung:" }),
            " Dieser Rechner verwendet die offizielle Formel nach § 19 WoGG mit den Koeffizienten aus Anlage 2"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Mietstufe prüfen:" }),
            " Die Mietstufe richtet sich nach dem Wohnort und kann jährlich angepasst werden"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Einkommensnachweis:" }),
            " Für den Antrag benötigen Sie Einkommensnachweise der letzten 12 Monate"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Rechtzeitig beantragen:" }),
            " Wohngeld wird erst ab Antragsmonat gezahlt – rückwirkend gibt es nichts"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Änderungen melden:" }),
            " Einkommensänderungen über 15% müssen gemeldet werden"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörde" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-purple-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-purple-900", children: "Wohngeldstelle Ihrer Gemeinde/Stadt" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-purple-700 mt-1", children: "Zuständig ist die Wohngeldstelle am Ort Ihrer Wohnung – meist beim Rathaus, Landratsamt oder Bezirksamt angesiedelt." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Bundesportal" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.bmwsb.bund.de/DE/wohnen/wohngeld/wohngeld_node.html",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "BMWSB Wohngeld-Info →"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📱" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Online-Antrag" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.wohngeld.org/antrag",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "Wohngeld online beantragen →"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📋" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Benötigte Unterlagen" }),
            /* @__PURE__ */ jsxs("ul", { className: "text-gray-600 mt-1 space-y-1", children: [
              /* @__PURE__ */ jsx("li", { children: "• Mietvertrag und Mietbescheinigung" }),
              /* @__PURE__ */ jsx("li", { children: "• Einkommensnachweise (Gehaltsabrechnungen, Rentenbescheid)" }),
              /* @__PURE__ */ jsx("li", { children: "• Personalausweis" }),
              /* @__PURE__ */ jsx("li", { children: "• Ggf. Schwerbehindertenausweis" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gray-50 rounded-xl", children: [
      /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-gray-500 uppercase mb-2", children: "Quellen & Rechtsgrundlagen" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/wogg/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Wohngeldgesetz (WoGG) – Gesetze im Internet"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.wohngeld.org/wohngeldgesetz-wogg/paragraph19/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "§ 19 WoGG – Wohngeldformel mit Berechnungsbeispielen"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.wohngeld.org/wohngeldgesetz-wogg/anlage2/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Anlage 2 zu § 19 WoGG – Koeffizienten a, b, c"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.wohngeld.org/wohnkosten/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Wohngeld Höchstbeträge 2025/2026 – Tabellen"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.wohngeld.org/mietstufe/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Mietstufen-Verzeichnis nach Bundesländern"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bmwsb.bund.de/DE/wohnen/wohngeld/wohngeld_node.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BMWSB – Wohngeld Informationen"
          }
        )
      ] })
    ] })
  ] });
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$WohngeldRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "Wohngeld-Rechner 2026 \u2013 Anspruch, H\xF6he & Mietstufen berechnen";
  const description = "Wohngeld Rechner 2026: Berechnen Sie Ihren Wohngeld-Anspruch online. Mit aktuellen H\xF6chstbetr\xE4gen, Mietstufen I-VII, Freibetr\xE4gen & Einkommensgrenzen. Mietzuschuss sofort ermitteln!";
  const keywords = "Wohngeld Rechner, Wohngeld 2026, Wohngeld berechnen, Wohngeld Anspruch, Mietzuschuss, Wohngeld-Plus, Wohngeld H\xF6he, Wohngeld Einkommensgrenze, Wohngeld Mietstufe, Wohngeld beantragen, Wohngeld H\xF6chstbetrag";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<main class="min-h-screen pb-8"> <!-- Header mit Zur\xFCck-Button --> <header class="bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>\nAlle Rechner\n</a> <div class="flex items-center gap-3"> <span class="text-4xl">\u{1F3D8}\uFE0F</span> <div> <h1 class="text-2xl font-bold">Wohngeld-Rechner</h1> <p class="text-purple-100 text-sm">Mietzuschuss 2026 berechnen</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ', ` </div> <!-- SEO Content Section --> <div class="max-w-2xl mx-auto px-4 mt-8"> <div class="bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">Wohngeld 2026: Der Mietzuschuss vom Staat</h2> <div class="prose prose-sm text-gray-600 space-y-4"> <p>
Das <strong>Wohngeld</strong> ist ein staatlicher Mietzuschuss f\xFCr Haushalte mit geringem Einkommen. 
            Mit dem <strong>Wohngeld-Plus-Gesetz</strong> (seit Januar 2023) wurden die Leistungen deutlich erh\xF6ht \u2013 
            mehr Menschen haben nun Anspruch auf h\xF6here Betr\xE4ge. Nutzen Sie unseren <strong>Wohngeld-Rechner</strong>, 
            um Ihren voraussichtlichen Anspruch zu ermitteln.
</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Was ist Wohngeld?</h3> <p>
Wohngeld ist eine Sozialleistung nach dem Wohngeldgesetz (WoGG). Es gibt zwei Formen:
</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Mietzuschuss:</strong> F\xFCr Mieter einer Wohnung</li> <li><strong>Lastenzuschuss:</strong> F\xFCr Eigent\xFCmer von selbstgenutztem Wohneigentum</li> </ul> <p>
Im Gegensatz zu B\xFCrgergeld oder BAf\xF6G muss Wohngeld <strong>nicht zur\xFCckgezahlt</strong> werden.
</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wohngeld-Berechnung: Die wichtigsten Faktoren</h3> <p>
Die H\xF6he des Wohngeldes h\xE4ngt von drei Faktoren ab:
</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Haushaltsgr\xF6\xDFe:</strong> Anzahl der Haushaltsmitglieder (1-8+ Personen)</li> <li><strong>Einkommen:</strong> Gesamteinkommen abz\xFCglich Freibetr\xE4ge</li> <li><strong>Miete/Belastung:</strong> Warmmiete bis zum H\xF6chstbetrag der Mietstufe</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Mietstufen I-VII: Was bedeuten sie?</h3> <p>
Deutschland ist in <strong>sieben Mietstufen</strong> eingeteilt, die das lokale Mietniveau widerspiegeln:
</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Mietstufe I:</strong> G\xFCnstige Regionen (z.B. Chemnitz, Magdeburg)</li> <li><strong>Mietstufe III-IV:</strong> Durchschnitt (z.B. K\xF6ln, Hamburg)</li> <li><strong>Mietstufe VII:</strong> Teuerste Regionen (z.B. M\xFCnchen, Starnberg)</li> </ul> <p>
Je h\xF6her die Mietstufe, desto h\xF6her der anrechenbare Miet-H\xF6chstbetrag \u2013 und damit potenziell 
            auch das Wohngeld.
</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wohngeld-Plus und Erh\xF6hung 2025</h3> <p>
Mit dem <strong>Wohngeld-Plus-Gesetz</strong> (2023) und der <strong>Wohngeld-Erh\xF6hung 2025</strong> wurden die Leistungen deutlich verbessert:
</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>+15% mehr Wohngeld</strong> ab 2025 (durchschnittlich ~30\u20AC/Monat zus\xE4tzlich)</li> <li><strong>H\xF6here Einkommensgrenzen</strong> \u2013 mehr Haushalte haben Anspruch</li> <li><strong>Heizkostenkomponente:</strong> Pauschale f\xFCr Heizkosten im H\xF6chstbetrag</li> <li><strong>Klimakomponente:</strong> Zuschlag f\xFCr energetische Sanierung</li> <li><strong>1,9 Millionen Haushalte</strong> profitieren von der Reform</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Freibetr\xE4ge beim Wohngeld</h3> <p>
Bestimmte Personengruppen erhalten <strong>Freibetr\xE4ge</strong>, die das anrechenbare Einkommen senken:
</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Erwerbst\xE4tige:</strong> 10% Freibetrag (max. 100\u20AC/Monat)</li> <li><strong>Schwerbehinderte (GdB 50-80):</strong> 1.800\u20AC/Jahr</li> <li><strong>Schwerbehinderte (GdB 80-100):</strong> 2.100\u20AC/Jahr</li> <li><strong>Alleinerziehende:</strong> 1.320\u20AC/Jahr pro Kind</li> <li><strong>Pflegebed\xFCrftige:</strong> 2.100\u20AC/Jahr (Pflegegrad 1-3)</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wohngeld beantragen: So geht's</h3> <p>
Der Antrag auf Wohngeld muss bei der <strong>Wohngeldstelle</strong> Ihrer Gemeinde oder Stadt 
            gestellt werden. Ben\xF6tigte Unterlagen:
</p> <ul class="list-disc pl-5 space-y-1"> <li>Ausgef\xFCllter Wohngeldantrag</li> <li>Mietvertrag und Mietbescheinigung</li> <li>Einkommensnachweise der letzten 12 Monate</li> <li>Personalausweis oder Reisepass</li> <li>Ggf. Schwerbehindertenausweis, Rentenbescheid</li> </ul> <p> <strong>Wichtig:</strong> Wohngeld wird erst ab dem Monat der Antragstellung gezahlt \u2013 
            nicht r\xFCckwirkend! Stellen Sie den Antrag daher fr\xFChzeitig.
</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wohngeld vs. B\xFCrgergeld: Was ist besser?</h3> <p>
Wohngeld und B\xFCrgergeld schlie\xDFen sich gegenseitig aus. Bei der Entscheidung sollten Sie pr\xFCfen:
</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Wohngeld:</strong> Kein Verm\xF6genstest, weniger B\xFCrokratie, kein Stigma</li> <li><strong>B\xFCrgergeld:</strong> H\xF6here Leistungen bei sehr geringem Einkommen, KdU inklusive</li> </ul> <p>
Nutzen Sie unseren <a href="/buergergeld-rechner" class="text-purple-600 hover:underline">B\xFCrgergeld-Rechner</a>, 
            um beide Optionen zu vergleichen.
</p> </div> </div> </div> </main>  <script type="application/ld+json">`, '<\/script>  <script type="application/ld+json">', "<\/script> "])), maybeRenderHead(), renderComponent($$result2, "WohngeldRechner", WohngeldRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/WohngeldRechner", "client:component-export": "default" }), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Wohngeld-Rechner 2026",
    "description": description,
    "url": "https://www.deutschland-rechner.de/wohngeld-rechner",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    },
    "author": {
      "@type": "Organization",
      "name": "Deutschland-Rechner"
    }
  })), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Wie hoch ist das Wohngeld 2026?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Die H\xF6he des Wohngeldes h\xE4ngt von Haushaltsgr\xF6\xDFe, Einkommen und Mietstufe ab. Ein Single in Mietstufe III mit 1.200\u20AC Netto kann etwa 200-300\u20AC Wohngeld erhalten. Nutzen Sie unseren Rechner f\xFCr eine genaue Berechnung."
        }
      },
      {
        "@type": "Question",
        "name": "Wer hat Anspruch auf Wohngeld?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Anspruch haben Mieter und Eigent\xFCmer mit geringem Einkommen, die keine anderen Transferleistungen wie B\xFCrgergeld oder BAf\xF6G beziehen. Die Einkommensgrenze variiert nach Haushaltsgr\xF6\xDFe und Mietstufe."
        }
      },
      {
        "@type": "Question",
        "name": "Muss ich Wohngeld zur\xFCckzahlen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nein, Wohngeld ist ein Zuschuss und muss nicht zur\xFCckgezahlt werden \u2013 anders als z.B. BAf\xF6G. Nur bei \xDCberzahlungen aufgrund falscher Angaben kann eine R\xFCckforderung erfolgen."
        }
      },
      {
        "@type": "Question",
        "name": "Wo beantrage ich Wohngeld?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Wohngeld beantragen Sie bei der Wohngeldstelle Ihrer Gemeinde oder Stadt. Diese ist meist beim Rathaus, Landratsamt oder Bezirksamt angesiedelt. Viele St\xE4dte bieten auch Online-Antr\xE4ge an."
        }
      }
    ]
  }))) })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/wohngeld-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/wohngeld-rechner.astro";
const $$url = "/wohngeld-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$WohngeldRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
