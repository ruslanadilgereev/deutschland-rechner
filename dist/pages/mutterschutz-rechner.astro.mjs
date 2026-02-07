/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DmT1JwUR.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const MUTTERSCHUTZ_2026 = {
  kassenMax: 13,
  // Max. 13€/Tag von Krankenkasse (§ 24i Abs. 2 SGB V)
  bundesamtMax: 210,
  // Max. 210€ einmalig vom Bundesamt (§ 19 Abs. 2 MuSchG)
  schutzfristVor: 6,
  // 6 Wochen vor Geburt (§ 3 Abs. 1 MuSchG)
  schutzfristNach: 8,
  // 8 Wochen nach Geburt (§ 3 Abs. 2 MuSchG)
  schutzfristNachFrueh: 12,
  // 12 Wochen bei Früh-/Mehrlingsgeburt (§ 3 Abs. 2 Satz 2 MuSchG)
  tageProWoche: 7
  // Kalendertage (nicht Arbeitstage!)
};
function berechneMutterschutz(bruttoMonat, nettoMonat, versicherung, fruehgeburt, mehrlinge, behinderung) {
  const tageVor = MUTTERSCHUTZ_2026.schutzfristVor * MUTTERSCHUTZ_2026.tageProWoche;
  let tageNach = MUTTERSCHUTZ_2026.schutzfristNach * MUTTERSCHUTZ_2026.tageProWoche;
  if (fruehgeburt || mehrlinge || behinderung) {
    tageNach = MUTTERSCHUTZ_2026.schutzfristNachFrueh * MUTTERSCHUTZ_2026.tageProWoche;
  }
  const tageGesamt = tageVor + tageNach;
  const kalenderwochen = tageGesamt / 7;
  const nettoTag = Math.round(nettoMonat * 3 / 90 * 100) / 100;
  let mutterschaftsgeldTag = 0;
  let arbeitgeberZuschussTag = 0;
  const berechnung = [];
  if (versicherung === "gkv") {
    mutterschaftsgeldTag = Math.min(MUTTERSCHUTZ_2026.kassenMax, nettoTag);
    arbeitgeberZuschussTag = Math.max(0, nettoTag - mutterschaftsgeldTag);
    berechnung.push({
      label: "Netto-Tagessatz (Ø 3 Monate)",
      wert: `${nettoTag.toFixed(2)} €`,
      details: `${nettoMonat} € × 3 ÷ 90 Tage`
    });
    berechnung.push({
      label: "Mutterschaftsgeld (Krankenkasse)",
      wert: `${mutterschaftsgeldTag.toFixed(2)} €/Tag`,
      details: `Max. 13 €/Tag`
    });
    berechnung.push({
      label: "Arbeitgeberzuschuss",
      wert: `${arbeitgeberZuschussTag.toFixed(2)} €/Tag`,
      details: `${nettoTag.toFixed(2)} € − ${mutterschaftsgeldTag.toFixed(2)} €`
    });
  } else if (versicherung === "pkv" || versicherung === "keine") {
    const bundesamtGesamt = MUTTERSCHUTZ_2026.bundesamtMax;
    mutterschaftsgeldTag = bundesamtGesamt / tageGesamt;
    arbeitgeberZuschussTag = Math.max(0, nettoTag - MUTTERSCHUTZ_2026.kassenMax);
    berechnung.push({
      label: "Netto-Tagessatz (Ø 3 Monate)",
      wert: `${nettoTag.toFixed(2)} €`,
      details: `${nettoMonat} € × 3 ÷ 90 Tage`
    });
    berechnung.push({
      label: "Mutterschaftsgeld (Bundesamt)",
      wert: `210 € einmalig`,
      details: `Max. 210 € gesamt (nicht pro Tag)`
    });
    berechnung.push({
      label: "Arbeitgeberzuschuss",
      wert: `${arbeitgeberZuschussTag.toFixed(2)} €/Tag`,
      details: `${nettoTag.toFixed(2)} € − 13 € (fiktiver Kassensatz)`
    });
  } else if (versicherung === "mini") {
    mutterschaftsgeldTag = MUTTERSCHUTZ_2026.bundesamtMax / tageGesamt;
    arbeitgeberZuschussTag = 0;
    berechnung.push({
      label: "Mutterschaftsgeld (Bundesamt)",
      wert: `210 € einmalig`,
      details: `Kein Arbeitgeberzuschuss bei Minijob`
    });
  }
  const mutterschaftsgeldGesamt = versicherung === "gkv" ? mutterschaftsgeldTag * tageGesamt : versicherung === "mini" ? MUTTERSCHUTZ_2026.bundesamtMax : MUTTERSCHUTZ_2026.bundesamtMax;
  const arbeitgeberZuschussGesamt = arbeitgeberZuschussTag * tageGesamt;
  const gesamtAuszahlung = versicherung === "gkv" ? mutterschaftsgeldGesamt + arbeitgeberZuschussGesamt : versicherung === "mini" ? MUTTERSCHUTZ_2026.bundesamtMax : MUTTERSCHUTZ_2026.bundesamtMax + arbeitgeberZuschussGesamt;
  berechnung.push({
    label: "Schutzfrist gesamt",
    wert: `${tageGesamt} Tage (${kalenderwochen} Wochen)`,
    details: `${tageVor} vor + ${tageNach} nach der Geburt`
  });
  berechnung.push({
    label: "Gesamtauszahlung",
    wert: `${Math.round(gesamtAuszahlung).toLocaleString("de-DE")} €`,
    details: versicherung === "gkv" ? `(${mutterschaftsgeldTag.toFixed(2)} + ${arbeitgeberZuschussTag.toFixed(2)}) × ${tageGesamt} Tage` : `210 € + ${arbeitgeberZuschussGesamt.toLocaleString("de-DE")} €`
  });
  return {
    tageVor,
    tageNach,
    tageGesamt,
    mutterschaftsgeldTag: versicherung === "gkv" ? mutterschaftsgeldTag : MUTTERSCHUTZ_2026.bundesamtMax / tageGesamt,
    mutterschaftsgeldGesamt: versicherung === "gkv" ? mutterschaftsgeldGesamt : MUTTERSCHUTZ_2026.bundesamtMax,
    arbeitgeberZuschussTag,
    arbeitgeberZuschussGesamt,
    gesamtAuszahlung,
    kalenderwochen,
    nettoTag,
    berechnung
  };
}
function MutterschutzRechner() {
  const [bruttoMonat, setBruttoMonat] = useState(3500);
  const [nettoMonat, setNettoMonat] = useState(2300);
  const [versicherung, setVersicherung] = useState("gkv");
  const [fruehgeburt, setFruehgeburt] = useState(false);
  const [mehrlinge, setMehrlinge] = useState(false);
  const [behinderung, setBehinderung] = useState(false);
  const [geburtstermin, setGeburtstermin] = useState("");
  const ergebnis = useMemo(() => {
    return berechneMutterschutz(bruttoMonat, nettoMonat, versicherung, fruehgeburt, mehrlinge, behinderung);
  }, [bruttoMonat, nettoMonat, versicherung, fruehgeburt, mehrlinge, behinderung]);
  const fristen = useMemo(() => {
    if (!geburtstermin) return null;
    const termin = new Date(geburtstermin);
    const startMutterschutz = new Date(termin);
    startMutterschutz.setDate(termin.getDate() - ergebnis.tageVor);
    const endeMutterschutz = new Date(termin);
    endeMutterschutz.setDate(termin.getDate() + ergebnis.tageNach);
    return {
      start: startMutterschutz.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }),
      termin: termin.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }),
      ende: endeMutterschutz.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
    };
  }, [geburtstermin, ergebnis.tageVor, ergebnis.tageNach]);
  const formatEuro = (n) => Math.round(n).toLocaleString("de-DE") + " €";
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Dein Netto-Einkommen" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 ml-2", children: "(Durchschnitt der letzten 3 Monate)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: nettoMonat,
              onChange: (e) => setNettoMonat(Math.max(0, Number(e.target.value))),
              className: "w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 outline-none",
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
            min: "0",
            max: "5000",
            step: "100",
            value: nettoMonat,
            onChange: (e) => setNettoMonat(Number(e.target.value)),
            className: "w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Krankenversicherung" }) }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3", children: [
          { id: "gkv", label: "Gesetzlich (GKV)", desc: "Pflicht- oder freiwillig versichert" },
          { id: "pkv", label: "Privat (PKV)", desc: "Privat krankenversichert" },
          { id: "mini", label: "Minijob", desc: "Geringfügig beschäftigt" },
          { id: "keine", label: "Familienversichert", desc: "Ohne eigene KV" }
        ].map((v) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setVersicherung(v.id),
            className: `p-4 rounded-xl text-left transition-all ${versicherung === v.id ? "bg-pink-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: [
              /* @__PURE__ */ jsx("div", { className: "font-bold", children: v.label }),
              /* @__PURE__ */ jsx("div", { className: `text-xs mt-1 ${versicherung === v.id ? "text-pink-100" : "text-gray-500"}`, children: v.desc })
            ]
          },
          v.id
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Errechneter Geburtstermin" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 ml-2", children: "(optional)" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "date",
            value: geburtstermin,
            onChange: (e) => setGeburtstermin(e.target.value),
            className: "w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 outline-none"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Besondere Umstände" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 ml-2", children: "(verlängern die Schutzfrist auf 12 Wochen)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: fruehgeburt,
                onChange: (e) => setFruehgeburt(e.target.checked),
                className: "w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
              }
            ),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "Frühgeburt" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 ml-2", children: "vor der 37. SSW" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: mehrlinge,
                onChange: (e) => setMehrlinge(e.target.checked),
                className: "w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
              }
            ),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "Mehrlinge" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 ml-2", children: "Zwillinge, Drillinge etc." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: behinderung,
                onChange: (e) => setBehinderung(e.target.checked),
                className: "w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
              }
            ),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "Kind mit Behinderung" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 ml-2", children: "Feststellung innerhalb von 8 Wochen" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg p-6 text-white mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-pink-100 mb-1", children: "Dein Mutterschaftsgeld" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuro(ergebnis.gesamtAuszahlung) }),
          /* @__PURE__ */ jsx("span", { className: "text-xl text-pink-200", children: "gesamt" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-pink-100 mt-2", children: [
          "für ",
          ergebnis.kalenderwochen,
          " Wochen Mutterschutz (",
          ergebnis.tageGesamt,
          " Tage)"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("div", { className: "text-pink-100 text-sm", children: "Von der Krankenkasse" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.mutterschaftsgeldGesamt) }),
          versicherung === "gkv" && /* @__PURE__ */ jsxs("div", { className: "text-pink-200 text-xs", children: [
            ergebnis.mutterschaftsgeldTag.toFixed(2),
            " €/Tag × ",
            ergebnis.tageGesamt
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("div", { className: "text-pink-100 text-sm", children: "Arbeitgeberzuschuss" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.arbeitgeberZuschussGesamt) }),
          /* @__PURE__ */ jsxs("div", { className: "text-pink-200 text-xs", children: [
            ergebnis.arbeitgeberZuschussTag.toFixed(2),
            " €/Tag × ",
            ergebnis.tageGesamt
          ] })
        ] })
      ] })
    ] }),
    fristen && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📅 Deine Mutterschutzfristen" }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "w-4 h-4 bg-pink-500 rounded-full mx-auto mb-2" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm font-bold text-gray-800", children: "Beginn" }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-600", children: fristen.start })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 h-2 bg-pink-200 mx-4 relative", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 w-[43%] bg-pink-300" }),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 right-0 w-[57%] bg-pink-500" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "w-4 h-4 bg-rose-600 rounded-full mx-auto mb-2" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm font-bold text-gray-800", children: "Geburt" }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-600", children: fristen.termin })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 h-2 bg-pink-500 mx-4" }),
          /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "w-4 h-4 bg-pink-500 rounded-full mx-auto mb-2" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm font-bold text-gray-800", children: "Ende" }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-600", children: fristen.ende })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 mt-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-pink-50 rounded-xl p-4 text-center", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold text-pink-600", children: [
              ergebnis.tageVor / 7,
              " Wochen"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-pink-800", children: "vor der Geburt" }),
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-pink-600 mt-1", children: [
              "Ab ",
              fristen.start
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-rose-50 rounded-xl p-4 text-center", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold text-rose-600", children: [
              ergebnis.tageNach / 7,
              " Wochen"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-rose-800", children: "nach der Geburt" }),
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-rose-600 mt-1", children: [
              "Bis ",
              fristen.ende
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Berechnungsdetails" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: ergebnis.berechnung.map((item, i) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start py-2 border-b border-gray-100 last:border-0", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: item.label }),
          item.details && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: item.details })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900 whitespace-nowrap ml-4", children: item.wert })
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert Mutterschutz" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "6 Wochen vor" }),
            " der Geburt beginnt der Mutterschutz (freiwillig weiterarbeiten möglich)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "8 Wochen nach" }),
            " der Geburt gilt absolutes Beschäftigungsverbot"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "12 Wochen nach" }),
            " der Geburt bei Früh-/Mehrlingsgeburten oder Kind mit Behinderung"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "100% Nettolohn" }),
            " durch Mutterschaftsgeld + Arbeitgeberzuschuss"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Max. 13 €/Tag" }),
            " zahlt die Krankenkasse, den Rest der Arbeitgeber"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Stellen" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-pink-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-pink-900", children: "Mutterschaftsgeld beantragen bei:" }),
          /* @__PURE__ */ jsxs("ul", { className: "text-sm text-pink-700 mt-2 space-y-1", children: [
            /* @__PURE__ */ jsxs("li", { children: [
              "• ",
              /* @__PURE__ */ jsx("strong", { children: "GKV-Versicherte:" }),
              " Bei deiner Krankenkasse"
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              "• ",
              /* @__PURE__ */ jsx("strong", { children: "PKV/Familienversicherte:" }),
              " Bundesamt für Soziale Sicherung"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "GKV-Versicherte" }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Antrag bei deiner Krankenkasse" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Mit ärztlicher Bescheinigung über den Geburtstermin" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🏛️" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Bundesamt für Soziale Sicherung" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.bundesamtsozialesicherung.de/de/mutterschaftsgeld/ueberblick/",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "Online beantragen →"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Für PKV-Versicherte & Familienversicherte" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Bürgertelefon Bundesamt" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "0228 619-1888" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Mo-Do 9-15 Uhr, Fr 9-12 Uhr" })
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
            /* @__PURE__ */ jsx("p", { className: "font-medium text-yellow-800", children: "Rechtzeitig beantragen!" }),
            /* @__PURE__ */ jsx("p", { className: "text-yellow-700", children: "Mutterschaftsgeld sollte ca. 7 Wochen vor dem Geburtstermin beantragt werden." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-blue-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📄" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-blue-800", children: "Benötigte Unterlagen" }),
            /* @__PURE__ */ jsx("p", { className: "text-blue-700", children: "Ärztliche Bescheinigung über den voraussichtlichen Entbindungstermin, nach der Geburt: Geburtsurkunde." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-green-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "💼" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-green-800", children: "Arbeitgeberzuschuss automatisch" }),
            /* @__PURE__ */ jsx("p", { className: "text-green-700", children: "Der Arbeitgeber zahlt den Zuschuss automatisch mit der Gehaltsabrechnung – kein Extra-Antrag nötig." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-purple-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🛡️" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-purple-800", children: "Kündigungsschutz" }),
            /* @__PURE__ */ jsx("p", { className: "text-purple-700", children: "Während der Schwangerschaft und bis 4 Monate nach der Entbindung besteht besonderer Kündigungsschutz." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-orange-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "⏰" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-orange-800", children: "Vor Geburt freiwillig arbeiten" }),
            /* @__PURE__ */ jsx("p", { className: "text-orange-700", children: "In den 6 Wochen vor der Geburt darfst du auf eigenen Wunsch weiterarbeiten. Das Beschäftigungsverbot nach der Geburt ist jedoch absolut." })
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
            href: "https://www.bmfsfj.de/bmfsfj/themen/familie/familienleistungen/mutterschutz",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BMFSFJ – Mutterschutzgesetz"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bundesamtsozialesicherung.de/de/mutterschaftsgeld/ueberblick/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesamt für Soziale Sicherung – Mutterschaftsgeld"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/muschg_2018/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Mutterschutzgesetz (MuSchG)"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://familienportal.de/familienportal/familienleistungen/mutterschaftsleistungen",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Familienportal – Mutterschaftsleistungen"
          }
        )
      ] })
    ] })
  ] });
}

const $$MutterschutzRechner = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Mutterschutz-Rechner 2026 \u2013 Mutterschaftsgeld & Schutzfristen berechnen", "description": "Mutterschutz-Rechner 2026: Berechne dein Mutterschaftsgeld (max. 13\u20AC/Tag + Arbeitgeberzuschuss) und Schutzfristen (6+8 Wochen). Mit Fr\xFChgeburten-Regelung.", "keywords": "Mutterschutz Rechner, Mutterschaftsgeld berechnen, Mutterschutzfrist, Mutterschaftsgeld 2025, Mutterschaftsgeld 2026, Schutzfrist Geburt, Mutterschaftsgeld H\xF6he, Arbeitgeberzuschuss Mutterschaftsgeld, Mutterschutzgesetz" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen pb-8"> <!-- Header mit Zurück-Button --> <header class="bg-gradient-to-r from-pink-500 to-rose-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-pink-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>
Alle Rechner
</a> <div class="flex items-center gap-3"> <span class="text-4xl">🤰</span> <div> <h1 class="text-2xl font-bold">Mutterschutz-Rechner</h1> <p class="text-pink-100 text-sm">Mutterschaftsgeld & Fristen – Stand 2026</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ${renderComponent($$result2, "MutterschutzRechner", MutterschutzRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/MutterschutzRechner", "client:component-export": "default" })} </div> </main> ` })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/mutterschutz-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/mutterschutz-rechner.astro";
const $$url = "/mutterschutz-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$MutterschutzRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
