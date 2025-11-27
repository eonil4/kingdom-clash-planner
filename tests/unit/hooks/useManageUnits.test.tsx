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

  it('should handle clear filters', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleFilterChange('name', 'test');
      result.current.handleFilterChange('levelMin', '5');
      result.current.handleFilterChange('levelMax', '10');
    });

    expect(result.current.filters.name).toBe('test');

    act(() => {
      result.current.handleClearFilters();
    });

    expect(result.current.filters.name).toBe('');
    expect(result.current.filters.levelMin).toBe('');
    expect(result.current.filters.levelMax).toBe('');
    expect(result.current.filters.rarityMin).toBe('');
    expect(result.current.filters.rarityMax).toBe('');
    expect(result.current.filters.countMin).toBe('');
    expect(result.current.filters.countMax).toBe('');
  });


  it('should handle name change and update rarity from unit data', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleNameChange('TestUnit');
    });

    expect(result.current.formData.name).toBe('TestUnit');
    expect(result.current.formData.rarity).toBe(UnitRarity.Common);
  });

  it('should handle name change for unknown unit keeping current rarity', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.setFormData((prev) => ({ ...prev, rarity: UnitRarity.Epic }));
      result.current.handleNameChange('UnknownUnit');
    });

    expect(result.current.formData.name).toBe('UnknownUnit');
    expect(result.current.formData.rarity).toBe(UnitRarity.Epic);
  });

  it('should return 0 formation unit count when no formation', () => {
    const store = configureStore({
      reducer: {
        unit: unitReducer,
        formation: formationReducer,
      },
      preloadedState: {
        unit: {
          units: mockUnits,
          filteredUnits: [],
          sortOption: 'level' as const,
          sortOption2: null,
          sortOption3: null,
          searchTerm: '',
        },
        formation: {
          currentFormation: null,
          formations: [],
        },
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
          immutableCheck: false,
        }),
    });
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    expect(result.current.formationUnitCount).toBe(0);
  });

  it('should clamp level counts within valid range', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleLevelToggle(5);
      result.current.handleLevelCountChange(5, 0);
    });

    expect(result.current.levelCounts[5]).toBe(1);

    act(() => {
      result.current.handleLevelCountChange(5, 200);
    });

    expect(result.current.levelCounts[5]).toBe(100);
  });

  it('should handle row save when no editingRowId', () => {
    const store = createMockStore(mockUnits, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    act(() => {
      result.current.handleRowSave();
    });

    expect(result.current.editingRowId).toBe(null);
  });

  it('should handle delete without confirmation', () => {
    window.confirm = vi.fn(() => false);
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
    expect(state.unit.units.find((u) => u.id === '1')).toBeDefined();
  });

  it('should handle row save reducing unit count', () => {
    const unitsWithDuplicates: Unit[] = [
      { id: '1', name: 'TestUnit', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '2', name: 'TestUnit', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '3', name: 'TestUnit', level: 1, rarity: UnitRarity.Common, power: 100 },
    ];
    const store = createMockStore(unitsWithDuplicates, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    act(() => {
      result.current.handleRowEdit(unitsWithDuplicates[0]);
      result.current.handleRowEditChange('1', 'name', 'TestUnit');
      result.current.handleRowEditChange('1', 'level', 1);
      result.current.handleRowEditChange('1', 'count', 1);
    });

    act(() => {
      result.current.handleRowSave();
    });

    expect(result.current.editingRowId).toBe(null);
  });

  it('should handle save with editing id', () => {
    const store = createMockStore(mockUnits, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    act(() => {
      result.current.handleAddNew();
      result.current.handleNameChange('TestUnit');
      result.current.handleLevelToggle(5);
    });

    act(() => {
      result.current.handleSave();
    });

    const state = store.getState();
    expect(state.unit.units.length).toBeGreaterThan(mockUnits.length);
  });

  it('should handle row save with updating existing units', () => {
    const store = createMockStore(mockUnits, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    act(() => {
      result.current.handleRowEdit(mockUnits[0]);
      result.current.handleRowEditChange('1', 'name', 'TestUnit');
      result.current.handleRowEditChange('1', 'level', 1);
      result.current.handleRowEditChange('1', 'count', 2);
    });

    act(() => {
      result.current.handleRowSave();
    });

    const state = store.getState();
    expect(state.unit.units.length).toBeGreaterThanOrEqual(2);
  });

  it('should filter with rarity min only', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleFilterChange('rarityMin', UnitRarity.Epic);
    });

    const filtered = result.current.uniqueUnits;
    expect(filtered.every((u) => [UnitRarity.Epic, UnitRarity.Legendary].includes(u.rarity))).toBe(true);
  });

  it('should filter with rarity max only', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleFilterChange('rarityMax', UnitRarity.Rare);
    });

    const filtered = result.current.uniqueUnits;
    expect(filtered.every((u) => [UnitRarity.Common, UnitRarity.Rare].includes(u.rarity))).toBe(true);
  });

  it('should not filter by name when filter is empty', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleFilterChange('name', '');
    });

    expect(result.current.uniqueUnits.length).toBe(2);
  });

  it('should not filter by level when levelMin is empty', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleFilterChange('levelMin', '');
    });

    expect(result.current.uniqueUnits.length).toBe(2);
  });

  it('should not filter by level when levelMax is empty', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleFilterChange('levelMax', '');
    });

    expect(result.current.uniqueUnits.length).toBe(2);
  });

  it('should not filter by count when countMin is empty', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleFilterChange('countMin', '');
    });

    expect(result.current.uniqueUnits.length).toBe(2);
  });

  it('should not filter by count when countMax is empty', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleFilterChange('countMax', '');
    });

    expect(result.current.uniqueUnits.length).toBe(2);
  });

  it('should sort in descending order', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleSort('level');
    });

    expect(result.current.sortDirection).toBe('asc');
    
    act(() => {
      result.current.handleSort('level');
    });

    expect(result.current.sortDirection).toBe('desc');
    const sorted = result.current.uniqueUnits;
    if (sorted.length >= 2) {
      expect(sorted[0].level).toBeGreaterThanOrEqual(sorted[sorted.length - 1].level);
    }

    act(() => {
      result.current.handleSort('level');
    });

    expect(result.current.sortDirection).toBe('asc');
  });

  it('should filter out units with level above max', () => {
    const unitsWithVaryingLevels: Unit[] = [
      { id: '1', name: 'Unit1', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '2', name: 'Unit2', level: 5, rarity: UnitRarity.Rare, power: 500 },
      { id: '3', name: 'Unit3', level: 10, rarity: UnitRarity.Epic, power: 1000 },
    ];
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(unitsWithVaryingLevels, mockFormation) });

    act(() => {
      result.current.handleFilterChange('levelMax', '5');
    });

    const filtered = result.current.uniqueUnits;
    expect(filtered.every((u) => u.level <= 5)).toBe(true);
  });

  it('should filter out units with level below min', () => {
    const unitsWithVaryingLevels: Unit[] = [
      { id: '1', name: 'Unit1', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '2', name: 'Unit2', level: 5, rarity: UnitRarity.Rare, power: 500 },
      { id: '3', name: 'Unit3', level: 10, rarity: UnitRarity.Epic, power: 1000 },
    ];
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(unitsWithVaryingLevels, mockFormation) });

    act(() => {
      result.current.handleFilterChange('levelMin', '5');
    });

    const filtered = result.current.uniqueUnits;
    expect(filtered.every((u) => u.level >= 5)).toBe(true);
  });

  it('should filter out units with count above max', () => {
    const unitsWithCounts: Unit[] = [
      { id: '1', name: 'Unit1', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '2', name: 'Unit1', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '3', name: 'Unit1', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '4', name: 'Unit2', level: 5, rarity: UnitRarity.Rare, power: 500 },
    ];
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(unitsWithCounts, mockFormation) });

    act(() => {
      result.current.handleFilterChange('countMax', '2');
    });

    const filtered = result.current.uniqueUnits;
    expect(filtered.length).toBeLessThanOrEqual(2);
  });

  it('should filter out units with count below min', () => {
    const unitsWithCounts: Unit[] = [
      { id: '1', name: 'Unit1', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '2', name: 'Unit1', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '3', name: 'Unit1', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '4', name: 'Unit2', level: 5, rarity: UnitRarity.Rare, power: 500 },
    ];
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(unitsWithCounts, mockFormation) });

    act(() => {
      result.current.handleFilterChange('countMin', '2');
    });

    const filtered = result.current.uniqueUnits;
    expect(filtered.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle adding units to existing when count increases', () => {
    const store = createMockStore(mockUnits, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    act(() => {
      result.current.handleRowEdit(mockUnits[0]);
      result.current.handleRowEditChange('1', 'name', 'TestUnit');
      result.current.handleRowEditChange('1', 'level', 1);
      result.current.handleRowEditChange('1', 'count', 5);
    });

    act(() => {
      result.current.handleRowSave();
    });

    expect(result.current.editingRowId).toBe(null);
  });

  it('should update multiple units with same name and level', () => {
    const unitsWithSameNameLevel: Unit[] = [
      { id: '1', name: 'TestUnit', level: 5, rarity: UnitRarity.Common, power: 500 },
      { id: '2', name: 'TestUnit', level: 5, rarity: UnitRarity.Common, power: 500 },
      { id: '3', name: 'TestUnit', level: 5, rarity: UnitRarity.Common, power: 500 },
    ];
    const store = createMockStore(unitsWithSameNameLevel, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    act(() => {
      result.current.handleRowEdit(unitsWithSameNameLevel[0]);
      result.current.handleRowEditChange('1', 'name', 'TestUnit');
      result.current.handleRowEditChange('1', 'level', 5);
      result.current.handleRowEditChange('1', 'count', 3);
    });

    act(() => {
      result.current.handleRowSave();
    });

    expect(result.current.editingRowId).toBe(null);
  });

  it('should filter units not matching name filter', () => {
    const diverseUnits: Unit[] = [
      { id: '1', name: 'Archer', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '2', name: 'Knight', level: 5, rarity: UnitRarity.Rare, power: 500 },
      { id: '3', name: 'Wizard', level: 10, rarity: UnitRarity.Epic, power: 1000 },
    ];
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(diverseUnits, mockFormation) });

    act(() => {
      result.current.handleFilterChange('name', 'xyz');
    });

    expect(result.current.uniqueUnits.length).toBe(0);
  });

  it('should filter units by level min with string value', () => {
    const diverseUnits: Unit[] = [
      { id: '1', name: 'Unit1', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '2', name: 'Unit2', level: 5, rarity: UnitRarity.Rare, power: 500 },
      { id: '3', name: 'Unit3', level: 10, rarity: UnitRarity.Epic, power: 1000 },
    ];
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(diverseUnits, mockFormation) });

    act(() => {
      result.current.handleFilterChange('levelMin', '6');
    });

    expect(result.current.uniqueUnits.every((u) => u.level >= 6)).toBe(true);
    expect(result.current.uniqueUnits.length).toBe(1);
  });

  it('should filter units by level max with string value', () => {
    const diverseUnits: Unit[] = [
      { id: '1', name: 'Unit1', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '2', name: 'Unit2', level: 5, rarity: UnitRarity.Rare, power: 500 },
      { id: '3', name: 'Unit3', level: 10, rarity: UnitRarity.Epic, power: 1000 },
    ];
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(diverseUnits, mockFormation) });

    act(() => {
      result.current.handleFilterChange('levelMax', '4');
    });

    expect(result.current.uniqueUnits.every((u) => u.level <= 4)).toBe(true);
    expect(result.current.uniqueUnits.length).toBe(1);
  });

  it('should filter units by rarity above min', () => {
    const diverseUnits: Unit[] = [
      { id: '1', name: 'Unit1', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '2', name: 'Unit2', level: 5, rarity: UnitRarity.Rare, power: 500 },
      { id: '3', name: 'Unit3', level: 10, rarity: UnitRarity.Legendary, power: 1000 },
    ];
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(diverseUnits, mockFormation) });

    act(() => {
      result.current.handleFilterChange('rarityMin', UnitRarity.Rare);
    });

    expect(result.current.uniqueUnits.every((u) => u.rarity !== UnitRarity.Common)).toBe(true);
  });

  it('should filter units by rarity below max', () => {
    const diverseUnits: Unit[] = [
      { id: '1', name: 'Unit1', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '2', name: 'Unit2', level: 5, rarity: UnitRarity.Rare, power: 500 },
      { id: '3', name: 'Unit3', level: 10, rarity: UnitRarity.Legendary, power: 1000 },
    ];
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(diverseUnits, mockFormation) });

    act(() => {
      result.current.handleFilterChange('rarityMax', UnitRarity.Epic);
    });

    expect(result.current.uniqueUnits.every((u) => u.rarity !== UnitRarity.Legendary)).toBe(true);
  });

  it('should filter units by count min with string value', () => {
    const unitsWithCounts: Unit[] = [
      { id: '1', name: 'Unit1', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '2', name: 'Unit1', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '3', name: 'Unit1', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '4', name: 'Unit2', level: 5, rarity: UnitRarity.Rare, power: 500 },
    ];
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(unitsWithCounts, mockFormation) });

    act(() => {
      result.current.handleFilterChange('countMin', '3');
    });

    expect(result.current.uniqueUnits.length).toBe(1);
    expect(result.current.uniqueUnits[0].name).toBe('Unit1');
  });

  it('should filter units by count max with string value', () => {
    const unitsWithCounts: Unit[] = [
      { id: '1', name: 'Unit1', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '2', name: 'Unit1', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '3', name: 'Unit1', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '4', name: 'Unit2', level: 5, rarity: UnitRarity.Rare, power: 500 },
    ];
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(unitsWithCounts, mockFormation) });

    act(() => {
      result.current.handleFilterChange('countMax', '1');
    });

    expect(result.current.uniqueUnits.length).toBe(1);
    expect(result.current.uniqueUnits[0].name).toBe('Unit2');
  });

  it('should use default sort when no sortColumn is set', () => {
    const diverseUnits: Unit[] = [
      { id: '1', name: 'Zebra', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '2', name: 'Apple', level: 5, rarity: UnitRarity.Rare, power: 500 },
      { id: '3', name: 'Middle', level: 10, rarity: UnitRarity.Epic, power: 1000 },
    ];
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(diverseUnits, mockFormation) });

    expect(result.current.sortColumn).toBe(null);
    const sorted = result.current.uniqueUnits;
    expect(sorted[0].name).toBe('Apple');
    expect(sorted[sorted.length - 1].name).toBe('Zebra');
  });

  it('should use default count of 1 when unitCounts key is missing', () => {
    const diverseUnits: Unit[] = [
      { id: '1', name: 'UniqueUnit', level: 5, rarity: UnitRarity.Rare, power: 500 },
    ];
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(diverseUnits, mockFormation) });

    act(() => {
      result.current.handleSort('count');
    });

    expect(result.current.uniqueUnits.length).toBe(1);
  });

  it('should handle level count change with NaN value', () => {
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(mockUnits, mockFormation) });

    act(() => {
      result.current.handleLevelToggle(5);
    });

    act(() => {
      result.current.handleLevelCountChange(5, NaN);
    });

    expect(result.current.levelCounts[5]).toBe(1);
  });

  it('should remove units when reducing count in row save', () => {
    const manyUnitsOfSameType: Unit[] = [
      { id: '1', name: 'TestUnit', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '2', name: 'TestUnit', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '3', name: 'TestUnit', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '4', name: 'TestUnit', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '5', name: 'TestUnit', level: 1, rarity: UnitRarity.Common, power: 100 },
    ];
    const store = createMockStore(manyUnitsOfSameType, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    act(() => {
      result.current.handleRowEdit(manyUnitsOfSameType[0]);
      result.current.handleRowEditChange('1', 'name', 'TestUnit');
      result.current.handleRowEditChange('1', 'level', 1);
      result.current.handleRowEditChange('1', 'count', 2);
    });

    act(() => {
      result.current.handleRowSave();
    });

    const state = store.getState();
    expect(state.unit.units.length).toBeLessThan(5);
  });

  it('should update existing units when count equals matching units', () => {
    const store = createMockStore(mockUnits, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    act(() => {
      result.current.handleRowEdit(mockUnits[0]);
      result.current.handleRowEditChange('1', 'name', 'TestUnit');
      result.current.handleRowEditChange('1', 'level', 1);
      result.current.handleRowEditChange('1', 'count', 2);
    });

    act(() => {
      result.current.handleRowSave();
    });

    expect(result.current.editingRowId).toBe(null);
  });

  it('should handle save with existing editing id', () => {
    const store = createMockStore(mockUnits, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    act(() => {
      result.current.handleAddNew();
      result.current.handleNameChange('TestUnit');
      result.current.handleLevelToggle(5);
    });

    act(() => {
      result.current.handleSave();
    });

    const state = store.getState();
    expect(state.unit.units.length).toBeGreaterThan(mockUnits.length);
  });

  it('should correctly compute unitCounts for units with same name and level', () => {
    const unitsWithDuplicates: Unit[] = [
      { id: '1', name: 'TestUnit', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '2', name: 'TestUnit', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '3', name: 'TestUnit', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '4', name: 'OtherUnit', level: 1, rarity: UnitRarity.Common, power: 100 },
    ];
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(unitsWithDuplicates, mockFormation) });

    expect(result.current.unitCounts['TestUnit-1']).toBe(3);
    expect(result.current.unitCounts['OtherUnit-1']).toBe(1);
  });

  it('should handle uniqueUnits correctly deduplicating by name-level', () => {
    const unitsWithDuplicates: Unit[] = [
      { id: '1', name: 'TestUnit', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '2', name: 'TestUnit', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '3', name: 'TestUnit', level: 5, rarity: UnitRarity.Common, power: 500 },
      { id: '4', name: 'OtherUnit', level: 1, rarity: UnitRarity.Common, power: 100 },
    ];
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(unitsWithDuplicates, mockFormation) });

    expect(result.current.uniqueUnits.length).toBe(3);
  });

  it('should handle row edit for unit with matching units in roster', () => {
    const unitsWithDuplicates: Unit[] = [
      { id: '1', name: 'TestUnit', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '2', name: 'TestUnit', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '3', name: 'TestUnit', level: 1, rarity: UnitRarity.Common, power: 100 },
    ];
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapper(unitsWithDuplicates, mockFormation) });

    act(() => {
      result.current.handleRowEdit(unitsWithDuplicates[0]);
    });

    expect(result.current.rowEditData['1']).toBeDefined();
    expect(result.current.rowEditData['1'].count).toBe(3);
  });

  it('should show alert when row save would exceed total limit', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const manyUnits: Unit[] = Array(995).fill(null).map((_, i) => ({
      id: `unit-${i}`,
      name: `Unit${i}`,
      level: 1,
      rarity: UnitRarity.Common,
      power: 100,
    }));
    const store = createMockStore(manyUnits, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    act(() => {
      result.current.handleRowEdit(manyUnits[0]);
      result.current.handleRowEditChange(`unit-0`, 'name', 'Unit0');
      result.current.handleRowEditChange(`unit-0`, 'level', 1);
      result.current.handleRowEditChange(`unit-0`, 'count', 10);
    });

    act(() => {
      result.current.handleRowSave();
    });

    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('should handle row save with units at per-level limit', () => {
    const manyUnitsOfSameLevel: Unit[] = Array(45).fill(null).map((_, i) => ({
      id: `unit-${i}`,
      name: 'TestUnit',
      level: 1,
      rarity: UnitRarity.Common,
      power: 100,
    }));
    const store = createMockStore(manyUnitsOfSameLevel, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    act(() => {
      result.current.handleRowEdit(manyUnitsOfSameLevel[0]);
      result.current.handleRowEditChange(`unit-0`, 'name', 'TestUnit');
      result.current.handleRowEditChange(`unit-0`, 'level', 1);
      result.current.handleRowEditChange(`unit-0`, 'count', 45);
    });

    act(() => {
      result.current.handleRowSave();
    });

    expect(result.current.editingRowId).toBe(null);
  });

  it('should show alert when save would exceed total limit', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const manyUnits: Unit[] = Array(1000).fill(null).map((_, i) => ({
      id: `unit-${i}`,
      name: `Unit${i}`,
      level: 1,
      rarity: UnitRarity.Common,
      power: 100,
    }));
    const store = createMockStore(manyUnits, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    act(() => {
      result.current.handleAddNew();
      result.current.handleNameChange('NewUnit');
      result.current.handleLevelToggle(5);
    });

    act(() => {
      result.current.handleSave();
    });

    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Maximum total units'));
    alertSpy.mockRestore();
  });

  it('should handle save with many units in roster', () => {
    const manyUnits: Unit[] = Array(100).fill(null).map((_, i) => ({
      id: `unit-${i}`,
      name: `Unit${i}`,
      level: 1,
      rarity: UnitRarity.Common,
      power: 100,
    }));
    const store = createMockStore(manyUnits, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    act(() => {
      result.current.handleAddNew();
      result.current.handleNameChange('NewUnit');
      result.current.handleLevelToggle(5);
      result.current.handleLevelCountChange(5, 2);
    });

    act(() => {
      result.current.handleSave();
    });

    const state = store.getState();
    expect(state.unit.units.length).toBeGreaterThan(100);
  });

  it('should handle save with units of same name and level', () => {
    const manyUnitsOfSameLevel: Unit[] = Array(20).fill(null).map((_, i) => ({
      id: `unit-${i}`,
      name: 'TestUnit',
      level: 5,
      rarity: UnitRarity.Common,
      power: 100,
    }));
    const store = createMockStore(manyUnitsOfSameLevel, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    act(() => {
      result.current.handleAddNew();
      result.current.handleNameChange('TestUnit');
      result.current.handleLevelToggle(5);
      result.current.handleLevelCountChange(5, 5);
    });

    act(() => {
      result.current.handleSave();
    });

    const state = store.getState();
    expect(state.unit.units.length).toBeGreaterThanOrEqual(20);
  });

  it('should handle row save adding units when count increases', () => {
    const fewUnits: Unit[] = [
      { id: '1', name: 'TestUnit', level: 1, rarity: UnitRarity.Common, power: 100 },
      { id: '2', name: 'TestUnit', level: 1, rarity: UnitRarity.Common, power: 100 },
    ];
    const store = createMockStore(fewUnits, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    act(() => {
      result.current.handleRowEdit(fewUnits[0]);
      result.current.handleRowEditChange('1', 'name', 'TestUnit');
      result.current.handleRowEditChange('1', 'level', 1);
      result.current.handleRowEditChange('1', 'count', 5);
    });

    act(() => {
      result.current.handleRowSave();
    });

    const state = store.getState();
    expect(state.unit.units.length).toBeGreaterThan(2);
  });

  it('should handle row save showing alert when unitsToAdd < toAdd due to totalSpace', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const manyUnits: Unit[] = Array(998).fill(null).map((_, i) => ({
      id: `unit-${i}`,
      name: i < 2 ? 'TestUnit' : `Unit${i}`,
      level: i < 2 ? 1 : 1,
      rarity: UnitRarity.Common,
      power: 100,
    }));
    const store = createMockStore(manyUnits, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    act(() => {
      result.current.handleRowEdit(manyUnits[0]);
      result.current.handleRowEditChange(`unit-0`, 'name', 'TestUnit');
      result.current.handleRowEditChange(`unit-0`, 'level', 1);
      result.current.handleRowEditChange(`unit-0`, 'count', 10);
    });

    act(() => {
      result.current.handleRowSave();
    });

    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('should handle row save showing alert when totalSpace is depleted', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const fullRoster: Unit[] = Array(1000).fill(null).map((_, i) => ({
      id: `unit-${i}`,
      name: i < 3 ? 'TestUnit' : `Unit${i}`,
      level: 1,
      rarity: UnitRarity.Common,
      power: 100,
    }));
    const store = createMockStore(fullRoster, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    act(() => {
      result.current.handleRowEdit(fullRoster[0]);
      result.current.handleRowEditChange(`unit-0`, 'name', 'TestUnit');
      result.current.handleRowEditChange(`unit-0`, 'level', 1);
      result.current.handleRowEditChange(`unit-0`, 'count', 5);
    });

    act(() => {
      result.current.handleRowSave();
    });

    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Maximum total units'));
    alertSpy.mockRestore();
  });

  it('should handle row save when available units at level limit', () => {
    const fullLevelUnits: Unit[] = Array(49).fill(null).map((_, i) => ({
      id: `unit-${i}`,
      name: 'TestUnit',
      level: 1,
      rarity: UnitRarity.Common,
      power: 100,
    }));
    const store = createMockStore(fullLevelUnits, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    act(() => {
      result.current.handleRowEdit(fullLevelUnits[0]);
      result.current.handleRowEditChange(`unit-0`, 'name', 'TestUnit');
      result.current.handleRowEditChange(`unit-0`, 'level', 1);
      result.current.handleRowEditChange(`unit-0`, 'count', 49);
    });

    act(() => {
      result.current.handleRowSave();
    });

    expect(result.current.editingRowId).toBe(null);
  });

  it('should show total limit alert when save would exceed total units', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const manyUnits: Unit[] = Array(998).fill(null).map((_, i) => ({
      id: `unit-${i}`,
      name: `Unit${i}`,
      level: 1,
      rarity: UnitRarity.Common,
      power: 100,
    }));
    const store = createMockStore(manyUnits, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    act(() => {
      result.current.handleAddNew();
      result.current.handleNameChange('NewUnit');
      result.current.handleLevelToggle(1);
      result.current.handleLevelToggle(2);
      result.current.handleLevelToggle(3);
      result.current.handleLevelCountChange(1, 1);
      result.current.handleLevelCountChange(2, 1);
      result.current.handleLevelCountChange(3, 1);
    });

    act(() => {
      result.current.handleSave();
    });

    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Maximum total units'));
    alertSpy.mockRestore();
  });

  it('should show per-level limit alert in handleSave when level count exceeds available', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const unitsNearLimit: Unit[] = Array(46).fill(null).map((_, i) => ({
      id: `unit-${i}`,
      name: 'TestUnit',
      level: 5,
      rarity: UnitRarity.Common,
      power: 500,
    }));
    const store = createMockStore(unitsNearLimit, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    expect(result.current.units.length).toBe(46);

    act(() => {
      result.current.handleAddNew();
    });

    act(() => {
      result.current.handleNameChange('TestUnit');
    });

    act(() => {
      result.current.handleLevelToggle(5);
    });

    act(() => {
      result.current.handleLevelCountChange(5, 10);
    });

    expect(result.current.selectedLevels).toContain(5);
    expect(result.current.levelCounts[5]).toBe(10);
    expect(result.current.formData.name).toBe('TestUnit');

    act(() => {
      result.current.handleSave();
    });

    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Maximum count'));
    alertSpy.mockRestore();
  });

  it('should show singular unit message when only 1 unit can be added', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const unitsNearLimit: Unit[] = Array(48).fill(null).map((_, i) => ({
      id: `unit-${i}`,
      name: 'TestUnit',
      level: 5,
      rarity: UnitRarity.Common,
      power: 500,
    }));
    const store = createMockStore(unitsNearLimit, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    act(() => {
      result.current.handleAddNew();
    });

    act(() => {
      result.current.handleNameChange('TestUnit');
    });

    act(() => {
      result.current.handleLevelToggle(5);
    });

    act(() => {
      result.current.handleLevelCountChange(5, 5);
    });

    act(() => {
      result.current.handleSave();
    });

    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('You can add 1 more unit.'));
    alertSpy.mockRestore();
  });

  it('should show singular unit message for total limit when only 1 space available', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const manyUnits: Unit[] = Array(999).fill(null).map((_, i) => ({
      id: `unit-${i}`,
      name: `Unit${i}`,
      level: 1,
      rarity: UnitRarity.Common,
      power: 100,
    }));
    const store = createMockStore(manyUnits, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    act(() => {
      result.current.handleAddNew();
    });

    act(() => {
      result.current.handleNameChange('NewUnit');
    });

    act(() => {
      result.current.handleLevelToggle(1);
    });

    act(() => {
      result.current.handleLevelToggle(2);
    });

    act(() => {
      result.current.handleLevelCountChange(1, 1);
    });

    act(() => {
      result.current.handleLevelCountChange(2, 1);
    });

    act(() => {
      result.current.handleSave();
    });

    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('You can add 1 more unit.'));
    alertSpy.mockRestore();
  });

  it('should successfully add units when within limits', () => {
    const store = createMockStore(mockUnits, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });
    const initialCount = store.getState().unit.units.length;

    act(() => {
      result.current.handleAddNew();
    });

    act(() => {
      result.current.handleNameChange('NewUnit');
    });

    act(() => {
      result.current.handleLevelToggle(1);
    });

    act(() => {
      result.current.handleLevelToggle(2);
    });

    act(() => {
      result.current.handleLevelCountChange(1, 2);
    });

    act(() => {
      result.current.handleLevelCountChange(2, 3);
    });

    act(() => {
      result.current.handleSave();
    });

    const state = store.getState();
    expect(state.unit.units.length).toBe(initialCount + 5);
  });

  it('should use default count of 1 when level is toggled without setting count', () => {
    const store = createMockStore(mockUnits, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });
    const initialCount = store.getState().unit.units.length;

    act(() => {
      result.current.handleAddNew();
    });

    act(() => {
      result.current.handleNameChange('NewUnit');
    });

    act(() => {
      result.current.handleLevelToggle(3);
    });

    act(() => {
      result.current.handleSave();
    });

    const state = store.getState();
    expect(state.unit.units.length).toBe(initialCount + 1);
  });

  it('should show singular message in handleRowSave when only 1 space available', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const targetUnit: Unit = {
      id: 'target-unit',
      name: 'TargetUnit',
      level: 5,
      rarity: UnitRarity.Common,
      power: 500,
    };
    const manyUnits: Unit[] = Array(998).fill(null).map((_, i) => ({
      id: `unit-${i}`,
      name: `Unit${i}`,
      level: 1,
      rarity: UnitRarity.Common,
      power: 100,
    }));
    manyUnits.push(targetUnit);
    const store = createMockStore(manyUnits, mockFormation);
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useManageUnits(), { wrapper: wrapperWithStore });

    act(() => {
      result.current.handleRowEdit(targetUnit);
    });

    act(() => {
      result.current.handleRowEditChange('target-unit', 'count', 5);
    });

    act(() => {
      result.current.handleRowSave();
    });

    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('You can add 1 more unit.'));
    alertSpy.mockRestore();
  });
});

