/**
 * Utility functions for normalizing and cleaning unit names
 */

/**
 * Normalizes a unit name by removing trailing numbers and extra spaces
 * Examples:
 *   "Archer 1" -> "Archer"
 *   "Archer 10" -> "Archer"
 *   "Warrior 5" -> "Warrior"
 *   "PALADIN" -> "PALADIN" (no change)
 */
export function normalizeUnitName(name: string): string {
  // Remove trailing numbers and spaces (e.g., "Archer 1" -> "Archer", "Archer 10" -> "Archer")
  return name.replace(/\s+\d+$/, '').trim();
}

/**
 * Cleans up unit names in an array, removing numbered variants
 */
export function deduplicateUnitNames(names: string[]): string[] {
  const normalized = names.map(normalizeUnitName);
  return Array.from(new Set(normalized));
}

