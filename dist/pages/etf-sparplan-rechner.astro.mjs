/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, u as unescapeHTML, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DmT1JwUR.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useCallback, useEffect } from 'react';
export { renderers } from '../renderers.mjs';

const formatCurrency = (value) => {
  return value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
};
const formatPercent = (value) => {
  return value.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " %";
};
function ETFSparplanRechner() {
  const [startkapital, setStartkapital] = useState(0);
  const [sparrate, setSparrate] = useState(200);
  const [laufzeit, setLaufzeit] = useState(20);
  const [rendite, setRendite] = useState(7);
  const [sparintervall, setSparintervall] = useState("monatlich");
  const [dynamik, setDynamik] = useState(0);
  const [mitSteuer, setMitSteuer] = useState(true);
  const [sparerpauschbetrag, setSparerpauschbetrag] = useState(1e3);
  const [teilfreistellung, setTeilfreistellung] = useState(30);
  const [result, setResult] = useState(null);
  const [showBerechnung, setShowBerechnung] = useState(false);
  const berechneETFSparplan = useCallback(() => {
    const jahreswerte = [];
    const sparIntervalleFaktor = sparintervall === "monatlich" ? 12 : sparintervall === "vierteljährlich" ? 4 : 1;
    const renditeFaktor = 1 + rendite / 100;
    const renditeProIntervall = Math.pow(renditeFaktor, 1 / sparIntervalleFaktor) - 1;
    let kapital = startkapital;
    let kumulierteEinzahlungen = startkapital;
    let aktuelleRate = sparrate;
    for (let jahr = 1; jahr <= laufzeit; jahr++) {
      const jahresEinzahlung = aktuelleRate * sparIntervalleFaktor;
      for (let intervall = 0; intervall < sparIntervalleFaktor; intervall++) {
        kapital += aktuelleRate;
        kumulierteEinzahlungen += aktuelleRate;
        kapital *= 1 + renditeProIntervall;
      }
      jahreswerte.push({
        jahr,
        einzahlung: jahresEinzahlung,
        kumulierteEinzahlungen,
        wert: kapital,
        gewinn: kapital - kumulierteEinzahlungen
      });
      if (dynamik > 0) {
        aktuelleRate = aktuelleRate * (1 + dynamik / 100);
      }
    }
    const endkapital = kapital;
    const einzahlungen = kumulierteEinzahlungen;
    const zinsen = endkapital - einzahlungen;
    let steuer = 0;
    let endkapitalNachSteuer = endkapital;
    let zinsenNachSteuer = zinsen;
    if (mitSteuer && zinsen > 0) {
      const steuerpflichtigerGewinn = zinsen * (1 - teilfreistellung / 100);
      const zuVersteuern = Math.max(0, steuerpflichtigerGewinn - sparerpauschbetrag);
      steuer = zuVersteuern * 0.26375;
      endkapitalNachSteuer = endkapital - steuer;
      zinsenNachSteuer = zinsen - steuer;
    }
    setResult({
      endkapital,
      einzahlungen,
      zinsen,
      steuer,
      endkapitalNachSteuer,
      zinsenNachSteuer,
      jahreswerte
    });
  }, [startkapital, sparrate, laufzeit, rendite, sparintervall, dynamik, mitSteuer, sparerpauschbetrag, teilfreistellung]);
  useEffect(() => {
    berechneETFSparplan();
  }, [berechneETFSparplan]);
  const renditeMultiplikator = result ? result.endkapital / Math.max(result.einzahlungen, 1) : 1;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-800 mb-4", children: "Deine Sparplan-Daten" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Startkapital (optional)" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: startkapital || "",
                onChange: (e) => setStartkapital(Math.max(0, Number(e.target.value))),
                className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                placeholder: "0",
                min: "0",
                step: "1000"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-500", children: "€" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Bereits vorhandenes Kapital zu Beginn" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Sparrate *" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: sparrate || "",
                onChange: (e) => setSparrate(Math.max(0, Number(e.target.value))),
                className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                placeholder: "200",
                min: "1",
                step: "25"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-500", children: "€" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Sparintervall" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: sparintervall,
              onChange: (e) => setSparintervall(e.target.value),
              className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
              children: [
                /* @__PURE__ */ jsx("option", { value: "monatlich", children: "Monatlich" }),
                /* @__PURE__ */ jsx("option", { value: "vierteljährlich", children: "Vierteljährlich" }),
                /* @__PURE__ */ jsx("option", { value: "jährlich", children: "Jährlich" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: [
            "Laufzeit: ",
            /* @__PURE__ */ jsxs("span", { className: "font-bold text-emerald-600", children: [
              laufzeit,
              " Jahre"
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              min: "1",
              max: "50",
              value: laufzeit,
              onChange: (e) => setLaufzeit(Number(e.target.value)),
              className: "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-500 mt-1", children: [
            /* @__PURE__ */ jsx("span", { children: "1 Jahr" }),
            /* @__PURE__ */ jsx("span", { children: "25 Jahre" }),
            /* @__PURE__ */ jsx("span", { children: "50 Jahre" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: [
            "Erwartete Rendite p.a.: ",
            /* @__PURE__ */ jsx("span", { className: "font-bold text-emerald-600", children: formatPercent(rendite) })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              min: "0",
              max: "15",
              step: "0.5",
              value: rendite,
              onChange: (e) => setRendite(Number(e.target.value)),
              className: "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-500 mt-1", children: [
            /* @__PURE__ */ jsx("span", { children: "0%" }),
            /* @__PURE__ */ jsx("span", { children: "7% (historisch)" }),
            /* @__PURE__ */ jsx("span", { children: "15%" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "💡 Der MSCI World erzielte historisch ~7% p.a. nach Inflation" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: [
            "Jährliche Dynamik: ",
            /* @__PURE__ */ jsx("span", { className: "font-bold text-emerald-600", children: formatPercent(dynamik) })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              min: "0",
              max: "10",
              step: "0.5",
              value: dynamik,
              onChange: (e) => setDynamik(Number(e.target.value)),
              className: "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-500 mt-1", children: [
            /* @__PURE__ */ jsx("span", { children: "Keine" }),
            /* @__PURE__ */ jsx("span", { children: "2% (Inflation)" }),
            /* @__PURE__ */ jsx("span", { children: "10%" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Jährliche Erhöhung der Sparrate (z.B. bei Gehaltserhöhungen)" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 pt-4 border-t border-gray-200", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              id: "mitSteuer",
              checked: mitSteuer,
              onChange: (e) => setMitSteuer(e.target.checked),
              className: "w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            }
          ),
          /* @__PURE__ */ jsx("label", { htmlFor: "mitSteuer", className: "text-sm font-medium text-gray-700", children: "Steuer einbeziehen (Abgeltungssteuer)" })
        ] }),
        mitSteuer && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Sparerpauschbetrag" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: sparerpauschbetrag,
                onChange: (e) => setSparerpauschbetrag(Number(e.target.value)),
                className: "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500",
                children: [
                  /* @__PURE__ */ jsx("option", { value: 1e3, children: "1.000 € (Single)" }),
                  /* @__PURE__ */ jsx("option", { value: 2e3, children: "2.000 € (Verheiratet)" }),
                  /* @__PURE__ */ jsx("option", { value: 0, children: "Nicht genutzt" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Teilfreistellung" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: teilfreistellung,
                onChange: (e) => setTeilfreistellung(Number(e.target.value)),
                className: "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500",
                children: [
                  /* @__PURE__ */ jsx("option", { value: 30, children: "30% (Aktienfonds >50%)" }),
                  /* @__PURE__ */ jsx("option", { value: 15, children: "15% (Mischfonds 25-50%)" }),
                  /* @__PURE__ */ jsx("option", { value: 0, children: "0% (Andere Fonds)" })
                ]
              }
            )
          ] })
        ] })
      ] })
    ] }),
    result && /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-lg font-medium text-emerald-100 mb-2", children: [
        "Dein Endergebnis nach ",
        laufzeit,
        " Jahren"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-center py-4", children: [
        /* @__PURE__ */ jsx("div", { className: "text-4xl font-bold mb-1", children: formatCurrency(mitSteuer ? result.endkapitalNachSteuer : result.endkapital) }),
        /* @__PURE__ */ jsx("div", { className: "text-emerald-200 text-sm", children: mitSteuer ? "nach Steuern" : "vor Steuern" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 mt-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 backdrop-blur rounded-xl p-4 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: formatCurrency(result.einzahlungen) }),
          /* @__PURE__ */ jsx("div", { className: "text-emerald-200 text-sm", children: "Eingezahlt" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 backdrop-blur rounded-xl p-4 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: formatCurrency(mitSteuer ? result.zinsenNachSteuer : result.zinsen) }),
          /* @__PURE__ */ jsxs("div", { className: "text-emerald-200 text-sm", children: [
            "Zinsen/Rendite ",
            mitSteuer && "(netto)"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 bg-white/10 backdrop-blur rounded-xl p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-emerald-100", children: "Dein Geld hat sich" }),
          /* @__PURE__ */ jsxs("span", { className: "text-2xl font-bold", children: [
            renditeMultiplikator.toFixed(2),
            "x"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-emerald-200 text-sm", children: "vermehrt durch den Zinseszinseffekt! 📈" })
      ] }),
      mitSteuer && result.steuer > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-4 text-sm bg-white/10 backdrop-blur rounded-xl p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { children: "Abgeltungssteuer + Soli (26,375%)" }),
          /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
            "−",
            formatCurrency(result.steuer)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-emerald-200 text-xs mt-1", children: [
          "Nach Teilfreistellung (",
          teilfreistellung,
          "%) und Sparerpauschbetrag (",
          formatCurrency(sparerpauschbetrag),
          ")"
        ] })
      ] })
    ] }),
    result && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-4", children: "Vermögensentwicklung" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm mb-1", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Einzahlungen" }),
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: formatCurrency(result.einzahlungen) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-8 bg-gray-100 rounded-lg overflow-hidden", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "h-full bg-blue-500 rounded-lg transition-all duration-500",
              style: { width: `${result.einzahlungen / result.endkapital * 100}%` }
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm mb-1", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Zinsen/Rendite" }),
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: formatCurrency(result.zinsen) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-8 bg-gray-100 rounded-lg overflow-hidden", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "h-full bg-emerald-500 rounded-lg transition-all duration-500",
              style: { width: `${result.zinsen / result.endkapital * 100}%` }
            }
          ) })
        ] }),
        mitSteuer && result.steuer > 0 && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm mb-1", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Steuer" }),
            /* @__PURE__ */ jsxs("span", { className: "font-medium text-red-600", children: [
              "−",
              formatCurrency(result.steuer)
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-8 bg-gray-100 rounded-lg overflow-hidden", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "h-full bg-red-400 rounded-lg transition-all duration-500",
              style: { width: `${result.steuer / result.endkapital * 100}%` }
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4 mt-4 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "w-4 h-4 bg-blue-500 rounded" }),
          /* @__PURE__ */ jsx("span", { children: "Einzahlungen" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "w-4 h-4 bg-emerald-500 rounded" }),
          /* @__PURE__ */ jsx("span", { children: "Zinsen/Rendite" })
        ] }),
        mitSteuer && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "w-4 h-4 bg-red-400 rounded" }),
          /* @__PURE__ */ jsx("span", { children: "Steuer" })
        ] })
      ] })
    ] }),
    result && result.jahreswerte.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg overflow-hidden", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setShowBerechnung(!showBerechnung),
          className: "w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors",
          children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "📊 Jahresübersicht anzeigen" }),
            /* @__PURE__ */ jsx(
              "svg",
              {
                className: `w-5 h-5 text-gray-500 transition-transform ${showBerechnung ? "rotate-180" : ""}`,
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })
              }
            )
          ]
        }
      ),
      showBerechnung && /* @__PURE__ */ jsx("div", { className: "p-6 overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-200", children: [
          /* @__PURE__ */ jsx("th", { className: "text-left py-2 font-medium text-gray-600", children: "Jahr" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-2 font-medium text-gray-600", children: "Einzahlung" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-2 font-medium text-gray-600", children: "Gesamt eingezahlt" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-2 font-medium text-gray-600", children: "Wert" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-2 font-medium text-gray-600", children: "Gewinn" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: result.jahreswerte.map((jw) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 hover:bg-gray-50", children: [
          /* @__PURE__ */ jsx("td", { className: "py-2 font-medium", children: jw.jahr }),
          /* @__PURE__ */ jsx("td", { className: "text-right py-2", children: formatCurrency(jw.einzahlung) }),
          /* @__PURE__ */ jsx("td", { className: "text-right py-2", children: formatCurrency(jw.kumulierteEinzahlungen) }),
          /* @__PURE__ */ jsx("td", { className: "text-right py-2 font-medium text-emerald-600", children: formatCurrency(jw.wert) }),
          /* @__PURE__ */ jsxs("td", { className: "text-right py-2 text-emerald-600", children: [
            "+",
            formatCurrency(jw.gewinn)
          ] })
        ] }, jw.jahr)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-emerald-50 border border-emerald-200 rounded-2xl p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-semibold text-emerald-800 mb-3", children: "ℹ️ Was ist ein ETF-Sparplan?" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-emerald-700", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-emerald-500 mt-0.5", children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "ETF" }),
            " = Exchange Traded Fund, ein börsengehandelter Indexfonds"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-emerald-500 mt-0.5", children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Mit einem ",
            /* @__PURE__ */ jsx("strong", { children: "Sparplan" }),
            " investierst du regelmäßig automatisch"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-emerald-500 mt-0.5", children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Der ",
            /* @__PURE__ */ jsx("strong", { children: "Zinseszinseffekt" }),
            " sorgt für exponentielles Wachstum"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-emerald-500 mt-0.5", children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Cost-Average-Effekt:" }),
            " Du kaufst automatisch günstig bei fallenden Kursen"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-emerald-500 mt-0.5", children: "•" }),
          /* @__PURE__ */ jsx("span", { children: "Beliebte ETFs: MSCI World, MSCI ACWI, S&P 500" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-2xl p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-semibold text-amber-800 mb-3", children: "⚠️ Wichtige Hinweise" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-amber-700", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-amber-500 mt-0.5", children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Die ",
            /* @__PURE__ */ jsx("strong", { children: "tatsächliche Rendite" }),
            " kann stark schwanken (auch negativ!)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-amber-500 mt-0.5", children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Historische Renditen sind ",
            /* @__PURE__ */ jsx("strong", { children: "keine Garantie" }),
            " für die Zukunft"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-amber-500 mt-0.5", children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Kurzfristige Verluste sind ",
            /* @__PURE__ */ jsx("strong", { children: "normal" }),
            " – langfristig denken!"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-amber-500 mt-0.5", children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Die ",
            /* @__PURE__ */ jsx("strong", { children: "Steuerberechnung" }),
            " ist vereinfacht (einmaliger Verkauf am Ende)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-amber-500 mt-0.5", children: "•" }),
          /* @__PURE__ */ jsx("span", { children: "Keine Anlageberatung – informiere dich selbst oder frage einen Berater" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-800 mb-4", children: "📞 Wichtige Anlaufstellen" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-4 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🏦" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-800", children: "BaFin (Finanzaufsicht)" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Bundesanstalt für Finanzdienstleistungsaufsicht" }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "https://www.bafin.de/DE/Verbraucher/verbraucher_node.html",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "text-emerald-600 hover:underline text-sm",
                children: "bafin.de/Verbraucher →"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-4 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🛡️" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-800", children: "Verbraucherzentrale" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Unabhängige Beratung zu Geldanlage" }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "https://www.verbraucherzentrale.de/wissen/geld-versicherungen/geldanlage",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "text-emerald-600 hover:underline text-sm",
                children: "verbraucherzentrale.de/geldanlage →"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-4 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "📊" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-800", children: "Finanztip" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Gemeinnützige Finanzbildung" }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "https://www.finanztip.de/indexfonds-etf/",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "text-emerald-600 hover:underline text-sm",
                children: "finanztip.de/indexfonds-etf →"
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-2xl p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-700 mb-3", children: "📚 Quellen & Rechtliche Grundlagen" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-1 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "https://www.gesetze-im-internet.de/estg/__20.html", target: "_blank", rel: "noopener noreferrer", className: "text-emerald-600 hover:underline", children: "§ 20 EStG – Einkünfte aus Kapitalvermögen" }) }),
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "https://www.gesetze-im-internet.de/invstg_2018/", target: "_blank", rel: "noopener noreferrer", className: "text-emerald-600 hover:underline", children: "Investmentsteuergesetz (InvStG) – Teilfreistellungen" }) }),
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "https://www.bafin.de/DE/Verbraucher/verbraucher_node.html", target: "_blank", rel: "noopener noreferrer", className: "text-emerald-600 hover:underline", children: "BaFin Verbraucherinformationen" }) }),
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "https://www.bundesbank.de/de/statistiken/geld-und-kapitalmaerkte/zinssaetze-und-renditen", target: "_blank", rel: "noopener noreferrer", className: "text-emerald-600 hover:underline", children: "Bundesbank – Zinssätze und Renditen" }) }),
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "https://www.msci.com/documents/10199/178e6643-6ae6-47b9-82be-e1fc565ededb", target: "_blank", rel: "noopener noreferrer", className: "text-emerald-600 hover:underline", children: "MSCI World Factsheet (historische Performance)" }) })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-3", children: "Stand: Januar 2025. Alle Angaben ohne Gewähr. Keine Anlageberatung – Ergebnisse dienen nur der Orientierung." })
    ] })
  ] });
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$EtfSparplanRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "ETF-Sparplan-Rechner 2025 \u2013 Rendite & Verm\xF6gen berechnen (kostenlos)";
  const description = "ETF-Sparplan-Rechner 2025: Berechnen Sie Ihr Endverm\xF6gen mit Zinseszins. Mit Steuerberechnung, Dynamik, Sparerpauschbetrag & Teilfreistellung. Kostenlos & ohne Anmeldung.";
  const keywords = "ETF Sparplan Rechner, ETF Rechner, Sparplan Rechner, ETF Rendite berechnen, Zinseszins Rechner ETF, ETF Verm\xF6gen berechnen, Sparplan Zinseszins, MSCI World Rechner, ETF Sparplan 2025, Aktienfonds Rechner, ETF Steuern berechnen, Teilfreistellung Rechner, Sparerpauschbetrag, Fondssparplan Rechner, Verm\xF6gensaufbau Rechner, ETF Endkapital, monatlich sparen Rechner";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<main class="min-h-screen pb-8"> <!-- Header mit Zur\xFCck-Button --> <header class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-emerald-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>\nAlle Rechner\n</a> <div class="flex items-center gap-3"> <span class="text-4xl">\u{1F4CA}</span> <div> <h1 class="text-2xl font-bold">ETF-Sparplan-Rechner</h1> <p class="text-emerald-100 text-sm">Verm\xF6gen & Rendite berechnen 2025</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ', ` </div> <!-- SEO Content Section --> <div class="max-w-2xl mx-auto px-4 mt-8"> <div class="bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">ETF-Sparplan 2025: Alles was Sie wissen m\xFCssen</h2> <div class="prose prose-sm text-gray-600 space-y-4"> <p>
