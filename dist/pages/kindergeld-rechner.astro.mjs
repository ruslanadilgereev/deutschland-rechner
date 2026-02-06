/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_v22DC8tm.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
export { renderers } from '../renderers.mjs';

const KINDERGELD_PRO_KIND = 259;
function KindergeldRechner() {
  const [anzahlKinder, setAnzahlKinder] = useState(1);
  const monatlich = anzahlKinder * KINDERGELD_PRO_KIND;
  const jaehrlich = monatlich * 12;
  return /* @__PURE__ */ jsxs("div", { className: "max-w-lg mx-auto", children: [
    /* @__PURE__ */ jsx("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: /* @__PURE__ */ jsxs("label", { className: "block mb-4", children: [
      /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Anzahl Kinder" }),
      /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center justify-center gap-6", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setAnzahlKinder(Math.max(1, anzahlKinder - 1)),
            className: "w-14 h-14 rounded-full bg-gray-100 text-2xl font-bold text-gray-600 hover:bg-gray-200 active:scale-95 transition-all",
            disabled: anzahlKinder <= 1,
            children: "−"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold text-blue-600 w-20 text-center", children: anzahlKinder }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setAnzahlKinder(Math.min(10, anzahlKinder + 1)),
            className: "w-14 h-14 rounded-full bg-blue-500 text-2xl font-bold text-white hover:bg-blue-600 active:scale-95 transition-all",
            children: "+"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-blue-100 mb-1", children: "Dein Kindergeld" }),
      /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-4xl font-bold", children: monatlich.toLocaleString("de-DE") }),
        /* @__PURE__ */ jsx("span", { className: "text-xl text-blue-200", children: "€ / Monat" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsx("span", { className: "text-blue-100", children: "Pro Jahr" }),
        /* @__PURE__ */ jsxs("span", { className: "text-xl font-bold", children: [
          jaehrlich.toLocaleString("de-DE"),
          " €"
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 bg-white rounded-2xl shadow-lg p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert's" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "259 € pro Kind" }),
            " pro Monat (Stand: 2026)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Gilt für ",
            /* @__PURE__ */ jsx("strong", { children: "alle Kinder gleich" }),
            " (keine Staffelung mehr)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Anspruch bis zum ",
            /* @__PURE__ */ jsx("strong", { children: "18. Lebensjahr" }),
            " (in Ausbildung bis 25)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Auszahlung durch die ",
            /* @__PURE__ */ jsx("strong", { children: "Familienkasse" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 bg-white rounded-2xl shadow-lg p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörde" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-blue-900", children: "Familienkasse der Bundesagentur für Arbeit" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-700 mt-1", children: "Bundesweit einheitlich zuständig – unabhängig vom Bundesland" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Kindergeld-Hotline" }),
              /* @__PURE__ */ jsx("a", { href: "tel:08004555530", className: "text-blue-600 hover:underline font-mono", children: "0800 4 555530" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Kostenfrei · Mo–Fr 8–18 Uhr" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Online-Antrag" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.arbeitsagentur.de/familie-und-kinder/infos-rund-um-kindergeld/kindergeld-anspruch-hoehe-dauer/kindergeld-antrag-starten",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "Jetzt beantragen →"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Digital mit BundID" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📍" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Familienkasse vor Ort finden" }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "https://www.arbeitsagentur.de/ueber-uns/familienkasse-der-ba",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "text-blue-600 hover:underline",
                children: "Standortsuche öffnen →"
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 bg-white rounded-2xl shadow-lg p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "📋 Wichtige Hinweise" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-yellow-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "⚠️" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-yellow-800", children: "Antrag erforderlich!" }),
            /* @__PURE__ */ jsx("p", { className: "text-yellow-700", children: "Kindergeld wird nicht automatisch gezahlt – du musst es bei der Familienkasse beantragen." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-green-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "✅" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-green-800", children: "Rückwirkend beantragbar" }),
            /* @__PURE__ */ jsx("p", { className: "text-green-700", children: "Bis zu 6 Monate rückwirkend ab Antragstellung." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-blue-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📄" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-blue-800", children: "Benötigte Unterlagen" }),
            /* @__PURE__ */ jsx("p", { className: "text-blue-700", children: "Geburtsurkunde des Kindes, Steuer-ID (Kind + Eltern), ggf. Ausbildungsnachweis ab 18." })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 p-4 bg-gray-50 rounded-xl", children: [
      /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-gray-500 uppercase mb-2", children: "Quellen" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.arbeitsagentur.de/familie-und-kinder/infos-rund-um-kindergeld/kindergeld-anspruch-hoehe-dauer",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesagentur für Arbeit – Kindergeld 2026"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://familienportal.de/familienportal/familienleistungen/kindergeld",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Familienportal der Bundesregierung – Kindergeld"
          }
        )
      ] })
    ] })
  ] });
}

const $$KindergeldRechner = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Kindergeld-Rechner 2026", "description": "Kindergeld berechnen 2026: 259\u20AC pro Kind pro Monat. Kostenloser Kindergeld-Rechner mit aktuellen S\xE4tzen, Antrag-Infos und Familienkasse-Kontakt.", "keywords": "Kindergeld Rechner, Kindergeld 2026, Kindergeld H\xF6he, Kindergeld berechnen, Kindergeld beantragen, Familienkasse, 259 Euro Kindergeld" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen pb-8"> <!-- Header mit Zurück-Button --> <header class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>
Alle Rechner
</a> <div class="flex items-center gap-3"> <span class="text-4xl">👶</span> <div> <h1 class="text-2xl font-bold">Kindergeld-Rechner</h1> <p class="text-blue-100 text-sm">Stand: 2026</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ${renderComponent($$result2, "KindergeldRechner", KindergeldRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/KindergeldRechner", "client:component-export": "default" })} </div> </main> ` })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/kindergeld-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/kindergeld-rechner.astro";
const $$url = "/kindergeld-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$KindergeldRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
