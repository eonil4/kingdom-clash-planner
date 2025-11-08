#!/usr/bin/env node

/**
 * Script to generate a list of all unit images needed
 * Run with: node scripts/generate-image-list.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the mock data to extract unit names
const mockDataPath = path.join(__dirname, '../src/utils/mockData.ts');
const mockDataContent = fs.readFileSync(mockDataPath, 'utf-8');

// Extract unit names from the mock data
const unitNameMatches = mockDataContent.matchAll(/name:\s*['"]([^'"]+)['"]/g);
const unitNames = new Set();

for (const match of unitNameMatches) {
  const name = match[1];
  // Skip generated variations
  if (!name.includes(' ' + Math.floor) && !name.match(/\d+$/)) {
    unitNames.add(name);
  }
}

// Convert to image filenames
const imageFiles = Array.from(unitNames)
  .map((name) => {
    const imageName = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/'/g, '')
      .replace(/[^a-z0-9-]/g, '');
    return {
      originalName: name,
      filename: `${imageName}.png`,
      path: `/assets/units/${imageName}.png`,
    };
  })
  .sort((a, b) => a.originalName.localeCompare(b.originalName));

// Generate markdown list
const markdown = `# Unit Images Checklist

This file was auto-generated. It lists all unit images that need to be extracted from the game screenshots.

## Total Units: ${imageFiles.length}

## Image Files Needed

${imageFiles.map((file, index) => `${index + 1}. \`${file.filename}\` - **${file.originalName}**`).join('\n')}

## Quick Copy List (for file naming)

\`\`\`
${imageFiles.map((file) => file.filename).join('\n')}
\`\`\`

## Instructions

1. Extract unit card images from the game screenshots
2. Crop each unit individually (recommended size: 128x128px or larger)
3. Save with the exact filename listed above
4. Place all images in \`public/assets/units/\` directory
5. Images should be PNG format with transparent background (preferred)

## Rarity Colors Reference

- **Legendary (Gold)**: Yellow/Gold borders
- **Epic (Purple)**: Purple borders  
- **Rare (Blue)**: Blue borders
- **Common (Gray)**: Gray borders

`;

// Write to file
const outputPath = path.join(__dirname, '../public/assets/units/IMAGE_CHECKLIST.md');
fs.writeFileSync(outputPath, markdown, 'utf-8');

console.log(`✅ Generated image checklist with ${imageFiles.length} units`);
console.log(`📄 Saved to: ${outputPath}`);
console.log(`\n📋 First 10 units:`);
imageFiles.slice(0, 10).forEach((file) => {
  console.log(`   - ${file.filename} (${file.originalName})`);
});

