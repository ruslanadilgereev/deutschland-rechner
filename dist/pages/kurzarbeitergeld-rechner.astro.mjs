/* empty css                                             */
import { c as createComponent, a as renderTemplate, r as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_v22DC8tm.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const BEITRAGSBEMESSUNGSGRENZE = 8450;
const STEUERKLASSEN = [1, 2, 3, 4, 5, 6];
const SOZIALABGABEN = {
  rentenversicherung: 0.093,
  // 9,3% AN-Anteil
  krankenversicherung: 0.073,
  // 7,3% AN-Anteil
  zusatzbeitrag_kv: 0.0145,
  // 1,45% AN-Anteil
  pflegeversicherung: 0.018,
  // 1,8% AN-Anteil
  pflegeversicherung_kinderlos: 0.024,
  // 2,4% AN-Anteil
  arbeitslosenversicherung: 0.013
  // 1,3% AN-Anteil
};
function berechneUngefaehreLohnsteuer(brutto, steuerklasse, kirchensteuer) {
  const grundfreibetrag = 1029;
  let steuerpflichtig = brutto - grundfreibetrag;
  if (steuerpflichtig < 0) return 0;
  const faktoren = {
    1: 0.2,
    2: 0.18,
    3: 0.12,
    4: 0.2,
    5: 0.3,
    6: 0.35
  };
  let steuer = steuerpflichtig * faktoren[steuerklasse];
  if (kirchensteuer) {
    steuer *= 1.085;
  }
  if (brutto > 4500) {
    steuer *= 1.055;
  }
  return Math.max(0, Math.round(steuer));
}
function berechneNetto(brutto, steuerklasse, kirchensteuer, hatKinder) {
  const bemessungsbrutto = Math.min(brutto, BEITRAGSBEMESSUNGSGRENZE);
  const rv = bemessungsbrutto * SOZIALABGABEN.rentenversicherung;
  const kv = bemessungsbrutto * (SOZIALABGABEN.krankenversicherung + SOZIALABGABEN.zusatzbeitrag_kv);
  const pv = bemessungsbrutto * (hatKinder ? SOZIALABGABEN.pflegeversicherung : SOZIALABGABEN.pflegeversicherung_kinderlos);
  const av = bemessungsbrutto * SOZIALABGABEN.arbeitslosenversicherung;
  const sozialabgaben = rv + kv + pv + av;
  const lohnsteuer = berechneUngefaehreLohnsteuer(
    brutto,
    steuerklasse,
    kirchensteuer
  );
  const netto = brutto - sozialabgaben - lohnsteuer;
  return {
    netto: Math.max(0, Math.round(netto)),
    details: {
      brutto,
      bemessungsbrutto,
      rentenversicherung: Math.round(rv),
      krankenversicherung: Math.round(kv),
      pflegeversicherung: Math.round(pv),
      arbeitslosenversicherung: Math.round(av),
      sozialabgabenGesamt: Math.round(sozialabgaben),
      lohnsteuer
    }
  };
}
function KurzarbeitergeldRechner() {
  const [bruttogehalt, setBruttogehalt] = useState(3500);
  const [arbeitszeitNormal, setArbeitszeitNormal] = useState(100);
  const [arbeitszeitReduziert, setArbeitszeitReduziert] = useState(50);
  const [steuerklasse, setSteuerklasse] = useState(1);
  const [kirchensteuer, setKirchensteuer] = useState(false);
  const [hatKinder, setHatKinder] = useState(false);
  const [kurzarbeitMonate, setKurzarbeitMonate] = useState(1);
  const ergebnis = useMemo(() => {
    const ausfallProzent = arbeitszeitNormal - arbeitszeitReduziert;
    const ausfallFaktor = ausfallProzent / 100;
    const sollBrutto = bruttogehalt;
    const sollNetto = berechneNetto(
      sollBrutto,
      steuerklasse,
      kirchensteuer,
      hatKinder
    );
    const istBrutto = bruttogehalt * (arbeitszeitReduziert / 100);
    const istNetto = berechneNetto(
      istBrutto,
      steuerklasse,
      kirchensteuer,
      hatKinder
    );
    const nettoDifferenz = sollNetto.netto - istNetto.netto;
    const kugProzent = hatKinder ? 0.67 : 0.6;
    const kug = Math.round(nettoDifferenz * kugProzent);
    const gesamtNetto = istNetto.netto + kug;
    const differenzZuNormal = sollNetto.netto - gesamtNetto;
    const differenzProzent = sollNetto.netto > 0 ? Math.round(differenzZuNormal / sollNetto.netto * 100) : 0;
    const agAnteilAusgefallen = bruttogehalt * ausfallFaktor * 0.8 * 0.2;
    return {
      // SOLL-Entgelt
      sollBrutto,
      sollNetto: sollNetto.netto,
      sollNettoDetails: sollNetto.details,
      // IST-Entgelt
      istBrutto: Math.round(istBrutto),
      istNetto: istNetto.netto,
      istNettoDetails: istNetto.details,
      // Ausfall
      ausfallProzent,
      ausfallBrutto: Math.round(bruttogehalt * ausfallFaktor),
      nettoDifferenz,
      // KuG
      kugProzent,
      kug,
      kugTaeglich: Math.round(kug / 30 * 100) / 100,
      // Gesamt
      gesamtNetto,
      differenzZuNormal,
      differenzProzent,
      // Für Arbeitgeber
      agKosten: Math.round(agAnteilAusgefallen),
      // Sonstiges
      beitragsbemessungsgrenze: BEITRAGSBEMESSUNGSGRENZE
    };
  }, [
    bruttogehalt,
    arbeitszeitNormal,
    arbeitszeitReduziert,
    steuerklasse,
    kirchensteuer,
    hatKinder,
    kurzarbeitMonate
  ]);
  const formatEuro = (n) => n.toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }) + " €";
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Monatliches Bruttogehalt (SOLL)" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Ihr normales Brutto bei voller Arbeitszeit" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: bruttogehalt,
              onChange: (e) => setBruttogehalt(Math.max(0, Number(e.target.value))),
              className: "w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
              min: "0",
              max: "15000",
              step: "50"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl", children: "€" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: bruttogehalt,
            onChange: (e) => setBruttogehalt(Number(e.target.value)),
            className: "w-full mt-3 accent-blue-500",
            min: "500",
            max: "8000",
            step: "50"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "500 €" }),
          /* @__PURE__ */ jsx("span", { children: "4.000 €" }),
          /* @__PURE__ */ jsx("span", { children: "8.000 €" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Arbeitszeitreduzierung" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Wie viel arbeiten Sie noch (in % der normalen Arbeitszeit)?" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-xl p-4 mb-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600", children: "Verbleibende Arbeit" }),
            /* @__PURE__ */ jsxs("span", { className: "text-2xl font-bold text-blue-600", children: [
              arbeitszeitReduziert,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              value: arbeitszeitReduziert,
              onChange: (e) => setArbeitszeitReduziert(Number(e.target.value)),
              className: "w-full accent-blue-500",
              min: "0",
              max: "100",
              step: "10"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
            /* @__PURE__ */ jsx("span", { children: "0% (Kurzarbeit Null)" }),
            /* @__PURE__ */ jsx("span", { children: "50%" }),
            /* @__PURE__ */ jsx("span", { children: "100% (keine)" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-2", children: [0, 25, 50, 75].map((pct) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setArbeitszeitReduziert(pct),
            className: `py-2 px-3 rounded-lg text-sm font-medium transition-all ${arbeitszeitReduziert === pct ? "bg-blue-500 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: [
              pct,
              "%"
            ]
          },
          pct
        )) }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 p-3 bg-blue-50 rounded-lg", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-blue-800", children: [
          /* @__PURE__ */ jsx("strong", { children: "Arbeitsausfall:" }),
          " ",
          ergebnis.ausfallProzent,
          "% = ",
          formatEuro(ergebnis.ausfallBrutto),
          " ",
          "Brutto",
          arbeitszeitReduziert === 0 && /* @__PURE__ */ jsx("span", { className: "block mt-1 text-blue-600", children: '→ „Kurzarbeit Null" (vollständiger Arbeitsausfall)' })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Steuerklasse" }) }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-6 gap-2", children: STEUERKLASSEN.map((sk) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setSteuerklasse(sk),
            className: `py-3 px-2 rounded-xl text-center transition-all ${steuerklasse === sk ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: /* @__PURE__ */ jsx("span", { className: "font-bold", children: sk })
          },
          sk
        )) }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 mt-2", children: [
          steuerklasse === 1 && "👤 Ledig, geschieden oder verwitwet",
          steuerklasse === 2 && "👨‍👧 Alleinerziehend mit Kind",
          steuerklasse === 3 && "💑 Verheiratet, Partner hat Steuerklasse 5",
          steuerklasse === 4 && "💑 Verheiratet, beide verdienen ähnlich",
          steuerklasse === 5 && "💑 Verheiratet, Partner hat Steuerklasse 3",
          steuerklasse === 6 && "📋 Zweit- oder Nebenjob"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Kindergeld-Anspruch?" }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setHatKinder(false),
              className: `py-4 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${!hatKinder ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-xl", children: "👤" }),
                /* @__PURE__ */ jsx("span", { children: "Ohne Kinder (60%)" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setHatKinder(true),
              className: `py-4 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${hatKinder ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-xl", children: "👨‍👧" }),
                /* @__PURE__ */ jsx("span", { children: "Mit Kindern (67%)" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-2", children: "Mit Kindern erhalten Sie 67% statt 60% der Nettoentgeltdifferenz" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setKirchensteuer(!kirchensteuer),
          className: `w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-between ${kirchensteuer ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
          children: [
            /* @__PURE__ */ jsx("span", { children: "⛪ Kirchensteuer" }),
            /* @__PURE__ */ jsx("span", { children: kirchensteuer ? "✓ Ja" : "✗ Nein" })
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl shadow-lg p-6 text-white mb-6 bg-gradient-to-br from-orange-500 to-red-600", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: "📊 Ihr voraussichtliches Kurzarbeitergeld" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuro(ergebnis.kug) }),
          /* @__PURE__ */ jsx("span", { className: "text-xl opacity-80", children: "/ Monat" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-orange-100 mt-2 text-sm", children: [
          "Das sind ",
          /* @__PURE__ */ jsxs("strong", { children: [
            Math.round(ergebnis.kugProzent * 100),
            "%"
          ] }),
          " der Nettoentgeltdifferenz (",
          formatEuro(ergebnis.nettoDifferenz),
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Ihr Gehalt (IST)" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.istNetto) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "+ Kurzarbeitergeld" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.kug) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 p-4 bg-white/20 rounded-xl backdrop-blur-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: "= Ihr Gesamteinkommen" }),
          /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold", children: formatEuro(ergebnis.gesamtNetto) })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm opacity-90 mt-2", children: [
          "Das sind",
          " ",
          /* @__PURE__ */ jsxs("strong", { children: [
            formatEuro(ergebnis.differenzZuNormal),
            " weniger (",
            ergebnis.differenzProzent,
            "%)"
          ] }),
          " ",
          "als Ihr normales Netto (",
          formatEuro(ergebnis.sollNetto),
          ")"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Berechnungsdetails" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide", children: "SOLL-Entgelt (normaler Verdienst)" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Brutto (100%)" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.sollBrutto) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-red-600", children: [
          /* @__PURE__ */ jsx("span", { children: "− Abzüge (Steuer + Sozialabgaben)" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(
            ergebnis.sollBrutto - ergebnis.sollNetto
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-gray-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "= SOLL-Netto" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.sollNetto) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide pt-4", children: "IST-Entgelt (reduzierter Verdienst)" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
            "Brutto (",
            arbeitszeitReduziert,
            "%)"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.istBrutto) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-red-600", children: [
          /* @__PURE__ */ jsx("span", { children: "− Abzüge (Steuer + Sozialabgaben)" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.istBrutto - ergebnis.istNetto) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-gray-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "= IST-Netto" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.istNetto) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide pt-4", children: "Kurzarbeitergeld-Berechnung" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "SOLL-Netto" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatEuro(ergebnis.sollNetto) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-red-600", children: [
          /* @__PURE__ */ jsx("span", { children: "− IST-Netto" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.istNetto) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "= Nettoentgeltdifferenz" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-900", children: formatEuro(ergebnis.nettoDifferenz) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
            "× Leistungssatz (",
            hatKinder ? "mit Kind" : "ohne Kind",
            ")"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-900", children: [
            Math.round(ergebnis.kugProzent * 100),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-3 bg-orange-100 -mx-6 px-6 rounded-b-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-orange-800", children: "= Kurzarbeitergeld pro Monat" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-2xl text-orange-900", children: formatEuro(ergebnis.kug) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📈 Vergleich: Normal vs. Kurzarbeit" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-green-50 rounded-xl", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-2", children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium text-green-800", children: "Normale Arbeit (100%)" }),
            /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-green-700", children: formatEuro(ergebnis.sollNetto) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "w-full bg-green-200 rounded-full h-3", children: /* @__PURE__ */ jsx("div", { className: "bg-green-500 h-3 rounded-full", style: { width: "100%" } }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-orange-50 rounded-xl", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-2", children: [
            /* @__PURE__ */ jsxs("span", { className: "font-medium text-orange-800", children: [
              "Kurzarbeit (",
              arbeitszeitReduziert,
              "%)"
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-orange-700", children: formatEuro(ergebnis.gesamtNetto) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "w-full bg-gray-200 rounded-full h-3 flex overflow-hidden", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "bg-blue-500 h-3",
                style: { width: `${ergebnis.istNetto / ergebnis.sollNetto * 100}%` },
                title: "Ihr Gehalt"
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "bg-orange-500 h-3",
                style: { width: `${ergebnis.kug / ergebnis.sollNetto * 100}%` },
                title: "KuG"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-4 mt-2 text-xs", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx("span", { className: "w-3 h-3 bg-blue-500 rounded" }),
              "Gehalt: ",
              formatEuro(ergebnis.istNetto)
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx("span", { className: "w-3 h-3 bg-orange-500 rounded" }),
              "KuG: ",
              formatEuro(ergebnis.kug)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "p-4 bg-red-50 rounded-xl", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-red-800", children: "Einkommensverlust" }),
          /* @__PURE__ */ jsxs("span", { className: "text-xl font-bold text-red-700", children: [
            "−",
            formatEuro(ergebnis.differenzZuNormal),
            " (",
            ergebnis.differenzProzent,
            "%)"
          ] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert Kurzarbeitergeld" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Leistungssatz:" }),
            " 60% der Nettoentgeltdifferenz (67% mit mindestens einem Kind)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Berechnung:" }),
            " Differenz zwischen SOLL-Netto (normaler Verdienst) und IST-Netto (reduzierter Verdienst)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Bezugsdauer:" }),
            " Maximal 12 Monate innerhalb von 24 Monaten (kann verlängert werden)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Voraussetzung:" }),
            " Mindestens 10% der Beschäftigten betroffen, erheblicher Arbeitsausfall"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Sozialversicherung:" }),
            " Sie bleiben voll sozialversichert (AG zahlt Beiträge auf fiktives Entgelt)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Steuerfrei:" }),
            " KuG ist steuerfrei, unterliegt aber dem Progressionsvorbehalt"
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
            /* @__PURE__ */ jsx("strong", { children: "Antragstellung:" }),
            " Der Arbeitgeber muss Kurzarbeit bei der Agentur für Arbeit anzeigen"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Erheblicher Arbeitsausfall:" }),
            " Muss unvermeidbar und vorübergehend sein (z.B. Auftragsmangel, Lieferengpässe)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Nebenjob:" }),
            " Einkünfte aus während der Kurzarbeit neu aufgenommenen Nebenjobs werden angerechnet"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Urlaub:" }),
            " Urlaubstage werden voll bezahlt (kein KuG während des Urlaubs)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Steuererklärung:" }),
            " KuG muss in der Steuererklärung angegeben werden (Progressionsvorbehalt)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Schätzung:" }),
            " Dieser Rechner liefert eine Orientierung – die exakte Berechnung erfolgt durch die Agentur für Arbeit"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-blue-800 mb-3", children: "🆕 Regelungen 2026" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-blue-700", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Standardregelung:" }),
            " 60% (ohne Kind) bzw. 67% (mit Kind) der Nettoentgeltdifferenz"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Bezugsdauer:" }),
            " 12 Monate (keine verlängerten Corona-Regelungen mehr)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Beitragsbemessungsgrenze:" }),
            " 8.450€/Monat bundesweit einheitlich"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Mindesterfordernisse:" }),
            " 10% der Beschäftigten betroffen, erheblicher Arbeitsausfall"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörde" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-orange-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-orange-900", children: "Agentur für Arbeit" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-orange-700 mt-1", children: "Die Bundesagentur für Arbeit ist zuständig für Kurzarbeitergeld. Der Arbeitgeber muss den Antrag stellen." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Arbeitgeber-Service" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "tel:08004555520",
                  className: "text-blue-600 hover:underline font-bold",
                  children: "0800 4 555520"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs mt-1", children: "Kostenfrei, Mo-Fr 8-18 Uhr" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Online-Anzeige" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.arbeitsagentur.de/unternehmen/finanziell/kurzarbeitergeld",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "arbeitsagentur.de →"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📋" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Für Arbeitgeber" }),
            /* @__PURE__ */ jsxs("ul", { className: "text-gray-600 mt-1 space-y-1", children: [
              /* @__PURE__ */ jsx("li", { children: "• Kurzarbeit bei der Agentur für Arbeit anzeigen" }),
              /* @__PURE__ */ jsx("li", { children: "• Antrag auf KuG stellen (nach Beginn der Kurzarbeit)" }),
              /* @__PURE__ */ jsx("li", { children: "• Arbeitszeiten und Entgelte dokumentieren" }),
              /* @__PURE__ */ jsx("li", { children: "• KuG an Arbeitnehmer auszahlen (AG ist Zahlstelle)" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-amber-50 rounded-xl text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "👷" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-amber-800", children: "Für Arbeitnehmer" }),
            /* @__PURE__ */ jsxs("ul", { className: "text-amber-700 mt-1 space-y-1", children: [
              /* @__PURE__ */ jsx("li", { children: "• Sie müssen keinen eigenen Antrag stellen" }),
              /* @__PURE__ */ jsx("li", { children: "• KuG wird vom Arbeitgeber mit dem Lohn ausgezahlt" }),
              /* @__PURE__ */ jsx("li", { children: "• Bei Fragen: Betriebsrat oder Agentur für Arbeit" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-blue-800 mb-3", children: "🔗 Das könnte Sie auch interessieren" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/arbeitslosengeld-rechner",
            className: "inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium",
            children: "📋 ALG I-Rechner →"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/buergergeld-rechner",
            className: "inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium",
            children: "🏦 Bürgergeld-Rechner →"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/brutto-netto-rechner",
            className: "inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium",
            children: "💵 Brutto-Netto-Rechner →"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gray-50 rounded-xl", children: [
      /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-gray-500 uppercase mb-2", children: "Quellen" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.arbeitsagentur.de/unternehmen/finanziell/kurzarbeitergeld",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesagentur für Arbeit – Kurzarbeitergeld"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/sgb_3/__105.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "SGB III §105 – Anspruch auf Kurzarbeitergeld"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bmas.de/DE/Arbeit/Arbeitsrecht/Kurzarbeit/kurzarbeit-artikel.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BMAS – Kurzarbeit und Kurzarbeitergeld"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.haufe.de/personal/entgelt/kurzarbeitergeld-berechnung-hoehe-und-auszahlung_78_389810.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Haufe – KuG Berechnung und Höhe"
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
const $$KurzarbeitergeldRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "Kurzarbeitergeld-Rechner 2026 \u2013 KuG H\xF6he berechnen | 60% oder 67%";
  const description = "Kurzarbeitergeld berechnen: KuG H\xF6he 2026, Nettoentgeltdifferenz, Leistungssatz 60%/67%. Kostenloser Rechner mit Vergleich Normal vs. Kurzarbeit. Jetzt berechnen!";
  const keywords = "Kurzarbeitergeld Rechner, KuG berechnen, Kurzarbeit Geld, Kurzarbeitergeld H\xF6he, Kurzarbeitergeld 2026, Kurzarbeitergeld berechnen, KuG Rechner, Kurzarbeit Rechner, Kurzarbeitergeld Berechnung, Nettoentgeltdifferenz";
  return renderTemplate(_a || (_a = __template(["", ' <script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [\n    {\n      "@type": "Question",\n      "name": "Wie berechnet sich das Kurzarbeitergeld?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "Das Kurzarbeitergeld betr\xE4gt 60% der Nettoentgeltdifferenz (67% mit Kind). Die Nettoentgeltdifferenz ist der Unterschied zwischen dem normalen Nettogehalt und dem Netto bei reduzierter Arbeitszeit."\n      }\n    },\n    {\n      "@type": "Question",\n      "name": "Muss ich als Arbeitnehmer Kurzarbeitergeld selbst beantragen?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "Nein, der Arbeitgeber muss die Kurzarbeit anzeigen und das KuG beantragen. Er zahlt es dann mit dem Gehalt aus."\n      }\n    },\n    {\n      "@type": "Question",\n      "name": "Wie lange kann man Kurzarbeitergeld beziehen?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "Die regul\xE4re Bezugsdauer betr\xE4gt 12 Monate innerhalb von 24 Monaten. In besonderen Situationen kann diese Frist verl\xE4ngert werden."\n      }\n    },\n    {\n      "@type": "Question",\n      "name": "Muss ich Kurzarbeitergeld versteuern?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "KuG ist steuerfrei, unterliegt aber dem Progressionsvorbehalt. Es erh\xF6ht den Steuersatz f\xFCr andere Eink\xFCnfte. Sie m\xFCssen eine Steuererkl\xE4rung abgeben."\n      }\n    },\n    {\n      "@type": "Question",\n      "name": "Was ist Kurzarbeit Null?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "Bei Kurzarbeit Null wird die Arbeitszeit auf 0% reduziert. Der Arbeitnehmer arbeitet nicht, bleibt aber besch\xE4ftigt und erh\xE4lt KuG auf die volle Nettoentgeltdifferenz."\n      }\n    }\n  ]\n}\n<\/script> <script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebApplication",\n  "name": "Kurzarbeitergeld-Rechner 2026",\n  "description": "Berechnen Sie Ihr Kurzarbeitergeld 2026: KuG H\xF6he bei reduzierter Arbeitszeit. Kostenloser Online-Rechner mit detaillierter Berechnung.",\n  "url": "https://deutschland-rechner.de/kurzarbeitergeld-rechner",\n  "applicationCategory": "FinanceApplication",\n  "operatingSystem": "Web",\n  "offers": {\n    "@type": "Offer",\n    "price": "0",\n    "priceCurrency": "EUR"\n  }\n}\n<\/script>'])), renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-amber-50 py-8 px-4"> <div class="max-w-2xl mx-auto"> <!-- Header --> <div class="text-center mb-8"> <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg mb-4"> <span class="text-4xl">📉</span> </div> <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
Kurzarbeitergeld-Rechner 2026
</h1> <p class="text-gray-600 max-w-lg mx-auto">
Berechnen Sie Ihr Kurzarbeitergeld: Wie viel bekommen Sie bei reduzierter Arbeitszeit?
</p> </div> <!-- Calculator Component --> ${renderComponent($$result2, "KurzarbeitergeldRechner", KurzarbeitergeldRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/KurzarbeitergeldRechner.tsx", "client:component-export": "default" })} <!-- SEO Content Section --> <div class="mt-12 bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">📚 Alles Wichtige zum Kurzarbeitergeld</h2> <div class="space-y-4 text-sm text-gray-600"> <div> <h3 class="font-semibold text-gray-800 mb-2">Was ist Kurzarbeitergeld?</h3> <p>
Kurzarbeitergeld (KuG) ist eine Leistung der Bundesagentur für Arbeit, die 
              Arbeitnehmer bei vorübergehender Reduzierung der Arbeitszeit unterstützt. 
              Es soll Entlassungen vermeiden und hilft Unternehmen, ihre Mitarbeiter 
              auch in wirtschaftlich schwierigen Zeiten zu halten.
</p> </div> <div> <h3 class="font-semibold text-gray-800 mb-2">Wie viel Kurzarbeitergeld bekomme ich?</h3> <p>
Das Kurzarbeitergeld beträgt <strong>60% der Nettoentgeltdifferenz</strong>
(67% wenn Sie mindestens ein Kind haben). Die Nettoentgeltdifferenz ist 
              der Unterschied zwischen Ihrem normalen Nettogehalt und dem Netto, das 
              Sie bei reduzierter Arbeitszeit verdienen.
</p> </div> <div> <h3 class="font-semibold text-gray-800 mb-2">Wann wird Kurzarbeitergeld gezahlt?</h3> <p>
Kurzarbeitergeld wird gezahlt, wenn der Arbeitgeber aufgrund von 
              wirtschaftlichen Gründen (z.B. Auftragsmangel), einem unabwendbaren 
              Ereignis oder behördlichen Maßnahmen die Arbeitszeit seiner 
              Mitarbeiter vorübergehend reduzieren muss.
</p> </div> <div> <h3 class="font-semibold text-gray-800 mb-2">Wie lange kann man Kurzarbeitergeld beziehen?</h3> <p>
Die reguläre Bezugsdauer beträgt <strong>12 Monate</strong> innerhalb 
              eines Zeitraums von 24 Monaten. In besonderen wirtschaftlichen 
              Situationen kann diese Frist per Verordnung verlängert werden 
              (wie z.B. während der Corona-Pandemie).
</p> </div> <div> <h3 class="font-semibold text-gray-800 mb-2">Was ist „Kurzarbeit Null"?</h3> <p>
Bei „Kurzarbeit Null" wird die Arbeitszeit auf 0% reduziert – 
              der Arbeitnehmer arbeitet gar nicht, bleibt aber im Unternehmen 
              beschäftigt. In diesem Fall erhalten Sie Kurzarbeitergeld auf 
              die volle Nettoentgeltdifferenz.
</p> </div> </div> </div> <!-- FAQ Schema --> <div class="mt-8 bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">❓ Häufige Fragen zum Kurzarbeitergeld</h2> <div class="space-y-4"> <details class="group"> <summary class="cursor-pointer font-medium text-gray-800 hover:text-orange-600">
Muss ich als Arbeitnehmer selbst Kurzarbeitergeld beantragen?
</summary> <p class="mt-2 text-sm text-gray-600 pl-4">
Nein, der <strong>Arbeitgeber</strong> muss die Kurzarbeit bei der 
              Agentur für Arbeit anzeigen und das Kurzarbeitergeld beantragen. 
              Er zahlt Ihnen das KuG dann zusammen mit Ihrem regulären Gehalt aus.
</p> </details> <details class="group"> <summary class="cursor-pointer font-medium text-gray-800 hover:text-orange-600">
Kann ich während der Kurzarbeit einen Nebenjob annehmen?
</summary> <p class="mt-2 text-sm text-gray-600 pl-4">
Grundsätzlich ja, aber Einkommen aus einem <strong>während der 
              Kurzarbeit neu aufgenommenen</strong> Nebenjob wird auf das 
              Kurzarbeitergeld angerechnet. Ein bereits vor der Kurzarbeit 
              bestehender Nebenjob bleibt in der Regel anrechnungsfrei.
</p> </details> <details class="group"> <summary class="cursor-pointer font-medium text-gray-800 hover:text-orange-600">
Muss ich Kurzarbeitergeld versteuern?
</summary> <p class="mt-2 text-sm text-gray-600 pl-4">
Das Kurzarbeitergeld selbst ist <strong>steuerfrei</strong>, unterliegt 
              aber dem <strong>Progressionsvorbehalt</strong>. Das bedeutet, es erhöht 
              den Steuersatz für Ihre anderen Einkünfte. Sie sind verpflichtet, 
              eine Steuererklärung abzugeben.
</p> </details> <details class="group"> <summary class="cursor-pointer font-medium text-gray-800 hover:text-orange-600">
Was passiert mit meiner Sozialversicherung bei Kurzarbeit?
</summary> <p class="mt-2 text-sm text-gray-600 pl-4">
Sie bleiben <strong>voll sozialversichert</strong>. Der Arbeitgeber 
              zahlt auf das ausgefallene Arbeitsentgelt (80%) weiterhin die 
              Sozialversicherungsbeiträge. Die Zeiten der Kurzarbeit zählen 
              vollständig für die Rentenversicherung.
</p> </details> <details class="group"> <summary class="cursor-pointer font-medium text-gray-800 hover:text-orange-600">
Kann mir während der Kurzarbeit gekündigt werden?
</summary> <p class="mt-2 text-sm text-gray-600 pl-4">
Ja, Kurzarbeit bedeutet keinen generellen <strong>Kündigungsschutz</strong>. 
              Eine Kündigung während der Kurzarbeit ist grundsätzlich möglich, 
              allerdings muss der Arbeitgeber die normalen Kündigungsfristen 
              und -regeln einhalten.
</p> </details> </div> </div> <!-- Back Link --> <div class="mt-8 text-center"> <a href="/" class="inline-flex items-center gap-2 text-orange-600 hover:text-orange-800 font-medium">
← Alle Rechner anzeigen
</a> </div> </div> </main> ` }));
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/kurzarbeitergeld-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/kurzarbeitergeld-rechner.astro";
const $$url = "/kurzarbeitergeld-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$KurzarbeitergeldRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
