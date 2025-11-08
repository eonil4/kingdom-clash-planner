/**
 * Unit Names Constants with Data
 * All available unit names ordered alphabetically with numeric indices, rarity, and power calculation
 */

import type { UnitRarity } from './index';
import { UnitRarity as UnitRarityEnum } from './index';
import { calculateUnitPower } from '../utils/powerUtils';

/**
 * Unit data structure
 */
export interface UnitData {
  name: string;
  index: number;
  rarity: UnitRarity;
  /**
   * Image filename (without extension) matching the file in src/assets/units/
   */
  imageName: string;
  /**
   * Get power at a specific level (1-10)
   */
  getPower: (level: number) => number;
}

/**
 * Unit Names with their data (index, rarity, power calculation)
 * Ordered alphabetically
 */
export const UnitDataMap: Record<string, UnitData> = {
  AIR_ELEMENTAL: {
    name: 'AIR ELEMENTAL',
    index: 0,
    rarity: UnitRarityEnum.Epic,
    imageName: 'air_elemental',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Epic, level),
  },
  ALCHEMIST: {
    name: 'ALCHEMIST',
    index: 1,
    rarity: UnitRarityEnum.Epic,
    imageName: 'alchemist',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Epic, level),
  },
  ARCHERS: {
    name: 'ARCHERS',
    index: 2,
    rarity: UnitRarityEnum.Common,
    imageName: 'archers',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Common, level),
  },
  ASSASSINS: {
    name: 'ASSASSINS',
    index: 3,
    rarity: UnitRarityEnum.Rare,
    imageName: 'assassins',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Rare, level),
  },
  BATTLE_GOLEM: {
    name: 'BATTLE GOLEM',
    index: 4,
    rarity: UnitRarityEnum.Common,
    imageName: 'battle_golem',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Common, level),
  },
  BOMBERS: {
    name: 'BOMBERS',
    index: 5,
    rarity: UnitRarityEnum.Rare,
    imageName: 'bombers',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Rare, level),
  },
  BONEBREAKER: {
    name: 'BONEBREAKER',
    index: 6,
    rarity: UnitRarityEnum.Legendary,
    imageName: 'bonebreaker',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Legendary, level),
  },
  BONE_SPEARTHROWER: {
    name: 'BONE SPEARTHROWER',
    index: 7,
    rarity: UnitRarityEnum.Common,
    imageName: 'bone_spearthrower',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Common, level),
  },
  BONE_WARRIOR: {
    name: 'BONE WARRIOR',
    index: 8,
    rarity: UnitRarityEnum.Common,
    imageName: 'bone_warrior',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Common, level),
  },
  BUTCHER: {
    name: 'BUTCHER',
    index: 9,
    rarity: UnitRarityEnum.Rare,
    imageName: 'butcher',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Rare, level),
  },
  CATAPULT: {
    name: 'CATAPULT',
    index: 10,
    rarity: UnitRarityEnum.Common,
    imageName: 'catapult',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Common, level),
  },
  CURSED_CATAPULT: {
    name: 'CURSED CATAPULT',
    index: 11,
    rarity: UnitRarityEnum.Rare,
    imageName: 'cursed_catapult',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Rare, level),
  },
  EXPLOSIVE_SPIDER: {
    name: 'EXPLOSIVE SPIDER',
    index: 12,
    rarity: UnitRarityEnum.Rare,
    imageName: 'explosive_spider',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Rare, level),
  },
  GIANT_TOAD: {
    name: 'GIANT TOAD',
    index: 13,
    rarity: UnitRarityEnum.Legendary,
    imageName: 'giant_toad',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Legendary, level),
  },
  GRAVEDIGGER: {
    name: 'GRAVEDIGGER',
    index: 14,
    rarity: UnitRarityEnum.Rare,
    imageName: 'gravedigger',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Rare, level),
  },
  HEADLESS: {
    name: 'HEADLESS',
    index: 15,
    rarity: UnitRarityEnum.Legendary,
    imageName: 'headless',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Legendary, level),
  },
  HUNTRESS: {
    name: 'HUNTRESS',
    index: 16,
    rarity: UnitRarityEnum.Legendary,
    imageName: 'huntress',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Legendary, level),
  },
  IMP: {
    name: 'IMP',
    index: 17,
    rarity: UnitRarityEnum.Rare,
    imageName: 'imp',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Rare, level),
  },
  IMMORTAL: {
    name: 'IMMORTAL',
    index: 18,
    rarity: UnitRarityEnum.Epic,
    imageName: 'immortal',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Epic, level),
  },
  INFANTRY: {
    name: 'INFANTRY',
    index: 19,
    rarity: UnitRarityEnum.Common,
    imageName: 'infantry',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Common, level),
  },
  IRON_GUARDS: {
    name: 'IRON GUARDS',
    index: 20,
    rarity: UnitRarityEnum.Rare,
    imageName: 'iron_guards',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Rare, level),
  },
  LANCER: {
    name: 'LANCER',
    index: 21,
    rarity: UnitRarityEnum.Epic,
    imageName: 'lancer',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Epic, level),
  },
  LAVA_GOLEM: {
    name: 'LAVA GOLEM',
    index: 22,
    rarity: UnitRarityEnum.Epic,
    imageName: 'lava_golem',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Epic, level),
  },
  MAGIC_ARCHER: {
    name: 'MAGIC ARCHER',
    index: 23,
    rarity: UnitRarityEnum.Epic,
    imageName: 'magic_archer',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Epic, level),
  },
  MONK: {
    name: 'MONK',
    index: 24,
    rarity: UnitRarityEnum.Epic,
    imageName: 'monk',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Epic, level),
  },
  NECROMANCER: {
    name: 'NECROMANCER',
    index: 25,
    rarity: UnitRarityEnum.Epic,
    imageName: 'necromancer',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Epic, level),
  },
  NIGHT_HUNTER: {
    name: 'NIGHT HUNTER',
    index: 26,
    rarity: UnitRarityEnum.Legendary,
    imageName: 'night_hunter',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Legendary, level),
  },
  PALADIN: {
    name: 'PALADIN',
    index: 27,
    rarity: UnitRarityEnum.Epic,
    imageName: 'paladin',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Epic, level),
  },
  PHOENIX: {
    name: 'PHOENIX',
    index: 28,
    rarity: UnitRarityEnum.Legendary,
    imageName: 'phoenix',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Legendary, level),
  },
  PYROTECHNICIAN: {
    name: 'PYROTECHNICIAN',
    index: 29,
    rarity: UnitRarityEnum.Epic,
    imageName: 'pyrotechnician',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Epic, level),
  },
  ROYAL_GUARD: {
    name: 'ROYAL GUARD',
    index: 30,
    rarity: UnitRarityEnum.Epic,
    imageName: 'royal_guard',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Epic, level),
  },
  SHAMAN: {
    name: 'SHAMAN',
    index: 31,
    rarity: UnitRarityEnum.Legendary,
    imageName: 'shaman',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Legendary, level),
  },
  SORCERERS_APPRENTICES: {
    name: 'SORCERER\'S APPRENTICES',
    index: 32,
    rarity: UnitRarityEnum.Common,
    imageName: 'sorcerers_apprentices',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Common, level),
  },
  STONE_GOLEM: {
    name: 'STONE GOLEM',
    index: 33,
    rarity: UnitRarityEnum.Legendary,
    imageName: 'stone_golem',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Legendary, level),
  },
  STORM_MISTRESSES: {
    name: 'STORM MISTRESSES',
    index: 34,
    rarity: UnitRarityEnum.Epic,
    imageName: 'storm_mistresses',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Epic, level),
  },
  UNDEAD_MAGE: {
    name: 'UNDEAD MAGE',
    index: 35,
    rarity: UnitRarityEnum.Rare,
    imageName: 'undead_mage',
    getPower: (level: number) => calculateUnitPower(UnitRarityEnum.Rare, level),
  },
};

