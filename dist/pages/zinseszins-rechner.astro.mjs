/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, u as unescapeHTML, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_v22DC8tm.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

function ZinseszinsRechner() {
  const [startkapital, setStartkapital] = useState(1e4);
  const [zinssatz, setZinssatz] = useState(5);
  const [laufzeit, setLaufzeit] = useState(10);
  const [sparrate, setSparrate] = useState(200);
  const [sparintervall, setSparintervall] = useState("monatlich");
  const [zinseszins, setZinseszins] = useState(true);
  const [zeigeTabelle, setZeigeTabelle] = useState(false);
  const ergebnis = useMemo(() => {
    const P = startkapital;
    const r = zinssatz / 100;
    const n = laufzeit;
    const S = sparrate;
    const jahreswerte = [];
    let aktuellerWert = P;
    let kumulierteEinzahlungen = P;
    let kumulierteZinsen = 0;
    const sparratenProJahr = sparintervall === "monatlich" ? 12 : 1;
    const einzahlungProJahr = S * sparratenProJahr;
    for (let jahr = 1; jahr <= n; jahr++) {
      let zinsenImJahr = 0;
      if (sparintervall === "monatlich") {
        for (let monat = 1; monat <= 12; monat++) {
          aktuellerWert += S;
          kumulierteEinzahlungen += S;
          if (zinseszins) {
            const monatsZins = aktuellerWert * (r / 12);
            zinsenImJahr += monatsZins;
            aktuellerWert += monatsZins;
          }
        }
        if (!zinseszins) {
          zinsenImJahr = P * r;
          aktuellerWert = kumulierteEinzahlungen + P * r * jahr;
        }
      } else {
        aktuellerWert += S;
        kumulierteEinzahlungen += S;
        if (zinseszins) {
          zinsenImJahr = aktuellerWert * r;
          aktuellerWert += zinsenImJahr;
        } else {
          zinsenImJahr = P * r;
          aktuellerWert = kumulierteEinzahlungen + P * r * jahr;
        }
      }
      kumulierteZinsen += zinsenImJahr;
      jahreswerte.push({
        jahr,
        einzahlung: einzahlungProJahr,
        zinsen: zinsenImJahr,
        endwert: aktuellerWert,
        kumulierteEinzahlungen,
        kumulierteZinsen
      });
    }
    const endwert = aktuellerWert;
    const gesamtEinzahlungen = kumulierteEinzahlungen;
    const gesamtZinsen = kumulierteZinsen;
    const verdopplungszeit = r > 0 ? 72 / (r * 100) : Infinity;
    const cagr = gesamtEinzahlungen > 0 ? (Math.pow(endwert / startkapital, 1 / n) - 1) * 100 : 0;
    return {
      startkapital: P,
      zinssatz,
      laufzeit: n,
      sparrate: S,
      sparintervall,
      endwert,
      gesamtEinzahlungen,
      gesamtZinsen,
      verdopplungszeit,
      cagr,
      jahreswerte,
      gewinnProzent: gesamtEinzahlungen > 0 ? (endwert - gesamtEinzahlungen) / gesamtEinzahlungen * 100 : 0
    };
  }, [startkapital, zinssatz, laufzeit, sparrate, sparintervall, zinseszins]);
  const formatEuro = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";
  const formatEuroExact = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  const formatProzent = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " %";
  const formatJahre = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " Jahre";
  const einzahlungsAnteil = ergebnis.gesamtEinzahlungen / ergebnis.endwert * 100;
  const zinsenAnteil = 100 - einzahlungsAnteil;
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Berechnungsmethode" }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setZinseszins(true),
              className: `py-4 px-4 rounded-xl transition-all ${zinseszins ? "bg-emerald-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "font-bold block", children: "📈 Zinseszins" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs opacity-80", children: "Zinsen werden mitverzinst" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setZinseszins(false),
              className: `py-4 px-4 rounded-xl transition-all ${!zinseszins ? "bg-emerald-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "font-bold block", children: "➡️ Einfacher Zins" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs opacity-80", children: "Nur Zinsen auf Startkapital" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Startkapital (Anfangsbetrag)" }) }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: startkapital,
              onChange: (e) => setStartkapital(Math.max(0, Number(e.target.value))),
              className: "w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none",
              min: "0",
              max: "1000000",
              step: "1000"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl", children: "€" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: startkapital,
            onChange: (e) => setStartkapital(Number(e.target.value)),
            className: "w-full mt-3 accent-emerald-500",
            min: "0",
            max: "100000",
            step: "1000"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "0 €" }),
          /* @__PURE__ */ jsx("span", { children: "50.000 €" }),
          /* @__PURE__ */ jsx("span", { children: "100.000 €" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Jährlicher Zinssatz" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Erwartete Rendite pro Jahr" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: zinssatz,
              onChange: (e) => setZinssatz(Math.max(0, Math.min(30, Number(e.target.value)))),
              className: "w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none",
              min: "0",
              max: "30",
              step: "0.1"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg", children: "%" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: zinssatz,
            onChange: (e) => setZinssatz(Number(e.target.value)),
            className: "w-full mt-3 accent-emerald-500",
            min: "0",
            max: "15",
            step: "0.25"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "0%" }),
          /* @__PURE__ */ jsx("span", { children: "7,5%" }),
          /* @__PURE__ */ jsx("span", { children: "15%" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mt-2", children: "💡 Tagesgeld: 2-3% | Anleihen: 3-5% | ETFs: 5-8% | Aktien: 7-10%" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Anlagedauer" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4 mb-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setLaufzeit(Math.max(1, laufzeit - 1)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors",
              children: "−"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "text-center px-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-4xl font-bold text-gray-800", children: laufzeit }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: "Jahre" })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setLaufzeit(Math.min(50, laufzeit + 1)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors",
              children: "+"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: laufzeit,
            onChange: (e) => setLaufzeit(Number(e.target.value)),
            className: "w-full mt-2 accent-emerald-500",
            min: "1",
            max: "50",
            step: "1"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "1 Jahr" }),
          /* @__PURE__ */ jsx("span", { children: "25 Jahre" }),
          /* @__PURE__ */ jsx("span", { children: "50 Jahre" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Regelmäßige Sparrate" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Zusätzliche Einzahlungen" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: sparrate,
              onChange: (e) => setSparrate(Math.max(0, Number(e.target.value))),
              className: "w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none",
              min: "0",
              max: "10000",
              step: "25"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg", children: "€" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: sparrate,
            onChange: (e) => setSparrate(Number(e.target.value)),
            className: "w-full mt-3 accent-emerald-500",
            min: "0",
            max: "2000",
            step: "25"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "0 €" }),
          /* @__PURE__ */ jsx("span", { children: "1.000 €" }),
          /* @__PURE__ */ jsx("span", { children: "2.000 €" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-2", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Sparintervall" }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSparintervall("monatlich"),
              className: `py-3 px-4 rounded-xl transition-all ${sparintervall === "monatlich" ? "bg-emerald-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: /* @__PURE__ */ jsx("span", { className: "font-bold", children: "📅 Monatlich" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSparintervall("jaehrlich"),
              className: `py-3 px-4 rounded-xl transition-all ${sparintervall === "jaehrlich" ? "bg-emerald-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: /* @__PURE__ */ jsx("span", { className: "font-bold", children: "📆 Jährlich" })
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white mb-6", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-sm font-medium opacity-80 mb-1", children: [
        "💰 Endvermögen nach ",
        laufzeit,
        " Jahren"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-baseline gap-2", children: /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuro(ergebnis.endwert) }) }),
        /* @__PURE__ */ jsxs("p", { className: "text-emerald-100 mt-2 text-sm", children: [
          "📈 Gewinn: ",
          /* @__PURE__ */ jsx("strong", { children: formatEuro(ergebnis.gesamtZinsen) }),
          " (",
          formatProzent(ergebnis.gewinnProzent),
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Einzahlungen gesamt" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.gesamtEinzahlungen) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Zinsen/Rendite" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.gesamtZinsen) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm mb-2", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "Einzahlungen: ",
            formatEuro(ergebnis.gesamtEinzahlungen)
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Zinsen: ",
            formatEuro(ergebnis.gesamtZinsen)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "h-4 rounded-full overflow-hidden bg-white/20 flex", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "bg-white h-full transition-all duration-500",
              style: { width: `${einzahlungsAnteil}%` }
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "bg-green-300 h-full transition-all duration-500",
              style: { width: `${zinsenAnteil}%` }
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs mt-1 opacity-70", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            einzahlungsAnteil.toFixed(1),
            "% Einzahlungen"
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            zinsenAnteil.toFixed(1),
            "% Zinsen"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Berechnungsdetails" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Startkapital" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.startkapital) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Jährlicher Zinssatz" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatProzent(ergebnis.zinssatz) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Anlagedauer" }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-900", children: [
            ergebnis.laufzeit,
            " Jahre"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
            "Sparrate (",
            sparintervall,
            ")"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatEuro(ergebnis.sparrate) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Berechnungsmethode" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: zinseszins ? "Zinseszins" : "Einfacher Zins" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Gesamte Einzahlungen" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatEuroExact(ergebnis.gesamtEinzahlungen) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-green-600", children: [
          /* @__PURE__ */ jsx("span", { children: "Gesamte Zinsen/Rendite" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold", children: formatEuroExact(ergebnis.gesamtZinsen) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Verdopplungszeit (72er-Regel)" }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-900", children: [
            "ca. ",
            formatJahre(ergebnis.verdopplungszeit)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-3 bg-emerald-50 -mx-6 px-6 rounded-b-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-emerald-800", children: "Endvermögen" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-2xl text-emerald-900", children: formatEuroExact(ergebnis.endwert) })
        ] })
      ] })
    ] }),
    ergebnis.jahreswerte.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800", children: "📅 Vermögensentwicklung" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setZeigeTabelle(!zeigeTabelle),
            className: `px-4 py-2 rounded-xl text-sm font-medium transition-all ${zeigeTabelle ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: zeigeTabelle ? "▲ Ausblenden" : "▼ Tabelle anzeigen"
          }
        )
      ] }),
      zeigeTabelle && /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b-2 border-gray-200", children: [
          /* @__PURE__ */ jsx("th", { className: "text-left py-2 text-gray-600", children: "Jahr" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-2 text-gray-600", children: "Einzahlung" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-2 text-gray-600", children: "Zinsen" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-2 text-gray-600", children: "Endwert" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { children: [
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 bg-gray-50", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2 font-medium", children: "Start" }),
            /* @__PURE__ */ jsx("td", { className: "text-right py-2", children: formatEuro(startkapital) }),
            /* @__PURE__ */ jsx("td", { className: "text-right py-2 text-green-600", children: "–" }),
            /* @__PURE__ */ jsx("td", { className: "text-right py-2 font-medium", children: formatEuro(startkapital) })
          ] }),
          ergebnis.jahreswerte.map((zeile) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2 font-medium", children: zeile.jahr }),
            /* @__PURE__ */ jsx("td", { className: "text-right py-2", children: formatEuro(zeile.einzahlung) }),
            /* @__PURE__ */ jsx("td", { className: "text-right py-2 text-green-600", children: formatEuro(zeile.zinsen) }),
            /* @__PURE__ */ jsx("td", { className: "text-right py-2 font-medium", children: formatEuro(zeile.endwert) })
          ] }, zeile.jahr))
        ] }),
        /* @__PURE__ */ jsx("tfoot", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-emerald-50 font-bold", children: [
          /* @__PURE__ */ jsx("td", { className: "py-2", children: "Gesamt" }),
          /* @__PURE__ */ jsx("td", { className: "text-right py-2", children: formatEuro(ergebnis.gesamtEinzahlungen) }),
          /* @__PURE__ */ jsx("td", { className: "text-right py-2 text-green-600", children: formatEuro(ergebnis.gesamtZinsen) }),
          /* @__PURE__ */ jsx("td", { className: "text-right py-2", children: formatEuro(ergebnis.endwert) })
        ] }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ Was ist der Zinseszins-Effekt?" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "📈" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Zinseszins:" }),
            " Ihre Zinsen werden mitverzinst. Das Kapital wächst exponentiell – der Effekt wird über längere Zeiträume immer stärker."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "🧮" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Formel:" }),
            " Endkapital = Startkapital × (1 + Zinssatz)^Jahre. Bei 5% Zinsen verdoppelt sich Ihr Geld in ca. 14 Jahren."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "⏱️" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "72er-Regel:" }),
            " Teilen Sie 72 durch den Zinssatz, um die Verdopplungszeit zu berechnen. Bei 6% Zinsen: 72 ÷ 6 = 12 Jahre."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "💡" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Zeitfaktor:" }),
            " Der wichtigste Faktor ist die Zeit. Je früher Sie anfangen zu sparen, desto mehr profitieren Sie vom Zinseszins-Effekt."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "🎯" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Cost-Average-Effekt:" }),
            " Regelmäßige Sparraten glätten Kursschwankungen und reduzieren das Risiko bei Aktien/ETFs."
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-emerald-800 mb-3", children: "💡 Beispiele für den Zinseszins-Effekt" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-emerald-700", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "10.000€ bei 5% über 30 Jahre:" }),
            " Ohne Zinseszins: 25.000€. Mit Zinseszins: 43.219€ – fast das Doppelte!"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "200€/Monat bei 7% über 30 Jahre:" }),
            " Einzahlungen: 72.000€. Endwert: ca. 243.000€ – über 170.000€ Zinsen!"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Früh anfangen lohnt sich:" }),
            " Mit 25 Jahren 200€/Monat bei 7% bis 65 = 525.000€. Ab 35 Jahren: nur 262.000€."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "ETF-Sparplan:" }),
            " Der MSCI World erzielte historisch ca. 7-8% p.a. Ein ETF-Sparplan nutzt den Zinseszins optimal."
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
            /* @__PURE__ */ jsx("strong", { children: "Keine Garantie:" }),
            " Die Berechnung zeigt theoretische Werte. Tatsächliche Renditen bei Aktien/ETFs schwanken stark."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Inflation beachten:" }),
            " Bei 2% Inflation verliert Ihr Geld jährlich an Kaufkraft. Reale Rendite = Nominalrendite - Inflation."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Steuern:" }),
            " Kapitalerträge unterliegen der Abgeltungssteuer (25% + Soli). Sparerpauschbetrag: 1.000€/Person (2.000€ für Paare)."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Kosten beachten:" }),
            " Depotgebühren und Fondskosten (TER) reduzieren Ihre tatsächliche Rendite. Günstige ETFs haben oft nur 0,1-0,2% TER."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Risiko vs. Rendite:" }),
            " Höhere Renditen bedeuten höheres Risiko. Diversifizieren Sie Ihr Portfolio!"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Informationen & Beratung" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-emerald-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-emerald-900", children: "Unabhängige Finanzberatung" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-emerald-700 mt-1", children: "Die Verbraucherzentralen bieten kostengünstige, unabhängige Finanzberatung an." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Verbraucherzentrale" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.verbraucherzentrale.de/geldanlage",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "Geldanlage-Tipps →"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "BaFin" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.bafin.de/DE/Verbraucher/verbraucher_node.html",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "Verbraucher-Infos →"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "💡" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Steuern auf Kapitalerträge" }),
            /* @__PURE__ */ jsxs("ul", { className: "text-gray-600 mt-1 space-y-1", children: [
              /* @__PURE__ */ jsx("li", { children: "• Abgeltungssteuer: 25% auf Zinsen, Dividenden, Kursgewinne" }),
              /* @__PURE__ */ jsx("li", { children: "• Solidaritätszuschlag: 5,5% auf die Abgeltungssteuer" }),
              /* @__PURE__ */ jsx("li", { children: "• Sparerpauschbetrag: 1.000€/Jahr (2.000€ für Ehepaare)" }),
              /* @__PURE__ */ jsx("li", { children: "• Freistellungsauftrag einrichten, um Pauschbetrag zu nutzen" })
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
            href: "https://www.bundesbank.de/de/statistiken/geld-und-kapitalmaerkte/zinssaetze-und-renditen",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesbank – Aktuelle Zinssätze und Renditen"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/estg/__20.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "EStG § 20 – Kapitalerträge"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bafin.de/DE/Verbraucher/verbraucher_node.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BaFin – Verbraucherinformationen"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.verbraucherzentrale.de/wissen/geld-versicherungen/geldanlage",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Verbraucherzentrale – Geldanlage"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.destatis.de/DE/Themen/Wirtschaft/Preise/Verbraucherpreisindex/_inhalt.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Statistisches Bundesamt – Verbraucherpreisindex/Inflation"
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
const $$ZinseszinsRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "Zinseszins-Rechner 2025 \u2013 Verm\xF6gen berechnen mit Sparplan & Zinsen";
  const description = "Kostenloser Zinseszins-Rechner 2025: Berechnen Sie Ihr Endverm\xF6gen mit Zinseszins, Sparrate & Anlagedauer. ETF-Sparplan, Tagesgeld, Festgeld berechnen!";
  const keywords = "Zinseszins Rechner, Zinseszins berechnen, Verm\xF6gensrechner, Sparplan Rechner, ETF Rechner, Zinseszinseffekt, Zinseszinsformel, Geldanlage Rechner, Sparrechner, Verm\xF6genswachstum, Rendite berechnen, Kapitalwachstum, 72er Regel, Compound Interest";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<main class="min-h-screen pb-8"> <!-- Header mit Zur\xFCck-Button --> <header class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-emerald-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>\nAlle Rechner\n</a> <div class="flex items-center gap-3"> <span class="text-4xl">\u{1F4C8}</span> <div> <h1 class="text-2xl font-bold">Zinseszins-Rechner</h1> <p class="text-emerald-100 text-sm">Verm\xF6genswachstum berechnen</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ', ' </div> <!-- SEO Content Section --> <div class="max-w-2xl mx-auto px-4 mt-8"> <div class="bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">Zinseszins-Rechner 2025: So funktioniert Verm\xF6gensaufbau</h2> <div class="prose prose-sm text-gray-600 space-y-4"> <p>\nMit unserem <strong>Zinseszins-Rechner</strong> berechnen Sie kostenlos, wie Ihr Verm\xF6gen \xFCber \n            die Jahre w\xE4chst. Egal ob <strong>ETF-Sparplan</strong>, <strong>Festgeld</strong> oder\n<strong>Tagesgeld</strong> \u2013 der Rechner zeigt Ihnen den <strong>Zinseszins-Effekt</strong>\nund Ihr Endverm\xF6gen.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Was ist der Zinseszins?</h3> <p>\nBeim <strong>Zinseszins</strong> werden Ihre Zinsen nicht ausgezahlt, sondern dem Kapital \n            hinzugef\xFCgt. Im n\xE4chsten Jahr erhalten Sie dann Zinsen auf das erh\xF6hte Kapital \u2013 \n            Ihre Zinsen verdienen also selbst Zinsen!\n</p> <p>\nAlbert Einstein soll den Zinseszins als das "achte Weltwunder" bezeichnet haben. Ob das \n            stimmt, ist unklar \u2013 aber der Effekt ist tats\xE4chlich beeindruckend, besonders \xFCber \n            lange Zeitr\xE4ume.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Die Zinseszins-Formel</h3> <p>\nDie mathematische Formel f\xFCr den Zinseszins lautet:\n</p> <p class="bg-gray-100 p-3 rounded-lg font-mono text-center">\nEndkapital = Startkapital \xD7 (1 + Zinssatz)<sup>Jahre</sup> </p> <p>\nBeispiel: 10.000\u20AC bei 5% Zinsen \xFCber 10 Jahre:<br>\n10.000 \xD7 (1,05)<sup>10</sup> = 10.000 \xD7 1,6289 = <strong>16.289\u20AC</strong> </p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Die 72er-Regel: Verdopplung berechnen</h3> <p>\nMit der <strong>72er-Regel</strong> k\xF6nnen Sie schnell im Kopf berechnen, wie lange es \n            dauert, bis sich Ihr Geld verdoppelt:\n</p> <p class="bg-emerald-50 p-3 rounded-lg text-center"> <strong>Verdopplungszeit = 72 \xF7 Zinssatz</strong> </p> <ul class="list-disc pl-5 space-y-1"> <li>Bei <strong>3% Zinsen</strong>: 72 \xF7 3 = 24 Jahre</li> <li>Bei <strong>5% Zinsen</strong>: 72 \xF7 5 = 14,4 Jahre</li> <li>Bei <strong>7% Zinsen</strong>: 72 \xF7 7 = 10,3 Jahre</li> <li>Bei <strong>10% Zinsen</strong>: 72 \xF7 10 = 7,2 Jahre</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Zinseszins vs. Einfacher Zins</h3> <p>\nDer Unterschied wird \xFCber die Zeit immer gr\xF6\xDFer:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Einfacher Zins:</strong> 10.000\u20AC bei 5% \xFCber 30 Jahre = 25.000\u20AC</li> <li><strong>Zinseszins:</strong> 10.000\u20AC bei 5% \xFCber 30 Jahre = <strong>43.219\u20AC</strong></li> <li><strong>Unterschied:</strong> 18.219\u20AC mehr durch den Zinseszins-Effekt!</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Realistische Renditen f\xFCr Ihre Berechnung</h3> <p>\nWelchen Zinssatz sollten Sie f\xFCr Ihre Berechnung verwenden?\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Tagesgeld:</strong> 2-3% (Stand 2025, variabel)</li> <li><strong>Festgeld (1-2 Jahre):</strong> 2,5-3,5%</li> <li><strong>Staatsanleihen:</strong> 2-4%</li> <li><strong>Unternehmensanleihen:</strong> 3-6%</li> <li><strong>Breit gestreute ETFs:</strong> 5-8% (langfristig historisch)</li> <li><strong>Aktien (MSCI World):</strong> 7-10% (langfristig historisch, mit Schwankungen!)</li> </ul> <p> <strong>Wichtig:</strong> Bei Aktien und ETFs sind diese Renditen Durchschnittswerte \xFCber \n            lange Zeitr\xE4ume. Kurzfristig k\xF6nnen starke Schwankungen auftreten!\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">ETF-Sparplan: Der Zinseszins automatisch</h3> <p>\nBei einem <strong>ETF-Sparplan</strong> auf thesaurierende Fonds werden Dividenden automatisch \n            reinvestiert \u2013 der Zinseszins-Effekt arbeitet also von selbst f\xFCr Sie:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>200\u20AC/Monat</strong> bei 7% \xFCber 30 Jahre = ca. <strong>243.000\u20AC</strong></li> <li>Davon eingezahlt: 72.000\u20AC</li> <li>Zinsen/Kursgewinne: <strong>171.000\u20AC</strong> (mehr als das Doppelte der Einzahlungen!)</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Steuern auf Kapitalertr\xE4ge</h3> <p>\nBeachten Sie, dass auf Zinsen und Kursgewinne <strong>Abgeltungssteuer</strong> anf\xE4llt:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Abgeltungssteuer:</strong> 25% auf Kapitalertr\xE4ge</li> <li><strong>Solidarit\xE4tszuschlag:</strong> 5,5% auf die Steuer</li> <li><strong>Ggf. Kirchensteuer:</strong> 8-9% auf die Steuer</li> <li><strong>Effektiver Steuersatz:</strong> ca. 26,4% (ohne Kirchensteuer)</li> </ul> <p>\nDer <strong>Sparerpauschbetrag</strong> betr\xE4gt 1.000\u20AC pro Person (2.000\u20AC f\xFCr Ehepaare) \u2013 \n            bis zu diesem Betrag bleiben Kapitalertr\xE4ge steuerfrei. Richten Sie einen\n<strong>Freistellungsauftrag</strong> bei Ihrer Bank ein!\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Inflation: Die versteckte Gefahr</h3> <p>\nVergessen Sie nicht die <strong>Inflation</strong>! Bei durchschnittlich 2% Inflation \n            verliert Ihr Geld j\xE4hrlich an Kaufkraft:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Nominalrendite</strong> (z.B. 5%) minus <strong>Inflation</strong> (z.B. 2%)</li> <li>= <strong>Realrendite</strong> (3%)</li> </ul> <p>\nBei Tagesgeld mit 2,5% Zinsen und 2% Inflation erzielen Sie nur 0,5% reale Rendite!\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Tipps f\xFCr den Verm\xF6gensaufbau</h3> <ul class="list-disc pl-5 space-y-1"> <li><strong>Fr\xFCh anfangen:</strong> Der Zinseszins braucht Zeit. Je fr\xFCher Sie starten, desto besser.</li> <li><strong>Regelm\xE4\xDFig sparen:</strong> Ein monatlicher Sparplan nutzt den Cost-Average-Effekt.</li> <li><strong>Kosten minimieren:</strong> W\xE4hlen Sie g\xFCnstige ETFs (TER unter 0,3%).</li> <li><strong>Diversifizieren:</strong> Verteilen Sie Risiken auf verschiedene Anlageklassen.</li> <li><strong>Langfristig denken:</strong> Nicht bei Kurseinbr\xFCchen verkaufen \u2013 aussitzen!</li> <li><strong>Sparerpauschbetrag nutzen:</strong> Freistellungsauftrag nicht vergessen.</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Weitere Rechner</h3> <p>\nPlanen Sie Ihre Finanzen mit unseren anderen Rechnern:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><a href="/kredit-rechner" class="text-emerald-600 hover:underline">Kredit-Rechner</a> \u2013 Kreditrate berechnen</li> <li><a href="/kapitalertragsteuer-rechner" class="text-emerald-600 hover:underline">Kapitalertragsteuer-Rechner</a> \u2013 Steuern auf Gewinne</li> <li><a href="/brutto-netto-rechner" class="text-emerald-600 hover:underline">Brutto-Netto-Rechner</a> \u2013 Was bleibt vom Gehalt?</li> <li><a href="/einkommensteuer-rechner" class="text-emerald-600 hover:underline">Einkommensteuer-Rechner</a> \u2013 Steuerlast berechnen</li> </ul> </div> </div> </div> </main>  <script type="application/ld+json">', '<\/script>  <script type="application/ld+json">', "<\/script> "])), maybeRenderHead(), renderComponent($$result2, "ZinseszinsRechner", ZinseszinsRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/ZinseszinsRechner", "client:component-export": "default" }), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Zinseszins-Rechner 2025",
    "description": description,
    "url": "https://deutschland-rechner.vercel.app/zinseszins-rechner",
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
        "name": "Was ist der Zinseszins?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Beim Zinseszins werden Ihre Zinsen nicht ausgezahlt, sondern dem Kapital hinzugef\xFCgt. Im n\xE4chsten Jahr erhalten Sie dann Zinsen auf das erh\xF6hte Kapital \u2013 Ihre Zinsen verdienen also selbst Zinsen. Dies f\xFChrt zu exponentiellem Wachstum \xFCber die Zeit."
        }
      },
      {
        "@type": "Question",
        "name": "Wie berechnet man den Zinseszins?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Die Zinseszins-Formel lautet: Endkapital = Startkapital \xD7 (1 + Zinssatz)^Jahre. Beispiel: 10.000\u20AC bei 5% \xFCber 10 Jahre = 10.000 \xD7 1,05^10 = 16.289\u20AC. Unser Rechner \xFCbernimmt diese Berechnung f\xFCr Sie."
        }
      },
      {
        "@type": "Question",
        "name": "Was ist die 72er-Regel?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Mit der 72er-Regel berechnen Sie schnell die Verdopplungszeit: Teilen Sie 72 durch den Zinssatz. Bei 6% Zinsen: 72 \xF7 6 = 12 Jahre bis zur Verdopplung. Bei 8%: 72 \xF7 8 = 9 Jahre."
        }
      },
      {
        "@type": "Question",
        "name": "Welche Rendite ist bei ETFs realistisch?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Breit gestreute ETFs (wie MSCI World) haben historisch eine durchschnittliche Rendite von 7-8% pro Jahr erzielt. Diese Werte sind langfristige Durchschnitte \u2013 kurzfristig k\xF6nnen starke Schwankungen auftreten."
        }
      },
      {
        "@type": "Question",
        "name": "Wie wirkt sich die Inflation auf den Zinseszins aus?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Die Inflation reduziert Ihre reale Rendite. Bei 5% Nominalrendite und 2% Inflation betr\xE4gt Ihre Realrendite nur 3%. Bei Tagesgeld mit 2,5% Zinsen und 2% Inflation erzielen Sie nur 0,5% reale Rendite."
        }
      },
      {
        "@type": "Question",
        "name": "Wie werden Kapitalertr\xE4ge in Deutschland besteuert?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Auf Zinsen, Dividenden und Kursgewinne f\xE4llt 25% Abgeltungssteuer plus 5,5% Solidarit\xE4tszuschlag an (effektiv ca. 26,4%). Der Sparerpauschbetrag von 1.000\u20AC pro Person (2.000\u20AC f\xFCr Paare) bleibt steuerfrei."
        }
      }
    ]
  }))) })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/zinseszins-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/zinseszins-rechner.astro";
const $$url = "/zinseszins-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$ZinseszinsRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
