/* empty css                                             */
import { c as createComponent, a as renderTemplate, r as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DmT1JwUR.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const BEITRAGSBEMESSUNGSGRENZE = 8450;
const STEUERKLASSEN = [1, 2, 3, 4, 5, 6];
const ANSPRUCHSDAUER_TABELLE = [
  { beschaeftigung: 12, standard: 6, alter50: 6, alter55: 6, alter58: 6 },
  { beschaeftigung: 16, standard: 8, alter50: 8, alter55: 8, alter58: 8 },
  { beschaeftigung: 20, standard: 10, alter50: 10, alter55: 10, alter58: 10 },
  { beschaeftigung: 24, standard: 12, alter50: 12, alter55: 12, alter58: 12 },
  { beschaeftigung: 30, standard: 12, alter50: 15, alter55: 15, alter58: 15 },
  { beschaeftigung: 36, standard: 12, alter50: 18, alter55: 18, alter58: 18 },
  { beschaeftigung: 48, standard: 12, alter50: 18, alter55: 22, alter58: 24 }
];
const SOZIALABGABEN = {
  rentenversicherung: 0.093,
  // 9,3% AN-Anteil (18,6% / 2)
  krankenversicherung: 0.073,
  // 7,3% AN-Anteil (14,6% / 2)
  zusatzbeitrag_kv: 0.0145,
  // 2026 durchschnittlich 2,9% → 1,45% AN-Anteil
  pflegeversicherung: 0.018,
  // 2026: 1,8% AN-Anteil (3,6% / 2)
  pflegeversicherung_kinderlos: 0.024,
  // 2026: 2,4% AN-Anteil (3,6% + 1,2% Kinderlosenzuschlag = 4,8% → 2,4% AN)
  arbeitslosenversicherung: 0.013
  // 1,3% AN-Anteil (2,6% / 2)
};
function berechneUngefaehreLohnsteuer(brutto, steuerklasse, kirchensteuer) {
  const grundfreibetrag = 1029;
  let steuerpflichtig = brutto - grundfreibetrag;
  if (steuerpflichtig < 0) return 0;
  const faktoren = {
    1: 0.2,
    // Ledig, Standard
    2: 0.18,
    // Alleinerziehend (Entlastungsbetrag)
    3: 0.12,
    // Verheiratet, Alleinverdiener (Splitting-Vorteil)
    4: 0.2,
    // Verheiratet, beide verdienen ähnlich
    5: 0.3,
    // Verheiratet, Zweitverdiener (höhere Belastung)
    6: 0.35
    // Nebenjob (höchste Belastung)
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
  const lohnsteuer = berechneUngefaehreLohnsteuer(brutto, steuerklasse, kirchensteuer);
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
function berechneAnspruchsdauer(beschaeftigungMonate, alter) {
  const tabelle = [...ANSPRUCHSDAUER_TABELLE].reverse();
  for (const zeile of tabelle) {
    if (beschaeftigungMonate >= zeile.beschaeftigung) {
      if (alter >= 58) return zeile.alter58;
      if (alter >= 55) return zeile.alter55;
      if (alter >= 50) return zeile.alter50;
      return zeile.standard;
    }
  }
  return 0;
}
function ArbeitslosengeldRechner() {
  const [bruttogehalt, setBruttogehalt] = useState(3e3);
  const [steuerklasse, setSteuerklasse] = useState(1);
  const [kirchensteuer, setKirchensteuer] = useState(false);
  const [hatKinder, setHatKinder] = useState(false);
  const [alter, setAlter] = useState(35);
  const [beschaeftigungMonate, setBeschaeftigungMonate] = useState(24);
  const ergebnis = useMemo(() => {
    const { netto, details } = berechneNetto(bruttogehalt, steuerklasse, kirchensteuer, hatKinder);
    const alg1Prozent = hatKinder ? 0.67 : 0.6;
    const alg1Monatlich = Math.round(netto * alg1Prozent);
    const alg1Taeglich = Math.round(alg1Monatlich / 30 * 100) / 100;
    const anspruchsdauer = berechneAnspruchsdauer(beschaeftigungMonate, alter);
    const hatAnspruch = beschaeftigungMonate >= 12 && anspruchsdauer > 0;
    const alg1Gesamt = alg1Monatlich * anspruchsdauer;
    const differenzZuNetto = netto - alg1Monatlich;
    const differenzProzent = Math.round(differenzZuNetto / netto * 100);
    return {
      // Bemessungsentgelt
      bruttogehalt,
      bemessungsbrutto: details.bemessungsbrutto,
      netto,
      nettoDetails: details,
      // ALG I
      alg1Prozent,
      alg1Monatlich,
      alg1Taeglich,
      alg1Gesamt,
      // Anspruch
      hatAnspruch,
      anspruchsdauer,
      beschaeftigungMonate,
      // Differenz
      differenzZuNetto,
      differenzProzent,
      // Sonstiges (BBG bundesweit einheitlich seit 2025)
      beitragsbemessungsgrenze: BEITRAGSBEMESSUNGSGRENZE
    };
  }, [bruttogehalt, steuerklasse, kirchensteuer, hatKinder, alter, beschaeftigungMonate]);
  const formatEuro = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Monatliches Bruttogehalt" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Durchschnitt der letzten 12 Monate" })
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
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Steuerklasse" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Ihre aktuelle Lohnsteuerklasse" })
        ] }),
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
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-2", children: "Mit Kindern erhalten Sie 67% statt 60% des Nettoentgelts" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Ihr Alter" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Für die Berechnung der Anspruchsdauer" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setAlter(Math.max(18, alter - 1)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors",
              children: "−"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "text-center px-6", children: [
            /* @__PURE__ */ jsx("div", { className: "text-4xl font-bold text-gray-800", children: alter }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: "Jahre" })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setAlter(Math.min(67, alter + 1)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors",
              children: "+"
            }
          )
        ] }),
        alter >= 50 && /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-600 mt-2 text-center", children: "ℹ️ Ab 50 Jahren: Verlängerte Anspruchsdauer möglich" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Versicherungspflichtige Beschäftigung" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "In den letzten 30 Monaten (2,5 Jahre)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setBeschaeftigungMonate(Math.max(0, beschaeftigungMonate - 1)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors",
              children: "−"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "text-center px-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-4xl font-bold text-gray-800", children: beschaeftigungMonate }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: "Monate" })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setBeschaeftigungMonate(Math.min(48, beschaeftigungMonate + 1)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors",
              children: "+"
            }
          )
        ] }),
        beschaeftigungMonate < 12 && /* @__PURE__ */ jsx("p", { className: "text-sm text-amber-600 mt-2 text-center", children: "⚠️ Mindestens 12 Monate erforderlich für ALG I" })
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
    /* @__PURE__ */ jsxs("div", { className: `rounded-2xl shadow-lg p-6 text-white mb-6 ${ergebnis.hatAnspruch ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-gradient-to-br from-gray-400 to-gray-500"}`, children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: ergebnis.hatAnspruch ? "📋 Ihr voraussichtliches Arbeitslosengeld I" : "❌ Kein ALG I Anspruch" }),
      ergebnis.hatAnspruch ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuro(ergebnis.alg1Monatlich) }),
            /* @__PURE__ */ jsx("span", { className: "text-xl opacity-80", children: "/ Monat" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-blue-100 mt-2 text-sm", children: [
            "Das sind ",
            /* @__PURE__ */ jsxs("strong", { children: [
              Math.round(ergebnis.alg1Prozent * 100),
              "%"
            ] }),
            " Ihres Nettoentgelts (",
            formatEuro(ergebnis.netto),
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Pro Tag" }),
            /* @__PURE__ */ jsxs("div", { className: "text-xl font-bold", children: [
              ergebnis.alg1Taeglich.toFixed(2),
              " €"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Anspruchsdauer" }),
            /* @__PURE__ */ jsxs("div", { className: "text-xl font-bold", children: [
              ergebnis.anspruchsdauer,
              " Mon."
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Gesamt max." }),
            /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.alg1Gesamt) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm", children: /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
          /* @__PURE__ */ jsx("strong", { children: "Differenz zum bisherigen Netto:" }),
          " -",
          formatEuro(ergebnis.differenzZuNetto),
          "(",
          ergebnis.differenzProzent,
          "% weniger)"
        ] }) })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "py-4", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-white/90", children: [
          "Mit ",
          /* @__PURE__ */ jsxs("strong", { children: [
            beschaeftigungMonate,
            " Monaten"
          ] }),
          " versicherungspflichtiger Beschäftigung haben Sie keinen Anspruch auf ALG I."
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-3 text-sm text-white/70", children: [
          "Für ALG I sind mindestens ",
          /* @__PURE__ */ jsx("strong", { children: "12 Monate" }),
          " versicherungspflichtige Beschäftigung in den letzten 30 Monaten (Rahmenfrist) erforderlich."
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 text-sm text-white/70", children: [
          "Alternativ können Sie ",
          /* @__PURE__ */ jsx("a", { href: "/buergergeld-rechner", className: "underline", children: "Bürgergeld" }),
          " beantragen."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Berechnungsdetails" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide", children: "Bemessungsentgelt (pauschalisiertes Netto)" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Bruttogehalt (monatlich)" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.bruttogehalt) })
        ] }),
        ergebnis.bruttogehalt > ergebnis.beitragsbemessungsgrenze && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-amber-600", children: [
          /* @__PURE__ */ jsx("span", { children: "⚠️ Beitragsbemessungsgrenze 2026" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.beitragsbemessungsgrenze) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-red-600", children: [
          /* @__PURE__ */ jsx("span", { children: "− Sozialabgaben (pauschal)" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.nettoDetails.sozialabgabenGesamt) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-red-600", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "− Lohnsteuer (Steuerklasse ",
            steuerklasse,
            ")"
          ] }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.nettoDetails.lohnsteuer) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-gray-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "= Pauschalisiertes Nettoentgelt" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.netto) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide pt-4", children: "Arbeitslosengeld I" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Nettoentgelt" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatEuro(ergebnis.netto) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
            "× Leistungssatz (",
            hatKinder ? "mit Kind" : "ohne Kind",
            ")"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-900", children: [
            Math.round(ergebnis.alg1Prozent * 100),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-3 bg-blue-100 -mx-6 px-6 rounded-b-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-blue-800", children: "= ALG I pro Monat" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-2xl text-blue-900", children: formatEuro(ergebnis.alg1Monatlich) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📅 Anspruchsdauer ALG I" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Die Bezugsdauer hängt von Ihrem Alter und der Dauer Ihrer versicherungspflichtigen Beschäftigung in den letzten 5 Jahren ab:" }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-gray-50", children: [
          /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-3 font-medium text-gray-600", children: "Beschäftigung" }),
          /* @__PURE__ */ jsx("th", { className: "text-center py-2 px-2 font-medium text-gray-600", children: "<50" }),
          /* @__PURE__ */ jsx("th", { className: "text-center py-2 px-2 font-medium text-gray-600", children: "ab 50" }),
          /* @__PURE__ */ jsx("th", { className: "text-center py-2 px-2 font-medium text-gray-600", children: "ab 55" }),
          /* @__PURE__ */ jsx("th", { className: "text-center py-2 px-2 font-medium text-gray-600", children: "ab 58" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: ANSPRUCHSDAUER_TABELLE.map((zeile, i) => {
          const istAktuelleZeile = beschaeftigungMonate >= zeile.beschaeftigung && (i === ANSPRUCHSDAUER_TABELLE.length - 1 || beschaeftigungMonate < ANSPRUCHSDAUER_TABELLE[i + 1].beschaeftigung);
          alter >= 58 ? zeile.alter58 : alter >= 55 ? zeile.alter55 : alter >= 50 ? zeile.alter50 : zeile.standard;
          return /* @__PURE__ */ jsxs(
            "tr",
            {
              className: istAktuelleZeile ? "bg-blue-100" : i % 2 === 0 ? "bg-white" : "bg-gray-50",
              children: [
                /* @__PURE__ */ jsxs("td", { className: "py-2 px-3 font-medium", children: [
                  zeile.beschaeftigung,
                  " Monate"
                ] }),
                /* @__PURE__ */ jsxs("td", { className: `text-center py-2 px-2 ${alter < 50 && istAktuelleZeile ? "font-bold text-blue-700" : ""}`, children: [
                  zeile.standard,
                  " Mon."
                ] }),
                /* @__PURE__ */ jsxs("td", { className: `text-center py-2 px-2 ${alter >= 50 && alter < 55 && istAktuelleZeile ? "font-bold text-blue-700" : ""}`, children: [
                  zeile.alter50,
                  " Mon."
                ] }),
                /* @__PURE__ */ jsxs("td", { className: `text-center py-2 px-2 ${alter >= 55 && alter < 58 && istAktuelleZeile ? "font-bold text-blue-700" : ""}`, children: [
                  zeile.alter55,
                  " Mon."
                ] }),
                /* @__PURE__ */ jsxs("td", { className: `text-center py-2 px-2 ${alter >= 58 && istAktuelleZeile ? "font-bold text-blue-700" : ""}`, children: [
                  zeile.alter58,
                  " Mon."
                ] })
              ]
            },
            zeile.beschaeftigung
          );
        }) })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 p-4 bg-blue-50 rounded-xl", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-blue-800", children: [
        /* @__PURE__ */ jsx("strong", { children: "Ihre Situation:" }),
        " Mit ",
        beschaeftigungMonate,
        " Monaten Beschäftigung und Alter ",
        alter,
        " haben Sie Anspruch auf ",
        /* @__PURE__ */ jsxs("strong", { children: [
          ergebnis.anspruchsdauer,
          " Monate"
        ] }),
        " ALG I."
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-blue-800 mb-3", children: "🆕 Neuerungen 2026" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-blue-700", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "BBG vereinheitlicht:" }),
            " 8.450€/Monat bundesweit – keine Unterscheidung mehr zwischen Ost und West"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Grundfreibetrag erhöht:" }),
            " 12.348€/Jahr (2025: 11.784€)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "KV-Zusatzbeitrag gestiegen:" }),
            " Durchschnittlich 2,9% (AN: 1,45%)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Leistungssätze unverändert:" }),
            " 60% ohne Kind, 67% mit Kind"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert Arbeitslosengeld I" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Leistungssatz:" }),
            " 60% des pauschalierten Nettoentgelts (67% mit Kind)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Bemessungszeitraum:" }),
            " Durchschnittsverdienst der letzten 12 Monate"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Anwartschaftszeit:" }),
            " Mindestens 12 Monate versicherungspflichtig in 30 Monaten"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Bezugsdauer:" }),
            " 6-24 Monate je nach Alter und Beschäftigungsdauer"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Steuerfrei:" }),
            " ALG I ist steuerfrei, unterliegt aber dem Progressionsvorbehalt"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Sozialversicherung:" }),
            " Kranken- und Pflegeversicherung werden übernommen"
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
            /* @__PURE__ */ jsx("strong", { children: "Sperrzeit:" }),
            " Bei Eigenkündigung oder verhaltensbedingt: 12 Wochen Sperre!"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Meldepflicht:" }),
            " Sie müssen sich am 1. Tag der Arbeitslosigkeit persönlich arbeitslos melden"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Früh melden:" }),
            " Arbeitssuchend melden Sie sich bereits 3 Monate vor Ende des Arbeitsverhältnisses"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Verfügbarkeit:" }),
            " Sie müssen dem Arbeitsmarkt zur Verfügung stehen (15h+/Woche)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Zuverdienst:" }),
            " Bis 165€/Monat anrechnungsfrei, darüber wird gekürzt"
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
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-blue-800 mb-3", children: "❓ Was kommt nach ALG I?" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm text-blue-700", children: [
        /* @__PURE__ */ jsx("p", { children: "Wenn Ihr ALG I ausläuft und Sie noch keine neue Arbeit gefunden haben:" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-1 pl-4", children: [
          /* @__PURE__ */ jsxs("li", { children: [
            "• ",
            /* @__PURE__ */ jsx("strong", { children: "Bürgergeld:" }),
            " Grundsicherung für Arbeitssuchende (früher Hartz IV)"
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            "• ",
            /* @__PURE__ */ jsx("strong", { children: "Wohngeld:" }),
            " Wenn Sie geringe Einkünfte haben"
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            "• ",
            /* @__PURE__ */ jsx("strong", { children: "Kinderzuschlag:" }),
            " Wenn Sie Kinder haben"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 mt-4", children: [
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "/buergergeld-rechner",
              className: "inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium",
              children: "Bürgergeld berechnen →"
            }
          ),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "/wohngeld-rechner",
              className: "inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium",
              children: "Wohngeld prüfen →"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörde" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-blue-900", children: "Agentur für Arbeit" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-700 mt-1", children: "Die Bundesagentur für Arbeit ist zuständig für ALG I. Melden Sie sich bei der Agentur an Ihrem Wohnort." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Service-Hotline" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "tel:08004555500",
                  className: "text-blue-600 hover:underline font-bold",
                  children: "0800 4 555500"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs mt-1", children: "Kostenfrei, Mo-Fr 8-18 Uhr" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Online-Antrag" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.arbeitsagentur.de/arbeitslos-arbeit-finden/arbeitslosengeld",
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
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Benötigte Unterlagen" }),
            /* @__PURE__ */ jsxs("ul", { className: "text-gray-600 mt-1 space-y-1", children: [
              /* @__PURE__ */ jsx("li", { children: "• Personalausweis oder Reisepass" }),
              /* @__PURE__ */ jsx("li", { children: "• Arbeitsbescheinigung vom Arbeitgeber" }),
              /* @__PURE__ */ jsx("li", { children: "• Sozialversicherungsausweis" }),
              /* @__PURE__ */ jsx("li", { children: "• Lebenslauf und Zeugnisse" }),
              /* @__PURE__ */ jsx("li", { children: "• Bankverbindung (IBAN)" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-amber-50 rounded-xl text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "⏰" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-amber-800", children: "Wichtige Fristen" }),
            /* @__PURE__ */ jsxs("ul", { className: "text-amber-700 mt-1 space-y-1", children: [
              /* @__PURE__ */ jsxs("li", { children: [
                "• ",
                /* @__PURE__ */ jsx("strong", { children: "3 Monate vorher:" }),
                " Arbeitssuchend melden"
              ] }),
              /* @__PURE__ */ jsxs("li", { children: [
                "• ",
                /* @__PURE__ */ jsx("strong", { children: "Spätestens 3 Tage nach Kenntnis:" }),
                " Bei kurzfristigem Ende"
              ] }),
              /* @__PURE__ */ jsxs("li", { children: [
                "• ",
                /* @__PURE__ */ jsx("strong", { children: "Tag 1 der Arbeitslosigkeit:" }),
                " Persönlich arbeitslos melden"
              ] })
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
            href: "https://www.arbeitsagentur.de/arbeitslos-arbeit-finden/arbeitslosengeld",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesagentur für Arbeit – Arbeitslosengeld"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/sgb_3/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "SGB III – Arbeitsförderungsgesetz"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bmas.de/DE/Arbeit/Arbeitsfoerderung/arbeitsfoerderung.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BMAS – Arbeitsförderung"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bundesregierung.de/breg-de/aktuelles/beitragsgemessungsgrenzen-2386514",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesregierung – Beitragsbemessungsgrenzen 2026"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.tk.de/firmenkunden/versicherung/beitraege-faq/zahlen-und-grenzwerte/beitragsbemessungsgrenzen-2033026",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "TK – Beitragsbemessungsgrenzen 2026"
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
const $$ArbeitslosengeldRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "Arbeitslosengeld-Rechner 2026 \u2013 ALG I H\xF6he & Dauer berechnen | BBG 8.450\u20AC";
  const description = "Arbeitslosengeld I berechnen: ALG 1 H\xF6he, Anspruchsdauer & Bezugsdauer 2026. Aktuelle BBG 8.450\u20AC, Grundfreibetrag 12.348\u20AC. Kostenloser Rechner mit Sperrzeit-Info.";
  const keywords = "Arbeitslosengeld Rechner, ALG 1 berechnen, Arbeitslosengeld H\xF6he, ALG I Rechner, Arbeitslosengeld 2026, Arbeitslosengeld Dauer, ALG berechnen, Arbeitslosengeld Anspruch, Arbeitslosengeld Berechnung, Beitragsbemessungsgrenze 2026";
  return renderTemplate(_a || (_a = __template(["", ' <script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [\n    {\n      "@type": "Question",\n      "name": "Wie berechnet sich das Arbeitslosengeld I?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "Die Bundesagentur ermittelt das Bemessungsentgelt aus dem Durchschnitt der Bruttogeh\xE4lter der letzten 12 Monate. Nach Abzug pauschaler Sozialabgaben und Lohnsteuer erhalten Sie 60% (ohne Kind) oder 67% (mit Kind) als ALG I."\n      }\n    },\n    {\n      "@type": "Question",\n      "name": "Wie lange bekomme ich Arbeitslosengeld I?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "Die Bezugsdauer h\xE4ngt von Alter und Besch\xE4ftigungsdauer ab. Sie reicht von 6 Monaten (12 Monate Besch\xE4ftigung) bis zu 24 Monaten (48 Monate Besch\xE4ftigung, Alter ab 58)."\n      }\n    },\n    {\n      "@type": "Question",\n      "name": "Kann ich w\xE4hrend des ALG I Bezugs dazuverdienen?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "Ja, bis zu 165 Euro im Monat sind anrechnungsfrei. Alles dar\xFCber wird angerechnet. Die Arbeitszeit darf 15 Stunden pro Woche nicht \xFCberschreiten."\n      }\n    }\n  ]\n}\n<\/script> <script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebApplication",\n  "name": "Arbeitslosengeld-Rechner 2026",\n  "description": "Berechnen Sie Ihr Arbeitslosengeld I 2026: H\xF6he, Bezugsdauer und Anspruchsvoraussetzungen. Aktualisiert mit BBG 8.450\u20AC.",\n  "url": "https://deutschland-rechner.de/arbeitslosengeld-rechner",\n  "applicationCategory": "FinanceApplication",\n  "operatingSystem": "Web",\n  "offers": {\n    "@type": "Offer",\n    "price": "0",\n    "priceCurrency": "EUR"\n  }\n}\n<\/script>'])), renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4"> <div class="max-w-2xl mx-auto"> <!-- Header --> <div class="text-center mb-8"> <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4"> <span class="text-4xl">📋</span> </div> <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
Arbeitslosengeld-Rechner 2026
</h1> <p class="text-gray-600 max-w-lg mx-auto">
Berechnen Sie Ihren ALG I Anspruch: Höhe, Bezugsdauer und was nach der Kündigung kommt.
</p> </div> <!-- Calculator Component --> ${renderComponent($$result2, "ArbeitslosengeldRechner", ArbeitslosengeldRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/ArbeitslosengeldRechner.tsx", "client:component-export": "default" })} <!-- SEO Content Section --> <div class="mt-12 bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">📚 Alles Wichtige zum Arbeitslosengeld I</h2> <div class="space-y-4 text-sm text-gray-600"> <div> <h3 class="font-semibold text-gray-800 mb-2">Was ist Arbeitslosengeld I?</h3> <p>
Arbeitslosengeld I (ALG I) ist eine Versicherungsleistung der Bundesagentur für Arbeit. 
              Es wird aus der Arbeitslosenversicherung finanziert, in die Arbeitnehmer und Arbeitgeber 
              gemeinsam einzahlen. Anders als Bürgergeld (früher Hartz IV) ist ALG I keine 
              Sozialleistung, sondern eine Versicherungsleistung.
</p> </div> <div> <h3 class="font-semibold text-gray-800 mb-2">Wie viel Arbeitslosengeld bekomme ich?</h3> <p>
Die Höhe des ALG I beträgt <strong>60% des pauschalierten Nettoentgelts</strong>
(Leistungsentgelt). Wer mindestens ein Kind hat, erhält den erhöhten Leistungssatz 
              von <strong>67%</strong>. Das pauschalierte Nettoentgelt errechnet sich aus Ihrem 
              durchschnittlichen Bruttogehalt der letzten 12 Monate abzüglich pauschaler Abzüge.
</p> </div> <div> <h3 class="font-semibold text-gray-800 mb-2">Wie lange bekomme ich ALG I?</h3> <p>
Die Bezugsdauer hängt von zwei Faktoren ab: <strong>Ihrem Alter</strong> und der
<strong>Dauer Ihrer versicherungspflichtigen Beschäftigung</strong> in den letzten 
              5 Jahren. Die Spanne reicht von 6 Monaten (bei 12 Monaten Beschäftigung) bis zu 
              24 Monaten (bei 48 Monaten Beschäftigung und Alter ab 58).
</p> </div> <div> <h3 class="font-semibold text-gray-800 mb-2">Was ist die Sperrzeit?</h3> <p>
Wenn Sie selbst kündigen oder verhaltensbedingt gekündigt werden, droht eine
<strong>Sperrzeit von bis zu 12 Wochen</strong>. In dieser Zeit erhalten Sie 
              kein ALG I, und die Bezugsdauer verkürzt sich um mindestens ein Viertel. 
              Ausnahmen gelten bei wichtigem Grund (z.B. Mobbing, Umzug zum Partner).
</p> </div> <div> <h3 class="font-semibold text-gray-800 mb-2">Wann muss ich mich arbeitslos melden?</h3> <ul class="list-disc pl-5 space-y-1 mt-2"> <li><strong>Arbeitssuchend melden:</strong> Spätestens 3 Monate vor Ende des Arbeitsverhältnisses</li> <li><strong>Bei kurzfristiger Kündigung:</strong> Innerhalb von 3 Tagen nach Kenntnis</li> <li><strong>Arbeitslos melden:</strong> Am ersten Tag der Arbeitslosigkeit persönlich</li> </ul> </div> </div> </div> <!-- FAQ Schema --> <div class="mt-8 bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">❓ Häufige Fragen zum Arbeitslosengeld</h2> <div class="space-y-4"> <details class="group"> <summary class="cursor-pointer font-medium text-gray-800 hover:text-blue-600">
Wie berechnet sich das Arbeitslosengeld I genau?
</summary> <p class="mt-2 text-sm text-gray-600 pl-4">
Die Bundesagentur für Arbeit ermittelt zunächst Ihr Bemessungsentgelt aus dem 
              Durchschnitt Ihrer Bruttogehälter der letzten 12 Monate. Davon werden pauschale 
              Sozialabgaben (ca. 21%) und die Lohnsteuer (je nach Steuerklasse) abgezogen. 
              Vom resultierenden pauschalierten Netto erhalten Sie 60% (ohne Kind) oder 67% (mit Kind).
</p> </details> <details class="group"> <summary class="cursor-pointer font-medium text-gray-800 hover:text-blue-600">
Kann ich während des ALG I Bezugs dazuverdienen?
</summary> <p class="mt-2 text-sm text-gray-600 pl-4">
Ja, Sie können bis zu <strong>165 Euro im Monat</strong> anrechnungsfrei hinzuverdienen. 
              Alles darüber wird auf das ALG I angerechnet. Außerdem dürfen Sie nicht mehr als 
              15 Stunden pro Woche arbeiten, da Sie sonst nicht mehr als arbeitslos gelten.
</p> </details> <details class="group"> <summary class="cursor-pointer font-medium text-gray-800 hover:text-blue-600">
Was passiert, wenn das ALG I ausläuft?
</summary> <p class="mt-2 text-sm text-gray-600 pl-4">
Wenn Ihr ALG I Anspruch endet und Sie noch keine neue Arbeit haben, können Sie
<strong>Bürgergeld</strong> beantragen (früher Hartz IV / ALG II). Bürgergeld ist 
              eine bedarfsorientierte Grundsicherung mit Vermögensprüfung. Alternativ kann 
              Wohngeld oder Kinderzuschlag infrage kommen.
</p> </details> <details class="group"> <summary class="cursor-pointer font-medium text-gray-800 hover:text-blue-600">
Muss ich Arbeitslosengeld versteuern?
</summary> <p class="mt-2 text-sm text-gray-600 pl-4">
ALG I ist <strong>steuerfrei</strong>, unterliegt aber dem <strong>Progressionsvorbehalt</strong>. 
              Das bedeutet: Das ALG I selbst wird nicht besteuert, aber es erhöht den Steuersatz 
              für Ihre anderen Einkünfte. Sie müssen eine Steuererklärung abgeben.
</p> </details> </div> </div> <!-- Back Link --> <div class="mt-8 text-center"> <a href="/" class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
← Alle Rechner anzeigen
</a> </div> </div> </main> ` }));
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/arbeitslosengeld-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/arbeitslosengeld-rechner.astro";
const $$url = "/arbeitslosengeld-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$ArbeitslosengeldRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
