/**
 * Game Constants
 * Centralized configuration values for Kingdom Clash game mechanics
 */

// Formation Configuration
export const FORMATION_GRID_SIZE = 7;
export const FORMATION_TOTAL_CELLS = FORMATION_GRID_SIZE * FORMATION_GRID_SIZE;

// Unit Limits
export const MAX_TOTAL_UNITS = 1000; // Combined roster + formation limit
export const MAX_UNITS_PER_LEVEL = 49; // Maximum count per unit per level

// Unit Level Configuration
export const MIN_UNIT_LEVEL = 1;
export const MAX_UNIT_LEVEL = 10;

// Grid Size Calculations
export const GRID_SIZE_RANGE = {
  MIN: 10,
  MAX: 100,
  DEFAULT: 80,
} as const;

// Drag and Drop Types
export const DND_TYPES = {
  UNIT: 'unit',
} as const;

// Formation Name
export const DEFAULT_FORMATION_NAME = 'Formation 1';