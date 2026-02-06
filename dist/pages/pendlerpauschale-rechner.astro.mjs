/* empty css                                          */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_C8dcKtIt.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DgvP8Zjv.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const PAUSCHALE_2026 = {
  km_einheitlich: 0.38,
  // 38 Cent ab dem ERSTEN km (neu ab 2026!)
  arbeitstage_max: 230
  // Maximal anerkannte Arbeitstage
};
function PendlerpauschaleRechner() {
  const [entfernung, setEntfernung] = useState(25);
  const [arbeitstage, setArbeitstage] = useState(220);
  const [homeoffice, setHomeoffice] = useState(0);
  const [steuersatz, setSteuersatz] = useState(35);
  const ergebnis = useMemo(() => {
    const effektiveArbeitstage = Math.min(arbeitstage - homeoffice, PAUSCHALE_2026.arbeitstage_max);
    const pauschaleProTag = entfernung * PAUSCHALE_2026.km_einheitlich;
    const jahresPauschale = Math.round(pauschaleProTag * effektiveArbeitstage);
    const werbungskostenpauschale = 1230;
    const ueberschuss = Math.max(0, jahresPauschale - werbungskostenpauschale);
    const steuerersparnis = Math.round(ueberschuss * (steuersatz / 100));
    const effektiveErsparnis = jahresPauschale > werbungskostenpauschale ? steuerersparnis : 0;
    return {
      pauschaleProTag: Math.round(pauschaleProTag * 100) / 100,
      jahresPauschale,
      effektiveArbeitstage,
      werbungskostenpauschale,
      ueberschuss,
      steuerersparnis: effektiveErsparnis,
      lohntSich: jahresPauschale > werbungskostenpauschale
    };
  }, [entfernung, arbeitstage, homeoffice, steuersatz]);
  const formatEuro = (n) => n.toLocaleString("de-DE") + " €";
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Einfache Entfernung zur Arbeit" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 ml-2", children: "(kürzeste Straßenverbindung)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: entfernung,
              onChange: (e) => setEntfernung(Math.max(1, Number(e.target.value))),
              className: "w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
              min: "1"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl", children: "km" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            min: "1",
            max: "100",
            value: entfernung,
            onChange: (e) => setEntfernung(Number(e.target.value)),
            className: "w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Arbeitstage pro Jahr" }) }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-2", children: [200, 210, 220, 230].map((tage) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setArbeitstage(tage),
            className: `py-3 rounded-xl font-bold transition-all ${arbeitstage === tage ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: tage
          },
          tage
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Homeoffice-Tage pro Jahr" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 ml-2", children: "(abziehen von Arbeitstagen)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: homeoffice,
              onChange: (e) => setHomeoffice(Math.max(0, Math.min(arbeitstage, Number(e.target.value)))),
              className: "w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
              min: "0",
              max: arbeitstage
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400", children: "Tage" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-2", children: "ℹ️ Homeoffice-Pauschale: 6 €/Tag (max. 1.260 €/Jahr) – wird separat geltend gemacht" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Dein Grenzsteuersatz" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 ml-2", children: "(ca. 25-42%)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              min: "0",
              max: "45",
              value: steuersatz,
              onChange: (e) => setSteuersatz(Number(e.target.value)),
              className: "flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "w-16 text-center font-bold text-xl text-blue-600", children: [
            steuersatz,
            "%"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-blue-100 mb-1", children: "Deine Pendlerpauschale" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuro(ergebnis.jahresPauschale) }),
          /* @__PURE__ */ jsx("span", { className: "text-xl text-blue-200", children: "/ Jahr" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-blue-100 mt-2", children: [
          ergebnis.effektiveArbeitstage,
          " Tage × ",
          ergebnis.pauschaleProTag.toFixed(2),
          " € = ",
          formatEuro(ergebnis.jahresPauschale)
        ] })
      ] }),
      ergebnis.lohntSich && /* @__PURE__ */ jsx("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-blue-100", children: [
          "💰 Steuerersparnis (bei ",
          steuersatz,
          "%)"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "text-xl font-bold", children: [
          "ca. ",
          formatEuro(ergebnis.steuerersparnis)
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Berechnung" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
            entfernung,
            " km × 0,38 € × ",
            ergebnis.effektiveArbeitstage,
            " Tage"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-bold", children: formatEuro(ergebnis.jahresPauschale) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-200 bg-blue-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Pendlerpauschale gesamt" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold", children: formatEuro(ergebnis.jahresPauschale) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-gray-500", children: [
          /* @__PURE__ */ jsx("span", { children: "Werbungskostenpauschale (automatisch)" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "− ",
            formatEuro(ergebnis.werbungskostenpauschale)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `flex justify-between py-3 -mx-6 px-6 rounded-b-2xl ${ergebnis.lohntSich ? "bg-green-50" : "bg-yellow-50"}`, children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold", children: "Zusätzlich absetzbar" }),
          /* @__PURE__ */ jsx("span", { className: `font-bold ${ergebnis.lohntSich ? "text-green-600" : "text-yellow-600"}`, children: ergebnis.lohntSich ? formatEuro(ergebnis.ueberschuss) : "0 € (unter Pauschale)" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert's (2026)" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "🆕" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "38 Cent/km ab dem ersten Kilometer" }),
            " – neu seit 01.01.2026!"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Nur die ",
            /* @__PURE__ */ jsx("strong", { children: "einfache Strecke" }),
            " zählt (nicht Hin + Rück)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Max. ",
            /* @__PURE__ */ jsx("strong", { children: "230 Arbeitstage" }),
            " werden anerkannt"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Gilt unabhängig vom ",
            /* @__PURE__ */ jsx("strong", { children: "Verkehrsmittel" }),
            " (Auto, Bahn, Fahrrad...)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Werbungskostenpauschale" }),
            ": 1.230 € automatisch abgezogen"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 p-3 bg-green-50 rounded-xl text-sm", children: /* @__PURE__ */ jsxs("p", { className: "text-green-800", children: [
        /* @__PURE__ */ jsx("strong", { children: "💡 Neu 2026:" }),
        " Die Erhöhung auf 38 Cent ab dem ersten Kilometer entlastet besonders Pendler mit kürzeren Strecken (unter 20 km) – eine Verbesserung gegenüber 2025!"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "📋 Wichtige Hinweise" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-yellow-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "⚠️" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-yellow-800", children: "Werbungskostenpauschale beachten!" }),
            /* @__PURE__ */ jsx("p", { className: "text-yellow-700", children: "Die ersten 1.230 € sind bereits durch die Pauschale abgedeckt. Nur darüber hinaus gibt's Steuerersparnis." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-green-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "✅" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-green-800", children: "Kürzeste Straßenverbindung" }),
            /* @__PURE__ */ jsx("p", { className: "text-green-700", children: "Das Finanzamt akzeptiert die kürzeste Straßenroute, nicht die schnellste. Google Maps hilft!" })
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
            href: "https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/das-aendert-sich-2026.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesfinanzministerium – Steuerliche Änderungen 2026"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/autokosten/pendlerpauschale/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "ADAC – Pendlerpauschale 2026"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.vlh.de/arbeiten-pendeln/pendeln/die-pendlerpauschale-fuer-einsteiger.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "VLH – Pendlerpauschale für Einsteiger"
          }
        )
      ] })
    ] })
  ] });
}

const $$PendlerpauschaleRechner = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Pendlerpauschale-Rechner 2026 \u2013 Einheitlich 38 Cent/km berechnen", "description": "Berechne deine Pendlerpauschale 2026. Neu: 38 Cent ab dem ERSTEN Kilometer! Inklusive Homeoffice-Abzug und Steuerersparnis-Berechnung." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen pb-8"> <!-- Header mit Zurück-Button --> <header class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>
Alle Rechner
</a> <div class="flex items-center gap-3"> <span class="text-4xl">🚗</span> <div> <h1 class="text-2xl font-bold">Pendlerpauschale-Rechner</h1> <p class="text-blue-100 text-sm">Entfernungspauschale 2026 – Neu: 38 Cent/km ab km 1!</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ${renderComponent($$result2, "PendlerpauschaleRechner", PendlerpauschaleRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/PendlerpauschaleRechner", "client:component-export": "default" })} </div> </main> ` })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/pendlerpauschale-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/pendlerpauschale-rechner.astro";
const $$url = "/pendlerpauschale-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$PendlerpauschaleRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
