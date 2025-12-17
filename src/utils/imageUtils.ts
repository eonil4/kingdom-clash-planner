/**
 * Utility functions for handling unit images
 */

import { getUnitDataByName } from '../types/unitNames';

// Preload all unit images from src/assets/units using Vite's glob import
// This allows dynamic access to images at runtime with WebP support
const unitImages = import.meta.glob<string>('../assets/units/*.{png,webp}', { 
  eager: true,
  import: 'default'
});

// Create a lookup map by filename for easier access
// Prefers WebP over PNG when both exist
const imagesByName: Record<string, string> = {};
/* istanbul ignore next -- @preserve Vite glob imports empty in unit tests */
for (const [path, url] of Object.entries(unitImages)) {
  const parts = path.split('/');
  const filename = parts[parts.length - 1].replace(/\.(png|webp)$/, '');
  if (!imagesByName[filename] || path.endsWith('.webp')) {
    imagesByName[filename] = url;
  }
}

/**
 * Generates the expected image path for a unit
 * Loads images from src/assets/units using Vite's asset import system
 * Uses imageName from UnitData if available, otherwise converts unit name
 */
export function getUnitImagePath(unitName: string): string {
  const unitData = getUnitDataByName(unitName);
  let imageName: string;
  
  if (unitData?.imageName) {
    imageName = unitData.imageName;
  } else {
    imageName = unitName
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/'/g, '')
      .replace(/[^a-z0-9_]/g, '');
  }
  
  const image = imagesByName[imageName];
  
  if (image) {
    return image;
  }
  
  return `/assets/units/${imageName}.png`;
}

/**
 * Preloads a specific unit image (returns immediately since images are eager-loaded)
 */
export async function preloadUnitImage(unitName: string): Promise<string> {
  return getUnitImagePath(unitName);
}

/**
 * Generates a placeholder image URL with unit initial
 * This can be used as a fallback when the actual image is not available
 */
export function getPlaceholderImageUrl(unitName: string): string {
  const initial = unitName.charAt(0).toUpperCase();
  // Create a data URL for a simple colored square with the initial
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Background color based on rarity (will be set by parent component)
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(0, 0, size, size);
    
    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initial, size / 2, size / 2);
  }
  
  return canvas.toDataURL();
}

/**
 * Checks if an image exists at the given path
 */
export async function checkImageExists(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}