Ein <strong>ETF-Sparplan</strong> ist eine der beliebtesten Methoden f\xFCr langfristigen 
            Verm\xF6gensaufbau in Deutschland. Mit unserem <strong>ETF-Sparplan-Rechner</strong> berechnen 
            Sie, wie sich Ihr Verm\xF6gen \xFCber die Jahre entwickelt \u2013 inklusive Zinseszinseffekt, 
            Dynamik und Steuerberechnung.
</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Was ist ein ETF-Sparplan?</h3> <p>
Ein <strong>ETF</strong> (Exchange Traded Fund) ist ein b\xF6rsengehandelter Indexfonds, 
            der einen bestimmten Index wie den <strong>MSCI World</strong> oder <strong>DAX</strong>
nachbildet. Mit einem <strong>Sparplan</strong> investieren Sie regelm\xE4\xDFig (z.B. monatlich) 
            einen festen Betrag:
</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Automatisch:</strong> Der Broker kauft zum Stichtag automatisch ETF-Anteile</li> <li><strong>Flexibel:</strong> Bereits ab 25\u20AC oder 50\u20AC monatlich m\xF6glich</li> <li><strong>Diversifiziert:</strong> Ein ETF enth\xE4lt hunderte oder tausende Aktien</li> <li><strong>Kosteng\xFCnstig:</strong> Geringe Geb\xFChren im Vergleich zu aktiven Fonds</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Der Zinseszinseffekt \u2013 Ihr gr\xF6\xDFter Verb\xFCndeter</h3> <p>
Der <strong>Zinseszinseffekt</strong> ist der Schl\xFCssel zum Verm\xF6gensaufbau. Erzielte 
            Renditen werden reinvestiert und erzeugen selbst wieder Rendite. Je l\xE4nger die 
            Anlagedauer, desto st\xE4rker wirkt dieser Effekt:
