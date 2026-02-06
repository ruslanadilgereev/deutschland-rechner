/* empty css                                             */
import { c as createComponent, r as renderComponent, a as renderTemplate, u as unescapeHTML, m as maybeRenderHead } from '../chunks/astro/server_Bf3RW9Fp.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_v22DC8tm.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const BAFOEG_SAETZE = {
  grundbedarf: 475,
  // Grundbedarf
  wohnpauschale_eltern: 62,
  // Bei Eltern wohnend
  wohnpauschale_eigene: 380,
  // Eigene Wohnung
  kv_pv_zuschlag: 137
  // KV + PV Zuschlag zusammen (wenn selbst versichert)
};
const FREIBETRAEGE = {
  eltern_verheiratet: 2485,
  // Netto-Freibetrag verheiratete Eltern
  eltern_alleinerziehend: 1655,
  // Netto-Freibetrag alleinerziehend
  zusatz_pro_kind: 730,
  // Zusätzlich pro unterhaltsberechtigtem Kind
  eigenes_einkommen: 603,
  // Minijob-Grenze 2026 (brutto) - erhöht von 556€
  vermoegen_unter_30: 15e3,
  // Vermögensfreibetrag < 30 Jahre
  vermoegen_ab_30: 45e3
  // Vermögensfreibetrag ≥ 30 Jahre
};
const ANRECHNUNG = {
  elterneinkommen: 0.45,
  // 100% nach Freibetrag
  vermoegen: 1 / 12
  // Monatliche Anrechnung
};
function BafoegRechner() {
  const [ausbildungsart, setAusbildungsart] = useState("studium");
  const [wohnsituation, setWohnsituation] = useState("eigene");
  const [alter, setAlter] = useState(22);
  const [selbstVersichert, setSelbstVersichert] = useState(false);
  const [elternFamilienstand, setElternFamilienstand] = useState("verheiratet");
  const [elternNettoeinkommen, setElternNettoeinkommen] = useState(3500);
  const [geschwisterAnzahl, setGeschwisterAnzahl] = useState(0);
  const [eigenesEinkommen, setEigenesEinkommen] = useState(0);
  const [vermoegen, setVermoegen] = useState(0);
  const ergebnis = useMemo(() => {
    let bedarf = BAFOEG_SAETZE.grundbedarf;
    if (wohnsituation === "eigene") {
      bedarf += BAFOEG_SAETZE.wohnpauschale_eigene;
    } else {
      bedarf += BAFOEG_SAETZE.wohnpauschale_eltern;
    }
    let kvPvZuschlag = 0;
    if (selbstVersichert) {
      kvPvZuschlag = BAFOEG_SAETZE.kv_pv_zuschlag;
      bedarf += kvPvZuschlag;
    }
    let elternFreibetrag = elternFamilienstand === "verheiratet" ? FREIBETRAEGE.eltern_verheiratet : FREIBETRAEGE.eltern_alleinerziehend;
    if (elternFamilienstand === "getrennt") {
      elternFreibetrag = FREIBETRAEGE.eltern_alleinerziehend * 2;
    }
    const geschwisterFreibetrag = geschwisterAnzahl * FREIBETRAEGE.zusatz_pro_kind;
    elternFreibetrag += geschwisterFreibetrag;
    const uebersteigendesEinkommen = Math.max(0, elternNettoeinkommen - elternFreibetrag);
    const elternAnrechnung = Math.round(uebersteigendesEinkommen * ANRECHNUNG.elterneinkommen);
    const uebersteigendesEigenes = Math.max(0, eigenesEinkommen - FREIBETRAEGE.eigenes_einkommen);
    const eigenesAnrechnung = Math.round(uebersteigendesEigenes * 0.787);
    const vermoegensFreibetrag = alter >= 30 ? FREIBETRAEGE.vermoegen_ab_30 : FREIBETRAEGE.vermoegen_unter_30;
    const uebersteigendesVermoegen = Math.max(0, vermoegen - vermoegensFreibetrag);
    const vermoegenAnrechnung = Math.round(uebersteigendesVermoegen * ANRECHNUNG.vermoegen);
    const gesamtAnrechnung = elternAnrechnung + eigenesAnrechnung + vermoegenAnrechnung;
    const foerderung = Math.max(0, bedarf - gesamtAnrechnung);
    const istVollfoerderung = foerderung >= bedarf * 0.9;
    const darlehensAnteil = ausbildungsart === "studium" ? Math.round(foerderung * 0.5) : 0;
    const zuschussAnteil = foerderung - darlehensAnteil;
    return {
      bedarf,
      grundbedarf: BAFOEG_SAETZE.grundbedarf,
      wohnpauschale: wohnsituation === "eigene" ? BAFOEG_SAETZE.wohnpauschale_eigene : BAFOEG_SAETZE.wohnpauschale_eltern,
      kvPvZuschlag,
      elternFreibetrag,
      geschwisterFreibetrag,
      elternAnrechnung,
      eigenesAnrechnung,
      vermoegenAnrechnung,
      vermoegensFreibetrag,
      gesamtAnrechnung,
      foerderung,
      darlehensAnteil,
      zuschussAnteil,
      istVollfoerderung,
      hatAnspruch: foerderung > 0,
      hoechstsatz: bedarf
    };
  }, [ausbildungsart, wohnsituation, alter, selbstVersichert, elternFamilienstand, elternNettoeinkommen, geschwisterAnzahl, eigenesEinkommen, vermoegen]);
  const formatEuro = (n) => n.toLocaleString("de-DE") + " €";
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Ausbildungsart" }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setAusbildungsart("studium"),
              className: `p-4 rounded-xl text-center transition-all ${ausbildungsart === "studium" ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🎓" }),
                /* @__PURE__ */ jsx("div", { className: "font-bold mt-1", children: "Studium" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs mt-1 opacity-80", children: "Hochschule / Uni" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setAusbildungsart("schule"),
              className: `p-4 rounded-xl text-center transition-all ${ausbildungsart === "schule" ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "📚" }),
                /* @__PURE__ */ jsx("div", { className: "font-bold mt-1", children: "Schüler-BAföG" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs mt-1 opacity-80", children: "Fachschule etc." })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Wohnsituation" }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setWohnsituation("eltern"),
              className: `p-4 rounded-xl text-center transition-all ${wohnsituation === "eltern" ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🏠" }),
                /* @__PURE__ */ jsx("div", { className: "font-bold mt-1", children: "Bei Eltern" }),
                /* @__PURE__ */ jsxs("div", { className: "text-xs mt-1 opacity-80", children: [
                  "+",
                  formatEuro(BAFOEG_SAETZE.wohnpauschale_eltern)
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setWohnsituation("eigene"),
              className: `p-4 rounded-xl text-center transition-all ${wohnsituation === "eigene" ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🏢" }),
                /* @__PURE__ */ jsx("div", { className: "font-bold mt-1", children: "Eigene Wohnung" }),
                /* @__PURE__ */ jsxs("div", { className: "text-xs mt-1 opacity-80", children: [
                  "+",
                  formatEuro(BAFOEG_SAETZE.wohnpauschale_eigene)
                ] })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6 grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Dein Alter" }) }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: alter,
              onChange: (e) => setAlter(Math.max(16, Math.min(45, Number(e.target.value)))),
              className: "w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
              min: "16",
              max: "45"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Krankenversicherung" }) }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSelbstVersichert(!selbstVersichert),
              className: `w-full py-3 px-4 rounded-xl font-medium transition-all ${selbstVersichert ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: selbstVersichert ? "✓ Selbst versichert" : "Familienversichert"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Familiensituation deiner Eltern" }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setElternFamilienstand("verheiratet"),
              className: `p-3 rounded-xl text-center transition-all text-sm ${elternFamilienstand === "verheiratet" ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("div", { className: "text-lg", children: "💑" }),
                /* @__PURE__ */ jsx("div", { className: "font-medium", children: "Verheiratet" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setElternFamilienstand("alleinerziehend"),
              className: `p-3 rounded-xl text-center transition-all text-sm ${elternFamilienstand === "alleinerziehend" ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("div", { className: "text-lg", children: "👤" }),
                /* @__PURE__ */ jsx("div", { className: "font-medium", children: "Alleinerziehend" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setElternFamilienstand("getrennt"),
              className: `p-3 rounded-xl text-center transition-all text-sm ${elternFamilienstand === "getrennt" ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
              children: [
                /* @__PURE__ */ jsx("div", { className: "text-lg", children: "👥" }),
                /* @__PURE__ */ jsx("div", { className: "font-medium", children: "Getrennt" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Nettoeinkommen der Eltern" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 ml-2", children: "(monatlich, gesamt)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: elternNettoeinkommen,
              onChange: (e) => setElternNettoeinkommen(Math.max(0, Number(e.target.value))),
              className: "w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
              min: "0",
              step: "100"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400", children: "€" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
          "Freibetrag: ",
          formatEuro(ergebnis.elternFreibetrag)
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Unterhaltsberechtigte Geschwister" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 ml-2", children: "(in Ausbildung, kein eigenes Einkommen)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setGeschwisterAnzahl(Math.max(0, geschwisterAnzahl - 1)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold",
              children: "−"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-3xl font-bold text-gray-800 w-12 text-center", children: geschwisterAnzahl }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setGeschwisterAnzahl(Math.min(6, geschwisterAnzahl + 1)),
              className: "w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold",
              children: "+"
            }
          ),
          geschwisterAnzahl > 0 && /* @__PURE__ */ jsxs("span", { className: "text-sm text-green-600", children: [
            "+",
            formatEuro(ergebnis.geschwisterFreibetrag),
            " Freibetrag"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Dein monatliches Einkommen" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 ml-2", children: "(Nebenjob brutto)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: eigenesEinkommen,
              onChange: (e) => setEigenesEinkommen(Math.max(0, Number(e.target.value))),
              className: "w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
              min: "0",
              step: "50"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400", children: "€" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
          "Freibetrag: ",
          formatEuro(FREIBETRAEGE.eigenes_einkommen),
          " (Minijob-Grenze 2026)"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Dein Vermögen" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 ml-2", children: "(Sparbuch, Aktien, etc.)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: vermoegen,
              onChange: (e) => setVermoegen(Math.max(0, Number(e.target.value))),
              className: "w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none",
              min: "0",
              step: "1000"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400", children: "€" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
          "Freibetrag: ",
          formatEuro(ergebnis.vermoegensFreibetrag),
          " (unter/ab 30 Jahre)"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: `rounded-2xl shadow-lg p-6 text-white mb-6 ${ergebnis.hatAnspruch ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-gradient-to-br from-gray-500 to-gray-600"}`, children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium opacity-80 mb-1", children: ergebnis.hatAnspruch ? "Dein BAföG-Anspruch" : "Vermutlich kein Anspruch" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: formatEuro(ergebnis.foerderung) }),
          /* @__PURE__ */ jsx("span", { className: "text-xl opacity-80", children: "/ Monat" })
        ] }),
        ergebnis.hatAnspruch && ergebnis.istVollfoerderung && /* @__PURE__ */ jsx("span", { className: "inline-block mt-2 bg-white/20 px-2 py-1 rounded text-sm", children: "✨ Höchstsatz erreicht!" })
      ] }),
      ergebnis.hatAnspruch && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Pro Semester" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.foerderung * 6) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Pro Jahr" }),
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold", children: formatEuro(ergebnis.foerderung * 12) })
        ] })
      ] }),
      ergebnis.hatAnspruch && ausbildungsart === "studium" && /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-3 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "opacity-80", children: "💸 Zuschuss (geschenkt)" }),
          /* @__PURE__ */ jsx("div", { className: "text-lg font-bold", children: formatEuro(ergebnis.zuschussAnteil) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "opacity-80", children: "🔄 Darlehen (zinsfrei)" }),
          /* @__PURE__ */ jsx("div", { className: "text-lg font-bold", children: formatEuro(ergebnis.darlehensAnteil) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Berechnung im Detail" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide pt-2", children: "Dein Bedarf" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Grundbedarf" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.grundbedarf) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
            "+ Wohnpauschale (",
            wohnsituation === "eigene" ? "eigene Wohnung" : "bei Eltern",
            ")"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.wohnpauschale) })
        ] }),
        selbstVersichert && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "+ KV/PV-Zuschlag" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900", children: formatEuro(ergebnis.kvPvZuschlag) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-200 bg-blue-50 -mx-6 px-6", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-blue-700", children: "= Dein Bedarf (Höchstsatz)" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-blue-900", children: formatEuro(ergebnis.bedarf) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-500 text-xs uppercase tracking-wide pt-4", children: "Anrechnungen" }),
        elternNettoeinkommen > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-red-600", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "Elterneinkommen (",
            formatEuro(elternNettoeinkommen),
            " − ",
            formatEuro(ergebnis.elternFreibetrag),
            " × 45%)"
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "− ",
            formatEuro(ergebnis.elternAnrechnung)
          ] })
        ] }),
        eigenesEinkommen > FREIBETRAEGE.eigenes_einkommen && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-red-600", children: [
          /* @__PURE__ */ jsx("span", { children: "Eigenes Einkommen" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "− ",
            formatEuro(ergebnis.eigenesAnrechnung)
          ] })
        ] }),
        vermoegen > ergebnis.vermoegensFreibetrag && /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100 text-red-600", children: [
          /* @__PURE__ */ jsx("span", { children: "Vermögen (monatlich)" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "− ",
            formatEuro(ergebnis.vermoegenAnrechnung)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `flex justify-between py-3 -mx-6 px-6 rounded-b-2xl ${ergebnis.hatAnspruch ? "bg-blue-50" : "bg-gray-100"}`, children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-800", children: "BAföG-Anspruch" }),
          /* @__PURE__ */ jsx("span", { className: `font-bold text-xl ${ergebnis.hatAnspruch ? "text-blue-600" : "text-gray-600"}`, children: formatEuro(ergebnis.foerderung) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert BAföG" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "50% Zuschuss" }),
            " (geschenkt) + 50% zinsfreies Darlehen"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Max. 10.010 € Rückzahlung" }),
            " – egal wie viel du bekommst"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "603 € Nebenjob" }),
            " anrechnungsfrei (Minijob-Grenze 2026)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Vermögensfreibetrag:" }),
            " 15.000 € (unter 30) / 45.000 € (ab 30)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Schüler-BAföG:" }),
            " Komplett geschenkt (kein Darlehen)"
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
            "Dies ist eine ",
            /* @__PURE__ */ jsx("strong", { children: "Schätzung" }),
            ". Die tatsächliche Berechnung erfolgt durch das BAföG-Amt."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Das ",
            /* @__PURE__ */ jsx("strong", { children: "Brutto-Einkommen der Eltern" }),
            " wird vom Amt in Netto umgerechnet (komplexe Formel)."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsx("span", { children: "Elternunabhängiges BAföG möglich bei: 5 Jahre Erwerbstätigkeit, Ausbildung + 3 Jahre Job, oder ab 30 Jahren." })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Antrag stellen!" }),
            " BAföG wird nicht rückwirkend gezahlt – erst ab Antragsmonat."
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-blue-800 mb-3", children: "🔮 Ausblick: BAföG-Reform WS 2026/27" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-blue-700 mb-2", children: [
        "Laut Koalitionsvertrag 2025 sind zum ",
        /* @__PURE__ */ jsx("strong", { children: "Wintersemester 2026/27" }),
        " folgende Änderungen geplant:"
      ] }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-1 text-sm text-blue-700", children: [
        /* @__PURE__ */ jsxs("li", { children: [
          "• ",
          /* @__PURE__ */ jsx("strong", { children: "Wohnpauschale:" }),
          " Erhöhung von 380 € auf 440 € (+60 €)"
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          "• ",
          /* @__PURE__ */ jsx("strong", { children: "Grundbedarf:" }),
          " Schrittweise Anhebung Richtung Bürgergeld-Niveau (563 €)"
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          "• ",
          /* @__PURE__ */ jsx("strong", { children: "Freibeträge:" }),
          " Dynamisierung geplant"
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-blue-600 mt-2", children: "Stand: Februar 2026. Diese Änderungen sind noch nicht in Kraft und müssen noch beschlossen werden." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Zuständige Behörde" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-blue-900", children: "Studierendenwerk / BAföG-Amt" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-700 mt-1", children: "Zuständig ist das BAföG-Amt am Standort deiner Hochschule." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Online beantragen" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.bafoeg-digital.de",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "bafoeg-digital.de →"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "BAföG-Hotline" }),
              /* @__PURE__ */ jsx("a", { href: "tel:08002236341", className: "text-blue-600 hover:underline font-mono", children: "0800 223 63 41" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Kostenfrei" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📋" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Benötigte Unterlagen" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Einkommensnachweise der Eltern, Immatrikulationsbescheinigung, Mietvertrag, Kontoauszüge" })
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
            href: "https://www.bafög.de",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Offizielles BAföG-Portal des BMBF"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.studentenwerke.de/de/content/baf%C3%B6g-beantragen",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Deutsches Studierendenwerk – BAföG beantragen"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/baf_g/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BAföG-Gesetz (Bundesausbildungsförderungsgesetz)"
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
const $$BafoegRechner = createComponent(($$result, $$props, $$slots) => {
  const title = "BAf\xF6G-Rechner 2026 \u2013 Anspruch & H\xF6he berechnen | 603\u20AC Minijob-Freibetrag";
  const description = "BAf\xF6G berechnen 2026: Pr\xFCfe deinen Anspruch auf Studenten-BAf\xF6G oder Sch\xFCler-BAf\xF6G. H\xF6chstsatz 992\u20AC, neuer Minijob-Freibetrag 603\u20AC, Elterneinkommen-Rechner & Freibetr\xE4ge.";
  const keywords = "BAf\xF6G Rechner, BAf\xF6G berechnen, BAf\xF6G 2026, BAf\xF6G H\xF6he, Studenten BAf\xF6G, Sch\xFCler BAf\xF6G, BAf\xF6G Anspruch, BAf\xF6G H\xF6chstsatz, BAf\xF6G Elterneinkommen, BAf\xF6G Freibetrag, BAf\xF6G 603 Euro";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "description": description, "keywords": keywords }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", '<main class="min-h-screen pb-8"> <!-- Header mit Zur\xFCck-Button --> <header class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>\nAlle Rechner\n</a> <div class="flex items-center gap-3"> <span class="text-4xl">\u{1F393}</span> <div> <h1 class="text-2xl font-bold">BAf\xF6G-Rechner</h1> <p class="text-blue-100 text-sm">Bedarfss\xE4tze 2026 | Minijob-Freibetrag 603\u20AC</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ', ' </div> <!-- SEO Content Section --> <div class="max-w-2xl mx-auto px-4 mt-8"> <div class="bg-white rounded-2xl shadow-lg p-6"> <h2 class="text-xl font-bold text-gray-800 mb-4">BAf\xF6G 2026: Alles Wichtige zur Studienf\xF6rderung</h2> <div class="prose prose-sm text-gray-600 space-y-4"> <p>\nDas <strong>BAf\xF6G (Bundesausbildungsf\xF6rderungsgesetz)</strong> unterst\xFCtzt Studierende und Sch\xFCler, \n            deren Eltern die Ausbildung nicht vollst\xE4ndig finanzieren k\xF6nnen. Der <strong>BAf\xF6G-H\xF6chstsatz 2026</strong>\nbetr\xE4gt bis zu <strong>992 \u20AC monatlich</strong> f\xFCr Studierende mit eigener Wohnung.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">BAf\xF6G-Bedarfss\xE4tze 2026</h3> <ul class="list-disc pl-5 space-y-1"> <li><strong>Grundbedarf:</strong> 475 \u20AC monatlich</li> <li><strong>Wohnpauschale:</strong> 380 \u20AC (eigene Wohnung) oder 62 \u20AC (bei Eltern)</li> <li><strong>KV/PV-Zuschlag:</strong> 137 \u20AC (bei eigener Kranken- und Pflegeversicherung)</li> <li><strong>Minijob-Freibetrag:</strong> 603 \u20AC monatlich (erh\xF6ht ab 01.01.2026)</li> </ul> <h3 class="text-lg font-semibold text-gray-800 mt-6">Wie wird BAf\xF6G berechnet?</h3> <p>\nDie BAf\xF6G-Berechnung ber\xFCcksichtigt das <strong>Einkommen der Eltern</strong>, dein eigenes Einkommen \n            und Verm\xF6gen. Vom Elterneinkommen werden gro\xDFz\xFCgige Freibetr\xE4ge abgezogen \u2013 f\xFCr verheiratete \n            Eltern etwa 2.485 \u20AC netto. Nur 45% des \xFCbersteigenden Einkommens werden angerechnet.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">Studenten-BAf\xF6G vs. Sch\xFCler-BAf\xF6G</h3> <p> <strong>Studenten-BAf\xF6G</strong> besteht zur H\xE4lfte aus einem Zuschuss (geschenkt) und zur H\xE4lfte aus einem \n            zinslosen Darlehen. Die R\xFCckzahlung ist auf maximal 10.010 \u20AC gedeckelt \u2013 unabh\xE4ngig von der Gesamtsumme.\n</p> <p> <strong>Sch\xFCler-BAf\xF6G</strong> f\xFCr Fachschulen und bestimmte Schulformen ist komplett geschenkt und muss \n            nicht zur\xFCckgezahlt werden.\n</p> <h3 class="text-lg font-semibold text-gray-800 mt-6">BAf\xF6G-Antrag stellen</h3> <p>\nWichtig: BAf\xF6G wird <strong>nicht r\xFCckwirkend</strong> gezahlt! Die F\xF6rderung beginnt erst ab dem Monat \n            der Antragstellung. Nutze daher <a href="https://www.bafoeg-digital.de" target="_blank" rel="noopener" class="text-blue-600 hover:underline">bafoeg-digital.de</a>\nf\xFCr deinen Online-Antrag oder wende dich an das Studierendenwerk deiner Hochschule.\n</p> </div> </div> </div> </main>  <script type="application/ld+json">', "<\/script> "])), maybeRenderHead(), renderComponent($$result2, "BafoegRechner", BafoegRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/BafoegRechner", "client:component-export": "default" }), unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "BAf\xF6G-Rechner 2026",
    "description": description,
    "url": "https://deutschland-rechner.vercel.app/bafoeg-rechner",
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
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/bafoeg-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/bafoeg-rechner.astro";
const $$url = "/bafoeg-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$BafoegRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
