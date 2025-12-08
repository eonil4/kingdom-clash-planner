import type { UnitRarity } from '../types';
import { UnitRarity as UnitRarityEnum } from '../types';

// Power values by rarity and level
const powerTable: Record<UnitRarity, number[]> = {
  [UnitRarityEnum.Legendary]: [160, 320, 640, 1280, 2560, 5120, 10240, 20480, 30720, 61440],
  [UnitRarityEnum.Epic]: [140, 280, 560, 1120, 2240, 4480, 8960, 13440, 26880, 53760],
  [UnitRarityEnum.Rare]: [120, 240, 480, 960, 1920, 3840, 7680, 11520, 23040, 46080],
  [UnitRarityEnum.Common]: [100, 200, 400, 800, 1600, 3200, 6400, 9600, 19200, 38400],
};

/**
 * Calculate unit power based on rarity and level
 * @param rarity - Unit rarity (Common, Rare, Epic, Legendary)
 * @param level - Unit level (1-10)
 * @returns Power value for the unit
 */
export function calculateUnitPower(rarity: UnitRarity, level: number): number {
  // Clamp level between 1 and 10
  const clampedLevel = Math.max(1, Math.min(10, level));
  // Get power from table (level is 1-indexed, array is 0-indexed)
  return powerTable[rarity]?.[clampedLevel - 1] || 0;
}

/**
 * Format a number with space as thousand separator
 * @param value - Number to format
 * @returns Formatted string (e.g., 2201600 -> "2 201 600")
 */
export function formatNumber(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