</p> <ul class="list-disc pl-5 space-y-1"> <li>Bei <strong>7% Rendite p.a.</strong> verdoppelt sich Ihr Kapital etwa alle 10 Jahre</li> <li>Die sogenannte <strong>"72er-Regel"</strong>: 72 \xF7 Rendite = Jahre bis zur Verdopplung</li> <li><strong>Zeit ist wichtiger als Timing</strong> \u2013 fr\xFCh anfangen zahlt sich aus!</li> </ul> <p> <strong>Beispiel:</strong> 200\u20AC monatlich \xFCber 30 Jahre bei 7% = <strong>ca. 228.000\u20AC</strong>
(davon nur 72.000\u20AC eingezahlt!)
</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Welche Rendite ist realistisch?</h3> <p>
Die <strong>historische Rendite</strong> wichtiger Aktienindizes (vor Kosten, nominal):
</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>MSCI World:</strong> ~7-8% p.a. (seit 1970)</li> <li><strong>S&P 500:</strong> ~10% p.a. (seit 1926)</li> <li><strong>DAX:</strong> ~8% p.a. (seit 1988)</li> </ul> <p> <strong>Wichtig:</strong> Nach Inflation, Kosten und Steuern bleiben real ca. 4-5% p.a. 
            Historische Werte sind keine Garantie f\xFCr die Zukunft!
