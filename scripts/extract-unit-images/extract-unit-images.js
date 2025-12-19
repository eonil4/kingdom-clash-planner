import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { mkdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const units = [
  // screenshot1.jpg
  { name: 'archers', src: 'screenshot1.jpg', left: 35, top: 390, width: 320, height: 320 },
  { name: 'infantry', src: 'screenshot1.jpg', left: 380, top: 390, width: 320, height: 320 },
  { name: 'iron_guards', src: 'screenshot1.jpg', left: 725, top: 390, width: 320, height: 320 },
  { name: 'bombers', src: 'screenshot1.jpg', left: 35, top: 809, width: 320, height: 320 },
  { name: 'catapult', src: 'screenshot1.jpg', left: 380, top: 809, width: 320, height: 320 },
  { name: 'assassins', src: 'screenshot1.jpg', left: 725, top: 809, width: 320, height: 320 },
  { name: 'necromancer', src: 'screenshot1.jpg', left: 35, top: 1229, width: 320, height: 320 },
  { name: 'butcher', src: 'screenshot1.jpg', left: 380, top: 1229, width: 320, height: 320 },
  { name: 'paladin', src: 'screenshot1.jpg', left: 725, top: 1229, width: 320, height: 320 },
  { name: 'undead_mage', src: 'screenshot1.jpg', left: 35, top: 1650, width: 320, height: 320 },
  { name: 'alchemist', src: 'screenshot1.jpg', left: 380, top: 1650, width: 320, height: 320 },
  { name: 'lancer', src: 'screenshot1.jpg', left: 725, top: 1650, width: 320, height: 320 },

  // screenshot2.jpg
  { name: 'huntress', src: 'screenshot2.jpg', left: 35, top: 408, width: 320, height: 320 },
  { name: 'imp', src: 'screenshot2.jpg', left: 380, top: 408, width: 320, height: 320 },
  { name: 'bonebreaker', src: 'screenshot2.jpg', left: 725, top: 408, width: 320, height: 320 },
  { name: 'shaman', src: 'screenshot2.jpg', left: 35, top: 827, width: 320, height: 320 },
  { name: 'monk', src: 'screenshot2.jpg', left: 380, top: 827, width: 320, height: 320 },
  { name: 'headless', src: 'screenshot2.jpg', left: 725, top: 827, width: 320, height: 320 },
  { name: 'bone_warrior', src: 'screenshot2.jpg', left: 35, top: 1247, width: 320, height: 320 },
  { name: 'bone_spearthrower', src: 'screenshot2.jpg', left: 380, top: 1247, width: 320, height: 320 },
  { name: 'night_hunter', src: 'screenshot2.jpg', left: 725, top: 1247, width: 320, height: 320 },
  { name: 'cursed_catapult', src: 'screenshot2.jpg', left: 35, top: 1668, width: 320, height: 320 },
  { name: 'explosive_spider', src: 'screenshot2.jpg', left: 380, top: 1668, width: 320, height: 320 },
  { name: 'magic_archer', src: 'screenshot2.jpg', left: 725, top: 1668, width: 320, height: 320 },

  // screenshot3.jpg
  { name: 'stone_golem', src: 'screenshot3.jpg', left: 35, top: 413, width: 320, height: 320 },
  { name: 'battle_golem', src: 'screenshot3.jpg', left: 380, top: 413, width: 320, height: 320 },
  { name: 'pyrotechnician', src: 'screenshot3.jpg', left: 725, top: 413, width: 320, height: 320 },
  { name: 'storm_mistresses', src: 'screenshot3.jpg', left: 35, top: 832, width: 320, height: 320 },
  { name: 'sorcerers_apprentices', src: 'screenshot3.jpg', left: 380, top: 832, width: 320, height: 320 },
  { name: 'lava_golem', src: 'screenshot3.jpg', left: 725, top: 832, width: 320, height: 320 },
  { name: 'royal_guard', src: 'screenshot3.jpg', left: 35, top: 1252, width: 320, height: 320 },
  { name: 'gravedigger', src: 'screenshot3.jpg', left: 380, top: 1252, width: 320, height: 320 },
  { name: 'immortal', src: 'screenshot3.jpg', left: 725, top: 1252, width: 320, height: 320 },
  { name: 'air_elemental', src: 'screenshot3.jpg', left: 35, top: 1672, width: 320, height: 320 },
  { name: 'giant_toad', src: 'screenshot3.jpg', left: 380, top: 1672, width: 320, height: 320 },
  { name: 'phoenix', src: 'screenshot3.jpg', left: 725, top: 1672, width: 320, height: 320 },

  // screenshot4.jpg
  { name: 'axe_throwers', src: 'screenshot4.jpg', left: 35, top: 1386, width: 320, height: 320 },
];

async function extractUnit(unit) {
  // Output to src/assets/units directory (relative to project root)
  const projectRoot = path.resolve(__dirname, '../..');
  const outputDir = path.join(projectRoot, 'src', 'assets', 'units');
  
  // Ensure output directory exists
  await mkdir(outputDir, { recursive: true });
  
  const outputFile = path.join(outputDir, `${unit.name}.png`);
  const sourceFile = path.join(__dirname, unit.src);
  
  await sharp(sourceFile)
    .extract({ left: unit.left, top: unit.top, width: unit.width, height: unit.height })
    .resize(132, 132)
    .toFile(outputFile);
  console.log(`Saved ${outputFile}`);
}

(async () => {
  for (const unit of units) {
    try {
      await extractUnit(unit);
    } catch (err) {
      console.error(`Error processing ${unit.name}:`, err);
    }
  }
})();
