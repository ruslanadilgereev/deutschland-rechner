/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DmT1JwUR.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const SOZIALVERSICHERUNG_2026 = {
  // Quelle: Deutsche Rentenversicherung - Beitragssatz 18,6%, AN-Anteil 50%
  rentenversicherung: 0.093,
  // 9,3% AN-Anteil
  // Quelle: Bundesagentur für Arbeit - Beitragssatz 2,6%, AN-Anteil 50%
  arbeitslosenversicherung: 0.013,
  // 1,3% AN-Anteil
  // Quelle: GKV-Spitzenverband
  pflegeversicherung: {
    // Beitragssatz 3,6% (Eltern mit 1 Kind), AN-Anteil 1,8%
    basis: 0.018,
    // Beitragszuschlag für Kinderlose ab 23 Jahren: 0,6%
    // Quelle: §55 Abs. 3 SGB XI
    kinderlos_zuschlag: 6e-3
  },
  // Quelle: GKV-Spitzenverband
  krankenversicherung: {
    // Allgemeiner Beitragssatz 14,6%, ermäßigt 14,0%, AN-Anteil 7,0%
    basis: 0.07,
    // Durchschnittlicher Zusatzbeitrag 2026: 2,9%, AN-Anteil 1,45%
    zusatzbeitrag: 0.0145
  }
};
const BBG_2026 = {
  // Einheitliche BBG Renten-/Arbeitslosenversicherung (seit 2025)
  rente: 101400,
  // BBG Kranken-/Pflegeversicherung
  kranken: 69750
};
const FREIBETRAEGE_2026 = {
  // Quelle: §9a Satz 1 Nr. 1a EStG - Arbeitnehmer-Pauschbetrag
  werbungskosten: 1230,
  // Quelle: §10c EStG - Sonderausgaben-Pauschbetrag
  sonderausgaben: 36,
  // Quelle: §24b EStG - Entlastungsbetrag für Alleinerziehende
  alleinerziehend: 4260};
