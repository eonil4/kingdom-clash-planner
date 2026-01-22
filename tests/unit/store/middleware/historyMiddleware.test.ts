import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AnyAction } from '@reduxjs/toolkit';
import { historyMiddleware } from '../../../../src/store/middleware/historyMiddleware';
import { placeUnit, removeUnit, swapUnits, updateFormationName, updateUnitInFormation } from '../../../../src/store/reducers/formationSlice';
import type { Formation, Unit } from '../../../../src/types';
import { UnitRarity } from '../../../../src/types';

vi.mock('../../../../src/store/reducers/historySlice', () => ({
  addToHistory: vi.fn((formation) => ({ type: 'history/addToHistory', payload: formation })),
}));

describe('historyMiddleware', () => {
  const createMockFormation = (): Formation => ({
    id: '1',
    name: 'Test Formation',
    tiles: Array(7)
      .fill(null)
      .map(() => Array(7).fill(null)),
    power: 0,
  });

  const createMockUnit = (id: string): Unit => ({
    id,
    name: 'Archers',
    level: 5,
    rarity: UnitRarity.Common,
    power: 1600,
  });

  let store: {
    getState: ReturnType<typeof historyMiddleware> extends (store: infer S) => unknown ? S : never;
    dispatch: ReturnType<ReturnType<typeof historyMiddleware>>;
  };
  let next: ReturnType<ReturnType<typeof historyMiddleware>>;
  let dispatchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    dispatchSpy = vi.fn();
    store = {
      getState: vi.fn(() => ({
        formation: {
          currentFormation: createMockFormation(),
        },
        unit: {
          units: [],
        },
        history: {
          past: [],
          present: null,
          future: [],
          maxHistorySize: 50,
        },
      })),
      dispatch: dispatchSpy,
    } as never;
    next = vi.fn((action) => action);
  });

  it('should intercept placeUnit action and add to history', () => {
    const middleware = historyMiddleware(store as never)(next);
    const action = placeUnit({ row: 0, col: 0, unit: createMockUnit('1') });
    
    middleware(action as AnyAction);
    
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'history/addToHistory',
      })
    );
    expect(next).toHaveBeenCalledWith(action);
  });

  it('should intercept removeUnit action and add to history', () => {
    const middleware = historyMiddleware(store as never)(next);
    const action = removeUnit({ row: 0, col: 0 });
    
    middleware(action as AnyAction);
    
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'history/addToHistory',
      })
    );
    expect(next).toHaveBeenCalledWith(action);
  });

  it('should intercept swapUnits action and add to history', () => {
    const middleware = historyMiddleware(store as never)(next);
    const unit1 = createMockUnit('1');
    const unit2 = createMockUnit('2');
    const action = swapUnits({
      sourceRow: 0,
      sourceCol: 0,
      targetRow: 1,
      targetCol: 1,
      sourceUnit: unit1,
      targetUnit: unit2,
    });
    
    middleware(action as AnyAction);
    
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'history/addToHistory',
      })
    );
    expect(next).toHaveBeenCalledWith(action);
  });

  it('should intercept updateFormationName action and add to history', () => {
    const middleware = historyMiddleware(store as never)(next);
    const action = updateFormationName('New Name');
    
    middleware(action as AnyAction);
    
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'history/addToHistory',
      })
    );
    expect(next).toHaveBeenCalledWith(action);
  });

  it('should intercept updateUnitInFormation action and add to history', () => {
    const middleware = historyMiddleware(store as never)(next);
    const action = updateUnitInFormation({
      row: 0,
      col: 0,
      unit: createMockUnit('1'),
    });
    
    middleware(action as AnyAction);
    
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'history/addToHistory',
      })
    );
    expect(next).toHaveBeenCalledWith(action);
  });

  it('should not intercept non-undoable actions', () => {
    const middleware = historyMiddleware(store as never)(next);
    const action = { type: 'unknown/action' };
    
    middleware(action as AnyAction);
    
    expect(dispatchSpy).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(action);
  });

  it('should not add to history if currentFormation is null', () => {
    const storeWithoutFormation = {
      ...store,
      getState: vi.fn(() => ({
        formation: {
          currentFormation: null,
        },
        unit: {
          units: [],
        },
        history: {
          past: [],
          present: null,
          future: [],
          maxHistorySize: 50,
        },
      })),
    } as never;
    
    const middleware = historyMiddleware(storeWithoutFormation)(next);
    const action = placeUnit({ row: 0, col: 0, unit: createMockUnit('1') });
    
    middleware(action as AnyAction);
    
    expect(dispatchSpy).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(action);
  });
});
