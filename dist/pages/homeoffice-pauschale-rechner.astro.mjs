/* empty css                                             */
import { c as createComponent, a as renderTemplate, r as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DmT1JwUR.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const HOMEOFFICE_PAUSCHALE_PRO_TAG = 6;
const HOMEOFFICE_MAX_TAGE = 210;
const HOMEOFFICE_MAX_BETRAG = HOMEOFFICE_PAUSCHALE_PRO_TAG * HOMEOFFICE_MAX_TAGE;
const ARBEITSTAGE_PRO_WOCHE = [1, 2, 3, 4, 5];
const GRENZSTEUERSAETZE = {
  niedrig: 0.14,
  // Grundfreibetrag gerade überschritten
  mittel: 0.3,
  // Durchschnitt
  hoch: 0.42,
  // Spitzensteuersatz
  reich: 0.45
  // Reichensteuer
};
function HomeofficeRechner() {
  const [homeofficeTagePro_woche, setHomeofficeTagePro_woche] = useState(3);
  const [arbeitsWochenProJahr, setArbeitsWochenProJahr] = useState(46);
  const [hatArbeitszimmer, setHatArbeitszimmer] = useState(false);
  const [arbeitszimmerKosten, setArbeitszimmerKosten] = useState(0);
  const [grenzsteuersatz, setGrenzsteuersatz] = useState("mittel");
  const [kirchensteuer, setKirchensteuer] = useState(false);
  const ergebnis = useMemo(() => {
    const homeofficeTagePro_Jahr = homeofficeTagePro_woche * arbeitsWochenProJahr;
    const anrechenbareTage = Math.min(homeofficeTagePro_Jahr, HOMEOFFICE_MAX_TAGE);
    const homeofficePauschale = anrechenbareTage * HOMEOFFICE_PAUSCHALE_PRO_TAG;
    const arbeitszimmerAbzug = hatArbeitszimmer ? arbeitszimmerKosten : 0;
    const gesamtWerbungskosten = Math.max(homeofficePauschale, arbeitszimmerAbzug);
    const besserePauschale = homeofficePauschale >= arbeitszimmerAbzug;
    let effektiverSteuersatz = GRENZSTEUERSAETZE[grenzsteuersatz];
    effektiverSteuersatz *= 1.055;
    if (kirchensteuer) {
      effektiverSteuersatz *= 1.085;
    }
    const steuerersparnis = Math.round(gesamtWerbungskosten * effektiverSteuersatz);
    const tageUeberMaximum = Math.max(0, homeofficeTagePro_Jahr - HOMEOFFICE_MAX_TAGE);
    const nichtAnrechenbareWerbungskosten = tageUeberMaximum * HOMEOFFICE_PAUSCHALE_PRO_TAG;
    return {
      homeofficeTagePro_Jahr,
      anrechenbareTage,
      tageUeberMaximum,
      nichtAnrechenbareWerbungskosten,
      homeofficePauschale,
      arbeitszimmerAbzug,
      gesamtWerbungskosten,
      besserePauschale,
      steuerersparnis,
      effektiverSteuersatz: Math.round(effektiverSteuersatz * 100),
      maxBetrag: HOMEOFFICE_MAX_BETRAG,
      maxTage: HOMEOFFICE_MAX_TAGE,
      pauschaleProTag: HOMEOFFICE_PAUSCHALE_PRO_TAG
    };
  }, [
    homeofficeTagePro_woche,
    arbeitsWochenProJahr,
    hatArbeitszimmer,
    arbeitszimmerKosten,
    grenzsteuersatz,
    kirchensteuer
  ]);
  const formatEuro = (n) => n.toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }) + " €";
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Homeoffice-Tage pro Woche" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Wie viele Tage arbeiten Sie von zuhause?" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-5 gap-2", children: ARBEITSTAGE_PRO_WOCHE.map((tage) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setHomeofficeTagePro_woche(tage),
            className: `py-4 px-2 rounded-xl text-center transition-all ${homeofficeTagePro_woche === tage ? "bg-teal-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: [
              /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold", children: tage }),
              /* @__PURE__ */ jsx("span", { className: "block text-xs mt-1", children: tage === 1 ? "Tag" : "Tage" })
            ]
          },
          tage
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Arbeitswochen pro Jahr" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "52 Wochen abzüglich Urlaub, Krankheit, Feiertage" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: arbeitsWochenProJahr,
              onChange: (e) => setArbeitsWochenProJahr(Math.min(52, Math.max(1, Number(e.target.value)))),
              className: "w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none",
              min: "1",
              max: "52"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400", children: "Wochen" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: arbeitsWochenProJahr,
            onChange: (e) => setArbeitsWochenProJahr(Number(e.target.value)),
            className: "w-full mt-3 accent-teal-500",
            min: "40",
            max: "52"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "40 Wochen" }),
          /* @__PURE__ */ jsx("span", { children: "46 (Standard)" }),
          /* @__PURE__ */ jsx("span", { children: "52 Wochen" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 p-3 bg-teal-50 rounded-lg", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-teal-800", children: [
          /* @__PURE__ */ jsxs("strong", { children: [
            "= ",
            ergebnis.homeofficeTagePro_Jahr,
            " Homeoffice-Tage"
          ] }),
          " pro Jahr",
          ergebnis.tageUeberMaximum > 0 && /* @__PURE__ */ jsxs("span", { className: "text-amber-700 block mt-1", children: [
            "⚠️ Davon nur ",
            ergebnis.anrechenbareTage,
            " Tage anrechenbar (Maximum 210)"
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Ihr Grenzsteuersatz" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Für die Berechnung der Steuerersparnis" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setGrenzsteuersatz("niedrig"),
              className: `py-3 px-4 rounded-xl text-left transition-all ${grenzsteuersatz === "niedrig" ? "bg-teal-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "font-bold", children: "~14%" }),
                /* @__PURE__ */ jsx("span", { className: "block text-xs opacity-80", children: "Niedriges Einkommen" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setGrenzsteuersatz("mittel"),
              className: `py-3 px-4 rounded-xl text-left transition-all ${grenzsteuersatz === "mittel" ? "bg-teal-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "font-bold", children: "~30%" }),
                /* @__PURE__ */ jsx("span", { className: "block text-xs opacity-80", children: "Mittleres Einkommen" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setGrenzsteuersatz("hoch"),
              className: `py-3 px-4 rounded-xl text-left transition-all ${grenzsteuersatz === "hoch" ? "bg-teal-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "font-bold", children: "~42%" }),
                /* @__PURE__ */ jsx("span", { className: "block text-xs opacity-80", children: "Hohes Einkommen" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setGrenzsteuersatz("reich"),
              className: `py-3 px-4 rounded-xl text-left transition-all ${grenzsteuersatz === "reich" ? "bg-teal-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "font-bold", children: "~45%" }),
                /* @__PURE__ */ jsx("span", { className: "block text-xs opacity-80", children: "Spitzensteuersatz" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setHatArbeitszimmer(!hatArbeitszimmer),
            className: `w-full py-4 px-4 rounded-xl font-medium transition-all flex items-center justify-between ${hatArbeitszimmer ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: [
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🏠" }),
                /* @__PURE__ */ jsx("span", { children: "Häusliches Arbeitszimmer vorhanden?" })
              ] }),
              /* @__PURE__ */ jsx("span", { children: hatArbeitszimmer ? "✓ Ja" : "✗ Nein" })
            ]
          }
        ),
        hatArbeitszimmer && /* @__PURE__ */ jsxs("div", { className: "mt-4 p-4 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Jährliche Kosten für das Arbeitszimmer" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Anteilige Miete, Strom, Heizung, etc." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: arbeitszimmerKosten,
                onChange: (e) => setArbeitszimmerKosten(Math.max(0, Number(e.target.value))),
                className: "w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none",
                min: "0",
                max: "10000",
                step: "50"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400", children: "€/Jahr" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-2", children: "ℹ️ Das Arbeitszimmer muss der Mittelpunkt Ihrer beruflichen Tätigkeit sein" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setKirchensteuer(!kirchensteuer),
          className: `w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-between ${kirchensteuer ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
          children: [
            /* @__PURE__ */ jsx("span", { children: "⛪ Kirchensteuer" }),
            /* @__PURE__ */ jsx("span", { children: kirchensteuer ? "✓ Ja" : "✗ Nein" })
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl shadow-lg p-6 text-white mb-6 bg-gradient-to-br from-teal-500 to-emerald-600", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: "🏡 Ihre Homeoffice-Pauschale 2025" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuro(ergebnis.homeofficePauschale) }),
          /* @__PURE__ */ jsx("span", { className: "text-xl opacity-80", children: "/ Jahr" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-teal-100 mt-2 text-sm", children: [
          "Für ",
          /* @__PURE__ */ jsxs("strong", { children: [
            ergebnis.anrechenbareTage,
            " Homeoffice-Tage"
          ] }),
          " à ",
          ergebnis.pauschaleProTag,
          "€"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Werbungskosten" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.gesamtWerbungskosten) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Steuerersparnis" }),
          /* @__PURE__ */ jsxs("div", { className: "text-xl font-bold text-green-200", children: [
            "~",
            formatEuro(ergebnis.steuerersparnis)
          ] })
        ] })
      ] }),
      ergebnis.tageUeberMaximum > 0 && /* @__PURE__ */ jsx("div", { className: "mt-4 p-3 bg-amber-500/30 rounded-xl", children: /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
        "⚠️ ",
        /* @__PURE__ */ jsxs("strong", { children: [
          ergebnis.tageUeberMaximum,
          " Tage"
        ] }),
        " überschreiten das Maximum von 210 Tagen (",
        formatEuro(ergebnis.nichtAnrechenbareWerbungskosten),
        " nicht anrechenbar)"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Berechnungsdetails" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Homeoffice-Tage pro Woche" }),
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-gray-900", children: [
            homeofficeTagePro_woche,
            " Tage"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "× Arbeitswochen pro Jahr" }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-900", children: [
            arbeitsWochenProJahr,
            " Wochen"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "= Homeoffice-Tage pro Jahr" }),
          /* @__PURE__ */ jsxs("span", { className: "font-medium text-gray-900", children: [
            ergebnis.homeofficeTagePro_Jahr,
            " Tage"
          ] })
        ] }),
        ergebnis.tageUeberMaximum > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-amber-600", children: [
          /* @__PURE__ */ jsx("span", { children: "− Über Maximum (210 Tage)" }),
          /* @__PURE__ */ jsxs("span", { children: [
            ergebnis.tageUeberMaximum,
            " Tage"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-gray-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "Anrechenbare Tage" }),
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-gray-900", children: [
            ergebnis.anrechenbareTage,
            " Tage"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "× Pauschale pro Tag" }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-900", children: [
            ergebnis.pauschaleProTag,
            " €"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-3 bg-teal-100 -mx-6 px-6 rounded-b-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-teal-800", children: "= Homeoffice-Pauschale" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-2xl text-teal-900", children: formatEuro(ergebnis.homeofficePauschale) })
        ] })
      ] })
    ] }),
    hatArbeitszimmer && arbeitszimmerKosten > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📈 Pauschale vs. Arbeitszimmer" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: `p-4 rounded-xl ${ergebnis.besserePauschale ? "bg-green-50 ring-2 ring-green-500" : "bg-gray-50"}`, children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-2", children: [
            /* @__PURE__ */ jsxs("span", { className: "font-medium text-gray-800", children: [
              "🏡 Homeoffice-Pauschale",
              ergebnis.besserePauschale && /* @__PURE__ */ jsx("span", { className: "ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full", children: "Besser!" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-gray-900", children: formatEuro(ergebnis.homeofficePauschale) })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-600", children: [
            "6€/Tag × ",
            ergebnis.anrechenbareTage,
            " Tage – kein Nachweis nötig"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `p-4 rounded-xl ${!ergebnis.besserePauschale ? "bg-green-50 ring-2 ring-green-500" : "bg-gray-50"}`, children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-2", children: [
            /* @__PURE__ */ jsxs("span", { className: "font-medium text-gray-800", children: [
              "🏠 Arbeitszimmer (tatsächliche Kosten)",
              !ergebnis.besserePauschale && /* @__PURE__ */ jsx("span", { className: "ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full", children: "Besser!" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-gray-900", children: formatEuro(ergebnis.arbeitszimmerAbzug) })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-600", children: "Nachweis erforderlich: Rechnungen, Kontoauszüge, Mietanteil" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "p-4 bg-blue-50 rounded-xl", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-blue-800", children: [
          "💡 ",
          /* @__PURE__ */ jsx("strong", { children: "Tipp:" }),
          " Sie können nur ",
          /* @__PURE__ */ jsx("em", { children: "eine" }),
          " der beiden Methoden wählen – nicht kombinieren. Nehmen Sie die mit dem höheren Abzug!"
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "💰 Ihre geschätzte Steuerersparnis" }),
      /* @__PURE__ */ jsxs("div", { className: "p-4 bg-green-50 rounded-xl mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700", children: "Werbungskostenabzug" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.gesamtWerbungskosten) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mt-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700", children: "× Grenzsteuersatz (inkl. Soli/KiSt)" }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-900", children: [
            "~",
            ergebnis.effektiverSteuersatz,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsx("hr", { className: "my-3 border-green-200" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-green-800", children: "≈ Steuerersparnis" }),
          /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold text-green-700", children: formatEuro(ergebnis.steuerersparnis) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "* Dies ist eine Schätzung. Die tatsächliche Ersparnis hängt von Ihrer individuellen Steuersituation ab und wird im Steuerbescheid festgelegt." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert die Homeoffice-Pauschale" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "6 Euro pro Tag:" }),
            " Für jeden Tag, den Sie ausschließlich im Homeoffice arbeiten"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Maximum 1.260€:" }),
            " Pro Jahr können maximal 210 Tage (× 6€ = 1.260€) angesetzt werden"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Kein separates Zimmer nötig:" }),
            " Die Pauschale gilt auch, wenn Sie am Küchentisch arbeiten"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Werbungskosten:" }),
            " Die Pauschale zählt zu den Werbungskosten in Ihrer Steuererklärung (Anlage N)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Keine Pendlerpauschale:" }),
            " Für Homeoffice-Tage entfällt die Entfernungspauschale"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Dauerhaft:" }),
            " Die Pauschale wurde seit 2023 dauerhaft ins Steuerrecht aufgenommen"
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
            /* @__PURE__ */ jsx("strong", { children: "Überwiegend Homeoffice:" }),
            " Die Pauschale gilt nur für Tage, an denen Sie überwiegend von zuhause arbeiten"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Kein Doppelabzug:" }),
            " Für denselben Tag können Sie nicht Homeoffice-Pauschale UND Pendlerpauschale ansetzen"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Werbungskostenpauschale:" }),
            " Die Homeoffice-Pauschale wird mit der Werbungskostenpauschale (1.230€) verrechnet"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Nachweis:" }),
            " Bei Nachfrage vom Finanzamt: Arbeitgebernachweis oder Aufzeichnungen über Homeoffice-Tage"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Arbeitszimmer-Wahl:" }),
            " Wenn Sie ein häusliches Arbeitszimmer haben, wählen Sie die günstigere Option"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-blue-800 mb-3", children: "🆕 Regelungen 2025" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-blue-700", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Pauschale:" }),
            " 6€ pro Tag (seit 2023 dauerhaft)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Maximum:" }),
            " 210 Tage = 1.260€ pro Jahr"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Werbungskostenpauschale:" }),
            " 1.230€ (davon profitieren Sie nur, wenn Ihre Werbungskosten höher sind)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Pendlerpauschale:" }),
            " 0,30€/km (ab 21. km: 0,38€/km) – nicht für Homeoffice-Tage"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📝 Beispielrechnung: Lohnt sich Homeoffice?" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-4 text-sm", children: /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gray-50 rounded-xl", children: [
        /* @__PURE__ */ jsx("p", { className: "font-semibold mb-2", children: "Annahme: 3 Tage Homeoffice, 2 Tage Büro (30km Entfernung)" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-gray-600", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { children: "Homeoffice: 3 Tage × 46 Wochen × 6€" }),
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: "828€" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { children: "Pendeln: 2 Tage × 46 Wochen × 30km × 0,30€ × 2" }),
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: "1.656€" })
          ] }),
          /* @__PURE__ */ jsx("hr", { className: "my-2" }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between font-bold text-gray-800", children: [
            /* @__PURE__ */ jsx("span", { children: "Gesamte Werbungskosten" }),
            /* @__PURE__ */ jsx("span", { children: "2.484€" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-green-700", children: [
            /* @__PURE__ */ jsx("span", { children: "- Werbungskostenpauschale" }),
            /* @__PURE__ */ jsx("span", { children: "1.230€" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between font-bold text-green-800", children: [
            /* @__PURE__ */ jsx("span", { children: "= Zusätzlicher Steuervorteil" }),
            /* @__PURE__ */ jsx("span", { children: "1.254€" })
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörde" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-teal-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-teal-900", children: "Finanzamt" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-teal-700 mt-1", children: "Die Homeoffice-Pauschale wird in der Steuererklärung (Anlage N) geltend gemacht." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📱" }),
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
              /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs mt-1", children: "Steuererklärung online einreichen" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🏢" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Finanzamt vor Ort" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.bzst.de/DE/Service/Finanzamtsuche/finanzamtsuche_node.html",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "Finanzamt-Suche →"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📋" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "In der Steuererklärung eintragen" }),
            /* @__PURE__ */ jsxs("ul", { className: "text-gray-600 mt-1 space-y-1", children: [
              /* @__PURE__ */ jsx("li", { children: '• Anlage N, Zeile 45: "Aufwendungen für ein häusliches Arbeitszimmer"' }),
              /* @__PURE__ */ jsx("li", { children: "• Anzahl der Homeoffice-Tage dokumentieren" }),
              /* @__PURE__ */ jsx("li", { children: "• Bei Prüfung: Bescheinigung vom Arbeitgeber hilfreich" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-blue-800 mb-3", children: "🔗 Das könnte Sie auch interessieren" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/pendlerpauschale-rechner",
            className: "inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium",
            children: "🛣️ Pendlerpauschale-Rechner →"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/brutto-netto-rechner",
            className: "inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium",
            children: "💵 Brutto-Netto-Rechner →"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/einkommensteuer-rechner",
            className: "inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium",
            children: "🧾 Einkommensteuer-Rechner →"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gray-50 rounded-xl", children: [
      /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-gray-500 uppercase mb-2", children: "Quellen & Rechtsgrundlagen" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/estg/__4.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline font-medium",
            children: "★ § 4 Abs. 5 Nr. 6c EStG – Tagespauschale (Gesetzestext)"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bundesfinanzministerium.de/Content/DE/FAQ/Steuern/Home-Office-Pauschale/faq-homeoffice-pauschale.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BMF – FAQ Homeoffice-Pauschale"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.vlh.de/arbeiten-pendeln/beruf/homeoffice-pauschale-so-setzen-sie-die-kosten-ab.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "VLH – Homeoffice-Pauschale absetzen"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.haufe.de/steuern/finanzverwaltung/homeoffice-pauschale-wird-dauerhaft-eingefuehrt_164_586644.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Haufe – Homeoffice-Pauschale dauerhaft"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 mt-3", children: [
        /* @__PURE__ */ jsx("strong", { children: "Offizielle Berechnung:" }),
        /* @__PURE__ */ jsx("br", {}),
        "Pauschale = Homeoffice-Tage × 6€ (max. 210 Tage = 1.260€/Jahr)"
      ] })
    ] })
  ] });
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$HomeofficePauschaleRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "Homeoffice-Pauschale Rechner 2025 \u2013 6\u20AC/Tag, max. 1.260\u20AC | Steuerersparnis berechnen";
  const description = "Homeoffice-Pauschale 2025 berechnen: 6\u20AC pro Tag, max. 210 Tage = 1.260\u20AC. Kostenloser Rechner mit Steuerersparnis, Vergleich Arbeitszimmer. Jetzt berechnen!";
  const keywords = "Homeoffice Pauschale Rechner, Homeoffice Pauschale 2025, Homeoffice absetzen, Homeoffice Steuer, 6 Euro Pauschale, Home Office Steuererkl\xE4rung, Homeoffice-Pauschale berechnen, Arbeitszimmer absetzen, Werbungskosten Homeoffice, Homeoffice Tage absetzen, Anlage N Homeoffice, Homeoffice Finanzamt";
  return renderTemplate(_a || (_a = __template(["", ' <script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [\n    {\n      "@type": "Question",\n      "name": "Wie hoch ist die Homeoffice-Pauschale 2025?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "Die Homeoffice-Pauschale betr\xE4gt 6 Euro pro Tag. Pro Jahr k\xF6nnen maximal 210 Tage angesetzt werden, also maximal 1.260 Euro."\n      }\n    },\n    {\n      "@type": "Question",\n      "name": "Brauche ich ein separates Arbeitszimmer f\xFCr die Homeoffice-Pauschale?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "Nein, ein separates Arbeitszimmer ist nicht erforderlich. Die Pauschale gilt auch, wenn Sie am K\xFCchentisch oder im Wohnzimmer arbeiten."\n      }\n    },\n    {\n      "@type": "Question",\n      "name": "Wo trage ich die Homeoffice-Pauschale in der Steuererkl\xE4rung ein?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "Die Homeoffice-Pauschale wird in der Anlage N, Zeile 45 eingetragen. Geben Sie die Anzahl der Homeoffice-Tage und den Gesamtbetrag an."\n      }\n    },\n    {\n      "@type": "Question",\n      "name": "Kann ich Homeoffice-Pauschale und Pendlerpauschale kombinieren?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "Nicht am selben Tag. F\xFCr Homeoffice-Tage gibt es nur die Homeoffice-Pauschale, f\xFCr Pendel-Tage nur die Entfernungspauschale. Beide k\xF6nnen aber im selben Jahr nebeneinander genutzt werden."\n      }\n    },\n    {\n      "@type": "Question",\n      "name": "Gilt die Homeoffice-Pauschale auch f\xFCr Selbstst\xE4ndige?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "Ja, Selbstst\xE4ndige k\xF6nnen die Homeoffice-Pauschale als Betriebsausgabe ansetzen. Die Regelungen sind identisch: 6\u20AC pro Tag, maximal 1.260\u20AC pro Jahr."\n      }\n    }\n  ]\n}\n<\/script> <script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebApplication",\n  "name": "Homeoffice-Pauschale Rechner 2025",\n  "description": "Berechnen Sie Ihre Homeoffice-Pauschale 2025: 6\u20AC pro Tag, max. 1.260\u20AC. Kostenloser Online-Rechner mit Steuerersparnis und Vergleich zum h\xE4uslichen Arbeitszimmer.",\n  "url": "https://deutschland-rechner.de/homeoffice-pauschale-rechner",\n  "applicationCategory": "FinanceApplication",\n  "operatingSystem": "Web",\n  "offers": {\n    "@type": "Offer",\n    "price": "0",\n    "priceCurrency": "EUR"\n  }\n}\n<\/script>'])), renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 py-8 px-4"> <div class="max-w-2xl mx-auto"> <!-- Header --> <div class="text-center mb-8"> <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-lg mb-4"> <span class="text-4xl">🏡</span> </div> <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
Homeoffice-Pauschale Rechner 2025
</h1> <p class="text-gray-600 max-w-lg mx-auto">
Berechnen Sie Ihre Homeoffice-Pauschale: 6€ pro Tag, maximal 1.260€ pro Jahr. Inklusive Steuerersparnis!
</p> </div> <!-- Calculator Component --> ${renderComponent($$result2, "HomeofficeRechner", HomeofficeRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/HomeofficeRechner.tsx", "client:component-export": "default" })} <!-- SEO Content Section --> <div class="mt-12 bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">📚 Alles Wichtige zur Homeoffice-Pauschale</h2> <div class="space-y-4 text-sm text-gray-600"> <div> <h3 class="font-semibold text-gray-800 mb-2">Was ist die Homeoffice-Pauschale?</h3> <p>
Die Homeoffice-Pauschale ist ein steuerlicher Abzugsbetrag für Arbeitnehmer, 
              die von zuhause arbeiten. Sie wurde während der Corona-Pandemie eingeführt 
              und ist seit 2023 dauerhaft im Steuerrecht verankert. Für jeden Tag im 
              Homeoffice können Sie <strong>6 Euro</strong> als Werbungskosten absetzen – 
              ohne Nachweis der tatsächlichen Kosten.
</p> </div> <div> <h3 class="font-semibold text-gray-800 mb-2">Wie viel Homeoffice-Pauschale bekomme ich?</h3> <p>
Pro Homeoffice-Tag können Sie <strong>6 Euro</strong> absetzen. Das Maximum 
              liegt bei <strong>210 Tagen pro Jahr</strong>, also maximal <strong>1.260 Euro</strong>. 
              Bei einem Grenzsteuersatz von 30% bedeutet das eine Steuerersparnis von bis zu 
              ca. 400 Euro pro Jahr.
</p> </div> <div> <h3 class="font-semibold text-gray-800 mb-2">Brauche ich ein separates Arbeitszimmer?</h3> <p>
Nein! Das ist der große Vorteil der Homeoffice-Pauschale. Sie gilt auch, 
              wenn Sie am Küchentisch, auf dem Sofa oder in einer Ecke Ihres Wohnzimmers 
              arbeiten. Ein abgeschlossenes, häusliches Arbeitszimmer ist <strong>nicht</strong> erforderlich.
</p> </div> <div> <h3 class="font-semibold text-gray-800 mb-2">Wann ist ein häusliches Arbeitszimmer besser?</h3> <p>
Wenn Sie ein separates Arbeitszimmer haben (abgeschlossener Raum, der fast 
              ausschließlich beruflich genutzt wird), können Sie eventuell mehr als die 
              Pauschale absetzen. Die anteiligen Kosten für Miete, Strom, Heizung etc. 
              können dann geltend gemacht werden – bei hohen Wohnkosten lohnt sich das oft mehr.
</p> </div> <div> <h3 class="font-semibold text-gray-800 mb-2">Kann ich Homeoffice-Pauschale und Pendlerpauschale kombinieren?</h3> <p> <strong>Nicht am selben Tag.</strong> Für Tage, an denen Sie im Homeoffice 
              arbeiten, können Sie keine Entfernungspauschale (Pendlerpauschale) geltend machen. 
              An Tagen, an denen Sie ins Büro pendeln, gilt wiederum die Pendlerpauschale – 
              nicht die Homeoffice-Pauschale.
</p> </div> </div> </div> <!-- FAQ Schema --> <div class="mt-8 bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">❓ Häufige Fragen zur Homeoffice-Pauschale</h2> <div class="space-y-4"> <details class="group"> <summary class="cursor-pointer font-medium text-gray-800 hover:text-teal-600">
Wo trage ich die Homeoffice-Pauschale in der Steuererklärung ein?
</summary> <p class="mt-2 text-sm text-gray-600 pl-4">
Die Homeoffice-Pauschale wird in der <strong>Anlage N</strong> eingetragen. 
              Sie finden den entsprechenden Eintrag in Zeile 45 ("Aufwendungen für ein 
              häusliches Arbeitszimmer / Homeoffice-Pauschale"). Geben Sie die Anzahl 
              der Homeoffice-Tage und den Gesamtbetrag an.
</p> </details> <details class="group"> <summary class="cursor-pointer font-medium text-gray-800 hover:text-teal-600">
Brauche ich einen Nachweis vom Arbeitgeber?
</summary> <p class="mt-2 text-sm text-gray-600 pl-4">
Grundsätzlich <strong>nein</strong>. Sie können die Pauschale auch ohne 
              Bescheinigung geltend machen. Bei Nachfragen des Finanzamts kann aber 
              eine Bestätigung des Arbeitgebers über die Homeoffice-Vereinbarung 
              oder ein Arbeitszeitnachweis hilfreich sein.
</p> </details> <details class="group"> <summary class="cursor-pointer font-medium text-gray-800 hover:text-teal-600">
Lohnt sich die Pauschale nur über der Werbungskostenpauschale?
</summary> <p class="mt-2 text-sm text-gray-600 pl-4">
Die <strong>Werbungskostenpauschale</strong> beträgt 1.230€ (2024/2025). 
              Wenn Ihre gesamten Werbungskosten (Homeoffice + Pendeln + Arbeitsmittel etc.) 
              darunter bleiben, profitieren Sie nicht zusätzlich. Erst wenn Sie die 1.230€ 
              überschreiten, wirkt sich die Homeoffice-Pauschale steuermindernd aus.
</p> </details> <details class="group"> <summary class="cursor-pointer font-medium text-gray-800 hover:text-teal-600">
Gilt die Pauschale auch für Selbstständige?
</summary> <p class="mt-2 text-sm text-gray-600 pl-4">
Ja! Selbstständige können die Homeoffice-Pauschale als
<strong>Betriebsausgabe</strong> ansetzen. Die Regelungen sind identisch: 
              6€ pro Tag, maximal 210 Tage = 1.260€ pro Jahr. Sie wird in der 
              Einnahmen-Überschuss-Rechnung (EÜR) erfasst.
</p> </details> <details class="group"> <summary class="cursor-pointer font-medium text-gray-800 hover:text-teal-600">
Was zählt als "Homeoffice-Tag"?
</summary> <p class="mt-2 text-sm text-gray-600 pl-4">
Ein Homeoffice-Tag liegt vor, wenn Sie <strong>überwiegend</strong> (mehr als 
              die Hälfte des Tages) von zuhause arbeiten. Wenn Sie morgens ins Büro gehen 
              und nachmittags zuhause weiterarbeiten, zählt das in der Regel <strong>nicht</strong>
als Homeoffice-Tag.
</p> </details> </div> </div> <!-- Back Link --> <div class="mt-8 text-center"> <a href="/" class="inline-flex items-center gap-2 text-teal-600 hover:text-teal-800 font-medium">
← Alle Rechner anzeigen
</a> </div> </div> </main> ` }));
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/homeoffice-pauschale-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/homeoffice-pauschale-rechner.astro";
const $$url = "/homeoffice-pauschale-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$HomeofficePauschaleRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