</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">ETF-Steuern: Abgeltungssteuer & Teilfreistellung</h3> <p>
Auf <strong>Kapitalertr\xE4ge</strong> (Kursgewinne, Dividenden) f\xE4llt die
<strong>Abgeltungssteuer</strong> an:
</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Abgeltungssteuer:</strong> 25% auf Gewinne</li> <li><strong>Solidarit\xE4tszuschlag:</strong> 5,5% auf die Steuer</li> <li><strong>Gesamt:</strong> 26,375% (ggf. + Kirchensteuer)</li> </ul> <p> <strong>Teilfreistellung</strong> f\xFCr Aktienfonds (mind. 51% Aktienanteil):
<strong>30% der Ertr\xE4ge sind steuerfrei</strong>. Das reduziert die effektive Steuer 
            auf ca. 18,5%.
</p> <p> <strong>Sparerpauschbetrag 2025:</strong> 1.000\u20AC (Singles) bzw. 2.000\u20AC (Verheiratete) 
            bleiben pro Jahr steuerfrei.
</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Cost-Average-Effekt: Automatisch g\xFCnstig kaufen</h3> <p>
Mit einem <strong>Sparplan</strong> profitieren Sie vom <strong>Durchschnittskosteneffekt</strong>:
</p> <ul class="list-disc pl-5 space-y-1"> <li>Bei <strong>hohen Kursen</strong> kaufen Sie weniger Anteile</li> <li>Bei <strong>niedrigen Kursen</strong> kaufen Sie mehr Anteile</li> <li>Langfristig ergibt sich ein <strong>g\xFCnstiger Durchschnittspreis</strong></li> <li>Sie vermeiden das Risiko, zum falschen Zeitpunkt "alles auf einmal" zu investieren</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Beliebte ETFs f\xFCr Sparpl\xE4ne 2025</h3> <p>
Die <strong>meistgekauften ETFs</strong> in Deutschland:
</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>MSCI World:</strong> ~1.400 Aktien aus 23 Industriel\xE4ndern (z.B. iShares, Xtrackers)</li> <li><strong>MSCI ACWI:</strong> Inkl. Schwellenl\xE4nder (~3.000 Aktien)</li> <li><strong>S&P 500:</strong> Die 500 gr\xF6\xDFten US-Unternehmen</li> <li><strong>FTSE All-World:</strong> \xC4hnlich wie MSCI ACWI (z.B. Vanguard)</li> <li><strong>Themen-ETFs:</strong> Technologie, Nachhaltigkeit (ESG), Dividenden</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Sparplan einrichten: So geht's</h3> <p> <strong>Schritt f\xFCr Schritt</strong> zum ETF-Sparplan:
</p> <ol class="list-decimal pl-5 space-y-1"> <li><strong>Depot er\xF6ffnen:</strong> Bei einem Online-Broker (kostenlos m\xF6glich)</li> <li><strong>ETF ausw\xE4hlen:</strong> z.B. einen breiten Welt-ETF wie MSCI World</li> <li><strong>Sparplan anlegen:</strong> Betrag, Intervall, Ausf\xFChrungstag w\xE4hlen</li> <li><strong>Referenzkonto verbinden:</strong> Lastschrift oder Dauerauftrag</li> <li><strong>Laufen lassen:</strong> Der Rest passiert automatisch!</li> </ol> <p> <strong>Tipp:</strong> Viele Broker bieten <strong>kostenlose ETF-Sparpl\xE4ne</strong> ohne 
            Ausf\xFChrungsgeb\xFChren an.
