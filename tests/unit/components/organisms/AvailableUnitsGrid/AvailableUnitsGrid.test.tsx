import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AvailableUnitsGrid } from '../../../../../src/components/organisms';
import { UnitRarity } from '../../../../../src/types';
import type { Unit } from '../../../../../src/types';

vi.mock('../../../../../src/components/molecules', () => ({
  UnitCard: ({ unit, onDoubleClick }: { unit: { id: string; name: string; level: number }; onDoubleClick?: () => void }) => (
    <div
      data-testid={`unit-card-${unit.id}`}
      onDoubleClick={onDoubleClick}
      role="listitem"
    >
      {unit.name} Lv{unit.level}
    </div>
  ),
}));

describe('AvailableUnitsGrid', () => {
  const mockUnits: Unit[] = [
    { id: '1', name: 'Archers', level: 5, rarity: UnitRarity.Common, power: 1600 },
    { id: '2', name: 'Paladin', level: 10, rarity: UnitRarity.Epic, power: 53760 },
    { id: '3', name: 'Infantry', level: 3, rarity: UnitRarity.Rare, power: 480 },
  ];

  const mockOnUnitDoubleClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with list role', () => {
    render(<AvailableUnitsGrid units={mockUnits} onUnitDoubleClick={mockOnUnitDoubleClick} />);

    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('should have correct aria-label', () => {
    render(<AvailableUnitsGrid units={mockUnits} onUnitDoubleClick={mockOnUnitDoubleClick} />);

    expect(screen.getByLabelText('Available units')).toBeInTheDocument();
  });

  it('should render all unit cards', () => {
    render(<AvailableUnitsGrid units={mockUnits} onUnitDoubleClick={mockOnUnitDoubleClick} />);

    expect(screen.getByTestId('unit-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('unit-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('unit-card-3')).toBeInTheDocument();
  });

  it('should display unit names and levels', () => {
    render(<AvailableUnitsGrid units={mockUnits} onUnitDoubleClick={mockOnUnitDoubleClick} />);

    expect(screen.getByText('Archers Lv5')).toBeInTheDocument();
    expect(screen.getByText('Paladin Lv10')).toBeInTheDocument();
    expect(screen.getByText('Infantry Lv3')).toBeInTheDocument();
  });

  it('should call onUnitDoubleClick when unit card is double-clicked', async () => {
    const user = userEvent.setup();
    render(<AvailableUnitsGrid units={mockUnits} onUnitDoubleClick={mockOnUnitDoubleClick} />);

    await user.dblClick(screen.getByTestId('unit-card-1'));

    expect(mockOnUnitDoubleClick).toHaveBeenCalledTimes(1);
    expect(mockOnUnitDoubleClick).toHaveBeenCalledWith(mockUnits[0]);
  });

  it('should call onUnitDoubleClick with correct unit for each card', async () => {
    const user = userEvent.setup();
    render(<AvailableUnitsGrid units={mockUnits} onUnitDoubleClick={mockOnUnitDoubleClick} />);

    await user.dblClick(screen.getByTestId('unit-card-2'));

    expect(mockOnUnitDoubleClick).toHaveBeenCalledWith(mockUnits[1]);
  });

  it('should render empty grid when no units provided', () => {
    render(<AvailableUnitsGrid units={[]} onUnitDoubleClick={mockOnUnitDoubleClick} />);

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.queryByTestId('unit-card-1')).not.toBeInTheDocument();
  });

  it('should render with flex wrap layout', () => {
    const { container } = render(<AvailableUnitsGrid units={mockUnits} onUnitDoubleClick={mockOnUnitDoubleClick} />);

    const grid = container.querySelector('.flex.flex-wrap.gap-2');
    expect(grid).toBeInTheDocument();
  });

  it('should handle single unit', () => {
    const singleUnit = [mockUnits[0]];
    render(<AvailableUnitsGrid units={singleUnit} onUnitDoubleClick={mockOnUnitDoubleClick} />);

    expect(screen.getByTestId('unit-card-1')).toBeInTheDocument();
    expect(screen.queryByTestId('unit-card-2')).not.toBeInTheDocument();
  });

  it('should handle many units', () => {
    const manyUnits: Unit[] = Array(50).fill(null).map((_, i) => ({
      id: String(i + 1),
      name: `Unit${i + 1}`,
      level: (i % 10) + 1,
      rarity: UnitRarity.Common,
      power: 100 * (i + 1),
    }));

    render(<AvailableUnitsGrid units={manyUnits} onUnitDoubleClick={mockOnUnitDoubleClick} />);

    expect(screen.getByTestId('unit-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('unit-card-50')).toBeInTheDocument();
  });
});

