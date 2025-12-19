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

// Helper to calculate total power of the formation
function calculateFormationPower(tiles: (Unit | null)[][]): number {
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
        state.currentFormation.power = calculateFormationPower(
          state.currentFormation.tiles
        );
      }
    },
    removeUnit: (state, action: PayloadAction<{ row: number; col: number; unit?: Unit | null }>) => {
      if (state.currentFormation) {
        // Remove unit from the tile
        state.currentFormation.tiles[action.payload.row][
          action.payload.col
        ] = null;
        state.currentFormation.power = calculateFormationPower(
          state.currentFormation.tiles
        );
      }
    },
    swapUnits: (
      state,
      action: PayloadAction<{ 
        sourceRow: number; 
        sourceCol: number; 
        targetRow: number; 
        targetCol: number;
        sourceUnit: Unit;
        targetUnit: Unit;
      }>
    ) => {
      if (state.currentFormation) {
        // Swap the units
        state.currentFormation.tiles[action.payload.sourceRow][
          action.payload.sourceCol
        ] = action.payload.targetUnit;
        state.currentFormation.tiles[action.payload.targetRow][
          action.payload.targetCol
        ] = action.payload.sourceUnit;
        state.currentFormation.power = calculateFormationPower(
          state.currentFormation.tiles
        );
      }
    },
    updateFormationName: (state, action: PayloadAction<string>) => {
      if (state.currentFormation) {
        state.currentFormation.name = action.payload;
      }
    },
    updateUnitInFormation: (
      state,
      action: PayloadAction<{ row: number; col: number; unit: Unit }>
    ) => {
      if (state.currentFormation) {
        state.currentFormation.tiles[action.payload.row][action.payload.col] = action.payload.unit;
        state.currentFormation.power = calculateFormationPower(state.currentFormation.tiles);
      }
    },
  },
});

export const {
  setCurrentFormation,
  placeUnit,
  removeUnit,
  swapUnits,
  updateFormationName,
  updateUnitInFormation,
} = formationSlice.actions;

export default formationSlice.reducer;
