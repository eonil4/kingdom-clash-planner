export const UnitRarity = {
  Common: 'Common',
  Rare: 'Rare',
  Epic: 'Epic',
  Legendary: 'Legendary',
} as const;

export type UnitRarity = typeof UnitRarity[keyof typeof UnitRarity];

export interface Unit {
  id: string;
  name: string;
  level: number;
  rarity: UnitRarity;
  power: number;
  imageUrl?: string;
}

export interface FormationTile {
  row: number;
  col: number;
  unit: Unit | null;
}

export interface Formation {
  id: string;
  name: string;
  tiles: (Unit | null)[][];
  power: number;
}

export type SortOption = 'rarity' | 'level' | 'name';
