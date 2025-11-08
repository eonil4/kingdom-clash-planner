import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Unit, SortOption } from '../../types';
import { UnitRarity } from '../../types';
import { normalizeUnitName } from '../../utils/unitNameUtils';
import { calculateUnitPower } from '../../utils/powerUtils';

interface UnitState {
  units: Unit[];
  sortOption: SortOption;
  sortOption2: SortOption | null;
  sortOption3: SortOption | null;
  filteredUnits: Unit[];
  searchTerm: string;
}

const initialState: UnitState = {
  units: [],
  sortOption: 'level',
  sortOption2: 'rarity',
  sortOption3: 'name',
  filteredUnits: [],
  searchTerm: '',
};

const unitSlice = createSlice({
  name: 'unit',
  initialState,
  reducers: {
    setUnits: (state, action: PayloadAction<Unit[]>) => {
      // Normalize all unit names when setting units
      const normalizedUnits = action.payload.map((unit) => ({
        ...unit,
        name: normalizeUnitName(unit.name),
      }));
      state.units = normalizedUnits;
      state.filteredUnits = filterAndSortUnits(
        normalizedUnits,
        state.sortOption,
        state.sortOption2,
        state.sortOption3,
        state.searchTerm
      );
    },
    setSortOption: (state, action: PayloadAction<SortOption>) => {
      state.sortOption = action.payload;
      state.filteredUnits = filterAndSortUnits(
        state.units,
        state.sortOption,
        state.sortOption2,
        state.sortOption3,
        state.searchTerm
      );
    },
    setSortOption2: (state, action: PayloadAction<SortOption | null>) => {
      state.sortOption2 = action.payload;
      state.filteredUnits = filterAndSortUnits(
        state.units,
        state.sortOption,
        state.sortOption2,
        state.sortOption3,
        state.searchTerm
      );
    },
    setSortOption3: (state, action: PayloadAction<SortOption | null>) => {
      state.sortOption3 = action.payload;
      state.filteredUnits = filterAndSortUnits(
        state.units,
        state.sortOption,
        state.sortOption2,
        state.sortOption3,
        state.searchTerm
      );
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.filteredUnits = filterAndSortUnits(
        state.units,
        state.sortOption,
        state.sortOption2,
        state.sortOption3,
        action.payload
      );
    },
    removeUnit: (state, action: PayloadAction<string>) => {
      state.units = state.units.filter((unit) => unit.id !== action.payload);
      state.filteredUnits = filterAndSortUnits(
        state.units,
        state.sortOption,
        state.sortOption2,
        state.sortOption3,
        state.searchTerm
      );
    },
    addUnit: (state, action: PayloadAction<Unit>) => {
      // Maximum unit count is 49 (7x7 formation grid capacity)
      const maxUnits = 49;
      if (state.units.length >= maxUnits) {
        return; // Don't add if at capacity
      }
      
      // Normalize unit name and ensure power is calculated
      const normalizedUnit = {
        ...action.payload,
        name: normalizeUnitName(action.payload.name),
        power: action.payload.power || calculateUnitPower(action.payload.rarity, action.payload.level),
      };
      state.units.push(normalizedUnit);
      state.filteredUnits = filterAndSortUnits(
        state.units,
        state.sortOption,
        state.sortOption2,
        state.sortOption3,
        state.searchTerm
      );
    },
    updateUnit: (state, action: PayloadAction<Unit>) => {
      const index = state.units.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        // Normalize unit name and ensure power is calculated
        const normalizedUnit = {
          ...action.payload,
          name: normalizeUnitName(action.payload.name),
          power: action.payload.power || calculateUnitPower(action.payload.rarity, action.payload.level),
        };
        state.units[index] = normalizedUnit;
        state.filteredUnits = filterAndSortUnits(
          state.units,
          state.sortOption,
          state.sortOption2,
          state.sortOption3,
          state.searchTerm
        );
      }
    },
  },
});

function filterUnits(units: Unit[], searchTerm: string): Unit[] {
  if (!searchTerm.trim()) {
    return units;
  }
  const term = searchTerm.toLowerCase().trim();
  return units.filter(
    (unit) =>
      unit.name.toLowerCase().includes(term) ||
      unit.rarity.toLowerCase().includes(term)
  );
}

function getSortComparison(a: Unit, b: Unit, sortOption: SortOption): number {
  const rarityOrder: Record<UnitRarity, number> = {
    [UnitRarity.Common]: 0,
    [UnitRarity.Rare]: 1,
    [UnitRarity.Epic]: 2,
    [UnitRarity.Legendary]: 3,
  };

  switch (sortOption) {
    case 'level':
      return b.level - a.level; // Descending (higher level first)
    case 'rarity':
      return rarityOrder[b.rarity] - rarityOrder[a.rarity]; // Descending (higher rarity first)
    case 'name':
      return a.name.localeCompare(b.name); // Ascending (alphabetical)
    default:
      return 0;
  }
}

function sortUnits(units: Unit[], sortOption: SortOption, sortOption2: SortOption | null, sortOption3: SortOption | null): Unit[] {
  const sorted = [...units];
  return sorted.sort((a, b) => {
    // Primary sort
    let comparison = getSortComparison(a, b, sortOption);
    if (comparison !== 0) return comparison;

    // Secondary sort (if specified and primary is equal)
    if (sortOption2) {
      comparison = getSortComparison(a, b, sortOption2);
      if (comparison !== 0) return comparison;
    }

    // Tertiary sort (if specified and primary/secondary are equal)
    if (sortOption3) {
      comparison = getSortComparison(a, b, sortOption3);
      if (comparison !== 0) return comparison;
    }

    return 0;
  });
}

function filterAndSortUnits(
  units: Unit[],
  sortOption: SortOption,
  sortOption2: SortOption | null,
  sortOption3: SortOption | null,
  searchTerm: string
): Unit[] {
  const filtered = filterUnits(units, searchTerm);
  return sortUnits(filtered, sortOption, sortOption2, sortOption3);
}

export const {
  setUnits,
  setSortOption,
  setSortOption2,
  setSortOption3,
  setSearchTerm,
  removeUnit,
  addUnit,
  updateUnit,
} = unitSlice.actions;

export default unitSlice.reducer;


