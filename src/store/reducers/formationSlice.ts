import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Formation, Unit } from '../../types';

interface FormationState {
  currentFormation: Formation | null;
  formations: Formation[];
  selectedFormationId: string | null;
}

const initialState: FormationState = {
  currentFormation: {
    id: '1',
    name: 'Formation 9',
    tiles: Array(7)
      .fill(null)
      .map(() => Array(7).fill(null)),
    power: 0,
  },
  formations: [],
  selectedFormationId: '1',
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
        // Get the unit before removing it (unit may be passed in payload or read from tiles)
        const unitToRemove = action.payload.unit || state.currentFormation.tiles[action.payload.row]?.[action.payload.col];
        state.currentFormation.tiles[action.payload.row][
          action.payload.col
        ] = null;
        state.currentFormation.power = calculatePower(
          state.currentFormation.tiles
        );
        // Store unit in action payload for saga (if not already there)
        if (unitToRemove && !action.payload.unit) {
          (action.payload as { row: number; col: number; unit?: Unit | null }).unit = unitToRemove;
        }
      }
    },
    setFormations: (state, action: PayloadAction<Formation[]>) => {
      state.formations = action.payload;
    },
    setSelectedFormationId: (state, action: PayloadAction<string>) => {
      state.selectedFormationId = action.payload;
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
  setFormations,
  setSelectedFormationId,
} = formationSlice.actions;

export default formationSlice.reducer;

