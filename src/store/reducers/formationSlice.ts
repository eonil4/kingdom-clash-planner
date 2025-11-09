import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Formation, Unit } from '../../types';

interface FormationState {
  currentFormation: Formation | null;
}

const initialState: FormationState = {
  currentFormation: {
    id: '1',
    name: 'Formation 1',
    tiles: Array(7)
      .fill(null)
      .map(() => Array(7).fill(null)),
    power: 0,
  },
};

const formationSlice = createSlice({
  name: 'formation',
  initialState,
  reducers: {
    setCurrentFormation: (state, action: PayloadAction<Formation>) => {
      state.currentFormation = action.payload;
    },
    placeUnit: (
      state,
      action: PayloadAction<{ row: number; col: number; unit: Unit }>
    ) => {
      if (state.currentFormation) {
        state.currentFormation.tiles[action.payload.row][
          action.payload.col
        ] = action.payload.unit;
        state.currentFormation.power = calculatePower(
          state.currentFormation.tiles
        );
      }
    },
    removeUnit: (state, action: PayloadAction<{ row: number; col: number; unit?: Unit | null }>) => {
      if (state.currentFormation) {
        // Remove unit from the tile
        // Note: The unit should be passed in the payload so the saga can add it back to roster
        state.currentFormation.tiles[action.payload.row][
          action.payload.col
        ] = null;
        state.currentFormation.power = calculatePower(
          state.currentFormation.tiles
        );
      }
    },
    updateFormationName: (state, action: PayloadAction<string>) => {
      if (state.currentFormation) {
        state.currentFormation.name = action.payload;
      }
    },
  },
});

function calculatePower(tiles: (Unit | null)[][]): number {
  let power = 0;
  for (const row of tiles) {
    for (const unit of row) {
      if (unit) {
        power += unit.power;
      }
    }
  }
  return power;
}

export const {
  setCurrentFormation,
  placeUnit,
  removeUnit,
  updateFormationName,
} = formationSlice.actions;

export default formationSlice.reducer;

