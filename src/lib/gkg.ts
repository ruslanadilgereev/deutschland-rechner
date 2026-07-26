import gkg from '../data/gkg-gebuehren.json';

// Volle Wertgebühr (1,0) nach § 34 Abs. 1 GKG.
// Stufenformel aus gkg-gebuehren.json, gegen 13 Werte der amtlichen
// Anlage 2 (BGBl. 2025 I Nr. 109) verifiziert.
export function streitwertGebuehr(streitwert: number): number {
  let gebuehr = gkg.grundgebuehr.gebuehr;
  let untere = gkg.grundgebuehr.bisStreitwert;
  for (const stufe of gkg.stufen) {
    if (streitwert <= untere) break;
    const obere = stufe.bisStreitwert ?? Infinity;
    const anteil = Math.min(streitwert, obere) - untere;
    gebuehr += Math.ceil(anteil / stufe.schritt) * stufe.erhoehung;
    untere = obere;
  }
  return Math.round(gebuehr * 100) / 100;
}
