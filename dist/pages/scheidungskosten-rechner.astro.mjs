/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DmT1JwUR.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
export { renderers } from '../renderers.mjs';

const GERICHTSKOSTEN_TABELLE = [
  { bis: 500, gebuehr: 38 },
  { bis: 1e3, gebuehr: 58 },
  { bis: 1500, gebuehr: 78 },
  { bis: 2e3, gebuehr: 98 },
  { bis: 3e3, gebuehr: 119 },
  { bis: 4e3, gebuehr: 140 },
  { bis: 5e3, gebuehr: 161 },
  { bis: 6e3, gebuehr: 182 },
  { bis: 7e3, gebuehr: 203 },
  { bis: 8e3, gebuehr: 224 },
  { bis: 9e3, gebuehr: 245 },
  { bis: 1e4, gebuehr: 266 },
  { bis: 13e3, gebuehr: 295 },
  { bis: 16e3, gebuehr: 324 },
  { bis: 19e3, gebuehr: 353 },
  { bis: 22e3, gebuehr: 382 },
  { bis: 25e3, gebuehr: 411 },
  { bis: 3e4, gebuehr: 449 },
  { bis: 35e3, gebuehr: 487 },
  { bis: 4e4, gebuehr: 525 },
  { bis: 45e3, gebuehr: 563 },
  { bis: 5e4, gebuehr: 601 },
  { bis: 65e3, gebuehr: 733 },
  { bis: 8e4, gebuehr: 865 },
  { bis: 95e3, gebuehr: 997 },
  { bis: 11e4, gebuehr: 1129 },
  { bis: 125e3, gebuehr: 1261 },
  { bis: 14e4, gebuehr: 1393 },
  { bis: 155e3, gebuehr: 1525 },
  { bis: 17e4, gebuehr: 1657 },
  { bis: 185e3, gebuehr: 1789 },
  { bis: 2e5, gebuehr: 1921 },
  { bis: 23e4, gebuehr: 2119 },
  { bis: 26e4, gebuehr: 2317 },
  { bis: 29e4, gebuehr: 2515 },
  { bis: 32e4, gebuehr: 2713 },
  { bis: 35e4, gebuehr: 2911 },
  { bis: 38e4, gebuehr: 3109 },
  { bis: 41e4, gebuehr: 3307 },
  { bis: 44e4, gebuehr: 3505 },
  { bis: 47e4, gebuehr: 3703 },
  { bis: 5e5, gebuehr: 3901 }
];
const RVG_TABELLE = [
  { bis: 500, gebuehr: 49 },
  { bis: 1e3, gebuehr: 88 },
  { bis: 1500, gebuehr: 127 },
  { bis: 2e3, gebuehr: 166 },
  { bis: 3e3, gebuehr: 222 },
  { bis: 4e3, gebuehr: 278 },
  { bis: 5e3, gebuehr: 334 },
  { bis: 6e3, gebuehr: 390 },
  { bis: 7e3, gebuehr: 446 },
  { bis: 8e3, gebuehr: 502 },
  { bis: 9e3, gebuehr: 558 },
  { bis: 1e4, gebuehr: 614 },
  { bis: 13e3, gebuehr: 666 },
  { bis: 16e3, gebuehr: 718 },
  { bis: 19e3, gebuehr: 770 },
  { bis: 22e3, gebuehr: 822 },
  { bis: 25e3, gebuehr: 874 },
  { bis: 3e4, gebuehr: 955 },
  { bis: 35e3, gebuehr: 1036 },
  { bis: 4e4, gebuehr: 1117 },
  { bis: 45e3, gebuehr: 1198 },
  { bis: 5e4, gebuehr: 1279 },
  { bis: 65e3, gebuehr: 1373 },
  { bis: 8e4, gebuehr: 1467 },
  { bis: 95e3, gebuehr: 1561 },
  { bis: 11e4, gebuehr: 1655 },
  { bis: 125e3, gebuehr: 1749 },
  { bis: 14e4, gebuehr: 1843 },
  { bis: 155e3, gebuehr: 1937 },
  { bis: 17e4, gebuehr: 2031 },
  { bis: 185e3, gebuehr: 2125 },
  { bis: 2e5, gebuehr: 2219 },
  { bis: 23e4, gebuehr: 2359 },
  { bis: 26e4, gebuehr: 2499 },
  { bis: 29e4, gebuehr: 2639 },
  { bis: 32e4, gebuehr: 2779 },
  { bis: 35e4, gebuehr: 2919 },
  { bis: 38e4, gebuehr: 3059 },
  { bis: 41e4, gebuehr: 3199 },
  { bis: 44e4, gebuehr: 3339 },
  { bis: 47e4, gebuehr: 3479 },
  { bis: 5e5, gebuehr: 3619 }
];
function getGebuehr(tabelle, wert) {
  for (const stufe of tabelle) {
    if (wert <= stufe.bis) {
      return stufe.gebuehr;
    }
  }
  const letzterEintrag = tabelle[tabelle.length - 1];
  const mehrwert = wert - letzterEintrag.bis;
  const zusatzStufen = Math.ceil(mehrwert / 5e4);
  return letzterEintrag.gebuehr + zusatzStufen * 198;
}
function ScheidungskostenRechner() {
  const [nettoEinkommen1, setNettoEinkommen1] = useState(3e3);
  const [nettoEinkommen2, setNettoEinkommen2] = useState(2e3);
  const [vermoegen, setVermoegen] = useState(0);
  const [versorgungsausgleich, setVersorgungsausgleich] = useState(true);
  const [einvernehmlich, setEinvernehmlich] = useState(true);
  const [mitAnwalt, setMitAnwalt] = useState("einer");
  const basisVerfahrenswert = (nettoEinkommen1 + nettoEinkommen2) * 3;
  const vermoegensFreibetrag = 6e4;
  const vermoegensZuschlag = vermoegen > vermoegensFreibetrag ? (vermoegen - vermoegensFreibetrag) * 0.05 : 0;
  const versorgungsausgleichWert = versorgungsausgleich ? Math.max(1e3, basisVerfahrenswert * 0.1) * 2 : 0;
  const verfahrenswert = Math.max(
    3e3,
    Math.round(basisVerfahrenswert + vermoegensZuschlag + versorgungsausgleichWert)
  );
  const einzelGebuehrGericht = getGebuehr(GERICHTSKOSTEN_TABELLE, verfahrenswert);
  const gerichtskosten = einzelGebuehrGericht * 2;
  const einzelGebuehrRVG = getGebuehr(RVG_TABELLE, verfahrenswert);
  const verfahrensgebuehr = einzelGebuehrRVG * 1.3;
  const terminsgebuehr = einzelGebuehrRVG * 1.2;
  const einigungsgebuehr = einvernehmlich ? einzelGebuehrRVG * 1 : 0;
  const auslagenpauschale = 20;
  const anwaltNettoEiner = verfahrensgebuehr + terminsgebuehr + einigungsgebuehr + auslagenpauschale;
  const mwstEiner = anwaltNettoEiner * 0.19;
  const anwaltskostenEiner = Math.round(anwaltNettoEiner + mwstEiner);
  const anwaltskostenGesamt = mitAnwalt === "beide" ? anwaltskostenEiner * 2 : anwaltskostenEiner;
  const gesamtkosten = gerichtskosten + anwaltskostenGesamt;
  const kostenProPerson = Math.round(gesamtkosten / 2);
  return /* @__PURE__ */ jsxs("div", { className: "max-w-lg mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "💰 Finanzielle Situation" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-gray-700 font-medium mb-2", children: "Nettoeinkommen Partner 1 (€/Monat)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            value: nettoEinkommen1,
            onChange: (e) => setNettoEinkommen1(Math.max(0, parseInt(e.target.value) || 0)),
            className: "w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none text-lg",
            min: "0",
            step: "100"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: nettoEinkommen1,
            onChange: (e) => setNettoEinkommen1(parseInt(e.target.value)),
            min: "0",
            max: "15000",
            step: "100",
            className: "w-full mt-2 accent-purple-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-gray-700 font-medium mb-2", children: "Nettoeinkommen Partner 2 (€/Monat)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            value: nettoEinkommen2,
            onChange: (e) => setNettoEinkommen2(Math.max(0, parseInt(e.target.value) || 0)),
            className: "w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none text-lg",
            min: "0",
            step: "100"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: nettoEinkommen2,
            onChange: (e) => setNettoEinkommen2(parseInt(e.target.value)),
            min: "0",
            max: "15000",
            step: "100",
            className: "w-full mt-2 accent-purple-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-gray-700 font-medium mb-2", children: "Gemeinsames Vermögen (€)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            value: vermoegen,
            onChange: (e) => setVermoegen(Math.max(0, parseInt(e.target.value) || 0)),
            className: "w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none text-lg",
            min: "0",
            step: "10000"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: vermoegen,
            onChange: (e) => setVermoegen(parseInt(e.target.value)),
            min: "0",
            max: "500000",
            step: "10000",
            className: "w-full mt-2 accent-purple-500"
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Immobilien, Ersparnisse, Wertpapiere etc. (Freibetrag: 60.000€)" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "⚙️ Art der Scheidung" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-gray-700 font-medium mb-2", children: "Scheidungsart" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setEinvernehmlich(true),
              className: `px-4 py-3 rounded-xl text-sm font-medium transition-all ${einvernehmlich ? "bg-green-500 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
              children: "✅ Einvernehmlich"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setEinvernehmlich(false),
              className: `px-4 py-3 rounded-xl text-sm font-medium transition-all ${!einvernehmlich ? "bg-red-500 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
              children: "⚔️ Streitig"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-2", children: einvernehmlich ? "Beide sind sich einig → günstiger" : "Streit um Unterhalt, Sorgerecht etc. → teurer" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-gray-700 font-medium mb-2", children: "Anwälte" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setMitAnwalt("einer"),
              className: `px-4 py-3 rounded-xl text-sm font-medium transition-all ${mitAnwalt === "einer" ? "bg-purple-500 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
              children: "👤 Ein Anwalt"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setMitAnwalt("beide"),
              className: `px-4 py-3 rounded-xl text-sm font-medium transition-all ${mitAnwalt === "beide" ? "bg-purple-500 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
              children: "👥 Zwei Anwälte"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-2", children: mitAnwalt === "einer" ? "Bei einvernehmlicher Scheidung reicht oft ein Anwalt" : "Jeder Partner hat eigenen Anwalt" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: versorgungsausgleich,
              onChange: (e) => setVersorgungsausgleich(e.target.checked),
              className: "w-5 h-5 rounded border-2 border-gray-300 text-purple-500 focus:ring-purple-500"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-gray-700", children: "Versorgungsausgleich durchführen" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1 ml-8", children: "Ausgleich der Rentenansprüche (meist erforderlich bei Ehen > 3 Jahre)" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-purple-100 mb-1", children: "Geschätzte Gesamtkosten" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-4xl font-bold", children: gesamtkosten.toLocaleString("de-DE") }),
          /* @__PURE__ */ jsx("span", { className: "text-xl text-purple-200", children: "€" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-purple-200 mt-1", children: [
          "ca. ",
          kostenProPerson.toLocaleString("de-DE"),
          " € pro Person"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-purple-100", children: "Verfahrenswert" }),
          /* @__PURE__ */ jsxs("span", { className: "text-lg font-bold", children: [
            verfahrenswert.toLocaleString("de-DE"),
            " €"
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-purple-100", children: "Gerichtskosten" }),
          /* @__PURE__ */ jsxs("span", { className: "text-lg font-bold", children: [
            gerichtskosten.toLocaleString("de-DE"),
            " €"
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-purple-100", children: [
            "Anwaltskosten (",
            mitAnwalt === "beide" ? "2 Anwälte" : "1 Anwalt",
            ")"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-lg font-bold", children: [
            anwaltskostenGesamt.toLocaleString("de-DE"),
            " €"
          ] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 bg-white rounded-2xl shadow-lg p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "📋 Kostenaufschlüsselung" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-gray-600 mb-2", children: "Verfahrenswert berechnet sich aus:" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between p-2 bg-gray-50 rounded-lg", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "3 × Nettoeinkommen (",
              (nettoEinkommen1 + nettoEinkommen2).toLocaleString("de-DE"),
              " €)"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
              basisVerfahrenswert.toLocaleString("de-DE"),
              " €"
            ] })
          ] }),
          vermoegensZuschlag > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between p-2 bg-gray-50 rounded-lg", children: [
            /* @__PURE__ */ jsx("span", { children: "+ Vermögenszuschlag (5% über Freibetrag)" }),
            /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
              Math.round(vermoegensZuschlag).toLocaleString("de-DE"),
              " €"
            ] })
          ] }),
          versorgungsausgleich && /* @__PURE__ */ jsxs("div", { className: "flex justify-between p-2 bg-gray-50 rounded-lg", children: [
            /* @__PURE__ */ jsx("span", { children: "+ Versorgungsausgleich" }),
            /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
              Math.round(versorgungsausgleichWert).toLocaleString("de-DE"),
              " €"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-gray-600 mb-2", children: "Anwaltskosten (pro Anwalt):" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between p-2 bg-gray-50 rounded-lg", children: [
            /* @__PURE__ */ jsx("span", { children: "Verfahrensgebühr (1,3 ×)" }),
            /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
              Math.round(verfahrensgebuehr).toLocaleString("de-DE"),
              " €"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between p-2 bg-gray-50 rounded-lg", children: [
            /* @__PURE__ */ jsx("span", { children: "Terminsgebühr (1,2 ×)" }),
            /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
              Math.round(terminsgebuehr).toLocaleString("de-DE"),
              " €"
            ] })
          ] }),
          einvernehmlich && /* @__PURE__ */ jsxs("div", { className: "flex justify-between p-2 bg-gray-50 rounded-lg", children: [
            /* @__PURE__ */ jsx("span", { children: "Einigungsgebühr (1,0 ×)" }),
            /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
              Math.round(einigungsgebuehr).toLocaleString("de-DE"),
              " €"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between p-2 bg-gray-50 rounded-lg", children: [
            /* @__PURE__ */ jsx("span", { children: "Auslagenpauschale" }),
            /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
              auslagenpauschale.toLocaleString("de-DE"),
              " €"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between p-2 bg-gray-50 rounded-lg", children: [
            /* @__PURE__ */ jsx("span", { children: "+ 19% MwSt." }),
            /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
              Math.round(mwstEiner).toLocaleString("de-DE"),
              " €"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between p-2 bg-purple-100 rounded-lg font-medium", children: [
            /* @__PURE__ */ jsx("span", { children: "Summe pro Anwalt" }),
            /* @__PURE__ */ jsxs("span", { children: [
              anwaltskostenEiner.toLocaleString("de-DE"),
              " €"
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 bg-green-50 rounded-2xl shadow-lg p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-green-800 mb-3", children: "💡 So sparen Sie Kosten" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm text-green-700", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Einvernehmliche Scheidung:" }),
            " Ein gemeinsamer Anwalt spart bis zu 50% der Anwaltskosten"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Trennungsjahr nutzen:" }),
            " Nutzen Sie die Zeit für außergerichtliche Einigungen"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Online-Scheidung:" }),
            " Seriöse Anbieter wickeln vieles per E-Mail ab – spart Zeit und Geld"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Verfahrenskostenhilfe:" }),
            " Bei niedrigem Einkommen übernimmt der Staat die Kosten"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 bg-white rounded-2xl shadow-lg p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Stellen & Hotlines" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-purple-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-purple-900", children: "Familiengericht" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-purple-700 mt-1", children: "Zuständig ist das Amtsgericht (Familiengericht) am Wohnort eines Ehegatten." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Anwaltssuche" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://anwaltauskunft.de/anwaltssuche",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-purple-600 hover:underline",
                  children: "anwaltauskunft.de →"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Fachanwalt Familienrecht" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "💬" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Rechtsberatung" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.bmjv.de/DE/Themen/GessellsBeratungshilfe/Beratungshilfe_node.html",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-purple-600 hover:underline",
                  children: "Beratungshilfe beantragen →"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Kostenlose Erstberatung" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "💰" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Verfahrenskostenhilfe" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.bmj.de/DE/Service/Formulare/Prozesskostenhilfe/prozesskostenhilfe.html",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-purple-600 hover:underline",
                  children: "VKH-Antrag (Formular) →"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Bei geringem Einkommen" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📋" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Scheidungsantrag" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.justiz.de/service/formular/index.php",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-purple-600 hover:underline",
                  children: "justiz.de Formulare →"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Nur über Anwalt einreichbar" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 bg-white rounded-2xl shadow-lg p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert die Berechnung" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Verfahrenswert:" }),
            " 3 × gemeinsames Nettoeinkommen + Vermögenszuschlag + ggf. Versorgungsausgleich"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Gerichtskosten:" }),
            " Nach GKG (Gerichtskostengesetz) – 2 Gebühren"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Anwaltskosten:" }),
            " Nach RVG (Rechtsanwaltsvergütungsgesetz) – zzgl. 19% MwSt."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Mindestverfahrenswert:" }),
            " 3.000 € (auch bei keinem Einkommen)"
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
            /* @__PURE__ */ jsx("p", { className: "font-medium text-yellow-800", children: "Schätzung – keine Garantie" }),
            /* @__PURE__ */ jsx("p", { className: "text-yellow-700", children: "Die tatsächlichen Kosten können je nach Einzelfall abweichen." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-blue-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "⏱️" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-blue-800", children: "Trennungsjahr erforderlich" }),
            /* @__PURE__ */ jsx("p", { className: "text-blue-700", children: "Vor der Scheidung muss 1 Jahr Trennung nachgewiesen werden (§ 1566 BGB)." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-green-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "⚖️" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-green-800", children: "Anwaltszwang" }),
            /* @__PURE__ */ jsx("p", { className: "text-green-700", children: "Mindestens ein Anwalt ist für den Scheidungsantrag gesetzlich vorgeschrieben." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-purple-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "💑" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-purple-800", children: "Folgekostenabkommen" }),
            /* @__PURE__ */ jsx("p", { className: "text-purple-700", children: "Unterhalt, Zugewinn und Sorgerecht können separate Verfahren und Kosten verursachen." })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 bg-white rounded-2xl shadow-lg p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "✅ Checkliste Scheidung" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-2 bg-gray-50 rounded-lg", children: [
          /* @__PURE__ */ jsx("span", { children: "☐" }),
          /* @__PURE__ */ jsx("span", { children: "Trennungsjahr abwarten (Beginn dokumentieren)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-2 bg-gray-50 rounded-lg", children: [
          /* @__PURE__ */ jsx("span", { children: "☐" }),
          /* @__PURE__ */ jsx("span", { children: "Unterlagen sammeln (Heiratsurkunde, Einkommensnachweise)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-2 bg-gray-50 rounded-lg", children: [
          /* @__PURE__ */ jsx("span", { children: "☐" }),
          /* @__PURE__ */ jsx("span", { children: "Fachanwalt Familienrecht kontaktieren" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-2 bg-gray-50 rounded-lg", children: [
          /* @__PURE__ */ jsx("span", { children: "☐" }),
          /* @__PURE__ */ jsx("span", { children: "Verfahrenskostenhilfe prüfen (bei geringem Einkommen)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-2 bg-gray-50 rounded-lg", children: [
          /* @__PURE__ */ jsx("span", { children: "☐" }),
          /* @__PURE__ */ jsx("span", { children: "Regelung zu Kindern, Unterhalt, Vermögen besprechen" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-2 bg-gray-50 rounded-lg", children: [
          /* @__PURE__ */ jsx("span", { children: "☐" }),
          /* @__PURE__ */ jsx("span", { children: "Versorgungsausgleich klären (Rentenansprüche)" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 p-4 bg-gray-50 rounded-xl", children: [
      /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-gray-500 uppercase mb-2", children: "Quellen" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/gkg_2004/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-purple-600 hover:underline",
            children: "Gerichtskostengesetz (GKG) – Gebührentabelle"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/rvg/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-purple-600 hover:underline",
            children: "Rechtsanwaltsvergütungsgesetz (RVG)"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/famgkg/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-purple-600 hover:underline",
            children: "Familiengerichtskostengesetz (FamGKG)"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bmj.de/DE/Themen/FamilieUndPartnerschaft/Scheidung/Scheidung_node.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-purple-600 hover:underline",
            children: "BMJ – Informationen zur Scheidung"
          }
        )
      ] })
    ] })
  ] });
}

const $$ScheidungskostenRechner = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Scheidungskosten-Rechner 2025 \u2013 Anwalts- & Gerichtskosten berechnen", "description": "Scheidungskosten berechnen: Kostenloser Rechner f\xFCr Anwaltskosten, Gerichtskosten & Verfahrenswert. Einvernehmliche oder streitige Scheidung \u2013 alle Kosten auf einen Blick.", "keywords": "Scheidungskosten Rechner, Scheidung Kosten, Anwaltskosten Scheidung, Gerichtskosten Scheidung, Scheidung wie teuer, Scheidung Kosten berechnen, einvernehmliche Scheidung Kosten, Verfahrenswert Scheidung, Scheidungskosten 2025" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen pb-8"> <!-- Header mit Zurück-Button --> <header class="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>
Alle Rechner
</a> <div class="flex items-center gap-3"> <span class="text-4xl">⚖️</span> <div> <h1 class="text-2xl font-bold">Scheidungskosten-Rechner</h1> <p class="text-purple-100 text-sm">Anwalts- & Gerichtskosten berechnen</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ${renderComponent($$result2, "ScheidungskostenRechner", ScheidungskostenRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/ScheidungskostenRechner", "client:component-export": "default" })} </div> </main> ` })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/scheidungskosten-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/scheidungskosten-rechner.astro";
const $$url = "/scheidungskosten-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$ScheidungskostenRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
