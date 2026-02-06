/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_v22DC8tm.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const RENTEN_2026 = {
  rentenwert: 40.79,
  // € pro Entgeltpunkt (ab 01.07.2025)
  durchschnittsentgelt: 51944,
  // % vom Bruttolohn (Arbeitnehmer + Arbeitgeber)
  beitragsbemessungsgrenze: 8050,
  // % (Haltelinie)
  abschlagProMonat: 0.3,
  // % Abzug pro Monat vor Regelaltersgrenze
  maxAbschlag: 14.4,
  // % maximaler Abschlag (48 Monate × 0,3%)
  rentenartfaktorAltersrente: 1
  // Faktor für normale Altersrente
};
function getRegelaltersgrenze(geburtsJahr) {
  if (geburtsJahr < 1947) return { jahre: 65, monate: 0 };
  if (geburtsJahr === 1947) return { jahre: 65, monate: 1 };
  if (geburtsJahr === 1948) return { jahre: 65, monate: 2 };
  if (geburtsJahr === 1949) return { jahre: 65, monate: 3 };
  if (geburtsJahr === 1950) return { jahre: 65, monate: 4 };
  if (geburtsJahr === 1951) return { jahre: 65, monate: 5 };
  if (geburtsJahr === 1952) return { jahre: 65, monate: 6 };
  if (geburtsJahr === 1953) return { jahre: 65, monate: 7 };
  if (geburtsJahr === 1954) return { jahre: 65, monate: 8 };
  if (geburtsJahr === 1955) return { jahre: 65, monate: 9 };
  if (geburtsJahr === 1956) return { jahre: 65, monate: 10 };
  if (geburtsJahr === 1957) return { jahre: 65, monate: 11 };
  if (geburtsJahr === 1958) return { jahre: 66, monate: 0 };
  if (geburtsJahr === 1959) return { jahre: 66, monate: 2 };
  if (geburtsJahr === 1960) return { jahre: 66, monate: 4 };
  if (geburtsJahr === 1961) return { jahre: 66, monate: 6 };
  if (geburtsJahr === 1962) return { jahre: 66, monate: 8 };
  if (geburtsJahr === 1963) return { jahre: 66, monate: 10 };
  return { jahre: 67, monate: 0 };
}
function getRenteMit63Alter(geburtsJahr) {
  if (geburtsJahr < 1953) return { jahre: 63, monate: 0 };
  if (geburtsJahr === 1953) return { jahre: 63, monate: 2 };
  if (geburtsJahr === 1954) return { jahre: 63, monate: 4 };
  if (geburtsJahr === 1955) return { jahre: 63, monate: 6 };
  if (geburtsJahr === 1956) return { jahre: 63, monate: 8 };
  if (geburtsJahr === 1957) return { jahre: 63, monate: 10 };
  if (geburtsJahr === 1958) return { jahre: 64, monate: 0 };
  if (geburtsJahr === 1959) return { jahre: 64, monate: 2 };
  if (geburtsJahr === 1960) return { jahre: 64, monate: 4 };
  if (geburtsJahr === 1961) return { jahre: 64, monate: 6 };
  if (geburtsJahr === 1962) return { jahre: 64, monate: 8 };
  if (geburtsJahr === 1963) return { jahre: 64, monate: 10 };
  return { jahre: 65, monate: 0 };
}
function berechneRente(geburtsJahr, beitragsJahre, durchschnittsBrutto, hat45Beitragsjahre) {
  const jahresentgelt = durchschnittsBrutto * 12;
  const entgeltpunkteProJahr = Math.min(jahresentgelt / RENTEN_2026.durchschnittsentgelt, 2);
  const entgeltpunkte = entgeltpunkteProJahr * beitragsJahre;
  const durchschnittsentgeltAnteil = jahresentgelt / RENTEN_2026.durchschnittsentgelt * 100;
  const regelaltersgrenze = getRegelaltersgrenze(geburtsJahr);
  const renteMitRegelalter = entgeltpunkte * 1 * RENTEN_2026.rentenwert * RENTEN_2026.rentenartfaktorAltersrente;
  let renteMit63 = null;
  if (hat45Beitragsjahre) {
    const alterMit63 = getRenteMit63Alter(geburtsJahr);
    if (alterMit63) {
      renteMit63 = {
        alter: alterMit63,
        abschlag: 0,
        // Bei 45 Jahren: abschlagsfrei
        rente: entgeltpunkte * 1 * RENTEN_2026.rentenwert * RENTEN_2026.rentenartfaktorAltersrente
      };
    }
  }
  let fruehrente = null;
  if (beitragsJahre >= 35 && !hat45Beitragsjahre) {
    const regelalterMonate = regelaltersgrenze.jahre * 12 + regelaltersgrenze.monate;
    const fruehrenteMonate = 63 * 12;
    const monateVorher = Math.max(0, regelalterMonate - fruehrenteMonate);
    const abschlagProzent = Math.min(monateVorher * RENTEN_2026.abschlagProMonat, RENTEN_2026.maxAbschlag);
    const zugangsfaktor = 1 - abschlagProzent / 100;
    fruehrente = {
      monateVorher,
      abschlag: abschlagProzent,
      rente: entgeltpunkte * zugangsfaktor * RENTEN_2026.rentenwert * RENTEN_2026.rentenartfaktorAltersrente
    };
  }
  return {
    entgeltpunkte,
    regelaltersgrenze,
    renteMitRegelalter,
    renteMit63,
    fruehrente,
    durchschnittsentgeltAnteil
  };
}
function RentenRechner() {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const [geburtsJahr, setGeburtsJahr] = useState(1980);
  const [beitragsJahre, setBeitragsJahre] = useState(35);
  const [durchschnittsBrutto, setDurchschnittsBrutto] = useState(4e3);
  const [hat45Beitragsjahre, setHat45Beitragsjahre] = useState(false);
  const ergebnis = useMemo(() => {
    return berechneRente(geburtsJahr, beitragsJahre, durchschnittsBrutto, hat45Beitragsjahre);
  }, [geburtsJahr, beitragsJahre, durchschnittsBrutto, hat45Beitragsjahre]);
  const formatEuro = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  const formatAlter = (a) => a.monate > 0 ? `${a.jahre} Jahre + ${a.monate} Monate` : `${a.jahre} Jahre`;
  const aktuellesAlter = currentYear - geburtsJahr;
  const jahreeBisRente = Math.max(0, ergebnis.regelaltersgrenze.jahre - aktuellesAlter);
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Geburtsjahr" }) }),
        /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            value: geburtsJahr,
            onChange: (e) => setGeburtsJahr(Math.max(1940, Math.min(2010, Number(e.target.value)))),
            className: "w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none",
            min: "1940",
            max: "2010"
          }
        ) }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            min: "1940",
            max: "2010",
            value: geburtsJahr,
            onChange: (e) => setGeburtsJahr(Number(e.target.value)),
            className: "w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
          }
        ),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 mt-1 text-center", children: [
          "Aktuelles Alter: ",
          /* @__PURE__ */ jsxs("strong", { children: [
            aktuellesAlter,
            " Jahre"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Durchschnittliches Bruttogehalt" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 ml-2", children: "(pro Monat über Berufsleben)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: durchschnittsBrutto,
              onChange: (e) => setDurchschnittsBrutto(Math.max(0, Number(e.target.value))),
              className: "w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none",
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
            min: "1000",
            max: "8000",
            step: "100",
            value: durchschnittsBrutto,
            onChange: (e) => setDurchschnittsBrutto(Number(e.target.value)),
            className: "w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
          }
        ),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 mt-1 text-center", children: [
          "≈ ",
          /* @__PURE__ */ jsxs("strong", { children: [
            ergebnis.durchschnittsentgeltAnteil.toFixed(0),
            "%"
          ] }),
          " des Durchschnittsentgelts (",
          RENTEN_2026.durchschnittsentgelt.toLocaleString("de-DE"),
          " €/Jahr)"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Voraussichtliche Beitragsjahre" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 ml-2", children: "(inkl. Ausbildung, Studium, Kindererziehung)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setBeitragsJahre(Math.max(5, beitragsJahre - 1)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-2xl font-bold",
              children: "−"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 text-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-4xl font-bold text-gray-800", children: beitragsJahre }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-500 ml-2", children: "Jahre" })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setBeitragsJahre(Math.min(50, beitragsJahre + 1)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-2xl font-bold",
              children: "+"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            min: "5",
            max: "50",
            value: beitragsJahre,
            onChange: (e) => setBeitragsJahre(Number(e.target.value)),
            className: "w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "p-4 bg-gray-50 rounded-xl", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            checked: hat45Beitragsjahre,
            onChange: (e) => setHat45Beitragsjahre(e.target.checked),
            className: "w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-800", children: "45 Beitragsjahre erreicht?" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: 'Für "Rente mit 63" ohne Abschläge (besonders langjährig Versicherte)' })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white mb-6", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-sm font-medium text-teal-100 mb-1", children: [
        "Deine Rente mit ",
        formatAlter(ergebnis.regelaltersgrenze)
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuro(ergebnis.renteMitRegelalter) }),
        /* @__PURE__ */ jsx("span", { className: "text-xl text-teal-200", children: "/ Monat" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("p", { className: "text-teal-100 text-sm", children: "Entgeltpunkte" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold", children: ergebnis.entgeltpunkte.toFixed(2) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("p", { className: "text-teal-100 text-sm", children: "Rentenwert" }),
          /* @__PURE__ */ jsxs("p", { className: "text-2xl font-bold", children: [
            RENTEN_2026.rentenwert.toFixed(2),
            " €"
          ] })
        ] })
      ] }),
      jahreeBisRente > 0 && /* @__PURE__ */ jsxs("p", { className: "text-teal-100 text-sm mt-4 text-center", children: [
        "📅 Noch ",
        /* @__PURE__ */ jsxs("strong", { children: [
          jahreeBisRente,
          " Jahre"
        ] }),
        " bis zur Regelaltersgrenze"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📐 Rentenformel" }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-xl p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-center text-sm text-gray-600 mb-2", children: "Monatliche Bruttorente =" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 flex-wrap text-lg", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-teal-100 px-3 py-2 rounded-lg", children: [
            /* @__PURE__ */ jsx("span", { className: "text-teal-800 font-bold", children: ergebnis.entgeltpunkte.toFixed(2) }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-teal-600 block", children: "Entgeltpunkte" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "×" }),
          /* @__PURE__ */ jsxs("div", { className: "bg-blue-100 px-3 py-2 rounded-lg", children: [
            /* @__PURE__ */ jsx("span", { className: "text-blue-800 font-bold", children: "1,0" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-blue-600 block", children: "Zugangsfaktor" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "×" }),
          /* @__PURE__ */ jsxs("div", { className: "bg-purple-100 px-3 py-2 rounded-lg", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-purple-800 font-bold", children: [
              RENTEN_2026.rentenwert,
              " €"
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-purple-600 block", children: "Rentenwert" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "×" }),
          /* @__PURE__ */ jsxs("div", { className: "bg-orange-100 px-3 py-2 rounded-lg", children: [
            /* @__PURE__ */ jsx("span", { className: "text-orange-800 font-bold", children: "1,0" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-orange-600 block", children: "Rentenartfaktor" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "⏰ Frührente-Optionen" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        ergebnis.renteMit63 && /* @__PURE__ */ jsxs("div", { className: "p-4 bg-green-50 border-2 border-green-200 rounded-xl", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🎉" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("p", { className: "font-bold text-green-800", children: [
                "Rente mit ",
                formatAlter(ergebnis.renteMit63.alter)
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-green-600", children: "Besonders langjährig Versicherte (45 Jahre)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mt-3", children: [
            /* @__PURE__ */ jsx("span", { className: "text-green-700", children: "Ohne Abschläge!" }),
            /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold text-green-800", children: formatEuro(ergebnis.renteMit63.rente) })
          ] })
        ] }),
        ergebnis.fruehrente && /* @__PURE__ */ jsxs("div", { className: "p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "⚠️" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-bold text-yellow-800", children: "Rente mit 63" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-yellow-600", children: "Langjährig Versicherte (35 Jahre)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-yellow-700", children: [
                ergebnis.fruehrente.monateVorher,
                " Monate vor Regelaltersgrenze"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-red-600 font-bold", children: [
                "-",
                ergebnis.fruehrente.abschlag.toFixed(1),
                "% Abschlag"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
              /* @__PURE__ */ jsx("span", { className: "text-yellow-700", children: "Reduzierte Rente:" }),
              /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold text-yellow-800", children: formatEuro(ergebnis.fruehrente.rente) })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-yellow-600 mt-2", children: [
              "Abschlag gilt ",
              /* @__PURE__ */ jsx("strong", { children: "lebenslang" }),
              " – ",
              RENTEN_2026.abschlagProMonat,
              "% pro Monat früher (max. ",
              RENTEN_2026.maxAbschlag,
              "%)"
            ] })
          ] })
        ] }),
        beitragsJahre < 35 && /* @__PURE__ */ jsx("div", { className: "p-4 bg-gray-50 rounded-xl", children: /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-sm", children: [
          "💡 ",
          /* @__PURE__ */ jsx("strong", { children: "Hinweis:" }),
          " Für Frührente mit 63 brauchst du mindestens 35 Beitragsjahre. Du hast aktuell ",
          beitragsJahre,
          " Jahre geplant."
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "📊 So sammelst du Entgeltpunkte" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold text-teal-700", children: "1.0" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Durchschnittsverdienst = 1 Punkt" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500", children: [
              RENTEN_2026.durchschnittsentgelt.toLocaleString("de-DE"),
              " € brutto/Jahr (2026)"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold text-blue-700", children: "~2.0" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Maximum pro Jahr" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500", children: [
              "Durch Beitragsbemessungsgrenze (",
              RENTEN_2026.beitragsbemessungsgrenze.toLocaleString("de-DE"),
              " €/Monat)"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold text-purple-700", children: (ergebnis.entgeltpunkte / beitragsJahre).toFixed(2) }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Dein Durchschnitt" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500", children: [
              "Punkte pro Jahr bei ",
              durchschnittsBrutto.toLocaleString("de-DE"),
              " € Brutto/Monat"
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "➕ Anrechnungszeiten (zählen auch!)" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "👶" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Kindererziehungszeiten:" }),
            " 3 Jahre pro Kind (ca. 3 Entgeltpunkte)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "🎓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Schulausbildung:" }),
            " Ab 17 Jahren (max. 8 Jahre, keine Punkte)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "📚" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Studium:" }),
            " Anrechnungszeit ohne Punkte (zählt für Wartezeit)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "💼" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Arbeitslosigkeit:" }),
            " Mit ALG I (80% des Bemessungsentgelts)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "🏥" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Krankheit:" }),
            " Krankengeld zählt als Beitragszeit"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "🪖" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Wehrdienst/Zivildienst:" }),
            " Vollständig anerkannt"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörde" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-teal-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-teal-900", children: "Deutsche Rentenversicherung (DRV)" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-teal-700 mt-1", children: "Zuständig für alle Fragen zur gesetzlichen Rente" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Servicetelefon" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "tel:08001000480",
                  className: "text-blue-600 hover:underline font-bold",
                  children: "0800 1000 480"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Kostenlos, Mo-Do 7:30-19:30, Fr 7:30-15:30" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Online-Dienste" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.deutsche-rentenversicherung.de",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "deutsche-rentenversicherung.de →"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "p-3 bg-yellow-50 rounded-xl text-sm", children: /* @__PURE__ */ jsxs("p", { className: "text-yellow-800", children: [
          "💡 ",
          /* @__PURE__ */ jsx("strong", { children: "Tipp:" }),
          " Fordere deine persönliche ",
          /* @__PURE__ */ jsx("strong", { children: "Renteninformation" }),
          " an oder nutze den kostenlosen ",
          /* @__PURE__ */ jsx("strong", { children: "Rentenbescheid" }),
          " ab 55 Jahren!"
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "📋 Wichtige Hinweise" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-blue-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📈" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-blue-800", children: "Rentenwert steigt jährlich" }),
            /* @__PURE__ */ jsx("p", { className: "text-blue-700", children: "Der Rentenwert wird jedes Jahr zum 1. Juli angepasst (ca. 2-4% Steigerung)." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-orange-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "💰" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-orange-800", children: "Bruttorente ≠ Nettorente" }),
            /* @__PURE__ */ jsx("p", { className: "text-orange-700", children: "Abzüge: Krankenversicherung (~7,3%), Pflegeversicherung (~3,4%), ggf. Steuern." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-purple-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🧮" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-purple-800", children: "Vereinfachte Berechnung" }),
            /* @__PURE__ */ jsx("p", { className: "text-purple-700", children: "Dies ist eine Prognose. Die tatsächliche Rente hängt von vielen Faktoren ab (z.B. zukünftige Lohnentwicklung, Beitragsjahre)." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-green-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📊" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-green-800", children: "Rentenniveau 48%" }),
            /* @__PURE__ */ jsx("p", { className: "text-green-700", children: 'Die "Haltelinie" garantiert, dass die Standardrente mindestens 48% des Durchschnittseinkommens beträgt.' })
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
            href: "https://www.deutsche-rentenversicherung.de",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Deutsche Rentenversicherung – Offizielle Website"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bundesregierung.de/breg-de/aktuelles/rentenanpassung-2025-2337000",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesregierung – Rentenanpassung 2025"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/sgb_6/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "SGB VI – Gesetzliche Rentenversicherung"
          }
        )
      ] })
    ] })
  ] });
}

const $$RentenRechner = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Renten-Rechner 2026 \u2013 Gesetzliche Rente berechnen | Entgeltpunkte & Rentenwert", "description": "Renten-Rechner 2026: Berechne deine gesetzliche Rente mit der aktuellen Rentenformel. Entgeltpunkte, Rentenwert 40,79\u20AC, Regelaltersgrenze und Fr\xFChrente mit 63 \u2013 alle Optionen im \xDCberblick." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen pb-8"> <!-- Header mit Zurück-Button --> <header class="bg-gradient-to-r from-teal-500 to-emerald-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-teal-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>
Alle Rechner
</a> <div class="flex items-center gap-3"> <span class="text-4xl">👴</span> <div> <h1 class="text-2xl font-bold">Renten-Rechner</h1> <p class="text-teal-100 text-sm">Gesetzliche Rente – Stand 2026</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ${renderComponent($$result2, "RentenRechner", RentenRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/RentenRechner", "client:component-export": "default" })} </div> </main> ` })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/renten-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/renten-rechner.astro";
const $$url = "/renten-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$RentenRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
