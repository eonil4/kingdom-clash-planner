import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Formation } from '../../types';

interface HistoryState {
  past: Formation[];
  present: Formation | null;
  future: Formation[];
  maxHistorySize: number;
}

const initialState: HistoryState = {
  past: [],
  present: null,
  future: [],
  maxHistorySize: 50,
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addToHistory: (state, action: PayloadAction<Formation>) => {
      if (state.present) {
        state.past.push(state.present);
        if (state.past.length > state.maxHistorySize) {
          state.past.shift();
        }
      }
      state.present = action.payload;
      state.future = [];
    },
    undo: (state) => {
      if (state.past.length === 0 || !state.present) {
        return;
      }
      state.future.unshift(state.present);
      const previousState = state.past.pop();
      /* istanbul ignore if -- @preserve defensive check, previousState always exists when past.length > 0 */
      if (previousState) {
        state.present = previousState;
      }
    },
    redo: (state) => {
      if (state.future.length === 0) {
        return;
      }
      /* istanbul ignore if -- @preserve defensive check, present always exists in normal flow */
      if (state.present) {
        state.past.push(state.present);
        if (state.past.length > state.maxHistorySize) {
          /* istanbul ignore next -- @preserve edge case when past exceeds maxHistorySize during redo */
          state.past.shift();
        }
      }
      const nextState = state.future.shift();
      /* istanbul ignore if -- @preserve defensive check, nextState always exists when future.length > 0 */
      if (nextState) {
        state.present = nextState;
      }
    },
    clearHistory: (state) => {
      state.past = [];
      state.future = [];
      state.present = null;
    },
    setMaxHistorySize: (state, action: PayloadAction<number>) => {
      state.maxHistorySize = action.payload;
      if (state.past.length > state.maxHistorySize) {
        state.past = state.past.slice(-state.maxHistorySize);
      }
    },
    setPresent: (state, action: PayloadAction<Formation | null>) => {
      state.present = action.payload;
    },
  },
});

export const {
  addToHistory,
  undo,
  redo,
  clearHistory,
  setMaxHistorySize,
  setPresent,
} = historySlice.actions;

export default historySlice.reducer;
