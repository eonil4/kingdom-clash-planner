import { describe, it, expect, vi } from 'vitest';
import { serializeUnits, deserializeUnits, serializeFormation, deserializeFormation } from '../../src/utils/urlSerialization';
import type { Unit, Formation } from '../../src/types';
import { UnitRarity } from '../../src/types';

// Mock the dependencies
vi.mock('../../src/utils/powerUtils', () => ({
  calculateUnitPower: (rarity: string, level: number) => {
    const powerTable: Record<string, number[]> = {
      Common: [100, 200, 400, 800, 1600, 3200, 6400, 9600, 19200, 38400],
      Rare: [120, 240, 480, 960, 1920, 3840, 7680, 11520, 23040, 46080],
      Epic: [140, 280, 560, 1120, 2240, 4480, 8960, 13440, 26880, 53760],
      Legendary: [160, 320, 640, 1280, 2560, 5120, 10240, 20480, 30720, 61440],
    };
    return powerTable[rarity]?.[level - 1] || 0;
  },
}));

vi.mock('../../src/utils/imageUtils', () => ({
  getUnitImagePath: (name: string) => `/assets/units/${name.toLowerCase().replace(/\s+/g, '_')}.png`,
}));

describe('urlSerialization', () => {
  describe('serializeUnits', () => {
    it('should serialize empty array', () => {
      expect(serializeUnits([])).toBe('');
    });

    it('should serialize single unit', () => {
      const units: Unit[] = [
        {
          id: '1',
          name: 'Archers',
          level: 5,
          rarity: UnitRarity.Common,
          power: 1600,
        },
      ];
      const result = serializeUnits(units);
      expect(result).toBe('2,5,1');
    });

    it('should group units by name and level', () => {
      const units: Unit[] = [
        {
          id: '1',
          name: 'Archers',
          level: 5,
          rarity: UnitRarity.Common,
          power: 1600,
        },
        {
          id: '2',
          name: 'Archers',
          level: 5,
          rarity: UnitRarity.Common,
          power: 1600,
        },
        {
          id: '3',
          name: 'Archers',
          level: 5,
          rarity: UnitRarity.Common,
          power: 1600,
        },
      ];
      const result = serializeUnits(units);
      expect(result).toBe('2,5,3');
    });

    it('should separate units with different levels', () => {
      const units: Unit[] = [
        {
          id: '1',
          name: 'Archers',
          level: 5,
          rarity: UnitRarity.Common,
          power: 1600,
        },
        {
          id: '2',
          name: 'Archers',
          level: 10,
          rarity: UnitRarity.Common,
          power: 38400,
        },
      ];
      const result = serializeUnits(units);
      // Should have two entries
      const parts = result.split(';');
      expect(parts.length).toBe(2);
      expect(parts).toContain('2,5,1');
      expect(parts).toContain('2,10,1');
    });

    it('should separate units with different names', () => {
      const units: Unit[] = [
        {
          id: '1',
          name: 'Archers',
          level: 5,
          rarity: UnitRarity.Common,
          power: 1600,
        },
        {
          id: '2',
          name: 'Paladin',
          level: 5,
          rarity: UnitRarity.Epic,
          power: 2240,
        },
      ];
      const result = serializeUnits(units);
      const parts = result.split(';');
      expect(parts.length).toBe(2);
    });

    it('should sort units by level (desc), rarity (Legendary to Common), and name (asc) in URL', () => {
      // Create units with different levels, rarities, and names
      // Note: Units are grouped by name+level, so we need unique combinations to test sorting
      const units: Unit[] = [
        {
          id: '1',
          name: 'Archers',
          level: 5,
          rarity: UnitRarity.Common,
          power: 1600,
        },
        {
          id: '2',
          name: 'Paladin',
          level: 10,
          rarity: UnitRarity.Epic,
          power: 53760,
        },
        {
          id: '3',
          name: 'Air Elemental',
          level: 10,
          rarity: UnitRarity.Legendary,
          power: 76800,
        },
        {
          id: '4',
          name: 'Zealot',
          level: 10,
          rarity: UnitRarity.Legendary,
          power: 76800,
        },
        {
          id: '5',
          name: 'Archers',
          level: 10,
          rarity: UnitRarity.Common,
          power: 38400,
        },
      ];
      const result = serializeUnits(units);
      const parts = result.split(';').filter(p => p.length > 0);
      
      // Expected order (units are grouped by name+level):
      // Level 10 Legendary units should come first (sorted by name: Air Elemental before Zealot)
      // Then Level 10 Epic
      // Then Level 10 Common
      // Then Level 5 Common
      
      // Verify we have at least 4 groups (some units might not be found in UnitDataMap)
      expect(parts.length).toBeGreaterThanOrEqual(4);
      
      // Find the indices of each unit type in the result
      const airElementalIndex = parts.findIndex(p => p.startsWith('0,10,'));
      const zealotIndex = parts.findIndex(p => p.startsWith('28,10,'));
      const paladinIndex = parts.findIndex(p => p.startsWith('27,10,'));
      const archers10Index = parts.findIndex(p => p.startsWith('2,10,'));
      const archers5Index = parts.findIndex(p => p.startsWith('2,5,'));
      
      // Level 10 Legendary should come before Level 10 Epic
      if (airElementalIndex !== -1 && paladinIndex !== -1) {
        expect(airElementalIndex).toBeLessThan(paladinIndex);
      }
      if (zealotIndex !== -1 && paladinIndex !== -1) {
        expect(zealotIndex).toBeLessThan(paladinIndex);
      }
      
      // Level 10 Epic should come before Level 10 Common
      if (paladinIndex !== -1 && archers10Index !== -1) {
        expect(paladinIndex).toBeLessThan(archers10Index);
      }
      
      // Level 10 Common should come before Level 5 Common
      if (archers10Index !== -1 && archers5Index !== -1) {
        expect(archers10Index).toBeLessThan(archers5Index);
      }
      
      // Air Elemental should come before Zealot (alphabetical order)
      if (airElementalIndex !== -1 && zealotIndex !== -1) {
        expect(airElementalIndex).toBeLessThan(zealotIndex);
      }
    });
  });

  describe('deserializeUnits', () => {
    it('should deserialize empty string', () => {
      expect(deserializeUnits('')).toEqual([]);
    });

    it('should deserialize single unit', () => {
      const result = deserializeUnits('2,5,1');
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Archers');
      expect(result[0].level).toBe(5);
      expect(result[0].rarity).toBe(UnitRarity.Common);
    });

    it('should deserialize multiple units of same type and level', () => {
      const result = deserializeUnits('2,5,3');
      expect(result.length).toBe(3);
      result.forEach((unit) => {
        expect(unit.name).toBe('Archers');
        expect(unit.level).toBe(5);
        expect(unit.rarity).toBe(UnitRarity.Common);
      });
    });

    it('should respect maxUnitsPerLevel limit (49)', () => {
      const result = deserializeUnits('2,5,100'); // Try to add 100 units
      expect(result.length).toBe(49); // Should be limited to 49
    });

    it('should respect maxRosterSize limit (1000)', () => {
      // Create a string with 2000 units across different unit types to avoid maxUnitsPerLevel limit
      const entries: string[] = [];
      // Use different unit indices to avoid hitting the 49 per unit per level limit
      for (let i = 0; i < 2000; i++) {
        const unitIndex = i % 36; // Cycle through different units
        entries.push(`${unitIndex},5,1`);
      }
      const result = deserializeUnits(entries.join(';'));
      expect(result.length).toBe(1000); // Should be limited to 1000
    });

    it('should handle invalid entries gracefully', () => {
      const result = deserializeUnits('invalid,entry;2,5,1;also,invalid');
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Archers');
    });

    it('should handle invalid unit index', () => {
      const result = deserializeUnits('999,5,1');
      expect(result.length).toBe(0);
    });

    it('should handle invalid level (below 1)', () => {
      const result = deserializeUnits('2,0,1');
      expect(result.length).toBe(0);
    });

    it('should handle invalid level (above 10)', () => {
      const result = deserializeUnits('2,11,1');
      expect(result.length).toBe(0);
    });

    it('should handle multiple different unit types and levels', () => {
      const result = deserializeUnits('2,5,2;27,10,3;0,1,1'); // Paladin is index 27, Air Elemental is index 0
      expect(result.length).toBe(6);
      const archers = result.filter((u) => u.name === 'Archers' && u.level === 5);
      const paladins = result.filter((u) => u.name === 'Paladin' && u.level === 10);
      const airElementals = result.filter((u) => u.name === 'Air Elemental' && u.level === 1);
      expect(archers.length).toBe(2);
      expect(paladins.length).toBe(3);
      expect(airElementals.length).toBe(1);
    });
  });

  describe('serializeFormation', () => {
    it('should serialize empty formation', () => {
      const formation: Formation = {
        id: '1',
        name: 'Test Formation',
        tiles: Array(7)
          .fill(null)
          .map(() => Array(7).fill(null)),
        power: 0,
      };
      const result = serializeFormation(formation);
      expect(result).toBe('Test Formation;' + '_'.repeat(49).split('').join(';'));
    });

    it('should serialize formation with single unit', () => {
      const tiles: (Unit | null)[][] = Array(7)
        .fill(null)
        .map(() => Array(7).fill(null));
      tiles[0][0] = {
        id: '1',
        name: 'Archers',
        level: 5,
        rarity: UnitRarity.Common,
        power: 1600,
      };
      const formation: Formation = {
        id: '1',
        name: 'Test Formation',
        tiles,
        power: 1600,
      };
      const result = serializeFormation(formation);
      const parts = result.split(';');
      expect(parts[0]).toBe('Test Formation');
      expect(parts[1]).toBe('2,5'); // First cell should have Archers (index 2) at level 5
      expect(parts[2]).toBe('_'); // Second cell should be empty
    });

    it('should serialize formation with multiple units', () => {
      const tiles: (Unit | null)[][] = Array(7)
        .fill(null)
        .map(() => Array(7).fill(null));
      tiles[0][0] = {
        id: '1',
        name: 'Archers',
        level: 5,
        rarity: UnitRarity.Common,
        power: 1600,
      };
      tiles[0][1] = {
        id: '2',
        name: 'Paladin',
        level: 10,
        rarity: UnitRarity.Epic,
        power: 53760,
      };
      const formation: Formation = {
        id: '1',
        name: 'Test Formation',
        tiles,
        power: 55360,
      };
      const result = serializeFormation(formation);
      const parts = result.split(';');
      expect(parts[0]).toBe('Test Formation');
      expect(parts[1]).toBe('2,5'); // Archers at level 5
      expect(parts[2]).toBe('27,10'); // Paladin at level 10 (index 27)
      expect(parts[3]).toBe('_'); // Empty cell
    });

    it('should return empty string for null formation', () => {
      expect(serializeFormation(null)).toBe('');
    });

    it('should handle unit with missing unitData in serializeFormation', () => {
      const tiles: (Unit | null)[][] = Array(7)
        .fill(null)
        .map(() => Array(7).fill(null));
      tiles[0][0] = {
        id: '1',
        name: 'INVALID UNIT NAME',
        level: 5,
        rarity: UnitRarity.Rare,
        power: 1920,
      };
      const formation: Formation = {
        id: '1',
        name: 'Test Formation',
        tiles,
        power: 1920,
      };
      const result = serializeFormation(formation);
      const parts = result.split(';');
      expect(parts[0]).toBe('Test Formation');
      expect(parts[1]).toBe('_'); // Should use underscore when unitData is not found
    });
  });

  describe('deserializeFormation', () => {
    it('should deserialize empty string', () => {
      const result = deserializeFormation('');
      expect(result.name).toBe('Formation 1');
      expect(result.tiles.length).toBe(7);
      result.tiles.forEach((row) => {
        expect(row.length).toBe(7);
        row.forEach((cell) => expect(cell).toBeNull());
      });
    });

    it('should deserialize formation with name only', () => {
      const result = deserializeFormation('My Formation');
      expect(result.name).toBe('My Formation');
      expect(result.tiles.length).toBe(7);
    });

    it('should deserialize formation with single unit', () => {
      const formationString = 'Test Formation;2,5;' + '_'.repeat(48).split('').join(';');
      const result = deserializeFormation(formationString);
      expect(result.name).toBe('Test Formation');
      expect(result.tiles[0][0]).not.toBeNull();
      expect(result.tiles[0][0]?.name).toBe('Archers');
      expect(result.tiles[0][0]?.level).toBe(5);
      expect(result.tiles[0][1]).toBeNull();
    });

    it('should deserialize formation with multiple units', () => {
      const formationString = 'Test Formation;2,5;27,10;' + '_'.repeat(47).split('').join(';'); // Paladin is index 27
      const result = deserializeFormation(formationString);
      expect(result.name).toBe('Test Formation');
      expect(result.tiles[0][0]?.name).toBe('Archers');
      expect(result.tiles[0][0]?.level).toBe(5);
      expect(result.tiles[0][1]?.name).toBe('Paladin');
      expect(result.tiles[0][1]?.level).toBe(10);
    });

    it('should handle backward compatibility with old empty cell format (;;)', () => {
      const formationString = 'Test Formation;;;2,5;' + '_'.repeat(47).split('').join(';');
      const result = deserializeFormation(formationString);
      expect(result.name).toBe('Test Formation');
      expect(result.tiles[0][0]).toBeNull();
      expect(result.tiles[0][1]).toBeNull();
      expect(result.tiles[0][2]?.name).toBe('Archers');
    });

    it('should handle invalid unit data gracefully', () => {
      const formationString = 'Test Formation;invalid;2,5;' + '_'.repeat(47).split('').join(';');
      const result = deserializeFormation(formationString);
      expect(result.tiles[0][0]).toBeNull();
      expect(result.tiles[0][1]?.name).toBe('Archers');
    });

    it('should handle invalid unit index', () => {
      const formationString = 'Test Formation;999,5;' + '_'.repeat(48).split('').join(';');
      const result = deserializeFormation(formationString);
      expect(result.tiles[0][0]).toBeNull();
    });

    it('should handle invalid level (below 1)', () => {
      const formationString = 'Test Formation;2,0;' + '_'.repeat(48).split('').join(';');
      const result = deserializeFormation(formationString);
      expect(result.tiles[0][0]).toBeNull();
    });

    it('should handle invalid level (above 10)', () => {
      const formationString = 'Test Formation;2,11;' + '_'.repeat(48).split('').join(';');
      const result = deserializeFormation(formationString);
      expect(result.tiles[0][0]).toBeNull();
    });

    it('should correctly map grid positions', () => {
      // Fill first row with units
      const parts: string[] = ['Test Formation'];
      for (let col = 0; col < 7; col++) {
        parts.push(`2,${col + 1}`); // Different levels for each cell
      }
      // Fill rest with empty cells
      for (let i = 0; i < 42; i++) {
        parts.push('_');
      }
      const result = deserializeFormation(parts.join(';'));
      expect(result.tiles[0].length).toBe(7);
      for (let col = 0; col < 7; col++) {
        expect(result.tiles[0][col]?.level).toBe(col + 1);
      }
    });

    it('should handle NaN unitIndex in deserializeFormation', () => {
      const formationString = 'Test Formation;invalid,5;' + '_'.repeat(48).split('').join(';');
      const result = deserializeFormation(formationString);
      expect(result.tiles[0][0]).toBeNull(); // Should be null when unitIndex is NaN
    });

    it('should handle NaN level in deserializeFormation', () => {
      const formationString = 'Test Formation;2,invalid;' + '_'.repeat(48).split('').join(';');
      const result = deserializeFormation(formationString);
      expect(result.tiles[0][0]).toBeNull(); // Should be null when level is NaN
    });
  });
});

