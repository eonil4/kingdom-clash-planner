import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FormationTile } from '../../../../../src/components/molecules';
import { UnitRarity } from '../../../../../src/types';

interface DropItem {
  unit: { id: string; name: string; level: number; rarity: string };
  isInFormation?: boolean;
  sourceRow?: number;
  sourceCol?: number;
}

interface UseDropConfig {
  drop?: (item: DropItem) => void;
  accept: string;
  collect?: (monitor: unknown) => { isOver: boolean };
}

let capturedDropHandler: ((item: DropItem) => void) | undefined;

let capturedCollectFn: ((monitor: { isOver: () => boolean }) => { isOver: boolean }) | undefined;

const mockUseDropFn = vi.fn((config: UseDropConfig) => {
  if (config && typeof config === 'object' && config.drop) {
    capturedDropHandler = config.drop as (item: DropItem) => void;
  }
  if (config && typeof config === 'object' && config.collect) {
    capturedCollectFn = config.collect as typeof capturedCollectFn;
  }
  const mockDropRef = vi.fn();
  return [
    { isOver: false },
    mockDropRef,
  ];
});

vi.mock('react-dnd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-dnd')>();
  return {
    ...actual,
    useDrop: (config: UseDropConfig) => {
      return mockUseDropFn(config);
    },
  };
});

const mockUnitCard = vi.hoisted(() => ({ unit, onDoubleClick }: { unit: { name: string; level: number }; onDoubleClick?: () => void }) => (
  <div data-testid="unit-card" onDoubleClick={onDoubleClick}>
    {unit.name} - Level {unit.level}
  </div>
));

vi.mock('../../../../../src/components/molecules/UnitCard', () => ({
  UnitCard: mockUnitCard,
  default: mockUnitCard,
}));

const renderWithDndProvider = (component: React.ReactElement) => {
  return render(
    <DndProvider backend={HTML5Backend}>
      {component}
    </DndProvider>
  );
};

