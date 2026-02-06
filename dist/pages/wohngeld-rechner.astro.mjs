/* empty css                                          */
import { c as createComponent, r as renderComponent, a as renderTemplate, u as unescapeHTML, m as maybeRenderHead } from '../chunks/astro/server_C8dcKtIt.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DgvP8Zjv.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const MIETSTUFEN = ["I", "II", "III", "IV", "V", "VI", "VII"];
const HOECHSTBETRAEGE = {
  "I": [404, 489, 582, 672, 763, 850, 937, 1024],
  // 1-8 Personen
  "II": [432, 524, 623, 720, 816, 909, 1002, 1095],
  "III": [463, 561, 667, 770, 874, 974, 1073, 1172],
  "IV": [507, 615, 731, 844, 958, 1067, 1176, 1285],
  "V": [549, 666, 792, 915, 1038, 1157, 1276, 1395],
  "VI": [598, 725, 863, 996, 1131, 1260, 1389, 1518],
  "VII": [651, 790, 939, 1085, 1231, 1373, 1514, 1656]
};
const KOEFFIZIENTEN = {
  1: { a: 0.04, b: 53e-6, c: 254e-6 },
  2: { a: 0.03, b: 33e-6, c: 207e-6 },
  3: { a: 0.02, b: 23e-6, c: 175e-6 },
  4: { a: 0.01, b: 15e-6, c: 152e-6 },
  5: { a: 0, b: 1e-5, c: 135e-6 },
  6: { a: -0.01, b: 7e-6, c: 12e-5 }
};
const FREIBETRAEGE = {
  // Monatl. Mindesteinkommen (etwa)
  schwerbehindert_50_80: 1800,
  // GdB 50-80 (jährlich)
  schwerbehindert_80_100: 2100,
  // Pflegegrad 1-3 (jährlich)
  alleinerziehend: 1320,
  // Kind in Ausbildung (monatlich)
  erwerbstaetig_pauschal: 0.1,
  // 10% vom Bruttoeinkommen
  werbungskosten_pauschal: 1230
  // Jährlich (102.50€/Monat)
};
const EINKOMMENSGRENZEN = {
  "I": [1350, 1850, 2270, 2980, 3500, 4e3, 4500, 5e3],
  "II": [1400, 1900, 2350, 3050, 3600, 4100, 4600, 5100],
  "III": [1450, 1980, 2450, 3150, 3700, 4200, 4700, 5200],
  "IV": [1500, 2050, 2550, 3250, 3800, 4400, 4900, 5400],
  "V": [1550, 2120, 2650, 3350, 3950, 4550, 5050, 5550],
  "VI": [1600, 2180, 2750, 3450, 4050, 4650, 5200, 5700],
  "VII": [1650, 2250, 2850, 3550, 4200, 4800, 5350, 5850]
};
const BEISPIELSTAEDTE = {
  "I": ["Chemnitz", "Halle (Saale)", "Magdeburg", "Gera"],
  "II": ["Leipzig", "Dresden", "Erfurt", "Rostock"],
  "III": ["Hannover", "Bremen", "Dortmund", "Essen"],
  "IV": ["Köln", "Düsseldorf", "Hamburg", "Nürnberg"],
  "V": ["Berlin", "Frankfurt (Oder)", "Potsdam"],
  "VI": ["Frankfurt a.M.", "Stuttgart", "Freiburg"],
  "VII": ["München", "Starnberg", "Miesbach"]
};
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
    const erwerbstaetigenfreibetrag = istErwerbstaetig ? Math.min(jahresbrutto * FREIBETRAEGE.erwerbstaetig_pauschal, 1200) : 0;
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
    const personenIndex = Math.min(haushaltsgroesse - 1, 7);
    const hoechstbetrag = HOECHSTBETRAEGE[mietstufe][personenIndex];
    const beruecksichtigteMiete = Math.min(warmmiete, hoechstbetrag);
    const koeff = KOEFFIZIENTEN[Math.min(haushaltsgroesse, 6)];
    const M = beruecksichtigteMiete;
    const Y = anrechenbaresEinkommenMonat;
    const faktor = koeff.a + koeff.b * M + koeff.c * Y;
    const wohngeldBrutto = 1.15 * (M - faktor * Y);
    const wohngeldMonatlich = wohngeldBrutto >= 10 ? Math.round(wohngeldBrutto) : 0;
    const einkommensgrenze = EINKOMMENSGRENZEN[mietstufe][personenIndex];
    const hatAnspruch = anrechenbaresEinkommenMonat <= einkommensgrenze && wohngeldMonatlich > 0;
    const wohngeldJaehrlich = wohngeldMonatlich * 12;
    return {
      // Einkommen
      bruttoMonat: bruttoeinkommen,
      bruttoJahr: jahresbrutto,
      werbungskosten,
      erwerbstaetigenfreibetrag,
      schwerbehindertenfreibetrag,
      alleinerziehendenfreibetrag,
      gesamtfreibetraege,
      anrechenbaresEinkommenJahr,
      anrechenbaresEinkommenMonat,
      // Miete
      warmmiete,
      hoechstbetrag,
      beruecksichtigteMiete,
      mieteGekappt: warmmiete > hoechstbetrag,
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
              onClick: () => setHaushaltsgroesse(Math.min(8, haushaltsgroesse + 1)),
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
          formatEuro(ergebnis.hoechstbetrag)
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
              href: "https://www.bmwsb.bund.de/SharedDocs/downloads/Webs/BMWSB/DE/veroeffentlichungen/wohnen/wohngeld/Mietstufen.pdf",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-xs text-purple-600 hover:underline mt-1 inline-block",
              children: "→ Alle Mietstufen nachschlagen (PDF)"
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
          "liegt Ihr Haushalt über der Einkommensgrenze von",
          " ",
          /* @__PURE__ */ jsx("strong", { children: formatEuro(ergebnis.einkommensgrenze) }),
          " für Mietstufe ",
          mietstufe,
          "."
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-white/70", children: "Prüfen Sie, ob weitere Freibeträge anwendbar sind, oder schauen Sie sich alternative Leistungen wie Bürgergeld oder Kinderzuschlag an." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Berechnungsdetails" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide", children: "Einkommensberechnung" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Bruttoeinkommen (monatlich)" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.bruttoMonat) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Bruttoeinkommen (jährlich)" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatEuro(ergebnis.bruttoJahr) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-green-600", children: [
          /* @__PURE__ */ jsx("span", { children: "− Werbungskostenpauschale" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.werbungskosten) })
        ] }),
        ergebnis.erwerbstaetigenfreibetrag > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-green-600", children: [
          /* @__PURE__ */ jsx("span", { children: "− Erwerbstätigenfreibetrag (10%)" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.erwerbstaetigenfreibetrag) })
        ] }),
        ergebnis.schwerbehindertenfreibetrag > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-green-600", children: [
          /* @__PURE__ */ jsx("span", { children: "− Schwerbehindertenfreibetrag" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.schwerbehindertenfreibetrag) })
        ] }),
        ergebnis.alleinerziehendenfreibetrag > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-green-600", children: [
          /* @__PURE__ */ jsx("span", { children: "− Alleinerziehenden-Freibetrag" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.alleinerziehendenfreibetrag) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-gray-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "= Anrechenbares Einkommen (Jahr)" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.anrechenbaresEinkommenJahr) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "= Anrechenbares Einkommen (Monat)" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-purple-700", children: formatEuro(ergebnis.anrechenbaresEinkommenMonat) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide pt-4", children: "Mietberechnung" }),
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
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatEuro(ergebnis.hoechstbetrag) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-purple-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-purple-700", children: "= Berücksichtigte Miete" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-purple-900", children: formatEuro(ergebnis.beruecksichtigteMiete) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-3 bg-purple-100 -mx-6 px-6 rounded-b-xl mt-4", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-purple-800", children: "Wohngeld pro Monat" }),
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
            /* @__PURE__ */ jsx("strong", { children: "Wohngeld-Plus 2023:" }),
            " Deutliche Erhöhung der Leistungen und Miethöchstbeträge"
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
            /* @__PURE__ */ jsx("strong", { children: "Schätzung:" }),
            " Dieser Rechner liefert eine Orientierung – die tatsächliche Berechnung durch die Wohngeldstelle kann abweichen"
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
                  href: "https://www.bmwsb.bund.de/Webs/BMWSB/DE/themen/wohnen/wohngeld/wohngeld-node.html",
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
      /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-gray-500 uppercase mb-2", children: "Quellen" }),
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
            href: "https://www.bmwsb.bund.de/Webs/BMWSB/DE/themen/wohnen/wohngeld/wohngeld-node.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BMWSB – Wohngeld Informationen"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.wohngeld.org",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Wohngeld.org – Ratgeber und Rechner"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bmwsb.bund.de/SharedDocs/downloads/Webs/BMWSB/DE/veroeffentlichungen/wohnen/wohngeld/Mietstufen.pdf",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Mietstufen-Verzeichnis (PDF)"
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
  const title = "Wohngeld-Rechner 2025/2026 \u2013 Anspruch & H\xF6he berechnen";
  const description = "Wohngeld Rechner 2026: Berechnen Sie Ihren Wohngeld-Anspruch online. Mit Mietstufen, Freibetr\xE4gen & Einkommensgrenzen. Mietzuschuss sofort ermitteln!";
  const keywords = "Wohngeld Rechner, Wohngeld 2026, Wohngeld berechnen, Wohngeld Anspruch, Mietzuschuss, Wohngeld-Plus, Wohngeld H\xF6he, Wohngeld Einkommensgrenze, Wohngeld Mietstufe, Wohngeld beantragen";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<main class="min-h-screen pb-8"> <!-- Header mit Zur\xFCck-Button --> <header class="bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>\nAlle Rechner\n</a> <div class="flex items-center gap-3"> <span class="text-4xl">\u{1F3D8}\uFE0F</span> <div> <h1 class="text-2xl font-bold">Wohngeld-Rechner</h1> <p class="text-purple-100 text-sm">Mietzuschuss 2025/2026 berechnen</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ', ` </div> <!-- SEO Content Section --> <div class="max-w-2xl mx-auto px-4 mt-8"> <div class="bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">Wohngeld 2025/2026: Der Mietzuschuss vom Staat</h2> <div class="prose prose-sm text-gray-600 space-y-4"> <p>
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
</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wohngeld-Plus: Die Erh\xF6hung 2023</h3> <p>
Mit dem <strong>Wohngeld-Plus-Gesetz</strong> wurden ab Januar 2023 wesentliche Verbesserungen eingef\xFChrt:
</p> <ul class="list-disc pl-5 space-y-1"> <li>Durchschnittlich <strong>+190\u20AC mehr</strong> Wohngeld pro Monat</li> <li><strong>2 Millionen Haushalte</strong> zus\xE4tzlich anspruchsberechtigt</li> <li><strong>Heizkostenkomponente:</strong> Neue Pauschale f\xFCr Heizkosten</li> <li><strong>Klimakomponente:</strong> Zuschlag f\xFCr energetische Sanierung</li> <li>H\xF6here <strong>Mieth\xF6chstbetr\xE4ge</strong> in allen Mietstufen</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Freibetr\xE4ge beim Wohngeld</h3> <p>
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
    "name": "Wohngeld-Rechner 2025/2026",
    "description": description,
    "url": "https://deutschland-rechner.vercel.app/wohngeld-rechner",
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
        "name": "Wie hoch ist das Wohngeld 2025/2026?",
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
