/* empty css                                             */
import { c as createComponent, a as renderTemplate, r as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DmT1JwUR.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const GESETZLICHER_MINDESTURLAUB = {
  bei6Tagen: 24,
  // 24 Werktage bei 6-Tage-Woche
  bei5Tagen: 20
  // entspricht 20 Arbeitstagen bei 5-Tage-Woche
};
const WARTEZEIT_MONATE = 6;
function UrlaubstageRechner() {
  const [arbeitstageProWoche, setArbeitstageProWoche] = useState(5);
  const [vertraglicheUrlaubstage, setVertraglicheUrlaubstage] = useState(30);
  const [szenario, setSzenario] = useState("jahresurlaub");
  const [eintrittMonat, setEintrittMonat] = useState(1);
  const [austrittsMonat, setAustrittsMonat] = useState(12);
  const [teilzeitTageProWoche, setTeilzeitTageProWoche] = useState(3);
  const [vollzeitUrlaubstage, setVollzeitUrlaubstage] = useState(30);
  const [bereitsGenommen, setBereitsGenommen] = useState(0);
  const [resturlaubVorjahr, setResturlaubVorjahr] = useState(0);
  const ergebnis = useMemo(() => {
    const hinweise = [];
    const gesetzlicherAnspruch = Math.round(GESETZLICHER_MINDESTURLAUB.bei6Tagen / 6 * arbeitstageProWoche);
    const vertraglichBesser = vertraglicheUrlaubstage > gesetzlicherAnspruch;
    let jahresurlaub = vertraglicheUrlaubstage;
    let urlaubBeiArbeitgeber = vertraglicheUrlaubstage;
    let teilurlaub = 0;
    let anteilMonate = 12;
    let istTeilzeit = false;
    let vollzeitVergleich = vertraglicheUrlaubstage;
    switch (szenario) {
      case "jahresurlaub": {
        jahresurlaub = vertraglicheUrlaubstage + resturlaubVorjahr;
        urlaubBeiArbeitgeber = jahresurlaub;
        anteilMonate = 12;
        if (resturlaubVorjahr > 0) {
          hinweise.push(`Resturlaub aus dem Vorjahr (${resturlaubVorjahr} Tage) muss bis 31. März genommen werden (§ 7 Abs. 3 BUrlG)`);
        }
        break;
      }
      case "neuer-job": {
        const monateImBetrieb = 12 - eintrittMonat + 1;
        anteilMonate = monateImBetrieb;
        if (monateImBetrieb >= WARTEZEIT_MONATE) {
          urlaubBeiArbeitgeber = Math.round(vertraglicheUrlaubstage / 12 * monateImBetrieb * 10) / 10;
          hinweise.push("Nach 6 Monaten Wartezeit besteht voller Urlaubsanspruch");
        } else {
          urlaubBeiArbeitgeber = Math.round(vertraglicheUrlaubstage / 12 * monateImBetrieb * 10) / 10;
          teilurlaub = urlaubBeiArbeitgeber;
          hinweise.push("In den ersten 6 Monaten entsteht anteiliger Urlaub (1/12 pro Monat)");
        }
        hinweise.push(`Urlaub beim vorherigen Arbeitgeber wird angerechnet (§ 6 BUrlG) – lassen Sie sich eine Urlaubsbescheinigung geben!`);
        break;
      }
      case "kuendigung": {
        const monateImBetrieb = austrittsMonat;
        anteilMonate = monateImBetrieb;
        const rohAnspruch = vertraglicheUrlaubstage / 12 * monateImBetrieb;
        if (austrittsMonat <= 6) {
          urlaubBeiArbeitgeber = Math.ceil(rohAnspruch * 2) / 2;
          hinweise.push("Bei Austritt in der ersten Jahreshälfte: anteiliger Urlaubsanspruch");
        } else {
          urlaubBeiArbeitgeber = vertraglicheUrlaubstage;
          hinweise.push("Bei Austritt nach dem 30.06.: Anspruch auf vollen Jahresurlaub");
        }
        urlaubBeiArbeitgeber += resturlaubVorjahr;
        if (bereitsGenommen > urlaubBeiArbeitgeber) {
          hinweise.push(`⚠️ Sie haben mehr Urlaub genommen als Ihnen zusteht – Rückforderung durch AG möglich`);
        }
        break;
      }
      case "teilzeit": {
        istTeilzeit = true;
        vollzeitVergleich = vollzeitUrlaubstage;
        const vollzeitTage = 5;
        jahresurlaub = Math.round(vollzeitUrlaubstage / vollzeitTage * teilzeitTageProWoche);
        urlaubBeiArbeitgeber = jahresurlaub + resturlaubVorjahr;
        const gesetzlichTeilzeit = Math.round(GESETZLICHER_MINDESTURLAUB.bei5Tagen / vollzeitTage * teilzeitTageProWoche);
        hinweise.push(`Bei ${teilzeitTageProWoche} Arbeitstagen/Woche entspricht ein Urlaubstag einem vollen freien Tag`);
        hinweise.push(`Gesetzlicher Mindesturlaub bei Teilzeit: ${gesetzlichTeilzeit} Tage`);
        const urlaubsWochenVollzeit = vollzeitUrlaubstage / vollzeitTage;
        const urlaubsWochenTeilzeit = jahresurlaub / teilzeitTageProWoche;
        if (Math.abs(urlaubsWochenVollzeit - urlaubsWochenTeilzeit) < 0.1) {
          hinweise.push("✓ Urlaubswochen entsprechen der Vollzeit-Regelung (Gleichbehandlung)");
        }
        break;
      }
    }
    const proMonat = Math.round(vertraglicheUrlaubstage / 12 * 10) / 10;
    return {
      jahresurlaub: szenario === "teilzeit" ? jahresurlaub : vertraglicheUrlaubstage,
      urlaubBeiArbeitgeber,
      teilurlaub,
      anteilMonate,
      gesetzlicherAnspruch,
      vertraglichBesser,
      istTeilzeit,
      vollzeitVergleich,
      proMonat,
      hinweise
    };
  }, [
    szenario,
    arbeitstageProWoche,
    vertraglicheUrlaubstage,
    eintrittMonat,
    austrittsMonat,
    teilzeitTageProWoche,
    vollzeitUrlaubstage,
    bereitsGenommen,
    resturlaubVorjahr
  ]);
  const formatTage = (n) => {
    if (n === 1) return "1 Tag";
    const rounded = Math.round(n * 10) / 10;
    return rounded % 1 === 0 ? `${rounded} Tage` : `${rounded.toFixed(1)} Tage`;
  };
  const monate = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember"
  ];
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Was möchten Sie berechnen?" }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setSzenario("jahresurlaub"),
              className: `py-3 px-4 rounded-xl font-medium transition-all text-left ${szenario === "jahresurlaub" ? "bg-green-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-lg block", children: "📅" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Jahresurlaub" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setSzenario("neuer-job"),
              className: `py-3 px-4 rounded-xl font-medium transition-all text-left ${szenario === "neuer-job" ? "bg-green-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-lg block", children: "🆕" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Neuer Job" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setSzenario("kuendigung"),
              className: `py-3 px-4 rounded-xl font-medium transition-all text-left ${szenario === "kuendigung" ? "bg-green-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-lg block", children: "👋" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Kündigung" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setSzenario("teilzeit"),
              className: `py-3 px-4 rounded-xl font-medium transition-all text-left ${szenario === "teilzeit" ? "bg-green-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-lg block", children: "⏰" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Teilzeit" })
              ]
            }
          )
        ] })
      ] }),
      szenario !== "teilzeit" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxs("label", { className: "block mb-3", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Arbeitstage pro Woche" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Wie viele Tage arbeiten Sie?" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-2", children: [4, 5, 6].map((tage) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setArbeitstageProWoche(tage),
              className: `py-4 px-4 rounded-xl text-center transition-all ${arbeitstageProWoche === tage ? "bg-green-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold", children: tage }),
                /* @__PURE__ */ jsx("span", { className: "text-xs block mt-1", children: "Tage" })
              ]
            },
            tage
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Vertragliche Urlaubstage pro Jahr" }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500 block mt-1", children: [
              "Laut Arbeitsvertrag (gesetzl. Minimum: ",
              Math.round(GESETZLICHER_MINDESTURLAUB.bei6Tagen / 6 * arbeitstageProWoche),
              " Tage)"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: vertraglicheUrlaubstage,
                onChange: (e) => setVertraglicheUrlaubstage(Math.max(0, Number(e.target.value))),
                className: "w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none",
                min: "20",
                max: "50"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg", children: "Tage" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              value: vertraglicheUrlaubstage,
              onChange: (e) => setVertraglicheUrlaubstage(Number(e.target.value)),
              className: "w-full mt-3 accent-green-500",
              min: "20",
              max: "40"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
            /* @__PURE__ */ jsx("span", { children: "20 (Minimum)" }),
            /* @__PURE__ */ jsx("span", { children: "30 (üblich)" }),
            /* @__PURE__ */ jsx("span", { children: "40" })
          ] })
        ] })
      ] }),
      szenario === "neuer-job" && /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Eintrittsmonat" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Wann haben Sie angefangen?" })
        ] }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: eintrittMonat,
            onChange: (e) => setEintrittMonat(Number(e.target.value)),
            className: "w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none bg-white",
            children: monate.map((monat, i) => /* @__PURE__ */ jsx("option", { value: i + 1, children: monat }, i))
          }
        )
      ] }),
      szenario === "kuendigung" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Austrittsmonat" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Wann ist Ihr letzter Arbeitstag?" })
          ] }),
          /* @__PURE__ */ jsx(
            "select",
            {
              value: austrittsMonat,
              onChange: (e) => setAustrittsMonat(Number(e.target.value)),
              className: "w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none bg-white",
              children: monate.map((monat, i) => /* @__PURE__ */ jsx("option", { value: i + 1, children: monat }, i))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Bereits genommener Urlaub" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Wie viele Tage haben Sie dieses Jahr bereits genommen?" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: bereitsGenommen,
              onChange: (e) => setBereitsGenommen(Math.max(0, Number(e.target.value))),
              className: "w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none text-center text-xl font-bold",
              min: "0",
              max: "50"
            }
          )
        ] })
      ] }),
      szenario === "teilzeit" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Arbeitstage pro Woche (Teilzeit)" }) }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-5 gap-2", children: [1, 2, 3, 4, 5].map((tage) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setTeilzeitTageProWoche(tage),
              className: `py-4 px-2 rounded-xl text-center transition-all ${teilzeitTageProWoche === tage ? "bg-green-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: /* @__PURE__ */ jsx("span", { className: "text-xl font-bold", children: tage })
            },
            tage
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Urlaubstage bei Vollzeit (5 Tage/Woche)" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Laut Tarifvertrag/Betriebsvereinbarung" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: vollzeitUrlaubstage,
              onChange: (e) => setVollzeitUrlaubstage(Math.max(20, Number(e.target.value))),
              className: "w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none text-center text-xl font-bold",
              min: "20",
              max: "40"
            }
          )
        ] })
      ] }),
      (szenario === "jahresurlaub" || szenario === "kuendigung" || szenario === "teilzeit") && /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Resturlaub aus dem Vorjahr" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Übertragener Urlaub (verfällt am 31.03.)" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            value: resturlaubVorjahr,
            onChange: (e) => setResturlaubVorjahr(Math.max(0, Number(e.target.value))),
            className: "w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none text-center text-xl font-bold",
            min: "0",
            max: "30"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl shadow-lg p-6 text-white mb-6 bg-gradient-to-br from-green-500 to-emerald-600", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-sm font-medium opacity-80 mb-1", children: [
        "🏖️ Ihr Urlaubsanspruch ",
        (/* @__PURE__ */ new Date()).getFullYear()
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-baseline gap-2", children: /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatTage(ergebnis.urlaubBeiArbeitgeber) }) }),
        /* @__PURE__ */ jsx("p", { className: "text-green-100 mt-2 text-sm", children: szenario === "teilzeit" ? `Bei ${teilzeitTageProWoche} Arbeitstagen pro Woche` : szenario === "neuer-job" ? `Anteiliger Anspruch für ${ergebnis.anteilMonate} Monate` : szenario === "kuendigung" ? `Ihr Anspruch bis zum Ausscheiden` : `Inklusive ${resturlaubVorjahr} Tage Resturlaub` })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Pro Monat" }),
          /* @__PURE__ */ jsxs("div", { className: "text-xl font-bold", children: [
            ergebnis.proMonat,
            " Tage"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Gesetzl. Min." }),
          /* @__PURE__ */ jsxs("div", { className: "text-xl font-bold", children: [
            ergebnis.gesetzlicherAnspruch,
            " Tage"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Vertraglich" }),
          /* @__PURE__ */ jsxs("div", { className: "text-xl font-bold", children: [
            ergebnis.jahresurlaub,
            " Tage"
          ] })
        ] })
      ] }),
      szenario === "kuendigung" && bereitsGenommen > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
          /* @__PURE__ */ jsx("strong", { children: "Noch verfügbar:" }),
          " ",
          formatTage(Math.max(0, ergebnis.urlaubBeiArbeitgeber - bereitsGenommen)),
          /* @__PURE__ */ jsxs("span", { className: "opacity-80", children: [
            " (",
            formatTage(bereitsGenommen),
            " bereits genommen)"
          ] })
        ] }),
        ergebnis.urlaubBeiArbeitgeber - bereitsGenommen > 0 && /* @__PURE__ */ jsx("p", { className: "text-xs mt-1 opacity-80", children: "Resturlaub kann abgebaut werden oder wird ausgezahlt (Urlaubsabgeltung)" })
      ] }),
      ergebnis.istTeilzeit && /* @__PURE__ */ jsx("div", { className: "mt-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm", children: /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
        /* @__PURE__ */ jsx("strong", { children: "Urlaubswochen:" }),
        " ",
        (ergebnis.jahresurlaub / teilzeitTageProWoche).toFixed(1),
        " Wochen",
        /* @__PURE__ */ jsxs("span", { className: "opacity-80", children: [
          " (wie bei Vollzeit: ",
          (ergebnis.vollzeitVergleich / 5).toFixed(1),
          " Wochen)"
        ] })
      ] }) })
    ] }),
    ergebnis.hinweise.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-blue-800 mb-3", children: "💡 Hinweise zu Ihrer Berechnung" }),
      /* @__PURE__ */ jsx("ul", { className: "space-y-2 text-sm text-blue-700", children: ergebnis.hinweise.map((hinweis, i) => /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx("span", { children: "•" }),
        /* @__PURE__ */ jsx("span", { children: hinweis })
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Berechnungsdetails" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide", children: "Urlaubsberechnung nach BUrlG" }),
        szenario === "teilzeit" ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Vollzeit-Urlaub (5 Tage/Woche)" }),
            /* @__PURE__ */ jsxs("span", { className: "font-bold text-gray-900", children: [
              ergebnis.vollzeitVergleich,
              " Tage"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "÷ Vollzeit-Arbeitstage" }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: "5 Tage" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "× Ihre Arbeitstage" }),
            /* @__PURE__ */ jsxs("span", { className: "text-gray-900", children: [
              teilzeitTageProWoche,
              " Tage"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-gray-50 -mx-6 px-6", children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "= Ihr Urlaubsanspruch" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatTage(ergebnis.jahresurlaub) })
          ] })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Vertraglicher Jahresurlaub" }),
            /* @__PURE__ */ jsxs("span", { className: "font-bold text-gray-900", children: [
              ergebnis.jahresurlaub,
              " Tage"
            ] })
          ] }),
          (szenario === "neuer-job" || szenario === "kuendigung") && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "÷ 12 Monate" }),
              /* @__PURE__ */ jsxs("span", { className: "text-gray-900", children: [
                ergebnis.proMonat,
                " Tage/Monat"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
                "× ",
                ergebnis.anteilMonate,
                " Monate im Betrieb"
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatTage(ergebnis.anteilMonate * ergebnis.proMonat) })
            ] })
          ] }),
          resturlaubVorjahr > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-green-600", children: [
            /* @__PURE__ */ jsx("span", { children: "+ Resturlaub Vorjahr" }),
            /* @__PURE__ */ jsx("span", { children: formatTage(resturlaubVorjahr) })
          ] }),
          szenario === "kuendigung" && bereitsGenommen > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-red-600", children: [
            /* @__PURE__ */ jsx("span", { children: "− Bereits genommen" }),
            /* @__PURE__ */ jsx("span", { children: formatTage(bereitsGenommen) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-3 bg-green-100 -mx-6 px-6 rounded-b-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold text-green-800", children: "= Verfügbarer Urlaub" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-2xl text-green-900", children: formatTage(
              szenario === "kuendigung" ? Math.max(0, ergebnis.urlaubBeiArbeitgeber - bereitsGenommen) : ergebnis.urlaubBeiArbeitgeber
            ) })
          ] })
        ] })
      ] })
    ] }),
    szenario === "teilzeit" && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🔄 Teilzeit-Urlaubsberechnung erklärt" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          "Die Formel für Teilzeit-Urlaub stellt sicher, dass Sie genauso viele",
          /* @__PURE__ */ jsx("strong", { children: " Urlaubswochen" }),
          " bekommen wie Vollzeitkräfte:"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-gray-50 p-4 rounded-xl font-mono text-center text-gray-800", children: "Teilzeit-Urlaub = (Vollzeit-Urlaub ÷ 5) × Teilzeit-Tage" }),
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Beispiel:" }),
          " Bei 30 Tagen Vollzeit-Urlaub und 3 Arbeitstagen pro Woche:"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "bg-green-50 p-3 rounded-lg", children: [
          "(30 ÷ 5) × 3 = ",
          /* @__PURE__ */ jsx("strong", { children: "18 Urlaubstage" }),
          " = 6 Wochen Urlaub"
        ] }),
        /* @__PURE__ */ jsx("p", { children: "Sie arbeiten weniger Tage, brauchen aber auch weniger freie Tage für eine volle Urlaubswoche – das Ergebnis ist gleich viel Erholungszeit!" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert das Urlaubsrecht" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Gesetzlicher Mindesturlaub:" }),
            " 24 Werktage (6-Tage-Woche) bzw. 20 Arbeitstage (5-Tage-Woche) nach § 3 BUrlG"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Wartezeit:" }),
            " Voller Urlaubsanspruch erst nach 6 Monaten Betriebszugehörigkeit (§ 4 BUrlG)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Anteiliger Urlaub:" }),
            " 1/12 des Jahresurlaubs pro vollem Beschäftigungsmonat (§ 5 BUrlG)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Übertragung:" }),
            " Resturlaub muss bis 31. März des Folgejahres genommen werden (§ 7 Abs. 3 BUrlG)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Urlaubsabgeltung:" }),
            " Nicht genommener Urlaub wird bei Kündigung ausgezahlt (§ 7 Abs. 4 BUrlG)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Gleichbehandlung:" }),
            " Teilzeitkräfte erhalten anteilig gleich viele Urlaubswochen"
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
            /* @__PURE__ */ jsx("strong", { children: "Urlaubsbescheinigung:" }),
            " Beim Jobwechsel unbedingt eine Urlaubsbescheinigung vom alten Arbeitgeber anfordern!"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Verfall:" }),
            " Arbeitgeber muss Sie auf drohenden Verfall hinweisen, sonst kann Urlaub nicht verfallen (EuGH)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Krankheit:" }),
            " Urlaub während Krankheit wird nicht angerechnet, wenn Sie ein Attest haben"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Kündigung in Probezeit:" }),
            " Auch hier besteht anteiliger Urlaubsanspruch (1/12 pro Monat)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Tarifvertrag:" }),
            " Viele Tarifverträge sehen mehr Urlaub vor als das Gesetz – Ihren Arbeitsvertrag prüfen!"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Übliche Urlaubstage nach Branche" }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-gray-50", children: [
          /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-3 font-medium text-gray-600", children: "Branche" }),
          /* @__PURE__ */ jsx("th", { className: "text-center py-2 px-3 font-medium text-gray-600", children: "Urlaubstage" }),
          /* @__PURE__ */ jsx("th", { className: "text-center py-2 px-3 font-medium text-gray-600", children: "Quelle" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { children: [
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3", children: "Öffentlicher Dienst (TVöD)" }),
            /* @__PURE__ */ jsx("td", { className: "text-center py-2 px-3 font-bold", children: "30 Tage" }),
            /* @__PURE__ */ jsx("td", { className: "text-center py-2 px-3 text-gray-500", children: "Tarifvertrag" })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 bg-gray-50", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3", children: "Metallindustrie (IG Metall)" }),
            /* @__PURE__ */ jsx("td", { className: "text-center py-2 px-3 font-bold", children: "30 Tage" }),
            /* @__PURE__ */ jsx("td", { className: "text-center py-2 px-3 text-gray-500", children: "Tarifvertrag" })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3", children: "Chemie-Industrie" }),
            /* @__PURE__ */ jsx("td", { className: "text-center py-2 px-3 font-bold", children: "30 Tage" }),
            /* @__PURE__ */ jsx("td", { className: "text-center py-2 px-3 text-gray-500", children: "Tarifvertrag" })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 bg-gray-50", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3", children: "Banken" }),
            /* @__PURE__ */ jsx("td", { className: "text-center py-2 px-3 font-bold", children: "30 Tage" }),
            /* @__PURE__ */ jsx("td", { className: "text-center py-2 px-3 text-gray-500", children: "Tarifvertrag" })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3", children: "Einzelhandel" }),
            /* @__PURE__ */ jsx("td", { className: "text-center py-2 px-3 font-bold", children: "28-36 Tage" }),
            /* @__PURE__ */ jsx("td", { className: "text-center py-2 px-3 text-gray-500", children: "nach Alter/Betriebszugehörigkeit" })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 bg-gray-50", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3", children: "Gastronomie" }),
            /* @__PURE__ */ jsx("td", { className: "text-center py-2 px-3 font-bold", children: "24-30 Tage" }),
            /* @__PURE__ */ jsx("td", { className: "text-center py-2 px-3 text-gray-500", children: "regional unterschiedlich" })
          ] }),
          /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3 text-gray-500", children: "Gesetzliches Minimum" }),
            /* @__PURE__ */ jsx("td", { className: "text-center py-2 px-3 font-bold text-amber-600", children: "20 Tage" }),
            /* @__PURE__ */ jsx("td", { className: "text-center py-2 px-3 text-gray-500", children: "BUrlG" })
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Hilfe bei Problemen" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-green-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-green-900", children: "Arbeitsgericht" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-green-700 mt-1", children: "Bei Streitigkeiten über Urlaubsansprüche ist das Arbeitsgericht zuständig. In der ersten Instanz gibt es keinen Anwaltszwang." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Bürgertelefon BMAS" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "tel:030-221911001",
                  className: "text-green-600 hover:underline font-bold",
                  children: "030 221 911 001"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs mt-1", children: "Arbeitsrecht-Infos" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "BMAS Infos" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.bmas.de/DE/Arbeit/Arbeitsrecht/Urlaub/urlaub.html",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-green-600 hover:underline",
                  children: "bmas.de/urlaub →"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "⚖️" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Weitere Anlaufstellen" }),
            /* @__PURE__ */ jsxs("ul", { className: "text-gray-600 mt-1 space-y-1", children: [
              /* @__PURE__ */ jsx("li", { children: "• Gewerkschaft (Rechtsschutz für Mitglieder)" }),
              /* @__PURE__ */ jsx("li", { children: "• Betriebsrat (wenn vorhanden)" }),
              /* @__PURE__ */ jsx("li", { children: "• Verbraucherzentrale (Erstberatung)" }),
              /* @__PURE__ */ jsx("li", { children: "• Fachanwalt für Arbeitsrecht" })
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
            href: "https://www.gesetze-im-internet.de/burlg/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-green-600 hover:underline",
            children: "Bundesurlaubsgesetz (BUrlG)"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bmas.de/DE/Arbeit/Arbeitsrecht/Urlaub/urlaub.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-green-600 hover:underline",
            children: "BMAS – Urlaub"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bag-urteil.com/urlaub/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-green-600 hover:underline",
            children: "BAG-Rechtsprechung – Urlaub"
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
const $$UrlaubstageRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "Urlaubstage-Rechner 2025 \u2013 Urlaub bei Teilzeit, Jobwechsel & K\xFCndigung berechnen";
  const description = "Urlaubstage berechnen: Anteiliger Urlaub bei Teilzeit, neuem Job oder K\xFCndigung. Gesetzlicher Mindesturlaub 20 Tage. Kostenloser Rechner nach BUrlG mit Resturlaub.";
  const keywords = "Urlaubstage Rechner, Urlaub berechnen, Urlaubsanspruch Teilzeit, Urlaub K\xFCndigung, anteiliger Urlaub, Resturlaub, Urlaubstage Teilzeit, Urlaubsanspruch berechnen, BUrlG, gesetzlicher Urlaub, Urlaub Jobwechsel, Urlaubsabgeltung, Teilzeit Urlaub Rechner, Urlaub pro Monat";
  return renderTemplate(_a || (_a = __template(["", ' <script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [\n    {\n      "@type": "Question",\n      "name": "Wie viele Urlaubstage stehen mir gesetzlich zu?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "Nach dem Bundesurlaubsgesetz haben alle Arbeitnehmer Anspruch auf mindestens 24 Werktage Urlaub bei einer 6-Tage-Woche, das entspricht 20 Arbeitstagen bei einer 5-Tage-Woche. Viele Arbeitsvertr\xE4ge sehen mehr vor (oft 28-30 Tage)."\n      }\n    },\n    {\n      "@type": "Question",\n      "name": "Wie berechne ich Urlaub bei Teilzeit?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "Bei Teilzeit wird der Urlaub anteilig berechnet: (Vollzeit-Urlaub \xF7 5 Tage) \xD7 Ihre Arbeitstage pro Woche. Bei 30 Tagen Vollzeit-Urlaub und 3 Arbeitstagen ergibt das 18 Urlaubstage \u2013 beide haben gleich viele Urlaubswochen."\n      }\n    },\n    {\n      "@type": "Question",\n      "name": "Was passiert mit meinem Urlaub bei K\xFCndigung?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "Bei K\xFCndigung haben Sie Anspruch auf anteiligen Urlaub (1/12 pro Monat). Bei Ausscheiden nach dem 30. Juni steht Ihnen der volle Jahresurlaub zu. Nicht genommener Urlaub muss als Urlaubsabgeltung ausgezahlt werden."\n      }\n    },\n    {\n      "@type": "Question",\n      "name": "Wann verf\xE4llt mein Resturlaub?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "Urlaub muss grunds\xE4tzlich bis 31. Dezember genommen werden. Bei wichtigen Gr\xFCnden kann er bis 31. M\xE4rz \xFCbertragen werden. Wichtig: Der Arbeitgeber muss Sie aktiv auf drohenden Verfall hinweisen, sonst verf\xE4llt der Urlaub nicht (EuGH-Rechtsprechung)."\n      }\n    },\n    {\n      "@type": "Question",\n      "name": "Habe ich in der Probezeit Urlaubsanspruch?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "Ja, auch in der Probezeit entsteht Urlaubsanspruch: 1/12 des Jahresurlaubs pro Monat. Den vollen Urlaubsanspruch haben Sie nach 6 Monaten Betriebszugeh\xF6rigkeit (Wartezeit nach \xA7 4 BUrlG)."\n      }\n    }\n  ]\n}\n<\/script> <script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebApplication",\n  "name": "Urlaubstage-Rechner 2025",\n  "description": "Berechnen Sie Ihren Urlaubsanspruch: Jahresurlaub, anteiliger Urlaub bei Teilzeit, Jobwechsel oder K\xFCndigung. Nach Bundesurlaubsgesetz.",\n  "url": "https://deutschland-rechner.de/urlaubstage-rechner",\n  "applicationCategory": "BusinessApplication",\n  "operatingSystem": "Web",\n  "offers": {\n    "@type": "Offer",\n    "price": "0",\n    "priceCurrency": "EUR"\n  }\n}\n<\/script> '])), renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4"> <div class="max-w-2xl mx-auto"> <!-- Header --> <div class="text-center mb-8"> <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4"> <span class="text-4xl">🏖️</span> </div> <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
Urlaubstage-Rechner 2025
</h1> <p class="text-gray-600 max-w-lg mx-auto">
Berechnen Sie Ihren Urlaubsanspruch: Jahresurlaub, Teilzeit, Jobwechsel oder Kündigung – alles nach BUrlG.
</p> </div> <!-- Calculator Component --> ${renderComponent($$result2, "UrlaubstageRechner", UrlaubstageRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/UrlaubstageRechner.tsx", "client:component-export": "default" })} <!-- SEO Content Section --> <div class="mt-12 bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">📚 Alles Wichtige zum Urlaubsanspruch</h2> <div class="space-y-4 text-sm text-gray-600"> <div> <h3 class="font-semibold text-gray-800 mb-2">Wie viele Urlaubstage stehen mir zu?</h3> <p>
Nach dem <strong>Bundesurlaubsgesetz (BUrlG)</strong> haben alle Arbeitnehmer Anspruch auf 
              mindestens <strong>24 Werktage</strong> Urlaub pro Jahr – das gilt bei einer 6-Tage-Woche. 
              Bei der heute üblichen 5-Tage-Woche entspricht das <strong>20 Arbeitstagen</strong>. 
              Viele Arbeits- und Tarifverträge sehen jedoch mehr Urlaub vor, oft 28-30 Tage.
</p> </div> <div> <h3 class="font-semibold text-gray-800 mb-2">Wie berechne ich Urlaub bei Teilzeit?</h3> <p>
Bei Teilzeit wird der Urlaub <strong>anteilig</strong> berechnet, aber Sie bekommen
<strong>gleich viele Urlaubswochen</strong> wie Vollzeitkräfte! Die Formel:
<code class="bg-gray-100 px-2 py-1 rounded">(Vollzeit-Urlaub ÷ 5) × Teilzeit-Arbeitstage</code>. 
              Bei 30 Tagen Vollzeit-Urlaub und 3 Arbeitstagen pro Woche erhalten Sie 18 Urlaubstage – 
              beide haben 6 Wochen Urlaub.
</p> </div> <div> <h3 class="font-semibold text-gray-800 mb-2">Was passiert mit meinem Urlaub bei Kündigung?</h3> <p>
Bei Kündigung haben Sie Anspruch auf <strong>anteiligen Urlaub</strong> (1/12 pro Monat). 
              Scheiden Sie <strong>nach dem 30. Juni</strong> aus, steht Ihnen der volle Jahresurlaub zu! 
              Nicht genommener Urlaub muss <strong>ausgezahlt werden</strong> (Urlaubsabgeltung).
</p> </div> <div> <h3 class="font-semibold text-gray-800 mb-2">Wann verfällt mein Resturlaub?</h3> <p>
Grundsätzlich muss Urlaub <strong>bis zum 31. Dezember</strong> genommen werden. 
              Bei dringenden betrieblichen oder persönlichen Gründen kann er bis zum
<strong>31. März des Folgejahres</strong> übertragen werden. 
              Wichtig: Der Arbeitgeber muss Sie aktiv auf drohenden Verfall hinweisen – 
              sonst kann der Urlaub <strong>nicht verfallen</strong> (EuGH-Urteil).
</p> </div> <div> <h3 class="font-semibold text-gray-800 mb-2">Habe ich in der Probezeit Urlaubsanspruch?</h3> <p>
Ja! Auch während der Probezeit entsteht Urlaubsanspruch: <strong>1/12 des Jahresurlaubs 
              pro Monat</strong>. Den <strong>vollen</strong> Urlaubsanspruch haben Sie allerdings erst 
              nach 6 Monaten Betriebszugehörigkeit (Wartezeit nach § 4 BUrlG).
</p> </div> </div> </div> <!-- FAQ Schema --> <div class="mt-8 bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">❓ Häufige Fragen zu Urlaubstagen</h2> <div class="space-y-4"> <details class="group"> <summary class="cursor-pointer font-medium text-gray-800 hover:text-green-600">
Wie berechne ich meinen Urlaub bei einem Jobwechsel?
</summary> <p class="mt-2 text-sm text-gray-600 pl-4">
Bei einem Jobwechsel teilen sich alter und neuer Arbeitgeber den Urlaubsanspruch anteilig auf. 
              Wichtig: Lassen Sie sich vom alten Arbeitgeber eine <strong>Urlaubsbescheinigung</strong> geben! 
              Diese muss dem neuen Arbeitgeber vorgelegt werden, damit bereits genommener Urlaub angerechnet wird (§ 6 BUrlG).
</p> </details> <details class="group"> <summary class="cursor-pointer font-medium text-gray-800 hover:text-green-600">
Kann ich mir Urlaub auszahlen lassen?
</summary> <p class="mt-2 text-sm text-gray-600 pl-4">
Grundsätzlich <strong>nein</strong> – Urlaub dient der Erholung und kann während des 
              laufenden Arbeitsverhältnisses nicht ausgezahlt werden. Eine Ausnahme gibt es nur bei
<strong>Beendigung des Arbeitsverhältnisses</strong>: Dann muss nicht genommener Urlaub 
              als Urlaubsabgeltung ausgezahlt werden (§ 7 Abs. 4 BUrlG).
</p> </details> <details class="group"> <summary class="cursor-pointer font-medium text-gray-800 hover:text-green-600">
Was ist, wenn ich im Urlaub krank werde?
</summary> <p class="mt-2 text-sm text-gray-600 pl-4">
Wenn Sie im Urlaub krank werden und ein <strong>ärztliches Attest</strong> vorlegen, werden 
              die Krankheitstage <strong>nicht auf den Urlaub angerechnet</strong> (§ 9 BUrlG). 
              Sie bekommen die Urlaubstage zurück! Das Attest sollte ab dem ersten Krankheitstag vorliegen.
</p> </details> <details class="group"> <summary class="cursor-pointer font-medium text-gray-800 hover:text-green-600">
Bekomme ich mehr Urlaub, je älter ich werde?
</summary> <p class="mt-2 text-sm text-gray-600 pl-4">
Das BUrlG sieht keine Staffelung nach Alter vor. Allerdings enthalten viele
<strong>Tarifverträge</strong> (z.B. Einzelhandel) Regelungen, die zusätzliche Urlaubstage 
              nach Alter oder Betriebszugehörigkeit vorsehen. Prüfen Sie Ihren Arbeitsvertrag oder 
              den anwendbaren Tarifvertrag.
</p> </details> <details class="group"> <summary class="cursor-pointer font-medium text-gray-800 hover:text-green-600">
Kann mein Chef mir vorschreiben, wann ich Urlaub nehme?
</summary> <p class="mt-2 text-sm text-gray-600 pl-4">
Grundsätzlich bestimmen Sie, wann Sie Urlaub nehmen möchten. Der Arbeitgeber muss 
              Ihre Wünsche berücksichtigen, es sei denn, <strong>dringende betriebliche Belange</strong>
sprechen dagegen (z.B. Auftragsspitzen, Urlaubswünsche anderer mit Schulkindern). 
              Betriebsurlaub kann durch Betriebsvereinbarung geregelt werden.
</p> </details> </div> </div> <!-- Vergleichsrechner --> <div class="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6"> <h3 class="font-bold text-green-800 mb-3">📱 Weitere nützliche Rechner</h3> <div class="grid grid-cols-2 gap-3"> <a href="/brutto-netto-rechner" class="bg-white p-4 rounded-xl hover:shadow-md transition-shadow"> <span class="text-2xl">💵</span> <span class="block text-sm font-medium text-gray-800 mt-1">Brutto-Netto</span> </a> <a href="/stundenlohn-rechner" class="bg-white p-4 rounded-xl hover:shadow-md transition-shadow"> <span class="text-2xl">⌛</span> <span class="block text-sm font-medium text-gray-800 mt-1">Stundenlohn</span> </a> <a href="/arbeitslosengeld-rechner" class="bg-white p-4 rounded-xl hover:shadow-md transition-shadow"> <span class="text-2xl">📋</span> <span class="block text-sm font-medium text-gray-800 mt-1">Arbeitslosengeld</span> </a> <a href="/abfindung-rechner" class="bg-white p-4 rounded-xl hover:shadow-md transition-shadow"> <span class="text-2xl">🤝</span> <span class="block text-sm font-medium text-gray-800 mt-1">Abfindung</span> </a> </div> </div> <!-- Back Link --> <div class="mt-8 text-center"> <a href="/" class="inline-flex items-center gap-2 text-green-600 hover:text-green-800 font-medium">
← Alle Rechner anzeigen
</a> </div> </div> </main> ` }));
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/urlaubstage-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/urlaubstage-rechner.astro";
const $$url = "/urlaubstage-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$UrlaubstageRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
