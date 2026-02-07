/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, u as unescapeHTML, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DmT1JwUR.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const PFLEGEGELD = {
  1: 0,
  // Kein Anspruch
  2: 347,
  3: 599,
  4: 800,
  5: 990
};
const SACHLEISTUNGEN = {
  1: 0,
  // Kein Anspruch
  2: 796,
  3: 1497,
  4: 1859,
  5: 2299
};
const ENTLASTUNGSBETRAG = 131;
const PFLEGEHILFSMITTEL = 42;
const VERHINDERUNGSPFLEGE_JAHR = 1685;
const KURZZEITPFLEGE_JAHR = 1854;
const TAGESPFLEGE = {
  1: 0,
  2: 721,
  3: 1357,
  4: 1685,
  5: 2085
};
const WOHNRAUMANPASSUNG = 4180;
const BERATUNGSPFLICHT = {
  2: 2,
  // 2x pro Jahr (halbjährlich)
  3: 2,
  // 2x pro Jahr (halbjährlich)
  4: 4,
  // 4x pro Jahr (vierteljährlich)
  5: 4
  // 4x pro Jahr (vierteljährlich)
};
function PflegegeldRechner() {
  const [pflegegrad, setPflegegrad] = useState(2);
  const [nutztPflegedienst, setNutztPflegedienst] = useState(false);
  const [sachleistungsAnteil, setSachleistungsAnteil] = useState(50);
  const [nutztTagespflege, setNutztTagespflege] = useState(false);
  const ergebnis = useMemo(() => {
    const pflegegeldVoll = PFLEGEGELD[pflegegrad];
    const sachleistungenVoll = SACHLEISTUNGEN[pflegegrad];
    const tagespflegeVoll = TAGESPFLEGE[pflegegrad];
    let pflegegeldAnteil = 100;
    let genutzeSachleistungen = 0;
    let restPflegegeld = pflegegeldVoll;
    if (nutztPflegedienst && pflegegrad >= 2) {
      pflegegeldAnteil = 100 - sachleistungsAnteil;
      genutzeSachleistungen = sachleistungenVoll * sachleistungsAnteil / 100;
      restPflegegeld = pflegegeldVoll * pflegegeldAnteil / 100;
    }
    const tagespflegeLeistung = nutztTagespflege ? tagespflegeVoll : 0;
    const pflegegeldJahr = restPflegegeld * 12;
    const sachleistungenJahr = genutzeSachleistungen * 12;
    const tagespflegeJahr = tagespflegeLeistung * 12;
    const entlastungJahr = ENTLASTUNGSBETRAG * 12;
    const hilfsmittelJahr = PFLEGEHILFSMITTEL * 12;
    const verhinderungspflege = pflegegrad >= 2 ? VERHINDERUNGSPFLEGE_JAHR : 0;
    const kurzzeitpflege = pflegegrad >= 2 ? KURZZEITPFLEGE_JAHR : 0;
    const gemeinsamerJahresbetrag = verhinderungspflege + kurzzeitpflege;
    const gesamtMonatlich = restPflegegeld + genutzeSachleistungen + tagespflegeLeistung + ENTLASTUNGSBETRAG + PFLEGEHILFSMITTEL;
    const gesamtJaehrlich = pflegegeldJahr + sachleistungenJahr + tagespflegeJahr + entlastungJahr + hilfsmittelJahr + gemeinsamerJahresbetrag;
    const beratungenProJahr = pflegegrad >= 2 ? BERATUNGSPFLICHT[pflegegrad] : 0;
    return {
      pflegegrad,
      pflegegeldVoll,
      sachleistungenVoll,
      tagespflegeVoll,
      // Kombinationsleistung
      nutztPflegedienst,
      sachleistungsAnteil,
      pflegegeldAnteil,
      genutzeSachleistungen,
      restPflegegeld,
      // Tagespflege
      tagespflegeLeistung,
      // Fixe Leistungen
      entlastungsbetrag: ENTLASTUNGSBETRAG,
      pflegehilfsmittel: PFLEGEHILFSMITTEL,
      // Jährlich
      pflegegeldJahr,
      sachleistungenJahr,
      tagespflegeJahr,
      entlastungJahr,
      hilfsmittelJahr,
      verhinderungspflege,
      kurzzeitpflege,
      gemeinsamerJahresbetrag,
      wohnraumanpassung: WOHNRAUMANPASSUNG,
      // Gesamt
      gesamtMonatlich,
      gesamtJaehrlich,
      // Beratung
      beratungenProJahr
    };
  }, [pflegegrad, nutztPflegedienst, sachleistungsAnteil, nutztTagespflege]);
  const formatEuro = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  const formatEuroRound = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";
  const pflegegradBeschreibung = {
    1: "Geringe Beeinträchtigung der Selbstständigkeit",
    2: "Erhebliche Beeinträchtigung der Selbstständigkeit",
    3: "Schwere Beeinträchtigung der Selbstständigkeit",
    4: "Schwerste Beeinträchtigung der Selbstständigkeit",
    5: "Schwerste Beeinträchtigung mit besonderen Anforderungen"
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Pflegegrad" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Wählen Sie den anerkannten Pflegegrad der pflegebedürftigen Person" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-5 gap-2 mb-3", children: [1, 2, 3, 4, 5].map((pg) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setPflegegrad(pg),
            className: `py-3 px-2 rounded-xl font-bold transition-all text-lg ${pflegegrad === pg ? "bg-teal-500 text-white shadow-lg scale-105" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: pg
          },
          pg
        )) }),
        /* @__PURE__ */ jsxs("div", { className: `p-4 rounded-xl ${pflegegrad === 1 ? "bg-amber-50 border border-amber-200" : "bg-teal-50 border border-teal-200"}`, children: [
          /* @__PURE__ */ jsxs("p", { className: `text-sm ${pflegegrad === 1 ? "text-amber-700" : "text-teal-700"}`, children: [
            /* @__PURE__ */ jsxs("strong", { children: [
              "Pflegegrad ",
              pflegegrad,
              ":"
            ] }),
            " ",
            pflegegradBeschreibung[pflegegrad]
          ] }),
          pflegegrad === 1 && /* @__PURE__ */ jsx("p", { className: "text-xs text-amber-600 mt-2", children: "⚠️ Bei Pflegegrad 1 besteht kein Anspruch auf Pflegegeld oder Pflegesachleistungen" })
        ] })
      ] }),
      pflegegrad >= 2 && /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Nutzen Sie einen ambulanten Pflegedienst?" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Kombinationsleistung: Pflegegeld + Sachleistungen" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 mb-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setNutztPflegedienst(false),
              className: `py-3 px-4 rounded-xl font-medium transition-all ${!nutztPflegedienst ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: "Nein, nur Angehörige"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setNutztPflegedienst(true),
              className: `py-3 px-4 rounded-xl font-medium transition-all ${nutztPflegedienst ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: "Ja, Pflegedienst"
            }
          )
        ] }),
        nutztPflegedienst && /* @__PURE__ */ jsxs("div", { className: "bg-teal-50 rounded-xl p-4 mt-3", children: [
          /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-sm text-teal-700 font-medium", children: [
              "Anteil Sachleistungen (Pflegedienst): ",
              sachleistungsAnteil,
              "%"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-teal-600 block", children: [
              "= ",
              formatEuroRound(ergebnis.sachleistungenVoll * sachleistungsAnteil / 100),
              " / Monat"
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              value: sachleistungsAnteil,
              onChange: (e) => setSachleistungsAnteil(Number(e.target.value)),
              className: "w-full accent-teal-500",
              min: "0",
              max: "100",
              step: "5"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-teal-600 mt-1", children: [
            /* @__PURE__ */ jsx("span", { children: "0% (nur Pflegegeld)" }),
            /* @__PURE__ */ jsx("span", { children: "100% (nur Sachleistungen)" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-teal-600 mt-3", children: [
            "💡 Verbleibendes Pflegegeld: ",
            ergebnis.pflegegeldAnteil,
            "% = ",
            formatEuroRound(ergebnis.restPflegegeld),
            "/Monat"
          ] })
        ] })
      ] }),
      pflegegrad >= 2 && /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Nutzen Sie Tages- oder Nachtpflege?" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Separates Budget – wird nicht auf Pflegegeld angerechnet" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setNutztTagespflege(false),
              className: `py-3 px-4 rounded-xl font-medium transition-all ${!nutztTagespflege ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: "Nein"
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setNutztTagespflege(true),
              className: `py-3 px-4 rounded-xl font-medium transition-all ${nutztTagespflege ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                "Ja, ",
                formatEuroRound(ergebnis.tagespflegeVoll),
                "/Monat"
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: "💶 Ihre monatlichen Pflegeleistungen" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuroRound(ergebnis.gesamtMonatlich) }),
          /* @__PURE__ */ jsx("span", { className: "text-xl opacity-80", children: "pro Monat" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-teal-100 mt-2 text-sm", children: [
          "Pflegegrad ",
          pflegegrad,
          " • ",
          nutztPflegedienst ? "Kombinationsleistung" : "Pflegegeld"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Pflegegeld" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuroRound(ergebnis.restPflegegeld) }),
          nutztPflegedienst && /* @__PURE__ */ jsxs("span", { className: "text-xs text-teal-200", children: [
            ergebnis.pflegegeldAnteil,
            "% von ",
            formatEuroRound(ergebnis.pflegegeldVoll)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Sachleistungen" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuroRound(ergebnis.genutzeSachleistungen) }),
          nutztPflegedienst && /* @__PURE__ */ jsxs("span", { className: "text-xs text-teal-200", children: [
            ergebnis.sachleistungsAnteil,
            "% von ",
            formatEuroRound(ergebnis.sachleistungenVoll)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
        nutztTagespflege && pflegegrad >= 2 && /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-3 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs opacity-80", children: "Tagespflege" }),
          /* @__PURE__ */ jsx("div", { className: "text-lg font-bold", children: formatEuroRound(ergebnis.tagespflegeLeistung) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-3 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs opacity-80", children: "Entlastungsbetrag" }),
          /* @__PURE__ */ jsx("div", { className: "text-lg font-bold", children: formatEuroRound(ergebnis.entlastungsbetrag) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-3 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs opacity-80", children: "Pflegehilfsmittel" }),
          /* @__PURE__ */ jsx("div", { className: "text-lg font-bold", children: formatEuroRound(ergebnis.pflegehilfsmittel) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("h3", { className: "font-bold text-gray-800 mb-4", children: [
        "📅 Jahresübersicht Pflegegrad ",
        pflegegrad
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide", children: "Monatliche Leistungen (×12)" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Pflegegeld" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.pflegegeldJahr) })
        ] }),
        nutztPflegedienst && pflegegrad >= 2 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Pflegesachleistungen" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatEuro(ergebnis.sachleistungenJahr) })
        ] }),
        nutztTagespflege && pflegegrad >= 2 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Tages-/Nachtpflege" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatEuro(ergebnis.tagespflegeJahr) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Entlastungsbetrag" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatEuro(ergebnis.entlastungJahr) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Pflegehilfsmittel (Verbrauch)" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatEuro(ergebnis.hilfsmittelJahr) })
        ] }),
        pflegegrad >= 2 && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide pt-4", children: "Zusätzliche jährliche Leistungen" }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
              "Verhinderungspflege",
              /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400 ml-1", children: "(bis zu)" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatEuro(ergebnis.verhinderungspflege) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
              "Kurzzeitpflege",
              /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400 ml-1", children: "(bis zu)" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatEuro(ergebnis.kurzzeitpflege) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-purple-50 -mx-6 px-6", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-purple-700", children: [
              "Gemeinsamer Jahresbetrag",
              /* @__PURE__ */ jsx("span", { className: "text-xs text-purple-500 block", children: "kombinierbar für beide Leistungen" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-purple-900", children: formatEuro(ergebnis.gemeinsamerJahresbetrag) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-3 bg-teal-100 -mx-6 px-6 rounded-b-xl mt-4", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-teal-800", children: "Gesamtleistungen pro Jahr" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-2xl text-teal-900", children: formatEuroRound(ergebnis.gesamtJaehrlich) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Pflegegeld-Tabelle 2025/2026" }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-gray-50", children: [
          /* @__PURE__ */ jsx("th", { className: "text-left py-3 px-4 font-semibold text-gray-700", children: "Pflegegrad" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-3 px-4 font-semibold text-gray-700", children: "Pflegegeld" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-3 px-4 font-semibold text-gray-700", children: "Sachleistungen" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-3 px-4 font-semibold text-gray-700", children: "Tagespflege" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: [1, 2, 3, 4, 5].map((pg) => /* @__PURE__ */ jsxs(
          "tr",
          {
            className: `border-b border-gray-100 ${pflegegrad === pg ? "bg-teal-50" : ""}`,
            children: [
              /* @__PURE__ */ jsxs("td", { className: `py-3 px-4 ${pflegegrad === pg ? "font-bold text-teal-700" : "text-gray-600"}`, children: [
                "Pflegegrad ",
                pg
              ] }),
              /* @__PURE__ */ jsx("td", { className: `py-3 px-4 text-right ${pflegegrad === pg ? "font-bold text-teal-700" : "text-gray-900"}`, children: PFLEGEGELD[pg] === 0 ? "—" : formatEuroRound(PFLEGEGELD[pg]) }),
              /* @__PURE__ */ jsx("td", { className: `py-3 px-4 text-right ${pflegegrad === pg ? "font-bold text-teal-700" : "text-gray-900"}`, children: SACHLEISTUNGEN[pg] === 0 ? "—" : formatEuroRound(SACHLEISTUNGEN[pg]) }),
              /* @__PURE__ */ jsx("td", { className: `py-3 px-4 text-right ${pflegegrad === pg ? "font-bold text-teal-700" : "text-gray-900"}`, children: TAGESPFLEGE[pg] === 0 ? "—" : formatEuroRound(TAGESPFLEGE[pg]) })
            ]
          },
          pg
        )) })
      ] }) }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-3", children: "Stand: Januar 2025 (keine Erhöhung 2026). Nächste geplante Anpassung: 01.01.2028." })
    ] }),
    pflegegrad >= 2 && /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-amber-800 mb-3", children: "📋 Pflicht-Beratung nach § 37.3 SGB XI" }),
      /* @__PURE__ */ jsxs("div", { className: "text-sm text-amber-700", children: [
        /* @__PURE__ */ jsxs("p", { className: "mb-3", children: [
          "Als Pflegegeld-Empfänger müssen Sie ",
          /* @__PURE__ */ jsxs("strong", { children: [
            ergebnis.beratungenProJahr,
            "× pro Jahr"
          ] }),
          " einen kostenlosen Beratungsbesuch durchführen lassen:"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-white/50 rounded-xl p-4", children: /* @__PURE__ */ jsxs("ul", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-amber-600", children: "•" }),
            /* @__PURE__ */ jsxs("span", { children: [
              /* @__PURE__ */ jsx("strong", { children: "Pflegegrad 2 oder 3:" }),
              " Einmal pro Halbjahr (2× im Jahr)"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-amber-600", children: "•" }),
            /* @__PURE__ */ jsxs("span", { children: [
              /* @__PURE__ */ jsx("strong", { children: "Pflegegrad 4 oder 5:" }),
              " Einmal pro Quartal (4× im Jahr)"
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-amber-600 text-xs", children: "⚠️ Bei Versäumnis kann das Pflegegeld zunächst um die Hälfte und bei wiederholtem Versäumnis ganz gekürzt werden." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert das Pflegegeld" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Für häusliche Pflege:" }),
            " Pflegegeld erhalten Pflegebedürftige ab Pflegegrad 2, die zuhause von Angehörigen gepflegt werden"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Freie Verwendung:" }),
            " Das Pflegegeld wird an den Pflegebedürftigen ausgezahlt und kann frei verwendet oder an Pflegepersonen weitergegeben werden"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Kombinationsleistung:" }),
            " Pflegegeld kann mit ambulanten Pflegesachleistungen kombiniert werden – das Pflegegeld wird dann anteilig gekürzt"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Tagespflege separat:" }),
            " Das Budget für Tages-/Nachtpflege ist eigenständig und wird nicht auf das Pflegegeld angerechnet"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Steuerfrei:" }),
            " Das Pflegegeld ist steuerfrei und wird nicht auf Sozialleistungen angerechnet"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Rentenversicherung:" }),
            " Pflegepersonen werden in der Rentenversicherung versichert (bei mind. 10 Std./Woche Pflege)"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-teal-50 border border-teal-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-teal-800 mb-3", children: "📦 Weitere Pflegeleistungen" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-teal-900", children: "Entlastungsbetrag" }),
          /* @__PURE__ */ jsxs("p", { className: "text-teal-700 text-2xl font-bold mt-1", children: [
            formatEuroRound(ENTLASTUNGSBETRAG),
            "/Monat"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-teal-600 text-xs mt-1", children: "Für Betreuung & Haushaltshilfe (alle Pflegegrade)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-teal-900", children: "Pflegehilfsmittel" }),
          /* @__PURE__ */ jsxs("p", { className: "text-teal-700 text-2xl font-bold mt-1", children: [
            formatEuroRound(PFLEGEHILFSMITTEL),
            "/Monat"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-teal-600 text-xs mt-1", children: "Für Verbrauchsmittel wie Handschuhe, Desinfektionsmittel" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-teal-900", children: "Verhinderungspflege" }),
          /* @__PURE__ */ jsxs("p", { className: "text-teal-700 text-2xl font-bold mt-1", children: [
            formatEuroRound(VERHINDERUNGSPFLEGE_JAHR),
            "/Jahr"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-teal-600 text-xs mt-1", children: "Wenn Pflegeperson verhindert ist (ab PG 2)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-teal-900", children: "Kurzzeitpflege" }),
          /* @__PURE__ */ jsxs("p", { className: "text-teal-700 text-2xl font-bold mt-1", children: [
            formatEuroRound(KURZZEITPFLEGE_JAHR),
            "/Jahr"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-teal-600 text-xs mt-1", children: "Vorübergehende stationäre Pflege (ab PG 2)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-4 sm:col-span-2", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-teal-900", children: "Wohnraumanpassung" }),
          /* @__PURE__ */ jsx("p", { className: "text-teal-700 text-2xl font-bold mt-1", children: formatEuroRound(WOHNRAUMANPASSUNG) }),
          /* @__PURE__ */ jsx("p", { className: "text-teal-600 text-xs mt-1", children: "Einmalig pro Maßnahme (z.B. barrierefreies Bad)" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-amber-800 mb-3", children: "⚠️ Wichtige Hinweise" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-amber-700", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Antrag stellen:" }),
            " Pflegegeld muss bei der Pflegekasse beantragt werden – ein formloser Antrag genügt zunächst"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "MD-Begutachtung:" }),
            " Der Medizinische Dienst (MD) prüft den Pflegegrad bei einem Hausbesuch"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Rückwirkend:" }),
            " Leistungen werden ab Antragstellung gewährt, nicht ab Feststellung des Pflegegrads"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Höherstufung:" }),
            " Bei Verschlechterung kann ein Antrag auf Höherstufung gestellt werden"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Krankenhaus/Reha:" }),
            " Bei Krankenhausaufenthalt wird Pflegegeld bis zu 28 Tage weitergezahlt"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Widerspruch:" }),
            " Bei Ablehnung oder zu niedrigem Pflegegrad innerhalb eines Monats Widerspruch einlegen"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörde" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-teal-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-teal-900", children: "Ihre Pflegekasse" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-teal-700 mt-1", children: "Die Pflegekasse ist immer an Ihre Krankenkasse angebunden. Den Antrag stellen Sie dort – ein Anruf, E-Mail oder Brief genügt zunächst." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Pflegetelefon" }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "030 / 340 60 66 - 02" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Bundesministerium für Familie" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Informationsportal" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.bundesgesundheitsministerium.de/themen/pflege",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "BMG Pflegeinfos →"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📋" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Für den Antrag benötigen Sie:" }),
            /* @__PURE__ */ jsxs("ul", { className: "text-gray-600 mt-1 space-y-1", children: [
              /* @__PURE__ */ jsx("li", { children: "• Versichertenkarte der pflegebedürftigen Person" }),
              /* @__PURE__ */ jsx("li", { children: "• Formloser Antrag auf Pflegeleistungen" }),
              /* @__PURE__ */ jsx("li", { children: "• Ggf. Vollmacht, wenn Sie für jemand anderen beantragen" })
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
            href: "https://www.gesetze-im-internet.de/sgb_11/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "SGB XI – Soziale Pflegeversicherung – Gesetze im Internet"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bundesgesundheitsministerium.de/themen/pflege/pflegeversicherung-leistungen",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesministerium für Gesundheit – Leistungen der Pflegeversicherung"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.pflege.de/pflegekasse-pflegefinanzierung/pflegeleistungen/pflegegeld/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "pflege.de – Pflegegeld: Definition, Höhe & Voraussetzungen"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.verbraucherzentrale.de/wissen/gesundheit-pflege/pflegeantrag-und-leistungen",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Verbraucherzentrale – Pflegeantrag und Leistungen"
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
const $$PflegegeldRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "Pflegegeld-Rechner 2025/2026 \u2013 H\xF6he nach Pflegegrad berechnen";
  const description = "Pflegegeld Rechner 2025/2026: Berechnen Sie Pflegegeld nach Pflegegrad 1-5. Mit Kombinationsleistung, Sachleistungen, Entlastungsbetrag & allen Pflegeleistungen im \xDCberblick.";
  const keywords = "Pflegegeld Rechner, Pflegegeld 2025, Pflegegeld 2026, Pflegegeld H\xF6he, Pflegegrad Geld, Pflegegeld berechnen, Pflegegeld Tabelle, Pflegegeld Anspruch, Pflegesachleistungen, Kombinationsleistung, Pflegegeld Pflegegrad 2, Pflegegeld Pflegegrad 3, Pflegegeld Pflegegrad 4, Pflegegeld Pflegegrad 5, h\xE4usliche Pflege Geld, Pflegeversicherung Leistungen";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<main class="min-h-screen pb-8"> <!-- Header mit Zur\xFCck-Button --> <header class="bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-teal-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>\nAlle Rechner\n</a> <div class="flex items-center gap-3"> <span class="text-4xl">\u{1FA7A}</span> <div> <h1 class="text-2xl font-bold">Pflegegeld-Rechner</h1> <p class="text-teal-100 text-sm">Pflegegeld nach Pflegegrad 2025/2026</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ', ` </div> <!-- SEO Content Section --> <div class="max-w-2xl mx-auto px-4 mt-8"> <div class="bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">Pflegegeld 2025/2026: Alles was Sie wissen m\xFCssen</h2> <div class="prose prose-sm text-gray-600 space-y-4"> <p>
Das <strong>Pflegegeld</strong> ist eine monatliche Geldleistung der Pflegeversicherung f\xFCr 
            Menschen mit anerkanntem Pflegegrad, die zuhause von Angeh\xF6rigen oder ehrenamtlichen 
            Pflegepersonen versorgt werden. Mit unserem <strong>Pflegegeld-Rechner</strong> berechnen Sie 
            schnell und einfach Ihren Anspruch nach Pflegegrad 1-5.
</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wie hoch ist das Pflegegeld 2025/2026?</h3> <p>
Die H\xF6he des Pflegegeldes richtet sich nach dem festgestellten <strong>Pflegegrad</strong>. 
            Nach der Erh\xF6hung zum 01.01.2025 gelten folgende Betr\xE4ge (keine Erh\xF6hung 2026):
</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Pflegegrad 1:</strong> Kein Anspruch auf Pflegegeld</li> <li><strong>Pflegegrad 2:</strong> 347 Euro pro Monat</li> <li><strong>Pflegegrad 3:</strong> 599 Euro pro Monat</li> <li><strong>Pflegegrad 4:</strong> 800 Euro pro Monat</li> <li><strong>Pflegegrad 5:</strong> 990 Euro pro Monat</li> </ul> <p>
Die n\xE4chste regul\xE4re Anpassung ist f\xFCr den <strong>01.01.2028</strong> geplant und soll sich 
            an der Kerninflationsrate orientieren.
</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wer hat Anspruch auf Pflegegeld?</h3> <p> <strong>Voraussetzungen</strong> f\xFCr den Bezug von Pflegegeld:
</p> <ul class="list-disc pl-5 space-y-1"> <li>Sie sind in der gesetzlichen oder privaten <strong>Pflegeversicherung</strong> versichert</li> <li>Sie haben mindestens <strong>Pflegegrad 2</strong> (ab 27 Punkten im Gutachten)</li> <li>Die h\xE4usliche Pflege ist sichergestellt (durch Angeh\xF6rige, Freunde oder Ehrenamtliche)</li> <li>Es wird kein ambulanter Pflegedienst in Anspruch genommen (sonst Kombinationsleistung)</li> </ul> <p> <strong>Bei Pflegegrad 1</strong> besteht kein Anspruch auf Pflegegeld, aber auf den
<strong>Entlastungsbetrag</strong> von 131 Euro monatlich.
</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Pflegegeld und Pflegedienst kombinieren (Kombinationsleistung)</h3> <p>
Sie k\xF6nnen <strong>Pflegegeld</strong> und <strong>Pflegesachleistungen</strong> (ambulanter 
            Pflegedienst) kombinieren. Das nennt sich <strong>Kombinationsleistung</strong>:
</p> <ul class="list-disc pl-5 space-y-1"> <li>Das Pflegegeld wird anteilig um den genutzten Sachleistungsanteil gek\xFCrzt</li> <li>Beispiel: 50% Sachleistungen = 50% des vollen Pflegegeldes</li> <li>Die <strong>Tagespflege</strong> wird nicht angerechnet (separates Budget)</li> </ul> <p>
Die Kombinationsleistung lohnt sich, wenn Sie zwar einen Pflegedienst nutzen, aber nicht 
            den vollen Sachleistungsbetrag aussch\xF6pfen.
</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Pflegegeld beantragen: So geht's</h3> <p>
Den <strong>Antrag auf Pflegegeld</strong> stellen Sie bei Ihrer Pflegekasse (angebunden an 
            Ihre Krankenkasse):
</p> <ul class="list-disc pl-5 space-y-1"> <li>Formloser Antrag gen\xFCgt (Anruf, E-Mail oder Brief)</li> <li>Die Pflegekasse schickt Ihnen alle weiteren Formulare zu</li> <li>Der <strong>Medizinische Dienst (MD)</strong> f\xFChrt eine Begutachtung durch</li> <li>Leistungen werden ab <strong>Antragstellung</strong> gew\xE4hrt, nicht ab Feststellung</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Pflicht-Beratung bei Pflegegeldbezug</h3> <p>
Wer Pflegegeld bezieht, muss regelm\xE4\xDFig einen <strong>Beratungsbesuch nach \xA7 37.3 SGB XI</strong>
in Anspruch nehmen:
</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Pflegegrad 2 oder 3:</strong> 2\xD7 pro Jahr (halbj\xE4hrlich)</li> <li><strong>Pflegegrad 4 oder 5:</strong> 4\xD7 pro Jahr (viertelj\xE4hrlich)</li> </ul> <p>
Die Beratung ist <strong>kostenlos</strong> und wird von zugelassenen Pflegediensten oder 
            Pflegeberatern durchgef\xFChrt. Bei Vers\xE4umnis droht K\xFCrzung des Pflegegeldes.
</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Weitere Pflegeleistungen neben dem Pflegegeld</h3> <p>
Zus\xE4tzlich zum Pflegegeld stehen Pflegebed\xFCrftigen weitere <strong>Leistungen</strong> zu:
</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Entlastungsbetrag:</strong> 131 Euro/Monat f\xFCr Betreuung und Haushaltshilfe</li> <li><strong>Pflegehilfsmittel:</strong> 42 Euro/Monat f\xFCr Verbrauchsmittel</li> <li><strong>Verhinderungspflege:</strong> Bis zu 1.685 Euro/Jahr (wenn Pflegeperson verhindert)</li> <li><strong>Kurzzeitpflege:</strong> Bis zu 1.854 Euro/Jahr (vor\xFCbergehend station\xE4r)</li> <li><strong>Wohnraumanpassung:</strong> Bis zu 4.180 Euro pro Ma\xDFnahme</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Pflegegeld: Steuerfrei und sozialversicherungsfrei</h3> <p>
Das Pflegegeld ist <strong>steuerfrei</strong> und wird nicht auf andere Sozialleistungen 
            wie B\xFCrgergeld oder Wohngeld angerechnet. Pflegende Angeh\xF6rige profitieren au\xDFerdem von
<strong>Rentenversicherungsbeitr\xE4gen</strong>, die von der Pflegekasse gezahlt werden.
</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Pflegegrad ermitteln: MD-Begutachtung</h3> <p>
Der <strong>Pflegegrad</strong> wird durch den Medizinischen Dienst (MD, fr\xFCher MDK) bei 
            einem Hausbesuch ermittelt. Dabei werden sechs Bereiche gepr\xFCft:
</p> <ul class="list-disc pl-5 space-y-1"> <li>Mobilit\xE4t (10%)</li> <li>Kognitive und kommunikative F\xE4higkeiten (15%)</li> <li>Verhaltensweisen und psychische Problemlagen (15%)</li> <li>Selbstversorgung (40%)</li> <li>Umgang mit Krankheit/Therapie (20%)</li> <li>Alltagsleben und soziale Kontakte (15%)</li> </ul> <p>
Je nach Punktzahl (0-100) wird ein Pflegegrad von 1 bis 5 vergeben. Unser
<a href="/pflegegrad-rechner" class="text-teal-600 hover:underline">Pflegegrad-Rechner</a>
hilft bei der Einsch\xE4tzung (sobald verf\xFCgbar).
</p> </div> </div> </div> </main>  <script type="application/ld+json">`, '<\/script>  <script type="application/ld+json">', "<\/script> "])), maybeRenderHead(), renderComponent($$result2, "PflegegeldRechner", PflegegeldRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/PflegegeldRechner", "client:component-export": "default" }), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Pflegegeld-Rechner 2025/2026",
    "description": description,
    "url": "https://deutschland-rechner.de/pflegegeld-rechner",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    },
    "author": {
      "@type": "Organization",
      "name": "Deutschland-Rechner"
    }
  })), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Wie hoch ist das Pflegegeld 2025/2026?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Das Pflegegeld betr\xE4gt 2025/2026: Pflegegrad 2: 347 \u20AC, Pflegegrad 3: 599 \u20AC, Pflegegrad 4: 800 \u20AC, Pflegegrad 5: 990 \u20AC pro Monat. Bei Pflegegrad 1 besteht kein Anspruch auf Pflegegeld."
        }
      },
      {
        "@type": "Question",
        "name": "Wer hat Anspruch auf Pflegegeld?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Anspruch auf Pflegegeld haben pflegebed\xFCrftige Personen ab Pflegegrad 2, die zuhause von Angeh\xF6rigen, Freunden oder ehrenamtlichen Pflegepersonen gepflegt werden. Die Pflege muss in geeigneter Weise sichergestellt sein."
        }
      },
      {
        "@type": "Question",
        "name": "Kann ich Pflegegeld und Pflegedienst kombinieren?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, mit der Kombinationsleistung k\xF6nnen Sie Pflegegeld und Pflegesachleistungen kombinieren. Das Pflegegeld wird dann anteilig um den genutzten Sachleistungsanteil gek\xFCrzt. Nutzen Sie 50% der Sachleistungen, erhalten Sie 50% des Pflegegeldes."
        }
      },
      {
        "@type": "Question",
        "name": "Wo beantrage ich Pflegegeld?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Das Pflegegeld beantragen Sie bei Ihrer Pflegekasse. Diese ist an Ihre Krankenkasse angebunden. Ein formloser Antrag per Anruf, E-Mail oder Brief gen\xFCgt zun\xE4chst. Die Pflegekasse schickt Ihnen dann alle Formulare zu."
        }
      },
      {
        "@type": "Question",
        "name": "Muss ich Pflegegeld versteuern?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nein, das Pflegegeld ist steuerfrei. Es wird auch nicht auf andere Sozialleistungen wie B\xFCrgergeld oder Wohngeld angerechnet. Pflegende Angeh\xF6rige erhalten zudem Rentenversicherungsbeitr\xE4ge von der Pflegekasse."
        }
      },
      {
        "@type": "Question",
        "name": "Was ist die Beratungspflicht bei Pflegegeld?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Pflegegeld-Empf\xE4nger m\xFCssen regelm\xE4\xDFig einen kostenlosen Beratungsbesuch nach \xA7 37.3 SGB XI in Anspruch nehmen: Bei Pflegegrad 2 oder 3 zweimal pro Jahr (halbj\xE4hrlich), bei Pflegegrad 4 oder 5 viermal pro Jahr (viertelj\xE4hrlich)."
        }
      }
    ]
  }))) })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/pflegegeld-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/pflegegeld-rechner.astro";
const $$url = "/pflegegeld-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$PflegegeldRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
