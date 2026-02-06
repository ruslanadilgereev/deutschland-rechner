/* empty css                                          */
import { c as createComponent, r as renderComponent, a as renderTemplate, u as unescapeHTML, m as maybeRenderHead } from '../chunks/astro/server_C8dcKtIt.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_NItEEpwo.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const BEITRAG = {
  standard: 18.36,
  // € pro Monat (seit 2024)
  ermaessigt: 6.12,
  // € pro Monat für Ermäßigungsberechtigte
  quartal: 55.08};
const BEFREIUNGSGRUENDE = [
  {
    id: "buergergeld",
    name: "Bürgergeld / Arbeitslosengeld II",
    beschreibung: "Empfänger von Bürgergeld (früher Hartz IV) oder Sozialgeld",
    vollBefreiung: true
  },
  {
    id: "grundsicherung",
    name: "Grundsicherung im Alter / bei Erwerbsminderung",
    beschreibung: "Nach SGB XII (Sozialhilfe)",
    vollBefreiung: true
  },
  {
    id: "bafoeg",
    name: "BAföG / Berufsausbildungsbeihilfe",
    beschreibung: "Studierende mit BAföG oder Azubis mit BAB",
    vollBefreiung: true
  },
  {
    id: "asylbewerber",
    name: "Asylbewerberleistungen",
    beschreibung: "Leistungen nach dem Asylbewerberleistungsgesetz",
    vollBefreiung: true
  },
  {
    id: "hilfe_pflege",
    name: "Hilfe zur Pflege / Blindenhilfe",
    beschreibung: "Nach SGB XII oder Landesblindengeld",
    vollBefreiung: true
  },
  {
    id: "taubblind",
    name: "Taubblinde Menschen",
    beschreibung: "Merkzeichen TBl im Schwerbehindertenausweis",
    vollBefreiung: true
  },
  {
    id: "pflegeheim",
    name: "Vollstationäre Pflege",
    beschreibung: "Personen in Pflegeheimen, die Hilfe zur Pflege erhalten",
    vollBefreiung: true
  },
  {
    id: "sonderfuersorge",
    name: "Sonderfürsorgeberechtigte",
    beschreibung: "Nach § 27e BVG (Kriegsopferfürsorge)",
    vollBefreiung: true
  }
];
function RundfunkbeitragRechner() {
  const [anzahlMonate, setAnzahlMonate] = useState(12);
  const [selectedBefreiung, setSelectedBefreiung] = useState(null);
  const [hatErmaessigung, setHatErmaessigung] = useState(false);
  const [anzahlPersonen, setAnzahlPersonen] = useState(1);
  const [istZweitwohnung, setIstZweitwohnung] = useState(false);
  const [wohnungAngemeldet, setWohnungAngemeldet] = useState(true);
  const ergebnis = useMemo(() => {
    const istBefreit = selectedBefreiung !== null;
    const beitragMonat = istBefreit ? 0 : hatErmaessigung ? BEITRAG.ermaessigt : BEITRAG.standard;
    const beitragQuartal = beitragMonat * 3;
    const beitragJahr = beitragMonat * 12;
    const gesamtBetrag = beitragMonat * anzahlMonate;
    const proPersonMonat = beitragMonat / Math.max(1, anzahlPersonen);
    const proPersonJahr = beitragJahr / Math.max(1, anzahlPersonen);
    const normalerBeitrag = BEITRAG.standard * anzahlMonate;
    const ersparnis = normalerBeitrag - gesamtBetrag;
    const zweitwohnungBefreit = istZweitwohnung && wohnungAngemeldet;
    return {
      istBefreit,
      hatErmaessigung,
      beitragMonat,
      beitragQuartal,
      beitragJahr,
      gesamtBetrag,
      proPersonMonat,
      proPersonJahr,
      ersparnis,
      zweitwohnungBefreit,
      normalerBeitrag,
      anzahlMonate,
      anzahlPersonen
    };
  }, [selectedBefreiung, hatErmaessigung, anzahlMonate, anzahlPersonen, istZweitwohnung, wohnungAngemeldet]);
  const formatEuro = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Zeitraum berechnen" }) }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-2", children: [1, 3, 6, 12].map((monate) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setAnzahlMonate(monate),
            className: `py-3 px-4 rounded-xl text-center transition-all ${anzahlMonate === monate ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: [
              /* @__PURE__ */ jsx("span", { className: "font-bold", children: monate }),
              /* @__PURE__ */ jsx("span", { className: "text-xs block", children: monate === 1 ? "Monat" : "Monate" })
            ]
          },
          monate
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Personen im Haushalt" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Der Beitrag gilt pro Wohnung – nicht pro Person!" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setAnzahlPersonen(Math.max(1, anzahlPersonen - 1)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors",
              children: "−"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "text-center px-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-4xl font-bold text-gray-800", children: anzahlPersonen }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: anzahlPersonen === 1 ? "Person" : "Personen" })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setAnzahlPersonen(Math.min(10, anzahlPersonen + 1)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors",
              children: "+"
            }
          )
        ] }),
        anzahlPersonen > 1 && /* @__PURE__ */ jsx("div", { className: "mt-3 p-3 bg-green-50 rounded-xl text-center", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-green-700", children: [
          /* @__PURE__ */ jsx("strong", { children: "Tipp:" }),
          " Bei ",
          anzahlPersonen,
          " Personen zahlt jeder nur",
          " ",
          /* @__PURE__ */ jsxs("strong", { children: [
            formatEuro(BEITRAG.standard / anzahlPersonen),
            "/Monat"
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Wohnungssituation" }) }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setIstZweitwohnung(!istZweitwohnung),
            className: `w-full py-4 px-6 rounded-xl font-medium transition-all flex items-center justify-between ${istZweitwohnung ? "bg-amber-100 text-amber-800 border-2 border-amber-300" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: [
              /* @__PURE__ */ jsx("span", { children: "🏠 Dies ist meine Zweitwohnung" }),
              /* @__PURE__ */ jsx("span", { className: istZweitwohnung ? "" : "opacity-50", children: istZweitwohnung ? "✓" : "" })
            ]
          }
        ),
        istZweitwohnung && /* @__PURE__ */ jsxs("div", { className: "mt-3 p-4 bg-amber-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-amber-700 mb-3", children: "Für Zweitwohnungen kann eine Befreiung beantragt werden, wenn Sie für Ihre Hauptwohnung bereits Rundfunkbeitrag zahlen." }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setWohnungAngemeldet(!wohnungAngemeldet),
              className: `w-full py-3 px-4 rounded-lg text-sm transition-all ${wohnungAngemeldet ? "bg-green-500 text-white" : "bg-white text-gray-600 border border-gray-200"}`,
              children: wohnungAngemeldet ? "✓ Hauptwohnung ist angemeldet → Befreiung möglich" : "Hauptwohnung ist nicht angemeldet"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Befreiung vom Rundfunkbeitrag" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Wählen Sie, falls ein Befreiungsgrund vorliegt (§ 4 RBStV)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setSelectedBefreiung(null),
              className: `w-full py-3 px-4 rounded-xl text-left transition-all ${selectedBefreiung === null && !hatErmaessigung ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Kein Befreiungsgrund" }),
                /* @__PURE__ */ jsxs("span", { className: "text-sm block opacity-80", children: [
                  "Voller Beitrag: ",
                  formatEuro(BEITRAG.standard),
                  "/Monat"
                ] })
              ]
            }
          ),
          BEFREIUNGSGRUENDE.map((grund) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => {
                setSelectedBefreiung(selectedBefreiung === grund.id ? null : grund.id);
                if (selectedBefreiung !== grund.id) setHatErmaessigung(false);
              },
              className: `w-full py-3 px-4 rounded-xl text-left transition-all ${selectedBefreiung === grund.id ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: grund.name }),
                /* @__PURE__ */ jsx("span", { className: "text-sm block opacity-80", children: grund.beschreibung })
              ]
            },
            grund.id
          ))
        ] })
      ] }),
      selectedBefreiung === null && /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Ermäßigung (RF-Merkzeichen)" }) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setHatErmaessigung(!hatErmaessigung),
            className: `w-full py-4 px-6 rounded-xl font-medium transition-all ${hatErmaessigung ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "text-left", children: [
                /* @__PURE__ */ jsx("span", { className: "block", children: "RF-Merkzeichen im Schwerbehindertenausweis" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80 block", children: "Für Blinde, Gehörlose, Schwerbehinderte (GdB 80+)" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-right", children: hatErmaessigung ? /* @__PURE__ */ jsxs("span", { className: "text-lg font-bold", children: [
                formatEuro(BEITRAG.ermaessigt),
                "/Mon."
              ] }) : /* @__PURE__ */ jsxs("span", { className: "text-sm opacity-70", children: [
                "→ ",
                formatEuro(BEITRAG.ermaessigt),
                "/Mon."
              ] }) })
            ] })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: `rounded-2xl shadow-lg p-6 text-white mb-6 ${ergebnis.istBefreit || ergebnis.zweitwohnungBefreit ? "bg-gradient-to-br from-green-500 to-emerald-600" : hatErmaessigung ? "bg-gradient-to-br from-purple-500 to-indigo-600" : "bg-gradient-to-br from-blue-500 to-blue-700"}`, children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: ergebnis.istBefreit ? "✅ Sie sind befreit!" : ergebnis.zweitwohnungBefreit ? "✅ Zweitwohnung befreit!" : hatErmaessigung ? "💜 Ermäßigter Beitrag" : "📺 Ihr Rundfunkbeitrag" }),
      ergebnis.istBefreit || ergebnis.zweitwohnungBefreit ? /* @__PURE__ */ jsxs("div", { className: "py-4", children: [
        /* @__PURE__ */ jsx("div", { className: "text-5xl font-bold mb-2", children: "0,00 €" }),
        /* @__PURE__ */ jsx("p", { className: "opacity-80", children: ergebnis.istBefreit ? `Sie sparen ${formatEuro(ergebnis.normalerBeitrag)} in ${ergebnis.anzahlMonate} Monaten!` : "Für Ihre Zweitwohnung entfällt der Beitrag." }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 p-3 bg-white/20 rounded-xl", children: /* @__PURE__ */ jsx("p", { className: "text-sm", children: "⚠️ Die Befreiung muss beim Beitragsservice beantragt werden. Sie wird nicht automatisch gewährt!" }) })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuro(ergebnis.beitragMonat) }),
            /* @__PURE__ */ jsx("span", { className: "text-xl opacity-80", children: "/ Monat" })
          ] }),
          ergebnis.anzahlMonate > 1 && /* @__PURE__ */ jsxs("p", { className: "opacity-80 mt-2 text-sm", children: [
            /* @__PURE__ */ jsx("strong", { children: formatEuro(ergebnis.gesamtBetrag) }),
            " für ",
            ergebnis.anzahlMonate,
            " Monate"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Pro Quartal" }),
            /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.beitragQuartal) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Pro Jahr" }),
            /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.beitragJahr) })
          ] })
        ] }),
        ergebnis.anzahlPersonen > 1 && /* @__PURE__ */ jsxs("div", { className: "mt-3 p-3 bg-white/10 rounded-xl", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-sm opacity-80", children: [
            "Pro Person (bei ",
            ergebnis.anzahlPersonen,
            " Personen)"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-lg font-bold", children: [
            formatEuro(ergebnis.proPersonMonat),
            "/Monat · ",
            formatEuro(ergebnis.proPersonJahr),
            "/Jahr"
          ] })
        ] }),
        hatErmaessigung && /* @__PURE__ */ jsxs("div", { className: "mt-3 p-3 bg-white/20 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm", children: "💰 Sie sparen durch die Ermäßigung:" }),
          /* @__PURE__ */ jsxs("div", { className: "text-lg font-bold", children: [
            formatEuro(ergebnis.ersparnis),
            " in ",
            ergebnis.anzahlMonate,
            " Monaten"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "💳 Zahlungsübersicht" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Monatlicher Beitrag" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.beitragMonat) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Quartalsbeitrag (3 Monate)" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.beitragQuartal) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Halbjahresbeitrag (6 Monate)" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.beitragMonat * 6) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-blue-50 -mx-6 px-6 rounded-b-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-blue-700", children: "Jahresbeitrag (12 Monate)" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-blue-900", children: formatEuro(ergebnis.beitragJahr) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 p-3 bg-gray-50 rounded-xl", children: /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-600", children: [
        /* @__PURE__ */ jsx("strong", { children: "Zahlungsweise:" }),
        " Der Rundfunkbeitrag wird in der Regel quartalsweise (alle 3 Monate) per Lastschrift eingezogen. Überweisung und Dauerauftrag sind ebenfalls möglich."
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert der Rundfunkbeitrag" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Pro Wohnung:" }),
            " Der Beitrag gilt pro Wohnung – egal wie viele Personen dort leben oder wie viele Geräte vorhanden sind"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Aktueller Beitrag:" }),
            " ",
            formatEuro(BEITRAG.standard),
            " pro Monat (",
            formatEuro(BEITRAG.quartal),
            " pro Quartal) seit Januar 2024"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Anmeldepflicht:" }),
            " Jede Wohnung muss beim Beitragsservice angemeldet sein"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Automatische Erfassung:" }),
            " Der Beitragsservice erhält Meldedaten von den Einwohnermeldeämtern"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Zweitwohnungen:" }),
            " Können auf Antrag befreit werden, wenn die Hauptwohnung angemeldet ist"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Finanziert:" }),
            " ARD, ZDF, Deutschlandradio und Landesmedienanstalten"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-green-50 border border-green-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-green-800 mb-3", children: "✅ Vollständige Befreiung möglich bei:" }),
      /* @__PURE__ */ jsx("ul", { className: "space-y-2 text-sm text-green-700", children: BEFREIUNGSGRUENDE.map((grund) => /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx("span", { children: "•" }),
        /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsxs("strong", { children: [
            grund.name,
            ":"
          ] }),
          " ",
          grund.beschreibung
        ] })
      ] }, grund.id)) }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 p-3 bg-white/50 rounded-xl", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-green-700", children: [
        /* @__PURE__ */ jsx("strong", { children: "💡 Tipp:" }),
        " Die Befreiung gilt auch für alle Mitbewohner in der gleichen Wohnung!"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("h3", { className: "font-bold text-purple-800 mb-3", children: [
        "💜 Ermäßigung auf ",
        formatEuro(BEITRAG.ermaessigt),
        "/Monat bei:"
      ] }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-purple-700", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "RF-Merkzeichen:" }),
            " Blinde, wesentlich Sehbehinderte, Gehörlose"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Schwerbehinderte:" }),
            ' GdB mindestens 80 + Merkzeichen "RF" im Ausweis'
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Sehbehinderte:" }),
            " GdB mindestens 60 für Sehbehinderung allein"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-purple-600", children: "Die Ermäßigung muss mit entsprechendem Nachweis beantragt werden." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-amber-800 mb-3", children: "⚠️ Wichtige Hinweise" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-amber-700", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Anmeldepflicht:" }),
            " Wer eine Wohnung bezieht, muss sich innerhalb eines Monats anmelden"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Bußgeld:" }),
            " Bei Nicht-Anmeldung oder falschen Angaben droht ein Bußgeld bis zu 1.000 €"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Rückwirkend:" }),
            " Der Beitrag kann bis zu 3 Jahre rückwirkend eingefordert werden"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Säumniszuschlag:" }),
            " Bei Zahlungsverzug fallen 1% pro Monat an"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Vollstreckung:" }),
            " Offene Forderungen können zwangsvollstreckt werden (Pfändung, Gerichtsvollzieher)"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörde" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-blue-900", children: "ARD ZDF Deutschlandradio Beitragsservice" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-blue-700 mt-1", children: [
            "Freimersdorfer Weg 6",
            /* @__PURE__ */ jsx("br", {}),
            "50829 Köln"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Online-Portal" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.rundfunkbeitrag.de",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "rundfunkbeitrag.de →"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Service-Telefon" }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "01806 999 555 10" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "(20 ct/Anruf aus dt. Festnetz)" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📝" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Online-Formulare" }),
              /* @__PURE__ */ jsxs("ul", { className: "text-gray-600 mt-1 space-y-1", children: [
                /* @__PURE__ */ jsxs("li", { children: [
                  "• ",
                  /* @__PURE__ */ jsx("a", { href: "https://www.rundfunkbeitrag.de/anmelden", target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 hover:underline", children: "Anmelden" })
                ] }),
                /* @__PURE__ */ jsxs("li", { children: [
                  "• ",
                  /* @__PURE__ */ jsx("a", { href: "https://www.rundfunkbeitrag.de/abmelden", target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 hover:underline", children: "Abmelden" })
                ] }),
                /* @__PURE__ */ jsxs("li", { children: [
                  "• ",
                  /* @__PURE__ */ jsx("a", { href: "https://www.rundfunkbeitrag.de/buergerinnen_und_buerger/formulare/befreiung_oder_ermaessigung_beantragen/index_ger.html", target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 hover:underline", children: "Befreiung beantragen" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📋" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Benötigte Unterlagen" }),
              /* @__PURE__ */ jsxs("ul", { className: "text-gray-600 mt-1 space-y-1", children: [
                /* @__PURE__ */ jsx("li", { children: "• Bescheid über Sozialleistung" }),
                /* @__PURE__ */ jsx("li", { children: "• Schwerbehindertenausweis (RF)" }),
                /* @__PURE__ */ jsx("li", { children: "• Immatrikulationsbescheinigung" })
              ] })
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
            href: "https://www.rundfunkbeitrag.de",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Rundfunkbeitrag.de – Offizielles Portal des Beitragsservice"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/rbstv/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Rundfunkbeitragsstaatsvertrag (RBStV) – Gesetze im Internet"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.ard.de/die-ard/der-rundfunkbeitrag-100",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "ARD – Der Rundfunkbeitrag erklärt"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.verbraucherzentrale.de/wissen/geld-versicherungen/rundfunkbeitrag",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Verbraucherzentrale – Rundfunkbeitrag Ratgeber"
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
const $$RundfunkbeitragRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "Rundfunkbeitrag-Rechner 2025/2026 \u2013 GEZ Kosten & Befreiung pr\xFCfen";
  const description = "GEZ Rechner 2026: Berechnen Sie Ihren Rundfunkbeitrag (18,36\u20AC/Monat). Befreiung bei B\xFCrgergeld, BAf\xF6G pr\xFCfen. Alle Infos zu GEZ Kosten & Erm\xE4\xDFigung!";
  const keywords = "GEZ Rechner, Rundfunkbeitrag Rechner, GEZ Befreiung, Rundfunkbeitrag 2026, GEZ Kosten, Rundfunkbeitrag Befreiung, GEZ 2025, Rundfunkbeitrag H\xF6he, GEZ Erm\xE4\xDFigung, Beitragsservice";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<main class="min-h-screen pb-8"> <!-- Header mit Zur\xFCck-Button --> <header class="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>\nAlle Rechner\n</a> <div class="flex items-center gap-3"> <span class="text-4xl">\u{1F4FA}</span> <div> <h1 class="text-2xl font-bold">Rundfunkbeitrag-Rechner</h1> <p class="text-blue-100 text-sm">GEZ-Beitrag 2025/2026 berechnen</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ', ' </div> <!-- SEO Content Section --> <div class="max-w-2xl mx-auto px-4 mt-8"> <div class="bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">Rundfunkbeitrag 2025/2026: Alles zur GEZ</h2> <div class="prose prose-sm text-gray-600 space-y-4"> <p>\nDer <strong>Rundfunkbeitrag</strong> (fr\xFCher GEZ-Geb\xFChr) ist eine Abgabe, die jeder Haushalt in \n            Deutschland zahlen muss. Mit unserem <strong>Rundfunkbeitrag-Rechner</strong> k\xF6nnen Sie Ihre \n            Kosten berechnen und pr\xFCfen, ob Sie Anspruch auf Befreiung oder Erm\xE4\xDFigung haben.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wie hoch ist der Rundfunkbeitrag 2026?</h3> <p>\nDer aktuelle Rundfunkbeitrag betr\xE4gt:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>18,36 \u20AC pro Monat</strong> (Standard-Beitrag)</li> <li><strong>55,08 \u20AC pro Quartal</strong> (3 Monate)</li> <li><strong>220,32 \u20AC pro Jahr</strong></li> <li><strong>6,12 \u20AC pro Monat</strong> (erm\xE4\xDFigter Beitrag bei RF-Merkzeichen)</li> </ul> <p> <strong>Wichtig:</strong> Der Beitrag gilt pro <em>Wohnung</em>, nicht pro Person! \n            In einer WG oder Familie zahlen alle Bewohner zusammen nur einmal.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">GEZ Befreiung: Wer muss nicht zahlen?</h3> <p>\nEine <strong>vollst\xE4ndige Befreiung</strong> vom Rundfunkbeitrag ist m\xF6glich bei:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>B\xFCrgergeld / ALG II:</strong> Empf\xE4nger von Arbeitslosengeld II oder Sozialgeld</li> <li><strong>Grundsicherung:</strong> Empf\xE4nger von Grundsicherung im Alter oder bei Erwerbsminderung</li> <li><strong>BAf\xF6G / BAB:</strong> Studierende mit BAf\xF6G, Azubis mit Berufsausbildungsbeihilfe</li> <li><strong>Asylbewerber:</strong> Empf\xE4nger von Asylbewerberleistungen</li> <li><strong>Hilfe zur Pflege:</strong> Empf\xE4nger von Blindenhilfe oder Hilfe zur Pflege nach SGB XII</li> <li><strong>Taubblinde Menschen:</strong> Mit Merkzeichen TBl im Schwerbehindertenausweis</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">GEZ Erm\xE4\xDFigung auf 6,12 \u20AC</h3> <p>\nEine <strong>Erm\xE4\xDFigung auf ein Drittel</strong> des Beitrags (6,12 \u20AC/Monat) erhalten:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Blinde und Geh\xF6rlose:</strong> Mit RF-Merkzeichen im Schwerbehindertenausweis</li> <li><strong>Schwerbehinderte:</strong> Mit Grad der Behinderung (GdB) von mindestens 80 und RF-Merkzeichen</li> <li><strong>Sehbehinderte:</strong> Mit GdB von mindestens 60 f\xFCr die Sehbehinderung allein</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Was wird mit dem Rundfunkbeitrag finanziert?</h3> <p>\nDer Rundfunkbeitrag finanziert den \xF6ffentlich-rechtlichen Rundfunk in Deutschland:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>ARD:</strong> Das Erste, Regionalprogramme (WDR, NDR, BR, SWR, etc.), Radiosender</li> <li><strong>ZDF:</strong> ZDF, ZDFneo, ZDFinfo, 3sat (anteilig), arte (anteilig)</li> <li><strong>Deutschlandradio:</strong> Deutschlandfunk, Deutschlandfunk Kultur, Deutschlandfunk Nova</li> <li><strong>Mediatheken:</strong> ARD Mediathek, ZDF Mediathek, Audiotheken</li> <li><strong>Landesmedienanstalten:</strong> Aufsicht \xFCber private Rundfunkanbieter</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Anmeldung und Abmeldung</h3> <p>\nDie <strong>Anmeldepflicht</strong> besteht automatisch bei Bezug einer Wohnung. \n            Der Beitragsservice erh\xE4lt die Meldedaten direkt von den Einwohnermelde\xE4mtern.\n</p> <p>\nEine <strong>Abmeldung</strong> ist nur m\xF6glich bei:\n</p> <ul class="list-disc pl-5 space-y-1"> <li>Aufgabe der Wohnung (Umzug ins Ausland, Tod)</li> <li>Zusammenzug mit einem bereits angemeldeten Beitragszahler</li> <li>\xDCbernahme der Wohnung durch jemand anderen</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Zweitwohnung: Doppelt zahlen?</h3> <p>\nF\xFCr <strong>Zweitwohnungen</strong> kann eine Befreiung beantragt werden, wenn Sie f\xFCr Ihre \n            Hauptwohnung bereits Rundfunkbeitrag zahlen. Auch Ferienwohnungen und Wochenend-Domizile \n            k\xF6nnen so befreit werden. Den Antrag stellen Sie beim Beitragsservice.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Was passiert bei Nicht-Zahlung?</h3> <p>\nDer Rundfunkbeitrag ist eine <strong>\xF6ffentlich-rechtliche Abgabe</strong> und kann \n            nicht einfach verweigert werden. Bei Zahlungsverweigerung drohen:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Mahnungen:</strong> Mit zus\xE4tzlichen Mahngeb\xFChren</li> <li><strong>S\xE4umniszuschlag:</strong> 1% pro angefangenen Monat</li> <li><strong>Vollstreckung:</strong> Durch Gerichtsvollzieher, Kontopf\xE4ndung</li> <li><strong>Bu\xDFgeld:</strong> Bis zu 1.000 \u20AC bei falschen Angaben oder Nicht-Anmeldung</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">H\xE4ufige Fragen zum Rundfunkbeitrag</h3> <p><strong>Muss ich den Rundfunkbeitrag zahlen, wenn ich kein Fernsehen schaue?</strong></p> <p>\nJa, der Beitrag ist ger\xE4teunabh\xE4ngig und gilt f\xFCr jede Wohnung \u2013 unabh\xE4ngig davon, \n            ob und welche Ger\xE4te vorhanden sind.\n</p> <p><strong>Kann ich als Student vom Rundfunkbeitrag befreit werden?</strong></p> <p>\nNur wenn Sie BAf\xF6G erhalten oder in einer Bedarfsgemeinschaft mit einem Befreiten leben. \n            Ohne Sozialleistung m\xFCssen auch Studenten zahlen.\n</p> <p><strong>Wie funktioniert die Befreiung in einer WG?</strong></p> <p>\nIn einer WG muss nur ein Bewohner den Beitrag zahlen. Wenn ein Mitbewohner befreit ist \n            (z.B. durch BAf\xF6G), k\xF6nnen alle anderen Bewohner ebenfalls befreit werden.\n</p> </div> </div> </div> </main>  <script type="application/ld+json">', '<\/script>  <script type="application/ld+json">', "<\/script> "])), maybeRenderHead(), renderComponent($$result2, "RundfunkbeitragRechner", RundfunkbeitragRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/RundfunkbeitragRechner", "client:component-export": "default" }), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Rundfunkbeitrag-Rechner / GEZ-Rechner 2026",
    "description": description,
    "url": "https://deutschland-rechner.vercel.app/rundfunkbeitrag-rechner",
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
        "name": "Wie hoch ist der Rundfunkbeitrag 2026?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Der Rundfunkbeitrag betr\xE4gt 18,36 \u20AC pro Monat (55,08 \u20AC pro Quartal, 220,32 \u20AC pro Jahr). Bei Erm\xE4\xDFigung (RF-Merkzeichen) sind es nur 6,12 \u20AC pro Monat."
        }
      },
      {
        "@type": "Question",
        "name": "Wer kann sich vom Rundfunkbeitrag befreien lassen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Befreit werden k\xF6nnen: Empf\xE4nger von B\xFCrgergeld/ALG II, Grundsicherung, BAf\xF6G, Asylbewerberleistungen, Hilfe zur Pflege, Blindenhilfe sowie taubblinde Menschen. Die Befreiung muss beim Beitragsservice beantragt werden."
        }
      },
      {
        "@type": "Question",
        "name": "Muss jede Person in einer WG Rundfunkbeitrag zahlen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nein, der Rundfunkbeitrag gilt pro Wohnung, nicht pro Person. In einer WG oder Familie zahlen alle Bewohner zusammen nur einmal 18,36 \u20AC/Monat."
        }
      },
      {
        "@type": "Question",
        "name": "Muss ich f\xFCr eine Zweitwohnung extra Rundfunkbeitrag zahlen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Zweitwohnungen k\xF6nnen auf Antrag befreit werden, wenn Sie f\xFCr Ihre Hauptwohnung bereits Rundfunkbeitrag zahlen. Stellen Sie dazu einen Antrag beim Beitragsservice."
        }
      },
      {
        "@type": "Question",
        "name": "Was passiert, wenn ich den Rundfunkbeitrag nicht zahle?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Bei Nicht-Zahlung folgen Mahnungen mit Geb\xFChren, 1% S\xE4umniszuschlag pro Monat und letztlich Vollstreckungsma\xDFnahmen wie Kontopf\xE4ndung. Bu\xDFgelder bis 1.000 \u20AC sind bei falschen Angaben m\xF6glich."
        }
      }
    ]
  }))) })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/rundfunkbeitrag-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/rundfunkbeitrag-rechner.astro";
const $$url = "/rundfunkbeitrag-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$RundfunkbeitragRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
