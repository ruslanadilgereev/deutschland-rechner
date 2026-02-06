/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_v22DC8tm.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
export { renderers } from '../renderers.mjs';

const SELBSTBEHALT = {
  erwerbstaetigOhneKinder: 1600,
  // Angemessener Selbstbehalt gegenüber Ex-Ehegatte
  nichtErwerbstaetigOhneKinder: 1475,
  mitKindesunterhalt: 1450
  // Bei Zahlung von Kindesunterhalt
};
const BERUFSBEDINGTE_AUFWENDUNGEN_PROZENT = 0.05;
const BERUFSBEDINGTE_AUFWENDUNGEN_MAX = 150;
function berechneBerufsbedingteAufwendungen(netto) {
  const aufwendungen = netto * BERUFSBEDINGTE_AUFWENDUNGEN_PROZENT;
  return Math.min(aufwendungen, BERUFSBEDINGTE_AUFWENDUNGEN_MAX);
}
function berechneEhegattenunterhalt(nettoUnterhaltspflichtiger, nettoUnterhaltsberechtigter, erwerbstaetigPflichtiger, erwerbstaetigBerechtigter, kindesunterhaltMonatlich, unterhaltsArt) {
  const aufwendungenPflichtiger = erwerbstaetigPflichtiger ? berechneBerufsbedingteAufwendungen(nettoUnterhaltspflichtiger) : 0;
  const aufwendungenBerechtigter = erwerbstaetigBerechtigter ? berechneBerufsbedingteAufwendungen(nettoUnterhaltsberechtigter) : 0;
  let bereinigtPflichtiger = nettoUnterhaltspflichtiger - aufwendungenPflichtiger - kindesunterhaltMonatlich;
  let bereinigtBerechtigter = nettoUnterhaltsberechtigter - aufwendungenBerechtigter;
  bereinigtPflichtiger = Math.max(0, bereinigtPflichtiger);
  bereinigtBerechtigter = Math.max(0, bereinigtBerechtigter);
  const differenz = bereinigtPflichtiger - bereinigtBerechtigter;
  if (differenz <= 0) {
    return {
      bruttoUnterschied: differenz,
      angemessenerUnterhalt: 0,
      zahlbetrag: 0,
      quotenMethode: "3/7",
      bereinigtesNettoUnterhaltspflichtiger: bereinigtPflichtiger,
      bereinigtesNettoUnterhaltsberechtigter: bereinigtBerechtigter,
      differenz,
      halfteDifferenz: 0,
      selbstbehaltGefaehrdet: false,
      verbleibtNachUnterhalt: bereinigtPflichtiger,
      erwerbstaetigenBonus: 0
    };
  }
  let erwerbstaetigenBonus = 0;
  let quotenMethode = "3/7";
  let angemessenerUnterhalt = 0;
  if (erwerbstaetigPflichtiger && erwerbstaetigBerechtigter) {
    angemessenerUnterhalt = differenz * 3 / 7;
    erwerbstaetigenBonus = differenz - angemessenerUnterhalt * 2;
    quotenMethode = "3/7";
  } else if (erwerbstaetigPflichtiger && !erwerbstaetigBerechtigter) {
    angemessenerUnterhalt = differenz * 3 / 7;
    erwerbstaetigenBonus = differenz / 7;
    quotenMethode = "3/7";
  } else {
    angemessenerUnterhalt = differenz / 2;
    quotenMethode = "45%";
  }
  angemessenerUnterhalt = Math.round(angemessenerUnterhalt);
  let selbstbehalt = SELBSTBEHALT.erwerbstaetigOhneKinder;
  if (!erwerbstaetigPflichtiger) {
    selbstbehalt = SELBSTBEHALT.nichtErwerbstaetigOhneKinder;
  }
  if (kindesunterhaltMonatlich > 0) {
    selbstbehalt = SELBSTBEHALT.mitKindesunterhalt;
  }
  const verbleibtNachUnterhalt = bereinigtPflichtiger - angemessenerUnterhalt;
  const selbstbehaltGefaehrdet = verbleibtNachUnterhalt < selbstbehalt;
  let zahlbetrag = angemessenerUnterhalt;
  if (selbstbehaltGefaehrdet) {
    zahlbetrag = Math.max(0, bereinigtPflichtiger - selbstbehalt);
  }
  return {
    bruttoUnterschied: nettoUnterhaltspflichtiger - nettoUnterhaltsberechtigter,
    angemessenerUnterhalt,
    zahlbetrag: Math.round(zahlbetrag),
    quotenMethode,
    bereinigtesNettoUnterhaltspflichtiger: bereinigtPflichtiger,
    bereinigtesNettoUnterhaltsberechtigter: bereinigtBerechtigter,
    differenz: Math.round(differenz),
    halfteDifferenz: Math.round(differenz / 2),
    selbstbehaltGefaehrdet,
    verbleibtNachUnterhalt: Math.round(verbleibtNachUnterhalt),
    erwerbstaetigenBonus: Math.round(erwerbstaetigenBonus)
  };
}
function EhegattenunterhaltRechner() {
  const [unterhaltsArt, setUnterhaltsArt] = useState("trennung");
  const [nettoPflichtiger, setNettoPflichtiger] = useState(4e3);
  const [nettoBerechtigter, setNettoBerechtigter] = useState(1500);
  const [erwerbstaetigPflichtiger, setErwerbstaetigPflichtiger] = useState(true);
  const [erwerbstaetigBerechtigter, setErwerbstaetigBerechtigter] = useState(true);
  const [kindesunterhaltMonatlich, setKindesunterhaltMonatlich] = useState(0);
  const ergebnis = berechneEhegattenunterhalt(
    nettoPflichtiger,
    nettoBerechtigter,
    erwerbstaetigPflichtiger,
    erwerbstaetigBerechtigter,
    kindesunterhaltMonatlich);
  return /* @__PURE__ */ jsxs("div", { className: "max-w-lg mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "💔 Art des Unterhalts" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setUnterhaltsArt("trennung"),
            className: `p-4 rounded-xl text-left transition-all ${unterhaltsArt === "trennung" ? "bg-purple-500 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
            children: [
              /* @__PURE__ */ jsx("div", { className: "font-bold", children: "Trennungsunterhalt" }),
              /* @__PURE__ */ jsx("div", { className: `text-xs mt-1 ${unterhaltsArt === "trennung" ? "text-purple-200" : "text-gray-500"}`, children: "Während der Trennungszeit" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setUnterhaltsArt("nachehelich"),
            className: `p-4 rounded-xl text-left transition-all ${unterhaltsArt === "nachehelich" ? "bg-purple-500 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
            children: [
              /* @__PURE__ */ jsx("div", { className: "font-bold", children: "Nachehelicher Unterhalt" }),
              /* @__PURE__ */ jsx("div", { className: `text-xs mt-1 ${unterhaltsArt === "nachehelich" ? "text-purple-200" : "text-gray-500"}`, children: "Nach rechtskräftiger Scheidung" })
            ]
          }
        )
      ] }),
      unterhaltsArt === "nachehelich" && /* @__PURE__ */ jsx("div", { className: "mt-4 p-3 bg-yellow-50 rounded-xl", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-yellow-800", children: [
        /* @__PURE__ */ jsx("strong", { children: "Hinweis:" }),
        " Nachehelicher Unterhalt besteht nur bei Vorliegen eines Unterhaltstatbestands (z.B. Kinderbetreuung, Alter, Krankheit, Erwerbslosigkeit)."
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "👤 Unterhaltspflichtiger (zahlt)" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-gray-700 font-medium mb-2", children: "Nettoeinkommen (€/Monat)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            value: nettoPflichtiger,
            onChange: (e) => setNettoPflichtiger(Math.max(0, parseInt(e.target.value) || 0)),
            className: "w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none text-lg",
            min: "0",
            step: "100"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: nettoPflichtiger,
            onChange: (e) => setNettoPflichtiger(parseInt(e.target.value)),
            min: "0",
            max: "15000",
            step: "100",
            className: "w-full mt-2 accent-purple-500"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "0 €" }),
          /* @__PURE__ */ jsx("span", { children: "15.000 €" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-gray-700 font-medium mb-2", children: "Erwerbsstatus" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setErwerbstaetigPflichtiger(true),
              className: `px-4 py-3 rounded-xl text-sm font-medium transition-all ${erwerbstaetigPflichtiger ? "bg-purple-500 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
              children: "Erwerbstätig"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setErwerbstaetigPflichtiger(false),
              className: `px-4 py-3 rounded-xl text-sm font-medium transition-all ${!erwerbstaetigPflichtiger ? "bg-purple-500 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
              children: "Nicht erwerbstätig"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "👤 Unterhaltsberechtigter (erhält)" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-gray-700 font-medium mb-2", children: "Nettoeinkommen (€/Monat)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            value: nettoBerechtigter,
            onChange: (e) => setNettoBerechtigter(Math.max(0, parseInt(e.target.value) || 0)),
            className: "w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none text-lg",
            min: "0",
            step: "100"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: nettoBerechtigter,
            onChange: (e) => setNettoBerechtigter(parseInt(e.target.value)),
            min: "0",
            max: "10000",
            step: "100",
            className: "w-full mt-2 accent-purple-500"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "0 €" }),
          /* @__PURE__ */ jsx("span", { children: "10.000 €" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-gray-700 font-medium mb-2", children: "Erwerbsstatus" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setErwerbstaetigBerechtigter(true),
              className: `px-4 py-3 rounded-xl text-sm font-medium transition-all ${erwerbstaetigBerechtigter ? "bg-purple-500 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
              children: "Erwerbstätig"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setErwerbstaetigBerechtigter(false),
              className: `px-4 py-3 rounded-xl text-sm font-medium transition-all ${!erwerbstaetigBerechtigter ? "bg-purple-500 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
              children: "Nicht erwerbstätig"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "👶 Kindesunterhalt (vorab abziehen)" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Falls der Unterhaltspflichtige bereits Kindesunterhalt zahlt, diesen hier eintragen." }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-gray-700 font-medium mb-2", children: "Kindesunterhalt gesamt (€/Monat)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            value: kindesunterhaltMonatlich,
            onChange: (e) => setKindesunterhaltMonatlich(Math.max(0, parseInt(e.target.value) || 0)),
            className: "w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none text-lg",
            min: "0",
            step: "50",
            placeholder: "0"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-purple-100 mb-1", children: unterhaltsArt === "trennung" ? "Trennungsunterhalt" : "Nachehelicher Unterhalt" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-4xl font-bold", children: ergebnis.zahlbetrag.toLocaleString("de-DE") }),
          /* @__PURE__ */ jsx("span", { className: "text-xl text-purple-200", children: "€ / Monat" })
        ] }),
        ergebnis.selbstbehaltGefaehrdet && ergebnis.zahlbetrag < ergebnis.angemessenerUnterhalt && /* @__PURE__ */ jsx("p", { className: "text-sm text-yellow-200 mt-1", children: "(reduziert wegen Selbstbehalt)" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-purple-100", children: "Bereinigtes Netto (Pflichtiger)" }),
          /* @__PURE__ */ jsxs("span", { className: "text-lg font-bold", children: [
            ergebnis.bereinigtesNettoUnterhaltspflichtiger.toLocaleString("de-DE"),
            " €"
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-purple-100", children: "Bereinigtes Netto (Berechtigter)" }),
          /* @__PURE__ */ jsxs("span", { className: "text-lg font-bold", children: [
            ergebnis.bereinigtesNettoUnterhaltsberechtigter.toLocaleString("de-DE"),
            " €"
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-purple-100", children: "Einkommensdifferenz" }),
          /* @__PURE__ */ jsxs("span", { className: "text-lg font-bold", children: [
            ergebnis.differenz.toLocaleString("de-DE"),
            " €"
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-purple-100", children: "Berechnungsmethode" }),
            /* @__PURE__ */ jsx("span", { className: "text-lg font-bold", children: ergebnis.quotenMethode })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-purple-200 mt-1", children: ergebnis.quotenMethode === "3/7" ? "Erwerbstätigenbonus: 1/7 bleibt beim Pflichtigen" : "Halbteilungsgrundsatz: 50% der Differenz" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-purple-100", children: "Jahresbetrag" }),
          /* @__PURE__ */ jsxs("span", { className: "text-lg font-bold", children: [
            (ergebnis.zahlbetrag * 12).toLocaleString("de-DE"),
            " €"
          ] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 bg-white rounded-2xl shadow-lg p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "📊 Berechnungsdetails" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Netto Pflichtiger" }),
          /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
            nettoPflichtiger.toLocaleString("de-DE"),
            " €"
          ] })
        ] }),
        erwerbstaetigPflichtiger && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "./. Berufsbedingte Aufwendungen (5%)" }),
          /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
            "- ",
            Math.round(berechneBerufsbedingteAufwendungen(nettoPflichtiger)).toLocaleString("de-DE"),
            " €"
          ] })
        ] }),
        kindesunterhaltMonatlich > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "./. Kindesunterhalt" }),
          /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
            "- ",
            kindesunterhaltMonatlich.toLocaleString("de-DE"),
            " €"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 bg-purple-50 rounded-xl border-2 border-purple-200", children: [
          /* @__PURE__ */ jsx("span", { className: "text-purple-700 font-medium", children: "= Bereinigt Pflichtiger" }),
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-purple-700", children: [
            ergebnis.bereinigtesNettoUnterhaltspflichtiger.toLocaleString("de-DE"),
            " €"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-px bg-gray-200 my-2" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Netto Berechtigter" }),
          /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
            nettoBerechtigter.toLocaleString("de-DE"),
            " €"
          ] })
        ] }),
        erwerbstaetigBerechtigter && nettoBerechtigter > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "./. Berufsbedingte Aufwendungen (5%)" }),
          /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
            "- ",
            Math.round(berechneBerufsbedingteAufwendungen(nettoBerechtigter)).toLocaleString("de-DE"),
            " €"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 bg-purple-50 rounded-xl border-2 border-purple-200", children: [
          /* @__PURE__ */ jsx("span", { className: "text-purple-700 font-medium", children: "= Bereinigt Berechtigter" }),
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-purple-700", children: [
            ergebnis.bereinigtesNettoUnterhaltsberechtigter.toLocaleString("de-DE"),
            " €"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-px bg-gray-200 my-2" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Differenz" }),
          /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
            ergebnis.differenz.toLocaleString("de-DE"),
            " €"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: ergebnis.quotenMethode === "3/7" ? "× 3/7 (42,86%)" : "× 50%" }),
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-purple-600", children: [
            ergebnis.angemessenerUnterhalt.toLocaleString("de-DE"),
            " €"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Verbleibt nach Unterhalt" }),
          /* @__PURE__ */ jsxs("span", { className: `font-medium ${ergebnis.selbstbehaltGefaehrdet ? "text-red-600" : "text-green-600"}`, children: [
            ergebnis.verbleibtNachUnterhalt.toLocaleString("de-DE"),
            " €"
          ] })
        ] })
      ] })
    ] }),
    ergebnis.selbstbehaltGefaehrdet && /* @__PURE__ */ jsxs("div", { className: "mt-6 bg-red-50 border-2 border-red-200 rounded-2xl p-6", children: [
      /* @__PURE__ */ jsxs("h3", { className: "font-bold text-red-800 mb-2 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { children: "⚠️" }),
        "Selbstbehalt gefährdet!"
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-red-700 text-sm", children: [
        "Nach Abzug des Unterhalts verbleiben ",
        /* @__PURE__ */ jsxs("strong", { children: [
          ergebnis.verbleibtNachUnterhalt.toLocaleString("de-DE"),
          " €"
        ] }),
        ". Der angemessene Selbstbehalt beim Ehegattenunterhalt beträgt mindestens",
        /* @__PURE__ */ jsxs("strong", { children: [
          " ",
          (erwerbstaetigPflichtiger ? SELBSTBEHALT.erwerbstaetigOhneKinder : SELBSTBEHALT.nichtErwerbstaetigOhneKinder).toLocaleString("de-DE"),
          " €"
        ] }),
        "."
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-red-700 text-sm mt-2", children: [
        "Der Unterhalt wurde daher auf ",
        /* @__PURE__ */ jsxs("strong", { children: [
          ergebnis.zahlbetrag.toLocaleString("de-DE"),
          " €"
        ] }),
        " reduziert."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 bg-white rounded-2xl shadow-lg p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert's" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "3/7-Methode:" }),
            ' Bei Erwerbstätigkeit erhält der Pflichtige 1/7 "Erwerbstätigenbonus", zahlt nur 3/7 der Differenz'
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Berufsbedingte Aufwendungen:" }),
            " 5% vom Netto (max. 150 €) werden abgezogen"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Kindesunterhalt:" }),
            " Wird vorrangig abgezogen, bevor Ehegattenunterhalt berechnet wird"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Selbstbehalt:" }),
            " ",
            SELBSTBEHALT.erwerbstaetigOhneKinder.toLocaleString("de-DE"),
            " € (erwerbstätig) / ",
            SELBSTBEHALT.nichtErwerbstaetigOhneKinder.toLocaleString("de-DE"),
            " € (nicht erwerbstätig)"
          ] })
        ] })
      ] })
    ] }),
    unterhaltsArt === "nachehelich" && /* @__PURE__ */ jsxs("div", { className: "mt-6 bg-white rounded-2xl shadow-lg p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "📋 Unterhaltstatbestände (§§ 1570-1576 BGB)" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-3", children: "Nachehelicher Unterhalt besteht nur bei Vorliegen eines Grundes:" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-purple-600", children: "§ 1570" }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-700", children: [
            /* @__PURE__ */ jsx("strong", { children: "Kinderbetreuung:" }),
            " Betreuung eines Kindes unter 3 Jahren (danach ggf. verlängert)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-purple-600", children: "§ 1571" }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-700", children: [
            /* @__PURE__ */ jsx("strong", { children: "Alter:" }),
            " Keine Erwerbstätigkeit mehr zumutbar wegen Alters"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-purple-600", children: "§ 1572" }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-700", children: [
            /* @__PURE__ */ jsx("strong", { children: "Krankheit:" }),
            " Erwerbsunfähigkeit wegen Krankheit oder Gebrechen"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-purple-600", children: "§ 1573" }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-700", children: [
            /* @__PURE__ */ jsx("strong", { children: "Erwerbslosigkeit:" }),
            " Trotz Bemühungen keine angemessene Arbeit gefunden"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-purple-600", children: "§ 1574" }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-700", children: [
            /* @__PURE__ */ jsx("strong", { children: "Aufstockung:" }),
            " Eigenes Einkommen reicht nicht für ehelichen Lebensstandard"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-purple-600", children: "§ 1575" }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-700", children: [
            /* @__PURE__ */ jsx("strong", { children: "Ausbildung:" }),
            " Nachholen einer Ausbildung nach der Ehe"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-purple-600", children: "§ 1576" }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-700", children: [
            /* @__PURE__ */ jsx("strong", { children: "Billigkeit:" }),
            " Schwerwiegende Gründe aus der Ehe heraus"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 bg-white rounded-2xl shadow-lg p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Stellen" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-purple-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-purple-900", children: "Familiengericht" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-purple-700 mt-1", children: "Das örtliche Familiengericht (beim Amtsgericht) ist zuständig für Unterhaltsstreitigkeiten." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "⚖️" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Rechtsanwalt Familienrecht" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://anwaltauskunft.de/magazin/familie-vorsorge",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-purple-600 hover:underline",
                  children: "Anwalt finden →"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Dringend empfohlen" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📋" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Beratungshilfe" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.bmj.de/DE/Themen/GessellschaftUndFamilie/Beratungshilfe_Prozesskostenhilfe",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-purple-600 hover:underline",
                  children: "Beratungshilfe beantragen →"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Bei geringem Einkommen" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🤝" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Mediation" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.bmj.de/DE/themen/gesellschaft-familie/mediation",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-purple-600 hover:underline",
                  children: "Info zu Mediation →"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Einvernehmliche Lösung" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "ISUV e.V." }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.isuv.de",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-purple-600 hover:underline",
                  children: "isuv.de →"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Interessenverband Unterhalt" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 bg-white rounded-2xl shadow-lg p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "⚠️ Wichtige Hinweise" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-yellow-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "⚠️" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-yellow-800", children: "Unverbindliche Berechnung" }),
            /* @__PURE__ */ jsx("p", { className: "text-yellow-700", children: "Diese Berechnung dient nur zur Orientierung. Der tatsächliche Unterhalt hängt von vielen Faktoren ab." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-blue-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "👶" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-blue-800", children: "Kindesunterhalt hat Vorrang" }),
            /* @__PURE__ */ jsx("p", { className: "text-blue-700", children: "Kindesunterhalt geht dem Ehegattenunterhalt vor und wird zuerst vom Einkommen abgezogen." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-green-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📅" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-green-800", children: "Befristung möglich" }),
            /* @__PURE__ */ jsx("p", { className: "text-green-700", children: "Nachehelicher Unterhalt kann zeitlich befristet oder herabgesetzt werden (§ 1578b BGB)." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-purple-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📝" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-purple-800", children: "Auskunftsanspruch" }),
            /* @__PURE__ */ jsx("p", { className: "text-purple-700", children: "Beide Ehepartner haben gegenseitig Anspruch auf Auskunft über Einkommen und Vermögen." })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 bg-white rounded-2xl shadow-lg p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🔄 Trennungs- vs. Nachehelicher Unterhalt" }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b-2 border-gray-200", children: [
          /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-2" }),
          /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-2", children: "Trennungsunterhalt" }),
          /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-2", children: "Nachehelicher Unterhalt" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { className: "text-gray-600", children: [
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2 px-2 font-medium", children: "Zeitraum" }),
            /* @__PURE__ */ jsx("td", { className: "py-2 px-2", children: "Trennung bis Scheidung" }),
            /* @__PURE__ */ jsx("td", { className: "py-2 px-2", children: "Ab Rechtskraft der Scheidung" })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2 px-2 font-medium", children: "Erwerbspflicht" }),
            /* @__PURE__ */ jsx("td", { className: "py-2 px-2", children: "Eingeschränkt (1. Jahr)" }),
            /* @__PURE__ */ jsx("td", { className: "py-2 px-2", children: "Grundsätzlich vorhanden" })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2 px-2 font-medium", children: "Verzicht möglich" }),
            /* @__PURE__ */ jsx("td", { className: "py-2 px-2", children: "Nein (unwirksam)" }),
            /* @__PURE__ */ jsx("td", { className: "py-2 px-2", children: "Ja (mit Einschränkungen)" })
          ] }),
          /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("td", { className: "py-2 px-2 font-medium", children: "Befristung" }),
            /* @__PURE__ */ jsx("td", { className: "py-2 px-2", children: "Nein" }),
            /* @__PURE__ */ jsx("td", { className: "py-2 px-2", children: "Ja (§ 1578b BGB)" })
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 p-4 bg-gray-50 rounded-xl", children: [
      /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-gray-500 uppercase mb-2", children: "Quellen" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/bgb/__1361.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-purple-600 hover:underline",
            children: "§ 1361 BGB – Unterhalt bei Getrenntleben"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/bgb/__1569.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-purple-600 hover:underline",
            children: "§§ 1569-1586 BGB – Nachehelicher Unterhalt"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.olg-duesseldorf.nrw.de/infos/Duesseldorfer_Tabelle/index.php",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-purple-600 hover:underline",
            children: "OLG Düsseldorf – Unterhaltsleitlinien"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bmj.de/DE/themen/gesellschaft/familie-und-unterhalt/unterhalt/unterhalt-node.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-purple-600 hover:underline",
            children: "Bundesministerium der Justiz – Unterhaltsrecht"
          }
        )
      ] })
    ] })
  ] });
}

