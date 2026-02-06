/* empty css                                                    */
import { c as createComponent, a as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_X4Fuu-a1.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_BdQXYkEU.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const KINDERZUSCHLAG_2026 = {
  maxProKind: 292,
  // Maximaler KiZ pro Kind (Stand 2026)
  mindesteinkommenAlleinerziehend: 600,
  // Mindestbrutto Alleinerziehende
  mindesteinkommenPaar: 900,
  // Mindestbrutto Paare
  kindergeld2026: 255
  // Kindergeld pro Kind (Stand 2026)
};
function berechneMindestsicherungsbedarf(anzahlErwachsene, kinderUnter6, kinder6bis13, kinder14bis17, warmmiete, heizkosten) {
  const regelbedarf = {
    alleinstehend: 563,
    paar: 506 * 2,
    kind0bis5: 357,
    kind6bis13: 390,
    kind14bis17: 471
  };
  let bedarf = 0;
  if (anzahlErwachsene === 1) {
    bedarf += regelbedarf.alleinstehend;
  } else {
    bedarf += regelbedarf.paar;
  }
  bedarf += kinderUnter6 * regelbedarf.kind0bis5;
  bedarf += kinder6bis13 * regelbedarf.kind6bis13;
  bedarf += kinder14bis17 * regelbedarf.kind14bis17;
  bedarf += warmmiete + heizkosten;
  return bedarf;
}
function berechneKinderzuschlag(bruttoeinkommen, nettoeinkommen, anzahlErwachsene, kinderUnter6, kinder6bis13, kinder14bis17, warmmiete, heizkosten, unterhalt, wohngeld) {
  const anzahlKinder = kinderUnter6 + kinder6bis13 + kinder14bis17;
  const mindestbrutto = anzahlErwachsene === 1 ? KINDERZUSCHLAG_2026.mindesteinkommenAlleinerziehend : KINDERZUSCHLAG_2026.mindesteinkommenPaar;
  if (bruttoeinkommen < mindestbrutto) {
    return {
      anspruch: false,
      betragProKind: 0,
      gesamtbetrag: 0,
      grundPruefung: "mindestbrutto",
      bedarfHaushalt: 0,
      einkommenBereinigt: 0,
      anzahlKinder,
      mitWohngeld: false,
      hinweis: `Das Bruttoeinkommen liegt unter dem Mindestbetrag von ${mindestbrutto} €. Ggf. besteht Anspruch auf Bürgergeld.`
    };
  }
  if (anzahlKinder === 0) {
    return {
      anspruch: false,
      betragProKind: 0,
      gesamtbetrag: 0,
      grundPruefung: "keinekinder",
      bedarfHaushalt: 0,
      einkommenBereinigt: 0,
      anzahlKinder,
      mitWohngeld: false,
      hinweis: "Kinderzuschlag setzt mindestens ein Kind im Haushalt voraus."
    };
  }
  const bedarfHaushalt = berechneMindestsicherungsbedarf(
    anzahlErwachsene,
    kinderUnter6,
    kinder6bis13,
    kinder14bis17,
    warmmiete,
    heizkosten
  );
  const kindergeldGesamt = anzahlKinder * KINDERZUSCHLAG_2026.kindergeld2026;
  const maxKiZ = anzahlKinder * KINDERZUSCHLAG_2026.maxProKind;
  const verfuegbaresEinkommen = nettoeinkommen + kindergeldGesamt + unterhalt + wohngeld + maxKiZ;
  const einkommenOhneKiZ = nettoeinkommen + kindergeldGesamt + unterhalt + wohngeld;
  if (einkommenOhneKiZ >= bedarfHaushalt) {
    return {
      anspruch: false,
      betragProKind: 0,
      gesamtbetrag: 0,
      grundPruefung: "einkommenzuhoch",
      bedarfHaushalt,
      einkommenBereinigt: einkommenOhneKiZ,
      anzahlKinder,
      mitWohngeld: wohngeld > 0,
      hinweis: "Das Einkommen (inkl. Kindergeld & Wohngeld) deckt bereits den Bedarf. Kein KiZ-Anspruch."
    };
  }
  if (verfuegbaresEinkommen < bedarfHaushalt) {
    return {
      anspruch: false,
      betragProKind: 0,
      gesamtbetrag: 0,
      grundPruefung: "einkommenzuniedrig",
      bedarfHaushalt,
      einkommenBereinigt: einkommenOhneKiZ,
      anzahlKinder,
      mitWohngeld: wohngeld > 0,
      hinweis: "Auch mit maximalem KiZ wird der Bedarf nicht gedeckt. Prüfen Sie den Anspruch auf Bürgergeld."
    };
  }
  const luecke = bedarfHaushalt - einkommenOhneKiZ;
  const tatsaechlicherKiZ = Math.min(luecke, maxKiZ);
  const betragProKind = Math.round(tatsaechlicherKiZ / anzahlKinder);
  return {
    anspruch: true,
    betragProKind: Math.min(betragProKind, KINDERZUSCHLAG_2026.maxProKind),
    gesamtbetrag: Math.round(tatsaechlicherKiZ),
    grundPruefung: "anspruch",
    bedarfHaushalt,
    einkommenBereinigt: einkommenOhneKiZ,
    anzahlKinder,
    mitWohngeld: wohngeld > 0,
    hinweis: wohngeld > 0 ? "Anspruch besteht in Kombination mit Wohngeld (empfohlen!)." : "Prüfen Sie zusätzlich den Wohngeld-Anspruch – oft werden beide Leistungen kombiniert!"
  };
}
function KinderzuschlagRechner() {
  const [bruttoeinkommen, setBruttoeinkommen] = useState(2200);
  const [nettoeinkommen, setNettoeinkommen] = useState(1700);
  const [anzahlErwachsene, setAnzahlErwachsene] = useState(2);
  const [kinderUnter6, setKinderUnter6] = useState(1);
  const [kinder6bis13, setKinder6bis13] = useState(1);
  const [kinder14bis17, setKinder14bis17] = useState(0);
  const [warmmiete, setWarmmiete] = useState(800);
  const [heizkosten, setHeizkosten] = useState(100);
  const [unterhalt, setUnterhalt] = useState(0);
  const [wohngeld, setWohngeld] = useState(0);
  const ergebnis = useMemo(() => {
    return berechneKinderzuschlag(
      bruttoeinkommen,
      nettoeinkommen,
      anzahlErwachsene,
      kinderUnter6,
      kinder6bis13,
      kinder14bis17,
      warmmiete,
      heizkosten,
      unterhalt,
      wohngeld
    );
  }, [bruttoeinkommen, nettoeinkommen, anzahlErwachsene, kinderUnter6, kinder6bis13, kinder14bis17, warmmiete, heizkosten, unterhalt, wohngeld]);
  const formatEuro = (n) => n.toLocaleString("de-DE") + " €";
  const anzahlKinder = kinderUnter6 + kinder6bis13 + kinder14bis17;
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "👨‍👩‍👧 Haushalt" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Anzahl Erwachsene im Haushalt" }) }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-3", children: [1, 2].map((n) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setAnzahlErwachsene(n),
            className: `flex-1 py-3 rounded-xl font-bold text-lg transition-all ${anzahlErwachsene === n ? "bg-green-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: n === 1 ? "Alleinerziehend" : "Paar"
          },
          n
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Kinder nach Altersgruppe" }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-600 mb-1", children: "0-5 Jahre" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setKinderUnter6(Math.max(0, kinderUnter6 - 1)),
                  className: "w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-xl",
                  children: "-"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "w-8 text-center text-xl font-bold", children: kinderUnter6 }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setKinderUnter6(kinderUnter6 + 1),
                  className: "w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-xl",
                  children: "+"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-600 mb-1", children: "6-13 Jahre" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setKinder6bis13(Math.max(0, kinder6bis13 - 1)),
                  className: "w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-xl",
                  children: "-"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "w-8 text-center text-xl font-bold", children: kinder6bis13 }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setKinder6bis13(kinder6bis13 + 1),
                  className: "w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-xl",
                  children: "+"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-gray-600 mb-1", children: "14-17 Jahre" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setKinder14bis17(Math.max(0, kinder14bis17 - 1)),
                  className: "w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-xl",
                  children: "-"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "w-8 text-center text-xl font-bold", children: kinder14bis17 }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setKinder14bis17(kinder14bis17 + 1),
                  className: "w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-xl",
                  children: "+"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 mt-2", children: [
          "Kindergeld 2026: ",
          formatEuro(KINDERZUSCHLAG_2026.kindergeld2026),
          "/Kind → Gesamt: ",
          formatEuro(anzahlKinder * KINDERZUSCHLAG_2026.kindergeld2026)
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "💰 Einkommen" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Bruttoeinkommen (gesamt)" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 ml-2", children: "(alle Erwachsenen zusammen)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: bruttoeinkommen,
              onChange: (e) => setBruttoeinkommen(Math.max(0, Number(e.target.value))),
              className: "w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none",
              min: "0",
              step: "100"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400", children: "€/Monat" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            min: "0",
            max: "5000",
            step: "100",
            value: bruttoeinkommen,
            onChange: (e) => setBruttoeinkommen(Number(e.target.value)),
            className: "w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
          }
        ),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
          "Mindestbrutto: ",
          anzahlErwachsene === 1 ? "600 €" : "900 €",
          " (",
          bruttoeinkommen >= (anzahlErwachsene === 1 ? 600 : 900) ? "✓ erfüllt" : "✗ nicht erfüllt",
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Nettoeinkommen (gesamt)" }) }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: nettoeinkommen,
              onChange: (e) => setNettoeinkommen(Math.max(0, Number(e.target.value))),
              className: "w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none",
              min: "0",
              step: "100"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400", children: "€/Monat" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            min: "0",
            max: "4000",
            step: "100",
            value: nettoeinkommen,
            onChange: (e) => setNettoeinkommen(Number(e.target.value)),
            className: "w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block mb-1 text-sm text-gray-600", children: "Kindesunterhalt" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: unterhalt,
                onChange: (e) => setUnterhalt(Math.max(0, Number(e.target.value))),
                className: "w-full text-lg font-bold text-center py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none",
                min: "0",
                step: "50"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm", children: "€" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block mb-1 text-sm text-gray-600", children: "Wohngeld (falls bekannt)" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: wohngeld,
                onChange: (e) => setWohngeld(Math.max(0, Number(e.target.value))),
                className: "w-full text-lg font-bold text-center py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none",
                min: "0",
                step: "50"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm", children: "€" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "🏠 Wohnkosten" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Warmmiete" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block", children: "(Kaltmiete + Nebenkosten)" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: warmmiete,
                onChange: (e) => setWarmmiete(Math.max(0, Number(e.target.value))),
                className: "w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none",
                min: "0",
                step: "50"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm", children: "€" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Heizkosten" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block", children: "(falls separat)" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: heizkosten,
                onChange: (e) => setHeizkosten(Math.max(0, Number(e.target.value))),
                className: "w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none",
                min: "0",
                step: "25"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm", children: "€" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: `rounded-2xl shadow-lg p-6 mb-6 ${ergebnis.anspruch ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white" : "bg-gradient-to-br from-gray-400 to-gray-500 text-white"}`, children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: ergebnis.anspruch ? "✓ Voraussichtlicher Anspruch" : "✗ Kein Anspruch" }),
      ergebnis.anspruch ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuro(ergebnis.gesamtbetrag) }),
            /* @__PURE__ */ jsx("span", { className: "text-xl opacity-80", children: "/ Monat" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "opacity-80 mt-2", children: [
            "= ",
            formatEuro(ergebnis.betragProKind),
            " × ",
            ergebnis.anzahlKinder,
            " ",
            ergebnis.anzahlKinder === 1 ? "Kind" : "Kinder"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-2", children: [
            /* @__PURE__ */ jsx("span", { className: "opacity-80", children: "+ Kindergeld" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold", children: formatEuro(ergebnis.anzahlKinder * KINDERZUSCHLAG_2026.kindergeld2026) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center pt-2 border-t border-white/20", children: [
            /* @__PURE__ */ jsx("span", { className: "opacity-80", children: "Gesamte Familienleistung" }),
            /* @__PURE__ */ jsx("span", { className: "text-xl font-bold", children: formatEuro(ergebnis.gesamtbetrag + ergebnis.anzahlKinder * KINDERZUSCHLAG_2026.kindergeld2026) })
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsx("div", { className: "text-lg opacity-90", children: /* @__PURE__ */ jsx("p", { children: ergebnis.hinweis }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Bedarfsberechnung" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Berechneter Bedarf (Existenzminimum)" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.bedarfHaushalt) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Verfügbares Einkommen (ohne KiZ)" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.einkommenBereinigt) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 bg-blue-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-blue-700", children: "Lücke (= max. KiZ-Anspruch)" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-blue-900", children: formatEuro(Math.max(0, ergebnis.bedarfHaushalt - ergebnis.einkommenBereinigt)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 bg-green-50 rounded-xl", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-green-700", children: [
            "Max. KiZ möglich (",
            anzahlKinder,
            " × ",
            formatEuro(KINDERZUSCHLAG_2026.maxProKind),
            ")"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-green-900", children: formatEuro(anzahlKinder * KINDERZUSCHLAG_2026.maxProKind) })
        ] })
      ] }),
      ergebnis.hinweis && /* @__PURE__ */ jsx("div", { className: "mt-4 p-3 bg-yellow-50 rounded-xl text-sm", children: /* @__PURE__ */ jsxs("p", { className: "text-yellow-800", children: [
        /* @__PURE__ */ jsx("strong", { children: "💡 Hinweis:" }),
        " ",
        ergebnis.hinweis
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert der Kinderzuschlag" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Bis zu 292 € pro Kind" }),
            " zusätzlich zum Kindergeld"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Mindestbrutto:" }),
            " 600 € (Alleinerziehende) / 900 € (Paare)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Ziel:" }),
            " Vermeidung von Bürgergeld-Bezug für erwerbstätige Familien"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Kombination mit Wohngeld" }),
            " ist möglich und empfohlen!"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Bildungs- und Teilhabepaket" }),
            " automatisch inklusive (Schulbedarf, Mittagessen etc.)"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörde" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-green-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-green-900", children: "Familienkasse der Bundesagentur für Arbeit" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-green-700 mt-1", children: "Dort, wo auch das Kindergeld beantragt wird." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Online beantragen" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.arbeitsagentur.de/familie-und-kinder/kinderzuschlag-beantragen",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "Kinderzuschlag Digital →"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Familienkasse-Hotline" }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "0800 4 555530 (kostenlos)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🧮" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "KiZ-Lotse" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.arbeitsagentur.de/familie-und-kinder/kiz-lotse",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "Anspruchsprüfung →"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📄" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Antrag (PDF)" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.arbeitsagentur.de/datei/antrag-auf-kinderzuschlag_ba015380.pdf",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "KiZ-Antrag Download →"
                }
              )
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
            /* @__PURE__ */ jsx("p", { className: "font-medium text-yellow-800", children: "Rückwirkend nur 6 Monate!" }),
            /* @__PURE__ */ jsx("p", { className: "text-yellow-700", children: "Kinderzuschlag wird max. 6 Monate rückwirkend gezahlt. Frühzeitig beantragen!" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-blue-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📄" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-blue-800", children: "Benötigte Unterlagen" }),
            /* @__PURE__ */ jsx("p", { className: "text-blue-700", children: "Einkommensnachweise, Mietvertrag, Kontoauszüge, Kindergeldbescheid." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-purple-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🎓" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-purple-800", children: "Bildungs- und Teilhabepaket (BuT)" }),
            /* @__PURE__ */ jsx("p", { className: "text-purple-700", children: "Mit KiZ-Bezug haben Sie automatisch Anspruch auf: Schulbedarf (195 €/Jahr), Mittagessen, Klassenfahrten, Lernförderung, Sportverein/Musikschule (15 €/Monat)." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-green-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "💰" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-green-800", children: "Kombination mit Wohngeld" }),
            /* @__PURE__ */ jsx("p", { className: "text-green-700", children: "In den meisten Fällen wird KiZ zusammen mit Wohngeld bezogen. Diese Kombination kann Bürgergeld vollständig ersetzen – ohne Vermögensprüfung!" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-orange-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📅" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-orange-800", children: "Bewilligungszeitraum" }),
            /* @__PURE__ */ jsx("p", { className: "text-orange-700", children: "Der Kinderzuschlag wird für 6 Monate bewilligt. Danach muss ein Folgeantrag gestellt werden." })
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
            href: "https://www.arbeitsagentur.de/familie-und-kinder/kinderzuschlag",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesagentur für Arbeit – Kinderzuschlag"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://familienportal.de/familienportal/familienleistungen/kinderzuschlag",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Familienportal – Kinderzuschlag"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bmas.de/DE/Soziales/Familie-und-Kinder/Familienleistungen/Kinderzuschlag/kinderzuschlag.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BMAS – Kinderzuschlag"
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
const $$KinderzuschlagRechner = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Kinderzuschlag-Rechner 2026 \u2013 Bis zu 292\u20AC pro Kind berechnen | KiZ Rechner", "description": "Kinderzuschlag-Rechner 2026: Pr\xFCfe deinen KiZ-Anspruch bis 292\u20AC pro Kind. Mit Einkommensberechnung, Bedarfspr\xFCfung & Online-Antrag. Kostenlos & aktuell.", "keywords": "Kinderzuschlag Rechner, KiZ Rechner, Kinderzuschlag berechnen, Kinderzuschlag 2026, Kinderzuschlag H\xF6he, Kinderzuschlag Antrag, Kinderzuschlag Anspruch" }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<main class="min-h-screen pb-8"> <!-- Header mit Zur\xFCck-Button --> <header class="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-green-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>\nAlle Rechner\n</a> <div class="flex items-center gap-3"> <span class="text-4xl">\u{1F4B6}</span> <div> <h1 class="text-2xl font-bold">Kinderzuschlag-Rechner</h1> <p class="text-green-100 text-sm">Bis zu 292 \u20AC pro Kind \u2013 Stand 2026</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ', ' </div> <!-- SEO Content --> <div class="max-w-2xl mx-auto px-4 py-6"> <section class="bg-white rounded-2xl shadow-lg p-6 mb-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">Was ist der Kinderzuschlag (KiZ)?</h2> <p class="text-gray-600 mb-4">\nDer <strong>Kinderzuschlag</strong> ist eine zus\xE4tzliche Familienleistung f\xFCr erwerbst\xE4tige Eltern, \n          deren Einkommen zwar f\xFCr den eigenen Lebensunterhalt reicht, aber nicht f\xFCr den der Kinder. \n          Mit dem KiZ soll verhindert werden, dass Familien auf B\xFCrgergeld angewiesen sind.\n</p> <p class="text-gray-600">\n2026 betr\xE4gt der <strong>maximale Kinderzuschlag 292 \u20AC pro Kind und Monat</strong>. \n          In Kombination mit Kindergeld (255 \u20AC) erhalten Familien so bis zu <strong>547 \u20AC pro Kind</strong>.\n</p> </section> <section class="bg-white rounded-2xl shadow-lg p-6 mb-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">Wer hat Anspruch auf Kinderzuschlag?</h2> <ul class="space-y-2 text-gray-600"> <li class="flex gap-2"> <span class="text-green-500">\u2713</span> <span>Eltern mit Kindern unter 25 Jahren im Haushalt</span> </li> <li class="flex gap-2"> <span class="text-green-500">\u2713</span> <span>Mindestbruttoeinkommen: 900 \u20AC (Paare) bzw. 600 \u20AC (Alleinerziehende)</span> </li> <li class="flex gap-2"> <span class="text-green-500">\u2713</span> <span>Mit KiZ + Wohngeld muss der Bedarf gedeckt werden k\xF6nnen</span> </li> <li class="flex gap-2"> <span class="text-green-500">\u2713</span> <span>Kein Anspruch auf B\xFCrgergeld oder SGB II-Leistungen</span> </li> </ul> </section> <section class="bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">H\xE4ufig gestellte Fragen</h2> <div class="space-y-4"> <div> <h3 class="font-semibold text-gray-800">Wie hoch ist der Kinderzuschlag 2026?</h3> <p class="text-gray-600 text-sm">Der maximale Kinderzuschlag betr\xE4gt 292 \u20AC pro Kind und Monat. Der tats\xE4chliche Betrag h\xE4ngt vom Einkommen ab.</p> </div> <div> <h3 class="font-semibold text-gray-800">Wird der Kinderzuschlag auf B\xFCrgergeld angerechnet?</h3> <p class="text-gray-600 text-sm">Wer Kinderzuschlag erh\xE4lt, bekommt kein B\xFCrgergeld. Der KiZ ist eine Alternative zum B\xFCrgergeld f\xFCr erwerbst\xE4tige Familien.</p> </div> <div> <h3 class="font-semibold text-gray-800">Kann ich Kinderzuschlag und Wohngeld gleichzeitig bekommen?</h3> <p class="text-gray-600 text-sm">Ja! Die Kombination aus Kinderzuschlag und Wohngeld ist ausdr\xFCcklich vorgesehen und oft die optimale L\xF6sung.</p> </div> </div> </section> </div> </main>  <script type="application/ld+json">\n    {\n      "@context": "https://schema.org",\n      "@type": "WebApplication",\n      "name": "Kinderzuschlag-Rechner 2026",\n      "description": "Berechne deinen Kinderzuschlag-Anspruch bis zu 292\u20AC pro Kind. Mit Einkommens- und Bedarfspr\xFCfung.",\n      "url": "https://deutschlandrechner.de/kinderzuschlag-rechner",\n      "applicationCategory": "FinanceApplication",\n      "operatingSystem": "Web",\n      "offers": {\n        "@type": "Offer",\n        "price": "0",\n        "priceCurrency": "EUR"\n      }\n    }\n  <\/script> '])), maybeRenderHead(), renderComponent($$result2, "KinderzuschlagRechner", KinderzuschlagRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/KinderzuschlagRechner", "client:component-export": "default" })) })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/kinderzuschlag-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/kinderzuschlag-rechner.astro";
const $$url = "/kinderzuschlag-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$KinderzuschlagRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
