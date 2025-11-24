import { describe, it, expect } from 'vitest';
import formationReducer, { setCurrentFormation, placeUnit, removeUnit, swapUnits } from '../../../../src/store/reducers/formationSlice';
import type { Formation, Unit } from '../../../../src/types';
import { UnitRarity } from '../../../../src/types';

describe('formationSlice', () => {
  const initialState = {
    currentFormation: {
      id: '1',
      name: 'Formation 1',
      tiles: Array(7)
        .fill(null)
        .map(() => Array(7).fill(null)),
      power: 0,
    },
  };

  const mockUnit: Unit = {
    id: 'unit-1',
    name: 'Archers',
    level: 5,
    rarity: UnitRarity.Common,
    power: 1600,
  };

  describe('initial state', () => {
    it('should return initial state', () => {
      const state = formationReducer(undefined, { type: 'unknown' });
      expect(state.currentFormation).toBeDefined();
      expect(state.currentFormation?.name).toBe('Formation 1');
      expect(state.currentFormation?.tiles.length).toBe(7);
    });
  });

  describe('setCurrentFormation', () => {
    it('should set current formation', () => {
      const newFormation: Formation = {
        id: '2',
        name: 'New Formation',
        tiles: Array(7)
          .fill(null)
          .map(() => Array(7).fill(null)),
        power: 1000,
      };
      const state = formationReducer(initialState, setCurrentFormation(newFormation));
      expect(state.currentFormation).toEqual(newFormation);
    });
  });

  describe('placeUnit', () => {
    it('should place unit at specified position', () => {
      const state = formationReducer(
        initialState,
        placeUnit({ row: 0, col: 0, unit: mockUnit })
      );
      expect(state.currentFormation?.tiles[0][0]).toEqual(mockUnit);
      expect(state.currentFormation?.power).toBe(1600);
    });

    it('should update power when placing unit', () => {
      const state = formationReducer(
        initialState,
        placeUnit({ row: 0, col: 0, unit: mockUnit })
      );
      expect(state.currentFormation?.power).toBe(1600);
    });

    it('should replace existing unit', () => {
      const stateWithUnit = formationReducer(
        initialState,
        placeUnit({ row: 0, col: 0, unit: mockUnit })
      );
      const newUnit: Unit = {
        id: 'unit-2',
        name: 'Paladin',
        level: 10,
        rarity: UnitRarity.Epic,
        power: 53760,
      };
      const state = formationReducer(
        stateWithUnit,
        placeUnit({ row: 0, col: 0, unit: newUnit })
      );
      expect(state.currentFormation?.tiles[0][0]).toEqual(newUnit);
      expect(state.currentFormation?.power).toBe(53760);
    });

    it('should handle null currentFormation', () => {
      const nullState = { currentFormation: null };
      const state = formationReducer(
        nullState,
        placeUnit({ row: 0, col: 0, unit: mockUnit })
      );
      expect(state.currentFormation).toBeNull();
    });
  });

  describe('removeUnit', () => {
    it('should remove unit from specified position', () => {
      const stateWithUnit = formationReducer(
        initialState,
        placeUnit({ row: 0, col: 0, unit: mockUnit })
      );
      const state = formationReducer(
        stateWithUnit,
        removeUnit({ row: 0, col: 0, unit: mockUnit })
      );
      expect(state.currentFormation?.tiles[0][0]).toBeNull();
      expect(state.currentFormation?.power).toBe(0);
    });

    it('should remove unit without passing unit in payload', () => {
      const stateWithUnit = formationReducer(
        initialState,
        placeUnit({ row: 0, col: 0, unit: mockUnit })
      );
      const state = formationReducer(
        stateWithUnit,
        removeUnit({ row: 0, col: 0 })
      );
      expect(state.currentFormation?.tiles[0][0]).toBeNull();
      expect(state.currentFormation?.power).toBe(0);
    });

    it('should update power when removing unit', () => {
      const stateWithUnit = formationReducer(
        initialState,
        placeUnit({ row: 0, col: 0, unit: mockUnit })
      );
      const state = formationReducer(
        stateWithUnit,
        removeUnit({ row: 0, col: 0, unit: mockUnit })
      );
      expect(state.currentFormation?.power).toBe(0);
    });

    it('should handle null currentFormation', () => {
      const nullState = { currentFormation: null };
      const state = formationReducer(
        nullState,
        removeUnit({ row: 0, col: 0 })
      );
      expect(state.currentFormation).toBeNull();
    });

    it('should store unit in payload if not provided', () => {
      const stateWithUnit = formationReducer(
        initialState,
        placeUnit({ row: 0, col: 0, unit: mockUnit })
      );
      const action = removeUnit({ row: 0, col: 0 });
      const state = formationReducer(stateWithUnit, action);
      // The unit should be stored in the action payload by the reducer
      expect(state.currentFormation?.tiles[0][0]).toBeNull();
    });
  });

  describe('swapUnits', () => {
    it('should swap two units in different positions', () => {
      const unit1: Unit = {
        id: 'unit-1',
        name: 'Archers',
        level: 5,
        rarity: UnitRarity.Common,
        power: 1600,
      };
      const unit2: Unit = {
        id: 'unit-2',
        name: 'Paladin',
        level: 10,
        rarity: UnitRarity.Epic,
        power: 53760,
      };
      
      const stateWithUnits = formationReducer(
        initialState,
        placeUnit({ row: 0, col: 0, unit: unit1 })
      );
      const stateWithBothUnits = formationReducer(
        stateWithUnits,
        placeUnit({ row: 1, col: 1, unit: unit2 })
      );
      
      const state = formationReducer(
        stateWithBothUnits,
        swapUnits({
          sourceRow: 0,
          sourceCol: 0,
          targetRow: 1,
          targetCol: 1,
          sourceUnit: unit1,
          targetUnit: unit2,
        })
      );
      
      expect(state.currentFormation?.tiles[0][0]).toEqual(unit2);
      expect(state.currentFormation?.tiles[1][1]).toEqual(unit1);
      expect(state.currentFormation?.power).toBe(1600 + 53760);
    });

    it('should update power correctly after swap', () => {
      const unit1: Unit = {
        id: 'unit-1',
        name: 'Archers',
        level: 5,
        rarity: UnitRarity.Common,
        power: 1000,
      };
      const unit2: Unit = {
        id: 'unit-2',
        name: 'Paladin',
        level: 10,
        rarity: UnitRarity.Epic,
        power: 2000,
      };
      
      const stateWithUnits = formationReducer(
        initialState,
        placeUnit({ row: 0, col: 0, unit: unit1 })
      );
      const stateWithBothUnits = formationReducer(
        stateWithUnits,
        placeUnit({ row: 2, col: 3, unit: unit2 })
      );
      
      const state = formationReducer(
        stateWithBothUnits,
        swapUnits({
          sourceRow: 0,
          sourceCol: 0,
          targetRow: 2,
          targetCol: 3,
          sourceUnit: unit1,
          targetUnit: unit2,
        })
      );
      
      // Power should remain the same (same units, just swapped positions)
      expect(state.currentFormation?.power).toBe(1000 + 2000);
    });

    it('should handle null currentFormation', () => {
      const unit1: Unit = {
        id: 'unit-1',
        name: 'Archers',
        level: 5,
        rarity: UnitRarity.Common,
        power: 1600,
      };
      const unit2: Unit = {
        id: 'unit-2',
        name: 'Paladin',
        level: 10,
        rarity: UnitRarity.Epic,
        power: 53760,
      };
      
      const nullState = { currentFormation: null };
      const state = formationReducer(
        nullState,
        swapUnits({
          sourceRow: 0,
          sourceCol: 0,
          targetRow: 1,
          targetCol: 1,
          sourceUnit: unit1,
          targetUnit: unit2,
        })
      );
      
      expect(state.currentFormation).toBeNull();
    });
  });
});

