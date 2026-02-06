/* empty css                                          */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_C8dcKtIt.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DgvP8Zjv.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
export { renderers } from '../renderers.mjs';

const DUESSELDORFER_TABELLE_2026 = [
  { id: 1, nettoVon: 0, nettoBis: 2100, betraege: [482, 554, 649, 693], bedarfskontrollbetrag: 1200, prozent: 100 },
  { id: 2, nettoVon: 2101, nettoBis: 2500, betraege: [507, 583, 682, 728], bedarfskontrollbetrag: 1650, prozent: 105 },
  { id: 3, nettoVon: 2501, nettoBis: 2900, betraege: [531, 611, 715, 764], bedarfskontrollbetrag: 1750, prozent: 110 },
  { id: 4, nettoVon: 2901, nettoBis: 3300, betraege: [555, 639, 748, 799], bedarfskontrollbetrag: 1850, prozent: 115 },
  { id: 5, nettoVon: 3301, nettoBis: 3700, betraege: [579, 666, 780, 834], bedarfskontrollbetrag: 1950, prozent: 120 },
  { id: 6, nettoVon: 3701, nettoBis: 4100, betraege: [618, 711, 832, 889], bedarfskontrollbetrag: 2050, prozent: 128 },
  { id: 7, nettoVon: 4101, nettoBis: 4500, betraege: [656, 755, 884, 944], bedarfskontrollbetrag: 2150, prozent: 136 },
  { id: 8, nettoVon: 4501, nettoBis: 4900, betraege: [695, 799, 936, 999], bedarfskontrollbetrag: 2250, prozent: 144 },
  { id: 9, nettoVon: 4901, nettoBis: 5300, betraege: [733, 844, 988, 1055], bedarfskontrollbetrag: 2350, prozent: 152 },
  { id: 10, nettoVon: 5301, nettoBis: 5700, betraege: [772, 888, 1039, 1110], bedarfskontrollbetrag: 2450, prozent: 160 },
  { id: 11, nettoVon: 5701, nettoBis: 6400, betraege: [810, 932, 1091, 1165], bedarfskontrollbetrag: 2650, prozent: 168 },
  { id: 12, nettoVon: 6401, nettoBis: 7200, betraege: [849, 976, 1143, 1221], bedarfskontrollbetrag: 2950, prozent: 176 },
  { id: 13, nettoVon: 7201, nettoBis: 8200, betraege: [887, 1020, 1195, 1276], bedarfskontrollbetrag: 3350, prozent: 184 },
  { id: 14, nettoVon: 8201, nettoBis: 9700, betraege: [926, 1065, 1247, 1332], bedarfskontrollbetrag: 3950, prozent: 192 },
  { id: 15, nettoVon: 9701, nettoBis: null, betraege: [964, 1109, 1298, 1387], bedarfskontrollbetrag: 4650, prozent: 200 }
];
const KINDERGELD_2026 = 259;
const SELBSTBEHALT = {
  erwerbstaetig: 1450,
  nichtErwerbstaetig: 1200
};
const ALTERSSTUFEN = [
  { label: "0–5 Jahre", index: 0 },
  { label: "6–11 Jahre", index: 1 },
  { label: "12–17 Jahre", index: 2 },
  { label: "ab 18 Jahre", index: 3 }
];
function getEinkommensgruppe(netto) {
  for (const gruppe of DUESSELDORFER_TABELLE_2026) {
    if (gruppe.nettoBis === null || netto <= gruppe.nettoBis) {
      if (netto >= gruppe.nettoVon || gruppe.id === 1) {
        return gruppe;
      }
    }
  }
  return DUESSELDORFER_TABELLE_2026[DUESSELDORFER_TABELLE_2026.length - 1];
}
function UnterhaltsRechner() {
  const [nettoEinkommen, setNettoEinkommen] = useState(3e3);
  const [altersstufe, setAltersstufe] = useState(0);
  const [istErwerbstaetig, setIstErwerbstaetig] = useState(true);
  const [anzahlKinder, setAnzahlKinder] = useState(1);
  const einkommensgruppe = getEinkommensgruppe(nettoEinkommen);
  const tabellenBetrag = einkommensgruppe.betraege[altersstufe];
  const istVolljaehrig = altersstufe === 3;
  const kindergeldAnrechnung = istVolljaehrig ? KINDERGELD_2026 : KINDERGELD_2026 / 2;
  const zahlbetrag = tabellenBetrag - kindergeldAnrechnung;
  const selbstbehalt = istErwerbstaetig ? SELBSTBEHALT.erwerbstaetig : SELBSTBEHALT.nichtErwerbstaetig;
  const verbleibtNachUnterhalt = nettoEinkommen - zahlbetrag * anzahlKinder;
  const selbstbehaltUnterschritten = verbleibtNachUnterhalt < selbstbehalt;
  const bedarfskontrollbetrag = einkommensgruppe.bedarfskontrollbetrag;
  return /* @__PURE__ */ jsxs("div", { className: "max-w-lg mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Angaben zum Unterhalt" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-gray-700 font-medium mb-2", children: "Bereinigtes Nettoeinkommen (€/Monat)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            value: nettoEinkommen,
            onChange: (e) => setNettoEinkommen(Math.max(0, parseInt(e.target.value) || 0)),
            className: "w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-lg",
            min: "0",
            step: "100"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: nettoEinkommen,
            onChange: (e) => setNettoEinkommen(parseInt(e.target.value)),
            min: "0",
            max: "12000",
            step: "100",
            className: "w-full mt-2 accent-blue-500"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "0 €" }),
          /* @__PURE__ */ jsx("span", { children: "12.000 €" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-gray-700 font-medium mb-2", children: "Altersstufe des Kindes" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: ALTERSSTUFEN.map((stufe) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setAltersstufe(stufe.index),
            className: `px-4 py-3 rounded-xl text-sm font-medium transition-all ${altersstufe === stufe.index ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
            children: stufe.label
          },
          stufe.index
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-gray-700 font-medium mb-2", children: "Anzahl unterhaltspflichtiger Kinder" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-6", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setAnzahlKinder(Math.max(1, anzahlKinder - 1)),
              className: "w-12 h-12 rounded-full bg-gray-100 text-2xl font-bold text-gray-600 hover:bg-gray-200 active:scale-95 transition-all",
              disabled: anzahlKinder <= 1,
              children: "−"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-4xl font-bold text-blue-600 w-16 text-center", children: anzahlKinder }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setAnzahlKinder(Math.min(6, anzahlKinder + 1)),
              className: "w-12 h-12 rounded-full bg-blue-500 text-2xl font-bold text-white hover:bg-blue-600 active:scale-95 transition-all",
              children: "+"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-center text-sm text-gray-500 mt-2", children: "Bei mehreren Kindern ggf. Herabstufung beachten" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-gray-700 font-medium mb-2", children: "Erwerbsstatus" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setIstErwerbstaetig(true),
              className: `px-4 py-3 rounded-xl text-sm font-medium transition-all ${istErwerbstaetig ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
              children: "Erwerbstätig"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setIstErwerbstaetig(false),
              className: `px-4 py-3 rounded-xl text-sm font-medium transition-all ${!istErwerbstaetig ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
              children: "Nicht erwerbstätig"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-blue-100 mb-1", children: "Kindesunterhalt (Zahlbetrag)" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-4xl font-bold", children: zahlbetrag.toLocaleString("de-DE") }),
          /* @__PURE__ */ jsx("span", { className: "text-xl text-blue-200", children: "€ / Monat" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-200 mt-1", children: "pro Kind" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-blue-100", children: "Tabellenbetrag" }),
          /* @__PURE__ */ jsxs("span", { className: "text-lg font-bold", children: [
            tabellenBetrag.toLocaleString("de-DE"),
            " €"
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-blue-100", children: [
            "Kindergeld-Anrechnung (",
            istVolljaehrig ? "100%" : "50%",
            ")"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-lg font-bold", children: [
            "− ",
            kindergeldAnrechnung.toLocaleString("de-DE"),
            " €"
          ] })
        ] }) }),
        anzahlKinder > 1 && /* @__PURE__ */ jsx("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-blue-100", children: [
            "Gesamt für ",
            anzahlKinder,
            " Kinder"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-lg font-bold", children: [
            (zahlbetrag * anzahlKinder).toLocaleString("de-DE"),
            " € / Monat"
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-blue-100", children: "Jahresbetrag" }),
          /* @__PURE__ */ jsxs("span", { className: "text-lg font-bold", children: [
            (zahlbetrag * anzahlKinder * 12).toLocaleString("de-DE"),
            " €"
          ] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 bg-white rounded-2xl shadow-lg p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "📋 Einordnung Düsseldorfer Tabelle" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Einkommensgruppe" }),
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-blue-600", children: [
            einkommensgruppe.id,
            ". Gruppe"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Einkommensspanne" }),
          /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
            einkommensgruppe.nettoVon.toLocaleString("de-DE"),
            " €",
            einkommensgruppe.nettoBis ? ` – ${einkommensgruppe.nettoBis.toLocaleString("de-DE")} €` : " +"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Bedarfskontrollbetrag" }),
          /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
            bedarfskontrollbetrag.toLocaleString("de-DE"),
            " €"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Prozentsatz (Mindestunterhalt)" }),
          /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
            einkommensgruppe.prozent,
            " %"
          ] })
        ] })
      ] })
    ] }),
    selbstbehaltUnterschritten && /* @__PURE__ */ jsxs("div", { className: "mt-6 bg-red-50 border-2 border-red-200 rounded-2xl p-6", children: [
      /* @__PURE__ */ jsxs("h3", { className: "font-bold text-red-800 mb-2 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { children: "⚠️" }),
        "Selbstbehalt unterschritten!"
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-red-700 text-sm", children: [
        "Nach Abzug des Unterhalts verbleiben ",
        /* @__PURE__ */ jsxs("strong", { children: [
          verbleibtNachUnterhalt.toLocaleString("de-DE"),
          " €"
        ] }),
        ". Der Selbstbehalt für ",
        istErwerbstaetig ? "Erwerbstätige" : "nicht Erwerbstätige",
        " beträgt jedoch ",
        /* @__PURE__ */ jsxs("strong", { children: [
          selbstbehalt.toLocaleString("de-DE"),
          " €"
        ] }),
        "."
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-red-700 text-sm mt-2", children: "In diesem Fall kann der Unterhalt herabgesetzt werden oder es greift die Mangelfallberechnung." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 bg-white rounded-2xl shadow-lg p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert's" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Bereinigtes Nettoeinkommen:" }),
            " Netto abzüglich berufsbedingter Aufwendungen (ca. 5%)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Kindergeld-Anrechnung:" }),
            " 50% bei Minderjährigen, 100% bei Volljährigen"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Selbstbehalt:" }),
            " ",
            SELBSTBEHALT.erwerbstaetig.toLocaleString("de-DE"),
            " € (erwerbstätig) / ",
            SELBSTBEHALT.nichtErwerbstaetig.toLocaleString("de-DE"),
            " € (nicht erwerbstätig)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Mehrere Kinder:" }),
            " Ggf. Herabstufung um eine Einkommensgruppe pro Kind"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 bg-white rounded-2xl shadow-lg p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörde" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-blue-900", children: "Jugendamt / Beistandschaft" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-700 mt-1", children: "Das örtliche Jugendamt bietet kostenlose Beistandschaft zur Durchsetzung von Unterhaltsansprüchen." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Jugendamt finden" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.jugendaemter.com",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "jugendaemter.com →"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Nach Postleitzahl suchen" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "⚖️" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Rechtsanwalt" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://anwaltauskunft.de",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "Familienrecht-Anwalt finden →"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Bei komplexen Fällen" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 bg-white rounded-2xl shadow-lg p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "📋 Wichtige Hinweise" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-yellow-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "⚠️" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-yellow-800", children: "Unverbindliche Berechnung" }),
            /* @__PURE__ */ jsx("p", { className: "text-yellow-700", children: "Diese Berechnung ist eine Orientierung. Der tatsächliche Unterhalt kann abweichen." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-green-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "✅" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-green-800", children: "Mindestunterhalt ist vorrangig" }),
            /* @__PURE__ */ jsx("p", { className: "text-green-700", children: "Kindesunterhalt geht vor anderen Unterhaltspflichten (z.B. Ehegattenunterhalt)." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-blue-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📄" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-blue-800", children: "Unterhaltstitel wichtig" }),
            /* @__PURE__ */ jsx("p", { className: "text-blue-700", children: "Lassen Sie den Unterhalt titulieren (Jugendamt-Urkunde oder Gerichtsbeschluss) für die Durchsetzbarkeit." })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 bg-white rounded-2xl shadow-lg p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "📊 Düsseldorfer Tabelle 2026 (Auszug)" }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b-2 border-gray-200", children: [
          /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-1", children: "Gruppe" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-2 px-1", children: "0–5" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-2 px-1", children: "6–11" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-2 px-1", children: "12–17" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-2 px-1", children: "18+" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: DUESSELDORFER_TABELLE_2026.slice(0, 6).map((gruppe) => /* @__PURE__ */ jsxs(
          "tr",
          {
            className: `border-b border-gray-100 ${gruppe.id === einkommensgruppe.id ? "bg-blue-50 font-medium" : ""}`,
            children: [
              /* @__PURE__ */ jsxs("td", { className: "py-2 px-1 text-gray-600", children: [
                gruppe.id,
                ". (",
                gruppe.nettoVon,
                "–",
                gruppe.nettoBis || "∞",
                ")"
              ] }),
              /* @__PURE__ */ jsxs("td", { className: "text-right py-2 px-1", children: [
                gruppe.betraege[0],
                " €"
              ] }),
              /* @__PURE__ */ jsxs("td", { className: "text-right py-2 px-1", children: [
                gruppe.betraege[1],
                " €"
              ] }),
              /* @__PURE__ */ jsxs("td", { className: "text-right py-2 px-1", children: [
                gruppe.betraege[2],
                " €"
              ] }),
              /* @__PURE__ */ jsxs("td", { className: "text-right py-2 px-1", children: [
                gruppe.betraege[3],
                " €"
              ] })
            ]
          },
          gruppe.id
        )) })
      ] }) }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-2", children: "Vollständige Tabelle: 15 Einkommensgruppen bis 9.700 €+ Netto" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 p-4 bg-gray-50 rounded-xl", children: [
      /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-gray-500 uppercase mb-2", children: "Quellen" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.olg-duesseldorf.nrw.de/infos/Duesseldorfer_Tabelle/index.php",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "OLG Düsseldorf – Düsseldorfer Tabelle 2026"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bmj.de/DE/themen/gesellschaft/familie-und-unterhalt/unterhalt/unterhalt-node.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesministerium der Justiz – Unterhaltsrecht"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://familienportal.de/familienportal/familienleistungen/unterhaltsvorschuss",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Familienportal – Unterhaltsvorschuss"
          }
        )
      ] })
    ] })
  ] });
}

const $$UnterhaltsRechner = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Unterhalts-Rechner 2026 \u2013 Kindesunterhalt nach D\xFCsseldorfer Tabelle", "description": "Kindesunterhalt berechnen 2026: Kostenloser Unterhaltsrechner mit aktueller D\xFCsseldorfer Tabelle. Bedarfss\xE4tze, Kindergeld-Anrechnung, Selbstbehalt \u2013 alle Infos auf einen Blick.", "keywords": "Unterhalt Rechner, Kindesunterhalt berechnen, D\xFCsseldorfer Tabelle 2026, Unterhaltsrechner, Unterhalt Kind, Kindesunterhalt 2026, Unterhaltszahlung, Unterhalt berechnen" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen pb-8"> <!-- Header mit Zurück-Button --> <header class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>
Alle Rechner
</a> <div class="flex items-center gap-3"> <span class="text-4xl">💰</span> <div> <h1 class="text-2xl font-bold">Unterhalts-Rechner</h1> <p class="text-blue-100 text-sm">Düsseldorfer Tabelle 2026</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ${renderComponent($$result2, "UnterhaltsRechner", UnterhaltsRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/UnterhaltsRechner", "client:component-export": "default" })} </div> </main> ` })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/unterhalts-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/unterhalts-rechner.astro";
const $$url = "/unterhalts-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$UnterhaltsRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