const TARIF_2026 = {
  // Zone 1: Grundfreibetrag
  zone1_bis: 12348,
  // Zone 2: Erste Progressionszone (14% bis 24%)
  zone2_bis: 17799,
  zone2_koeff1: 914.51,
  // Koeffizient y²
  zone2_koeff2: 1400,
  // Koeffizient y
  // Zone 3: Zweite Progressionszone (24% bis 42%)
  zone3_bis: 69878,
  zone3_koeff1: 173.1,
  // Koeffizient z²
  zone3_koeff2: 2397,
  // Koeffizient z
  zone3_konstante: 1034.87,
  // Zone 4: Proportionalzone Spitzensteuersatz (42%)
  zone4_bis: 277825,
  zone4_satz: 0.42,
  zone4_abzug: 11135.63,
  // Zone 5: Reichensteuer (45%)
  zone5_satz: 0.45,
  zone5_abzug: 19470.38
};
const STEUERKLASSEN = [
  { wert: 1, label: "Steuerklasse 1", beschreibung: "Ledig / Geschieden" },
  { wert: 2, label: "Steuerklasse 2", beschreibung: "Alleinerziehend" },
  { wert: 3, label: "Steuerklasse 3", beschreibung: "Verheiratet (höheres Einkommen)" },
  { wert: 4, label: "Steuerklasse 4", beschreibung: "Verheiratet (gleiches Einkommen)" },
  { wert: 5, label: "Steuerklasse 5", beschreibung: "Verheiratet (geringeres Einkommen)" },
  { wert: 6, label: "Steuerklasse 6", beschreibung: "Zweitjob / Nebenjob" }
];
function berechneEinkommensteuer(zvE) {
  zvE = Math.floor(zvE);
  if (zvE <= 0) {
    return 0;
  }
  let steuer;
  if (zvE <= TARIF_2026.zone1_bis) {
    steuer = 0;
  } else if (zvE <= TARIF_2026.zone2_bis) {
    const y = (zvE - TARIF_2026.zone1_bis) / 1e4;
    steuer = (TARIF_2026.zone2_koeff1 * y + TARIF_2026.zone2_koeff2) * y;
  } else if (zvE <= TARIF_2026.zone3_bis) {
    const z = (zvE - TARIF_2026.zone2_bis) / 1e4;
    steuer = (TARIF_2026.zone3_koeff1 * z + TARIF_2026.zone3_koeff2) * z + TARIF_2026.zone3_konstante;
  } else if (zvE <= TARIF_2026.zone4_bis) {
    steuer = TARIF_2026.zone4_satz * zvE - TARIF_2026.zone4_abzug;
  } else {
    steuer = TARIF_2026.zone5_satz * zvE - TARIF_2026.zone5_abzug;
  }
  return Math.max(0, Math.floor(steuer));
}
function berechneVorsorgepauschale(jahresbrutto, kinderlos) {
  const rvBrutto = Math.min(jahresbrutto, BBG_2026.rente);
  const teilbetragRV = rvBrutto * SOZIALVERSICHERUNG_2026.rentenversicherung;
  const kvBrutto = Math.min(jahresbrutto, BBG_2026.kranken);
  const teilbetragKV = kvBrutto * (SOZIALVERSICHERUNG_2026.krankenversicherung.basis + SOZIALVERSICHERUNG_2026.krankenversicherung.zusatzbeitrag);
  let teilbetragPV = kvBrutto * SOZIALVERSICHERUNG_2026.pflegeversicherung.basis;
  if (kinderlos) {
    teilbetragPV += kvBrutto * SOZIALVERSICHERUNG_2026.pflegeversicherung.kinderlos_zuschlag;
  }
  const teilbetragAV = rvBrutto * SOZIALVERSICHERUNG_2026.arbeitslosenversicherung;
  const summeKVPVAV = teilbetragKV + teilbetragPV + teilbetragAV;
  const begrenztKVPVAV = Math.min(summeKVPVAV, 1900);
  return teilbetragRV + begrenztKVPVAV;
}
function berechneLohnsteuer(jahresbrutto, steuerklasse, kinderlos) {
  let werbungskosten = 0;
  let sonderausgaben = 0;
  let entlastungsbetrag = 0;
  switch (steuerklasse) {
    case 1:
      werbungskosten = FREIBETRAEGE_2026.werbungskosten;
      sonderausgaben = FREIBETRAEGE_2026.sonderausgaben;
      break;
    case 2:
      werbungskosten = FREIBETRAEGE_2026.werbungskosten;
      sonderausgaben = FREIBETRAEGE_2026.sonderausgaben;
      entlastungsbetrag = FREIBETRAEGE_2026.alleinerziehend;
      break;
    case 3:
      werbungskosten = FREIBETRAEGE_2026.werbungskosten;
      sonderausgaben = FREIBETRAEGE_2026.sonderausgaben * 2;
      break;
    case 4:
      werbungskosten = FREIBETRAEGE_2026.werbungskosten;
      sonderausgaben = FREIBETRAEGE_2026.sonderausgaben;
      break;
    case 5:
      werbungskosten = FREIBETRAEGE_2026.werbungskosten;
      sonderausgaben = FREIBETRAEGE_2026.sonderausgaben;
      break;
    case 6:
      werbungskosten = 0;
      sonderausgaben = 0;
      break;
  }
  const vorsorgepauschale = berechneVorsorgepauschale(jahresbrutto, kinderlos);
  const abzuege = werbungskosten + sonderausgaben + vorsorgepauschale + entlastungsbetrag;
  const zvE = Math.max(0, jahresbrutto - abzuege);
  if (steuerklasse === 3) {
    const halbZvE = Math.max(0, zvE / 2);
    const steuerHalb = berechneEinkommensteuer(halbZvE);
    return steuerHalb * 2;
  } else if (steuerklasse === 5 || steuerklasse === 6) {
    return berechneEinkommensteuer(zvE);
  } else {
    return berechneEinkommensteuer(zvE);
  }
}
function berechneSoli(lohnsteuer) {
  const freigrenze = 18130;
  if (lohnsteuer <= freigrenze) return 0;
  if (lohnsteuer <= 33063) {
    return Math.min(0.055 * lohnsteuer, 0.119 * (lohnsteuer - freigrenze));
  }
  return Math.floor(lohnsteuer * 0.055);
}
function berechneKirchensteuer(lohnsteuer, bundesland) {
  const satz = ["BY", "BW"].includes(bundesland) ? 0.08 : 0.09;
  return Math.floor(lohnsteuer * satz);
}
function BruttoNettoRechner() {
  const [bruttoMonat, setBruttoMonat] = useState(4e3);
  const [steuerklasse, setSteuerklasse] = useState(1);
  const [kinderlos, setKinderlos] = useState(true);
  const [kirchensteuer, setKirchensteuer] = useState(false);
  const [bundesland, setBundesland] = useState("NW");
  const ergebnis = useMemo(() => {
    const bruttoJahr = bruttoMonat * 12;
    const rvBrutto = Math.min(bruttoJahr, BBG_2026.rente);
    const kvBrutto = Math.min(bruttoJahr, BBG_2026.kranken);
    const rv = rvBrutto * SOZIALVERSICHERUNG_2026.rentenversicherung;
    const av = rvBrutto * SOZIALVERSICHERUNG_2026.arbeitslosenversicherung;
    let pv = kvBrutto * SOZIALVERSICHERUNG_2026.pflegeversicherung.basis;
    if (kinderlos) {
      pv += kvBrutto * SOZIALVERSICHERUNG_2026.pflegeversicherung.kinderlos_zuschlag;
    }
    const kv = kvBrutto * (SOZIALVERSICHERUNG_2026.krankenversicherung.basis + SOZIALVERSICHERUNG_2026.krankenversicherung.zusatzbeitrag);
    const svGesamt = rv + av + pv + kv;
    const lohnsteuerJahr = berechneLohnsteuer(bruttoJahr, steuerklasse, kinderlos);
    const soliJahr = berechneSoli(lohnsteuerJahr);
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
      abzuegeGesamt: Math.round((svGesamt + steuernGesamt) / 12)
    };
  }, [bruttoMonat, steuerklasse, kinderlos, kirchensteuer, bundesland]);
  const formatEuro = (n) => n.toLocaleString("de-DE") + " €";
  const pvSatz = kinderlos ? "2,4%" : "1,8%";
  const kvSatz = ((SOZIALVERSICHERUNG_2026.krankenversicherung.basis + SOZIALVERSICHERUNG_2026.krankenversicherung.zusatzbeitrag) * 100).toFixed(2) + "%";
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
              /* @__PURE__ */ jsxs("span", { children: [
                "Krankenversicherung (",
                kvSatz,
                ")"
              ] }),
              /* @__PURE__ */ jsxs("span", { children: [
                "− ",
                formatEuro(ergebnis.kv)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxs("span", { children: [
                "Pflegeversicherung (",
                pvSatz,
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
            /* @__PURE__ */ jsx("strong", { children: "§32a EStG Tarifformel 2026" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Grundfreibetrag: 12.348 €" }),
            " (Steuerfortentwicklungsgesetz)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Beitragsbemessungsgrenzen ",
            /* @__PURE__ */ jsx("strong", { children: "RV: 101.400 €" }),
            " / ",
            /* @__PURE__ */ jsx("strong", { children: "KV: 69.750 €" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Durchschnittlicher KV-Zusatzbeitrag: ",
            /* @__PURE__ */ jsx("strong", { children: "2,9%" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Exakte Werte via ",
            /* @__PURE__ */ jsx("a", { href: "https://www.bmf-steuerrechner.de", target: "_blank", rel: "noopener", className: "text-blue-600 hover:underline", children: "BMF-Steuerrechner" })
          ] })
        ] })
      ] })
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
      /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-gray-500 uppercase mb-2", children: "Quellen (Stand: 2026)" }),
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
            href: "https://www.finanz-tools.de/einkommensteuer/berechnung-formeln/2026",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Finanz-Tools – Einkommensteuer-Formeln 2026"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bmf-steuerrechner.de",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BMF – Offizieller Lohnsteuerrechner"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.lohn-info.de/vorsorgepauschale.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Lohn-Info – Vorsorgepauschale"
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
