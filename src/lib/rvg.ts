import rvg from '../data/rvg-gebuehren.json';

// Wertgebühr (1,0) nach § 13 Abs. 1 RVG. Stufenformel aus rvg-gebuehren.json,
// gegen 13 Werte der amtlichen Anlage 2 (BGBl. 2025 I Nr. 109) verifiziert.
export function rvgWertgebuehr(gegenstandswert: number): number {
  let gebuehr = rvg.grundgebuehr.gebuehr;
  let untere = rvg.grundgebuehr.bisGegenstandswert;
  for (const stufe of rvg.stufen) {
    if (gegenstandswert <= untere) break;
    const obere = stufe.bisGegenstandswert ?? Infinity;
    const anteil = Math.min(gegenstandswert, obere) - untere;
    gebuehr += Math.ceil(anteil / stufe.schritt) * stufe.erhoehung;
    untere = obere;
  }
  return Math.round(gebuehr * 100) / 100;
}

export interface Anwaltskosten {
  verfahrensgebuehr: number;
  terminsgebuehr: number;
  einigungsgebuehr: number;
  auslagenpauschale: number;
  netto: number;
  umsatzsteuer: number;
  brutto: number;
}

// Anwaltsvergütung 1. Instanz: 1,3 Verfahrensgebühr (VV 3100) + 1,2 Terminsgebühr
// (VV 3104), bei gerichtlichem Vergleich zusätzlich 1,0 Einigungsgebühr (VV 1003);
// dazu Auslagenpauschale (VV 7002: 20 %, max. 20 €) und 19 % USt (VV 7008).
export function anwaltskostenErsteInstanz(gegenstandswert: number, mitEinigung: boolean): Anwaltskosten {
  const w = rvgWertgebuehr(gegenstandswert);
  const r2 = (n: number) => Math.round(n * 100) / 100;
  const verfahrensgebuehr = r2(w * rvg.saetze.verfahrensgebuehr.satz);
  const terminsgebuehr = r2(w * rvg.saetze.terminsgebuehr.satz);
  const einigungsgebuehr = mitEinigung ? r2(w * rvg.saetze.einigungsgebuehrGerichtlich.satz) : 0;
  const gebuehren = verfahrensgebuehr + terminsgebuehr + einigungsgebuehr;
  const auslagenpauschale = Math.min(r2(gebuehren * rvg.auslagenpauschale.satz), rvg.auslagenpauschale.max);
  const netto = r2(gebuehren + auslagenpauschale);
  const umsatzsteuer = r2(netto * rvg.umsatzsteuer.satz);
  return { verfahrensgebuehr, terminsgebuehr, einigungsgebuehr, auslagenpauschale, netto, umsatzsteuer, brutto: r2(netto + umsatzsteuer) };
}
