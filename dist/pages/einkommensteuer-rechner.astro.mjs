/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DmT1JwUR.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const GRUNDFREIBETRAG_2026 = 12348;
const TARIFZONEN_2026 = {
  zone1Ende: 17799,
  // Ende Zone 1 (14-24%)
  zone2Ende: 69878,
  // Ende Zone 2 (24-42%)
  zone3Ende: 277825
  // Ende Zone 3 (42%)
  // darüber: 45% Reichensteuer
};
const PAUSCHBETRAEGE = {
  werbungskosten: 1230,
  // Arbeitnehmer-Pauschbetrag
  sonderausgaben: 36,
  // Sparerpauschbetrag (verheiratet)
  behinderung: {
    20: 384,
    30: 620,
    40: 860,
    50: 1140,
    60: 1440,
    70: 1780,
    80: 2120,
    90: 2460,
    100: 2840,
    hilflos: 7400
    // GdB 100 + Merkzeichen H, Bl, TBl
  },
  // Pendlerpauschale 2026: Einheitlich 38 Cent ab erstem Kilometer!
  // (Vorher: 30¢ bis 20km, 38¢ ab 21km - ab 01.01.2026 vereinheitlicht)
  entfernungspauschale: 0.38,
  // 38 Cent pro km ab km 1 (2026)
  homeoffice: 6,
  // pro Tag, max 1260 €/Jahr (210 Tage)
  homeofficeMax: 1260
};
const VERANLAGUNGSARTEN = [
  { wert: "single", label: "Einzelveranlagung", faktor: 1 },
  { wert: "zusammen", label: "Zusammenveranlagung (verheiratet)", faktor: 2 }
];
function berechneEinkommensteuer(zvE, verheiratet) {
  const faktor = verheiratet ? 2 : 1;
  const zvEHalb = zvE / faktor;
  if (zvEHalb <= 0) return 0;
  let steuer = 0;
  if (zvEHalb <= GRUNDFREIBETRAG_2026) {
    steuer = 0;
  } else if (zvEHalb <= TARIFZONEN_2026.zone1Ende) {
    const y = (zvEHalb - GRUNDFREIBETRAG_2026) / 1e4;
    steuer = (933.52 * y + 1400) * y;
  } else if (zvEHalb <= TARIFZONEN_2026.zone2Ende) {
    const z = (zvEHalb - TARIFZONEN_2026.zone1Ende) / 1e4;
    steuer = (176.64 * z + 2397) * z + 1015.13;
  } else if (zvEHalb <= TARIFZONEN_2026.zone3Ende) {
    steuer = 0.42 * zvEHalb - 10911.92;
  } else {
    steuer = 0.45 * zvEHalb - 18918.79;
  }
  return Math.round(steuer * faktor);
}
function berechneDurchschnittssteuersatz(steuer, zvE) {
  if (zvE <= 0) return 0;
  return steuer / zvE * 100;
}
function berechneGrenzsteuersatz(zvE, verheiratet) {
  const faktor = verheiratet ? 2 : 1;
  const zvEHalb = zvE / faktor;
  if (zvEHalb <= GRUNDFREIBETRAG_2026) return 0;
  if (zvEHalb <= TARIFZONEN_2026.zone1Ende) {
    const y = (zvEHalb - GRUNDFREIBETRAG_2026) / 1e4;
    return Math.min(24, 14 + (2 * 933.52 * y + 1400) / 100);
  }
  if (zvEHalb <= TARIFZONEN_2026.zone2Ende) {
    const z = (zvEHalb - TARIFZONEN_2026.zone1Ende) / 1e4;
    return Math.min(42, 24 + (2 * 176.64 * z + 2397) / 100);
  }
  if (zvEHalb <= TARIFZONEN_2026.zone3Ende) return 42;
  return 45;
}
function berechneSoli(einkommensteuer, verheiratet) {
  const freigrenze = verheiratet ? 36260 : 18130;
  const milderungszone = verheiratet ? 66126 : 33063;
  if (einkommensteuer <= freigrenze) return 0;
  if (einkommensteuer <= milderungszone) {
    return Math.round(Math.min(0.055 * einkommensteuer, 0.119 * (einkommensteuer - freigrenze)));
  }
  return Math.round(einkommensteuer * 0.055);
}
function berechneKirchensteuer(einkommensteuer, satz) {
  return Math.round(einkommensteuer * satz);
}
function EinkommensteuerRechner() {
  const [bruttoArbeit, setBruttoArbeit] = useState(55e3);
  const [kapitalertraege, setKapitalertraege] = useState(0);
  const [vermietung, setVermietung] = useState(0);
  const [selbststaendig, setSelbststaendig] = useState(0);
  const [sonstige, setSonstige] = useState(0);
  const [werbungskosten, setWerbungskosten] = useState(0);
  const [pendlerKm, setPendlerKm] = useState(0);
  const [pendlerTage, setPendlerTage] = useState(220);
  const [homeofficeTage, setHomeofficeTage] = useState(0);
  const [sonderausgaben, setSonderausgaben] = useState(0);
  const [vorsorge, setVorsorge] = useState(0);
  const [spenden, setSpenden] = useState(0);
  const [aussergewoehnlich, setAussergewoehnlich] = useState(0);
  const [veranlagung, setVeranlagung] = useState("single");
  const [kirchensteuerSatz, setKirchensteuerSatz] = useState(0);
  const [kinderfreibetraege, setKinderfreibetraege] = useState(0);
  const [behinderungsgrad, setBehinderungsgrad] = useState(0);
  const ergebnis = useMemo(() => {
    const verheiratet = veranlagung === "zusammen";
    const einkuenfteGesamt = bruttoArbeit + kapitalertraege + vermietung + selbststaendig + sonstige;
    let pendlerpauschale = 0;
    if (pendlerKm > 0 && pendlerTage > 0) {
      pendlerpauschale = pendlerKm * PAUSCHBETRAEGE.entfernungspauschale * pendlerTage;
    }
    const homeoffice = Math.min(homeofficeTage * PAUSCHBETRAEGE.homeoffice, PAUSCHBETRAEGE.homeofficeMax);
    const werbungskostenEffektiv = Math.max(
      PAUSCHBETRAEGE.werbungskosten,
      werbungskosten + pendlerpauschale + homeoffice
    );
    const sonderausgabenEffektiv = Math.max(
      PAUSCHBETRAEGE.sonderausgaben,
      sonderausgaben + vorsorge + spenden
    );
    let behinderungsPauschbetrag = 0;
    if (behinderungsgrad >= 20) {
      behinderungsPauschbetrag = PAUSCHBETRAEGE.behinderung[behinderungsgrad] || 0;
    }
    const kinderfreibetragWert = kinderfreibetraege * 9756;
    const abzuegeGesamt = werbungskostenEffektiv + sonderausgabenEffektiv + aussergewoehnlich + behinderungsPauschbetrag;
    const zvEOhneKinder = Math.max(0, einkuenfteGesamt - abzuegeGesamt);
    const zvE = Math.max(0, einkuenfteGesamt - abzuegeGesamt - kinderfreibetragWert);
    const einkommensteuerOhneKinder = berechneEinkommensteuer(zvEOhneKinder, verheiratet);
    const einkommensteuerMitKinder = berechneEinkommensteuer(zvE, verheiratet);
    const kindergeldJahr = kinderfreibetraege * 3108;
    const steuerersparnisKinderfreibetrag = einkommensteuerOhneKinder - einkommensteuerMitKinder;
    const kinderfreibetragGuenstiger = steuerersparnisKinderfreibetrag > kindergeldJahr;
    const einkommensteuer = kinderfreibetragGuenstiger ? einkommensteuerMitKinder : einkommensteuerOhneKinder;
    const finalZvE = kinderfreibetragGuenstiger ? zvE : zvEOhneKinder;
    const soli = berechneSoli(einkommensteuer, verheiratet);
    const kirchensteuer = berechneKirchensteuer(einkommensteuer, kirchensteuerSatz);
    const steuerGesamt = einkommensteuer + soli + kirchensteuer;
    const durchschnittssteuersatz = berechneDurchschnittssteuersatz(einkommensteuer, finalZvE);
    const grenzsteuersatz = berechneGrenzsteuersatz(finalZvE, verheiratet);
    const effektiverSteuersatz = einkuenfteGesamt > 0 ? steuerGesamt / einkuenfteGesamt * 100 : 0;
    return {
      // Einkünfte
      einkuenfteGesamt,
      // Abzüge
      werbungskostenEffektiv,
      pendlerpauschale: Math.round(pendlerpauschale),
      homeoffice,
      sonderausgabenEffektiv,
      behinderungsPauschbetrag,
      abzuegeGesamt,
      // Kinderfreibetrag
      kinderfreibetragWert,
      kindergeldJahr,
      steuerersparnisKinderfreibetrag,
      kinderfreibetragGuenstiger,
      // zvE
      zvE: finalZvE,
      // Steuern
      einkommensteuer,
      soli,
      kirchensteuer,
      steuerGesamt,
      // Steuersätze
      durchschnittssteuersatz,
      grenzsteuersatz,
      effektiverSteuersatz,
      // Netto
      nachSteuern: einkuenfteGesamt - steuerGesamt,
      monatlichNachSteuern: Math.round((einkuenfteGesamt - steuerGesamt) / 12)
    };
  }, [
    bruttoArbeit,
    kapitalertraege,
    vermietung,
    selbststaendig,
    sonstige,
    werbungskosten,
    pendlerKm,
    pendlerTage,
    homeofficeTage,
    sonderausgaben,
    vorsorge,
    spenden,
    aussergewoehnlich,
    veranlagung,
    kirchensteuerSatz,
    kinderfreibetraege,
    behinderungsgrad
  ]);
  const formatEuro = (n) => n.toLocaleString("de-DE") + " €";
  const formatProzent = (n) => n.toFixed(1).replace(".", ",") + " %";
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("h3", { className: "font-bold text-gray-800 mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xl", children: "💰" }),
        " Einkünfte (Jahresbetrag)"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Bruttoarbeitslohn (vor SV-Abzügen)" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: bruttoArbeit,
                onChange: (e) => setBruttoArbeit(Math.max(0, Number(e.target.value))),
                className: "w-full text-xl font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
                min: "0",
                step: "1000"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400", children: "€" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              min: "0",
              max: "200000",
              step: "1000",
              value: bruttoArbeit,
              onChange: (e) => setBruttoArbeit(Number(e.target.value)),
              className: "w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Kapitalerträge" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: kapitalertraege,
                  onChange: (e) => setKapitalertraege(Math.max(0, Number(e.target.value))),
                  className: "w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
                  min: "0"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm", children: "€" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Vermietung & Verpachtung" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: vermietung,
                  onChange: (e) => setVermietung(Number(e.target.value)),
                  className: "w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm", children: "€" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Negative Werte = Verlust" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Selbstständige Tätigkeit" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: selbststaendig,
                  onChange: (e) => setSelbststaendig(Number(e.target.value)),
                  className: "w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm", children: "€" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Sonstige Einkünfte" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: sonstige,
                  onChange: (e) => setSonstige(Math.max(0, Number(e.target.value))),
                  className: "w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
                  min: "0"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm", children: "€" })
            ] })
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
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Veranlagungsart" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3", children: VERANLAGUNGSARTEN.map((v) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setVeranlagung(v.wert),
              className: `py-3 px-4 rounded-xl font-medium transition-all ${veranlagung === v.wert ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: v.label
            },
            v.wert
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Kinder (für Günstigerprüfung)" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                value: kinderfreibetraege,
                onChange: (e) => setKinderfreibetraege(Number(e.target.value)),
                className: "w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
                children: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((n) => /* @__PURE__ */ jsxs("option", { value: n, children: [
                  n,
                  " ",
                  n === 1 ? "Kind" : "Kinder"
                ] }, n))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Kirchensteuer" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: kirchensteuerSatz,
                onChange: (e) => setKirchensteuerSatz(Number(e.target.value)),
                className: "w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
                children: [
                  /* @__PURE__ */ jsx("option", { value: 0, children: "Keine" }),
                  /* @__PURE__ */ jsx("option", { value: 0.08, children: "8% (BY, BW)" }),
                  /* @__PURE__ */ jsx("option", { value: 0.09, children: "9% (restliche Bundesländer)" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Grad der Behinderung (GdB)" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: behinderungsgrad,
                onChange: (e) => setBehinderungsgrad(Number(e.target.value)),
                className: "w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
                children: [
                  /* @__PURE__ */ jsx("option", { value: 0, children: "Keine" }),
                  [20, 30, 40, 50, 60, 70, 80, 90, 100].map((n) => /* @__PURE__ */ jsxs("option", { value: n, children: [
                    n,
                    "%"
                  ] }, n))
                ]
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("h3", { className: "font-bold text-gray-800 mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📋" }),
        " Werbungskosten"
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500 mb-4", children: [
        "Pauschbetrag: ",
        formatEuro(PAUSCHBETRAEGE.werbungskosten),
        " – wird automatisch angesetzt wenn günstiger"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Entfernung Wohnung-Arbeit" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: pendlerKm,
                  onChange: (e) => setPendlerKm(Math.max(0, Number(e.target.value))),
                  className: "w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
                  min: "0"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm", children: "km" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Arbeitstage/Jahr" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: pendlerTage,
                onChange: (e) => setPendlerTage(Math.min(365, Math.max(0, Number(e.target.value)))),
                className: "w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
                min: "0",
                max: "365"
              }
            )
          ] })
        ] }),
        pendlerKm > 0 && /* @__PURE__ */ jsxs("p", { className: "text-sm text-green-600 bg-green-50 p-2 rounded-lg", children: [
          "📍 Pendlerpauschale: ",
          formatEuro(ergebnis.pendlerpauschale),
          /* @__PURE__ */ jsx("span", { className: "block text-xs mt-1", children: "2026: Einheitlich 0,38 €/km ab dem ersten Kilometer" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Homeoffice-Tage/Jahr" }),
            /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: homeofficeTage,
                onChange: (e) => setHomeofficeTage(Math.min(210, Math.max(0, Number(e.target.value)))),
                className: "w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
                min: "0",
                max: "210"
              }
            ) }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Max. 210 Tage à 6 €" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Weitere Werbungskosten" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: werbungskosten,
                  onChange: (e) => setWerbungskosten(Math.max(0, Number(e.target.value))),
                  className: "w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
                  min: "0"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm", children: "€" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("h3", { className: "font-bold text-gray-800 mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🧾" }),
        " Sonderausgaben & Abzüge"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Vorsorgeaufwendungen" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: vorsorge,
                onChange: (e) => setVorsorge(Math.max(0, Number(e.target.value))),
                className: "w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
                min: "0"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm", children: "€" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Riester, Rürup, etc." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Spenden" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: spenden,
                onChange: (e) => setSpenden(Math.max(0, Number(e.target.value))),
                className: "w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
                min: "0"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm", children: "€" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Sonstige Sonderausgaben" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: sonderausgaben,
                onChange: (e) => setSonderausgaben(Math.max(0, Number(e.target.value))),
                className: "w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
                min: "0"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm", children: "€" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Außergewöhnliche Belastungen" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: aussergewoehnlich,
                onChange: (e) => setAussergewoehnlich(Math.max(0, Number(e.target.value))),
                className: "w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
                min: "0"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm", children: "€" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Krankheitskosten, Pflege, etc." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-blue-200 mb-1", children: "Einkommensteuer 2026" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-baseline gap-2", children: /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuro(ergebnis.steuerGesamt) }) }),
        /* @__PURE__ */ jsx("p", { className: "text-blue-200 text-sm mt-1", children: "Gesamtsteuerlast inkl. Soli & Kirchensteuer" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-3 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-blue-200 text-xs block", children: "Grenzsteuersatz" }),
          /* @__PURE__ */ jsx("span", { className: "text-xl font-bold", children: formatProzent(ergebnis.grenzsteuersatz) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-3 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-blue-200 text-xs block", children: "Durchschnitt" }),
          /* @__PURE__ */ jsx("span", { className: "text-xl font-bold", children: formatProzent(ergebnis.durchschnittssteuersatz) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-3 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-blue-200 text-xs block", children: "Effektiv" }),
          /* @__PURE__ */ jsx("span", { className: "text-xl font-bold", children: formatProzent(ergebnis.effektiverSteuersatz) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Berechnung im Detail" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "Summe der Einkünfte" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.einkuenfteGesamt) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-orange-600 font-medium mb-2", children: [
            /* @__PURE__ */ jsx("span", { children: "Abzüge gesamt" }),
            /* @__PURE__ */ jsxs("span", { children: [
              "− ",
              formatEuro(ergebnis.abzuegeGesamt)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "pl-4 space-y-1 text-sm text-gray-500", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Werbungskosten" }),
              /* @__PURE__ */ jsxs("span", { children: [
                "− ",
                formatEuro(ergebnis.werbungskostenEffektiv)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Sonderausgaben" }),
              /* @__PURE__ */ jsxs("span", { children: [
                "− ",
                formatEuro(ergebnis.sonderausgabenEffektiv)
              ] })
            ] }),
            aussergewoehnlich > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Außergewöhnliche Belastungen" }),
              /* @__PURE__ */ jsxs("span", { children: [
                "− ",
                formatEuro(aussergewoehnlich)
              ] })
            ] }),
            ergebnis.behinderungsPauschbetrag > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Behinderten-Pauschbetrag" }),
              /* @__PURE__ */ jsxs("span", { children: [
                "− ",
                formatEuro(ergebnis.behinderungsPauschbetrag)
              ] })
            ] })
          ] })
        ] }),
        kinderfreibetraege > 0 && /* @__PURE__ */ jsx("div", { className: `p-3 rounded-xl ${ergebnis.kinderfreibetragGuenstiger ? "bg-green-50" : "bg-gray-50"}`, children: /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
          /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-700 mb-1", children: "👶 Günstigerprüfung Kinder:" }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { children: "Kindergeld (wird ausgezahlt)" }),
            /* @__PURE__ */ jsxs("span", { children: [
              formatEuro(ergebnis.kindergeldJahr),
              "/Jahr"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { children: "Steuerersparnis Kinderfreibetrag" }),
            /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.steuerersparnisKinderfreibetrag) })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 font-medium text-green-700", children: ergebnis.kinderfreibetragGuenstiger ? "✓ Kinderfreibetrag ist günstiger – wird angerechnet" : "✓ Kindergeld ist günstiger – keine Verrechnung" })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-2 border-b border-gray-200 bg-gray-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-800", children: "Zu versteuerndes Einkommen (zvE)" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.zvE) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-red-600 font-medium mb-2", children: [
            /* @__PURE__ */ jsx("span", { children: "Steuern" }),
            /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.steuerGesamt) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "pl-4 space-y-1 text-sm text-gray-500", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Einkommensteuer" }),
              /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.einkommensteuer) })
            ] }),
            ergebnis.soli > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Solidaritätszuschlag" }),
              /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.soli) })
            ] }),
            ergebnis.kirchensteuer > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Kirchensteuer" }),
              /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.kirchensteuer) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-3 border-t-2 border-green-200 bg-green-50 -mx-6 px-6 rounded-b-2xl", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold text-green-800 text-lg", children: "Nach Steuern" }),
            /* @__PURE__ */ jsx("span", { className: "text-green-600 text-sm block", children: "(vor Sozialversicherung)" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold text-green-600 text-xl block", children: formatEuro(ergebnis.nachSteuern) }),
            /* @__PURE__ */ jsxs("span", { className: "text-green-500 text-sm", children: [
              formatEuro(ergebnis.monatlichNachSteuern),
              "/Monat"
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-green-800 mb-3", children: "🆕 Neu in 2026 – Steuerliche Änderungen" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-green-700", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✅" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Grundfreibetrag" }),
            " auf 12.348 € erhöht (+252 €)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✅" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Kindergeld" }),
            " auf 259 €/Monat erhöht (+4 €)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✅" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Kinderfreibetrag" }),
            " auf 9.756 €/Kind erhöht (+156 €)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✅" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Pendlerpauschale" }),
            ": Jetzt 38 Cent ab dem 1. Kilometer (vorher erst ab km 21)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✅" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Aktivrente" }),
            ": Bis 2.000 €/Monat steuerfrei für Rentner mit Job"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-green-600 mt-3", children: [
        "Quelle: ",
        /* @__PURE__ */ jsx("a", { href: "https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/das-aendert-sich-2026.html", target: "_blank", rel: "noopener noreferrer", className: "underline", children: "BMF – Das ändert sich 2026" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ Wichtige Hinweise" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsxs("strong", { children: [
              "Grundfreibetrag 2026: ",
              formatEuro(GRUNDFREIBETRAG_2026)
            ] }),
            " (steuerfrei)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Splittingtarif" }),
            " bei Zusammenveranlagung (Ehegattensplitting)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Günstigerprüfung" }),
            ": Kindergeld vs. Kinderfreibetrag automatisch"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Kinderfreibetrag 2026: ",
            /* @__PURE__ */ jsx("strong", { children: "9.756 €/Kind" }),
            " (6.828 € + 2.928 € BEA)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Soli" }),
            " nur noch bei hohen Einkommen (Freigrenze: ",
            formatEuro(veranlagung === "zusammen" ? 36260 : 18130),
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "⚠️" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Diese Berechnung dient der ",
            /* @__PURE__ */ jsx("strong", { children: "Orientierung" }),
            " – für die Steuererklärung nutzen Sie ELSTER"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörden & Hotlines" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📋" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Finanzamt" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Einkommensteuererklärung" }),
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
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "⚖️" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Lohnsteuerhilfeverein" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Beratung für Arbeitnehmer" }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "https://www.lohnsteuerhilfe.net",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "text-blue-600 hover:underline",
                children: "lohnsteuerhilfe.net →"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🧮" }),
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
      /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-gray-500 uppercase mb-2", children: "Quellen & Rechtsgrundlagen (Stand: 2026)" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/das-aendert-sich-2026.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BMF – Steuerliche Änderungen 2026"
          }
        ),
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
            href: "https://www.bmf-steuerrechner.de",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BMF – Offizieller Steuerrechner"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bundesfinanzministerium.de",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesministerium der Finanzen"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/estg/__33.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "§33 EStG – Außergewöhnliche Belastungen"
          }
        )
      ] })
    ] })
  ] });
}

const $$EinkommensteuerRechner = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Einkommensteuer-Rechner 2026 \u2013 Steuerlast berechnen | Grundfreibetrag 12.348\u20AC", "description": "Einkommensteuer-Rechner 2026: Berechne deine Steuerlast nach \xA732a EStG. Grundfreibetrag 12.348\u20AC, Kinderfreibetrag 9.756\u20AC, Pendlerpauschale 38\xA2 ab km 1, Kindergeld 259\u20AC. G\xFCnstigerpr\xFCfung inklusive.", "keywords": "Einkommensteuer Rechner 2026, Steuerrechner, Einkommensteuer berechnen, Steuerlast, zvE berechnen, Grundfreibetrag 12348, Splittingtarif, Kinderfreibetrag 9756, Kindergeld 259 Euro, Grenzsteuersatz, Durchschnittssteuersatz, Pendlerpauschale 38 Cent, Homeoffice-Pauschale, Werbungskosten, Sonderausgaben" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen pb-8"> <!-- Header mit Zurück-Button --> <header class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>
Alle Rechner
</a> <div class="flex items-center gap-3"> <span class="text-4xl">🧾</span> <div> <h1 class="text-2xl font-bold">Einkommensteuer-Rechner</h1> <p class="text-blue-200 text-sm">Stand: 2026 (§32a EStG)</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ${renderComponent($$result2, "EinkommensteuerRechner", EinkommensteuerRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/EinkommensteuerRechner", "client:component-export": "default" })} </div> </main> ` })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/einkommensteuer-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/einkommensteuer-rechner.astro";
const $$url = "/einkommensteuer-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$EinkommensteuerRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
