/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, u as unescapeHTML, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_v22DC8tm.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const MWST_SAETZE = [
  { wert: 19, label: "19% Regelsteuersatz", beispiele: "Elektronik, Kleidung, Möbel, Autos, Dienstleistungen" },
  { wert: 7, label: "7% ermäßigter Satz", beispiele: "Lebensmittel, Bücher, Zeitungen, ÖPNV, Hotels" },
  { wert: 0, label: "0% steuerfrei", beispiele: "Exporte, innergemeinschaftliche Lieferungen, medizinische Leistungen" }
];
function MehrwertsteuerRechner() {
  const [betrag, setBetrag] = useState(100);
  const [mwstSatz, setMwstSatz] = useState(19);
  const [richtung, setRichtung] = useState("netto-zu-brutto");
  const ergebnis = useMemo(() => {
    const satzDecimal = mwstSatz / 100;
    if (richtung === "netto-zu-brutto") {
      const netto = betrag;
      const mwstBetrag = netto * satzDecimal;
      const brutto = netto + mwstBetrag;
      return { netto, brutto, mwstBetrag };
    } else {
      const brutto = betrag;
      const netto = brutto / (1 + satzDecimal);
      const mwstBetrag = brutto - netto;
      return { netto, brutto, mwstBetrag };
    }
  }, [betrag, mwstSatz, richtung]);
  const formatEuro = (n) => n.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + " €";
  return /* @__PURE__ */ jsxs("div", { className: "max-w-lg mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-gray-700 font-medium mb-3", children: "Berechnungsrichtung" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setRichtung("netto-zu-brutto"),
              className: `p-4 rounded-xl border-2 transition-all ${richtung === "netto-zu-brutto" ? "border-yellow-500 bg-yellow-50 text-yellow-700" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"}`,
              children: [
                /* @__PURE__ */ jsx("div", { className: "text-2xl mb-1", children: "➕" }),
                /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold", children: "Netto → Brutto" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs mt-1 opacity-75", children: "MwSt aufschlagen" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setRichtung("brutto-zu-netto"),
              className: `p-4 rounded-xl border-2 transition-all ${richtung === "brutto-zu-netto" ? "border-yellow-500 bg-yellow-50 text-yellow-700" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"}`,
              children: [
                /* @__PURE__ */ jsx("div", { className: "text-2xl mb-1", children: "➖" }),
                /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold", children: "Brutto → Netto" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs mt-1 opacity-75", children: "MwSt herausrechnen" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "block mb-6", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-gray-700 font-medium", children: [
          richtung === "netto-zu-brutto" ? "Nettobetrag" : "Bruttobetrag",
          " (€)"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-2 relative", children: /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            value: betrag,
            onChange: (e) => setBetrag(Math.max(0, parseFloat(e.target.value) || 0)),
            className: "w-full px-4 py-3 text-2xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none",
            step: "0.01",
            min: "0"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-2", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-gray-700 font-medium mb-3", children: "MwSt-Satz" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: MWST_SAETZE.map((satz) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setMwstSatz(satz.wert),
            className: `w-full p-4 rounded-xl border-2 text-left transition-all ${mwstSatz === satz.wert ? "border-yellow-500 bg-yellow-50" : "border-gray-200 hover:border-gray-300"}`,
            children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: `font-bold ${mwstSatz === satz.wert ? "text-yellow-700" : "text-gray-800"}`, children: satz.label }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: satz.beispiele })
              ] }),
              /* @__PURE__ */ jsx("div", { className: `w-5 h-5 rounded-full border-2 flex items-center justify-center ${mwstSatz === satz.wert ? "border-yellow-500 bg-yellow-500" : "border-gray-300"}`, children: mwstSatz === satz.wert && /* @__PURE__ */ jsx("svg", { className: "w-3 h-3 text-white", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }) }) })
            ] })
          },
          satz.wert
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg p-6 text-white mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-yellow-100 mb-4", children: "Ergebnis" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("div", { className: "text-yellow-100 text-sm mb-1", children: richtung === "netto-zu-brutto" ? "Bruttobetrag" : "Nettobetrag" }),
        /* @__PURE__ */ jsx("div", { className: "flex items-baseline gap-2", children: /* @__PURE__ */ jsx("span", { className: "text-4xl font-bold", children: formatEuro(richtung === "netto-zu-brutto" ? ergebnis.brutto : ergebnis.netto) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-yellow-100", children: "Nettobetrag" }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: formatEuro(ergebnis.netto) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-yellow-100", children: [
            "+ ",
            mwstSatz,
            "% MwSt"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: formatEuro(ergebnis.mwstBetrag) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border-t border-white/20 pt-3 flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-yellow-100 font-medium", children: "= Bruttobetrag" }),
          /* @__PURE__ */ jsx("span", { className: "text-xl font-bold", children: formatEuro(ergebnis.brutto) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "📐 Verwendete Formeln" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-gray-700 mb-2", children: "Netto → Brutto (MwSt aufschlagen):" }),
          /* @__PURE__ */ jsxs("code", { className: "block bg-gray-100 p-2 rounded text-gray-800 font-mono text-xs", children: [
            "Brutto = Netto × (1 + MwSt-Satz)",
            /* @__PURE__ */ jsx("br", {}),
            "Brutto = Netto × 1,",
            mwstSatz.toString().padStart(2, "0")
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-gray-700 mb-2", children: "Brutto → Netto (MwSt herausrechnen):" }),
          /* @__PURE__ */ jsxs("code", { className: "block bg-gray-100 p-2 rounded text-gray-800 font-mono text-xs", children: [
            "Netto = Brutto ÷ (1 + MwSt-Satz)",
            /* @__PURE__ */ jsx("br", {}),
            "Netto = Brutto ÷ 1,",
            mwstSatz.toString().padStart(2, "0")
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ Wann gilt welcher Steuersatz?" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-yellow-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-yellow-800 mb-2", children: "19% Regelsteuersatz" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-1 text-yellow-700", children: [
            /* @__PURE__ */ jsx("li", { children: "• Elektronik, Computer, Smartphones" }),
            /* @__PURE__ */ jsx("li", { children: "• Kleidung, Schuhe, Accessoires" }),
            /* @__PURE__ */ jsx("li", { children: "• Möbel, Haushaltsgeräte" }),
            /* @__PURE__ */ jsx("li", { children: "• Autos, Fahrräder" }),
            /* @__PURE__ */ jsx("li", { children: "• Handwerker- & Dienstleistungen" }),
            /* @__PURE__ */ jsx("li", { children: "• Restaurantbesuche (Speisen vor Ort)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-green-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-green-800 mb-2", children: "7% ermäßigter Satz" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-1 text-green-700", children: [
            /* @__PURE__ */ jsx("li", { children: "• Lebensmittel (außer Getränke & Luxus)" }),
            /* @__PURE__ */ jsx("li", { children: "• Bücher, Zeitungen, Zeitschriften" }),
            /* @__PURE__ */ jsx("li", { children: "• Öffentlicher Nahverkehr (bis 50 km)" }),
            /* @__PURE__ */ jsx("li", { children: "• Hotelübernachtungen" }),
            /* @__PURE__ */ jsx("li", { children: "• Kulturveranstaltungen, Kino" }),
            /* @__PURE__ */ jsx("li", { children: "• Speisen zum Mitnehmen" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-blue-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-blue-800 mb-2", children: "0% Steuerbefreit" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-1 text-blue-700", children: [
            /* @__PURE__ */ jsx("li", { children: "• Exporte außerhalb der EU" }),
            /* @__PURE__ */ jsx("li", { children: "• Innergemeinschaftliche Lieferungen" }),
            /* @__PURE__ */ jsx("li", { children: "• Medizinische Heilbehandlungen" }),
            /* @__PURE__ */ jsx("li", { children: "• Bankdienstleistungen" }),
            /* @__PURE__ */ jsx("li", { children: "• Versicherungsleistungen" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörde" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-blue-900", children: "Finanzamt" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-700 mt-1", children: "Die Umsatzsteuer wird an das zuständige Finanzamt abgeführt." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Steuer-Hotline" }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Wende dich an dein lokales Finanzamt" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Kontakt auf Steuerbescheid" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "ELSTER Online" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.elster.de",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "elster.de →"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Umsatzsteuer-Voranmeldung" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "📋 Wichtige Hinweise" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-yellow-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "💡" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-yellow-800", children: "MwSt = Umsatzsteuer" }),
            /* @__PURE__ */ jsx("p", { className: "text-yellow-700", children: "Mehrwertsteuer (MwSt) und Umsatzsteuer (USt) sind dasselbe – umgangssprachlich wird oft MwSt verwendet." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-green-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🧾" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-green-800", children: "Vorsteuerabzug für Unternehmer" }),
            /* @__PURE__ */ jsx("p", { className: "text-green-700", children: "Als Unternehmer kannst du die gezahlte MwSt als Vorsteuer vom Finanzamt zurückholen." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-blue-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🏪" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-blue-800", children: "Kleinunternehmerregelung" }),
            /* @__PURE__ */ jsx("p", { className: "text-blue-700", children: "Bei Umsatz unter 25.000 € (2025+) kannst du dich von der USt befreien lassen (§19 UStG)." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-purple-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🇪🇺" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-purple-800", children: "EU-Handel beachten" }),
            /* @__PURE__ */ jsx("p", { className: "text-purple-700", children: "Bei Geschäften innerhalb der EU gelten besondere Regeln (Reverse-Charge, OSS)." })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "⚡ Schnellübersicht (19% MwSt)" }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-200", children: [
          /* @__PURE__ */ jsx("th", { className: "text-left py-2 text-gray-600", children: "Netto" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-2 text-gray-600", children: "+ MwSt" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-2 text-gray-600", children: "= Brutto" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-100", children: [10, 50, 100, 500, 1e3].map((netto) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50", children: [
          /* @__PURE__ */ jsxs("td", { className: "py-2 font-medium", children: [
            netto.toLocaleString("de-DE"),
            " €"
          ] }),
          /* @__PURE__ */ jsxs("td", { className: "py-2 text-right text-gray-600", children: [
            (netto * 0.19).toLocaleString("de-DE", { minimumFractionDigits: 2 }),
            " €"
          ] }),
          /* @__PURE__ */ jsxs("td", { className: "py-2 text-right font-semibold text-yellow-600", children: [
            (netto * 1.19).toLocaleString("de-DE", { minimumFractionDigits: 2 }),
            " €"
          ] })
        ] }, netto)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 p-4 bg-gray-50 rounded-xl", children: [
      /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-gray-500 uppercase mb-2", children: "Quellen" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/ustg_1980/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Umsatzsteuergesetz (UStG) – Gesetze im Internet"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bundesfinanzministerium.de/Web/DE/Themen/Steuern/Steuerarten/Umsatzsteuer/umsatzsteuer.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesfinanzministerium – Umsatzsteuer"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.ihk.de/themen/steuern/umsatzsteuer",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "IHK – Umsatzsteuer für Unternehmen"
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
const $$MehrwertsteuerRechner = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Mehrwertsteuer-Rechner 2025 | MwSt berechnen \u2013 Netto \u2194 Brutto", "description": "MwSt-Rechner 2025: Mehrwertsteuer schnell berechnen. Netto zu Brutto oder Brutto zu Netto umrechnen. 19% Regelsteuersatz, 7% erm\xE4\xDFigt. Kostenlos & einfach.", "keywords": "MwSt Rechner, Mehrwertsteuer Rechner, Umsatzsteuer Rechner, Netto Brutto Rechner, MwSt berechnen, 19 Prozent Rechner, 7 Prozent MwSt, Brutto Netto umrechnen, USt Rechner, Mehrwertsteuer 2025" }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<main class="min-h-screen pb-8"> <!-- Header mit Zur\xFCck-Button --> <header class="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-yellow-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>\nAlle Rechner\n</a> <div class="flex items-center gap-3"> <span class="text-4xl">\u{1F9FE}</span> <div> <h1 class="text-2xl font-bold">Mehrwertsteuer-Rechner</h1> <p class="text-yellow-100 text-sm">MwSt berechnen: Netto \u2194 Brutto</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ', ' </div> </main>  <script type="application/ld+json">', "<\/script> "])), maybeRenderHead(), renderComponent($$result2, "MehrwertsteuerRechner", MehrwertsteuerRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/MehrwertsteuerRechner", "client:component-export": "default" }), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Mehrwertsteuer-Rechner",
    "description": "Kostenloser MwSt-Rechner: Berechne Mehrwertsteuer f\xFCr 19% und 7%. Netto zu Brutto oder Brutto zu Netto umrechnen.",
    "url": "https://deutschland-rechner.de/mehrwertsteuer-rechner",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    },
    "featureList": [
      "Netto zu Brutto berechnen",
      "Brutto zu Netto berechnen",
      "19% Regelsteuersatz",
      "7% erm\xE4\xDFigter Steuersatz",
      "Kostenlos ohne Anmeldung"
    ]
  }))) })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/mehrwertsteuer-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/mehrwertsteuer-rechner.astro";
const $$url = "/mehrwertsteuer-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$MehrwertsteuerRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
