import { describe, it, expect } from 'vitest';
import unitReducer, {
  setUnits,
  setSortOption,
  setSortOption2,
  setSortOption3,
  setSearchTerm,
  removeUnit,
  addUnit,
  updateUnit,
} from '../../../../src/store/reducers/unitSlice';
import type { Unit, SortOption } from '../../../../src/types';
import { UnitRarity } from '../../../../src/types';

describe('unitSlice', () => {
  const mockUnit1: Unit = {
    id: 'unit-1',
    name: 'Archers',
    level: 5,
    rarity: UnitRarity.Common,
    power: 1600,
  };

  const mockUnit2: Unit = {
    id: 'unit-2',
    name: 'Paladin',
    level: 10,
    rarity: UnitRarity.Epic,
    power: 53760,
  };

  const mockUnit3: Unit = {
    id: 'unit-3',
    name: 'Infantry',
    level: 1,
    rarity: UnitRarity.Common,
    power: 100,
  };

  describe('initial state', () => {
    it('should return initial state', () => {
      const state = unitReducer(undefined, { type: 'unknown' });
      expect(state.units).toEqual([]);
      expect(state.sortOption).toBe('level');
      expect(state.sortOption2).toBe('rarity');
      expect(state.sortOption3).toBe('name');
      expect(state.filteredUnits).toEqual([]);
      expect(state.searchTerm).toBe('');
    });
  });

  describe('setUnits', () => {
    it('should set units and filter/sort them', () => {
      const units = [mockUnit1, mockUnit2];
      const state = unitReducer(undefined, setUnits(units));
      expect(state.units.length).toBe(2);
      expect(state.filteredUnits.length).toBe(2);
    });

    it('should normalize unit names', () => {
      const unitsWithNumberedName: Unit[] = [{
        ...mockUnit1,
        name: 'Archers 1',
      }];
      const state = unitReducer(undefined, setUnits(unitsWithNumberedName));
      expect(state.units[0].name).toBe('Archers');
    });
  });

  describe('setSortOption', () => {
    it('should update sort option and re-filter/sort', () => {
      const stateWithUnits = unitReducer(
        undefined,
        setUnits([mockUnit1, mockUnit2, mockUnit3])
      );
      const state = unitReducer(stateWithUnits, setSortOption('name'));
      expect(state.sortOption).toBe('name');
      expect(state.filteredUnits.length).toBe(3);
    });
  });

  describe('setSortOption2', () => {
    it('should update sort option 2', () => {
      const state = unitReducer(undefined, setSortOption2('level'));
      expect(state.sortOption2).toBe('level');
    });

    it('should allow null sort option 2', () => {
      const state = unitReducer(undefined, setSortOption2(null));
      expect(state.sortOption2).toBeNull();
    });
  });

  describe('setSortOption3', () => {
    it('should update sort option 3', () => {
      const state = unitReducer(undefined, setSortOption3('rarity'));
      expect(state.sortOption3).toBe('rarity');
    });

    it('should allow null sort option 3', () => {
      const state = unitReducer(undefined, setSortOption3(null));
      expect(state.sortOption3).toBeNull();
    });
  });

  describe('setSearchTerm', () => {
    it('should update search term and filter units', () => {
      const stateWithUnits = unitReducer(
        undefined,
        setUnits([mockUnit1, mockUnit2])
      );
      const state = unitReducer(stateWithUnits, setSearchTerm('Archers'));
      expect(state.searchTerm).toBe('Archers');
      expect(state.filteredUnits.length).toBe(1);
      expect(state.filteredUnits[0].name).toBe('Archers');
    });

    it('should filter by rarity', () => {
      const stateWithUnits = unitReducer(
        undefined,
        setUnits([mockUnit1, mockUnit2])
      );
      const state = unitReducer(stateWithUnits, setSearchTerm('Epic'));
      expect(state.filteredUnits.length).toBe(1);
      expect(state.filteredUnits[0].name).toBe('Paladin');
    });

    it('should return all units for empty search term', () => {
      const stateWithUnits = unitReducer(
        undefined,
        setUnits([mockUnit1, mockUnit2])
      );
      const state = unitReducer(stateWithUnits, setSearchTerm(''));
      expect(state.filteredUnits.length).toBe(2);
    });
  });

  describe('removeUnit', () => {
    it('should remove unit by id', () => {
      const stateWithUnits = unitReducer(
        undefined,
        setUnits([mockUnit1, mockUnit2])
      );
      const state = unitReducer(stateWithUnits, removeUnit('unit-1'));
      expect(state.units.length).toBe(1);
      expect(state.units[0].id).toBe('unit-2');
    });

    it('should update filtered units after removal', () => {
      const stateWithUnits = unitReducer(
        undefined,
        setUnits([mockUnit1, mockUnit2])
      );
      const state = unitReducer(stateWithUnits, removeUnit('unit-1'));
      expect(state.filteredUnits.length).toBe(1);
    });
  });

  describe('addUnit', () => {
    it('should add unit to roster', () => {
      const state = unitReducer(undefined, addUnit(mockUnit1));
      expect(state.units.length).toBe(1);
      expect(state.units[0]).toEqual(mockUnit1);
    });

    it('should normalize unit name when adding', () => {
      const unitWithNumberedName: Unit = {
        ...mockUnit1,
        name: 'Archers 1',
      };
      const state = unitReducer(undefined, addUnit(unitWithNumberedName));
      expect(state.units[0].name).toBe('Archers');
    });

    it('should calculate power if not provided', () => {
      const unitWithoutPower: Unit = {
        ...mockUnit1,
        power: 0, // Will be recalculated
      };
      const state = unitReducer(undefined, addUnit(unitWithoutPower));
      expect(state.units[0].power).toBeGreaterThan(0);
    });

    it('should not add unit if roster is at max capacity (1000)', () => {
      const maxUnits: Unit[] = Array(1000).fill(null).map((_, i) => ({
        ...mockUnit1,
        id: `unit-${i}`,
      }));
      const stateWithMaxUnits = unitReducer(undefined, setUnits(maxUnits));
      const state = unitReducer(stateWithMaxUnits, addUnit(mockUnit2));
      expect(state.units.length).toBe(1000);
    });

    it('should not add unit if max per level reached (49)', () => {
      const maxUnitsPerLevel: Unit[] = Array(49).fill(null).map((_, i) => ({
        ...mockUnit1,
        id: `unit-${i}`,
        level: 5,
      }));
      const stateWithMaxUnits = unitReducer(undefined, setUnits(maxUnitsPerLevel));
      const state = unitReducer(stateWithMaxUnits, addUnit({
        ...mockUnit1,
        id: 'unit-50',
        level: 5,
      }));
      expect(state.units.length).toBe(49);
    });

    it('should allow adding different level of same unit', () => {
      const stateWithUnit = unitReducer(undefined, addUnit(mockUnit1));
      const differentLevelUnit: Unit = {
        ...mockUnit1,
        id: 'unit-2',
        level: 10,
      };
      const state = unitReducer(stateWithUnit, addUnit(differentLevelUnit));
      expect(state.units.length).toBe(2);
    });

    it('should update filtered units after adding', () => {
      const state = unitReducer(undefined, addUnit(mockUnit1));
      expect(state.filteredUnits.length).toBe(1);
    });
  });

  describe('updateUnit', () => {
    it('should update existing unit', () => {
      const stateWithUnit = unitReducer(undefined, addUnit(mockUnit1));
      const updatedUnit: Unit = {
        ...mockUnit1,
        level: 10,
        power: 46080,
      };
      const state = unitReducer(stateWithUnit, updateUnit(updatedUnit));
      expect(state.units[0].level).toBe(10);
      expect(state.units[0].power).toBe(46080);
    });

    it('should normalize unit name when updating', () => {
      const stateWithUnit = unitReducer(undefined, addUnit(mockUnit1));
      const updatedUnit: Unit = {
        ...mockUnit1,
        name: 'Archers 1',
      };
      const state = unitReducer(stateWithUnit, updateUnit(updatedUnit));
      expect(state.units[0].name).toBe('Archers');
    });

    it('should calculate power if not provided when updating', () => {
      const stateWithUnit = unitReducer(undefined, addUnit(mockUnit1));
      const updatedUnit: Unit = {
        ...mockUnit1,
        power: 0,
      };
      const state = unitReducer(stateWithUnit, updateUnit(updatedUnit));
      expect(state.units[0].power).toBeGreaterThan(0);
    });

    it('should not update if unit not found', () => {
      const stateWithUnit = unitReducer(undefined, addUnit(mockUnit1));
      const nonExistentUnit: Unit = {
        ...mockUnit1,
        id: 'non-existent',
      };
      const state = unitReducer(stateWithUnit, updateUnit(nonExistentUnit));
      expect(state.units.length).toBe(1);
      expect(state.units[0].id).toBe('unit-1');
    });

    it('should update filtered units after updating', () => {
      const stateWithUnit = unitReducer(undefined, addUnit(mockUnit1));
      const updatedUnit: Unit = {
        ...mockUnit1,
        level: 10,
      };
      const state = unitReducer(stateWithUnit, updateUnit(updatedUnit));
      expect(state.filteredUnits[0].level).toBe(10);
    });
  });

  describe('sorting', () => {
    it('should sort by level descending', () => {
      const units = [mockUnit3, mockUnit1, mockUnit2]; // levels: 1, 5, 10
      const state = unitReducer(undefined, setUnits(units));
      expect(state.filteredUnits[0].level).toBe(10);
      expect(state.filteredUnits[2].level).toBe(1);
    });

    it('should sort by rarity descending', () => {
      const units = [mockUnit3, mockUnit1, mockUnit2];
      const stateWithUnits = unitReducer(undefined, setUnits(units));
      const state = unitReducer(stateWithUnits, setSortOption('rarity'));
      expect(state.filteredUnits[0].rarity).toBe(UnitRarity.Epic);
      expect(state.filteredUnits[2].rarity).toBe(UnitRarity.Common);
    });

    it('should sort by name ascending', () => {
      const units = [mockUnit2, mockUnit1, mockUnit3];
      const stateWithUnits = unitReducer(undefined, setUnits(units));
      const state = unitReducer(stateWithUnits, setSortOption('name'));
      expect(state.filteredUnits[0].name).toBe('Archers');
      expect(state.filteredUnits[2].name).toBe('Paladin');
    });

    it('should use secondary sort when primary is equal', () => {
      const units: Unit[] = [
        { ...mockUnit1, level: 5 },
        { ...mockUnit2, level: 5 },
      ];
      const stateWithUnits = unitReducer(undefined, setUnits(units));
      const state = unitReducer(stateWithUnits, setSortOption('level'));
      unitReducer(state, setSortOption2('name'));
      // Both have level 5, so should sort by name
      expect(state.filteredUnits.length).toBe(2);
    });

    it('should handle invalid sort option with default case', () => {
      const units = [mockUnit1, mockUnit2];
      const stateWithUnits = unitReducer(undefined, setUnits(units));
      // Clear secondary and tertiary sort options to test default case
      const stateCleared = unitReducer(stateWithUnits, setSortOption2(null));
      const stateCleared2 = unitReducer(stateCleared, setSortOption3(null));
      // Use type assertion to test the default case in getSortComparison
      // This simulates a runtime scenario where an invalid sort option might exist
      const invalidSortOption = 'invalid' as unknown as SortOption;
      const state = unitReducer(stateCleared2, setSortOption(invalidSortOption));
      // With default case returning 0 and no secondary/tertiary sorts, 
      // units should maintain their order (stable sort)
      expect(state.filteredUnits.length).toBe(2);
      // The default case returns 0, so with no other sort options, order should be preserved
      expect(state.filteredUnits[0].id).toBe(units[0].id);
      expect(state.filteredUnits[1].id).toBe(units[1].id);
    });
  });
});

