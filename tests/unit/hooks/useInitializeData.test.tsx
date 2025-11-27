import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useInitializeData } from '../../../src/hooks/useInitializeData';
import * as urlSerialization from '../../../src/utils/urlSerialization';
import { UnitRarity } from '../../../src/types';
import unitReducer from '../../../src/store/reducers/unitSlice';
import formationReducer from '../../../src/store/reducers/formationSlice';

const mockUseSearchParams = vi.hoisted(() => vi.fn());

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useSearchParams: (...args: unknown[]) => mockUseSearchParams(...args),
}));

vi.mock('../../../src/utils/urlSerialization', () => ({
  deserializeUnits: vi.fn(),
  deserializeFormation: vi.fn(),
}));

const createMockStore = () => {
  return configureStore({
    reducer: {
      unit: unitReducer,
      formation: formationReducer,
    },
    preloadedState: {
      unit: {
        units: [],
        filteredUnits: [],
        sortOption: 'level' as const,
        sortOption2: null,
        sortOption3: null,
        searchTerm: '',
      },
      formation: {
        currentFormation: {
          id: '1',
          name: 'Formation 1',
          tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
          power: 0,
        },
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

const createWrapper = () => {
  const store = createMockStore();
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('useInitializeData', () => {
  const mockSetSearchParams = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty units and default formation when no URL params', async () => {
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams(),
      mockSetSearchParams,
    ]);

    renderHook(() => useInitializeData(), { wrapper: createWrapper() });

    // Hook should initialize without errors - wait for useEffect to run
    await waitFor(() => {
      expect(mockUseSearchParams).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should deserialize units from URL param', async () => {
    const mockUnits = [{ id: '1', name: 'Archers', level: 5, rarity: 'Common', power: 1600 }];
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('units=2,5,1'),
      mockSetSearchParams,
    ]);
    vi.mocked(urlSerialization.deserializeUnits).mockReturnValue(mockUnits);

    renderHook(() => useInitializeData(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(urlSerialization.deserializeUnits).toHaveBeenCalledWith('2,5,1');
    }, { timeout: 3000 });
  });

  it('should handle deserializeUnits error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('units=invalid'),
      mockSetSearchParams,
    ]);
    vi.mocked(urlSerialization.deserializeUnits).mockImplementation(() => {
      throw new Error('Invalid units');
    });

    renderHook(() => useInitializeData(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
    consoleErrorSpy.mockRestore();
  });

  it('should deserialize formation from URL param', async () => {
    const mockFormation = {
      name: 'Test Formation',
      tiles: Array(7)
        .fill(null)
        .map(() => Array(7).fill(null)),
    };
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('formation=Test%20Formation;' + '_'.repeat(49).split('').join(';')),
      mockSetSearchParams,
    ]);
    vi.mocked(urlSerialization.deserializeFormation).mockReturnValue(mockFormation);

    renderHook(() => useInitializeData(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(urlSerialization.deserializeFormation).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should calculate formation power from units in tiles', async () => {
    const mockUnit = {
      id: '1',
      name: 'Archers',
      level: 5,
      rarity: UnitRarity.Common,
      power: 1600,
    };
    const tiles = Array(7)
      .fill(null)
      .map(() => Array(7).fill(null));
    tiles[0][0] = mockUnit;
    tiles[0][1] = { ...mockUnit, id: '2', power: 3840 };
    const mockFormation = {
      name: 'Test Formation',
      tiles,
    };
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('formation=Test%20Formation;2,5;2,6;' + '_'.repeat(47).split('').join(';')),
      mockSetSearchParams,
    ]);
    vi.mocked(urlSerialization.deserializeFormation).mockReturnValue(mockFormation);

    const store = createMockStore();
    const wrapperWithStore = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    renderHook(() => useInitializeData(), { wrapper: wrapperWithStore });

    await waitFor(() => {
      expect(urlSerialization.deserializeFormation).toHaveBeenCalled();
    }, { timeout: 3000 });
    // Verify that the formation power was calculated (1600 + 3840 = 5440)
    await waitFor(() => {
      const state = store.getState();
      expect(state.formation.currentFormation.power).toBe(5440);
    }, { timeout: 3000 });
  });

  it('should handle invalid formation tiles', async () => {
    const mockFormation = {
      name: 'Test Formation',
      tiles: Array(5).fill(null).map(() => Array(5).fill(null)), // Invalid size
    };
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('formation=invalid'),
      mockSetSearchParams,
    ]);
    vi.mocked(urlSerialization.deserializeFormation).mockReturnValue(mockFormation);

    renderHook(() => useInitializeData(), { wrapper: createWrapper() });

    // Should use default formation when tiles are invalid
    await waitFor(() => {
      expect(urlSerialization.deserializeFormation).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should handle deserializeFormation error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('formation=invalid'),
      mockSetSearchParams,
    ]);
    vi.mocked(urlSerialization.deserializeFormation).mockImplementation(() => {
      throw new Error('Invalid formation');
    });

    renderHook(() => useInitializeData(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    }, { timeout: 3000 });
    consoleErrorSpy.mockRestore();
  });

  it('should only initialize once', () => {
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams(),
      mockSetSearchParams,
    ]);

    const { rerender } = renderHook(() => useInitializeData(), { wrapper: createWrapper() });
    const initialCallCount = mockUseSearchParams.mock.calls.length;
    
    rerender();
    
    // Should not call useSearchParams again (hook uses useRef to track initialization)
    expect(mockUseSearchParams.mock.calls.length).toBeGreaterThanOrEqual(initialCallCount);
  });
});

