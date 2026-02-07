/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DmT1JwUR.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const SCHWANGERSCHAFT_TAGE = 280;
const EMPFAENGNIS_OFFSET = 14;
const MEILENSTEINE = [
  { woche: 5, label: "Herzschlag", beschreibung: "Erstes Herzschlagen erkennbar", icon: "💓" },
  { woche: 12, label: "Erstes Trimester", beschreibung: "Ende 1. Trimester, kritische Phase vorbei", icon: "🎉" },
  { woche: 16, label: "Geschlecht", beschreibung: "Geschlecht oft erkennbar", icon: "🔎" },
  { woche: 20, label: "Halbzeit", beschreibung: "Halbzeit! Baby ca. 25cm groß", icon: "⚖️" },
  { woche: 24, label: "Lebensfähig", beschreibung: "Lebensfähigkeit außerhalb des Bauches", icon: "🏥" },
  { woche: 28, label: "Drittes Trimester", beschreibung: "Start 3. Trimester", icon: "🌟" },
  { woche: 34, label: "Mutterschutz", beschreibung: "Mutterschutz beginnt (6 Wochen vor ET)", icon: "🏠" },
  { woche: 37, label: "Frühtermin", beschreibung: "Baby gilt nicht mehr als Frühchen", icon: "✅" },
  { woche: 40, label: "Geburtstermin", beschreibung: "Errechneter Geburtstermin (ET)", icon: "👶" },
  { woche: 42, label: "Übertragung", beschreibung: "Ab hier gilt Schwangerschaft als übertragen", icon: "⏰" }
];
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
function diffDays(date1, date2) {
  return Math.floor((date2.getTime() - date1.getTime()) / (1e3 * 60 * 60 * 24));
}
function formatDatum(date) {
  return date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}
