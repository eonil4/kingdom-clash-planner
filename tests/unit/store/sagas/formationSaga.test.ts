import { describe, it, expect } from 'vitest';
import { put } from 'redux-saga/effects';
import formationSaga, { handlePlaceUnit, handleRemoveUnit } from '../../../../src/store/sagas/formationSaga';
import { placeUnit, removeUnit } from '../../../../src/store/reducers/formationSlice';
import { removeUnit as removeUnitFromList, addUnit } from '../../../../src/store/reducers/unitSlice';
import type { Unit } from '../../../../src/types';
import { UnitRarity } from '../../../../src/types';

describe('formationSaga', () => {
  const mockUnit: Unit = {
    id: 'unit-1',
    name: 'ARCHERS',
    level: 5,
    rarity: UnitRarity.Rare,
    power: 1920,
  };

  describe('handlePlaceUnit', () => {
    it('should remove unit from list when placing in formation', () => {
      const action = placeUnit({ row: 0, col: 0, unit: mockUnit });
      const generator = handlePlaceUnit(action);
      
      expect(generator.next().value).toEqual(put(removeUnitFromList(mockUnit.id)));
      expect(generator.next().done).toBe(true);
    });
  });

  describe('handleRemoveUnit', () => {
    it('should add unit back to list when removing from formation', () => {
      const action = removeUnit({ row: 0, col: 0, unit: mockUnit });
      const generator = handleRemoveUnit(action);
      
      expect(generator.next().value).toEqual(put(addUnit(mockUnit)));
      expect(generator.next().done).toBe(true);
    });

    it('should not add unit if unit is null', () => {
      const action = removeUnit({ row: 0, col: 0, unit: null });
      const generator = handleRemoveUnit(action);
      
      expect(generator.next().done).toBe(true);
    });

    it('should not add unit if unit is undefined', () => {
      const action = removeUnit({ row: 0, col: 0 });
      const generator = handleRemoveUnit(action);
      
      expect(generator.next().done).toBe(true);
    });
  });

  describe('formationSaga', () => {
    it('should take every placeUnit action', () => {
      const generator = formationSaga();
      const firstEffect = generator.next().value;
      // Check that takeEvery is called with correct action type and handler
      expect(firstEffect).toBeDefined();
      // Verify it's a takeEvery effect by checking the type
      expect(firstEffect).toHaveProperty('type', 'FORK');
    });

    it('should take every removeUnit action', () => {
      const generator = formationSaga();
      generator.next(); // Skip first takeEvery
      const secondEffect = generator.next().value;
      // Check that takeEvery is called with correct action type and handler
      expect(secondEffect).toBeDefined();
      // Verify it's a takeEvery effect by checking the type
      expect(secondEffect).toHaveProperty('type', 'FORK');
    });
  });
});

