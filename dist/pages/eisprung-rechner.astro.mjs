/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, u as unescapeHTML, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_v22DC8tm.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
function formatDatum(date) {
  return date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}
function formatDatumKurz(date) {
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}
function formatDatumMitWochentag(date) {
  return date.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit"
  });
}
function isSameDay(d1, d2) {
  return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
}
const WOCHENTAGE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const MONATE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
function EisprungRechner() {
  const [letzteRegel, setLetzteRegel] = useState(() => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() - 14);
    return d.toISOString().split("T")[0];
  });
  const [zyklusLaenge, setZyklusLaenge] = useState(28);
  const [lutealPhase, setLutealPhase] = useState(14);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [kalenderMonat, setKalenderMonat] = useState(() => /* @__PURE__ */ new Date());
  const ergebnis = useMemo(() => {
    const lmp = new Date(letzteRegel);
    const heute = /* @__PURE__ */ new Date();
    heute.setHours(0, 0, 0, 0);
    const eisprungTag = zyklusLaenge - lutealPhase;
    const eisprungDatum = addDays(lmp, eisprungTag);
    const fruchtbarStart = addDays(eisprungDatum, -5);
    const fruchtbarEnde = addDays(eisprungDatum, 1);
    const hochfruchtbarStart = addDays(eisprungDatum, -2);
    const naechstePeriode = addDays(lmp, zyklusLaenge);
    const periodeEnde = addDays(lmp, 5);
    const heute2 = /* @__PURE__ */ new Date();
    heute2.setHours(0, 0, 0, 0);
    const lmp2 = new Date(letzteRegel);
    lmp2.setHours(0, 0, 0, 0);
    const msSinceStart = heute2.getTime() - lmp2.getTime();
    const tageSeitStart = Math.floor(msSinceStart / (1e3 * 60 * 60 * 24));
    const zyklusTag = tageSeitStart >= 0 ? tageSeitStart % zyklusLaenge + 1 : 1;
    const tageBisEisprung = Math.ceil((eisprungDatum.getTime() - heute2.getTime()) / (1e3 * 60 * 60 * 24));
    let status;
    let statusText;
    let statusColor;
    if (zyklusTag <= 5) {
      status = "periode";
      statusText = "Periode";
      statusColor = "bg-red-500";
    } else if (zyklusTag > eisprungTag) {
      status = "luteal";
      statusText = "Lutealphase (nach Eisprung)";
      statusColor = "bg-gray-400";
    } else if (zyklusTag === eisprungTag) {
      status = "eisprung";
      statusText = "EISPRUNG HEUTE!";
      statusColor = "bg-pink-600";
    } else if (zyklusTag >= eisprungTag - 2) {
      status = "hochfruchtbar";
      statusText = "Hochfruchtbar";
      statusColor = "bg-green-500";
    } else if (zyklusTag >= eisprungTag - 5) {
      status = "fruchtbar";
      statusText = "Fruchtbar";
      statusColor = "bg-green-400";
    } else {
      status = "unfruchtbar";
      statusText = "Geringere Fruchtbarkeit";
      statusColor = "bg-gray-300";
    }
    let schwangerschaftsChance = 0;
    if (status === "eisprung") schwangerschaftsChance = 25;
    else if (status === "hochfruchtbar") schwangerschaftsChance = 20;
    else if (status === "fruchtbar") schwangerschaftsChance = 10;
    else schwangerschaftsChance = 1;
    const kalender = [];
    for (let zyklus = -1; zyklus <= 2; zyklus++) {
      const zyklusStart = addDays(lmp, zyklus * zyklusLaenge);
      addDays(zyklusStart, eisprungTag);
      for (let tag = 0; tag < zyklusLaenge; tag++) {
        const datum = addDays(zyklusStart, tag);
        let typ = "unfruchtbar";
        if (tag < 5) {
          typ = "periode";
        } else if (tag === eisprungTag) {
          typ = "eisprung";
        } else if (tag >= eisprungTag - 2 && tag < eisprungTag) {
          typ = "hochfruchtbar";
        } else if (tag >= eisprungTag - 5 && tag <= eisprungTag + 1) {
          typ = "fruchtbar";
        }
        kalender.push({ datum, typ, tag: tag + 1 });
      }
    }
    return {
      eisprungDatum,
      fruchtbarStart,
      fruchtbarEnde,
      hochfruchtbarStart,
      naechstePeriode,
      periodeEnde,
      zyklusTag,
      tageBisEisprung,
      status,
      statusText,
      statusColor,
      schwangerschaftsChance,
      kalender,
      eisprungTag
    };
  }, [letzteRegel, zyklusLaenge, lutealPhase]);
  const renderKalender = () => {
    const ersterTag = new Date(kalenderMonat.getFullYear(), kalenderMonat.getMonth(), 1);
    const letzterTag = new Date(kalenderMonat.getFullYear(), kalenderMonat.getMonth() + 1, 0);
    const startWochentag = ersterTag.getDay();
    const heute = /* @__PURE__ */ new Date();
    heute.setHours(0, 0, 0, 0);
    const tage = [];
    for (let i = 0; i < startWochentag; i++) {
      tage.push(null);
    }
    for (let tag = 1; tag <= letzterTag.getDate(); tag++) {
      const datum = new Date(kalenderMonat.getFullYear(), kalenderMonat.getMonth(), tag);
      const kalenderTag = ergebnis.kalender.find((k) => isSameDay(k.datum, datum));
      if (kalenderTag) {
        tage.push(kalenderTag);
      } else {
        tage.push({ datum, typ: "unfruchtbar", tag: 0 });
      }
    }
    return /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setKalenderMonat(new Date(kalenderMonat.getFullYear(), kalenderMonat.getMonth() - 1, 1)),
            className: "p-2 hover:bg-gray-100 rounded-lg transition-colors",
            children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-gray-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) })
          }
        ),
        /* @__PURE__ */ jsxs("h3", { className: "font-bold text-gray-800", children: [
          MONATE[kalenderMonat.getMonth()],
          " ",
          kalenderMonat.getFullYear()
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setKalenderMonat(new Date(kalenderMonat.getFullYear(), kalenderMonat.getMonth() + 1, 1)),
            className: "p-2 hover:bg-gray-100 rounded-lg transition-colors",
            children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-gray-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 gap-1 mb-2", children: WOCHENTAGE.map((tag) => /* @__PURE__ */ jsx("div", { className: "text-center text-xs font-medium text-gray-500 py-1", children: tag }, tag)) }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 gap-1", children: tage.map((tag, idx) => {
        if (!tag) {
          return /* @__PURE__ */ jsx("div", { className: "aspect-square" }, idx);
        }
        const istHeute = isSameDay(tag.datum, heute);
        let bgColor = "bg-gray-50 text-gray-600";
        let border = "";
        switch (tag.typ) {
          case "periode":
            bgColor = "bg-red-100 text-red-700";
            break;
          case "eisprung":
            bgColor = "bg-pink-500 text-white font-bold";
            break;
          case "hochfruchtbar":
            bgColor = "bg-green-400 text-white";
            break;
          case "fruchtbar":
            bgColor = "bg-green-200 text-green-800";
            break;
        }
        if (istHeute) {
          border = "ring-2 ring-blue-500 ring-offset-1";
        }
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: `aspect-square rounded-lg flex flex-col items-center justify-center text-sm ${bgColor} ${border} transition-all`,
            title: `${formatDatumKurz(tag.datum)} - ${tag.typ}`,
            children: [
              /* @__PURE__ */ jsx("span", { children: tag.datum.getDate() }),
              tag.typ === "eisprung" && /* @__PURE__ */ jsx("span", { className: "text-xs", children: "🥚" })
            ]
          },
          idx
        );
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 mt-4 pt-4 border-t text-xs", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx("div", { className: "w-4 h-4 rounded bg-red-100 border border-red-300" }),
          /* @__PURE__ */ jsx("span", { children: "Periode" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx("div", { className: "w-4 h-4 rounded bg-green-200 border border-green-300" }),
          /* @__PURE__ */ jsx("span", { children: "Fruchtbar" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx("div", { className: "w-4 h-4 rounded bg-green-400" }),
          /* @__PURE__ */ jsx("span", { children: "Hochfruchtbar" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx("div", { className: "w-4 h-4 rounded bg-pink-500" }),
          /* @__PURE__ */ jsx("span", { children: "Eisprung" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx("div", { className: "w-4 h-4 rounded bg-gray-50 ring-2 ring-blue-500" }),
          /* @__PURE__ */ jsx("span", { children: "Heute" })
        ] })
      ] })
    ] });
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Erster Tag der letzten Periode" }) }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "date",
            value: letzteRegel,
            onChange: (e) => setLetzteRegel(e.target.value),
            className: "w-full text-xl font-medium py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 outline-none"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Durchschnittliche Zykluslänge" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 ml-2", children: "(21-35 Tage normal)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              min: "21",
              max: "35",
              value: zyklusLaenge,
              onChange: (e) => setZyklusLaenge(Number(e.target.value)),
              className: "flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "text-xl font-bold text-pink-600 w-24 text-center", children: [
            zyklusLaenge,
            " Tage"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1 px-1", children: [
          /* @__PURE__ */ jsx("span", { children: "21" }),
          /* @__PURE__ */ jsx("span", { children: "28" }),
          /* @__PURE__ */ jsx("span", { children: "35" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setShowAdvanced(!showAdvanced),
          className: "text-sm text-pink-600 hover:text-pink-700 flex items-center gap-1",
          children: [
            /* @__PURE__ */ jsx("span", { children: showAdvanced ? "▼" : "▶" }),
            "Erweiterte Einstellungen"
          ]
        }
      ),
      showAdvanced && /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-4 border-t", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Lutealphase" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 ml-2", children: "(Phase nach Eisprung bis Periode)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              min: "10",
              max: "16",
              value: lutealPhase,
              onChange: (e) => setLutealPhase(Number(e.target.value)),
              className: "flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "text-xl font-bold text-pink-600 w-24 text-center", children: [
            lutealPhase,
            " Tage"
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-2", children: "Standard: 14 Tage. Die Lutealphase ist bei den meisten Frauen relativ konstant." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: `rounded-2xl shadow-lg p-6 text-white mb-6 ${ergebnis.statusColor.replace("bg-", "bg-gradient-to-br from-")} to-pink-600`, children: [
      /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-white/80 mb-1", children: "Aktueller Status" }),
      /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold mb-4", children: ergebnis.statusText }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/20 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("div", { className: "text-white/80 text-sm", children: "Zyklustag" }),
          /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold", children: ergebnis.zyklusTag }),
          /* @__PURE__ */ jsxs("div", { className: "text-white/70 text-xs", children: [
            "von ",
            zyklusLaenge
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/20 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("div", { className: "text-white/80 text-sm", children: "Chance auf Schwangerschaft" }),
          /* @__PURE__ */ jsxs("div", { className: "text-3xl font-bold", children: [
            ergebnis.schwangerschaftsChance,
            "%"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-white/70 text-xs", children: "pro Zyklus" })
        ] })
      ] }),
      ergebnis.tageBisEisprung > 0 && ergebnis.tageBisEisprung <= 14 && /* @__PURE__ */ jsxs("div", { className: "mt-4 text-center", children: [
        /* @__PURE__ */ jsx("span", { className: "text-white/80", children: "Noch " }),
        /* @__PURE__ */ jsx("span", { className: "text-3xl font-bold", children: ergebnis.tageBisEisprung }),
        /* @__PURE__ */ jsxs("span", { className: "text-white/80", children: [
          " ",
          ergebnis.tageBisEisprung === 1 ? "Tag" : "Tage",
          " bis zum Eisprung"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📅 Dein Zyklus" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 bg-red-50 rounded-xl", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🩸" }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-700", children: "Letzte Periode" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: formatDatumKurz(new Date(letzteRegel)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 bg-green-50 rounded-xl", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "💚" }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-700", children: "Fruchtbares Fenster" })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "font-medium text-green-700", children: [
            formatDatumKurz(ergebnis.fruchtbarStart),
            " - ",
            formatDatumKurz(ergebnis.fruchtbarEnde)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 bg-pink-100 rounded-xl border-2 border-pink-300", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🥚" }),
            /* @__PURE__ */ jsx("span", { className: "text-pink-800 font-medium", children: "Eisprung" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-pink-700", children: formatDatum(ergebnis.eisprungDatum) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-3 bg-red-50 rounded-xl", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📅" }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-700", children: "Nächste Periode" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-medium text-red-600", children: formatDatum(ergebnis.naechstePeriode) })
        ] })
      ] })
    ] }),
    renderKalender(),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "🌸 Fruchtbare Tage im Detail" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2", children: Array.from({ length: 7 }, (_, i) => {
        const tag = addDays(ergebnis.fruchtbarStart, i);
        const istEisprung = i === 5;
        const istHochfruchtbar = i >= 3 && i <= 5;
        let bgColor = "bg-green-50";
        let label = "Fruchtbar";
        let icon = "💚";
        let chance = "5-10%";
        if (istEisprung) {
          bgColor = "bg-pink-100";
          label = "EISPRUNG";
          icon = "🥚";
          chance = "25-30%";
        } else if (istHochfruchtbar) {
          bgColor = "bg-green-100";
          label = "Hochfruchtbar";
          icon = "💚💚";
          chance = "15-25%";
        }
        if (i === 6) {
          label = "Eizelle stirbt ab";
          icon = "⚪";
          chance = "5%";
          bgColor = "bg-gray-100";
        }
        return /* @__PURE__ */ jsxs("div", { className: `flex items-center justify-between p-3 ${bgColor} rounded-xl`, children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "text-lg", children: icon }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: formatDatumMitWochentag(tag) }),
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600 ml-2", children: label })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-600", children: [
            "~",
            chance
          ] })
        ] }, i);
      }) }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-3 p-3 bg-yellow-50 rounded-xl", children: "⚠️ Die Wahrscheinlichkeiten sind Durchschnittswerte. Die tatsächliche Empfängniswahrscheinlichkeit hängt von vielen Faktoren ab (Alter, Gesundheit, Spermienqualität etc.)." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "💡 Tipps zur Familienplanung" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-green-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-green-800 mb-2", children: "🤰 Bei Kinderwunsch" }),
          /* @__PURE__ */ jsxs("ul", { className: "text-sm text-green-700 space-y-1", children: [
            /* @__PURE__ */ jsx("li", { children: "• Regelmäßiger Sex während des fruchtbaren Fensters (alle 1-2 Tage)" }),
            /* @__PURE__ */ jsx("li", { children: "• Die besten Tage: 2 Tage vor bis zum Eisprung" }),
            /* @__PURE__ */ jsx("li", { children: "• Spermien überleben bis zu 5 Tage – früh starten lohnt sich!" }),
            /* @__PURE__ */ jsx("li", { children: "• Nach 12 Monaten ohne Erfolg: Gynäkologen aufsuchen" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-blue-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-blue-800 mb-2", children: "🛡️ Zur Verhütung (NFP)" }),
          /* @__PURE__ */ jsxs("ul", { className: "text-sm text-blue-700 space-y-1", children: [
            /* @__PURE__ */ jsx("li", { children: "• Kalender-Methode allein ist NICHT sicher zur Verhütung!" }),
            /* @__PURE__ */ jsx("li", { children: "• Für zuverlässige NFP: Kombination mit Temperaturmessung + Zervixschleim" }),
            /* @__PURE__ */ jsx("li", { children: "• Pearl-Index der Kalender-Methode: 9-20 (unsicher)" }),
            /* @__PURE__ */ jsx("li", { children: "• Symptothermale Methode (korrekt angewendet): 0,4-1,8" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "🔍 Zeichen des Eisprungs erkennen" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-pink-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl mb-2", children: "🌡️" }),
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-pink-800", children: "Basaltemperatur" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-pink-700 mt-1", children: "Steigt nach dem Eisprung um 0,2-0,5°C an. Morgens vor dem Aufstehen messen!" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-purple-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl mb-2", children: "💧" }),
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-purple-800", children: "Zervixschleim" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-purple-700 mt-1", children: "Wird glasig, spinnbar wie rohes Eiweiß. Zeigt höchste Fruchtbarkeit an." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-blue-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl mb-2", children: "🎯" }),
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-blue-800", children: "Mittelschmerz" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-700 mt-1", children: "Leichtes Ziehen im Unterleib, oft einseitig. Nicht alle Frauen spüren ihn." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-green-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl mb-2", children: "📊" }),
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-green-800", children: "LH-Tests" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-green-700 mt-1", children: "Ovulationstests zeigen LH-Anstieg 24-36h vor Eisprung. Sehr zuverlässig!" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert die Berechnung" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Eisprung:" }),
            " Findet typischerweise 14 Tage vor der nächsten Periode statt (Lutealphase)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Fruchtbares Fenster:" }),
            " 5 Tage vor bis 1 Tag nach dem Eisprung (Spermien leben bis 5 Tage)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Eizelle:" }),
            " Lebt nur 12-24 Stunden nach dem Eisprung"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Zyklusvariation:" }),
            " Ein regelmäßiger Zyklus macht die Berechnung genauer"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Beratung & Unterstützung" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-pink-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-pink-900", children: "Gynäkologe / Kinderwunschzentrum" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-pink-700 mt-1", children: "Für medizinische Beratung bei Kinderwunsch oder zur Zyklusüberwachung per Ultraschall." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "pro familia" }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Sexualberatung & Familienplanung" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.profamilia.de",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "profamilia.de →"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🏥" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "BZgA Familienplanung" }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Bundeszentrale für gesundheitliche Aufklärung" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.familienplanung.de",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "familienplanung.de →"
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
            /* @__PURE__ */ jsx("p", { className: "font-medium text-yellow-800", children: "Keine Verhütungsmethode!" }),
            /* @__PURE__ */ jsx("p", { className: "text-yellow-700", children: "Dieser Rechner eignet sich NICHT als alleinige Verhütungsmethode. Der Pearl-Index der Kalendermethode liegt bei 9-20 – das bedeutet, 9-20 von 100 Frauen werden pro Jahr schwanger." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-blue-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📊" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-blue-800", children: "Schätzung, kein Fakt" }),
            /* @__PURE__ */ jsx("p", { className: "text-blue-700", children: "Der Eisprung kann von Zyklus zu Zyklus variieren. Stress, Krankheit, Reisen – all das beeinflusst den Zyklus." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-green-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🧪" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-green-800", children: "Genauer mit Ovulationstests" }),
            /* @__PURE__ */ jsx("p", { className: "text-green-700", children: "LH-Tests aus der Apotheke zeigen den Eisprung 24-36 Stunden vorher an. Kombiniert mit Basaltemperatur und Zervixschleim-Beobachtung wird die Vorhersage deutlich genauer." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-purple-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "👩‍⚕️" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-purple-800", children: "Bei Kinderwunsch" }),
            /* @__PURE__ */ jsx("p", { className: "text-purple-700", children: "Nach 12 Monaten regelmäßigem Sex ohne Schwangerschaft (6 Monate ab 35 Jahren): Gynäkologen oder Kinderwunschzentrum aufsuchen." })
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
            href: "https://www.familienplanung.de/verhuetung/verhuetungsmethoden/natuerliche-methoden/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BZgA Familienplanung – Natürliche Methoden"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.frauenaerzte-im-netz.de/familienplanung-verhuetung/natuerliche-familienplanung/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Frauenärzte im Netz – Natürliche Familienplanung"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.profamilia.de/themen/verhuetung",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "pro familia – Verhütung"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.awmf.org/leitlinien/detail/ll/015-015.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "AWMF – Leitlinie Fertilitätsstörungen"
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
const $$EisprungRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "Eisprung-Rechner 2025 \u2013 Fruchtbare Tage & Ovulation berechnen";
  const description = "Eisprung-Rechner: Berechnen Sie Ihre fruchtbaren Tage & den Eisprung kostenlos. Mit Zykluskalender, Kinderwunsch-Tipps & NFP-Infos. Jetzt Eisprung berechnen!";
  const keywords = "Eisprung Rechner, fruchtbare Tage berechnen, Ovulation Rechner, Eisprungkalender, Eisprung berechnen, fruchtbare Tage, Kinderwunsch Rechner, wann bin ich fruchtbar, Ovulationsrechner, Zyklusrechner, NFP, nat\xFCrliche Familienplanung, Eisprung Kalender, fruchtbares Fenster, Befruchtung Zeitpunkt";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<main class="min-h-screen pb-8"> <!-- Header mit Zur\xFCck-Button --> <header class="bg-gradient-to-r from-pink-500 to-rose-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-pink-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>\nAlle Rechner\n</a> <div class="flex items-center gap-3"> <span class="text-4xl">\u{1F338}</span> <div> <h1 class="text-2xl font-bold">Eisprung-Rechner</h1> <p class="text-pink-100 text-sm">Fruchtbare Tage & Ovulation 2025</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ', ' </div> <!-- SEO Content Section --> <div class="max-w-2xl mx-auto px-4 mt-8"> <div class="bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">Eisprung berechnen: Was Sie wissen m\xFCssen</h2> <div class="prose prose-sm text-gray-600 space-y-4"> <p>\nMit unserem <strong>Eisprung-Rechner</strong> k\xF6nnen Sie schnell und einfach Ihre <strong>fruchtbaren Tage</strong>\nberechnen. Ob bei <strong>Kinderwunsch</strong> oder zur Zyklusbeobachtung \u2013 der Eisprungkalender zeigt Ihnen, \n            wann die Chance auf eine Schwangerschaft am h\xF6chsten ist.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Was ist der Eisprung (Ovulation)?</h3> <p>\nDer <strong>Eisprung</strong> (medizinisch: Ovulation) ist der Moment, in dem ein reifes Ei aus dem Eierstock \n            freigesetzt wird. Dies geschieht normalerweise einmal pro Menstruationszyklus und ist der\n<strong>fruchtbarste Zeitpunkt</strong> f\xFCr eine Empf\xE4ngnis.\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Zeitpunkt:</strong> Ca. 14 Tage vor der n\xE4chsten Periode</li> <li><strong>Lebensdauer der Eizelle:</strong> Nur 12-24 Stunden nach dem Eisprung</li> <li><strong>Lebensdauer der Spermien:</strong> Bis zu 5 Tage im weiblichen K\xF6rper</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Das fruchtbare Fenster</h3> <p>\nDas <strong>fruchtbare Fenster</strong> umfasst die Tage, an denen eine Befruchtung m\xF6glich ist. \n            Da Spermien bis zu 5 Tage \xFCberleben k\xF6nnen, beginnt es bereits vor dem Eisprung:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>5 Tage vor Eisprung:</strong> Spermien k\xF6nnen bereits "warten"</li> <li><strong>2 Tage vor Eisprung:</strong> H\xF6chste Fruchtbarkeit (20-25%)</li> <li><strong>Eisprung-Tag:</strong> Sehr hohe Fruchtbarkeit (25-30%)</li> <li><strong>1 Tag nach Eisprung:</strong> Letzte Chance, Eizelle stirbt ab</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Eisprung-Symptome erkennen</h3> <p>\nViele Frauen k\xF6nnen den <strong>Eisprung</strong> anhand k\xF6rperlicher Zeichen erkennen:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Zervixschleim:</strong> Wird klar, dehnbar und eiwei\xDFartig</li> <li><strong>Basaltemperatur:</strong> Steigt nach dem Eisprung um 0,2-0,5\xB0C</li> <li><strong>Mittelschmerz:</strong> Leichtes Ziehen im Unterleib</li> <li><strong>Erh\xF6hte Libido:</strong> Gesteigerte sexuelle Lust</li> <li><strong>Brustspannen:</strong> Bei manchen Frauen</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Tipps bei Kinderwunsch</h3> <p>\nUm die <strong>Chancen auf eine Schwangerschaft</strong> zu erh\xF6hen:\n</p> <ul class="list-disc pl-5 space-y-1"> <li>Regelm\xE4\xDFiger Geschlechtsverkehr im fruchtbaren Fenster (alle 1-2 Tage)</li> <li>Die besten Tage: 2 Tage vor bis zum Eisprung</li> <li>Nicht nur am Eisprung-Tag \u2013 fr\xFCher Sex ist oft besser!</li> <li>Entspannung und Stressabbau unterst\xFCtzen die Fruchtbarkeit</li> <li>Fols\xE4ure bereits vor der Schwangerschaft einnehmen</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Eisprung-Rechner vs. Ovulationstests</h3> <p>\nDer <strong>Eisprung-Rechner</strong> basiert auf Durchschnittswerten und eignet sich f\xFCr eine erste \n            Einsch\xE4tzung. F\xFCr genauere Ergebnisse empfehlen sich:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>LH-Ovulationstests:</strong> Zeigen den LH-Anstieg 24-36h vor Eisprung</li> <li><strong>Basalthermometer:</strong> Temperaturanstieg nach Eisprung</li> <li><strong>Zykluscomputer:</strong> Kombinieren mehrere Methoden</li> <li><strong>Ultraschall:</strong> Beim Gyn\xE4kologen zur Follikelkontrolle</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Nat\xFCrliche Familienplanung (NFP)</h3> <p>\nDie <strong>symptothermale Methode</strong> kombiniert Basaltemperatur, Zervixschleim und Kalender \n            zur nat\xFCrlichen Familienplanung:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Pearl-Index:</strong> 0,4-1,8 bei korrekter Anwendung</li> <li><strong>Lernphase:</strong> Mindestens 3 Zyklen zur Ein\xFCbung empfohlen</li> <li><strong>Apps:</strong> myNFP, Sensiplan oder Ovy unterst\xFCtzen</li> </ul> <p class="text-sm bg-yellow-50 p-3 rounded-lg">\n\u26A0\uFE0F <strong>Wichtig:</strong> Die reine Kalendermethode ist als Verh\xFCtung NICHT sicher (Pearl-Index 9-20)!\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wann zum Arzt?</h3> <p>\nEin Besuch beim <strong>Gyn\xE4kologen oder Kinderwunschzentrum</strong> wird empfohlen:\n</p> <ul class="list-disc pl-5 space-y-1"> <li>Nach 12 Monaten regelm\xE4\xDFigem Sex ohne Schwangerschaft (unter 35 Jahre)</li> <li>Nach 6 Monaten bei Frauen ab 35 Jahren</li> <li>Bei unregelm\xE4\xDFigen Zyklen (unter 21 oder \xFCber 35 Tage)</li> <li>Bei Ausbleiben des Eisprungs (keine Temperaturanstieg)</li> <li>Bei starken Zyklusbeschwerden</li> </ul> </div> </div> </div> </main>  <script type="application/ld+json">', '<\/script>  <script type="application/ld+json">', "<\/script> "])), maybeRenderHead(), renderComponent($$result2, "EisprungRechner", EisprungRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/EisprungRechner", "client:component-export": "default" }), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Eisprung-Rechner 2025",
    "description": description,
    "url": "https://deutschland-rechner.de/eisprung-rechner",
    "applicationCategory": "HealthApplication",
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
        "name": "Wann ist der Eisprung im Zyklus?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Der Eisprung findet typischerweise 14 Tage vor der n\xE4chsten Periode statt. Bei einem 28-Tage-Zyklus w\xE4re das Tag 14, bei einem 30-Tage-Zyklus Tag 16. Die Lutealphase (nach dem Eisprung) ist bei den meisten Frauen relativ konstant."
        }
      },
      {
        "@type": "Question",
        "name": "Wie lange bin ich fruchtbar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Das fruchtbare Fenster umfasst etwa 6 Tage: 5 Tage vor dem Eisprung (Spermien k\xF6nnen so lange \xFCberleben) bis 1 Tag nach dem Eisprung (Eizelle lebt 12-24 Stunden). Die h\xF6chste Fruchtbarkeit besteht 2 Tage vor bis zum Eisprung."
        }
      },
      {
        "@type": "Question",
        "name": "Wie erkenne ich meinen Eisprung?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Typische Eisprung-Symptome sind: Ver\xE4nderung des Zervixschleims (wird klar und spinnbar), leichtes Ziehen im Unterleib (Mittelschmerz), Anstieg der Basaltemperatur am Tag nach dem Eisprung, erh\xF6hte Libido. LH-Ovulationstests zeigen den Eisprung 24-36 Stunden vorher an."
        }
      },
      {
        "@type": "Question",
        "name": "Ist der Eisprung-Rechner zur Verh\xFCtung geeignet?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nein, die reine Kalendermethode ist NICHT als Verh\xFCtung geeignet! Der Pearl-Index liegt bei 9-20, das bedeutet 9-20 von 100 Frauen werden pro Jahr trotzdem schwanger. F\xFCr sichere nat\xFCrliche Familienplanung (NFP) muss die symptothermale Methode mit Temperaturmessung und Zervixschleim-Beobachtung angewendet werden."
        }
      },
      {
        "@type": "Question",
        "name": "Kann ich schwanger werden, wenn ich nicht am Eisprung-Tag Sex habe?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja! Spermien k\xF6nnen bis zu 5 Tage im weiblichen K\xF6rper \xFCberleben und dort auf die Eizelle warten. Die besten Chancen auf eine Schwangerschaft bestehen bei Sex 2 Tage vor bis zum Eisprung. Selbst 5 Tage vor dem Eisprung ist eine Befruchtung m\xF6glich."
        }
      }
    ]
  }))) })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/eisprung-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/eisprung-rechner.astro";
const $$url = "/eisprung-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$EisprungRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
