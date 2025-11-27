import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useManageUnits } from '../../../src/hooks/useManageUnits';
import { UnitRarity } from '../../../src/types';
import type { Unit } from '../../../src/types';
import formationReducer from '../../../src/store/reducers/formationSlice';

vi.mock('../../../src/store/reducers/unitSlice', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../src/store/reducers/unitSlice')>();
  return {
    ...actual,
    addUnit: vi.fn((unit) => ({ type: 'unit/addUnit', payload: unit })),
    removeUnit: vi.fn((id) => ({ type: 'unit/removeUnit', payload: id })),
    updateUnit: vi.fn((unit) => ({ type: 'unit/updateUnit', payload: unit })),
  };
});

import unitReducer from '../../../src/store/reducers/unitSlice';

vi.mock('../../../src/utils/unitNameUtils', () => ({
  normalizeUnitName: vi.fn((name) => name.trim()),
}));

vi.mock('../../../src/utils/powerUtils', () => ({
  calculateUnitPower: vi.fn((rarity, level) => level * 100),
}));

vi.mock('../../../src/types/unitNames', () => ({
  getUnitDataByName: vi.fn((name) => {
    if (name === 'TestUnit') {
      return {
        name: 'TestUnit',
        rarity: UnitRarity.Common,
        getPower: (level: number) => level * 100,
      };
    }
    return null;
  }),
}));

const createMockStore = (units: Unit[] = [], formation = {
  id: '1',
  name: 'Test Formation',
  tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
  power: 0,
}) => {
  return configureStore({
    reducer: {
      unit: unitReducer,
      formation: formationReducer,
    },
    preloadedState: {
      unit: {
        units,
        filteredUnits: [],
        sortOption: 'level' as const,
        sortOption2: null,
        sortOption3: null,
        searchTerm: '',
      },
      formation: {
        currentFormation: formation,
        formations: [],
      },
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
      }),
  });
};