function formatDatumKurz(date) {
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}
function getSternzeichen(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const sternzeichen = [
    { name: "Steinbock", zeichen: "♑", start: [1, 1], end: [1, 19] },
    { name: "Wassermann", zeichen: "♒", start: [1, 20], end: [2, 18] },
    { name: "Fische", zeichen: "♓", start: [2, 19], end: [3, 20] },
    { name: "Widder", zeichen: "♈", start: [3, 21], end: [4, 19] },
    { name: "Stier", zeichen: "♉", start: [4, 20], end: [5, 20] },
    { name: "Zwillinge", zeichen: "♊", start: [5, 21], end: [6, 20] },
    { name: "Krebs", zeichen: "♋", start: [6, 21], end: [7, 22] },
    { name: "Löwe", zeichen: "♌", start: [7, 23], end: [8, 22] },
    { name: "Jungfrau", zeichen: "♍", start: [8, 23], end: [9, 22] },
    { name: "Waage", zeichen: "♎", start: [9, 23], end: [10, 22] },
    { name: "Skorpion", zeichen: "♏", start: [10, 23], end: [11, 21] },
    { name: "Schütze", zeichen: "♐", start: [11, 22], end: [12, 21] },
    { name: "Steinbock", zeichen: "♑", start: [12, 22], end: [12, 31] }
  ];
  for (const sz of sternzeichen) {
    const [startMonth, startDay] = sz.start;
    const [endMonth, endDay] = sz.end;
    if (month === startMonth && day >= startDay || month === endMonth && day <= endDay) {
      return { zeichen: sz.zeichen, name: sz.name };
    }
  }
  return { zeichen: "♑", name: "Steinbock" };
}
function GeburtsterminRechner() {
  const [berechnungsModus, setBerechnungsModus] = useState("lmp");
  const [inputDatum, setInputDatum] = useState(() => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() - 56);
    return d.toISOString().split("T")[0];
  });
  const [zyklusLaenge, setZyklusLaenge] = useState(28);
  const ergebnis = useMemo(() => {
    const eingabe = new Date(inputDatum);
    const heute = /* @__PURE__ */ new Date();
    heute.setHours(0, 0, 0, 0);
    let lmp;
    let empfaengnis;
    let et;
    const zyklusOffset = zyklusLaenge - 28;
    switch (berechnungsModus) {
      case "lmp":
        lmp = eingabe;
        empfaengnis = addDays(lmp, EMPFAENGNIS_OFFSET + zyklusOffset);
        et = addDays(lmp, SCHWANGERSCHAFT_TAGE + zyklusOffset);
        break;
      case "empfaengnis":
        empfaengnis = eingabe;
        lmp = addDays(eingabe, -(EMPFAENGNIS_OFFSET + zyklusOffset));
        et = addDays(empfaengnis, SCHWANGERSCHAFT_TAGE - EMPFAENGNIS_OFFSET);
        break;
      case "et":
        et = eingabe;
        lmp = addDays(et, -SCHWANGERSCHAFT_TAGE);
        empfaengnis = addDays(lmp, EMPFAENGNIS_OFFSET);
        break;
      default:
        lmp = eingabe;
        empfaengnis = addDays(lmp, EMPFAENGNIS_OFFSET);
        et = addDays(lmp, SCHWANGERSCHAFT_TAGE);
    }
    const schwangerschaftstage = diffDays(lmp, heute);
    const ssw = Math.floor(schwangerschaftstage / 7);
    const tage = schwangerschaftstage % 7;
    const verbleibendeTage = diffDays(heute, et);
    let trimester;
    if (ssw < 13) trimester = 1;
    else if (ssw < 28) trimester = 2;
    else trimester = 3;
    const fruehestens = addDays(et, -14);
    const spaetestens = addDays(et, 14);
    const mutterschutzStart = addDays(et, -42);
    const mutterschutzEnde = addDays(et, 56);
    const sternzeichen = getSternzeichen(et);
    const fortschritt = Math.min(100, Math.max(0, schwangerschaftstage / SCHWANGERSCHAFT_TAGE * 100));
    let babyGroesse = "< 1 mm";
    let babyGewicht = "< 1 g";
    let babyVergleich = "Mohnkorn";
    if (ssw >= 4) {
      babyGroesse = "1 mm";
      babyGewicht = "< 1 g";
      babyVergleich = "Mohnkorn";
    }
    if (ssw >= 5) {
      babyGroesse = "2 mm";
      babyGewicht = "< 1 g";
      babyVergleich = "Sesamkorn";
    }
    if (ssw >= 6) {
      babyGroesse = "5 mm";
      babyGewicht = "< 1 g";
      babyVergleich = "Linse";
    }
    if (ssw >= 7) {
      babyGroesse = "1 cm";
      babyGewicht = "< 1 g";
      babyVergleich = "Blaubeere";
    }
    if (ssw >= 8) {
      babyGroesse = "1,5 cm";
      babyGewicht = "1 g";
      babyVergleich = "Himbeere";
    }
    if (ssw >= 9) {
      babyGroesse = "2,5 cm";
      babyGewicht = "2 g";
      babyVergleich = "Olive";
    }
    if (ssw >= 10) {
      babyGroesse = "3 cm";
      babyGewicht = "4 g";
      babyVergleich = "Kumquat";
    }
    if (ssw >= 11) {
      babyGroesse = "4 cm";
      babyGewicht = "7 g";
      babyVergleich = "Feige";
    }
    if (ssw >= 12) {
      babyGroesse = "5 cm";
      babyGewicht = "14 g";
      babyVergleich = "Limette";
    }
    if (ssw >= 13) {
      babyGroesse = "7 cm";
      babyGewicht = "25 g";
      babyVergleich = "Pfirsich";
    }
    if (ssw >= 14) {
      babyGroesse = "9 cm";
      babyGewicht = "45 g";
      babyVergleich = "Zitrone";
    }
    if (ssw >= 16) {
      babyGroesse = "12 cm";
      babyGewicht = "100 g";
      babyVergleich = "Avocado";
    }
    if (ssw >= 18) {
      babyGroesse = "14 cm";
      babyGewicht = "190 g";
      babyVergleich = "Paprika";
    }
    if (ssw >= 20) {
      babyGroesse = "25 cm";
      babyGewicht = "300 g";
      babyVergleich = "Banane";
    }
    if (ssw >= 22) {
      babyGroesse = "28 cm";
      babyGewicht = "430 g";
      babyVergleich = "Kokosnuss";
    }
    if (ssw >= 24) {
      babyGroesse = "30 cm";
      babyGewicht = "600 g";
      babyVergleich = "Maiskolben";
    }
    if (ssw >= 26) {
      babyGroesse = "35 cm";
      babyGewicht = "900 g";
      babyVergleich = "Salat";
    }
    if (ssw >= 28) {
      babyGroesse = "37 cm";
      babyGewicht = "1100 g";
      babyVergleich = "Aubergine";
    }
    if (ssw >= 30) {
      babyGroesse = "40 cm";
      babyGewicht = "1500 g";
      babyVergleich = "Kohlkopf";
    }
    if (ssw >= 32) {
      babyGroesse = "42 cm";
      babyGewicht = "1800 g";
      babyVergleich = "Ananas";
    }
    if (ssw >= 34) {
      babyGroesse = "45 cm";
      babyGewicht = "2200 g";
      babyVergleich = "Melone";
    }
    if (ssw >= 36) {
      babyGroesse = "47 cm";
      babyGewicht = "2700 g";
      babyVergleich = "Honigmelone";
    }
    if (ssw >= 38) {
      babyGroesse = "49 cm";
      babyGewicht = "3100 g";
      babyVergleich = "Kürbis";
    }
    if (ssw >= 40) {
      babyGroesse = "51 cm";
      babyGewicht = "3400 g";
      babyVergleich = "Wassermelone";
    }
    return {
      lmp,
      empfaengnis,
      et,
      ssw: Math.max(0, ssw),
      tage: Math.max(0, tage),
      verbleibendeTage,
      trimester,
      fruehestens,
      spaetestens,
      mutterschutzStart,
      mutterschutzEnde,
      sternzeichen,
      fortschritt,
      schwangerschaftstage,
      babyGroesse,
      babyGewicht,
      babyVergleich,
      istSchwanger: schwangerschaftstage >= 0 && schwangerschaftstage <= SCHWANGERSCHAFT_TAGE + 14
    };
  }, [inputDatum, berechnungsModus, zyklusLaenge]);
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Berechnung basierend auf" }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setBerechnungsModus("lmp"),
              className: `p-3 rounded-xl text-center transition-all text-sm ${berechnungsModus === "lmp" ? "bg-pink-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("div", { className: "font-bold", children: "Letzte Periode" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs mt-1 opacity-80", children: "1. Tag" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setBerechnungsModus("empfaengnis"),
              className: `p-3 rounded-xl text-center transition-all text-sm ${berechnungsModus === "empfaengnis" ? "bg-pink-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("div", { className: "font-bold", children: "Empfängnis" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs mt-1 opacity-80", children: "Zeugungstag" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setBerechnungsModus("et"),
              className: `p-3 rounded-xl text-center transition-all text-sm ${berechnungsModus === "et" ? "bg-pink-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("div", { className: "font-bold", children: "Bekannter ET" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs mt-1 opacity-80", children: "Vom Arzt" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsxs("span", { className: "text-gray-700 font-medium", children: [
          berechnungsModus === "lmp" && "Erster Tag deiner letzten Periode",
          berechnungsModus === "empfaengnis" && "Tag der Empfängnis",
          berechnungsModus === "et" && "Errechneter Geburtstermin (vom Arzt)"
        ] }) }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "date",
            value: inputDatum,
            onChange: (e) => setInputDatum(e.target.value),
            className: "w-full text-xl font-medium py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 outline-none"
          }
        )
      ] }),
      berechnungsModus === "lmp" && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Durchschnittliche Zykluslänge" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 ml-2", children: "(Standard: 28 Tage)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              min: "21",
              max: "35",
              value: zyklusLaenge,
              onChange: (e) => setZyklusLaenge(Number(e.target.value)),
              className: "flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "text-xl font-bold text-pink-600 w-20 text-center", children: [
            zyklusLaenge,
            " Tage"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg p-6 text-white mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-pink-100 mb-1", children: "Errechneter Geburtstermin (ET)" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-4xl font-bold mb-2", children: [
          "📅 ",
          formatDatum(ergebnis.et)
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-pink-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl", children: ergebnis.sternzeichen.zeichen }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Sternzeichen: ",
            ergebnis.sternzeichen.name
          ] })
        ] })
      ] }),
      ergebnis.istSchwanger && /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-pink-100", children: "Aktuelle SSW" }),
          /* @__PURE__ */ jsxs("span", { className: "text-2xl font-bold", children: [
            ergebnis.ssw,
            "+",
            ergebnis.tage
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-full bg-white/20 rounded-full h-3", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "bg-white rounded-full h-3 transition-all duration-500",
            style: { width: `${ergebnis.fortschritt}%` }
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-pink-200 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "0 Wochen" }),
          /* @__PURE__ */ jsxs("span", { children: [
            Math.round(ergebnis.fortschritt),
            "% geschafft"
          ] }),
          /* @__PURE__ */ jsx("span", { children: "40 Wochen" })
        ] })
      ] }),
      ergebnis.verbleibendeTage > 0 && ergebnis.istSchwanger && /* @__PURE__ */ jsxs("div", { className: "mt-4 text-center", children: [
        /* @__PURE__ */ jsx("span", { className: "text-pink-100", children: "Noch " }),
        /* @__PURE__ */ jsx("span", { className: "text-3xl font-bold", children: ergebnis.verbleibendeTage }),
        /* @__PURE__ */ jsx("span", { className: "text-pink-100", children: " Tage bis zum ET" })
      ] })
    ] }),
    ergebnis.istSchwanger && ergebnis.ssw >= 4 && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("h3", { className: "font-bold text-gray-800 mb-4", children: [
        "👶 Dein Baby in SSW ",
        ergebnis.ssw
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4 text-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-pink-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-3xl mb-2", children: "📏" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-pink-600", children: ergebnis.babyGroesse }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: "Größe" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-pink-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-3xl mb-2", children: "⚖️" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-pink-600", children: ergebnis.babyGewicht }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: "Gewicht" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-pink-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-3xl mb-2", children: "🍎" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-pink-600", children: ergebnis.babyVergleich }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: "Vergleich" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-center text-gray-500 text-sm mt-3", children: [
        ergebnis.trimester,
        ". Trimester"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📋 Wichtige Termine" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🩸" }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-700", children: "Letzte Periode (LMP)" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: formatDatumKurz(ergebnis.lmp) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "✨" }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-700", children: "Wahrsch. Empfängnis" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: formatDatumKurz(ergebnis.empfaengnis) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 bg-pink-50 rounded-xl border-2 border-pink-200", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🏠" }),
            /* @__PURE__ */ jsx("span", { className: "text-pink-700 font-medium", children: "Mutterschutz beginnt" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-pink-700", children: formatDatumKurz(ergebnis.mutterschutzStart) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 bg-green-50 rounded-xl border-2 border-green-200", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "👶" }),
            /* @__PURE__ */ jsx("span", { className: "text-green-700 font-medium", children: "Errechneter Geburtstermin" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-green-700", children: formatDatumKurz(ergebnis.et) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🏠" }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-700", children: "Mutterschutz endet" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: formatDatumKurz(ergebnis.mutterschutzEnde) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 p-3 bg-blue-50 rounded-xl text-sm", children: /* @__PURE__ */ jsxs("p", { className: "text-blue-800", children: [
        /* @__PURE__ */ jsx("strong", { children: "💡 Geburtszeitraum:" }),
        " 95% der Babys kommen zwischen ",
        formatDatumKurz(ergebnis.fruehestens),
        " und ",
        formatDatumKurz(ergebnis.spaetestens),
        " zur Welt."
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "🎯 Meilensteine der Schwangerschaft" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2", children: MEILENSTEINE.map((m) => {
        const meilensteinDatum = addDays(ergebnis.lmp, m.woche * 7);
        const istErreicht = ergebnis.ssw >= m.woche;
        const istAktuell = ergebnis.ssw === m.woche;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: `flex items-center gap-3 p-3 rounded-xl transition-all ${istAktuell ? "bg-pink-100 border-2 border-pink-400" : istErreicht ? "bg-green-50" : "bg-gray-50"}`,
            children: [
              /* @__PURE__ */ jsx("span", { className: "text-2xl", children: istErreicht ? "✅" : m.icon }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxs("span", { className: `font-medium ${istErreicht ? "text-green-700" : "text-gray-700"}`, children: [
                    "SSW ",
                    m.woche,
                    ": ",
                    m.label
                  ] }),
                  istAktuell && /* @__PURE__ */ jsx("span", { className: "text-xs bg-pink-500 text-white px-2 py-0.5 rounded-full", children: "Jetzt" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: m.beschreibung })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400", children: formatDatumKurz(meilensteinDatum) })
            ]
          },
          m.woche
        );
      }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert die Berechnung" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Naegele-Regel:" }),
            " ET = 1. Tag der letzten Periode + 280 Tage (40 Wochen)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "SSW-Zählung:" }),
            " Beginnt am 1. Tag der letzten Periode (nicht ab Empfängnis!)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Zyklusanpassung:" }),
            " Bei Zyklen ≠ 28 Tage wird der ET entsprechend angepasst"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Geburtszeitraum:" }),
            " Nur ~4% der Babys kommen am errechneten ET zur Welt"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Stellen & Vorsorge" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-pink-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-pink-900", children: "Gynäkologe / Hebamme" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-pink-700 mt-1", children: "Regelmäßige Vorsorgeuntersuchungen alle 4 Wochen, ab SSW 32 alle 2 Wochen." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Hebammen-Suche" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.hebammensuche.de",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "hebammensuche.de →"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🏥" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Mutterpass" }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Wird vom Frauenarzt bei Feststellung der Schwangerschaft ausgestellt" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "📋 Wichtige Hinweise" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-yellow-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "⚠️" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-yellow-800", children: "Nur ein Schätzwert!" }),
            /* @__PURE__ */ jsx("p", { className: "text-yellow-700", children: "Der errechnete Geburtstermin ist eine Schätzung. Nur ca. 4% der Babys kommen genau am ET zur Welt." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-blue-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🩺" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-blue-800", children: "Ultraschall ist genauer" }),
            /* @__PURE__ */ jsx("p", { className: "text-blue-700", children: "Im ersten Trimester kann der Arzt per Ultraschall einen genaueren ET berechnen (Scheitel-Steiß-Länge)." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-purple-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🏠" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-purple-800", children: "Mutterschutz" }),
            /* @__PURE__ */ jsxs("p", { className: "text-purple-700", children: [
              /* @__PURE__ */ jsx("strong", { children: "6 Wochen vor ET:" }),
              " Beschäftigungsverbot (freiwillig).",
              /* @__PURE__ */ jsx("strong", { children: " 8 Wochen nach Geburt:" }),
              " Absolutes Beschäftigungsverbot."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-green-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📋" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-green-800", children: "Frühzeitig erledigen" }),
            /* @__PURE__ */ jsx("p", { className: "text-green-700", children: "Hebamme suchen (ab SSW 6), Geburtsvorbereitungskurs anmelden (SSW 20), Elterngeld beantragen, Klinik anmelden (SSW 30)." })
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
            href: "https://www.familienplanung.de/schwangerschaft/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BZgA Familienplanung – Schwangerschaft"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.frauenaerzte-im-netz.de/schwangerschaft-geburt/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Frauenärzte im Netz – Schwangerschaft & Geburt"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bmfsfj.de/bmfsfj/themen/familie/familienleistungen/mutterschutz",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BMFSFJ – Mutterschutz"
          }
        )
      ] })
    ] })
  ] });
}

const $$GeburtsterminRechner = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Geburtstermin-Rechner 2025 \u2013 SSW berechnen & Entbindungstermin ermitteln", "description": "Geburtstermin berechnen: Ermittle deinen ET mit dem SSW-Rechner. Schwangerschaftswoche, Mutterschutz-Start & alle Meilensteine auf einen Blick. Kostenlos & sofort.", "keywords": "Geburtstermin Rechner, SSW Rechner, Schwangerschaftswoche berechnen, ET berechnen, Entbindungstermin Rechner, Geburtstermin berechnen, wann kommt mein Baby, Schwangerschaftsrechner, SSW berechnen, Geburtstermin 2025" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen pb-8"> <!-- Header mit Zurück-Button --> <header class="bg-gradient-to-r from-pink-500 to-rose-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-pink-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>
Alle Rechner
</a> <div class="flex items-center gap-3"> <span class="text-4xl">🗓️</span> <div> <h1 class="text-2xl font-bold">Geburtstermin-Rechner</h1> <p class="text-pink-100 text-sm">SSW & Entbindungstermin berechnen</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ${renderComponent($$result2, "GeburtsterminRechner", GeburtsterminRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/GeburtsterminRechner", "client:component-export": "default" })} </div> </main> ` })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/geburtstermin-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/geburtstermin-rechner.astro";
const $$url = "/geburtstermin-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$GeburtsterminRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
