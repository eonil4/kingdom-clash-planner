#!/usr/bin/env node

/**
 * Script to help rename extracted unit images to match the expected naming convention
 * 
 * Usage:
 *   node scripts/batch-rename-images.js <source_directory>
 * 
 * This will help rename images that were extracted but don't match the expected names.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function convertNameToFilename(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/'/g, '')
    .replace(/[^a-z0-9-]/g, '') + '.png';
}

function findSimilarFiles(directory, targetName) {
  const files = fs.readdirSync(directory).filter(f => 
    f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg')
  );
  
  const targetLower = targetName.toLowerCase();
  return files.filter(file => {
    const fileLower = file.toLowerCase().replace(/\.(png|jpg|jpeg)$/, '');
    return fileLower.includes(targetLower) || targetLower.includes(fileLower);
  });
}

function main() {
  const sourceDir = process.argv[2] || path.join(__dirname, '../public/assets/units');
  
  if (!fs.existsSync(sourceDir)) {
    console.error(`Error: Directory not found: ${sourceDir}`);
    process.exit(1);
  }
  
  // Read expected unit names from checklist
  const checklistPath = path.join(sourceDir, 'IMAGE_CHECKLIST.md');
  if (!fs.existsSync(checklistPath)) {
    console.error('Error: IMAGE_CHECKLIST.md not found. Run pnpm generate:image-list first.');
    process.exit(1);
  }
  
  const checklistContent = fs.readFileSync(checklistPath, 'utf-8');
  const expectedImages = [];
  const matches = checklistContent.matchAll(/\d+\.\s+`([^`]+)`\s+-\s+\*\*([^*]+)\*\*/g);
  
  for (const match of matches) {
    expectedImages.push({
      filename: match[1],
      unitName: match[2]
    });
  }
  
  console.log(`\n📋 Found ${expectedImages.length} expected unit images\n`);
  
  const files = fs.readdirSync(sourceDir).filter(f => 
    (f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg')) &&
    f !== 'README.md' &&
    f !== 'IMAGE_CHECKLIST.md'
  );
  
  console.log(`📁 Found ${files.length} image files in directory\n`);
  
  // Check which files match expected names
  const matched = [];
  const unmatched = [];
  
  for (const file of files) {
    const expected = expectedImages.find(e => e.filename === file);
    if (expected) {
      matched.push({ file, expected: expected.unitName });
    } else {
      unmatched.push(file);
    }
  }
  
  console.log(`✅ Matched: ${matched.length} files`);
  matched.forEach(({ file, expected }) => {
    console.log(`   ✓ ${file} (${expected})`);
  });
  
  if (unmatched.length > 0) {
    console.log(`\n❓ Unmatched: ${unmatched.length} files`);
    unmatched.forEach(file => {
      const suggestions = expectedImages
        .filter(e => {
          const fileBase = file.toLowerCase().replace(/\.(png|jpg|jpeg)$/, '');
          const expectedBase = e.filename.toLowerCase().replace('.png', '');
          return fileBase.includes(expectedBase) || expectedBase.includes(fileBase);
        })
        .slice(0, 3);
      
      console.log(`   ? ${file}`);
      if (suggestions.length > 0) {
        console.log(`     Suggestions:`);
        suggestions.forEach(s => {
          console.log(`       → ${s.filename} (${s.unitName})`);
        });
      }
    });
  }
  
  const missing = expectedImages.filter(e => !files.includes(e.filename));
  if (missing.length > 0) {
    console.log(`\n❌ Missing: ${missing.length} expected files`);
    missing.slice(0, 10).forEach(m => {
      console.log(`   - ${m.filename} (${m.unitName})`);
    });
    if (missing.length > 10) {
      console.log(`   ... and ${missing.length - 10} more`);
    }
  }
  
  console.log('\n💡 Tip: Manually rename unmatched files to match expected names');
  console.log('   Use the suggestions above as a guide.\n');
}

main();

