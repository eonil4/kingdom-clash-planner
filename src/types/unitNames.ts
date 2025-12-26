/**
 * Unit Names Constants with Data
 * All available unit names ordered alphabetically with numeric indices, rarity, and power calculation
 */

import type { UnitRarity, UnitRole } from './index';
import { UnitRarity as UnitRarityEnum, UnitRole as UnitRoleEnum } from './index';
import { calculateUnitPower } from '../utils/powerUtils';

/**
 * Unit data structure
 */
export interface UnitData {
  name: string;
  index: number;
  rarity: UnitRarity;
  roles: UnitRole[];
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
 * Helper function to create unit data with automatic imageName generation
 * Applies DRY principle by reducing repetition
 */
function createUnitData(
  name: string,
  index: number,
  rarity: UnitRarity,
  roles: UnitRole[]
): UnitData {
  const imageName = name.toLowerCase().replace(/'/g, '').replace(/\s+/g, '_');
  
  return {
    name,
    index,
    rarity,
    roles,
    imageName,
    getPower: (level: number) => calculateUnitPower(rarity, level),
  };
}

/**
 * Unit Names with their data (index, rarity, power calculation)
 * Ordered alphabetically
 */
const R = UnitRoleEnum;

export const UnitDataMap: Record<string, UnitData> = {
  AIR_ELEMENTAL: createUnitData('Air Elemental', 0, UnitRarityEnum.Epic, [R.Mages, R.Trickster]),
  ALCHEMIST: createUnitData('Alchemist', 1, UnitRarityEnum.Epic, [R.Human, R.Support]),
  ARCHERS: createUnitData('Archers', 2, UnitRarityEnum.Common, [R.Human]),
  ASSASSINS: createUnitData('Assassins', 3, UnitRarityEnum.Rare, [R.Human, R.Trickster]),
  BATTLE_GOLEM: createUnitData('Battle Golem', 4, UnitRarityEnum.Common, [R.Mages]),
  BOMBERS: createUnitData('Bombers', 5, UnitRarityEnum.Rare, [R.Human, R.Ranger]),
  BONEBREAKER: createUnitData('Bonebreaker', 6, UnitRarityEnum.Legendary, [R.Human, R.Trickster, R.Tank]),
  BONE_SPEARTHROWER: createUnitData('Bone Spearthrower', 7, UnitRarityEnum.Common, [R.Undead]),
  BONE_WARRIOR: createUnitData('Bone Warrior', 8, UnitRarityEnum.Common, [R.Undead]),
  BUTCHER: createUnitData('Butcher', 9, UnitRarityEnum.Rare, [R.Human, R.Tank]),
  CATAPULT: createUnitData('Catapult', 10, UnitRarityEnum.Common, [R.Human]),
  CURSED_CATAPULT: createUnitData('Cursed Catapult', 11, UnitRarityEnum.Rare, [R.Undead, R.Ranger]),
  EXPLOSIVE_SPIDER: createUnitData('Explosive Spider', 12, UnitRarityEnum.Rare, [R.Undead]),
  GIANT_TOAD: createUnitData('Giant Toad', 13, UnitRarityEnum.Legendary, [R.Mages, R.Trickster, R.Support]),
  GRAVEDIGGER: createUnitData('Gravedigger', 14, UnitRarityEnum.Rare, [R.Undead, R.Trickster]),
  HEADLESS: createUnitData('Headless', 15, UnitRarityEnum.Legendary, [R.Undead, R.Support, R.Tank]),
  HUNTRESS: createUnitData('Huntress', 16, UnitRarityEnum.Legendary, [R.Human, R.Ranger, R.Support]),
  IMP: createUnitData('Imp', 17, UnitRarityEnum.Rare, [R.Undead, R.Ranger]),
  IMMORTAL: createUnitData('Immortal', 18, UnitRarityEnum.Epic, [R.Undead, R.Tank]),
  INFANTRY: createUnitData('Infantry', 19, UnitRarityEnum.Common, [R.Human]),
  IRON_GUARDS: createUnitData('Iron Guards', 20, UnitRarityEnum.Rare, [R.Human, R.Tank]),
  LANCER: createUnitData('Lancer', 21, UnitRarityEnum.Epic, [R.Human, R.Trickster]),
  LAVA_GOLEM: createUnitData('Lava Golem', 22, UnitRarityEnum.Epic, [R.Mages, R.Tank]),
  MAGIC_ARCHER: createUnitData('Magic Archer', 23, UnitRarityEnum.Epic, [R.Mages, R.Ranger]),
  MONK: createUnitData('Monk', 24, UnitRarityEnum.Epic, [R.Human, R.Tank]),
  NECROMANCER: createUnitData('Necromancer', 25, UnitRarityEnum.Epic, [R.Undead, R.Support]),
  NIGHT_HUNTER: createUnitData('Night Hunter', 26, UnitRarityEnum.Legendary, [R.Undead, R.Trickster, R.Support]),
  PALADIN: createUnitData('Paladin', 27, UnitRarityEnum.Epic, [R.Human, R.Support]),
  PHOENIX: createUnitData('Phoenix', 28, UnitRarityEnum.Legendary, [R.Mages, R.Ranger, R.Tank]),
  PYROTECHNICIAN: createUnitData('Pyrotechnician', 29, UnitRarityEnum.Epic, [R.Human, R.Ranger]),
  ROYAL_GUARD: createUnitData('Royal Guard', 30, UnitRarityEnum.Epic, [R.Human, R.Trickster]),
  SHAMAN: createUnitData('Shaman', 31, UnitRarityEnum.Legendary, [R.Mages, R.Ranger, R.Support]),
  SORCERERS_APPRENTICES: createUnitData('Sorcerer\'s Apprentices', 32, UnitRarityEnum.Common, [R.Mages]),
  STONE_GOLEM: createUnitData('Stone Golem', 33, UnitRarityEnum.Legendary, [R.Mages, R.Support, R.Tank]),
  STORM_MISTRESSES: createUnitData('Storm Mistresses', 34, UnitRarityEnum.Epic, [R.Mages, R.Trickster]),
  UNDEAD_MAGE: createUnitData('Undead Mage', 35, UnitRarityEnum.Rare, [R.Undead, R.Ranger]),
  AXE_THROWERS: createUnitData('Axe Throwers', 36, UnitRarityEnum.Legendary, [R.Human, R.Trickster, R.Ranger]),
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
  AXE_THROWERS: UnitDataMap.AXE_THROWERS.name,
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
