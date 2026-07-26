// Einkommensteuertarif 2026 nach § 32a Abs. 1 EStG (Fassung ab VZ 2026,
// gesetze-im-internet.de, abgerufen 26.07.2026):
// bis 12.348 (Grundfreibetrag): 0
// 12.349-17.799:  (914,51·y + 1.400)·y,  y = (zvE - 12.348)/10.000
// 17.800-69.878:  (173,10·z + 2.397)·z + 1.034,87,  z = (zvE - 17.799)/10.000
// 69.879-277.825: 0,42·x - 11.135,63
// ab 277.826:     0,45·x - 19.470,38
// zvE und Ergebnis werden auf volle Euro abgerundet (§ 32a Abs. 1 S. 1, 6).
export function einkommensteuer2026(zvE: number): number {
  const x = Math.floor(Math.max(0, zvE));
  let est = 0;
  if (x <= 12348) {
    est = 0;
  } else if (x <= 17799) {
    const y = (x - 12348) / 10000;
    est = (914.51 * y + 1400) * y;
  } else if (x <= 69878) {
    const z = (x - 17799) / 10000;
    est = (173.10 * z + 2397) * z + 1034.87;
  } else if (x <= 277825) {
    est = 0.42 * x - 11135.63;
  } else {
    est = 0.45 * x - 19470.38;
  }
  return Math.floor(est);
}

// Solidaritätszuschlag: 5,5 % der Einkommensteuer, aber nur soweit die ESt die
// Freigrenze übersteigt (§ 3 Abs. 3 SolzG 2026: 20.350 € Einzel-/40.700 €
// Splittingveranlagung); in der Milderungszone höchstens 11,9 % des
// übersteigenden Betrags (§ 4 SolzG).
export function soli2026(est: number, splitting = false): number {
  const freigrenze = splitting ? 40700 : 20350;
  if (est <= freigrenze) return 0;
  const milderung = (est - freigrenze) * 0.119;
  return Math.round(Math.min(est * 0.055, milderung) * 100) / 100;
}
