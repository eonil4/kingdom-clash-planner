/**
 * Utility functions for handling unit images
 */

/**
 * Generates the expected image path for a unit
 */
export function getUnitImagePath(unitName: string): string {
  const imageName = unitName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/'/g, '')
    .replace(/[^a-z0-9-]/g, '');
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

