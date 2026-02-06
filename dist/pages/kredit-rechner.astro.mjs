/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, u as unescapeHTML, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_v22DC8tm.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

function KreditRechner() {
  const [kreditsumme, setKreditsumme] = useState(1e4);
  const [zinssatz, setZinssatz] = useState(6.5);
  const [laufzeitMonate, setLaufzeitMonate] = useState(48);
  const [zeigeTilgungsplan, setZeigeTilgungsplan] = useState(false);
  const [kreditart, setKreditart] = useState("raten");
  const ergebnis = useMemo(() => {
    const P = kreditsumme;
    const r = zinssatz / 100 / 12;
    const n = laufzeitMonate;
    const laufzeitJahre = n / 12;
    if (kreditart === "endfaellig") {
      const zinsenMonatlich = P * r;
      const zinsenGesamt = zinsenMonatlich * n;
      const gesamtbetrag2 = P + zinsenGesamt;
      const effektivzins2 = zinssatz;
      return {
        monatsrate: zinsenMonatlich,
        schlussrate: P,
        gesamtzinsen: zinsenGesamt,
        gesamtbetrag: gesamtbetrag2,
        kreditsumme: P,
        zinssatz,
        effektivzins: effektivzins2,
        laufzeitMonate: n,
        laufzeitJahre,
        tilgungsplan: [],
        kreditart: "endfaellig"
      };
    }
    let monatsrate;
    if (r === 0) {
      monatsrate = P / n;
    } else {
      const faktor = Math.pow(1 + r, n);
      monatsrate = P * (r * faktor) / (faktor - 1);
    }
    const gesamtbetrag = monatsrate * n;
    const gesamtzinsen = gesamtbetrag - P;
    const effektivzins = Math.pow(1 + r, 12) - 1;
    const tilgungsplan = [];
    let restschuld = P;
    for (let jahr = 1; jahr <= Math.ceil(n / 12); jahr++) {
      const monateImJahr = Math.min(12, n - (jahr - 1) * 12);
      let zinsenJahr = 0;
      let tilgungJahr = 0;
      for (let monat = 0; monat < monateImJahr; monat++) {
        const zinsenMonat = restschuld * r;
        const tilgungMonat = monatsrate - zinsenMonat;
        zinsenJahr += zinsenMonat;
        tilgungJahr += tilgungMonat;
        restschuld = Math.max(0, restschuld - tilgungMonat);
      }
      tilgungsplan.push({
        jahr,
        restschuld: Math.max(0, restschuld),
        zinsen: zinsenJahr,
        tilgung: tilgungJahr,
        rate: monatsrate * monateImJahr
      });
    }
    return {
      monatsrate,
      schlussrate: 0,
      gesamtzinsen,
      gesamtbetrag,
      kreditsumme: P,
      zinssatz,
      effektivzins: effektivzins * 100,
      laufzeitMonate: n,
      laufzeitJahre,
      tilgungsplan,
      kreditart: "raten"
    };
  }, [kreditsumme, zinssatz, laufzeitMonate, kreditart]);
  const formatEuro = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";
  const formatEuroExact = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  const formatProzent = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " %";
  const zinsenAnteil = ergebnis.gesamtzinsen / ergebnis.gesamtbetrag * 100;
  const tilgungAnteil = 100 - zinsenAnteil;
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Kreditart" }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setKreditart("raten"),
              className: `py-4 px-4 rounded-xl transition-all ${kreditart === "raten" ? "bg-emerald-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "font-bold block", children: "📊 Ratenkredit" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs opacity-80", children: "Gleichbleibende Monatsrate" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setKreditart("endfaellig"),
              className: `py-4 px-4 rounded-xl transition-all ${kreditart === "endfaellig" ? "bg-emerald-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "font-bold block", children: "🎯 Endfällig" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs opacity-80", children: "Tilgung am Laufzeitende" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Kreditsumme (Nettodarlehensbetrag)" }) }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: kreditsumme,
              onChange: (e) => setKreditsumme(Math.max(500, Number(e.target.value))),
              className: "w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none",
              min: "500",
              max: "100000",
              step: "500"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl", children: "€" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: kreditsumme,
            onChange: (e) => setKreditsumme(Number(e.target.value)),
            className: "w-full mt-3 accent-emerald-500",
            min: "1000",
            max: "50000",
            step: "500"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "1.000 €" }),
          /* @__PURE__ */ jsx("span", { children: "25.000 €" }),
          /* @__PURE__ */ jsx("span", { children: "50.000 €" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Sollzinssatz (p.a.)" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Gebundener Sollzinssatz pro Jahr" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: zinssatz,
              onChange: (e) => setZinssatz(Math.max(0, Math.min(25, Number(e.target.value)))),
              className: "w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none",
              min: "0",
              max: "25",
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
            step: "0.1"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "0%" }),
          /* @__PURE__ */ jsx("span", { children: "7,5%" }),
          /* @__PURE__ */ jsx("span", { children: "15%" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mt-2", children: "💡 Typischer Ratenkredit: 4-10% | Dispokredit: 10-15%" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Laufzeit" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4 mb-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setLaufzeitMonate(Math.max(6, laufzeitMonate - 6)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors",
              children: "−"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "text-center px-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-4xl font-bold text-gray-800", children: laufzeitMonate }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-500", children: [
              "Monate (",
              (laufzeitMonate / 12).toFixed(1),
              " Jahre)"
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setLaufzeitMonate(Math.min(120, laufzeitMonate + 6)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors",
              children: "+"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: laufzeitMonate,
            onChange: (e) => setLaufzeitMonate(Number(e.target.value)),
            className: "w-full mt-2 accent-emerald-500",
            min: "6",
            max: "120",
            step: "6"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "6 Mo." }),
          /* @__PURE__ */ jsx("span", { children: "5 Jahre" }),
          /* @__PURE__ */ jsx("span", { children: "10 Jahre" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: "💳 Ihre Monatsrate" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuroExact(ergebnis.monatsrate) }),
          /* @__PURE__ */ jsx("span", { className: "text-xl opacity-80", children: "/ Monat" })
        ] }),
        kreditart === "endfaellig" && /* @__PURE__ */ jsxs("p", { className: "text-emerald-100 mt-2 text-sm", children: [
          "⚠️ Schlussrate am Ende: ",
          /* @__PURE__ */ jsx("strong", { children: formatEuro(ergebnis.schlussrate) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Gesamtbetrag" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuroExact(ergebnis.gesamtbetrag) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Zinskosten" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuroExact(ergebnis.gesamtzinsen) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm mb-2", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "Tilgung: ",
            formatEuro(ergebnis.kreditsumme)
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Zinsen: ",
            formatEuro(ergebnis.gesamtzinsen)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "h-4 rounded-full overflow-hidden bg-white/20 flex", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "bg-white h-full transition-all duration-500",
              style: { width: `${tilgungAnteil}%` }
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "bg-red-400 h-full transition-all duration-500",
              style: { width: `${zinsenAnteil}%` }
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs mt-1 opacity-70", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            tilgungAnteil.toFixed(1),
            "% Tilgung"
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
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Nettodarlehensbetrag" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.kreditsumme) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Sollzinssatz (p.a.)" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: formatProzent(ergebnis.zinssatz) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Effektiver Jahreszins (ca.)" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium text-emerald-700", children: formatProzent(ergebnis.effektivzins) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Laufzeit" }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-900", children: [
            ergebnis.laufzeitMonate,
            " Monate (",
            ergebnis.laufzeitJahre.toFixed(1),
            " Jahre)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Anzahl Raten" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-900", children: ergebnis.laufzeitMonate })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Monatliche Rate" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuroExact(ergebnis.monatsrate) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-red-600", children: [
          /* @__PURE__ */ jsx("span", { children: "Gesamte Zinskosten" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold", children: formatEuroExact(ergebnis.gesamtzinsen) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-3 bg-emerald-50 -mx-6 px-6 rounded-b-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-emerald-800", children: "Gesamtrückzahlung" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-2xl text-emerald-900", children: formatEuroExact(ergebnis.gesamtbetrag) })
        ] })
      ] })
    ] }),
    kreditart === "raten" && ergebnis.tilgungsplan.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800", children: "📅 Tilgungsplan (jährlich)" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setZeigeTilgungsplan(!zeigeTilgungsplan),
            className: `px-4 py-2 rounded-xl text-sm font-medium transition-all ${zeigeTilgungsplan ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: zeigeTilgungsplan ? "▲ Ausblenden" : "▼ Anzeigen"
          }
        )
      ] }),
      zeigeTilgungsplan && /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b-2 border-gray-200", children: [
          /* @__PURE__ */ jsx("th", { className: "text-left py-2 text-gray-600", children: "Jahr" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-2 text-gray-600", children: "Rate (Jahr)" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-2 text-gray-600", children: "Zinsen" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-2 text-gray-600", children: "Tilgung" }),
          /* @__PURE__ */ jsx("th", { className: "text-right py-2 text-gray-600", children: "Restschuld" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: ergebnis.tilgungsplan.map((zeile) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("td", { className: "py-2 font-medium", children: zeile.jahr }),
          /* @__PURE__ */ jsx("td", { className: "text-right py-2", children: formatEuroExact(zeile.rate) }),
          /* @__PURE__ */ jsx("td", { className: "text-right py-2 text-red-600", children: formatEuroExact(zeile.zinsen) }),
          /* @__PURE__ */ jsx("td", { className: "text-right py-2 text-emerald-600", children: formatEuroExact(zeile.tilgung) }),
          /* @__PURE__ */ jsx("td", { className: "text-right py-2 font-medium", children: formatEuroExact(zeile.restschuld) })
        ] }, zeile.jahr)) }),
        /* @__PURE__ */ jsx("tfoot", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-gray-50 font-bold", children: [
          /* @__PURE__ */ jsx("td", { className: "py-2", children: "Gesamt" }),
          /* @__PURE__ */ jsx("td", { className: "text-right py-2", children: formatEuroExact(ergebnis.gesamtbetrag) }),
          /* @__PURE__ */ jsx("td", { className: "text-right py-2 text-red-600", children: formatEuroExact(ergebnis.gesamtzinsen) }),
          /* @__PURE__ */ jsx("td", { className: "text-right py-2 text-emerald-600", children: formatEuroExact(ergebnis.kreditsumme) }),
          /* @__PURE__ */ jsx("td", { className: "text-right py-2", children: "0,00 €" })
        ] }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ Kreditarten im Überblick" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "📊" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Ratenkredit (Annuitätendarlehen):" }),
            " Gleichbleibende monatliche Rate aus Zins und Tilgung. Der Zinsanteil sinkt, der Tilgungsanteil steigt."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "🎯" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Endfälliges Darlehen:" }),
            " Während der Laufzeit zahlen Sie nur Zinsen. Die gesamte Kreditsumme wird am Ende fällig."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "🚗" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Autokredit:" }),
            " Zweckgebundener Kredit für Fahrzeuge, oft mit günstigeren Zinsen als Ratenkredit."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "🏠" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Immobilienkredit:" }),
            " Langfristiges Darlehen für Hauskauf/Bau mit Grundschuldsicherung. Deutlich niedrigere Zinsen."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "🏧" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Dispokredit:" }),
            " Überziehungskredit auf dem Girokonto. Flexibel, aber sehr teuer (10-15% Zinsen)."
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-emerald-800 mb-3", children: "💡 Tipps zum Geld sparen" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-emerald-700", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Sondertilgung:" }),
            " Viele Kredite erlauben kostenlose Sondertilgungen (oft 5-10% pro Jahr). Nutzen Sie diese, um Zinsen zu sparen!"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Kürzere Laufzeit:" }),
            " Je kürzer die Laufzeit, desto weniger Zinsen zahlen Sie – aber die Monatsrate steigt."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Vergleichen:" }),
            " Holen Sie mehrere Angebote ein. Schon 0,5% weniger Zinsen sparen bei 10.000€ über 5 Jahre ca. 150€."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Dispo ablösen:" }),
            " Ersetzen Sie teure Dispokredite durch günstigere Ratenkredite – das spart oft 5-10% Zinsen!"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "14-Tage Widerruf:" }),
            " Bei Verbraucherkrediten haben Sie 14 Tage Widerrufsrecht ohne Angabe von Gründen."
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
            /* @__PURE__ */ jsx("strong", { children: "Effektivzins beachten:" }),
            " Der effektive Jahreszins enthält alle Kosten und ist der wichtigste Vergleichswert."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Bonitätsabhängig:" }),
            " Die angezeigten Zinsen sind Beispielwerte. Ihr persönlicher Zinssatz hängt von Ihrer Bonität ab."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Nebenkosten:" }),
            " Bei manchen Krediten kommen Bearbeitungsgebühren, Kontoführungsgebühren oder Restschuldversicherungen hinzu."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Restschuldversicherung:" }),
            " Oft nicht nötig und sehr teuer. Prüfen Sie Alternativen wie Risikolebensversicherung."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Tragfähigkeit prüfen:" }),
            " Die Monatsrate sollte max. 30-40% Ihres verfügbaren Nettoeinkommens betragen."
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Verbraucherschutz & Beratung" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-emerald-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-emerald-900", children: "Verbraucherzentrale" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-emerald-700 mt-1", children: "Die Verbraucherzentralen bieten unabhängige Beratung zu Krediten und Finanzierungen." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Schuldnerberatung" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.meine-schulden.de",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "Kostenlose Schuldnerberatung →"
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
                  children: "Verbraucher-Infos der BaFin →"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "💡" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Kreditrechte nach § 491 BGB" }),
            /* @__PURE__ */ jsxs("ul", { className: "text-gray-600 mt-1 space-y-1", children: [
              /* @__PURE__ */ jsx("li", { children: "• 14-Tage Widerrufsrecht bei Verbraucherkrediten" }),
              /* @__PURE__ */ jsx("li", { children: "• Recht auf vorzeitige Rückzahlung (Vorfälligkeitsentschädigung max. 1%)" }),
              /* @__PURE__ */ jsx("li", { children: "• Transparenzpflicht: Alle Kosten müssen offengelegt werden" }),
              /* @__PURE__ */ jsx("li", { children: "• Verbot von Koppelgeschäften (z.B. Zwangs-Versicherungen)" })
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
            href: "https://www.gesetze-im-internet.de/bgb/__488.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BGB § 488 – Darlehensvertrag"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/bgb/__491.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BGB § 491 – Verbraucherdarlehensvertrag"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bafin.de/DE/Verbraucher/verbraucher_node.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BaFin – Verbraucherinformationen Kredite"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.verbraucherzentrale.de/wissen/geld-versicherungen/kredit",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Verbraucherzentrale – Kredit & Finanzierung"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bundesbank.de/de/statistiken/geld-und-kapitalmaerkte/zinssaetze-und-renditen",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesbank – Aktuelle Zinssätze"
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
const $$KreditRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "Kredit-Rechner 2025 \u2013 Kreditrate, Zinsen & Tilgungsplan berechnen";
  const description = "Kredit-Rechner 2025: Berechnen Sie Ihre monatliche Kreditrate, Zinskosten & Tilgungsplan. Kostenlos Ratenkredit, Autokredit & Dispoabl\xF6sung vergleichen!";
  const keywords = "Kredit Rechner, Kreditrechner, Kreditrate berechnen, Kredit Zinsen, Tilgungsrechner, Ratenkredit Rechner, Autokredit Rechner, Kredit berechnen, Darlehen Rechner, Annuit\xE4tenrechner, Kreditvergleich, effektiver Jahreszins, Monatsrate berechnen";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<main class="min-h-screen pb-8"> <!-- Header mit Zur\xFCck-Button --> <header class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-emerald-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>\nAlle Rechner\n</a> <div class="flex items-center gap-3"> <span class="text-4xl">\u{1F4B3}</span> <div> <h1 class="text-2xl font-bold">Kredit-Rechner</h1> <p class="text-emerald-100 text-sm">Kreditrate & Zinskosten berechnen</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ', ' </div> <!-- SEO Content Section --> <div class="max-w-2xl mx-auto px-4 mt-8"> <div class="bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">Kredit-Rechner 2025: Kreditkosten einfach berechnen</h2> <div class="prose prose-sm text-gray-600 space-y-4"> <p>\nMit unserem <strong>Kredit-Rechner</strong> berechnen Sie schnell und kostenlos Ihre monatliche \n            Kreditrate, die gesamten Zinskosten und den Tilgungsplan. Egal ob <strong>Ratenkredit</strong>,\n<strong>Autokredit</strong> oder <strong>Umschuldung</strong> \u2013 unser Rechner zeigt Ihnen transparent, \n            was der Kredit wirklich kostet.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">So funktioniert die Kreditberechnung</h3> <p>\nBei einem klassischen <strong>Annuit\xE4tendarlehen</strong> (Ratenkredit) zahlen Sie jeden Monat \n            die gleiche Rate. Diese setzt sich aus Zins und Tilgung zusammen:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Zinsanteil:</strong> Wird auf die Restschuld berechnet \u2013 sinkt mit der Zeit</li> <li><strong>Tilgungsanteil:</strong> Reduziert Ihre Schulden \u2013 steigt mit der Zeit</li> <li><strong>Monatsrate:</strong> Bleibt konstant \xFCber die gesamte Laufzeit</li> </ul> <p>\nDie Formel f\xFCr die monatliche Annuit\xE4t lautet: <em>A = K \xD7 (q^n \xD7 (q-1)) / (q^n - 1)</em>, \n            wobei K = Kreditsumme, q = 1 + Monatszins und n = Anzahl Monate.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Sollzins vs. Effektivzins \u2013 Der Unterschied</h3> <p>\nBeim Kreditvergleich ist der <strong>effektive Jahreszins</strong> entscheidend:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Sollzinssatz:</strong> Der reine Zinssatz ohne Nebenkosten</li> <li><strong>Effektiver Jahreszins:</strong> Enth\xE4lt alle Kosten (Bearbeitungsgeb\xFChren, Kontof\xFChrung) \n                und ber\xFCcksichtigt die Zahlungsweise</li> </ul> <p>\nNach <strong>\xA7 6 PAngV</strong> (Preisangabenverordnung) m\xFCssen Banken den effektiven Jahreszins \n            bei Werbung immer angeben. Vergleichen Sie daher immer den Effektivzins!\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Aktuelle Kreditzinsen 2025</h3> <p>\nDie Zinsen variieren je nach Kreditart und Bonit\xE4t erheblich:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Ratenkredit:</strong> 4,5 \u2013 10% effektiv (bonit\xE4tsabh\xE4ngig)</li> <li><strong>Autokredit:</strong> 3,5 \u2013 8% effektiv (Fahrzeug als Sicherheit)</li> <li><strong>Baufinanzierung:</strong> 3,5 \u2013 5% effektiv (Grundschuld als Sicherheit)</li> <li><strong>Dispokredit:</strong> 10 \u2013 15% effektiv (sehr teuer!)</li> </ul> <p> <strong>Tipp:</strong> L\xF6sen Sie teure Dispokredite durch einen g\xFCnstigeren Ratenkredit ab \u2013 \n            das spart oft mehrere Hundert Euro pro Jahr an Zinsen.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Sondertilgung: So sparen Sie Zinskosten</h3> <p>\nViele Kredite erlauben <strong>kostenlose Sondertilgungen</strong> \u2013 nutzen Sie diese M\xF6glichkeit:\n</p> <ul class="list-disc pl-5 space-y-1"> <li>Typisch: 5-10% der Kreditsumme pro Jahr sondertilgungsfrei</li> <li>Bei 10.000\u20AC Kredit und 5% Sondertilgung: 500\u20AC/Jahr extra m\xF6glich</li> <li>Jede Sondertilgung verk\xFCrzt die Laufzeit und spart Zinsen</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Ihre Rechte als Kreditnehmer</h3> <p>\nDas <strong>Verbraucherkreditrecht</strong> (\xA7\xA7 491-515 BGB) sch\xFCtzt Sie:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>14-Tage Widerrufsrecht:</strong> Sie k\xF6nnen jeden Verbraucherkredit \n                innerhalb von 14 Tagen ohne Angabe von Gr\xFCnden widerrufen</li> <li><strong>Vorzeitige R\xFCckzahlung:</strong> Sie d\xFCrfen den Kredit jederzeit abl\xF6sen. \n                Die Vorf\xE4lligkeitsentsch\xE4digung betr\xE4gt max. 1% (bei Restlaufzeit &gt;1 Jahr) bzw. 0,5%</li> <li><strong>Transparenzpflicht:</strong> Alle Kosten m\xFCssen vor Vertragsschluss offengelegt werden</li> <li><strong>Kein Kopplungsverbot:</strong> Der Kredit darf nicht an den Abschluss \n                einer Restschuldversicherung gekn\xFCpft werden</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Kredit trotz SCHUFA?</h3> <p>\nBei negativer SCHUFA sind die M\xF6glichkeiten eingeschr\xE4nkt, aber nicht unm\xF6glich:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>SCHUFA-Selbstauskunft:</strong> Pr\xFCfen Sie zuerst kostenlos Ihren Score \n                auf <a href="https://www.meineschufa.de" class="text-emerald-600 hover:underline">meineschufa.de</a></li> <li><strong>Fehler korrigieren:</strong> Veraltete Eintr\xE4ge k\xF6nnen gel\xF6scht werden</li> <li><strong>B\xFCrgschaft:</strong> Ein B\xFCrge mit guter Bonit\xE4t verbessert die Chancen</li> <li><strong>Vorsicht:</strong> Kredite ohne SCHUFA sind oft unseri\xF6s und sehr teuer!</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Weitere Rechner</h3> <p>\nPlanen Sie eine gr\xF6\xDFere Anschaffung? Nutzen Sie auch unsere anderen Rechner:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><a href="/brutto-netto-rechner" class="text-emerald-600 hover:underline">Brutto-Netto-Rechner</a> \u2013 Was bleibt vom Gehalt?</li> <li><a href="/einkommensteuer-rechner" class="text-emerald-600 hover:underline">Einkommensteuer-Rechner</a> \u2013 Steuerlast berechnen</li> <li><a href="/buergergeld-rechner" class="text-emerald-600 hover:underline">B\xFCrgergeld-Rechner</a> \u2013 Sozialleistungen pr\xFCfen</li> </ul> </div> </div> </div> </main>  <script type="application/ld+json">', '<\/script>  <script type="application/ld+json">', "<\/script> "])), maybeRenderHead(), renderComponent($$result2, "KreditRechner", KreditRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/KreditRechner", "client:component-export": "default" }), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Kredit-Rechner 2025",
    "description": description,
    "url": "https://deutschland-rechner.vercel.app/kredit-rechner",
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
        "name": "Wie berechne ich die monatliche Kreditrate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Die monatliche Rate eines Annuit\xE4tendarlehens berechnet sich nach der Formel: Rate = Kreditsumme \xD7 (Monatszins \xD7 (1 + Monatszins)^Monate) / ((1 + Monatszins)^Monate - 1). Unser Kredit-Rechner \xFCbernimmt diese Berechnung automatisch f\xFCr Sie."
        }
      },
      {
        "@type": "Question",
        "name": "Was ist der Unterschied zwischen Sollzins und Effektivzins?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Der Sollzinssatz ist der reine Zinssatz auf das Darlehen. Der effektive Jahreszins enth\xE4lt zus\xE4tzlich alle Nebenkosten (Bearbeitungsgeb\xFChren, Kontof\xFChrung) und ber\xFCcksichtigt die Zahlungsweise. F\xFCr den Kreditvergleich ist der Effektivzins entscheidend."
        }
      },
      {
        "@type": "Question",
        "name": "Kann ich meinen Kredit vorzeitig zur\xFCckzahlen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, bei Verbraucherkrediten haben Sie das Recht auf vorzeitige R\xFCckzahlung. Die Bank darf eine Vorf\xE4lligkeitsentsch\xE4digung von maximal 1% der Restschuld (bei Restlaufzeit \xFCber 12 Monate) bzw. 0,5% (bei k\xFCrzerer Restlaufzeit) verlangen."
        }
      },
      {
        "@type": "Question",
        "name": "Welche Kreditzinsen sind aktuell \xFCblich?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "2025 liegen die Zinsen f\xFCr Ratenkredite typischerweise bei 4,5-10% effektiv (bonit\xE4tsabh\xE4ngig), Autokredite bei 3,5-8%, Baufinanzierungen bei 3,5-5% und Dispokredite bei 10-15%. Vergleichen Sie mehrere Angebote!"
        }
      },
      {
        "@type": "Question",
        "name": "Wie kann ich Kreditkosten sparen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "1) Vergleichen Sie mehrere Angebote und achten Sie auf den Effektivzins. 2) W\xE4hlen Sie eine k\xFCrzere Laufzeit, wenn m\xF6glich. 3) Nutzen Sie Sondertilgungen. 4) L\xF6sen Sie teure Dispokredite durch g\xFCnstigere Ratenkredite ab. 5) Verzichten Sie auf teure Restschuldversicherungen."
        }
      }
    ]
  }))) })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/kredit-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/kredit-rechner.astro";
const $$url = "/kredit-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$KreditRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
