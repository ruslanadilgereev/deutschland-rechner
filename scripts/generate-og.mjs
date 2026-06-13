import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Erzeugt das Default-OG-/Twitter-Card-Bild (public/og-default.png, 1200x630),
// das Layout.astro als Fallback referenziert. Marken-Gradient + Typo, kein Emoji
// (librsvg rendert Emojis unzuverlässig). Bei Marken-/Slogan-Änderung neu laufen lassen.
const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const W = 1200;
const H = 630;

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a56db"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="1060" cy="110" r="280" fill="#ffffff" opacity="0.06"/>
  <circle cx="140" cy="580" r="200" fill="#ffffff" opacity="0.05"/>
  <text x="80" y="250" font-family="Arial, Helvetica, sans-serif" font-size="94" font-weight="700" fill="#ffffff">Deutschlandrechner</text>
  <text x="84" y="320" font-family="Arial, Helvetica, sans-serif" font-size="40" fill="#dbeafe">Kostenlose Online-Rechner f&#252;r Deutschland</text>
  <text x="84" y="432" font-family="Arial, Helvetica, sans-serif" font-size="32" fill="#ffffff" opacity="0.92">Brutto-Netto &#183; Kindergeld &#183; Steuern &#183; Kfz &#183; Hausbau</text>
  <rect x="84" y="486" width="220" height="6" rx="3" fill="#ffffff" opacity="0.85"/>
  <text x="84" y="562" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" fill="#ffffff">www.deutschland-rechner.de</text>
</svg>`;

await sharp(Buffer.from(svg))
  .png()
  .toFile(join(publicDir, 'og-default.png'));

console.log('✓ og-default.png (1200x630) erzeugt');
