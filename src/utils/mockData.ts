import type { Unit, Formation } from '../types';
import { UnitRarity } from '../types';
import { calculateUnitPower } from './powerUtils';

// Helper function to generate image URL path
const getImageUrl = (unitName: string): string => {
  // Convert unit name to lowercase and replace spaces with hyphens
  // Handle special characters and apostrophes
  const imageName = unitName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/'/g, '')
    .replace(/[^a-z0-9-]/g, '');
  // Use Vite's asset import - images should be in public/assets/units or imported
  return `/assets/units/${imageName}.png`;
};

// Helper function to create a unit with power calculation
const createUnit = (id: string, name: string, level: number, rarity: UnitRarity): Unit => ({
  id,
  name,
  level,
  rarity,
  power: calculateUnitPower(rarity, level),
  imageUrl: getImageUrl(name),
});

export const mockUnits: Unit[] = [
  // Legendary units (Gold/Yellow borders)
  createUnit('1', 'PALADIN', 10, UnitRarity.Legendary),
  createUnit('2', 'HUNTRESS', 10, UnitRarity.Legendary),
  createUnit('3', 'BONEBREAKER', 10, UnitRarity.Legendary),
  createUnit('4', 'SHAMAN', 9, UnitRarity.Legendary),
  createUnit('5', 'HEADLESS', 10, UnitRarity.Legendary),
  createUnit('6', 'NIGHT HUNTER', 9, UnitRarity.Legendary),
  createUnit('7', 'STONE GOLEM', 10, UnitRarity.Legendary),
  createUnit('8', 'GIANT TOAD', 8, UnitRarity.Legendary),
  createUnit('9', 'PHOENIX', 10, UnitRarity.Legendary),
  
  // Epic units (Purple borders)
  createUnit('10', 'NECROMANCER', 10, UnitRarity.Epic),
  createUnit('11', 'BUTCHER', 10, UnitRarity.Epic),
  createUnit('12', 'UNDEAD MAGE', 9, UnitRarity.Epic),
  createUnit('13', 'ALCHEMIST', 10, UnitRarity.Epic),
  createUnit('14', 'IMP', 8, UnitRarity.Epic),
  createUnit('15', 'MONK', 9, UnitRarity.Epic),
  createUnit('16', 'MAGIC ARCHER', 10, UnitRarity.Epic),
  createUnit('17', 'PYROTECHNICIAN', 8, UnitRarity.Epic),
  createUnit('18', 'STORM MISTRESSES', 9, UnitRarity.Epic),
  createUnit('19', 'SORCERER\'S APPRENTICES', 10, UnitRarity.Epic),
  createUnit('20', 'LAVA GOLEM', 8, UnitRarity.Epic),
  createUnit('21', 'ROYAL GUARD', 10, UnitRarity.Epic),
  createUnit('22', 'IMMORTAL', 9, UnitRarity.Epic),
  createUnit('23', 'AIR ELEMENTAL', 8, UnitRarity.Epic),
  
  // Rare units (Blue borders)
  createUnit('24', 'ARCHERS', 10, UnitRarity.Rare),
  createUnit('25', 'INFANTRY', 10, UnitRarity.Rare),
  createUnit('26', 'IRON GUARDS', 9, UnitRarity.Rare),
  createUnit('27', 'BOMBERS', 8, UnitRarity.Rare),
  createUnit('28', 'CATAPULT', 10, UnitRarity.Rare),
  createUnit('29', 'ASSASSINS', 9, UnitRarity.Rare),
  createUnit('30', 'LANCER', 8, UnitRarity.Rare),
  createUnit('31', 'BATTLE GOLEM', 7, UnitRarity.Rare),
  createUnit('32', 'GRAVEDIGGER', 9, UnitRarity.Rare),
  
  // Common units (Gray borders)
  createUnit('33', 'BONE WARRIOR', 10, UnitRarity.Common),
  createUnit('34', 'BONE SPEARTHROWER', 9, UnitRarity.Common),
  createUnit('35', 'CURSED CATAPULT', 8, UnitRarity.Common),
  createUnit('36', 'EXPLOSIVE SPIDER', 7, UnitRarity.Common),
];

// Generate more units with variations to reach ~270 total
const generateMoreUnits = (): Unit[] => {
  const units: Unit[] = [];
  const baseUnits = [
    // More variations of existing units
    { name: 'ARCHER', rarity: UnitRarity.Rare },
    { name: 'WARRIOR', rarity: UnitRarity.Rare },
    { name: 'KNIGHT', rarity: UnitRarity.Rare },
    { name: 'MAGE', rarity: UnitRarity.Epic },
    { name: 'GOLEM', rarity: UnitRarity.Epic },
    { name: 'ELEMENTAL', rarity: UnitRarity.Epic },
    { name: 'DEMON', rarity: UnitRarity.Epic },
    { name: 'SKELETON', rarity: UnitRarity.Common },
    { name: 'GUARD', rarity: UnitRarity.Common },
    { name: 'SOLDIER', rarity: UnitRarity.Common },
  ];

  let id = 37;
  for (let i = 0; i < 234; i++) {
    const baseUnit = baseUnits[Math.floor(Math.random() * baseUnits.length)];
    const level = Math.floor(Math.random() * 10) + 1;
    // Use base name without numbers - duplicates are allowed
    units.push(createUnit(String(id++), baseUnit.name, level, baseUnit.rarity));
  }

  return units;
};

export const allMockUnits = [...mockUnits, ...generateMoreUnits()];

export const mockFormations: Formation[] = [
  {
    id: '1',
    name: 'Arena plan',
    tiles: Array(7)
      .fill(null)
      .map(() => Array(7).fill(null)),
    power: 0,
  },
  {
    id: '2',
    name: 'Arena 1',
    tiles: Array(7)
      .fill(null)
      .map(() => Array(7).fill(null)),
    power: 341640,
  },
  {
    id: '3',
    name: 'Arena',
    tiles: Array(7)
      .fill(null)
      .map(() => Array(7).fill(null)),
    power: 0,
  },
  {
    id: '4',
    name: 'Arena 2',
    tiles: Array(7)
      .fill(null)
      .map(() => Array(7).fill(null)),
    power: 0,
  },
  {
    id: '5',
    name: 'Headhunt',
    tiles: Array(7)
      .fill(null)
      .map(() => Array(7).fill(null)),
    power: 0,
  },
  {
    id: '6',
    name: 'Boss 2',
    tiles: Array(7)
      .fill(null)
      .map(() => Array(7).fill(null)),
    power: 0,
  },
];