const $$EhegattenunterhaltRechner = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Ehegattenunterhalt-Rechner 2026 \u2013 Trennungsunterhalt & nachehelicher Unterhalt berechnen", "description": "Ehegattenunterhalt berechnen 2026: Kostenloser Rechner f\xFCr Trennungsunterhalt und nachehelichen Unterhalt. 3/7-Methode, Selbstbehalt, Erwerbst\xE4tigenbonus erkl\xE4rt.", "keywords": "Ehegattenunterhalt Rechner, Trennungsunterhalt berechnen, nachehelicher Unterhalt, Ehegattenunterhalt 2026, Unterhalt Scheidung, Trennungsunterhalt H\xF6he, Unterhalt Ehepartner, Scheidung Unterhalt berechnen, 3/7 Methode Unterhalt" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen pb-8"> <!-- Header mit Zurück-Button --> <header class="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>
Alle Rechner
</a> <div class="flex items-center gap-3"> <span class="text-4xl">💔</span> <div> <h1 class="text-2xl font-bold">Ehegattenunterhalt-Rechner</h1> <p class="text-purple-100 text-sm">Trennungs- & nachehelicher Unterhalt 2026</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ${renderComponent($$result2, "EhegattenunterhaltRechner", EhegattenunterhaltRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/EhegattenunterhaltRechner", "client:component-export": "default" })} </div> </main> ` })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/ehegattenunterhalt-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/ehegattenunterhalt-rechner.astro";
const $$url = "/ehegattenunterhalt-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$EhegattenunterhaltRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
