import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FormationGrid } from '../../../../../src/components/organisms';
import { UnitRarity } from '../../../../../src/types';

const mockFormationTile = vi.hoisted(() => (props: { row: number; col: number; unit: { name: string; level: number } | null; onPlaceUnit?: (row: number, col: number, unit: { name: string; level: number }) => void; onRemoveUnit?: (row: number, col: number, unit: { name: string; level: number } | null) => void }) => (
    <div
      data-testid={`tile-${props.row}-${props.col}`}
      data-unit={props.unit ? props.unit.name : 'empty'}
      role="gridcell"
      aria-label={`Formation tile row ${props.row + 1} column ${props.col + 1}`}
    >
      {props.unit ? `${props.unit.name} (${props.unit.level})` : 'Empty'}
    </div>
));

vi.mock('../../../../../src/components/molecules', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../../../src/components/molecules')>();
  return {
    ...actual,
    FormationTile: mockFormationTile,
  };
});


describe('FormationGrid', () => {
  const mockOnPlaceUnit = vi.fn();
  const mockOnRemoveUnit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render 7x7 grid of tiles', () => {
    const emptyTiles = Array(7).fill(null).map(() => Array(7).fill(null));
    
    render(
      <DndProvider backend={HTML5Backend}>
        <FormationGrid
          tiles={emptyTiles}
          onPlaceUnit={mockOnPlaceUnit}
          onRemoveUnit={mockOnRemoveUnit}
        />
      </DndProvider>
    );

    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        expect(screen.getByTestId(`tile-${row}-${col}`)).toBeInTheDocument();
      }
    }
  });

  it('should render units in correct positions', () => {
    const tiles = Array(7).fill(null).map(() => Array(7).fill(null));
    tiles[0][0] = { id: '1', name: 'Unit1', level: 1, rarity: UnitRarity.Common, power: 100 };
    tiles[3][3] = { id: '2', name: 'Unit2', level: 5, rarity: UnitRarity.Rare, power: 500 };

    render(
      <DndProvider backend={HTML5Backend}>
        <FormationGrid
          tiles={tiles}
          onPlaceUnit={mockOnPlaceUnit}
          onRemoveUnit={mockOnRemoveUnit}
        />
      </DndProvider>
    );

    expect(screen.getByTestId('tile-0-0')).toHaveAttribute('data-unit', 'Unit1');
    expect(screen.getByTestId('tile-3-3')).toHaveAttribute('data-unit', 'Unit2');
  });

  it('should have correct aria-label for grid', () => {
    const emptyTiles = Array(7).fill(null).map(() => Array(7).fill(null));
    
    render(
      <DndProvider backend={HTML5Backend}>
        <FormationGrid
          tiles={emptyTiles}
          onPlaceUnit={mockOnPlaceUnit}
          onRemoveUnit={mockOnRemoveUnit}
        />
      </DndProvider>
    );

    const grid = screen.getByRole('grid');
    expect(grid).toHaveAttribute('aria-label', 'Formation grid. Drag units here to place them. Double-click to remove.');
  });

  it('should pass correct props to FormationTile', () => {
    const tiles = Array(7).fill(null).map(() => Array(7).fill(null));
    const unit = { id: '1', name: 'TestUnit', level: 3, rarity: UnitRarity.Epic, power: 300 };
    tiles[2][4] = unit;

    render(
      <DndProvider backend={HTML5Backend}>
        <FormationGrid
          tiles={tiles}
          onPlaceUnit={mockOnPlaceUnit}
          onRemoveUnit={mockOnRemoveUnit}
        />
      </DndProvider>
    );

    const tile = screen.getByTestId('tile-2-4');
    expect(tile).toHaveAttribute('data-unit', 'TestUnit');
  });
});
