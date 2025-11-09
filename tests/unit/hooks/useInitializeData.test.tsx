import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useInitializeData } from '../../../src/hooks/useInitializeData';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../../../src/store/hooks';
import * as urlSerialization from '../../../src/utils/urlSerialization';
import { UnitRarity } from '../../../src/types';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useSearchParams: vi.fn(),
}));

vi.mock('../../../src/store/hooks', () => ({
  useAppDispatch: vi.fn(),
}));

vi.mock('../../../src/utils/urlSerialization', () => ({
  deserializeUnits: vi.fn(),
  deserializeFormation: vi.fn(),
}));

describe('useInitializeData', () => {
  const mockDispatch = vi.fn();
  const mockSetSearchParams = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppDispatch as ReturnType<typeof vi.fn>).mockReturnValue(mockDispatch);
  });

  it('should initialize with empty units and default formation when no URL params', () => {
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
      new URLSearchParams(),
      mockSetSearchParams,
    ]);

    renderHook(() => useInitializeData());

    expect(mockDispatch).toHaveBeenCalled();
  });

  it('should deserialize units from URL param', () => {
    const mockUnits = [{ id: '1', name: 'Archers', level: 5, rarity: 'Common', power: 1600 }];
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
      new URLSearchParams('units=2,5,1'),
      mockSetSearchParams,
    ]);
    vi.mocked(urlSerialization.deserializeUnits).mockReturnValue(mockUnits);

    renderHook(() => useInitializeData());

    expect(urlSerialization.deserializeUnits).toHaveBeenCalledWith('2,5,1');
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('should handle deserializeUnits error', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
      new URLSearchParams('units=invalid'),
      mockSetSearchParams,
    ]);
    vi.mocked(urlSerialization.deserializeUnits).mockImplementation(() => {
      throw new Error('Invalid units');
    });

    renderHook(() => useInitializeData());

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should deserialize formation from URL param', () => {
    const mockFormation = {
      name: 'Test Formation',
      tiles: Array(7)
        .fill(null)
        .map(() => Array(7).fill(null)),
    };
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
      new URLSearchParams('formation=Test%20Formation;' + '_'.repeat(49).split('').join(';')),
      mockSetSearchParams,
    ]);
    vi.mocked(urlSerialization.deserializeFormation).mockReturnValue(mockFormation);

    renderHook(() => useInitializeData());

    expect(urlSerialization.deserializeFormation).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('should calculate formation power from units in tiles', () => {
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
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
      new URLSearchParams('formation=Test%20Formation;2,5;2,6;' + '_'.repeat(47).split('').join(';')),
      mockSetSearchParams,
    ]);
    vi.mocked(urlSerialization.deserializeFormation).mockReturnValue(mockFormation);

    renderHook(() => useInitializeData());

    expect(urlSerialization.deserializeFormation).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalled();
    // Verify that the formation power was calculated (1600 + 3840 = 5440)
    const setFormationCall = mockDispatch.mock.calls.find(
      (call) => call[0]?.type === 'formation/setCurrentFormation'
    );
    expect(setFormationCall).toBeDefined();
    if (setFormationCall) {
      expect(setFormationCall[0].payload.power).toBe(5440);
    }
  });

  it('should handle invalid formation tiles', () => {
    const mockFormation = {
      name: 'Test Formation',
      tiles: Array(5).fill(null).map(() => Array(5).fill(null)), // Invalid size
    };
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
      new URLSearchParams('formation=invalid'),
      mockSetSearchParams,
    ]);
    vi.mocked(urlSerialization.deserializeFormation).mockReturnValue(mockFormation);

    renderHook(() => useInitializeData());

    expect(mockDispatch).toHaveBeenCalled();
  });

  it('should handle deserializeFormation error', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
      new URLSearchParams('formation=invalid'),
      mockSetSearchParams,
    ]);
    vi.mocked(urlSerialization.deserializeFormation).mockImplementation(() => {
      throw new Error('Invalid formation');
    });

    renderHook(() => useInitializeData());

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should only initialize once', () => {
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
      new URLSearchParams(),
      mockSetSearchParams,
    ]);

    const { rerender } = renderHook(() => useInitializeData());
    const initialCallCount = mockDispatch.mock.calls.length;
    
    rerender();
    
    // Should not call dispatch again
    expect(mockDispatch.mock.calls.length).toBe(initialCallCount);
  });
});

