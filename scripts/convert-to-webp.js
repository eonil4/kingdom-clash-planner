import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readdir, stat } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const UNITS_DIR = path.resolve(__dirname, '../src/assets/units');
const QUALITY = 85;

async function convertPngToWebp(pngPath) {
  const webpPath = pngPath.replace(/\.png$/, '.webp');
  
  const pngStats = await stat(pngPath);
  
  await sharp(pngPath)
    .webp({ quality: QUALITY })
    .toFile(webpPath);
  
  const webpStats = await stat(webpPath);
  
  const savings = ((1 - webpStats.size / pngStats.size) * 100).toFixed(1);
  console.log(`${path.basename(pngPath)} -> ${path.basename(webpPath)} (${(pngStats.size / 1024).toFixed(1)}KB -> ${(webpStats.size / 1024).toFixed(1)}KB, ${savings}% smaller)`);
  
  return {
    original: pngStats.size,
    converted: webpStats.size
  };
}

async function main() {
  console.log('Converting PNG images to WebP format...\n');
  
  const files = await readdir(UNITS_DIR);
  const pngFiles = files.filter(f => f.endsWith('.png'));
  
  let totalOriginal = 0;
  let totalConverted = 0;
  
  for (const file of pngFiles) {
    try {
      const result = await convertPngToWebp(path.join(UNITS_DIR, file));
      totalOriginal += result.original;
      totalConverted += result.converted;
    } catch (err) {
      console.error(`Error converting ${file}:`, err.message);
    }
  }
  
  const totalSavings = ((1 - totalConverted / totalOriginal) * 100).toFixed(1);
  console.log(`\n✓ Converted ${pngFiles.length} images`);
  console.log(`Total: ${(totalOriginal / 1024).toFixed(1)}KB -> ${(totalConverted / 1024).toFixed(1)}KB (${totalSavings}% smaller)`);
}

main().catch(console.error);
