/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, u as unescapeHTML, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_v22DC8tm.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const BMI_KATEGORIEN = [
  { min: 0, max: 16, kategorie: "Starkes Untergewicht", farbe: "bg-red-500", textFarbe: "text-red-700", hinweis: "Bitte suchen Sie ärztliche Hilfe auf." },
  { min: 16, max: 17, kategorie: "Mäßiges Untergewicht", farbe: "bg-orange-400", textFarbe: "text-orange-700", hinweis: "Eine ärztliche Abklärung wird empfohlen." },
  { min: 17, max: 18.5, kategorie: "Leichtes Untergewicht", farbe: "bg-yellow-400", textFarbe: "text-yellow-700", hinweis: "Leicht untergewichtig – behalten Sie Ihr Gewicht im Auge." },
  { min: 18.5, max: 25, kategorie: "Normalgewicht", farbe: "bg-green-500", textFarbe: "text-green-700", hinweis: "Ihr Gewicht liegt im optimalen Bereich. Weiter so!" },
  { min: 25, max: 30, kategorie: "Übergewicht (Präadipositas)", farbe: "bg-yellow-500", textFarbe: "text-yellow-700", hinweis: "Leicht erhöhtes Gesundheitsrisiko. Achten Sie auf Ernährung und Bewegung." },
  { min: 30, max: 35, kategorie: "Adipositas Grad I", farbe: "bg-orange-500", textFarbe: "text-orange-700", hinweis: "Erhöhtes Gesundheitsrisiko. Eine Gewichtsreduktion wird empfohlen." },
  { min: 35, max: 40, kategorie: "Adipositas Grad II", farbe: "bg-red-400", textFarbe: "text-red-700", hinweis: "Hohes Gesundheitsrisiko. Bitte suchen Sie ärztliche Beratung." },
  { min: 40, max: 100, kategorie: "Adipositas Grad III", farbe: "bg-red-600", textFarbe: "text-red-700", hinweis: "Sehr hohes Gesundheitsrisiko. Ärztliche Behandlung dringend empfohlen." }
];
const ALTERS_BMI = [
  { minAlter: 19, maxAlter: 24, optimalMin: 19, optimalMax: 24 },
  { minAlter: 25, maxAlter: 34, optimalMin: 20, optimalMax: 25 },
  { minAlter: 35, maxAlter: 44, optimalMin: 21, optimalMax: 26 },
  { minAlter: 45, maxAlter: 54, optimalMin: 22, optimalMax: 27 },
  { minAlter: 55, maxAlter: 64, optimalMin: 23, optimalMax: 28 },
  { minAlter: 65, maxAlter: 120, optimalMin: 24, optimalMax: 29 }
];
function BMIRechner() {
  const [gewicht, setGewicht] = useState(75);
  const [groesse, setGroesse] = useState(175);
  const [alter, setAlter] = useState(35);
  const [geschlecht, setGeschlecht] = useState("mann");
  const [berechnet, setBerechnet] = useState(false);
  const ergebnis = useMemo(() => {
    if (!gewicht || !groesse || groesse < 100 || groesse > 250 || gewicht < 30 || gewicht > 300) {
      return null;
    }
    const groesseM = groesse / 100;
    const bmi = gewicht / (groesseM * groesseM);
    const kategorie = BMI_KATEGORIEN.find((k) => bmi >= k.min && bmi < k.max) || BMI_KATEGORIEN[BMI_KATEGORIEN.length - 1];
    const altersBereich = ALTERS_BMI.find((a) => alter >= a.minAlter && alter <= a.maxAlter) || ALTERS_BMI[0];
    const idealgewichtMin = 18.5 * groesseM * groesseM;
    const idealgewichtMax = 25 * groesseM * groesseM;
    const idealgewichtMitte = (idealgewichtMin + idealgewichtMax) / 2;
    const altersIdealMin = altersBereich.optimalMin * groesseM * groesseM;
    const altersIdealMax = altersBereich.optimalMax * groesseM * groesseM;
    const altersIdealMitte = (altersIdealMin + altersIdealMax) / 2;
    const differenz = gewicht - idealgewichtMitte;
    const differenzAltersangepasst = gewicht - altersIdealMitte;
    let grundumsatz;
    if (geschlecht === "mann") {
      grundumsatz = 10 * gewicht + 6.25 * groesse - 5 * alter + 5;
    } else {
      grundumsatz = 10 * gewicht + 6.25 * groesse - 5 * alter - 161;
    }
    const kalorienbedarfSitzend = grundumsatz * 1.2;
    const kalorienbedarfLeicht = grundumsatz * 1.4;
    const kalorienbedarfMittel = grundumsatz * 1.6;
    const kalorienbedarfAktiv = grundumsatz * 1.8;
    const gewichtBei18_5 = 18.5 * groesseM * groesseM;
    const gewichtBei25 = 25 * groesseM * groesseM;
    const gewichtBei30 = 30 * groesseM * groesseM;
    const istNormal = bmi >= 18.5 && bmi < 25;
    const istAltersNormal = bmi >= altersBereich.optimalMin && bmi <= altersBereich.optimalMax;
    return {
      bmi,
      kategorie: kategorie.kategorie,
      farbe: kategorie.farbe,
      textFarbe: kategorie.textFarbe,
      hinweis: kategorie.hinweis,
      // Idealgewicht
      idealgewichtMin,
      idealgewichtMax,
      idealgewichtMitte,
      differenz,
      // Altersangepasst
      altersBereich,
      altersIdealMin,
      altersIdealMax,
      altersIdealMitte,
      differenzAltersangepasst,
      istAltersNormal,
      // Grundumsatz & Kalorien
      grundumsatz,
      kalorienbedarfSitzend,
      kalorienbedarfLeicht,
      kalorienbedarfMittel,
      kalorienbedarfAktiv,
      // Grenzen
      gewichtBei18_5,
      gewichtBei25,
      gewichtBei30,
      istNormal
    };
  }, [gewicht, groesse, alter, geschlecht]);
  const formatNumber = (n, decimals = 1) => n.toFixed(decimals).replace(".", ",");
  const handleBerechnen = () => {
    setBerechnet(true);
  };
  const getBMIPosition = (bmi) => {
    const min = 15;
    const max = 40;
    const position = (bmi - min) / (max - min) * 100;
    return Math.max(0, Math.min(100, position));
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-xl font-bold text-gray-800 mb-6 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "📊" }),
        "Ihre Daten eingeben"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Geschlecht" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setGeschlecht("mann"),
                className: `flex-1 py-3 px-4 rounded-lg border-2 transition-all ${geschlecht === "mann" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"}`,
                children: [
                  /* @__PURE__ */ jsx("span", { className: "text-2xl mr-2", children: "👨" }),
                  "Mann"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setGeschlecht("frau"),
                className: `flex-1 py-3 px-4 rounded-lg border-2 transition-all ${geschlecht === "frau" ? "border-pink-500 bg-pink-50 text-pink-700" : "border-gray-200 hover:border-gray-300"}`,
                children: [
                  /* @__PURE__ */ jsx("span", { className: "text-2xl mr-2", children: "👩" }),
                  "Frau"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Gewicht (kg)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: gewicht,
              onChange: (e) => setGewicht(Number(e.target.value)),
              className: "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg",
              placeholder: "z.B. 75",
              min: 30,
              max: 300
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Körpergröße (cm)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: groesse,
              onChange: (e) => setGroesse(Number(e.target.value)),
              className: "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg",
              placeholder: "z.B. 175",
              min: 100,
              max: 250
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Alter (Jahre)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: alter,
              onChange: (e) => setAlter(Number(e.target.value)),
              className: "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg",
              placeholder: "z.B. 35",
              min: 18,
              max: 120
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleBerechnen,
            className: "w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl",
            children: "BMI berechnen"
          }
        )
      ] })
    ] }),
    berechnet && ergebnis && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-xl font-bold text-gray-800 mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "📈" }),
          "Ihr BMI-Ergebnis"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center mb-6", children: [
          /* @__PURE__ */ jsxs("div", { className: `inline-block px-8 py-4 rounded-2xl ${ergebnis.farbe} text-white`, children: [
            /* @__PURE__ */ jsx("div", { className: "text-5xl font-bold", children: formatNumber(ergebnis.bmi) }),
            /* @__PURE__ */ jsx("div", { className: "text-sm opacity-90", children: "kg/m²" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: `mt-3 text-lg font-semibold ${ergebnis.textFarbe}`, children: ergebnis.kategorie })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative h-8 rounded-full overflow-hidden flex", children: [
            /* @__PURE__ */ jsx("div", { className: "flex-1 bg-red-400", title: "Untergewicht" }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 bg-yellow-400", title: "Leichtes Untergewicht" }),
            /* @__PURE__ */ jsx("div", { className: "flex-[1.3] bg-green-500", title: "Normalgewicht" }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 bg-yellow-500", title: "Übergewicht" }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 bg-orange-500", title: "Adipositas I" }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 bg-red-500", title: "Adipositas II/III" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "relative h-4", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute -top-1 w-4 h-4 bg-gray-800 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2",
              style: { left: `${getBMIPosition(ergebnis.bmi)}%` }
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-500 mt-1", children: [
            /* @__PURE__ */ jsx("span", { children: "15" }),
            /* @__PURE__ */ jsx("span", { children: "18,5" }),
            /* @__PURE__ */ jsx("span", { children: "25" }),
            /* @__PURE__ */ jsx("span", { children: "30" }),
            /* @__PURE__ */ jsx("span", { children: "35" }),
            /* @__PURE__ */ jsx("span", { children: "40" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: `p-4 rounded-lg ${ergebnis.istNormal ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`, children: /* @__PURE__ */ jsx("p", { className: ergebnis.istNormal ? "text-green-800" : "text-amber-800", children: ergebnis.hinweis }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-xl font-bold text-gray-800 mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "⚖️" }),
          "Gewichtsanalyse"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Ihr aktuelles Gewicht" }),
            /* @__PURE__ */ jsxs("span", { className: "font-bold text-gray-800", children: [
              formatNumber(gewicht, 0),
              " kg"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Normalgewicht (BMI 18,5-25)" }),
            /* @__PURE__ */ jsxs("span", { className: "font-semibold text-green-600", children: [
              formatNumber(ergebnis.idealgewichtMin, 0),
              " – ",
              formatNumber(ergebnis.idealgewichtMax, 0),
              " kg"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
              "Optimal für Alter ",
              ergebnis.altersBereich.minAlter,
              "-",
              ergebnis.altersBereich.maxAlter,
              /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-400 ml-1", children: [
                "(BMI ",
                ergebnis.altersBereich.optimalMin,
                "-",
                ergebnis.altersBereich.optimalMax,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "font-semibold text-blue-600", children: [
              formatNumber(ergebnis.altersIdealMin, 0),
              " – ",
              formatNumber(ergebnis.altersIdealMax, 0),
              " kg"
            ] })
          ] }),
          !ergebnis.istNormal && /* @__PURE__ */ jsx("div", { className: `p-4 rounded-lg ${ergebnis.differenz > 0 ? "bg-amber-50" : "bg-blue-50"}`, children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsx("span", { className: ergebnis.differenz > 0 ? "text-amber-700" : "text-blue-700", children: ergebnis.differenz > 0 ? "Über Normalgewicht" : "Unter Normalgewicht" }),
            /* @__PURE__ */ jsxs("span", { className: `font-bold ${ergebnis.differenz > 0 ? "text-amber-700" : "text-blue-700"}`, children: [
              ergebnis.differenz > 0 ? "+" : "",
              formatNumber(ergebnis.differenz, 1),
              " kg"
            ] })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-xl font-bold text-gray-800 mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🔥" }),
          "Kalorienbedarf (Richtwerte)"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("div", { className: "p-4 bg-gray-50 rounded-lg", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "Grundumsatz" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Kalorienbedarf in Ruhe" })
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-2xl font-bold text-gray-800", children: [
              formatNumber(ergebnis.grundumsatz, 0),
              " kcal"
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-3 bg-blue-50 rounded-lg text-center", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs text-blue-600 mb-1", children: "Sitzend (Büro)" }),
              /* @__PURE__ */ jsxs("div", { className: "font-bold text-blue-800", children: [
                formatNumber(ergebnis.kalorienbedarfSitzend, 0),
                " kcal"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-3 bg-green-50 rounded-lg text-center", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs text-green-600 mb-1", children: "Leicht aktiv" }),
              /* @__PURE__ */ jsxs("div", { className: "font-bold text-green-800", children: [
                formatNumber(ergebnis.kalorienbedarfLeicht, 0),
                " kcal"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-3 bg-yellow-50 rounded-lg text-center", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs text-yellow-600 mb-1", children: "Mäßig aktiv" }),
              /* @__PURE__ */ jsxs("div", { className: "font-bold text-yellow-800", children: [
                formatNumber(ergebnis.kalorienbedarfMittel, 0),
                " kcal"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-3 bg-orange-50 rounded-lg text-center", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs text-orange-600 mb-1", children: "Sehr aktiv" }),
              /* @__PURE__ */ jsxs("div", { className: "font-bold text-orange-800", children: [
                formatNumber(ergebnis.kalorienbedarfAktiv, 0),
                " kcal"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Berechnung nach Mifflin-St Jeor-Formel. Der tatsächliche Bedarf kann individuell variieren." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-xl font-bold text-gray-800 mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "📋" }),
          "BMI-Klassifikation (WHO)"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b-2 border-gray-200", children: [
            /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-2", children: "Kategorie" }),
            /* @__PURE__ */ jsx("th", { className: "text-center py-2 px-2", children: "BMI" }),
            /* @__PURE__ */ jsx("th", { className: "text-right py-2 px-2", children: "Ihr Gewicht wäre" })
          ] }) }),
          /* @__PURE__ */ jsxs("tbody", { children: [
            /* @__PURE__ */ jsxs("tr", { className: `border-b border-gray-100 ${ergebnis.bmi < 18.5 ? "bg-yellow-50" : ""}`, children: [
              /* @__PURE__ */ jsxs("td", { className: "py-2 px-2", children: [
                /* @__PURE__ */ jsx("span", { className: "inline-block w-3 h-3 bg-yellow-400 rounded-full mr-2" }),
                "Untergewicht"
              ] }),
              /* @__PURE__ */ jsx("td", { className: "text-center py-2 px-2", children: "< 18,5" }),
              /* @__PURE__ */ jsxs("td", { className: "text-right py-2 px-2", children: [
                "< ",
                formatNumber(ergebnis.gewichtBei18_5, 0),
                " kg"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("tr", { className: `border-b border-gray-100 ${ergebnis.bmi >= 18.5 && ergebnis.bmi < 25 ? "bg-green-50" : ""}`, children: [
              /* @__PURE__ */ jsxs("td", { className: "py-2 px-2", children: [
                /* @__PURE__ */ jsx("span", { className: "inline-block w-3 h-3 bg-green-500 rounded-full mr-2" }),
                "Normalgewicht"
              ] }),
              /* @__PURE__ */ jsx("td", { className: "text-center py-2 px-2", children: "18,5 – 24,9" }),
              /* @__PURE__ */ jsxs("td", { className: "text-right py-2 px-2", children: [
                formatNumber(ergebnis.gewichtBei18_5, 0),
                " – ",
                formatNumber(ergebnis.gewichtBei25, 0),
                " kg"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("tr", { className: `border-b border-gray-100 ${ergebnis.bmi >= 25 && ergebnis.bmi < 30 ? "bg-yellow-50" : ""}`, children: [
              /* @__PURE__ */ jsxs("td", { className: "py-2 px-2", children: [
                /* @__PURE__ */ jsx("span", { className: "inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2" }),
                "Übergewicht"
              ] }),
              /* @__PURE__ */ jsx("td", { className: "text-center py-2 px-2", children: "25 – 29,9" }),
              /* @__PURE__ */ jsxs("td", { className: "text-right py-2 px-2", children: [
                formatNumber(ergebnis.gewichtBei25, 0),
                " – ",
                formatNumber(ergebnis.gewichtBei30, 0),
                " kg"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("tr", { className: `border-b border-gray-100 ${ergebnis.bmi >= 30 && ergebnis.bmi < 35 ? "bg-orange-50" : ""}`, children: [
              /* @__PURE__ */ jsxs("td", { className: "py-2 px-2", children: [
                /* @__PURE__ */ jsx("span", { className: "inline-block w-3 h-3 bg-orange-500 rounded-full mr-2" }),
                "Adipositas I"
              ] }),
              /* @__PURE__ */ jsx("td", { className: "text-center py-2 px-2", children: "30 – 34,9" }),
              /* @__PURE__ */ jsxs("td", { className: "text-right py-2 px-2", children: [
                formatNumber(ergebnis.gewichtBei30, 0),
                " – ",
                formatNumber(35 * (groesse / 100) * (groesse / 100), 0),
                " kg"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("tr", { className: `border-b border-gray-100 ${ergebnis.bmi >= 35 && ergebnis.bmi < 40 ? "bg-red-50" : ""}`, children: [
              /* @__PURE__ */ jsxs("td", { className: "py-2 px-2", children: [
                /* @__PURE__ */ jsx("span", { className: "inline-block w-3 h-3 bg-red-400 rounded-full mr-2" }),
                "Adipositas II"
              ] }),
              /* @__PURE__ */ jsx("td", { className: "text-center py-2 px-2", children: "35 – 39,9" }),
              /* @__PURE__ */ jsxs("td", { className: "text-right py-2 px-2", children: [
                formatNumber(35 * (groesse / 100) * (groesse / 100), 0),
                " – ",
                formatNumber(40 * (groesse / 100) * (groesse / 100), 0),
                " kg"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("tr", { className: `${ergebnis.bmi >= 40 ? "bg-red-50" : ""}`, children: [
              /* @__PURE__ */ jsxs("td", { className: "py-2 px-2", children: [
                /* @__PURE__ */ jsx("span", { className: "inline-block w-3 h-3 bg-red-600 rounded-full mr-2" }),
                "Adipositas III"
              ] }),
              /* @__PURE__ */ jsx("td", { className: "text-center py-2 px-2", children: "≥ 40" }),
              /* @__PURE__ */ jsxs("td", { className: "text-right py-2 px-2", children: [
                "≥ ",
                formatNumber(40 * (groesse / 100) * (groesse / 100), 0),
                " kg"
              ] })
            ] })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-xl font-bold text-gray-800 mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "ℹ️" }),
          "Gut zu wissen"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-sm text-gray-600", children: [
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-blue-50 rounded-lg border border-blue-100", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-blue-800 mb-2", children: "Was misst der BMI?" }),
            /* @__PURE__ */ jsxs("p", { className: "text-blue-700", children: [
              "Der Body-Mass-Index (BMI) ist ein Richtwert für das Verhältnis von Körpergewicht zu Körpergröße. Er wird berechnet als: ",
              /* @__PURE__ */ jsx("strong", { children: "Gewicht (kg) ÷ Größe² (m)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-amber-50 rounded-lg border border-amber-100", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-amber-800 mb-2", children: "⚠️ Grenzen des BMI" }),
            /* @__PURE__ */ jsxs("ul", { className: "text-amber-700 space-y-1 list-disc list-inside", children: [
              /* @__PURE__ */ jsx("li", { children: "Unterscheidet nicht zwischen Muskelmasse und Fettmasse" }),
              /* @__PURE__ */ jsx("li", { children: "Sportler mit viel Muskelmasse haben oft einen hohen BMI trotz geringem Körperfett" }),
              /* @__PURE__ */ jsx("li", { children: "Die Fettverteilung (z.B. Bauchfett) wird nicht berücksichtigt" }),
              /* @__PURE__ */ jsx("li", { children: "Für Kinder, Schwangere und Senioren gelten andere Richtwerte" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-green-50 rounded-lg border border-green-100", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-green-800 mb-2", children: "💡 Altersangepasster BMI" }),
            /* @__PURE__ */ jsx("p", { className: "text-green-700", children: "Mit zunehmendem Alter ist ein etwas höherer BMI oft unbedenklich. Für Menschen ab 65 Jahren gilt ein BMI zwischen 24-29 als optimal, da leichte Reserven bei Krankheit schützend wirken können." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-xl font-bold text-gray-800 mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "⚠️" }),
          "Wichtige Hinweise"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-lg", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🩺" }),
            /* @__PURE__ */ jsxs("p", { className: "text-gray-600", children: [
              "Der BMI ist nur ein ",
              /* @__PURE__ */ jsx("strong", { children: "Orientierungswert" }),
              ". Für eine umfassende Beurteilung Ihrer Gesundheit konsultieren Sie bitte Ihren Arzt."
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-lg", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🏋️" }),
            /* @__PURE__ */ jsxs("p", { className: "text-gray-600", children: [
              "Bei regelmäßigem Kraftsport kann Ihr BMI erhöht sein, ohne dass Übergewicht vorliegt. Der ",
              /* @__PURE__ */ jsx("strong", { children: "Körperfettanteil" }),
              " ist hier aussagekräftiger."
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-lg", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📏" }),
            /* @__PURE__ */ jsxs("p", { className: "text-gray-600", children: [
              "Der ",
              /* @__PURE__ */ jsx("strong", { children: "Taillenumfang" }),
              " ist ein wichtiger zusätzlicher Indikator: Bei Frauen sollte er unter 88 cm, bei Männern unter 102 cm liegen (Risiko für metabolische Erkrankungen)."
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-xl font-bold text-gray-800 mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "📚" }),
          "Quellen"
        ] }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm", children: [
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
            "a",
            {
              href: "https://www.who.int/europe/news-room/fact-sheets/item/a-healthy-lifestyle---who-recommendations",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-emerald-600 hover:underline flex items-center gap-1",
              children: [
                "WHO – Klassifikation des BMI",
                /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" }) })
              ]
            }
          ) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
            "a",
            {
              href: "https://www.dge.de/gesunde-ernaehrung/gut-essen-und-trinken/dge-empfehlungen/",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-emerald-600 hover:underline flex items-center gap-1",
              children: [
                "Deutsche Gesellschaft für Ernährung (DGE)",
                /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" }) })
              ]
            }
          ) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
            "a",
            {
              href: "https://www.rki.de/DE/Content/Gesundheitsmonitoring/Themen/Uebergewicht_Adipositas/Uebergewicht_Adipositas_node.html",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-emerald-600 hover:underline flex items-center gap-1",
              children: [
                "Robert Koch-Institut – Übergewicht und Adipositas",
                /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" }) })
              ]
            }
          ) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
            "a",
            {
              href: "https://www.bzfe.de/ernaehrung/ernaehrungswissen/gesundheit/bmi-rechner/",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-emerald-600 hover:underline flex items-center gap-1",
              children: [
                "Bundeszentrum für Ernährung (BZfE)",
                /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" }) })
              ]
            }
          ) })
        ] })
      ] })
    ] })
  ] });
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$BmiRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "BMI-Rechner 2025 \u2013 Body-Mass-Index kostenlos berechnen";
  const description = "BMI Rechner: Berechnen Sie Ihren Body-Mass-Index kostenlos. Mit Idealgewicht, Kalorienbedarf, altersangepasster Auswertung & WHO-Klassifikation. Sofort & ohne Anmeldung.";
  const keywords = "BMI Rechner, BMI berechnen, Body Mass Index, BMI Tabelle, BMI Formel, BMI ausrechnen, Idealgewicht berechnen, BMI Frau, BMI Mann, BMI Alter, BMI Rechner kostenlos, Normalgewicht, \xDCbergewicht BMI, Adipositas BMI, Kalorienbedarf berechnen, Grundumsatz Rechner";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<main class="min-h-screen pb-8"> <!-- Header mit Zur\xFCck-Button --> <header class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-emerald-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>\nAlle Rechner\n</a> <div class="flex items-center gap-3"> <span class="text-4xl">\u2696\uFE0F</span> <div> <h1 class="text-2xl font-bold">BMI-Rechner</h1> <p class="text-emerald-100 text-sm">Body-Mass-Index berechnen \u2013 kostenlos & sofort</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ', ' </div> <!-- SEO Content Section --> <div class="max-w-2xl mx-auto px-4 mt-8"> <div class="bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">BMI-Rechner: Alles, was Sie wissen m\xFCssen</h2> <div class="prose prose-sm text-gray-600 space-y-4"> <p>\nDer <strong>Body-Mass-Index (BMI)</strong> ist ein weltweit anerkannter Richtwert zur Einsch\xE4tzung \n            des K\xF6rpergewichts in Relation zur K\xF6rpergr\xF6\xDFe. Mit unserem <strong>BMI-Rechner</strong> berechnen \n            Sie Ihren BMI schnell, kostenlos und ohne Anmeldung \u2013 inklusive detaillierter Auswertung nach \n            WHO-Klassifikation.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wie wird der BMI berechnet?</h3> <p>\nDie <strong>BMI-Formel</strong> ist einfach: K\xF6rpergewicht in Kilogramm geteilt durch die \n            K\xF6rpergr\xF6\xDFe in Metern zum Quadrat.\n</p> <div class="bg-gray-100 p-4 rounded-lg text-center my-4"> <code class="text-lg font-mono">BMI = Gewicht (kg) \xF7 Gr\xF6\xDFe\xB2 (m\xB2)</code> </div> <p> <strong>Beispiel:</strong> Eine Person mit 75 kg Gewicht und 1,75 m Gr\xF6\xDFe hat einen BMI von \n            75 \xF7 (1,75 \xD7 1,75) = <strong>24,5 kg/m\xB2</strong>.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">BMI-Tabelle: WHO-Klassifikation</h3> <p>\nDie <strong>Weltgesundheitsorganisation (WHO)</strong> teilt den BMI in folgende Kategorien ein:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Unter 18,5:</strong> Untergewicht</li> <li><strong>18,5 \u2013 24,9:</strong> Normalgewicht (Idealbereich)</li> <li><strong>25 \u2013 29,9:</strong> \xDCbergewicht (Pr\xE4adipositas)</li> <li><strong>30 \u2013 34,9:</strong> Adipositas Grad I</li> <li><strong>35 \u2013 39,9:</strong> Adipositas Grad II</li> <li><strong>Ab 40:</strong> Adipositas Grad III (morbide Adipositas)</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Was ist ein normaler BMI?</h3> <p>\nEin <strong>normaler BMI</strong> liegt zwischen 18,5 und 24,9. In diesem Bereich ist das \n            Risiko f\xFCr gewichtsbedingte Erkrankungen wie Diabetes, Herz-Kreislauf-Erkrankungen oder \n            Gelenkprobleme am geringsten.\n</p> <p>\nAllerdings: Der <strong>optimale BMI</strong> kann je nach Alter, Geschlecht und Muskelmasse \n            variieren. F\xFCr Menschen ab 65 Jahren gilt beispielsweise ein BMI zwischen 24-29 als optimal, \n            da leichte Reserven im Krankheitsfall sch\xFCtzend wirken k\xF6nnen.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">BMI f\xFCr Frauen und M\xE4nner</h3> <p>\nDie WHO-Grenzwerte gelten grunds\xE4tzlich f\xFCr beide Geschlechter. Dennoch gibt es\n<strong>geschlechtsspezifische Unterschiede</strong>:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Frauen</strong> haben von Natur aus einen h\xF6heren K\xF6rperfettanteil als M\xE4nner</li> <li><strong>M\xE4nner</strong> haben in der Regel mehr Muskelmasse, was den BMI erh\xF6hen kann</li> <li>Der <strong>Taillenumfang</strong> ist als Zusatzindikator hilfreich: \n              Frauen &lt; 88 cm, M\xE4nner &lt; 102 cm</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Grenzen des BMI</h3> <p>\nDer BMI ist ein <strong>Orientierungswert</strong>, hat aber Einschr\xE4nkungen:\n</p> <ul class="list-disc pl-5 space-y-1"> <li>Unterscheidet nicht zwischen Muskelmasse und Fett</li> <li>Sportler mit viel Muskeln haben oft einen \u201Eerh\xF6hten" BMI ohne gesundheitliches Risiko</li> <li>Die <strong>Fettverteilung</strong> (besonders Bauchfett) wird nicht ber\xFCcksichtigt</li> <li>F\xFCr <strong>Kinder und Jugendliche</strong> gelten altersabh\xE4ngige Perzentilkurven</li> <li>In der <strong>Schwangerschaft</strong> ist der BMI nicht aussagekr\xE4ftig</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Idealgewicht berechnen</h3> <p>\nAus dem BMI l\xE4sst sich das <strong>Idealgewicht</strong> ableiten. F\xFCr einen BMI im Normalbereich \n            (18,5 \u2013 25) ergibt sich:\n</p> <div class="bg-gray-100 p-4 rounded-lg my-4"> <p class="font-mono text-sm">\nMindestgewicht = 18,5 \xD7 Gr\xF6\xDFe\xB2 (m\xB2)<br>\nMaximalgewicht = 25 \xD7 Gr\xF6\xDFe\xB2 (m\xB2)\n</p> </div> <p> <strong>Beispiel</strong> f\xFCr 1,75 m K\xF6rpergr\xF6\xDFe: Das Normalgewicht liegt zwischen \n            56,7 kg und 76,6 kg.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">BMI und Gesundheitsrisiken</h3> <p>\nEin erh\xF6hter BMI ist mit verschiedenen <strong>Gesundheitsrisiken</strong> verbunden:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Diabetes Typ 2:</strong> Risiko steigt mit zunehmendem BMI</li> <li><strong>Herz-Kreislauf-Erkrankungen:</strong> Bluthochdruck, Herzinfarkt, Schlaganfall</li> <li><strong>Gelenkprobleme:</strong> Besonders Knie und H\xFCfte</li> <li><strong>Schlafapnoe:</strong> Atemaussetzer im Schlaf</li> <li><strong>Bestimmte Krebsarten:</strong> Erh\xF6htes Risiko bei Adipositas</li> </ul> <p>\nAber: Auch <strong>Untergewicht</strong> ist mit Risiken verbunden, etwa einem geschw\xE4chten \n            Immunsystem oder Mangelern\xE4hrung.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Grundumsatz und Kalorienbedarf</h3> <p>\nUnser Rechner ermittelt auch Ihren <strong>Grundumsatz</strong> \u2013 die Kalorien, die Ihr K\xF6rper \n            in Ruhe verbrennt. Wir verwenden die wissenschaftlich anerkannte <strong>Mifflin-St Jeor-Formel</strong>:\n</p> <div class="bg-gray-100 p-4 rounded-lg my-4 text-sm"> <p class="font-mono"> <strong>M\xE4nner:</strong> Grundumsatz = 10 \xD7 Gewicht + 6,25 \xD7 Gr\xF6\xDFe - 5 \xD7 Alter + 5<br> <strong>Frauen:</strong> Grundumsatz = 10 \xD7 Gewicht + 6,25 \xD7 Gr\xF6\xDFe - 5 \xD7 Alter - 161\n</p> </div> <p>\nDer <strong>Gesamtenergiebedarf</strong> ergibt sich aus dem Grundumsatz multipliziert mit \n            dem PAL-Faktor (Physical Activity Level) je nach Aktivit\xE4tsniveau.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Tipps f\xFCr ein gesundes Gewicht</h3> <ul class="list-disc pl-5 space-y-1"> <li><strong>Ausgewogene Ern\xE4hrung:</strong> Viel Gem\xFCse, Obst, Vollkornprodukte, wenig Zucker</li> <li><strong>Regelm\xE4\xDFige Bewegung:</strong> Mindestens 150 Minuten moderate Aktivit\xE4t pro Woche</li> <li><strong>Ausreichend Schlaf:</strong> 7-9 Stunden pro Nacht</li> <li><strong>Stressmanagement:</strong> Chronischer Stress beg\xFCnstigt Gewichtszunahme</li> <li><strong>Realistische Ziele:</strong> 0,5-1 kg Gewichtsverlust pro Woche ist nachhaltig</li> </ul> </div> </div> </div> <!-- Zust\xE4ndige Beh\xF6rde / Hilfe --> <div class="max-w-2xl mx-auto px-4 mt-6"> <div class="bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"> <span class="text-2xl">\u{1F3E5}</span>\nBeratung & Hilfe\n</h2> <div class="space-y-4"> <div class="p-4 bg-blue-50 rounded-lg"> <h3 class="font-semibold text-blue-800 mb-2">\xC4rztliche Beratung</h3> <p class="text-blue-700 text-sm mb-2">\nBei Fragen zu Ihrem Gewicht, Ern\xE4hrung oder Bewegung wenden Sie sich an:\n</p> <ul class="text-blue-700 text-sm space-y-1"> <li>\u2022 Ihren <strong>Hausarzt/Haus\xE4rztin</strong></li> <li>\u2022 Einen <strong>Ern\xE4hrungsberater</strong> (von Krankenkassen bezuschusst)</li> <li>\u2022 Die <strong>Bundeszentrale f\xFCr gesundheitliche Aufkl\xE4rung (BZgA)</strong></li> </ul> </div> <div class="p-4 bg-green-50 rounded-lg"> <h3 class="font-semibold text-green-800 mb-2">Kostenlose Angebote der Krankenkassen</h3> <p class="text-green-700 text-sm">\nDie meisten gesetzlichen Krankenkassen bieten kostenlose <strong>Pr\xE4ventionskurse</strong>\nzu Ern\xE4hrung und Bewegung an. Fragen Sie bei Ihrer Krankenkasse nach!\n</p> </div> <div class="p-4 bg-amber-50 rounded-lg"> <h3 class="font-semibold text-amber-800 mb-2">Bei Essst\xF6rungen</h3> <p class="text-amber-700 text-sm mb-2">\nWenn Sie unter einer Essst\xF6rung leiden oder vermuten, holen Sie sich Hilfe:\n</p> <ul class="text-amber-700 text-sm space-y-1"> <li>\u2022 <strong>BZgA-Beratungstelefon:</strong> 0221 892031 (Mo-Do 10-22 Uhr, Fr-So 10-18 Uhr)</li> <li>\u2022 <strong>Online-Beratung:</strong> <a href="https://www.bzga-essstoerungen.de" class="underline" target="_blank">www.bzga-essstoerungen.de</a></li> </ul> </div> </div> </div> </div> </main>  <script type="application/ld+json">', '<\/script>  <script type="application/ld+json">', "<\/script> "])), maybeRenderHead(), renderComponent($$result2, "BMIRechner", BMIRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/BMIRechner", "client:component-export": "default" }), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "BMI-Rechner \u2013 Body-Mass-Index berechnen",
    "description": description,
    "url": "https://deutschland-rechner.de/bmi-rechner",
    "applicationCategory": "HealthApplication",
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
        "name": "Wie berechnet man den BMI?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Der BMI wird berechnet, indem man das K\xF6rpergewicht in Kilogramm durch die K\xF6rpergr\xF6\xDFe in Metern zum Quadrat teilt. Formel: BMI = Gewicht (kg) \xF7 Gr\xF6\xDFe\xB2 (m\xB2). Beispiel: 75 kg \xF7 (1,75 m)\xB2 = 24,5."
        }
      },
      {
        "@type": "Question",
        "name": "Was ist ein normaler BMI?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nach WHO-Definition liegt ein normaler BMI zwischen 18,5 und 24,9 kg/m\xB2. In diesem Bereich ist das Risiko f\xFCr gewichtsbedingte Erkrankungen am geringsten. F\xFCr \xE4ltere Menschen (65+) kann ein etwas h\xF6herer BMI (24-29) optimal sein."
        }
      },
      {
        "@type": "Question",
        "name": "Ist der BMI f\xFCr M\xE4nner und Frauen gleich?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Die WHO-Grenzwerte gelten f\xFCr beide Geschlechter. Frauen haben jedoch nat\xFCrlicherweise einen h\xF6heren K\xF6rperfettanteil, M\xE4nner mehr Muskelmasse. Der Taillenumfang (Frauen < 88 cm, M\xE4nner < 102 cm) ist eine hilfreiche Erg\xE4nzung zum BMI."
        }
      },
      {
        "@type": "Question",
        "name": "Ab welchem BMI ist man \xFCbergewichtig?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ab einem BMI von 25 spricht man von \xDCbergewicht (Pr\xE4adipositas). Ab BMI 30 beginnt die Adipositas (Fettleibigkeit), die in drei Grade unterteilt wird: Grad I (30-34,9), Grad II (35-39,9) und Grad III (ab 40)."
        }
      },
      {
        "@type": "Question",
        "name": "Warum ist der BMI bei Sportlern oft falsch?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Der BMI unterscheidet nicht zwischen Muskel- und Fettmasse. Sportler mit viel Muskelmasse haben oft einen erh\xF6hten BMI, obwohl sie einen niedrigen K\xF6rperfettanteil haben. F\xFCr sie ist der K\xF6rperfettanteil oder der Taillenumfang aussagekr\xE4ftiger."
        }
      },
      {
        "@type": "Question",
        "name": "Wie berechnet man das Idealgewicht?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Das Idealgewicht liegt im BMI-Bereich von 18,5 bis 25. F\xFCr eine Person mit 1,75 m Gr\xF6\xDFe ergibt sich ein Normalgewicht von 56,7 bis 76,6 kg. Die Mitte dieses Bereichs (ca. 66 kg) wird oft als Idealgewicht bezeichnet."
        }
      }
    ]
  }))) })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/bmi-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/bmi-rechner.astro";
const $$url = "/bmi-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$BmiRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
