import type { Unit, Formation } from '../../src/types';
import { UnitRarity } from '../../src/types';
import { UnitName } from '../../src/types/unitNames';
import { calculateUnitPower } from '../../src/utils/powerUtils';

const getImageUrl = (unitName: string): string => {
  const imageName = unitName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/'/g, '')
    .replace(/[^a-z0-9-]/g, '');
  return `/assets/units/${imageName}.png`;
};

export const createUnit = (id: string, name: string, level: number, rarity: UnitRarity): Unit => ({
  id,
  name,
  level,
  rarity,
  power: calculateUnitPower(rarity, level),
  imageUrl: getImageUrl(name),
});

export const mockUnits: Unit[] = [
  createUnit('1', UnitName.PALADIN, 10, UnitRarity.Legendary),
  createUnit('2', UnitName.HUNTRESS, 10, UnitRarity.Legendary),
  createUnit('3', UnitName.BONEBREAKER, 10, UnitRarity.Legendary),
  createUnit('4', UnitName.SHAMAN, 9, UnitRarity.Legendary),
  createUnit('5', UnitName.HEADLESS, 10, UnitRarity.Legendary),
  createUnit('6', UnitName.NIGHT_HUNTER, 9, UnitRarity.Legendary),
  createUnit('7', UnitName.STONE_GOLEM, 10, UnitRarity.Legendary),
  createUnit('8', UnitName.GIANT_TOAD, 8, UnitRarity.Legendary),
  createUnit('9', UnitName.PHOENIX, 10, UnitRarity.Legendary),
  createUnit('10', UnitName.NECROMANCER, 10, UnitRarity.Epic),
  createUnit('11', UnitName.BUTCHER, 10, UnitRarity.Epic),
  createUnit('12', UnitName.UNDEAD_MAGE, 9, UnitRarity.Epic),
  createUnit('13', UnitName.ALCHEMIST, 10, UnitRarity.Epic),
  createUnit('14', UnitName.IMP, 8, UnitRarity.Epic),
  createUnit('15', UnitName.MONK, 9, UnitRarity.Epic),
  createUnit('16', UnitName.MAGIC_ARCHER, 10, UnitRarity.Epic),
  createUnit('17', UnitName.PYROTECHNICIAN, 8, UnitRarity.Epic),
  createUnit('18', UnitName.STORM_MISTRESSES, 9, UnitRarity.Epic),
  createUnit('19', UnitName.SORCERERS_APPRENTICES, 10, UnitRarity.Epic),
  createUnit('20', UnitName.LAVA_GOLEM, 8, UnitRarity.Epic),
  createUnit('21', UnitName.ROYAL_GUARD, 10, UnitRarity.Epic),
  createUnit('22', UnitName.IMMORTAL, 9, UnitRarity.Epic),
  createUnit('23', UnitName.AIR_ELEMENTAL, 8, UnitRarity.Epic),
  createUnit('24', UnitName.ARCHERS, 10, UnitRarity.Rare),
  createUnit('25', UnitName.INFANTRY, 10, UnitRarity.Rare),
  createUnit('26', UnitName.IRON_GUARDS, 9, UnitRarity.Rare),
  createUnit('27', UnitName.BOMBERS, 8, UnitRarity.Rare),
  createUnit('28', UnitName.CATAPULT, 10, UnitRarity.Rare),
  createUnit('29', UnitName.ASSASSINS, 9, UnitRarity.Rare),
  createUnit('30', UnitName.LANCER, 8, UnitRarity.Rare),
  createUnit('31', UnitName.BATTLE_GOLEM, 7, UnitRarity.Rare),
  createUnit('32', UnitName.GRAVEDIGGER, 9, UnitRarity.Rare),
  createUnit('33', UnitName.BONE_WARRIOR, 10, UnitRarity.Common),
  createUnit('34', UnitName.BONE_SPEARTHROWER, 9, UnitRarity.Common),
  createUnit('35', UnitName.CURSED_CATAPULT, 8, UnitRarity.Common),
  createUnit('36', UnitName.EXPLOSIVE_SPIDER, 7, UnitRarity.Common),
];

const generateMoreUnits = (): Unit[] => {
  const units: Unit[] = [];
  const baseUnits = [
    { name: UnitName.ARCHERS, rarity: UnitRarity.Rare },
    { name: UnitName.INFANTRY, rarity: UnitRarity.Rare },
    { name: UnitName.LANCER, rarity: UnitRarity.Rare },
    { name: UnitName.NECROMANCER, rarity: UnitRarity.Epic },
    { name: UnitName.BATTLE_GOLEM, rarity: UnitRarity.Rare },
    { name: UnitName.AIR_ELEMENTAL, rarity: UnitRarity.Epic },
    { name: UnitName.IMP, rarity: UnitRarity.Epic },
    { name: UnitName.BONE_WARRIOR, rarity: UnitRarity.Common },
    { name: UnitName.IRON_GUARDS, rarity: UnitRarity.Rare },
    { name: UnitName.ROYAL_GUARD, rarity: UnitRarity.Epic },
  ];

  let id = 37;
  for (let i = 0; i < 234; i++) {
    const baseUnit = baseUnits[Math.floor(Math.random() * baseUnits.length)];
    const level = Math.floor(Math.random() * 10) + 1;
    units.push(createUnit(String(id++), baseUnit.name, level, baseUnit.rarity));
  }

  return units;
};

export const allMockUnits = [...mockUnits, ...generateMoreUnits()];

export const mockFormations: Formation[] = [
  {
    id: '1',
    name: 'Arena plan',
    tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    power: 0,
  },
  {
    id: '2',
    name: 'Arena 1',
    tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    power: 341640,
  },
  {
    id: '3',
    name: 'Arena',
    tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    power: 0,
  },
  {
    id: '4',
    name: 'Arena 2',
    tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    power: 0,
  },
  {
    id: '5',
    name: 'Headhunt',
    tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    power: 0,
  },
  {
    id: '6',
    name: 'Boss 2',
    tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    power: 0,
  },
];

export const createEmptyFormation = (id: string, name: string): Formation => ({
  id,
  name,
  tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
  power: 0,
});

