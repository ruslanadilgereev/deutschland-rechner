/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, u as unescapeHTML, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_v22DC8tm.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const STUNDEN_PRO_WOCHE_DEFAULT = 40;
const WOCHEN_PRO_JAHR = 52;
const URLAUBSTAGE_DEFAULT = 30;
const FEIERTAGE_DEFAULT = 10;
const MINDESTLOHN_2025 = 12.82;
function StundenlohnRechner() {
  const [richtung, setRichtung] = useState("gehaltZuStunde");
  const [monatsgehalt, setMonatsgehalt] = useState(3500);
  const [jahresgehalt, setJahresgehalt] = useState(42e3);
  const [eingabeart, setEingabeart] = useState("monat");
  const [stundenlohn, setStundenlohn] = useState(20);
  const [stundenProWoche, setStundenProWoche] = useState(STUNDEN_PRO_WOCHE_DEFAULT);
  const [urlaubstage, setUrlaubstage] = useState(URLAUBSTAGE_DEFAULT);
  const [feiertage, setFeiertage] = useState(FEIERTAGE_DEFAULT);
  const [mitSonderzahlungen, setMitSonderzahlungen] = useState(false);
  const [urlaubsgeldMonate, setUrlaubsgeldMonate] = useState(0.5);
  const [weihnachtsgeldMonate, setWeihnachtsgeldMonate] = useState(1);
  const ergebnis = useMemo(() => {
    const arbeitsTageProWoche = 5;
    const arbeitsTageProJahr = WOCHEN_PRO_JAHR * arbeitsTageProWoche - urlaubstage - feiertage;
    const arbeitsStundenProTag = stundenProWoche / arbeitsTageProWoche;
    const arbeitsStundenProMonat = stundenProWoche * WOCHEN_PRO_JAHR / 12;
    const arbeitsStundenProJahr = stundenProWoche * WOCHEN_PRO_JAHR;
    const effektiveArbeitsstundenProJahr = arbeitsTageProJahr * arbeitsStundenProTag;
    if (richtung === "gehaltZuStunde") {
      const basisJahresgehalt = eingabeart === "monat" ? monatsgehalt * 12 : jahresgehalt;
      const basisMonatsgehalt = eingabeart === "monat" ? monatsgehalt : jahresgehalt / 12;
      let gesamtJahresgehalt = basisJahresgehalt;
      if (mitSonderzahlungen) {
        gesamtJahresgehalt += basisMonatsgehalt * urlaubsgeldMonate;
        gesamtJahresgehalt += basisMonatsgehalt * weihnachtsgeldMonate;
      }
      const stundenlohnBrutto = basisMonatsgehalt / arbeitsStundenProMonat;
      const stundenlohnMitSonderzahlungen = gesamtJahresgehalt / arbeitsStundenProJahr;
      const stundenlohnEffektiv = gesamtJahresgehalt / effektiveArbeitsstundenProJahr;
      const ueberMindestlohn = stundenlohnBrutto >= MINDESTLOHN_2025;
      const differenzZumMindestlohn = stundenlohnBrutto - MINDESTLOHN_2025;
      const prozentUeberMindestlohn = (stundenlohnBrutto / MINDESTLOHN_2025 - 1) * 100;
      return {
        richtung,
        // Eingabe
        basisMonatsgehalt,
        basisJahresgehalt,
        gesamtJahresgehalt,
        // Arbeitszeit
        arbeitsStundenProMonat,
        arbeitsStundenProJahr,
        arbeitsTageProJahr,
        effektiveArbeitsstundenProJahr,
        // Ergebnis
        stundenlohnBrutto,
        stundenlohnMitSonderzahlungen,
        stundenlohnEffektiv,
        // Mindestlohn-Vergleich
        ueberMindestlohn,
        differenzZumMindestlohn,
        prozentUeberMindestlohn,
        // Für Anzeige
        tageslohn: stundenlohnBrutto * arbeitsStundenProTag,
        wochenlohn: stundenlohnBrutto * stundenProWoche
      };
    } else {
      const monatsgehaltAusStunde = stundenlohn * arbeitsStundenProMonat;
      const jahresgehaltAusStunde = stundenlohn * arbeitsStundenProJahr;
      let gesamtJahresgehalt = jahresgehaltAusStunde;
      if (mitSonderzahlungen) {
        gesamtJahresgehalt += monatsgehaltAusStunde * urlaubsgeldMonate;
        gesamtJahresgehalt += monatsgehaltAusStunde * weihnachtsgeldMonate;
      }
      const ueberMindestlohn = stundenlohn >= MINDESTLOHN_2025;
      const differenzZumMindestlohn = stundenlohn - MINDESTLOHN_2025;
      const prozentUeberMindestlohn = (stundenlohn / MINDESTLOHN_2025 - 1) * 100;
      return {
        richtung,
        // Eingabe
        stundenlohnEingabe: stundenlohn,
        // Arbeitszeit
        arbeitsStundenProMonat,
        arbeitsStundenProJahr,
        arbeitsTageProJahr,
        effektiveArbeitsstundenProJahr,
        // Ergebnis
        monatsgehaltAusStunde,
        jahresgehaltAusStunde,
        gesamtJahresgehalt,
        // Mindestlohn-Vergleich
        ueberMindestlohn,
        differenzZumMindestlohn,
        prozentUeberMindestlohn,
        // Für Anzeige
        tageslohn: stundenlohn * (stundenProWoche / 5),
        wochenlohn: stundenlohn * stundenProWoche
      };
    }
  }, [richtung, monatsgehalt, jahresgehalt, eingabeart, stundenlohn, stundenProWoche, urlaubstage, feiertage, mitSonderzahlungen, urlaubsgeldMonate, weihnachtsgeldMonate]);
  const formatEuro = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  const formatEuroRund = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";
  const formatZahl = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const formatProzent = (n) => (n >= 0 ? "+" : "") + n.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Was möchten Sie berechnen?" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setRichtung("gehaltZuStunde"),
            className: `p-4 rounded-xl border-2 transition-all ${richtung === "gehaltZuStunde" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`,
            children: [
              /* @__PURE__ */ jsx("div", { className: "text-2xl mb-2", children: "💰 → ⏱️" }),
              /* @__PURE__ */ jsx("div", { className: "font-semibold text-gray-800", children: "Gehalt → Stundenlohn" }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 mt-1", children: "Ich kenne mein Monatsgehalt" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setRichtung("stundeZuGehalt"),
            className: `p-4 rounded-xl border-2 transition-all ${richtung === "stundeZuGehalt" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`,
            children: [
              /* @__PURE__ */ jsx("div", { className: "text-2xl mb-2", children: "⏱️ → 💰" }),
              /* @__PURE__ */ jsx("div", { className: "font-semibold text-gray-800", children: "Stundenlohn → Gehalt" }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 mt-1", children: "Ich kenne meinen Stundenlohn" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      richtung === "gehaltZuStunde" ? /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Ihr Bruttogehalt" }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 mb-4", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setEingabeart("monat"),
              className: `py-2 px-4 rounded-lg font-medium text-sm transition-all ${eingabeart === "monat" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: "Pro Monat"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setEingabeart("jahr"),
              className: `py-2 px-4 rounded-lg font-medium text-sm transition-all ${eingabeart === "jahr" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: "Pro Jahr"
            }
          )
        ] }),
        eingabeart === "monat" ? /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: monatsgehalt,
              onChange: (e) => setMonatsgehalt(Math.max(0, Number(e.target.value))),
              className: "w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
              min: "0",
              max: "20000",
              step: "100"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl", children: "€ / Monat" })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: jahresgehalt,
              onChange: (e) => setJahresgehalt(Math.max(0, Number(e.target.value))),
              className: "w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
              min: "0",
              max: "200000",
              step: "1000"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl", children: "€ / Jahr" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: eingabeart === "monat" ? monatsgehalt : jahresgehalt,
            onChange: (e) => eingabeart === "monat" ? setMonatsgehalt(Number(e.target.value)) : setJahresgehalt(Number(e.target.value)),
            className: "w-full mt-3 accent-blue-500",
            min: eingabeart === "monat" ? 1e3 : 12e3,
            max: eingabeart === "monat" ? 1e4 : 12e4,
            step: eingabeart === "monat" ? 100 : 1e3
          }
        )
      ] }) }) : /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Ihr Stundenlohn (brutto)" }) }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: stundenlohn,
              onChange: (e) => setStundenlohn(Math.max(0, Number(e.target.value))),
              className: "w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
              min: "0",
              max: "200",
              step: "0.5"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl", children: "€ / Std." })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: stundenlohn,
            onChange: (e) => setStundenlohn(Number(e.target.value)),
            className: "w-full mt-3 accent-blue-500",
            min: "10",
            max: "100",
            step: "0.5"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "10 €" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Mindestlohn: ",
            formatEuro(MINDESTLOHN_2025)
          ] }),
          /* @__PURE__ */ jsx("span", { children: "100 €" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Wochenarbeitszeit" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4 mb-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setStundenProWoche(Math.max(1, stundenProWoche - 1)),
              className: "w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors",
              children: "−"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-3xl font-bold text-gray-800", children: stundenProWoche }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-500 ml-2", children: "Std./Woche" })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setStundenProWoche(Math.min(60, stundenProWoche + 1)),
              className: "w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors",
              children: "+"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-center gap-2 mt-2", children: [20, 30, 35, 38.5, 40].map((std) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setStundenProWoche(std),
            className: `px-3 py-1 rounded-lg text-sm font-medium transition-all ${stundenProWoche === std ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: [
              std,
              "h"
            ]
          },
          std
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 mb-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium text-sm", children: "Urlaubstage/Jahr" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setUrlaubstage(Math.max(20, urlaubstage - 1)),
                className: "w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-bold",
                children: "−"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-gray-800 w-12 text-center", children: urlaubstage }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setUrlaubstage(Math.min(40, urlaubstage + 1)),
                className: "w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-bold",
                children: "+"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium text-sm", children: "Feiertage/Jahr" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setFeiertage(Math.max(9, feiertage - 1)),
                className: "w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-bold",
                children: "−"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-gray-800 w-12 text-center", children: feiertage }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setFeiertage(Math.min(14, feiertage + 1)),
                className: "w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-bold",
                children: "+"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mb-4", children: "* Feiertage variieren nach Bundesland: Bayern 13, Berlin 9, NRW 11" }),
      /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            checked: mitSonderzahlungen,
            onChange: (e) => setMitSonderzahlungen(e.target.checked),
            className: "w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Urlaubs-/Weihnachtsgeld berücksichtigen" })
      ] }) }),
      mitSonderzahlungen && /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 rounded-xl p-4 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-600 mb-1", children: "Urlaubsgeld" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "range",
                value: urlaubsgeldMonate,
                onChange: (e) => setUrlaubsgeldMonate(Number(e.target.value)),
                className: "flex-1 accent-blue-500",
                min: "0",
                max: "1",
                step: "0.25"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium w-24 text-right", children: urlaubsgeldMonate === 0 ? "Kein" : `${urlaubsgeldMonate} Monatsgehalt${urlaubsgeldMonate > 1 ? "er" : ""}` })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-600 mb-1", children: "Weihnachtsgeld" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "range",
                value: weihnachtsgeldMonate,
                onChange: (e) => setWeihnachtsgeldMonate(Number(e.target.value)),
                className: "flex-1 accent-blue-500",
                min: "0",
                max: "2",
                step: "0.25"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium w-24 text-right", children: weihnachtsgeldMonate === 0 ? "Kein" : `${weihnachtsgeldMonate} Monatsgehalt${weihnachtsgeldMonate > 1 ? "er" : ""}` })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-6", children: richtung === "gehaltZuStunde" ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: "⏱️ Ihr Stundenlohn (brutto)" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2 mb-4", children: [
        /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuro(ergebnis.stundenlohnBrutto) }),
        /* @__PURE__ */ jsx("span", { className: "text-xl opacity-80", children: "/ Stunde" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Tageslohn (brutto)" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.tageslohn) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Wochenlohn (brutto)" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.wochenlohn) })
        ] })
      ] }),
      mitSonderzahlungen && /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm mb-4", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Mit Sonderzahlungen" }),
        /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.stundenlohnMitSonderzahlungen) }),
        /* @__PURE__ */ jsx("span", { className: "text-xs opacity-70", children: "Jahresgehalt inkl. Urlaubs-/Weihnachtsgeld ÷ Jahresstunden" })
      ] })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: "💰 Ihr Bruttogehalt" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2 mb-4", children: [
        /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuroRund(ergebnis.monatsgehaltAusStunde) }),
        /* @__PURE__ */ jsx("span", { className: "text-xl opacity-80", children: "/ Monat" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Jahresgehalt" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuroRund(ergebnis.jahresgehaltAusStunde) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Wochenlohn" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.wochenlohn) })
        ] })
      ] }),
      mitSonderzahlungen && /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Mit Urlaubs-/Weihnachtsgeld" }),
        /* @__PURE__ */ jsxs("div", { className: "text-xl font-bold", children: [
          formatEuroRund(ergebnis.gesamtJahresgehalt),
          " / Jahr"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: `rounded-2xl shadow-lg p-6 mb-6 ${ergebnis.ueberMindestlohn ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`, children: [
      /* @__PURE__ */ jsxs("h3", { className: `font-bold mb-3 ${ergebnis.ueberMindestlohn ? "text-green-800" : "text-red-800"}`, children: [
        ergebnis.ueberMindestlohn ? "✅" : "⚠️",
        " Mindestlohn-Vergleich 2025"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("p", { className: `text-sm ${ergebnis.ueberMindestlohn ? "text-green-700" : "text-red-700"}`, children: [
            "Gesetzlicher Mindestlohn: ",
            /* @__PURE__ */ jsx("strong", { children: formatEuro(MINDESTLOHN_2025) })
          ] }),
          /* @__PURE__ */ jsx("p", { className: `text-sm mt-1 ${ergebnis.ueberMindestlohn ? "text-green-700" : "text-red-700"}`, children: richtung === "gehaltZuStunde" ? `Ihr Stundenlohn: ${formatEuro(ergebnis.stundenlohnBrutto)}` : `Ihr Stundenlohn: ${formatEuro(stundenlohn)}` })
        ] }),
        /* @__PURE__ */ jsx("div", { className: `text-2xl font-bold ${ergebnis.ueberMindestlohn ? "text-green-600" : "text-red-600"}`, children: formatProzent(ergebnis.prozentUeberMindestlohn) })
      ] }),
      !ergebnis.ueberMindestlohn && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-700 mt-3 font-medium", children: "⚠️ Achtung: Ihr Stundenlohn liegt unter dem gesetzlichen Mindestlohn!" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Berechnungsdetails" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide", children: "Arbeitszeit-Grundlage" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Wochenarbeitszeit" }),
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-gray-900", children: [
            stundenProWoche,
            " Stunden"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Arbeitsstunden / Monat" }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-900", children: [
            formatZahl(ergebnis.arbeitsStundenProMonat),
            " Stunden"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Arbeitsstunden / Jahr" }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-900", children: [
            formatZahl(ergebnis.arbeitsStundenProJahr),
            " Stunden"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Effektive Arbeitstage / Jahr" }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-900", children: [
            ergebnis.arbeitsTageProJahr,
            " Tage"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-between py-2 border-b border-gray-100 text-gray-400 text-xs", children: /* @__PURE__ */ jsxs("span", { children: [
          "(= 52 Wochen × 5 Tage − ",
          urlaubstage,
          " Urlaub − ",
          feiertage,
          " Feiertage)"
        ] }) }),
        richtung === "gehaltZuStunde" ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide pt-4", children: "Stundenlohn-Berechnung" }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Monatsgehalt (brutto)" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.basisMonatsgehalt) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
              "÷ Monatsstunden (",
              formatZahl(ergebnis.arbeitsStundenProMonat),
              ")"
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "= Stundenlohn" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-3 bg-blue-50 -mx-6 px-6", children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold text-blue-800", children: "Stundenlohn (brutto)" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-2xl text-blue-900", children: formatEuro(ergebnis.stundenlohnBrutto) })
          ] })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide pt-4", children: "Gehalts-Berechnung" }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Stundenlohn" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(stundenlohn) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
              "× Monatsstunden (",
              formatZahl(ergebnis.arbeitsStundenProMonat),
              ")"
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "= Monatsgehalt" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-3 bg-blue-50 -mx-6 px-6", children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold text-blue-800", children: "Monatsgehalt (brutto)" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-2xl text-blue-900", children: formatEuro(ergebnis.monatsgehaltAusStunde) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "🔢 Formel: Stundenlohn berechnen" }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-xl p-4 mb-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-center font-mono text-lg text-gray-800 mb-2", children: "Stundenlohn = Monatsgehalt ÷ (Wochenstunden × 4,33)" }),
        /* @__PURE__ */ jsx("p", { className: "text-center text-xs text-gray-500", children: "4,33 = durchschnittliche Wochen pro Monat (52 ÷ 12)" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Beispiel:" }),
          " Bei einem Monatsgehalt von 3.500 € brutto und 40 Wochenstunden:"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "font-mono bg-blue-50 p-3 rounded-lg", children: [
          "3.500 € ÷ (40 × 4,33) = 3.500 € ÷ 173,2 = ",
          /* @__PURE__ */ jsx("strong", { children: "20,21 € / Stunde" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📋 Stundenlohn-Übersicht (bei 40h/Woche)" }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-200", children: [
          /* @__PURE__ */ jsx("th", { className: "text-left py-2 text-gray-600 font-medium", children: "Monatsgehalt" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-2 text-gray-600 font-medium", children: "Stundenlohn" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-2 text-gray-600 font-medium", children: "Jahresgehalt" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: [2e3, 2500, 3e3, 3500, 4e3, 4500, 5e3, 6e3].map((gehalt) => {
          const stunde = gehalt / (40 * 4.33);
          const unterMindestlohn = stunde < MINDESTLOHN_2025;
          return /* @__PURE__ */ jsxs(
            "tr",
            {
              className: `border-b border-gray-100 ${Math.abs(gehalt - (richtung === "gehaltZuStunde" ? eingabeart === "monat" ? monatsgehalt : jahresgehalt / 12 : ergebnis.monatsgehaltAusStunde)) < 200 ? "bg-blue-50" : ""}`,
              children: [
                /* @__PURE__ */ jsx("td", { className: "py-2", children: formatEuroRund(gehalt) }),
                /* @__PURE__ */ jsx("td", { className: `py-2 text-right font-medium ${unterMindestlohn ? "text-red-600" : "text-gray-900"}`, children: formatEuro(stunde) }),
                /* @__PURE__ */ jsx("td", { className: "py-2 text-right text-gray-600", children: formatEuroRund(gehalt * 12) })
              ]
            },
            gehalt
          );
        }) })
      ] }) }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 mt-3", children: [
        "* Werte unter ",
        formatEuro(MINDESTLOHN_2025),
        " liegen unter dem gesetzlichen Mindestlohn"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ Wissenswertes zum Stundenlohn" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Mindestlohn 2025:" }),
            " Der gesetzliche Mindestlohn beträgt ",
            formatEuro(MINDESTLOHN_2025),
            " pro Stunde"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Durchschnitt:" }),
            " Bei 40h/Woche gibt es ca. 173,3 Arbeitsstunden pro Monat"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Sonderzahlungen:" }),
            " Urlaubs- und Weihnachtsgeld erhöhen den effektiven Stundenlohn"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Teilzeit:" }),
            " Der Stundenlohn ist unabhängig von der Wochenarbeitszeit"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Brutto vs. Netto:" }),
            " Der berechnete Stundenlohn ist der Brutto-Wert vor Abzügen"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-amber-800 mb-3", children: "⚠️ Mindestlohn in Deutschland 2025" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm text-amber-700", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          "Der ",
          /* @__PURE__ */ jsx("strong", { children: "gesetzliche Mindestlohn" }),
          " beträgt seit 1. Januar 2025 ",
          /* @__PURE__ */ jsx("strong", { children: formatEuro(MINDESTLOHN_2025) }),
          " pro Stunde."
        ] }),
        /* @__PURE__ */ jsx("p", { children: "Das entspricht bei einer 40-Stunden-Woche:" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-1 pl-4", children: [
          /* @__PURE__ */ jsxs("li", { children: [
            "• ",
            /* @__PURE__ */ jsx("strong", { children: formatEuro(MINDESTLOHN_2025 * 40) }),
            " pro Woche"
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            "• ",
            /* @__PURE__ */ jsx("strong", { children: formatEuro(MINDESTLOHN_2025 * 173.33) }),
            " pro Monat"
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            "• ",
            /* @__PURE__ */ jsx("strong", { children: formatEuroRund(MINDESTLOHN_2025 * 2080) }),
            " pro Jahr"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-3", children: [
          /* @__PURE__ */ jsx("strong", { children: "Ausnahmen:" }),
          " Auszubildende, Praktikanten unter bestimmten Bedingungen, Langzeitarbeitslose in den ersten 6 Monaten."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "📌 Wann ist der Stundenlohn wichtig?" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-3 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🤝" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("strong", { className: "text-gray-800", children: "Gehaltsverhandlung" }),
            /* @__PURE__ */ jsx("p", { children: "Vergleichen Sie Ihren Stundenlohn mit Branchenstandards" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "⏰" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("strong", { className: "text-gray-800", children: "Überstunden-Abrechnung" }),
            /* @__PURE__ */ jsx("p", { children: "Basis für Überstundenvergütung und Zuschläge" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📊" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("strong", { className: "text-gray-800", children: "Jobangebote vergleichen" }),
            /* @__PURE__ */ jsx("p", { children: "Vergleichen Sie Angebote mit unterschiedlichen Wochenstunden" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🏠" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("strong", { className: "text-gray-800", children: "Nebenjob/Freelancing" }),
            /* @__PURE__ */ jsx("p", { children: "Setzen Sie Ihren fairen Stundensatz fest" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Informationen & Beratung" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-blue-900", children: "Mindestlohn-Hotline" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-700 mt-1", children: "Für Fragen zum gesetzlichen Mindestlohn:" }),
          /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-blue-900 mt-2", children: "030 60 28 00 28" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-blue-600", children: "Montag bis Donnerstag 8-20 Uhr, kostenfrei" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Mindestlohn-Info" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.bmas.de/DE/Arbeit/Arbeitsrecht/Mindestlohn/mindestlohn.html",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "BMAS Mindestlohn →"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "⚖️" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Zoll – Kontrolle" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.zoll.de/DE/Fachthemen/Arbeit/Mindestlohn/mindestlohn_node.html",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "Zoll Mindestlohn →"
                }
              )
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
            href: "https://www.gesetze-im-internet.de/milog/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Mindestlohngesetz (MiLoG) – Gesetze im Internet"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bmas.de/DE/Arbeit/Arbeitsrecht/Mindestlohn/mindestlohn.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesministerium für Arbeit und Soziales – Mindestlohn"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bundesregierung.de/breg-de/aktuelles/mindestlohn-2025",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesregierung – Mindestlohn 2025"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.destatis.de/DE/Themen/Arbeit/Verdienste/Verdienste-Verdienstunterschiede/_inhalt.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Statistisches Bundesamt – Verdienste"
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
const $$StundenlohnRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "Stundenlohn-Rechner 2025 \u2013 Gehalt in Stundenlohn umrechnen";
  const description = "Stundenlohn Rechner 2025: Berechnen Sie Ihren Stundenlohn aus dem Monatsgehalt oder umgekehrt. Mit Mindestlohn-Vergleich, Sonderzahlungen & Formel. Kostenlos!";
  const keywords = "Stundenlohn Rechner, Stundenlohn berechnen, Gehalt in Stundenlohn, Stundenlohn aus Monatsgehalt, Stundenlohn Formel, Stundenlohn berechnen Formel, Brutto Stundenlohn, Stundenlohn 2025, Mindestlohn Rechner, Stundenlohn ausrechnen, was verdiene ich pro Stunde, Monatsgehalt in Stundenlohn, Stundenlohn Tabelle, Stundenlohn 40 Stunden Woche";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<main class="min-h-screen pb-8"> <!-- Header mit Zur\xFCck-Button --> <header class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>\nAlle Rechner\n</a> <div class="flex items-center gap-3"> <span class="text-4xl">\u23F0</span> <div> <h1 class="text-2xl font-bold">Stundenlohn-Rechner</h1> <p class="text-blue-100 text-sm">Gehalt \u2194 Stundenlohn umrechnen 2025</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ', ' </div> <!-- SEO Content Section --> <div class="max-w-2xl mx-auto px-4 mt-8"> <div class="bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">Stundenlohn berechnen: Formel & Anleitung 2025</h2> <div class="prose prose-sm text-gray-600 space-y-4"> <p>\nMit unserem <strong>Stundenlohn-Rechner</strong> k\xF6nnen Sie ganz einfach Ihren\n<strong>Brutto-Stundenlohn aus dem Monatsgehalt berechnen</strong> \u2013 oder umgekehrt. \n            Egal ob f\xFCr Gehaltsverhandlungen, \xDCberstunden-Abrechnung oder den Vergleich von \n            Jobangeboten: Der Stundenlohn ist eine wichtige Kennzahl.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Stundenlohn berechnen: Die Formel</h3> <p>\nDie <strong>Formel zur Berechnung des Stundenlohns</strong> aus dem Monatsgehalt lautet:\n</p> <div class="bg-blue-50 p-4 rounded-lg my-4"> <p class="text-center font-mono text-lg text-blue-900"> <strong>Stundenlohn = Monatsgehalt \xF7 (Wochenstunden \xD7 4,33)</strong> </p> </div> <p>\nDer Faktor <strong>4,33</strong> ergibt sich aus der durchschnittlichen Anzahl von \n            Wochen pro Monat (52 Wochen \xF7 12 Monate = 4,33).\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Beispielrechnung: 3.500 \u20AC Monatsgehalt</h3> <p>\nBei einem <strong>Bruttogehalt von 3.500 \u20AC</strong> und einer 40-Stunden-Woche:\n</p> <ul class="list-disc pl-5 space-y-1"> <li>Monatliche Arbeitsstunden: 40 \xD7 4,33 = <strong>173,2 Stunden</strong></li> <li>Stundenlohn: 3.500 \u20AC \xF7 173,2 = <strong>20,21 \u20AC pro Stunde</strong></li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Mindestlohn 2025 in Deutschland</h3> <p>\nDer <strong>gesetzliche Mindestlohn</strong> betr\xE4gt seit dem 1. Januar 2025\n<strong>12,82 \u20AC pro Stunde</strong>. Bei einer Vollzeitstelle (40 Stunden/Woche) \n            entspricht dies einem Mindest-Bruttogehalt von etwa <strong>2.220 \u20AC im Monat</strong>.\n</p> <p>\nDer Mindestlohn gilt f\xFCr fast alle Arbeitnehmer in Deutschland. Ausnahmen gibt es f\xFCr:\n</p> <ul class="list-disc pl-5 space-y-1"> <li>Auszubildende (eigene Mindestausbildungsverg\xFCtung)</li> <li>Pflichtpraktikanten im Studium</li> <li>Langzeitarbeitslose in den ersten 6 Monaten</li> <li>Jugendliche unter 18 ohne abgeschlossene Berufsausbildung</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Stundenlohn bei Teilzeit</h3> <p>\nDer <strong>Stundenlohn bleibt bei Teilzeit gleich</strong> \u2013 nur die Anzahl der \n            gearbeiteten Stunden \xE4ndert sich. Bei einem Stundenlohn von 20 \u20AC ergibt sich:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>20 Stunden/Woche:</strong> 20 \xD7 4,33 \xD7 20 \u20AC = 1.732 \u20AC brutto/Monat</li> <li><strong>30 Stunden/Woche:</strong> 30 \xD7 4,33 \xD7 20 \u20AC = 2.598 \u20AC brutto/Monat</li> <li><strong>40 Stunden/Woche:</strong> 40 \xD7 4,33 \xD7 20 \u20AC = 3.464 \u20AC brutto/Monat</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Warum der Stundenlohn wichtig ist</h3> <p>\nDer Stundenlohn ist eine wichtige Kennzahl f\xFCr verschiedene Situationen:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Gehaltsverhandlung:</strong> Vergleichen Sie Ihr Gehalt mit Branchenstandards</li> <li><strong>Jobwechsel:</strong> Vergleichen Sie Angebote mit unterschiedlichen Arbeitszeiten</li> <li><strong>\xDCberstunden:</strong> Basis f\xFCr \xDCberstundenverg\xFCtung und Zuschl\xE4ge</li> <li><strong>Freelancing:</strong> Kalkulieren Sie Ihren Stundensatz f\xFCr Auftr\xE4ge</li> <li><strong>Nebenjob:</strong> Pr\xFCfen Sie, ob der Nebenjob fair bezahlt wird</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Sonderzahlungen ber\xFCcksichtigen</h3> <p>\nBei der Berechnung des <strong>effektiven Stundenlohns</strong> k\xF6nnen auch\n<strong>Urlaubs- und Weihnachtsgeld</strong> einbezogen werden. Dann erh\xF6ht sich \n            das Jahresgehalt, was zu einem h\xF6heren effektiven Stundenlohn f\xFChrt:\n</p> <p> <strong>Beispiel:</strong> Bei 3.500 \u20AC Monatsgehalt + 1 Monatsgehalt Weihnachtsgeld + \n            0,5 Monatsgeh\xE4lter Urlaubsgeld:\n</p> <ul class="list-disc pl-5 space-y-1"> <li>Jahresgehalt: 3.500 \u20AC \xD7 13,5 = 47.250 \u20AC</li> <li>Effektiver Stundenlohn: 47.250 \u20AC \xF7 2.080 Std. = <strong>22,72 \u20AC / Stunde</strong></li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Brutto vs. Netto Stundenlohn</h3> <p>\nDer in diesem Rechner berechnete Stundenlohn ist der <strong>Brutto-Stundenlohn</strong>\n\u2013 also vor Abzug von Steuern und Sozialabgaben. Der tats\xE4chliche Netto-Stundenlohn \n            h\xE4ngt von Ihrer Steuerklasse, Kinderfreibetr\xE4gen und Sozialabgaben ab.\n</p> <p>\nF\xFCr die Berechnung Ihres Nettogehalts nutzen Sie unseren\n<a href="/brutto-netto-rechner" class="text-blue-600 hover:underline">Brutto-Netto-Rechner</a>.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Durchschnittliche Stundenl\xF6hne in Deutschland</h3> <p>\nNach Angaben des Statistischen Bundesamts lag der durchschnittliche Brutto-Stundenverdienst \n            in Deutschland 2024 bei etwa <strong>25 \u20AC</strong>. Die Unterschiede nach Branchen sind gro\xDF:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Finanz- und Versicherungsbranche:</strong> ca. 36 \u20AC/Stunde</li> <li><strong>IT und Kommunikation:</strong> ca. 34 \u20AC/Stunde</li> <li><strong>Verarbeitendes Gewerbe:</strong> ca. 27 \u20AC/Stunde</li> <li><strong>Handel:</strong> ca. 21 \u20AC/Stunde</li> <li><strong>Gastgewerbe:</strong> ca. 15 \u20AC/Stunde</li> </ul> </div> </div> </div> </main>  <script type="application/ld+json">', '<\/script>  <script type="application/ld+json">', '<\/script>  <script type="application/ld+json">', "<\/script> "])), maybeRenderHead(), renderComponent($$result2, "StundenlohnRechner", StundenlohnRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/StundenlohnRechner", "client:component-export": "default" }), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Stundenlohn-Rechner 2025",
    "description": description,
    "url": "https://deutschland-rechner.de/stundenlohn-rechner",
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
        "name": "Wie berechne ich meinen Stundenlohn aus dem Monatsgehalt?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Formel: Stundenlohn = Monatsgehalt \xF7 (Wochenstunden \xD7 4,33). Bei 3.500 \u20AC Monatsgehalt und 40 Wochenstunden: 3.500 \u20AC \xF7 173,2 = 20,21 \u20AC pro Stunde."
        }
      },
      {
        "@type": "Question",
        "name": "Wie hoch ist der Mindestlohn 2025 in Deutschland?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Der gesetzliche Mindestlohn betr\xE4gt seit dem 1. Januar 2025 12,82 \u20AC pro Stunde. Bei einer 40-Stunden-Woche entspricht dies einem Mindest-Bruttogehalt von etwa 2.220 \u20AC im Monat."
        }
      },
      {
        "@type": "Question",
        "name": "Wie viele Arbeitsstunden hat ein Monat?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Bei einer 40-Stunden-Woche hat ein Monat durchschnittlich 173,33 Arbeitsstunden (40 Stunden \xD7 52 Wochen \xF7 12 Monate). Dies entspricht dem Faktor 4,33 Wochen pro Monat."
        }
      },
      {
        "@type": "Question",
        "name": "Ist der Stundenlohn bei Teilzeit niedriger?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nein, der Stundenlohn bleibt bei Teilzeit gleich. Nur die Anzahl der gearbeiteten Stunden und damit das Monatsgehalt \xE4ndert sich. Bei fairem Teilzeit-Verh\xE4ltnis sollte der gleiche Stundenlohn wie bei Vollzeit gezahlt werden."
        }
      },
      {
        "@type": "Question",
        "name": "Wie hoch ist der durchschnittliche Stundenlohn in Deutschland?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Der durchschnittliche Brutto-Stundenverdienst in Deutschland liegt 2024 bei etwa 25 \u20AC pro Stunde. Die Unterschiede nach Branchen sind gro\xDF \u2013 von ca. 15 \u20AC im Gastgewerbe bis ca. 36 \u20AC in der Finanzbranche."
        }
      }
    ]
  })), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Stundenlohn aus Monatsgehalt berechnen",
    "description": "Anleitung zur Berechnung des Stundenlohns aus dem Monatsgehalt",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Monatsgehalt ermitteln",
        "text": "Nehmen Sie Ihr Brutto-Monatsgehalt (ohne Sonderzahlungen wie Urlaubs- oder Weihnachtsgeld)."
      },
      {
        "@type": "HowToStep",
        "name": "W\xF6chentliche Arbeitszeit bestimmen",
        "text": "Ermitteln Sie Ihre vertraglich vereinbarte Wochenarbeitszeit (z.B. 40 Stunden)."
      },
      {
        "@type": "HowToStep",
        "name": "Monatliche Arbeitsstunden berechnen",
        "text": "Multiplizieren Sie die Wochenstunden mit 4,33 (durchschnittliche Wochen pro Monat). Bei 40 Stunden: 40 \xD7 4,33 = 173,2 Stunden."
      },
      {
        "@type": "HowToStep",
        "name": "Stundenlohn berechnen",
        "text": "Teilen Sie das Monatsgehalt durch die monatlichen Arbeitsstunden. Beispiel: 3.500 \u20AC \xF7 173,2 = 20,21 \u20AC pro Stunde."
      }
    ]
  }))) })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/stundenlohn-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/stundenlohn-rechner.astro";
const $$url = "/stundenlohn-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$StundenlohnRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
