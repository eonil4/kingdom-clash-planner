import { describe, it, expect } from 'vitest';
import { createTestStore } from '../utils/testStore';
import { serializeUnits, deserializeUnits, serializeFormation, deserializeFormation } from '../../../src/utils/urlSerialization';
import { addUnit, setUnits } from '../../../src/store/reducers/unitSlice';
import { placeUnit, setCurrentFormation } from '../../../src/store/reducers/formationSlice';
import { UnitRarity, type Unit, type Formation } from '../../../src/types';
import { FORMATION_GRID_SIZE, DEFAULT_FORMATION_NAME } from '../../../src/constants';
import { getUnitDataByName } from '../../../src/types/unitNames';

describe('URL Serialization Integration Tests', () => {
  const createMockUnit = (overrides: Partial<Unit> = {}): Unit => ({
    id: `unit-${Date.now()}-${Math.random()}`,
    name: 'Archers',
    level: 1,
    rarity: UnitRarity.Common,
    power: 10,
    ...overrides,
  });

  describe('Unit Serialization', () => {
    it('should serialize and deserialize single unit roundtrip', () => {
      // Arrange
      const store = createTestStore();
      const unit = createMockUnit({ name: 'Archers', level: 5 });
      store.dispatch(addUnit(unit));

      // Act
      const state = store.getState();
      const serialized = serializeUnits(state.unit.units);
      const deserialized = deserializeUnits(serialized);

      // Assert
      expect(deserialized).toHaveLength(1);
      expect(deserialized[0].name).toBe('Archers');
      expect(deserialized[0].level).toBe(5);
    });

    it('should serialize and deserialize multiple units of same type and level', () => {
      // Arrange
      const store = createTestStore();
      store.dispatch(addUnit(createMockUnit({ id: '1', name: 'Archers', level: 3 })));
      store.dispatch(addUnit(createMockUnit({ id: '2', name: 'Archers', level: 3 })));
      store.dispatch(addUnit(createMockUnit({ id: '3', name: 'Archers', level: 3 })));

      // Act
      const state = store.getState();
      const serialized = serializeUnits(state.unit.units);
      const deserialized = deserializeUnits(serialized);

      // Assert
      expect(deserialized).toHaveLength(3);
      expect(deserialized.every(u => u.name === 'Archers' && u.level === 3)).toBe(true);
    });

    it('should serialize and deserialize mixed units', () => {
      // Arrange
      const store = createTestStore();
      store.dispatch(addUnit(createMockUnit({ id: '1', name: 'Archers', level: 1 })));
      store.dispatch(addUnit(createMockUnit({ id: '2', name: 'Infantry', level: 5 })));
      store.dispatch(addUnit(createMockUnit({ id: '3', name: 'Monk', level: 10, rarity: UnitRarity.Legendary })));

      // Act
      const state = store.getState();
      const serialized = serializeUnits(state.unit.units);
      const deserialized = deserializeUnits(serialized);

      // Assert
      expect(deserialized).toHaveLength(3);
      expect(deserialized.some(u => u.name === 'Archers')).toBe(true);
      expect(deserialized.some(u => u.name === 'Infantry')).toBe(true);
      expect(deserialized.some(u => u.name === 'Monk')).toBe(true);
    });

    it('should preserve unit data through store update from deserialized units', () => {
      // Arrange
      const originalUnits = [
        createMockUnit({ id: '1', name: 'Archers', level: 1 }),
        createMockUnit({ id: '2', name: 'Iron Guards', level: 5 }),
      ];
      const serialized = serializeUnits(originalUnits);
      const deserialized = deserializeUnits(serialized);

      const store = createTestStore();

      // Act
      store.dispatch(setUnits(deserialized));

      // Assert
      const state = store.getState();
      expect(state.unit.units).toHaveLength(2);
      expect(state.unit.units.some(u => u.name === 'Archers')).toBe(true);
      expect(state.unit.units.some(u => u.name === 'Iron Guards')).toBe(true);
    });

    it('should handle empty units array', () => {
      // Arrange & Act
      const serialized = serializeUnits([]);
      const deserialized = deserializeUnits(serialized);

      // Assert
      expect(serialized).toBe('');
      expect(deserialized).toHaveLength(0);
    });

    it('should sort units consistently in serialization', () => {
      // Arrange
      const store = createTestStore();
      store.dispatch(addUnit(createMockUnit({ id: '1', name: 'Archers', level: 1, rarity: UnitRarity.Common })));
      store.dispatch(addUnit(createMockUnit({ id: '2', name: 'Monk', level: 10, rarity: UnitRarity.Legendary })));
      store.dispatch(addUnit(createMockUnit({ id: '3', name: 'Infantry', level: 5, rarity: UnitRarity.Rare })));

      // Act
      const state = store.getState();
      const serialized1 = serializeUnits(state.unit.units);

      const store2 = createTestStore();
      store2.dispatch(addUnit(createMockUnit({ id: '3', name: 'Infantry', level: 5, rarity: UnitRarity.Rare })));
      store2.dispatch(addUnit(createMockUnit({ id: '1', name: 'Archers', level: 1, rarity: UnitRarity.Common })));
      store2.dispatch(addUnit(createMockUnit({ id: '2', name: 'Monk', level: 10, rarity: UnitRarity.Legendary })));
      const state2 = store2.getState();
      const serialized2 = serializeUnits(state2.unit.units);

      // Assert
      expect(serialized1).toBe(serialized2);
    });
  });

  describe('Formation Serialization', () => {
    it('should serialize and deserialize empty formation', () => {
      // Arrange
      const store = createTestStore();

      // Act
      const state = store.getState();
      const serialized = serializeFormation(state.formation.currentFormation);
      const deserialized = deserializeFormation(serialized);

      // Assert
      expect(deserialized.name).toBe(DEFAULT_FORMATION_NAME);
      expect(deserialized.tiles).toHaveLength(FORMATION_GRID_SIZE);
      expect(deserialized.tiles.flat().every(cell => cell === null)).toBe(true);
    });

    it('should serialize and deserialize formation with units', () => {
      // Arrange
      const store = createTestStore();
      const unit1 = createMockUnit({ name: 'Archers', level: 5 });
      const unit2 = createMockUnit({ name: 'Infantry', level: 3 });
      store.dispatch(placeUnit({ row: 0, col: 0, unit: unit1 }));
      store.dispatch(placeUnit({ row: 3, col: 3, unit: unit2 }));

      // Act
      const state = store.getState();
      const serialized = serializeFormation(state.formation.currentFormation);
      const deserialized = deserializeFormation(serialized);

      // Assert
      expect(deserialized.tiles[0][0]?.name).toBe('Archers');
      expect(deserialized.tiles[0][0]?.level).toBe(5);
      expect(deserialized.tiles[3][3]?.name).toBe('Infantry');
      expect(deserialized.tiles[3][3]?.level).toBe(3);
    });

    it('should preserve formation name through serialization', () => {
      // Arrange
      const store = createTestStore();
      const formation: Formation = {
        id: '1',
        name: 'My Custom Formation',
        tiles: Array(FORMATION_GRID_SIZE).fill(null).map(() => Array(FORMATION_GRID_SIZE).fill(null)),
        power: 0,
      };
      store.dispatch(setCurrentFormation(formation));

      // Act
      const state = store.getState();
      const serialized = serializeFormation(state.formation.currentFormation);
      const deserialized = deserializeFormation(serialized);

      // Assert
      expect(deserialized.name).toBe('My Custom Formation');
    });

    it('should handle formation with all cells filled', () => {
      // Arrange
      const tiles: (Unit | null)[][] = Array(FORMATION_GRID_SIZE)
        .fill(null)
        .map((_, row) =>
          Array(FORMATION_GRID_SIZE)
            .fill(null)
            .map((__, col) =>
              createMockUnit({ name: 'Archers', level: Math.min((row + col) % 10 + 1, 10) })
            )
        );
      const formation: Formation = {
        id: '1',
        name: 'Full Formation',
        tiles,
        power: 1000,
      };

      // Act
      const serialized = serializeFormation(formation);
      const deserialized = deserializeFormation(serialized);

      // Assert
      expect(deserialized.name).toBe('Full Formation');
      for (let row = 0; row < FORMATION_GRID_SIZE; row++) {
        for (let col = 0; col < FORMATION_GRID_SIZE; col++) {
          expect(deserialized.tiles[row][col]).not.toBeNull();
          expect(deserialized.tiles[row][col]?.name).toBe('Archers');
        }
      }
    });

    it('should handle null formation', () => {
      // Act
      const serialized = serializeFormation(null);
      const deserialized = deserializeFormation(serialized);

      // Assert
      expect(serialized).toBe('');
      expect(deserialized.name).toBe('Formation 1');
      expect(deserialized.tiles.flat().every(cell => cell === null)).toBe(true);
    });
  });

  describe('Store State to URL Roundtrip', () => {
    it('should roundtrip complete store state through URL serialization', async () => {
      // Arrange
      const store = createTestStore();
      store.dispatch(addUnit(createMockUnit({ id: '1', name: 'Archers', level: 5 })));
      store.dispatch(addUnit(createMockUnit({ id: '2', name: 'Infantry', level: 3 })));

      const unitToPlace = createMockUnit({ id: '3', name: 'Monk', level: 10, rarity: UnitRarity.Legendary });
      store.dispatch(addUnit(unitToPlace));
      store.dispatch(placeUnit({ row: 0, col: 0, unit: unitToPlace }));
      await new Promise(resolve => setTimeout(resolve, 50));

      // Act
      const state = store.getState();
      const unitsUrl = serializeUnits(state.unit.units);
      const formationUrl = serializeFormation(state.formation.currentFormation);

      const deserializedUnits = deserializeUnits(unitsUrl);
      const deserializedFormation = deserializeFormation(formationUrl);

      const newStore = createTestStore();
      newStore.dispatch(setUnits(deserializedUnits));
      const newFormation: Formation = {
        id: '1',
        name: deserializedFormation.name,
        tiles: deserializedFormation.tiles,
        power: 0,
      };
      newStore.dispatch(setCurrentFormation(newFormation));

      // Assert
      const newState = newStore.getState();
      expect(newState.unit.units).toHaveLength(2);
      expect(newState.formation.currentFormation?.tiles[0][0]?.name).toBe('Monk');
    });

    it('should handle special characters in formation name', () => {
      // Arrange
      const formation: Formation = {
        id: '1',
        name: 'Test Formation - Arena 1 (2025)',
        tiles: Array(FORMATION_GRID_SIZE).fill(null).map(() => Array(FORMATION_GRID_SIZE).fill(null)),
        power: 0,
      };

      // Act
      const serialized = serializeFormation(formation);
      const deserialized = deserializeFormation(serialized);

      // Assert
      expect(deserialized.name).toBe('Test Formation - Arena 1 (2025)');
    });

    it('should validate unit levels during deserialization', () => {
      // Arrange
      const invalidUrl = '2,0,1;2,11,1;2,5,1';

      // Act
      const deserialized = deserializeUnits(invalidUrl);

      // Assert
      expect(deserialized).toHaveLength(1);
      expect(deserialized[0].level).toBe(5);
    });

    it('should respect max units per level limit', () => {
      // Arrange
      const archersIndex = getUnitDataByName('Archers')?.index ?? 2;
      const urlWithTooMany = `${archersIndex},5,100`;

      // Act
      const deserialized = deserializeUnits(urlWithTooMany);

      // Assert
      expect(deserialized.length).toBeLessThanOrEqual(49);
    });
  });
});
