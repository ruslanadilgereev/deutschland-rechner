/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, u as unescapeHTML, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DmT1JwUR.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const STEUERMESSZAHL = 0.035;
const FREIBETRAG_PERSONENGESELLSCHAFT = 24500;
const FREIBETRAG_KAPITALGESELLSCHAFT = 0;
const ANRECHNUNGSFAKTOR = 4;
const HEBESATZ_PRESETS = [
  { name: "München", satz: 490 },
  { name: "Frankfurt", satz: 460 },
  { name: "Hamburg", satz: 470 },
  { name: "Berlin", satz: 410 },
  { name: "Köln", satz: 475 },
  { name: "Düsseldorf", satz: 440 },
  { name: "Stuttgart", satz: 420 },
  { name: "Monheim", satz: 250 },
  { name: "Zossen", satz: 200 },
  { name: "Durchschnitt", satz: 435 }
];
function GewerbesteuerRechner() {
  const [gewinn, setGewinn] = useState(1e5);
  const [rechtsform, setRechtsform] = useState("einzelunternehmer");
  const [hebesatz, setHebesatz] = useState(400);
  const [hinzurechnungen, setHinzurechnungen] = useState(0);
  const [kuerzungen, setKuerzungen] = useState(0);
  const [istEinkommensteuerPflichtig, setIstEinkommensteuerPflichtig] = useState(true);
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(35);
  const ergebnis = useMemo(() => {
    const gewerbeertragVorFreibetrag = gewinn + hinzurechnungen - kuerzungen;
    const freibetrag = rechtsform === "kapitalgesellschaft" ? FREIBETRAG_KAPITALGESELLSCHAFT : FREIBETRAG_PERSONENGESELLSCHAFT;
    const gewerbeertrag = Math.max(0, gewerbeertragVorFreibetrag - freibetrag);
    const hatFreibetragGenutzt = gewerbeertragVorFreibetrag > 0 && gewerbeertragVorFreibetrag > freibetrag;
    const gewerbeertragGerundet = Math.floor(gewerbeertrag / 100) * 100;
    const steuermessbetrag = gewerbeertragGerundet * STEUERMESSZAHL;
    const gewerbesteuer = steuermessbetrag * (hebesatz / 100);
    let estAnrechnung = 0;
    let estAnrechnungMax = 0;
    let effektiveGewerbesteuer = gewerbesteuer;
    if (rechtsform !== "kapitalgesellschaft" && istEinkommensteuerPflichtig) {
      estAnrechnungMax = steuermessbetrag * ANRECHNUNGSFAKTOR;
      const theoretischeEst = gewinn * (grenzsteuersatz / 100);
      estAnrechnung = Math.min(estAnrechnungMax, gewerbesteuer, theoretischeEst);
      effektiveGewerbesteuer = gewerbesteuer - estAnrechnung;
    }
    const effektiverSteuersatz = gewinn > 0 ? effektiveGewerbesteuer / gewinn * 100 : 0;
    const nominalerSteuersatz = gewinn > 0 ? gewerbesteuer / gewinn * 100 : 0;
    const hebesatzSchwelle = ANRECHNUNGSFAKTOR * 100;
    const minHebesatz = 200;
    const maxHebesatz = 900;
    const gewerbesteuerMin = steuermessbetrag * (minHebesatz / 100);
    const gewerbesteuerMax = steuermessbetrag * (maxHebesatz / 100);
    const ersparnisPotenzial = gewerbesteuerMax - gewerbesteuerMin;
    return {
      // Eingangswerte
      gewinn,
      hinzurechnungen,
      kuerzungen,
      hebesatz,
      rechtsform,
      // Berechnung
      gewerbeertragVorFreibetrag,
      freibetrag,
      gewerbeertrag,
      gewerbeertragGerundet,
      hatFreibetragGenutzt,
      // Steuermessbetrag
      steuermesszahl: STEUERMESSZAHL,
      steuermessbetrag,
      // Gewerbesteuer
      gewerbesteuer,
      // ESt-Anrechnung
      estAnrechnung,
      estAnrechnungMax,
      effektiveGewerbesteuer,
      hebesatzSchwelle,
      // Steuersätze
      effektiverSteuersatz,
      nominalerSteuersatz,
      // Vergleich
      gewerbesteuerMin,
      gewerbesteuerMax,
      ersparnisPotenzial
    };
  }, [gewinn, rechtsform, hebesatz, hinzurechnungen, kuerzungen, istEinkommensteuerPflichtig, grenzsteuersatz]);
  const formatEuro = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  const formatEuroRound = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";
  const formatProzent = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " %";
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Rechtsform" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Bestimmt Freibetrag und ESt-Anrechnung" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setRechtsform("einzelunternehmer"),
              className: `py-3 px-4 rounded-xl font-medium transition-all text-left ${rechtsform === "einzelunternehmer" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "👤" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "font-semibold", children: "Einzelunternehmer" }),
                  /* @__PURE__ */ jsx("div", { className: "text-xs opacity-80", children: "Freibetrag 24.500 €, ESt-Anrechnung" })
                ] })
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setRechtsform("personengesellschaft"),
              className: `py-3 px-4 rounded-xl font-medium transition-all text-left ${rechtsform === "personengesellschaft" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "👥" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "font-semibold", children: "Personengesellschaft" }),
                  /* @__PURE__ */ jsx("div", { className: "text-xs opacity-80", children: "GbR, OHG, KG – Freibetrag 24.500 €" })
                ] })
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setRechtsform("kapitalgesellschaft"),
              className: `py-3 px-4 rounded-xl font-medium transition-all text-left ${rechtsform === "kapitalgesellschaft" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🏢" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "font-semibold", children: "Kapitalgesellschaft" }),
                  /* @__PURE__ */ jsx("div", { className: "text-xs opacity-80", children: "GmbH, UG, AG – kein Freibetrag, keine ESt-Anrechnung" })
                ] })
              ] })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Gewinn aus Gewerbebetrieb" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Jahresgewinn vor Gewerbesteuer" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: gewinn,
              onChange: (e) => setGewinn(Math.max(0, Number(e.target.value))),
              className: "w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none",
              min: "0",
              step: "1000"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl", children: "€" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: gewinn,
            onChange: (e) => setGewinn(Number(e.target.value)),
            className: "w-full mt-3 accent-amber-500",
            min: "0",
            max: "500000",
            step: "5000"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "0 €" }),
          /* @__PURE__ */ jsx("span", { children: "250.000 €" }),
          /* @__PURE__ */ jsx("span", { children: "500.000 €" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Hebesatz der Gemeinde" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Der Hebesatz variiert je nach Gemeinde (mind. 200%)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: hebesatz,
              onChange: (e) => setHebesatz(Math.max(200, Math.min(900, Number(e.target.value)))),
              className: "w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none",
              min: "200",
              max: "900",
              step: "5"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl", children: "%" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: hebesatz,
            onChange: (e) => setHebesatz(Number(e.target.value)),
            className: "w-full mt-3 accent-amber-500",
            min: "200",
            max: "600",
            step: "5"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "mt-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mb-2", children: "Schnellauswahl:" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: HEBESATZ_PRESETS.slice(0, 6).map((preset) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setHebesatz(preset.satz),
              className: `px-3 py-1 text-xs rounded-full transition-all ${hebesatz === preset.satz ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                preset.name,
                " (",
                preset.satz,
                "%)"
              ]
            },
            preset.name
          )) })
        ] }),
        hebesatz < 400 && /* @__PURE__ */ jsx("p", { className: "text-sm text-green-600 mt-2", children: "✅ Niedriger Hebesatz! Gewerbesteuer wird bei Personenunternehmen voll auf ESt angerechnet." }),
        hebesatz > 400 && rechtsform !== "kapitalgesellschaft" && /* @__PURE__ */ jsx("p", { className: "text-sm text-amber-600 mt-2", children: "⚠️ Hebesatz über 400%: Gewerbesteuer wird nur teilweise auf ESt angerechnet." })
      ] }),
      /* @__PURE__ */ jsxs("details", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("summary", { className: "cursor-pointer text-amber-600 font-medium text-sm hover:text-amber-700", children: "Erweiterte Optionen (Hinzurechnungen/Kürzungen)" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-4 p-4 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium text-sm", children: "Hinzurechnungen" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "z.B. 25% der Miet-/Pachtzinsen, 25% der Zinsen über 200.000 € Freibetrag" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: hinzurechnungen,
                  onChange: (e) => setHinzurechnungen(Math.max(0, Number(e.target.value))),
                  className: "w-full text-lg font-bold text-center py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none",
                  min: "0",
                  step: "100"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400", children: "€" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium text-sm", children: "Kürzungen" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "z.B. 1,2% des Einheitswerts von Grundbesitz" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: kuerzungen,
                  onChange: (e) => setKuerzungen(Math.max(0, Number(e.target.value))),
                  className: "w-full text-lg font-bold text-center py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none",
                  min: "0",
                  step: "100"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400", children: "€" })
            ] })
          ] })
        ] })
      ] }),
      rechtsform !== "kapitalgesellschaft" && /* @__PURE__ */ jsxs("div", { className: "mb-6 p-4 bg-amber-50 rounded-xl", children: [
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 mb-3", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: istEinkommensteuerPflichtig,
              onChange: (e) => setIstEinkommensteuerPflichtig(e.target.checked),
              className: "w-5 h-5 rounded accent-amber-500"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "ESt-Anrechnung berücksichtigen" })
        ] }),
        istEinkommensteuerPflichtig && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 text-sm", children: "Ihr persönlicher Grenzsteuersatz (ESt)" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "range",
                value: grenzsteuersatz,
                onChange: (e) => setGrenzsteuersatz(Number(e.target.value)),
                className: "flex-1 accent-amber-500",
                min: "14",
                max: "45",
                step: "1"
              }
            ),
            /* @__PURE__ */ jsxs("span", { className: "text-lg font-bold text-amber-800 w-16 text-right", children: [
              grenzsteuersatz,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-amber-700 mt-2", children: "💡 Der Grenzsteuersatz bestimmt, wie viel ESt durch die Anrechnung gespart wird" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: "🏛️ Ihre Gewerbesteuer" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuroRound(ergebnis.gewerbesteuer) }),
          /* @__PURE__ */ jsx("span", { className: "text-xl opacity-80", children: "/ Jahr" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-amber-100 mt-2 text-sm", children: [
          "Bei ",
          hebesatz,
          "% Hebesatz und ",
          formatEuroRound(ergebnis.gewerbeertrag),
          " Gewerbeertrag"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Steuermessbetrag" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuroRound(ergebnis.steuermessbetrag) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Effektiver Steuersatz" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatProzent(ergebnis.nominalerSteuersatz) })
        ] })
      ] }),
      rechtsform !== "kapitalgesellschaft" && istEinkommensteuerPflichtig && ergebnis.estAnrechnung > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Nach ESt-Anrechnung (effektiv)" }),
          /* @__PURE__ */ jsx("span", { className: "text-lg font-bold", children: formatEuroRound(ergebnis.effektiveGewerbesteuer) })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-amber-100 mt-1", children: [
          formatEuroRound(ergebnis.estAnrechnung),
          " werden auf Ihre Einkommensteuer angerechnet"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Berechnungsdetails" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide", children: "1. Gewerbeertrag ermitteln" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Gewinn aus Gewerbebetrieb" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(gewinn) })
        ] }),
        hinzurechnungen > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-amber-600", children: [
          /* @__PURE__ */ jsx("span", { children: "+ Hinzurechnungen" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(hinzurechnungen) })
        ] }),
        kuerzungen > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-green-600", children: [
          /* @__PURE__ */ jsx("span", { children: "− Kürzungen" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(kuerzungen) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "= Gewerbeertrag vor Freibetrag" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatEuro(ergebnis.gewerbeertragVorFreibetrag) })
        ] }),
        ergebnis.freibetrag > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-green-600", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "− Freibetrag (",
            rechtsform === "einzelunternehmer" ? "Einzelunternehmer" : "Personengesellschaft",
            ")"
          ] }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.freibetrag) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-amber-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-amber-700", children: "= Gewerbeertrag (gerundet)" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-amber-900", children: formatEuro(ergebnis.gewerbeertragGerundet) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide pt-4", children: "2. Steuermessbetrag berechnen" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Gewerbeertrag × 3,5% (Steuermesszahl)" }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-900", children: [
            formatEuro(ergebnis.gewerbeertragGerundet),
            " × 3,5%"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-amber-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-amber-700", children: "= Steuermessbetrag" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-amber-900", children: formatEuro(ergebnis.steuermessbetrag) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide pt-4", children: "3. Gewerbesteuer berechnen" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
            "Steuermessbetrag × ",
            hebesatz,
            "% (Hebesatz)"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-900", children: [
            formatEuro(ergebnis.steuermessbetrag),
            " × ",
            hebesatz,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-amber-100 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-amber-800", children: "= Gewerbesteuer" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-2xl text-amber-900", children: formatEuro(ergebnis.gewerbesteuer) })
        ] }),
        rechtsform !== "kapitalgesellschaft" && istEinkommensteuerPflichtig && ergebnis.estAnrechnung > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide pt-4", children: "4. ESt-Anrechnung (§ 35 EStG)" }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Max. anrechenbar (4 × Messbetrag)" }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatEuro(ergebnis.estAnrechnungMax) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-green-600", children: [
            /* @__PURE__ */ jsx("span", { children: "− Tatsächliche Anrechnung auf ESt" }),
            /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.estAnrechnung) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-green-50 -mx-6 px-6 rounded-b-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium text-green-700", children: "= Effektive Gewerbesteuer-Belastung" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-green-900", children: formatEuro(ergebnis.effektiveGewerbesteuer) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📍 Hebesatz-Vergleich" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: HEBESATZ_PRESETS.map((preset) => {
        const gewStBeiPreset = ergebnis.steuermessbetrag * (preset.satz / 100);
        const differenz = gewStBeiPreset - ergebnis.gewerbesteuer;
        const isAktuell = preset.satz === hebesatz;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: `flex items-center justify-between p-3 rounded-xl ${isAktuell ? "bg-amber-100 border-2 border-amber-300" : "bg-gray-50"}`,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("span", { className: `text-sm font-medium ${isAktuell ? "text-amber-800" : "text-gray-600"}`, children: preset.name }),
                /* @__PURE__ */ jsxs("span", { className: `text-xs px-2 py-0.5 rounded-full ${isAktuell ? "bg-amber-200 text-amber-800" : "bg-gray-200 text-gray-600"}`, children: [
                  preset.satz,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsx("div", { className: `font-bold ${isAktuell ? "text-amber-900" : "text-gray-800"}`, children: formatEuroRound(gewStBeiPreset) }),
                !isAktuell && /* @__PURE__ */ jsxs("div", { className: `text-xs ${differenz > 0 ? "text-red-500" : "text-green-500"}`, children: [
                  differenz > 0 ? "+" : "",
                  formatEuroRound(differenz)
                ] })
              ] })
            ]
          },
          preset.name
        );
      }) }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 p-4 bg-amber-50 rounded-xl", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-amber-800", children: [
        "💡 ",
        /* @__PURE__ */ jsx("strong", { children: "Einsparpotenzial:" }),
        " Zwischen dem niedrigsten (200%) und höchsten (900%) Hebesatz liegt eine Differenz von ",
        formatEuroRound(ergebnis.ersparnisPotenzial),
        " bei Ihrem Gewerbeertrag."
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert die Gewerbesteuer" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Steuermesszahl 3,5%:" }),
            " Der Gewerbeertrag wird mit 3,5% multipliziert"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Hebesatz:" }),
            " Die Gemeinde bestimmt den Hebesatz (mind. 200%)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Freibetrag 24.500 €:" }),
            " Nur für Einzelunternehmer und Personengesellschaften"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "ESt-Anrechnung:" }),
            " Max. das 4-fache des Steuermessbetrags wird auf die ESt angerechnet"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Betriebsausgabe:" }),
            " Die Gewerbesteuer ist keine Betriebsausgabe mehr (seit 2008)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Vorauszahlungen:" }),
            " Quartalsweise zum 15.02., 15.05., 15.08. und 15.11."
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-amber-800 mb-3", children: "👥 Wer muss Gewerbesteuer zahlen?" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm text-amber-700", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Gewerbesteuerpflichtig" }),
          " sind alle gewerblichen Unternehmen:"
        ] }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-1 pl-4", children: [
          /* @__PURE__ */ jsx("li", { children: "• Einzelunternehmer mit Gewerbebetrieb" }),
          /* @__PURE__ */ jsx("li", { children: "• Personengesellschaften (GbR, OHG, KG)" }),
          /* @__PURE__ */ jsx("li", { children: "• Kapitalgesellschaften (GmbH, UG, AG)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/50 rounded-xl p-4 mt-3", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-amber-800 mb-2", children: "✅ Keine Gewerbesteuer zahlen:" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("li", { children: "• Freiberufler (Ärzte, Anwälte, Architekten, etc.)" }),
            /* @__PURE__ */ jsx("li", { children: "• Land- und Forstwirte" }),
            /* @__PURE__ */ jsx("li", { children: "• Vermögensverwaltende Tätigkeiten" })
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
            /* @__PURE__ */ jsx("strong", { children: "Standortwahl:" }),
            " Der Hebesatz kann je nach Gemeinde stark variieren – Standortwahl kann tausende Euro sparen"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Hinzurechnungen beachten:" }),
            " Auch Zinsen, Mieten und Pachten werden teilweise hinzugerechnet"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "GmbH vs. Einzelunternehmen:" }),
            " GmbHs haben keinen Freibetrag, dafür Körperschaftsteuer von 15%"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Zerlegung:" }),
            " Bei mehreren Betriebsstätten wird die Gewerbesteuer auf die Gemeinden verteilt"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Gewerbesteuererklärung:" }),
            " Muss jährlich bis zum 31. Juli des Folgejahres abgegeben werden"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörden" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-amber-900", children: "Finanzamt & Gemeinde" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-amber-700 mt-1", children: "Das Finanzamt setzt den Steuermessbetrag fest, die Gemeinde erhebt die Gewerbesteuer." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Finanzamt-Hotline" }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Ihr zuständiges Finanzamt" })
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
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📋" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Benötigte Unterlagen" }),
            /* @__PURE__ */ jsxs("ul", { className: "text-gray-600 mt-1 space-y-1", children: [
              /* @__PURE__ */ jsx("li", { children: "• Gewinnermittlung (EÜR oder Bilanz)" }),
              /* @__PURE__ */ jsx("li", { children: "• Gewerbesteuererklärung (Formular GewSt 1 A)" }),
              /* @__PURE__ */ jsx("li", { children: "• Ggf. Anlage für Hinzurechnungen/Kürzungen" })
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
            href: "https://www.gesetze-im-internet.de/gewstg/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Gewerbesteuergesetz (GewStG) – Gesetze im Internet"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/estg/__35.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "§ 35 EStG – Steuerermäßigung bei Einkünften aus Gewerbebetrieb"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bundesfinanzministerium.de/Web/DE/Themen/Steuern/Steuerarten/Gewerbesteuer/gewerbesteuer.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesfinanzministerium – Gewerbesteuer"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.ihk.de/themen/steuern/gewerbesteuer",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "IHK – Informationen zur Gewerbesteuer"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.destatis.de/DE/Themen/Staat/Steuern/Gewerbesteuer/_inhalt.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Statistisches Bundesamt – Gewerbesteuerstatistik"
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
const $$GewerbesteuerRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "Gewerbesteuer-Rechner 2025/2026 \u2013 Hebesatz, Freibetrag & Berechnung";
  const description = "Gewerbesteuer Rechner 2025: Berechnen Sie Ihre Gewerbesteuer online. Mit Hebesatz-Vergleich, Freibetrag, ESt-Anrechnung & Steuermessbetrag. F\xFCr GmbH, Einzelunternehmer & Personengesellschaften.";
  const keywords = "Gewerbesteuer Rechner, Gewerbesteuer berechnen, Gewerbesteuer 2025, Gewerbesteuer 2026, Hebesatz Rechner, Steuermessbetrag, Gewerbesteuer GmbH, Gewerbesteuer Einzelunternehmer, Gewerbesteuer Freibetrag, Gewerbesteuer Anrechnung, Gewerbeertrag berechnen, Gewerbesteuer Hebesatz Vergleich, Gewerbesteuer Personengesellschaft, ESt Anrechnung Gewerbesteuer";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<main class="min-h-screen pb-8"> <!-- Header mit Zur\xFCck-Button --> <header class="bg-gradient-to-r from-amber-500 to-orange-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-amber-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>\nAlle Rechner\n</a> <div class="flex items-center gap-3"> <span class="text-4xl">\u{1F3E2}</span> <div> <h1 class="text-2xl font-bold">Gewerbesteuer-Rechner</h1> <p class="text-amber-100 text-sm">Hebesatz, Freibetrag & Berechnung 2025/2026</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ', ' </div> <!-- SEO Content Section --> <div class="max-w-2xl mx-auto px-4 mt-8"> <div class="bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">Gewerbesteuer 2025/2026: Alles was Sie wissen m\xFCssen</h2> <div class="prose prose-sm text-gray-600 space-y-4"> <p>\nDie <strong>Gewerbesteuer</strong> ist eine der wichtigsten Steuern f\xFCr Unternehmen in Deutschland. \n            Als Gemeindesteuer finanziert sie kommunale Aufgaben und wird von allen gewerblichen Unternehmen \n            erhoben. Mit unserem <strong>Gewerbesteuer-Rechner</strong> ermitteln Sie schnell und pr\xE4zise, \n            wie viel Gewerbesteuer Ihr Unternehmen zahlen muss.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wie wird die Gewerbesteuer berechnet?</h3> <p>\nDie Berechnung der Gewerbesteuer erfolgt in drei Schritten nach dem <strong>Gewerbesteuergesetz (GewStG)</strong>:\n</p> <ol class="list-decimal pl-5 space-y-2"> <li> <strong>Gewerbeertrag ermitteln:</strong> Gewinn aus Gewerbebetrieb \n              + Hinzurechnungen (z.B. Zinsen, Mieten) \u2212 K\xFCrzungen (z.B. Grundbesitz) \u2212 Freibetrag\n</li> <li> <strong>Steuermessbetrag berechnen:</strong> Gewerbeertrag \xD7 3,5% (Steuermesszahl)\n</li> <li> <strong>Gewerbesteuer berechnen:</strong> Steuermessbetrag \xD7 Hebesatz der Gemeinde\n</li> </ol> <h3 class="text-lg font-semibold text-gray-800 mt-6">Der Hebesatz: Warum der Standort wichtig ist</h3> <p>\nDer <strong>Hebesatz</strong> wird von jeder Gemeinde selbst festgelegt und variiert stark:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Mindest-Hebesatz:</strong> 200% (gesetzlich vorgeschrieben)</li> <li><strong>Niedrigste Hebes\xE4tze:</strong> ca. 200-250% (z.B. Monheim, Zossen)</li> <li><strong>Durchschnitt:</strong> ca. 400-450%</li> <li><strong>H\xF6chste Hebes\xE4tze:</strong> bis zu 900% (einige Gro\xDFst\xE4dte)</li> </ul> <p>\nDie Standortwahl kann damit bei gleichem Gewinn zu <strong>Unterschieden von mehreren tausend Euro</strong> f\xFChren!\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Freibetrag: 24.500 \u20AC f\xFCr Personenunternehmen</h3> <p> <strong>Einzelunternehmer</strong> und <strong>Personengesellschaften</strong> (GbR, OHG, KG) \n            profitieren von einem Freibetrag von <strong>24.500 \u20AC</strong> pro Jahr. Das bedeutet:\n</p> <ul class="list-disc pl-5 space-y-1"> <li>Bei einem Gewerbeertrag bis 24.500 \u20AC f\xE4llt keine Gewerbesteuer an</li> <li>Dar\xFCber wird nur der \xFCberschie\xDFende Betrag besteuert</li> <li><strong>Kapitalgesellschaften (GmbH, UG, AG)</strong> haben keinen Freibetrag!</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">ESt-Anrechnung: Gewerbesteuer reduzieren</h3> <p>\nF\xFCr <strong>nat\xFCrliche Personen</strong> (Einzelunternehmer, Gesellschafter von Personengesellschaften) \n            gibt es eine wichtige Entlastung nach <strong>\xA7 35 EStG</strong>:\n</p> <ul class="list-disc pl-5 space-y-1"> <li>Das <strong>4-fache des Steuermessbetrags</strong> wird auf die Einkommensteuer angerechnet</li> <li>Bei Hebes\xE4tzen bis 400% wird die Gewerbesteuer praktisch vollst\xE4ndig kompensiert</li> <li>Bei h\xF6heren Hebes\xE4tzen verbleibt eine Restbelastung</li> </ul> <p> <strong>Beispiel:</strong> Bei 400% Hebesatz und 10.000 \u20AC Steuermessbetrag zahlen Sie 40.000 \u20AC Gewerbesteuer, \n            k\xF6nnen aber 40.000 \u20AC (4 \xD7 10.000 \u20AC) auf Ihre Einkommensteuer anrechnen.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Hinzurechnungen & K\xFCrzungen</h3> <p>\nDer Gewerbeertrag weicht oft vom steuerlichen Gewinn ab:\n</p> <h4 class="font-semibold mt-3">Hinzurechnungen (\xA7 8 GewStG):</h4> <ul class="list-disc pl-5 space-y-1"> <li>25% der Zinsen und Finanzierungskosten (nach 200.000 \u20AC Freibetrag)</li> <li>50% der Mieten/Pachten f\xFCr bewegliche G\xFCter</li> <li>75% der Mieten/Pachten f\xFCr unbewegliche G\xFCter</li> <li>25% der Lizenzgeb\xFChren</li> </ul> <h4 class="font-semibold mt-3">K\xFCrzungen (\xA7 9 GewStG):</h4> <ul class="list-disc pl-5 space-y-1"> <li>1,2% des Einheitswerts von Grundbesitz</li> <li>Gewinne aus Beteiligungen an anderen Gewerbebetrieben</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Gewerbesteuer: GmbH vs. Einzelunternehmen</h3> <p>\nDie Rechtsform beeinflusst die Gewerbesteuer erheblich:\n</p> <table class="w-full text-sm border-collapse mt-2"> <thead> <tr class="bg-gray-100"> <th class="border p-2 text-left">Aspekt</th> <th class="border p-2 text-left">Einzelunternehmen</th> <th class="border p-2 text-left">GmbH</th> </tr> </thead> <tbody> <tr> <td class="border p-2">Freibetrag</td> <td class="border p-2 text-green-600">24.500 \u20AC</td> <td class="border p-2 text-red-600">0 \u20AC</td> </tr> <tr> <td class="border p-2">ESt-Anrechnung</td> <td class="border p-2 text-green-600">Ja (4\xD7 Messbetrag)</td> <td class="border p-2 text-red-600">Nein</td> </tr> <tr> <td class="border p-2">Zus\xE4tzliche Steuern</td> <td class="border p-2">Einkommensteuer</td> <td class="border p-2">K\xF6rperschaftsteuer (15%)</td> </tr> </tbody> </table> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wer ist gewerbesteuerpflichtig?</h3> <p><strong>Gewerbesteuerpflichtig</strong> sind:</p> <ul class="list-disc pl-5 space-y-1"> <li>Alle im Inland betriebenen Gewerbebetriebe</li> <li>Kapitalgesellschaften (kraft Rechtsform immer gewerblich)</li> <li>Gewerblich t\xE4tige Personengesellschaften</li> </ul> <p class="mt-3"><strong>Nicht gewerbesteuerpflichtig</strong> sind:</p> <ul class="list-disc pl-5 space-y-1"> <li>Freiberufler (\xC4rzte, Rechtsanw\xE4lte, Steuerberater, Architekten, etc.)</li> <li>Land- und Forstwirte</li> <li>Verm\xF6gensverwaltende T\xE4tigkeiten</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Gewerbesteuer-Vorauszahlungen</h3> <p>\nDie Gewerbesteuer wird <strong>quartalsweise</strong> im Voraus gezahlt:\n</p> <ul class="list-disc pl-5 space-y-1"> <li>15. Februar (f\xFCr Q1)</li> <li>15. Mai (f\xFCr Q2)</li> <li>15. August (f\xFCr Q3)</li> <li>15. November (f\xFCr Q4)</li> </ul> <p>\nDie H\xF6he richtet sich nach der Gewerbesteuer des Vorjahres. Nach Abgabe der\n<strong>Gewerbesteuererkl\xE4rung</strong> erfolgt die Schlussabrechnung.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Gewerbesteuererkl\xE4rung: Fristen & Pflichten</h3> <p>\nDie <strong>Gewerbesteuererkl\xE4rung</strong> muss j\xE4hrlich abgegeben werden:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Frist:</strong> 31. Juli des Folgejahres (mit Steuerberater: 28./29. Februar des \xFCbern\xE4chsten Jahres)</li> <li><strong>Formulare:</strong> GewSt 1 A (Hauptvordruck), ggf. Anlagen</li> <li><strong>Elektronisch:</strong> Pflicht zur elektronischen \xDCbermittlung \xFCber ELSTER</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Gewerbesteuer sparen: Tipps</h3> <ul class="list-disc pl-5 space-y-2"> <li> <strong>Standortwahl pr\xFCfen:</strong> Gemeinden mit niedrigem Hebesatz k\xF6nnen \n              tausende Euro sparen (z.B. Gr\xFCnwald bei M\xFCnchen: 240%)\n</li> <li> <strong>Freibetrag nutzen:</strong> Als Einzelunternehmer oder Personengesellschaft \n              den Freibetrag von 24.500 \u20AC optimal ausnutzen\n</li> <li> <strong>Hinzurechnungen minimieren:</strong> Finanzierungskosten und Mieten \n              im Auge behalten (Freibetrag: 200.000 \u20AC)\n</li> <li> <strong>Rechtsform \xFCberdenken:</strong> Je nach Situation kann ein Wechsel \n              der Rechtsform steuerlich sinnvoll sein\n</li> </ul> </div> </div> </div> </main>  <script type="application/ld+json">', '<\/script>  <script type="application/ld+json">', "<\/script> "])), maybeRenderHead(), renderComponent($$result2, "GewerbesteuerRechner", GewerbesteuerRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/GewerbesteuerRechner", "client:component-export": "default" }), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Gewerbesteuer-Rechner 2025/2026",
    "description": description,
    "url": "https://deutschland-rechner.de/gewerbesteuer-rechner",
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
        "name": "Wie hoch ist die Gewerbesteuer 2025?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Die H\xF6he der Gewerbesteuer h\xE4ngt vom Hebesatz der Gemeinde ab. Die Formel lautet: Gewerbeertrag \xD7 3,5% (Steuermesszahl) \xD7 Hebesatz. Bei einem Gewinn von 100.000 \u20AC und 400% Hebesatz betr\xE4gt die Gewerbesteuer etwa 10.500 \u20AC (nach Freibetrag von 24.500 \u20AC f\xFCr Einzelunternehmer)."
        }
      },
      {
        "@type": "Question",
        "name": "Wer muss Gewerbesteuer zahlen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Gewerbesteuerpflichtig sind alle gewerblichen Unternehmen: Einzelunternehmer mit Gewerbebetrieb, Personengesellschaften (GbR, OHG, KG) und Kapitalgesellschaften (GmbH, UG, AG). Nicht gewerbesteuerpflichtig sind Freiberufler, Land- und Forstwirte sowie rein verm\xF6gensverwaltende T\xE4tigkeiten."
        }
      },
      {
        "@type": "Question",
        "name": "Was ist der Gewerbesteuer-Freibetrag?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Der Freibetrag betr\xE4gt 24.500 \u20AC pro Jahr und gilt nur f\xFCr Einzelunternehmer und Personengesellschaften. Kapitalgesellschaften (GmbH, UG, AG) haben keinen Freibetrag. Bei einem Gewerbeertrag unter 24.500 \u20AC f\xE4llt somit keine Gewerbesteuer an."
        }
      },
      {
        "@type": "Question",
        "name": "Was ist der Hebesatz bei der Gewerbesteuer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Der Hebesatz wird von jeder Gemeinde selbst festgelegt und liegt zwischen 200% (Mindest-Hebesatz) und \xFCber 900% bei einigen Gro\xDFst\xE4dten. Der Durchschnitt liegt bei etwa 400-450%. Der Hebesatz wird mit dem Steuermessbetrag multipliziert, um die Gewerbesteuer zu berechnen."
        }
      },
      {
        "@type": "Question",
        "name": "Wird die Gewerbesteuer auf die Einkommensteuer angerechnet?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, f\xFCr Einzelunternehmer und Gesellschafter von Personengesellschaften wird das 4-fache des Steuermessbetrags auf die Einkommensteuer angerechnet (\xA7 35 EStG). Bei einem Hebesatz von 400% wird die Gewerbesteuer dadurch praktisch vollst\xE4ndig kompensiert. F\xFCr GmbHs gilt diese Anrechnung nicht."
        }
      },
      {
        "@type": "Question",
        "name": "Wann muss die Gewerbesteuererkl\xE4rung abgegeben werden?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Die Gewerbesteuererkl\xE4rung muss bis zum 31. Juli des Folgejahres elektronisch \xFCber ELSTER abgegeben werden. Mit Steuerberater verl\xE4ngert sich die Frist auf den 28./29. Februar des \xFCbern\xE4chsten Jahres. Vorauszahlungen sind quartalsweise am 15.02., 15.05., 15.08. und 15.11. f\xE4llig."
        }
      }
    ]
  }))) })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/gewerbesteuer-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/gewerbesteuer-rechner.astro";
const $$url = "/gewerbesteuer-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$GewerbesteuerRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
