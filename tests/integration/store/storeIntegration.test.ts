import { describe, it, expect } from 'vitest';
import { createTestStore } from '../utils/testStore';
import { addUnit, removeUnit, setUnits, setSortOption, setSearchTerm } from '../../../src/store/reducers/unitSlice';
import { placeUnit, removeUnit as removeUnitFromFormation, swapUnits, updateFormationName } from '../../../src/store/reducers/formationSlice';
import { UnitRarity, type Unit } from '../../../src/types';
import { DEFAULT_FORMATION_NAME, FORMATION_GRID_SIZE } from '../../../src/constants';

describe('Store Integration Tests', () => {
  const createMockUnit = (overrides: Partial<Unit> = {}): Unit => ({
    id: `unit-${Date.now()}-${Math.random()}`,
    name: 'Archers',
    level: 1,
    rarity: UnitRarity.Common,
    power: 10,
    ...overrides,
  });

  describe('Unit Slice Integration', () => {
    it('should add unit and update filteredUnits', () => {
      // Arrange
      const store = createTestStore();
      const unit = createMockUnit();

      // Act
      store.dispatch(addUnit(unit));

      // Assert
      const state = store.getState();
      expect(state.unit.units).toHaveLength(1);
      expect(state.unit.filteredUnits).toHaveLength(1);
      expect(state.unit.units[0].name).toBe('Archers');
    });

    it('should maintain sort order when adding units', () => {
      // Arrange
      const store = createTestStore();
      const commonUnit = createMockUnit({ id: '1', rarity: UnitRarity.Common });
      const epicUnit = createMockUnit({ id: '2', rarity: UnitRarity.Epic });
      const rareUnit = createMockUnit({ id: '3', rarity: UnitRarity.Rare });

      // Act
      store.dispatch(addUnit(commonUnit));
      store.dispatch(addUnit(epicUnit));
      store.dispatch(addUnit(rareUnit));

      // Assert
      const state = store.getState();
      expect(state.unit.filteredUnits[0].rarity).toBe(UnitRarity.Epic);
      expect(state.unit.filteredUnits[1].rarity).toBe(UnitRarity.Rare);
      expect(state.unit.filteredUnits[2].rarity).toBe(UnitRarity.Common);
    });

    it('should filter units by search term', () => {
      // Arrange
      const store = createTestStore();
      const archers = createMockUnit({ id: '1', name: 'Archers' });
      const infantry = createMockUnit({ id: '2', name: 'Infantry' });
      store.dispatch(addUnit(archers));
      store.dispatch(addUnit(infantry));

      // Act
      store.dispatch(setSearchTerm('arch'));

      // Assert
      const state = store.getState();
      expect(state.unit.filteredUnits).toHaveLength(1);
      expect(state.unit.filteredUnits[0].name).toBe('Archers');
    });

    it('should re-sort when sort option changes', () => {
      // Arrange
      const store = createTestStore();
      const level1 = createMockUnit({ id: '1', level: 1, rarity: UnitRarity.Common });
      const level5 = createMockUnit({ id: '2', level: 5, rarity: UnitRarity.Common });
      store.dispatch(addUnit(level1));
      store.dispatch(addUnit(level5));

      // Act
      store.dispatch(setSortOption('level'));

      // Assert
      const state = store.getState();
      expect(state.unit.filteredUnits[0].level).toBe(5);
      expect(state.unit.filteredUnits[1].level).toBe(1);
    });

    it('should remove unit from list', () => {
      // Arrange
      const store = createTestStore();
      const unit = createMockUnit({ id: 'test-unit' });
      store.dispatch(addUnit(unit));

      // Act
      store.dispatch(removeUnit('test-unit'));

      // Assert
      const state = store.getState();
      expect(state.unit.units).toHaveLength(0);
      expect(state.unit.filteredUnits).toHaveLength(0);
    });

    it('should initialize with multiple units', () => {
      // Arrange
      const store = createTestStore();
      const units = [
        createMockUnit({ id: '1', name: 'Archers' }),
        createMockUnit({ id: '2', name: 'Infantry' }),
        createMockUnit({ id: '3', name: 'Cavalry' }),
      ];

      // Act
      store.dispatch(setUnits(units));

      // Assert
      const state = store.getState();
      expect(state.unit.units).toHaveLength(3);
      expect(state.unit.filteredUnits).toHaveLength(3);
    });
  });

  describe('Formation Slice Integration', () => {
    it('should initialize with default formation', () => {
      // Arrange & Act
      const store = createTestStore();

      // Assert
      const state = store.getState();
      expect(state.formation.currentFormation).not.toBeNull();
      expect(state.formation.currentFormation?.name).toBe(DEFAULT_FORMATION_NAME);
      expect(state.formation.currentFormation?.tiles).toHaveLength(FORMATION_GRID_SIZE);
    });

    it('should place unit in formation and calculate power', () => {
      // Arrange
      const store = createTestStore();
      const unit = createMockUnit({ power: 100 });

      // Act
      store.dispatch(placeUnit({ row: 0, col: 0, unit }));

      // Assert
      const state = store.getState();
      expect(state.formation.currentFormation?.tiles[0][0]).toEqual(unit);
      expect(state.formation.currentFormation?.power).toBe(100);
    });

    it('should update formation power when multiple units placed', () => {
      // Arrange
      const store = createTestStore();
      const unit1 = createMockUnit({ id: '1', power: 50 });
      const unit2 = createMockUnit({ id: '2', power: 75 });

      // Act
      store.dispatch(placeUnit({ row: 0, col: 0, unit: unit1 }));
      store.dispatch(placeUnit({ row: 0, col: 1, unit: unit2 }));

      // Assert
      const state = store.getState();
      expect(state.formation.currentFormation?.power).toBe(125);
    });

    it('should remove unit from formation and recalculate power', () => {
      // Arrange
      const store = createTestStore();
      const unit = createMockUnit({ power: 100 });
      store.dispatch(placeUnit({ row: 0, col: 0, unit }));

      // Act
      store.dispatch(removeUnitFromFormation({ row: 0, col: 0, unit }));

      // Assert
      const state = store.getState();
      expect(state.formation.currentFormation?.tiles[0][0]).toBeNull();
      expect(state.formation.currentFormation?.power).toBe(0);
    });

    it('should swap units in formation', () => {
      // Arrange
      const store = createTestStore();
      const unit1 = createMockUnit({ id: '1', name: 'Archers' });
      const unit2 = createMockUnit({ id: '2', name: 'Infantry' });
      store.dispatch(placeUnit({ row: 0, col: 0, unit: unit1 }));
      store.dispatch(placeUnit({ row: 1, col: 1, unit: unit2 }));

      // Act
      store.dispatch(swapUnits({
        sourceRow: 0,
        sourceCol: 0,
        targetRow: 1,
        targetCol: 1,
        sourceUnit: unit1,
        targetUnit: unit2,
      }));

      // Assert
      const state = store.getState();
      expect(state.formation.currentFormation?.tiles[0][0]?.name).toBe('Infantry');
      expect(state.formation.currentFormation?.tiles[1][1]?.name).toBe('Archers');
    });

    it('should update formation name', () => {
      // Arrange
      const store = createTestStore();

      // Act
      store.dispatch(updateFormationName('My Custom Formation'));

      // Assert
      const state = store.getState();
      expect(state.formation.currentFormation?.name).toBe('My Custom Formation');
    });
  });

  describe('Cross-Slice Integration (with Sagas)', () => {
    it('should remove unit from roster when placed in formation', async () => {
      // Arrange
      const store = createTestStore();
      const unit = createMockUnit({ id: 'saga-test-unit' });
      store.dispatch(addUnit(unit));

      // Act
      store.dispatch(placeUnit({ row: 0, col: 0, unit }));
      await new Promise(resolve => setTimeout(resolve, 50));

      // Assert
      const state = store.getState();
      expect(state.unit.units.find(u => u.id === 'saga-test-unit')).toBeUndefined();
      expect(state.formation.currentFormation?.tiles[0][0]?.id).toBe('saga-test-unit');
    });

    it('should add unit back to roster when removed from formation', async () => {
      // Arrange
      const store = createTestStore();
      const unit = createMockUnit({ id: 'saga-test-unit-2' });
      store.dispatch(addUnit(unit));
      store.dispatch(placeUnit({ row: 0, col: 0, unit }));
      await new Promise(resolve => setTimeout(resolve, 50));

      // Act
      store.dispatch(removeUnitFromFormation({ row: 0, col: 0, unit }));
      await new Promise(resolve => setTimeout(resolve, 50));

      // Assert
      const state = store.getState();
      expect(state.unit.units.find(u => u.id === 'saga-test-unit-2')).toBeDefined();
      expect(state.formation.currentFormation?.tiles[0][0]).toBeNull();
    });

    it('should maintain data integrity through multiple operations', async () => {
      // Arrange
      const store = createTestStore();
      const units = Array.from({ length: 5 }, (_, i) =>
        createMockUnit({ id: `unit-${i}`, power: (i + 1) * 10 })
      );
      units.forEach(unit => store.dispatch(addUnit(unit)));

      // Act
      store.dispatch(placeUnit({ row: 0, col: 0, unit: units[0] }));
      store.dispatch(placeUnit({ row: 0, col: 1, unit: units[1] }));
      store.dispatch(placeUnit({ row: 0, col: 2, unit: units[2] }));
      await new Promise(resolve => setTimeout(resolve, 100));

      // Assert
      const state = store.getState();
      expect(state.unit.units).toHaveLength(2);
      expect(state.formation.currentFormation?.power).toBe(60);
    });
  });
});
