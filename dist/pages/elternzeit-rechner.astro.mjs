/* empty css                                                    */
import { c as createComponent, a as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_X4Fuu-a1.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_BdQXYkEU.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
export { renderers } from '../renderers.mjs';

const ELTERNZEIT_2026 = {
  maxMonateGesamt: 36,
  // Max. 36 Monate pro Elternteil
  maxMonateVorDrittemGeburtstag: 24,
  // 24 Monate müssen vor dem 3. Geburtstag genommen werden
  maxMonateNachDrittemGeburtstag: 12,
  // 12 Monate können zwischen 3. und 8. Geburtstag genommen werden
  maxTeilzeitStunden: 32,
  // Betrieb muss mind. 15 Mitarbeiter haben für Teilzeit-Anspruch
  kuendigungsschutzVorher: 8,
  // Wochen bei Elternzeit ab 3. Geburtstag
  anmeldefristWochen: 7};
function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}
function formatDate(date) {
  return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function ElternzeitRechner() {
  const [geburtsdatum, setGeburtsdatum] = useState("");
  const [mutterMonate, setMutterMonate] = useState(12);
  const [vaterMonate, setVaterMonate] = useState(2);
  const [teilzeit, setTeilzeit] = useState(false);
  const [teilzeitStunden, setTeilzeitStunden] = useState(20);
  const [gleichzeitig, setGleichzeitig] = useState(false);
  const [mutterNach3, setMutterNach3] = useState(0);
  const [vaterNach3, setVaterNach3] = useState(0);
  const [mutterschutzEnde, setMutterschutzEnde] = useState(true);
  const berechnung = useMemo(() => {
    if (!geburtsdatum) return null;
    const geburt = new Date(geburtsdatum);
    const dritterGeburtstag = addMonths(geburt, 36);
    const achterGeburtstag = addMonths(geburt, 96);
    const mutterschutzEndeDate = new Date(geburt);
    mutterschutzEndeDate.setDate(mutterschutzEndeDate.getDate() + 56);
    const mutterStart = mutterschutzEnde ? mutterschutzEndeDate : geburt;
    const mutterEndeVor3 = addMonths(mutterStart, mutterMonate);
    const mutterEndeNach3 = mutterNach3 > 0 ? addMonths(dritterGeburtstag, mutterNach3) : null;
    const vaterStart = geburt;
    const vaterEndeVor3 = addMonths(vaterStart, vaterMonate);
    const vaterEndeNach3 = vaterNach3 > 0 ? addMonths(dritterGeburtstag, vaterNach3) : null;
    const anmeldungMutterSpätestens = new Date(mutterStart);
    anmeldungMutterSpätestens.setDate(anmeldungMutterSpätestens.getDate() - ELTERNZEIT_2026.anmeldefristWochen * 7);
    const anmeldungVaterSpätestens = new Date(vaterStart);
    anmeldungVaterSpätestens.setDate(anmeldungVaterSpätestens.getDate() - ELTERNZEIT_2026.anmeldefristWochen * 7);
    const kuendigungsschutzMutter = new Date(mutterStart);
    kuendigungsschutzMutter.setDate(kuendigungsschutzMutter.getDate() - ELTERNZEIT_2026.kuendigungsschutzVorher * 7);
    const kuendigungsschutzVater = new Date(vaterStart);
    kuendigungsschutzVater.setDate(kuendigungsschutzVater.getDate() - ELTERNZEIT_2026.kuendigungsschutzVorher * 7);
    const mutterGenutzt = mutterMonate + mutterNach3;
    const vaterGenutzt = vaterMonate + vaterNach3;
    const mutterRest = ELTERNZEIT_2026.maxMonateGesamt - mutterGenutzt;
    const vaterRest = ELTERNZEIT_2026.maxMonateGesamt - vaterGenutzt;
    const warnungen = [];
    if (mutterMonate > ELTERNZEIT_2026.maxMonateVorDrittemGeburtstag) {
      warnungen.push("Die Mutter plant mehr als 24 Monate vor dem 3. Geburtstag – nur 24 Monate sind in diesem Zeitraum möglich.");
    }
    if (vaterMonate > ELTERNZEIT_2026.maxMonateVorDrittemGeburtstag) {
      warnungen.push("Der Vater plant mehr als 24 Monate vor dem 3. Geburtstag – nur 24 Monate sind in diesem Zeitraum möglich.");
    }
    if (mutterNach3 > ELTERNZEIT_2026.maxMonateNachDrittemGeburtstag) {
      warnungen.push("Die Mutter plant mehr als 12 Monate nach dem 3. Geburtstag – nur 12 Monate sind übertragbar.");
    }
    if (vaterNach3 > ELTERNZEIT_2026.maxMonateNachDrittemGeburtstag) {
      warnungen.push("Der Vater plant mehr als 12 Monate nach dem 3. Geburtstag – nur 12 Monate sind übertragbar.");
    }
    if (mutterGenutzt > ELTERNZEIT_2026.maxMonateGesamt) {
      warnungen.push(`Die Mutter überschreitet die maximalen 36 Monate Elternzeit.`);
    }
    if (vaterGenutzt > ELTERNZEIT_2026.maxMonateGesamt) {
      warnungen.push(`Der Vater überschreitet die maximalen 36 Monate Elternzeit.`);
    }
    const tipps = [];
    if (gleichzeitig) {
      tipps.push("Bei gleichzeitiger Elternzeit können beide Eltern parallel Elterngeld beziehen (z.B. beide in Teilzeit).");
    }
    if (mutterRest > 0 || vaterRest > 0) {
      tipps.push(`Nicht genutzte Elternzeit verfällt! Mutter: ${mutterRest} Monate, Vater: ${vaterRest} Monate noch verfügbar.`);
    }
    if (teilzeit && teilzeitStunden > ELTERNZEIT_2026.maxTeilzeitStunden) {
      tipps.push(`Während Elternzeit sind maximal ${ELTERNZEIT_2026.maxTeilzeitStunden} Stunden/Woche erlaubt.`);
    }
    return {
      geburt,
      dritterGeburtstag,
      achterGeburtstag,
      mutterschutzEndeDate,
      mutter: {
        start: mutterStart,
        endeVor3: mutterEndeVor3,
        endeNach3: mutterEndeNach3,
        monateVor3: mutterMonate,
        monateNach3: mutterNach3,
        monateGesamt: mutterGenutzt,
        rest: mutterRest,
        anmeldung: anmeldungMutterSpätestens,
        kuendigungsschutz: kuendigungsschutzMutter
      },
      vater: {
        start: vaterStart,
        endeVor3: vaterEndeVor3,
        endeNach3: vaterEndeNach3,
        monateVor3: vaterMonate,
        monateNach3: vaterNach3,
        monateGesamt: vaterGenutzt,
        rest: vaterRest,
        anmeldung: anmeldungVaterSpätestens,
        kuendigungsschutz: kuendigungsschutzVater
      },
      familieGesamt: mutterGenutzt + vaterGenutzt,
      warnungen,
      tipps
    };
  }, [geburtsdatum, mutterMonate, vaterMonate, mutterNach3, vaterNach3, teilzeit, teilzeitStunden, gleichzeitig, mutterschutzEnde]);
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Geburtsdatum des Kindes" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 ml-2", children: "(oder errechneter Termin)" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "date",
            value: geburtsdatum,
            onChange: (e) => setGeburtsdatum(e.target.value),
            className: "w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 outline-none text-lg"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            checked: mutterschutzEnde,
            onChange: (e) => setMutterschutzEnde(e.target.checked),
            className: "w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "Elternzeit direkt nach Mutterschutz" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block", children: "Startet 8 Wochen nach der Geburt" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6 p-4 bg-pink-50 rounded-xl", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "👩" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Elternzeit Mutter" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-sm text-gray-600 mb-2", children: [
            "Monate vor dem 3. Geburtstag ",
            /* @__PURE__ */ jsxs("span", { className: "text-pink-600 font-medium", children: [
              "(",
              mutterMonate,
              " Monate)"
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              min: "0",
              max: "24",
              value: mutterMonate,
              onChange: (e) => setMutterMonate(Number(e.target.value)),
              className: "w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-500 mt-1", children: [
            /* @__PURE__ */ jsx("span", { children: "0" }),
            /* @__PURE__ */ jsx("span", { children: "12" }),
            /* @__PURE__ */ jsx("span", { children: "24 (max)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-sm text-gray-600 mb-2", children: [
            "Monate nach dem 3. Geburtstag ",
            /* @__PURE__ */ jsxs("span", { className: "text-pink-600 font-medium", children: [
              "(",
              mutterNach3,
              " Monate)"
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              min: "0",
              max: "12",
              value: mutterNach3,
              onChange: (e) => setMutterNach3(Number(e.target.value)),
              className: "w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-500 mt-1", children: [
            /* @__PURE__ */ jsx("span", { children: "0" }),
            /* @__PURE__ */ jsx("span", { children: "6" }),
            /* @__PURE__ */ jsx("span", { children: "12 (max)" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6 p-4 bg-blue-50 rounded-xl", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "👨" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 font-medium", children: "Elternzeit Vater / Partner:in" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-sm text-gray-600 mb-2", children: [
            "Monate vor dem 3. Geburtstag ",
            /* @__PURE__ */ jsxs("span", { className: "text-blue-600 font-medium", children: [
              "(",
              vaterMonate,
              " Monate)"
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              min: "0",
              max: "24",
              value: vaterMonate,
              onChange: (e) => setVaterMonate(Number(e.target.value)),
              className: "w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-500 mt-1", children: [
            /* @__PURE__ */ jsx("span", { children: "0" }),
            /* @__PURE__ */ jsx("span", { children: "12" }),
            /* @__PURE__ */ jsx("span", { children: "24 (max)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-sm text-gray-600 mb-2", children: [
            "Monate nach dem 3. Geburtstag ",
            /* @__PURE__ */ jsxs("span", { className: "text-blue-600 font-medium", children: [
              "(",
              vaterNach3,
              " Monate)"
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              min: "0",
              max: "12",
              value: vaterNach3,
              onChange: (e) => setVaterNach3(Number(e.target.value)),
              className: "w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-500 mt-1", children: [
            /* @__PURE__ */ jsx("span", { children: "0" }),
            /* @__PURE__ */ jsx("span", { children: "6" }),
            /* @__PURE__ */ jsx("span", { children: "12 (max)" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: gleichzeitig,
              onChange: (e) => setGleichzeitig(e.target.checked),
              className: "w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
            }
          ),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "Gleichzeitige Elternzeit" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block", children: "Beide Eltern nehmen zur gleichen Zeit Elternzeit" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: teilzeit,
              onChange: (e) => setTeilzeit(e.target.checked),
              className: "w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
            }
          ),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: "Teilzeit während Elternzeit" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 block", children: "Max. 32 Stunden/Woche arbeiten" })
          ] })
        ] }),
        teilzeit && /* @__PURE__ */ jsxs("div", { className: "pl-8", children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-sm text-gray-600 mb-2", children: [
            "Gewünschte Wochenstunden ",
            /* @__PURE__ */ jsxs("span", { className: "text-gray-800 font-medium", children: [
              "(",
              teilzeitStunden,
              "h/Woche)"
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              min: "0",
              max: "32",
              value: teilzeitStunden,
              onChange: (e) => setTeilzeitStunden(Number(e.target.value)),
              className: "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-500 mt-1", children: [
            /* @__PURE__ */ jsx("span", { children: "0h" }),
            /* @__PURE__ */ jsx("span", { children: "15h" }),
            /* @__PURE__ */ jsx("span", { children: "32h (max)" })
          ] })
        ] })
      ] })
    ] }),
    berechnung && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg p-6 text-white mb-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-pink-100 mb-1", children: "Elternzeit gesamt" }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold", children: berechnung.familieGesamt }),
            /* @__PURE__ */ jsx("span", { className: "text-xl text-pink-200", children: "Monate" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-pink-100 mt-2", children: "für beide Elternteile zusammen" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
            /* @__PURE__ */ jsx("div", { className: "text-pink-100 text-sm", children: "👩 Mutter" }),
            /* @__PURE__ */ jsxs("div", { className: "text-xl font-bold", children: [
              berechnung.mutter.monateGesamt,
              " Monate"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-pink-200 text-xs", children: [
              berechnung.mutter.monateVor3,
              " vor + ",
              berechnung.mutter.monateNach3,
              " nach 3. Geburtstag"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-4 backdrop-blur-sm", children: [
            /* @__PURE__ */ jsx("div", { className: "text-pink-100 text-sm", children: "👨 Vater" }),
            /* @__PURE__ */ jsxs("div", { className: "text-xl font-bold", children: [
              berechnung.vater.monateGesamt,
              " Monate"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-pink-200 text-xs", children: [
              berechnung.vater.monateVor3,
              " vor + ",
              berechnung.vater.monateNach3,
              " nach 3. Geburtstag"
            ] })
          ] })
        ] })
      ] }),
      berechnung.warnungen.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6", children: [
        /* @__PURE__ */ jsxs("h4", { className: "text-red-800 font-bold flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsx("span", { children: "⚠️" }),
          " Achtung"
        ] }),
        /* @__PURE__ */ jsx("ul", { className: "space-y-1", children: berechnung.warnungen.map((w, i) => /* @__PURE__ */ jsx("li", { className: "text-red-700 text-sm", children: w }, i)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📅 Dein Elternzeit-Zeitplan" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 mb-6", children: [
          /* @__PURE__ */ jsx("div", { className: "p-4 bg-gray-50 rounded-xl", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Geburt" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-800", children: formatDate(berechnung.geburt) })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "p-4 bg-pink-50 rounded-xl", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Mutterschutz endet" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-pink-800", children: formatDate(berechnung.mutterschutzEndeDate) })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "p-4 bg-yellow-50 rounded-xl", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "3. Geburtstag" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-yellow-800", children: formatDate(berechnung.dritterGeburtstag) })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "p-4 bg-purple-50 rounded-xl", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "8. Geburtstag (Ende Anspruch)" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-purple-800", children: formatDate(berechnung.achterGeburtstag) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxs("h4", { className: "font-medium text-pink-700 mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { children: "👩" }),
            " Elternzeit Mutter"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between p-3 bg-pink-50 rounded-lg", children: [
              /* @__PURE__ */ jsx("span", { children: "Beginn Elternzeit" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: formatDate(berechnung.mutter.start) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between p-3 bg-pink-50 rounded-lg", children: [
              /* @__PURE__ */ jsx("span", { children: "Ende (vor 3. Geburtstag)" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: formatDate(berechnung.mutter.endeVor3) })
            ] }),
            berechnung.mutter.endeNach3 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between p-3 bg-pink-100 rounded-lg", children: [
              /* @__PURE__ */ jsx("span", { children: "Ende (nach 3. Geburtstag)" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: formatDate(berechnung.mutter.endeNach3) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between p-3 bg-green-50 rounded-lg text-green-800", children: [
              /* @__PURE__ */ jsx("span", { children: "Kündigungsschutz ab" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: formatDate(berechnung.mutter.kuendigungsschutz) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between p-3 bg-orange-50 rounded-lg text-orange-800", children: [
              /* @__PURE__ */ jsx("span", { children: "Anmeldung spätestens" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: formatDate(berechnung.mutter.anmeldung) })
            ] })
          ] })
        ] }),
        (berechnung.vater.monateVor3 > 0 || berechnung.vater.monateNach3 > 0) && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h4", { className: "font-medium text-blue-700 mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { children: "👨" }),
            " Elternzeit Vater"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between p-3 bg-blue-50 rounded-lg", children: [
              /* @__PURE__ */ jsx("span", { children: "Beginn Elternzeit" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: formatDate(berechnung.vater.start) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between p-3 bg-blue-50 rounded-lg", children: [
              /* @__PURE__ */ jsx("span", { children: "Ende (vor 3. Geburtstag)" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: formatDate(berechnung.vater.endeVor3) })
            ] }),
            berechnung.vater.endeNach3 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between p-3 bg-blue-100 rounded-lg", children: [
              /* @__PURE__ */ jsx("span", { children: "Ende (nach 3. Geburtstag)" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: formatDate(berechnung.vater.endeNach3) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between p-3 bg-green-50 rounded-lg text-green-800", children: [
              /* @__PURE__ */ jsx("span", { children: "Kündigungsschutz ab" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: formatDate(berechnung.vater.kuendigungsschutz) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between p-3 bg-orange-50 rounded-lg text-orange-800", children: [
              /* @__PURE__ */ jsx("span", { children: "Anmeldung spätestens" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: formatDate(berechnung.vater.anmeldung) })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "📊 Verfügbare Elternzeit" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-2", children: "👩 Mutter" }),
            /* @__PURE__ */ jsx("div", { className: "h-4 bg-gray-200 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: "h-full bg-pink-500 transition-all duration-300",
                style: { width: `${berechnung.mutter.monateGesamt / 36 * 100}%` }
              }
            ) }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
              berechnung.mutter.monateGesamt,
              "/36 Monate genutzt • ",
              /* @__PURE__ */ jsxs("span", { className: "text-pink-600 font-medium", children: [
                berechnung.mutter.rest,
                " noch verfügbar"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-2", children: "👨 Vater" }),
            /* @__PURE__ */ jsx("div", { className: "h-4 bg-gray-200 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: "h-full bg-blue-500 transition-all duration-300",
                style: { width: `${berechnung.vater.monateGesamt / 36 * 100}%` }
              }
            ) }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
              berechnung.vater.monateGesamt,
              "/36 Monate genutzt • ",
              /* @__PURE__ */ jsxs("span", { className: "text-blue-600 font-medium", children: [
                berechnung.vater.rest,
                " noch verfügbar"
              ] })
            ] })
          ] })
        ] })
      ] }),
      berechnung.tipps.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6", children: [
        /* @__PURE__ */ jsxs("h4", { className: "text-blue-800 font-bold flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsx("span", { children: "💡" }),
          " Tipps"
        ] }),
        /* @__PURE__ */ jsx("ul", { className: "space-y-1", children: berechnung.tipps.map((t, i) => /* @__PURE__ */ jsx("li", { className: "text-blue-700 text-sm", children: t }, i)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "ℹ️ So funktioniert Elternzeit" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "36 Monate" }),
            " pro Elternteil stehen zur Verfügung (insgesamt 72 Monate für beide)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "24 Monate" }),
            " müssen vor dem 3. Geburtstag genommen werden"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "12 Monate" }),
            " können zwischen dem 3. und 8. Geburtstag übertragen werden"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Teilzeit" }),
            " bis zu 32 Stunden/Woche während der Elternzeit möglich"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Kündigungsschutz" }),
            " ab 8 Wochen vor Beginn der Elternzeit"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Anmeldung" }),
            " mindestens 7 Wochen vor Beginn beim Arbeitgeber"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "🏛️ Anmeldung & Zuständigkeit" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-pink-50 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-pink-900", children: "Elternzeit beantragen bei:" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-pink-700 mt-2", children: [
            "Die Elternzeit muss ",
            /* @__PURE__ */ jsx("strong", { children: "schriftlich beim Arbeitgeber" }),
            " angemeldet werden – nicht bei einer Behörde."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📝" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Schriftliche Anmeldung" }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "7 Wochen vor Beginn beim Arbeitgeber" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Mit Unterschrift, kein E-Mail!" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🌐" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Familienportal" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://familienportal.de/familienportal/familienleistungen/elternzeit",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 hover:underline",
                  children: "Offizielle Infos →"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Alle Details zur Elternzeit" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📞" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-800", children: "Servicetelefon Familie" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "030 201 791 30" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Mo-Do 9-18 Uhr" })
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
            /* @__PURE__ */ jsx("p", { className: "font-medium text-yellow-800", children: "Schriftform erforderlich!" }),
            /* @__PURE__ */ jsx("p", { className: "text-yellow-700", children: "Die Anmeldung muss schriftlich mit Unterschrift erfolgen. E-Mail oder Fax genügen nicht." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-blue-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "📄" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-blue-800", children: "Verbindliche Festlegung" }),
            /* @__PURE__ */ jsx("p", { className: "text-blue-700", children: "Die ersten 24 Monate müssen verbindlich festgelegt werden. Änderungen nur mit Zustimmung des Arbeitgebers." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-green-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "💼" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-green-800", children: "Teilzeitarbeit möglich" }),
            /* @__PURE__ */ jsx("p", { className: "text-green-700", children: "Während der Elternzeit dürfen Sie bis zu 32 Stunden pro Woche arbeiten (bei Betrieben ab 15 Mitarbeitern)." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-purple-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🛡️" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-purple-800", children: "Kündigungsschutz" }),
            /* @__PURE__ */ jsx("p", { className: "text-purple-700", children: "Beginnt 8 Wochen vor der Elternzeit und endet mit der Elternzeit. Kündigung nur mit Zustimmung der Aufsichtsbehörde möglich." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-orange-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "👶" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-orange-800", children: "Elternzeit ≠ Elterngeld" }),
            /* @__PURE__ */ jsx("p", { className: "text-orange-700", children: "Elternzeit ist die Freistellung vom Job. Elterngeld ist die finanzielle Leistung. Beides muss separat beantragt werden!" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-red-50 rounded-xl", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: "⏰" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-red-800", children: "Nicht genutzte Elternzeit verfällt!" }),
            /* @__PURE__ */ jsx("p", { className: "text-red-700", children: "Elternzeit kann nicht auf Geschwister übertragen werden und verfällt nach dem 8. Geburtstag des Kindes." })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-800 mb-3", children: "✅ Checkliste Elternzeit" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2 text-sm", children: [
        "Elternzeit-Zeitraum festlegen (wann, wie lange)",
        "Anmeldung schriftlich vorbereiten",
        "Mind. 7 Wochen vorher beim Arbeitgeber einreichen",
        "Kopie für eigene Unterlagen behalten",
        "Empfangsbestätigung vom Arbeitgeber einholen",
        "Elterngeld separat bei der Elterngeldstelle beantragen",
        "Krankenversicherung während Elternzeit klären",
        "Ggf. Teilzeit während Elternzeit beantragen"
      ].map((item, i) => /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100", children: [
        /* @__PURE__ */ jsx("input", { type: "checkbox", className: "w-4 h-4 text-pink-500 rounded" }),
        /* @__PURE__ */ jsx("span", { className: "text-gray-700", children: item })
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gray-50 rounded-xl", children: [
      /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-gray-500 uppercase mb-2", children: "Quellen" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://familienportal.de/familienportal/familienleistungen/elternzeit",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Familienportal – Elternzeit"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.gesetze-im-internet.de/beeg/",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundeselterngeld- und Elternzeitgesetz (BEEG)"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.bmfsfj.de/bmfsfj/themen/familie/familienleistungen/elternzeit",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "BMFSFJ – Elternzeit"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://www.arbeitsagentur.de/familie-und-kinder/elternzeit",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block text-sm text-blue-600 hover:underline",
            children: "Bundesagentur für Arbeit – Elternzeit"
          }
        )
      ] })
    ] })
  ] });
}

