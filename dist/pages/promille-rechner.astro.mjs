/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, u as unescapeHTML, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DmT1JwUR.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const WIDMARK = {
  maennlich: 0.68,
  // Reduktionsfaktor Männer
  weiblich: 0.55,
  // Reduktionsfaktor Frauen
  alkoholDichte: 0.8,
  // g/ml Ethanol
  abbauRate: 0.15,
  // Promille pro Stunde (Durchschnitt: 0.1-0.2)
  abbauRateMin: 0.1,
  abbauRateMax: 0.2,
  resorptionsdefizit: 0.2
  // 10-30% des Alkohols wird nicht resorbiert
};
const GETRAENKE = [
  { id: "bier", name: "Bier (0,5l)", icon: "🍺", menge: 500, alkoholgehalt: 5, beliebt: true },
  { id: "bier_klein", name: "Bier (0,33l)", icon: "🍺", menge: 330, alkoholgehalt: 5 },
  { id: "bier_mass", name: "Maß Bier (1l)", icon: "🍻", menge: 1e3, alkoholgehalt: 5 },
  { id: "weizen", name: "Weizenbier (0,5l)", icon: "🍺", menge: 500, alkoholgehalt: 5.4 },
  { id: "pils", name: "Pils (0,5l)", icon: "🍺", menge: 500, alkoholgehalt: 4.8 },
  { id: "wein_rot", name: "Rotwein (0,2l)", icon: "🍷", menge: 200, alkoholgehalt: 13, beliebt: true },
  { id: "wein_weiss", name: "Weißwein (0,2l)", icon: "🥂", menge: 200, alkoholgehalt: 11.5 },
  { id: "wein_flasche", name: "Weinflasche (0,75l)", icon: "🍷", menge: 750, alkoholgehalt: 13 },
  { id: "sekt", name: "Sekt/Prosecco (0,1l)", icon: "🥂", menge: 100, alkoholgehalt: 11, beliebt: true },
  { id: "schnaps", name: "Schnaps/Shot (2cl)", icon: "🥃", menge: 20, alkoholgehalt: 40, beliebt: true },
  { id: "schnaps_doppelt", name: "Doppelter (4cl)", icon: "🥃", menge: 40, alkoholgehalt: 40 },
  { id: "whisky", name: "Whisky (4cl)", icon: "🥃", menge: 40, alkoholgehalt: 40 },
  { id: "vodka", name: "Wodka (2cl)", icon: "🥃", menge: 20, alkoholgehalt: 40 },
  { id: "longdrink", name: "Longdrink/Cocktail", icon: "🍹", menge: 300, alkoholgehalt: 8 },
  { id: "aperol", name: "Aperol Spritz", icon: "🍹", menge: 200, alkoholgehalt: 8 },
  { id: "hugo", name: "Hugo", icon: "🍹", menge: 200, alkoholgehalt: 6.5 },
  { id: "radler", name: "Radler (0,5l)", icon: "🍺", menge: 500, alkoholgehalt: 2.5 },
  { id: "alster", name: "Alster (0,5l)", icon: "🍺", menge: 500, alkoholgehalt: 2.5 },
  { id: "likoer", name: "Likör (2cl)", icon: "🍸", menge: 20, alkoholgehalt: 25 },
  { id: "jaegermeister", name: "Jägermeister (2cl)", icon: "🍸", menge: 20, alkoholgehalt: 35 }
];
function PromilleRechner() {
  const [geschlecht, setGeschlecht] = useState("maennlich");
  const [gewicht, setGewicht] = useState(80);
  const [getraenke, setGetraenke] = useState({});
  const [zeitSeitBeginn, setZeitSeitBeginn] = useState(2);
  const [magenStatus, setMagenStatus] = useState("voll");
  const [showAllGetraenke, setShowAllGetraenke] = useState(false);
  const ergebnis = useMemo(() => {
    let gesamtAlkoholGramm = 0;
    Object.entries(getraenke).forEach(([id, anzahl]) => {
      if (anzahl > 0) {
        const getraenk = GETRAENKE.find((g) => g.id === id);
        if (getraenk) {
          const alkoholMl = getraenk.menge * (getraenk.alkoholgehalt / 100);
          const alkoholGramm = alkoholMl * WIDMARK.alkoholDichte;
          gesamtAlkoholGramm += alkoholGramm * anzahl;
        }
      }
    });
    const reduktionsfaktor = geschlecht === "maennlich" ? WIDMARK.maennlich : WIDMARK.weiblich;
    const resorption = magenStatus === "nuchtern" ? 0.9 : 1 - WIDMARK.resorptionsdefizit;
    const resorbierterAlkohol = gesamtAlkoholGramm * resorption;
    const bakMaximal = resorbierterAlkohol / (reduktionsfaktor * gewicht);
    const abgebaut = zeitSeitBeginn * WIDMARK.abbauRate;
    const abgebautMin = zeitSeitBeginn * WIDMARK.abbauRateMin;
    const abgebautMax = zeitSeitBeginn * WIDMARK.abbauRateMax;
    const bakAktuell = Math.max(0, bakMaximal - abgebaut);
    const bakAktuellMin = Math.max(0, bakMaximal - abgebautMax);
    const bakAktuellMax = Math.max(0, bakMaximal - abgebautMin);
    const stundenBisNuechternMax = bakAktuellMax > 0 ? bakAktuellMax / WIDMARK.abbauRateMin : 0;
    const promilleBis05 = bakAktuell - 0.5;
    const stundenBis05 = promilleBis05 > 0 ? promilleBis05 / WIDMARK.abbauRate : 0;
    const kalorien = Math.round(gesamtAlkoholGramm * 7);
    let status;
    let statusText;
    let statusColor;
    if (bakAktuell < 0.3) {
      status = "nuechtern";
      statusText = "Nüchtern / kaum merkbar";
      statusColor = "green";
    } else if (bakAktuell < 0.5) {
      status = "leicht";
      statusText = "Leicht angetrunken";
      statusColor = "yellow";
    } else if (bakAktuell < 1) {
      status = "mittel";
      statusText = "Deutlich alkoholisiert";
      statusColor = "orange";
    } else if (bakAktuell < 2) {
      status = "stark";
      statusText = "Stark alkoholisiert";
      statusColor = "red";
    } else {
      status = "gefaehrlich";
      statusText = "Gefährlicher Rausch!";
      statusColor = "red";
    }
    let fahrerlaubnis;
    let fahrerlaubnisText;
    if (bakAktuell < 0.5) {
      fahrerlaubnis = "erlaubt";
      fahrerlaubnisText = "Autofahren erlaubt (außer Fahranfänger)";
    } else if (bakAktuell < 1.1) {
      fahrerlaubnis = "ordnungswidrigkeit";
      fahrerlaubnisText = "Ordnungswidrigkeit! Bußgeld, Punkte, Fahrverbot drohen";
    } else {
      fahrerlaubnis = "straftat";
      fahrerlaubnisText = "Straftat! Führerscheinentzug, MPU erforderlich";
    }
    return {
      gesamtAlkoholGramm: Math.round(gesamtAlkoholGramm * 10) / 10,
      bakMaximal: Math.round(bakMaximal * 100) / 100,
      bakAktuell: Math.round(bakAktuell * 100) / 100,
      bakAktuellMin: Math.round(bakAktuellMin * 100) / 100,
      bakAktuellMax: Math.round(bakAktuellMax * 100) / 100,
      abgebaut: Math.round(abgebaut * 100) / 100,
      stundenBisNuechtern: Math.round(stundenBisNuechternMax * 10) / 10,
      // Konservativ
      stundenBis05: Math.round(stundenBis05 * 10) / 10,
      kalorien,
      status,
      statusText,
      statusColor,
      fahrerlaubnis,
      fahrerlaubnisText,
      anzahlGetraenke: Object.values(getraenke).reduce((a, b) => a + b, 0)
    };
  }, [geschlecht, gewicht, getraenke, zeitSeitBeginn, magenStatus]);
  const addGetraenk = (id) => {
    setGetraenke((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };
  const removeGetraenk = (id) => {
    setGetraenke((prev) => {
      const newValue = (prev[id] || 0) - 1;
      if (newValue <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newValue };
    });
  };
  const resetGetraenke = () => {
    setGetraenke({});
  };
  const formatPromille = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ‰";
  const formatZeit = (stunden) => {
    if (stunden < 1) return `${Math.round(stunden * 60)} Minuten`;
    const h = Math.floor(stunden);
    const m = Math.round((stunden - h) * 60);
    return m > 0 ? `${h} Std. ${m} Min.` : `${h} Stunden`;
  };
  const visibleGetraenke = showAllGetraenke ? GETRAENKE : GETRAENKE.filter((g) => g.beliebt);
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsx("div", { className: "bg-red-50 border border-red-200 rounded-2xl p-4 mb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "⚠️" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "font-bold text-red-800", children: "Nur eine Schätzung!" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-red-700 mt-1", children: [
          "Dieser Rechner liefert nur eine ",
          /* @__PURE__ */ jsx("strong", { children: "ungefähre Schätzung" }),
          ". Der tatsächliche Blutalkoholgehalt hängt von vielen individuellen Faktoren ab. Im Zweifel:",
          /* @__PURE__ */ jsx("strong", { children: " Nicht fahren!" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Geschlecht" }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setGeschlecht("maennlich"),
              className: `p-4 rounded-xl text-center transition-all ${geschlecht === "maennlich" ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "👨" }),
                /* @__PURE__ */ jsx("div", { className: "font-bold mt-1", children: "Männlich" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs mt-1 opacity-80", children: "Reduktionsfaktor: 0,68" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setGeschlecht("weiblich"),
              className: `p-4 rounded-xl text-center transition-all ${geschlecht === "weiblich" ? "bg-pink-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "👩" }),
                /* @__PURE__ */ jsx("div", { className: "font-bold mt-1", children: "Weiblich" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs mt-1 opacity-80", children: "Reduktionsfaktor: 0,55" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Körpergewicht" }) }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: gewicht,
              onChange: (e) => setGewicht(Math.max(40, Math.min(200, Number(e.target.value)))),
              className: "w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
              min: "40",
              max: "200",
              step: "1"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl", children: "kg" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: gewicht,
            onChange: (e) => setGewicht(Number(e.target.value)),
            className: "w-full mt-3 accent-blue-500",
            min: "40",
            max: "150",
            step: "1"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Mageninhalt" }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setMagenStatus("nuchtern"),
              className: `p-4 rounded-xl text-center transition-all ${magenStatus === "nuchtern" ? "bg-orange-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🫙" }),
                /* @__PURE__ */ jsx("div", { className: "font-bold mt-1", children: "Nüchtern" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs mt-1 opacity-80", children: "Schnellere Aufnahme" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setMagenStatus("voll"),
              className: `p-4 rounded-xl text-center transition-all ${magenStatus === "voll" ? "bg-green-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🍽️" }),
                /* @__PURE__ */ jsx("div", { className: "font-bold mt-1", children: "Gegessen" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs mt-1 opacity-80", children: "Langsamere Aufnahme" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Zeit seit dem ersten Getränk" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setZeitSeitBeginn(Math.max(0, zeitSeitBeginn - 0.5)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold",
              children: "−"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 text-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-3xl font-bold text-gray-800", children: zeitSeitBeginn }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-500 ml-2", children: "Stunden" })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setZeitSeitBeginn(Math.min(24, zeitSeitBeginn + 0.5)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold",
              children: "+"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: zeitSeitBeginn,
            onChange: (e) => setZeitSeitBeginn(Number(e.target.value)),
            className: "w-full mt-3 accent-blue-500",
            min: "0",
            max: "12",
            step: "0.5"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800", children: "🍺 Was hast du getrunken?" }),
        ergebnis.anzahlGetraenke > 0 && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: resetGetraenke,
            className: "text-sm text-red-600 hover:text-red-800",
            children: "Alle löschen"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4", children: visibleGetraenke.map((g) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: `relative rounded-xl p-3 text-center transition-all ${getraenke[g.id] > 0 ? "bg-blue-50 border-2 border-blue-300" : "bg-gray-50 border-2 border-transparent hover:border-gray-200"}`,
          children: [
            /* @__PURE__ */ jsx("div", { className: "text-2xl mb-1", children: g.icon }),
            /* @__PURE__ */ jsx("div", { className: "text-xs font-medium text-gray-700 leading-tight", children: g.name }),
            /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-gray-400", children: [
              g.alkoholgehalt,
              "% Vol."
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 mt-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => removeGetraenk(g.id),
                  className: "w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 text-lg font-bold disabled:opacity-30",
                  disabled: !getraenke[g.id],
                  children: "−"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "w-8 text-center font-bold text-lg", children: getraenke[g.id] || 0 }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => addGetraenk(g.id),
                  className: "w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold",
                  children: "+"
                }
              )
            ] })
          ]
        },
        g.id
      )) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setShowAllGetraenke(!showAllGetraenke),
          className: "w-full py-2 text-sm text-blue-600 hover:text-blue-800 font-medium",
          children: showAllGetraenke ? "← Weniger anzeigen" : `Mehr Getränke anzeigen (${GETRAENKE.length - visibleGetraenke.length} weitere) →`
        }
      ),
      ergebnis.anzahlGetraenke > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { children: "Alkohol konsumiert:" }),
          /* @__PURE__ */ jsxs("span", { className: "font-bold", children: [
            ergebnis.gesamtAlkoholGramm,
            " g reiner Alkohol"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "Kalorien aus Alkohol:" }),
          /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
            ergebnis.kalorien,
            " kcal"
          ] })
        ] })
      ] })
    ] }),
    ergebnis.anzahlGetraenke > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: `rounded-2xl shadow-lg p-6 text-white mb-6 ${ergebnis.bakAktuell < 0.3 ? "bg-gradient-to-br from-green-500 to-emerald-600" : ergebnis.bakAktuell < 0.5 ? "bg-gradient-to-br from-yellow-500 to-amber-600" : ergebnis.bakAktuell < 1.1 ? "bg-gradient-to-br from-orange-500 to-red-500" : "bg-gradient-to-br from-red-600 to-red-800"}`, children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: "🩸 Geschätzter Blutalkohol" }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-baseline gap-2", children: /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatPromille(ergebnis.bakAktuell) }) }),
          /* @__PURE__ */ jsx("p", { className: "text-lg mt-2 opacity-90", children: ergebnis.statusText }),
          ergebnis.bakAktuellMin !== ergebnis.bakAktuellMax && /* @__PURE__ */ jsxs("p", { className: "text-sm mt-1 opacity-70", children: [
            "Bereich: ",
            formatPromille(ergebnis.bakAktuellMin),
            " – ",
            formatPromille(ergebnis.bakAktuellMax)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Maximaler Wert" }),
            /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatPromille(ergebnis.bakMaximal) }),
            /* @__PURE__ */ jsx("span", { className: "text-xs opacity-60", children: "direkt nach Trinken" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Bereits abgebaut" }),
            /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatPromille(ergebnis.abgebaut) }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs opacity-60", children: [
              "in ",
              zeitSeitBeginn,
              " Std."
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: `rounded-2xl p-6 mb-6 ${ergebnis.fahrerlaubnis === "erlaubt" ? "bg-green-50 border border-green-200" : ergebnis.fahrerlaubnis === "ordnungswidrigkeit" ? "bg-orange-50 border border-orange-200" : "bg-red-50 border border-red-200"}`, children: [
        /* @__PURE__ */ jsxs("h3", { className: `font-bold mb-3 flex items-center gap-2 ${ergebnis.fahrerlaubnis === "erlaubt" ? "text-green-800" : ergebnis.fahrerlaubnis === "ordnungswidrigkeit" ? "text-orange-800" : "text-red-800"}`, children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: ergebnis.fahrerlaubnis === "erlaubt" ? "✅" : ergebnis.fahrerlaubnis === "ordnungswidrigkeit" ? "⚠️" : "🚫" }),
          "Autofahren?"
        ] }),
        /* @__PURE__ */ jsx("p", { className: `font-medium ${ergebnis.fahrerlaubnis === "erlaubt" ? "text-green-700" : ergebnis.fahrerlaubnis === "ordnungswidrigkeit" ? "text-orange-700" : "text-red-700"}`, children: ergebnis.fahrerlaubnisText }),
        ergebnis.bakAktuell > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-2 text-sm", children: [
          ergebnis.bakAktuell >= 0.5 && ergebnis.stundenBis05 > 0 && /* @__PURE__ */ jsxs("div", { className: `flex justify-between ${ergebnis.fahrerlaubnis === "erlaubt" ? "text-green-600" : ergebnis.fahrerlaubnis === "ordnungswidrigkeit" ? "text-orange-600" : "text-red-600"}`, children: [
            /* @__PURE__ */ jsx("span", { children: "Zeit bis unter 0,5‰:" }),
            /* @__PURE__ */ jsxs("span", { className: "font-bold", children: [
              "ca. ",
              formatZeit(ergebnis.stundenBis05)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: `flex justify-between ${ergebnis.fahrerlaubnis === "erlaubt" ? "text-green-600" : ergebnis.fahrerlaubnis === "ordnungswidrigkeit" ? "text-orange-600" : "text-red-600"}`, children: [
            /* @__PURE__ */ jsx("span", { children: "Zeit bis 0,0‰ (nüchtern):" }),
            /* @__PURE__ */ jsxs("span", { className: "font-bold", children: [
              "ca. ",
              formatZeit(ergebnis.stundenBisNuechtern)
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Promille-Skala" }),
        /* @__PURE__ */ jsxs("div", { className: "relative h-8 rounded-full overflow-hidden bg-gray-200 mb-4", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 w-[20%] bg-green-400" }),
          " ",
          /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-[20%] w-[20%] bg-yellow-400" }),
          " ",
          /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-[40%] w-[24%] bg-orange-400" }),
          " ",
          /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-[64%] w-[36%] bg-red-400" }),
          " ",
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute top-0 bottom-0 w-1 bg-gray-800 shadow-lg transition-all duration-300",
              style: { left: `${Math.min(ergebnis.bakAktuell / 2.5 * 100, 100)}%` },
              children: /* @__PURE__ */ jsx("div", { className: "absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold bg-gray-800 text-white px-2 py-1 rounded", children: formatPromille(ergebnis.bakAktuell) })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-500", children: [
          /* @__PURE__ */ jsx("span", { children: "0‰" }),
          /* @__PURE__ */ jsx("span", { className: "text-yellow-600 font-medium", children: "0,5‰" }),
          /* @__PURE__ */ jsx("span", { className: "text-orange-600 font-medium", children: "1,1‰" }),
          /* @__PURE__ */ jsx("span", { className: "text-red-600 font-medium", children: "1,6‰" }),
          /* @__PURE__ */ jsx("span", { children: "2,5‰+" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 mt-4 text-xs", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-green-400" }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Unter 0,5‰: Legal" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-yellow-400" }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "0,5-1,0‰: Ordnungswidrigkeit" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-orange-400" }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "1,1-1,6‰: Straftat" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-red-400" }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Über 1,6‰: MPU erforderlich" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ Promille-Grenzen in Deutschland" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-red-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🚗" }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-red-800", children: "0,0 ‰ – Fahranfänger & unter 21" }),
            /* @__PURE__ */ jsx("p", { className: "text-red-700", children: "Während der Probezeit gilt absolutes Alkoholverbot am Steuer." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-yellow-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "⚠️" }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-yellow-800", children: "Ab 0,5 ‰ – Ordnungswidrigkeit" }),
            /* @__PURE__ */ jsx("p", { className: "text-yellow-700", children: "500€ Bußgeld, 2 Punkte, 1 Monat Fahrverbot. Bei Wiederholung höhere Strafen." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-orange-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🚨" }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-orange-800", children: "Ab 1,1 ‰ – Straftat" }),
            /* @__PURE__ */ jsx("p", { className: "text-orange-700", children: "Absolute Fahruntüchtigkeit. Führerscheinentzug, Geldstrafe oder Freiheitsstrafe." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-red-100 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🔴" }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-red-900", children: "Ab 1,6 ‰ – MPU erforderlich" }),
            /* @__PURE__ */ jsx("p", { className: "text-red-800", children: 'Medizinisch-Psychologische Untersuchung ("Idiotentest") ist Pflicht für Wiedererteilung.' })
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-blue-800 mb-3", children: "🧠 Typische Auswirkungen nach Promille" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3 text-sm text-blue-700", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/50 rounded-xl p-3", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "0,3 ‰:" }),
          " Leichte Enthemmung, vermindertes Sehvermögen"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/50 rounded-xl p-3", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "0,5 ‰:" }),
          " Konzentrationsschwäche, erhöhte Risikobereitschaft"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/50 rounded-xl p-3", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "0,8 ‰:" }),
          " Deutlich verlängerte Reaktionszeit, Tunnelblick"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/50 rounded-xl p-3", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "1,0 ‰:" }),
          " Gleichgewichtsstörungen, starke Enthemmung"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/50 rounded-xl p-3", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "2,0 ‰:" }),
          " Starke Orientierungsstörung, Übelkeit"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/50 rounded-xl p-3", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "3,0 ‰+:" }),
          " Lebensgefahr! Koma, Atemstillstand möglich"
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-amber-800 mb-3", children: "⚠️ Wichtige Hinweise" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-amber-700", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Individuelle Faktoren:" }),
            " Alter, Medikamente, Müdigkeit, Gewöhnung beeinflussen die Wirkung stark"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Kein Freibrief:" }),
            " Auch unter 0,5‰ kann bei Ausfallerscheinungen eine Strafe drohen"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Restalkohol am Morgen:" }),
            " Der Abbau dauert länger als oft gedacht – Vorsicht beim Autofahren!"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: '"Nüchtern werden":' }),
            " Kaffee, Duschen oder frische Luft beschleunigen den Abbau NICHT"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Fahrrad:" }),
            " Auch beim Radfahren gelten Promillegrenzen (ab 1,6‰ Straftat)"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "📐 Widmark-Formel" }),
      /* @__PURE__ */ jsx("div", { className: "bg-gray-50 rounded-xl p-4 font-mono text-center text-lg mb-4", children: "BAK = (A × 0,8) ÷ (r × Körpergewicht)" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsx("strong", { children: "A" }),
          " = Alkoholmenge in ml"
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsx("strong", { children: "0,8" }),
          " = Dichte von Alkohol (g/ml)"
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsx("strong", { children: "r" }),
          " = Reduktionsfaktor (Männer: 0,68 / Frauen: 0,55)"
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Abbaurate:" }),
          " ca. 0,1–0,2 ‰ pro Stunde (Durchschnitt: 0,15‰)"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörden & Hilfe" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-blue-900", children: "Bundeszentrale für gesundheitliche Aufklärung (BZgA)" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-700 mt-1", children: "Informationen zu Alkohol und Suchtprävention" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Kenn dein Limit" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.kenn-dein-limit.de",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "kenn-dein-limit.de →"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Sucht-Hotline" }),
              /* @__PURE__ */ jsx("a", { href: "tel:01805313031", className: "text-blue-600 hover:underline font-mono", children: "01805 - 31 30 31" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "(14 ct/Min.)" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🚨" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Im Notfall" }),
            /* @__PURE__ */ jsxs("p", { className: "text-gray-600", children: [
              "Notruf ",
              /* @__PURE__ */ jsx("strong", { children: "112" }),
              " – Bei Bewusstlosigkeit oder Atemnot durch Alkohol sofort anrufen!"
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
            href: "https://www.bzga.de",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundeszentrale für gesundheitliche Aufklärung (BZgA)"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.adac.de/verkehr/recht/verkehrsvorschriften-deutschland/promillegrenze/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "ADAC – Promillegrenzen in Deutschland"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/stvg/__24a.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "§24a StVG – 0,5-Promille-Grenze"
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
const $$PromilleRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "Promille-Rechner 2025 \u2013 Blutalkohol berechnen (Widmark-Formel)";
  const description = "Promille-Rechner: Berechne deinen Blutalkoholgehalt nach Bier, Wein oder Schnaps. Mit Zeit bis n\xFCchtern, rechtlichen Grenzen und Abbauzeit.";
  const keywords = "Promille Rechner, Alkohol Rechner, Blutalkohol berechnen, Promille berechnen, BAK Rechner, Widmark Formel, Alkoholabbau, Zeit bis n\xFCchtern, Promillegrenze, Alkohol Autofahren";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<main class="min-h-screen pb-8"> <!-- Header mit Zur\xFCck-Button --> <header class="bg-gradient-to-r from-red-500 to-orange-500 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-red-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>\nAlle Rechner\n</a> <div class="flex items-center gap-3"> <span class="text-4xl">\u{1F37A}</span> <div> <h1 class="text-2xl font-bold">Promille-Rechner</h1> <p class="text-red-100 text-sm">Blutalkohol sch\xE4tzen & Abbauzeit berechnen</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ', ' </div> <!-- SEO Content Section --> <div class="max-w-2xl mx-auto px-4 mt-8"> <div class="bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">Promille berechnen: So funktioniert der Alkohol-Rechner</h2> <div class="prose prose-sm text-gray-600 space-y-4"> <p>\nUnser <strong>Promille-Rechner</strong> sch\xE4tzt deinen <strong>Blutalkoholgehalt (BAK)</strong> basierend auf \n            der bew\xE4hrten <strong>Widmark-Formel</strong>. Gib einfach dein Geschlecht, Gewicht und die konsumierten \n            Getr\xE4nke ein \u2013 der Rechner zeigt dir sofort den gesch\xE4tzten Promillewert und wann du wieder n\xFCchtern bist.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Die Widmark-Formel zur Promille-Berechnung</h3> <p>\nDie <strong>Widmark-Formel</strong> wurde vom schwedischen Chemiker Erik Widmark entwickelt und ist \n            seit Jahrzehnten der Standard zur Sch\xE4tzung des Blutalkoholspiegels:\n</p> <div class="bg-gray-100 p-4 rounded-xl font-mono text-center">\nBAK (\u2030) = (Alkohol in Gramm) \xF7 (K\xF6rpergewicht \xD7 Reduktionsfaktor)\n</div> <ul class="list-disc pl-5 space-y-1"> <li><strong>Reduktionsfaktor M\xE4nner:</strong> 0,68 (h\xF6herer Wasseranteil im K\xF6rper)</li> <li><strong>Reduktionsfaktor Frauen:</strong> 0,55 (geringerer Wasseranteil)</li> <li><strong>Abbaurate:</strong> ca. 0,1-0,2 \u2030 pro Stunde</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Promillegrenzen in Deutschland 2025</h3> <p>\nIn Deutschland gelten klare <strong>Promillegrenzen f\xFCr Autofahrer</strong>:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>0,0 \u2030:</strong> Absolutes Alkoholverbot f\xFCr Fahranf\xE4nger (Probezeit) und unter 21-J\xE4hrige</li> <li><strong>Ab 0,3 \u2030:</strong> Strafbar bei Ausfallerscheinungen oder Unfall</li> <li><strong>Ab 0,5 \u2030:</strong> Ordnungswidrigkeit \u2013 500\u20AC Bu\xDFgeld, 2 Punkte, 1 Monat Fahrverbot</li> <li><strong>Ab 1,1 \u2030:</strong> Straftat \u2013 absolute Fahrunt\xFCchtigkeit, F\xFChrerscheinentzug</li> <li><strong>Ab 1,6 \u2030:</strong> MPU (Idiotentest) erforderlich f\xFCr Wiedererteilung</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wie lange braucht Alkohol zum Abbau?</h3> <p>\nDie Leber baut Alkohol mit einer Rate von etwa <strong>0,1-0,15 Promille pro Stunde</strong> ab \u2013 \n            unabh\xE4ngig von Kaffee, Duschen oder frischer Luft. Beispiele:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>0,5 \u2030:</strong> ca. 3-5 Stunden bis n\xFCchtern</li> <li><strong>1,0 \u2030:</strong> ca. 7-10 Stunden bis n\xFCchtern</li> <li><strong>1,5 \u2030:</strong> ca. 10-15 Stunden bis n\xFCchtern</li> </ul> <p> <strong>Achtung Restalkohol:</strong> Wer abends viel trinkt, kann am n\xE4chsten Morgen noch \n            \xFCber der Promillegrenze liegen! Dies wird oft untersch\xE4tzt.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Alkoholgehalt typischer Getr\xE4nke</h3> <p>\nDer <strong>Alkoholgehalt</strong> variiert stark je nach Getr\xE4nk:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Bier (0,5l):</strong> ca. 20g reiner Alkohol (5% Vol.)</li> <li><strong>Wein (0,2l):</strong> ca. 20g reiner Alkohol (13% Vol.)</li> <li><strong>Schnaps (2cl):</strong> ca. 6g reiner Alkohol (40% Vol.)</li> <li><strong>Sekt (0,1l):</strong> ca. 9g reiner Alkohol (11% Vol.)</li> </ul> <p>\nFaustregel: Ein "Standardgetr\xE4nk" (Bier, Wein, Schnaps) enth\xE4lt etwa 10-12g reinen Alkohol.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Was beeinflusst den Promillewert?</h3> <p>\nNeben K\xF6rpergewicht und Geschlecht spielen weitere Faktoren eine Rolle:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Mageninhalt:</strong> Mit vollem Magen wird Alkohol langsamer aufgenommen</li> <li><strong>Trinkgeschwindigkeit:</strong> Schnelles Trinken f\xFChrt zu h\xF6heren Spitzenwerten</li> <li><strong>Medikamente:</strong> K\xF6nnen die Wirkung verst\xE4rken</li> <li><strong>K\xF6rperfettanteil:</strong> H\xF6herer Fettanteil = h\xF6herer Promillewert</li> <li><strong>Gew\xF6hnung:</strong> Beeinflusst nur die gef\xFChlte Wirkung, nicht den BAK</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">H\xE4ufige Fragen zum Promille-Rechner</h3> <h4 class="font-semibold text-gray-700 mt-4">Wie genau ist der Promille-Rechner?</h4> <p>\nDer Rechner liefert eine <strong>Sch\xE4tzung</strong> auf Basis der Widmark-Formel. Der tats\xE4chliche \n            Wert kann je nach individuellen Faktoren um 0,1-0,3 \u2030 abweichen. Im Zweifel: Nicht fahren!\n</p> <h4 class="font-semibold text-gray-700 mt-4">Kann ich mich auf den Rechner verlassen?</h4> <p> <strong>Nein!</strong> Der Rechner ist nur eine Orientierungshilfe. Nur ein Bluttest oder \n            Atemalkoholtest liefert rechtlich verwertbare Werte. Im Stra\xDFenverkehr gilt: Wer trinkt, f\xE4hrt nicht.\n</p> <h4 class="font-semibold text-gray-700 mt-4">Wie schnell bin ich wieder n\xFCchtern?</h4> <p>\nDie Leber baut ca. <strong>0,1-0,2 \u2030 pro Stunde</strong> ab \u2013 bei den meisten Menschen etwa 0,15 \u2030. \n            Dieser Prozess l\xE4sst sich nicht beschleunigen: Weder Kaffee noch Bewegung helfen.\n</p> </div> </div> </div> </main>  <script type="application/ld+json">', '<\/script>  <script type="application/ld+json">', "<\/script> "])), maybeRenderHead(), renderComponent($$result2, "PromilleRechner", PromilleRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/PromilleRechner", "client:component-export": "default" }), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Promille-Rechner 2025",
    "description": description,
    "url": "https://deutschland-rechner.de/promille-rechner",
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
        "name": "Wie berechnet man Promille?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Die Promille-Berechnung erfolgt mit der Widmark-Formel: BAK = Alkohol in Gramm \xF7 (K\xF6rpergewicht \xD7 Reduktionsfaktor). Der Reduktionsfaktor betr\xE4gt 0,68 f\xFCr M\xE4nner und 0,55 f\xFCr Frauen."
        }
      },
      {
        "@type": "Question",
        "name": "Wie viel Promille hat ein Bier (0,5l)?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ein 0,5l Bier (5% Vol.) enth\xE4lt ca. 20g reinen Alkohol. Bei einem 80kg schweren Mann f\xFChrt dies zu etwa 0,3-0,4 Promille, bei einer 60kg schweren Frau zu etwa 0,5-0,6 Promille."
        }
      },
      {
        "@type": "Question",
        "name": "Wie lange dauert es, bis 1 Promille abgebaut ist?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Die Leber baut etwa 0,1-0,2 Promille pro Stunde ab. Bei einem Wert von 1,0 Promille dauert es daher ca. 7-10 Stunden, bis der Alkohol vollst\xE4ndig abgebaut ist."
        }
      },
      {
        "@type": "Question",
        "name": "Ab wie viel Promille darf man nicht mehr Auto fahren?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "In Deutschland gilt eine Promillegrenze von 0,5 f\xFCr erfahrene Fahrer. F\xFCr Fahranf\xE4nger in der Probezeit und unter 21-J\xE4hrige gilt 0,0 Promille. Ab 0,3 Promille kann bei Ausfallerscheinungen bereits eine Strafe drohen."
        }
      }
    ]
  }))) })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/promille-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/promille-rechner.astro";
const $$url = "/promille-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$PromilleRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
