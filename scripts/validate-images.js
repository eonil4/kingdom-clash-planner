#!/usr/bin/env node

/**
 * Script to validate that unit images exist
 * Run with: node scripts/validate-images.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const unitsDir = path.join(__dirname, '../public/assets/units');
const checklistPath = path.join(unitsDir, 'IMAGE_CHECKLIST.md');

// Read the checklist to get expected images
let expectedImages = [];
if (fs.existsSync(checklistPath)) {
  const checklistContent = fs.readFileSync(checklistPath, 'utf-8');
  const imageMatches = checklistContent.matchAll(/`([^`]+\.png)`/g);
  expectedImages = Array.from(imageMatches).map((match) => match[1]);
}

// Get actual images
const actualImages = fs.existsSync(unitsDir)
  ? fs
      .readdirSync(unitsDir)
      .filter((file) => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))
  : [];

const missingImages = expectedImages.filter(
  (img) => !actualImages.includes(img)
);
const extraImages = actualImages.filter(
  (img) => !expectedImages.includes(img) && img !== 'README.md' && img !== 'IMAGE_CHECKLIST.md'
);

console.log('\n📊 Image Validation Report\n');
console.log(`✅ Expected images: ${expectedImages.length}`);
console.log(`📁 Found images: ${actualImages.length}`);
console.log(`❌ Missing images: ${missingImages.length}`);
console.log(`➕ Extra images: ${extraImages.length}\n`);

if (missingImages.length > 0) {
  console.log('❌ Missing Images:');
  missingImages.forEach((img) => {
    console.log(`   - ${img}`);
  });
  console.log('');
}

if (extraImages.length > 0) {
  console.log('➕ Extra Images (not in checklist):');
  extraImages.forEach((img) => {
    console.log(`   - ${img}`);
  });
  console.log('');
}

if (missingImages.length === 0 && extraImages.length === 0) {
  console.log('✅ All images are present and accounted for!\n');
  process.exit(0);
} else {
  console.log('⚠️  Some images are missing or extra.\n');
  process.exit(1);
}

