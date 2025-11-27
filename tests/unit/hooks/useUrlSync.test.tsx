import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useUrlSync } from '../../../src/hooks/useUrlSync';
import * as urlSerialization from '../../../src/utils/urlSerialization';
import unitReducer, { setUnits } from '../../../src/store/reducers/unitSlice';
import formationReducer, { setCurrentFormation } from '../../../src/store/reducers/formationSlice';

const mockUseSearchParams = vi.hoisted(() => vi.fn());

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useSearchParams: (...args: unknown[]) => mockUseSearchParams(...args),
}));

vi.mock('../../../src/utils/urlSerialization', () => ({
  serializeUnits: vi.fn(),
  serializeFormation: vi.fn(),
}));

const createMockStore = (initialState?: {
  units?: Array<{ id: string; name: string; level: number; rarity: string; power: number }>;
  currentFormation?: { id: string; name: string; tiles: (unknown | null)[][]; power: number } | null;
}) => {
  return configureStore({
    reducer: {
      unit: unitReducer,
      formation: formationReducer,
    },
    preloadedState: {
      unit: {
        units: initialState?.units || [],
        filteredUnits: [],
        sortOption: 'level' as const,
        sortOption2: null,
        sortOption3: null,
        searchTerm: '',
      },
      formation: {
        currentFormation: initialState?.currentFormation || null,
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

const wrapper = ({ children }: { children: React.ReactNode }, store: ReturnType<typeof createMockStore>) => {
  return <Provider store={store}>{children}</Provider>;
};

describe('useUrlSync', () => {
  const mockSetSearchParams = vi.fn();
  const mockSearchParams = new URLSearchParams();

  beforeEach(() => {
    vi.clearAllMocks();
    // Re-setup mocks after clearing to ensure they persist
    mockUseSearchParams.mockReturnValue([
      mockSearchParams,
      mockSetSearchParams,
    ]);
    vi.mocked(urlSerialization.serializeUnits).mockReturnValue('');
    vi.mocked(urlSerialization.serializeFormation).mockReturnValue('');
    
    // Mock window.history
    Object.defineProperty(window, 'history', {
      value: {
        replaceState: vi.fn(),
      },
      writable: true,
      configurable: true,
    });
    
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/',
        hash: '',
      },
      writable: true,
      configurable: true,
    });
  });

  it('should add units and formation params to URL on initial mount if missing', async () => {
    // Mock empty search params (no units or formation params)
    const emptySearchParams = new URLSearchParams();
    mockUseSearchParams.mockReturnValue([
      emptySearchParams,
      mockSetSearchParams,
    ]);
    
    vi.mocked(urlSerialization.serializeUnits).mockReturnValue('');
    vi.mocked(urlSerialization.serializeFormation).mockReturnValue('Formation 1;' + '_'.repeat(49).split('').join(';'));
    
    const store = createMockStore();
    renderHook(() => useUrlSync(), {
      wrapper: ({ children }) => wrapper({ children }, store),
    });

    // Should update URL to add missing params (even if empty)
    await waitFor(() => {
      expect(window.history.replaceState).toHaveBeenCalled();
    });
    const callArgs = (window.history.replaceState as ReturnType<typeof vi.fn>).mock.calls[0];
    const url = callArgs[2] as string;
    expect(url).toContain('units=');
    expect(url).toContain('formation=');
  });

  it('should update URL when units change', async () => {
    const mockUnits = [{ id: '1', name: 'Archers', level: 5, rarity: 'Common', power: 1600 }];
    const store = createMockStore({ units: mockUnits });
    
    vi.mocked(urlSerialization.serializeUnits).mockReturnValue('2,5,1');
    
    const { rerender } = renderHook(() => useUrlSync(), {
      wrapper: ({ children }) => wrapper({ children }, store),
    });
    
    // Change units
    store.dispatch(setUnits([...mockUnits, { id: '2', name: 'Paladin', level: 10, rarity: 'Epic', power: 53760 }]));
    
    vi.mocked(urlSerialization.serializeUnits).mockReturnValue('2,5,1;27,10,1');
    
    rerender();
    
    await waitFor(() => {
      expect(window.history.replaceState).toHaveBeenCalled();
    });
  });

  it('should update URL when formation changes', async () => {
    const mockFormation = {
      id: '1',
      name: 'Test Formation',
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
      power: 0,
    };
    
    const store = createMockStore({ currentFormation: mockFormation });
    
    vi.mocked(urlSerialization.serializeFormation).mockReturnValue('Test Formation;' + '_'.repeat(49).split('').join(';'));
    
    const { rerender } = renderHook(() => useUrlSync(), {
      wrapper: ({ children }) => wrapper({ children }, store),
    });
    
    // Change formation
    const newFormation = { ...mockFormation, name: 'New Formation' };
    store.dispatch(setCurrentFormation(newFormation));
    
    vi.mocked(urlSerialization.serializeFormation).mockReturnValue('New Formation;' + '_'.repeat(49).split('').join(';'));
    
    rerender();
    
    await waitFor(() => {
      expect(window.history.replaceState).toHaveBeenCalled();
    });
  });

  it('should preserve other URL params', async () => {
    const mockSearchParams = new URLSearchParams('other=value&units=old');
    mockUseSearchParams.mockReturnValue([
      mockSearchParams,
      mockSetSearchParams,
    ]);
    
    const mockUnits = [{ id: '1', name: 'Archers', level: 5, rarity: 'Common', power: 1600 }];
    const store = createMockStore();
    
    vi.mocked(urlSerialization.serializeUnits).mockReturnValue('');
    
    const { rerender } = renderHook(() => useUrlSync(), {
      wrapper: ({ children }) => wrapper({ children }, store),
    });
    
    // Wait for initial mount to complete
    await waitFor(() => {
      expect(window.history.replaceState).toHaveBeenCalled();
    });
    
    // Clear the mock calls to focus on the update after units change
    vi.clearAllMocks();
    
    // Change units to trigger URL update
    store.dispatch(setUnits(mockUnits));
    
    vi.mocked(urlSerialization.serializeUnits).mockReturnValue('2,5,1');
    
    rerender();
    
    // Should preserve 'other' param in the update call
    await waitFor(() => {
      expect(window.history.replaceState).toHaveBeenCalled();
    });
    const callArgs = (window.history.replaceState as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(callArgs[2]).toContain('other=value');
  });
});