const $$ElternzeitRechner = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Elternzeit-Rechner 2026 \u2013 Dauer, Fristen & Planung f\xFCr Mutter & Vater", "description": "Elternzeit-Rechner 2026: Plane deine Elternzeit f\xFCr beide Elternteile. Bis zu 36 Monate pro Person, Fristen, K\xFCndigungsschutz & Teilzeit-Optionen berechnen.", "keywords": "Elternzeit Rechner, Elternzeit berechnen, Elternzeit Dauer, Elternzeit planen, Elternzeit 2025, Elternzeit 2026, Elternzeit Vater, Elternzeit Mutter, Elternzeit Anmeldung, Elternzeit Frist, Elternzeit Teilzeit, Elternzeit K\xFCndigungsschutz, 36 Monate Elternzeit" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen pb-8"> <!-- Header mit Zurück-Button --> <header class="bg-gradient-to-r from-pink-500 to-rose-600 text-white py-6 px-4"> <div class="max-w-2xl mx-auto"> <a href="/" class="inline-flex items-center gap-2 text-pink-100 hover:text-white mb-4 transition-colors"> <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>
Alle Rechner
</a> <div class="flex items-center gap-3"> <span class="text-4xl">📅</span> <div> <h1 class="text-2xl font-bold">Elternzeit-Rechner</h1> <p class="text-pink-100 text-sm">Elternzeit planen – Dauer & Aufteilung 2026</p> </div> </div> </div> </header> <!-- Calculator --> <div class="max-w-2xl mx-auto px-4 py-6"> ${renderComponent($$result2, "ElternzeitRechner", ElternzeitRechner, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/ubuntu/clawd/deutschlandrechner/src/components/rechner/ElternzeitRechner", "client:component-export": "default" })} </div> </main> ` })}`;
}, "/home/ubuntu/clawd/deutschlandrechner/src/pages/elternzeit-rechner.astro", void 0);

const $$file = "/home/ubuntu/clawd/deutschlandrechner/src/pages/elternzeit-rechner.astro";
const $$url = "/elternzeit-rechner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$ElternzeitRechner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
