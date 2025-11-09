import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormationTile from '../../../src/components/FormationTile';
import { UnitRarity } from '../../../src/types';

const mockUseDrop = vi.fn(() => [
  { isOver: false },
  vi.fn(),
]);

vi.mock('react-dnd', () => ({
  useDrop: () => mockUseDrop(),
  useDrag: vi.fn(() => [
    { isDragging: false },
    vi.fn(),
  ]),
}));

vi.mock('../../../src/components/UnitCard', () => ({
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
  };

  const mockOnPlaceUnit = vi.fn();
  const mockOnRemoveUnit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
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

    expect(mockOnRemoveUnit).toHaveBeenCalledWith(2, 3);
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
});

