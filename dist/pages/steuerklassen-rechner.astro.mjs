/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_v22DC8tm.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const GRUNDFREIBETRAG_2026 = 12348;
const TARIFZONEN_2026 = {
  zone1Ende: 17799,
  zone2Ende: 69878,
  zone3Ende: 277825
};
const SV_SAETZE_2026 = {
  rv: 0.186,
  // Rentenversicherung 18,6%
  kv: 0.146,
  // Krankenversicherung 14,6%
  kvZusatz: 0.021,
  // Durchschn. Zusatzbeitrag 2,1%
  pv: 0.034,
  // Pflegeversicherung 3,4%
  pvKinderlos: 6e-3,
  // Zuschlag kinderlose ab 23
  av: 0.026
  // Arbeitslosenversicherung 2,6%
};
const BBG_2026 = {
  rvWest: 8050,
  // RV/AV Ost (ab 2025 angeglichen)
  kv: 5512.5
  // KV/PV
};
const STEUERKLASSEN = [
  {
    id: 1,
    name: "Steuerklasse I",
    beschreibung: "Ledige, Geschiedene, Verwitwete",
    icon: "👤"
  },
  {
    id: 2,
    name: "Steuerklasse II",
    beschreibung: "Alleinerziehende mit Entlastungsbetrag",
    icon: "👤👶"
  },
  {
    id: 3,
    name: "Steuerklasse III",
    beschreibung: "Verheiratete (Partner in V oder ohne Einkommen)",
    icon: "💑"
  },
  {
    id: 4,
    name: "Steuerklasse IV",
    beschreibung: "Verheiratete (beide erwerbstätig, gleich)",
    icon: "👫"
  },
  {
    id: 5,
    name: "Steuerklasse V",
    beschreibung: "Verheiratete (Partner in III)",
    icon: "💑"
  },
  {
    id: 6,
    name: "Steuerklasse VI",
    beschreibung: "Zweit- und Nebenjob",
    icon: "📋"
  }
];
function berechneLohnsteuerJahr(brutto, steuerklasse, kinder, kirchensteuer, bundesland) {
  const jahresBrutto = brutto * 12;
  let grundfreibetrag = GRUNDFREIBETRAG_2026;
  let arbeitnehmerPauschbetrag = 1230;
  let sonderausgabenPauschbetrag = 36;
  let vorsorgePauschale = Math.min(jahresBrutto * 0.12, 3e3);
  let entlastungsbetragAlleinerziehende = 0;
  switch (steuerklasse) {
    case 1:
      break;
    case 2:
      entlastungsbetragAlleinerziehende = 4260 + (kinder > 1 ? (kinder - 1) * 240 : 0);
      break;
    case 3:
      grundfreibetrag *= 2;
      break;
    case 4:
      break;
    case 5:
      grundfreibetrag = 0;
      arbeitnehmerPauschbetrag = 0;
      sonderausgabenPauschbetrag = 0;
      break;
    case 6:
      grundfreibetrag = 0;
      arbeitnehmerPauschbetrag = 0;
      sonderausgabenPauschbetrag = 0;
      vorsorgePauschale = 0;
      break;
  }
  const abzuege = arbeitnehmerPauschbetrag + sonderausgabenPauschbetrag + vorsorgePauschale + entlastungsbetragAlleinerziehende;
  const zvE = Math.max(0, jahresBrutto - abzuege);
  let steuer = 0;
  const zvEFuerBerechnung = Math.max(0, zvE - grundfreibetrag);
  if (zvEFuerBerechnung <= 0) {
    steuer = 0;
  } else if (steuerklasse === 3) {
    const zvEHalb = zvEFuerBerechnung / 2;
    steuer = berechneEStTarif(zvEHalb) * 2;
  } else {
    steuer = berechneEStTarif(zvEFuerBerechnung);
  }
  const soliFreigrenze = steuerklasse === 3 ? 36260 : 18130;
  let soli = 0;
  if (steuer > soliFreigrenze) {
    soli = Math.round(steuer * 0.055);
  } else if (steuer > soliFreigrenze * 0.55) {
    soli = Math.round(Math.min(steuer * 0.055, (steuer - soliFreigrenze * 0.55) * 0.119));
  }
  const kirchensteuerSatz = bundesland === "BY" || bundesland === "BW" ? 0.08 : 0.09;
  const kirchensteuerBetrag = kirchensteuer ? Math.round(steuer * kirchensteuerSatz) : 0;
  return {
    lohnsteuer: Math.round(steuer),
    soli,
    kirchensteuer: kirchensteuerBetrag,
    gesamt: Math.round(steuer) + soli + kirchensteuerBetrag
  };
}
function berechneEStTarif(zvE) {
  if (zvE <= 0) return 0;
  const zone1Start = GRUNDFREIBETRAG_2026;
  const zone1Ende = TARIFZONEN_2026.zone1Ende;
  const zone2Ende = TARIFZONEN_2026.zone2Ende;
  const zone3Ende = TARIFZONEN_2026.zone3Ende;
  const effektivZvE = zvE + GRUNDFREIBETRAG_2026;
  if (effektivZvE <= zone1Start) {
    return 0;
  } else if (effektivZvE <= zone1Ende) {
    const y = (effektivZvE - zone1Start) / 1e4;
    return (933.52 * y + 1400) * y;
  } else if (effektivZvE <= zone2Ende) {
    const z = (effektivZvE - zone1Ende) / 1e4;
    return (176.64 * z + 2397) * z + 1015.13;
  } else if (effektivZvE <= zone3Ende) {
    return 0.42 * effektivZvE - 10911.92;
  } else {
    return 0.45 * effektivZvE - 18918.79;
  }
}
function berechneSozialversicherung(brutto, kinderlos, kinderAnzahl) {
  const monatsBrutto = brutto;
  const rvBasis = Math.min(monatsBrutto, BBG_2026.rvWest);
  const kvBasis = Math.min(monatsBrutto, BBG_2026.kv);
  const rv = Math.round(rvBasis * SV_SAETZE_2026.rv / 2);
  const kv = Math.round(kvBasis * (SV_SAETZE_2026.kv + SV_SAETZE_2026.kvZusatz) / 2);
  let pvSatz = SV_SAETZE_2026.pv / 2;
  if (kinderlos) {
    pvSatz += SV_SAETZE_2026.pvKinderlos;
  } else if (kinderAnzahl >= 2) {
    const abschlag = Math.min(kinderAnzahl - 1, 4) * 25e-4;
    pvSatz = Math.max(7e-3, pvSatz - abschlag);
  }
  const pv = Math.round(kvBasis * pvSatz);
  const av = Math.round(rvBasis * SV_SAETZE_2026.av / 2);
  return {
    rv: rv * 12,
    kv: kv * 12,
    pv: pv * 12,
    av: av * 12,
    gesamt: (rv + kv + pv + av) * 12
  };
}
function SteuerklassenRechner() {
  const [brutto1, setBrutto1] = useState(4500);
  const [brutto2, setBrutto2] = useState(3e3);
  const [kinder, setKinder] = useState(0);
  const [kirchensteuer, setKirchensteuer] = useState(false);
  const [bundesland, setBundesland] = useState("NW");
  const [alleinstehend, setAlleinstehend] = useState(false);
  const ergebnis = useMemo(() => {
    if (alleinstehend) {
      const kinderlos2 = kinder === 0;
      const steuerklasse = kinder > 0 ? 2 : 1;
      const steuer = berechneLohnsteuerJahr(brutto1, steuerklasse, kinder, kirchensteuer, bundesland);
      const sv = berechneSozialversicherung(brutto1, kinderlos2, kinder);
      const jahresBrutto = brutto1 * 12;
      const jahresNetto = jahresBrutto - steuer.gesamt - sv.gesamt;
      return {
        alleinstehend: true,
        steuerklasse,
        brutto: jahresBrutto,
        steuer,
        sv,
        netto: jahresNetto,
        nettoMonat: Math.round(jahresNetto / 12)
      };
    }
    const kinderlos = kinder === 0;
    const sv1 = berechneSozialversicherung(brutto1, kinderlos, kinder);
    const sv2 = berechneSozialversicherung(brutto2, kinderlos, kinder);
    const kombinationen = [
      { sk1: 4, sk2: 4, name: "IV / IV" },
      { sk1: 3, sk2: 5, name: "III / V" },
      { sk1: 5, sk2: 3, name: "V / III" }
    ].map((komb) => {
      const steuer1 = berechneLohnsteuerJahr(brutto1, komb.sk1, kinder, kirchensteuer, bundesland);
      const steuer2 = berechneLohnsteuerJahr(brutto2, komb.sk2, kinder, kirchensteuer, bundesland);
      const jahresBrutto12 = brutto1 * 12;
      const jahresBrutto22 = brutto2 * 12;
      const gesamtBrutto2 = jahresBrutto12 + jahresBrutto22;
      const gesamtSteuer = steuer1.gesamt + steuer2.gesamt;
      const gesamtSV = sv1.gesamt + sv2.gesamt;
      const netto1 = jahresBrutto12 - steuer1.gesamt - sv1.gesamt;
      const netto2 = jahresBrutto22 - steuer2.gesamt - sv2.gesamt;
      const gesamtNetto = netto1 + netto2;
      return {
        ...komb,
        steuer1,
        steuer2,
        netto1,
        netto2,
        gesamtBrutto: gesamtBrutto2,
        gesamtSteuer,
        gesamtSV,
        gesamtNetto,
        nettoMonat: Math.round(gesamtNetto / 12)
      };
    });
    const jahresBrutto1 = brutto1 * 12;
    const jahresBrutto2 = brutto2 * 12;
    const gesamtBrutto = jahresBrutto1 + jahresBrutto2;
    const zvE = gesamtBrutto - 2460 - 72 - Math.min(gesamtBrutto * 0.12, 6e3);
    const tatsaechlicheSteuer = berechneEStTarif(Math.max(0, zvE / 2 - GRUNDFREIBETRAG_2026)) * 2;
    const beste = kombinationen.reduce(
      (prev, curr) => curr.gesamtNetto > prev.gesamtNetto ? curr : prev
    );
    const kombinationenMitNachzahlung = kombinationen.map((komb) => {
      const gezahlteLohnsteuer = komb.steuer1.lohnsteuer + komb.steuer2.lohnsteuer;
      const differenz = gezahlteLohnsteuer - tatsaechlicheSteuer;
      return {
        ...komb,
        tatsaechlicheSteuer: Math.round(tatsaechlicheSteuer),
        nachzahlung: differenz < 0 ? Math.abs(Math.round(differenz)) : 0,
        erstattung: differenz > 0 ? Math.round(differenz) : 0
      };
    });
    return {
      alleinstehend: false,
      kombinationen: kombinationenMitNachzahlung,
      beste: kombinationenMitNachzahlung.find((k) => k.name === beste.name),
      sv1,
      sv2
    };
  }, [brutto1, brutto2, kinder, kirchensteuer, bundesland, alleinstehend]);
  const formatEuro = (n) => n.toLocaleString("de-DE") + " €";
  const bundeslaender = [
    { code: "BW", name: "Baden-Württemberg" },
    { code: "BY", name: "Bayern" },
    { code: "BE", name: "Berlin" },
    { code: "BB", name: "Brandenburg" },
    { code: "HB", name: "Bremen" },
    { code: "HH", name: "Hamburg" },
    { code: "HE", name: "Hessen" },
    { code: "MV", name: "Mecklenburg-Vorpommern" },
    { code: "NI", name: "Niedersachsen" },
    { code: "NW", name: "Nordrhein-Westfalen" },
    { code: "RP", name: "Rheinland-Pfalz" },
    { code: "SL", name: "Saarland" },
    { code: "SN", name: "Sachsen" },
    { code: "ST", name: "Sachsen-Anhalt" },
    { code: "SH", name: "Schleswig-Holstein" },
    { code: "TH", name: "Thüringen" }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("h3", { className: "font-bold text-gray-800 mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xl", children: "👥" }),
        " Familienstand"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setAlleinstehend(true),
            className: `py-4 px-4 rounded-xl font-medium transition-all flex flex-col items-center gap-2 ${alleinstehend ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: [
              /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "👤" }),
              /* @__PURE__ */ jsx("span", { children: "Alleinstehend" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs opacity-75", children: "Ledig/Geschieden/Verwitwet" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setAlleinstehend(false),
            className: `py-4 px-4 rounded-xl font-medium transition-all flex flex-col items-center gap-2 ${!alleinstehend ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: [
              /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "💑" }),
              /* @__PURE__ */ jsx("span", { children: "Verheiratet" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs opacity-75", children: "Zusammenveranlagung" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("h3", { className: "font-bold text-gray-800 mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xl", children: "💰" }),
        " Monatliches Bruttoeinkommen"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: alleinstehend ? "Dein Bruttogehalt" : "Partner 1 – Bruttogehalt" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: brutto1,
                onChange: (e) => setBrutto1(Math.max(0, Number(e.target.value))),
                className: "w-full text-xl font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
                min: "0",
                step: "100"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400", children: "€/Monat" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              min: "0",
              max: "15000",
              step: "100",
              value: brutto1,
              onChange: (e) => setBrutto1(Number(e.target.value)),
              className: "w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            }
          )
        ] }),
        !alleinstehend && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Partner 2 – Bruttogehalt" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: brutto2,
                onChange: (e) => setBrutto2(Math.max(0, Number(e.target.value))),
                className: "w-full text-xl font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
                min: "0",
                step: "100"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400", children: "€/Monat" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              min: "0",
              max: "15000",
              step: "100",
              value: brutto2,
              onChange: (e) => setBrutto2(Number(e.target.value)),
              className: "w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("h3", { className: "font-bold text-gray-800 mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xl", children: "⚙️" }),
        " Weitere Angaben"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Kinder" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              value: kinder,
              onChange: (e) => setKinder(Number(e.target.value)),
              className: "w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
              children: [0, 1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ jsxs("option", { value: n, children: [
                n,
                " ",
                n === 1 ? "Kind" : "Kinder"
              ] }, n))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Bundesland" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              value: bundesland,
              onChange: (e) => setBundesland(e.target.value),
              className: "w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
              children: bundeslaender.map((bl) => /* @__PURE__ */ jsx("option", { value: bl.code, children: bl.name }, bl.code))
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: kirchensteuer,
              onChange: (e) => setKirchensteuer(e.target.checked),
              className: "w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-700", children: [
            "Kirchensteuerpflichtig (",
            bundesland === "BY" || bundesland === "BW" ? "8%" : "9%",
            ")"
          ] })
        ] }) })
      ] })
    ] }),
    ergebnis.alleinstehend && "steuerklasse" in ergebnis && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white mb-6", children: [
        /* @__PURE__ */ jsxs("h3", { className: "text-sm font-medium text-blue-200 mb-1", children: [
          "Deine Steuerklasse: ",
          ergebnis.steuerklasse === 2 ? "II" : "I"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuro(ergebnis.nettoMonat) }),
            /* @__PURE__ */ jsx("span", { className: "text-blue-200", children: "/Monat" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-blue-200 text-sm mt-1", children: "Netto nach Steuern & Sozialabgaben" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-3 backdrop-blur-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-blue-200 text-xs block", children: "Jahresbrutto" }),
            /* @__PURE__ */ jsx("span", { className: "text-xl font-bold", children: formatEuro(ergebnis.brutto) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-3 backdrop-blur-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-blue-200 text-xs block", children: "Jahresnetto" }),
            /* @__PURE__ */ jsx("span", { className: "text-xl font-bold", children: formatEuro(ergebnis.netto) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Abzüge im Detail (Jahr)" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Lohnsteuer" }),
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-900", children: formatEuro(ergebnis.steuer.lohnsteuer) })
          ] }),
          ergebnis.steuer.soli > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Solidaritätszuschlag" }),
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-900", children: formatEuro(ergebnis.steuer.soli) })
          ] }),
          ergebnis.steuer.kirchensteuer > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Kirchensteuer" }),
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-900", children: formatEuro(ergebnis.steuer.kirchensteuer) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Rentenversicherung" }),
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-900", children: formatEuro(ergebnis.sv.rv) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Krankenversicherung" }),
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-900", children: formatEuro(ergebnis.sv.kv) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Pflegeversicherung" }),
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-900", children: formatEuro(ergebnis.sv.pv) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Arbeitslosenversicherung" }),
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-900", children: formatEuro(ergebnis.sv.av) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-3 border-t-2 border-gray-200 bg-gray-50 -mx-6 px-6 rounded-b-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-800", children: "Abzüge gesamt" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-red-600", children: formatEuro(ergebnis.steuer.gesamt + ergebnis.sv.gesamt) })
          ] })
        ] })
      ] })
    ] }),
    !ergebnis.alleinstehend && "kombinationen" in ergebnis && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl shadow-lg p-6 text-white mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🏆" }),
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-green-200", children: "Optimale Steuerklassen-Kombination" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-baseline gap-2", children: /* @__PURE__ */ jsx("span", { className: "text-4xl font-bold", children: ergebnis.beste.name }) }),
          /* @__PURE__ */ jsxs("p", { className: "text-green-200 text-lg mt-2", children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold text-white", children: formatEuro(ergebnis.beste.nettoMonat) }),
            " Netto/Monat"
          ] })
        ] }),
        ergebnis.beste.erstattung > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-white/20 rounded-xl p-3 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-green-100 text-sm block", children: "Erwartete Steuererstattung" }),
          /* @__PURE__ */ jsxs("span", { className: "text-xl font-bold", children: [
            "ca. ",
            formatEuro(ergebnis.beste.erstattung)
          ] })
        ] }),
        ergebnis.beste.nachzahlung > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-red-500/30 rounded-xl p-3 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-red-100 text-sm block", children: "⚠️ Erwartete Nachzahlung" }),
          /* @__PURE__ */ jsxs("span", { className: "text-xl font-bold", children: [
            "ca. ",
            formatEuro(ergebnis.beste.nachzahlung)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Alle Kombinationen im Vergleich" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: ergebnis.kombinationen.map((komb, idx) => {
          const isBeste = komb.name === ergebnis.beste.name;
          return /* @__PURE__ */ jsxs(
            "div",
            {
              className: `p-4 rounded-xl border-2 ${isBeste ? "border-green-400 bg-green-50" : "border-gray-200 bg-gray-50"}`,
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-3", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsxs("h4", { className: "font-bold text-gray-800 flex items-center gap-2", children: [
                      komb.name,
                      isBeste && /* @__PURE__ */ jsx("span", { className: "text-green-600 text-sm", children: "✓ Optimal" })
                    ] }),
                    /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500", children: [
                      "Partner 1: SK ",
                      komb.sk1,
                      " | Partner 2: SK ",
                      komb.sk2
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                    /* @__PURE__ */ jsx("span", { className: "font-bold text-lg text-gray-800", children: formatEuro(komb.nettoMonat) }),
                    /* @__PURE__ */ jsx("span", { className: "text-gray-400 text-sm block", children: "/Monat" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Partner 1:" }),
                    /* @__PURE__ */ jsxs("span", { className: "font-medium text-gray-700 ml-1", children: [
                      formatEuro(Math.round(komb.netto1 / 12)),
                      "/M"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Partner 2:" }),
                    /* @__PURE__ */ jsxs("span", { className: "font-medium text-gray-700 ml-1", children: [
                      formatEuro(Math.round(komb.netto2 / 12)),
                      "/M"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "mt-3 pt-3 border-t border-gray-200 flex justify-between text-sm", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Bei Steuererklärung:" }),
                  komb.erstattung > 0 && /* @__PURE__ */ jsxs("span", { className: "text-green-600 font-medium", children: [
                    "≈ ",
                    formatEuro(komb.erstattung),
                    " Erstattung"
                  ] }),
                  komb.nachzahlung > 0 && /* @__PURE__ */ jsxs("span", { className: "text-red-600 font-medium", children: [
                    "≈ ",
                    formatEuro(komb.nachzahlung),
                    " Nachzahlung"
                  ] }),
                  komb.erstattung === 0 && komb.nachzahlung === 0 && /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "keine wesentliche Änderung" })
                ] })
              ]
            },
            idx
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-blue-800 mb-3", children: "💡 Welche Kombination ist die richtige?" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm text-blue-700", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold", children: "III / V:" }),
            /* @__PURE__ */ jsx("span", { children: "Wenn ein Partner deutlich mehr verdient. Höheres Monatsnetto für den Besserverdienenden, aber oft Nachzahlung bei Steuererklärung." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold", children: "IV / IV:" }),
            /* @__PURE__ */ jsx("span", { children: "Bei ähnlichem Einkommen. Ausgewogene Verteilung, selten hohe Nachzahlungen oder Erstattungen." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold", children: "IV / IV mit Faktor:" }),
            /* @__PURE__ */ jsx("span", { children: "Optimierte Variante für unterschiedliche Einkommen. Vermeidet Nachzahlungen durch genaue Berechnung." })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📋 Steuerklassen-Übersicht" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: STEUERKLASSEN.map((sk) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-3 bg-gray-50 rounded-xl", children: [
        /* @__PURE__ */ jsx("span", { className: "text-2xl", children: sk.icon }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "font-medium text-gray-800", children: sk.name }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: sk.beschreibung })
        ] })
      ] }, sk.id)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "⚠️ Wichtige Hinweise" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Die ",
            /* @__PURE__ */ jsx("strong", { children: "Steuerklasse beeinflusst nur den monatlichen Lohnsteuerabzug" }),
            " – nicht die jährliche Steuerlast"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Bei Zusammenveranlagung wird die ",
            /* @__PURE__ */ jsx("strong", { children: "tatsächliche Steuer über die Steuererklärung" }),
            " berechnet"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Steuerklassenwechsel" }),
            " ist mehrmals pro Jahr möglich (seit 2020 unbegrenzt)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Die Steuerklasse ",
            /* @__PURE__ */ jsx("strong", { children: "beeinflusst Lohnersatzleistungen" }),
            " (Elterngeld, Krankengeld, ALG I)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "⚠️" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Vor Elterngeld/Krankengeld: Steuerklasse ",
            /* @__PURE__ */ jsx("strong", { children: "rechtzeitig wechseln" }),
            " (mind. 6-12 Monate vorher)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "ℹ️" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Ab 2030 wird das ",
            /* @__PURE__ */ jsx("strong", { children: "Faktorverfahren" }),
            " für alle Ehepaare Pflicht (Reform geplant)"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörden & Antrag" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📋" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Finanzamt" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Steuerklassenwechsel beantragen" }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "https://www.elster.de",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "text-blue-600 hover:underline",
                children: "Online via ELSTER →"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📝" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Antrag auf Steuerklassenwechsel" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: 'Formular "Erklärung zum Steuerklassenwechsel"' }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "https://www.formulare-bfinv.de",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "text-blue-600 hover:underline",
                children: "Formulare-BFinV →"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Bürgertelefon BMF" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Allgemeine Steuerfragen" }),
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
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🧮" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Offizieller BMF-Rechner" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Exakte Lohnsteuerberechnung" }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "https://www.bmf-steuerrechner.de",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "text-blue-600 hover:underline",
                children: "bmf-steuerrechner.de →"
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gray-50 rounded-xl", children: [
      /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-gray-500 uppercase mb-2", children: "Quellen & Rechtsgrundlagen (Stand: 2026)" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/estg/__38b.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "§38b EStG – Einbehaltung der Lohnsteuer"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/estg/__39.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "§39 EStG – Lohnsteuerabzugsmerkmale"
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
            href: "https://www.bundesfinanzministerium.de/Content/DE/FAQ/Steuern/Lohnsteuer/lohnsteuer.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BMF – FAQ Lohnsteuer & Steuerklassen"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.finanztip.de/steuerklassen/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Finanztip – Steuerklassen-Ratgeber"
          }
        )
      ] })
    ] })
  ] });
}

