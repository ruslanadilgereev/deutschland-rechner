/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DmT1JwUR.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const ELTERNGELD_2026 = {
  minBasis: 300,
  // Mindestbetrag Basiselterngeld (§ 2 Abs. 4 BEEG)
  maxBasis: 1800,
  // Höchstbetrag Basiselterngeld (§ 2 Abs. 1 BEEG)
  minPlus: 150,
  // Mindestbetrag ElterngeldPlus
  maxPlus: 900,
  // Höchstbetrag ElterngeldPlus
  // Einkommensgrenzen für Ersatzraten-Staffelung
  geringverdienerGrenze: 1e3,
  // Unter 1.000€: Ersatzrate steigt
  basisGrenze: 1200,
  // 1.000-1.200€: 67% Ersatzrate
  abschmelzungsEnde: 1240,
  // Über 1.240€: 65% Ersatzrate
  // Ersatzraten
  ersatzrateMin: 0.65,
  // Minimum bei hohem Einkommen
  ersatzrateBasis: 0.67,
  // Standard bei 1.000-1.200€
  ersatzrateMax: 1};
function berechneErsatzrate(nettoMonat) {
  if (nettoMonat < ELTERNGELD_2026.geringverdienerGrenze) {
    const differenz = ELTERNGELD_2026.geringverdienerGrenze - nettoMonat;
    const zusatz = differenz / 2 * 1e-3;
    return Math.min(ELTERNGELD_2026.ersatzrateMax, ELTERNGELD_2026.ersatzrateBasis + zusatz);
  } else if (nettoMonat <= ELTERNGELD_2026.basisGrenze) {
    return ELTERNGELD_2026.ersatzrateBasis;
  } else if (nettoMonat < ELTERNGELD_2026.abschmelzungsEnde) {
    const differenz = nettoMonat - ELTERNGELD_2026.basisGrenze;
    const abzug = differenz / 2 * 1e-3;
    return Math.max(ELTERNGELD_2026.ersatzrateMin, ELTERNGELD_2026.ersatzrateBasis - abzug);
  } else {
    return ELTERNGELD_2026.ersatzrateMin;
  }
}
function berechneElterngeld(nettoMonat) {
  const ersatzrate = berechneErsatzrate(nettoMonat);
  let basis = Math.round(nettoMonat * ersatzrate);
  basis = Math.max(ELTERNGELD_2026.minBasis, Math.min(ELTERNGELD_2026.maxBasis, basis));
  let plus = Math.round(basis / 2);
  plus = Math.max(ELTERNGELD_2026.minPlus, Math.min(ELTERNGELD_2026.maxPlus, plus));
  return {
    basis,
    basisMonate: 12,
    // bis zu 12 Monate (14 mit Partner)
    plus,
    plusMonate: 24,
    // bis zu 24 Monate
    ersatzrate: Math.round(ersatzrate * 100)
  };
}
function ElterngeldRechner() {
  const [nettoMonat, setNettoMonat] = useState(2500);
  const [partnerMonate, setPartnerMonate] = useState(2);
  const [modus, setModus] = useState("basis");
  const ergebnis = useMemo(() => {
    const eg = berechneElterngeld(nettoMonat);
    const verfuegbareMonate = 12 + partnerMonate;
    const verfuegbareMonatePlus = verfuegbareMonate * 2;
    let gesamtAuszahlung = 0;
    let beschreibung = "";
    switch (modus) {
      case "basis":
        gesamtAuszahlung = eg.basis * verfuegbareMonate;
        beschreibung = `${verfuegbareMonate} Monate × ${eg.basis} €`;
        break;
      case "plus":
        gesamtAuszahlung = eg.plus * verfuegbareMonatePlus;
        beschreibung = `${verfuegbareMonatePlus} Monate × ${eg.plus} €`;
        break;
      case "kombi":
        const basisMonate = Math.ceil(verfuegbareMonate / 2);
        const plusMonate = (verfuegbareMonate - basisMonate) * 2;
        gesamtAuszahlung = eg.basis * basisMonate + eg.plus * plusMonate;
        beschreibung = `${basisMonate}× Basis + ${plusMonate}× Plus`;
        break;
    }
    return {
      ...eg,
      verfuegbareMonate,
      verfuegbareMonatePlus,
      gesamtAuszahlung,
      beschreibung
    };
  }, [nettoMonat, partnerMonate, modus]);
  const formatEuro = (n) => n.toLocaleString("de-DE") + " €";
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Dein Netto vor der Geburt" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 ml-2", children: "(Durchschnitt der letzten 12 Monate)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: nettoMonat,
              onChange: (e) => setNettoMonat(Math.max(0, Number(e.target.value))),
              className: "w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 outline-none",
              min: "0",
              step: "100"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl", children: "€" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            min: "0",
            max: "5000",
            step: "100",
            value: nettoMonat,
            onChange: (e) => setNettoMonat(Number(e.target.value)),
            className: "w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Partnermonate" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 ml-2", children: "(0-2 zusätzliche Monate)" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-3", children: [0, 1, 2].map((m) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setPartnerMonate(m),
            className: `flex-1 py-3 rounded-xl font-bold text-lg transition-all ${partnerMonate === m ? "bg-pink-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: [
              m,
              " Monate"
            ]
          },
          m
        )) }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-2", children: "+2 Monate wenn beide Eltern mindestens 2 Monate Elterngeld beziehen" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Variante" }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setModus("basis"),
              className: `p-4 rounded-xl text-center transition-all ${modus === "basis" ? "bg-pink-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("div", { className: "font-bold", children: "Basis" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs mt-1 opacity-80", children: "12-14 Monate" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setModus("plus"),
              className: `p-4 rounded-xl text-center transition-all ${modus === "plus" ? "bg-pink-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("div", { className: "font-bold", children: "Plus" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs mt-1 opacity-80", children: "24-28 Monate" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setModus("kombi"),
              className: `p-4 rounded-xl text-center transition-all ${modus === "kombi" ? "bg-pink-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("div", { className: "font-bold", children: "Kombi" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs mt-1 opacity-80", children: "Mix beider" })
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg p-6 text-white mb-6", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-sm font-medium text-pink-100 mb-1", children: [
        "Dein Elterngeld (",
        modus === "basis" ? "Basis" : modus === "plus" ? "Plus" : "Kombi",
        ")"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuro(modus === "basis" ? ergebnis.basis : modus === "plus" ? ergebnis.plus : ergebnis.basis) }),
          /* @__PURE__ */ jsx("span", { className: "text-xl text-pink-200", children: "/ Monat" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-pink-100 mt-2", children: [
          "= ",
          ergebnis.ersatzrate,
          "% von ",
          formatEuro(nettoMonat),
          " Netto"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-pink-100", children: [
          "Gesamt (",
          ergebnis.beschreibung,
          ")"
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-xl font-bold", children: formatEuro(ergebnis.gesamtAuszahlung) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Varianten im Vergleich" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: `flex justify-between items-center p-4 rounded-xl ${modus === "basis" ? "bg-pink-50 border-2 border-pink-300" : "bg-gray-50"}`, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-bold text-gray-800", children: "Basiselterngeld" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500", children: [
              ergebnis.verfuegbareMonate,
              " Monate × ",
              formatEuro(ergebnis.basis)
            ] })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-gray-900", children: formatEuro(ergebnis.basis * ergebnis.verfuegbareMonate) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `flex justify-between items-center p-4 rounded-xl ${modus === "plus" ? "bg-pink-50 border-2 border-pink-300" : "bg-gray-50"}`, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-bold text-gray-800", children: "ElterngeldPlus" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500", children: [
              ergebnis.verfuegbareMonatePlus,
              " Monate × ",
              formatEuro(ergebnis.plus)
            ] })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-gray-900", children: formatEuro(ergebnis.plus * ergebnis.verfuegbareMonatePlus) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 p-3 bg-green-50 rounded-xl text-sm", children: /* @__PURE__ */ jsxs("p", { className: "text-green-800", children: [
        /* @__PURE__ */ jsx("strong", { children: "💡 Tipp:" }),
        " ElterngeldPlus lohnt sich besonders bei Teilzeitarbeit während der Elternzeit!"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert's" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "65-100% des Nettos" }),
            " je nach Einkommen (§ 2 BEEG):",
            /* @__PURE__ */ jsx("br", {}),
            "• Unter 1.000€: 67% + 0,1% je 2€ (max. 100%)",
            /* @__PURE__ */ jsx("br", {}),
            "• 1.000-1.200€: 67%",
            /* @__PURE__ */ jsx("br", {}),
            "• Über 1.200€: sinkt auf 65%"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Min. 300 € / Max. 1.800 €" }),
            " pro Monat (Basiselterngeld)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "12 + 2 Partnermonate" }),
            " oder 24-28 Monate ElterngeldPlus"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Einkommensgrenze: ",
            /* @__PURE__ */ jsx("strong", { children: "175.000 €" }),
            " zu versteuerndes Einkommen (für alle seit April 2025)"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörde" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-pink-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-pink-900", children: "Elterngeldstelle deines Bundeslandes" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-pink-700 mt-1", children: "Zuständig ist das Bundesland, in dem du mit dem Kind wohnst." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Online beantragen" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.elterngeld-digital.de/",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "ElterngeldDigital →"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "In 10 Bundesländern verfügbar (BE, BB, HB, HH, MV, NI, RP, ST, SH, TH)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Elterngeld-Hotline" }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Je nach Bundesland verschieden" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "📋 Wichtige Hinweise" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-yellow-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "⚠️" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-yellow-800", children: "Antrag innerhalb von 3 Monaten!" }),
            /* @__PURE__ */ jsx("p", { className: "text-yellow-700", children: "Elterngeld wird max. 3 Monate rückwirkend gezahlt." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-blue-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📄" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-blue-800", children: "Benötigte Unterlagen" }),
            /* @__PURE__ */ jsx("p", { className: "text-blue-700", children: "Geburtsurkunde, Einkommensnachweise (letzte 12 Monate), Bescheinigung der Krankenkasse." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-purple-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "👶" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-purple-800", children: "Sonderregelungen" }),
            /* @__PURE__ */ jsxs("p", { className: "text-purple-700", children: [
              /* @__PURE__ */ jsx("strong", { children: "Frühchen:" }),
              " Bis zu 4 Extra-Monate bei Geburt mindestens 6 Wochen vor dem errechneten Termin.",
              /* @__PURE__ */ jsx("strong", { children: " Mehrlinge:" }),
              " +300€ Zuschlag pro weiterem Kind.",
              /* @__PURE__ */ jsx("strong", { children: " Geschwisterbonus:" }),
              " +10% (min. 75€/37,50€) bei weiteren kleinen Kindern."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-orange-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📅" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-orange-800", children: "Neuregelung seit April 2025" }),
            /* @__PURE__ */ jsx("p", { className: "text-orange-700", children: "Einheitliche Einkommensgrenze 175.000€ für alle. Gleichzeitiger Bezug nur noch 1 Monat in den ersten 12 Lebensmonaten möglich." })
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
            href: "https://familienportal.de/familienportal/familienleistungen/elterngeld",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Familienportal – Elterngeld"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bmbfsfj.bund.de/bmbfsfj/themen/familie/familienleistungen/elterngeld",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BMBFSFJ – Elterngeld & ElterngeldPlus"
          }
        )
      ] })
    ] })
  ] });
}

const $$ElterngeldRechner = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Elterngeld-Rechner 2026 \u2013 Basiselterngeld & ElterngeldPlus berechnen", "description": "Elterngeld-Rechner 2026: Berechne dein Basiselterngeld (300-1800\u20AC) oder ElterngeldPlus (150-900\u20AC). Mit aktueller Einkommensgrenze 175.000\u20AC und Partnermonate-Vergleich." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen pb-8"> <!-- Header mit Zurück-Button --> <header class="bg-gradient-to-r from-pink-500 to-rose-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-pink-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>
Alle Rechner
</a> <div class="flex items-center gap-3"> <span class="text-4xl">🍼</span> <div> <h1 class="text-2xl font-bold">Elterngeld-Rechner</h1> <p class="text-pink-100 text-sm">Basis & Plus – Stand 2026</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ${renderComponent($$result2, "ElterngeldRechner", ElterngeldRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/ElterngeldRechner", "client:component-export": "default" })} </div> </main> ` })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/elterngeld-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/elterngeld-rechner.astro";
const $$url = "/elterngeld-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$ElterngeldRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
