/**
 * Utility functions for handling unit images
 */

import { getUnitDataByName } from '../types/unitNames';

// Preload all unit images from src/assets/units using Vite's glob import
// This allows dynamic access to images at runtime
const unitImages = import.meta.glob<string>('../assets/units/*.png', { 
  eager: true,
  import: 'default'
});

// Create a lookup map by filename for easier access
const imagesByName: Record<string, string> = {};
for (const [path, url] of Object.entries(unitImages)) {
  const filename = path.split('/').pop()?.replace('.png', '') || '';
  imagesByName[filename] = url;
}

/**
 * Generates the expected image path for a unit
 * Loads images from src/assets/units using Vite's asset import system
 * Uses imageName from UnitData if available, otherwise converts unit name
 */
export function getUnitImagePath(unitName: string): string {
  // Try to get unit data first to use the explicit imageName
  const unitData = getUnitDataByName(unitName);
  let imageName: string;
  
  if (unitData?.imageName) {
    // Use the explicit imageName from UnitData
    imageName = unitData.imageName;
  } else {
    // Fallback: Convert unit name to match image filename format (lowercase with underscores)
    imageName = unitName
      .toLowerCase()
      .replace(/\s+/g, '_')  // Replace spaces with underscores to match image filenames
      .replace(/'/g, '')     // Remove apostrophes
      .replace(/[^a-z0-9_]/g, '');  // Remove any other non-alphanumeric characters except underscores
  }
  
  // Look up in the filename map
  const image = imagesByName[imageName];
  
  if (image) {
    return image;
  }
  
  // Fallback to public assets if not found in src/assets/units
  return `/assets/units/${imageName}.png`;
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

