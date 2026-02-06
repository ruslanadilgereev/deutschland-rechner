/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_v22DC8tm.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const BUNDESLAENDER = [
  { kuerzel: "BW", name: "Baden-Württemberg", satz: 5 },
  { kuerzel: "BY", name: "Bayern", satz: 3.5 },
  { kuerzel: "BE", name: "Berlin", satz: 6 },
  { kuerzel: "BB", name: "Brandenburg", satz: 6.5 },
  { kuerzel: "HB", name: "Bremen", satz: 5.5 },
  // Erhöht von 5,0% am 01.07.2025
  { kuerzel: "HH", name: "Hamburg", satz: 5.5 },
  { kuerzel: "HE", name: "Hessen", satz: 6 },
  { kuerzel: "MV", name: "Mecklenburg-Vorpommern", satz: 6 },
  { kuerzel: "NI", name: "Niedersachsen", satz: 5 },
  { kuerzel: "NW", name: "Nordrhein-Westfalen", satz: 6.5 },
  { kuerzel: "RP", name: "Rheinland-Pfalz", satz: 5 },
  { kuerzel: "SL", name: "Saarland", satz: 6.5 },
  { kuerzel: "SN", name: "Sachsen", satz: 5.5 },
  { kuerzel: "ST", name: "Sachsen-Anhalt", satz: 5 },
  { kuerzel: "SH", name: "Schleswig-Holstein", satz: 6.5 },
  { kuerzel: "TH", name: "Thüringen", satz: 5 }
];
function GrunderwerbsteuerRechner() {
  const [kaufpreis, setKaufpreis] = useState(35e4);
  const [bundesland, setBundesland] = useState("BY");
  const ergebnis = useMemo(() => {
    const land = BUNDESLAENDER.find((bl) => bl.kuerzel === bundesland);
    const steuer = Math.round(kaufpreis * (land.satz / 100));
    return {
      land,
      steuer,
      kaufpreis
    };
  }, [kaufpreis, bundesland]);
  const formatEuro = (n) => n.toLocaleString("de-DE") + " €";
  const sortiert = [...BUNDESLAENDER].sort((a, b) => a.satz - b.satz);
  const guenstigster = sortiert[0];
  const teuerster = sortiert[sortiert.length - 1];
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Kaufpreis der Immobilie" }) }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: kaufpreis,
              onChange: (e) => setKaufpreis(Math.max(0, Number(e.target.value))),
              className: "w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-0 outline-none",
              min: "0",
              step: "10000"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl", children: "€" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            min: "50000",
            max: "1500000",
            step: "10000",
            value: kaufpreis,
            onChange: (e) => setKaufpreis(Number(e.target.value)),
            className: "w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "50.000 €" }),
          /* @__PURE__ */ jsx("span", { children: "1.500.000 €" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Bundesland" }) }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: bundesland,
            onChange: (e) => setBundesland(e.target.value),
            className: "w-full text-lg py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-0 outline-none bg-white",
            children: BUNDESLAENDER.map((bl) => /* @__PURE__ */ jsxs("option", { value: bl.kuerzel, children: [
              bl.name,
              " (",
              bl.satz,
              "%)"
            ] }, bl.kuerzel))
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg p-6 text-white mb-6", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-sm font-medium text-yellow-100 mb-1", children: [
        "Grunderwerbsteuer in ",
        ergebnis.land.name
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-baseline gap-2", children: /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuro(ergebnis.steuer) }) }),
        /* @__PURE__ */ jsxs("p", { className: "text-yellow-100 mt-2", children: [
          "= ",
          ergebnis.land.satz,
          "% von ",
          formatEuro(kaufpreis)
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "🗺️ Vergleich aller Bundesländer" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2", children: sortiert.map((bl) => {
        const steuer = Math.round(kaufpreis * (bl.satz / 100));
        const istAktuell = bl.kuerzel === bundesland;
        const differenz = steuer - ergebnis.steuer;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: `flex items-center justify-between p-3 rounded-xl transition-colors ${istAktuell ? "bg-yellow-50 border-2 border-yellow-300" : "bg-gray-50 hover:bg-gray-100"}`,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxs("span", { className: `w-12 text-center font-bold text-sm rounded-lg py-1 ${bl.satz === guenstigster.satz ? "bg-green-100 text-green-700" : bl.satz === teuerster.satz ? "bg-red-100 text-red-700" : "bg-gray-200 text-gray-600"}`, children: [
                  bl.satz,
                  "%"
                ] }),
                /* @__PURE__ */ jsx("span", { className: `font-medium ${istAktuell ? "text-yellow-800" : "text-gray-700"}`, children: bl.name })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsx("span", { className: `font-bold ${istAktuell ? "text-yellow-600" : "text-gray-900"}`, children: formatEuro(steuer) }),
                !istAktuell && differenz !== 0 && /* @__PURE__ */ jsxs("span", { className: `text-xs ml-2 ${differenz > 0 ? "text-red-500" : "text-green-500"}`, children: [
                  differenz > 0 ? "+" : "",
                  formatEuro(differenz)
                ] })
              ] })
            ]
          },
          bl.kuerzel
        );
      }) }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 p-3 bg-green-50 rounded-xl text-sm", children: /* @__PURE__ */ jsxs("p", { className: "text-green-800", children: [
        /* @__PURE__ */ jsx("strong", { children: "💡 Tipp:" }),
        " In ",
        guenstigster.name,
        " zahlst du nur ",
        guenstigster.satz,
        "% – bei ",
        formatEuro(kaufpreis),
        " sind das ",
        formatEuro(Math.round(kaufpreis * guenstigster.satz / 100)),
        "(Ersparnis vs. ",
        teuerster.name,
        ": ",
        formatEuro(Math.round(kaufpreis * (teuerster.satz - guenstigster.satz) / 100)),
        ")"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert's" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Einmalige Steuer" }),
            " beim Kauf einer Immobilie oder eines Grundstücks"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Steuersatz variiert nach ",
            /* @__PURE__ */ jsx("strong", { children: "Bundesland" }),
            " (3,5% – 6,5%)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Berechnung auf ",
            /* @__PURE__ */ jsx("strong", { children: "Kaufpreis oder Verkehrswert" }),
            " (bei Schenkung)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Zahlung fällig nach Erhalt des ",
            /* @__PURE__ */ jsx("strong", { children: "Steuerbescheids" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörde" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-yellow-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-yellow-900", children: "Finanzamt am Standort der Immobilie" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-yellow-700 mt-1", children: "Nicht dein Wohnort-Finanzamt, sondern wo die Immobilie liegt!" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📄" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Ablauf" }),
            /* @__PURE__ */ jsxs("ol", { className: "text-gray-600 mt-1 list-decimal list-inside space-y-1", children: [
              /* @__PURE__ */ jsx("li", { children: "Notar meldet den Kauf ans Finanzamt" }),
              /* @__PURE__ */ jsx("li", { children: "Finanzamt sendet Steuerbescheid (ca. 2-8 Wochen)" }),
              /* @__PURE__ */ jsx("li", { children: "Zahlung innerhalb 4 Wochen" }),
              /* @__PURE__ */ jsx("li", { children: "Unbedenklichkeitsbescheinigung für Grundbucheintrag" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "💰 Förderprogramme für Erstkäufer" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-blue-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🏠" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-blue-800", children: "Hessengeld (seit März 2024)" }),
            /* @__PURE__ */ jsxs("p", { className: "text-blue-700", children: [
              "Erstkäufer in Hessen können bis zu ",
              /* @__PURE__ */ jsx("strong", { children: "10.000 € pro Erwachsenen" }),
              " und ",
              /* @__PURE__ */ jsx("strong", { children: "5.000 € pro Kind" }),
              " zurückbekommen – max. die gezahlte Grunderwerbsteuer. Auszahlung in 10 Jahresraten."
            ] }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "https://finanzen.hessen.de/initiativen/hessengeld",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "text-blue-600 hover:underline mt-1 inline-block",
                children: "→ Antrag stellen"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-green-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌲" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-green-800", children: "Thüringen: Niedrigster Steuersatz in Ostdeutschland" }),
            /* @__PURE__ */ jsxs("p", { className: "text-green-700", children: [
              "Seit 1. Januar 2024 gilt in Thüringen nur noch ",
              /* @__PURE__ */ jsx("strong", { children: "5,0% Grunderwerbsteuer" }),
              " (gesenkt von 6,5%) – der niedrigste Satz aller ostdeutschen Bundesländer."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs mt-2", children: "⚠️ NRW.Zuschuss Wohneigentum ist seit Ende 2024 eingestellt." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "📋 Wichtige Hinweise" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-yellow-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "⚠️" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-yellow-800", children: "Keine Grundbucheintragung ohne Zahlung!" }),
            /* @__PURE__ */ jsx("p", { className: "text-yellow-700", children: "Das Eigentum geht erst mit der Unbedenklichkeitsbescheinigung auf dich über." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-green-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "✅" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-green-800", children: "Ausnahmen möglich" }),
            /* @__PURE__ */ jsx("p", { className: "text-green-700", children: "Erbschaft, Schenkung an Verwandte 1. Grades, Erwerb unter 2.500 € sind steuerfrei." })
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
            href: "https://www.bundesfinanzministerium.de/Web/DE/Themen/Steuern/Steuerarten/Grundsteuer_Grunderwerbsteuer/Grundsteuer_Grunderwerbsteuer.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesfinanzministerium – Grundsteuer & Grunderwerbsteuer"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.finanztip.de/grunderwerbsteuer/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Finanztip – Grunderwerbsteuer Ratgeber (Stand: Feb 2026)"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/grestg_1983/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Grunderwerbsteuergesetz (GrEStG) – Gesetze im Internet"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://de.wikipedia.org/wiki/Grunderwerbsteuer_(Deutschland)",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Wikipedia – Grunderwerbsteuer (Deutschland)"
          }
        )
      ] })
    ] })
  ] });
}

const $$GrunderwerbsteuerRechner = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Grunderwerbsteuer-Rechner 2026", "description": "Berechne die Grunderwerbsteuer 2026 beim Immobilienkauf. Vergleich aller 16 Bundesl\xE4nder (3,5% Bayern bis 6,5% NRW). Inkl. F\xF6rderprogramme: Hessengeld bis 30.000\u20AC, Th\xFCringen 25.000\u20AC Freibetrag f\xFCr Erstk\xE4ufer." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen pb-8"> <!-- Header mit Zurück-Button --> <header class="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-yellow-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>
Alle Rechner
</a> <div class="flex items-center gap-3"> <span class="text-4xl">🏗️</span> <div> <h1 class="text-2xl font-bold">Grunderwerbsteuer-Rechner</h1> <p class="text-yellow-100 text-sm">Alle 16 Bundesländer im Vergleich</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ${renderComponent($$result2, "GrunderwerbsteuerRechner", GrunderwerbsteuerRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/GrunderwerbsteuerRechner", "client:component-export": "default" })} </div> </main> ` })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/grunderwerbsteuer-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/grunderwerbsteuer-rechner.astro";
const $$url = "/grunderwerbsteuer-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$GrunderwerbsteuerRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
