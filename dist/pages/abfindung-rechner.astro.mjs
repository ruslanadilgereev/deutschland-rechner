/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, u as unescapeHTML, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DmT1JwUR.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const GRUNDFREIBETRAG_2025 = 12096;
function berechneEinkommensteuer(zvE) {
  if (zvE <= GRUNDFREIBETRAG_2025) return 0;
  if (zvE <= 17005) {
    const y = (zvE - GRUNDFREIBETRAG_2025) / 1e4;
    return Math.floor((932.3 * y + 1400) * y);
  }
  if (zvE <= 66760) {
    const z = (zvE - 17005) / 1e4;
    return Math.floor((176.64 * z + 2397) * z + 1025.38);
  }
  if (zvE <= 277825) {
    return Math.floor(0.42 * zvE - 10636.31);
  }
  return Math.floor(0.45 * zvE - 18971.94);
}
function berechneSoli(einkommensteuer) {
  const freigrenze = 18130;
  if (einkommensteuer <= freigrenze) return 0;
  const vollSoli = einkommensteuer * 0.055;
  const milderung = (einkommensteuer - freigrenze) * 0.119;
  return Math.min(vollSoli, milderung);
}
const BUNDESLAENDER = [
  { id: "bw", name: "Baden-Württemberg", kirchensteuerSatz: 8 },
  { id: "by", name: "Bayern", kirchensteuerSatz: 8 },
  { id: "be", name: "Berlin", kirchensteuerSatz: 9 },
  { id: "bb", name: "Brandenburg", kirchensteuerSatz: 9 },
  { id: "hb", name: "Bremen", kirchensteuerSatz: 9 },
  { id: "hh", name: "Hamburg", kirchensteuerSatz: 9 },
  { id: "he", name: "Hessen", kirchensteuerSatz: 9 },
  { id: "mv", name: "Mecklenburg-Vorpommern", kirchensteuerSatz: 9 },
  { id: "ni", name: "Niedersachsen", kirchensteuerSatz: 9 },
  { id: "nw", name: "Nordrhein-Westfalen", kirchensteuerSatz: 9 },
  { id: "rp", name: "Rheinland-Pfalz", kirchensteuerSatz: 9 },
  { id: "sl", name: "Saarland", kirchensteuerSatz: 9 },
  { id: "sn", name: "Sachsen", kirchensteuerSatz: 9 },
  { id: "st", name: "Sachsen-Anhalt", kirchensteuerSatz: 9 },
  { id: "sh", name: "Schleswig-Holstein", kirchensteuerSatz: 9 },
  { id: "th", name: "Thüringen", kirchensteuerSatz: 9 }
];
function AbfindungsRechner() {
  const [bruttoMonatsgehalt, setBruttoMonatsgehalt] = useState(4e3);
  const [beschaeftigungsjahre, setBeschaeftigungsjahre] = useState(10);
  const [alterBeiAustritt, setAlterBeiAustritt] = useState(45);
  const [abfindungsBerechnungsart, setAbfindungsBerechnungsart] = useState("faktor");
  const [abfindungsFaktor, setAbfindungsFaktor] = useState(0.5);
  const [abfindungsBetrag, setAbfindungsBetrag] = useState(2e4);
  const [jahresbrutto, setJahresbrutto] = useState(48e3);
  const [steuerklasse, setSteuerklasse] = useState(1);
  const [kirchensteuer, setKirchensteuer] = useState(false);
  const [bundesland, setBundesland] = useState("nw");
  const [kinderfreibetraege, setKinderfreibetraege] = useState(0);
  const ergebnis = useMemo(() => {
    const regelabfindung = bruttoMonatsgehalt * beschaeftigungsjahre * 0.5;
    let abfindung;
    if (abfindungsBerechnungsart === "faktor") {
      abfindung = bruttoMonatsgehalt * beschaeftigungsjahre * abfindungsFaktor;
    } else {
      abfindung = abfindungsBetrag;
    }
    const erhoehterAnspruch = alterBeiAustritt >= 50 && beschaeftigungsjahre >= 15;
    const maxRegelabfindung = erhoehterAnspruch ? bruttoMonatsgehalt * 18 : bruttoMonatsgehalt * 12;
    const werbungskostenpauschale = 1230;
    const zvE = jahresbrutto - werbungskostenpauschale;
    const kinderfreibetragGesamt = kinderfreibetraege * 9540 / 2;
    const zvENachKinderfreibetrag = Math.max(0, zvE - kinderfreibetragGesamt);
    const steuerOhneAbfindung = berechneEinkommensteuer(zvENachKinderfreibetrag);
    const zvEMitEinFuenftel = zvENachKinderfreibetrag + abfindung / 5;
    const steuerMitEinFuenftel = berechneEinkommensteuer(zvEMitEinFuenftel);
    const mehrsteuerProFuenftel = steuerMitEinFuenftel - steuerOhneAbfindung;
    const steuerAufAbfindungFuenftel = mehrsteuerProFuenftel * 5;
    const zvEMitVollerAbfindung = zvENachKinderfreibetrag + abfindung;
    const steuerMitVollerAbfindung = berechneEinkommensteuer(zvEMitVollerAbfindung);
    const steuerAufAbfindungNormal = steuerMitVollerAbfindung - steuerOhneAbfindung;
    const ersparnisFuenftelregelung = steuerAufAbfindungNormal - steuerAufAbfindungFuenftel;
    const fuenftelregelungLohntSich = ersparnisFuenftelregelung > 0;
    const soliOhneAbfindung = berechneSoli(steuerOhneAbfindung);
    const soliMitAbfindungFuenftel = berechneSoli(steuerOhneAbfindung + steuerAufAbfindungFuenftel);
    const soliAufAbfindung = soliMitAbfindungFuenftel - soliOhneAbfindung;
    const kirchensteuerSatz = BUNDESLAENDER.find((b) => b.id === bundesland)?.kirchensteuerSatz || 9;
    const kirchensteuerAufAbfindung = kirchensteuer ? steuerAufAbfindungFuenftel * (kirchensteuerSatz / 100) : 0;
    const gesamtAbzuege = steuerAufAbfindungFuenftel + soliAufAbfindung + kirchensteuerAufAbfindung;
    const nettoAbfindung = abfindung - gesamtAbzuege;
    const effektiverSteuersatz = gesamtAbzuege / abfindung * 100;
    const ersparterSteuersatz = (ersparnisFuenftelregelung > 0 ? ersparnisFuenftelregelung : 0) / abfindung * 100;
    const grenzsteuersatzOhne = zvENachKinderfreibetrag > 277825 ? 45 : zvENachKinderfreibetrag > 66760 ? 42 : zvENachKinderfreibetrag > 17005 ? (176.64 * 2 * ((zvENachKinderfreibetrag - 17005) / 1e4) + 2397) / 100 + 24 : zvENachKinderfreibetrag > GRUNDFREIBETRAG_2025 ? 14 + (932.3 * 2 * ((zvENachKinderfreibetrag - GRUNDFREIBETRAG_2025) / 1e4) + 1400) / 100 : 0;
    return {
      // Abfindung
      abfindungBrutto: abfindung,
      regelabfindung,
      maxRegelabfindung,
      erhoehterAnspruch,
      // zvE
      zvE,
      zvENachKinderfreibetrag,
      zvEMitEinFuenftel,
      zvEMitVollerAbfindung,
      // Steuer-Berechnungen
      steuerOhneAbfindung,
      steuerMitEinFuenftel,
      mehrsteuerProFuenftel,
      steuerAufAbfindungFuenftel,
      steuerAufAbfindungNormal,
      ersparnisFuenftelregelung,
      fuenftelregelungLohntSich,
      // Soli & Kirchensteuer
      soliAufAbfindung,
      kirchensteuerAufAbfindung,
      kirchensteuerSatz,
      // Ergebnis
      gesamtAbzuege,
      nettoAbfindung,
      effektiverSteuersatz,
      ersparterSteuersatz,
      grenzsteuersatz: grenzsteuersatzOhne
    };
  }, [bruttoMonatsgehalt, beschaeftigungsjahre, alterBeiAustritt, abfindungsBerechnungsart, abfindungsFaktor, abfindungsBetrag, jahresbrutto, steuerklasse, kirchensteuer, bundesland, kinderfreibetraege]);
  const formatEuro = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  const formatEuroRund = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";
  const formatProzent = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "💰 Abfindungshöhe berechnen" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 mb-6", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setAbfindungsBerechnungsart("faktor"),
            className: `p-4 rounded-xl border-2 transition-all ${abfindungsBerechnungsart === "faktor" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`,
            children: [
              /* @__PURE__ */ jsx("div", { className: "text-2xl mb-1", children: "📊" }),
              /* @__PURE__ */ jsx("div", { className: "font-semibold text-gray-800 text-sm", children: "Nach Formel" }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: "Gehalt × Jahre × Faktor" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setAbfindungsBerechnungsart("betrag"),
            className: `p-4 rounded-xl border-2 transition-all ${abfindungsBerechnungsart === "betrag" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`,
            children: [
              /* @__PURE__ */ jsx("div", { className: "text-2xl mb-1", children: "💶" }),
              /* @__PURE__ */ jsx("div", { className: "font-semibold text-gray-800 text-sm", children: "Fester Betrag" }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: "Abfindung eingeben" })
            ]
          }
        )
      ] }),
      abfindungsBerechnungsart === "faktor" ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Bruttomonatsgehalt" }) }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: bruttoMonatsgehalt,
                onChange: (e) => setBruttoMonatsgehalt(Math.max(0, Number(e.target.value))),
                className: "w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
                min: "1000",
                max: "20000",
                step: "100"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400", children: "€" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              value: bruttoMonatsgehalt,
              onChange: (e) => setBruttoMonatsgehalt(Number(e.target.value)),
              className: "w-full mt-2 accent-blue-500",
              min: "1500",
              max: "15000",
              step: "100"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Betriebszugehörigkeit" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setBeschaeftigungsjahre(Math.max(1, beschaeftigungsjahre - 1)),
                className: "w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold",
                children: "−"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsx("span", { className: "text-3xl font-bold text-gray-800", children: beschaeftigungsjahre }),
              /* @__PURE__ */ jsx("span", { className: "text-gray-500 ml-2", children: "Jahre" })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setBeschaeftigungsjahre(Math.min(40, beschaeftigungsjahre + 1)),
                className: "w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold",
                children: "+"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Abfindungsfaktor" }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-sm ml-2", children: "(Standard: 0,5 = halbes Bruttomonatsgehalt pro Jahr)" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "range",
                value: abfindungsFaktor,
                onChange: (e) => setAbfindungsFaktor(Number(e.target.value)),
                className: "flex-1 accent-blue-500",
                min: "0.25",
                max: "1.5",
                step: "0.05"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-xl font-bold w-16 text-center", children: abfindungsFaktor.toFixed(2) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-400 mt-1", children: [
            /* @__PURE__ */ jsx("span", { children: "0,25 (niedrig)" }),
            /* @__PURE__ */ jsx("span", { children: "0,5 (Regel)" }),
            /* @__PURE__ */ jsx("span", { children: "1,0+ (hoch)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 rounded-xl p-4 text-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm text-blue-600", children: "Berechnete Abfindung" }),
          /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-blue-900", children: formatEuroRund(ergebnis.abfindungBrutto) }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-blue-600 mt-1", children: [
            formatEuroRund(bruttoMonatsgehalt),
            " × ",
            beschaeftigungsjahre,
            " Jahre × ",
            abfindungsFaktor
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Abfindungsbetrag (brutto)" }) }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: abfindungsBetrag,
              onChange: (e) => setAbfindungsBetrag(Math.max(0, Number(e.target.value))),
              className: "w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
              min: "1000",
              max: "500000",
              step: "1000"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl", children: "€" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            value: abfindungsBetrag,
            onChange: (e) => setAbfindungsBetrag(Number(e.target.value)),
            className: "w-full mt-2 accent-blue-500",
            min: "5000",
            max: "200000",
            step: "5000"
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "🧾 Für Steuerberechnung (Fünftelregelung)" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Alter bei Austritt" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setAlterBeiAustritt(Math.max(18, alterBeiAustritt - 1)),
              className: "w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold",
              children: "−"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-3xl font-bold text-gray-800", children: alterBeiAustritt }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setAlterBeiAustritt(Math.min(67, alterBeiAustritt + 1)),
              className: "w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold",
              children: "+"
            }
          )
        ] }),
        ergebnis.erhoehterAnspruch && /* @__PURE__ */ jsx("p", { className: "text-xs text-green-600 text-center mt-2", children: "✓ Erhöhter Abfindungsanspruch möglich (50+ Jahre, 15+ Jahre Betriebszugehörigkeit)" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Jahresbruttoeinkommen (ohne Abfindung)" }) }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: jahresbrutto,
              onChange: (e) => setJahresbrutto(Math.max(0, Number(e.target.value))),
              className: "w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
              min: "12000",
              max: "300000",
              step: "1000"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400", children: "€/Jahr" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-2", children: "Tipp: Niedriges Einkommen im Austrittsjahr = weniger Steuern auf Abfindung" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Kinderfreibeträge" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setKinderfreibetraege(Math.max(0, kinderfreibetraege - 0.5)),
              className: "w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold",
              children: "−"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold text-gray-800", children: kinderfreibetraege }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setKinderfreibetraege(Math.min(10, kinderfreibetraege + 0.5)),
              className: "w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold",
              children: "+"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 text-center mt-1", children: "0,5 = halber Freibetrag (getrennte Eltern)" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            checked: kirchensteuer,
            onChange: (e) => setKirchensteuer(e.target.checked),
            className: "w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Kirchensteuerpflichtig" })
      ] }) }),
      kirchensteuer && /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium text-sm", children: "Bundesland" }) }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: bundesland,
            onChange: (e) => setBundesland(e.target.value),
            className: "w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
            children: BUNDESLAENDER.map((bl) => /* @__PURE__ */ jsxs("option", { value: bl.id, children: [
              bl.name,
              " (",
              bl.kirchensteuerSatz,
              "% Kirchensteuer)"
            ] }, bl.id))
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: "💵 Ihre Netto-Abfindung" }),
      /* @__PURE__ */ jsx("div", { className: "flex items-baseline gap-2 mb-4", children: /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuroRund(ergebnis.nettoAbfindung) }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Brutto-Abfindung" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuroRund(ergebnis.abfindungBrutto) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Gesamtabzüge" }),
          /* @__PURE__ */ jsxs("div", { className: "text-xl font-bold", children: [
            "−",
            formatEuroRund(ergebnis.gesamtAbzuege)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsx("span", { className: "opacity-80", children: "Effektiver Steuersatz auf Abfindung" }),
        /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold", children: formatProzent(ergebnis.effektiverSteuersatz) })
      ] }) })
    ] }),
    ergebnis.fuenftelregelungLohntSich && /* @__PURE__ */ jsxs("div", { className: "bg-green-50 border border-green-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-green-800 mb-3", children: "✅ Fünftelregelung spart Steuern!" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm text-green-700", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          "Durch die ",
          /* @__PURE__ */ jsx("strong", { children: "Fünftelregelung (§ 34 EStG)" }),
          " sparen Sie:"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-green-100 rounded-xl p-4 text-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-3xl font-bold text-green-800", children: formatEuroRund(ergebnis.ersparnisFuenftelregelung) }),
          /* @__PURE__ */ jsx("p", { className: "text-sm mt-1", children: "weniger Steuern als bei Normalbesteuerung" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs", children: [
          "Ohne Fünftelregelung wäre die Steuer auf die Abfindung ",
          formatEuroRund(ergebnis.steuerAufAbfindungNormal),
          " statt ",
          formatEuroRund(ergebnis.steuerAufAbfindungFuenftel),
          "."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Steuerberechnung im Detail" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide", children: "Abzüge von der Abfindung" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Brutto-Abfindung" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.abfindungBrutto) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Einkommensteuer (Fünftelregelung)" }),
          /* @__PURE__ */ jsxs("span", { className: "text-red-600", children: [
            "−",
            formatEuro(ergebnis.steuerAufAbfindungFuenftel)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Solidaritätszuschlag" }),
          /* @__PURE__ */ jsxs("span", { className: "text-red-600", children: [
            "−",
            formatEuro(ergebnis.soliAufAbfindung)
          ] })
        ] }),
        kirchensteuer && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
            "Kirchensteuer (",
            ergebnis.kirchensteuerSatz,
            "%)"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-red-600", children: [
            "−",
            formatEuro(ergebnis.kirchensteuerAufAbfindung)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-3 bg-green-50 -mx-6 px-6 rounded-xl mt-4", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-green-800", children: "Netto-Abfindung" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-2xl text-green-900", children: formatEuro(ergebnis.nettoAbfindung) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "🔢 So funktioniert die Fünftelregelung" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-medium text-blue-800 mb-2", children: "Berechnungsschritte:" }),
          /* @__PURE__ */ jsxs("ol", { className: "space-y-2 text-blue-700 list-decimal list-inside", children: [
            /* @__PURE__ */ jsxs("li", { children: [
              "Zu versteuerndes Einkommen (zvE) ohne Abfindung: ",
              /* @__PURE__ */ jsx("strong", { children: formatEuroRund(ergebnis.zvENachKinderfreibetrag) })
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              "Steuer auf zvE ohne Abfindung: ",
              /* @__PURE__ */ jsx("strong", { children: formatEuro(ergebnis.steuerOhneAbfindung) })
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              "zvE + 1/5 der Abfindung: ",
              /* @__PURE__ */ jsx("strong", { children: formatEuroRund(ergebnis.zvEMitEinFuenftel) })
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              "Steuer auf zvE + 1/5: ",
              /* @__PURE__ */ jsx("strong", { children: formatEuro(ergebnis.steuerMitEinFuenftel) })
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              "Mehrsteuer pro Fünftel: ",
              /* @__PURE__ */ jsx("strong", { children: formatEuro(ergebnis.mehrsteuerProFuenftel) })
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              "Steuer auf Abfindung = Mehrsteuer × 5: ",
              /* @__PURE__ */ jsx("strong", { children: formatEuro(ergebnis.steuerAufAbfindungFuenftel) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Die Fünftelregelung verteilt die Abfindung fiktiv auf 5 Jahre. Dadurch steigt der Steuersatz nur für 1/5 der Summe. Das Ergebnis wird dann mit 5 multipliziert – Sie zahlen weniger als bei voller Besteuerung in einem Jahr." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-amber-800 mb-3", children: "⚖️ Wie hoch sollte eine Abfindung sein?" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm text-amber-700", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          "Es gibt ",
          /* @__PURE__ */ jsx("strong", { children: "keinen gesetzlichen Anspruch" }),
          ' auf eine Abfindung. Die sogenannte "Regelabfindung" ist ein Richtwert aus der Praxis:'
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-amber-100 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-center font-mono text-lg", children: /* @__PURE__ */ jsx("strong", { children: "0,5 × Bruttomonatsgehalt × Beschäftigungsjahre" }) }),
          /* @__PURE__ */ jsxs("p", { className: "text-center text-sm mt-2", children: [
            "Bei Ihnen: 0,5 × ",
            formatEuroRund(bruttoMonatsgehalt),
            " × ",
            beschaeftigungsjahre,
            " = ",
            /* @__PURE__ */ jsx("strong", { children: formatEuroRund(ergebnis.regelabfindung) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-1 pl-4 list-disc", children: [
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Minimum:" }),
            " 0,25 Gehälter pro Jahr (schwache Verhandlungsposition)"
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Standard:" }),
            " 0,5 Gehälter pro Jahr (Regelabfindung)"
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Gut:" }),
            " 0,75–1,0 Gehälter pro Jahr (starke Position, lange Zugehörigkeit)"
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Sehr gut:" }),
            " 1,0+ Gehälter pro Jahr (Führungskräfte, Sonderfälle)"
          ] })
        ] }),
        ergebnis.erhoehterAnspruch && /* @__PURE__ */ jsxs("p", { className: "font-medium mt-2", children: [
          "⚠️ Bei 50+ Jahren Alter und 15+ Jahren Betriebszugehörigkeit kann die Abfindung bis zu ",
          /* @__PURE__ */ jsx("strong", { children: "18 Monatsgehälter" }),
          " betragen (§ 1a KSchG)."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ Wissenswertes zur Abfindung" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Kein Rechtsanspruch:" }),
            " Eine Abfindung ist Verhandlungssache, nicht gesetzlich vorgeschrieben"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Fünftelregelung:" }),
            " Gilt automatisch bei außerordentlichen Einkünften (Zusammenballung)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Keine Sozialversicherung:" }),
            " Auf Abfindungen werden keine SV-Beiträge fällig"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Sperrzeit ALG:" }),
            " Bei Aufhebungsvertrag droht 12 Wochen Sperrzeit beim Arbeitslosengeld"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Ruhen des ALG:" }),
            " Abfindung kann ALG-Anspruch bis zu 1 Jahr ruhen lassen (§ 158 SGB III)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Timing:" }),
            " Abfindung im Jahr mit niedrigem Einkommen = weniger Steuern"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-red-50 border border-red-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-red-800 mb-3", children: "⚠️ Wichtige Hinweise" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-red-700", children: [
        /* @__PURE__ */ jsxs("li", { children: [
          "• ",
          /* @__PURE__ */ jsx("strong", { children: "Aufhebungsvertrag:" }),
          " Kann zu Sperrzeit (12 Wochen) beim Arbeitslosengeld führen"
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          "• ",
          /* @__PURE__ */ jsx("strong", { children: "Kündigungsschutzklage:" }),
          " Oft bessere Verhandlungsposition für höhere Abfindung"
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          "• ",
          /* @__PURE__ */ jsx("strong", { children: "Anwalt:" }),
          " Bei größeren Summen lohnt sich eine arbeitsrechtliche Beratung"
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          "• ",
          /* @__PURE__ */ jsx("strong", { children: "Steuerberater:" }),
          " Für optimales Timing der Abfindungszahlung"
        ] }),
        /* @__PURE__ */ jsx("li", { children: "• Diese Berechnung ist eine Schätzung – die tatsächliche Steuer kann abweichen" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Beratung & Information" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-blue-900", children: "Arbeitsrechtliche Beratung" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-700 mt-1", children: "Bei Fragen zu Kündigung und Abfindung:" }),
          /* @__PURE__ */ jsxs("ul", { className: "text-sm text-blue-700 mt-2 space-y-1", children: [
            /* @__PURE__ */ jsx("li", { children: "• Fachanwalt für Arbeitsrecht" }),
            /* @__PURE__ */ jsx("li", { children: "• Gewerkschaft (für Mitglieder kostenlos)" }),
            /* @__PURE__ */ jsx("li", { children: "• Arbeitnehmerkammer (Bremen, Saarland)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Arbeitsagentur Hotline" }),
              /* @__PURE__ */ jsx("p", { className: "text-lg font-bold", children: "0800 4 555500" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Kostenfrei, Mo-Fr 8-18 Uhr" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "BMAS Info" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.bmas.de/DE/Arbeit/Arbeitsrecht/arbeitsrecht.html",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline text-sm",
                  children: "Arbeitsrecht-Info →"
                }
              )
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "💡 Tipps zur Steueroptimierung" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-green-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📅" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Auszahlung im Folgejahr" }),
            /* @__PURE__ */ jsx("p", { children: "Wenn möglich, Abfindung im Januar auszahlen lassen – dann ist das Jahreseinkommen niedriger." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-green-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📉" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Einkommen reduzieren" }),
            /* @__PURE__ */ jsx("p", { children: "Unbezahlter Urlaub oder Freistellung vor Austritt senkt das zu versteuernde Einkommen." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-green-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "💰" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Direktversicherung" }),
            /* @__PURE__ */ jsx("p", { children: "Teil der Abfindung in betriebliche Altersvorsorge einzahlen (steuerfrei bis 4% BBG)." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-green-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📊" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Werbungskosten maximieren" }),
            /* @__PURE__ */ jsx("p", { children: "Fortbildungen, Bewerbungskosten, Umzug – im Jahr der Abfindung besonders wertvoll." })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gray-50 rounded-xl", children: [
      /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-gray-500 uppercase mb-2", children: "Quellen & Rechtsgrundlagen" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/estg/__34.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "§ 34 EStG – Außerordentliche Einkünfte (Fünftelregelung)"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/kschg/__1a.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "§ 1a KSchG – Abfindungsanspruch bei betriebsbedingter Kündigung"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/sgb_3/__159.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "§ 159 SGB III – Sperrzeit bei Arbeitslosengeld"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bmas.de/DE/Arbeit/Arbeitsrecht/Kuendigung-und-Aufhebungsvertrag/kuendigung-aufhebungsvertrag.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BMAS – Kündigung und Aufhebungsvertrag"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bmf-steuerrechner.de",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BMF Steuerrechner – Offizielle Steuerberechnung"
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
const $$AbfindungRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "Abfindung Rechner 2025 \u2013 Netto berechnen mit F\xFCnftelregelung";
  const description = "Abfindung Rechner 2025: Berechnen Sie Ihre Netto-Abfindung nach Steuern. Mit F\xFCnftelregelung, Steuerersparnis & Tipps zur Optimierung. Kostenlos & aktuell!";
  const keywords = "Abfindung Rechner, Abfindung berechnen, Abfindung versteuern, F\xFCnftelregelung Rechner, Abfindung netto, Abfindung Steuer, Abfindung 2025, Abfindung H\xF6he, Abfindung K\xFCndigung, Aufhebungsvertrag Abfindung, Abfindung berechnen Formel, Abfindung Steuersatz, wie viel Abfindung, Abfindung Rechner kostenlos, Regelabfindung berechnen";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<main class="min-h-screen pb-8"> <!-- Header --> <header class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-emerald-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>\nAlle Rechner\n</a> <div class="flex items-center gap-3"> <span class="text-4xl">\u{1F91D}</span> <div> <h1 class="text-2xl font-bold">Abfindung-Rechner</h1> <p class="text-emerald-100 text-sm">Netto-Abfindung 2025 mit F\xFCnftelregelung berechnen</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ', ' </div> <!-- SEO Content Section --> <div class="max-w-2xl mx-auto px-4 mt-8"> <div class="bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">Abfindung 2025: Alles was Sie wissen m\xFCssen</h2> <div class="prose prose-sm text-gray-600 space-y-4"> <p>\nEine <strong>Abfindung</strong> ist eine einmalige Zahlung des Arbeitgebers an den Arbeitnehmer \n            bei Beendigung des Arbeitsverh\xE4ltnisses. Mit unserem <strong>Abfindung Rechner</strong> ermitteln \n            Sie schnell, wie viel von Ihrer Brutto-Abfindung nach Steuern \xFCbrig bleibt \u2013 inklusive der \n            steuersparenden <strong>F\xFCnftelregelung</strong>.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wie hoch sollte eine Abfindung sein?</h3> <p>\nEs gibt <strong>keinen gesetzlichen Anspruch</strong> auf eine Abfindung. Die H\xF6he wird verhandelt. \n            Als Richtwert gilt die <strong>Regelabfindung</strong>:\n</p> <div class="bg-gray-50 p-4 rounded-xl text-center my-4"> <p class="font-mono text-lg font-bold">0,5 \xD7 Bruttomonatsgehalt \xD7 Betriebszugeh\xF6rigkeit in Jahren</p> </div> <p>\nBei 10 Jahren und 4.000 \u20AC Gehalt w\xE4ren das also 20.000 \u20AC Abfindung. Je nach Verhandlungsposition \n            kann der Faktor zwischen 0,25 (schwach) und 1,5+ (sehr stark) liegen.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wie wird die Abfindung versteuert?</h3> <p>\nAbfindungen sind <strong>voll steuerpflichtig</strong> als au\xDFerordentliche Eink\xFCnfte. Aber: \n            Die <strong>F\xFCnftelregelung (\xA7 34 EStG)</strong> mildert die Steuerlast erheblich:\n</p> <ul class="list-disc pl-5 space-y-1"> <li>Die Abfindung wird so behandelt, als w\xE4re sie auf 5 Jahre verteilt</li> <li>Der Steuersatz steigt nur f\xFCr 1/5 der Abfindung</li> <li>Die Mehrsteuer wird dann mit 5 multipliziert</li> <li><strong>Ergebnis:</strong> Oft 20-40% weniger Steuern als bei Normalbesteuerung</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wann wird die F\xFCnftelregelung angewendet?</h3> <p>\nDie F\xFCnftelregelung gilt automatisch bei einer <strong>Zusammenballung von Eink\xFCnften</strong>:\n</p> <ul class="list-disc pl-5 space-y-1"> <li>Die Abfindung muss <strong>in einem Kalenderjahr</strong> zuflie\xDFen</li> <li>Es muss eine <strong>einmalige Zahlung</strong> sein (keine Raten \xFCber mehrere Jahre)</li> <li>Die F\xFCnftelregelung muss <strong>g\xFCnstiger</strong> sein als Normalbesteuerung</li> <li>Das Finanzamt pr\xFCft und wendet sie automatisch an (G\xFCnstigerpr\xFCfung)</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Abfindung und Sozialversicherung</h3> <p> <strong>Gute Nachricht:</strong> Auf echte Abfindungen (Entsch\xE4digung f\xFCr Arbeitsplatzverlust) \n            fallen <strong>keine Sozialversicherungsbeitr\xE4ge</strong> an \u2013 keine Renten-, Kranken-, \n            Pflege- oder Arbeitslosenversicherung!\n</p> <p> <strong>Achtung:</strong> Wird die "Abfindung" als Nachzahlung f\xFCr \xDCberstunden oder \n            r\xFCckst\xE4ndiges Gehalt deklariert, sind SV-Beitr\xE4ge f\xE4llig.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Abfindung und Arbeitslosengeld</h3> <p>\nBei einem <strong>Aufhebungsvertrag</strong> drohen Nachteile beim Arbeitslosengeld:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>Sperrzeit:</strong> 12 Wochen ohne ALG (\xA7 159 SGB III) bei eigenem Mitwirken</li> <li><strong>Ruhen des Anspruchs:</strong> Wenn die K\xFCndigungsfrist nicht eingehalten wurde (\xA7 158 SGB III)</li> <li><strong>Anrechnung:</strong> Die Abfindung selbst wird nicht auf ALG angerechnet</li> </ul> <p> <strong>Tipp:</strong> Bei betriebsbedingter K\xFCndigung ohne Eigenverschulden gibt es oft keine Sperrzeit.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wann habe ich Anspruch auf eine Abfindung?</h3> <p>\nEin <strong>gesetzlicher Anspruch</strong> besteht nur in wenigen F\xE4llen:\n</p> <ul class="list-disc pl-5 space-y-1"> <li><strong>\xA7 1a KSchG:</strong> Bei betriebsbedingter K\xFCndigung mit Abfindungsangebot (0,5 Geh\xE4lter/Jahr)</li> <li><strong>Sozialplan:</strong> Bei Massenentlassungen mit vereinbarten Abfindungen</li> <li><strong>Tarifvertrag:</strong> Wenn tariflich vereinbart</li> <li><strong>Arbeitsvertrag:</strong> Wenn vertraglich zugesichert</li> </ul> <p>\nIn der Praxis werden die meisten Abfindungen im Rahmen eines <strong>Aufhebungsvertrags</strong>\noder bei einer <strong>K\xFCndigungsschutzklage</strong> ausgehandelt.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Tipps f\xFCr eine h\xF6here Abfindung</h3> <ul class="list-disc pl-5 space-y-1"> <li><strong>K\xFCndigungsschutzklage:</strong> Innerhalb von 3 Wochen einreichen \u2013 das st\xE4rkt die Verhandlungsposition</li> <li><strong>Unwirksame K\xFCndigung:</strong> Je mehr Fehler in der K\xFCndigung, desto h\xF6her die Abfindung</li> <li><strong>Sozialdaten:</strong> Alter, Betriebszugeh\xF6rigkeit, Unterhaltspflichten erh\xF6hen den Anspruch</li> <li><strong>Betriebsrat:</strong> Ist ein BR vorhanden, wurden die Anh\xF6rungspflichten eingehalten?</li> <li><strong>Fachanwalt:</strong> Kostet ca. 200-500 \u20AC, bringt oft ein Vielfaches an Mehrertrag</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Abfindung: Aufhebungsvertrag vs. K\xFCndigung</h3> <p> <strong>Aufhebungsvertrag:</strong> </p> <ul class="list-disc pl-5 space-y-1"> <li>\u2713 Schnelle L\xF6sung ohne Gerichtsverfahren</li> <li>\u2713 Oft h\xF6here Abfindung als gesetzliches Minimum</li> <li>\u2717 Sperrzeit beim Arbeitslosengeld (12 Wochen)</li> <li>\u2717 Kein R\xFCcktrittsrecht nach Unterschrift</li> </ul> <p class="mt-4"> <strong>K\xFCndigungsschutzklage:</strong> </p> <ul class="list-disc pl-5 space-y-1"> <li>\u2713 St\xE4rkt die Verhandlungsposition erheblich</li> <li>\u2713 Keine Sperrzeit beim ALG</li> <li>\u2713 Oft h\xF6here Abfindung durch Vergleich</li> <li>\u2717 Dauert 2-6 Monate, Prozesskostenrisiko</li> </ul> </div> </div> </div> </main>  <script type="application/ld+json">', '<\/script>  <script type="application/ld+json">', "<\/script> "])), maybeRenderHead(), renderComponent($$result2, "AbfindungsRechner", AbfindungsRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/AbfindungsRechner", "client:component-export": "default" }), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Abfindung Rechner 2025",
    "description": description,
    "url": "https://deutschland-rechner.de/abfindung-rechner",
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
        "name": "Wie hoch ist die Regelabfindung?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Die Regelabfindung betr\xE4gt 0,5 Bruttomonatsgeh\xE4lter pro Besch\xE4ftigungsjahr. Bei 4.000\u20AC Gehalt und 10 Jahren Betriebszugeh\xF6rigkeit w\xE4ren das 20.000\u20AC. Je nach Verhandlungsposition kann der Faktor zwischen 0,25 und 1,5 liegen."
        }
      },
      {
        "@type": "Question",
        "name": "Wie wird eine Abfindung versteuert?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Abfindungen sind voll steuerpflichtig als au\xDFerordentliche Eink\xFCnfte. Durch die F\xFCnftelregelung (\xA734 EStG) wird die Abfindung fiktiv auf 5 Jahre verteilt, was den Steuersatz erheblich senkt - oft 20-40% weniger Steuern. Sozialversicherungsbeitr\xE4ge fallen nicht an."
        }
      },
      {
        "@type": "Question",
        "name": "Was ist die F\xFCnftelregelung bei Abfindungen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Die F\xFCnftelregelung nach \xA734 EStG verteilt die Steuerlast fiktiv auf 5 Jahre: Erst wird die Steuer auf 1/5 der Abfindung berechnet, dann mit 5 multipliziert. Da der Steuersatz progressiv steigt, zahlen Sie so deutlich weniger als bei normaler Besteuerung."
        }
      },
      {
        "@type": "Question",
        "name": "Habe ich einen Anspruch auf Abfindung?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ein gesetzlicher Anspruch besteht nur bei betriebsbedingter K\xFCndigung mit Abfindungsangebot (\xA71a KSchG), bei Sozialpl\xE4nen oder wenn es vertraglich/tariflich vereinbart ist. In der Praxis werden Abfindungen meist bei Aufhebungsvertr\xE4gen oder K\xFCndigungsschutzklagen ausgehandelt."
        }
      },
      {
        "@type": "Question",
        "name": "Gibt es eine Sperrzeit beim Arbeitslosengeld nach einer Abfindung?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Bei einem Aufhebungsvertrag droht eine Sperrzeit von 12 Wochen, wenn Sie aktiv an der Beendigung mitgewirkt haben. Bei einer arbeitgeberseitigen betriebsbedingten K\xFCndigung gibt es in der Regel keine Sperrzeit. Die Abfindung selbst wird nicht auf das Arbeitslosengeld angerechnet."
        }
      },
      {
        "@type": "Question",
        "name": "Wann lohnt sich eine K\xFCndigungsschutzklage?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Eine K\xFCndigungsschutzklage lohnt sich, wenn die K\xFCndigung formelle Fehler hat, betriebsbedingte Gr\xFCnde fehlen oder die Sozialauswahl falsch war. Sie st\xE4rkt die Verhandlungsposition erheblich und f\xFChrt oft zu h\xF6heren Abfindungen. Die Klage muss innerhalb von 3 Wochen nach Zugang der K\xFCndigung eingereicht werden."
        }
      }
    ]
  }))) })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/abfindung-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/abfindung-rechner.astro";
const $$url = "/abfindung-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$AbfindungRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