/**
 * Legacy UnitName enum for backward compatibility
 * Maps to unit names
 */
export const UnitName = {
  AIR_ELEMENTAL: UnitDataMap.AIR_ELEMENTAL.name,
  ALCHEMIST: UnitDataMap.ALCHEMIST.name,
  ARCHERS: UnitDataMap.ARCHERS.name,
  ASSASSINS: UnitDataMap.ASSASSINS.name,
  BATTLE_GOLEM: UnitDataMap.BATTLE_GOLEM.name,
  BOMBERS: UnitDataMap.BOMBERS.name,
  BONEBREAKER: UnitDataMap.BONEBREAKER.name,
  BONE_SPEARTHROWER: UnitDataMap.BONE_SPEARTHROWER.name,
  BONE_WARRIOR: UnitDataMap.BONE_WARRIOR.name,
  BUTCHER: UnitDataMap.BUTCHER.name,
  CATAPULT: UnitDataMap.CATAPULT.name,
  CURSED_CATAPULT: UnitDataMap.CURSED_CATAPULT.name,
  EXPLOSIVE_SPIDER: UnitDataMap.EXPLOSIVE_SPIDER.name,
  GIANT_TOAD: UnitDataMap.GIANT_TOAD.name,
  GRAVEDIGGER: UnitDataMap.GRAVEDIGGER.name,
  HEADLESS: UnitDataMap.HEADLESS.name,
  HUNTRESS: UnitDataMap.HUNTRESS.name,
  IMP: UnitDataMap.IMP.name,
  IMMORTAL: UnitDataMap.IMMORTAL.name,
  INFANTRY: UnitDataMap.INFANTRY.name,
  IRON_GUARDS: UnitDataMap.IRON_GUARDS.name,
  LANCER: UnitDataMap.LANCER.name,
  LAVA_GOLEM: UnitDataMap.LAVA_GOLEM.name,
  MAGIC_ARCHER: UnitDataMap.MAGIC_ARCHER.name,
  MONK: UnitDataMap.MONK.name,
  NECROMANCER: UnitDataMap.NECROMANCER.name,
  NIGHT_HUNTER: UnitDataMap.NIGHT_HUNTER.name,
  PALADIN: UnitDataMap.PALADIN.name,
  PHOENIX: UnitDataMap.PHOENIX.name,
  PYROTECHNICIAN: UnitDataMap.PYROTECHNICIAN.name,
  ROYAL_GUARD: UnitDataMap.ROYAL_GUARD.name,
  SHAMAN: UnitDataMap.SHAMAN.name,
  SORCERERS_APPRENTICES: UnitDataMap.SORCERERS_APPRENTICES.name,
  STONE_GOLEM: UnitDataMap.STONE_GOLEM.name,
  STORM_MISTRESSES: UnitDataMap.STORM_MISTRESSES.name,
  UNDEAD_MAGE: UnitDataMap.UNDEAD_MAGE.name,
} as const;

