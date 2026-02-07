/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, u as unescapeHTML, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DmT1JwUR.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const BUNDESLAENDER = [
  { id: "bw", name: "Baden-Württemberg", modell: "bodenwert", hebesatzSchnitt: 478 },
  { id: "by", name: "Bayern", modell: "flaeche", hebesatzSchnitt: 387 },
  { id: "be", name: "Berlin", modell: "bundesmodell", hebesatzSchnitt: 810 },
  { id: "bb", name: "Brandenburg", modell: "bundesmodell", hebesatzSchnitt: 416 },
  { id: "hb", name: "Bremen", modell: "bundesmodell", hebesatzSchnitt: 695 },
  { id: "hh", name: "Hamburg", modell: "flaeche", hebesatzSchnitt: 540 },
  { id: "he", name: "Hessen", modell: "flaeche", hebesatzSchnitt: 492 },
  { id: "mv", name: "Mecklenburg-Vorpommern", modell: "bundesmodell", hebesatzSchnitt: 413 },
  { id: "ni", name: "Niedersachsen", modell: "flaeche", hebesatzSchnitt: 451 },
  { id: "nw", name: "Nordrhein-Westfalen", modell: "bundesmodell", hebesatzSchnitt: 573 },
  { id: "rp", name: "Rheinland-Pfalz", modell: "bundesmodell", hebesatzSchnitt: 420 },
  { id: "sl", name: "Saarland", modell: "bundesmodell", hebesatzSchnitt: 447 },
  { id: "sn", name: "Sachsen", modell: "bundesmodell", hebesatzSchnitt: 527 },
  { id: "st", name: "Sachsen-Anhalt", modell: "bundesmodell", hebesatzSchnitt: 436 },
  { id: "sh", name: "Schleswig-Holstein", modell: "bundesmodell", hebesatzSchnitt: 371 },
  { id: "th", name: "Thüringen", modell: "bundesmodell", hebesatzSchnitt: 422 }
];
const MESSZAHLEN = {
  bundesmodell: {
    wohnen: 31e-5,
    // 0,31‰
    gewerbe: 34e-5
    // 0,34‰
  },
  bodenwert: {
    wohnen: 91e-5,
    // 0,91‰ (BaWü reduziert für Wohngrundstücke)
    gewerbe: 126e-5
    // 1,26‰
  },
  flaeche: {
    wohnenProQm: 0.5,
    // €/qm Wohnfläche
    grundProQm: 0.04
    // €/qm Grundstücksfläche
  }
};
const BODENRICHTWERT_SCHNITT = {
  "bw": 210,
  "by": 280,
  "be": 580,
  "bb": 85,
  "hb": 220,
  "hh": 650,
  "he": 190,
  "mv": 55,
  "ni": 95,
  "nw": 180,
  "rp": 120,
  "sl": 90,
  "sn": 95,
  "st": 45,
  "sh": 110,
  "th": 55
};
const NUTZUNGSARTEN = [
  { id: "einfamilienhaus", name: "Einfamilienhaus", icon: "🏠" },
  { id: "zweifamilienhaus", name: "Zweifamilienhaus", icon: "🏘️" },
  { id: "eigentumswohnung", name: "Eigentumswohnung", icon: "🏢" },
  { id: "mietwohnung", name: "Mietwohnhaus", icon: "🏗️" },
  { id: "gewerbe", name: "Gewerbeimmobilie", icon: "🏭" },
  { id: "unbebautes_grundstueck", name: "Unbebautes Grundstück", icon: "🌳" }
];
function GrundsteuerRechner() {
  const [bundesland, setBundesland] = useState("nw");
  const [nutzungsart, setNutzungsart] = useState("einfamilienhaus");
  const [grundstuecksflaeche, setGrundstuecksflaeche] = useState(500);
  const [wohnflaeche, setWohnflaeche] = useState(120);
  const [bodenrichtwert, setBodenrichtwert] = useState(200);
  const [hebesatz, setHebesatz] = useState(500);
  const [baujahr, setBaujahr] = useState(1990);
  const [nutzeSchaetzung, setNutzeSchaetzung] = useState(true);
  const selectedBundesland = BUNDESLAENDER.find((bl) => bl.id === bundesland);
  const handleBundeslandChange = (newBl) => {
    setBundesland(newBl);
    const bl = BUNDESLAENDER.find((b) => b.id === newBl);
    if (nutzeSchaetzung) {
      setBodenrichtwert(BODENRICHTWERT_SCHNITT[newBl] || 150);
      setHebesatz(bl.hebesatzSchnitt);
    }
  };
  const ergebnis = useMemo(() => {
    const istWohnen = nutzungsart !== "gewerbe";
    const istUnbebaut = nutzungsart === "unbebautes_grundstueck";
    const modell = selectedBundesland.modell;
    let grundsteuerwert = 0;
    let grundsteuermessbetrag = 0;
    let grundsteuerJahr = 0;
    let berechnungsweg = [];
    if (modell === "bundesmodell") {
      const bodenwert = bodenrichtwert * grundstuecksflaeche;
      const altersFaktor = Math.max(0.3, 1 - (2025 - baujahr) * 0.01);
      const gebaeudeRohwert = istUnbebaut ? 0 : wohnflaeche * 2e3;
      const gebaeudewert = gebaeudeRohwert * altersFaktor;
      grundsteuerwert = bodenwert + gebaeudewert;
      const messzahl = istWohnen ? MESSZAHLEN.bundesmodell.wohnen : MESSZAHLEN.bundesmodell.gewerbe;
      grundsteuermessbetrag = grundsteuerwert * messzahl;
      grundsteuerJahr = grundsteuermessbetrag * (hebesatz / 100);
      berechnungsweg = [
        { label: "Bodenwert (Bodenrichtwert × Fläche)", wert: `${bodenrichtwert.toLocaleString("de-DE")} € × ${grundstuecksflaeche} m² = ${bodenwert.toLocaleString("de-DE")} €` },
        ...istUnbebaut ? [] : [
          { label: `Gebäudewert (vereinfacht, Alter: ${2025 - baujahr} J.)`, wert: `${gebaeudewert.toLocaleString("de-DE", { maximumFractionDigits: 0 })} €` }
        ],
        { label: "Grundsteuerwert (Summe)", wert: `${grundsteuerwert.toLocaleString("de-DE", { maximumFractionDigits: 0 })} €` },
        { label: `× Steuermesszahl (${istWohnen ? "0,31‰" : "0,34‰"})`, wert: `= ${grundsteuermessbetrag.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` },
        { label: `× Hebesatz (${hebesatz}%)`, wert: `= ${grundsteuerJahr.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € / Jahr` }
      ];
    } else if (modell === "bodenwert") {
      grundsteuerwert = bodenrichtwert * grundstuecksflaeche;
      const messzahl = istWohnen ? MESSZAHLEN.bodenwert.wohnen : MESSZAHLEN.bodenwert.gewerbe;
      grundsteuermessbetrag = grundsteuerwert * messzahl;
      grundsteuerJahr = grundsteuermessbetrag * (hebesatz / 100);
      berechnungsweg = [
        { label: "Bodenrichtwert × Grundstücksfläche", wert: `${bodenrichtwert.toLocaleString("de-DE")} € × ${grundstuecksflaeche} m² = ${grundsteuerwert.toLocaleString("de-DE")} €` },
        { label: `× Steuermesszahl (${istWohnen ? "0,91‰" : "1,26‰"})`, wert: `= ${grundsteuermessbetrag.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` },
        { label: `× Hebesatz (${hebesatz}%)`, wert: `= ${grundsteuerJahr.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € / Jahr` }
      ];
    } else if (modell === "flaeche") {
      const grundAnteil = grundstuecksflaeche * MESSZAHLEN.flaeche.grundProQm;
      const wohnAnteil = istUnbebaut ? 0 : wohnflaeche * MESSZAHLEN.flaeche.wohnenProQm;
      grundsteuermessbetrag = grundAnteil + wohnAnteil;
      grundsteuerJahr = grundsteuermessbetrag * (hebesatz / 100);
      grundsteuerwert = grundsteuermessbetrag * 1e3;
      berechnungsweg = [
        { label: "Grundstücksfläche × 0,04 €/m²", wert: `${grundstuecksflaeche} m² × 0,04 € = ${grundAnteil.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €` },
        ...istUnbebaut ? [] : [
          { label: "Wohnfläche × 0,50 €/m²", wert: `${wohnflaeche} m² × 0,50 € = ${wohnAnteil.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €` }
        ],
        { label: "Grundsteuermessbetrag (Summe)", wert: `${grundsteuermessbetrag.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €` },
        { label: `× Hebesatz (${hebesatz}%)`, wert: `= ${grundsteuerJahr.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € / Jahr` }
      ];
    }
    const grundsteuerMonat = grundsteuerJahr / 12;
    const grundsteuerQuartal = grundsteuerJahr / 4;
    const alteGrundsteuerSchaetzung = grundsteuerJahr * 0.85;
    return {
      modell,
      grundsteuerwert,
      grundsteuermessbetrag,
      grundsteuerJahr,
      grundsteuerMonat,
      grundsteuerQuartal,
      berechnungsweg,
      alteGrundsteuerSchaetzung,
      hebesatz,
      bundesland: selectedBundesland
    };
  }, [bundesland, nutzungsart, grundstuecksflaeche, wohnflaeche, bodenrichtwert, hebesatz, baujahr, selectedBundesland]);
  const formatEuro = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Bundesland" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Jedes Land hat ein eigenes Grundsteuer-Modell" })
        ] }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: bundesland,
            onChange: (e) => handleBundeslandChange(e.target.value),
            className: "w-full py-3 px-4 border-2 border-gray-200 rounded-xl text-lg focus:border-yellow-500 focus:ring-0 outline-none",
            children: BUNDESLAENDER.map((bl) => /* @__PURE__ */ jsxs("option", { value: bl.id, children: [
              bl.name,
              " (",
              bl.modell === "bundesmodell" ? "Bundesmodell" : bl.modell === "bodenwert" ? "Bodenwertmodell" : "Flächenmodell",
              ")"
            ] }, bl.id))
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "mt-2 p-3 bg-yellow-50 rounded-xl", children: /* @__PURE__ */ jsxs("p", { className: "text-xs text-yellow-800", children: [
          /* @__PURE__ */ jsx("strong", { children: selectedBundesland.name }),
          " nutzt das",
          " ",
          /* @__PURE__ */ jsxs("strong", { children: [
            selectedBundesland.modell === "bundesmodell" && "Bundesmodell (Ertragswertverfahren)",
            selectedBundesland.modell === "bodenwert" && "Bodenwertmodell (nur Grundstückswert)",
            selectedBundesland.modell === "flaeche" && "Flächenmodell (nur Flächen, nicht Wert)"
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Art der Immobilie" }) }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: NUTZUNGSARTEN.map((art) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setNutzungsart(art.id),
            className: `py-3 px-3 rounded-xl text-sm transition-all flex flex-col items-center gap-1 ${nutzungsart === art.id ? "bg-yellow-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: [
              /* @__PURE__ */ jsx("span", { className: "text-xl", children: art.icon }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-center", children: art.name })
            ]
          },
          art.id
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Grundstücksfläche" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Aus dem Grundbuchauszug" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: grundstuecksflaeche,
              onChange: (e) => setGrundstuecksflaeche(Math.max(0, Number(e.target.value))),
              className: "w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-0 outline-none",
              min: "0",
              max: "10000",
              step: "10"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg", children: "m²" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: grundstuecksflaeche,
            onChange: (e) => setGrundstuecksflaeche(Number(e.target.value)),
            className: "w-full mt-3 accent-yellow-500",
            min: "100",
            max: "2000",
            step: "10"
          }
        )
      ] }),
      nutzungsart !== "unbebautes_grundstueck" && /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: nutzungsart === "gewerbe" ? "Nutzfläche" : "Wohnfläche" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Wohn- oder Nutzfläche des Gebäudes" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: wohnflaeche,
              onChange: (e) => setWohnflaeche(Math.max(0, Number(e.target.value))),
              className: "w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-0 outline-none",
              min: "0",
              max: "1000",
              step: "5"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg", children: "m²" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: wohnflaeche,
            onChange: (e) => setWohnflaeche(Number(e.target.value)),
            className: "w-full mt-3 accent-yellow-500",
            min: "30",
            max: "500",
            step: "5"
          }
        )
      ] }),
      (selectedBundesland.modell === "bundesmodell" || selectedBundesland.modell === "bodenwert") && /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Bodenrichtwert" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: /* @__PURE__ */ jsx(
            "a",
            {
              href: "https://www.bodenrichtwerte-boris.de",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-yellow-600 hover:underline",
              children: "→ BORIS Portal aufrufen"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: bodenrichtwert,
              onChange: (e) => {
                setBodenrichtwert(Math.max(0, Number(e.target.value)));
                setNutzeSchaetzung(false);
              },
              className: "w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-0 outline-none",
              min: "0",
              max: "5000",
              step: "10"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg", children: "€/m²" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: bodenrichtwert,
            onChange: (e) => {
              setBodenrichtwert(Number(e.target.value));
              setNutzeSchaetzung(false);
            },
            className: "w-full mt-3 accent-yellow-500",
            min: "20",
            max: "1500",
            step: "10"
          }
        ),
        nutzeSchaetzung && /* @__PURE__ */ jsxs("p", { className: "text-xs text-yellow-600 mt-1", children: [
          "⚠️ Durchschnittswert für ",
          selectedBundesland.name,
          ". Ermitteln Sie Ihren genauen Wert im BORIS-Portal."
        ] })
      ] }),
      selectedBundesland.modell === "bundesmodell" && nutzungsart !== "unbebautes_grundstueck" && /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Baujahr des Gebäudes" }) }),
        /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            value: baujahr,
            onChange: (e) => setBaujahr(Math.max(1800, Math.min(2025, Number(e.target.value)))),
            className: "w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-0 outline-none",
            min: "1800",
            max: "2025"
          }
        ) }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: baujahr,
            onChange: (e) => setBaujahr(Number(e.target.value)),
            className: "w-full mt-3 accent-yellow-500",
            min: "1900",
            max: "2025"
          }
        ),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
          "Alter: ",
          2025 - baujahr,
          " Jahre (Altersabschlag wird berücksichtigt)"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Hebesatz Ihrer Gemeinde" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Fragen Sie Ihre Gemeinde oder schauen Sie auf deren Website" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: hebesatz,
              onChange: (e) => {
                setHebesatz(Math.max(0, Number(e.target.value)));
                setNutzeSchaetzung(false);
              },
              className: "w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-0 outline-none",
              min: "0",
              max: "1200",
              step: "10"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg", children: "%" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: hebesatz,
            onChange: (e) => {
              setHebesatz(Number(e.target.value));
              setNutzeSchaetzung(false);
            },
            className: "w-full mt-3 accent-yellow-500",
            min: "200",
            max: "900",
            step: "10"
          }
        ),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
          "Durchschnitt in ",
          selectedBundesland.name,
          ": ",
          selectedBundesland.hebesatzSchnitt,
          "%"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: "🏡 Ihre neue Grundsteuer ab 2025" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuro(ergebnis.grundsteuerJahr) }),
          /* @__PURE__ */ jsx("span", { className: "text-xl opacity-80", children: "/ Jahr" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-yellow-100 mt-2 text-sm", children: [
          "Das sind ",
          /* @__PURE__ */ jsx("strong", { children: formatEuro(ergebnis.grundsteuerMonat) }),
          " pro Monat bzw.",
          " ",
          /* @__PURE__ */ jsx("strong", { children: formatEuro(ergebnis.grundsteuerQuartal) }),
          " pro Quartal."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Pro Monat" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.grundsteuerMonat) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Pro Quartal" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.grundsteuerQuartal) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 p-4 bg-white/10 rounded-xl", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
          /* @__PURE__ */ jsx("strong", { children: "Modell:" }),
          " ",
          ergebnis.modell === "bundesmodell" && "Bundesmodell (Ertragswert)",
          ergebnis.modell === "bodenwert" && "Bodenwertmodell (Baden-Württemberg)",
          ergebnis.modell === "flaeche" && "Flächenmodell"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm mt-1", children: [
          /* @__PURE__ */ jsx("strong", { children: "Hebesatz:" }),
          " ",
          ergebnis.hebesatz,
          "% (Gemeinde-spezifisch)"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Berechnungsweg" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3 text-sm", children: ergebnis.berechnungsweg.map((schritt, index) => /* @__PURE__ */ jsxs("div", { className: `flex justify-between py-2 ${index < ergebnis.berechnungsweg.length - 1 ? "border-b border-gray-100" : "bg-yellow-50 -mx-6 px-6 py-3 rounded-b-xl font-bold text-yellow-900"}`, children: [
        /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: schritt.label }),
        /* @__PURE__ */ jsx("span", { className: index === ergebnis.berechnungsweg.length - 1 ? "text-yellow-900" : "text-gray-900", children: schritt.wert })
      ] }, index)) }),
      ergebnis.modell !== "flaeche" && /* @__PURE__ */ jsxs("div", { className: "mt-4 p-4 bg-gray-50 rounded-xl", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600", children: [
          /* @__PURE__ */ jsx("strong", { children: "Grundsteuermessbetrag:" }),
          " ",
          formatEuro(ergebnis.grundsteuermessbetrag)
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Der Grundsteuermessbetrag wird vom Finanzamt im Bescheid festgesetzt." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert die neue Grundsteuer 2025" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Reform ab 2025:" }),
            " Die neue Grundsteuer gilt bundesweit seit dem 1. Januar 2025"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Drei-Stufen-Berechnung:" }),
            " Grundsteuerwert × Steuermesszahl × Hebesatz = Grundsteuer"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Unterschiedliche Modelle:" }),
            " 11 Länder nutzen das Bundesmodell, 5 Länder eigene Modelle"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Aufkommensneutral:" }),
            " Die Reform soll insgesamt nicht mehr Steuern bringen – aber individuelle Belastungen ändern sich"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Zahlung:" }),
            " Grundsteuer wird vierteljährlich fällig (15.2., 15.5., 15.8., 15.11.)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Umlagefähig:" }),
            " Vermieter können die Grundsteuer auf Mieter umlegen (Nebenkosten)"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-yellow-800 mb-3", children: "🗺️ Die drei Grundsteuer-Modelle" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/70 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-yellow-900 mb-2", children: "📊 Bundesmodell (11 Bundesländer)" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-yellow-800", children: [
            "Berechnung nach ",
            /* @__PURE__ */ jsx("strong", { children: "Ertragswert" }),
            ": Bodenrichtwert, Gebäudealter, Wohnfläche und Mietniveau fließen ein. Wohngrundstücke haben niedrigere Messzahlen (0,31‰) als Gewerbe (0,34‰)."
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-yellow-700 mt-2", children: "Bundesländer: Berlin, Brandenburg, Bremen, Mecklenburg-Vorpommern, NRW, Rheinland-Pfalz, Saarland, Sachsen, Sachsen-Anhalt, Schleswig-Holstein, Thüringen" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/70 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-yellow-900 mb-2", children: "🌍 Bodenwertmodell (Baden-Württemberg)" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-yellow-800", children: [
            "Nur der ",
            /* @__PURE__ */ jsx("strong", { children: "Bodenwert" }),
            " zählt (Bodenrichtwert × Fläche). Gebäude werden nicht bewertet. Einfach, aber benachteiligt Grundstücke in teuren Lagen."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/70 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-yellow-900 mb-2", children: "📏 Flächenmodell (Bayern, Hamburg, Hessen, Niedersachsen)" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-yellow-800", children: [
            "Berechnung nur nach ",
            /* @__PURE__ */ jsx("strong", { children: "Flächen" }),
            ': Grundstücksfläche × 0,04€ + Wohnfläche × 0,50€. Wert und Lage spielen keine Rolle – das ist am "fairsten", aber nicht werteorientiert.'
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
            /* @__PURE__ */ jsx("strong", { children: "Schätzung:" }),
            " Dies ist eine vereinfachte Berechnung. Der tatsächliche Bescheid vom Finanzamt kann abweichen."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Bodenrichtwert prüfen:" }),
            " Ihren exakten Bodenrichtwert finden Sie im ",
            /* @__PURE__ */ jsx("a", { href: "https://www.bodenrichtwerte-boris.de", target: "_blank", rel: "noopener noreferrer", className: "underline", children: "BORIS-Portal" }),
            "."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Hebesatz ändern sich:" }),
            " Viele Gemeinden passen ihre Hebesätze 2025 an – informieren Sie sich bei Ihrer Gemeinde."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Einspruch möglich:" }),
            " Gegen den Grundsteuerwertbescheid können Sie innerhalb eines Monats Einspruch einlegen."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Grundsteuererklärung:" }),
            " Die Erklärung musste bis 31.01.2023 abgegeben werden. Wer nicht abgegeben hat, wurde geschätzt."
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörden" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-yellow-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-yellow-900", children: "Finanzamt (Grundsteuerwert)" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-yellow-700 mt-1", children: "Das Finanzamt am Ort des Grundstücks ermittelt den Grundsteuerwert und erlässt den Grundsteuerwertbescheid sowie den Grundsteuermessbescheid." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-yellow-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-yellow-900", children: "Gemeinde/Stadtkasse (Grundsteuerbescheid)" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-yellow-700 mt-1", children: "Die Gemeinde multipliziert den Messbetrag mit dem Hebesatz und erlässt den endgültigen Grundsteuerbescheid. Hierhin zahlen Sie." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "BORIS-Portal" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.bodenrichtwerte-boris.de",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "Bodenrichtwerte abrufen →"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📱" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "ELSTER" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.elster.de/eportal/start",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "Grundsteuererklärung online →"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Finanzamt-Hotline" }),
            /* @__PURE__ */ jsxs("p", { className: "text-gray-600 mt-1", children: [
              "Bei Fragen zum Grundsteuerwertbescheid wenden Sie sich an Ihr zuständiges Finanzamt. Telefonnummern finden Sie auf dem Bescheid oder unter",
              " ",
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.bzst.de/DE/Behoerden/Finanzaemter/finanzaemter_node.html",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "bzst.de"
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
            href: "https://www.gesetze-im-internet.de/grstg_1973/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Grundsteuergesetz (GrStG) – Gesetze im Internet"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bundesfinanzministerium.de/Web/DE/Themen/Steuern/Steuerarten/Grundsteuer/grundsteuer.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesfinanzministerium – Grundsteuer-Reform"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.grundsteuer.de",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Grundsteuer.de – Offizielle Informationsseite"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bodenrichtwerte-boris.de",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BORIS – Bodenrichtwert-Informationssystem"
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
const $$GrundsteuerRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "Grundsteuer-Rechner 2025 \u2013 Neue Grundsteuer online berechnen";
  const description = "Grundsteuer Rechner 2025: Berechnen Sie Ihre neue Grundsteuer nach Bundesmodell, Bodenwertmodell oder Fl\xE4chenmodell. Mit Hebesatz, Bodenrichtwert & allen 16 Bundesl\xE4ndern.";
  const keywords = "Grundsteuer Rechner, Grundsteuer 2025, neue Grundsteuer berechnen, Grundsteuer Reform, Grundsteuerwert, Grundsteuermessbetrag, Hebesatz, Bodenrichtwert, Grundsteuer Bayern, Grundsteuer NRW, Grundsteuer Baden-W\xFCrttemberg, Fl\xE4chenmodell, Bundesmodell, Bodenwertmodell, Grundsteuer Haus, Grundsteuer Wohnung";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<main class="min-h-screen pb-8"> <!-- Header mit Zur\xFCck-Button --> <header class="bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-yellow-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>\nAlle Rechner\n</a> <div class="flex items-center gap-3"> <span class="text-4xl">\u{1F3E1}</span> <div> <h1 class="text-2xl font-bold">Grundsteuer-Rechner</h1> <p class="text-yellow-100 text-sm">Neue Grundsteuer 2025 berechnen</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ', ' </div> <!-- SEO Content Section --> <div class="max-w-2xl mx-auto px-4 mt-8"> <div class="bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">Die neue Grundsteuer 2025: Was Sie wissen m\xFCssen</h2> <div class="prose prose-sm text-gray-600 space-y-4"> <p>\nSeit dem <strong>1. Januar 2025</strong> gilt die neue Grundsteuer in ganz Deutschland. \n            Nach einem Urteil des Bundesverfassungsgerichts von 2018 musste das veraltete System \n            grundlegend reformiert werden. Mit unserem <strong>Grundsteuer-Rechner</strong> k\xF6nnen \n            Sie Ihre neue Steuerlast online berechnen \u2013 f\xFCr alle 16 Bundesl\xE4nder und alle drei Berechnungsmodelle.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Was ist die Grundsteuer?</h3> <p>\nDie <strong>Grundsteuer</strong> ist eine Steuer auf Grundbesitz, die j\xE4hrlich von den \n            Gemeinden erhoben wird. Sie betrifft:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Grundsteuer A:</strong> Land- und forstwirtschaftliche Grundst\xFCcke</li> <li><strong>Grundsteuer B:</strong> Bebaute und unbebaute Grundst\xFCcke (H\xE4user, Wohnungen, Gewerbe)</li> </ul> <p>\nDie Einnahmen flie\xDFen vollst\xE4ndig an die Gemeinden und finanzieren Schulen, \n            Stra\xDFen, Kinderg\xE4rten und andere kommunale Aufgaben.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Die Grundsteuer-Formel</h3> <p>\nDie Berechnung erfolgt in drei Schritten:\n</p> <div class="bg-gray-100 p-4 rounded-lg my-4"> <p class="font-mono text-center text-lg"> <strong>Grundsteuerwert</strong> \xD7 <strong>Steuermesszahl</strong> \xD7 <strong>Hebesatz</strong> = <strong>Grundsteuer</strong> </p> </div> <ul class="list-disc pl-5 space-y-1"> <li><strong>Grundsteuerwert:</strong> Vom Finanzamt ermittelter Wert des Grundst\xFCcks</li> <li><strong>Steuermesszahl:</strong> Gesetzlich festgelegter Faktor (z.B. 0,31\u2030 f\xFCr Wohngeb\xE4ude)</li> <li><strong>Hebesatz:</strong> Von der Gemeinde festgelegter Multiplikator (z.B. 500%)</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Die drei Grundsteuer-Modelle im Vergleich</h3> <h4 class="font-semibold text-gray-800 mt-4">1. Bundesmodell (11 Bundesl\xE4nder)</h4> <p>\nDas <strong>Bundesmodell</strong> ber\xFCcksichtigt den Bodenwert, die Geb\xE4udeart, das Baujahr \n            und die Wohnfl\xE4che. Es ist das komplexeste Modell, soll aber "wertgerecht" sein.\n</p> <p class="text-sm text-gray-500">\nBundesl\xE4nder: Berlin, Brandenburg, Bremen, Mecklenburg-Vorpommern, Nordrhein-Westfalen, \n            Rheinland-Pfalz, Saarland, Sachsen, Sachsen-Anhalt, Schleswig-Holstein, Th\xFCringen\n</p> <h4 class="font-semibold text-gray-800 mt-4">2. Bodenwertmodell (Baden-W\xFCrttemberg)</h4> <p>\nIn <strong>Baden-W\xFCrttemberg</strong> z\xE4hlt nur der Bodenwert (Bodenrichtwert \xD7 Grundst\xFCcksfl\xE4che). \n            Geb\xE4ude werden nicht bewertet. Einfach, aber teuer f\xFCr Grundst\xFCcke in guten Lagen.\n</p> <h4 class="font-semibold text-gray-800 mt-4">3. Fl\xE4chenmodell (Bayern, Hamburg, Hessen, Niedersachsen)</h4> <p>\nDas <strong>Fl\xE4chenmodell</strong> berechnet nur nach Quadratmetern \u2013 weder Lage noch Wert \n            spielen eine Rolle. Grundst\xFCcksfl\xE4che (0,04\u20AC/m\xB2) + Wohnfl\xE4che (0,50\u20AC/m\xB2) = Grundsteuermessbetrag.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Hebes\xE4tze 2025: Viele Gemeinden passen an</h3> <p>\nDie Reform soll <strong>aufkommensneutral</strong> sein \u2013 die Gesamteinnahmen der Gemeinden \n            sollen gleich bleiben. Daf\xFCr passen viele Gemeinden ihre Hebes\xE4tze an:\n</p> <ul class="list-disc pl-5 space-y-1"> <li>Manche Gemeinden <strong>senken</strong> den Hebesatz (wo Grundsteuerwerte stark gestiegen sind)</li> <li>Andere <strong>erh\xF6hen</strong> ihn (wo Werte gefallen sind)</li> <li>Individuell kann Ihre Grundsteuer trotzdem <strong>steigen oder fallen</strong></li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wann wird die Grundsteuer f\xE4llig?</h3> <p>\nDie Grundsteuer wird <strong>viertelj\xE4hrlich</strong> f\xE4llig, jeweils zur Mitte des Quartals:\n</p> <ul class="list-disc pl-5 space-y-1"> <li>15. Februar</li> <li>15. Mai</li> <li>15. August</li> <li>15. November</li> </ul> <p>\nAlternativ kann bei der Gemeinde eine j\xE4hrliche Zahlung zum 1. Juli beantragt werden.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Grundsteuer bei Vermietung</h3> <p>\nVermieter k\xF6nnen die Grundsteuer als <strong>Betriebskosten auf Mieter umlegen</strong>\n(\xA7 2 Nr. 1 BetrKV). Dies muss im Mietvertrag vereinbart sein. Bei der Steuererkl\xE4rung \n            kann die Grundsteuer als Werbungskosten abgesetzt werden.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Einspruch gegen den Grundsteuerbescheid</h3> <p>\nSind Sie mit Ihrem Bescheid nicht einverstanden? Sie k\xF6nnen <strong>innerhalb eines Monats</strong>\nEinspruch beim Finanzamt einlegen. Gr\xFCnde k\xF6nnen sein:\n</p> <ul class="list-disc pl-5 space-y-1"> <li>Falscher Bodenrichtwert verwendet</li> <li>Wohnfl\xE4che falsch berechnet</li> <li>Baujahr nicht korrekt</li> <li>Grundst\xFCcksgr\xF6\xDFe fehlerhaft</li> </ul> </div> </div> </div> </main>  <script type="application/ld+json">', '<\/script>  <script type="application/ld+json">', "<\/script> "])), maybeRenderHead(), renderComponent($$result2, "GrundsteuerRechner", GrundsteuerRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/GrundsteuerRechner", "client:component-export": "default" }), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Grundsteuer-Rechner 2025",
    "description": description,
    "url": "https://www.deutschland-rechner.de/grundsteuer-rechner",
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
        "name": "Wie berechnet sich die neue Grundsteuer 2025?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Die neue Grundsteuer berechnet sich nach der Formel: Grundsteuerwert \xD7 Steuermesszahl \xD7 Hebesatz = Grundsteuer. Je nach Bundesland gilt das Bundesmodell, Bodenwertmodell oder Fl\xE4chenmodell."
        }
      },
      {
        "@type": "Question",
        "name": "Welches Grundsteuer-Modell gilt in meinem Bundesland?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "11 Bundesl\xE4nder nutzen das Bundesmodell, Baden-W\xFCrttemberg das Bodenwertmodell, und Bayern, Hamburg, Hessen sowie Niedersachsen das Fl\xE4chenmodell."
        }
      },
      {
        "@type": "Question",
        "name": "Wo finde ich meinen Bodenrichtwert?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ihren Bodenrichtwert finden Sie im BORIS-Portal (bodenrichtwerte-boris.de) oder bei den Gutachteraussch\xFCssen Ihrer Kommune. Er ist auch im Grundsteuerwertbescheid des Finanzamts angegeben."
        }
      },
      {
        "@type": "Question",
        "name": "Kann ich gegen den Grundsteuerbescheid Einspruch einlegen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, innerhalb eines Monats nach Erhalt des Bescheids k\xF6nnen Sie Einspruch beim Finanzamt einlegen. Gr\xFCnde k\xF6nnen falsche Bodenrichtwerte, Wohnfl\xE4chen oder Baujahre sein."
        }
      },
      {
        "@type": "Question",
        "name": "Wann wird die Grundsteuer f\xE4llig?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Die Grundsteuer wird viertelj\xE4hrlich f\xE4llig: am 15. Februar, 15. Mai, 15. August und 15. November. Eine j\xE4hrliche Zahlung zum 1. Juli ist auf Antrag m\xF6glich."
        }
      }
    ]
  }))) })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/grundsteuer-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/grundsteuer-rechner.astro";
const $$url = "/grundsteuer-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$GrundsteuerRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
