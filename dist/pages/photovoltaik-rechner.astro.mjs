/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, u as unescapeHTML, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DmT1JwUR.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const GLOBALSTRAHLUNG_REGIONEN = {
  "nord": { name: "Norddeutschland", strahlung: 950 },
  "nordwest": { name: "Nordwesten", strahlung: 980 },
  "nordost": { name: "Nordosten", strahlung: 1e3 },
  "mitte": { name: "Mitteldeutschland", strahlung: 1020 },
  "west": { name: "Westen (NRW)", strahlung: 1e3 },
  "ost": { name: "Osten (Sachsen)", strahlung: 1050 },
  "suedwest": { name: "Südwesten (BaWü)", strahlung: 1100 },
  "suedost": { name: "Südosten (Bayern)", strahlung: 1150 },
  "sued": { name: "Süddeutschland", strahlung: 1120 }
};
const AUSRICHTUNG_FAKTOREN = {
  "sued": { name: "Süd (optimal)", faktor: 1, grad: 0 },
  "suedwest": { name: "Südwest", faktor: 0.95, grad: -45 },
  "suedost": { name: "Südost", faktor: 0.95, grad: 45 },
  "west": { name: "West", faktor: 0.85, grad: -90 },
  "ost": { name: "Ost", faktor: 0.85, grad: 90 },
  "nordwest": { name: "Nordwest", faktor: 0.65, grad: -135 },
  "nordost": { name: "Nordost", faktor: 0.65, grad: 135 },
  "nord": { name: "Nord", faktor: 0.55, grad: 180 },
  "flach": { name: "Flachdach (10°)", faktor: 0.9, grad: 0 }
};
const NEIGUNG_FAKTOREN = {
  "0": { name: "Flach (0-10°)", faktor: 0.88, grad: 5 },
  "15": { name: "Leicht (15°)", faktor: 0.95, grad: 15 },
  "30": { name: "Optimal (30°)", faktor: 1, grad: 30 },
  "35": { name: "Optimal (35°)", faktor: 1, grad: 35 },
  "45": { name: "Steil (45°)", faktor: 0.96, grad: 45 },
  "60": { name: "Sehr steil (60°)", faktor: 0.86, grad: 60 },
  "90": { name: "Fassade (90°)", faktor: 0.7, grad: 90 }
};
const EINSPEISEVERGUETUNG = {
  bis10kWp: 8.03,
  // ct/kWh für Anlagen ≤10 kWp (Teileinspeisung)
  bis40kWp: 6.95,
  // ct/kWh für Anlagenteile >10 bis 40 kWp
  volleinspeisung10kWp: 12.73,
  // Volleinspeisung ≤10 kWp
  volleinspeisung40kWp: 10.68
  // Volleinspeisung >10-40 kWp
};
const SYSTEM_KOSTEN = {
  kleineAnlage: 1400,
  // €/kWp für <6 kWp
  mittlereAnlage: 1200,
  // €/kWp für 6-10 kWp
  grosseAnlage: 1100,
  // €/kWp für >10 kWp
  speicherProKWh: 800
  // €/kWh Batteriespeicher
};
const PERFORMANCE_RATIO = 0.85;
const DEGRADATION_PRO_JAHR = 5e-3;
function PhotovoltaikRechner() {
  const [anlagengroesse, setAnlagengroesse] = useState(10);
  const [region, setRegion] = useState("suedwest");
  const [ausrichtung, setAusrichtung] = useState("sued");
  const [neigung, setNeigung] = useState("30");
  const [strompreis, setStrompreis] = useState(32);
  const [stromverbrauch, setStromverbrauch] = useState(4e3);
  const [eigenverbrauchsanteil, setEigenverbrauchsanteil] = useState(30);
  const [mitSpeicher, setMitSpeicher] = useState(false);
  const [speichergroesse, setSpeichergroesse] = useState(8);
  const [einspeisemodell, setEinspeisemodell] = useState("teileinspeisung");
  const [investitionskosten, setInvestitionskosten] = useState(null);
  const ergebnis = useMemo(() => {
    const basisStrahlung = GLOBALSTRAHLUNG_REGIONEN[region].strahlung;
    const ausrichtungsFaktor = AUSRICHTUNG_FAKTOREN[ausrichtung].faktor;
    const neigungsFaktor = NEIGUNG_FAKTOREN[neigung].faktor;
    const spezifischerErtrag = basisStrahlung * ausrichtungsFaktor * neigungsFaktor * PERFORMANCE_RATIO;
    const jahresertragJahr1 = anlagengroesse * spezifischerErtrag;
    let effektiverEigenverbrauch = eigenverbrauchsanteil / 100;
    if (mitSpeicher) {
      const speicherBonus = Math.min(0.35, speichergroesse / stromverbrauch * 2);
      effektiverEigenverbrauch = Math.min(0.85, effektiverEigenverbrauch + speicherBonus);
    }
    const maxEigenverbrauchMenge = stromverbrauch;
    const eigenverbrauchMenge = Math.min(jahresertragJahr1 * effektiverEigenverbrauch, maxEigenverbrauchMenge);
    const einspeiseMenge = einspeisemodell === "volleinspeisung" ? jahresertragJahr1 : jahresertragJahr1 - eigenverbrauchMenge;
    let verguetungProKwh;
    if (einspeisemodell === "volleinspeisung") {
      if (anlagengroesse <= 10) {
        verguetungProKwh = EINSPEISEVERGUETUNG.volleinspeisung10kWp;
      } else {
        const anteil10 = 10 / anlagengroesse;
        const anteilRest = (anlagengroesse - 10) / anlagengroesse;
        verguetungProKwh = anteil10 * EINSPEISEVERGUETUNG.volleinspeisung10kWp + anteilRest * EINSPEISEVERGUETUNG.volleinspeisung40kWp;
      }
    } else {
      if (anlagengroesse <= 10) {
        verguetungProKwh = EINSPEISEVERGUETUNG.bis10kWp;
      } else {
        const anteil10 = 10 / anlagengroesse;
        const anteilRest = (anlagengroesse - 10) / anlagengroesse;
        verguetungProKwh = anteil10 * EINSPEISEVERGUETUNG.bis10kWp + anteilRest * EINSPEISEVERGUETUNG.bis40kWp;
      }
    }
    const ersparnisEigenverbrauch = einspeisemodell === "volleinspeisung" ? 0 : eigenverbrauchMenge * (strompreis / 100);
    const einnahmenEinspeisung = einspeiseMenge * (verguetungProKwh / 100);
    const jaehrlicheEinnahmenJahr1 = ersparnisEigenverbrauch + einnahmenEinspeisung;
    let systemKosten;
    if (investitionskosten !== null) {
      systemKosten = investitionskosten;
    } else {
      let kostenProKwp;
      if (anlagengroesse < 6) {
        kostenProKwp = SYSTEM_KOSTEN.kleineAnlage;
      } else if (anlagengroesse <= 10) {
        kostenProKwp = SYSTEM_KOSTEN.mittlereAnlage;
      } else {
        kostenProKwp = SYSTEM_KOSTEN.grosseAnlage;
      }
      systemKosten = anlagengroesse * kostenProKwp;
      if (mitSpeicher) {
        systemKosten += speichergroesse * SYSTEM_KOSTEN.speicherProKWh;
      }
    }
    let kumulierteEinnahmen = 0;
    let amortisationJahr = null;
    const jahresdetails = [];
    for (let jahr = 1; jahr <= 25; jahr++) {
      const degradationsFaktor = Math.pow(1 - DEGRADATION_PRO_JAHR, jahr - 1);
      const jahresertrag = jahresertragJahr1 * degradationsFaktor;
      const strompreisJahr = strompreis * Math.pow(1.03, jahr - 1);
      let einnahmenJahr;
      if (einspeisemodell === "volleinspeisung") {
        einnahmenJahr = jahresertrag * (verguetungProKwh / 100);
      } else {
        const evMenge = Math.min(jahresertrag * effektiverEigenverbrauch, maxEigenverbrauchMenge);
        const einspMenge = jahresertrag - evMenge;
        einnahmenJahr = evMenge * (strompreisJahr / 100) + einspMenge * (verguetungProKwh / 100);
      }
      kumulierteEinnahmen += einnahmenJahr;
      if (amortisationJahr === null && kumulierteEinnahmen >= systemKosten) {
        const vormonatKumuliert = kumulierteEinnahmen - einnahmenJahr;
        const restBetrag = systemKosten - vormonatKumuliert;
        const monatlicheEinnahmen = einnahmenJahr / 12;
        const zusatzMonate = restBetrag / monatlicheEinnahmen;
        amortisationJahr = jahr - 1 + zusatzMonate / 12;
      }
      if (jahr <= 20) {
        jahresdetails.push({
          jahr,
          ertrag: jahresertrag,
          einnahmen: einnahmenJahr,
          kumuliert: kumulierteEinnahmen
        });
      }
    }
    const gesamtEinnahmen20Jahre = jahresdetails.reduce((sum, j) => sum + j.einnahmen, 0);
    const rendite = (gesamtEinnahmen20Jahre - systemKosten) / systemKosten / 20 * 100;
    const co2EinsparungProJahr = jahresertragJahr1 * 0.4;
    const co2Einsparung20Jahre = jahresdetails.reduce((sum, j) => sum + j.ertrag * 0.4, 0);
    const autarkiegrad = einspeisemodell === "volleinspeisung" ? 0 : eigenverbrauchMenge / stromverbrauch * 100;
    return {
      // Ertrag
      spezifischerErtrag,
      jahresertragJahr1,
      // Eigenverbrauch
      effektiverEigenverbrauch: effektiverEigenverbrauch * 100,
      eigenverbrauchMenge,
      einspeiseMenge,
      autarkiegrad,
      // Vergütung
      verguetungProKwh,
      // Einnahmen Jahr 1
      ersparnisEigenverbrauch,
      einnahmenEinspeisung,
      jaehrlicheEinnahmenJahr1,
      // Investition
      systemKosten,
      // 20-Jahres-Berechnung
      amortisationJahr,
      gesamtEinnahmen20Jahre,
      gewinn20Jahre: gesamtEinnahmen20Jahre - systemKosten,
      rendite,
      jahresdetails,
      // Umwelt
      co2EinsparungProJahr,
      co2Einsparung20Jahre
    };
  }, [
    anlagengroesse,
    region,
    ausrichtung,
    neigung,
    strompreis,
    stromverbrauch,
    eigenverbrauchsanteil,
    mitSpeicher,
    speichergroesse,
    einspeisemodell,
    investitionskosten
  ]);
  const formatEuro = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";
  const formatEuroDecimal = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  const formatKwh = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " kWh";
  const formatProzent = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " %";
  const formatJahre = (n) => n !== null ? n.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " Jahre" : "> 25 Jahre";
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Anlagengröße (kWp)" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Typisch: 5-15 kWp für Einfamilienhäuser" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4 mb-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setAnlagengroesse(Math.max(1, anlagengroesse - 1)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors",
              children: "−"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "text-center min-w-[100px]", children: [
            /* @__PURE__ */ jsx("span", { className: "text-4xl font-bold text-gray-800", children: anlagengroesse }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-500 ml-2", children: "kWp" })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setAnlagengroesse(Math.min(30, anlagengroesse + 1)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors",
              children: "+"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: anlagengroesse,
            onChange: (e) => setAnlagengroesse(Number(e.target.value)),
            className: "w-full accent-amber-500",
            min: "1",
            max: "30",
            step: "0.5"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "1 kWp" }),
          /* @__PURE__ */ jsx("span", { children: "15 kWp" }),
          /* @__PURE__ */ jsx("span", { children: "30 kWp" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 mt-2 text-center", children: [
          "≈ ",
          Math.round(anlagengroesse * 5),
          " m² Dachfläche benötigt (bei modernen Modulen)"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Standort / Region" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Sonneneinstrahlung variiert je nach Standort" })
        ] }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: region,
            onChange: (e) => setRegion(e.target.value),
            className: "w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none text-gray-700",
            children: Object.entries(GLOBALSTRAHLUNG_REGIONEN).map(([key, { name, strahlung }]) => /* @__PURE__ */ jsxs("option", { value: key, children: [
              name,
              " (",
              strahlung,
              " kWh/m²)"
            ] }, key))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Dachausrichtung" }) }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-2", children: Object.entries(AUSRICHTUNG_FAKTOREN).map(([key, { name, faktor }]) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setAusrichtung(key),
            className: `py-2 px-3 rounded-xl text-sm font-medium transition-all ${ausrichtung === key ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: [
              name,
              /* @__PURE__ */ jsxs("span", { className: "block text-xs opacity-70", children: [
                Math.round(faktor * 100),
                "%"
              ] })
            ]
          },
          key
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Dachneigung" }) }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-2", children: Object.entries(NEIGUNG_FAKTOREN).map(([key, { name, faktor }]) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setNeigung(key),
            className: `py-2 px-2 rounded-xl text-xs font-medium transition-all ${neigung === key ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: name
          },
          key
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Jährlicher Stromverbrauch" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Typisch: 3.000-5.000 kWh für 2-4 Personen" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: stromverbrauch,
              onChange: (e) => setStromverbrauch(Math.max(0, Number(e.target.value))),
              className: "w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none",
              min: "0",
              max: "30000",
              step: "100"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400", children: "kWh/Jahr" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: stromverbrauch,
            onChange: (e) => setStromverbrauch(Number(e.target.value)),
            className: "w-full mt-3 accent-amber-500",
            min: "1000",
            max: "15000",
            step: "100"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Aktueller Strompreis" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Durchschnitt 2025: ca. 30-35 ct/kWh" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: strompreis,
              onChange: (e) => setStrompreis(Math.max(0, Number(e.target.value))),
              className: "w-32 text-xl font-bold text-center py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none",
              min: "15",
              max: "60",
              step: "0.5"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "ct/kWh" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              value: strompreis,
              onChange: (e) => setStrompreis(Number(e.target.value)),
              className: "flex-1 accent-amber-500",
              min: "20",
              max: "50",
              step: "0.5"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Einspeisemodell" }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setEinspeisemodell("teileinspeisung"),
              className: `py-3 px-4 rounded-xl font-medium transition-all ${einspeisemodell === "teileinspeisung" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "block", children: "Eigenverbrauch" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs opacity-80", children: "+ Überschuss einspeisen" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setEinspeisemodell("volleinspeisung"),
              className: `py-3 px-4 rounded-xl font-medium transition-all ${einspeisemodell === "volleinspeisung" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "block", children: "Volleinspeisung" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs opacity-80", children: "Alles ins Netz" })
              ]
            }
          )
        ] })
      ] }),
      einspeisemodell === "teileinspeisung" && /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Eigenverbrauchsanteil (ohne Speicher)" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Typisch: 20-35% ohne Speicher, je nach Verbrauchsmuster" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-2xl font-bold text-gray-800", children: [
            eigenverbrauchsanteil,
            "%"
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              value: eigenverbrauchsanteil,
              onChange: (e) => setEigenverbrauchsanteil(Number(e.target.value)),
              className: "flex-1 accent-amber-500",
              min: "10",
              max: "50",
              step: "5"
            }
          )
        ] })
      ] }),
      einspeisemodell === "teileinspeisung" && /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Batteriespeicher" }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 mb-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setMitSpeicher(false),
              className: `py-3 px-4 rounded-xl font-medium transition-all ${!mitSpeicher ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: "Ohne Speicher"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setMitSpeicher(true),
              className: `py-3 px-4 rounded-xl font-medium transition-all ${mitSpeicher ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: "Mit Speicher 🔋"
            }
          )
        ] }),
        mitSpeicher && /* @__PURE__ */ jsxs("div", { className: "p-4 bg-amber-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("label", { className: "block mb-2 text-sm text-amber-800 font-medium", children: "Speicherkapazität (kWh)" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setSpeichergroesse(Math.max(2, speichergroesse - 1)),
                className: "w-10 h-10 rounded-xl bg-white hover:bg-amber-100 text-lg font-bold transition-colors",
                children: "−"
              }
            ),
            /* @__PURE__ */ jsxs("span", { className: "text-2xl font-bold text-amber-800 w-16 text-center", children: [
              speichergroesse,
              " kWh"
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setSpeichergroesse(Math.min(20, speichergroesse + 1)),
                className: "w-10 h-10 rounded-xl bg-white hover:bg-amber-100 text-lg font-bold transition-colors",
                children: "+"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-amber-700 mt-2", children: "Empfehlung: ca. 1 kWh pro kWp Anlagenleistung" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Investitionskosten (optional)" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Leer lassen für automatische Schätzung" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: investitionskosten ?? "",
              onChange: (e) => setInvestitionskosten(e.target.value ? Number(e.target.value) : null),
              placeholder: `ca. ${formatEuro(ergebnis.systemKosten)}`,
              className: "w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none",
              min: "0",
              max: "100000",
              step: "100"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400", children: "€" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: "☀️ Ihre Photovoltaik-Anlage" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatKwh(ergebnis.jahresertragJahr1) }),
          /* @__PURE__ */ jsx("span", { className: "text-xl opacity-80", children: "/ Jahr" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-amber-100 mt-1 text-sm", children: [
          "Erwarteter Jahresertrag (",
          Math.round(ergebnis.spezifischerErtrag),
          " kWh/kWp)"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Jährliche Einnahmen" }),
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: formatEuro(ergebnis.jaehrlicheEinnahmenJahr1) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Amortisation" }),
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: formatJahre(ergebnis.amortisationJahr) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Investition" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.systemKosten) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Gewinn (20 Jahre)" }),
          /* @__PURE__ */ jsxs("div", { className: "text-xl font-bold text-green-200", children: [
            "+",
            formatEuro(ergebnis.gewinn20Jahre)
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Ertragsübersicht Jahr 1" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
            "Globalstrahlung (",
            GLOBALSTRAHLUNG_REGIONEN[region].name,
            ")"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-900", children: [
            GLOBALSTRAHLUNG_REGIONEN[region].strahlung,
            " kWh/m²"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
            "Ausrichtungsfaktor (",
            AUSRICHTUNG_FAKTOREN[ausrichtung].name,
            ")"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatProzent(AUSRICHTUNG_FAKTOREN[ausrichtung].faktor * 100) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
            "Neigungsfaktor (",
            NEIGUNG_FAKTOREN[neigung].name,
            ")"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatProzent(NEIGUNG_FAKTOREN[neigung].faktor * 100) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Performance Ratio (Systemeffizienz)" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatProzent(PERFORMANCE_RATIO * 100) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-amber-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-amber-800", children: "= Spezifischer Ertrag" }),
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-amber-900", children: [
            Math.round(ergebnis.spezifischerErtrag),
            " kWh/kWp"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-3 bg-amber-100 -mx-6 px-6 rounded-b-xl", children: [
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-amber-800", children: [
            "Jahresertrag (",
            anlagengroesse,
            " kWp)"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-2xl text-amber-900", children: formatKwh(ergebnis.jahresertragJahr1) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "💰 Wirtschaftlichkeit Jahr 1" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        einspeisemodell === "teileinspeisung" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide", children: "Eigenverbrauch" }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
              "Eigenverbrauchsanteil ",
              mitSpeicher && "(mit Speicher)"
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatProzent(ergebnis.effektiverEigenverbrauch) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Selbst verbraucht" }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatKwh(ergebnis.eigenverbrauchMenge) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Autarkiegrad (vom Verbrauch gedeckt)" }),
            /* @__PURE__ */ jsx("span", { className: "font-medium text-green-600", children: formatProzent(ergebnis.autarkiegrad) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-green-50 -mx-6 px-6", children: [
            /* @__PURE__ */ jsxs("span", { className: "font-medium text-green-700", children: [
              "= Ersparnis Eigenverbrauch (",
              strompreis,
              " ct/kWh)"
            ] }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-green-900", children: formatEuroDecimal(ergebnis.ersparnisEigenverbrauch) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide pt-4", children: "Einspeisung" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Eingespeiste Menge" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatKwh(ergebnis.einspeiseMenge) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
            "Einspeisevergütung (",
            einspeisemodell === "volleinspeisung" ? "Volleinspeisung" : "Teileinspeisung",
            ")"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-900", children: [
            ergebnis.verguetungProKwh.toFixed(2),
            " ct/kWh"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-blue-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-blue-700", children: "= Einnahmen Einspeisung" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-blue-900", children: formatEuroDecimal(ergebnis.einnahmenEinspeisung) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-3 bg-amber-100 -mx-6 px-6 rounded-b-xl mt-4", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-amber-800", children: "Jährlicher Gesamtnutzen" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-2xl text-amber-900", children: formatEuro(ergebnis.jaehrlicheEinnahmenJahr1) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📈 20-Jahres-Prognose" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-xl p-4 text-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-500", children: "Investition" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-gray-800", children: formatEuro(ergebnis.systemKosten) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-green-50 rounded-xl p-4 text-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm text-green-600", children: "Gesamteinnahmen" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-green-700", children: formatEuro(ergebnis.gesamtEinnahmen20Jahre) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 rounded-xl p-4 text-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm text-amber-600", children: "Amortisation nach" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-amber-700", children: formatJahre(ergebnis.amortisationJahr) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-emerald-50 rounded-xl p-4 text-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm text-emerald-600", children: "Nettogewinn" }),
          /* @__PURE__ */ jsxs("div", { className: "text-xl font-bold text-emerald-700", children: [
            "+",
            formatEuro(ergebnis.gewinn20Jahre)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 rounded-xl p-4 text-center", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm text-blue-600", children: "Durchschnittliche jährliche Rendite" }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-blue-700", children: formatProzent(ergebnis.rendite) })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-3 text-center", children: "Annahmen: 0,5% Degradation/Jahr, 3% Strompreissteigerung/Jahr, konstante Einspeisevergütung" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-green-50 border border-green-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-green-800 mb-3", children: "🌱 Umweltbilanz" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm text-green-600", children: "CO₂-Einsparung pro Jahr" }),
          /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold text-green-700", children: [
            (ergebnis.co2EinsparungProJahr / 1e3).toFixed(1),
            " t"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm text-green-600", children: "CO₂-Einsparung 20 Jahre" }),
          /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold text-green-700", children: [
            (ergebnis.co2Einsparung20Jahre / 1e3).toFixed(1),
            " t"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-green-700 mt-3 text-center", children: "Basis: 400g CO₂/kWh (deutscher Strommix 2024)" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert's" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "☀️" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Ertrag:" }),
            " Abhängig von Standort (800-1.200 kWh/m²), Ausrichtung und Neigung"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "💡" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Eigenverbrauch:" }),
            " Je mehr selbst verbraucht, desto höher die Rendite (Strompreis ",
            ">",
            " Einspeisevergütung)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "🔋" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Speicher:" }),
            " Erhöht Eigenverbrauch um 20-35%, aber längere Amortisation"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "📊" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Einspeisevergütung 2025:" }),
            " ",
            EINSPEISEVERGUETUNG.bis10kWp,
            " ct/kWh (≤10 kWp, Teileinspeisung)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "🏠" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Volleinspeisung:" }),
            " Höhere Vergütung (",
            EINSPEISEVERGUETUNG.volleinspeisung10kWp,
            " ct/kWh), aber kein Eigenverbrauchsvorteil"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "📉" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Degradation:" }),
            " Module verlieren ca. 0,5% Leistung pro Jahr"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-amber-800 mb-3", children: "⚡ Einspeisevergütung 2025 (EEG)" }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-amber-700", children: [
          /* @__PURE__ */ jsx("th", { className: "py-2", children: "Anlagengröße" }),
          /* @__PURE__ */ jsx("th", { className: "py-2 text-right", children: "Teileinspeisung" }),
          /* @__PURE__ */ jsx("th", { className: "py-2 text-right", children: "Volleinspeisung" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { className: "text-amber-800", children: [
          /* @__PURE__ */ jsxs("tr", { className: "border-t border-amber-200", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2", children: "bis 10 kWp" }),
            /* @__PURE__ */ jsxs("td", { className: "py-2 text-right font-medium", children: [
              EINSPEISEVERGUETUNG.bis10kWp,
              " ct/kWh"
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "py-2 text-right font-medium", children: [
              EINSPEISEVERGUETUNG.volleinspeisung10kWp,
              " ct/kWh"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "border-t border-amber-200", children: [
            /* @__PURE__ */ jsxs("td", { className: "py-2", children: [
              ">",
              " 10 bis 40 kWp"
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "py-2 text-right font-medium", children: [
              EINSPEISEVERGUETUNG.bis40kWp,
              " ct/kWh"
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "py-2 text-right font-medium", children: [
              EINSPEISEVERGUETUNG.volleinspeisung40kWp,
              " ct/kWh"
            ] })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-amber-700 mt-3", children: "Die Vergütung wird für 20 Jahre ab Inbetriebnahme festgeschrieben. Degression: -1% pro Halbjahr." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-amber-800 mb-3", children: "⚠️ Wichtige Hinweise" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-amber-700", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Verschattung:" }),
            " Bäume, Schornsteine oder Nachbargebäude können den Ertrag erheblich reduzieren"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Netzbetreiber:" }),
            " Anmeldung bei Netzbetreiber und im Marktstammdatenregister erforderlich"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Förderungen:" }),
            " KfW-Kredite und regionale Förderprogramme prüfen (z.B. für Speicher)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Steuern:" }),
            " Seit 2023 sind PV-Anlagen bis 30 kWp von Einkommensteuer befreit (§ 3 Nr. 72 EStG)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Angebote vergleichen:" }),
            " Holen Sie mindestens 3 Angebote von verschiedenen Installateuren ein"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Wichtige Anlaufstellen" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-amber-900", children: "Marktstammdatenregister" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-amber-700 mt-1", children: "Jede PV-Anlage muss hier registriert werden – Pflicht!" }),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "https://www.marktstammdatenregister.de",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-blue-600 hover:underline text-sm",
              children: "marktstammdatenregister.de →"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🏦" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "KfW-Förderung" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.kfw.de/inlandsfoerderung/Privatpersonen/Bestandsimmobilie/Förderprodukte/Erneuerbare-Energien-Standard-(270)/",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline text-xs",
                  children: "KfW 270 – Erneuerbare Energien →"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Energieberatung" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.verbraucherzentrale-energieberatung.de",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline text-xs",
                  children: "Verbraucherzentrale Energieberatung →"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "⚡" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Netzbetreiber" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-600", children: "Ihren lokalen Netzbetreiber kontaktieren" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Solarkataster" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-600", children: "Viele Bundesländer bieten Online-Solarkataster" })
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
            href: "https://www.gesetze-im-internet.de/eeg_2014/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "EEG 2023 – Erneuerbare-Energien-Gesetz"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/ErneuerbareEnergien/start.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesnetzagentur – Erneuerbare Energien"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.solarwirtschaft.de",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesverband Solarwirtschaft (BSW)"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://re.jrc.ec.europa.eu/pvg_tools/en/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "EU PVGIS – Photovoltaic Geographical Information System"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.verbraucherzentrale.de/wissen/energie/erneuerbare-energien/photovoltaik-was-bei-der-planung-einer-solaranlage-wichtig-ist-5574",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Verbraucherzentrale – Photovoltaik Planung"
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
const $$PhotovoltaikRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "Photovoltaik-Rechner 2025 \u2013 Ertrag, Kosten & Amortisation berechnen";
  const description = "Photovoltaik Rechner 2025: Berechnen Sie Ertrag, Kosten, Einspeiseverg\xFCtung & Amortisation Ihrer Solaranlage. Mit Speicher-Option & 20-Jahres-Prognose. Kostenlos!";
  const keywords = "Photovoltaik Rechner, PV Rechner, Solaranlage berechnen, Photovoltaik Ertrag, PV Anlage Kosten, Einspeiseverg\xFCtung 2025, Solarrechner, Photovoltaik Amortisation, Solaranlage Rendite, PV Speicher Rechner, Eigenverbrauch Rechner, Photovoltaik 2025, Solar Wirtschaftlichkeit, kWp Rechner, Solarstrom Rechner, Balkonkraftwerk Rechner, PV Anlage planen, Solardach Rechner, Photovoltaik F\xF6rderung, EEG Verg\xFCtung 2025";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<main class="min-h-screen pb-8"> <!-- Header mit Zur\xFCck-Button --> <header class="bg-gradient-to-r from-amber-500 to-orange-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-amber-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>\nAlle Rechner\n</a> <div class="flex items-center gap-3"> <span class="text-4xl">\u2600\uFE0F</span> <div> <h1 class="text-2xl font-bold">Photovoltaik-Rechner</h1> <p class="text-amber-100 text-sm">Ertrag, Kosten & Rendite 2025</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ', ' </div> <!-- SEO Content Section --> <div class="max-w-2xl mx-auto px-4 mt-8"> <div class="bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">Photovoltaik 2025: Alles was Sie wissen m\xFCssen</h2> <div class="prose prose-sm text-gray-600 space-y-4"> <p>\nEine <strong>Photovoltaik-Anlage</strong> auf dem eigenen Dach ist eine der besten Investitionen f\xFCr \n            Hausbesitzer in Deutschland. Mit unserem <strong>PV-Rechner</strong> ermitteln Sie schnell, ob sich \n            eine Solaranlage f\xFCr Sie lohnt \u2013 inklusive Ertragsprognose, Amortisationszeit und 20-Jahres-Rendite.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wie viel Strom erzeugt eine PV-Anlage?</h3> <p>\nDer <strong>Ertrag einer Photovoltaik-Anlage</strong> h\xE4ngt von mehreren Faktoren ab:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Standort:</strong> In S\xFCddeutschland (Bayern, Baden-W\xFCrttemberg) ist die Sonneneinstrahlung bis zu 20% h\xF6her als im Norden</li> <li><strong>Ausrichtung:</strong> Optimal ist S\xFCd, aber auch Ost-West-Anlagen funktionieren gut (85-95% des optimalen Ertrags)</li> <li><strong>Dachneigung:</strong> Ideal sind 30-35\xB0, Flachd\xE4cher und steile D\xE4cher liefern etwas weniger</li> <li><strong>Verschattung:</strong> B\xE4ume, Kamine oder Nachbargeb\xE4ude k\xF6nnen den Ertrag drastisch senken</li> </ul> <p> <strong>Faustformel:</strong> Eine 10-kWp-Anlage erzeugt in Deutschland ca. 9.000-11.000 kWh pro Jahr \u2013 \n            genug f\xFCr einen 4-Personen-Haushalt und ein Elektroauto.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Was kostet eine Solaranlage 2025?</h3> <p>\nDie <strong>Kosten f\xFCr Photovoltaik</strong> sind in den letzten Jahren deutlich gesunken:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Kleine Anlagen (bis 6 kWp):</strong> ca. 1.300-1.500 \u20AC/kWp</li> <li><strong>Mittlere Anlagen (6-10 kWp):</strong> ca. 1.100-1.300 \u20AC/kWp</li> <li><strong>Gr\xF6\xDFere Anlagen (\xFCber 10 kWp):</strong> ca. 1.000-1.200 \u20AC/kWp</li> <li><strong>Batteriespeicher:</strong> ca. 700-1.000 \u20AC/kWh Speicherkapazit\xE4t</li> </ul> <p>\nEine typische <strong>10-kWp-Anlage mit 8-kWh-Speicher</strong> kostet inkl. Installation \n            ca. 18.000-22.000 \u20AC \u2013 und ist <strong>seit 2023 mehrwertsteuerfrei</strong>!\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Einspeiseverg\xFCtung 2025</h3> <p>\nDie <strong>EEG-Einspeiseverg\xFCtung</strong> wird f\xFCr 20 Jahre ab Inbetriebnahme festgeschrieben:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Teileinspeisung (Eigenverbrauch):</strong> 8,03 ct/kWh f\xFCr Anlagen bis 10 kWp</li> <li><strong>Volleinspeisung:</strong> 12,73 ct/kWh f\xFCr Anlagen bis 10 kWp</li> </ul> <p> <strong>Wichtig:</strong> Da der Strompreis (ca. 30-35 ct/kWh) deutlich h\xF6her ist als die Verg\xFCtung, \n            lohnt sich <strong>Eigenverbrauch mehr als Einspeisung</strong>!\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Lohnt sich ein Batteriespeicher?</h3> <p>\nEin <strong>Stromspeicher</strong> erh\xF6ht den Eigenverbrauch von typischerweise 25-35% auf 60-80%. \n            Das bedeutet:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>H\xF6here Stromkostenersparnis</strong> (mehr selbst verbrauchter Solarstrom)</li> <li><strong>Mehr Unabh\xE4ngigkeit</strong> vom Stromversorger</li> <li><strong>Aber:</strong> L\xE4ngere Amortisationszeit durch h\xF6here Investition</li> </ul> <p> <strong>Faustformel:</strong> Speicher mit 1 kWh pro kWp Anlagenleistung (z.B. 10-kWh-Speicher f\xFCr 10-kWp-Anlage).\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Amortisation: Wann hat sich die Anlage bezahlt?</h3> <p>\nDie <strong>Amortisationszeit</strong> einer Photovoltaik-Anlage liegt typischerweise bei:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Ohne Speicher:</strong> 8-12 Jahre</li> <li><strong>Mit Speicher:</strong> 12-16 Jahre</li> </ul> <p>\nBei einer Lebensdauer von 25-30 Jahren und einer j\xE4hrlichen Rendite von <strong>5-8%</strong>\nist eine PV-Anlage eine der besten Geldanlagen f\xFCr Eigenheimbesitzer.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Steuern auf Photovoltaik: Gute Nachrichten!</h3> <p>\nSeit 2023 gibt es erhebliche <strong>Steuererleichterungen f\xFCr PV-Anlagen</strong>:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Keine Mehrwertsteuer:</strong> 0% MwSt. auf Kauf und Installation (bis 30 kWp)</li> <li><strong>Keine Einkommensteuer:</strong> Eink\xFCnfte aus PV-Anlagen bis 30 kWp sind steuerfrei</li> <li><strong>Keine Gewerbesteuer:</strong> Kleinanlagen sind gewerbesteuerfrei</li> </ul> <p>\nDas macht die Anlage g\xFCnstiger und die Abrechnung einfacher \u2013 kein Finanzamt, keine Steuererkl\xE4rung f\xFCr Solarstrom.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">F\xF6rderungen f\xFCr Photovoltaik</h3> <p>\nNeben der Einspeiseverg\xFCtung gibt es weitere <strong>F\xF6rderm\xF6glichkeiten</strong>:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>KfW-Kredit 270:</strong> G\xFCnstiger Kredit f\xFCr Erneuerbare-Energien-Anlagen</li> <li><strong>Regionale Programme:</strong> Viele Bundesl\xE4nder und Kommunen f\xF6rdern Speicher</li> <li><strong>E-Auto-Wallbox:</strong> Kombination mit E-Mobilit\xE4t oft extra gef\xF6rdert</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Die richtige Anlagengr\xF6\xDFe w\xE4hlen</h3> <p> <strong>Empfehlung:</strong> Die Anlage so gro\xDF wie m\xF6glich dimensionieren (Dachfl\xE4che ausnutzen). \n            Gr\xFCnde:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Kosteneffizienz:</strong> Gr\xF6\xDFere Anlagen haben niedrigere Kosten pro kWp</li> <li><strong>E-Mobilit\xE4t:</strong> Elektroautos erh\xF6hen den Stromverbrauch um 2.000-4.000 kWh/Jahr</li> <li><strong>W\xE4rmepumpe:</strong> Auch Heizen mit Strom wird immer attraktiver</li> <li><strong>Zukunftssicher:</strong> Der Stromverbrauch wird tendenziell steigen</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Anmeldung und B\xFCrokratie</h3> <p>\nFolgende Schritte sind f\xFCr die <strong>Inbetriebnahme</strong> erforderlich:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Anmeldung beim Netzbetreiber:</strong> Vor Installation erforderlich</li> <li><strong>Marktstammdatenregister:</strong> Pflicht-Registrierung innerhalb 1 Monat nach Inbetriebnahme</li> <li><strong>Z\xE4hlerwechsel:</strong> Netzbetreiber tauscht den Stromz\xE4hler (meist kostenfrei)</li> <li><strong>Keine Baugenehmigung:</strong> In der Regel genehmigungsfrei (au\xDFer Denkmalschutz)</li> </ul> <p>\nDie meisten Installateure \xFCbernehmen die Anmeldung als Service.\n</p> </div> </div> </div> </main>  <script type="application/ld+json">', '<\/script>  <script type="application/ld+json">', "<\/script> "])), maybeRenderHead(), renderComponent($$result2, "PhotovoltaikRechner", PhotovoltaikRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/PhotovoltaikRechner", "client:component-export": "default" }), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Photovoltaik-Rechner 2025",
    "description": description,
    "url": "https://deutschland-rechner.de/photovoltaik-rechner",
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
        "name": "Wie viel kostet eine Photovoltaik-Anlage 2025?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Eine typische 10-kWp-Anlage kostet 2025 etwa 11.000-13.000 Euro ohne Speicher, mit einem 8-kWh-Speicher ca. 18.000-22.000 Euro. Die Preise sind seit 2023 mehrwertsteuerfrei (0% MwSt.)."
        }
      },
      {
        "@type": "Question",
        "name": "Wie hoch ist die Einspeiseverg\xFCtung 2025?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Die Einspeiseverg\xFCtung betr\xE4gt 2025 bei Teileinspeisung (Eigenverbrauch) 8,03 ct/kWh f\xFCr Anlagen bis 10 kWp. Bei Volleinspeisung sind es 12,73 ct/kWh. Die Verg\xFCtung wird f\xFCr 20 Jahre festgeschrieben."
        }
      },
      {
        "@type": "Question",
        "name": "Wann hat sich eine Solaranlage amortisiert?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Die Amortisationszeit liegt typischerweise bei 8-12 Jahren ohne Speicher und 12-16 Jahren mit Speicher. Bei einer Lebensdauer von 25-30 Jahren ergibt sich eine Rendite von 5-8% pro Jahr."
        }
      },
      {
        "@type": "Question",
        "name": "Wie viel Strom erzeugt eine 10-kWp-Anlage?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Eine 10-kWp-Anlage erzeugt in Deutschland je nach Standort und Ausrichtung ca. 9.000-11.000 kWh pro Jahr. In S\xFCddeutschland ist der Ertrag etwa 10-20% h\xF6her als im Norden."
        }
      },
      {
        "@type": "Question",
        "name": "Muss ich Steuern auf Solarstrom zahlen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Seit 2023 sind PV-Anlagen bis 30 kWp von der Einkommensteuer befreit. Auch die Mehrwertsteuer auf Kauf und Installation entf\xE4llt (0% MwSt.). Die Abrechnung ist dadurch deutlich einfacher geworden."
        }
      },
      {
        "@type": "Question",
        "name": "Lohnt sich ein Batteriespeicher?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ein Speicher erh\xF6ht den Eigenverbrauch von ca. 30% auf 60-80%, was bei hohen Strompreisen sehr vorteilhaft ist. Die Amortisation dauert allerdings l\xE4nger. Als Faustformel: 1 kWh Speicher pro kWp Anlagenleistung."
        }
      }
    ]
  }))) })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/photovoltaik-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/photovoltaik-rechner.astro";
const $$url = "/photovoltaik-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$PhotovoltaikRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