const $$SteuerklassenRechner = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Steuerklassen-Rechner 2026 \u2013 Optimale Steuerklasse f\xFCr Ehepaare | III/V oder IV/IV", "description": "Steuerklassen-Rechner 2026: Finde die optimale Steuerklassenkombination f\xFCr Ehepaare. Vergleiche III/V, IV/IV und Faktorverfahren. Berechne Netto, Erstattung und Nachzahlung.", "keywords": "Steuerklassen Rechner, Steuerklasse Rechner, Steuerklassenwechsel, Steuerklasse Ehepaar, Steuerklasse verheiratet, Steuerklasse 3 5, Steuerklasse 4 4, Faktorverfahren, Steuerklasse wechseln, Lohnsteuerklasse, Steuerklassenkombination, Steuerklasse \xE4ndern, optimale Steuerklasse, Steuerklasse 2026, Netto Rechner Verheiratet" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen pb-8"> <!-- Header mit Zurück-Button --> <header class="bg-gradient-to-r from-pink-600 to-rose-700 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-pink-200 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>
Alle Rechner
</a> <div class="flex items-center gap-3"> <span class="text-4xl">💑</span> <div> <h1 class="text-2xl font-bold">Steuerklassen-Rechner</h1> <p class="text-pink-200 text-sm">Optimale Kombination für Ehepaare 2026</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ${renderComponent($$result2, "SteuerklassenRechner", SteuerklassenRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/SteuerklassenRechner", "client:component-export": "default" })} </div> </main> ` })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/steuerklassen-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/steuerklassen-rechner.astro";
const $$url = "/steuerklassen-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$SteuerklassenRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
