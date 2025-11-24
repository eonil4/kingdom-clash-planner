import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormationTile from '../../../../src/components/formation/FormationTile';
import { UnitRarity } from '../../../../src/types';

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
const mockUseDrop = vi.fn((config: UseDropConfig) => {
  if (config && typeof config === 'object' && config.drop) {
    capturedDropHandler = config.drop;
  }
  return [
    { isOver: false },
    vi.fn(),
  ];
});

vi.mock('react-dnd', () => ({
  useDrop: (config: UseDropConfig) => mockUseDrop(config),
  useDrag: vi.fn(() => [
    { isDragging: false },
    vi.fn(),
  ]),
}));

vi.mock('../../../../src/components/unit/UnitCard', () => ({
  default: vi.fn(({ unit, onDoubleClick }) => (
    <div data-testid="unit-card" onDoubleClick={onDoubleClick}>
      {unit.name} - Level {unit.level}
    </div>
  )),
}));

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
  });

  it('should render empty tile when unit is null', () => {
    render(
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
    expect(tile).toHaveAttribute('aria-label', 'Formation tile row 1 column 1');
  });

  it('should render UnitCard when unit exists', () => {
    render(
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
    render(
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

  it('should have correct aria-label for different positions', () => {
    const { rerender } = render(
      <FormationTile
        row={0}
        col={0}
        unit={null}
        onPlaceUnit={mockOnPlaceUnit}
        onRemoveUnit={mockOnRemoveUnit}
      />
    );

    expect(screen.getByRole('gridcell')).toHaveAttribute('aria-label', 'Formation tile row 1 column 1');

    rerender(
      <FormationTile
        row={6}
        col={6}
        unit={null}
        onPlaceUnit={mockOnPlaceUnit}
        onRemoveUnit={mockOnRemoveUnit}
      />
    );

    expect(screen.getByRole('gridcell')).toHaveAttribute('aria-label', 'Formation tile row 7 column 7');
  });

  it('should apply isOver styling when dragging over', () => {
    mockUseDrop.mockReturnValueOnce([
      { isOver: true },
      vi.fn(),
    ]);

    const { container } = render(
      <FormationTile
        row={0}
        col={0}
        unit={null}
        onPlaceUnit={mockOnPlaceUnit}
        onRemoveUnit={mockOnRemoveUnit}
      />
    );

    const tile = container.querySelector('.bg-blue-500');
    expect(tile).toBeInTheDocument();
  });

  it('should handle drop from another tile - remove from old position and place in new', () => {
    render(
      <FormationTile
        row={1}
        col={1}
        unit={null}
        onPlaceUnit={mockOnPlaceUnit}
        onRemoveUnit={mockOnRemoveUnit}
      />
    );

    const droppedUnit = { id: '2', name: 'DroppedUnit', level: 3, rarity: UnitRarity.Epic, power: 150 };
    if (capturedDropHandler) {
      capturedDropHandler({
        unit: droppedUnit,
        isInFormation: true,
        sourceRow: 0,
        sourceCol: 0,
      });
    }

    expect(mockOnRemoveUnit).toHaveBeenCalledWith(0, 0, droppedUnit);
    expect(mockOnPlaceUnit).toHaveBeenCalledWith(1, 1, droppedUnit);
  });

  it('should handle drop when tile already has a unit - overwrite', () => {
    render(
      <FormationTile
        row={2}
        col={2}
        unit={mockUnit}
        onPlaceUnit={mockOnPlaceUnit}
        onRemoveUnit={mockOnRemoveUnit}
      />
    );

    const droppedUnit = { id: '2', name: 'DroppedUnit', level: 3, rarity: UnitRarity.Epic, power: 150 };
    if (capturedDropHandler) {
      capturedDropHandler({
        unit: droppedUnit,
        isInFormation: true,
        sourceRow: 0,
        sourceCol: 0,
      });
    }

    // Should remove unit from source position
    expect(mockOnRemoveUnit).toHaveBeenCalledWith(0, 0, droppedUnit);
    // Should remove existing unit from target position
    expect(mockOnRemoveUnit).toHaveBeenCalledWith(2, 2, mockUnit);
    expect(mockOnPlaceUnit).toHaveBeenCalledWith(2, 2, droppedUnit);
  });

  it('should not place unit if dropping on same tile', () => {
    render(
      <FormationTile
        row={2}
        col={2}
        unit={mockUnit}
        onPlaceUnit={mockOnPlaceUnit}
        onRemoveUnit={mockOnRemoveUnit}
      />
    );

    if (capturedDropHandler) {
      capturedDropHandler({
        unit: mockUnit,
        isInFormation: true,
        sourceRow: 2,
        sourceCol: 2,
      });
    }

    expect(mockOnRemoveUnit).not.toHaveBeenCalled();
    expect(mockOnPlaceUnit).not.toHaveBeenCalled();
  });

  it('should handle drop from roster (not in formation)', () => {
    render(
      <FormationTile
        row={0}
        col={0}
        unit={null}
        onPlaceUnit={mockOnPlaceUnit}
        onRemoveUnit={mockOnRemoveUnit}
      />
    );

    const droppedUnit = { id: '2', name: 'DroppedUnit', level: 3, rarity: UnitRarity.Epic, power: 150 };
    if (capturedDropHandler) {
      capturedDropHandler({
        unit: droppedUnit,
        isInFormation: false,
      });
    }

    expect(mockOnRemoveUnit).not.toHaveBeenCalled();
    expect(mockOnPlaceUnit).toHaveBeenCalledWith(0, 0, droppedUnit);
  });
});

