import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import FormationGrid from '../../../src/components/FormationGrid';
import { UnitRarity } from '../../../src/types';

vi.mock('../../../src/components/FormationTile', () => ({
  default: vi.fn(({ row, col, unit, onRemoveUnit }) => (
    <div
      data-testid={`tile-${row}-${col}`}
      data-unit={unit ? unit.name : 'empty'}
      onClick={() => unit && onRemoveUnit(row, col, unit)}
    >
      {unit ? `${unit.name} (${unit.level})` : 'Empty'}
    </div>
  )),
}));

describe('FormationGrid', () => {
  const mockOnPlaceUnit = vi.fn();
  const mockOnRemoveUnit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render 7x7 grid of tiles', () => {
    const emptyTiles = Array(7).fill(null).map(() => Array(7).fill(null));
    
    render(
      <FormationGrid
        tiles={emptyTiles}
        onPlaceUnit={mockOnPlaceUnit}
        onRemoveUnit={mockOnRemoveUnit}
      />
    );

    // Should have 49 tiles (7x7)
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        expect(screen.getByTestId(`tile-${row}-${col}`)).toBeInTheDocument();
      }
    }
  });

  it('should render units in correct positions', () => {
    const tiles = Array(7).fill(null).map(() => Array(7).fill(null));
    tiles[0][0] = { id: '1', name: 'Unit1', level: 1, rarity: UnitRarity.Common };
    tiles[3][3] = { id: '2', name: 'Unit2', level: 5, rarity: UnitRarity.Rare };

    render(
      <FormationGrid
        tiles={tiles}
        onPlaceUnit={mockOnPlaceUnit}
        onRemoveUnit={mockOnRemoveUnit}
      />
    );

    expect(screen.getByTestId('tile-0-0')).toHaveAttribute('data-unit', 'Unit1');
    expect(screen.getByTestId('tile-3-3')).toHaveAttribute('data-unit', 'Unit2');
  });

  it('should have correct aria-label for grid', () => {
    const emptyTiles = Array(7).fill(null).map(() => Array(7).fill(null));
    
    render(
      <FormationGrid
        tiles={emptyTiles}
        onPlaceUnit={mockOnPlaceUnit}
        onRemoveUnit={mockOnRemoveUnit}
      />
    );

    const grid = screen.getByRole('grid');
    expect(grid).toHaveAttribute('aria-label', 'Formation grid');
  });

  it('should pass correct props to FormationTile', () => {
    const tiles = Array(7).fill(null).map(() => Array(7).fill(null));
    const unit = { id: '1', name: 'TestUnit', level: 3, rarity: UnitRarity.Epic };
    tiles[2][4] = unit;

    render(
      <FormationGrid
        tiles={tiles}
        onPlaceUnit={mockOnPlaceUnit}
        onRemoveUnit={mockOnRemoveUnit}
      />
    );

    const tile = screen.getByTestId('tile-2-4');
    expect(tile).toHaveAttribute('data-unit', 'TestUnit');
  });
});

