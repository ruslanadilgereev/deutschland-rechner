/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, u as unescapeHTML, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DmT1JwUR.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const getProzentFaktor = (antrieb, bruttolistenpreis) => {
  switch (antrieb) {
    case "elektro":
      return bruttolistenpreis <= 7e4 ? 0.25 : 0.5;
    case "hybrid":
      return 0.5;
    case "verbrenner":
    default:
      return 1;
  }
};
const FAKTOR_WOHNUNG_ARBEIT = 0.03;
const FAKTOR_WOHNUNG_ARBEIT_ELEKTRO_GUENSTIG = 75e-4;
const FAKTOR_WOHNUNG_ARBEIT_ELEKTRO_HYBRID = 0.015;
const getFaktorWohnungArbeit = (antrieb, bruttolistenpreis) => {
  switch (antrieb) {
    case "elektro":
      return bruttolistenpreis <= 7e4 ? FAKTOR_WOHNUNG_ARBEIT_ELEKTRO_GUENSTIG : FAKTOR_WOHNUNG_ARBEIT_ELEKTRO_HYBRID;
    case "hybrid":
      return FAKTOR_WOHNUNG_ARBEIT_ELEKTRO_HYBRID;
    case "verbrenner":
    default:
      return FAKTOR_WOHNUNG_ARBEIT;
  }
};
const STEUERSAETZE = [
  { label: "14% (bis ~17.000€)", value: 0.14 },
  { label: "24% (bis ~30.000€)", value: 0.24 },
  { label: "33% (bis ~60.000€)", value: 0.33 },
  { label: "42% (bis ~277.000€)", value: 0.42 },
  { label: "45% (über 277.000€)", value: 0.45 }
];
function FirmenwagenRechner() {
  const [bruttolistenpreis, setBruttolistenpreis] = useState(45e3);
  const [antrieb, setAntrieb] = useState("verbrenner");
  const [entfernungKm, setEntfernungKm] = useState(25);
  const [fahrtenProMonat, setFahrtenProMonat] = useState(20);
  const [steuersatz, setSteuersatz] = useState(0.33);
  const [nutzungPrivat, setNutzungPrivat] = useState(true);
  const [sonderausstattung, setSonderausstattung] = useState(0);
  const [tatsaechlicheKostenJahr, setTatsaechlicheKostenJahr] = useState(8e3);
  const [privatKmAnteil, setPrivatKmAnteil] = useState(30);
  const ergebnis = useMemo(() => {
    const gesamtBLP = bruttolistenpreis + sonderausstattung;
    const blpGerundet = Math.floor(gesamtBLP / 100) * 100;
    const prozentFaktor = getProzentFaktor(antrieb, gesamtBLP);
    const faktorWohnungArbeit = getFaktorWohnungArbeit(antrieb, gesamtBLP);
    const geldwerterVorteilPrivat = blpGerundet * (prozentFaktor / 100);
    const geldwerterVorteilWohnungArbeit = blpGerundet * (faktorWohnungArbeit / 100) * entfernungKm;
    const einzelbewertungProFahrt = blpGerundet * (prozentFaktor / 100 / 30) * entfernungKm;
    const einzelbewertungMonat = einzelbewertungProFahrt * fahrtenProMonat;
    const guenstigerWohnungArbeit = einzelbewertungMonat < geldwerterVorteilWohnungArbeit ? "einzelbewertung" : "pauschal";
    const ersparnisBeiEinzelbewertung = geldwerterVorteilWohnungArbeit - einzelbewertungMonat;
    const geldwerterVorteilMonatPauschal = (nutzungPrivat ? geldwerterVorteilPrivat : 0) + geldwerterVorteilWohnungArbeit;
    const geldwerterVorteilMonatOptimal = (nutzungPrivat ? geldwerterVorteilPrivat : 0) + (guenstigerWohnungArbeit === "einzelbewertung" ? einzelbewertungMonat : geldwerterVorteilWohnungArbeit);
    const steuerMonatPauschal = geldwerterVorteilMonatPauschal * steuersatz;
    const steuerMonatOptimal = geldwerterVorteilMonatOptimal * steuersatz;
    const steuerJahrPauschal = steuerMonatPauschal * 12;
    const steuerJahrOptimal = steuerMonatOptimal * 12;
    const svAnteil = 0.2;
    const svMonat = geldwerterVorteilMonatOptimal * svAnteil;
    const svJahr = svMonat * 12;
    const gesamtbelastungMonat = steuerMonatOptimal + svMonat;
    const gesamtbelastungJahr = steuerJahrOptimal + svJahr;
    const fahrtenbuchGeldwerterVorteil = tatsaechlicheKostenJahr * privatKmAnteil / 100;
    const fahrtenbuchSteuerJahr = fahrtenbuchGeldwerterVorteil * steuersatz;
    const fahrtenbuchGesamt = fahrtenbuchSteuerJahr + fahrtenbuchGeldwerterVorteil * svAnteil;
    const einprozenRegelungGesamt = gesamtbelastungJahr;
    const fahrtenbuchVorteil = einprozenRegelungGesamt - fahrtenbuchGesamt;
    const empfehlung = fahrtenbuchVorteil > 500 ? "fahrtenbuch" : fahrtenbuchVorteil < -500 ? "1prozent" : "gleich";
    return {
      // Grunddaten
      blpGerundet,
      prozentFaktor,
      faktorWohnungArbeit: faktorWohnungArbeit * 100,
      // Geldwerter Vorteil
      geldwerterVorteilPrivat,
      geldwerterVorteilWohnungArbeit,
      einzelbewertungMonat,
      // Optimierung
      guenstigerWohnungArbeit,
      ersparnisBeiEinzelbewertung,
      // Gesamtsummen
      geldwerterVorteilMonatPauschal,
      geldwerterVorteilMonatOptimal,
      geldwerterVorteilJahr: geldwerterVorteilMonatOptimal * 12,
      // Steuer
      steuerMonatPauschal,
      steuerMonatOptimal,
      steuerJahrPauschal,
      steuerJahrOptimal,
      // SV
      svMonat,
      svJahr,
      // Gesamt
      gesamtbelastungMonat,
      gesamtbelastungJahr,
      // Fahrtenbuch
      fahrtenbuchGeldwerterVorteil,
      fahrtenbuchSteuerJahr,
      fahrtenbuchGesamt,
      fahrtenbuchVorteil,
      empfehlung
    };
  }, [bruttolistenpreis, antrieb, entfernungKm, fahrtenProMonat, steuersatz, nutzungPrivat, sonderausstattung, tatsaechlicheKostenJahr, privatKmAnteil]);
  const formatEuro = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  const formatEuroRound = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Bruttolistenpreis (BLP)" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Listenpreis inkl. MwSt. zum Zeitpunkt der Erstzulassung" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: bruttolistenpreis,
              onChange: (e) => setBruttolistenpreis(Number(e.target.value)),
              className: "w-full p-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg",
              min: "0",
              max: "500000",
              step: "1000"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium", children: "€" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: bruttolistenpreis,
            onChange: (e) => setBruttolistenpreis(Number(e.target.value)),
            className: "w-full mt-2 accent-blue-500",
            min: "10000",
            max: "150000",
            step: "1000"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Sonderausstattung" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Aufpreis für Extras (Navigation, Ledersitze, etc.)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: sonderausstattung,
              onChange: (e) => setSonderausstattung(Number(e.target.value)),
              className: "w-full p-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all",
              min: "0",
              max: "100000",
              step: "500"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium", children: "€" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Antriebsart" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Elektro- & Hybridautos werden steuerlich begünstigt" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setAntrieb("verbrenner"),
              className: `py-3 px-4 rounded-xl font-medium transition-all ${antrieb === "verbrenner" ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-xl", children: "⛽" }),
                /* @__PURE__ */ jsx("span", { className: "block text-sm mt-1", children: "Verbrenner" }),
                /* @__PURE__ */ jsx("span", { className: "block text-xs opacity-70", children: "1,0%" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setAntrieb("hybrid"),
              className: `py-3 px-4 rounded-xl font-medium transition-all ${antrieb === "hybrid" ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🔋" }),
                /* @__PURE__ */ jsx("span", { className: "block text-sm mt-1", children: "Plug-in-Hybrid" }),
                /* @__PURE__ */ jsx("span", { className: "block text-xs opacity-70", children: "0,5%" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setAntrieb("elektro"),
              className: `py-3 px-4 rounded-xl font-medium transition-all ${antrieb === "elektro" ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-xl", children: "⚡" }),
                /* @__PURE__ */ jsx("span", { className: "block text-sm mt-1", children: "Elektro" }),
                /* @__PURE__ */ jsx("span", { className: "block text-xs opacity-70", children: bruttolistenpreis + sonderausstattung <= 7e4 ? "0,25%" : "0,5%" })
              ]
            }
          )
        ] }),
        antrieb === "elektro" && bruttolistenpreis + sonderausstattung > 7e4 && /* @__PURE__ */ jsx("div", { className: "mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700", children: "💡 Bei BLP über 70.000€ gilt 0,5% statt 0,25%" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Private Nutzung?" }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setNutzungPrivat(true),
              className: `py-3 px-4 rounded-xl font-medium transition-all ${nutzungPrivat ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: "Ja (1%-Regelung)"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setNutzungPrivat(false),
              className: `py-3 px-4 rounded-xl font-medium transition-all ${!nutzungPrivat ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: "Nein (nur dienstlich)"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Entfernung Wohnung – Arbeit" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Einfache Strecke in Kilometern" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: entfernungKm,
              onChange: (e) => setEntfernungKm(Number(e.target.value)),
              className: "w-32 p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 text-lg text-center",
              min: "0",
              max: "200"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "km" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              value: entfernungKm,
              onChange: (e) => setEntfernungKm(Number(e.target.value)),
              className: "flex-1 accent-blue-500",
              min: "0",
              max: "100"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Fahrten zur Arbeit pro Monat" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Bei weniger als 15 Fahrten kann Einzelbewertung günstiger sein" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: fahrtenProMonat,
              onChange: (e) => setFahrtenProMonat(Number(e.target.value)),
              className: "w-32 p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 text-lg text-center",
              min: "0",
              max: "30"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Tage" })
        ] }),
        fahrtenProMonat < 15 && /* @__PURE__ */ jsx("div", { className: "mt-3 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700", children: "✓ Einzelbewertung (0,002% pro km/Fahrt) kann günstiger sein als 0,03%-Pauschale" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Ihr Grenzsteuersatz" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Geschätzter persönlicher Steuersatz" })
        ] }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: steuersatz,
            onChange: (e) => setSteuersatz(Number(e.target.value)),
            className: "w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500",
            children: STEUERSAETZE.map((s) => /* @__PURE__ */ jsx("option", { value: s.value, children: s.label }, s.value))
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: "🚗 Ihre monatliche Belastung (1%-Regelung)" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuroRound(ergebnis.gesamtbelastungMonat) }),
          /* @__PURE__ */ jsx("span", { className: "text-xl opacity-80", children: "pro Monat" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-blue-100 mt-2 text-sm", children: [
          ergebnis.prozentFaktor,
          "%-Regelung • BLP ",
          formatEuroRound(ergebnis.blpGerundet)
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Geldwerter Vorteil" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuroRound(ergebnis.geldwerterVorteilMonatOptimal) }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-blue-200", children: "versteuern Sie" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Steuerlast" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuroRound(ergebnis.steuerMonatOptimal) }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-blue-200", children: [
            "+ SV ~",
            formatEuroRound(ergebnis.svMonat)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        nutzungPrivat && /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-3 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-xs opacity-80", children: [
            "Privatnutzung (",
            ergebnis.prozentFaktor,
            "%)"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-lg font-bold", children: formatEuroRound(ergebnis.geldwerterVorteilPrivat) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-3 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-xs opacity-80", children: [
            "Arbeitsweg (",
            ergebnis.faktorWohnungArbeit.toFixed(3),
            "%)"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-lg font-bold", children: formatEuroRound(ergebnis.guenstigerWohnungArbeit === "einzelbewertung" ? ergebnis.einzelbewertungMonat : ergebnis.geldwerterVorteilWohnungArbeit) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📅 Jahresübersicht 1%-Regelung" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Bruttolistenpreis (gerundet)" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.blpGerundet) })
        ] }),
        nutzungPrivat && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
            "Privatnutzung (",
            ergebnis.prozentFaktor,
            "% × 12)"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatEuro(ergebnis.geldwerterVorteilPrivat * 12) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
            "Fahrten Wohnung-Arbeit (",
            entfernungKm,
            " km)",
            ergebnis.guenstigerWohnungArbeit === "einzelbewertung" && /* @__PURE__ */ jsx("span", { className: "text-green-600 text-xs block", children: "✓ Einzelbewertung günstiger" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatEuro(
            (ergebnis.guenstigerWohnungArbeit === "einzelbewertung" ? ergebnis.einzelbewertungMonat : ergebnis.geldwerterVorteilWohnungArbeit) * 12
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 bg-blue-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-blue-800", children: "Geldwerter Vorteil / Jahr" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-blue-900", children: formatEuro(ergebnis.geldwerterVorteilJahr) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
            "Einkommensteuer (",
            (steuersatz * 100).toFixed(0),
            "%)"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-red-600 font-medium", children: formatEuro(ergebnis.steuerJahrOptimal) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Sozialversicherung (~20%)" }),
          /* @__PURE__ */ jsx("span", { className: "text-red-600 font-medium", children: formatEuro(ergebnis.svJahr) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-3 bg-red-100 -mx-6 px-6 rounded-b-xl mt-4", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-red-800", children: "Ihre Gesamtbelastung / Jahr" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-2xl text-red-900", children: formatEuroRound(ergebnis.gesamtbelastungJahr) })
        ] })
      ] })
    ] }),
    ergebnis.ersparnisBeiEinzelbewertung > 0 && fahrtenProMonat < 15 && /* @__PURE__ */ jsxs("div", { className: "bg-green-50 border border-green-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-green-800 mb-3", children: "💡 Optimierungs-Tipp: Einzelbewertung" }),
      /* @__PURE__ */ jsxs("div", { className: "text-sm text-green-700", children: [
        /* @__PURE__ */ jsxs("p", { className: "mb-3", children: [
          "Bei nur ",
          /* @__PURE__ */ jsxs("strong", { children: [
            fahrtenProMonat,
            " Fahrten/Monat"
          ] }),
          " zur Arbeit ist die Einzelbewertung günstiger als die 0,03%-Pauschale:"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/50 rounded-xl p-4 grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs text-green-600", children: "0,03%-Pauschale" }),
            /* @__PURE__ */ jsxs("p", { className: "font-bold text-green-900", children: [
              formatEuro(ergebnis.geldwerterVorteilWohnungArbeit),
              "/Monat"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs text-green-600", children: "Einzelbewertung" }),
            /* @__PURE__ */ jsxs("p", { className: "font-bold text-green-900", children: [
              formatEuro(ergebnis.einzelbewertungMonat),
              "/Monat"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-3 font-medium", children: [
          "✓ Sie sparen: ",
          /* @__PURE__ */ jsx("span", { className: "text-green-900 font-bold", children: formatEuro(ergebnis.ersparnisBeiEinzelbewertung * 12) }),
          " pro Jahr"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📋 Alternative: Fahrtenbuch" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Mit einem Fahrtenbuch versteuern Sie nur die tatsächliche private Nutzung. Geben Sie die geschätzten Werte ein:" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-600 mb-1", children: "Tatsächliche Kosten/Jahr" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: tatsaechlicheKostenJahr,
                onChange: (e) => setTatsaechlicheKostenJahr(Number(e.target.value)),
                className: "w-full p-3 pr-10 border-2 border-gray-200 rounded-xl",
                min: "0",
                step: "500"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400", children: "€" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: "Leasing, Versicherung, Sprit, etc." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-600 mb-1", children: "Privater Km-Anteil" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: privatKmAnteil,
                onChange: (e) => setPrivatKmAnteil(Number(e.target.value)),
                className: "w-full p-3 pr-10 border-2 border-gray-200 rounded-xl",
                min: "0",
                max: "100"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400", children: "%" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: "inkl. Fahrten Wohnung-Arbeit" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: `p-4 rounded-xl ${ergebnis.empfehlung === "fahrtenbuch" ? "bg-green-100 border-2 border-green-300" : ergebnis.empfehlung === "1prozent" ? "bg-blue-100 border-2 border-blue-300" : "bg-gray-100"}`, children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 text-center", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600", children: "1%-Regelung" }),
            /* @__PURE__ */ jsxs("p", { className: "text-xl font-bold text-gray-900", children: [
              formatEuroRound(ergebnis.gesamtbelastungJahr),
              "/Jahr"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600", children: "Fahrtenbuch" }),
            /* @__PURE__ */ jsxs("p", { className: "text-xl font-bold text-gray-900", children: [
              formatEuroRound(ergebnis.fahrtenbuchGesamt),
              "/Jahr"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-4 border-t border-gray-300 text-center", children: [
          ergebnis.empfehlung === "fahrtenbuch" && /* @__PURE__ */ jsxs("p", { className: "text-green-800 font-medium", children: [
            "✓ Fahrtenbuch spart ",
            /* @__PURE__ */ jsx("span", { className: "font-bold", children: formatEuroRound(ergebnis.fahrtenbuchVorteil) }),
            "/Jahr"
          ] }),
          ergebnis.empfehlung === "1prozent" && /* @__PURE__ */ jsxs("p", { className: "text-blue-800 font-medium", children: [
            "✓ 1%-Regelung spart ",
            /* @__PURE__ */ jsx("span", { className: "font-bold", children: formatEuroRound(-ergebnis.fahrtenbuchVorteil) }),
            "/Jahr"
          ] }),
          ergebnis.empfehlung === "gleich" && /* @__PURE__ */ jsx("p", { className: "text-gray-800 font-medium", children: "≈ Beide Methoden sind etwa gleich" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-3", children: "⚠️ Fahrtenbuch erfordert lückenlose, zeitnahe Dokumentation aller Fahrten" })
    ] }),
    antrieb === "verbrenner" && /* @__PURE__ */ jsxs("div", { className: "bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-emerald-800 mb-3", children: "⚡ Tipp: Elektroauto-Vorteil" }),
      /* @__PURE__ */ jsxs("div", { className: "text-sm text-emerald-700", children: [
        /* @__PURE__ */ jsxs("p", { className: "mb-3", children: [
          "Mit einem ",
          /* @__PURE__ */ jsx("strong", { children: "Elektroauto bis 70.000€ BLP" }),
          " würden Sie nur 0,25% statt 1% versteuern:"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/50 rounded-xl p-4 grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs text-emerald-600", children: "Ihr Verbrenner" }),
            /* @__PURE__ */ jsxs("p", { className: "font-bold text-emerald-900", children: [
              formatEuro(ergebnis.geldwerterVorteilPrivat),
              "/Monat"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs text-emerald-600", children: "Elektroauto (0,25%)" }),
            /* @__PURE__ */ jsxs("p", { className: "font-bold text-emerald-900", children: [
              formatEuro(ergebnis.blpGerundet * 25e-4),
              "/Monat"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-3 font-medium", children: [
          "Ersparnis: bis zu ",
          /* @__PURE__ */ jsx("span", { className: "text-emerald-900 font-bold", children: "75%" }),
          " weniger geldwerter Vorteil!"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert die 1%-Regelung" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Grundlage:" }),
            " Der Bruttolistenpreis (BLP) zum Zeitpunkt der Erstzulassung, auf volle 100€ abgerundet"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Privatnutzung:" }),
            " 1% des BLP monatlich als geldwerter Vorteil (0,5% bei Hybrid, 0,25% bei E-Auto bis 70k€)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Arbeitsweg:" }),
            " Zusätzlich 0,03% des BLP pro km einfache Entfernung (pauschal) ODER Einzelbewertung"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Einzelbewertung:" }),
            " 0,002% pro km pro Fahrt – günstiger bei weniger als 15 Fahrten/Monat"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Versteuerung:" }),
            " Der geldwerte Vorteil wird zum Bruttolohn addiert und normal versteuert"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Sozialversicherung:" }),
            " Auch SV-Beiträge fallen auf den geldwerten Vorteil an (bis zur BBG)"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Besteuerung nach Antriebsart 2025" }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-gray-50", children: [
          /* @__PURE__ */ jsx("th", { className: "text-left py-3 px-4 font-semibold text-gray-700", children: "Antrieb" }),
          /* @__PURE__ */ jsx("th", { className: "text-center py-3 px-4 font-semibold text-gray-700", children: "Privatnutzung" }),
          /* @__PURE__ */ jsx("th", { className: "text-center py-3 px-4 font-semibold text-gray-700", children: "Arbeitsweg" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { children: [
          /* @__PURE__ */ jsxs("tr", { className: `border-b border-gray-100 ${antrieb === "verbrenner" ? "bg-blue-50" : ""}`, children: [
            /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-gray-600", children: "⛽ Verbrenner" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-center font-bold", children: "1,0%" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-center", children: "0,03%/km" })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: `border-b border-gray-100 ${antrieb === "hybrid" ? "bg-blue-50" : ""}`, children: [
            /* @__PURE__ */ jsxs("td", { className: "py-3 px-4 text-gray-600", children: [
              "🔋 Plug-in-Hybrid",
              /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400 block", children: "(≥60km E-Reichweite oder ≤50g CO2/km)" })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-center font-bold text-green-600", children: "0,5%" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-center text-green-600", children: "0,015%/km" })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: `border-b border-gray-100 ${antrieb === "elektro" && bruttolistenpreis + sonderausstattung <= 7e4 ? "bg-blue-50" : ""}`, children: [
            /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-gray-600", children: "⚡ Elektro bis 70.000€" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-center font-bold text-green-600", children: "0,25%" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-center text-green-600", children: "0,0075%/km" })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: `${antrieb === "elektro" && bruttolistenpreis + sonderausstattung > 7e4 ? "bg-blue-50" : ""}`, children: [
            /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-gray-600", children: "⚡ Elektro über 70.000€" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-center font-bold text-green-600", children: "0,5%" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-center text-green-600", children: "0,015%/km" })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-3", children: "Stand: 2025. Die 70.000€-Grenze für E-Autos wurde Ende 2023 von 60.000€ angehoben." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-amber-800 mb-3", children: "⚠️ Wichtige Hinweise" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-amber-700", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Sonderausstattung:" }),
            " Alle Extras (Navigation, Ledersitze, etc.) erhöhen den BLP"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Gebrauchtwagen:" }),
            " Es zählt immer der BLP bei Erstzulassung, nicht der Kaufpreis"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Ladestation:" }),
            " Kostenlose Stromladung beim Arbeitgeber ist steuerfrei"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Zuzahlung:" }),
            " Eigene Zuzahlungen (z.B. für Extras) mindern den geldwerten Vorteil"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Fahrtenbuch:" }),
            " Muss zeitnah, lückenlos und manipulationssicher geführt werden"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Wechsel:" }),
            " Zwischen 1%-Regelung und Fahrtenbuch kann nur zum Jahreswechsel gewechselt werden"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Stellen" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-blue-900", children: "Lohnabrechnung durch Arbeitgeber" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-700 mt-1", children: "Die 1%-Regelung wird vom Arbeitgeber in der monatlichen Gehaltsabrechnung berücksichtigt. Der geldwerte Vorteil wird zum Bruttolohn addiert." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Ihr Finanzamt" }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Für Steuerfragen & Fahrtenbuch-Prüfung" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "BMF-Infos" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.bundesfinanzministerium.de",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "bundesfinanzministerium.de →"
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
            href: "https://www.gesetze-im-internet.de/estg/__6.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "§ 6 EStG – Bewertung von Wirtschaftsgütern"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/estg/__8.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "§ 8 EStG – Einnahmen (geldwerter Vorteil)"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bundesfinanzministerium.de/Content/DE/BMF_Schreiben/Steuerarten/Lohnsteuer/2023-12-15-steuerliche-behandlung-der-ueberlassung-eines-betrieblichen-kraftfahrzeugs.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BMF-Schreiben zur steuerlichen Behandlung von Firmenwagen"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/firmenfahrzeuge/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "ADAC – Firmenwagen versteuern"
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
const $$FirmenwagenRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "Firmenwagen-Rechner 2025 \u2013 1%-Regelung & geldwerter Vorteil berechnen";
  const description = "Firmenwagen-Rechner 2025: Berechnen Sie die 1%-Regelung, 0,03%-Methode und den geldwerten Vorteil. Mit Elektroauto-Verg\xFCnstigung (0,25%) und Fahrtenbuch-Vergleich.";
  const keywords = "Firmenwagen Rechner, 1 Prozent Regelung, geldwerter Vorteil Rechner, Dienstwagen Rechner, Firmenwagen versteuern, 1% Regelung Rechner, Firmenwagen Steuer, Dienstwagen Steuer, Firmenwagen Elektro, 0.25% Regelung, Fahrtenbuch vs 1 Prozent, Firmenwagen berechnen 2025, Bruttolistenpreis Rechner, Firmenwagenrechner, Dienstwagen geldwerter Vorteil";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<main class="min-h-screen pb-8"> <!-- Header mit Zur\xFCck-Button --> <header class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>\nAlle Rechner\n</a> <div class="flex items-center gap-3"> <span class="text-4xl">\u{1F699}</span> <div> <h1 class="text-2xl font-bold">Firmenwagen-Rechner</h1> <p class="text-blue-100 text-sm">1%-Regelung & geldwerter Vorteil 2025</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ', ' </div> <!-- SEO Content Section --> <div class="max-w-2xl mx-auto px-4 mt-8"> <div class="bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">Firmenwagen-Rechner 2025: 1%-Regelung einfach erkl\xE4rt</h2> <div class="prose prose-sm text-gray-600 space-y-4"> <p>\nEin <strong>Firmenwagen</strong> ist f\xFCr viele Arbeitnehmer ein attraktiver Gehaltsbestandteil. \n            Doch die private Nutzung muss versteuert werden \u2013 das ist der <strong>geldwerte Vorteil</strong>. \n            Mit unserem <strong>Firmenwagen-Rechner</strong> berechnen Sie schnell, wie viel Sie der Dienstwagen \n            tats\xE4chlich kostet.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Was ist die 1%-Regelung?</h3> <p>\nDie <strong>1%-Regelung</strong> ist die einfachste Methode, um den geldwerten Vorteil eines \n            Firmenwagens zu berechnen. Dabei gilt:\n</p> <ul class="list-disc pl-5 space-y-1"> <li>Der geldwerte Vorteil betr\xE4gt <strong>1% des Bruttolistenpreises</strong> (BLP) pro Monat</li> <li>Der BLP wird auf volle 100\u20AC abgerundet</li> <li>Sonderausstattung (Navigation, Ledersitze) erh\xF6ht den BLP</li> <li>Bei Gebrauchtwagen z\xE4hlt der BLP bei <strong>Erstzulassung</strong>, nicht der Kaufpreis</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">0,03%-Regelung f\xFCr Fahrten Wohnung-Arbeit</h3> <p>\nZus\xE4tzlich zur 1%-Regelung m\xFCssen Fahrten zwischen <strong>Wohnung und Arbeitsst\xE4tte</strong>\nversteuert werden. Daf\xFCr gibt es zwei Methoden:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Pauschal:</strong> 0,03% des BLP \xD7 Entfernungskilometer (einfache Strecke)</li> <li><strong>Einzelbewertung:</strong> 0,002% pro gefahrenem Kilometer pro Fahrt</li> </ul> <p> <strong>Tipp:</strong> Bei weniger als 15 Fahrten pro Monat ist die Einzelbewertung oft g\xFCnstiger!\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Elektroauto & Hybrid: Steuervorteile 2025</h3> <p>\nF\xFCr <strong>Elektroautos und Plug-in-Hybride</strong> gelten reduzierte Prozents\xE4tze:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Elektroauto bis 70.000\u20AC BLP:</strong> Nur 0,25% statt 1%</li> <li><strong>Elektroauto \xFCber 70.000\u20AC BLP:</strong> 0,5% statt 1%</li> <li><strong>Plug-in-Hybrid</strong> (\u226560km E-Reichweite oder \u226450g CO2/km): 0,5%</li> </ul> <p>\nDas bedeutet: Ein Elektroauto kann bis zu <strong>75% g\xFCnstiger</strong> in der Versteuerung sein \n            als ein vergleichbarer Verbrenner!\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Fahrtenbuch als Alternative</h3> <p>\nStatt der 1%-Regelung k\xF6nnen Sie ein <strong>Fahrtenbuch</strong> f\xFChren. Dann versteuern Sie \n            nur die tats\xE4chlich privat gefahrenen Kilometer anteilig an den Gesamtkosten.\n</p> <p>\nDas Fahrtenbuch lohnt sich meist, wenn:\n</p> <ul class="list-disc pl-5 space-y-1"> <li>Der <strong>Privatanteil sehr gering</strong> ist (unter 30%)</li> <li>Das Auto einen <strong>hohen Bruttolistenpreis</strong> hat</li> <li>Sie bereit sind, <strong>alle Fahrten l\xFCckenlos</strong> zu dokumentieren</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wie wird der geldwerte Vorteil versteuert?</h3> <p>\nDer geldwerte Vorteil wird zu Ihrem <strong>Bruttogehalt addiert</strong> und normal versteuert:\n</p> <ul class="list-disc pl-5 space-y-1"> <li>Es fallen <strong>Einkommensteuer</strong> nach Ihrem pers\xF6nlichen Steuersatz an</li> <li>Es fallen <strong>Sozialversicherungsbeitr\xE4ge</strong> an (bis zur Beitragsbemessungsgrenze)</li> <li>Der Arbeitgeber f\xFChrt die Steuern direkt \xFCber die Gehaltsabrechnung ab</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Beispielrechnung: Firmenwagen mit 45.000\u20AC BLP</h3> <p>\nEin Arbeitnehmer erh\xE4lt einen Verbrenner-Dienstwagen mit 45.000\u20AC Bruttolistenpreis. \n            Die Entfernung Wohnung-Arbeit betr\xE4gt 25 km:\n</p> <ul class="list-disc pl-5 space-y-1"> <li>Privatnutzung: 45.000\u20AC \xD7 1% = <strong>450\u20AC/Monat</strong></li> <li>Arbeitsweg: 45.000\u20AC \xD7 0,03% \xD7 25 km = <strong>337,50\u20AC/Monat</strong></li> <li>Geldwerter Vorteil gesamt: <strong>787,50\u20AC/Monat</strong></li> <li>Bei 33% Steuersatz: ca. 260\u20AC Steuern + 158\u20AC SV = <strong>~418\u20AC Mehrbelastung</strong></li> </ul> <p>\nDas gleiche Auto als <strong>Elektroauto (0,25%)</strong> w\xFCrde nur ~105\u20AC Mehrbelastung kosten \u2013 \n            eine Ersparnis von \xFCber 300\u20AC/Monat!\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">H\xE4ufige Fragen zum Firmenwagen</h3> <p class="font-semibold">Was ist der Bruttolistenpreis (BLP)?</p> <p>\nDer Bruttolistenpreis ist der unverbindliche Herstellerpreis <strong>inkl. MwSt.</strong>\nzum Zeitpunkt der Erstzulassung \u2013 nicht der tats\xE4chlich gezahlte Preis. Er wird auf volle 100\u20AC abgerundet.\n</p> <p class="font-semibold">Muss ich Sonderausstattung ber\xFCcksichtigen?</p> <p>\nJa! Navigation, Ledersitze, Anh\xE4ngerkupplung und alle anderen Extras erh\xF6hen den BLP und \n            damit den geldwerten Vorteil.\n</p> <p class="font-semibold">Was gilt bei Home-Office?</p> <p>\nBei regelm\xE4\xDFigem Home-Office k\xF6nnen Sie die <strong>Einzelbewertung</strong> (0,002% pro km pro Fahrt) \n            nutzen statt der 0,03%-Pauschale. Das lohnt sich besonders bei wenigen B\xFCrotagen.\n</p> </div> </div> </div> </main>  <script type="application/ld+json">', '<\/script>  <script type="application/ld+json">', "<\/script> "])), maybeRenderHead(), renderComponent($$result2, "FirmenwagenRechner", FirmenwagenRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/FirmenwagenRechner", "client:component-export": "default" }), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Firmenwagen-Rechner 2025",
    "description": description,
    "url": "https://deutschland-rechner.de/firmenwagen-rechner",
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
        "name": "Wie funktioniert die 1%-Regelung beim Firmenwagen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Bei der 1%-Regelung wird monatlich 1% des Bruttolistenpreises (BLP) als geldwerter Vorteil f\xFCr die private Nutzung versteuert. Zus\xE4tzlich kommen 0,03% des BLP pro Entfernungskilometer f\xFCr Fahrten zwischen Wohnung und Arbeit hinzu."
        }
      },
      {
        "@type": "Question",
        "name": "Wie viel Steuern zahle ich f\xFCr einen Firmenwagen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Der geldwerte Vorteil (1% des BLP f\xFCr Privatnutzung + 0,03% pro km Arbeitsweg) wird zum Bruttolohn addiert und mit Ihrem pers\xF6nlichen Steuersatz (14-45%) versteuert. Zus\xE4tzlich fallen Sozialversicherungsbeitr\xE4ge an."
        }
      },
      {
        "@type": "Question",
        "name": "Welche Steuervorteile gibt es f\xFCr Elektro-Firmenwagen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Elektroautos mit einem BLP bis 70.000\u20AC werden nur mit 0,25% statt 1% versteuert. Bei einem BLP \xFCber 70.000\u20AC oder bei Plug-in-Hybriden gilt 0,5%. Das kann bis zu 75% Steuerersparnis bedeuten."
        }
      },
      {
        "@type": "Question",
        "name": "Wann lohnt sich ein Fahrtenbuch statt der 1%-Regelung?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ein Fahrtenbuch lohnt sich meist, wenn der private Nutzungsanteil unter 30% liegt und das Auto einen hohen Listenpreis hat. Dann versteuern Sie nur die tats\xE4chliche private Nutzung anteilig an den Gesamtkosten."
        }
      },
      {
        "@type": "Question",
        "name": "Was ist der Bruttolistenpreis (BLP) beim Firmenwagen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Der Bruttolistenpreis ist der unverbindliche Herstellerpreis inkl. MwSt. zum Zeitpunkt der Erstzulassung \u2013 nicht der tats\xE4chliche Kaufpreis. Sonderausstattung erh\xF6ht den BLP. Er wird auf volle 100\u20AC abgerundet."
        }
      },
      {
        "@type": "Question",
        "name": "Was ist die Einzelbewertung beim Firmenwagen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Statt der 0,03%-Pauschale f\xFCr den Arbeitsweg k\xF6nnen Sie jeden Arbeitstag einzeln mit 0,002% pro km berechnen. Das lohnt sich bei weniger als 15 Fahrten pro Monat, z.B. bei regelm\xE4\xDFigem Home-Office."
        }
      }
    ]
  }))) })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/firmenwagen-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/firmenwagen-rechner.astro";
const $$url = "/firmenwagen-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$FirmenwagenRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
