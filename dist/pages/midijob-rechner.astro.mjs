/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, u as unescapeHTML, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DmT1JwUR.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const MIDIJOB = {
  untergrenze: 556.01,
  // Ab 556,01€ beginnt der Midijob (Minijob-Grenze 556€ + 1 Cent, seit 01.01.2025)
  obergrenze: 2e3,
  // Obergrenze seit 01.01.2023 (erhöht von 1.600€)
  // Beitragssätze 2025
  krankenversicherung: 14.6,
  // Durchschnittlicher Zusatzbeitrag 2025 (erhöht von 1,7%)
  rentenversicherung: 18.6,
  // RV-Beitrag
  arbeitslosenversicherung: 2.6,
  // AV-Beitrag
  pflegeversicherung: 3.4,
  // Basis-PV-Satz
  pvZuschlagKinderlos: 0.6};
function MidijobRechner() {
  const [bruttolohn, setBruttolohn] = useState(1e3);
  const [kinderlos, setKinderlos] = useState(false);
  const [alter, setAlter] = useState(30);
  const [kinderanzahl, setKinderanzahl] = useState(0);
  const [zusatzbeitragKV, setZusatzbeitragKV] = useState(2.5);
  const [kirchensteuer, setKirchensteuer] = useState(false);
  const [bundesland, setBundesland] = useState("west");
  const ergebnis = useMemo(() => {
    const istMidijob = bruttolohn >= MIDIJOB.untergrenze && bruttolohn <= MIDIJOB.obergrenze;
    const istMinijob = bruttolohn <= 556;
    const istVolljob = bruttolohn > MIDIJOB.obergrenze;
    const gesamtBeitragssatz = MIDIJOB.krankenversicherung + zusatzbeitragKV + MIDIJOB.rentenversicherung + MIDIJOB.arbeitslosenversicherung + MIDIJOB.pflegeversicherung;
    const F = 28 / gesamtBeitragssatz;
    const untergrenze = MIDIJOB.untergrenze;
    const obergrenze = MIDIJOB.obergrenze;
    const spanne = obergrenze - untergrenze;
    const faktor2 = obergrenze / spanne - untergrenze * F / spanne;
    let beitragspflichtigeEinnahme = bruttolohn;
    if (istMidijob) {
      beitragspflichtigeEinnahme = F * untergrenze + faktor2 * (bruttolohn - untergrenze);
    }
    const gesamtBeitragAufBBG = beitragspflichtigeEinnahme * (gesamtBeitragssatz / 100);
    const agAnteilKV = bruttolohn * ((MIDIJOB.krankenversicherung + zusatzbeitragKV) / 2 / 100);
    const agAnteilRV = bruttolohn * (MIDIJOB.rentenversicherung / 2 / 100);
    const agAnteilAV = bruttolohn * (MIDIJOB.arbeitslosenversicherung / 2 / 100);
    const agAnteilPV = bruttolohn * (MIDIJOB.pflegeversicherung / 2 / 100);
    const agGesamtAnteil = agAnteilKV + agAnteilRV + agAnteilAV + agAnteilPV;
    let anGesamtAnteil = istMidijob ? gesamtBeitragAufBBG - agGesamtAnteil : 0;
    if (istVolljob) {
      anGesamtAnteil = bruttolohn * (gesamtBeitragssatz / 2 / 100);
    }
    const kvSatz = (MIDIJOB.krankenversicherung + zusatzbeitragKV) / gesamtBeitragssatz;
    const rvSatz = MIDIJOB.rentenversicherung / gesamtBeitragssatz;
    const avSatz = MIDIJOB.arbeitslosenversicherung / gesamtBeitragssatz;
    const pvSatz = MIDIJOB.pflegeversicherung / gesamtBeitragssatz;
    let anKV = anGesamtAnteil * kvSatz;
    let anRV = anGesamtAnteil * rvSatz;
    let anAV = anGesamtAnteil * avSatz;
    let anPV = anGesamtAnteil * pvSatz;
    let pvZuschlag = 0;
    if (kinderlos && alter >= 23) {
      pvZuschlag = bruttolohn * (MIDIJOB.pvZuschlagKinderlos / 100);
    }
    let pvAbschlag = 0;
    if (!kinderlos && kinderanzahl >= 2) {
      const abschlaege = Math.min(kinderanzahl - 1, 4);
      pvAbschlag = bruttolohn * (abschlaege * 0.25 / 100);
    }
    anPV = anPV + pvZuschlag - pvAbschlag;
    if (anPV < 0) anPV = 0;
    const anSozialversicherung = anKV + anRV + anAV + anPV;
    const normalerANAnteil = bruttolohn * (gesamtBeitragssatz / 2 / 100);
    const ersparnis = normalerANAnteil - anSozialversicherung;
    const ersparnisProzent = normalerANAnteil > 0 ? ersparnis / normalerANAnteil * 100 : 0;
    const agKV = bruttolohn * ((MIDIJOB.krankenversicherung + zusatzbeitragKV) / 2 / 100);
    const agRV = bruttolohn * (MIDIJOB.rentenversicherung / 2 / 100);
    const agAV = bruttolohn * (MIDIJOB.arbeitslosenversicherung / 2 / 100);
    const agPV = bruttolohn * (MIDIJOB.pflegeversicherung / 2 / 100);
    const agUmlageU1 = bruttolohn * 0.016;
    const agUmlageU2 = bruttolohn * 6e-3;
    const agInsolvenz = bruttolohn * 15e-4;
    const agUnfall = bruttolohn * 0.016;
    const agSozialversicherung = agKV + agRV + agAV + agPV;
    const agUmlagen = agUmlageU1 + agUmlageU2 + agInsolvenz + agUnfall;
    const agGesamtAbgaben = agSozialversicherung + agUmlagen;
    const agGesamtkosten = bruttolohn + agGesamtAbgaben;
    const nettoVorSteuer = bruttolohn - anSozialversicherung;
    let geschaetzteSteuerlast = 0;
    if (bruttolohn > 1200) {
      geschaetzteSteuerlast = Math.max(0, (bruttolohn - 1200) * 0.14);
    }
    const nettolohn = nettoVorSteuer - geschaetzteSteuerlast;
    const durchschnittsentgelt2025 = 47084;
    const rentenpunkteJahr = bruttolohn * 12 / durchschnittsentgelt2025;
    const rentenwert2025 = 39.32;
    const renteProMonat = rentenpunkteJahr * rentenwert2025;
    return {
      // Status
      istMidijob,
      istMinijob,
      istVolljob,
      // Berechnungsgrundlage
      bruttolohn,
      beitragspflichtigeEinnahme: Math.round(beitragspflichtigeEinnahme * 100) / 100,
      faktorF: Math.round(F * 1e4) / 1e4,
      gesamtBeitragssatz: Math.round(gesamtBeitragssatz * 100) / 100,
      // AN-Anteile
      anKV: Math.round(anKV * 100) / 100,
      anRV: Math.round(anRV * 100) / 100,
      anAV: Math.round(anAV * 100) / 100,
      anPV: Math.round(anPV * 100) / 100,
      pvZuschlag: Math.round(pvZuschlag * 100) / 100,
      pvAbschlag: Math.round(pvAbschlag * 100) / 100,
      anSozialversicherung: Math.round(anSozialversicherung * 100) / 100,
      // AG-Anteile
      agKV: Math.round(agKV * 100) / 100,
      agRV: Math.round(agRV * 100) / 100,
      agAV: Math.round(agAV * 100) / 100,
      agPV: Math.round(agPV * 100) / 100,
      agSozialversicherung: Math.round(agSozialversicherung * 100) / 100,
      agUmlagen: Math.round(agUmlagen * 100) / 100,
      agGesamtAbgaben: Math.round(agGesamtAbgaben * 100) / 100,
      agGesamtkosten: Math.round(agGesamtkosten * 100) / 100,
      // Ersparnis
      normalerANAnteil: Math.round(normalerANAnteil * 100) / 100,
      ersparnis: Math.round(ersparnis * 100) / 100,
      ersparnisProzent: Math.round(ersparnisProzent * 10) / 10,
      // Netto
      nettoVorSteuer: Math.round(nettoVorSteuer * 100) / 100,
      geschaetzteSteuerlast: Math.round(geschaetzteSteuerlast * 100) / 100,
      nettolohn: Math.round(nettolohn * 100) / 100,
      // Rente
      rentenpunkteJahr: Math.round(rentenpunkteJahr * 1e3) / 1e3,
      renteProMonat: Math.round(renteProMonat * 100) / 100
    };
  }, [bruttolohn, kinderlos, alter, kinderanzahl, zusatzbeitragKV]);
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
              onChange: (e) => setBruttolohn(Math.max(0, Math.min(3e3, Number(e.target.value)))),
              className: "w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none",
              min: "0",
              max: "3000",
              step: "50"
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
            className: "w-full mt-3 accent-purple-500",
            min: "500",
            max: "2500",
            step: "50"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "500 €" }),
          /* @__PURE__ */ jsx("span", { className: bruttolohn >= 556.01 && bruttolohn <= 2e3 ? "text-purple-500 font-bold" : "text-gray-500", children: "Übergangsbereich: 556,01 € – 2.000 €" }),
          /* @__PURE__ */ jsx("span", { children: "2.500 €" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        ergebnis.istMinijob && /* @__PURE__ */ jsxs("div", { className: "bg-green-100 border border-green-300 rounded-xl p-4 text-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "⏰" }),
          /* @__PURE__ */ jsx("p", { className: "font-bold text-green-800 mt-1", children: "Das ist ein Minijob" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-green-600", children: "Bis 556 € – nutze den Minijob-Rechner!" })
        ] }),
        ergebnis.istMidijob && /* @__PURE__ */ jsxs("div", { className: "bg-purple-100 border border-purple-300 rounded-xl p-4 text-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "📊" }),
          /* @__PURE__ */ jsx("p", { className: "font-bold text-purple-800 mt-1", children: "Übergangsbereich (Midijob)" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-purple-600", children: "556,01 € – 2.000 € → Reduzierte AN-Beiträge!" })
        ] }),
        ergebnis.istVolljob && /* @__PURE__ */ jsxs("div", { className: "bg-blue-100 border border-blue-300 rounded-xl p-4 text-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "💼" }),
          /* @__PURE__ */ jsx("p", { className: "font-bold text-blue-800 mt-1", children: "Reguläre Beschäftigung" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-600", children: "Über 2.000 € – volle Sozialversicherungspflicht" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Alter" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-400 text-sm ml-2", children: "(für PV-Zuschlag ab 23)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setAlter(Math.max(16, alter - 1)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold",
              children: "−"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 text-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-3xl font-bold text-gray-800", children: alter }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-500 ml-2", children: "Jahre" })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setAlter(Math.min(67, alter + 1)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold",
              children: "+"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Kinder" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-400 text-sm ml-2", children: "(unter 25 Jahren)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 mb-3", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => {
                setKinderlos(true);
                setKinderanzahl(0);
              },
              className: `p-4 rounded-xl text-center transition-all ${kinderlos ? "bg-purple-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🚫" }),
                /* @__PURE__ */ jsx("div", { className: "font-bold mt-1", children: "Kinderlos" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs mt-1 opacity-80", children: "+0,6% PV ab 23" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setKinderlos(false),
              className: `p-4 rounded-xl text-center transition-all ${!kinderlos ? "bg-purple-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "👨‍👩‍👧" }),
                /* @__PURE__ */ jsx("div", { className: "font-bold mt-1", children: "Mit Kindern" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs mt-1 opacity-80", children: "Abschlag ab 2. Kind" })
              ]
            }
          )
        ] }),
        !kinderlos && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 bg-gray-50 p-4 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Anzahl Kinder:" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setKinderanzahl(Math.max(1, kinderanzahl - 1)),
              className: "w-10 h-10 rounded-lg bg-white border hover:bg-gray-100 text-lg font-bold",
              children: "−"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold w-8 text-center", children: kinderanzahl || 1 }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setKinderanzahl(Math.min(6, (kinderanzahl || 1) + 1)),
              className: "w-10 h-10 rounded-lg bg-white border hover:bg-gray-100 text-lg font-bold",
              children: "+"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Zusatzbeitrag Krankenkasse" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-400 text-sm ml-2", children: "(Durchschnitt: 2,5%)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              value: zusatzbeitragKV,
              onChange: (e) => setZusatzbeitragKV(Number(e.target.value)),
              className: "flex-1 accent-purple-500",
              min: "0.5",
              max: "3.5",
              step: "0.1"
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-purple-600 w-16 text-right", children: [
            zusatzbeitragKV.toFixed(1),
            " %"
          ] })
        ] })
      ] })
    ] }),
    ergebnis.istMidijob && /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: "💰 Deine monatliche Ersparnis im Übergangsbereich" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuro(ergebnis.ersparnis) }),
          /* @__PURE__ */ jsx("span", { className: "text-xl opacity-80", children: "weniger Abzüge" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-purple-200 text-sm mt-1", children: [
          "Das sind ",
          formatProzent(ergebnis.ersparnisProzent),
          " weniger als bei normaler Berechnung"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Normal wären" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold line-through opacity-60", children: formatEuro(ergebnis.normalerANAnteil) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Du zahlst nur" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.anSozialversicherung) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-purple-200 mt-4", children: [
        "Jahresersparnis: ",
        /* @__PURE__ */ jsx("strong", { children: formatEuro(ergebnis.ersparnis * 12) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: `rounded-2xl shadow-lg p-6 text-white mb-6 ${ergebnis.istMidijob ? "bg-gradient-to-br from-green-500 to-emerald-600" : ergebnis.istMinijob ? "bg-gradient-to-br from-blue-500 to-cyan-500" : "bg-gradient-to-br from-gray-600 to-gray-700"}`, children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: "👤 Dein geschätztes Netto" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-5xl font-bold", children: [
            "~",
            formatEuro(ergebnis.nettolohn)
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-xl opacity-80", children: "/ Monat" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm opacity-80 mt-1", children: [
          "(ohne Steuer: ",
          formatEuro(ergebnis.nettoVorSteuer),
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm mb-2", children: [
          /* @__PURE__ */ jsx("span", { children: "Bruttolohn" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(bruttolohn) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm mb-2 text-red-200", children: [
          /* @__PURE__ */ jsx("span", { children: "− Sozialversicherung" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "−",
            formatEuro(ergebnis.anSozialversicherung)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm mb-2 text-red-200", children: [
          /* @__PURE__ */ jsx("span", { children: "− Geschätzte Steuern*" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "−",
            formatEuro(ergebnis.geschaetzteSteuerlast)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border-t border-white/20 pt-2 flex justify-between font-bold", children: [
          /* @__PURE__ */ jsx("span", { children: "≈ Netto" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.nettolohn) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs opacity-60 mt-3", children: "* Steuer stark vereinfacht (Steuerklasse 1). Für genaue Berechnung nutze unseren Brutto-Netto-Rechner." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📋 Deine Sozialversicherungsbeiträge (AN)" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        ergebnis.istMidijob && /* @__PURE__ */ jsxs("div", { className: "bg-purple-50 border border-purple-200 rounded-xl p-3 mb-4", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-purple-800 text-xs", children: [
            /* @__PURE__ */ jsx("strong", { children: "Beitragsbemessungsgrundlage:" }),
            " ",
            formatEuro(ergebnis.beitragspflichtigeEinnahme),
            /* @__PURE__ */ jsxs("span", { className: "opacity-70", children: [
              " (statt ",
              formatEuro(bruttolohn),
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-purple-600 text-xs mt-1", children: [
            "Faktor F = ",
            ergebnis.faktorF.toFixed(4),
            " | Gesamtbeitragssatz = ",
            ergebnis.gesamtBeitragssatz,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
            "Krankenversicherung (",
            MIDIJOB.krankenversicherung + zusatzbeitragKV,
            "%)"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-red-600", children: [
            "−",
            formatEuro(ergebnis.anKV)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
            "Rentenversicherung (",
            MIDIJOB.rentenversicherung,
            "%)"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-red-600", children: [
            "−",
            formatEuro(ergebnis.anRV)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
            "Arbeitslosenversicherung (",
            MIDIJOB.arbeitslosenversicherung,
            "%)"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-red-600", children: [
            "−",
            formatEuro(ergebnis.anAV)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600 flex items-center gap-1", children: [
            "Pflegeversicherung (",
            MIDIJOB.pflegeversicherung,
            "%)",
            ergebnis.pvZuschlag > 0 && /* @__PURE__ */ jsxs("span", { className: "text-xs bg-orange-100 px-1 rounded", children: [
              "+",
              MIDIJOB.pvZuschlagKinderlos,
              "%"
            ] }),
            ergebnis.pvAbschlag > 0 && /* @__PURE__ */ jsxs("span", { className: "text-xs bg-green-100 px-1 rounded", children: [
              "−",
              ((kinderanzahl - 1) * 0.25).toFixed(2),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-red-600", children: [
            "−",
            formatEuro(ergebnis.anPV)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-3 bg-red-50 -mx-6 px-6 rounded-b-xl mt-4", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-red-800", children: "Summe Sozialversicherung" }),
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-xl text-red-800", children: [
            "−",
            formatEuro(ergebnis.anSozialversicherung)
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "🏢 Arbeitgeber-Kosten" }),
      /* @__PURE__ */ jsx("div", { className: "bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4", children: /* @__PURE__ */ jsxs("p", { className: "text-amber-800 text-sm", children: [
        /* @__PURE__ */ jsx("strong", { children: "Wichtig:" }),
        " Der AG zahlt im Übergangsbereich den ",
        /* @__PURE__ */ jsx("strong", { children: "vollen" }),
        " AG-Anteil auf das tatsächliche Bruttogehalt – keine Ermäßigung wie beim AN!"
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Bruttolohn" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(bruttolohn) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide pt-2", children: "Sozialversicherung (AG-Anteil)" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-orange-600", children: [
          /* @__PURE__ */ jsx("span", { children: "+ Krankenversicherung" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.agKV) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-orange-600", children: [
          /* @__PURE__ */ jsx("span", { children: "+ Rentenversicherung" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.agRV) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-orange-600", children: [
          /* @__PURE__ */ jsx("span", { children: "+ Arbeitslosenversicherung" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.agAV) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-orange-600", children: [
          /* @__PURE__ */ jsx("span", { children: "+ Pflegeversicherung" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.agPV) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 bg-orange-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-orange-700", children: "= Sozialversicherung AG" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-orange-800", children: formatEuro(ergebnis.agSozialversicherung) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-orange-600", children: [
          /* @__PURE__ */ jsx("span", { children: "+ Umlagen (U1, U2, Insolvenz, UV)" }),
          /* @__PURE__ */ jsx("span", { children: formatEuro(ergebnis.agUmlagen) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-3 bg-gray-100 -mx-6 px-6 rounded-b-xl mt-4", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-800", children: "Gesamtkosten AG" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-xl text-gray-900", children: formatEuro(ergebnis.agGesamtkosten) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-blue-800 mb-3", children: "🏦 Rentenanspruch im Übergangsbereich" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm text-blue-700", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Gute Nachricht:" }),
          " Im Übergangsbereich erwirbst du ",
          /* @__PURE__ */ jsx("strong", { children: "volle Rentenanwartschaften" }),
          "auf Basis deines tatsächlichen Bruttogehalts – obwohl du weniger Beiträge zahlst!"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/50 rounded-xl p-4 grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-blue-600 uppercase", children: "Rentenpunkte/Jahr" }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-blue-900", children: ergebnis.rentenpunkteJahr.toFixed(3) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-blue-600 uppercase", children: "Monatsrente (pro Jahr)" }),
            /* @__PURE__ */ jsxs("p", { className: "text-2xl font-bold text-blue-900", children: [
              "+",
              formatEuro(ergebnis.renteProMonat)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-blue-600", children: [
          "Berechnung: (",
          formatEuro(bruttolohn),
          " × 12) ÷ 47.084€ = ",
          ergebnis.rentenpunkteJahr.toFixed(3),
          " Punkte × 39,32€ Rentenwert"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert der Übergangsbereich" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Wer profitiert:" }),
            " Arbeitnehmer mit Bruttolohn zwischen 603,01€ und 2.000€"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "AN-Beiträge:" }),
            " Auf reduzierter Bemessungsgrundlage – du sparst jeden Monat!"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "AG-Beiträge:" }),
            " Immer auf vollem Bruttolohn – keine Ermäßigung für Arbeitgeber"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Rentenansprüche:" }),
            " Volle Punkte auf tatsächliches Brutto – kein Nachteil!"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Gleitender Übergang:" }),
            " Je höher das Gehalt, desto weniger Ersparnis"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: 'Früher "Gleitzone":' }),
            ' Bis 2019 hieß es "Gleitzone" (450-850€)'
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-amber-800 mb-3", children: "⚠️ Wichtige Hinweise 2025" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-amber-700", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Obergrenze 2.000€:" }),
            " Seit 01.01.2023 (vorher 1.600€, davor 1.300€)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Untergrenze dynamisch:" }),
            " Gekoppelt an Mindestlohn (12,82€/h) → 556,01€ ab 2025"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "PV-Zuschlag:" }),
            " Kinderlose ab 23 Jahren zahlen 0,6% mehr"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Mehrere Jobs:" }),
            " Werden zusammengerechnet für die Beitragsberechnung"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Midijob + Minijob:" }),
            " Ein Minijob bleibt abgabenfrei (für AN)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Kurzfristige Beschäftigung:" }),
            " Fällt NICHT unter Übergangsbereich"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6 overflow-x-auto", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Vergleich: Minijob vs. Midijob vs. Volljob" }),
      /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-200", children: [
          /* @__PURE__ */ jsx("th", { className: "text-left py-3 px-2 font-semibold text-gray-600", children: "Merkmal" }),
          /* @__PURE__ */ jsx("th", { className: "text-center py-3 px-2 font-semibold text-green-600", children: "Minijob" }),
          /* @__PURE__ */ jsx("th", { className: "text-center py-3 px-2 font-semibold text-purple-600", children: "Midijob" }),
          /* @__PURE__ */ jsx("th", { className: "text-center py-3 px-2 font-semibold text-blue-600", children: "Volljob" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { children: [
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("td", { className: "py-3 px-2 text-gray-700", children: "Verdienstgrenze" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-2 text-center", children: "≤ 556 €" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-2 text-center", children: "556,01 – 2.000 €" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-2 text-center", children: "> 2.000 €" })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("td", { className: "py-3 px-2 text-gray-700", children: "AN-Beiträge" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-2 text-center text-green-600", children: "Keine*" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-2 text-center text-purple-600", children: "Reduziert" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-2 text-center text-blue-600", children: "Volle 50%" })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("td", { className: "py-3 px-2 text-gray-700", children: "AG-Beiträge" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-2 text-center", children: "Pauschalen" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-2 text-center", children: "Volle 50%" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-2 text-center", children: "Volle 50%" })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("td", { className: "py-3 px-2 text-gray-700", children: "Krankenversichert" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-2 text-center text-orange-500", children: "Fremd" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-2 text-center text-green-600", children: "Ja ✓" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-2 text-center text-green-600", children: "Ja ✓" })
          ] }),
          /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("td", { className: "py-3 px-2 text-gray-700", children: "Rentenanspruch" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-2 text-center", children: "Minimal*" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-2 text-center text-green-600", children: "Voll ✓" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-2 text-center text-green-600", children: "Voll ✓" })
          ] }),
          /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("td", { className: "py-3 px-2 text-gray-700", children: "Arbeitslosengeld" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-2 text-center text-orange-500", children: "Nein" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-2 text-center text-green-600", children: "Ja ✓" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-2 text-center text-green-600", children: "Ja ✓" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-3", children: "* Minijobber zahlen optional 3,6% RV-Eigenanteil für volle Rentenansprüche" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Stellen" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-purple-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-purple-900", children: "Für Arbeitnehmer:" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-purple-700 mt-1", children: "Deine Krankenkasse – hier laufen alle Meldungen zusammen" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-blue-900", children: "Für Arbeitgeber:" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-700 mt-1", children: "Einzugsstelle ist die Krankenkasse des Arbeitnehmers" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Informationen" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Arbeitnehmer-und-Selbststaendige/01-uebergangsbereich/uebergangsbereich_node.html",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "deutsche-rentenversicherung.de →"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "DRV Service-Telefon" }),
              /* @__PURE__ */ jsx("a", { href: "tel:08001000480700", className: "text-blue-600 hover:underline font-mono", children: "0800 1000 4800" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Kostenfrei, Mo-Do 7:30-19:30, Fr 7:30-15:30" })
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
            href: "https://www.gesetze-im-internet.de/sgb_4/__20.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "§ 20 SGB IV – Übergangsbereich (Gesetze im Internet)"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Arbeitnehmer-und-Selbststaendige/01-uebergangsbereich/uebergangsbereich_node.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Deutsche Rentenversicherung – Übergangsbereich"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bundesregierung.de/breg-de/aktuelles/mindestlohn-2024-2132292",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesregierung – Mindestlohn"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.lohn-info.de/uebergangsbereich.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Lohn-Info – Übergangsbereich Rechner & Formel"
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
const $$MidijobRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "Midijob-Rechner 2026 \u2013 \xDCbergangsbereich 603-2000\u20AC berechnen | Gleitzone";
  const description = "Midijob Rechner 2026: Berechne Netto, Sozialversicherung & Ersparnis im \xDCbergangsbereich von 603 bis 2000 Euro. Reduzierte AN-Beitr\xE4ge, volle Rentenanspr\xFCche.";
  const keywords = "Midijob Rechner, \xDCbergangsbereich Rechner, Gleitzone Rechner, Midijob 2026, \xDCbergangsbereich 603 2000, Midijob Sozialversicherung, Midijob Abgaben berechnen, Gleitzonenrechner, Midijob Beitr\xE4ge, \xDCbergangsbereich Formel, Midijob Netto, Teilzeitjob Abgaben";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<main class="min-h-screen pb-8"> <!-- Header mit Zur\xFCck-Button --> <header class="bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>\nAlle Rechner\n</a> <div class="flex items-center gap-3"> <span class="text-4xl">\u{1F4CA}</span> <div> <h1 class="text-2xl font-bold">Midijob-Rechner</h1> <p class="text-purple-100 text-sm">\xDCbergangsbereich 603,01 \u20AC \u2013 2.000 \u20AC (2026)</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ', ' </div> <!-- SEO Content Section --> <div class="max-w-2xl mx-auto px-4 mt-8"> <div class="bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">Midijob 2026: Der \xDCbergangsbereich einfach erkl\xE4rt</h2> <div class="prose prose-sm text-gray-600 space-y-4"> <p>\nDer <strong>Midijob</strong> \u2013 offiziell "Besch\xE4ftigung im \xDCbergangsbereich" \u2013 ist eine \n            Besch\xE4ftigungsform mit <strong>reduzierten Sozialversicherungsbeitr\xE4gen</strong> f\xFCr Arbeitnehmer. \n            Er gilt f\xFCr Bruttoverdienste zwischen <strong>603,01\u20AC und 2.000\u20AC</strong> monatlich und bietet \n            einen flie\xDFenden \xDCbergang vom Minijob zur voll sozialversicherungspflichtigen Besch\xE4ftigung.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Die Grenzen des \xDCbergangsbereichs 2026</h3> <ul class="list-disc pl-5 space-y-1"> <li><strong>Untergrenze:</strong> 603,01\u20AC (direkt \xFCber der Minijob-Grenze)</li> <li><strong>Obergrenze:</strong> 2.000\u20AC (seit 01.01.2023)</li> <li><strong>Dynamische Untergrenze:</strong> Gekoppelt an den Mindestlohn (13,90\u20AC ab 2026)</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">So funktioniert die Beitragsberechnung</h3> <p>\nIm \xDCbergangsbereich werden die <strong>Arbeitnehmer-Beitr\xE4ge</strong> nicht auf das tats\xE4chliche \n            Bruttogehalt berechnet, sondern auf eine <strong>reduzierte Bemessungsgrundlage</strong>. \n            Diese beginnt bei etwa 68% des Bruttos an der Untergrenze und steigt linear auf 100% an der Obergrenze.\n</p> <p>\nDie Formel verwendet den <strong>Faktor F</strong>, der sich aus dem Verh\xE4ltnis von 28% zum \n            Gesamtbeitragssatz ergibt. 2026 liegt F bei etwa 0,67 (abh\xE4ngig vom Zusatzbeitrag der Krankenkasse).\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Vorteile des Midijobs</h3> <ul class="list-disc pl-5 space-y-1"> <li><strong>Reduzierte AN-Beitr\xE4ge:</strong> Je nach Verdienst 10-50% weniger als normal</li> <li><strong>Volle Rentenanspr\xFCche:</strong> Rentenpunkte auf Basis des vollen Bruttolohns</li> <li><strong>Krankenversicherung:</strong> Vollst\xE4ndiger Versicherungsschutz als Arbeitnehmer</li> <li><strong>Arbeitslosengeld:</strong> Anspruch bei ausreichender Besch\xE4ftigungsdauer</li> <li><strong>Kein Nachteil f\xFCr AG:</strong> Arbeitgeber zahlt den vollen Anteil</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Midijob vs. Minijob: Die wichtigsten Unterschiede</h3> <p>\nBeim <strong>Minijob</strong> (bis 603\u20AC) zahlt der Arbeitnehmer keine Sozialversicherungsbeitr\xE4ge \n            (au\xDFer optional 3,6% RV), ist aber nicht eigenst\xE4ndig krankenversichert und erwirbt nur minimale \n            Rentenanspr\xFCche.\n</p> <p>\nIm <strong>Midijob</strong> bist du vollst\xE4ndig sozialversichert \u2013 mit Kranken-, Renten-, \n            Arbeitslosen- und Pflegeversicherung \u2013 aber zu reduzierten Beitr\xE4gen. Das macht den Midijob \n            besonders attraktiv f\xFCr Teilzeitkr\xE4fte, Studenten (\xFCber 20 Stunden/Woche) und Rentner.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wer profitiert besonders?</h3> <ul class="list-disc pl-5 space-y-1"> <li><strong>Teilzeitkr\xE4fte:</strong> Mit Bruttolohn im \xDCbergangsbereich</li> <li><strong>Studenten:</strong> Die mehr als 538\u20AC/603\u20AC verdienen m\xF6chten</li> <li><strong>Rentner:</strong> Mit Hinzuverdienst bis 2.000\u20AC</li> <li><strong>Wiedereinsteiger:</strong> Nach Elternzeit oder Arbeitslosigkeit</li> <li><strong>Aufstocker:</strong> Die mehr als Minijob, aber nicht Vollzeit arbeiten</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">H\xE4ufige Fragen zum Midijob</h3> <p class="font-semibold text-gray-800">Kann ich mehrere Midijobs haben?</p> <p>\nJa, aber die Bruttoverdienste werden zusammengerechnet. Wenn die Summe \xFCber 2.000\u20AC liegt, \n            fallen f\xFCr alle Jobs die vollen Beitr\xE4ge an.\n</p> <p class="font-semibold text-gray-800 mt-4">Was ist mit Minijob plus Midijob?</p> <p>\nEin Minijob neben einem Midijob bleibt f\xFCr den Arbeitnehmer abgabenfrei. Erst ab dem \n            zweiten Minijob wird zusammengerechnet.\n</p> <p class="font-semibold text-gray-800 mt-4">Muss ich mich selbst um die Krankenversicherung k\xFCmmern?</p> <p>\nNein! Im Midijob bist du \xFCber deinen Job krankenversichert. Die Beitr\xE4ge werden automatisch \n            vom Lohn abgezogen und dein Arbeitgeber f\xFChrt sie ab.\n</p> </div> </div> </div> <!-- Related Calculators --> <div class="max-w-2xl mx-auto px-4 mt-8"> <h3 class="text-lg font-bold text-gray-800 mb-4">\u{1F4F1} Verwandte Rechner</h3> <div class="grid grid-cols-2 gap-4"> <a href="/minijob-rechner" class="bg-white rounded-xl shadow p-4 hover:shadow-lg transition-shadow"> <span class="text-2xl">\u23F0</span> <p class="font-semibold text-gray-800 mt-2">Minijob-Rechner</p> <p class="text-xs text-gray-500">Bis 603\u20AC \u2013 geringf\xFCgige Besch\xE4ftigung</p> </a> <a href="/brutto-netto-rechner" class="bg-white rounded-xl shadow p-4 hover:shadow-lg transition-shadow"> <span class="text-2xl">\u{1F4B5}</span> <p class="font-semibold text-gray-800 mt-2">Brutto-Netto-Rechner</p> <p class="text-xs text-gray-500">Komplette Gehaltsberechnung</p> </a> <a href="/renten-rechner" class="bg-white rounded-xl shadow p-4 hover:shadow-lg transition-shadow"> <span class="text-2xl">\u{1F474}</span> <p class="font-semibold text-gray-800 mt-2">Renten-Rechner</p> <p class="text-xs text-gray-500">Gesetzliche Rente berechnen</p> </a> <a href="/arbeitslosengeld-rechner" class="bg-white rounded-xl shadow p-4 hover:shadow-lg transition-shadow"> <span class="text-2xl">\u{1F4CB}</span> <p class="font-semibold text-gray-800 mt-2">ALG-Rechner</p> <p class="text-xs text-gray-500">Arbeitslosengeld berechnen</p> </a> </div> </div> </main>  <script type="application/ld+json">', '<\/script>  <script type="application/ld+json">', "<\/script> "])), maybeRenderHead(), renderComponent($$result2, "MidijobRechner", MidijobRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/MidijobRechner", "client:component-export": "default" }), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Midijob-Rechner 2026 \u2013 \xDCbergangsbereich",
    "description": description,
    "url": "https://deutschland-rechner.de/midijob-rechner",
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
        "name": "Was ist ein Midijob?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ein Midijob ist eine Besch\xE4ftigung im \xDCbergangsbereich mit Bruttoverdienst zwischen 603,01\u20AC und 2.000\u20AC monatlich. Arbeitnehmer zahlen reduzierte Sozialversicherungsbeitr\xE4ge, erwerben aber volle Rentenanspr\xFCche."
        }
      },
      {
        "@type": "Question",
        "name": "Wie viel spart man im \xDCbergangsbereich?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Je nach Verdienst sparen Arbeitnehmer 10-50% der Sozialversicherungsbeitr\xE4ge gegen\xFCber einer normalen Berechnung. Bei 1.000\u20AC Brutto sind das etwa 50-80\u20AC monatlich."
        }
      },
      {
        "@type": "Question",
        "name": "Bin ich im Midijob krankenversichert?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja! Im Midijob sind Sie \xFCber Ihren Arbeitgeber vollst\xE4ndig krankenversichert. Anders als beim Minijob m\xFCssen Sie keine separate Versicherung haben."
        }
      },
      {
        "@type": "Question",
        "name": "Was ist der Unterschied zwischen Midijob und Gleitzone?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Midijob und Gleitzone bezeichnen dasselbe: den \xDCbergangsbereich. 'Gleitzone' war der fr\xFChere Begriff (bis 2019), seitdem hei\xDFt es offiziell '\xDCbergangsbereich'. Die Obergrenze wurde von 850\u20AC auf 2.000\u20AC erh\xF6ht."
        }
      }
    ]
  }))) })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/midijob-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/midijob-rechner.astro";
const $$url = "/midijob-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$MidijobRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
