/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, u as unescapeHTML, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DmT1JwUR.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const VERWANDTSCHAFTSGRADE = [
  { id: "ehepartner", name: "Ehepartner/Lebenspartner", beschreibung: "Eingetragene Lebenspartnerschaft", steuerklasse: "I", freibetrag: 5e5, icon: "💑" },
  { id: "kind", name: "Kind", beschreibung: "Leibliches Kind, Adoptivkind, Stiefkind", steuerklasse: "I", freibetrag: 4e5, icon: "👶" },
  { id: "enkel", name: "Enkel", beschreibung: "Enkelkinder", steuerklasse: "I", freibetrag: 2e5, icon: "👧" },
  { id: "urenkel", name: "Urenkel", beschreibung: "Urenkelin, Urenkel", steuerklasse: "I", freibetrag: 1e5, icon: "👶" },
  { id: "eltern", name: "Eltern", beschreibung: "Mutter, Vater (bei Schenkung: Steuerklasse II!)", steuerklasse: "II", freibetrag: 2e4, icon: "👴" },
  { id: "grosseltern", name: "Großeltern", beschreibung: "Oma, Opa (bei Schenkung: Steuerklasse II!)", steuerklasse: "II", freibetrag: 2e4, icon: "👵" },
  { id: "geschwister", name: "Geschwister", beschreibung: "Bruder, Schwester", steuerklasse: "II", freibetrag: 2e4, icon: "👫" },
  { id: "nichten_neffen", name: "Nichten/Neffen", beschreibung: "Kinder von Geschwistern", steuerklasse: "II", freibetrag: 2e4, icon: "🧒" },
  { id: "stiefeltern", name: "Stiefeltern", beschreibung: "Stiefmutter, Stiefvater", steuerklasse: "II", freibetrag: 2e4, icon: "👨‍👩‍👦" },
  { id: "schwiegereltern", name: "Schwiegereltern", beschreibung: "Schwiegermutter, Schwiegervater", steuerklasse: "II", freibetrag: 2e4, icon: "👵" },
  { id: "schwiegerkinder", name: "Schwiegerkinder", beschreibung: "Schwiegersohn, Schwiegertochter", steuerklasse: "II", freibetrag: 2e4, icon: "👨‍👩‍👧" },
  { id: "geschiedener", name: "Geschiedener Ehepartner", beschreibung: "Ex-Ehepartner", steuerklasse: "II", freibetrag: 2e4, icon: "💔" },
  { id: "lebensgefaehrte", name: "Lebensgefährte (nicht eingetragen)", beschreibung: "Unverheiratet zusammenlebend", steuerklasse: "III", freibetrag: 2e4, icon: "❤️" },
  { id: "sonstige", name: "Sonstige Personen", beschreibung: "Freunde, Bekannte, entfernte Verwandte", steuerklasse: "III", freibetrag: 2e4, icon: "👤" }
];
const STEUERSAETZE = {
  "I": [
    { bis: 75e3, satz: 7 },
    { bis: 3e5, satz: 11 },
    { bis: 6e5, satz: 15 },
    { bis: 6e6, satz: 19 },
    { bis: 13e6, satz: 23 },
    { bis: 26e6, satz: 27 },
    { bis: Infinity, satz: 30 }
  ],
  "II": [
    { bis: 75e3, satz: 15 },
    { bis: 3e5, satz: 20 },
    { bis: 6e5, satz: 25 },
    { bis: 6e6, satz: 30 },
    { bis: 13e6, satz: 35 },
    { bis: 26e6, satz: 40 },
    { bis: Infinity, satz: 43 }
  ],
  "III": [
    { bis: 75e3, satz: 30 },
    { bis: 3e5, satz: 30 },
    { bis: 6e5, satz: 30 },
    { bis: 6e6, satz: 30 },
    { bis: 13e6, satz: 50 },
    { bis: 26e6, satz: 50 },
    { bis: Infinity, satz: 50 }
  ]
};
function SchenkungsteuerRechner() {
  const [schenkungswert, setSchenkungswert] = useState(15e4);
  const [verwandtschaftsgrad, setVerwandtschaftsgrad] = useState("kind");
  const [hatNiessbrauch, setHatNiessbrauch] = useState(false);
  const [niessbrauchWert, setNiessbrauchWert] = useState(3e4);
  const [hatGegenleistung, setHatGegenleistung] = useState(false);
  const [gegenleistung, setGegenleistung] = useState(0);
  const [hatVorschenkungen, setHatVorschenkungen] = useState(false);
  const [vorschenkungen, setVorschenkungen] = useState(0);
  const [zehnJahresFreibetragGenutzt, setZehnJahresFreibetragGenutzt] = useState(0);
  const ergebnis = useMemo(() => {
    const verwandter = VERWANDTSCHAFTSGRADE.find((v) => v.id === verwandtschaftsgrad);
    const steuerklasse = verwandter.steuerklasse;
    const persoenlichFreibetrag = verwandter.freibetrag;
    let bruttoSchenkung = schenkungswert;
    const niessbrauchAbzug = hatNiessbrauch ? niessbrauchWert : 0;
    const gegenleistungAbzug = hatGegenleistung ? gegenleistung : 0;
    const bereinigteSchenkung = Math.max(0, bruttoSchenkung - niessbrauchAbzug - gegenleistungAbzug);
    const vorschenkungswert = hatVorschenkungen ? vorschenkungen : 0;
    const gesamtErwerb = bereinigteSchenkung + vorschenkungswert;
    const verbrauchterFreibetrag = hatVorschenkungen ? zehnJahresFreibetragGenutzt : 0;
    const verfuegbarerFreibetrag = Math.max(0, persoenlichFreibetrag - verbrauchterFreibetrag);
    const steuerpflichtigerErwerb = Math.max(0, gesamtErwerb - verfuegbarerFreibetrag);
    const steuersaetze = STEUERSAETZE[steuerklasse];
    let anwendbarerSteuersatz = 0;
    for (const stufe of steuersaetze) {
      if (steuerpflichtigerErwerb <= stufe.bis) {
        anwendbarerSteuersatz = stufe.satz;
        break;
      }
    }
    const schenkungsteuer = Math.round(steuerpflichtigerErwerb * (anwendbarerSteuersatz / 100));
    const effektiverSteuersatz = bruttoSchenkung > 0 ? (schenkungsteuer / bruttoSchenkung * 100).toFixed(1) : "0.0";
    const nettoGeschenk = bereinigteSchenkung - schenkungsteuer;
    const steuerBeiSchenkerUebernahme = Math.round(schenkungsteuer / (1 - anwendbarerSteuersatz / 100));
    const naechsterFreibetrag = /* @__PURE__ */ new Date();
    naechsterFreibetrag.setFullYear(naechsterFreibetrag.getFullYear() + 10);
    const restfreibetrag = Math.max(0, verfuegbarerFreibetrag - bereinigteSchenkung);
    return {
      // Schenkungswerte
      bruttoSchenkung,
      bereinigteSchenkung,
      gesamtErwerb,
      // Abzüge
      niessbrauchAbzug,
      gegenleistungAbzug,
      // Vorschenkungen
      vorschenkungswert,
      // Freibeträge
      persoenlichFreibetrag,
      verbrauchterFreibetrag,
      verfuegbarerFreibetrag,
      restfreibetrag,
      // Steuerberechnung
      steuerpflichtigerErwerb,
      steuerklasse,
      anwendbarerSteuersatz,
      schenkungsteuer,
      effektiverSteuersatz,
      steuerBeiSchenkerUebernahme,
      // Ergebnis
      nettoGeschenk,
      naechsterFreibetrag,
      // Zusatzinfo
      verwandter
    };
  }, [
    schenkungswert,
    verwandtschaftsgrad,
    hatNiessbrauch,
    niessbrauchWert,
    hatGegenleistung,
    gegenleistung,
    hatVorschenkungen,
    vorschenkungen,
    zehnJahresFreibetragGenutzt
  ]);
  const formatEuro = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";
  const steuerklasseInfo = {
    "I": { name: "Steuerklasse I", beschreibung: "Ehepartner, Kinder, Enkel", color: "green" },
    "II": { name: "Steuerklasse II", beschreibung: "Eltern, Geschwister, Nichten/Neffen", color: "yellow" },
    "III": { name: "Steuerklasse III", beschreibung: "Lebensgefährte, Freunde, Sonstige", color: "red" }
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Wert der Schenkung" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Immobilien, Geldbeträge, Wertpapiere, Firmenbeteiligungen" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: schenkungswert,
              onChange: (e) => setSchenkungswert(Math.max(0, Number(e.target.value))),
              className: "w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 outline-none",
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
            value: Math.min(schenkungswert, 1e6),
            onChange: (e) => setSchenkungswert(Number(e.target.value)),
            className: "w-full mt-3 accent-pink-500",
            min: "0",
            max: "1000000",
            step: "10000"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "0 €" }),
          /* @__PURE__ */ jsx("span", { children: "500.000 €" }),
          /* @__PURE__ */ jsx("span", { children: "1 Mio €" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Verwandtschaftsverhältnis zum Schenker" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Bestimmt Steuerklasse und Freibetrag" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: VERWANDTSCHAFTSGRADE.map((v) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setVerwandtschaftsgrad(v.id),
            className: `py-3 px-4 rounded-xl text-left transition-all ${verwandtschaftsgrad === v.id ? "bg-pink-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xl", children: v.icon }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium text-sm block", children: v.name }),
                /* @__PURE__ */ jsxs("span", { className: `text-xs ${verwandtschaftsgrad === v.id ? "text-pink-100" : "text-gray-400"}`, children: [
                  "Freibetrag: ",
                  formatEuro(v.freibetrag)
                ] })
              ] })
            ] })
          },
          v.id
        )) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: `mb-6 p-4 rounded-xl ${ergebnis.steuerklasse === "I" ? "bg-green-50 border border-green-200" : ergebnis.steuerklasse === "II" ? "bg-yellow-50 border border-yellow-200" : "bg-red-50 border border-red-200"}`, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: `text-xl font-bold px-3 py-1 rounded-lg ${ergebnis.steuerklasse === "I" ? "bg-green-500 text-white" : ergebnis.steuerklasse === "II" ? "bg-yellow-500 text-white" : "bg-red-500 text-white"}`, children: ergebnis.steuerklasse }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: `font-medium ${ergebnis.steuerklasse === "I" ? "text-green-800" : ergebnis.steuerklasse === "II" ? "text-yellow-800" : "text-red-800"}`, children: steuerklasseInfo[ergebnis.steuerklasse].name }),
          /* @__PURE__ */ jsxs("p", { className: `text-xs ${ergebnis.steuerklasse === "I" ? "text-green-600" : ergebnis.steuerklasse === "II" ? "text-yellow-600" : "text-red-600"}`, children: [
            "Steuersätze: ",
            ergebnis.steuerklasse === "I" ? "7% - 30%" : ergebnis.steuerklasse === "II" ? "15% - 43%" : "30% - 50%"
          ] })
        ] })
      ] }) }),
      (verwandtschaftsgrad === "eltern" || verwandtschaftsgrad === "grosseltern") && /* @__PURE__ */ jsx("div", { className: "mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl", children: /* @__PURE__ */ jsxs("p", { className: "text-amber-800 text-sm", children: [
        /* @__PURE__ */ jsx("strong", { children: "⚠️ Achtung:" }),
        " Bei Schenkungen an Eltern oder Großeltern gilt Steuerklasse II (Freibetrag nur 20.000€). Bei ",
        /* @__PURE__ */ jsx("em", { children: "Erbschaft" }),
        " hingegen wäre Steuerklasse I mit 100.000€ Freibetrag anwendbar!"
      ] }) }),
      verwandtschaftsgrad === "lebensgefaehrte" && /* @__PURE__ */ jsx("div", { className: "mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl", children: /* @__PURE__ */ jsxs("p", { className: "text-blue-800 text-sm", children: [
        /* @__PURE__ */ jsx("strong", { children: "💡 Tipp:" }),
        " Unverheiratete Lebensgefährten haben nur 20.000€ Freibetrag und zahlen bis zu 50% Steuer. Eine ",
        /* @__PURE__ */ jsx("strong", { children: "Heirat" }),
        " oder ",
        /* @__PURE__ */ jsx("strong", { children: "eingetragene Lebenspartnerschaft" }),
        "würde den Freibetrag auf 500.000€ erhöhen und die Steuersätze auf 7-30% senken!"
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Optionale Angaben" }) }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: hatNiessbrauch,
                onChange: (e) => setHatNiessbrauch(e.target.checked),
                className: "w-5 h-5 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-800 font-medium", children: "🏠 Nießbrauch / Wohnrecht vorbehalten" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block", children: "Schenker behält Nutzungsrecht (mindert steuerpflichtigen Wert)" })
            ] })
          ] }),
          hatNiessbrauch && /* @__PURE__ */ jsxs("div", { className: "mt-2 pl-8", children: [
            /* @__PURE__ */ jsx("label", { className: "text-sm text-gray-600 block mb-1", children: "Kapitalwert des Nießbrauchs" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: niessbrauchWert,
                onChange: (e) => setNiessbrauchWert(Math.max(0, Number(e.target.value))),
                className: "w-full py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 outline-none",
                placeholder: "Kapitalwert des Nießbrauchs"
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Berechnung: Jahreswert × Vervielfältiger (abhängig vom Alter des Berechtigten)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: hatGegenleistung,
                onChange: (e) => setHatGegenleistung(e.target.checked),
                className: "w-5 h-5 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-800 font-medium", children: "💰 Gegenleistung / Schuldübernahme" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block", children: "z.B. Übernahme von Hypotheken, Pflegeverpflichtung" })
            ] })
          ] }),
          hatGegenleistung && /* @__PURE__ */ jsx("div", { className: "mt-2 pl-8", children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: gegenleistung,
              onChange: (e) => setGegenleistung(Math.max(0, Number(e.target.value))),
              className: "w-full py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 outline-none",
              placeholder: "Wert der Gegenleistung"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: hatVorschenkungen,
                onChange: (e) => setHatVorschenkungen(e.target.checked),
                className: "w-5 h-5 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-800 font-medium", children: "🎁 Vorschenkungen (letzte 10 Jahre)" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block", children: "Frühere Schenkungen vom selben Schenker werden addiert" })
            ] })
          ] }),
          hatVorschenkungen && /* @__PURE__ */ jsxs("div", { className: "mt-2 pl-8 space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm text-gray-600 block mb-1", children: "Summe der Vorschenkungen" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: vorschenkungen,
                  onChange: (e) => setVorschenkungen(Math.max(0, Number(e.target.value))),
                  className: "w-full py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 outline-none",
                  placeholder: "Summe der Vorschenkungen"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm text-gray-600 block mb-1", children: "Davon bereits genutzter Freibetrag" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: zehnJahresFreibetragGenutzt,
                  onChange: (e) => setZehnJahresFreibetragGenutzt(Math.max(0, Math.min(Number(e.target.value), ergebnis.persoenlichFreibetrag))),
                  className: "w-full py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 outline-none",
                  placeholder: "Bereits genutzter Freibetrag"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Freibeträge werden innerhalb von 10 Jahren zusammengerechnet." })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: `rounded-2xl shadow-lg p-6 text-white mb-6 ${ergebnis.schenkungsteuer === 0 ? "bg-gradient-to-br from-green-500 to-emerald-600" : "bg-gradient-to-br from-pink-500 to-rose-600"}`, children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: ergebnis.schenkungsteuer === 0 ? "✓ Keine Schenkungsteuer fällig!" : "🎁 Ihre voraussichtliche Schenkungsteuer" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-baseline gap-2", children: /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuro(ergebnis.schenkungsteuer) }) }),
        ergebnis.schenkungsteuer > 0 && /* @__PURE__ */ jsxs("p", { className: "text-pink-100 mt-2 text-sm", children: [
          "Effektiver Steuersatz: ",
          /* @__PURE__ */ jsxs("strong", { children: [
            ergebnis.effektiverSteuersatz,
            "%"
          ] }),
          " der Bruttoschenkung"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Netto-Geschenk" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.nettoGeschenk) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Steuersatz" }),
          /* @__PURE__ */ jsxs("div", { className: "text-xl font-bold", children: [
            ergebnis.anwendbarerSteuersatz,
            "%"
          ] })
        ] })
      ] }),
      ergebnis.schenkungsteuer === 0 && /* @__PURE__ */ jsx("div", { className: "mt-4 p-3 bg-white/10 rounded-xl", children: /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
        /* @__PURE__ */ jsx("strong", { children: "Glückwunsch!" }),
        " Die Schenkung liegt unter dem verfügbaren Freibetrag von ",
        formatEuro(ergebnis.verfuegbarerFreibetrag),
        " – es fällt keine Schenkungsteuer an."
      ] }) }),
      ergebnis.restfreibetrag > 0 && ergebnis.schenkungsteuer === 0 && /* @__PURE__ */ jsx("div", { className: "mt-3 p-3 bg-white/10 rounded-xl", children: /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
        /* @__PURE__ */ jsx("strong", { children: "💡 Restfreibetrag:" }),
        " Sie haben noch ",
        formatEuro(ergebnis.restfreibetrag),
        " Freibetrag für weitere Schenkungen in den nächsten 10 Jahren übrig."
      ] }) })
    ] }),
    ergebnis.schenkungsteuer > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "💳 Wer zahlt die Schenkungsteuer?" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-700", children: "Beschenkter zahlt" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900", children: formatEuro(ergebnis.schenkungsteuer) }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Gesetzlicher Regelfall" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-pink-50 rounded-xl border border-pink-200", children: [
          /* @__PURE__ */ jsx("p", { className: "font-medium text-pink-700", children: "Schenker übernimmt Steuer" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-pink-900", children: formatEuro(ergebnis.steuerBeiSchenkerUebernahme) }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-pink-600 mt-1", children: "Steuerübernahme = weitere Schenkung!" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600 mt-3", children: [
        /* @__PURE__ */ jsx("strong", { children: "Hinweis:" }),
        " Übernimmt der Schenker die Steuer, gilt dies als zusätzliche Schenkung und erhöht den steuerpflichtigen Wert!"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Berechnungsdetails" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide", children: "Wert der Schenkung" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Brutto-Schenkungswert" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.bruttoSchenkung) })
        ] }),
        ergebnis.niessbrauchAbzug > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-red-600", children: [
          /* @__PURE__ */ jsx("span", { children: "− Nießbrauch/Wohnrecht (Kapitalwert)" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.niessbrauchAbzug) })
        ] }),
        ergebnis.gegenleistungAbzug > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-red-600", children: [
          /* @__PURE__ */ jsx("span", { children: "− Gegenleistung/Schuldübernahme" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.gegenleistungAbzug) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-gray-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "= Bereinigte Schenkung" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.bereinigteSchenkung) })
        ] }),
        ergebnis.vorschenkungswert > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-orange-600", children: [
            /* @__PURE__ */ jsx("span", { children: "+ Vorschenkungen (letzte 10 Jahre)" }),
            /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.vorschenkungswert) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-orange-50 -mx-6 px-6", children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium text-orange-700", children: "= Gesamterwerb" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-orange-900", children: formatEuro(ergebnis.gesamtErwerb) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide pt-4", children: "Freibeträge (§ 16 ErbStG)" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
            "Persönlicher Freibetrag (",
            ergebnis.verwandter.name,
            ")"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatEuro(ergebnis.persoenlichFreibetrag) })
        ] }),
        ergebnis.verbrauchterFreibetrag > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-red-600", children: [
          /* @__PURE__ */ jsx("span", { children: "− Bereits genutzter Freibetrag" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.verbrauchterFreibetrag) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-green-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-green-700", children: "= Verfügbarer Freibetrag" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-green-900", children: formatEuro(ergebnis.verfuegbarerFreibetrag) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide pt-4", children: "Steuerberechnung" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Steuerpflichtiger Erwerb" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.steuerpflichtigerErwerb) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
            "Steuerklasse ",
            ergebnis.steuerklasse
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-900", children: [
            ergebnis.anwendbarerSteuersatz,
            "% Steuersatz"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-3 bg-pink-100 -mx-6 px-6 rounded-b-xl mt-4", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-pink-800", children: "Schenkungsteuer" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-2xl text-pink-900", children: formatEuro(ergebnis.schenkungsteuer) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold mb-3", children: "🔄 Die 10-Jahres-Regel – So planen Sie clever" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          "Schenkungen werden innerhalb von ",
          /* @__PURE__ */ jsx("strong", { children: "10 Jahren zusammengerechnet" }),
          ". Nach 10 Jahren steht der volle Freibetrag erneut zur Verfügung!"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-indigo-100 text-xs mb-2", children: "Beispiel bei Kind (400.000€ Freibetrag):" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [
            /* @__PURE__ */ jsx("div", { children: "Jahr 1: 400.000€" }),
            /* @__PURE__ */ jsx("div", { children: "→ steuerfrei ✓" }),
            /* @__PURE__ */ jsx("div", { children: "Jahr 11: 400.000€" }),
            /* @__PURE__ */ jsx("div", { children: "→ steuerfrei ✓" }),
            /* @__PURE__ */ jsx("div", { children: "Jahr 21: 400.000€" }),
            /* @__PURE__ */ jsx("div", { children: "→ steuerfrei ✓" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-white font-medium mt-2", children: "= 1,2 Mio € steuerfrei über 21 Jahre!" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-indigo-100", children: [
          /* @__PURE__ */ jsx("strong", { children: "Tipp:" }),
          " Beginnen Sie früh mit regelmäßigen Schenkungen, um Vermögen steuerfrei auf die nächste Generation zu übertragen."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📋 Schenkungsteuer-Tabelle 2025/2026" }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-gray-50", children: [
          /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-3 font-medium text-gray-600", children: "Steuerpfl. Erwerb bis" }),
          /* @__PURE__ */ jsx("th", { className: "text-center py-2 px-3 font-medium text-green-600", children: "Kl. I" }),
          /* @__PURE__ */ jsx("th", { className: "text-center py-2 px-3 font-medium text-yellow-600", children: "Kl. II" }),
          /* @__PURE__ */ jsx("th", { className: "text-center py-2 px-3 font-medium text-red-600", children: "Kl. III" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: [
          { bis: "75.000 €", i: 7, ii: 15, iii: 30 },
          { bis: "300.000 €", i: 11, ii: 20, iii: 30 },
          { bis: "600.000 €", i: 15, ii: 25, iii: 30 },
          { bis: "6.000.000 €", i: 19, ii: 30, iii: 30 },
          { bis: "13.000.000 €", i: 23, ii: 35, iii: 50 },
          { bis: "26.000.000 €", i: 27, ii: 40, iii: 50 },
          { bis: "darüber", i: 30, ii: 43, iii: 50 }
        ].map((row, idx) => /* @__PURE__ */ jsxs("tr", { className: idx % 2 === 0 ? "bg-white" : "bg-gray-50", children: [
          /* @__PURE__ */ jsx("td", { className: "py-2 px-3 text-gray-700", children: row.bis }),
          /* @__PURE__ */ jsxs("td", { className: "py-2 px-3 text-center text-green-700", children: [
            row.i,
            "%"
          ] }),
          /* @__PURE__ */ jsxs("td", { className: "py-2 px-3 text-center text-yellow-700", children: [
            row.ii,
            "%"
          ] }),
          /* @__PURE__ */ jsxs("td", { className: "py-2 px-3 text-center text-red-700", children: [
            row.iii,
            "%"
          ] })
        ] }, idx)) })
      ] }) }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-3", children: "Quelle: § 19 ErbStG – Die Steuer wird auf den gesamten steuerpflichtigen Erwerb mit dem jeweiligen Steuersatz berechnet." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert die Schenkungsteuer" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Gleiches Gesetz:" }),
            " Schenkung- und Erbschaftsteuer sind im selben Gesetz (ErbStG) geregelt"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Freibeträge:" }),
            " Identisch zur Erbschaftsteuer – 500.000€ für Ehepartner, 400.000€ für Kinder"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "10-Jahres-Rhythmus:" }),
            " Freibeträge können alle 10 Jahre neu genutzt werden"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Wichtiger Unterschied:" }),
            " Bei Schenkung an Eltern gilt Steuerklasse II (nicht I wie bei Erbschaft!)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Nießbrauch:" }),
            " Vorbehalt von Nutzungsrechten mindert den steuerpflichtigen Wert"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Steuerschuldner:" }),
            " Grundsätzlich der Beschenkte, aber oft übernimmt der Schenker"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-pink-50 border border-pink-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-pink-800 mb-3", children: "💰 Freibeträge bei Schenkung 2025/2026" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-green-600 font-medium", children: "Ehepartner/Lebenspartner" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-green-800", children: "500.000 €" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: "Steuerklasse I" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-green-600 font-medium", children: "Kinder" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-green-800", children: "400.000 €" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: "Steuerklasse I" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-green-600 font-medium", children: "Enkel" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-green-800", children: "200.000 €" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: "Steuerklasse I" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-green-600 font-medium", children: "Urenkel" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-green-800", children: "100.000 €" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: "Steuerklasse I" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-yellow-600 font-medium", children: "Eltern / Großeltern" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-yellow-800", children: "20.000 €" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: "Steuerklasse II (bei Schenkung!)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-yellow-600 font-medium", children: "Geschwister / Nichten / Neffen" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-yellow-800", children: "20.000 €" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: "Steuerklasse II" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-3 sm:col-span-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-red-600 font-medium", children: "Lebensgefährte / Freunde / Sonstige" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-red-800", children: "20.000 €" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: "Steuerklasse III – bis 50% Steuer!" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-amber-800 mb-3", children: "⚠️ Wichtige Hinweise" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-amber-700", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Anzeigepflicht:" }),
            " Schenkungen müssen innerhalb von 3 Monaten dem Finanzamt gemeldet werden"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Formvorschrift:" }),
            " Schenkung von Immobilien erfordert notarielle Beurkundung"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Rückforderung:" }),
            " Der Schenker kann bei Verarmung die Schenkung zurückfordern (§ 528 BGB)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Pflichtteil:" }),
            " Schenkungen können den Pflichtteil der Erben ergänzen (10-Jahres-Frist)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Sozialamt:" }),
            " Bei Pflegebedürftigkeit können Schenkungen der letzten 10 Jahre zurückgefordert werden"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Steuerberater:" }),
            " Bei größeren Schenkungen unbedingt professionelle Beratung einholen!"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörde" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-pink-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-pink-900", children: "Schenkungsteuer-Finanzamt" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-pink-700 mt-1", children: "Zuständig ist das Finanzamt am Wohnsitz des Schenkers. In den meisten Bundesländern gibt es zentrale Erbschaft-/Schenkungsteuer-Finanzämter." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📱" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "ELSTER Portal" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.elster.de",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "Schenkungsteuererklärung online →"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📋" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Anzeigefrist" }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "3 Monate nach Schenkung" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📝" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Wichtige Formulare" }),
            /* @__PURE__ */ jsxs("ul", { className: "text-gray-600 mt-1 space-y-1", children: [
              /* @__PURE__ */ jsx("li", { children: "• Anzeige einer Schenkung (formlos oder Vordruck)" }),
              /* @__PURE__ */ jsx("li", { children: "• Schenkungsteuererklärung (wenn vom FA angefordert)" }),
              /* @__PURE__ */ jsx("li", { children: "• Anlage Steuerbefreiung Familienheim (falls zutreffend)" })
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
            href: "https://www.gesetze-im-internet.de/erbstg_1974/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Erbschaftsteuer- und Schenkungsteuergesetz (ErbStG)"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/bewg/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bewertungsgesetz (BewG) – Vermögensbewertung"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bundesfinanzministerium.de/Web/DE/Themen/Steuern/Steuerarten/Erbschaft_Schenkungsteuer/erbschaft_schenkungsteuer.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BMF – Erbschaft- und Schenkungsteuer"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.steuertipps.de/erbschaft-schenkung",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Steuertipps.de – Ratgeber Schenkung"
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
const $$SchenkungsteuerRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "Schenkungsteuer-Rechner 2025/2026 \u2013 Steuer, Freibetr\xE4ge & 10-Jahres-Regel";
  const description = "Schenkungsteuer Rechner 2025: Berechnen Sie die Steuer auf Schenkungen online. Mit Freibetr\xE4gen nach Verwandtschaftsgrad, Steuerklassen & der 10-Jahres-Regel. Kostenlos!";
  const keywords = "Schenkungsteuer Rechner, Schenkungsteuer berechnen, Schenkung Freibetrag, Schenkungsteuer 2025, Schenkungsteuer 2026, Schenkung versteuern, Schenkungsteuer Tabelle, Schenkungsteuer Kinder, Schenkungsteuer Enkel, Freibetrag Schenkung, Schenkung Immobilie Steuer, 10-Jahres-Regel Schenkung, Schenkungsteuer umgehen, Schenkung steuerfrei";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<main class="min-h-screen pb-8"> <!-- Header mit Zur\xFCck-Button --> <header class="bg-gradient-to-r from-pink-500 to-rose-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-pink-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>\nAlle Rechner\n</a> <div class="flex items-center gap-3"> <span class="text-4xl">\u{1F381}</span> <div> <h1 class="text-2xl font-bold">Schenkungsteuer-Rechner</h1> <p class="text-pink-100 text-sm">Steuer auf Schenkungen & Freibetr\xE4ge 2025/2026</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ', ' </div> <!-- SEO Content Section --> <div class="max-w-2xl mx-auto px-4 mt-8"> <div class="bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">Schenkungsteuer in Deutschland: Alles was Sie wissen m\xFCssen</h2> <div class="prose prose-sm text-gray-600 space-y-4"> <p>\nDie <strong>Schenkungsteuer</strong> wird f\xE4llig, wenn Verm\xF6gen zu Lebzeiten \xFCbertragen wird. \n            Mit unserem <strong>Schenkungsteuer-Rechner</strong> k\xF6nnen Sie schnell und einfach berechnen, \n            wie viel Steuer auf Ihre Schenkung anf\xE4llt \u2013 unter Ber\xFCcksichtigung aller Freibetr\xE4ge, \n            Steuerklassen und der wichtigen <strong>10-Jahres-Regel</strong>.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Was ist die Schenkungsteuer?</h3> <p>\nDie Schenkungsteuer ist eine Steuer auf freigiebige Zuwendungen unter Lebenden. Sie ist im\n<strong>Erbschaftsteuer- und Schenkungsteuergesetz (ErbStG)</strong> geregelt \u2013 zusammen mit \n            der Erbschaftsteuer. Beide Steuerarten verwenden dieselben Steuers\xE4tze und Freibetr\xE4ge, \n            mit einigen wichtigen Unterschieden.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Unterschied Schenkungsteuer vs. Erbschaftsteuer</h3> <p>\nDer wichtigste Unterschied: Bei <strong>Schenkung an Eltern oder Gro\xDFeltern</strong> gilt \n            Steuerklasse II (nur 20.000\u20AC Freibetrag), w\xE4hrend bei Erbschaft Steuerklasse I (100.000\u20AC \n            Freibetrag) anwendbar w\xE4re. Auch der Versorgungsfreibetrag f\xFCr Ehepartner und Kinder \n            entf\xE4llt bei Schenkungen.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Die 10-Jahres-Regel \u2013 Der Schl\xFCssel zur Steueroptimierung</h3> <p>\nDie <strong>10-Jahres-Regel</strong> ist das wichtigste Instrument zur legalen Minimierung \n            der Schenkungsteuer:\n</p> <ul class="list-disc pl-5 space-y-1"> <li>Freibetr\xE4ge k\xF6nnen <strong>alle 10 Jahre</strong> erneut genutzt werden</li> <li>Schenkungen innerhalb von 10 Jahren werden zusammengerechnet</li> <li>Nach 10 Jahren "verfallen" fr\xFChere Schenkungen steuerlich</li> <li>Fr\xFChzeitiges Schenken erm\xF6glicht steuerfreie Verm\xF6gens\xFCbertragung \xFCber Generationen</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Beispiel: 1,2 Millionen steuerfrei schenken</h3> <p>\nEin Elternteil kann seinem Kind alle 10 Jahre <strong>400.000\u20AC steuerfrei</strong> schenken. \n            \xDCber 30 Jahre sind das 1,2 Millionen Euro ohne einen Cent Schenkungsteuer! Bei zwei Elternteilen \n            verdoppelt sich dieser Betrag auf <strong>2,4 Millionen Euro</strong>.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Freibetr\xE4ge bei der Schenkungsteuer 2025</h3> <ul class="list-disc pl-5 space-y-1"> <li><strong>Ehepartner/Lebenspartner:</strong> 500.000 \u20AC (Steuerklasse I)</li> <li><strong>Kinder:</strong> 400.000 \u20AC pro Kind (Steuerklasse I)</li> <li><strong>Enkel:</strong> 200.000 \u20AC (Steuerklasse I)</li> <li><strong>Urenkel:</strong> 100.000 \u20AC (Steuerklasse I)</li> <li><strong>Eltern/Gro\xDFeltern:</strong> 20.000 \u20AC (Steuerklasse II bei Schenkung!)</li> <li><strong>Geschwister:</strong> 20.000 \u20AC (Steuerklasse II)</li> <li><strong>Lebensgef\xE4hrte:</strong> 20.000 \u20AC (Steuerklasse III \u2013 bis 50% Steuer!)</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Steuerklassen und Steuers\xE4tze</h3> <p>\nDie H\xF6he der Schenkungsteuer h\xE4ngt von der <strong>Steuerklasse</strong> und dem \n            steuerpflichtigen Betrag ab:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Steuerklasse I (7-30%):</strong> Ehepartner, Kinder, Enkel</li> <li><strong>Steuerklasse II (15-43%):</strong> Eltern (bei Schenkung!), Geschwister, Nichten/Neffen</li> <li><strong>Steuerklasse III (30-50%):</strong> Lebensgef\xE4hrte, Freunde, alle anderen</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Schenkung mit Nie\xDFbrauch \u2013 Steuerwert mindern</h3> <p>\nBei der Schenkung einer Immobilie kann der Schenker sich ein <strong>Nie\xDFbrauchrecht</strong>\noder Wohnrecht vorbehalten. Der Kapitalwert dieses Rechts mindert den steuerpflichtigen \n            Wert der Schenkung. So k\xF6nnen auch wertvolle Immobilien oft steuerfrei \xFCbertragen werden.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wer muss die Schenkungsteuer zahlen?</h3> <p>\nGrunds\xE4tzlich ist der <strong>Beschenkte</strong> steuerpflichtig. Allerdings kann auch der \n            Schenker die Steuer \xFCbernehmen \u2013 Vorsicht: Dies gilt dann als zus\xE4tzliche Schenkung und \n            erh\xF6ht den steuerpflichtigen Wert!\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Anzeigepflicht beim Finanzamt</h3> <p>\nSchenkungen m\xFCssen dem Finanzamt <strong>innerhalb von 3 Monaten</strong> angezeigt werden \n            (\xA7 30 ErbStG). Auch wenn keine Steuer anf\xE4llt, besteht diese Anzeigepflicht! Bei notariellen \n            Schenkungen (z.B. Immobilien) \xFCbernimmt der Notar diese Meldung.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Schenkungsteuer vermeiden: Legale Strategien</h3> <ul class="list-disc pl-5 space-y-1"> <li><strong>10-Jahres-Rhythmus nutzen:</strong> Regelm\xE4\xDFige Schenkungen planen</li> <li><strong>Nie\xDFbrauch vereinbaren:</strong> Mindert den steuerpflichtigen Wert</li> <li><strong>Kettenschenkung:</strong> \xDCber mehrere Generationen schenken</li> <li><strong>Gelegenheitsgeschenke:</strong> Angemessene Geschenke zu Anl\xE4ssen sind steuerfrei</li> <li><strong>Heirat:</strong> Freibetrag springt von 20.000\u20AC auf 500.000\u20AC!</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Vorsicht: R\xFCckforderung durch Sozialamt</h3> <p>\nWird der Schenker innerhalb von <strong>10 Jahren</strong> nach der Schenkung pflegebed\xFCrftig \n            und bezieht Sozialhilfe, kann das Sozialamt die Schenkung zur\xFCckfordern (\xA7 528 BGB). \n            Dies sollte bei der Planung unbedingt ber\xFCcksichtigt werden!\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Schenkung vs. Erbschaft: Was ist g\xFCnstiger?</h3> <p>\nIn den meisten F\xE4llen ist die <strong>fr\xFChzeitige Schenkung</strong> steuerlich g\xFCnstiger, \n            da die 10-Jahres-Freibetr\xE4ge mehrfach genutzt werden k\xF6nnen. Allerdings sollten auch \n            Aspekte wie Pflichtteilserg\xE4nzung, R\xFCckforderungsrisiken und die pers\xF6nliche Absicherung \n            des Schenkers ber\xFCcksichtigt werden.\n</p> </div> </div> </div> </main>  <script type="application/ld+json">', '<\/script>  <script type="application/ld+json">', "<\/script> "])), maybeRenderHead(), renderComponent($$result2, "SchenkungsteuerRechner", SchenkungsteuerRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/SchenkungsteuerRechner", "client:component-export": "default" }), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Schenkungsteuer-Rechner 2025",
    "description": description,
    "url": "https://deutschland-rechner.de/schenkungsteuer-rechner",
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
        "name": "Wie hoch ist der Freibetrag bei der Schenkungsteuer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Die Freibetr\xE4ge bei der Schenkungsteuer sind: Ehepartner 500.000\u20AC, Kinder 400.000\u20AC, Enkel 200.000\u20AC, Eltern und Geschwister nur 20.000\u20AC (Steuerklasse II), Lebensgef\xE4hrte und Freunde 20.000\u20AC (Steuerklasse III). Die Freibetr\xE4ge k\xF6nnen alle 10 Jahre erneut genutzt werden."
        }
      },
      {
        "@type": "Question",
        "name": "Wie funktioniert die 10-Jahres-Regel bei Schenkungen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Die 10-Jahres-Regel besagt, dass Schenkungen vom selben Schenker innerhalb von 10 Jahren zusammengerechnet werden. Der Freibetrag gilt also f\xFCr alle Schenkungen innerhalb dieses Zeitraums zusammen. Nach 10 Jahren steht der volle Freibetrag erneut zur Verf\xFCgung."
        }
      },
      {
        "@type": "Question",
        "name": "Muss ich eine Schenkung dem Finanzamt melden?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, Schenkungen m\xFCssen innerhalb von 3 Monaten dem Finanzamt angezeigt werden (\xA7 30 ErbStG). Dies gilt auch, wenn keine Steuer anf\xE4llt, da der Freibetrag ausreicht. Bei notariellen Schenkungen (z.B. Immobilien) \xFCbernimmt der Notar diese Meldepflicht."
        }
      },
      {
        "@type": "Question",
        "name": "Wie kann ich Schenkungsteuer legal vermeiden?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Legale Strategien zur Schenkungsteuer-Vermeidung: 1) Freibetr\xE4ge alle 10 Jahre nutzen, 2) Nie\xDFbrauch oder Wohnrecht vereinbaren (mindert den steuerpflichtigen Wert), 3) Kettenschenkungen \xFCber mehrere Generationen, 4) Bei Lebensgef\xE4hrten: Heirat erh\xF6ht den Freibetrag von 20.000\u20AC auf 500.000\u20AC."
        }
      },
      {
        "@type": "Question",
        "name": "Wer zahlt die Schenkungsteuer \u2013 Schenker oder Beschenkter?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Grunds\xE4tzlich ist der Beschenkte steuerpflichtig. Der Schenker kann die Steuer aber \xFCbernehmen \u2013 Achtung: Dies gilt dann als zus\xE4tzliche Schenkung und erh\xF6ht den steuerpflichtigen Wert! Beide haften gesamtschuldnerisch."
        }
      },
      {
        "@type": "Question",
        "name": "Was ist der Unterschied zwischen Schenkungsteuer und Erbschaftsteuer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Der wichtigste Unterschied: Bei Schenkung an Eltern/Gro\xDFeltern gilt Steuerklasse II (20.000\u20AC Freibetrag), bei Erbschaft jedoch Steuerklasse I (100.000\u20AC Freibetrag). Au\xDFerdem gibt es bei Schenkungen keinen Versorgungsfreibetrag f\xFCr Ehepartner und Kinder."
        }
      }
    ]
  }))) })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/schenkungsteuer-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/schenkungsteuer-rechner.astro";
const $$url = "/schenkungsteuer-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$SchenkungsteuerRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