export type UnitName = typeof UnitName[keyof typeof UnitName];

/**
 * Array of all unit names in alphabetical order
 */
export const UNIT_NAMES_ARRAY = Object.values(UnitName).sort();

/**
 * Get unit data by unit name key
 */
export function getUnitData(key: keyof typeof UnitDataMap): UnitData {
  return UnitDataMap[key];
}

/**
 * Get unit data by unit name string
 */
export function getUnitDataByName(name: string): UnitData | undefined {
  const entry = Object.entries(UnitDataMap).find(([, data]) => data.name === name);
  return entry ? entry[1] : undefined;
}

/**
 * Get unit data by index
 */
export function getUnitDataByIndex(index: number): UnitData | undefined {
  const entry = Object.values(UnitDataMap).find((data) => data.index === index);
  return entry;
}

/**
 * Map of unit name to its index (0-based)
 */
export const UNIT_NAME_TO_INDEX: Record<string, number> = Object.values(UnitDataMap).reduce(
  (acc, data) => {
    acc[data.name] = data.index;
    return acc;
  },
  {} as Record<string, number>
);

/**
 * Map of index to unit name
 */
export const INDEX_TO_UNIT_NAME: Record<number, string> = Object.values(UnitDataMap).reduce(
  (acc, data) => {
    acc[data.index] = data.name;
    return acc;
  },
  {} as Record<number, string>
);

/**
 * Get unit name by index
 */
export function getUnitNameByIndex(index: number): string | undefined {
  return INDEX_TO_UNIT_NAME[index];
}

/**
 * Get index by unit name
 */
export function getIndexByUnitName(name: string): number | undefined {
  return UNIT_NAME_TO_INDEX[name];
}