describe('FormationTile', () => {
  const mockUnit = {
    id: '1',
    name: 'TestUnit',
    level: 5,
    rarity: UnitRarity.Rare,
    power: 100,
  };

  const mockOnPlaceUnit = vi.fn();
  const mockOnRemoveUnit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    capturedDropHandler = undefined;
    capturedCollectFn = undefined;
    mockUseDropFn.mockImplementation((config: UseDropConfig) => {
      if (config && typeof config === 'object' && config.drop) {
        capturedDropHandler = config.drop as (item: DropItem) => void;
      }
      if (config && typeof config === 'object' && config.collect) {
        capturedCollectFn = config.collect as typeof capturedCollectFn;
      }
      return [
        { isOver: false },
        vi.fn(),
      ];
    });
  });

  it('should render empty tile when unit is null', () => {
    renderWithDndProvider(
      <FormationTile
        row={0}
        col={0}
        unit={null}
        onPlaceUnit={mockOnPlaceUnit}
        onRemoveUnit={mockOnRemoveUnit}
      />
    );

    const tile = screen.getByRole('gridcell');
    expect(tile).toBeInTheDocument();
    expect(tile).toHaveAttribute('aria-label', 'Empty tile at row 1 column 1');
  });

  it('should render UnitCard when unit exists', () => {
    renderWithDndProvider(
      <FormationTile
        row={1}
        col={2}
        unit={mockUnit}
        onPlaceUnit={mockOnPlaceUnit}
        onRemoveUnit={mockOnRemoveUnit}
      />
    );

    const unitCard = screen.getByTestId('unit-card');
    expect(unitCard).toBeInTheDocument();
  });

  it('should call onRemoveUnit when unit is double-clicked', async () => {
    const user = userEvent.setup();
    renderWithDndProvider(
      <FormationTile
        row={2}
        col={3}
        unit={mockUnit}
        onPlaceUnit={mockOnPlaceUnit}
        onRemoveUnit={mockOnRemoveUnit}
      />
    );

    const unitCard = screen.getByTestId('unit-card');
    await user.dblClick(unitCard);

    expect(mockOnRemoveUnit).toHaveBeenCalledWith(2, 3, mockUnit);
  });

  it('should not call onRemoveUnit when double-clicking empty tile', async () => {
    const user = userEvent.setup();
    renderWithDndProvider(
      <FormationTile
        row={0}
        col={0}
        unit={null}
        onPlaceUnit={mockOnPlaceUnit}
        onRemoveUnit={mockOnRemoveUnit}
      />
    );

    const tile = screen.getByRole('gridcell');
    await user.dblClick(tile);

    expect(mockOnRemoveUnit).not.toHaveBeenCalled();
  });

  it('should have correct aria-label for different positions', () => {
    const { rerender } = renderWithDndProvider(
      <FormationTile
        row={0}
        col={0}
        unit={null}
        onPlaceUnit={mockOnPlaceUnit}
        onRemoveUnit={mockOnRemoveUnit}
      />
    );

    expect(screen.getByRole('gridcell')).toHaveAttribute('aria-label', 'Empty tile at row 1 column 1');

    rerender(
      <DndProvider backend={HTML5Backend}>
        <FormationTile
          row={6}
          col={6}
          unit={null}
          onPlaceUnit={mockOnPlaceUnit}
          onRemoveUnit={mockOnRemoveUnit}
        />
      </DndProvider>
    );

    expect(screen.getByRole('gridcell')).toHaveAttribute('aria-label', 'Empty tile at row 7 column 7');
  });

  it('should apply isOver styling when dragging over', () => {
    mockUseDropFn.mockReturnValueOnce([
      { isOver: true },
      vi.fn(),
    ]);

    const { container } = renderWithDndProvider(
      <FormationTile
        row={0}
        col={0}
        unit={null}
        onPlaceUnit={mockOnPlaceUnit}
        onRemoveUnit={mockOnRemoveUnit}
      />
    );

    const tile = container.querySelector('.bg-blue-500\\/40, .bg-blue-500');
    expect(tile || container.querySelector('[class*="bg-blue-500"]')).toBeTruthy();
  });

  it('should handle drop from another tile - remove from old position and place in new', async () => {
    renderWithDndProvider(
      <FormationTile
        row={1}
        col={1}
        unit={null}
        onPlaceUnit={mockOnPlaceUnit}
        onRemoveUnit={mockOnRemoveUnit}
      />
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    const droppedUnit = { id: '2', name: 'DroppedUnit', level: 3, rarity: UnitRarity.Epic, power: 150 };
    if (capturedDropHandler) {
      act(() => {
        capturedDropHandler({
          unit: droppedUnit,
          isInFormation: true,
          sourceRow: 0,
          sourceCol: 0,
        });
      });
    }

    expect(mockOnRemoveUnit).toHaveBeenCalledWith(0, 0, expect.objectContaining({ id: '2', name: 'DroppedUnit' }));
    expect(mockOnPlaceUnit).toHaveBeenCalledWith(1, 1, expect.objectContaining({ id: '2', name: 'DroppedUnit' }));
  });

  it('should handle drop when tile already has a unit - overwrite', async () => {
    renderWithDndProvider(
      <FormationTile
        row={2}
        col={2}
        unit={mockUnit}
        onPlaceUnit={mockOnPlaceUnit}
        onRemoveUnit={mockOnRemoveUnit}
      />
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    const droppedUnit = { id: '2', name: 'DroppedUnit', level: 3, rarity: UnitRarity.Epic, power: 150 };
    if (capturedDropHandler) {
      act(() => {
        capturedDropHandler({
          unit: droppedUnit,
          isInFormation: true,
          sourceRow: 0,
          sourceCol: 0,
        });
      });
    }

    expect(mockOnRemoveUnit).toHaveBeenCalledWith(0, 0, expect.objectContaining({ id: '2', name: 'DroppedUnit' }));
    expect(mockOnRemoveUnit).toHaveBeenCalledWith(2, 2, mockUnit);
    expect(mockOnPlaceUnit).toHaveBeenCalledWith(2, 2, expect.objectContaining({ id: '2', name: 'DroppedUnit' }));
  });

  it('should not place unit if dropping on same tile', () => {
    renderWithDndProvider(
      <FormationTile
        row={2}
        col={2}
        unit={mockUnit}
        onPlaceUnit={mockOnPlaceUnit}
        onRemoveUnit={mockOnRemoveUnit}
      />
    );

    if (capturedDropHandler) {
      act(() => {
        capturedDropHandler({
          unit: mockUnit,
          isInFormation: true,
          sourceRow: 2,
          sourceCol: 2,
        });
      });
    }

    expect(mockOnRemoveUnit).not.toHaveBeenCalled();
    expect(mockOnPlaceUnit).not.toHaveBeenCalled();
  });

  it('should handle drop from roster (not in formation)', async () => {
    renderWithDndProvider(
      <FormationTile
        row={0}
        col={0}
        unit={null}
        onPlaceUnit={mockOnPlaceUnit}
        onRemoveUnit={mockOnRemoveUnit}
      />
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    const droppedUnit = { id: '2', name: 'DroppedUnit', level: 3, rarity: UnitRarity.Epic, power: 150 };
    if (capturedDropHandler) {
      act(() => {
        capturedDropHandler({
          unit: droppedUnit,
          isInFormation: false,
        });
      });
    }

    expect(mockOnRemoveUnit).not.toHaveBeenCalled();
    expect(mockOnPlaceUnit).toHaveBeenCalledWith(0, 0, expect.objectContaining({ id: '2', name: 'DroppedUnit' }));
  });

  it('should swap units when both are in formation', async () => {
    const mockOnSwapUnits = vi.fn();
    const targetUnit = { id: '2', name: 'TargetUnit', level: 3, rarity: UnitRarity.Epic, power: 150 };
    
    renderWithDndProvider(
      <FormationTile
        row={1}
        col={1}
        unit={targetUnit}
        onPlaceUnit={mockOnPlaceUnit}
        onRemoveUnit={mockOnRemoveUnit}
        onSwapUnits={mockOnSwapUnits}
      />
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    const sourceUnit = { id: '3', name: 'SourceUnit', level: 7, rarity: UnitRarity.Legendary, power: 300 };
    if (capturedDropHandler) {
      act(() => {
        capturedDropHandler({
          unit: sourceUnit,
          isInFormation: true,
          sourceRow: 0,
          sourceCol: 0,
        });
      });
    }

    expect(mockOnSwapUnits).toHaveBeenCalledWith(0, 0, 1, 1, expect.objectContaining({ id: '3', name: 'SourceUnit' }), targetUnit);
    expect(mockOnRemoveUnit).not.toHaveBeenCalled();
    expect(mockOnPlaceUnit).not.toHaveBeenCalled();
  });

  it('should not swap if onSwapUnits is not provided', async () => {
    const targetUnit = { id: '2', name: 'TargetUnit', level: 3, rarity: UnitRarity.Epic, power: 150 };
    
    renderWithDndProvider(
      <FormationTile
        row={1}
        col={1}
        unit={targetUnit}
        onPlaceUnit={mockOnPlaceUnit}
        onRemoveUnit={mockOnRemoveUnit}
      />
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    const sourceUnit = { id: '3', name: 'SourceUnit', level: 7, rarity: UnitRarity.Legendary, power: 300 };
    if (capturedDropHandler) {
      act(() => {
        capturedDropHandler({
          unit: sourceUnit,
          isInFormation: true,
          sourceRow: 0,
          sourceCol: 0,
        });
      });
    }

    expect(mockOnRemoveUnit).toHaveBeenCalledWith(0, 0, expect.objectContaining({ id: '3', name: 'SourceUnit' }));
    expect(mockOnRemoveUnit).toHaveBeenCalledWith(1, 1, targetUnit);
    expect(mockOnPlaceUnit).toHaveBeenCalledWith(1, 1, expect.objectContaining({ id: '3', name: 'SourceUnit' }));
  });

  it('should call collect function with monitor', () => {
    renderWithDndProvider(
      <FormationTile
        row={0}
        col={0}
        unit={null}
        onPlaceUnit={mockOnPlaceUnit}
        onRemoveUnit={mockOnRemoveUnit}
      />
    );

    expect(capturedCollectFn).toBeDefined();
    if (capturedCollectFn) {
      const result = capturedCollectFn({ isOver: () => true });
      expect(result).toEqual({ isOver: true });

      const resultFalse = capturedCollectFn({ isOver: () => false });
      expect(resultFalse).toEqual({ isOver: false });
    }
  });
});
