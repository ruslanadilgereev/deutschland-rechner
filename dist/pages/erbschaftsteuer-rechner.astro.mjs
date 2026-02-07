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
  { id: "enkel_eltern_verstorben", name: "Enkel (Eltern verstorben)", beschreibung: "Wenn das Elternteil bereits verstorben ist", steuerklasse: "I", freibetrag: 4e5, icon: "👧" },
  { id: "enkel", name: "Enkel", beschreibung: "Enkelkinder bei lebenden Eltern", steuerklasse: "I", freibetrag: 2e5, icon: "👧" },
  { id: "urenkel", name: "Urenkel / Eltern", beschreibung: "Urenkel, Eltern des Erblassers", steuerklasse: "I", freibetrag: 1e5, icon: "👴" },
  { id: "geschwister", name: "Geschwister", beschreibung: "Bruder, Schwester", steuerklasse: "II", freibetrag: 2e4, icon: "👫" },
  { id: "nichten_neffen", name: "Nichten/Neffen", beschreibung: "Kinder von Geschwistern", steuerklasse: "II", freibetrag: 2e4, icon: "🧒" },
  { id: "stiefeltern", name: "Stiefeltern", beschreibung: "Stiefmutter, Stiefvater", steuerklasse: "II", freibetrag: 2e4, icon: "👨‍👩‍👦" },
  { id: "schwiegereltern", name: "Schwiegereltern", beschreibung: "Schwiegermutter, Schwiegervater", steuerklasse: "II", freibetrag: 2e4, icon: "👵" },
  { id: "schwiegerkinder", name: "Schwiegerkinder", beschreibung: "Schwiegersohn, Schwiegertochter", steuerklasse: "II", freibetrag: 2e4, icon: "👨‍👩‍👧" },
  { id: "geschiedener", name: "Geschiedener Ehepartner", beschreibung: "Ex-Ehepartner", steuerklasse: "II", freibetrag: 2e4, icon: "💔" },
  { id: "sonstige", name: "Sonstige Personen", beschreibung: "Freunde, entfernte Verwandte, Lebensgefährte (nicht eingetragen)", steuerklasse: "III", freibetrag: 2e4, icon: "👤" }
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
const VERSORGUNGSFREIBETRAEGE = {
  "ehepartner": 256e3,
  "kind_bis_5": 52e3,
  "kind_6_10": 41e3,
  "kind_11_15": 30700,
  "kind_16_20": 20500,
  "kind_21_27": 10300
};
const HAUSRATFREIBETRAG_I = 41e3;
const HAUSRATFREIBETRAG_II_III = 12e3;
const BEWEGLICHE_GEGENSTAENDE_FREIBETRAG = 12e3;
function ErbschaftsteuerRechner() {
  const [erbschaftswert, setErbschaftswert] = useState(25e4);
  const [verwandtschaftsgrad, setVerwandtschaftsgrad] = useState("kind");
  const [hatHausrat, setHatHausrat] = useState(false);
  const [hausratWert, setHausratWert] = useState(2e4);
  const [hatBeweglicheGegenstaende, setHatBeweglicheGegenstaende] = useState(false);
  const [beweglicheWert, setBeweglicheWert] = useState(1e4);
  const [istKind, setIstKind] = useState(false);
  const [kindesalter, setKindesalter] = useState(10);
  const [hatVorherigeBelastungen, setHatVorherigeBelastungen] = useState(false);
  const [belastungen, setBelastungen] = useState(0);
  const [hatVorschenkungen, setHatVorschenkungen] = useState(false);
  const [vorschenkungen, setVorschenkungen] = useState(0);
  const ergebnis = useMemo(() => {
    const verwandter = VERWANDTSCHAFTSGRADE.find((v) => v.id === verwandtschaftsgrad);
    const steuerklasse = verwandter.steuerklasse;
    const persoenlichFreibetrag = verwandter.freibetrag;
    let bruttoErbschaft = erbschaftswert;
    let hausratFreibetrag = 0;
    if (hatHausrat) {
      const maxHausrat = steuerklasse === "I" ? HAUSRATFREIBETRAG_I : HAUSRATFREIBETRAG_II_III;
      hausratFreibetrag = Math.min(hausratWert, maxHausrat);
      bruttoErbschaft += hausratWert;
    }
    let beweglicheFreibetrag = 0;
    if (hatBeweglicheGegenstaende) {
      beweglicheFreibetrag = Math.min(beweglicheWert, BEWEGLICHE_GEGENSTAENDE_FREIBETRAG);
      bruttoErbschaft += beweglicheWert;
    }
    const abzugsfaehigeBelastungen = hatVorherigeBelastungen ? belastungen : 0;
    const bestattungspauschale = 10300;
    const gesamtBelastungen = Math.max(abzugsfaehigeBelastungen, bestattungspauschale);
    const nettoErbschaft = Math.max(0, bruttoErbschaft - gesamtBelastungen);
    const vorschenkungswert = hatVorschenkungen ? vorschenkungen : 0;
    const gesamtErwerb = nettoErbschaft + vorschenkungswert;
    let versorgungsfreibetrag = 0;
    if (steuerklasse === "I") {
      if (verwandtschaftsgrad === "ehepartner") {
        versorgungsfreibetrag = VERSORGUNGSFREIBETRAEGE.ehepartner;
      } else if (istKind && (verwandtschaftsgrad === "kind" || verwandtschaftsgrad === "enkel_eltern_verstorben")) {
        if (kindesalter <= 5) versorgungsfreibetrag = VERSORGUNGSFREIBETRAEGE.kind_bis_5;
        else if (kindesalter <= 10) versorgungsfreibetrag = VERSORGUNGSFREIBETRAEGE.kind_6_10;
        else if (kindesalter <= 15) versorgungsfreibetrag = VERSORGUNGSFREIBETRAEGE.kind_11_15;
        else if (kindesalter <= 20) versorgungsfreibetrag = VERSORGUNGSFREIBETRAEGE.kind_16_20;
        else if (kindesalter <= 27) versorgungsfreibetrag = VERSORGUNGSFREIBETRAEGE.kind_21_27;
      }
    }
    const gesamtSachfreibetraege = hausratFreibetrag + beweglicheFreibetrag;
    const gesamteFreibetraege = persoenlichFreibetrag + versorgungsfreibetrag + gesamtSachfreibetraege;
    const steuerpflichtigerErwerb = Math.max(0, gesamtErwerb - gesamteFreibetraege);
    const steuersaetze = STEUERSAETZE[steuerklasse];
    let anwendbarerSteuersatz = 0;
    for (const stufe of steuersaetze) {
      if (steuerpflichtigerErwerb <= stufe.bis) {
        anwendbarerSteuersatz = stufe.satz;
        break;
      }
    }
    const erbschaftsteuer = Math.round(steuerpflichtigerErwerb * (anwendbarerSteuersatz / 100));
    const effektiverSteuersatz = bruttoErbschaft > 0 ? (erbschaftsteuer / bruttoErbschaft * 100).toFixed(1) : "0.0";
    const nettoErbe = bruttoErbschaft - erbschaftsteuer;
    return {
      // Erbschaftswerte
      bruttoErbschaft,
      nettoErbschaft,
      gesamtErwerb,
      // Belastungen
      gesamtBelastungen,
      bestattungspauschale,
      abzugsfaehigeBelastungen,
      // Vorschenkungen
      vorschenkungswert,
      // Freibeträge
      persoenlichFreibetrag,
      versorgungsfreibetrag,
      hausratFreibetrag,
      beweglicheFreibetrag,
      gesamtSachfreibetraege,
      gesamteFreibetraege,
      // Steuerberechnung
      steuerpflichtigerErwerb,
      steuerklasse,
      anwendbarerSteuersatz,
      erbschaftsteuer,
      effektiverSteuersatz,
      // Ergebnis
      nettoErbe,
      // Zusatzinfo
      verwandter
    };
  }, [
    erbschaftswert,
    verwandtschaftsgrad,
    hatHausrat,
    hausratWert,
    hatBeweglicheGegenstaende,
    beweglicheWert,
    istKind,
    kindesalter,
    hatVorherigeBelastungen,
    belastungen,
    hatVorschenkungen,
    vorschenkungen
  ]);
  const formatEuro = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";
  const steuerklasseInfo = {
    "I": { name: "Steuerklasse I", beschreibung: "Ehepartner, Kinder, Enkel", color: "green" },
    "II": { name: "Steuerklasse II", beschreibung: "Geschwister, Nichten/Neffen, Schwiegereltern", color: "yellow" },
    "III": { name: "Steuerklasse III", beschreibung: "Alle anderen Personen", color: "red" }
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Wert der Erbschaft" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Immobilien, Geldvermögen, Wertpapiere, Firmenbeteiligungen" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: erbschaftswert,
              onChange: (e) => setErbschaftswert(Math.max(0, Number(e.target.value))),
              className: "w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none",
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
            value: Math.min(erbschaftswert, 2e6),
            onChange: (e) => setErbschaftswert(Number(e.target.value)),
            className: "w-full mt-3 accent-emerald-500",
            min: "0",
            max: "2000000",
            step: "10000"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "0 €" }),
          /* @__PURE__ */ jsx("span", { children: "1 Mio €" }),
          /* @__PURE__ */ jsx("span", { children: "2 Mio €" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Verwandtschaftsverhältnis zum Erblasser" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Bestimmt Steuerklasse und Freibetrag" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: VERWANDTSCHAFTSGRADE.map((v) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              setVerwandtschaftsgrad(v.id);
              if (v.id !== "kind" && v.id !== "enkel_eltern_verstorben") {
                setIstKind(false);
              }
            },
            className: `py-3 px-4 rounded-xl text-left transition-all ${verwandtschaftsgrad === v.id ? "bg-emerald-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xl", children: v.icon }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium text-sm block", children: v.name }),
                /* @__PURE__ */ jsxs("span", { className: `text-xs ${verwandtschaftsgrad === v.id ? "text-emerald-100" : "text-gray-400"}`, children: [
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
      (verwandtschaftsgrad === "kind" || verwandtschaftsgrad === "enkel_eltern_verstorben") && /* @__PURE__ */ jsxs("div", { className: "mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl", children: [
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: istKind,
              onChange: (e) => setIstKind(e.target.checked),
              className: "w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-blue-800 font-medium", children: "Minderjähriges Kind (Versorgungsfreibetrag)" })
        ] }),
        istKind && /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm text-blue-700 block mb-2", children: "Alter des Kindes" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "range",
                value: kindesalter,
                onChange: (e) => setKindesalter(Number(e.target.value)),
                className: "flex-1 accent-blue-500",
                min: "0",
                max: "27",
                step: "1"
              }
            ),
            /* @__PURE__ */ jsxs("span", { className: "text-lg font-bold text-blue-800 w-16 text-center", children: [
              kindesalter,
              " Jahre"
            ] })
          ] }),
          kindesalter <= 27 && /* @__PURE__ */ jsxs("p", { className: "text-sm text-blue-600 mt-2", children: [
            "→ Versorgungsfreibetrag: ",
            /* @__PURE__ */ jsx("strong", { children: formatEuro(ergebnis.versorgungsfreibetrag) })
          ] })
        ] })
      ] }),
      verwandtschaftsgrad === "ehepartner" && /* @__PURE__ */ jsxs("div", { className: "mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-blue-800", children: [
          /* @__PURE__ */ jsx("strong", { children: "Versorgungsfreibetrag:" }),
          " Als Ehepartner erhalten Sie automatisch einen zusätzlichen Versorgungsfreibetrag von ",
          /* @__PURE__ */ jsx("strong", { children: formatEuro(256e3) }),
          "."
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-600 mt-1", children: "Dieser wird um den Kapitalwert eventuell bezogener Versorgungsbezüge (z.B. Witwenrente) gekürzt." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Weitere Vermögenswerte & Abzüge" }) }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: hatHausrat,
                onChange: (e) => setHatHausrat(e.target.checked),
                className: "w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-800 font-medium", children: "🏠 Hausrat" }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500 block", children: [
                "Möbel, Wäsche, Haushaltsgeräte (Freibetrag bis ",
                formatEuro(ergebnis.steuerklasse === "I" ? 41e3 : 12e3),
                ")"
              ] })
            ] })
          ] }),
          hatHausrat && /* @__PURE__ */ jsx("div", { className: "mt-2 pl-8", children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: hausratWert,
              onChange: (e) => setHausratWert(Math.max(0, Number(e.target.value))),
              className: "w-full py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none",
              placeholder: "Wert des Hausrats"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: hatBeweglicheGegenstaende,
                onChange: (e) => setHatBeweglicheGegenstaende(e.target.checked),
                className: "w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-800 font-medium", children: "💎 Andere bewegliche Gegenstände" }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500 block", children: [
                "Schmuck, Kunstwerke, Sammlungen (Freibetrag bis ",
                formatEuro(12e3),
                ")"
              ] })
            ] })
          ] }),
          hatBeweglicheGegenstaende && /* @__PURE__ */ jsx("div", { className: "mt-2 pl-8", children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: beweglicheWert,
              onChange: (e) => setBeweglicheWert(Math.max(0, Number(e.target.value))),
              className: "w-full py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none",
              placeholder: "Wert der Gegenstände"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: hatVorherigeBelastungen,
                onChange: (e) => setHatVorherigeBelastungen(e.target.checked),
                className: "w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-800 font-medium", children: "📉 Nachlassverbindlichkeiten" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block", children: "Schulden des Erblassers, Bestattungskosten über 10.300€" })
            ] })
          ] }),
          hatVorherigeBelastungen && /* @__PURE__ */ jsx("div", { className: "mt-2 pl-8", children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: belastungen,
              onChange: (e) => setBelastungen(Math.max(0, Number(e.target.value))),
              className: "w-full py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none",
              placeholder: "Summe der Verbindlichkeiten"
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
                className: "w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-800 font-medium", children: "🎁 Vorschenkungen" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block", children: "Schenkungen der letzten 10 Jahre werden hinzugerechnet" })
            ] })
          ] }),
          hatVorschenkungen && /* @__PURE__ */ jsxs("div", { className: "mt-2 pl-8", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: vorschenkungen,
                onChange: (e) => setVorschenkungen(Math.max(0, Number(e.target.value))),
                className: "w-full py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none",
                placeholder: "Summe der Vorschenkungen"
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Schenkungen innerhalb von 10 Jahren vor dem Erbfall zehren den Freibetrag auf." })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: `rounded-2xl shadow-lg p-6 text-white mb-6 ${ergebnis.erbschaftsteuer === 0 ? "bg-gradient-to-br from-green-500 to-emerald-600" : "bg-gradient-to-br from-emerald-500 to-teal-600"}`, children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: ergebnis.erbschaftsteuer === 0 ? "✓ Keine Erbschaftsteuer fällig!" : "📜 Ihre voraussichtliche Erbschaftsteuer" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-baseline gap-2", children: /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuro(ergebnis.erbschaftsteuer) }) }),
        ergebnis.erbschaftsteuer > 0 && /* @__PURE__ */ jsxs("p", { className: "text-emerald-100 mt-2 text-sm", children: [
          "Effektiver Steuersatz: ",
          /* @__PURE__ */ jsxs("strong", { children: [
            ergebnis.effektiverSteuersatz,
            "%"
          ] }),
          " der Gesamterbschaft"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Netto-Erbe" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.nettoErbe) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Steuersatz" }),
          /* @__PURE__ */ jsxs("div", { className: "text-xl font-bold", children: [
            ergebnis.anwendbarerSteuersatz,
            "%"
          ] })
        ] })
      ] }),
      ergebnis.erbschaftsteuer === 0 && /* @__PURE__ */ jsx("div", { className: "mt-4 p-3 bg-white/10 rounded-xl", children: /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
        /* @__PURE__ */ jsx("strong", { children: "Glückwunsch!" }),
        " Der gesamte Erwerb liegt unter dem Freibetrag von ",
        formatEuro(ergebnis.gesamteFreibetraege),
        " – es fällt keine Erbschaftsteuer an."
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Berechnungsdetails" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide", children: "Wert der Erbschaft" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Haupterbschaft (Immobilien, Geld, Wertpapiere)" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(erbschaftswert) })
        ] }),
        hatHausrat && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "+ Hausrat" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatEuro(hausratWert) })
        ] }),
        hatBeweglicheGegenstaende && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "+ Bewegliche Gegenstände" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatEuro(beweglicheWert) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-gray-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "= Brutto-Erbschaft" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.bruttoErbschaft) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide pt-4", children: "Abzüge" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-red-600", children: [
          /* @__PURE__ */ jsx("span", { children: "− Nachlassverbindlichkeiten / Bestattungspauschale" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.gesamtBelastungen) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-gray-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "= Netto-Erbschaft" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.nettoErbschaft) })
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
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide pt-4", children: "Freibeträge (§ 16, 17 ErbStG)" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-green-600", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "Persönlicher Freibetrag (",
            ergebnis.verwandter.name,
            ")"
          ] }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.persoenlichFreibetrag) })
        ] }),
        ergebnis.versorgungsfreibetrag > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-green-600", children: [
          /* @__PURE__ */ jsx("span", { children: "Versorgungsfreibetrag" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.versorgungsfreibetrag) })
        ] }),
        ergebnis.hausratFreibetrag > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-green-600", children: [
          /* @__PURE__ */ jsx("span", { children: "Hausratfreibetrag" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.hausratFreibetrag) })
        ] }),
        ergebnis.beweglicheFreibetrag > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-green-600", children: [
          /* @__PURE__ */ jsx("span", { children: "Freibetrag bewegliche Gegenstände" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.beweglicheFreibetrag) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-green-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-green-700", children: "= Gesamte Freibeträge" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-green-900", children: formatEuro(ergebnis.gesamteFreibetraege) })
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
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-3 bg-emerald-100 -mx-6 px-6 rounded-b-xl mt-4", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-emerald-800", children: "Erbschaftsteuer" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-2xl text-emerald-900", children: formatEuro(ergebnis.erbschaftsteuer) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📋 Erbschaftsteuer-Tabelle 2025/2026" }),
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
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert die Erbschaftsteuer" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Steuerklassen:" }),
            " Je näher verwandt, desto niedriger die Steuerklasse und höher der Freibetrag"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Freibeträge:" }),
            " Bis zu 500.000€ für Ehepartner, 400.000€ für Kinder – alle 10 Jahre nutzbar"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "10-Jahres-Regel:" }),
            " Schenkungen und Erbschaften werden innerhalb von 10 Jahren zusammengerechnet"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Immobilienbewertung:" }),
            " Immobilien werden zum Verkehrswert (Marktwert) bewertet"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Familienheim-Befreiung:" }),
            " Selbstgenutzte Immobilien können steuerfrei auf Ehepartner/Kinder übergehen"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Stundung:" }),
            " Bei Liquiditätsproblemen kann die Steuer über 10 Jahre gestundet werden"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-emerald-800 mb-3", children: "💰 Freibeträge bei Erbschaft 2025/2026" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-emerald-600 font-medium", children: "Ehepartner/Lebenspartner" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-emerald-800", children: "500.000 €" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: "+ 256.000€ Versorgungsfreibetrag" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-emerald-600 font-medium", children: "Kinder" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-emerald-800", children: "400.000 €" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: "+ Versorgungsfreibetrag je Alter" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-emerald-600 font-medium", children: "Enkel" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-emerald-800", children: "200.000 €" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: "400.000€ wenn Eltern verstorben" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-emerald-600 font-medium", children: "Eltern / Urenkel" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-emerald-800", children: "100.000 €" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-yellow-600 font-medium", children: "Geschwister / Nichten / Neffen" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-yellow-800", children: "20.000 €" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-red-600 font-medium", children: "Sonstige Personen" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-red-800", children: "20.000 €" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-amber-800 mb-3", children: "⚠️ Wichtige Hinweise" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-amber-700", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Schätzung:" }),
            " Dieser Rechner liefert eine Orientierung – die tatsächliche Steuer kann abweichen"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Immobilienbewertung:" }),
            " Die Bewertung von Immobilien ist komplex und erfolgt nach dem Bewertungsgesetz"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Betriebsvermögen:" }),
            " Für Unternehmen gelten besondere Verschonungsregeln (bis zu 100% Befreiung)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Anzeigepflicht:" }),
            " Eine Erbschaft muss innerhalb von 3 Monaten dem Finanzamt angezeigt werden"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Steuerberater:" }),
            " Bei größeren Erbschaften empfiehlt sich professionelle Beratung zur Steueroptimierung"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörde" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-emerald-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-emerald-900", children: "Erbschaftsteuerfinanzamt" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-emerald-700 mt-1", children: "Zuständig ist das Finanzamt am letzten Wohnsitz des Erblassers. In den meisten Bundesländern gibt es zentrale Erbschaftsteuer-Finanzämter." })
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
                  children: "Erbschaftsteuererklärung online →"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📋" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Fristen" }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Anzeige: 3 Monate nach Erbfall" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Finanzamt-Hotlines (Beispiele)" }),
            /* @__PURE__ */ jsxs("ul", { className: "text-gray-600 mt-1 space-y-1", children: [
              /* @__PURE__ */ jsx("li", { children: "• Bayern: 089 9991-0 (Zentrales Finanzamt München)" }),
              /* @__PURE__ */ jsx("li", { children: "• NRW: 0211 4972-0 (FA Düsseldorf-Süd)" }),
              /* @__PURE__ */ jsx("li", { children: "• Hessen: 069 2545-0 (FA Frankfurt am Main)" })
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
            children: "Bewertungsgesetz (BewG) – Immobilienbewertung"
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
            children: "Steuertipps.de – Ratgeber Erbschaft"
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
const $$ErbschaftsteuerRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "Erbschaftsteuer-Rechner 2025/2026 \u2013 Steuer, Freibetr\xE4ge & Steuerklassen berechnen";
  const description = "Erbschaftsteuer Rechner 2025: Berechnen Sie Ihre Erbschaftsteuer online. Mit Freibetr\xE4gen nach Verwandtschaftsgrad, Steuerklassen I-III & aktuellen Steuers\xE4tzen. Kostenlos & sofort!";
  const keywords = "Erbschaftsteuer Rechner, Erbschaftsteuer berechnen, Erbschaftsteuer Freibetrag, Erbschaftsteuer 2025, Erbschaftsteuer 2026, Erbschaft versteuern, Erbschaftsteuer Tabelle, Erbschaftsteuer Steuerklasse, Erbschaftsteuer Kinder, Erbschaftsteuer Ehepartner, Erbschaft Freibetrag, Erbschaftsteuer Immobilien, Erbschaftsteuer Deutschland";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<main class="min-h-screen pb-8"> <!-- Header mit Zur\xFCck-Button --> <header class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-emerald-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>\nAlle Rechner\n</a> <div class="flex items-center gap-3"> <span class="text-4xl">\u{1F4DC}</span> <div> <h1 class="text-2xl font-bold">Erbschaftsteuer-Rechner</h1> <p class="text-emerald-100 text-sm">Steuer auf Erbschaft & Freibetr\xE4ge 2025/2026</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ', ' </div> <!-- SEO Content Section --> <div class="max-w-2xl mx-auto px-4 mt-8"> <div class="bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">Erbschaftsteuer in Deutschland: Das m\xFCssen Sie wissen</h2> <div class="prose prose-sm text-gray-600 space-y-4"> <p>\nDie <strong>Erbschaftsteuer</strong> in Deutschland wird auf den Verm\xF6gens\xFCbergang von Todes wegen erhoben. \n            Mit unserem <strong>Erbschaftsteuer-Rechner</strong> k\xF6nnen Sie schnell und einfach berechnen, wie viel \n            Steuer auf Ihre Erbschaft anf\xE4llt \u2013 unter Ber\xFCcksichtigung aller Freibetr\xE4ge und der aktuellen \n            Steuers\xE4tze 2025/2026.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Was ist die Erbschaftsteuer?</h3> <p>\nDie Erbschaftsteuer ist eine Steuer auf den Erwerb von Verm\xF6gen durch Erbschaft oder Verm\xE4chtnis. \n            Sie wird im <strong>Erbschaftsteuer- und Schenkungsteuergesetz (ErbStG)</strong> geregelt und ist eine \n            der \xE4ltesten Steuerarten in Deutschland. Das Aufkommen flie\xDFt den Bundesl\xE4ndern zu.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Die 3 Steuerklassen bei der Erbschaftsteuer</h3> <p>\nDie H\xF6he der Erbschaftsteuer h\xE4ngt ma\xDFgeblich von der <strong>Steuerklasse</strong> ab, die sich \n            aus dem Verwandtschaftsverh\xE4ltnis zum Erblasser ergibt:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Steuerklasse I (7-30%):</strong> Ehepartner, Kinder, Enkel, Eltern (bei Erbschaft)</li> <li><strong>Steuerklasse II (15-43%):</strong> Geschwister, Nichten/Neffen, Stiefeltern, Schwiegerkinder</li> <li><strong>Steuerklasse III (30-50%):</strong> Alle anderen Personen (Freunde, Lebensgef\xE4hrten ohne Eintragung)</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Freibetr\xE4ge bei der Erbschaftsteuer 2025</h3> <p>\nJeder Erbe hat einen <strong>pers\xF6nlichen Freibetrag</strong>, bis zu dem keine Erbschaftsteuer anf\xE4llt. \n            Diese Freibetr\xE4ge k\xF6nnen alle 10 Jahre neu genutzt werden:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Ehepartner/Lebenspartner:</strong> 500.000 \u20AC (+ Versorgungsfreibetrag bis 256.000 \u20AC)</li> <li><strong>Kinder:</strong> 400.000 \u20AC pro Kind (+ altersabh\xE4ngiger Versorgungsfreibetrag)</li> <li><strong>Enkel:</strong> 200.000 \u20AC (400.000 \u20AC wenn Elternteil bereits verstorben)</li> <li><strong>Eltern/Gro\xDFeltern:</strong> 100.000 \u20AC</li> <li><strong>Geschwister, Nichten, Neffen:</strong> 20.000 \u20AC</li> <li><strong>Alle anderen:</strong> 20.000 \u20AC</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Der Versorgungsfreibetrag</h3> <p>\nZus\xE4tzlich zum pers\xF6nlichen Freibetrag gibt es den <strong>Versorgungsfreibetrag</strong> nach \xA7 17 ErbStG:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Ehepartner:</strong> 256.000 \u20AC (wird um Versorgungsbez\xFCge wie Witwenrente gek\xFCrzt)</li> <li><strong>Kinder bis 5 Jahre:</strong> 52.000 \u20AC</li> <li><strong>Kinder 6-10 Jahre:</strong> 41.000 \u20AC</li> <li><strong>Kinder 11-15 Jahre:</strong> 30.700 \u20AC</li> <li><strong>Kinder 16-20 Jahre:</strong> 20.500 \u20AC</li> <li><strong>Kinder 21-27 Jahre:</strong> 10.300 \u20AC</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Erbschaftsteuer-Tabelle: Die Steuers\xE4tze</h3> <p>\nDer <strong>Steuersatz</strong> richtet sich nach dem steuerpflichtigen Erwerb und der Steuerklasse. \n            Er liegt zwischen 7% (Steuerklasse I, bis 75.000 \u20AC) und 50% (Steuerklasse III, ab 13 Mio \u20AC). \n            Wichtig: Der Steuersatz wird auf den gesamten steuerpflichtigen Betrag angewendet, nicht \n            progressiv wie bei der Einkommensteuer.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Die 10-Jahres-Regel bei Erbschaft und Schenkung</h3> <p> <strong>Vorsicht bei Schenkungen:</strong> Schenkungen innerhalb der letzten 10 Jahre vor dem \n            Erbfall werden zusammengerechnet. Der Freibetrag gilt also f\xFCr alle \xDCbertragungen innerhalb \n            von 10 Jahren \u2013 nicht f\xFCr jede einzeln! Deshalb ist <strong>vorausschauende Schenkung</strong>\neine beliebte Methode zur Erbschaftsteuer-Optimierung.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Steuerbefreiung f\xFCr das Familienheim</h3> <p>\nEine wichtige Ausnahme: <strong>Selbstgenutzte Immobilien</strong> (Familienheim) k\xF6nnen unter \n            bestimmten Voraussetzungen steuerfrei vererbt werden:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>An Ehepartner:</strong> Vollst\xE4ndige Steuerbefreiung, unabh\xE4ngig vom Wert</li> <li><strong>An Kinder:</strong> Steuerbefreiung bis 200 qm Wohnfl\xE4che, wenn das Kind 10 Jahre selbst darin wohnt</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Immobilienbewertung bei der Erbschaftsteuer</h3> <p>\nImmobilien werden zum <strong>Verkehrswert (Marktwert)</strong> nach dem Bewertungsgesetz bewertet. \n            Dies kann je nach Lage und Zustand der Immobilie zu deutlich h\xF6heren Bewertungen f\xFChren als \n            in der Vergangenheit. Ein Verkehrswertgutachten kann sich lohnen, wenn der tats\xE4chliche \n            Marktwert niedriger liegt.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Erbschaftsteuer vermeiden: Legale Wege</h3> <p>\nEs gibt verschiedene <strong>legale Strategien</strong> zur Minimierung der Erbschaftsteuer:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Fr\xFChzeitige Schenkungen:</strong> Freibetr\xE4ge alle 10 Jahre nutzen</li> <li><strong>G\xFCterstandsschaukel:</strong> Wechsel zwischen G\xFCtertrennung und Zugewinngemeinschaft</li> <li><strong>Nie\xDFbrauch:</strong> Verm\xF6gens\xFCbertragung unter Vorbehalt des Nutzungsrechts</li> <li><strong>Familienheim-Befreiung:</strong> Selbstgenutzte Immobilie steuerfrei \xFCbertragen</li> <li><strong>Betriebsverm\xF6gen:</strong> Bis zu 100% Verschonungsabschlag m\xF6glich</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Erbschaftsteuer anmelden: Fristen & Pflichten</h3> <p> <strong>Anzeigepflicht:</strong> Innerhalb von 3 Monaten nach dem Erbfall muss die Erbschaft \n            dem Finanzamt angezeigt werden (\xA7 30 ErbStG). Das Finanzamt fordert dann ggf. eine \n            Erbschaftsteuererkl\xE4rung an.\n</p> <p> <strong>Steuererkl\xE4rung:</strong> \xDCber das ELSTER-Portal kann die Erbschaftsteuererkl\xE4rung \n            elektronisch abgegeben werden. Bei gr\xF6\xDFeren Erbschaften empfiehlt sich die Hinzuziehung \n            eines Steuerberaters.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Stundung der Erbschaftsteuer</h3> <p>\nWenn die Steuer aus dem Erbe nicht sofort bezahlt werden kann (z.B. bei Immobilien), \n            kann eine <strong>Stundung \xFCber bis zu 10 Jahre</strong> beantragt werden. Dies ist \n            besonders bei illiquiden Verm\xF6genswerten wie Immobilien oder Unternehmensbeteiligungen relevant.\n</p> </div> </div> </div> </main>  <script type="application/ld+json">', '<\/script>  <script type="application/ld+json">', "<\/script> "])), maybeRenderHead(), renderComponent($$result2, "ErbschaftsteuerRechner", ErbschaftsteuerRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/ErbschaftsteuerRechner", "client:component-export": "default" }), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Erbschaftsteuer-Rechner 2025",
    "description": description,
    "url": "https://www.deutschland-rechner.de/erbschaftsteuer-rechner",
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
        "name": "Wie hoch ist der Freibetrag bei der Erbschaftsteuer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Der Freibetrag h\xE4ngt vom Verwandtschaftsgrad ab: Ehepartner 500.000\u20AC, Kinder 400.000\u20AC, Enkel 200.000\u20AC, Geschwister und andere 20.000\u20AC. Die Freibetr\xE4ge k\xF6nnen alle 10 Jahre neu genutzt werden."
        }
      },
      {
        "@type": "Question",
        "name": "Wie viel Erbschaftsteuer muss ich zahlen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Die Erbschaftsteuer betr\xE4gt zwischen 7% und 50%, abh\xE4ngig von Steuerklasse und H\xF6he des steuerpflichtigen Erwerbs. Steuerklasse I (nahe Verwandte) zahlt 7-30%, Steuerklasse III bis zu 50%."
        }
      },
      {
        "@type": "Question",
        "name": "Wann muss ich die Erbschaft dem Finanzamt melden?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Eine Erbschaft muss innerhalb von 3 Monaten nach dem Erbfall dem zust\xE4ndigen Finanzamt angezeigt werden. Das Finanzamt pr\xFCft dann, ob eine Erbschaftsteuererkl\xE4rung erforderlich ist."
        }
      },
      {
        "@type": "Question",
        "name": "Kann ich ein Haus steuerfrei erben?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, unter bestimmten Voraussetzungen: Ehepartner k\xF6nnen das Familienheim unbegrenzt steuerfrei erben. Kinder k\xF6nnen bis zu 200 qm steuerfrei erben, wenn sie 10 Jahre selbst darin wohnen."
        }
      },
      {
        "@type": "Question",
        "name": "Werden Schenkungen auf die Erbschaftsteuer angerechnet?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, Schenkungen der letzten 10 Jahre vor dem Erbfall werden zusammengerechnet. Der Freibetrag gilt f\xFCr alle \xDCbertragungen innerhalb von 10 Jahren zusammen."
        }
      }
    ]
  }))) })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/erbschaftsteuer-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/erbschaftsteuer-rechner.astro";
const $$url = "/erbschaftsteuer-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$ErbschaftsteuerRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
