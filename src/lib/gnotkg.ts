// Wertgebühr nach § 34 GNotKG, Tabelle B (Nachlasssachen, Notare):
// Grundgebühr 15 € bis 500 € Geschäftswert, dann je angefangene Stufe
// +4 (bis 2.000 je 500), +6 (bis 10.000 je 1.000), +8 (bis 25.000 je 3.000),
// +10 (bis 50.000 je 5.000), +27 (bis 200.000 je 15.000),
// +50 (bis 500.000 je 30.000), +80 (bis 5 Mio je 50.000).
// Selbstverifikation: 10.000 → 75; 50.000 → 165; 100.000 → 273 (bekannter
// Praxiswert); 200.000 → 435; 500.000 → 935. Mindestgebühr 15 € (§ 34 Abs. 5).
const STUFEN_B: Array<{ bis: number; schritt: number; erhoehung: number }> = [
  { bis: 2000, schritt: 500, erhoehung: 4 },
  { bis: 10000, schritt: 1000, erhoehung: 6 },
  { bis: 25000, schritt: 3000, erhoehung: 8 },
  { bis: 50000, schritt: 5000, erhoehung: 10 },
  { bis: 200000, schritt: 15000, erhoehung: 27 },
  { bis: 500000, schritt: 30000, erhoehung: 50 },
  { bis: 5000000, schritt: 50000, erhoehung: 80 },
];

export function gnotkgTabelleB(geschaeftswert: number): number {
  let gebuehr = 15;
  let untere = 500;
  for (const stufe of STUFEN_B) {
    if (geschaeftswert <= untere) break;
    const anteil = Math.min(geschaeftswert, stufe.bis) - untere;
    gebuehr += Math.ceil(anteil / stufe.schritt) * stufe.erhoehung;
    untere = stufe.bis;
  }
  return gebuehr;
}
