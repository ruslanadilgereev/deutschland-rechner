/* empty css                                             */
import { c as createComponent, a as renderTemplate, r as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_DmT1JwUR.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const PAUSCHALEN_INLAND = {
  ab24Stunden: 32,
  // Abwesenheit von 24 Stunden
  mehr8bisUnter24: 16,
  // Mehr als 8 Stunden, aber weniger als 24
  anUndAbreise: 16
  // An- und Abreisetag bei mehrtägiger Reise
};
const PAUSCHALEN_AUSLAND = {
  AT: { land: "Österreich", ab24: 50, mehr8: 25 },
  BE: { land: "Belgien", ab24: 59, mehr8: 30 },
  CH: { land: "Schweiz", ab24: 77, mehr8: 39 },
  CZ: { land: "Tschechien", ab24: 35, mehr8: 18 },
  DK: { land: "Dänemark", ab24: 75, mehr8: 38 },
  ES: { land: "Spanien", ab24: 44, mehr8: 22 },
  FR: { land: "Frankreich", ab24: 58, mehr8: 29 },
  GB: { land: "Großbritannien (London)", ab24: 66, mehr8: 33 },
  GR: { land: "Griechenland", ab24: 40, mehr8: 20 },
  IT: { land: "Italien", ab24: 52, mehr8: 26 },
  NL: { land: "Niederlande", ab24: 53, mehr8: 27 },
  PL: { land: "Polen", ab24: 36, mehr8: 18 },
  PT: { land: "Portugal", ab24: 38, mehr8: 19 },
  SE: { land: "Schweden", ab24: 61, mehr8: 31 },
  US: { land: "USA (New York)", ab24: 66, mehr8: 33 },
  CN: { land: "China (Peking)", ab24: 51, mehr8: 26 },
  JP: { land: "Japan (Tokio)", ab24: 62, mehr8: 31 },
  AE: { land: "VAE (Dubai)", ab24: 56, mehr8: 28 },
  TR: { land: "Türkei", ab24: 39, mehr8: 20 },
  XX: { land: "Sonstige Länder", ab24: 39, mehr8: 20 }
};
const UEBERNACHTUNGSPAUSCHALE_INLAND = 20;
const KUERZUNG = {
  fruehstueck: 0.2,
  // 20% der vollen Pauschale
  mittag: 0.4,
  // 40%
  abend: 0.4
  // 40%
};
function VerpflegungsmehraufwandRechner() {
  const [reiseart, setReiseart] = useState("inland");
  const [zielland, setZielland] = useState("AT");
  const [reisedauer, setReisedauer] = useState("mehrtag");
  const [anzahlVollerTage, setAnzahlVollerTage] = useState(2);
  const [abwesenheitEintag, setAbwesenheitEintag] = useState(10);
  const [fruehstueckAnreise, setFruehstueckAnreise] = useState(false);
  const [mittagAnreise, setMittagAnreise] = useState(false);
  const [abendAnreise, setAbendAnreise] = useState(false);
  const [fruehstueckVoll, setFruehstueckVoll] = useState(false);
  const [mittagVoll, setMittagVoll] = useState(false);
  const [abendVoll, setAbendVoll] = useState(false);
  const [fruehstueckAbreise, setFruehstueckAbreise] = useState(false);
  const [mittagAbreise, setMittagAbreise] = useState(false);
  const [abendAbreise, setAbendAbreise] = useState(false);
  const [anzahlUebernachtungen, setAnzahlUebernachtungen] = useState(2);
  const [eigeneUebernachtung, setEigeneUebernachtung] = useState(false);
  const ergebnis = useMemo(() => {
    let pauschale24 = PAUSCHALEN_INLAND.ab24Stunden;
    let pauschale8 = PAUSCHALEN_INLAND.mehr8bisUnter24;
    let pauschaleAnAb = PAUSCHALEN_INLAND.anUndAbreise;
    if (reiseart === "ausland") {
      const land = PAUSCHALEN_AUSLAND[zielland] || PAUSCHALEN_AUSLAND.XX;
      pauschale24 = land.ab24;
      pauschale8 = land.mehr8;
      pauschaleAnAb = land.mehr8;
    }
    let verpflegungGesamt = 0;
    let verpflegungDetails = [];
    if (reisedauer === "eintag") {
      if (abwesenheitEintag > 8) {
        const brutto = pauschale8;
        let kuerzungen = 0;
        if (fruehstueckAnreise) kuerzungen += pauschale24 * KUERZUNG.fruehstueck;
        if (mittagAnreise) kuerzungen += pauschale24 * KUERZUNG.mittag;
        if (abendAnreise) kuerzungen += pauschale24 * KUERZUNG.abend;
        const netto = Math.max(0, brutto - kuerzungen);
        verpflegungGesamt = netto;
        verpflegungDetails.push({
          tag: `Eintägige Reise (${abwesenheitEintag}h)`,
          brutto,
          kuerzungen: Math.round(kuerzungen * 100) / 100,
          netto: Math.round(netto * 100) / 100
        });
      } else {
        verpflegungDetails.push({
          tag: `Eintägige Reise (${abwesenheitEintag}h)`,
          brutto: 0,
          kuerzungen: 0,
          netto: 0
        });
      }
    } else {
      let bruttoAnreise = pauschaleAnAb;
      let kuerzungAnreise = 0;
      if (fruehstueckAnreise) kuerzungAnreise += pauschale24 * KUERZUNG.fruehstueck;
      if (mittagAnreise) kuerzungAnreise += pauschale24 * KUERZUNG.mittag;
      if (abendAnreise) kuerzungAnreise += pauschale24 * KUERZUNG.abend;
      const nettoAnreise = Math.max(0, bruttoAnreise - kuerzungAnreise);
      verpflegungDetails.push({
        tag: "Anreisetag",
        brutto: bruttoAnreise,
        kuerzungen: Math.round(kuerzungAnreise * 100) / 100,
        netto: Math.round(nettoAnreise * 100) / 100
      });
      verpflegungGesamt += nettoAnreise;
      for (let i = 0; i < anzahlVollerTage; i++) {
        let bruttoVoll = pauschale24;
        let kuerzungVoll = 0;
        if (fruehstueckVoll) kuerzungVoll += pauschale24 * KUERZUNG.fruehstueck;
        if (mittagVoll) kuerzungVoll += pauschale24 * KUERZUNG.mittag;
        if (abendVoll) kuerzungVoll += pauschale24 * KUERZUNG.abend;
        const nettoVoll = Math.max(0, bruttoVoll - kuerzungVoll);
        verpflegungDetails.push({
          tag: `Tag ${i + 2} (24h)`,
          brutto: bruttoVoll,
          kuerzungen: Math.round(kuerzungVoll * 100) / 100,
          netto: Math.round(nettoVoll * 100) / 100
        });
        verpflegungGesamt += nettoVoll;
      }
      let bruttoAbreise = pauschaleAnAb;
      let kuerzungAbreise = 0;
      if (fruehstueckAbreise) kuerzungAbreise += pauschale24 * KUERZUNG.fruehstueck;
      if (mittagAbreise) kuerzungAbreise += pauschale24 * KUERZUNG.mittag;
      if (abendAbreise) kuerzungAbreise += pauschale24 * KUERZUNG.abend;
      const nettoAbreise = Math.max(0, bruttoAbreise - kuerzungAbreise);
      verpflegungDetails.push({
        tag: "Abreisetag",
        brutto: bruttoAbreise,
        kuerzungen: Math.round(kuerzungAbreise * 100) / 100,
        netto: Math.round(nettoAbreise * 100) / 100
      });
      verpflegungGesamt += nettoAbreise;
    }
    let uebernachtungGesamt = 0;
    if (reisedauer === "mehrtag" && !eigeneUebernachtung) {
      uebernachtungGesamt = anzahlUebernachtungen * UEBERNACHTUNGSPAUSCHALE_INLAND;
    }
    const gesamterstattung = Math.round((verpflegungGesamt + uebernachtungGesamt) * 100) / 100;
    const steuerersparnis = Math.round(gesamterstattung * 0.35 * 100) / 100;
    return {
      pauschale24,
      pauschale8,
      pauschaleAnAb,
      verpflegungDetails,
      verpflegungGesamt: Math.round(verpflegungGesamt * 100) / 100,
      uebernachtungGesamt,
      gesamterstattung,
      steuerersparnis,
      anzahlTage: reisedauer === "eintag" ? 1 : 2 + anzahlVollerTage
    };
  }, [
    reiseart,
    zielland,
    reisedauer,
    anzahlVollerTage,
    abwesenheitEintag,
    fruehstueckAnreise,
    mittagAnreise,
    abendAnreise,
    fruehstueckVoll,
    mittagVoll,
    abendVoll,
    fruehstueckAbreise,
    mittagAbreise,
    abendAbreise,
    anzahlUebernachtungen,
    eigeneUebernachtung
  ]);
  const formatEuro = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Reiseziel" }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setReiseart("inland"),
              className: `py-4 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${reiseart === "inland" ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🇩🇪" }),
                /* @__PURE__ */ jsx("span", { children: "Inland" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setReiseart("ausland"),
              className: `py-4 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${reiseart === "ausland" ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌍" }),
                /* @__PURE__ */ jsx("span", { children: "Ausland" })
              ]
            }
          )
        ] })
      ] }),
      reiseart === "ausland" && /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Zielland" }) }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: zielland,
            onChange: (e) => setZielland(e.target.value),
            className: "w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none text-lg",
            children: Object.entries(PAUSCHALEN_AUSLAND).map(([code, data]) => /* @__PURE__ */ jsxs("option", { value: code, children: [
              data.land,
              " (",
              data.ab24,
              " € / ",
              data.mehr8,
              " €)"
            ] }, code))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Art der Dienstreise" }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setReisedauer("eintag"),
              className: `py-4 px-4 rounded-xl font-medium transition-all flex flex-col items-center gap-1 ${reisedauer === "eintag" ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📅" }),
                /* @__PURE__ */ jsx("span", { children: "Eintägig" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs opacity-80", children: "ohne Übernachtung" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setReisedauer("mehrtag"),
              className: `py-4 px-4 rounded-xl font-medium transition-all flex flex-col items-center gap-1 ${reisedauer === "mehrtag" ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🗓️" }),
                /* @__PURE__ */ jsx("span", { children: "Mehrtägig" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs opacity-80", children: "mit Übernachtung" })
              ]
            }
          )
        ] })
      ] }),
      reisedauer === "eintag" && /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Abwesenheit von der Wohnung" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Pauschale gilt erst ab mehr als 8 Stunden" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setAbwesenheitEintag(Math.max(1, abwesenheitEintag - 1)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors",
              children: "−"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "text-center px-6", children: [
            /* @__PURE__ */ jsx("div", { className: "text-4xl font-bold text-gray-800", children: abwesenheitEintag }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: "Stunden" })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setAbwesenheitEintag(Math.min(24, abwesenheitEintag + 1)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors",
              children: "+"
            }
          )
        ] }),
        abwesenheitEintag <= 8 && /* @__PURE__ */ jsx("p", { className: "text-amber-600 text-sm mt-3 text-center", children: "⚠️ Bei Abwesenheit bis 8 Stunden gibt es keine Verpflegungspauschale" })
      ] }),
      reisedauer === "mehrtag" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Anzahl voller Reisetage" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Tage mit 24h Abwesenheit (zwischen An- und Abreise)" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setAnzahlVollerTage(Math.max(0, anzahlVollerTage - 1)),
                className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors",
                children: "−"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "text-center px-6", children: [
              /* @__PURE__ */ jsx("div", { className: "text-4xl font-bold text-gray-800", children: anzahlVollerTage }),
              /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: "volle Tage" })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setAnzahlVollerTage(Math.min(30, anzahlVollerTage + 1)),
                className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors",
                children: "+"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-gray-500 text-xs mt-2 text-center", children: [
            "Gesamt: 1 Anreisetag + ",
            anzahlVollerTage,
            " volle Tage + 1 Abreisetag = ",
            2 + anzahlVollerTage,
            " Tage"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Anzahl Übernachtungen" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setAnzahlUebernachtungen(Math.max(1, anzahlUebernachtungen - 1)),
                className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors",
                children: "−"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "text-center px-6", children: [
              /* @__PURE__ */ jsx("div", { className: "text-4xl font-bold text-gray-800", children: anzahlUebernachtungen }),
              /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: "Nächte" })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setAnzahlUebernachtungen(Math.min(30, anzahlUebernachtungen + 1)),
                className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors",
                children: "+"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "🍽️ Gestellte Mahlzeiten" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block mt-1", children: "Mahlzeiten die vom Arbeitgeber bezahlt werden (z.B. Hotel-Frühstück, Geschäftsessen)" })
        ] }),
        reisedauer === "eintag" ? /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-700 mb-3", children: "Eintägige Reise" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setFruehstueckAnreise(!fruehstueckAnreise),
                className: `py-2 px-3 rounded-lg text-sm transition-all ${fruehstueckAnreise ? "bg-amber-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"}`,
                children: "🥐 Frühstück"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setMittagAnreise(!mittagAnreise),
                className: `py-2 px-3 rounded-lg text-sm transition-all ${mittagAnreise ? "bg-amber-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"}`,
                children: "🍝 Mittag"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setAbendAnreise(!abendAnreise),
                className: `py-2 px-3 rounded-lg text-sm transition-all ${abendAnreise ? "bg-amber-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"}`,
                children: "🍽️ Abend"
              }
            )
          ] })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-xl p-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-700 mb-3", children: "Anreisetag" }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setFruehstueckAnreise(!fruehstueckAnreise),
                  className: `py-2 px-3 rounded-lg text-sm transition-all ${fruehstueckAnreise ? "bg-amber-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"}`,
                  children: "🥐 Frühstück"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setMittagAnreise(!mittagAnreise),
                  className: `py-2 px-3 rounded-lg text-sm transition-all ${mittagAnreise ? "bg-amber-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"}`,
                  children: "🍝 Mittag"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setAbendAnreise(!abendAnreise),
                  className: `py-2 px-3 rounded-lg text-sm transition-all ${abendAnreise ? "bg-amber-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"}`,
                  children: "🍽️ Abend"
                }
              )
            ] })
          ] }),
          anzahlVollerTage > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-xl p-4", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium text-gray-700 mb-3", children: [
              "Volle Reisetage (",
              anzahlVollerTage,
              "x)"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setFruehstueckVoll(!fruehstueckVoll),
                  className: `py-2 px-3 rounded-lg text-sm transition-all ${fruehstueckVoll ? "bg-amber-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"}`,
                  children: "🥐 Frühstück"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setMittagVoll(!mittagVoll),
                  className: `py-2 px-3 rounded-lg text-sm transition-all ${mittagVoll ? "bg-amber-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"}`,
                  children: "🍝 Mittag"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setAbendVoll(!abendVoll),
                  className: `py-2 px-3 rounded-lg text-sm transition-all ${abendVoll ? "bg-amber-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"}`,
                  children: "🍽️ Abend"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-xl p-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-700 mb-3", children: "Abreisetag" }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setFruehstueckAbreise(!fruehstueckAbreise),
                  className: `py-2 px-3 rounded-lg text-sm transition-all ${fruehstueckAbreise ? "bg-amber-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"}`,
                  children: "🥐 Frühstück"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setMittagAbreise(!mittagAbreise),
                  className: `py-2 px-3 rounded-lg text-sm transition-all ${mittagAbreise ? "bg-amber-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"}`,
                  children: "🍝 Mittag"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setAbendAbreise(!abendAbreise),
                  className: `py-2 px-3 rounded-lg text-sm transition-all ${abendAbreise ? "bg-amber-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"}`,
                  children: "🍽️ Abend"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-3", children: "💡 Kürzungen: Frühstück = 20%, Mittag/Abend = je 40% der vollen Tagespauschale" })
      ] }),
      reisedauer === "mehrtag" && /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setEigeneUebernachtung(!eigeneUebernachtung),
            className: `w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-between ${eigeneUebernachtung ? "bg-gray-400 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: [
              /* @__PURE__ */ jsx("span", { children: "🏨 Übernachtung vom Arbeitgeber bezahlt" }),
              /* @__PURE__ */ jsx("span", { children: eigeneUebernachtung ? "✓ Ja" : "✗ Nein" })
            ]
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-2", children: "Übernachtungspauschale nur, wenn Sie selbst zahlen und keinen Nachweis erbringen" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl shadow-lg p-6 text-white mb-6 bg-gradient-to-br from-green-500 to-emerald-600", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: "💰 Ihr Verpflegungsmehraufwand" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-baseline gap-2", children: /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuro(ergebnis.gesamterstattung) }) }),
        /* @__PURE__ */ jsxs("p", { className: "text-green-100 mt-2 text-sm", children: [
          "Steuerfrei erstattungsfähig für ",
          ergebnis.anzahlTage,
          " Reisetag",
          ergebnis.anzahlTage > 1 ? "e" : "",
          reiseart === "ausland" && ` nach ${PAUSCHALEN_AUSLAND[zielland]?.land || "Ausland"}`
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Verpflegung" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.verpflegungGesamt) })
        ] }),
        reisedauer === "mehrtag" && !eigeneUebernachtung && /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Übernachtung" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.uebernachtungGesamt) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm", children: /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
        /* @__PURE__ */ jsx("strong", { children: "Steuerersparnis:" }),
        " ~",
        formatEuro(ergebnis.steuerersparnis),
        /* @__PURE__ */ jsx("span", { className: "opacity-80", children: " (bei 35% Grenzsteuersatz als Werbungskosten)" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Berechnungsdetails" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide", children: [
          "Verpflegungspauschalen ",
          reiseart === "ausland" ? PAUSCHALEN_AUSLAND[zielland]?.land : "Deutschland"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-200", children: [
            /* @__PURE__ */ jsx("th", { className: "text-left py-2 font-medium text-gray-600", children: "Tag" }),
            /* @__PURE__ */ jsx("th", { className: "text-right py-2 font-medium text-gray-600", children: "Pauschale" }),
            /* @__PURE__ */ jsx("th", { className: "text-right py-2 font-medium text-gray-600", children: "Kürzung" }),
            /* @__PURE__ */ jsx("th", { className: "text-right py-2 font-medium text-gray-600", children: "Netto" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: ergebnis.verpflegungDetails.map((detail, i) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2 text-gray-700", children: detail.tag }),
            /* @__PURE__ */ jsx("td", { className: "py-2 text-right text-gray-600", children: formatEuro(detail.brutto) }),
            /* @__PURE__ */ jsx("td", { className: "py-2 text-right text-red-600", children: detail.kuerzungen > 0 ? `-${formatEuro(detail.kuerzungen)}` : "—" }),
            /* @__PURE__ */ jsx("td", { className: "py-2 text-right font-medium text-gray-800", children: formatEuro(detail.netto) })
          ] }, i)) }),
          /* @__PURE__ */ jsxs("tfoot", { children: [
            /* @__PURE__ */ jsxs("tr", { className: "bg-gray-50", children: [
              /* @__PURE__ */ jsx("td", { colSpan: 3, className: "py-2 font-medium", children: "Summe Verpflegung" }),
              /* @__PURE__ */ jsx("td", { className: "py-2 text-right font-bold text-gray-800", children: formatEuro(ergebnis.verpflegungGesamt) })
            ] }),
            reisedauer === "mehrtag" && !eigeneUebernachtung && /* @__PURE__ */ jsxs("tr", { className: "bg-gray-50", children: [
              /* @__PURE__ */ jsxs("td", { colSpan: 3, className: "py-2 font-medium", children: [
                "+ Übernachtungspauschale (",
                anzahlUebernachtungen,
                " × ",
                UEBERNACHTUNGSPAUSCHALE_INLAND,
                " €)"
              ] }),
              /* @__PURE__ */ jsx("td", { className: "py-2 text-right font-bold text-gray-800", children: formatEuro(ergebnis.uebernachtungGesamt) })
            ] }),
            /* @__PURE__ */ jsxs("tr", { className: "bg-green-100", children: [
              /* @__PURE__ */ jsx("td", { colSpan: 3, className: "py-3 font-bold text-green-800", children: "Gesamt erstattungsfähig" }),
              /* @__PURE__ */ jsx("td", { className: "py-3 text-right font-bold text-xl text-green-800", children: formatEuro(ergebnis.gesamterstattung) })
            ] })
          ] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📋 Aktuelle Pauschalen 2025/2026" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-blue-900 mb-2", children: "🇩🇪 Inland (Deutschland)" }),
          /* @__PURE__ */ jsxs("ul", { className: "text-sm text-blue-700 space-y-1", children: [
            /* @__PURE__ */ jsxs("li", { children: [
              "• 24h Abwesenheit: ",
              /* @__PURE__ */ jsxs("strong", { children: [
                PAUSCHALEN_INLAND.ab24Stunden,
                " €"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              "• >8h bis <24h: ",
              /* @__PURE__ */ jsxs("strong", { children: [
                PAUSCHALEN_INLAND.mehr8bisUnter24,
                " €"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              "• An-/Abreisetag: ",
              /* @__PURE__ */ jsxs("strong", { children: [
                PAUSCHALEN_INLAND.anUndAbreise,
                " €"
              ] })
            ] })
          ] })
        ] }),
        reiseart === "ausland" && /* @__PURE__ */ jsxs("div", { className: "bg-green-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsxs("p", { className: "font-semibold text-green-900 mb-2", children: [
            "🌍 ",
            PAUSCHALEN_AUSLAND[zielland]?.land || "Ausland"
          ] }),
          /* @__PURE__ */ jsxs("ul", { className: "text-sm text-green-700 space-y-1", children: [
            /* @__PURE__ */ jsxs("li", { children: [
              "• 24h Abwesenheit: ",
              /* @__PURE__ */ jsxs("strong", { children: [
                ergebnis.pauschale24,
                " €"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              "• >8h bis <24h / An-/Abreise: ",
              /* @__PURE__ */ jsxs("strong", { children: [
                ergebnis.pauschale8,
                " €"
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 rounded-xl p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "font-semibold text-amber-900 mb-2", children: "🍽️ Kürzungen bei gestellten Mahlzeiten" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-amber-700 mb-2", children: [
          "Bezogen auf die volle Tagespauschale (",
          reiseart === "ausland" ? ergebnis.pauschale24 : PAUSCHALEN_INLAND.ab24Stunden,
          " €):"
        ] }),
        /* @__PURE__ */ jsxs("ul", { className: "text-sm text-amber-700 space-y-1", children: [
          /* @__PURE__ */ jsxs("li", { children: [
            "• Frühstück: ",
            /* @__PURE__ */ jsx("strong", { children: "-20%" }),
            " = -",
            formatEuro((reiseart === "ausland" ? ergebnis.pauschale24 : PAUSCHALEN_INLAND.ab24Stunden) * 0.2)
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            "• Mittagessen: ",
            /* @__PURE__ */ jsx("strong", { children: "-40%" }),
            " = -",
            formatEuro((reiseart === "ausland" ? ergebnis.pauschale24 : PAUSCHALEN_INLAND.ab24Stunden) * 0.4)
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            "• Abendessen: ",
            /* @__PURE__ */ jsx("strong", { children: "-40%" }),
            " = -",
            formatEuro((reiseart === "ausland" ? ergebnis.pauschale24 : PAUSCHALEN_INLAND.ab24Stunden) * 0.4)
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert der Verpflegungsmehraufwand" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Steuerfreie Erstattung:" }),
            " Arbeitgeber kann Pauschalen steuerfrei erstatten"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Werbungskosten:" }),
            " Ohne Erstattung als Werbungskosten absetzbar"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Keine Nachweise:" }),
            " Pauschalen gelten ohne Einzelnachweise für Mahlzeiten"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Kürzungspflicht:" }),
            " Bei gestellten Mahlzeiten muss gekürzt werden"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "3-Monatsfrist:" }),
            " Bei Langzeitdienstreise sinkt Pauschale nach 3 Monaten"
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
            /* @__PURE__ */ jsx("strong", { children: "Auswärtstätigkeit:" }),
            " Pauschalen nur bei beruflich veranlassten Reisen außerhalb der ersten Tätigkeitsstätte"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Dreimonatsfrist:" }),
            " Nach 3 Monaten an derselben Tätigkeitsstätte entfällt der Anspruch"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Dokumentation:" }),
            " Reisezweck, Datum, Dauer und Ziel sollten dokumentiert werden"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Übernachtung:" }),
            " Die Pauschale von 20 € gilt nur ohne Nachweis – mit Belegen sind höhere Kosten absetzbar"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Ausland:" }),
            " Bei Auslandsreisen gilt am An- und Abreisetag der Satz des Landes mit der geringeren Pauschale"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Informationen & Antrag" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-blue-900", children: "Finanzamt" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-700 mt-1", children: 'Verpflegungsmehraufwand wird über die Einkommensteuererklärung als Werbungskosten geltend gemacht (Anlage N, Zeile „Reisekosten").' })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📋" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Benötigte Angaben" }),
              /* @__PURE__ */ jsxs("ul", { className: "text-gray-600 mt-1 text-xs space-y-1", children: [
                /* @__PURE__ */ jsx("li", { children: "• Datum und Dauer der Reise" }),
                /* @__PURE__ */ jsx("li", { children: "• Reiseziel und Anlass" }),
                /* @__PURE__ */ jsx("li", { children: "• Erhaltene Erstattungen" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Offizielle Pauschalen" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Lohnsteuer/2023-11-21-steuerliche-behandlung-reisekosten-reisekostenverguetungen.html",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline text-xs",
                  children: "BMF-Schreiben →"
                }
              )
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
            href: "https://www.gesetze-im-internet.de/estg/__9.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "§ 9 EStG – Werbungskosten"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Lohnsteuer/2023-11-21-steuerliche-behandlung-reisekosten-reisekostenverguetungen.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BMF – Steuerliche Behandlung von Reisekosten"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.haufe.de/steuern/steuer-office-gold/verpflegungsmehraufwendungen_idesk_PI11525_HI1119281.html",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Haufe – Verpflegungsmehraufwendungen"
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
const $$VerpflegungsmehraufwandRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "Verpflegungsmehraufwand-Rechner 2025/2026 \u2013 Spesen & Pauschalen berechnen";
  const description = "Verpflegungsmehraufwand berechnen: Spesen-Pauschalen f\xFCr Dienstreisen 2025/2026. Inland 32\u20AC/16\u20AC, Ausland nach Land. Mit K\xFCrzungen f\xFCr gestellte Mahlzeiten.";
  const keywords = "Verpflegungsmehraufwand Rechner, Spesen Rechner, Dienstreise Pauschale, Verpflegungspauschale 2025, Verpflegungspauschale 2026, Reisekosten absetzen, Tagespauschale Dienstreise, Spesen berechnen, Auslandspauschale, Reisekostenabrechnung, Verpflegungsmehraufwand Steuererkl\xE4rung, Werbungskosten Reise";
  return renderTemplate(_a || (_a = __template(["", ' <script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [\n    {\n      "@type": "Question",\n      "name": "Wie hoch ist der Verpflegungsmehraufwand 2025?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "Bei Inlandsreisen betr\xE4gt die Pauschale 32 \u20AC bei 24 Stunden Abwesenheit, 16 \u20AC bei mehr als 8 Stunden Abwesenheit. An- und Abreisetage bei mehrt\xE4gigen Reisen: jeweils 16 \u20AC."\n      }\n    },\n    {\n      "@type": "Question",\n      "name": "Wie werden Mahlzeiten vom Arbeitgeber angerechnet?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "Gestellte Mahlzeiten k\xFCrzen die Pauschale: Fr\xFChst\xFCck um 20% (6,40 \u20AC), Mittagessen um 40% (12,80 \u20AC), Abendessen um 40% (12,80 \u20AC) \u2013 jeweils bezogen auf die volle Tagespauschale von 32 \u20AC."\n      }\n    },\n    {\n      "@type": "Question",\n      "name": "Was ist die Dreimonatsfrist beim Verpflegungsmehraufwand?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "Nach drei Monaten an derselben ausw\xE4rtigen T\xE4tigkeitsst\xE4tte entf\xE4llt der Anspruch auf Verpflegungspauschalen. Die Frist beginnt neu bei einer Unterbrechung von mindestens vier Wochen."\n      }\n    },\n    {\n      "@type": "Question",\n      "name": "Kann ich Verpflegungsmehraufwand ohne Erstattung vom Arbeitgeber absetzen?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "Ja, wenn der Arbeitgeber die Pauschalen nicht oder nur teilweise erstattet, k\xF6nnen Sie den Verpflegungsmehraufwand als Werbungskosten in der Steuererkl\xE4rung (Anlage N) geltend machen."\n      }\n    }\n  ]\n}\n<\/script> <script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebApplication",\n  "name": "Verpflegungsmehraufwand-Rechner 2025/2026",\n  "description": "Berechnen Sie Ihren Verpflegungsmehraufwand f\xFCr Dienstreisen: Aktuelle Pauschalen f\xFCr In- und Ausland, mit K\xFCrzungen bei gestellten Mahlzeiten.",\n  "url": "https://deutschland-rechner.de/verpflegungsmehraufwand-rechner",\n  "applicationCategory": "FinanceApplication",\n  "operatingSystem": "Web",\n  "offers": {\n    "@type": "Offer",\n    "price": "0",\n    "priceCurrency": "EUR"\n  }\n}\n<\/script>'])), renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4"> <div class="max-w-2xl mx-auto"> <!-- Header --> <div class="text-center mb-8"> <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4"> <span class="text-4xl">🍽️</span> </div> <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
Verpflegungsmehraufwand-Rechner 2025/2026
</h1> <p class="text-gray-600 max-w-lg mx-auto">
Berechnen Sie Ihre Spesen-Pauschalen für Dienstreisen – steuerfrei erstattbar oder als Werbungskosten absetzbar.
</p> </div> <!-- Calculator Component --> ${renderComponent($$result2, "VerpflegungsmehraufwandRechner", VerpflegungsmehraufwandRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/VerpflegungsmehraufwandRechner.tsx", "client:component-export": "default" })} <!-- SEO Content Section --> <div class="mt-12 bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">📚 Alles Wichtige zum Verpflegungsmehraufwand</h2> <div class="space-y-4 text-sm text-gray-600"> <div> <h3 class="font-semibold text-gray-800 mb-2">Was ist der Verpflegungsmehraufwand?</h3> <p>
Der Verpflegungsmehraufwand (VMA) ist eine steuerfreie Pauschale für Mehrkosten bei 
              der Verpflegung während beruflicher Auswärtstätigkeiten. Anders als bei anderen Kosten 
              müssen Sie keine Einzelbelege sammeln – es gelten feste Pauschalen, die das 
              Bundesfinanzministerium jährlich veröffentlicht.
</p> </div> <div> <h3 class="font-semibold text-gray-800 mb-2">Wer hat Anspruch auf Verpflegungspauschalen?</h3> <p>
Arbeitnehmer auf Dienstreisen, Selbstständige bei Geschäftsreisen und Unternehmer 
              können den Verpflegungsmehraufwand geltend machen. Voraussetzung ist eine
<strong>auswärtige berufliche Tätigkeit</strong> – Sie müssen also außerhalb Ihrer 
              ersten Tätigkeitsstätte (Arbeitsplatz) und Wohnung unterwegs sein.
</p> </div> <div> <h3 class="font-semibold text-gray-800 mb-2">Aktuelle Pauschalen 2025/2026 Inland</h3> <ul class="list-disc pl-5 space-y-1 mt-2"> <li><strong>24 Stunden Abwesenheit:</strong> 32 € pro Tag</li> <li><strong>Mehr als 8 Stunden:</strong> 16 € pro Tag</li> <li><strong>An- und Abreisetag:</strong> 16 € (bei mehrtägigen Reisen)</li> </ul> </div> <div> <h3 class="font-semibold text-gray-800 mb-2">Kürzungen bei gestellten Mahlzeiten</h3> <p>
Wenn Ihr Arbeitgeber Mahlzeiten bezahlt (z.B. Hotel-Frühstück, Geschäftsessen), 
              wird die Pauschale gekürzt:
</p> <ul class="list-disc pl-5 space-y-1 mt-2"> <li><strong>Frühstück:</strong> −20% der vollen Tagespauschale (−6,40 €)</li> <li><strong>Mittagessen:</strong> −40% der vollen Tagespauschale (−12,80 €)</li> <li><strong>Abendessen:</strong> −40% der vollen Tagespauschale (−12,80 €)</li> </ul> </div> <div> <h3 class="font-semibold text-gray-800 mb-2">Dreimonatsfrist beachten</h3> <p>
Wichtig: Nach <strong>drei Monaten</strong> an derselben auswärtigen Tätigkeitsstätte 
              entfällt der Anspruch auf Verpflegungspauschalen. Die Frist beginnt neu, wenn die 
              Tätigkeit für mindestens vier Wochen unterbrochen wird.
</p> </div> </div> </div> <!-- FAQ Schema --> <div class="mt-8 bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">❓ Häufige Fragen zum Verpflegungsmehraufwand</h2> <div class="space-y-4"> <details class="group"> <summary class="cursor-pointer font-medium text-gray-800 hover:text-green-600">
Wie wird der Verpflegungsmehraufwand in der Steuererklärung angegeben?
</summary> <p class="mt-2 text-sm text-gray-600 pl-4">
Als Arbeitnehmer tragen Sie den Verpflegungsmehraufwand in der <strong>Anlage N</strong>
im Bereich „Reisekosten" ein. Die Differenz zwischen Pauschale und erhaltener 
              Arbeitgeber-Erstattung können Sie als Werbungskosten absetzen. Selbstständige 
              erfassen die Kosten als Betriebsausgaben.
</p> </details> <details class="group"> <summary class="cursor-pointer font-medium text-gray-800 hover:text-green-600">
Kann der Arbeitgeber die Pauschalen steuerfrei erstatten?
</summary> <p class="mt-2 text-sm text-gray-600 pl-4">
Ja, der Arbeitgeber kann die Verpflegungspauschalen <strong>steuerfrei erstatten</strong>. 
              Dies ist für beide Seiten vorteilhaft: Der Arbeitnehmer erhält das Geld netto, und 
              der Arbeitgeber spart Lohnnebenkosten. Die Erstattung muss dokumentiert werden.
</p> </details> <details class="group"> <summary class="cursor-pointer font-medium text-gray-800 hover:text-green-600">
Was gilt bei Auslandsreisen?
</summary> <p class="mt-2 text-sm text-gray-600 pl-4">
Für Auslandsreisen gelten <strong>länderspezifische Pauschalen</strong>, die das 
              BMF jährlich veröffentlicht. Am An- und Abreisetag gilt jeweils der Satz des 
              Landes mit der niedrigeren Pauschale (Inland vs. Ausland). Innerhalb eines 
              Landes gilt dessen volle Pauschale.
</p> </details> <details class="group"> <summary class="cursor-pointer font-medium text-gray-800 hover:text-green-600">
Muss ich Belege für Mahlzeiten sammeln?
</summary> <p class="mt-2 text-sm text-gray-600 pl-4"> <strong>Nein</strong>, die Verpflegungspauschalen sind pauschal – Sie müssen keine 
              Einzelbelege für Mahlzeiten sammeln oder vorlegen. Sie sollten aber dokumentieren: 
              Datum, Dauer, Ziel und Anlass der Reise. Bei gestellten Mahlzeiten (z.B. 
              im Hotel) muss entsprechend gekürzt werden.
</p> </details> <details class="group"> <summary class="cursor-pointer font-medium text-gray-800 hover:text-green-600">
Gilt die Pauschale auch bei Heimarbeit/Homeoffice?
</summary> <p class="mt-2 text-sm text-gray-600 pl-4"> <strong>Nein</strong>, bei Arbeit von zu Hause gibt es keinen Verpflegungsmehraufwand, 
              da Sie sich nicht auswärts aufhalten. Für Homeoffice gibt es stattdessen die
<a href="/homeoffice-pauschale-rechner" class="text-green-600 hover:underline">
Homeoffice-Pauschale</a> von 6 € pro Tag (max. 1.260 € im Jahr).
</p> </details> </div> </div> <!-- Back Link --> <div class="mt-8 text-center"> <a href="/" class="inline-flex items-center gap-2 text-green-600 hover:text-green-800 font-medium">
← Alle Rechner anzeigen
</a> </div> </div> </main> ` }));
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/verpflegungsmehraufwand-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/verpflegungsmehraufwand-rechner.astro";
const $$url = "/verpflegungsmehraufwand-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$VerpflegungsmehraufwandRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
