/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DmT1JwUR.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const ABGELTUNGSTEUER_SATZ = 0.25;
const SOLI_SATZ = 0.055;
const SPARERPAUSCHBETRAG = {
  single: 1e3,
  verheiratet: 2e3
};
const KIRCHENSTEUER_SAETZE = [
  { wert: 0, label: "Keine Kirchensteuer", faktor: 0 },
  { wert: 0.08, label: "8% (Bayern, Baden-Württemberg)", faktor: 0.08 },
  { wert: 0.09, label: "9% (alle anderen Bundesländer)", faktor: 0.09 }
];
const ASSET_TYPEN = [
  {
    id: "aktien",
    label: "Aktien / ETFs / Fonds",
    icon: "📈",
    beschreibung: "25% Abgeltungsteuer auf Gewinne",
    steuerpflichtig: true,
    teilfreistellung: 0
    // Für Direktanlage keine Teilfreistellung
  },
  {
    id: "aktienfonds",
    label: "Aktienfonds (mind. 51% Aktien)",
    icon: "📊",
    beschreibung: "30% Teilfreistellung auf Gewinne",
    steuerpflichtig: true,
    teilfreistellung: 0.3
  },
  {
    id: "mischfonds",
    label: "Mischfonds (mind. 25% Aktien)",
    icon: "📉",
    beschreibung: "15% Teilfreistellung auf Gewinne",
    steuerpflichtig: true,
    teilfreistellung: 0.15
  },
  {
    id: "immofonds",
    label: "Immobilienfonds (offen)",
    icon: "🏠",
    beschreibung: "60% Teilfreistellung auf Gewinne",
    steuerpflichtig: true,
    teilfreistellung: 0.6
  },
  {
    id: "anleihen",
    label: "Anleihen / Zinsen",
    icon: "📄",
    beschreibung: "25% Abgeltungsteuer auf Erträge",
    steuerpflichtig: true,
    teilfreistellung: 0
  },
  {
    id: "dividenden",
    label: "Dividenden (deutsche Aktien)",
    icon: "💰",
    beschreibung: "25% Abgeltungsteuer auf Dividenden",
    steuerpflichtig: true,
    teilfreistellung: 0
  },
  {
    id: "krypto",
    label: "Kryptowährungen",
    icon: "₿",
    beschreibung: "Steuerfrei nach 1 Jahr Haltefrist",
    steuerpflichtig: true,
    teilfreistellung: 0,
    krypto: true
  }
];
function KapitalertragsteuerRechner() {
  const [bruttoGewinn, setBruttoGewinn] = useState(5e3);
  const [verluste, setVerluste] = useState(0);
  const [bereitsBezahlt, setBereitsBezahlt] = useState(0);
  const [assetTyp, setAssetTyp] = useState("aktien");
  const [haltefristUeber1Jahr, setHaltefristUeber1Jahr] = useState(false);
  const [verheiratet, setVerheiratet] = useState(false);
  const [kirchensteuerSatz, setKirchensteuerSatz] = useState(0);
  const [freistellungsauftrag, setFreistellungsauftrag] = useState(0);
  const [guenstigerpruefung, setGuenstigerpruefung] = useState(false);
  const [persoenlichSteuer, setPersoenlichSteuer] = useState(25);
  const selectedAsset = ASSET_TYPEN.find((a) => a.id === assetTyp) || ASSET_TYPEN[0];
  const sparerpauschbetrag = verheiratet ? SPARERPAUSCHBETRAG.verheiratet : SPARERPAUSCHBETRAG.single;
  const ergebnis = useMemo(() => {
    if (selectedAsset.krypto && haltefristUeber1Jahr) {
      return {
        bruttoGewinn,
        teilfreistellung: 0,
        steuerpflichtiger: bruttoGewinn,
        verlustverrechnung: 0,
        nachVerlust: bruttoGewinn,
        sparerpauschbetrag: 0,
        zuVersteuern: 0,
        abgeltungsteuer: 0,
        soli: 0,
        kirchensteuer: 0,
        steuerGesamt: 0,
        bereitsGezahlt: 0,
        nachzahlung: 0,
        nettoGewinn: bruttoGewinn,
        effektiverSteuersatz: 0,
        kryptoSteuerfrei: true
      };
    }
    const teilfreistellungBetrag = bruttoGewinn * selectedAsset.teilfreistellung;
    const nachTeilfreistellung = bruttoGewinn - teilfreistellungBetrag;
    const verlustverrechnung = Math.min(verluste, nachTeilfreistellung);
    const nachVerlust = Math.max(0, nachTeilfreistellung - verlustverrechnung);
    const verfuegbarerFreibetrag = Math.max(0, sparerpauschbetrag - freistellungsauftrag);
    const genutzterFreibetrag = Math.min(verfuegbarerFreibetrag, nachVerlust);
    const zuVersteuern = Math.max(0, nachVerlust - genutzterFreibetrag);
    let abgeltungsteuer;
    let soli;
    let kirchensteuer;
    if (guenstigerpruefung && persoenlichSteuer < 25) {
      abgeltungsteuer = Math.round(zuVersteuern * (persoenlichSteuer / 100));
      soli = Math.round(abgeltungsteuer * SOLI_SATZ);
      kirchensteuer = Math.round(abgeltungsteuer * kirchensteuerSatz);
    } else {
      if (kirchensteuerSatz > 0) {
        const modifizierterSatz = ABGELTUNGSTEUER_SATZ / (1 + kirchensteuerSatz);
        abgeltungsteuer = Math.round(zuVersteuern * modifizierterSatz);
        kirchensteuer = Math.round(abgeltungsteuer * kirchensteuerSatz);
      } else {
        abgeltungsteuer = Math.round(zuVersteuern * ABGELTUNGSTEUER_SATZ);
        kirchensteuer = 0;
      }
      soli = Math.round(abgeltungsteuer * SOLI_SATZ);
    }
    const steuerGesamt = abgeltungsteuer + soli + kirchensteuer;
    const nachzahlung = Math.max(0, steuerGesamt - bereitsBezahlt);
    const erstattung = Math.max(0, bereitsBezahlt - steuerGesamt);
    const nettoGewinn = bruttoGewinn - steuerGesamt;
    const effektiverSteuersatz = bruttoGewinn > 0 ? steuerGesamt / bruttoGewinn * 100 : 0;
    return {
      bruttoGewinn,
      teilfreistellung: Math.round(teilfreistellungBetrag),
      steuerpflichtiger: Math.round(nachTeilfreistellung),
      verlustverrechnung: Math.round(verlustverrechnung),
      nachVerlust: Math.round(nachVerlust),
      sparerpauschbetrag: Math.round(genutzterFreibetrag),
      zuVersteuern: Math.round(zuVersteuern),
      abgeltungsteuer,
      soli,
      kirchensteuer,
      steuerGesamt,
      bereitsGezahlt: bereitsBezahlt,
      nachzahlung,
      erstattung,
      nettoGewinn: Math.round(nettoGewinn),
      effektiverSteuersatz,
      kryptoSteuerfrei: false
    };
  }, [
    bruttoGewinn,
    verluste,
    bereitsBezahlt,
    assetTyp,
    selectedAsset,
    haltefristUeber1Jahr,
    verheiratet,
    kirchensteuerSatz,
    freistellungsauftrag,
    guenstigerpruefung,
    persoenlichSteuer,
    sparerpauschbetrag
  ]);
  const formatEuro = (n) => n.toLocaleString("de-DE") + " €";
  const formatProzent = (n) => n.toFixed(2).replace(".", ",") + " %";
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("h3", { className: "font-bold text-gray-800 mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📊" }),
        " Art der Kapitalerträge"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: ASSET_TYPEN.map((asset) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setAssetTyp(asset.id),
          className: `flex items-start gap-3 p-4 rounded-xl text-left transition-all ${assetTyp === asset.id ? "bg-blue-500 text-white shadow-lg ring-2 ring-blue-300" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
          children: [
            /* @__PURE__ */ jsx("span", { className: "text-2xl", children: asset.icon }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: asset.label }),
              /* @__PURE__ */ jsx("p", { className: `text-xs mt-1 ${assetTyp === asset.id ? "text-blue-100" : "text-gray-500"}`, children: asset.beschreibung })
            ] })
          ]
        },
        asset.id
      )) }),
      selectedAsset.krypto && /* @__PURE__ */ jsx("div", { className: "mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            checked: haltefristUeber1Jahr,
            onChange: (e) => setHaltefristUeber1Jahr(e.target.checked),
            className: "w-5 h-5 rounded border-yellow-400 text-yellow-600 focus:ring-yellow-500"
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-yellow-800", children: "Haltefrist über 1 Jahr" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-yellow-600", children: "Krypto-Gewinne sind nach 1 Jahr Haltefrist komplett steuerfrei!" })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("h3", { className: "font-bold text-gray-800 mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xl", children: "💰" }),
        " Kapitalerträge eingeben"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Brutto-Gewinn (vor Steuern)" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: bruttoGewinn,
                onChange: (e) => setBruttoGewinn(Math.max(0, Number(e.target.value))),
                className: "w-full text-xl font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
                min: "0",
                step: "100"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400", children: "€" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              min: "0",
              max: "100000",
              step: "500",
              value: bruttoGewinn,
              onChange: (e) => setBruttoGewinn(Number(e.target.value)),
              className: "w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Verluste zur Verrechnung" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: verluste,
                  onChange: (e) => setVerluste(Math.max(0, Number(e.target.value))),
                  className: "w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
                  min: "0"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm", children: "€" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Verlusttopf aus Vorjahren" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Bereits einbehaltene Steuer" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: bereitsBezahlt,
                  onChange: (e) => setBereitsBezahlt(Math.max(0, Number(e.target.value))),
                  className: "w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
                  min: "0"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm", children: "€" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Z.B. von Bank einbehalten" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("h3", { className: "font-bold text-gray-800 mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xl", children: "👤" }),
        " Persönliche Situation"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Familienstand" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setVerheiratet(false),
                className: `py-3 px-4 rounded-xl font-medium transition-all ${!verheiratet ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
                children: "Ledig / Einzeln"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setVerheiratet(true),
                className: `py-3 px-4 rounded-xl font-medium transition-all ${verheiratet ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
                children: "Verheiratet"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Kirchensteuer" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                value: kirchensteuerSatz,
                onChange: (e) => setKirchensteuerSatz(Number(e.target.value)),
                className: "w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
                children: KIRCHENSTEUER_SAETZE.map((k) => /* @__PURE__ */ jsx("option", { value: k.wert, children: k.label }, k.wert))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Freistellungsauftrag (genutzt)" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: freistellungsauftrag,
                  onChange: (e) => setFreistellungsauftrag(Math.min(sparerpauschbetrag, Math.max(0, Number(e.target.value)))),
                  className: "w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
                  min: "0",
                  max: sparerpauschbetrag
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm", children: "€" })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-400 mt-1", children: [
              "Max. ",
              formatEuro(sparerpauschbetrag),
              " Sparerpauschbetrag"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-blue-50 border border-blue-200 rounded-xl", children: [
          /* @__PURE__ */ jsxs("label", { className: "flex items-start gap-3 cursor-pointer", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: guenstigerpruefung,
                onChange: (e) => setGuenstigerpruefung(e.target.checked),
                className: "w-5 h-5 mt-0.5 rounded border-blue-400 text-blue-600 focus:ring-blue-500"
              }
            ),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium text-blue-800", children: "Günstigerprüfung beantragen" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-600 mt-1", children: "Falls dein persönlicher Steuersatz unter 25% liegt, kannst du den niedrigeren Satz beantragen" })
            ] })
          ] }),
          guenstigerpruefung && /* @__PURE__ */ jsxs("div", { className: "mt-3 pt-3 border-t border-blue-200", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-blue-700 mb-1", children: "Dein persönlicher Steuersatz (ca.)" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "range",
                  min: "0",
                  max: "45",
                  step: "1",
                  value: persoenlichSteuer,
                  onChange: (e) => setPersoenlichSteuer(Number(e.target.value)),
                  className: "flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                }
              ),
              /* @__PURE__ */ jsxs("span", { className: "w-16 text-center font-bold text-blue-800", children: [
                persoenlichSteuer,
                "%"
              ] })
            ] }),
            persoenlichSteuer < 25 ? /* @__PURE__ */ jsxs("p", { className: "text-sm text-green-600 mt-2", children: [
              "✓ Günstigerprüfung lohnt sich! Du sparst ",
              formatProzent(25 - persoenlichSteuer),
              " Steuern."
            ] }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mt-2", children: "Die Abgeltungsteuer (25%) ist günstiger. Kein Antrag nötig." })
          ] })
        ] })
      ] })
    ] }),
    ergebnis.kryptoSteuerfrei ? /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white mb-6", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("span", { className: "text-6xl mb-4 block", children: "🎉" }),
      /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold mb-2", children: "Steuerfrei!" }),
      /* @__PURE__ */ jsxs("p", { className: "text-green-100 mb-4", children: [
        "Dein Krypto-Gewinn von ",
        formatEuro(bruttoGewinn),
        " ist nach über 1 Jahr Haltefrist komplett steuerfrei."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white/20 rounded-xl p-4", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm text-green-100", children: "Dein Netto-Gewinn" }),
        /* @__PURE__ */ jsx("span", { className: "text-4xl font-bold block", children: formatEuro(bruttoGewinn) })
      ] })
    ] }) }) : /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-blue-200 mb-1", children: "Kapitalertragsteuer" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-baseline gap-2", children: /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuro(ergebnis.steuerGesamt) }) }),
        /* @__PURE__ */ jsx("p", { className: "text-blue-200 text-sm mt-1", children: "Gesamtsteuer auf Kapitalerträge" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-3 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-blue-200 text-xs block", children: "Effektiver Satz" }),
          /* @__PURE__ */ jsx("span", { className: "text-xl font-bold", children: formatProzent(ergebnis.effektiverSteuersatz) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-3 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-blue-200 text-xs block", children: "Netto-Gewinn" }),
          /* @__PURE__ */ jsx("span", { className: "text-xl font-bold", children: formatEuro(ergebnis.nettoGewinn) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-3 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-blue-200 text-xs block", children: ergebnis.nachzahlung > 0 ? "Nachzahlung" : "Erstattung" }),
          /* @__PURE__ */ jsx("span", { className: `text-xl font-bold ${ergebnis.nachzahlung > 0 ? "text-yellow-300" : "text-green-300"}`, children: formatEuro(ergebnis.nachzahlung > 0 ? ergebnis.nachzahlung : ergebnis.erstattung || 0) })
        ] })
      ] })
    ] }),
    !ergebnis.kryptoSteuerfrei && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Berechnung im Detail" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "Brutto-Kapitalertrag" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.bruttoGewinn) })
        ] }),
        ergebnis.teilfreistellung > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-green-600", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "Teilfreistellung (",
            Math.round(selectedAsset.teilfreistellung * 100),
            "%)"
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "− ",
            formatEuro(ergebnis.teilfreistellung)
          ] })
        ] }),
        ergebnis.teilfreistellung > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-2 bg-gray-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Steuerpflichtiger Ertrag" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-800", children: formatEuro(ergebnis.steuerpflichtiger) })
        ] }),
        ergebnis.verlustverrechnung > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-orange-600", children: [
          /* @__PURE__ */ jsx("span", { children: "Verlustverrechnung" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "− ",
            formatEuro(ergebnis.verlustverrechnung)
          ] })
        ] }),
        ergebnis.sparerpauschbetrag > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-green-600", children: [
          /* @__PURE__ */ jsx("span", { children: "Sparerpauschbetrag" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "− ",
            formatEuro(ergebnis.sparerpauschbetrag)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-2 border-b border-gray-200 bg-blue-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-800", children: "Zu versteuern" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-blue-600", children: formatEuro(ergebnis.zuVersteuern) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-red-600 font-medium mb-2", children: [
            /* @__PURE__ */ jsx("span", { children: "Steuern" }),
            /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.steuerGesamt) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "pl-4 space-y-1 text-sm text-gray-500", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: guenstigerpruefung && persoenlichSteuer < 25 ? `Einkommensteuer (${persoenlichSteuer}%)` : "Abgeltungsteuer (25%)" }),
              /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.abgeltungsteuer) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Solidaritätszuschlag (5,5%)" }),
              /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.soli) })
            ] }),
            ergebnis.kirchensteuer > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Kirchensteuer" }),
              /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.kirchensteuer) })
            ] })
          ] })
        ] }),
        bereitsBezahlt > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-green-600", children: [
          /* @__PURE__ */ jsx("span", { children: "Bereits einbehalten/gezahlt" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "− ",
            formatEuro(bereitsBezahlt)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-3 border-t-2 border-green-200 bg-green-50 -mx-6 px-6 rounded-b-2xl", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold text-green-800 text-lg", children: "Netto-Gewinn" }),
            /* @__PURE__ */ jsx("span", { className: "text-green-600 text-sm block", children: "nach Steuern" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-green-600 text-2xl", children: formatEuro(ergebnis.nettoGewinn) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-amber-800 mb-3", children: "💡 So funktioniert die Kapitalertragsteuer" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-amber-700", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "📈" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Abgeltungsteuer" }),
            ": Pauschale 25% auf alle Kapitalerträge"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "➕" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Solidaritätszuschlag" }),
            ": 5,5% auf die Abgeltungsteuer"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "⛪" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Kirchensteuer" }),
            ": Falls Mitglied, zusätzlich 8-9%"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "🎁" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Sparerpauschbetrag" }),
            ": ",
            formatEuro(SPARERPAUSCHBETRAG.single),
            " (Ledig) / ",
            formatEuro(SPARERPAUSCHBETRAG.verheiratet),
            " (Verheiratet) steuerfrei"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "📊" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Teilfreistellung" }),
            ": Aktienfonds 30%, Mischfonds 15%, Immofonds 60% steuerfrei"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "₿" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Krypto-Sonderregel" }),
            ": Nach 1 Jahr Haltefrist komplett steuerfrei!"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "⚠️ Wichtige Hinweise" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Freistellungsauftrag" }),
            ": Erteile deiner Bank einen Freistellungsauftrag bis ",
            formatEuro(sparerpauschbetrag),
            ", um Steuern zu sparen"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Verlustverrechnung" }),
            ": Aktien-Verluste können nur mit Aktien-Gewinnen verrechnet werden"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Günstigerprüfung" }),
            ": Bei niedrigem Einkommen kann der persönliche Steuersatz günstiger sein"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Quellensteuer" }),
            ": Ausländische Dividenden können anrechenbar sein (max. 15%)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "⚠️" }),
          /* @__PURE__ */ jsx("span", { children: "Dieser Rechner dient zur Orientierung – für die Steuererklärung konsultiere einen Steuerberater" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörden & Anlaufstellen" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📋" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Finanzamt" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Anlage KAP zur Steuererklärung" }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "https://www.elster.de",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "text-blue-600 hover:underline",
                children: "ELSTER Online →"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🏦" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Depotbank" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Freistellungsauftrag erteilen" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-xs", children: "Bei deiner Bank/Broker" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Bürgertelefon BMF" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Fragen zur Abgeltungsteuer" }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "tel:03018-333-0",
                className: "text-blue-600 hover:underline",
                children: "030 18 333-0 →"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "💼" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Steuerberater" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Komplexe Sachverhalte" }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "https://www.bstbk.de",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "text-blue-600 hover:underline",
                children: "Steuerberaterkammer →"
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gray-50 rounded-xl", children: [
      /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-gray-500 uppercase mb-2", children: "Quellen & Rechtsgrundlagen" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/estg/__20.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "§20 EStG – Einkünfte aus Kapitalvermögen"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/estg/__32d.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "§32d EStG – Abgeltungsteuer"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/invstg_2018/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "InvStG – Investmentsteuergesetz (Teilfreistellung)"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bundesfinanzministerium.de/Content/DE/FAQ/Steuern/Kapitalertragsteuer/kapitalertragsteuer.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BMF – FAQ zur Kapitalertragsteuer"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bzst.de/DE/Privatpersonen/Kapitalertraege/kapitalertraege_node.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BZSt – Kapitalerträge & Kirchensteuer"
          }
        )
      ] })
    ] })
  ] });
}

const $$KapitalertragsteuerRechner = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Kapitalertragsteuer-Rechner 2026 \u2013 Abgeltungsteuer auf Aktien, ETFs & Krypto berechnen", "description": "Kapitalertragsteuer-Rechner 2026: Berechne die Abgeltungsteuer (25%) auf Aktien, ETFs, Dividenden & Krypto. Mit Sparerpauschbetrag 1.000\u20AC, Teilfreistellung & G\xFCnstigerpr\xFCfung.", "keywords": "Kapitalertragsteuer Rechner 2026, Abgeltungsteuer Rechner, Aktien Steuer berechnen, ETF Steuer, Dividenden Steuer, Krypto Steuer, Kapitalertr\xE4ge versteuern, Sparerpauschbetrag 1000 Euro, Teilfreistellung Fonds, G\xFCnstigerpr\xFCfung Kapitalertr\xE4ge, Freistellungsauftrag, Anlage KAP" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen pb-8"> <!-- Header mit Zurück-Button --> <header class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>
Alle Rechner
</a> <div class="flex items-center gap-3"> <span class="text-4xl">📈</span> <div> <h1 class="text-2xl font-bold">Kapitalertragsteuer-Rechner</h1> <p class="text-blue-200 text-sm">Abgeltungsteuer 2026 – Aktien, ETFs, Krypto</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ${renderComponent($$result2, "KapitalertragsteuerRechner", KapitalertragsteuerRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/KapitalertragsteuerRechner", "client:component-export": "default" })} </div> </main> ` })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/kapitalertragsteuer-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/kapitalertragsteuer-rechner.astro";
const $$url = "/kapitalertragsteuer-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$KapitalertragsteuerRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
