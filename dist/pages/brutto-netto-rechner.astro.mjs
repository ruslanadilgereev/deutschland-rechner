/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DmT1JwUR.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const TARIF_2026 = {
  grundfreibetrag: 12348,
  // §32a Abs. 1 Nr. 1 EStG
  zone2Ende: 17799,
  // Progressionszone 1 endet
  zone3Ende: 69878,
  // Progressionszone 2 endet  
  zone4Ende: 277825,
  // Proportionalzone 42% endet
  // Koeffizienten aus BMF-PAP 2026
  zone2Y1: 933.52,
  // (933,52 * y + 1400) * y
  zone2Y2: 1400,
  zone3Z1: 176.64,
  // (176,64 * z + 2397) * z + 1015.13
  zone3Z2: 2397,
  zone3Konst: 1015.13,
  zone4Faktor: 0.42,
  // 42% Spitzensteuersatz
  zone4Abzug: 10911.92,
  zone5Faktor: 0.45,
  // 45% Reichensteuer
  zone5Abzug: 18918.79
};
const FREIBETRAEGE_2026 = {
  arbeitnehmerPauschbetrag: 1230,
  // §9a Nr. 1 EStG
  sonderausgabenPauschbetrag: 36,
  // §10c EStG
  entlastungsbetragAlleinerziehende: 4260,
  // §24b EStG
  entlastungsbetragProWeiteresKind: 240
  // §24b Abs. 2 EStG
};
const SOZIALVERSICHERUNG_2026 = {
  rentenversicherung: 0.093,
  // 9,3% AN-Anteil (18,6% gesamt)
  arbeitslosenversicherung: 0.013,
  // 1,3% AN-Anteil (2,6% gesamt)
  pflegeversicherung: {
    basis: 0.018,
    // 1,8% AN-Anteil (3,6% gesamt ab 01.07.2025)
    kinderlosZuschlag: 6e-3
    // +0,6% für Kinderlose ab 23 Jahren
  },
  krankenversicherung: {
    basis: 0.073,
    // 7,3% AN-Anteil (14,6% gesamt)
    zusatzbeitrag: 0.0125
    // 1,25% durchschn. Zusatzbeitrag 2026 (AN-Anteil)
  }
};
const BBG_2026 = {
  renteArbeitslos: 96600,
  // RV/AV bundesweit einheitlich
  krankenPflege: 66150
  // KV/PV
};
const STEUERKLASSEN = [
  { wert: 1, label: "Steuerklasse 1", beschreibung: "Ledig / Geschieden" },
  { wert: 2, label: "Steuerklasse 2", beschreibung: "Alleinerziehend" },
  { wert: 3, label: "Steuerklasse 3", beschreibung: "Verheiratet (höheres Einkommen)" },
  { wert: 4, label: "Steuerklasse 4", beschreibung: "Verheiratet (gleiches Einkommen)" },
  { wert: 5, label: "Steuerklasse 5", beschreibung: "Verheiratet (geringeres Einkommen)" },
  { wert: 6, label: "Steuerklasse 6", beschreibung: "Zweitjob / Nebenjob" }
];
function berechneEStTarif2026(zvE) {
  if (zvE <= 0) return 0;
  const { grundfreibetrag, zone2Ende, zone3Ende, zone4Ende } = TARIF_2026;
  if (zvE <= grundfreibetrag) {
    return 0;
  }
  if (zvE <= zone2Ende) {
    const y = (zvE - grundfreibetrag) / 1e4;
    const steuer2 = (TARIF_2026.zone2Y1 * y + TARIF_2026.zone2Y2) * y;
    return Math.floor(steuer2);
  }
  if (zvE <= zone3Ende) {
    const z = (zvE - zone2Ende) / 1e4;
    const steuer2 = (TARIF_2026.zone3Z1 * z + TARIF_2026.zone3Z2) * z + TARIF_2026.zone3Konst;
    return Math.floor(steuer2);
  }
  if (zvE <= zone4Ende) {
    const steuer2 = TARIF_2026.zone4Faktor * zvE - TARIF_2026.zone4Abzug;
    return Math.floor(steuer2);
  }
  const steuer = TARIF_2026.zone5Faktor * zvE - TARIF_2026.zone5Abzug;
  return Math.floor(steuer);
}
function berechneLohnsteuer(jahresBrutto, steuerklasse, anzahlKinder = 0) {
  const {
    arbeitnehmerPauschbetrag,
    sonderausgabenPauschbetrag,
    entlastungsbetragAlleinerziehende,
    entlastungsbetragProWeiteresKind
  } = FREIBETRAEGE_2026;
  const vorsorgepauschale = Math.min(jahresBrutto * 0.12, 3e3);
  let zvE = jahresBrutto;
  let steuer = 0;
  switch (steuerklasse) {
    case 1:
      zvE = Math.max(0, jahresBrutto - vorsorgepauschale - arbeitnehmerPauschbetrag - sonderausgabenPauschbetrag);
      steuer = berechneEStTarif2026(zvE);
      break;
    case 2:
      const entlastung = entlastungsbetragAlleinerziehende + Math.max(0, anzahlKinder - 1) * entlastungsbetragProWeiteresKind;
      zvE = Math.max(0, jahresBrutto - vorsorgepauschale - arbeitnehmerPauschbetrag - sonderausgabenPauschbetrag - entlastung);
      steuer = berechneEStTarif2026(zvE);
      break;
    case 3:
      zvE = Math.max(0, jahresBrutto - vorsorgepauschale - arbeitnehmerPauschbetrag - sonderausgabenPauschbetrag);
      steuer = berechneEStTarif2026(zvE / 2) * 2;
      break;
    case 4:
      zvE = Math.max(0, jahresBrutto - vorsorgepauschale - arbeitnehmerPauschbetrag - sonderausgabenPauschbetrag);
      steuer = berechneEStTarif2026(zvE);
      break;
    case 5:
      zvE = Math.max(0, jahresBrutto - vorsorgepauschale);
      steuer = berechneEStTarif2026SK5(zvE);
      break;
    case 6:
      zvE = jahresBrutto;
      steuer = berechneEStTarif2026SK6(zvE);
      break;
  }
  return Math.max(0, Math.round(steuer));
}
function berechneEStTarif2026SK5(zvE) {
  if (zvE <= 0) return 0;
  const { zone2Ende, zone3Ende, zone4Ende } = TARIF_2026;
  if (zvE <= zone2Ende) {
    const y = zvE / 1e4;
    return Math.floor((TARIF_2026.zone2Y1 * y + TARIF_2026.zone2Y2) * y);
  }
  if (zvE <= zone3Ende) {
    const z = (zvE - zone2Ende) / 1e4;
    const basisSteuer = (TARIF_2026.zone2Y1 * (zone2Ende / 1e4) + TARIF_2026.zone2Y2) * (zone2Ende / 1e4);
    return Math.floor(basisSteuer + (TARIF_2026.zone3Z1 * z + TARIF_2026.zone3Z2) * z);
  }
  if (zvE <= zone4Ende) {
    return Math.floor(TARIF_2026.zone4Faktor * zvE - 8e3);
  }
  return Math.floor(TARIF_2026.zone5Faktor * zvE - 16e3);
}
function berechneEStTarif2026SK6(zvE) {
  if (zvE <= 0) return 0;
  const { zone2Ende, zone3Ende, zone4Ende } = TARIF_2026;
  if (zvE <= zone2Ende) {
    const y = zvE / 1e4;
    return Math.floor((TARIF_2026.zone2Y1 * y + TARIF_2026.zone2Y2 * 1.1) * y);
  }
  if (zvE <= zone3Ende) {
    const z = (zvE - zone2Ende) / 1e4;
    const basisSteuer = (TARIF_2026.zone2Y1 * (zone2Ende / 1e4) + TARIF_2026.zone2Y2 * 1.1) * (zone2Ende / 1e4);
    return Math.floor(basisSteuer + (TARIF_2026.zone3Z1 * z + TARIF_2026.zone3Z2) * z);
  }
  if (zvE <= zone4Ende) {
    return Math.floor(TARIF_2026.zone4Faktor * zvE - 7e3);
  }
  return Math.floor(TARIF_2026.zone5Faktor * zvE - 15e3);
}
function berechneSoli(lohnsteuerJahr, steuerklasse) {
  const freigrenze = steuerklasse === 3 ? 36260 : 18130;
  if (lohnsteuerJahr <= freigrenze) {
    return 0;
  }
  const ueberFreigrenze = lohnsteuerJahr - freigrenze;
  const soliMilderung = ueberFreigrenze * 0.119;
  const soliVoll = lohnsteuerJahr * 0.055;
  return Math.round(Math.min(soliMilderung, soliVoll));
}
function berechneKirchensteuer(lohnsteuerJahr, bundesland) {
  const satz = ["BY", "BW"].includes(bundesland) ? 0.08 : 0.09;
  return Math.round(lohnsteuerJahr * satz);
}
function BruttoNettoRechner() {
  const [bruttoMonat, setBruttoMonat] = useState(4e3);
  const [steuerklasse, setSteuerklasse] = useState(1);
  const [kinderlos, setKinderlos] = useState(true);
  const [kirchensteuer, setKirchensteuer] = useState(false);
  const [bundesland, setBundesland] = useState("NW");
  const [anzahlKinder, setAnzahlKinder] = useState(0);
  const ergebnis = useMemo(() => {
    const bruttoJahr = bruttoMonat * 12;
    const rvBrutto = Math.min(bruttoJahr, BBG_2026.renteArbeitslos);
    const kvBrutto = Math.min(bruttoJahr, BBG_2026.krankenPflege);
    const rv = rvBrutto * SOZIALVERSICHERUNG_2026.rentenversicherung;
    const av = rvBrutto * SOZIALVERSICHERUNG_2026.arbeitslosenversicherung;
    let pvSatz = SOZIALVERSICHERUNG_2026.pflegeversicherung.basis;
    if (kinderlos) {
      pvSatz += SOZIALVERSICHERUNG_2026.pflegeversicherung.kinderlosZuschlag;
    }
    const pv = kvBrutto * pvSatz;
    const kv = kvBrutto * (SOZIALVERSICHERUNG_2026.krankenversicherung.basis + SOZIALVERSICHERUNG_2026.krankenversicherung.zusatzbeitrag);
    const svGesamt = rv + av + pv + kv;
    const lohnsteuerJahr = berechneLohnsteuer(bruttoJahr, steuerklasse, anzahlKinder);
    const soliJahr = berechneSoli(lohnsteuerJahr, steuerklasse);
    const kistJahr = kirchensteuer ? berechneKirchensteuer(lohnsteuerJahr, bundesland) : 0;
    const steuernGesamt = lohnsteuerJahr + soliJahr + kistJahr;
    const nettoJahr = bruttoJahr - svGesamt - steuernGesamt;
    const nettoMonat = nettoJahr / 12;
    return {
      bruttoJahr,
      nettoJahr: Math.round(nettoJahr),
      nettoMonat: Math.round(nettoMonat),
      // Monatliche Abzüge
      rv: Math.round(rv / 12),
      av: Math.round(av / 12),
      pv: Math.round(pv / 12),
      kv: Math.round(kv / 12),
      svGesamt: Math.round(svGesamt / 12),
      lohnsteuer: Math.round(lohnsteuerJahr / 12),
      soli: Math.round(soliJahr / 12),
      kist: Math.round(kistJahr / 12),
      steuernGesamt: Math.round(steuernGesamt / 12),
      abzuegeGesamt: Math.round((svGesamt + steuernGesamt) / 12),
      // Für Info
      lohnsteuerJahr,
      zvE: bruttoJahr - Math.min(bruttoJahr * 0.12, 3e3) - (steuerklasse <= 4 ? FREIBETRAEGE_2026.arbeitnehmerPauschbetrag + FREIBETRAEGE_2026.sonderausgabenPauschbetrag : 0)
    };
  }, [bruttoMonat, steuerklasse, kinderlos, kirchensteuer, bundesland, anzahlKinder]);
  const formatEuro = (n) => n.toLocaleString("de-DE") + " €";
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Brutto-Monatsgehalt" }) }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: bruttoMonat,
              onChange: (e) => setBruttoMonat(Math.max(0, Number(e.target.value))),
              className: "w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
              min: "0",
              step: "100"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl", children: "€" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            min: "0",
            max: "15000",
            step: "100",
            value: bruttoMonat,
            onChange: (e) => setBruttoMonat(Number(e.target.value)),
            className: "w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "0 €" }),
          /* @__PURE__ */ jsx("span", { children: "15.000 €" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Steuerklasse" }) }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 sm:grid-cols-6 gap-2", children: STEUERKLASSEN.map((sk) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setSteuerklasse(sk.wert),
            className: `py-3 px-2 rounded-xl font-bold text-lg transition-all ${steuerklasse === sk.wert ? "bg-blue-500 text-white shadow-lg scale-105" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            title: sk.beschreibung,
            children: sk.wert
          },
          sk.wert
        )) }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mt-2 text-center", children: STEUERKLASSEN.find((sk) => sk.wert === steuerklasse)?.beschreibung })
      ] }),
      steuerklasse === 2 && /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Anzahl Kinder" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setAnzahlKinder(Math.max(1, anzahlKinder - 1)),
              className: "w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 font-bold",
              children: "−"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold w-12 text-center", children: anzahlKinder || 1 }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setAnzahlKinder(Math.min(10, anzahlKinder + 1)),
              className: "w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 font-bold",
              children: "+"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: kinderlos,
              onChange: (e) => setKinderlos(e.target.checked),
              className: "w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
            }
          ),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "Kinderlos (ab 23)" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "+0,6% Pflegeversicherung" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: kirchensteuer,
              onChange: (e) => setKirchensteuer(e.target.checked),
              className: "w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
            }
          ),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "Kirchensteuer" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "8-9% der Lohnsteuer" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-green-100 mb-1", children: "Dein Netto" }),
      /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuro(ergebnis.nettoMonat) }),
        /* @__PURE__ */ jsx("span", { className: "text-xl text-green-200", children: "/ Monat" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsx("span", { className: "text-green-100", children: "Pro Jahr" }),
        /* @__PURE__ */ jsx("span", { className: "text-xl font-bold", children: formatEuro(ergebnis.nettoJahr) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Abzüge im Detail" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "Brutto" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(bruttoMonat) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-red-600 font-medium mb-2", children: [
            /* @__PURE__ */ jsx("span", { children: "Sozialversicherung" }),
            /* @__PURE__ */ jsxs("span", { children: [
              "− ",
              formatEuro(ergebnis.svGesamt)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "pl-4 space-y-1 text-sm text-gray-500", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Rentenversicherung (9,3%)" }),
              /* @__PURE__ */ jsxs("span", { children: [
                "− ",
                formatEuro(ergebnis.rv)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Krankenversicherung (~8,55%)" }),
              /* @__PURE__ */ jsxs("span", { children: [
                "− ",
                formatEuro(ergebnis.kv)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxs("span", { children: [
                "Pflegeversicherung (",
                kinderlos ? "2,4%" : "1,8%",
                ")"
              ] }),
              /* @__PURE__ */ jsxs("span", { children: [
                "− ",
                formatEuro(ergebnis.pv)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Arbeitslosenversicherung (1,3%)" }),
              /* @__PURE__ */ jsxs("span", { children: [
                "− ",
                formatEuro(ergebnis.av)
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-red-600 font-medium mb-2", children: [
            /* @__PURE__ */ jsx("span", { children: "Steuern" }),
            /* @__PURE__ */ jsxs("span", { children: [
              "− ",
              formatEuro(ergebnis.steuernGesamt)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "pl-4 space-y-1 text-sm text-gray-500", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxs("span", { children: [
                "Lohnsteuer (Stkl. ",
                steuerklasse,
                ")"
              ] }),
              /* @__PURE__ */ jsxs("span", { children: [
                "− ",
                formatEuro(ergebnis.lohnsteuer)
              ] })
            ] }),
            ergebnis.soli > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Solidaritätszuschlag" }),
              /* @__PURE__ */ jsxs("span", { children: [
                "− ",
                formatEuro(ergebnis.soli)
              ] })
            ] }),
            kirchensteuer && ergebnis.kist > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Kirchensteuer" }),
              /* @__PURE__ */ jsxs("span", { children: [
                "− ",
                formatEuro(ergebnis.kist)
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-3 border-t-2 border-green-200 bg-green-50 -mx-6 px-6 rounded-b-2xl", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-green-800 text-lg", children: "Netto" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-green-600 text-xl", children: formatEuro(ergebnis.nettoMonat) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert's" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Berechnung nach ",
            /* @__PURE__ */ jsx("strong", { children: "§32a EStG Tarif 2026" }),
            " und BMF-Programmablaufplan"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsxs("strong", { children: [
              "Grundfreibetrag: ",
              formatEuro(TARIF_2026.grundfreibetrag)
            ] }),
            " (Stand 01.01.2026)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "BBG Rente/AV: ",
            /* @__PURE__ */ jsxs("strong", { children: [
              formatEuro(BBG_2026.renteArbeitslos),
              "/Jahr"
            ] }),
            " | BBG KV/PV: ",
            /* @__PURE__ */ jsxs("strong", { children: [
              formatEuro(BBG_2026.krankenPflege),
              "/Jahr"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Durchschnittlicher KV-Zusatzbeitrag: ",
            /* @__PURE__ */ jsx("strong", { children: "2,5%" }),
            " (Ihr Wert kann abweichen)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "⚠️" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Vereinfachte Berechnung – exakte Werte via ",
            /* @__PURE__ */ jsx("a", { href: "https://www.bmf-steuerrechner.de", target: "_blank", rel: "noopener", className: "text-blue-600 hover:underline", children: "BMF-Steuerrechner" })
          ] })
        ] })
      ] })
    ] }),
    (steuerklasse === 5 || steuerklasse === 6) && /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("h3", { className: "font-bold text-amber-800 mb-2", children: [
        "⚠️ Hinweis zu Steuerklasse ",
        steuerklasse
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-amber-700", children: steuerklasse === 5 ? "In Steuerklasse V entfallen Grundfreibetrag und Pauschbeträge – diese erhält Ihr Partner in Steuerklasse III. Die höhere monatliche Belastung gleicht sich bei der Jahressteuererklärung aus." : "In Steuerklasse VI (Zweitjob) gibt es keine Freibeträge. Die tatsächliche Steuerlast wird bei der Einkommensteuererklärung berechnet." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörden" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📋" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Finanzamt" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Lohnsteuer, Steuerklasse" }),
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
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🏥" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Krankenkasse" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "KV-Beitrag, Zusatzbeitrag" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gray-50 rounded-xl", children: [
      /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-gray-500 uppercase mb-2", children: "Rechtsgrundlagen & Quellen (Stand: 2026)" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/estg/__32a.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "§32a EStG – Einkommensteuertarif"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bmf-steuerrechner.de/bl/bl2026/eingabeformbl2026.xhtml",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BMF – Offizieller Lohnsteuerrechner 2026"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bundesfinanzministerium.de/Content/DE/Downloads/Steuern/Steuerarten/Lohnsteuer/Programmablaufplan/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BMF – Programmablaufplan Lohnsteuer 2026"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bundesregierung.de/breg-de/aktuelles/sozialversicherung-rechengroessen-2387774",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesregierung – Sozialversicherungs-Rechengrößen 2026"
          }
        )
      ] })
    ] })
  ] });
}

const $$BruttoNettoRechner = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Brutto-Netto-Rechner 2026", "description": "Brutto Netto Rechner 2026: Berechne dein Nettogehalt mit aktuellen Abz\xFCgen. Lohnsteuer, Sozialversicherung, Kirchensteuer \u2013 alle Steuerklassen. Grundfreibetrag 12.348\u20AC, BBG 101.400\u20AC RV / 69.750\u20AC KV.", "keywords": "Brutto Netto Rechner, Gehaltsrechner 2026, Netto berechnen, Lohnsteuer Rechner, Steuerklasse, Nettogehalt, was bleibt vom Gehalt, Grundfreibetrag 2026, Beitragsbemessungsgrenze 2026" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen pb-8"> <!-- Header mit Zurück-Button --> <header class="bg-gradient-to-r from-green-500 to-teal-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-green-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>
Alle Rechner
</a> <div class="flex items-center gap-3"> <span class="text-4xl">💵</span> <div> <h1 class="text-2xl font-bold">Brutto-Netto-Rechner</h1> <p class="text-green-100 text-sm">Stand: 2026</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ${renderComponent($$result2, "BruttoNettoRechner", BruttoNettoRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/BruttoNettoRechner", "client:component-export": "default" })} </div> </main> ` })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/brutto-netto-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/brutto-netto-rechner.astro";
const $$url = "/brutto-netto-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$BruttoNettoRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
