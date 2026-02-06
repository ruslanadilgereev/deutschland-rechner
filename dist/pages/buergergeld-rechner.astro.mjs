/* empty css                                                    */
import { c as createComponent, a as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_X4Fuu-a1.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_BdQXYkEU.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const REGELSAETZE_2026 = {
  alleinstehend: 563,
  // Regelbedarfsstufe 1
  partner: 506,
  // Regelbedarfsstufe 2 (je Partner)
  kind_14_17: 471,
  // Regelbedarfsstufe 4
  kind_6_13: 390,
  // Regelbedarfsstufe 5
  kind_0_5: 357
  // Regelbedarfsstufe 6
};
const FREIBETRAEGE = {
  grundfreibetrag: 100,
  // Grundfreibetrag
  freibetrag_100_520: 0.2,
  // 20% von 100-520€
  freibetrag_520_1000: 0.3,
  // 30% von 520-1000€
  freibetrag_1000_1200: 0.1};
function berechneKindRegelsatz(alter) {
  switch (alter) {
    case "klein":
      return REGELSAETZE_2026.kind_0_5;
    case "mittel":
      return REGELSAETZE_2026.kind_6_13;
    case "gross":
      return REGELSAETZE_2026.kind_14_17;
  }
}
function berechneEinkommenFreibetrag(brutto, hatKinder) {
  if (brutto <= 100) return brutto;
  let freibetrag = FREIBETRAEGE.grundfreibetrag;
  if (brutto > 100) {
    freibetrag += Math.min(brutto - 100, 420) * FREIBETRAEGE.freibetrag_100_520;
  }
  if (brutto > 520) {
    freibetrag += Math.min(brutto - 520, 480) * FREIBETRAEGE.freibetrag_520_1000;
  }
  const obergrenze = hatKinder ? 1500 : 1200;
  if (brutto > 1e3) {
    freibetrag += Math.min(brutto - 1e3, obergrenze - 1e3) * FREIBETRAEGE.freibetrag_1000_1200;
  }
  return Math.round(freibetrag);
}
function BuergergeldRechner() {
  const [mitPartner, setMitPartner] = useState(false);
  const [kinder, setKinder] = useState([]);
  const [warmmiete, setWarmmiete] = useState(600);
  const [einkommen, setEinkommen] = useState(0);
  const ergebnis = useMemo(() => {
    let regelbedarf = 0;
    if (mitPartner) {
      regelbedarf = REGELSAETZE_2026.partner * 2;
    } else {
      regelbedarf = REGELSAETZE_2026.alleinstehend;
    }
    kinder.forEach((kind) => {
      regelbedarf += berechneKindRegelsatz(kind.alter);
    });
    const kdu = warmmiete;
    const gesamtbedarf = regelbedarf + kdu;
    const freibetrag = berechneEinkommenFreibetrag(einkommen, kinder.length > 0);
    const anrechnung = Math.max(0, einkommen - freibetrag);
    const anspruch = Math.max(0, gesamtbedarf - anrechnung);
    return {
      regelbedarf,
      kdu,
      gesamtbedarf,
      freibetrag,
      anrechnung,
      anspruch,
      hatAnspruch: anspruch > 0
    };
  }, [mitPartner, kinder, warmmiete, einkommen]);
  const addKind = (alter) => {
    if (kinder.length < 5) {
      setKinder([...kinder, { alter }]);
    }
  };
  const removeKind = (index) => {
    setKinder(kinder.filter((_, i) => i !== index));
  };
  const formatEuro = (n) => n.toLocaleString("de-DE") + " €";
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Haushalt" }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setMitPartner(false),
              className: `p-4 rounded-xl text-center transition-all ${!mitPartner ? "bg-green-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "👤" }),
                /* @__PURE__ */ jsx("div", { className: "font-bold mt-1", children: "Alleinstehend" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs mt-1 opacity-80", children: formatEuro(REGELSAETZE_2026.alleinstehend) })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setMitPartner(true),
              className: `p-4 rounded-xl text-center transition-all ${mitPartner ? "bg-green-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "👫" }),
                /* @__PURE__ */ jsx("div", { className: "font-bold mt-1", children: "Mit Partner" }),
                /* @__PURE__ */ jsxs("div", { className: "text-xs mt-1 opacity-80", children: [
                  "je ",
                  formatEuro(REGELSAETZE_2026.partner)
                ] })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Kinder im Haushalt" }) }),
        kinder.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 mb-3", children: kinder.map((kind, i) => /* @__PURE__ */ jsxs(
          "span",
          {
            className: "inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm",
            children: [
              kind.alter === "klein" ? "👶 0-5 J." : kind.alter === "mittel" ? "🧒 6-13 J." : "🧑 14-17 J.",
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => removeKind(i),
                  className: "text-green-600 hover:text-green-800",
                  children: "×"
                }
              )
            ]
          },
          i
        )) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => addKind("klein"),
              disabled: kinder.length >= 5,
              className: "p-3 bg-gray-100 rounded-xl text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed",
              children: [
                /* @__PURE__ */ jsx("div", { children: "👶" }),
                /* @__PURE__ */ jsx("div", { className: "font-medium", children: "0-5 Jahre" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: formatEuro(REGELSAETZE_2026.kind_0_5) })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => addKind("mittel"),
              disabled: kinder.length >= 5,
              className: "p-3 bg-gray-100 rounded-xl text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed",
              children: [
                /* @__PURE__ */ jsx("div", { children: "🧒" }),
                /* @__PURE__ */ jsx("div", { className: "font-medium", children: "6-13 Jahre" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: formatEuro(REGELSAETZE_2026.kind_6_13) })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => addKind("gross"),
              disabled: kinder.length >= 5,
              className: "p-3 bg-gray-100 rounded-xl text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed",
              children: [
                /* @__PURE__ */ jsx("div", { children: "🧑" }),
                /* @__PURE__ */ jsx("div", { className: "font-medium", children: "14-17 Jahre" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: formatEuro(REGELSAETZE_2026.kind_14_17) })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Warmmiete (inkl. Nebenkosten)" }) }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: warmmiete,
              onChange: (e) => setWarmmiete(Math.max(0, Number(e.target.value))),
              className: "w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none",
              min: "0",
              step: "50"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400", children: "€" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Monatliches Bruttoeinkommen" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 ml-2", children: "(aus Erwerbstätigkeit)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: einkommen,
              onChange: (e) => setEinkommen(Math.max(0, Number(e.target.value))),
              className: "w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none",
              min: "0",
              step: "100"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400", children: "€" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: `rounded-2xl shadow-lg p-6 text-white mb-6 ${ergebnis.hatAnspruch ? "bg-gradient-to-br from-green-500 to-teal-600" : "bg-gradient-to-br from-gray-500 to-gray-600"}`, children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: ergebnis.hatAnspruch ? "Dein Bürgergeld-Anspruch" : "Kein Anspruch" }),
      /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuro(ergebnis.anspruch) }),
        /* @__PURE__ */ jsx("span", { className: "text-xl opacity-80", children: "/ Monat" })
      ] }) }),
      ergebnis.hatAnspruch && /* @__PURE__ */ jsx("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsx("span", { className: "opacity-80", children: "Pro Jahr" }),
        /* @__PURE__ */ jsx("span", { className: "text-xl font-bold", children: formatEuro(ergebnis.anspruch * 12) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Berechnung im Detail" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Regelbedarf" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.regelbedarf) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "+ Kosten der Unterkunft (KdU)" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.kdu) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-200 bg-gray-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "= Gesamtbedarf" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.gesamtbedarf) })
        ] }),
        einkommen > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-gray-500", children: [
            /* @__PURE__ */ jsx("span", { children: "Bruttoeinkommen" }),
            /* @__PURE__ */ jsx("span", { children: formatEuro(einkommen) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-green-600", children: [
            /* @__PURE__ */ jsx("span", { children: "− Freibetrag" }),
            /* @__PURE__ */ jsxs("span", { children: [
              "− ",
              formatEuro(ergebnis.freibetrag)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-red-600", children: [
            /* @__PURE__ */ jsx("span", { children: "= Anrechnung" }),
            /* @__PURE__ */ jsxs("span", { children: [
              "− ",
              formatEuro(ergebnis.anrechnung)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `flex justify-between py-3 -mx-6 px-6 rounded-b-2xl ${ergebnis.hatAnspruch ? "bg-green-50" : "bg-gray-100"}`, children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-800", children: "Bürgergeld-Anspruch" }),
          /* @__PURE__ */ jsx("span", { className: `font-bold text-xl ${ergebnis.hatAnspruch ? "text-green-600" : "text-gray-600"}`, children: formatEuro(ergebnis.anspruch) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert's" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Regelbedarf + Miete" }),
            " = Gesamtbedarf"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "100 € Grundfreibetrag" }),
            " bei Erwerbstätigkeit"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Bis 30% Freibetrag" }),
            " auf Einkommen 100-1000 €"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Vermögen bis ",
            /* @__PURE__ */ jsx("strong", { children: "40.000 € geschützt" }),
            " (1 Jahr Karenzzeit)"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörde" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-green-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-green-900", children: "Jobcenter" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-green-700 mt-1", children: "Zuständig ist das Jobcenter an deinem Wohnort." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Online beantragen" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.jobcenter.digital",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "jobcenter.digital →"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Bürgertelefon" }),
              /* @__PURE__ */ jsx("a", { href: "tel:08004555500", className: "text-blue-600 hover:underline font-mono", children: "0800 4 5555 00" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Kostenfrei" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6", children: [
      /* @__PURE__ */ jsx("h4", { className: "font-bold text-amber-800 mb-2", children: "📢 Hinweis: Änderungen ab Juli 2026" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-amber-700", children: [
        "Das Bürgergeld wird zum 1. Juli 2026 zur ",
        /* @__PURE__ */ jsx("strong", { children: '„Grundsicherung für Arbeitssuchende"' }),
        " umbenannt. Die Regelsätze bleiben vorerst unverändert, aber Vermögensfreibeträge und Sanktionsregeln werden angepasst."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gray-50 rounded-xl", children: [
      /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-gray-500 uppercase mb-2", children: "Quellen" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bundesregierung.de/breg-de/aktuelles/nullrunde-buergergeld-2383676",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesregierung – Regelbedarfe 2026"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.arbeitsagentur.de/arbeitslos-arbeit-finden/buergergeld",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesagentur für Arbeit – Bürgergeld"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bmas.de/DE/Arbeit/Grundsicherung-Buergergeld/grundsicherung-buergergeld.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BMAS – Bürgergeld"
          }
        )
      ] })
    ] })
  ] });
}

const $$BuergergeldRechner = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "B\xFCrgergeld-Rechner 2026 \u2013 Regels\xE4tze, Freibetr\xE4ge & KdU berechnen", "description": "Berechne deinen B\xFCrgergeld-Anspruch 2026. Mit aktuellen Regels\xE4tzen (563\u20AC Alleinstehend), Freibetr\xE4gen und Kosten der Unterkunft." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen pb-8"> <!-- Header mit Zurück-Button --> <header class="bg-gradient-to-r from-green-500 to-teal-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-green-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>
Alle Rechner
</a> <div class="flex items-center gap-3"> <span class="text-4xl">🏦</span> <div> <h1 class="text-2xl font-bold">Bürgergeld-Rechner</h1> <p class="text-green-100 text-sm">Regelsätze 2026</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ${renderComponent($$result2, "BuergergeldRechner", BuergergeldRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/BuergergeldRechner", "client:component-export": "default" })} </div> </main> ` })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/buergergeld-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/buergergeld-rechner.astro";
const $$url = "/buergergeld-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$BuergergeldRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
