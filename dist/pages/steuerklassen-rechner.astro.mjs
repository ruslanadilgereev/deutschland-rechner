/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DmT1JwUR.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const TARIF_2026 = {
  grundfreibetrag: 12348,
  zone2Ende: 17799,
  zone3Ende: 69878,
  zone4Ende: 277825,
  // Koeffizienten
  zone2_a: 933.52,
  zone2_b: 1400,
  zone3_a: 176.64,
  zone3_b: 2397,
  zone3_c: 1015.13,
  zone4_faktor: 0.42,
  zone4_abzug: 10911.92,
  zone5_faktor: 0.45,
  zone5_abzug: 18918.79
};
const FREIBETRAEGE_2026 = {
  arbeitnehmerPauschbetrag: 1230,
  sonderausgabenPauschbetrag: 36,
  entlastungsbetragAlleinerziehende: 4260,
  entlastungsbetragProKind: 240
};
const SV_SAETZE_2026 = {
  rv: 0.186,
  // RV gesamt 18,6% → AN 9,3%
  kv: 0.146,
  // KV gesamt 14,6% → AN 7,3%
  kvZusatz: 0.025,
  // Durchschn. Zusatzbeitrag 2,5% → AN 1,25%
  pv: 0.036,
  // PV gesamt 3,6% → AN 1,8%
  pvKinderlos: 6e-3,
  // Zuschlag kinderlos ab 23
  pvKindAbschlag: 25e-4,
  // Abschlag pro Kind ab 2. Kind (max 4)
  av: 0.026
  // AV gesamt 2,6% → AN 1,3%
};
const BBG_2026 = {
  rvAv: 8050,
  // RV/AV
  kvPv: 5512.5
  // KV/PV
};
const SOLI_2026 = {
  satz: 0.055,
  freigrenzeSK1: 18130,
  freigrenzeSK3: 36260,
  milderung: 0.119
};
const STEUERKLASSEN = [
  {
    id: 1,
    name: "Steuerklasse I",
    beschreibung: "Ledige, Geschiedene, Verwitwete",
    icon: "👤",
    grundfreibetrag: TARIF_2026.grundfreibetrag,
    hatPauschbetraege: true
  },
  {
    id: 2,
    name: "Steuerklasse II",
    beschreibung: "Alleinerziehende mit Entlastungsbetrag",
    icon: "👤👶",
    grundfreibetrag: TARIF_2026.grundfreibetrag,
    hatPauschbetraege: true,
    entlastungsbetrag: FREIBETRAEGE_2026.entlastungsbetragAlleinerziehende
  },
  {
    id: 3,
    name: "Steuerklasse III",
    beschreibung: "Verheiratete (Partner in V oder ohne Einkommen)",
    icon: "💑",
    grundfreibetrag: TARIF_2026.grundfreibetrag * 2,
    // Splitting
    hatPauschbetraege: true,
    splitting: true
  },
  {
    id: 4,
    name: "Steuerklasse IV",
    beschreibung: "Verheiratete (beide erwerbstätig, ähnlich)",
    icon: "👫",
    grundfreibetrag: TARIF_2026.grundfreibetrag,
    hatPauschbetraege: true
  },
  {
    id: 5,
    name: "Steuerklasse V",
    beschreibung: "Verheiratete (Partner in III)",
    icon: "💑",
    grundfreibetrag: 0,
    // KEIN Grundfreibetrag
    hatPauschbetraege: false
  },
  {
    id: 6,
    name: "Steuerklasse VI",
    beschreibung: "Zweit- und Nebenjob",
    icon: "📋",
    grundfreibetrag: 0,
    // KEIN Grundfreibetrag
    hatPauschbetraege: false
  }
];
function berechneEStTarif(zvE) {
  if (zvE <= 0) return 0;
  const { grundfreibetrag, zone2Ende, zone3Ende, zone4Ende } = TARIF_2026;
  if (zvE <= grundfreibetrag) return 0;
  if (zvE <= zone2Ende) {
    const y = (zvE - grundfreibetrag) / 1e4;
    return Math.floor((TARIF_2026.zone2_a * y + TARIF_2026.zone2_b) * y);
  }
  if (zvE <= zone3Ende) {
    const z = (zvE - zone2Ende) / 1e4;
    return Math.floor((TARIF_2026.zone3_a * z + TARIF_2026.zone3_b) * z + TARIF_2026.zone3_c);
  }
  if (zvE <= zone4Ende) {
    return Math.floor(TARIF_2026.zone4_faktor * zvE - TARIF_2026.zone4_abzug);
  }
  return Math.floor(TARIF_2026.zone5_faktor * zvE - TARIF_2026.zone5_abzug);
}
function berechneEStTarifOhneGrundfreibetrag(zvE) {
  if (zvE <= 0) return 0;
  const { zone2Ende, zone3Ende, zone4Ende, grundfreibetrag } = TARIF_2026;
  if (zvE <= zone2Ende - grundfreibetrag) {
    const y = zvE / 1e4;
    return Math.floor((TARIF_2026.zone2_a * y + TARIF_2026.zone2_b) * y);
  }
  if (zvE <= zone3Ende - grundfreibetrag) {
    const zone1Betrag = zone2Ende - grundfreibetrag;
    const y1 = zone1Betrag / 1e4;
    const steuerZone1 = (TARIF_2026.zone2_a * y1 + TARIF_2026.zone2_b) * y1;
    const z = (zvE - zone1Betrag) / 1e4;
    return Math.floor(steuerZone1 + (TARIF_2026.zone3_a * z + TARIF_2026.zone3_b) * z);
  }
  if (zvE <= zone4Ende - grundfreibetrag) {
    return Math.floor(TARIF_2026.zone4_faktor * zvE - 8500);
  }
  return Math.floor(TARIF_2026.zone5_faktor * zvE - 16e3);
}
function berechneLohnsteuerJahr(jahresBrutto, steuerklasse, anzahlKinder = 0) {
  const {
    arbeitnehmerPauschbetrag,
    sonderausgabenPauschbetrag,
    entlastungsbetragAlleinerziehende,
    entlastungsbetragProKind
  } = FREIBETRAEGE_2026;
  const vorsorgepauschale = Math.min(jahresBrutto * 0.12, 3e3);
  let zvE = 0;
  let steuer = 0;
  switch (steuerklasse) {
    case 1:
      zvE = Math.max(0, jahresBrutto - vorsorgepauschale - arbeitnehmerPauschbetrag - sonderausgabenPauschbetrag);
      steuer = berechneEStTarif(zvE);
      break;
    case 2:
      const entlastung = entlastungsbetragAlleinerziehende + Math.max(0, anzahlKinder - 1) * entlastungsbetragProKind;
      zvE = Math.max(0, jahresBrutto - vorsorgepauschale - arbeitnehmerPauschbetrag - sonderausgabenPauschbetrag - entlastung);
      steuer = berechneEStTarif(zvE);
      break;
    case 3:
      zvE = Math.max(0, jahresBrutto - vorsorgepauschale - arbeitnehmerPauschbetrag - sonderausgabenPauschbetrag);
      steuer = berechneEStTarif(zvE / 2) * 2;
      break;
    case 4:
      zvE = Math.max(0, jahresBrutto - vorsorgepauschale - arbeitnehmerPauschbetrag - sonderausgabenPauschbetrag);
      steuer = berechneEStTarif(zvE);
      break;
    case 5:
      zvE = Math.max(0, jahresBrutto - vorsorgepauschale);
      steuer = berechneEStTarifOhneGrundfreibetrag(zvE);
      break;
    case 6:
      zvE = jahresBrutto;
      steuer = berechneEStTarifOhneGrundfreibetrag(zvE);
      break;
  }
  return Math.max(0, Math.round(steuer));
}
function berechneTatsaechlicheEStZusammen(brutto1, brutto2) {
  const { arbeitnehmerPauschbetrag, sonderausgabenPauschbetrag } = FREIBETRAEGE_2026;
  const jahresBrutto1 = brutto1 * 12;
  const jahresBrutto2 = brutto2 * 12;
  const vp1 = Math.min(jahresBrutto1 * 0.12, 3e3);
  const vp2 = Math.min(jahresBrutto2 * 0.12, 3e3);
  const zvE1 = Math.max(0, jahresBrutto1 - vp1 - arbeitnehmerPauschbetrag - sonderausgabenPauschbetrag);
  const zvE2 = Math.max(0, jahresBrutto2 - vp2 - arbeitnehmerPauschbetrag - sonderausgabenPauschbetrag);
  const zvEGesamt = zvE1 + zvE2;
  return berechneEStTarif(zvEGesamt / 2) * 2;
}
function berechneSoli(lohnsteuer, steuerklasse) {
  const freigrenze = steuerklasse === 3 ? SOLI_2026.freigrenzeSK3 : SOLI_2026.freigrenzeSK1;
  if (lohnsteuer <= freigrenze) return 0;
  const ueberFreigrenze = lohnsteuer - freigrenze;
  return Math.round(Math.min(ueberFreigrenze * SOLI_2026.milderung, lohnsteuer * SOLI_2026.satz));
}
function berechneKirchensteuer(lohnsteuer, bundesland) {
  const satz = ["BY", "BW"].includes(bundesland) ? 0.08 : 0.09;
  return Math.round(lohnsteuer * satz);
}
function berechneSozialversicherung(monatsBrutto, kinderlos, kinderAnzahl) {
  const rvBasis = Math.min(monatsBrutto, BBG_2026.rvAv);
  const kvBasis = Math.min(monatsBrutto, BBG_2026.kvPv);
  const rv = Math.round(rvBasis * SV_SAETZE_2026.rv / 2) * 12;
  const kv = Math.round(kvBasis * (SV_SAETZE_2026.kv + SV_SAETZE_2026.kvZusatz) / 2) * 12;
  let pvSatz = SV_SAETZE_2026.pv / 2;
  if (kinderlos) {
    pvSatz += SV_SAETZE_2026.pvKinderlos;
  } else if (kinderAnzahl >= 2) {
    const abschlag = Math.min(kinderAnzahl - 1, 4) * SV_SAETZE_2026.pvKindAbschlag;
    pvSatz = Math.max(7e-3, pvSatz - abschlag);
  }
  const pv = Math.round(kvBasis * pvSatz) * 12;
  const av = Math.round(rvBasis * SV_SAETZE_2026.av / 2) * 12;
  return { rv, kv, pv, av, gesamt: rv + kv + pv + av };
}
function SteuerklassenRechner() {
  const [brutto1, setBrutto1] = useState(4500);
  const [brutto2, setBrutto2] = useState(3e3);
  const [kinder, setKinder] = useState(0);
  const [kirchensteuer, setKirchensteuer] = useState(false);
  const [bundesland, setBundesland] = useState("NW");
  const [alleinstehend, setAlleinstehend] = useState(false);
  const ergebnis = useMemo(() => {
    const kinderlos = kinder === 0;
    if (alleinstehend) {
      const steuerklasse = kinder > 0 ? 2 : 1;
      const jahresBrutto = brutto1 * 12;
      const lohnsteuer = berechneLohnsteuerJahr(jahresBrutto, steuerklasse, kinder);
      const soli = berechneSoli(lohnsteuer, steuerklasse);
      const kist = kirchensteuer ? berechneKirchensteuer(lohnsteuer, bundesland) : 0;
      const steuerGesamt = lohnsteuer + soli + kist;
      const sv = berechneSozialversicherung(brutto1, kinderlos, kinder);
      const netto = jahresBrutto - steuerGesamt - sv.gesamt;
      return {
        alleinstehend: true,
        steuerklasse,
        brutto: jahresBrutto,
        lohnsteuer,
        soli,
        kist,
        steuerGesamt,
        sv,
        netto,
        nettoMonat: Math.round(netto / 12)
      };
    }
    const sv1 = berechneSozialversicherung(brutto1, kinderlos, kinder);
    const sv2 = berechneSozialversicherung(brutto2, kinderlos, kinder);
    const svGesamt = sv1.gesamt + sv2.gesamt;
    const jahresBrutto1 = brutto1 * 12;
    const jahresBrutto2 = brutto2 * 12;
    const bruttoGesamt = jahresBrutto1 + jahresBrutto2;
    const tatsaechlicheESt = berechneTatsaechlicheEStZusammen(brutto1, brutto2);
    const kombinationen = [
      { sk1: 4, sk2: 4, name: "IV / IV" },
      { sk1: 3, sk2: 5, name: "III / V" },
      { sk1: 5, sk2: 3, name: "V / III" }
    ].map((komb) => {
      const lst1 = berechneLohnsteuerJahr(jahresBrutto1, komb.sk1, kinder);
      const lst2 = berechneLohnsteuerJahr(jahresBrutto2, komb.sk2, kinder);
      const soli1 = berechneSoli(lst1, komb.sk1);
      const soli2 = berechneSoli(lst2, komb.sk2);
      const kist1 = kirchensteuer ? berechneKirchensteuer(lst1, bundesland) : 0;
      const kist2 = kirchensteuer ? berechneKirchensteuer(lst2, bundesland) : 0;
      const steuer1Gesamt = lst1 + soli1 + kist1;
      const steuer2Gesamt = lst2 + soli2 + kist2;
      const steuerGesamt = steuer1Gesamt + steuer2Gesamt;
      const netto1 = jahresBrutto1 - steuer1Gesamt - sv1.gesamt;
      const netto2 = jahresBrutto2 - steuer2Gesamt - sv2.gesamt;
      const nettoGesamt = netto1 + netto2;
      const gezahlteLohnsteuer = lst1 + lst2;
      const differenz = gezahlteLohnsteuer - tatsaechlicheESt;
      return {
        ...komb,
        lst1,
        lst2,
        soli1,
        soli2,
        kist1,
        kist2,
        steuer1Gesamt,
        steuer2Gesamt,
        steuerGesamt,
        netto1,
        netto2,
        nettoGesamt,
        nettoMonat: Math.round(nettoGesamt / 12),
        tatsaechlicheESt: Math.round(tatsaechlicheESt),
        nachzahlung: differenz < 0 ? Math.abs(Math.round(differenz)) : 0,
        erstattung: differenz > 0 ? Math.round(differenz) : 0
      };
    });
    const beste = kombinationen.reduce(
      (a, b) => b.nettoGesamt > a.nettoGesamt ? b : a
    );
    return {
      alleinstehend: false,
      kombinationen,
      beste,
      sv1,
      sv2,
      svGesamt,
      bruttoGesamt,
      tatsaechlicheESt: Math.round(tatsaechlicheESt)
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
          ergebnis.steuerklasse === 2 ? "II (Alleinerziehend)" : "I"
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
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-900", children: formatEuro(ergebnis.lohnsteuer) })
          ] }),
          ergebnis.soli > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Solidaritätszuschlag" }),
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-900", children: formatEuro(ergebnis.soli) })
          ] }),
          ergebnis.kist > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Kirchensteuer" }),
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-900", children: formatEuro(ergebnis.kist) })
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
            /* @__PURE__ */ jsx("span", { className: "font-bold text-red-600", children: formatEuro(ergebnis.steuerGesamt + ergebnis.sv.gesamt) })
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
        }) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 p-3 bg-blue-50 rounded-xl text-sm text-blue-700", children: [
          /* @__PURE__ */ jsx("strong", { children: "Hinweis:" }),
          " Die tatsächliche Steuerlast bei Zusammenveranlagung beträgt",
          " ",
          /* @__PURE__ */ jsx("strong", { children: formatEuro(ergebnis.tatsaechlicheESt) }),
          "/Jahr (Splittingtarif §26 EStG)."
        ] })
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
            /* @__PURE__ */ jsx("span", { className: "font-bold", children: "Wichtig:" }),
            /* @__PURE__ */ jsxs("span", { children: [
              "In SK V entfallen ",
              /* @__PURE__ */ jsx("strong", { children: "alle Freibeträge" }),
              " (Grundfreibetrag, AN-Pauschbetrag). Der Partner in SK III erhält dafür den doppelten Grundfreibetrag."
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📋 Steuerklassen-Übersicht nach §38b EStG" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: STEUERKLASSEN.map((sk) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
        /* @__PURE__ */ jsx("span", { className: "text-2xl", children: sk.icon }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-medium text-gray-800", children: sk.name }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: sk.beschreibung }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-400 mt-1", children: [
            "Grundfreibetrag: ",
            formatEuro(sk.grundfreibetrag),
            !sk.hatPauschbetraege && " • Keine Pauschbeträge",
            sk.splitting && " • Splittingtarif",
            sk.entlastungsbetrag && ` • +${formatEuro(sk.entlastungsbetrag)} Entlastung`
          ] })
        ] })
      ] }, sk.id)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "⚠️ Wichtige Hinweise" }),
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
            " berechnet (Splittingtarif)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Steuerklassenwechsel" }),
            " ist mehrmals pro Jahr möglich"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "⚠️" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Vor ",
            /* @__PURE__ */ jsx("strong", { children: "Elterngeld/Krankengeld" }),
            ": Steuerklasse rechtzeitig wechseln (6-12 Monate vorher)"
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
      /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-gray-500 uppercase mb-2", children: "Rechtsgrundlagen (Stand: 2026)" }),
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
            href: "https://www.gesetze-im-internet.de/estg/__38b.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "§38b EStG – Steuerklassen"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/estg/__26.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "§26 EStG – Zusammenveranlagung"
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
