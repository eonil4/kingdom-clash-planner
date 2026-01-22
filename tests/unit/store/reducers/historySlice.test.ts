import { describe, it, expect } from 'vitest';
import historyReducer, {
  addToHistory,
  undo,
  redo,
  clearHistory,
  setMaxHistorySize,
  setPresent,
} from '../../../../src/store/reducers/historySlice';
import type { Formation } from '../../../../src/types';

describe('historySlice', () => {
  const createMockFormation = (id: string, name: string): Formation => ({
    id,
    name,
    tiles: Array(7)
      .fill(null)
      .map(() => Array(7).fill(null)),
    power: 0,
  });

  const initialState = {
    past: [],
    present: null,
    future: [],
    maxHistorySize: 50,
  };

  describe('initial state', () => {
    it('should return initial state', () => {
      const state = historyReducer(undefined, { type: 'unknown' });
      expect(state.past).toEqual([]);
      expect(state.present).toBeNull();
      expect(state.future).toEqual([]);
      expect(state.maxHistorySize).toBe(50);
    });
  });

  describe('addToHistory', () => {
    it('should add formation to history when present is null', () => {
      const formation = createMockFormation('1', 'Formation 1');
      const state = historyReducer(initialState, addToHistory(formation));
      expect(state.present).toEqual(formation);
      expect(state.past).toEqual([]);
      expect(state.future).toEqual([]);
    });

    it('should move present to past when adding new formation', () => {
      const formation1 = createMockFormation('1', 'Formation 1');
      const formation2 = createMockFormation('2', 'Formation 2');
      
      let state = historyReducer(initialState, addToHistory(formation1));
      state = historyReducer(state, addToHistory(formation2));
      
      expect(state.present).toEqual(formation2);
      expect(state.past).toHaveLength(1);
      expect(state.past[0]).toEqual(formation1);
      expect(state.future).toEqual([]);
    });

    it('should clear future when adding new formation', () => {
      const formation1 = createMockFormation('1', 'Formation 1');
      const formation2 = createMockFormation('2', 'Formation 2');
      const formation3 = createMockFormation('3', 'Formation 3');
      
      let state = historyReducer(initialState, addToHistory(formation1));
      state = historyReducer(state, addToHistory(formation2));
      state = historyReducer(state, undo());
      state = historyReducer(state, addToHistory(formation3));
      
      expect(state.future).toEqual([]);
      expect(state.present).toEqual(formation3);
    });

    it('should enforce maxHistorySize limit', () => {
      const stateWithMaxSize = {
        ...initialState,
        maxHistorySize: 2,
      };
      
      const formation1 = createMockFormation('1', 'Formation 1');
      const formation2 = createMockFormation('2', 'Formation 2');
      const formation3 = createMockFormation('3', 'Formation 3');
      const formation4 = createMockFormation('4', 'Formation 4');
      
      let state = historyReducer(stateWithMaxSize, addToHistory(formation1));
      state = historyReducer(state, addToHistory(formation2));
      state = historyReducer(state, addToHistory(formation3));
      state = historyReducer(state, addToHistory(formation4));
      
      expect(state.past).toHaveLength(2);
      expect(state.past[0]).toEqual(formation2);
      expect(state.past[1]).toEqual(formation3);
      expect(state.present).toEqual(formation4);
    });
  });

  describe('undo', () => {
    it('should do nothing if past is empty', () => {
      const state = historyReducer(initialState, undo());
      expect(state).toEqual(initialState);
    });

    it('should do nothing if present is null', () => {
      const stateWithPast = {
        ...initialState,
        past: [createMockFormation('1', 'Formation 1')],
        present: null,
      };
      const state = historyReducer(stateWithPast, undo());
      expect(state).toEqual(stateWithPast);
    });

    it('should move present to future and pop from past', () => {
      const formation1 = createMockFormation('1', 'Formation 1');
      const formation2 = createMockFormation('2', 'Formation 2');
      
      let state = historyReducer(initialState, addToHistory(formation1));
      state = historyReducer(state, addToHistory(formation2));
      state = historyReducer(state, undo());
      
      expect(state.present).toEqual(formation1);
      expect(state.past).toHaveLength(0);
      expect(state.future).toHaveLength(1);
      expect(state.future[0]).toEqual(formation2);
    });

    it('should handle multiple undos', () => {
      const formation1 = createMockFormation('1', 'Formation 1');
      const formation2 = createMockFormation('2', 'Formation 2');
      const formation3 = createMockFormation('3', 'Formation 3');
      
      let state = historyReducer(initialState, addToHistory(formation1));
      state = historyReducer(state, addToHistory(formation2));
      state = historyReducer(state, addToHistory(formation3));
      state = historyReducer(state, undo());
      state = historyReducer(state, undo());
      
      expect(state.present).toEqual(formation1);
      expect(state.past).toHaveLength(0);
      expect(state.future).toHaveLength(2);
    });
  });

  describe('redo', () => {
    it('should do nothing if future is empty', () => {
      const state = historyReducer(initialState, redo());
      expect(state).toEqual(initialState);
    });

    it('should move present to past and shift from future', () => {
      const formation1 = createMockFormation('1', 'Formation 1');
      const formation2 = createMockFormation('2', 'Formation 2');
      
      let state = historyReducer(initialState, addToHistory(formation1));
      state = historyReducer(state, addToHistory(formation2));
      state = historyReducer(state, undo());
      state = historyReducer(state, redo());
      
      expect(state.present).toEqual(formation2);
      expect(state.past).toHaveLength(1);
      expect(state.past[0]).toEqual(formation1);
      expect(state.future).toHaveLength(0);
    });

    it('should handle multiple redos', () => {
      const formation1 = createMockFormation('1', 'Formation 1');
      const formation2 = createMockFormation('2', 'Formation 2');
      const formation3 = createMockFormation('3', 'Formation 3');
      
      let state = historyReducer(initialState, addToHistory(formation1));
      state = historyReducer(state, addToHistory(formation2));
      state = historyReducer(state, addToHistory(formation3));
      state = historyReducer(state, undo());
      state = historyReducer(state, undo());
      state = historyReducer(state, redo());
      state = historyReducer(state, redo());
      
      expect(state.present).toEqual(formation3);
      expect(state.past).toHaveLength(2);
      expect(state.future).toHaveLength(0);
    });

    it('should enforce maxHistorySize when redoing', () => {
      const stateWithMaxSize = {
        ...initialState,
        maxHistorySize: 2,
      };
      
      const formation1 = createMockFormation('1', 'Formation 1');
      const formation2 = createMockFormation('2', 'Formation 2');
      const formation3 = createMockFormation('3', 'Formation 3');
      
      let state = historyReducer(stateWithMaxSize, addToHistory(formation1));
      state = historyReducer(state, addToHistory(formation2));
      state = historyReducer(state, addToHistory(formation3));
      state = historyReducer(state, undo());
      state = historyReducer(state, undo());
      state = historyReducer(state, redo());
      
      expect(state.past).toHaveLength(1);
      expect(state.past[0]).toEqual(formation1);
      expect(state.present).toEqual(formation2);
    });

    it('should trim past when it exceeds maxHistorySize during redo', () => {
      const stateWithMaxSize = {
        ...initialState,
        maxHistorySize: 1,
      };
      
      const formation1 = createMockFormation('1', 'Formation 1');
      const formation2 = createMockFormation('2', 'Formation 2');
      const formation3 = createMockFormation('3', 'Formation 3');
      
      let state = historyReducer(stateWithMaxSize, addToHistory(formation1));
      state = historyReducer(state, addToHistory(formation2));
      state = historyReducer(state, addToHistory(formation3));
      state = historyReducer(state, undo());
      
      expect(state.past).toHaveLength(0);
      expect(state.present).toEqual(formation2);
      expect(state.future).toHaveLength(1);
      expect(state.future[0]).toEqual(formation3);
      
      state = historyReducer(state, redo());
      
      expect(state.past).toHaveLength(1);
      expect(state.past[0]).toEqual(formation2);
      expect(state.present).toEqual(formation3);
      expect(state.future).toHaveLength(0);
      expect(state.past.length).toBeLessThanOrEqual(state.maxHistorySize);
    });

    it('should trim past when it exceeds maxHistorySize during redo with multiple items', () => {
      const stateWithMaxSize = {
        ...initialState,
        maxHistorySize: 2,
      };
      
      const formation1 = createMockFormation('1', 'Formation 1');
      const formation2 = createMockFormation('2', 'Formation 2');
      const formation3 = createMockFormation('3', 'Formation 3');
      const formation4 = createMockFormation('4', 'Formation 4');
      const formation5 = createMockFormation('5', 'Formation 5');
      
      let state = historyReducer(stateWithMaxSize, addToHistory(formation1));
      state = historyReducer(state, addToHistory(formation2));
      state = historyReducer(state, addToHistory(formation3));
      state = historyReducer(state, addToHistory(formation4));
      state = historyReducer(state, addToHistory(formation5));
      state = historyReducer(state, undo());
      
      expect(state.past).toHaveLength(1);
      expect(state.past[0]).toEqual(formation3);
      expect(state.present).toEqual(formation4);
      expect(state.future).toHaveLength(1);
      
      state = historyReducer(state, redo());
      
      expect(state.past).toHaveLength(2);
      expect(state.past[0]).toEqual(formation3);
      expect(state.past[1]).toEqual(formation4);
      expect(state.present).toEqual(formation5);
      expect(state.future).toHaveLength(0);
      expect(state.past.length).toBeLessThanOrEqual(state.maxHistorySize);
    });
  });

  describe('clearHistory', () => {
    it('should clear all history', () => {
      const formation1 = createMockFormation('1', 'Formation 1');
      const formation2 = createMockFormation('2', 'Formation 2');
      
      let state = historyReducer(initialState, addToHistory(formation1));
      state = historyReducer(state, addToHistory(formation2));
      state = historyReducer(state, undo());
      state = historyReducer(state, clearHistory());
      
      expect(state.past).toEqual([]);
      expect(state.present).toBeNull();
      expect(state.future).toEqual([]);
    });
  });

  describe('setMaxHistorySize', () => {
    it('should update maxHistorySize', () => {
      const state = historyReducer(initialState, setMaxHistorySize(100));
      expect(state.maxHistorySize).toBe(100);
    });

    it('should trim past if it exceeds new maxHistorySize', () => {
      const formations = Array(5)
        .fill(null)
        .map((_, i) => createMockFormation(`${i + 1}`, `Formation ${i + 1}`));
      
      let state = {
        ...initialState,
        maxHistorySize: 10,
      };
      
      for (const formation of formations) {
        state = historyReducer(state, addToHistory(formation));
      }
      
      state = historyReducer(state, setMaxHistorySize(2));
      
      expect(state.past).toHaveLength(2);
      expect(state.past[0]).toEqual(formations[2]);
      expect(state.past[1]).toEqual(formations[3]);
      expect(state.present).toEqual(formations[4]);
    });
  });

  describe('setPresent', () => {
    it('should set present formation', () => {
      const formation = createMockFormation('1', 'Formation 1');
      const state = historyReducer(initialState, setPresent(formation));
      expect(state.present).toEqual(formation);
    });

    it('should set present to null', () => {
      const formation = createMockFormation('1', 'Formation 1');
      let state = historyReducer(initialState, setPresent(formation));
      state = historyReducer(state, setPresent(null));
      expect(state.present).toBeNull();
    });
  });
});