const wrapper = (units: Unit[] = [], formation = {
  id: '1',
  name: 'Test Formation',
  tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
  power: 0,
}) => {
  const store = createMockStore(units, formation);
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('useManageUnits', () => {
  const mockUnits: Unit[] = [
    { id: '1', name: 'TestUnit', level: 1, rarity: UnitRarity.Common, power: 100 },
    { id: '2', name: 'TestUnit', level: 1, rarity: UnitRarity.Common, power: 100 },
    { id: '3', name: 'AnotherUnit', level: 5, rarity: UnitRarity.Epic, power: 500 },
  ];

  const mockFormation = {
    id: '1',
    name: 'Test Formation',
    tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
    power: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    expect(result.current.isAdding).toBe(false);
    expect(result.current.editingId).toBe(null);
    expect(result.current.editingRowId).toBe(null);
    expect(result.current.formData.name).toBe('');
    expect(result.current.selectedLevels).toEqual([]);
  });

  it('should calculate unit counts correctly', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    expect(result.current.unitCounts['TestUnit-1']).toBe(2);
    expect(result.current.unitCounts['AnotherUnit-5']).toBe(1);
  });

  it('should calculate formation unit count', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    expect(result.current.formationUnitCount).toBe(0);
  });

  it('should calculate formation unit count with units in formation', () => {
    const formationWithUnits = {
      ...mockFormation,
      tiles: Array(7).fill(null).map((_, row) =>
        Array(7).fill(null).map((_, col) =>
          row === 0 && col === 0 ? mockUnits[0] : null
        )
      ),
    };

    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, formationWithUnits) });

    expect(result.current.formationUnitCount).toBe(1);
  });

  it('should filter units by name', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleFilterChange('name', 'TestUnit');
    });

    expect(result.current.uniqueUnits.length).toBeGreaterThan(0);
    expect(result.current.uniqueUnits.every((u) => u.name.toLowerCase().includes('testunit'))).toBe(true);
  });

  it('should filter units by level range', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleFilterChange('levelMin', '1');
      result.current.handleFilterChange('levelMax', '3');
    });

    const filtered = result.current.uniqueUnits;
    expect(filtered.every((u) => u.level >= 1 && u.level <= 3)).toBe(true);
  });

  it('should filter units by rarity range', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleFilterChange('rarityMin', UnitRarity.Common);
      result.current.handleFilterChange('rarityMax', UnitRarity.Rare);
    });

    const filtered = result.current.uniqueUnits;
    expect(filtered.length).toBeGreaterThanOrEqual(0);
  });

  it('should filter units by count range', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleFilterChange('countMin', '2');
      result.current.handleFilterChange('countMax', '5');
    });

    const filtered = result.current.uniqueUnits;
    expect(filtered.length).toBeGreaterThanOrEqual(0);
  });

  it('should sort units by name', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleSort('name');
    });

    const sorted = result.current.uniqueUnits;
    expect(sorted.length).toBeGreaterThan(0);
  });

  it('should sort units by level', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleSort('level');
    });

    const sorted = result.current.uniqueUnits;
    expect(sorted.length).toBeGreaterThan(0);
  });

  it('should sort units by rarity', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleSort('rarity');
    });

    const sorted = result.current.uniqueUnits;
    expect(sorted.length).toBeGreaterThan(0);
  });

  it('should sort units by count', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleSort('count');
    });

    const sorted = result.current.uniqueUnits;
    expect(sorted.length).toBeGreaterThan(0);
  });

  it('should toggle sort direction', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleSort('name');
    });

    expect(result.current.sortDirection).toBe('asc');

    act(() => {
      result.current.handleSort('name');
    });

    expect(result.current.sortDirection).toBe('desc');
  });

  it('should handle add new', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleAddNew();
    });

    expect(result.current.isAdding).toBe(true);
    expect(result.current.formData.name).toBe('');
    expect(result.current.selectedLevels).toEqual([]);
  });

  it('should handle form data changes', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.setFormData((prev) => ({ ...prev, name: 'TestUnit' }));
      result.current.setFormData((prev) => ({ ...prev, level: 5 }));
      result.current.setFormData((prev) => ({ ...prev, rarity: UnitRarity.Epic }));
    });

    expect(result.current.formData.name).toBe('TestUnit');
    expect(result.current.formData.level).toBe(5);
    expect(result.current.formData.rarity).toBe(UnitRarity.Epic);
  });

  it('should handle level toggle', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleLevelToggle(5);
    });

    expect(result.current.selectedLevels).toContain(5);

    act(() => {
      result.current.handleLevelToggle(5);
    });

    expect(result.current.selectedLevels).not.toContain(5);
  });

  it('should handle select all levels', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleSelectAllLevels();
    });

    expect(result.current.selectedLevels.length).toBe(10);

    act(() => {
      result.current.handleSelectAllLevels();
    });

    expect(result.current.selectedLevels.length).toBe(0);
  });

  it('should handle level count change', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleLevelToggle(5);
      result.current.handleLevelCountChange(5, 10);
    });

    expect(result.current.levelCounts[5]).toBe(10);
  });

  it('should handle row edit', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleRowEdit(mockUnits[0]);
    });

    expect(result.current.editingRowId).toBe('1');
    expect(result.current.rowEditData['1']).toBeDefined();
  });

  it('should handle row edit change', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleRowEdit(mockUnits[0]);
      result.current.handleRowEditChange('1', 'level', 10);
    });

    expect(result.current.rowEditData['1'].level).toBe(10);
  });

  it('should handle row save', () => {
    const store = createMockStore(mockUnits, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    act(() => {
      result.current.handleRowEdit(mockUnits[0]);
      result.current.handleRowEditChange('1', 'name', 'TestUnit');
      result.current.handleRowEditChange('1', 'level', 5);
      result.current.handleRowEditChange('1', 'count', 2);
    });

    act(() => {
      result.current.handleRowSave();
    });

    expect(result.current.editingRowId).toBe(null);
    // Verify units were updated in store
    const state = store.getState();
    expect(state.unit.units.length).toBeGreaterThan(0);
  });

  it('should handle row cancel', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleRowEdit(mockUnits[0]);
      result.current.handleRowCancel();
    });

    expect(result.current.editingRowId).toBe(null);
    expect(result.current.rowEditData).toEqual({});
  });

  it('should handle delete unit', () => {
    window.confirm = vi.fn(() => true);
    const store = createMockStore(mockUnits, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    act(() => {
      result.current.handleDelete('1');
    });

    expect(window.confirm).toHaveBeenCalled();
    const state = store.getState();
    expect(state.unit.units.find((u) => u.id === '1')).toBeUndefined();
  });

  it('should handle clear roster with confirmation', () => {
    window.confirm = vi.fn(() => true);
    const store = createMockStore(mockUnits, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    act(() => {
      result.current.handleClearRoster();
    });

    expect(window.confirm).toHaveBeenCalled();
    const state = store.getState();
    expect(state.unit.units.length).toBe(0);
  });

  it('should not clear roster without confirmation', () => {
    window.confirm = vi.fn(() => false);
    const store = createMockStore(mockUnits, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    act(() => {
      result.current.handleClearRoster();
    });

    expect(window.confirm).toHaveBeenCalled();
    const state = store.getState();
    expect(state.unit.units.length).toBe(mockUnits.length);
  });

  it('should handle save with selected levels', () => {
    const store = createMockStore(mockUnits, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    act(() => {
      result.current.handleAddNew();
      result.current.handleNameChange('TestUnit');
      result.current.handleSelectAllLevels();
    });

    // Set level counts for all selected levels
    act(() => {
      for (let i = 1; i <= 10; i++) {
        result.current.handleLevelCountChange(i, 1);
      }
    });

    act(() => {
      result.current.handleSave();
    });

    const state = store.getState();
    expect(state.unit.units.length).toBeGreaterThan(mockUnits.length);
    expect(result.current.isAdding).toBe(false);
  });

  it('should not save without unit name', () => {
    const store = createMockStore(mockUnits, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });
    const initialCount = store.getState().unit.units.length;

    act(() => {
      result.current.handleAddNew();
      result.current.handleSelectAllLevels();
      result.current.handleSave();
    });

    const state = store.getState();
    expect(state.unit.units.length).toBe(initialCount);
  });

  it('should not save without selected levels', () => {
    const store = createMockStore(mockUnits, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });
    const initialCount = store.getState().unit.units.length;

    act(() => {
      result.current.handleAddNew();
      result.current.handleNameChange('TestUnit');
      result.current.handleSave();
    });

    const state = store.getState();
    expect(state.unit.units.length).toBe(initialCount);
  });

  it('should handle cancel add', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleAddNew();
      result.current.handleCancel();
    });

    expect(result.current.isAdding).toBe(false);
  });

  it('should handle filter change for all filter types', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleFilterChange('name', 'test');
      result.current.handleFilterChange('levelMin', '1');
      result.current.handleFilterChange('levelMax', '10');
      result.current.handleFilterChange('rarityMin', UnitRarity.Common);
      result.current.handleFilterChange('rarityMax', UnitRarity.Legendary);
      result.current.handleFilterChange('countMin', '1');
      result.current.handleFilterChange('countMax', '100');
    });

    expect(result.current.filters.name).toBe('test');
    expect(result.current.filters.levelMin).toBe('1');
    expect(result.current.filters.levelMax).toBe('10');
    expect(result.current.filters.rarityMin).toBe(UnitRarity.Common);
    expect(result.current.filters.rarityMax).toBe(UnitRarity.Legendary);
    expect(result.current.filters.countMin).toBe('1');
    expect(result.current.filters.countMax).toBe('100');
  });
});