</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">H\xE4ufige Fragen (FAQ)</h3> <p><strong>Wie viel sollte ich monatlich sparen?</strong></p> <p>
Eine Faustregel: Spare <strong>10-20% deines Nettoeinkommens</strong>. Bei 2.000\u20AC netto 
            w\xE4ren das 200-400\u20AC monatlich. Wichtiger als die H\xF6he ist die <strong>Regelm\xE4\xDFigkeit</strong>.
</p> <p><strong>Welcher ETF ist der beste?</strong></p> <p>
F\xFCr die meisten Anleger ist ein <strong>breit gestreuter Welt-ETF</strong> (MSCI World 
            oder FTSE All-World) die beste Wahl. Achten Sie auf geringe Kosten (TER unter 0,5%).
</p> <p><strong>Thesaurierend oder aussch\xFCttend?</strong></p> <p> <strong>Thesaurierend:</strong> Dividenden werden automatisch reinvestiert (mehr Zinseszins).
<strong>Aussch\xFCttend:</strong> Dividenden werden auf Ihr Konto ausgezahlt. F\xFCr langfristigen 
            Verm\xF6gensaufbau sind thesaurierende ETFs oft effizienter.
</p> <p><strong>Was passiert bei einem Crash?</strong></p> <p> <strong>Nicht verkaufen!</strong> Kursverluste sind nur "Buchverluste". Historisch haben 
            sich die M\xE4rkte immer erholt. Ein Crash ist sogar eine Chance: Sie kaufen mehr Anteile 
            f\xFCr Ihr Geld.
