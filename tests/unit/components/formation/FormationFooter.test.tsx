import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormationFooter from '../../../../src/components/formation/FormationFooter';
import { useAppDispatch, useAppSelector } from '../../../../src/store/hooks';
import { removeUnit } from '../../../../src/store/reducers/formationSlice';

vi.mock('../../../../src/store/hooks', () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
}));

vi.mock('../../../../src/store/reducers/formationSlice', () => ({
  removeUnit: vi.fn((payload) => ({ type: 'formation/removeUnit', payload })),
}));

describe('FormationFooter', () => {
  const mockDispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppDispatch as ReturnType<typeof vi.fn>).mockReturnValue(mockDispatch);
  });

  it('should render withdraw all button', () => {
    (useAppSelector as ReturnType<typeof vi.fn>).mockReturnValue(null);

    render(<FormationFooter />);

    const button = screen.getByRole('button', { name: /withdraw all/i });
    expect(button).toBeInTheDocument();
  });

  it('should not dispatch when currentFormation is null', async () => {
    (useAppSelector as ReturnType<typeof vi.fn>).mockReturnValue(null);

    render(<FormationFooter />);

    const button = screen.getByRole('button', { name: /withdraw all/i });
    await userEvent.click(button);

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('should dispatch removeUnit for all tiles when button is clicked', async () => {
    const mockFormation = {
      name: 'Test',
      power: 0,
      tiles: [
        [{ id: '1', name: 'Unit1', level: 1, rarity: 'common' }, null, null, null, null, null, null],
        [null, { id: '2', name: 'Unit2', level: 2, rarity: 'rare' }, null, null, null, null, null],
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
      ],
    };

    (useAppSelector as ReturnType<typeof vi.fn>).mockReturnValue(mockFormation);

    render(<FormationFooter />);

    const button = screen.getByRole('button', { name: /withdraw all/i });
    await userEvent.click(button);

    // Should dispatch removeUnit for each tile that has a unit (2 units)
    expect(mockDispatch).toHaveBeenCalledTimes(2);
    expect(mockDispatch).toHaveBeenCalledWith(removeUnit({ row: 0, col: 0 }));
    expect(mockDispatch).toHaveBeenCalledWith(removeUnit({ row: 1, col: 1 }));
  });

  it('should dispatch removeUnit for all 49 tiles when formation is full', async () => {
    const fullFormation = {
      name: 'Full',
      power: 0,
      tiles: Array(7).fill(null).map(() => 
        Array(7).fill({ id: '1', name: 'Unit', level: 1, rarity: 'common' })
      ),
    };

    (useAppSelector as ReturnType<typeof vi.fn>).mockReturnValue(fullFormation);

    render(<FormationFooter />);

    const button = screen.getByRole('button', { name: /withdraw all/i });
    await userEvent.click(button);

    // Should dispatch removeUnit 49 times (7x7 grid)
    expect(mockDispatch).toHaveBeenCalledTimes(49);
    
    // Check a few specific calls
    expect(mockDispatch).toHaveBeenCalledWith(removeUnit({ row: 0, col: 0 }));
    expect(mockDispatch).toHaveBeenCalledWith(removeUnit({ row: 6, col: 6 }));
    expect(mockDispatch).toHaveBeenCalledWith(removeUnit({ row: 3, col: 3 }));
  });

  it('should have correct aria-label', () => {
    (useAppSelector as ReturnType<typeof vi.fn>).mockReturnValue(null);

    render(<FormationFooter />);

    const button = screen.getByRole('button', { name: /withdraw all units from formation/i });
    expect(button).toBeInTheDocument();
  });
});

