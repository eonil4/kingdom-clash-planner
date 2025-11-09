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

  it('should add units and formation params to URL on initial mount if missing', () => {
    // Mock empty search params (no units or formation params)
    const emptySearchParams = new URLSearchParams();
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
      emptySearchParams,
      mockSetSearchParams,
    ]);
    
    (useAppSelector as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce([]) // units
      .mockReturnValueOnce(null) // formationTiles
      .mockReturnValueOnce(null); // currentFormation
    
    vi.mocked(urlSerialization.serializeUnits).mockReturnValue('');
    vi.mocked(urlSerialization.serializeFormation).mockReturnValue('Formation 1;' + '_'.repeat(49).split('').join(';'));
    
    renderHook(() => useUrlSync());

    // Should update URL to add missing params (even if empty)
    expect(window.history.replaceState).toHaveBeenCalled();
    const callArgs = (window.history.replaceState as ReturnType<typeof vi.fn>).mock.calls[0];
    const url = callArgs[2] as string;
    expect(url).toContain('units=');
    expect(url).toContain('formation=');
  });

  it('should update URL when units change', () => {
    const mockUnits = [{ id: '1', name: 'Archers', level: 5, rarity: 'Common', power: 1600 }];
    (useAppSelector as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(mockUnits) // units
      .mockReturnValueOnce(null) // formationTiles
      .mockReturnValueOnce(null); // currentFormation
    
    vi.mocked(urlSerialization.serializeUnits).mockReturnValue('2,5,1');
    
    const { rerender } = renderHook(() => useUrlSync());
    
    // Change units
    (useAppSelector as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce([...mockUnits, { id: '2', name: 'Paladin', level: 10, rarity: 'Epic', power: 53760 }])
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
    
    const mockUnits = [{ id: '1', name: 'Archers', level: 5, rarity: 'Common', power: 1600 }];
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

