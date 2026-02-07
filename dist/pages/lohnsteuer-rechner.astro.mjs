/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, u as unescapeHTML, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DmT1JwUR.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const GRUNDFREIBETRAG_2026 = 12096;
const LOHNSTEUER_PARAMS_2026 = {
  zone2End: 17443,
  zone3End: 68480,
  zone4End: 277826};
const SOLI_SATZ = 0.055;
const SOLI_FREIGRENZE_MONAT_SK1 = 1628.33;
const SOLI_FREIGRENZE_MONAT_SK3 = 3072.5;
const KIRCHENSTEUER_SAETZE = {
  "Baden-Württemberg": 0.08,
  "Bayern": 0.08,
  "Berlin": 0.09,
  "Brandenburg": 0.09,
  "Bremen": 0.09,
  "Hamburg": 0.09,
  "Hessen": 0.09,
  "Mecklenburg-Vorpommern": 0.09,
  "Niedersachsen": 0.09,
  "Nordrhein-Westfalen": 0.09,
  "Rheinland-Pfalz": 0.09,
  "Saarland": 0.09,
  "Sachsen": 0.09,
  "Sachsen-Anhalt": 0.09,
  "Schleswig-Holstein": 0.09,
  "Thüringen": 0.09
};
const STEUERKLASSEN_INFO = {
  1: { name: "Steuerklasse I", beschreibung: "Ledige, Geschiedene, Verwitwete" },
  2: { name: "Steuerklasse II", beschreibung: "Alleinerziehende mit Kind(ern)" },
  3: { name: "Steuerklasse III", beschreibung: "Verheiratete (Alleinverdiener/Mehrverdiener)" },
  4: { name: "Steuerklasse IV", beschreibung: "Verheiratete (beide verdienen ähnlich)" },
  5: { name: "Steuerklasse V", beschreibung: "Verheiratete (Geringverdiener-Partner zu III)" },
  6: { name: "Steuerklasse VI", beschreibung: "Zweit- oder Nebenjob" }
};
const KINDERFREIBETRAG_2026 = 6672;
function berechneVorsorgepauschale(brutto, steuerklasse) {
  const rvAnteil = Math.min(brutto * 0.093, 7850 * 0.093);
  const kvAnteil = Math.min(brutto * 0.07, 5512.5 * 0.07);
  return rvAnteil + kvAnteil;
}
function berechneLohnsteuerJahr(zvE) {
  if (zvE <= 0) return 0;
  const z = zvE;
  if (z <= GRUNDFREIBETRAG_2026) {
    return 0;
  }
  if (z <= LOHNSTEUER_PARAMS_2026.zone2End) {
    const y = (z - GRUNDFREIBETRAG_2026) / 1e4;
    return Math.floor((979.18 * y + 1400) * y);
  }
  if (z <= LOHNSTEUER_PARAMS_2026.zone3End) {
    const y = (z - LOHNSTEUER_PARAMS_2026.zone2End) / 1e4;
    return Math.floor((192.59 * y + 2397) * y + 966.53);
  }
  if (z <= LOHNSTEUER_PARAMS_2026.zone4End) {
    return Math.floor(0.42 * z - 10636.31);
  }
  return Math.floor(0.45 * z - 18971.21);
}
function LohnsteuerRechner() {
  const [bruttolohn, setBruttolohn] = useState(4e3);
  const [steuerklasse, setSteuerklasse] = useState(1);
  const [bundesland, setBundesland] = useState("Nordrhein-Westfalen");
  const [kirchensteuer, setKirchensteuer] = useState(false);
  const [anzahlKinder, setAnzahlKinder] = useState(0);
  const [zeitraum, setZeitraum] = useState("monat");
  const [rentenversicherung, setRentenversicherung] = useState(true);
  const [krankenversicherung, setKrankenversicherung] = useState(true);
  const ergebnis = useMemo(() => {
    const jahresBrutto = bruttolohn * 12;
    const vorsorgepauschaleMonat = berechneVorsorgepauschale(bruttolohn);
    const vorsorgepauschaleJahr = vorsorgepauschaleMonat * 12;
    const werbungskosten = 1230;
    const sonderausgaben = 36;
    const kinderfreibetragJahr = anzahlKinder * KINDERFREIBETRAG_2026 * (steuerklasse === 3 || steuerklasse === 4 ? 1 : 0.5);
    const entlastungsbetrag = steuerklasse === 2 ? 4260 + (anzahlKinder > 1 ? (anzahlKinder - 1) * 240 : 0) : 0;
    let zvE = jahresBrutto - vorsorgepauschaleJahr - werbungskosten - sonderausgaben;
    if (steuerklasse === 2) {
      zvE -= entlastungsbetrag;
    }
    zvE = Math.max(0, zvE);
    let lohnsteuerJahr = berechneLohnsteuerJahr(zvE);
    if (steuerklasse === 3) {
      const zvEHalb = zvE / 2;
      lohnsteuerJahr = berechneLohnsteuerJahr(zvEHalb) * 2;
    } else if (steuerklasse === 5) {
      lohnsteuerJahr = lohnsteuerJahr * 1.25;
    } else if (steuerklasse === 6) {
      lohnsteuerJahr = berechneLohnsteuerJahr(jahresBrutto - vorsorgepauschaleJahr);
    }
    lohnsteuerJahr = Math.max(0, Math.round(lohnsteuerJahr));
    const lohnsteuerMonat = lohnsteuerJahr / 12;
    const soliFreigrenze = steuerklasse === 3 ? SOLI_FREIGRENZE_MONAT_SK3 * 12 : SOLI_FREIGRENZE_MONAT_SK1 * 12;
    let soliJahr = 0;
    if (lohnsteuerJahr > soliFreigrenze) {
      const ueberFreigrenze = lohnsteuerJahr - soliFreigrenze;
      const soliMilderung = ueberFreigrenze * 0.119;
      const soliVoll = lohnsteuerJahr * SOLI_SATZ;
      soliJahr = Math.min(soliMilderung, soliVoll);
    }
    soliJahr = Math.round(soliJahr * 100) / 100;
    const soliMonat = soliJahr / 12;
    const kirchensteuerSatz = kirchensteuer ? KIRCHENSTEUER_SAETZE[bundesland] || 0.09 : 0;
    const kirchensteuerJahr = Math.round(lohnsteuerJahr * kirchensteuerSatz);
    const kirchensteuerMonat = kirchensteuerJahr / 12;
    const gesamtSteuerJahr = lohnsteuerJahr + soliJahr + kirchensteuerJahr;
    const gesamtSteuerMonat = gesamtSteuerJahr / 12;
    let grenzsteuersatz = 0;
    if (zvE <= GRUNDFREIBETRAG_2026) {
      grenzsteuersatz = 0;
    } else if (zvE <= LOHNSTEUER_PARAMS_2026.zone2End) {
      grenzsteuersatz = 14 + (zvE - GRUNDFREIBETRAG_2026) / (LOHNSTEUER_PARAMS_2026.zone2End - GRUNDFREIBETRAG_2026) * 10;
    } else if (zvE <= LOHNSTEUER_PARAMS_2026.zone3End) {
      grenzsteuersatz = 24 + (zvE - LOHNSTEUER_PARAMS_2026.zone2End) / (LOHNSTEUER_PARAMS_2026.zone3End - LOHNSTEUER_PARAMS_2026.zone2End) * 18;
    } else if (zvE <= LOHNSTEUER_PARAMS_2026.zone4End) {
      grenzsteuersatz = 42;
    } else {
      grenzsteuersatz = 45;
    }
    const durchschnittssteuersatz = jahresBrutto > 0 ? lohnsteuerJahr / jahresBrutto * 100 : 0;
    const lohnsteuerOhneKinder = steuerklasse === 3 ? berechneLohnsteuerJahr(zvE / 2 + kinderfreibetragJahr / 2) * 2 : berechneLohnsteuerJahr(zvE + kinderfreibetragJahr);
    const steuerersparnisKinder = Math.max(0, lohnsteuerOhneKinder - lohnsteuerJahr);
    return {
      // Eingangswerte
      bruttolohn,
      jahresBrutto,
      steuerklasse,
      // Abzüge vor Steuer
      vorsorgepauschaleMonat,
      vorsorgepauschaleJahr,
      werbungskosten,
      sonderausgaben,
      entlastungsbetrag,
      kinderfreibetragJahr,
      // Zu versteuerndes Einkommen
      zvE,
      // Lohnsteuer
      lohnsteuerMonat,
      lohnsteuerJahr,
      // Soli
      soliMonat,
      soliJahr,
      soliFreigrenze,
      // Kirchensteuer
      kirchensteuerMonat,
      kirchensteuerJahr,
      kirchensteuerSatz,
      // Gesamt
      gesamtSteuerMonat,
      gesamtSteuerJahr,
      // Steuersätze
      grenzsteuersatz,
      durchschnittssteuersatz,
      // Extras
      steuerersparnisKinder
    };
  }, [bruttolohn, steuerklasse, bundesland, kirchensteuer, anzahlKinder]);
  const formatEuro = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  const formatEuroRound = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";
  const formatProzent = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " %";
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Monatlicher Bruttolohn" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Regelmäßiges Arbeitsentgelt vor Steuern und Abgaben" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: bruttolohn,
              onChange: (e) => setBruttolohn(Math.max(0, Number(e.target.value))),
              className: "w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-0 outline-none",
              min: "0",
              max: "30000",
              step: "50"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl", children: "€" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: bruttolohn,
            onChange: (e) => setBruttolohn(Number(e.target.value)),
            className: "w-full mt-3 accent-yellow-500",
            min: "1000",
            max: "12000",
            step: "50"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "1.000 €" }),
          /* @__PURE__ */ jsx("span", { children: "6.500 €" }),
          /* @__PURE__ */ jsx("span", { children: "12.000 €" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Steuerklasse" }) }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2", children: [1, 2, 3, 4, 5, 6].map((sk) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setSteuerklasse(sk),
            className: `py-3 px-2 rounded-xl font-bold text-lg transition-all ${steuerklasse === sk ? "bg-yellow-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: sk
          },
          sk
        )) }),
        /* @__PURE__ */ jsx("div", { className: "bg-yellow-50 rounded-xl p-3 mt-2", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-yellow-800", children: [
          /* @__PURE__ */ jsxs("strong", { children: [
            STEUERKLASSEN_INFO[steuerklasse].name,
            ":"
          ] }),
          " ",
          STEUERKLASSEN_INFO[steuerklasse].beschreibung
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Bundesland" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Relevant für Kirchensteuer-Satz (8% oder 9%)" })
        ] }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: bundesland,
            onChange: (e) => setBundesland(e.target.value),
            className: "w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-0 outline-none text-gray-700",
            children: Object.keys(KIRCHENSTEUER_SAETZE).map((land) => /* @__PURE__ */ jsx("option", { value: land, children: land }, land))
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            checked: kirchensteuer,
            onChange: (e) => setKirchensteuer(e.target.checked),
            className: "w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Kirchensteuerpflichtig" }),
        kirchensteuer && /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-500", children: [
          "(",
          (KIRCHENSTEUER_SAETZE[bundesland] * 100).toFixed(0),
          "% von der Lohnsteuer)"
        ] })
      ] }) }),
      steuerklasse <= 4 && /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Anzahl Kinder" }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500 block mt-1", children: [
            "Kinderfreibetrag: ",
            formatEuro(KINDERFREIBETRAG_2026),
            " pro Kind/Jahr"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setAnzahlKinder(Math.max(0, anzahlKinder - 1)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors",
              children: "−"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "text-center w-20", children: /* @__PURE__ */ jsx("span", { className: "text-4xl font-bold text-gray-800", children: anzahlKinder }) }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setAnzahlKinder(Math.min(10, anzahlKinder + 1)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors",
              children: "+"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl shadow-lg p-6 text-white mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: "🧾 Ihre monatliche Lohnsteuer" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuroRound(ergebnis.lohnsteuerMonat) }),
          /* @__PURE__ */ jsx("span", { className: "text-xl opacity-80", children: "/ Monat" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-yellow-100 mt-2 text-sm", children: [
          "Entspricht ",
          /* @__PURE__ */ jsx("strong", { children: formatEuroRound(ergebnis.lohnsteuerJahr) }),
          " pro Jahr"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "+ Soli" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.soliMonat) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "+ Kirchensteuer" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.kirchensteuerMonat) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white/20 rounded-xl p-4 backdrop-blur-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Gesamte Steuerabzüge" }),
          /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold", children: formatEuroRound(ergebnis.gesamtSteuerMonat) })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-yellow-100 mt-1", children: [
          "Pro Jahr: ",
          formatEuroRound(ergebnis.gesamtSteuerJahr),
          " • Steuerklasse ",
          steuerklasse
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Ihre Steuersätze" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-xl p-4 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-yellow-600", children: formatProzent(ergebnis.grenzsteuersatz) }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Grenzsteuersatz" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: "Steuer auf nächsten Euro" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-xl p-4 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-amber-600", children: formatProzent(ergebnis.durchschnittssteuersatz) }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Durchschnittssteuersatz" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: "Anteil am Brutto" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative h-6 bg-gray-200 rounded-full overflow-hidden", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500",
            style: { width: `${Math.min(ergebnis.grenzsteuersatz / 45 * 100, 100)}%` }
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex items-center justify-between px-2 text-xs font-medium", children: [
          /* @__PURE__ */ jsx("span", { className: "text-white drop-shadow", children: "0%" }),
          /* @__PURE__ */ jsx("span", { className: "text-white drop-shadow", children: "14%" }),
          /* @__PURE__ */ jsx("span", { className: "text-white drop-shadow", children: "42%" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "45%" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-2 text-center", children: "Ihr Grenzsteuersatz im Einkommensteuer-Tarif 2026" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📋 Berechnungsdetails" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide", children: "Ausgangswerte" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Monatlicher Bruttolohn" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(bruttolohn) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Jahres-Brutto (×12)" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatEuro(ergebnis.jahresBrutto) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide pt-4", children: "Abzüge vor Besteuerung (jährlich)" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-red-600", children: [
          /* @__PURE__ */ jsx("span", { children: "− Vorsorgepauschale" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.vorsorgepauschaleJahr) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-red-600", children: [
          /* @__PURE__ */ jsx("span", { children: "− Werbungskostenpauschale" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.werbungskosten) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-red-600", children: [
          /* @__PURE__ */ jsx("span", { children: "− Sonderausgabenpauschale" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.sonderausgaben) })
        ] }),
        steuerklasse === 2 && ergebnis.entlastungsbetrag > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-green-600", children: [
          /* @__PURE__ */ jsx("span", { children: "− Entlastungsbetrag Alleinerziehende" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.entlastungsbetrag) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-gray-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "= Zu versteuerndes Einkommen (zvE)" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.zvE) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide pt-4", children: "Steuerberechnung (jährlich)" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
            "Lohnsteuer",
            /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400 ml-1", children: "(Tarif §32a EStG)" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-yellow-600", children: formatEuro(ergebnis.lohnsteuerJahr) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
            "+ Solidaritätszuschlag",
            /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400 ml-1", children: "(5,5%)" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: ergebnis.soliJahr > 0 ? "text-gray-900" : "text-green-600", children: ergebnis.soliJahr > 0 ? formatEuro(ergebnis.soliJahr) : "0,00 € (unter Freigrenze)" })
        ] }),
        kirchensteuer && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
            "+ Kirchensteuer",
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-400 ml-1", children: [
              "(",
              (ergebnis.kirchensteuerSatz * 100).toFixed(0),
              "%)"
            ] })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatEuro(ergebnis.kirchensteuerJahr) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-3 bg-yellow-100 -mx-6 px-6 rounded-b-xl mt-4", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-yellow-800", children: "Gesamte Steuerabzüge / Jahr" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-2xl text-yellow-900", children: formatEuro(ergebnis.gesamtSteuerJahr) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Gesamte Steuerabzüge / Monat (÷12)" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-yellow-700", children: formatEuro(ergebnis.gesamtSteuerMonat) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "🔄 Steuerklassen im Vergleich" }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-gray-500 text-xs uppercase", children: [
          /* @__PURE__ */ jsx("th", { className: "pb-2", children: "SK" }),
          /* @__PURE__ */ jsx("th", { className: "pb-2", children: "Für wen" }),
          /* @__PURE__ */ jsx("th", { className: "pb-2 text-right", children: "Lohnsteuer/Monat*" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-100", children: [1, 2, 3, 4, 5, 6].map((sk) => {
          const factor = sk === 3 ? 0.5 : sk === 5 ? 1.5 : sk === 6 ? 1.3 : 1;
          ergebnis.lohnsteuerMonat * factor * (sk === steuerklasse ? 1 : 1);
          return /* @__PURE__ */ jsxs("tr", { className: steuerklasse === sk ? "bg-yellow-50" : "", children: [
            /* @__PURE__ */ jsxs("td", { className: "py-2 font-bold", children: [
              sk,
              steuerklasse === sk && /* @__PURE__ */ jsx("span", { className: "ml-1 text-yellow-500", children: "●" })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "py-2 text-gray-600", children: STEUERKLASSEN_INFO[sk].beschreibung }),
            /* @__PURE__ */ jsx("td", { className: "py-2 text-right font-medium", children: steuerklasse === sk ? formatEuro(ergebnis.lohnsteuerMonat) : "–" })
          ] }, sk);
        }) })
      ] }) }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-3", children: "*Exakte Berechnung nur für gewählte Steuerklasse. Wechsel Sie die SK oben für genaue Werte." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert die Lohnsteuer" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Quellensteuer:" }),
            " Lohnsteuer wird direkt vom Arbeitgeber einbehalten und ans Finanzamt abgeführt"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Vorauszahlung:" }),
            " Die Lohnsteuer ist eine Vorauszahlung auf Ihre Einkommensteuer"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Progressiver Tarif:" }),
            " Je höher das Einkommen, desto höher der Steuersatz (14-45%)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Grundfreibetrag 2026:" }),
            " ",
            formatEuro(GRUNDFREIBETRAG_2026),
            " bleiben steuerfrei"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Steuerklasse:" }),
            " Beeinflusst die monatliche Lohnsteuer, nicht die jährliche Steuerlast"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Steuererklärung:" }),
            " Über- oder Unterzahlungen werden mit der Jahressteuererklärung ausgeglichen"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-yellow-800 mb-3", children: "📚 Die 6 Steuerklassen erklärt" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm text-yellow-700", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-yellow-800", children: "Steuerklasse I" }),
          /* @__PURE__ */ jsx("p", { children: "Für Ledige, Geschiedene und Verwitwete ohne Kinder. Standard-Steuerklasse mit einem Grundfreibetrag." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-yellow-800", children: "Steuerklasse II" }),
          /* @__PURE__ */ jsxs("p", { children: [
            "Für Alleinerziehende mit mindestens einem Kind im Haushalt. Zusätzlicher Entlastungsbetrag von ",
            formatEuro(4260),
            "."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-yellow-800", children: "Steuerklasse III" }),
          /* @__PURE__ */ jsx("p", { children: "Für Verheiratete: Der Partner mit dem höheren Einkommen. Doppelter Grundfreibetrag, niedrigste Abzüge." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-yellow-800", children: "Steuerklasse IV" }),
          /* @__PURE__ */ jsx("p", { children: "Für Verheiratete mit ähnlichem Einkommen. Beide haben einen Grundfreibetrag. Alternativ: IV/IV mit Faktor." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-yellow-800", children: "Steuerklasse V" }),
          /* @__PURE__ */ jsx("p", { children: "Für den Geringverdiener in einer III/V-Kombination. Kein Grundfreibetrag, höchste monatliche Abzüge." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-yellow-800", children: "Steuerklasse VI" }),
          /* @__PURE__ */ jsx("p", { children: "Für Zweit- und Nebenjobs. Kein Grundfreibetrag, höchste Besteuerung. Pflicht ab dem zweiten Arbeitsverhältnis." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-amber-800 mb-3", children: "⚠️ Wichtige Hinweise" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-amber-700", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Vereinfachte Berechnung:" }),
            " Die tatsächliche Lohnsteuer kann durch Freibeträge, Zusatzeinkünfte etc. abweichen"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Soli-Freigrenze:" }),
            " Seit 2021 zahlen ca. 90% der Steuerzahler keinen Soli mehr"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Steuerklassenwahl:" }),
            " Ehepaare können zwischen III/V und IV/IV wählen – am Jahresende gleicht sich's aus"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Kinderfreibetrag vs. Kindergeld:" }),
            " Das Finanzamt prüft automatisch, was günstiger ist"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Steuererklärung:" }),
            " Oft lohnt sich eine Steuererklärung – Durchschnitt: ca. 1.000 € Erstattung"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörde" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-yellow-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-yellow-900", children: "Finanzamt" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-yellow-700 mt-1", children: "Für Steuerklassenwechsel, Freibeträge und Steuererklärung ist Ihr örtliches Finanzamt zuständig." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Online-Antrag" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.elster.de",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "ELSTER – Steuerportal →"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Finanzamt-Hotline" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.bzst.de/DE/Service/Kontakt/kontakt_node.html",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "BZSt-Kontakt →"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📋" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Steuerklassenwechsel beantragen" }),
            /* @__PURE__ */ jsxs("ul", { className: "text-gray-600 mt-1 space-y-1", children: [
              /* @__PURE__ */ jsx("li", { children: '• Formular: „Antrag auf Steuerklassenwechsel"' }),
              /* @__PURE__ */ jsx("li", { children: "• Online über ELSTER oder beim Finanzamt" }),
              /* @__PURE__ */ jsx("li", { children: "• Ehepaare: Einmal pro Jahr möglich (Ausnahme: Trennungsjahr)" })
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
            href: "https://www.gesetze-im-internet.de/estg/__32a.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "§ 32a EStG – Einkommensteuertarif – Gesetze im Internet"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/estg/__38b.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "§ 38b EStG – Lohnsteuerklassen – Gesetze im Internet"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bmf-steuerrechner.de",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BMF Steuerrechner – Bundesfinanzministerium"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/Steuerarten/Lohnsteuer/Programmablaufplan/programmablaufplan.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Programmablaufplan Lohnsteuer – BMF"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.elster.de",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "ELSTER – Elektronische Steuererklärung"
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
const $$LohnsteuerRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "Lohnsteuer-Rechner 2026 \u2013 Monatliche Lohnsteuer berechnen (alle Steuerklassen)";
  const description = "Lohnsteuer-Rechner 2026: Berechnen Sie Ihre monatliche Lohnsteuer nach Steuerklasse 1-6. Mit Soli, Kirchensteuer & Grenzsteuersatz. Kostenlos & aktuell!";
  const keywords = "Lohnsteuer Rechner, Lohnsteuer berechnen, Lohnsteuer 2026, Steuerklasse Rechner, Lohnsteuerrechner, monatliche Lohnsteuer, Lohnsteuer Steuerklasse 1, Lohnsteuer Steuerklasse 3, Brutto Lohnsteuer, Lohnsteuerabzug, Lohnsteuertabelle 2026, Grenzsteuersatz, Durchschnittssteuersatz, Solidarit\xE4tszuschlag, Kirchensteuer Rechner, Lohnsteuer online berechnen";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<main class="min-h-screen pb-8"> <!-- Header mit Zur\xFCck-Button --> <header class="bg-gradient-to-r from-yellow-500 to-amber-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-yellow-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>\nAlle Rechner\n</a> <div class="flex items-center gap-3"> <span class="text-4xl">\u{1F4B3}</span> <div> <h1 class="text-2xl font-bold">Lohnsteuer-Rechner</h1> <p class="text-yellow-100 text-sm">Monatliche Lohnsteuer 2026 berechnen</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ', ' </div> <!-- SEO Content Section --> <div class="max-w-2xl mx-auto px-4 mt-8"> <div class="bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">Lohnsteuer 2026: Alles was Sie wissen m\xFCssen</h2> <div class="prose prose-sm text-gray-600 space-y-4"> <p>\nDie <strong>Lohnsteuer</strong> ist die wichtigste Steuer f\xFCr Arbeitnehmer in Deutschland. \n            Sie wird direkt vom Bruttolohn einbehalten und ans Finanzamt abgef\xFChrt. Mit unserem\n<strong>Lohnsteuer-Rechner 2026</strong> ermitteln Sie schnell, wie viel Lohnsteuer \n            monatlich von Ihrem Gehalt abgezogen wird.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wie wird die Lohnsteuer berechnet?</h3> <p>\nDie Lohnsteuer basiert auf dem <strong>Einkommensteuertarif nach \xA7 32a EStG</strong>. \n            Der Steuersatz steigt progressiv mit dem Einkommen:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Grundfreibetrag 2026:</strong> 12.096 \u20AC bleiben steuerfrei</li> <li><strong>Eingangssteuersatz:</strong> 14% ab dem ersten Euro \xFCber dem Grundfreibetrag</li> <li><strong>Spitzensteuersatz:</strong> 42% ab 68.480 \u20AC zu versteuerndem Einkommen</li> <li><strong>Reichensteuersatz:</strong> 45% ab 277.826 \u20AC (f\xFCr Topverdiener)</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Die 6 Steuerklassen im \xDCberblick</h3> <p>\nIhre <strong>Steuerklasse</strong> bestimmt, wie viel Lohnsteuer monatlich einbehalten wird:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Steuerklasse I:</strong> Ledige, Geschiedene, Verwitwete</li> <li><strong>Steuerklasse II:</strong> Alleinerziehende mit Entlastungsbetrag</li> <li><strong>Steuerklasse III:</strong> Verheiratete (Besserverdiener) \u2013 niedrigste Abz\xFCge</li> <li><strong>Steuerklasse IV:</strong> Verheiratete mit \xE4hnlichem Einkommen</li> <li><strong>Steuerklasse V:</strong> Verheiratete (Geringverdiener bei III/V) \u2013 h\xF6chste Abz\xFCge</li> <li><strong>Steuerklasse VI:</strong> Zweit- und Nebenjobs \u2013 kein Grundfreibetrag</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Lohnsteuer vs. Einkommensteuer</h3> <p>\nDie Lohnsteuer ist eine <strong>Vorauszahlung auf die Einkommensteuer</strong>. \n            Am Jahresende wird in der Steuererkl\xE4rung die tats\xE4chliche Steuerschuld berechnet. \n            H\xE4ufig ergibt sich eine <strong>Steuererstattung</strong>, wenn:\n</p> <ul class="list-disc pl-5 space-y-1"> <li>Werbungskosten \xFCber der Pauschale (1.230 \u20AC) liegen</li> <li>Sonderausgaben geltend gemacht werden</li> <li>Au\xDFergew\xF6hnliche Belastungen entstanden sind</li> <li>Die Steuerklassenkombination ung\xFCnstig war</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Solidarit\xE4tszuschlag 2026</h3> <p>\nSeit 2021 zahlen <strong>ca. 90% der Steuerzahler keinen Soli</strong> mehr. \n            Der Solidarit\xE4tszuschlag (5,5% der Lohnsteuer) wird nur noch f\xE4llig bei:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Steuerklasse I:</strong> Ab ca. 19.540 \u20AC Lohnsteuer/Jahr</li> <li><strong>Steuerklasse III:</strong> Ab ca. 36.870 \u20AC Lohnsteuer/Jahr</li> <li>\xDCbergangsbereich mit Milderungszone f\xFCr mittlere Einkommen</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Kirchensteuer berechnen</h3> <p>\nKirchensteuerpflichtig sind Mitglieder der evangelischen oder katholischen Kirche \n            sowie einiger anderer Religionsgemeinschaften. Der <strong>Kirchensteuersatz</strong> betr\xE4gt:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>8%</strong> in Bayern und Baden-W\xFCrttemberg</li> <li><strong>9%</strong> in allen anderen Bundesl\xE4ndern</li> </ul> <p>\nDie Kirchensteuer wird auf die Lohnsteuer berechnet, nicht auf das Bruttoeinkommen.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Steuerklassenwechsel bei Ehepaaren</h3> <p>\nVerheiratete k\xF6nnen zwischen verschiedenen Kombinationen w\xE4hlen:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>III/V-Kombination:</strong> Optimal wenn ein Partner deutlich mehr verdient</li> <li><strong>IV/IV-Kombination:</strong> Bei \xE4hnlichen Einkommen</li> <li><strong>IV/IV mit Faktor:</strong> Genauere monatliche Verteilung, weniger Nachzahlung</li> </ul> <p> <strong>Wichtig:</strong> Die Steuerklassenwahl beeinflusst nur die monatlichen Abz\xFCge. \n            Die <strong>Jahressteuerlast</strong> ist bei allen Kombinationen identisch!\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Grenzsteuersatz vs. Durchschnittssteuersatz</h3> <p>\nZwei wichtige Begriffe f\xFCr Ihr Steuerverst\xE4ndnis:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Grenzsteuersatz:</strong> Der Steuersatz auf den n\xE4chsten verdienten Euro. \n                Relevant f\xFCr Gehaltsverhandlungen und Nebeneink\xFCnfte.</li> <li><strong>Durchschnittssteuersatz:</strong> Ihr tats\xE4chlicher Steuersatz bezogen \n                auf das Gesamteinkommen. Immer niedriger als der Grenzsteuersatz.</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Freibetr\xE4ge eintragen lassen</h3> <p>\nSie k\xF6nnen beim Finanzamt <strong>Freibetr\xE4ge auf der Lohnsteuerkarte</strong> eintragen lassen, \n            um monatlich weniger Lohnsteuer zu zahlen:\n</p> <ul class="list-disc pl-5 space-y-1"> <li>Hohe Werbungskosten (z.B. lange Fahrtstrecke)</li> <li>Unterhaltszahlungen</li> <li>Au\xDFergew\xF6hnliche Belastungen</li> <li>Verluste aus Vermietung</li> </ul> <p>\nBeantragung \xFCber <strong>ELSTER</strong> oder beim \xF6rtlichen Finanzamt. \n            Voraussetzung: Freibetrag \xFCber 600 \u20AC pro Jahr.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Lohnsteuer bei Minijob und Midijob</h3> <p> <strong>Minijob (538 \u20AC):</strong> Keine Lohnsteuer \u2013 der Arbeitgeber zahlt eine pauschale \n            Lohnsteuer von 2%. Alternativ: Individuelle Besteuerung nach Steuerklasse.\n</p> <p> <strong>Midijob (538-2.000 \u20AC):</strong> Normale Lohnsteuer nach Steuerklasse, \n            aber reduzierte Sozialversicherungsbeitr\xE4ge.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Lohnsteuer-Jahresausgleich</h3> <p>\nDer Arbeitgeber kann am Jahresende einen <strong>Lohnsteuer-Jahresausgleich</strong> durchf\xFChren. \n            Dabei werden schwankende Monatsl\xF6hne ausgeglichen. Alternativ erfolgt der Ausgleich \n            \xFCber die Einkommensteuererkl\xE4rung.\n</p> </div> </div> </div> </main>  <script type="application/ld+json">', '<\/script>  <script type="application/ld+json">', "<\/script> "])), maybeRenderHead(), renderComponent($$result2, "LohnsteuerRechner", LohnsteuerRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/LohnsteuerRechner", "client:component-export": "default" }), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Lohnsteuer-Rechner 2026",
    "description": description,
    "url": "https://deutschland-rechner.de/lohnsteuer-rechner",
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
        "name": "Wie hoch ist die Lohnsteuer 2026?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Die Lohnsteuer 2026 richtet sich nach Ihrem Einkommen und Ihrer Steuerklasse. Der Steuersatz beginnt bei 14% (Eingangssteuersatz) und steigt bis zu 45% (Reichensteuersatz). Bei einem Bruttogehalt von 4.000\u20AC in Steuerklasse 1 betr\xE4gt die Lohnsteuer etwa 500-600\u20AC monatlich."
        }
      },
      {
        "@type": "Question",
        "name": "Wie berechnet man die monatliche Lohnsteuer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Die Lohnsteuer wird nach dem Einkommensteuertarif \xA732a EStG berechnet: Vom Bruttolohn werden Vorsorgepauschale und Werbungskosten abgezogen. Auf das zu versteuernde Einkommen wird der progressive Steuertarif angewendet. Die Steuerklasse beeinflusst Freibetr\xE4ge und Pauschalen."
        }
      },
      {
        "@type": "Question",
        "name": "Welche Steuerklasse zahlt am wenigsten Lohnsteuer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Steuerklasse III hat die niedrigsten monatlichen Abz\xFCge \u2013 sie nutzt den doppelten Grundfreibetrag. Allerdings muss der Partner dann Steuerklasse V w\xE4hlen und zahlt mehr. Am Jahresende gleicht sich die Steuerlast durch die Steuererkl\xE4rung aus."
        }
      },
      {
        "@type": "Question",
        "name": "Wie viel Prozent Lohnsteuer bei 4000 brutto?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Bei 4.000\u20AC brutto (Steuerklasse I, keine Kirchensteuer) betr\xE4gt die Lohnsteuer etwa 550-600\u20AC monatlich. Das entspricht einem Durchschnittssteuersatz von ca. 14-15%. Der Grenzsteuersatz liegt bei etwa 30%."
        }
      },
      {
        "@type": "Question",
        "name": "Muss ich als Minijobber Lohnsteuer zahlen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Bei einem Minijob bis 538\u20AC zahlen Sie in der Regel keine Lohnsteuer. Der Arbeitgeber f\xFChrt pauschal 2% Lohnsteuer ab. Alternativ k\xF6nnen Sie sich nach Ihrer Steuerklasse besteuern lassen \u2013 bei Steuerklasse I bis V bleibt der Minijob trotzdem steuerfrei."
        }
      }
    ]
  }))) })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/lohnsteuer-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/lohnsteuer-rechner.astro";
const $$url = "/lohnsteuer-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$LohnsteuerRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
