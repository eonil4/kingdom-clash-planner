import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');

const THEME_COLOR = '#111827';
const ACCENT_COLOR = '#f59e0b';

async function createIcon(size, outputPath) {
  const padding = Math.floor(size * 0.1);
  const innerSize = size - padding * 2;
  const gridSize = Math.floor(innerSize / 3);
  const cornerRadius = Math.floor(size * 0.15);

  const svgIcon = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1f2937;stop-opacity:1" />
          <stop offset="100%" style="stop-color:${THEME_COLOR};stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="url(#grad)"/>
      
      <!-- Border -->
      <rect x="2" y="2" width="${size - 4}" height="${size - 4}" rx="${cornerRadius - 2}" 
            fill="none" stroke="${ACCENT_COLOR}" stroke-width="3" opacity="0.8"/>
      
      <!-- 3x3 Grid representing formation -->
      <g transform="translate(${padding + gridSize * 0.3}, ${padding + gridSize * 0.3})">
        ${generateGridCells(gridSize, ACCENT_COLOR)}
      </g>
      
      <!-- Crown/Shield icon in center -->
      <g transform="translate(${size / 2}, ${size / 2})">
        <path d="M-${size * 0.12} ${size * 0.05} 
                 L0 -${size * 0.15} 
                 L${size * 0.12} ${size * 0.05} 
                 L${size * 0.08} ${size * 0.12} 
                 L-${size * 0.08} ${size * 0.12} Z" 
              fill="${ACCENT_COLOR}" opacity="0.9"/>
      </g>
    </svg>
  `;

  await sharp(Buffer.from(svgIcon))
    .png()
    .toFile(outputPath);

  console.log(`Created: ${outputPath}`);
}

function generateGridCells(gridSize, color) {
  const cells = [];
  const cellSize = gridSize * 0.7;
  const gap = gridSize * 0.15;

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (row === 1 && col === 1) continue;

      const x = col * gridSize + gap;
      const y = row * gridSize + gap;
      const opacity = 0.3 + Math.random() * 0.4;

      cells.push(`
        <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" 
              rx="4" fill="${color}" opacity="${opacity.toFixed(2)}"/>
      `);
    }
  }

  return cells.join('');
}

async function main() {
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  const sizes = [192, 512];

  for (const size of sizes) {
    const outputPath = join(publicDir, `icon-${size}.png`);
    await createIcon(size, outputPath);
  }

  console.log('\nPWA icons generated successfully!');
  console.log('Update manifest.json to include the icons.');
}

main().catch(console.error);
