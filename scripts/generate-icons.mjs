import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// Read SVG
const svgBuffer = readFileSync(join(publicDir, 'favicon.svg'));

// Icon sizes needed for PWA
const sizes = [192, 512, 180, 32, 16];

async function generateIcons() {
  mkdirSync(join(publicDir, 'icons'), { recursive: true });
  
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(publicDir, 'icons', `icon-${size}x${size}.png`));
    console.log(`✓ Generated icon-${size}x${size}.png`);
  }
  
  // Also create apple-touch-icon at root
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Generated apple-touch-icon.png');
  
  // Create favicon.ico alternative
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(join(publicDir, 'favicon.png'));
  console.log('✓ Generated favicon.png');
}

generateIcons().catch(console.error);