</p> </div> </div> </div> </main>  <script type="application/ld+json">`, '<\/script>  <script type="application/ld+json">', "<\/script> "])), maybeRenderHead(), renderComponent($$result2, "ETFSparplanRechner", ETFSparplanRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/ETFSparplanRechner", "client:component-export": "default" }), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "ETF-Sparplan-Rechner 2025",
    "description": description,
    "url": "https://deutschland-rechner.de/etf-sparplan-rechner",
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
        "name": "Was ist ein ETF-Sparplan?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ein ETF-Sparplan ist eine automatisierte Geldanlage, bei der Sie regelm\xE4\xDFig (z.B. monatlich) einen festen Betrag in einen b\xF6rsengehandelten Indexfonds (ETF) investieren. Der Broker kauft automatisch ETF-Anteile zum festgelegten Zeitpunkt."
        }
      },
      {
        "@type": "Question",
        "name": "Wie viel Rendite bringt ein ETF-Sparplan?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Historisch haben breit gestreute Aktien-ETFs wie der MSCI World etwa 7-8% Rendite pro Jahr erzielt. Nach Inflation und Steuern bleiben real ca. 4-5% p.a. Vergangene Renditen sind keine Garantie f\xFCr die Zukunft."
        }
      },
      {
        "@type": "Question",
        "name": "Wie werden ETF-Gewinne besteuert?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ETF-Gewinne unterliegen der Abgeltungssteuer (25% + 5,5% Soli = 26,375%). Bei Aktienfonds sind 30% der Ertr\xE4ge durch die Teilfreistellung steuerfrei. Der Sparerpauschbetrag (1.000\u20AC Singles, 2.000\u20AC Verheiratete) bleibt steuerfrei."
        }
      },
      {
        "@type": "Question",
        "name": "Wie viel sollte ich monatlich in einen ETF-Sparplan investieren?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Eine Faustregel ist 10-20% des Nettoeinkommens. Bei 2.000\u20AC netto w\xE4ren das 200-400\u20AC monatlich. Wichtiger als die H\xF6he ist die Regelm\xE4\xDFigkeit \u2013 starten Sie lieber mit weniger und erh\xF6hen sp\xE4ter."
        }
      },
      {
        "@type": "Question",
        "name": "Welcher ETF ist f\xFCr Anf\xE4nger am besten?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "F\xFCr Anf\xE4nger empfiehlt sich ein breit gestreuter Welt-ETF wie der MSCI World (ca. 1.400 Aktien aus 23 Industriel\xE4ndern) oder FTSE All-World. Achten Sie auf geringe Kosten (TER unter 0,5%) und w\xE4hlen Sie einen thesaurierenden ETF."
        }
      },
      {
        "@type": "Question",
        "name": "Was ist der Cost-Average-Effekt?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Der Cost-Average-Effekt (Durchschnittskosteneffekt) bedeutet: Bei regelm\xE4\xDFigen Investitionen kaufen Sie bei hohen Kursen weniger und bei niedrigen Kursen mehr Anteile. Langfristig ergibt sich ein g\xFCnstiger Durchschnittspreis."
        }
      }
    ]
  }))) })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/etf-sparplan-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/etf-sparplan-rechner.astro";
const $$url = "/etf-sparplan-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$EtfSparplanRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
