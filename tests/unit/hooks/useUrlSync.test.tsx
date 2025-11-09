import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUrlSync } from '../../../src/hooks/useUrlSync';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector } from '../../../src/store/hooks';
import * as urlSerialization from '../../../src/utils/urlSerialization';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useSearchParams: vi.fn(),
}));

vi.mock('../../../src/store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('../../../src/utils/urlSerialization', () => ({
  serializeUnits: vi.fn(),
  serializeFormation: vi.fn(),
}));

describe('useUrlSync', () => {
  const mockSetSearchParams = vi.fn();
  const mockSearchParams = new URLSearchParams();

  beforeEach(() => {
    vi.clearAllMocks();
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
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
    });
    
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/',
        hash: '',
      },
      writable: true,
    });
  });

  it('should not update URL on initial mount', () => {
    (useAppSelector as ReturnType<typeof vi.fn>).mockReturnValue([]);
    
    renderHook(() => useUrlSync());

    expect(window.history.replaceState).not.toHaveBeenCalled();
  });

  it('should update URL when units change', () => {
    const mockUnits = [{ id: '1', name: 'ARCHERS', level: 5, rarity: 'Rare', power: 1920 }];
    (useAppSelector as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(mockUnits) // units
      .mockReturnValueOnce(null) // formationTiles
      .mockReturnValueOnce(null); // currentFormation
    
    vi.mocked(urlSerialization.serializeUnits).mockReturnValue('2,5,1');
    
    const { rerender } = renderHook(() => useUrlSync());
    
    // Change units
    (useAppSelector as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce([...mockUnits, { id: '2', name: 'PALADIN', level: 10, rarity: 'Legendary', power: 61440 }])
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null);
    
    vi.mocked(urlSerialization.serializeUnits).mockReturnValue('2,5,1;27,10,1');
    
    rerender();
    
    expect(window.history.replaceState).toHaveBeenCalled();
  });

  it('should update URL when formation changes', () => {
    const mockFormation = {
      id: '1',
      name: 'Test Formation',
      tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
      power: 0,
    };
    
    (useAppSelector as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce([]) // units
      .mockReturnValueOnce(mockFormation.tiles) // formationTiles
      .mockReturnValueOnce(mockFormation); // currentFormation
    
    vi.mocked(urlSerialization.serializeFormation).mockReturnValue('Test Formation;' + '_'.repeat(49).split('').join(';'));
    
    const { rerender } = renderHook(() => useUrlSync());
    
    // Change formation
    const newFormation = { ...mockFormation, name: 'New Formation' };
    (useAppSelector as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce([])
      .mockReturnValueOnce(newFormation.tiles)
      .mockReturnValueOnce(newFormation);
    
    vi.mocked(urlSerialization.serializeFormation).mockReturnValue('New Formation;' + '_'.repeat(49).split('').join(';'));
    
    rerender();
    
    expect(window.history.replaceState).toHaveBeenCalled();
  });

  it('should preserve other URL params', () => {
    const mockSearchParams = new URLSearchParams('other=value&units=old');
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
      mockSearchParams,
      mockSetSearchParams,
    ]);
    
    const mockUnits = [{ id: '1', name: 'ARCHERS', level: 5, rarity: 'Rare', power: 1920 }];
    (useAppSelector as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce([]) // Initial units
      .mockReturnValueOnce(null) // Initial formationTiles
      .mockReturnValueOnce(null); // Initial currentFormation
    
    vi.mocked(urlSerialization.serializeUnits).mockReturnValue('');
    
    const { rerender } = renderHook(() => useUrlSync());
    
    // Change units to trigger URL update
    (useAppSelector as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(mockUnits) // Changed units
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null);
    
    vi.mocked(urlSerialization.serializeUnits).mockReturnValue('2,5,1');
    
    rerender();
    
    // Should preserve 'other' param
    expect(window.history.replaceState).toHaveBeenCalled();
    const callArgs = (window.history.replaceState as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(callArgs[2]).toContain('other=value');
  });
});

