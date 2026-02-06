/* empty css                                          */
import { c as createComponent, r as renderComponent, a as renderTemplate, u as unescapeHTML, m as maybeRenderHead } from '../chunks/astro/server_C8dcKtIt.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_NItEEpwo.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const MINIJOB = {
  verdienstgrenze: 538,
  // 538 × 12 Monate
  mindestlohn: 12.41};
const AG_ABGABEN = {
  krankenversicherung: 13,
  // Pauschale KV
  rentenversicherung: 15,
  // RV (volle Pauschale)
  pauschsteuer: 2,
  // 2% Pauschsteuer
  unfallversicherung: 1.6,
  // Durchschnitt UV
  umlage_u1: 1.1,
  // Umlage Krankheit
  umlage_u2: 0.24,
  // Umlage Mutterschaft
  insolvenzumlage: 0.06
  // Insolvenzgeldumlage
};
const AN_ABGABEN = {
  rv_eigenanteil: 3.6
  // RV Eigenanteil (wenn RV-pflichtig)
};
function MinijobRechner() {
  const [bruttolohn, setBruttolohn] = useState(538);
  const [steuermodell, setSteuermodell] = useState("pauschal");
  const [rentenversicherungspflicht, setRentenversicherungspflicht] = useState(true);
  const [stundenWoche, setStundenWoche] = useState(10);
  const [istPrivathaushalt, setIstPrivathaushalt] = useState(false);
  const ergebnis = useMemo(() => {
    let agKrankenversicherung = 0;
    let agRentenversicherung = 0;
    let agPauschsteuer = 0;
    let agUnfallversicherung = 0;
    let agUmlagen = 0;
    if (istPrivathaushalt) {
      agKrankenversicherung = bruttolohn * 0.05;
      agRentenversicherung = bruttolohn * 0.05;
      agPauschsteuer = bruttolohn * 0.02;
      agUnfallversicherung = bruttolohn * 0.016;
      agUmlagen = bruttolohn * 0.014;
    } else {
      agKrankenversicherung = bruttolohn * (AG_ABGABEN.krankenversicherung / 100);
      agRentenversicherung = bruttolohn * (AG_ABGABEN.rentenversicherung / 100);
      agPauschsteuer = steuermodell === "pauschal" ? bruttolohn * (AG_ABGABEN.pauschsteuer / 100) : 0;
      agUnfallversicherung = bruttolohn * (AG_ABGABEN.unfallversicherung / 100);
      agUmlagen = bruttolohn * ((AG_ABGABEN.umlage_u1 + AG_ABGABEN.umlage_u2 + AG_ABGABEN.insolvenzumlage) / 100);
    }
    const agGesamtAbgaben = agKrankenversicherung + agRentenversicherung + agPauschsteuer + agUnfallversicherung + agUmlagen;
    const agGesamtkosten = bruttolohn + agGesamtAbgaben;
    const agAbgabenProzent = agGesamtAbgaben / bruttolohn * 100;
    let anRentenversicherung = 0;
    if (rentenversicherungspflicht && !istPrivathaushalt) {
      anRentenversicherung = bruttolohn * (AN_ABGABEN.rv_eigenanteil / 100);
    } else if (rentenversicherungspflicht && istPrivathaushalt) {
      anRentenversicherung = bruttolohn * 0.136;
    }
    const nettolohn = bruttolohn - anRentenversicherung;
    const stundenMonat = stundenWoche * 4.33;
    const stundenlohn = stundenMonat > 0 ? bruttolohn / stundenMonat : 0;
    const istUeberMindestlohn = stundenlohn >= MINIJOB.mindestlohn;
    const ueberschreitetGrenze = bruttolohn > MINIJOB.verdienstgrenze;
    const jahresverdienst = bruttolohn * 12;
    const rentenPunkteJahr = rentenversicherungspflicht ? bruttolohn * 12 / 45358 : 0;
    const rentenProMonat = rentenPunkteJahr * 37.6;
    return {
      // Arbeitgeber
      agKrankenversicherung: Math.round(agKrankenversicherung * 100) / 100,
      agRentenversicherung: Math.round(agRentenversicherung * 100) / 100,
      agPauschsteuer: Math.round(agPauschsteuer * 100) / 100,
      agUnfallversicherung: Math.round(agUnfallversicherung * 100) / 100,
      agUmlagen: Math.round(agUmlagen * 100) / 100,
      agGesamtAbgaben: Math.round(agGesamtAbgaben * 100) / 100,
      agGesamtkosten: Math.round(agGesamtkosten * 100) / 100,
      agAbgabenProzent: Math.round(agAbgabenProzent * 10) / 10,
      // Arbeitnehmer
      bruttolohn,
      anRentenversicherung: Math.round(anRentenversicherung * 100) / 100,
      nettolohn: Math.round(nettolohn * 100) / 100,
      // Stundenlohn
      stundenlohn: Math.round(stundenlohn * 100) / 100,
      stundenMonat: Math.round(stundenMonat * 10) / 10,
      istUeberMindestlohn,
      // Grenze
      ueberschreitetGrenze,
      jahresverdienst,
      verdienstgrenze: MINIJOB.verdienstgrenze,
      // Rente
      rentenPunkteJahr: Math.round(rentenPunkteJahr * 1e3) / 1e3,
      rentenProMonat: Math.round(rentenProMonat * 100) / 100
    };
  }, [bruttolohn, steuermodell, rentenversicherungspflicht, stundenWoche, istPrivathaushalt]);
  const formatEuro = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  const formatProzent = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " %";
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Monatlicher Bruttolohn" }) }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: bruttolohn,
              onChange: (e) => setBruttolohn(Math.max(0, Math.min(1e3, Number(e.target.value)))),
              className: "w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
              min: "0",
              max: "1000",
              step: "10"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl", children: "€" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: bruttolohn,
            onChange: (e) => setBruttolohn(Number(e.target.value)),
            className: "w-full mt-3 accent-blue-500",
            min: "0",
            max: "700",
            step: "10"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "0 €" }),
          /* @__PURE__ */ jsxs("span", { className: bruttolohn <= 538 ? "text-green-500 font-bold" : "text-red-500 font-bold", children: [
            "Grenze: ",
            MINIJOB.verdienstgrenze,
            " €"
          ] }),
          /* @__PURE__ */ jsx("span", { children: "700 €" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Art des Minijobs" }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setIstPrivathaushalt(false),
              className: `p-4 rounded-xl text-center transition-all ${!istPrivathaushalt ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🏢" }),
                /* @__PURE__ */ jsx("div", { className: "font-bold mt-1", children: "Gewerblich" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs mt-1 opacity-80", children: "Firma / Unternehmen" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setIstPrivathaushalt(true),
              className: `p-4 rounded-xl text-center transition-all ${istPrivathaushalt ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🏠" }),
                /* @__PURE__ */ jsx("div", { className: "font-bold mt-1", children: "Privathaushalt" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs mt-1 opacity-80", children: "Haushaltsscheck" })
              ]
            }
          )
        ] })
      ] }),
      !istPrivathaushalt && /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Besteuerung" }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setSteuermodell("pauschal"),
              className: `p-4 rounded-xl text-center transition-all ${steuermodell === "pauschal" ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "📊" }),
                /* @__PURE__ */ jsx("div", { className: "font-bold mt-1", children: "2% Pauschsteuer" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs mt-1 opacity-80", children: "AG zahlt pauschal" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setSteuermodell("lohnsteuer"),
              className: `p-4 rounded-xl text-center transition-all ${steuermodell === "lohnsteuer" ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "📋" }),
                /* @__PURE__ */ jsx("div", { className: "font-bold mt-1", children: "Lohnsteuer" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs mt-1 opacity-80", children: "Nach Steuerklasse" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Rentenversicherung" }) }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setRentenversicherungspflicht(!rentenversicherungspflicht),
            className: `w-full py-4 px-6 rounded-xl font-medium transition-all flex items-center justify-between ${rentenversicherungspflicht ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: [
              /* @__PURE__ */ jsx("span", { children: rentenversicherungspflicht ? "✓ Rentenversicherungspflichtig (Standard)" : "✗ Befreit (auf Antrag)" }),
              /* @__PURE__ */ jsx("span", { className: `text-sm ${rentenversicherungspflicht ? "bg-white/20" : "bg-gray-200"} px-2 py-1 rounded`, children: rentenversicherungspflicht ? `−${formatEuro(ergebnis.anRentenversicherung)}/Monat` : "Voller Brutto" })
            ]
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-2", children: rentenversicherungspflicht ? `Du baust ca. ${ergebnis.rentenPunkteJahr.toFixed(3)} Rentenpunkte pro Jahr auf (≈ ${formatEuro(ergebnis.rentenProMonat)}/Monat Rente)` : "Keine eigenen Rentenpunkte – AG zahlt trotzdem 15% Pauschale an RV" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Arbeitsstunden pro Woche" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setStundenWoche(Math.max(1, stundenWoche - 1)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold",
              children: "−"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 text-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-3xl font-bold text-gray-800", children: stundenWoche }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-500 ml-2", children: "Std/Woche" })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setStundenWoche(Math.min(20, stundenWoche + 1)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold",
              children: "+"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("p", { className: `text-sm mt-2 text-center ${ergebnis.istUeberMindestlohn ? "text-green-600" : "text-red-600"}`, children: [
          "Stundenlohn: ",
          formatEuro(ergebnis.stundenlohn),
          ergebnis.istUeberMindestlohn ? ` ✓ Über Mindestlohn (${MINIJOB.mindestlohn} €)` : ` ⚠️ Unter Mindestlohn!`
        ] })
      ] })
    ] }),
    ergebnis.ueberschreitetGrenze && /* @__PURE__ */ jsx("div", { className: "bg-red-50 border border-red-200 rounded-2xl p-4 mb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "⚠️" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "font-bold text-red-800", children: "Minijob-Grenze überschritten!" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-red-700 mt-1", children: [
          "Mit ",
          formatEuro(bruttolohn),
          " monatlich überschreitest du die 538€-Grenze. Dies ist dann ein ",
          /* @__PURE__ */ jsx("strong", { children: "Midijob" }),
          " mit anderen Abgaben."
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: `rounded-2xl shadow-lg p-6 text-white mb-6 ${ergebnis.ueberschreitetGrenze ? "bg-gradient-to-br from-orange-500 to-red-500" : "bg-gradient-to-br from-green-500 to-emerald-600"}`, children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: "👤 Dein Netto-Verdienst" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuro(ergebnis.nettolohn) }),
          /* @__PURE__ */ jsx("span", { className: "text-xl opacity-80", children: "/ Monat" })
        ] }),
        !rentenversicherungspflicht && /* @__PURE__ */ jsx("span", { className: "inline-block mt-2 bg-white/20 px-2 py-1 rounded text-sm", children: "💰 Brutto = Netto (RV-befreit)" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Pro Jahr" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.nettolohn * 12) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Pro Stunde" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.stundenlohn) })
        ] })
      ] }),
      rentenversicherungspflicht && /* @__PURE__ */ jsx("div", { className: "mt-4 pt-4 border-t border-white/20 text-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
        /* @__PURE__ */ jsx("span", { className: "opacity-80", children: "Dein RV-Beitrag (3,6%)" }),
        /* @__PURE__ */ jsxs("span", { children: [
          "−",
          formatEuro(ergebnis.anRentenversicherung)
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "🏢 Arbeitgeber-Kosten" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Bruttolohn" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(bruttolohn) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide pt-2", children: "Pauschale Abgaben" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-orange-600", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "+ Krankenversicherung (",
            istPrivathaushalt ? "5%" : "13%",
            ")"
          ] }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.agKrankenversicherung) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-orange-600", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "+ Rentenversicherung (",
            istPrivathaushalt ? "5%" : "15%",
            ")"
          ] }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.agRentenversicherung) })
        ] }),
        ergebnis.agPauschsteuer > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-orange-600", children: [
          /* @__PURE__ */ jsx("span", { children: "+ Pauschsteuer (2%)" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.agPauschsteuer) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-orange-600", children: [
          /* @__PURE__ */ jsx("span", { children: "+ Unfallversicherung (~1,6%)" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.agUnfallversicherung) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-orange-600", children: [
          /* @__PURE__ */ jsx("span", { children: "+ Umlagen (U1, U2, Insolvenz)" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.agUmlagen) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-orange-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-orange-700", children: "= Gesamte AG-Abgaben" }),
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-orange-800", children: [
            formatEuro(ergebnis.agGesamtAbgaben),
            " (",
            formatProzent(ergebnis.agAbgabenProzent),
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-3 bg-gray-100 -mx-6 px-6 rounded-b-xl mt-4", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-800", children: "Gesamtkosten AG" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-xl text-gray-900", children: formatEuro(ergebnis.agGesamtkosten) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert der Minijob" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "538€-Grenze:" }),
            " Bis zu 538€ monatlich (6.456€ im Jahr) ohne volle Sozialabgaben"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Für Arbeitnehmer:" }),
            " Keine Sozialabgaben (außer opt. 3,6% RV)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Für Arbeitgeber:" }),
            " Pauschale Abgaben ca. 28-31% des Bruttolohns"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Krankenversicherung:" }),
            " Minijobber bleiben familien- oder anderweitig versichert"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Mehrere Minijobs:" }),
            " Werden zusammengerechnet – max. 538€ gesamt!"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Neben Hauptjob:" }),
            " Ein Minijob zusätzlich zur Hauptbeschäftigung möglich"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-blue-800 mb-3", children: "🏦 Rentenversicherung im Minijob" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm text-blue-700", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          "Seit 2013 sind Minijobber ",
          /* @__PURE__ */ jsx("strong", { children: "automatisch rentenversicherungspflichtig" }),
          ". Du zahlst 3,6% deines Bruttolohns (Eigenanteil), der AG zahlt 15%."
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold mb-2", children: "Vorteile der RV-Pflicht:" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("li", { children: "✓ Volle Rentenanwartschaft (Wartezeit für Altersrente)" }),
            /* @__PURE__ */ jsx("li", { children: "✓ Anspruch auf Erwerbsminderungsrente" }),
            /* @__PURE__ */ jsx("li", { children: "✓ Anspruch auf Reha-Leistungen" }),
            /* @__PURE__ */ jsx("li", { children: "✓ Anrechnung von Kindererziehungszeiten" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Befreiung möglich:" }),
          " Mit einem schriftlichen Antrag an den Arbeitgeber kannst du dich befreien lassen – dann erhältst du den vollen Bruttolohn."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-amber-800 mb-3", children: "⚠️ Wichtige Hinweise" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-amber-700", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Mindestlohn beachten:" }),
            " Seit 2024 gilt 12,41€/Stunde, ab 2025: 12,82€/Stunde"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Verdienstgrenze anpassen:" }),
            " Bei Mindestlohn-Erhöhung steigt auch die 538€-Grenze entsprechend"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Kurzfristige Beschäftigung:" }),
            " Alternativ max. 3 Monate oder 70 Arbeitstage/Jahr ohne Verdienstgrenze"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Meldung bei Minijob-Zentrale:" }),
            " AG muss Minijob bei der Minijob-Zentrale anmelden"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörde" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-blue-900", children: "Minijob-Zentrale" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-700 mt-1", children: "Deutsche Rentenversicherung Knappschaft-Bahn-See" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Website" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.minijob-zentrale.de",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "minijob-zentrale.de →"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Service-Telefon" }),
              /* @__PURE__ */ jsx("a", { href: "tel:03555898033", className: "text-blue-600 hover:underline font-mono", children: "0355 2902-70799" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Mo-Fr 7-17 Uhr" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📋" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Für Arbeitgeber" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "An- und Abmeldung, Beitragsberechnung, Haushaltsscheck-Verfahren" })
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
            href: "https://www.minijob-zentrale.de",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Minijob-Zentrale – Offizielle Informationen"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/sgb_4/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Sozialgesetzbuch IV – Geringfügige Beschäftigung"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bundesregierung.de/breg-de/aktuelles/mindestlohn-2024-2132292",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesregierung – Mindestlohn 2024/2025"
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
const $$MinijobRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "Minijob-Rechner 2025 \u2013 538\u20AC Job Abgaben & Netto berechnen";
  const description = "Minijob Rechner: Berechne Nettolohn, Arbeitgeber-Abgaben & Rentenversicherung f\xFCr 538\u20AC Jobs. Mit Haushaltsscheck & Stundenlohn-Pr\xFCfung.";
  const keywords = "Minijob Rechner, 538 Euro Job, Minijob Abgaben, geringf\xFCgige Besch\xE4ftigung, Minijob Steuern, Minijob Rentenversicherung, 538\u20AC Grenze, Minijob Arbeitgeber Kosten, Haushaltsscheck, Minijob 2025";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<main class="min-h-screen pb-8"> <!-- Header mit Zur\xFCck-Button --> <header class="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-green-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>\nAlle Rechner\n</a> <div class="flex items-center gap-3"> <span class="text-4xl">\u23F0</span> <div> <h1 class="text-2xl font-bold">Minijob-Rechner</h1> <p class="text-green-100 text-sm">538\u20AC-Grenze 2024/2025</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ', ' </div> <!-- SEO Content Section --> <div class="max-w-2xl mx-auto px-4 mt-8"> <div class="bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">Minijob 2025: Alles zur geringf\xFCgigen Besch\xE4ftigung</h2> <div class="prose prose-sm text-gray-600 space-y-4"> <p>\nEin <strong>Minijob</strong> (auch 538-Euro-Job oder geringf\xFCgige Besch\xE4ftigung) ist eine \n            Besch\xE4ftigungsform mit reduzierten Sozialabgaben. Arbeitnehmer zahlen keine Sozialversicherungsbeitr\xE4ge \n            (au\xDFer optional Rentenversicherung), w\xE4hrend der <strong>Arbeitgeber pauschale Abgaben</strong> von \n            etwa 28-31% des Bruttolohns tr\xE4gt.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Die 538\u20AC-Grenze 2024/2025</h3> <p>\nDie Verdienstgrenze f\xFCr Minijobs ist an den <strong>Mindestlohn</strong> gekoppelt. \n            Bei einem Mindestlohn von 12,41\u20AC (2024) ergibt sich die Grenze aus: \n            12,41\u20AC \xD7 10 Stunden \xD7 52 Wochen \xF7 12 Monate = 538,04\u20AC.\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Monatlich:</strong> Maximal 538\u20AC Verdienst</li> <li><strong>J\xE4hrlich:</strong> Maximal 6.456\u20AC (538\u20AC \xD7 12)</li> <li><strong>\xDCberschreitung:</strong> Gelegentlich erlaubt (max. 3 Monate)</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Arbeitgeber-Abgaben im \xDCberblick</h3> <p>\nDer Arbeitgeber zahlt pauschale Abgaben an die <strong>Minijob-Zentrale</strong>:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Krankenversicherung:</strong> 13% Pauschale</li> <li><strong>Rentenversicherung:</strong> 15% Pauschale</li> <li><strong>Pauschsteuer:</strong> 2% (oder individuelle Lohnsteuer)</li> <li><strong>Unfallversicherung:</strong> ca. 1,6%</li> <li><strong>Umlagen:</strong> ca. 1,4% (U1, U2, Insolvenz)</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Rentenversicherung: Pflicht mit Opt-Out</h3> <p>\nSeit 2013 sind Minijobber <strong>rentenversicherungspflichtig</strong>. Du zahlst 3,6% deines \n            Bruttolohns als Eigenanteil, der Arbeitgeber zahlt 15%. Damit erwirbst du volle Rentenanwartschaften.\n</p> <p>\nDu kannst dich <strong>schriftlich befreien lassen</strong> \u2013 dann erh\xE4ltst du den vollen Bruttolohn, \n            verzichtest aber auf eigene Rentenpunkte.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Minijob im Privathaushalt</h3> <p>\nF\xFCr <strong>Haushaltshilfen</strong> (Putzen, Gartenpflege, Betreuung) gilt das vereinfachte \n            Haushaltsscheck-Verfahren mit erm\xE4\xDFigten Pauschalen:\n</p> <ul class="list-disc pl-5 space-y-1"> <li>Krankenversicherung: nur 5%</li> <li>Rentenversicherung: nur 5%</li> <li>Arbeitgeber k\xF6nnen 20% der Kosten von der Steuer absetzen (max. 510\u20AC/Jahr)</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Minijob neben Hauptbesch\xE4ftigung</h3> <p>\nEin Minijob zus\xE4tzlich zur sozialversicherungspflichtigen Hauptbesch\xE4ftigung ist <strong>abgabenfrei</strong>\nf\xFCr den Arbeitnehmer. Erst ab dem zweiten Minijob werden beide Jobs mit dem Hauptjob zusammengerechnet.\n</p> </div> </div> </div> </main>  <script type="application/ld+json">', "<\/script> "])), maybeRenderHead(), renderComponent($$result2, "MinijobRechner", MinijobRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/MinijobRechner", "client:component-export": "default" }), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Minijob-Rechner 2025",
    "description": description,
    "url": "https://deutschland-rechner.vercel.app/minijob-rechner",
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
  }))) })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/minijob-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/minijob-rechner.astro";
const $$url = "/minijob-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$MinijobRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
