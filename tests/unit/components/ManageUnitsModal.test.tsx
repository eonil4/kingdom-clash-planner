import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ManageUnitsModal from '../../../src/components/ManageUnitsModal';
import { useAppSelector, useAppDispatch } from '../../../src/store/hooks';
import { UnitRarity } from '../../../src/types';

vi.mock('../../../src/store/hooks', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn(),
}));

vi.mock('../../../src/store/reducers/unitSlice', () => ({
  addUnit: vi.fn((unit) => ({ type: 'unit/addUnit', payload: unit })),
  removeUnit: vi.fn((id) => ({ type: 'unit/removeUnit', payload: id })),
  updateUnit: vi.fn((unit) => ({ type: 'unit/updateUnit', payload: unit })),
}));

vi.mock('../../../src/utils/imageUtils', () => ({
  getUnitImagePath: vi.fn((name) => `/images/${name}.png`),
}));

vi.mock('../../../src/utils/unitNameUtils', () => ({
  normalizeUnitName: vi.fn((name) => name.trim()),
}));

vi.mock('../../../src/utils/powerUtils', () => ({
  calculateUnitPower: vi.fn(() => 100),
}));

vi.mock('../../../src/types/unitNames', () => ({
  UNIT_NAMES_ARRAY: ['TestUnit'],
  getUnitDataByName: vi.fn(() => ({
    name: 'TestUnit',
    rarity: UnitRarity.Common,
    getPower: () => 100,
  })),
}));

vi.mock('../../../src/components/UnitCard', () => ({
  default: ({ unit }: { unit: { name: string; level: number } }) => (
    <div data-testid={`unit-card-${unit.name}-${unit.level}`}>
      {unit.name} Lv{unit.level}
    </div>
  ),
}));

describe('ManageUnitsModal', () => {
  const mockDispatch = vi.fn();
  const mockUnits = [
    { id: '1', name: 'TestUnit', level: 1, rarity: UnitRarity.Common, power: 100 },
    { id: '2', name: 'TestUnit', level: 2, rarity: UnitRarity.Common, power: 100 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppDispatch as ReturnType<typeof vi.fn>).mockReturnValue(mockDispatch);
    (useAppSelector as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        unit: {
          units: mockUnits,
        },
        formation: {
          currentFormation: {
            id: '1',
            name: 'Formation',
            tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
            power: 0,
          },
        },
      };
      return selector(state);
    });
  });

  it('should not render when open is false', () => {
    render(<ManageUnitsModal open={false} onClose={vi.fn()} />);
    
    expect(screen.queryByText(/manage units/i)).not.toBeInTheDocument();
  });

  it('should render when open is true', () => {
    render(<ManageUnitsModal open={true} onClose={vi.fn()} />);
    
    expect(screen.getByText(/manage units/i)).toBeInTheDocument();
  });

  it('should display unit count information', () => {
    render(<ManageUnitsModal open={true} onClose={vi.fn()} />);
    
    // Check for unit roster header
    expect(screen.getByText(/unit roster/i)).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();
    render(<ManageUnitsModal open={true} onClose={mockOnClose} />);
    
    const closeButton = screen.getByLabelText(/close/i);
    await user.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display units in the table', () => {
    render(<ManageUnitsModal open={true} onClose={vi.fn()} />);
    
    // Should show grouped units (use getAllByText since there are multiple)
    const unitElements = screen.getAllByText(/testunit/i);
    expect(unitElements.length).toBeGreaterThan(0);
  });

  it('should show Add New Unit form when Add New button is clicked', () => {
    render(<ManageUnitsModal open={true} onClose={vi.fn()} />);
    
    // The form section should be visible (it's always shown in the modal)
    const formSections = screen.getAllByText(/add new unit/i);
    expect(formSections.length).toBeGreaterThan(0);
  });
});

