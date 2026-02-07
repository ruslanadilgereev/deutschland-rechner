/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, u as unescapeHTML, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DmT1JwUR.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const CO2_STAFFELUNG = [
  { von: 0, bis: 95, euroProGKm: 0 },
  { von: 95, bis: 115, euroProGKm: 2 },
  { von: 115, bis: 135, euroProGKm: 2.2 },
  { von: 135, bis: 155, euroProGKm: 2.5 },
  { von: 155, bis: 175, euroProGKm: 2.9 },
  { von: 175, bis: 195, euroProGKm: 3.4 },
  { von: 195, bis: Infinity, euroProGKm: 4 }
];
const HUBRAUM_SAETZE = {
  benzin: 2,
  // EUR pro angefangene 100 cm³
  diesel: 9.5
  // EUR pro angefangene 100 cm³
};
const ELEKTRO_BEFREIUNG_BIS = /* @__PURE__ */ new Date("2030-12-31");
const ELEKTRO_MAX_BEFREIUNG_JAHRE = 10;
function KfzSteuerRechner() {
  const [hubraum, setHubraum] = useState(1600);
  const [co2, setCo2] = useState(120);
  const [kraftstoff, setKraftstoff] = useState("benzin");
  const [erstzulassung, setErstzulassung] = useState("2023-01-01");
  const [schadstoffklasse, setSchadstoffklasse] = useState("euro6");
  const ergebnis = useMemo(() => {
    const zulassungsDatum = new Date(erstzulassung);
    const istElektro = kraftstoff === "elektro";
    const istHybrid = kraftstoff.startsWith("hybrid");
    const basisKraftstoff = istHybrid ? kraftstoff === "hybrid-benzin" ? "benzin" : "diesel" : kraftstoff;
    if (istElektro) {
      const befreiungEnde = new Date(zulassungsDatum);
      befreiungEnde.setFullYear(befreiungEnde.getFullYear() + ELEKTRO_MAX_BEFREIUNG_JAHRE);
      const befreiungBis = befreiungEnde < ELEKTRO_BEFREIUNG_BIS ? befreiungEnde : ELEKTRO_BEFREIUNG_BIS;
      const heute = /* @__PURE__ */ new Date();
      if (heute < befreiungBis) {
        return {
          hubraumSteuer: 0,
          hubraumEinheiten: 0,
          co2Steuer: 0,
          co2Details: [],
          gesamtSteuer: 0,
          elektroBefreit: true,
          elektroBefreiungBis: befreiungBis,
          monatlicherBetrag: 0,
          halbjahresBetrag: 0
        };
      }
    }
    const hubraumEinheiten = Math.ceil(hubraum / 100);
    const hubraumSatz = HUBRAUM_SAETZE[basisKraftstoff] || HUBRAUM_SAETZE.benzin;
    const hubraumSteuer = hubraumEinheiten * hubraumSatz;
    let co2Steuer = 0;
    const co2Details = [];
    if (co2 > 0 && !istElektro) {
      let verbleibendeCo2 = co2;
      for (const stufe of CO2_STAFFELUNG) {
        if (verbleibendeCo2 <= stufe.von) break;
        const inDieserStufe = Math.min(verbleibendeCo2, stufe.bis) - stufe.von;
        if (inDieserStufe > 0 && stufe.euroProGKm > 0) {
          const betrag = inDieserStufe * stufe.euroProGKm;
          co2Steuer += betrag;
          co2Details.push({
            stufe: stufe.bis === Infinity ? `über ${stufe.von} g/km` : `${stufe.von + 1}-${stufe.bis} g/km`,
            gramm: inDieserStufe,
            satz: stufe.euroProGKm,
            betrag
          });
        }
      }
    }
    const gesamtSteuer = Math.round(hubraumSteuer + co2Steuer);
    return {
      hubraumSteuer,
      hubraumEinheiten,
      co2Steuer,
      co2Details,
      gesamtSteuer,
      elektroBefreit: false,
      monatlicherBetrag: gesamtSteuer / 12,
      halbjahresBetrag: gesamtSteuer / 2
    };
  }, [hubraum, co2, kraftstoff, erstzulassung, schadstoffklasse]);
  const formatEuro = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  const formatEuroRound = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";
  const kraftstoffOptionen = [
    { value: "benzin", label: "Benzin", icon: "⛽" },
    { value: "diesel", label: "Diesel", icon: "🛢️" },
    { value: "elektro", label: "Elektro", icon: "🔋" },
    { value: "hybrid-benzin", label: "Hybrid (Benzin)", icon: "🔌" },
    { value: "hybrid-diesel", label: "Hybrid (Diesel)", icon: "🔌" }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Antriebsart" }) }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: kraftstoffOptionen.map((option) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setKraftstoff(option.value),
            className: `py-3 px-3 rounded-xl font-medium transition-all text-sm ${kraftstoff === option.value ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: [
              /* @__PURE__ */ jsx("span", { className: "mr-1", children: option.icon }),
              option.label
            ]
          },
          option.value
        )) })
      ] }),
      kraftstoff !== "elektro" && /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Hubraum" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Motorvolumen in Kubikzentimeter (cm³)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: hubraum,
              onChange: (e) => setHubraum(Math.max(0, Number(e.target.value))),
              className: "w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none",
              min: "0",
              max: "8000",
              step: "100"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl", children: "cm³" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: hubraum,
            onChange: (e) => setHubraum(Number(e.target.value)),
            className: "w-full mt-3 accent-orange-500",
            min: "500",
            max: "5000",
            step: "100"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "500 cm³" }),
          /* @__PURE__ */ jsx("span", { children: "2.500 cm³" }),
          /* @__PURE__ */ jsx("span", { children: "5.000 cm³" })
        ] })
      ] }),
      kraftstoff !== "elektro" && /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "CO₂-Emissionen" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Kombinierter WLTP-Wert laut Fahrzeugschein (Feld V.7)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: co2,
              onChange: (e) => setCo2(Math.max(0, Number(e.target.value))),
              className: "w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none",
              min: "0",
              max: "400",
              step: "1"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg", children: "g/km" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: co2,
            onChange: (e) => setCo2(Number(e.target.value)),
            className: "w-full mt-3 accent-orange-500",
            min: "0",
            max: "300",
            step: "1"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "0 g/km" }),
          /* @__PURE__ */ jsx("span", { children: "150 g/km" }),
          /* @__PURE__ */ jsx("span", { children: "300 g/km" })
        ] }),
        co2 <= 95 && /* @__PURE__ */ jsx("p", { className: "text-sm text-green-600 mt-2", children: "✓ Keine CO₂-Steuer bis 95 g/km" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Erstzulassung" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Datum der ersten Zulassung (Feld B im Fahrzeugschein)" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "date",
            value: erstzulassung,
            onChange: (e) => setErstzulassung(e.target.value),
            className: "w-full text-lg font-medium text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Schnellauswahl" }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setHubraum(1200);
                setCo2(105);
                setKraftstoff("benzin");
              },
              className: "py-2 px-3 rounded-xl text-sm bg-gray-100 hover:bg-gray-200 transition-colors text-left",
              children: "🚗 Kleinwagen (1.2L Benzin)"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setHubraum(1600);
                setCo2(120);
                setKraftstoff("benzin");
              },
              className: "py-2 px-3 rounded-xl text-sm bg-gray-100 hover:bg-gray-200 transition-colors text-left",
              children: "🚙 Kompaktwagen (1.6L)"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setHubraum(2e3);
                setCo2(140);
                setKraftstoff("diesel");
              },
              className: "py-2 px-3 rounded-xl text-sm bg-gray-100 hover:bg-gray-200 transition-colors text-left",
              children: "🚐 Mittelklasse (2.0L Diesel)"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setHubraum(3e3);
                setCo2(200);
                setKraftstoff("benzin");
              },
              className: "py-2 px-3 rounded-xl text-sm bg-gray-100 hover:bg-gray-200 transition-colors text-left",
              children: "🏎️ SUV/Sportwagen (3.0L)"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setKraftstoff("elektro");
              },
              className: "py-2 px-3 rounded-xl text-sm bg-gray-100 hover:bg-gray-200 transition-colors text-left",
              children: "🔋 Elektroauto"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setHubraum(1800);
                setCo2(35);
                setKraftstoff("hybrid-benzin");
              },
              className: "py-2 px-3 rounded-xl text-sm bg-gray-100 hover:bg-gray-200 transition-colors text-left",
              children: "🔌 Plug-in-Hybrid"
            }
          )
        ] })
      ] })
    ] }),
    ergebnis.elektroBefreit ? /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: "🔋 Elektrofahrzeug" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: "0 €" }),
          /* @__PURE__ */ jsx("span", { className: "text-xl opacity-80", children: "pro Jahr" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-green-100 mt-2", children: "Ihr Elektrofahrzeug ist von der Kfz-Steuer befreit!" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
          /* @__PURE__ */ jsx("strong", { children: "Steuerbefreiung bis:" }),
          " ",
          ergebnis.elektroBefreiungBis?.toLocaleDateString("de-DE", {
            year: "numeric",
            month: "long",
            day: "numeric"
          })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-green-100 mt-2", children: "Elektrofahrzeuge sind für max. 10 Jahre ab Erstzulassung, längstens bis 31.12.2030, von der Kfz-Steuer befreit (§ 3d KraftStG)." })
      ] })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg p-6 text-white mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: "🚗 Ihre Kfz-Steuer" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuroRound(ergebnis.gesamtSteuer) }),
          /* @__PURE__ */ jsx("span", { className: "text-xl opacity-80", children: "pro Jahr" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-orange-100 mt-2 text-sm", children: [
          "Das sind ca. ",
          /* @__PURE__ */ jsx("strong", { children: formatEuro(ergebnis.monatlicherBetrag) }),
          " pro Monat"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Hubraum-Steuer" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuroRound(ergebnis.hubraumSteuer) }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-orange-100 mt-1", children: [
            ergebnis.hubraumEinheiten,
            " × ",
            kraftstoff === "diesel" || kraftstoff === "hybrid-diesel" ? "9,50" : "2,00",
            " €"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "CO₂-Steuer" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuroRound(ergebnis.co2Steuer) }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-orange-100 mt-1", children: co2 > 95 ? `ab 96 g/km` : "keine" })
        ] })
      ] })
    ] }),
    !ergebnis.elektroBefreit && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Berechnungsdetails" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide", children: "Hubraum-Steuer" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Hubraum" }),
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-gray-900", children: [
            hubraum.toLocaleString("de-DE"),
            " cm³"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Angefangene 100 cm³" }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-900", children: [
            ergebnis.hubraumEinheiten,
            " Einheiten"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
            "Steuersatz (",
            kraftstoff === "diesel" || kraftstoff === "hybrid-diesel" ? "Diesel" : "Benzin",
            ")"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-900", children: [
            kraftstoff === "diesel" || kraftstoff === "hybrid-diesel" ? "9,50" : "2,00",
            " € / 100 cm³"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-orange-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-orange-700", children: "= Hubraum-Steuer" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-orange-900", children: formatEuro(ergebnis.hubraumSteuer) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide pt-4", children: "CO₂-Steuer (ab 2021)" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "CO₂-Emissionen" }),
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-gray-900", children: [
            co2,
            " g/km"
          ] })
        ] }),
        co2 <= 95 ? /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Freibetrag bis 95 g/km" }),
          /* @__PURE__ */ jsx("span", { className: "text-green-600", children: "✓ keine Steuer" })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 py-1", children: "Staffelung nach CO₂-Wert:" }),
          ergebnis.co2Details.map((detail, idx) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-sm", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
              detail.gramm,
              " g × ",
              formatEuro(detail.satz),
              /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-400 ml-1", children: [
                "(",
                detail.stufe,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatEuro(detail.betrag) })
          ] }, idx))
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-orange-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-orange-700", children: "= CO₂-Steuer" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-orange-900", children: formatEuro(ergebnis.co2Steuer) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-3 bg-orange-100 -mx-6 px-6 rounded-b-xl mt-4", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-orange-800", children: "Kfz-Steuer / Jahr" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-2xl text-orange-900", children: formatEuroRound(ergebnis.gesamtSteuer) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "📈 CO₂-Staffelung 2025" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Die CO₂-Komponente wird seit 2021 progressiv berechnet. Je höher der CO₂-Wert, desto mehr zahlen Sie pro Gramm:" }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-gray-50", children: [
          /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-3 rounded-tl-lg", children: "CO₂-Bereich" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-2 px-3 rounded-tr-lg", children: "Steuersatz" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { children: [
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3 text-gray-600", children: "0 – 95 g/km" }),
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3 text-right text-green-600 font-medium", children: "0,00 €/g" })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3 text-gray-600", children: "96 – 115 g/km" }),
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3 text-right font-medium", children: "2,00 €/g" })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3 text-gray-600", children: "116 – 135 g/km" }),
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3 text-right font-medium", children: "2,20 €/g" })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3 text-gray-600", children: "136 – 155 g/km" }),
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3 text-right font-medium", children: "2,50 €/g" })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3 text-gray-600", children: "156 – 175 g/km" }),
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3 text-right font-medium", children: "2,90 €/g" })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3 text-gray-600", children: "176 – 195 g/km" }),
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3 text-right font-medium", children: "3,40 €/g" })
          ] }),
          /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3 text-gray-600 rounded-bl-lg", children: "über 195 g/km" }),
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3 text-right text-red-600 font-medium rounded-br-lg", children: "4,00 €/g" })
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert die Kfz-Steuer" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Hubraum-Komponente:" }),
            " Benziner 2€, Diesel 9,50€ pro angefangene 100 cm³"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "CO₂-Komponente:" }),
            " Progressive Staffelung ab 96 g/km (2,00–4,00 €/g)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Elektroautos:" }),
            " Steuerbefreiung für max. 10 Jahre (bis Ende 2030)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "WLTP-Wert:" }),
            " CO₂-Wert im Fahrzeugschein (Feld V.7) beachten"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Fälligkeit:" }),
            " Jährlich im Voraus, Abbuchung per SEPA-Lastschrift"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-orange-800 mb-3", children: "📋 Wo finde ich die Daten?" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm text-orange-700", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          "Alle relevanten Daten stehen in Ihrer ",
          /* @__PURE__ */ jsx("strong", { children: "Zulassungsbescheinigung Teil I" }),
          " (Fahrzeugschein):"
        ] }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "font-mono bg-orange-200 px-2 py-0.5 rounded text-xs", children: "Feld P.1" }),
            /* @__PURE__ */ jsx("span", { children: "Hubraum in cm³" })
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "font-mono bg-orange-200 px-2 py-0.5 rounded text-xs", children: "Feld V.7" }),
            /* @__PURE__ */ jsx("span", { children: "CO₂-Emissionen in g/km (kombiniert)" })
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "font-mono bg-orange-200 px-2 py-0.5 rounded text-xs", children: "Feld B" }),
            /* @__PURE__ */ jsx("span", { children: "Datum der Erstzulassung" })
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "font-mono bg-orange-200 px-2 py-0.5 rounded text-xs", children: "Feld P.3" }),
            /* @__PURE__ */ jsx("span", { children: "Kraftstoffart / Energiequelle" })
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
            /* @__PURE__ */ jsx("strong", { children: "Saisonkennzeichen:" }),
            " Bei eingeschränkter Zulassung wird die Steuer anteilig berechnet"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Oldtimer (H-Kennzeichen):" }),
            " Pauschale 191,73€ (Pkw) bzw. 46,02€ (Motorräder)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Altfahrzeuge vor 2021:" }),
            " Andere Berechnung ohne CO₂-Staffelung möglich"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Steuerschuldner:" }),
            " Der Halter laut Fahrzeugschein ist steuerpflichtig"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Stilllegung:" }),
            " Bei Außerbetriebsetzung entfällt die Steuerpflicht ab dem Folgetag"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörde" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-orange-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-orange-900", children: "Hauptzollamt" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-orange-700 mt-1", children: "Die Kfz-Steuer wird vom Zoll erhoben. Zuständig ist das Hauptzollamt Ihres Wohnortes." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Zoll-Hotline" }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "0800 6888 000 (kostenfrei)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Online-Portal" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.zoll.de/DE/Privatpersonen/Kraftfahrzeugsteuer/kraftfahrzeugsteuer_node.html",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "zoll.de/Kraftfahrzeugsteuer →"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "💳" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Zahlungsweise" }),
            /* @__PURE__ */ jsxs("p", { className: "text-gray-600 mt-1", children: [
              "Die Kfz-Steuer wird jährlich im Voraus per ",
              /* @__PURE__ */ jsx("strong", { children: "SEPA-Lastschrift" }),
              " eingezogen. Ein SEPA-Mandat wird bei der Zulassung erteilt."
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
            href: "https://www.gesetze-im-internet.de/kraftstg/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Kraftfahrzeugsteuergesetz (KraftStG) – Gesetze im Internet"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.zoll.de/DE/Privatpersonen/Kraftfahrzeugsteuer/kraftfahrzeugsteuer_node.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Zoll – Kraftfahrzeugsteuer"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bundesfinanzministerium.de/Web/DE/Themen/Zoll/Kraftfahrzeugsteuer/kraftfahrzeugsteuer.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesfinanzministerium – Kfz-Steuer"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/kfz-steuer/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "ADAC – Kfz-Steuer berechnen"
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
const $$KfzSteuerRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "Kfz-Steuer-Rechner 2025 \u2013 Kraftfahrzeugsteuer online berechnen";
  const description = "Kfz-Steuer Rechner 2025: Berechnen Sie Ihre Kraftfahrzeugsteuer online. Hubraum + CO\u2082-Staffelung. Benzin, Diesel, Elektro, Hybrid. Jetzt Autosteuer ermitteln!";
  const keywords = "Kfz Steuer Rechner, Kraftfahrzeugsteuer Rechner, Kfz Steuer berechnen, Auto Steuer Rechner, Kfz Steuer 2025, Kraftfahrzeugsteuer 2025, Autosteuer berechnen, CO2 Steuer Auto, Kfz Steuer Diesel, Kfz Steuer Benzin, Kfz Steuer Elektro, Hubraum Steuer, Kfz Steuer Hybrid, Zoll Kfz Steuer";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<main class="min-h-screen pb-8"> <!-- Header mit Zur\xFCck-Button --> <header class="bg-gradient-to-r from-orange-500 to-red-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-orange-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>\nAlle Rechner\n</a> <div class="flex items-center gap-3"> <span class="text-4xl">\u{1F697}</span> <div> <h1 class="text-2xl font-bold">Kfz-Steuer-Rechner</h1> <p class="text-orange-100 text-sm">Kraftfahrzeugsteuer 2025 berechnen</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ', ' </div> <!-- SEO Content Section --> <div class="max-w-2xl mx-auto px-4 mt-8"> <div class="bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">Kfz-Steuer 2025: Was Sie wissen m\xFCssen</h2> <div class="prose prose-sm text-gray-600 space-y-4"> <p>\nDie <strong>Kraftfahrzeugsteuer (Kfz-Steuer)</strong> ist eine j\xE4hrliche Abgabe, die jeder \n            Fahrzeughalter in Deutschland zahlen muss. Mit unserem <strong>Kfz-Steuer-Rechner 2025</strong>\nberechnen Sie schnell und einfach, wie viel Steuer f\xFCr Ihr Auto f\xE4llig wird \u2013 basierend auf\n<strong>Hubraum, CO\u2082-Emissionen und Antriebsart</strong>.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wie wird die Kfz-Steuer berechnet?</h3> <p>\nSeit 2021 setzt sich die Kfz-Steuer f\xFCr Pkw aus zwei Komponenten zusammen:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Hubraum-Komponente:</strong> 2,00 \u20AC pro angefangene 100 cm\xB3 (Benzin) bzw. 9,50 \u20AC (Diesel)</li> <li><strong>CO\u2082-Komponente:</strong> Progressive Staffelung ab 96 g/km (2,00 bis 4,00 \u20AC/g/km)</li> </ul> <p>\nDie Gesamtsteuer ergibt sich aus der Addition beider Komponenten. Je h\xF6her der CO\u2082-Aussto\xDF, \n            desto teurer wird es \u2013 das belohnt klimafreundliche Fahrzeuge.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">CO\u2082-Staffelung: So funktioniert sie</h3> <p>\nDie CO\u2082-Komponente wird <strong>progressiv</strong> berechnet. Das bedeutet: Nicht jedes Gramm \n            CO\u2082 kostet gleich viel. Die Staffelung f\xFCr 2025:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>0 \u2013 95 g/km:</strong> Steuerfrei</li> <li><strong>96 \u2013 115 g/km:</strong> 2,00 \u20AC/g</li> <li><strong>116 \u2013 135 g/km:</strong> 2,20 \u20AC/g</li> <li><strong>136 \u2013 155 g/km:</strong> 2,50 \u20AC/g</li> <li><strong>156 \u2013 175 g/km:</strong> 2,90 \u20AC/g</li> <li><strong>176 \u2013 195 g/km:</strong> 3,40 \u20AC/g</li> <li><strong>\xDCber 195 g/km:</strong> 4,00 \u20AC/g</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Kfz-Steuer f\xFCr Elektroautos</h3> <p> <strong>Elektrofahrzeuge</strong> sind von der Kfz-Steuer befreit! Diese Steuerbefreiung gilt:\n</p> <ul class="list-disc pl-5 space-y-1"> <li>F\xFCr maximal <strong>10 Jahre</strong> ab Erstzulassung</li> <li>L\xE4ngstens bis zum <strong>31. Dezember 2030</strong></li> <li>Danach: 50% der regul\xE4ren Steuer (nur Gewichtskomponente)</li> </ul> <p> <strong>Plug-in-Hybride</strong> erhalten keine Steuerbefreiung, profitieren aber von \n            niedrigeren CO\u2082-Werten.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Benzin vs. Diesel: Was ist teurer?</h3> <p> <strong>Dieselfahrzeuge</strong> zahlen eine deutlich h\xF6here Hubraum-Steuer (9,50 \u20AC vs. 2,00 \u20AC pro 100 cm\xB3). \n            Das soll den Steuervorteil beim g\xFCnstigeren Dieselkraftstoff ausgleichen:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Benzin 1.6L (1.600 cm\xB3):</strong> ca. 32 \u20AC Hubraum-Steuer</li> <li><strong>Diesel 1.6L (1.600 cm\xB3):</strong> ca. 152 \u20AC Hubraum-Steuer</li> </ul> <p>\nOb sich Diesel lohnt, h\xE4ngt von der Fahrleistung ab \u2013 Vielfahrer profitieren trotz h\xF6herer Steuer \n            vom g\xFCnstigeren Kraftstoff.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wo finde ich die Daten f\xFCr die Berechnung?</h3> <p>\nAlle relevanten Angaben stehen in Ihrer <strong>Zulassungsbescheinigung Teil I</strong> (Fahrzeugschein):\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Feld P.1:</strong> Hubraum in cm\xB3</li> <li><strong>Feld V.7:</strong> CO\u2082-Emissionen (kombiniert) in g/km</li> <li><strong>Feld B:</strong> Datum der Erstzulassung</li> <li><strong>Feld P.3:</strong> Kraftstoffart / Energiequelle</li> </ul> <p>\nAchten Sie auf den <strong>WLTP-Wert</strong> (Worldwide Harmonized Light Vehicles Test Procedure) \u2013 \n            dieser ist seit 2018 der Standard f\xFCr die Verbrauchsmessung.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wann muss ich Kfz-Steuer zahlen?</h3> <p>\nDie Kfz-Steuer wird <strong>j\xE4hrlich im Voraus</strong> erhoben:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>F\xE4lligkeit:</strong> Am Tag der Zulassung (dann j\xE4hrlich)</li> <li><strong>Zahlungsweise:</strong> SEPA-Lastschrift (Pflicht seit 2014)</li> <li><strong>Gl\xE4ubiger:</strong> Das zust\xE4ndige Hauptzollamt</li> </ul> <p>\nBei <strong>Saisonkennzeichen</strong> wird die Steuer anteilig berechnet. Bei Abmeldung \n            (Au\xDFerbetriebsetzung) entf\xE4llt die Steuerpflicht ab dem Folgetag.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Sonderregelungen: Oldtimer & Co.</h3> <p>\nF\xFCr bestimmte Fahrzeuge gelten Sonderregelungen:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Oldtimer (H-Kennzeichen):</strong> Pauschale 191,73 \u20AC (Pkw) bzw. 46,02 \u20AC (Motorr\xE4der)</li> <li><strong>Saisonkennzeichen:</strong> Anteilige Berechnung nach Monaten</li> <li><strong>Rote Kennzeichen (07):</strong> Pauschale f\xFCr H\xE4ndler/Werkst\xE4tten</li> <li><strong>Schwerbehinderte:</strong> Erm\xE4\xDFigung oder Befreiung m\xF6glich</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wer ist steuerpflichtig?</h3> <p>\nSteuerschuldner ist der <strong>Fahrzeughalter</strong> \u2013 also die Person, die in der \n            Zulassungsbescheinigung eingetragen ist. Bei Halterwechsel geht die Steuerpflicht auf den \n            neuen Halter \xFCber. Die Steuer wird automatisch vom Zoll abgebucht \u2013 ein aktives SEPA-Mandat \n            ist Voraussetzung f\xFCr die Zulassung.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Kfz-Steuer bei Neufahrzeugen ab 2021</h3> <p>\nF\xFCr Fahrzeuge mit Erstzulassung <strong>ab 1. Januar 2021</strong> gilt die neue \n            CO\u2082-basierte Berechnung mit der progressiven Staffelung. Fahrzeuge, die vorher zugelassen \n            wurden, behalten ihre alte Besteuerung \u2013 ein Wechsel zur neuen Berechnung ist nicht m\xF6glich.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Tipps zur Steueroptimierung</h3> <ul class="list-disc pl-5 space-y-1"> <li><strong>CO\u2082-arme Fahrzeuge:</strong> Bis 95 g/km ist die CO\u2082-Komponente steuerfrei</li> <li><strong>Elektroauto:</strong> Bis zu 10 Jahre komplett steuerfrei</li> <li><strong>Hybrid:</strong> Niedrigere CO\u2082-Werte reduzieren die Steuerlast</li> <li><strong>Kleinere Motoren:</strong> Weniger Hubraum = weniger Steuer</li> <li><strong>Saisonkennzeichen:</strong> Bei Zweitwagen nur f\xFCr Nutzungsmonate zahlen</li> </ul> </div> </div> </div> </main>  <script type="application/ld+json">', '<\/script>  <script type="application/ld+json">', "<\/script> "])), maybeRenderHead(), renderComponent($$result2, "KfzSteuerRechner", KfzSteuerRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/KfzSteuerRechner", "client:component-export": "default" }), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Kfz-Steuer-Rechner 2025",
    "description": description,
    "url": "https://deutschland-rechner.de/kfz-steuer-rechner",
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
        "name": "Wie hoch ist die Kfz-Steuer 2025?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Die Kfz-Steuer 2025 berechnet sich aus Hubraum (Benzin: 2\u20AC, Diesel: 9,50\u20AC pro 100 cm\xB3) und CO\u2082-Emissionen (progressive Staffelung 2-4\u20AC/g ab 96 g/km). Ein Benziner mit 1.600 cm\xB3 und 120 g/km CO\u2082 zahlt ca. 82\u20AC pro Jahr."
        }
      },
      {
        "@type": "Question",
        "name": "Ist ein Elektroauto steuerfrei?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, Elektroautos sind von der Kfz-Steuer befreit \u2013 f\xFCr maximal 10 Jahre ab Erstzulassung, l\xE4ngstens bis 31.12.2030. Danach f\xE4llt nur die halbe Steuer an (Gewichtskomponente)."
        }
      },
      {
        "@type": "Question",
        "name": "Wer erhebt die Kfz-Steuer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Die Kfz-Steuer wird vom Zoll (Hauptzollamt) erhoben. Die Zahlung erfolgt j\xE4hrlich im Voraus per SEPA-Lastschrift. Das SEPA-Mandat wird bei der Fahrzeugzulassung erteilt."
        }
      },
      {
        "@type": "Question",
        "name": "Warum zahlt Diesel mehr Kfz-Steuer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Dieselfahrzeuge zahlen 9,50\u20AC statt 2\u20AC pro 100 cm\xB3 Hubraum. Das soll den niedrigeren Steuersatz auf Dieselkraftstoff ausgleichen. Vielfahrer profitieren trotzdem von Diesel durch die g\xFCnstigeren Spritpreise."
        }
      },
      {
        "@type": "Question",
        "name": "Was kostet ein Oldtimer an Kfz-Steuer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "F\xFCr Oldtimer mit H-Kennzeichen gilt eine Pauschale: 191,73\u20AC f\xFCr Pkw und 46,02\u20AC f\xFCr Motorr\xE4der pro Jahr \u2013 unabh\xE4ngig von Hubraum und CO\u2082-Wert. Das H-Kennzeichen gibt es f\xFCr Fahrzeuge, die mindestens 30 Jahre alt sind."
        }
      }
    ]
  }))) })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/kfz-steuer-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/kfz-steuer-rechner.astro";
const $$url = "/kfz-steuer-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$KfzSteuerRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
