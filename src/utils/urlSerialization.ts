import type { Unit, Formation } from '../types';
import { getUnitDataByName, UnitDataMap } from '../types/unitNames';
import { calculateUnitPower } from './powerUtils';
import { getUnitImagePath } from './imageUtils';

/**
 * Serialize units to URL format: id,level,count;id,level,count
 * Groups units by unit name index and level, then counts them
 * Uses ";" as separator instead of "#" to avoid URL fragment issues
 */
export function serializeUnits(units: Unit[]): string {
  // Group units by unit name index and level
  const grouped = new Map<string, number>();
  
  for (const unit of units) {
    const unitData = getUnitDataByName(unit.name);
    if (!unitData) continue;
    
    const key = `${unitData.index},${unit.level}`;
    grouped.set(key, (grouped.get(key) || 0) + 1);
  }
  
  // Convert to string format: id,level,count;id,level,count
  return Array.from(grouped.entries())
    .map(([key, count]) => `${key},${count}`)
    .join(';');
}

/**
 * Deserialize units from URL format: id,level,count;id,level,count
 * Note: Maximum total units (roster + formation) is 1000, but this function
 * only handles roster units. Combined limit is enforced at component level.
 * Maximum count per unit per level is 49
 * Uses ";" as separator instead of "#" to avoid URL fragment issues
 */
export function deserializeUnits(unitsString: string): Unit[] {
  if (!unitsString) return [];
  
  const units: Unit[] = [];
  const entries = unitsString.split(';');
  const maxRosterSize = 1000; // Maximum roster size (component enforces combined limit)
  const maxUnitsPerLevel = 49; // Maximum count per unit per level
  
  for (const entry of entries) {
    // Check total roster size limit
    if (units.length >= maxRosterSize) {
      break; // Stop adding if roster is at capacity
    }
    
    const parts = entry.split(',');
    if (parts.length !== 3) continue;
    
    const unitIndex = parseInt(parts[0], 10);
    const level = parseInt(parts[1], 10);
    const count = parseInt(parts[2], 10);
    
    if (isNaN(unitIndex) || isNaN(level) || isNaN(count)) continue;
    
    // Find unit data by index
    const unitData = Object.values(UnitDataMap).find(data => data.index === unitIndex);
    if (!unitData) continue;
    
    // Validate level
    if (level < 1 || level > 10) continue;
    
    // Count existing units of this type and level
    const existingCount = units.filter(
      (u) => u.name === unitData.name && u.level === level
    ).length;
    
    // Calculate how many units we can still add for this unit+level combination
    const availablePerLevel = maxUnitsPerLevel - existingCount;
    const availableRosterSpace = maxRosterSize - units.length;
    const unitsToAdd = Math.min(count, availablePerLevel, availableRosterSpace);
    
    // Create units based on count (limited by max per unit per level and total roster size)
    for (let i = 0; i < unitsToAdd; i++) {
      const unit: Unit = {
        id: `${unitData.index}-${level}-${existingCount + i}-${Date.now()}-${Math.random()}`,
        name: unitData.name,
        level,
        rarity: unitData.rarity,
        power: calculateUnitPower(unitData.rarity, level),
        imageUrl: getUnitImagePath(unitData.name),
      };
      units.push(unit);
    }
  }
  
  return units;
}

/**
 * Serialize formation to URL format: formationName;id,level;_id,level
 * Format: formation name, then ; separator, then grid data
 * Empty cells are represented as _ (underscore)
 * Grid is serialized row by row, left to right
 * Count is not stored since it's always 1
 * Uses ";" as separator instead of "#" to avoid URL fragment issues
 */
export function serializeFormation(formation: Formation | null): string {
  if (!formation) return '';
  
  // Start with formation name
  const parts: string[] = [formation.name];
  
  // Add grid data
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 7; col++) {
      const unit = formation.tiles[row]?.[col];
      
      if (!unit) {
        parts.push('_'); // Use underscore for empty cells
      } else {
        const unitData = getUnitDataByName(unit.name);
        if (unitData) {
          // Format: id,level (count removed since it's always 1)
          parts.push(`${unitData.index},${unit.level}`);
        } else {
          parts.push('_'); // Use underscore for empty cells
        }
      }
    }
  }
  
  return parts.join(';');
}

/**
 * Deserialize formation from URL format: formationName;id,level;_id,level
 * Format: formation name, then ; separator, then grid data
 * Empty cells are represented as _ (underscore)
 * Count is not stored since it's always 1
 * Returns an object with name and tiles
 * Uses ";" as separator instead of "#" to avoid URL fragment issues
 */
export function deserializeFormation(formationString: string): { name: string; tiles: (Unit | null)[][] } {
  const tiles: (Unit | null)[][] = Array(7)
    .fill(null)
    .map(() => Array(7).fill(null));
  
  let formationName = 'Formation 9'; // Default name
  
  if (!formationString) {
    return { name: formationName, tiles };
  }
  
  const parts = formationString.split(';');
  
  // First part is the formation name
  if (parts.length > 0 && parts[0]) {
    formationName = parts[0];
  }
  
  // Grid data starts from index 1 (after the name and first ; separator)
  // We have 49 cells (7x7 grid), so we need 49 parts after the name
  for (let i = 1; i < Math.min(parts.length, 50); i++) { // 1 + 49 = 50 max
    const cellIndex = i - 1; // Convert to 0-based cell index
    const row = Math.floor(cellIndex / 7);
    const col = cellIndex % 7;
    
    const part = parts[i];
    
    // Empty cell (represented as _ or empty string, or old format ;;)
    if (part === '_' || part === ';;' || !part) {
      tiles[row][col] = null;
      continue;
    }
    
    // Parse unit data: id,level (count removed)
    const unitParts = part.split(',');
    if (unitParts.length !== 2) {
      tiles[row][col] = null;
      continue;
    }
    
    const unitIndex = parseInt(unitParts[0], 10);
    const level = parseInt(unitParts[1], 10);
    
    if (isNaN(unitIndex) || isNaN(level)) {
      tiles[row][col] = null;
      continue;
    }
    
    // Find unit data by index
    const unitData = Object.values(UnitDataMap).find(data => data.index === unitIndex);
    if (!unitData) {
      tiles[row][col] = null;
      continue;
    }
    
    // Validate level
    if (level < 1 || level > 10) {
      tiles[row][col] = null;
      continue;
    }
    
    // Create unit (count is always 1, so we don't need to parse it)
    const unit: Unit = {
      id: `${unitData.index}-${level}-${row}-${col}-${Date.now()}-${Math.random()}`,
      name: unitData.name,
      level,
      rarity: unitData.rarity,
      power: calculateUnitPower(unitData.rarity, level),
      imageUrl: getUnitImagePath(unitData.name),
    };
    
    tiles[row][col] = unit;
  }
  
  return { name: formationName, tiles };
}

