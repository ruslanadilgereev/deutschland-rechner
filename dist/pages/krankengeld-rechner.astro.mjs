/* empty css                                                    */
import { c as createComponent, a as renderComponent, r as renderTemplate, u as unescapeHTML, m as maybeRenderHead } from '../chunks/astro/server_X4Fuu-a1.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_BdQXYkEU.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const BBG_KV_MONAT = 5512.5;
const BEITRAGSSAETZE = {
  rentenversicherung: 0.093,
  // 9,3% (halber Satz)
  arbeitslosenversicherung: 0.013,
  // 1,3% (halber Satz)
  pflegeversicherung: 0.017,
  // 1,7% Basis
  pflegeversicherungKinderlos: 6e-3,
  // +0,6% Zuschlag für Kinderlose ab 23
  pflegeversicherungMehrKinder: [-25e-4, -5e-3, -75e-4, -0.01]
  // Abschläge für 2-5 Kinder
};
const MAX_KRANKENGELD_WOCHEN = 78;
const MAX_KRANKENGELD_TAGE = 546;
function KrankengeldRechner() {
  const [bruttogehalt, setBruttogehalt] = useState(3500);
  const [nettogehalt, setNettogehalt] = useState(2400);
  const [hatKinder, setHatKinder] = useState(false);
  const [anzahlKinder, setAnzahlKinder] = useState(0);
  const [alter, setAlter] = useState(35);
  const [berechnungsart, setBerechnungsart] = useState("monat");
  const [krankheitsdauer, setKrankheitsdauer] = useState(90);
  const ergebnis = useMemo(() => {
    const regelentgeltBrutto = Math.min(bruttogehalt, BBG_KV_MONAT);
    const tagesbrutto = regelentgeltBrutto / 30;
    const tagesNetto = nettogehalt / 30;
    const krankengeld70Brutto = tagesbrutto * 0.7;
    const krankengeld90Netto = tagesNetto * 0.9;
    const krankengeldBruttoTag = Math.min(krankengeld70Brutto, krankengeld90Netto);
    const nettoGrenzeGreift = krankengeld70Brutto > krankengeld90Netto;
    const beitragRV = krankengeldBruttoTag * BEITRAGSSAETZE.rentenversicherung;
    const beitragAV = krankengeldBruttoTag * BEITRAGSSAETZE.arbeitslosenversicherung;
    let pflegeSatz = BEITRAGSSAETZE.pflegeversicherung;
    if (!hatKinder && alter >= 23) {
      pflegeSatz += BEITRAGSSAETZE.pflegeversicherungKinderlos;
    }
    if (hatKinder && anzahlKinder >= 2) {
      const abschlagIndex = Math.min(anzahlKinder - 2, 3);
      pflegeSatz += BEITRAGSSAETZE.pflegeversicherungMehrKinder[abschlagIndex];
    }
    const beitragPV = krankengeldBruttoTag * Math.max(0, pflegeSatz);
    const svBeitraegeTag = beitragRV + beitragAV + beitragPV;
    const krankengeldNettoTag = krankengeldBruttoTag - svBeitraegeTag;
    const krankengeldBruttoMonat = krankengeldBruttoTag * 30;
    const krankengeldNettoMonat = krankengeldNettoTag * 30;
    const krankengeldBruttoWoche = krankengeldBruttoTag * 7;
    const krankengeldNettoWoche = krankengeldNettoTag * 7;
    const einkommensverlust = nettogehalt - krankengeldNettoMonat;
    const verlustProzent = einkommensverlust / nettogehalt * 100;
    const gesamtTage = Math.min(krankheitsdauer, MAX_KRANKENGELD_TAGE - 42);
    const gesamtKrankengeldBrutto = krankengeldBruttoTag * gesamtTage;
    const gesamtKrankengeldNetto = krankengeldNettoTag * gesamtTage;
    const maxBezugWochen = MAX_KRANKENGELD_WOCHEN - 6;
    const maxBezugTage = maxBezugWochen * 7;
    return {
      // Eingangswerte
      bruttogehalt,
      nettogehalt,
      regelentgeltBrutto,
      // Berechnung
      tagesbrutto,
      tagesNetto,
      krankengeld70Brutto,
      krankengeld90Netto,
      nettoGrenzeGreift,
      // Brutto-Krankengeld
      krankengeldBruttoTag,
      krankengeldBruttoWoche,
      krankengeldBruttoMonat,
      // SV-Beiträge
      beitragRV,
      beitragAV,
      beitragPV,
      svBeitraegeTag,
      svBeitraegeMonat: svBeitraegeTag * 30,
      pflegeSatz,
      // Netto-Krankengeld
      krankengeldNettoTag,
      krankengeldNettoWoche,
      krankengeldNettoMonat,
      // Verlust
      einkommensverlust,
      verlustProzent,
      // Gesamtleistung
      gesamtTage,
      gesamtKrankengeldBrutto,
      gesamtKrankengeldNetto,
      // Bezugsdauer
      maxBezugWochen,
      maxBezugTage
    };
  }, [bruttogehalt, nettogehalt, hatKinder, anzahlKinder, alter, krankheitsdauer]);
  const formatEuro = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  const formatEuroRound = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";
  const formatProzent = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " %";
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Monatliches Bruttogehalt" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Regelmäßiges Arbeitsentgelt vor Steuern und Abgaben" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: bruttogehalt,
              onChange: (e) => setBruttogehalt(Math.max(0, Number(e.target.value))),
              className: "w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none",
              min: "0",
              max: "15000",
              step: "50"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl", children: "€" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: bruttogehalt,
            onChange: (e) => setBruttogehalt(Number(e.target.value)),
            className: "w-full mt-3 accent-teal-500",
            min: "1000",
            max: "8000",
            step: "50"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "1.000 €" }),
          /* @__PURE__ */ jsx("span", { children: "4.500 €" }),
          /* @__PURE__ */ jsx("span", { children: "8.000 €" })
        ] }),
        bruttogehalt > BBG_KV_MONAT && /* @__PURE__ */ jsxs("p", { className: "text-sm text-amber-600 mt-2", children: [
          "⚠️ Beitragsbemessungsgrenze erreicht: max. ",
          formatEuro(BBG_KV_MONAT),
          " werden berücksichtigt"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Monatliches Nettogehalt" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Auszahlungsbetrag nach Steuern und Sozialabgaben" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: nettogehalt,
              onChange: (e) => setNettogehalt(Math.max(0, Number(e.target.value))),
              className: "w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none",
              min: "0",
              max: "10000",
              step: "50"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg", children: "€" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: nettogehalt,
            onChange: (e) => setNettogehalt(Number(e.target.value)),
            className: "w-full mt-3 accent-teal-500",
            min: "500",
            max: "5000",
            step: "50"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Ihr Alter" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setAlter(Math.max(16, alter - 1)),
              className: "w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors",
              children: "−"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-3xl font-bold text-gray-800", children: alter }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-500 ml-1", children: "Jahre" })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setAlter(Math.min(67, alter + 1)),
              className: "w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors",
              children: "+"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Haben Sie Kinder?" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Relevant für den Pflegeversicherungs-Beitrag" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 mb-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setHatKinder(false);
                setAnzahlKinder(0);
              },
              className: `py-3 px-4 rounded-xl font-medium transition-all ${!hatKinder ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: "Keine Kinder"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setHatKinder(true);
                setAnzahlKinder(Math.max(1, anzahlKinder));
              },
              className: `py-3 px-4 rounded-xl font-medium transition-all ${hatKinder ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: "Mit Kindern"
            }
          )
        ] }),
        hatKinder && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 p-4 bg-teal-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm text-teal-700", children: "Anzahl Kinder:" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setAnzahlKinder(Math.max(1, anzahlKinder - 1)),
              className: "w-10 h-10 rounded-xl bg-white hover:bg-teal-100 text-lg font-bold transition-colors",
              children: "−"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-teal-800 w-8 text-center", children: anzahlKinder }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setAnzahlKinder(Math.min(6, anzahlKinder + 1)),
              className: "w-10 h-10 rounded-xl bg-white hover:bg-teal-100 text-lg font-bold transition-colors",
              children: "+"
            }
          )
        ] }),
        !hatKinder && alter >= 23 && /* @__PURE__ */ jsx("p", { className: "text-xs text-amber-600 mt-2", children: "ℹ️ Kinderlose ab 23 Jahren zahlen 0,6% mehr Pflegeversicherung" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Geplante Krankheitsdauer" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Nach den 6 Wochen Lohnfortzahlung durch den Arbeitgeber" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4 mb-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-3xl font-bold text-gray-800", children: krankheitsdauer }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Tage" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: krankheitsdauer,
            onChange: (e) => setKrankheitsdauer(Number(e.target.value)),
            className: "w-full accent-teal-500",
            min: "1",
            max: "504",
            step: "1"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "1 Tag" }),
          /* @__PURE__ */ jsx("span", { children: "3 Monate" }),
          /* @__PURE__ */ jsx("span", { children: "72 Wochen max." })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 mt-2 text-center", children: [
          "= ",
          Math.floor(krankheitsdauer / 30),
          " Monate und ",
          krankheitsdauer % 30,
          " Tage (",
          Math.floor(krankheitsdauer / 7),
          " Wochen)"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: "💊 Ihr voraussichtliches Krankengeld" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuroRound(ergebnis.krankengeldNettoMonat) }),
          /* @__PURE__ */ jsx("span", { className: "text-xl opacity-80", children: "netto / Monat" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-teal-100 mt-2 text-sm", children: [
          "Das sind ",
          /* @__PURE__ */ jsx("strong", { children: formatEuro(ergebnis.krankengeldNettoTag) }),
          " pro Tag (",
          formatEuro(ergebnis.krankengeldBruttoTag),
          " brutto)"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Brutto / Monat" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuroRound(ergebnis.krankengeldBruttoMonat) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Einkommensverlust" }),
          /* @__PURE__ */ jsxs("div", { className: "text-xl font-bold text-red-200", children: [
            "−",
            formatEuroRound(ergebnis.einkommensverlust)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-sm opacity-80", children: [
            "Bei ",
            krankheitsdauer,
            " Tagen Krankheit"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-lg font-bold", children: formatEuroRound(ergebnis.gesamtKrankengeldNetto) })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-teal-100 mt-1", children: "Gesamtes Netto-Krankengeld nach Sozialabgaben" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📅 Zeitlicher Ablauf bei Krankheit" }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative pl-10", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute left-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-white text-xs", children: "1" }) }),
            /* @__PURE__ */ jsxs("div", { className: "bg-green-50 border border-green-200 rounded-xl p-4", children: [
              /* @__PURE__ */ jsx("h4", { className: "font-semibold text-green-800", children: "Woche 1-6: Lohnfortzahlung" }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-green-700 mt-1", children: [
                "Der Arbeitgeber zahlt ",
                /* @__PURE__ */ jsx("strong", { children: "100% Ihres Gehalts" }),
                " weiter."
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-green-600 mt-2", children: "Basis: § 3 Entgeltfortzahlungsgesetz (EFZG)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative pl-10", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute left-2 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-white text-xs", children: "2" }) }),
            /* @__PURE__ */ jsxs("div", { className: "bg-teal-50 border border-teal-200 rounded-xl p-4", children: [
              /* @__PURE__ */ jsx("h4", { className: "font-semibold text-teal-800", children: "Ab Woche 7: Krankengeld" }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-teal-700 mt-1", children: [
                "Die Krankenkasse zahlt ",
                /* @__PURE__ */ jsxs("strong", { children: [
                  formatEuroRound(ergebnis.krankengeldNettoMonat),
                  "/Monat"
                ] }),
                "(ca. ",
                formatProzent(100 - ergebnis.verlustProzent),
                " Ihres Nettos)."
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-teal-600 mt-2", children: "Basis: § 44 SGB V – Krankengeld" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative pl-10", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute left-2 w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-white text-xs", children: "3" }) }),
            /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 border border-gray-200 rounded-xl p-4", children: [
              /* @__PURE__ */ jsx("h4", { className: "font-semibold text-gray-800", children: "Max. Woche 78: Ende Krankengeld" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Nach 78 Wochen (72 + 6) endet der Anspruch. Danach ggf. Arbeitslosengeld oder Erwerbsminderungsrente." }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-2", children: "Sperrfrist: 3 Jahre für dieselbe Krankheit" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Berechnungsdetails" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide", children: "Berechnungsgrundlage" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Bruttogehalt (monatlich)" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(bruttogehalt) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Regelentgelt (max. BBG)" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatEuro(ergebnis.regelentgeltBrutto) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Tagesbrutto (÷ 30 Tage)" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatEuro(ergebnis.tagesbrutto) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide pt-4", children: "Krankengeld-Brutto" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "70% vom Tagesbrutto" }),
          /* @__PURE__ */ jsx("span", { className: `${!ergebnis.nettoGrenzeGreift ? "font-bold text-teal-600" : "text-gray-400"}`, children: formatEuro(ergebnis.krankengeld70Brutto) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "90% vom Tagesnetto" }),
          /* @__PURE__ */ jsx("span", { className: `${ergebnis.nettoGrenzeGreift ? "font-bold text-teal-600" : "text-gray-400"}`, children: formatEuro(ergebnis.krankengeld90Netto) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-teal-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsxs("span", { className: "font-medium text-teal-700", children: [
            "= Krankengeld brutto / Tag",
            /* @__PURE__ */ jsxs("span", { className: "text-xs font-normal ml-1", children: [
              "(",
              ergebnis.nettoGrenzeGreift ? "Netto-Grenze" : "70%-Regel",
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-teal-900", children: formatEuro(ergebnis.krankengeldBruttoTag) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide pt-4", children: "Abzüge (Sozialversicherung)" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-red-600", children: [
          /* @__PURE__ */ jsx("span", { children: "− Rentenversicherung (9,3%)" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.beitragRV) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-red-600", children: [
          /* @__PURE__ */ jsx("span", { children: "− Arbeitslosenversicherung (1,3%)" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.beitragAV) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-red-600", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "− Pflegeversicherung (",
            formatProzent(ergebnis.pflegeSatz * 100),
            ")"
          ] }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.beitragPV) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-red-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-red-700", children: "= Summe Abzüge / Tag" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-red-900", children: formatEuro(ergebnis.svBeitraegeTag) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-3 bg-teal-100 -mx-6 px-6 rounded-b-xl mt-4", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-teal-800", children: "Krankengeld netto / Tag" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-2xl text-teal-900", children: formatEuro(ergebnis.krankengeldNettoTag) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Krankengeld netto / Monat (×30)" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-teal-700", children: formatEuro(ergebnis.krankengeldNettoMonat) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert Krankengeld" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "70% vom Brutto:" }),
            " Krankengeld beträgt 70% des regelmäßigen Bruttoentgelts"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Max. 90% vom Netto:" }),
            " Das Krankengeld darf 90% des Nettoentgelts nicht übersteigen"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "BBG-Deckel:" }),
            " Nur Einkommen bis zur Beitragsbemessungsgrenze (",
            formatEuro(BBG_KV_MONAT),
            "/Monat) wird berücksichtigt"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Ab Tag 43:" }),
            " Krankengeld wird erst nach 6 Wochen Lohnfortzahlung gezahlt"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Max. 78 Wochen:" }),
            " Bezugsdauer für dieselbe Krankheit innerhalb von 3 Jahren"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Mit Abzügen:" }),
            " Auf Krankengeld werden RV, AV und PV abgezogen (Arbeitnehmeranteil)"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-teal-50 border border-teal-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-teal-800 mb-3", children: "👥 Wer hat Anspruch auf Krankengeld?" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm text-teal-700", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Anspruchsberechtigt" }),
          " sind gesetzlich Krankenversicherte mit Krankengeldanspruch:"
        ] }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-1 pl-4", children: [
          /* @__PURE__ */ jsx("li", { children: "• Arbeitnehmer in der gesetzlichen Krankenversicherung" }),
          /* @__PURE__ */ jsx("li", { children: "• Arbeitslose mit ALG I" }),
          /* @__PURE__ */ jsx("li", { children: "• Bezieher von Kurzarbeitergeld" }),
          /* @__PURE__ */ jsx("li", { children: "• Freiwillig Versicherte (mit Wahltarif Krankengeld)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/50 rounded-xl p-4 mt-3", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-teal-800 mb-2", children: "⚠️ Kein Krankengeld erhalten:" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("li", { children: "• Familienversicherte (kein eigenes Einkommen)" }),
            /* @__PURE__ */ jsx("li", { children: "• Privatversicherte (separate Krankentagegeld-Versicherung)" }),
            /* @__PURE__ */ jsx("li", { children: "• Rentner" }),
            /* @__PURE__ */ jsx("li", { children: "• Minijobber ohne Krankengeld-Wahltarif" }),
            /* @__PURE__ */ jsx("li", { children: "• Selbstständige ohne Wahltarif" })
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
            /* @__PURE__ */ jsx("strong", { children: "AU-Bescheinigung:" }),
            " Krankschreibung muss lückenlos vorliegen – Folgebescheinigung vor Ablauf holen!"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Krankmeldung:" }),
            " Arbeitgeber und Krankenkasse müssen unverzüglich informiert werden"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Blockfrist:" }),
            " Nach 78 Wochen Krankengeld muss 3 Jahre gewartet werden, bevor für dieselbe Krankheit erneut Anspruch besteht"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Aussteuerung:" }),
            " Nach Ende des Krankengeldes droht Kündigung – frühzeitig um ALG oder Reha kümmern"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Nebenverdienst:" }),
            " Während Krankengeldbezug ist Arbeit grundsätzlich untersagt (Ausnahmen möglich)"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörde" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-teal-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-teal-900", children: "Ihre gesetzliche Krankenkasse" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-teal-700 mt-1", children: "Krankengeld wird von Ihrer Krankenkasse gezahlt. Diese wird automatisch vom Arbeitgeber nach 6 Wochen informiert." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Krankenkassen-Hotline" }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Kontaktdaten auf Ihrer Versichertenkarte" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Online-Services" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.gkv-spitzenverband.de",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "GKV-Spitzenverband →"
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
              /* @__PURE__ */ jsx("li", { children: "• Arbeitsunfähigkeitsbescheinigung (AU)" }),
              /* @__PURE__ */ jsx("li", { children: "• Entgeltbescheinigung vom Arbeitgeber" }),
              /* @__PURE__ */ jsx("li", { children: "• Ggf. Antrag auf Krankengeld (bei einigen Kassen)" })
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
            href: "https://www.gesetze-im-internet.de/sgb_5/__44.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "§ 44 SGB V – Krankengeld – Gesetze im Internet"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/sgb_5/__47.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "§ 47 SGB V – Höhe und Berechnung des Krankengeldes"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bundesgesundheitsministerium.de/krankengeld",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesministerium für Gesundheit – Krankengeld"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gkv-spitzenverband.de",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "GKV-Spitzenverband – Gesetzliche Krankenversicherung"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.deutsche-rentenversicherung.de",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Deutsche Rentenversicherung – Beitragssätze 2025"
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
const $$KrankengeldRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "Krankengeld-Rechner 2025 \u2013 H\xF6he, Dauer & Berechnung online";
  const description = "Krankengeld Rechner 2025: Berechnen Sie Ihr Krankengeld online. 70% vom Brutto, max. 90% vom Netto. Mit Abz\xFCgen, Bezugsdauer & Zeitplan. Jetzt Anspruch pr\xFCfen!";
  const keywords = "Krankengeld Rechner, Krankengeld berechnen, Krankengeld H\xF6he, Krankengeld 2025, Krankengeld Dauer, Krankengeld Abz\xFCge, Krankengeld wie lange, Krankengeld nach 6 Wochen, Lohnfortzahlung Ende, Krankengeld Krankenkasse, Krankengeld netto, Krankengeld brutto, Arbeitsunf\xE4higkeit Geld, Krankengeldh\xF6he berechnen";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<main class="min-h-screen pb-8"> <!-- Header mit Zur\xFCck-Button --> <header class="bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-teal-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>\nAlle Rechner\n</a> <div class="flex items-center gap-3"> <span class="text-4xl">\u{1F3E5}</span> <div> <h1 class="text-2xl font-bold">Krankengeld-Rechner</h1> <p class="text-teal-100 text-sm">H\xF6he & Dauer 2025 berechnen</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ', ' </div> <!-- SEO Content Section --> <div class="max-w-2xl mx-auto px-4 mt-8"> <div class="bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">Krankengeld 2025: Was Sie wissen m\xFCssen</h2> <div class="prose prose-sm text-gray-600 space-y-4"> <p>\nDas <strong>Krankengeld</strong> ist eine Lohnersatzleistung der gesetzlichen Krankenversicherung. \n            Es springt ein, wenn die <strong>6-w\xF6chige Lohnfortzahlung durch den Arbeitgeber</strong> endet \n            und Sie weiterhin arbeitsunf\xE4hig sind. Mit unserem <strong>Krankengeld-Rechner</strong> ermitteln \n            Sie schnell und einfach, wie viel Geld Ihnen zusteht.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wie wird Krankengeld berechnet?</h3> <p>\nDie Berechnung des Krankengeldes folgt klaren gesetzlichen Regeln nach <strong>\xA7 47 SGB V</strong>:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>70% vom Bruttogehalt:</strong> Grundlage ist Ihr regelm\xE4\xDFiges Arbeitsentgelt</li> <li><strong>Maximal 90% vom Nettogehalt:</strong> Das Krankengeld darf nicht h\xF6her sein</li> <li><strong>BBG-Deckel:</strong> Nur Einkommen bis 5.512,50 \u20AC/Monat (2025) wird ber\xFCcksichtigt</li> </ul> <p>\nVon diesem Brutto-Krankengeld werden noch <strong>Sozialversicherungsbeitr\xE4ge</strong> abgezogen \n            (Renten-, Arbeitslosen- und Pflegeversicherung).\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Ablauf: Wann beginnt das Krankengeld?</h3> <p>\nDer Anspruch auf Krankengeld entsteht <strong>nach 6 Wochen Arbeitsunf\xE4higkeit</strong>:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Woche 1-6:</strong> Ihr Arbeitgeber zahlt Ihr volles Gehalt weiter (Entgeltfortzahlung)</li> <li><strong>Ab Woche 7:</strong> Die Krankenkasse \xFCbernimmt mit Krankengeld</li> <li><strong>Bis Woche 78:</strong> Maximale Bezugsdauer f\xFCr dieselbe Krankheit</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wie lange bekommt man Krankengeld?</h3> <p>\nDie <strong>maximale Bezugsdauer</strong> betr\xE4gt <strong>78 Wochen</strong> (inkl. 6 Wochen Lohnfortzahlung) \n            innerhalb von 3 Jahren f\xFCr <strong>dieselbe Krankheit</strong>. Danach:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Aussteuerung:</strong> Krankengeld endet, ggf. Arbeitslosengeld beantragen</li> <li><strong>Erwerbsminderungsrente:</strong> Pr\xFCfen, ob eine dauerhafte Erwerbsminderung vorliegt</li> <li><strong>Reha:</strong> Teilnahme an einer Rehabilitationsma\xDFnahme</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Krankengeld: Brutto vs. Netto</h3> <p>\nDas <strong>Brutto-Krankengeld</strong> ist nicht das, was auf Ihrem Konto landet. Davon werden \n            Sozialversicherungsbeitr\xE4ge abgezogen:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Rentenversicherung:</strong> 9,3% (halber Beitragssatz)</li> <li><strong>Arbeitslosenversicherung:</strong> 1,3% (halber Beitragssatz)</li> <li><strong>Pflegeversicherung:</strong> 1,7-2,3% (je nach Kindern/Alter)</li> </ul> <p> <strong>Krankenversicherung</strong> wird nicht abgezogen \u2013 Sie bleiben beitragsfrei versichert.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wer hat Anspruch auf Krankengeld?</h3> <p> <strong>Anspruchsberechtigt</strong> sind Mitglieder der gesetzlichen Krankenversicherung mit \n            Krankengeldanspruch \u2013 das sind insbesondere:\n</p> <ul class="list-disc pl-5 space-y-1"> <li>Arbeitnehmer (Vollzeit, Teilzeit, befristet)</li> <li>Empf\xE4nger von Arbeitslosengeld I</li> <li>Kurzarbeitergeld-Empf\xE4nger</li> <li>Freiwillig Versicherte mit Wahltarif Krankengeld</li> </ul> <p> <strong>Keinen Anspruch</strong> haben Familienversicherte, Rentner, Privatversicherte und \n            Minijobber ohne Krankengeld-Option.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Krankmeldung: Was ist zu beachten?</h3> <p>\nF\xFCr einen l\xFCckenlosen Krankengeld-Anspruch ist wichtig:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Arbeitsunf\xE4higkeitsbescheinigung (AU):</strong> Muss l\xFCckenlos vorliegen</li> <li><strong>Folgebescheinigung:</strong> Vor Ablauf der aktuellen AU einholen!</li> <li><strong>Meldung:</strong> Arbeitgeber und Krankenkasse unverz\xFCglich informieren</li> </ul> <p>\nSeit 2023 wird die <strong>elektronische AU (eAU)</strong> direkt an Arbeitgeber und Krankenkasse \n            \xFCbermittelt. Dennoch sollten Sie Fristen im Blick behalten.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Krankengeld und Nebenverdienst</h3> <p>\nW\xE4hrend des Krankengeldbezugs ist Arbeit grunds\xE4tzlich <strong>untersagt</strong>. Ausnahmen:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Stufenweise Wiedereingliederung:</strong> Mit \xE4rztlicher Genehmigung schrittweise zur\xFCck in den Job</li> <li><strong>Genesungsf\xF6rderliche T\xE4tigkeiten:</strong> In seltenen F\xE4llen, nach Absprache mit Arzt und Kasse</li> </ul> <p>\nEin Nebenjob w\xE4hrend der Krankschreibung kann zum <strong>Verlust des Krankengeldes</strong> f\xFChren!\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Krankengeld vs. Arbeitslosengeld</h3> <p>\nNach Aussteuerung (Ende Krankengeld) k\xF6nnen Sie <strong>Arbeitslosengeld I</strong> beantragen \u2013 \n            sofern Sie dem Arbeitsmarkt zur Verf\xFCgung stehen:\n</p> <ul class="list-disc pl-5 space-y-1"> <li>Mindestens 15 Stunden/Woche arbeitsf\xE4hig</li> <li>Anwartschaftszeit erf\xFCllt (mind. 12 Monate versicherungspflichtig in 30 Monaten)</li> </ul> <p>\nNutzen Sie unseren <a href="/arbeitslosengeld-rechner" class="text-teal-600 hover:underline">Arbeitslosengeld-Rechner</a>\nf\xFCr die Berechnung.\n</p> </div> </div> </div> </main>  <script type="application/ld+json">', '<\/script>  <script type="application/ld+json">', "<\/script> "])), maybeRenderHead(), renderComponent($$result2, "KrankengeldRechner", KrankengeldRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/KrankengeldRechner", "client:component-export": "default" }), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Krankengeld-Rechner 2025",
    "description": description,
    "url": "https://deutschland-rechner.de/krankengeld-rechner",
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
        "name": "Wie hoch ist das Krankengeld 2025?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Das Krankengeld betr\xE4gt 70% des Bruttogehalts, maximal jedoch 90% des Nettogehalts. Von diesem Betrag werden noch Sozialversicherungsbeitr\xE4ge (ca. 12%) abgezogen. Bei einem Bruttogehalt von 3.500\u20AC und 2.400\u20AC netto erhalten Sie etwa 70-75\u20AC Krankengeld pro Tag."
        }
      },
      {
        "@type": "Question",
        "name": "Wann beginnt das Krankengeld?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Das Krankengeld beginnt nach 6 Wochen (42 Tagen) Arbeitsunf\xE4higkeit. In den ersten 6 Wochen zahlt der Arbeitgeber das volle Gehalt weiter (Entgeltfortzahlung nach EFZG). Ab dem 43. Tag \xFCbernimmt die Krankenkasse."
        }
      },
      {
        "@type": "Question",
        "name": "Wie lange bekommt man Krankengeld?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Krankengeld wird maximal 78 Wochen (inkl. 6 Wochen Lohnfortzahlung) f\xFCr dieselbe Krankheit innerhalb von 3 Jahren gezahlt. Das entspricht 72 Wochen reinem Krankengeld. Danach spricht man von 'Aussteuerung'."
        }
      },
      {
        "@type": "Question",
        "name": "Wer zahlt Krankengeld?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Das Krankengeld wird von Ihrer gesetzlichen Krankenkasse gezahlt. Sie werden automatisch vom Arbeitgeber nach Ende der Lohnfortzahlung informiert. Die Auszahlung erfolgt in der Regel monatlich auf Ihr Konto."
        }
      },
      {
        "@type": "Question",
        "name": "Wird vom Krankengeld Steuer abgezogen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Krankengeld ist steuerfrei, unterliegt aber dem Progressionsvorbehalt. Das bedeutet: Es erh\xF6ht Ihren Steuersatz f\xFCr Ihr \xFCbriges Einkommen. Abgezogen werden nur Sozialversicherungsbeitr\xE4ge (Renten-, Arbeitslosen-, Pflegeversicherung)."
        }
      }
    ]
  }))) })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/krankengeld-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/krankengeld-rechner.astro";
const $$url = "/krankengeld-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$KrankengeldRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
